const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const router = express.Router();

const { pool } = require('../dbConnection');
const auth = require('../middleware/auth');
const { sendNotification } = require('../services/notificationService');
const {
    optimizeFamilyTreeImage,
    putImage,
    deleteImage,
    copyImage,
    imageExists,
    getSignedImageUrl
} = require('../r2Storage');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
        cb(ok ? null : new Error('Only JPG, PNG, and WEBP images are allowed.'), ok);
    }
});

async function withTx(work) {
    const c = await pool.getConnection();
    try {
        await c.beginTransaction();
        const result = await work(c);
        await c.commit();
        return result;
    } catch (e) {
        try { await c.rollback(); } catch (_) {}
        throw e;
    } finally {
        c.release();
    }
}

async function getTreeByCode(c, code) {
    const [rows] = await c.query(
        `SELECT
            FamilyTreeID,
            FamilyTreeCode,
            CreatedByUserID,
            CreatedAt,
            Status,
            MergedIntoFamilyTreeID,
            MergedAt,
            MergedByUserID
         FROM FamilyTreeT
         WHERE FamilyTreeCode=?
         LIMIT 1`,
        [code]
    );

    return rows[0] || null;
}

async function getTreeByID(c, treeID) {
    const [rows] = await c.query(
        `SELECT
            FamilyTreeID,
            FamilyTreeCode,
            CreatedByUserID,
            CreatedAt,
            Status,
            MergedIntoFamilyTreeID,
            MergedAt,
            MergedByUserID
         FROM FamilyTreeT
         WHERE FamilyTreeID=?
         LIMIT 1`,
        [treeID]
    );

    return rows[0] || null;
}

async function resolveTreeAlias(c, treeOrCode) {
    let requestedTree =
        typeof treeOrCode === 'string'
            ? await getTreeByCode(c, treeOrCode)
            : treeOrCode;

    if (!requestedTree) {
        return null;
    }

    let current = requestedTree;
    const visited = new Set();

    for (let i = 0; i < 25; i++) {
        if (!current.MergedIntoFamilyTreeID) {
            return {
                requestedTree,
                activeTree: current,
                redirected:
                    requestedTree.FamilyTreeID !== current.FamilyTreeID
            };
        }

        if (visited.has(current.FamilyTreeID)) {
            const err = new Error(
                'Family Tree merge history contains a loop.'
            );
            err.status = 500;
            throw err;
        }

        visited.add(current.FamilyTreeID);

        const next = await getTreeByID(
            c,
            current.MergedIntoFamilyTreeID
        );

        if (!next) {
            const err = new Error(
                'The current Family Tree for this historical code was not found.'
            );
            err.status = 500;
            throw err;
        }

        current = next;
    }

    const err = new Error(
        'Family Tree merge history is too deep.'
    );
    err.status = 500;
    throw err;
}

async function userHasTree(c, treeID, userID) {
    /*
     * IsActive identifies the user's CURRENT/default Tree. It is not an
     * authorization flag. A user may retain access to another separated Tree
     * while the original Tree remains current.
     */
    const [rows] = await c.query(
        `SELECT FamilyTreeUserID
           FROM FTFamilyTreeUserT
          WHERE FamilyTreeID=?
            AND UserID=?
          LIMIT 1`,
        [treeID, userID]
    );
    return !!rows.length;
}

async function requireTree(c, code, userID) {
    if (!code) {
        const err = new Error('FamilyTreeCode is required.');
        err.status = 400;
        throw err;
    }

    const resolved = await resolveTreeAlias(
        c,
        String(code).trim().toUpperCase()
    );

    if (!resolved) {
        const err = new Error('FamilyTreeCode was not found.');
        err.status = 404;
        throw err;
    }

    const tree = resolved.activeTree;

    if (!(await userHasTree(c, tree.FamilyTreeID, userID))) {
        const err = new Error('You are not authorized for this Family Tree.');
        err.status = 403;
        throw err;
    }

    return tree;
}

async function createCode(c) {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    for (let attempt = 0; attempt < 20; attempt++) {
        let s = 'FT-';
        const bytes = crypto.randomBytes(8);

        for (let i = 0; i < 8; i++) {
            s += alphabet[bytes[i] % alphabet.length];
        }

        const [rows] = await c.query(
            'SELECT FamilyTreeID FROM FamilyTreeT WHERE FamilyTreeCode=? LIMIT 1',
            [s]
        );

        if (!rows.length) return s;
    }

    throw new Error('Unable to generate a unique FamilyTreeCode.');
}

async function logActivity(
    c,
    treeID,
    userID,
    type,
    entityType,
    entityID,
    personID,
    description,
    targetCreatedByUserID = userID
) {
    const [activity] = await c.query(
        `INSERT INTO FTFamilyTreeActivityT
         (
            FamilyTreeID,
            UserID,
            ActivityType,
            EntityType,
            EntityID,
            AffectedPersonID,
            TargetCreatedByUserID,
            ActivityAt,
            ActivityDescription
         )
         VALUES (?,?,?,?,?,?,?,NOW(),?)`,
        [
            treeID,
            userID,
            type,
            entityType,
            entityID,
            personID,
            targetCreatedByUserID || null,
            description || null
        ]
    );

    await c.query(
        `UPDATE FamilyTreeT
         SET LastActivityAt=NOW(),
             LastActivityByUserID=?,
             Status=?
         WHERE FamilyTreeID=?`,
        [userID, 'Active', treeID]
    );

    await c.query(
        `UPDATE FTFamilyTreeUserT
         SET LastActivityAt=NOW()
         WHERE FamilyTreeID=? AND UserID=?`,
        [treeID, userID]
    );

    return activity.insertId;
}

function familyTreePersonName(person) {
    if (!person) return 'Unknown person';

    return [
        person.FirstName,
        person.MiddleName,
        person.LastName,
        person.SuffixName
    ].filter(Boolean).join(' ').trim() ||
        `PersonID ${person.PersonID}`;
}


const PERSON_EDIT_FIELDS = [
    ['FirstName', 'First Name'],
    ['MiddleName', 'Middle Name'],
    ['LastName', 'Last Name'],
    ['SuffixName', 'Suffix'],
    ['NickName', 'Nickname'],
    ['MaidenName', 'Maiden Name'],
    ['Gender', 'Gender'],
    ['BirthDate', 'Birth Date'],
    ['BirthPlace', 'Birth Place'],
    ['CurrentCity', 'Current City'],
    ['CurrentState', 'Current State'],
    ['Died', 'Died'],
    ['DeathDate', 'Death Date']
];

function normalizedPersonValue(field, value) {
    if (field === 'Died') return value ? 1 : 0;
    if (value === undefined || value === null || value === '') return null;
    if (field === 'BirthDate' || field === 'DeathDate') {
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return value.toISOString().slice(0, 10);
        }
        const text = String(value);
        return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : text;
    }
    return String(value).trim();
}

function incomingPersonValue(field, body) {
    if (field === 'Died') return body.Died ? 1 : 0;
    if (field === 'DeathDate') return body.Died ? (body.DeathDate || null) : null;
    return body[field] || null;
}

function displayPersonValue(field, value) {
    const normalized = normalizedPersonValue(field, value);
    if (field === 'Died') return normalized ? 'Yes' : 'No';
    return normalized === null ? '(blank)' : String(normalized);
}

function describePersonChanges(before, body) {
    const changes = [];
    for (const [field, label] of PERSON_EDIT_FIELDS) {
        const oldValue = normalizedPersonValue(field, before[field]);
        const newValue = normalizedPersonValue(field, incomingPersonValue(field, body));
        if (String(oldValue) !== String(newValue)) {
            changes.push(`${label}: ${displayPersonValue(field, oldValue)} -> ${displayPersonValue(field, newValue)}`);
        }
    }
    return changes;
}

async function getNotificationUser(c, userID) {
    if (!userID) return null;

    const [rows] = await c.query(
        `SELECT UserID, UserName, Email
         FROM UsersT
         WHERE UserID=?
         LIMIT 1`,
        [userID]
    );

    return rows[0] || null;
}

async function getPersonEmail(c, personID) {
    const [rows] = await c.query(
        `SELECT ContactID, ContactValue
         FROM FTContactT
         WHERE PersonID=?
           AND LOWER(TRIM(ContactType))='email'
           AND TRIM(ContactValue)<>''
         ORDER BY IsPrimary DESC, ContactID ASC
         LIMIT 1`,
        [personID]
    );

    return rows[0] || null;
}

function addNotificationRecipient(map, recipient) {
    const email = String(recipient.email || '').trim();
    const key = email
        ? `email:${email.toLowerCase()}`
        : recipient.recipientUserID
            ? `user:${recipient.recipientUserID}`
            : `person:${recipient.recipientPersonID}`;

    if (!map.has(key)) {
        map.set(key, {
            ...recipient,
            email: email || null
        });
    }
}

async function getEditNotificationRecipients(
    c,
    personID,
    originalCreatorUserID,
    actingUserID
) {
    const recipients = new Map();

    const personEmail = await getPersonEmail(c, personID);
    addNotificationRecipient(recipients, {
        recipientPersonID: personID,
        recipientUserID: null,
        contactID: personEmail ? personEmail.ContactID : null,
        email: personEmail ? personEmail.ContactValue : null
    });

    if (
        originalCreatorUserID &&
        Number(originalCreatorUserID) !== Number(actingUserID)
    ) {
        const creator = await getNotificationUser(c, originalCreatorUserID);
        addNotificationRecipient(recipients, {
            recipientPersonID: null,
            recipientUserID: originalCreatorUserID,
            contactID: null,
            email: creator ? creator.Email : null
        });
    }

    return Array.from(recipients.values());
}

async function getDeleteNotificationRecipients(
    c,
    treeID,
    personID,
    originalCreatorUserID,
    actingUserID
) {
    const recipients = new Map();

    const deletedPersonEmail = await getPersonEmail(c, personID);
    addNotificationRecipient(recipients, {
        recipientPersonID: personID,
        recipientUserID: null,
        contactID: deletedPersonEmail ? deletedPersonEmail.ContactID : null,
        email: deletedPersonEmail ? deletedPersonEmail.ContactValue : null
    });

    if (
        originalCreatorUserID &&
        Number(originalCreatorUserID) !== Number(actingUserID)
    ) {
        const creator = await getNotificationUser(
            c,
            originalCreatorUserID
        );

        addNotificationRecipient(recipients, {
            recipientPersonID: null,
            recipientUserID: originalCreatorUserID,
            contactID: null,
            email: creator ? creator.Email : null
        });
    }

    const [partners] = await c.query(
        `SELECT DISTINCT
            CASE
                WHEN PersonID=? THEN PartnerPersonID
                ELSE PersonID
            END AS RecipientPersonID
         FROM FTPartnerT
         WHERE FamilyTreeID=?
           AND (PersonID=? OR PartnerPersonID=?)`,
        [personID, treeID, personID, personID]
    );

    for (const partner of partners) {
        const email = await getPersonEmail(
            c,
            partner.RecipientPersonID
        );

        addNotificationRecipient(recipients, {
            recipientPersonID: partner.RecipientPersonID,
            recipientUserID: null,
            contactID: email ? email.ContactID : null,
            email: email ? email.ContactValue : null
        });
    }

    const [children] = await c.query(
        `SELECT DISTINCT PersonID AS RecipientPersonID
         FROM FTParentT
         WHERE FamilyTreeID=?
           AND ParentPersonID=?`,
        [treeID, personID]
    );

    for (const child of children) {
        const email = await getPersonEmail(
            c,
            child.RecipientPersonID
        );

        addNotificationRecipient(recipients, {
            recipientPersonID: child.RecipientPersonID,
            recipientUserID: null,
            contactID: email ? email.ContactID : null,
            email: email ? email.ContactValue : null
        });
    }

    return Array.from(recipients.values());
}

async function createNotificationRecords(
    c,
    {
        treeID,
        activityID,
        notificationType,
        subject,
        message,
        recipients,
        relatedRecordID = null
    }
) {
    const pendingEmails = [];

    for (const recipient of recipients) {
        const email = String(recipient.email || '').trim();
        const hasEmail = !!email;

        const [notification] = await c.query(
            `INSERT INTO FTNotificationT
             (
                FamilyTreeID,
                ActivityID,
                RecipientPersonID,
                RecipientUserID,
                ContactID,
                NotificationType,
                DeliveryMethod,
                NotificationText,
                Status,
                CreatedAt,
                SentAt,
                FailureReason
             )
             VALUES (?,?,?,?,?,?,?,?,?,NOW(),NULL,?)`,
            [
                treeID,
                activityID || null,
                recipient.recipientPersonID || null,
                recipient.recipientUserID || null,
                recipient.contactID || null,
                notificationType,
                'Email',
                message,
                hasEmail ? 'Pending' : 'NoEmail',
                hasEmail
                    ? null
                    : 'No usable email address was available.'
            ]
        );

        if (hasEmail) {
            pendingEmails.push({
                NotificationID: notification.insertId,
                recipientUserID: recipient.recipientUserID || null,
                recipientPersonID: recipient.recipientPersonID || null,
                email,
                subject,
                message,
                treeID,
                activityID: activityID || null,
                notificationType,
                relatedRecordID
            });
        }
    }

    return pendingEmails;
}

async function sendPendingFamilyTreeNotifications(pendingEmails) {
    for (const pending of pendingEmails || []) {
        try {
            const delivery = await sendNotification({
                userID: pending.recipientUserID,
                recipientEmail: pending.email,
                category: 'FAMILY_TREE',
                channel: 'EMAIL',
                subject: pending.subject,
                message: pending.message,
                templateName: pending.notificationType,
                relatedApp: 'FAMILY_TREE',
                relatedRecordID: pending.relatedRecordID,
                explainFamilyTreeRecipient: true
            });

            const ftStatus = delivery.status === 'SENT'
                ? 'Sent'
                : delivery.status === 'SUPPRESSED'
                    ? 'Suppressed'
                    : delivery.status;

            await pool.query(
                `UPDATE FTNotificationT
                 SET Status=?,
                     SentAt=CASE WHEN ?='Sent' THEN NOW() ELSE SentAt END,
                     FailureReason=?
                 WHERE NotificationID=?`,
                [
                    ftStatus,
                    ftStatus,
                    delivery.status === 'SUPPRESSED'
                        ? 'Recipient stopped Family Tree notifications.'
                        : null,
                    pending.NotificationID
                ]
            );
        } catch (error) {
            try {
                await pool.query(
                    `UPDATE FTNotificationT
                     SET Status='Failed', FailureReason=?
                     WHERE NotificationID=?`,
                    [String(error.message || error).slice(0, 500), pending.NotificationID]
                );
            } catch (_) {
                /* Do not undo a successful FamilyTree edit/delete. */
            }
        }
    }
}

function personSelectSql(extraWhere = '') {
    return `
      SELECT
          p.PersonID,
          p.FirstName,
          p.MiddleName,
          p.LastName,
          p.SuffixName,
          p.NickName,
          p.MaidenName,
          p.Gender,
          p.BirthDate,
          p.BirthPlace,
          p.CurrentCity,
          p.CurrentState,
          p.Died,
          p.DeathDate,
          (
              SELECT ft2.FamilyTreeCode
              FROM FTFamilyTreePersonT ftp2
              JOIN FamilyTreeT ft2
                ON ft2.FamilyTreeID = ftp2.FamilyTreeID
              WHERE ftp2.PersonID = p.PersonID
              ORDER BY
                  ftp2.AddedAt ASC,
                  ft2.CreatedAt ASC,
                  ft2.FamilyTreeID ASC
              LIMIT 1
          ) AS OldestFamilyTreeCode
      FROM FTPersonT p
      ${extraWhere}`;
}

function profileFileName(personID) {
    return `${personID}.jpg`;
}

function lifeFileName(personID, lifeNumber) {
    return `${personID}_${lifeNumber}.jpg`;
}

async function publicImageUrl(storageKey) {
    return getSignedImageUrl(storageKey);
}

async function safelyDeleteImage(storageKey) {
    if (!storageKey) return;

    try {
        await deleteImage(storageKey);
    } catch (err) {
        // R2 cleanup should not cause an otherwise-valid DB operation to fail.
        console.error('Unable to delete old FamilyTree image from R2:', err.message);
    }
}

async function withSignedProfileImage(person) {
    if (!person || !person.ProfileImageUrl) {
        return person;
    }

    return {
        ...person,
        ProfileImageUrl: await publicImageUrl(person.ProfileImageUrl)
    };
}


async function getPersonTree(c, personID) {
    const [rows] = await c.query(
        `SELECT
            ft.FamilyTreeID,
            ft.FamilyTreeCode,
            ft.CreatedByUserID,
            ft.CreatedAt,
            ft.Status,
            ft.MergedIntoFamilyTreeID,
            ft.MergedAt,
            ft.MergedByUserID
         FROM FTFamilyTreePersonT ftp
         JOIN FamilyTreeT ft
           ON ft.FamilyTreeID=ftp.FamilyTreeID
         WHERE ftp.PersonID=?
         ORDER BY
            CASE WHEN ft.Status='Active' THEN 0 ELSE 1 END,
            ftp.AddedAt ASC,
            ft.CreatedAt ASC,
            ft.FamilyTreeID ASC
         LIMIT 1`,
        [personID]
    );

    if (!rows.length) {
        return null;
    }

    const resolved = await resolveTreeAlias(c, rows[0]);

    return resolved
        ? resolved.activeTree
        : null;
}

async function adoptTreeForUser(c, userID, targetTree) {
    /*
     * ENTER FAMILY CODE / USE THIS TREE changes the user's current Tree only.
     * It must never merge two Trees. Tree merging is handled exclusively by
     * the separate One Tree Merge workflow.
     */
    const resolvedTarget = await resolveTreeAlias(c, targetTree);

    if (!resolvedTarget) {
        const err = new Error('Target Family Tree was not found.');
        err.status = 404;
        throw err;
    }

    targetTree = resolvedTarget.activeTree;

    await c.query(
        `UPDATE FTFamilyTreeUserT
         SET IsActive=0
         WHERE UserID=?
           AND FamilyTreeID<>?`,
        [userID, targetTree.FamilyTreeID]
    );

    await c.query(
        `INSERT INTO FTFamilyTreeUserT
         (
            FamilyTreeID,
            UserID,
            JoinedAt,
            LastActivityAt,
            IsActive,
            AddedByUserID
         )
         VALUES (?,?,NOW(),NOW(),1,?)
         ON DUPLICATE KEY UPDATE
            IsActive=1,
            LastActivityAt=NOW()`,
        [
            targetTree.FamilyTreeID,
            userID,
            userID
        ]
    );

    return targetTree;
}

async function inferredParentSide(c, personID) {
    const [rows] = await c.query(
        `SELECT Gender FROM FTPersonT WHERE PersonID=? LIMIT 1`,
        [personID]
    );
    const gender = String(rows[0] && rows[0].Gender || '').trim().toLowerCase();
    if (gender === 'female') return 'Mother';
    if (gender === 'male') return 'Father';
    return null;
}

async function availableParentSide(c, treeID, childID, parentID) {
    const side = await inferredParentSide(c, parentID);
    if (!side) return null;
    const [rows] = await c.query(
        `SELECT ParentPersonID FROM FTParentT
         WHERE FamilyTreeID=? AND PersonID=? AND AncestrySide=? AND ParentPersonID<>?
         LIMIT 1`,
        [treeID, childID, side, parentID]
    );
    return rows.length ? null : side;
}

async function addParentLink(c, treeID, userID, childID, parentID) {
    const side = await availableParentSide(c, treeID, childID, parentID);
    await c.query(
        `INSERT INTO FTParentT
         (FamilyTreeID,PersonID,ParentPersonID,ParentType,AncestrySide,Notes,
          CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
         VALUES (?,?,?,'Parent',?,NULL,?,NOW(),NULL,NULL)
         ON DUPLICATE KEY UPDATE
            ParentType='Parent',
            AncestrySide=COALESCE(AncestrySide,VALUES(AncestrySide)),
            UpdatedByUserID=VALUES(CreatedByUserID),
            UpdatedAt=NOW()`,
        [treeID, childID, parentID, side, userID]
    );
}


async function addSiblingLink(c, treeID, userID, personID, siblingPersonID) {
    const a = Math.min(Number(personID), Number(siblingPersonID));
    const z = Math.max(Number(personID), Number(siblingPersonID));

    if (!a || !z || a === z) {
        const err = new Error('Two different people are required for a sibling relationship.');
        err.status = 400;
        throw err;
    }

    await c.query(
        `INSERT INTO FTSiblingT
         (FamilyTreeID,PersonID,SiblingPersonID,Notes,
          CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
         VALUES (?,?,?,NULL,?,NOW(),NULL,NULL)
         ON DUPLICATE KEY UPDATE
            UpdatedByUserID=VALUES(CreatedByUserID),
            UpdatedAt=NOW()`,
        [treeID, a, z, userID]
    );
}

async function biologicalSiblingIDs(c, treeID, personID) {
    const ids = new Set();

    const [derived] = await c.query(
        `SELECT DISTINCT siblingParent.PersonID AS SiblingPersonID
         FROM FTParentT focalParent
         JOIN FTParentT siblingParent
           ON siblingParent.FamilyTreeID=focalParent.FamilyTreeID
          AND siblingParent.ParentPersonID=focalParent.ParentPersonID
          AND siblingParent.PersonID<>focalParent.PersonID
         WHERE focalParent.FamilyTreeID=?
           AND focalParent.PersonID=?
           AND COALESCE(focalParent.ParentType,'Parent')<>'Adopted'
           AND COALESCE(siblingParent.ParentType,'Parent')<>'Adopted'`,
        [treeID, personID]
    );

    derived.forEach(row => ids.add(Number(row.SiblingPersonID)));

    const [explicit] = await c.query(
        `SELECT
            IF(PersonID=?,SiblingPersonID,PersonID) AS SiblingPersonID
         FROM FTSiblingT
         WHERE FamilyTreeID=?
           AND (PersonID=? OR SiblingPersonID=?)`,
        [personID, treeID, personID, personID]
    );

    explicit.forEach(row => ids.add(Number(row.SiblingPersonID)));
    ids.delete(Number(personID));

    return [...ids].filter(Boolean);
}

async function addConfirmedParentLink(
    c,
    treeID,
    userID,
    childID,
    parentID,
    sideHint = null
) {
    const side = sideHint || await inferredParentSide(c, parentID);

    if (side) {
        const [conflicts] = await c.query(
            `SELECT ParentPersonID
             FROM FTParentT
             WHERE FamilyTreeID=?
               AND PersonID=?
               AND AncestrySide=?
               AND ParentPersonID<>?
               AND COALESCE(ParentType,'Parent')<>'Adopted'
             LIMIT 1`,
            [treeID, childID, side, parentID]
        );

        if (conflicts.length) {
            const err = new Error(
                `That Person already has a different biological ${String(side).toLowerCase()}.`
            );
            err.status = 409;
            throw err;
        }
    }

    await addParentLink(c, treeID, userID, childID, parentID);
}

async function addRelationshipInTree(c, treeID, userID, focal, related, kind) {
    await c.query(
        `INSERT IGNORE INTO FTFamilyTreePersonT
         (
            FamilyTreeID,
            PersonID,
            OriginFamilyTreeID,
            AddedByUserID,
            AddedAt,
            Notes
         )
         VALUES (?,?,?,?,NOW(),NULL)`,
        [treeID, related, treeID, userID]
    );

    if (kind === 'mother' || kind === 'father') {
        const side = kind === 'mother' ? 'Mother' : 'Father';
        await c.query(
            `DELETE FROM FTParentT
              WHERE FamilyTreeID=? AND PersonID=? AND AncestrySide=?`,
            [treeID, focal, side]
        );
        await c.query(
            `INSERT INTO FTParentT
             (FamilyTreeID,PersonID,ParentPersonID,ParentType,AncestrySide,Notes,
              CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
             VALUES (?,?,?,'Parent',?,NULL,?,NOW(),NULL,NULL)`,
            [treeID, focal, related, side, userID]
        );
    } else if (kind === 'child') {
        await addParentLink(c, treeID, userID, related, focal);
    } else if (kind === 'sibling') {
        await addSiblingLink(c, treeID, userID, focal, related);
    } else if (kind === 'partner') {
        const a = Math.min(focal, related);
        const z = Math.max(focal, related);
        await c.query(
            `INSERT IGNORE INTO FTPartnerT
             (FamilyTreeID,PersonID,PartnerPersonID,RelationshipType,Notes,
              CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
             VALUES (?,?,?,NULL,NULL,?,NOW(),NULL,NULL)`,
            [treeID, a, z, userID]
        );
    } else {
        const err = new Error('Unsupported relationship type.');
        err.status = 400;
        throw err;
    }
}


async function ensureOriginTreeID(c, treeID) {
    await c.query(
        `UPDATE FTFamilyTreePersonT
         SET OriginFamilyTreeID=FamilyTreeID
         WHERE FamilyTreeID=?
           AND OriginFamilyTreeID IS NULL`,
        [treeID]
    );
}

async function loadTreeComponents(c, treeID) {
    const [people] = await c.query(
        `SELECT
            PersonID,
            COALESCE(OriginFamilyTreeID, FamilyTreeID) AS OriginFamilyTreeID
         FROM FTFamilyTreePersonT
         WHERE FamilyTreeID=?`,
        [treeID]
    );

    if (!people.length) {
        return [];
    }

    const ids = people.map(row => Number(row.PersonID));
    const parent = new Map(ids.map(id => [id, id]));

    function find(x) {
        let root = x;

        while (parent.get(root) !== root) {
            root = parent.get(root);
        }

        while (parent.get(x) !== x) {
            const next = parent.get(x);
            parent.set(x, root);
            x = next;
        }

        return root;
    }

    function union(a, b) {
        if (!parent.has(a) || !parent.has(b)) {
            return;
        }

        const ra = find(a);
        const rb = find(b);

        if (ra !== rb) {
            parent.set(rb, ra);
        }
    }

    const [parentEdges] = await c.query(
        `SELECT PersonID, ParentPersonID
         FROM FTParentT
         WHERE FamilyTreeID=?
           AND COALESCE(ParentType,'Parent')<>'Adopted'`,
        [treeID]
    );

    for (const edge of parentEdges) {
        union(
            Number(edge.PersonID),
            Number(edge.ParentPersonID)
        );
    }

    const [partnerEdges] = await c.query(
        `SELECT PersonID, PartnerPersonID
         FROM FTPartnerT
         WHERE FamilyTreeID=?`,
        [treeID]
    );

    for (const edge of partnerEdges) {
        union(
            Number(edge.PersonID),
            Number(edge.PartnerPersonID)
        );
    }

    const [siblingEdges] = await c.query(
        `SELECT PersonID, SiblingPersonID
         FROM FTSiblingT
         WHERE FamilyTreeID=?`,
        [treeID]
    );

    for (const edge of siblingEdges) {
        union(
            Number(edge.PersonID),
            Number(edge.SiblingPersonID)
        );
    }

    const byRoot = new Map();

    for (const row of people) {
        const root = find(Number(row.PersonID));

        if (!byRoot.has(root)) {
            byRoot.set(root, []);
        }

        byRoot.get(root).push({
            PersonID: Number(row.PersonID),
            OriginFamilyTreeID:
                Number(row.OriginFamilyTreeID)
        });
    }

    return Array.from(byRoot.values());
}

async function chooseHistoricalTreeForComponent(
    c,
    component,
    currentTreeID
) {
    const originIDs = [
        ...new Set(
            component
                .map(row => row.OriginFamilyTreeID)
                .filter(id => id && id !== currentTreeID)
        )
    ];

    if (!originIDs.length) {
        return null;
    }

    const placeholders = originIDs.map(() => '?').join(',');

    const [rows] = await c.query(
        `SELECT
            FamilyTreeID,
            FamilyTreeCode,
            CreatedByUserID,
            CreatedAt,
            Status,
            MergedIntoFamilyTreeID
         FROM FamilyTreeT
         WHERE FamilyTreeID IN (${placeholders})
         ORDER BY CreatedAt ASC, FamilyTreeID ASC`,
        originIDs
    );

    return rows[0] || null;
}

async function moveComponentToTree(
    c,
    sourceTreeID,
    destinationTreeID,
    personIDs
) {
    if (!personIDs.length) {
        return;
    }

    const placeholders =
        personIDs.map(() => '?').join(',');

    await c.query(
        `INSERT IGNORE INTO FTFamilyTreePersonT
         (
            FamilyTreeID,
            PersonID,
            OriginFamilyTreeID,
            AddedByUserID,
            AddedAt,
            Notes
         )
         SELECT
            ?,
            PersonID,
            COALESCE(OriginFamilyTreeID, ?),
            AddedByUserID,
            AddedAt,
            Notes
         FROM FTFamilyTreePersonT
         WHERE FamilyTreeID=?
           AND PersonID IN (${placeholders})`,
        [
            destinationTreeID,
            sourceTreeID,
            sourceTreeID,
            ...personIDs
        ]
    );

    await c.query(
        `UPDATE FTFamilyTreePersonT
         SET OriginFamilyTreeID=?
         WHERE FamilyTreeID=?
           AND PersonID IN (${placeholders})
           AND OriginFamilyTreeID IS NULL`,
        [
            sourceTreeID,
            destinationTreeID,
            ...personIDs
        ]
    );

    await c.query(
        `INSERT IGNORE INTO FTParentT
         (
            FamilyTreeID,
            PersonID,
            ParentPersonID,
            ParentType,
            AncestrySide,
            Notes,
            CreatedByUserID,
            CreatedAt,
            UpdatedByUserID,
            UpdatedAt
         )
         SELECT
            ?,
            PersonID,
            ParentPersonID,
            ParentType,
            AncestrySide,
            Notes,
            CreatedByUserID,
            CreatedAt,
            UpdatedByUserID,
            UpdatedAt
         FROM FTParentT
         WHERE FamilyTreeID=?
           AND PersonID IN (${placeholders})
           AND ParentPersonID IN (${placeholders})`,
        [
            destinationTreeID,
            sourceTreeID,
            ...personIDs,
            ...personIDs
        ]
    );

    await c.query(
        `INSERT IGNORE INTO FTPartnerT
         (
            FamilyTreeID,
            PersonID,
            PartnerPersonID,
            RelationshipType,
            Notes,
            CreatedByUserID,
            CreatedAt,
            UpdatedByUserID,
            UpdatedAt
         )
         SELECT
            ?,
            PersonID,
            PartnerPersonID,
            RelationshipType,
            Notes,
            CreatedByUserID,
            CreatedAt,
            UpdatedByUserID,
            UpdatedAt
         FROM FTPartnerT
         WHERE FamilyTreeID=?
           AND PersonID IN (${placeholders})
           AND PartnerPersonID IN (${placeholders})`,
        [
            destinationTreeID,
            sourceTreeID,
            ...personIDs,
            ...personIDs
        ]
    );

    await c.query(
        `INSERT IGNORE INTO FTSiblingT
         (
            FamilyTreeID,
            PersonID,
            SiblingPersonID,
            Notes,
            CreatedByUserID,
            CreatedAt,
            UpdatedByUserID,
            UpdatedAt
         )
         SELECT
            ?,
            PersonID,
            SiblingPersonID,
            Notes,
            CreatedByUserID,
            CreatedAt,
            UpdatedByUserID,
            UpdatedAt
         FROM FTSiblingT
         WHERE FamilyTreeID=?
           AND PersonID IN (${placeholders})
           AND SiblingPersonID IN (${placeholders})`,
        [
            destinationTreeID,
            sourceTreeID,
            ...personIDs,
            ...personIDs
        ]
    );

    await c.query(
        `DELETE FROM FTParentT
         WHERE FamilyTreeID=?
           AND PersonID IN (${placeholders})
           AND ParentPersonID IN (${placeholders})`,
        [sourceTreeID, ...personIDs, ...personIDs]
    );

    await c.query(
        `DELETE FROM FTPartnerT
         WHERE FamilyTreeID=?
           AND PersonID IN (${placeholders})
           AND PartnerPersonID IN (${placeholders})`,
        [sourceTreeID, ...personIDs, ...personIDs]
    );

    await c.query(
        `DELETE FROM FTSiblingT
         WHERE FamilyTreeID=?
           AND PersonID IN (${placeholders})
           AND SiblingPersonID IN (${placeholders})`,
        [sourceTreeID, ...personIDs, ...personIDs]
    );

    await c.query(
        `DELETE FROM FTFamilyTreePersonT
         WHERE FamilyTreeID=?
           AND PersonID IN (${placeholders})`,
        [sourceTreeID, ...personIDs]
    );
}

async function splitTreeIfDisconnected(
    c,
    tree,
    userID,
    affectedPersonIDs = null
) {
    await ensureOriginTreeID(
        c,
        tree.FamilyTreeID
    );

    const components = await loadTreeComponents(
        c,
        tree.FamilyTreeID
    );

    /*
     * Person deletion must split only the portion of the Tree that was
     * connected through the deleted Person. A Tree may already contain
     * disconnected people/components for legitimate historical reasons.
     * Those pre-existing components must not be moved merely because an
     * unrelated Person was deleted.
     */
    let splitComponents = components;

    if (Array.isArray(affectedPersonIDs)) {
        const affectedSet = new Set(
            affectedPersonIDs
                .map(Number)
                .filter(Boolean)
        );

        splitComponents = components.filter(
            component =>
                component.some(
                    row => affectedSet.has(Number(row.PersonID))
                )
        );
    }

    if (splitComponents.length <= 1) {
        return {
            split: false,
            restoredCodes: [],
            preferredFamilyTreeCode:
                tree.FamilyTreeCode
        };
    }

    /*
     * Within the newly separated portion, the component containing people
     * who originated in the currently authoritative Tree keeps the current
     * code. If more than one candidate qualifies, prefer the largest one.
     * If none qualifies, the largest affected component keeps the code.
     */
    const anchorCandidates = splitComponents
        .map((component, index) => ({
            index,
            size: component.length,
            hasCurrentOrigin: component.some(
                row =>
                    row.OriginFamilyTreeID ===
                    tree.FamilyTreeID
            )
        }))
        .sort((a, b) => {
            if (a.hasCurrentOrigin !== b.hasCurrentOrigin) {
                return a.hasCurrentOrigin ? -1 : 1;
            }
            return b.size - a.size;
        });

    const anchorIndex = anchorCandidates[0].index;
    const restored = [];

    for (let i = 0; i < splitComponents.length; i++) {
        if (i === anchorIndex) {
            continue;
        }

        const component = splitComponents[i];
        const personIDs = component.map(
            row => row.PersonID
        );

        let destination =
            await chooseHistoricalTreeForComponent(
                c,
                component,
                tree.FamilyTreeID
            );

        let restoredPriorCode = true;

        if (destination) {
            await c.query(
                `UPDATE FamilyTreeT
                 SET Status='Active',
                     MergedIntoFamilyTreeID=NULL,
                     MergedAt=NULL,
                     MergedByUserID=NULL,
                     LastActivityAt=NOW(),
                     LastActivityByUserID=?
                 WHERE FamilyTreeID=?`,
                [
                    userID,
                    destination.FamilyTreeID
                ]
            );
        } else {
            restoredPriorCode = false;

            const code = await createCode(c);

            const [created] = await c.query(
                `INSERT INTO FamilyTreeT
                 (
                    FamilyTreeCode,
                    CreatedByUserID,
                    CreatedAt,
                    LastActivityAt,
                    LastActivityByUserID,
                    Status,
                    MergedIntoFamilyTreeID,
                    MergedAt,
                    MergedByUserID
                 )
                 VALUES (
                    ?,?,
                    NOW(),
                    NOW(),
                    ?,
                    'Active',
                    NULL,
                    NULL,
                    NULL
                 )`,
                [code, userID, userID]
            );

            destination = {
                FamilyTreeID: created.insertId,
                FamilyTreeCode: code,
                CreatedByUserID: userID
            };

            /*
             * All users who could access the combined Tree retain an inactive
             * membership in the newly separated Tree.
             */
            await c.query(
                `INSERT IGNORE INTO FTFamilyTreeUserT
                 (
                    FamilyTreeID,
                    UserID,
                    JoinedAt,
                    LastActivityAt,
                    IsActive,
                    AddedByUserID
                 )
                 SELECT
                    ?,
                    UserID,
                    NOW(),
                    NOW(),
                    0,
                    ?
                 FROM FTFamilyTreeUserT
                 WHERE FamilyTreeID=?`,
                [
                    destination.FamilyTreeID,
                    userID,
                    tree.FamilyTreeID
                ]
            );
        }

        await moveComponentToTree(
            c,
            tree.FamilyTreeID,
            destination.FamilyTreeID,
            personIDs
        );

        /*
         * Any other historical origin codes represented inside this newly
         * separated component become aliases of the restored/created code.
         */
        const componentOriginIDs = [
            ...new Set(
                component
                    .map(row => row.OriginFamilyTreeID)
                    .filter(
                        id =>
                            id &&
                            id !== tree.FamilyTreeID &&
                            id !== destination.FamilyTreeID
                    )
            )
        ];

        if (componentOriginIDs.length) {
            const placeholders =
                componentOriginIDs
                    .map(() => '?')
                    .join(',');

            await c.query(
                `UPDATE FamilyTreeT
                 SET Status='Merged',
                     MergedIntoFamilyTreeID=?,
                     MergedAt=NOW(),
                     MergedByUserID=?
                 WHERE FamilyTreeID IN (${placeholders})`,
                [
                    destination.FamilyTreeID,
                    userID,
                    ...componentOriginIDs
                ]
            );
        }

        await logActivity(
            c,
            destination.FamilyTreeID,
            userID,
            'SPLIT',
            'FamilyTreeT',
            destination.FamilyTreeID,
            null,
            restoredPriorCode
                ? `Reactivated Family Tree ${destination.FamilyTreeCode} after the family connection was removed`
                : `Created Family Tree ${destination.FamilyTreeCode} after the family connection was removed`
        );

        restored.push({
            FamilyTreeID:
                destination.FamilyTreeID,
            FamilyTreeCode:
                destination.FamilyTreeCode,
            restoredPriorCode,
            CreatedByUserID:
                destination.CreatedByUserID || null
        });
    }

    /*
     * The original/first-created branch remains the user's current Tree after
     * a split. The separated Trees stay accessible through their memberships
     * but are not made current merely because the split occurred.
     */
    await c.query(
        `UPDATE FTFamilyTreeUserT
         SET IsActive=0
         WHERE UserID=?`,
        [userID]
    );

    await c.query(
        `UPDATE FTFamilyTreeUserT
         SET IsActive=1,
             LastActivityAt=NOW()
         WHERE FamilyTreeID=?
           AND UserID=?`,
        [tree.FamilyTreeID, userID]
    );

    return {
        split: true,
        restoredCodes:
            restored.map(
                item => item.FamilyTreeCode
            ),
        preferredFamilyTreeCode:
            tree.FamilyTreeCode
    };
}

router.get('/current-tree', auth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT ft.FamilyTreeID, ft.FamilyTreeCode
               FROM FTFamilyTreeUserT ftu
               JOIN FamilyTreeT ft
                 ON ft.FamilyTreeID=ftu.FamilyTreeID
              WHERE ftu.UserID=?
                AND ftu.IsActive=1
                AND ft.Status='Active'
                AND ft.MergedIntoFamilyTreeID IS NULL
                AND EXISTS (
                    SELECT 1
                      FROM FTFamilyTreePersonT ftp
                     WHERE ftp.FamilyTreeID=ft.FamilyTreeID
                     LIMIT 1
                )
              ORDER BY ftu.JoinedAt ASC, ft.FamilyTreeID ASC`,
            [req.user.userId]
        );

        res.json({
            tree: rows[0] || null,
            activeCount: rows.length
        });
    } catch (e) {
        res.status(500).json({
            message: e.message
        });
    }
});

router.post('/change-tree', auth, async (req, res) => {
    try {
        const result = await withTx(async c => {
            const [activeRows] = await c.query(
                `SELECT ftu.FamilyTreeUserID,ftu.FamilyTreeID,ft.FamilyTreeCode
                 FROM FTFamilyTreeUserT ftu
                 JOIN FamilyTreeT ft ON ft.FamilyTreeID=ftu.FamilyTreeID
                 WHERE ftu.UserID=? AND ftu.IsActive=1`,
                [req.user.userId]
            );

            for (const row of activeRows) {
                await logActivity(
                    c,
                    row.FamilyTreeID,
                    req.user.userId,
                    'LEAVE_TREE',
                    'FTFamilyTreeUserT',
                    row.FamilyTreeUserID,
                    null,
                    `User ended current association with Family Tree ${row.FamilyTreeCode}`
                );
            }

            await c.query(
                `UPDATE FTFamilyTreeUserT
                 SET IsActive=0,LastActivityAt=NOW()
                 WHERE UserID=? AND IsActive=1`,
                [req.user.userId]
            );

            return {
                deactivatedCount: activeRows.length,
                message: activeRows.length
                    ? 'Current Family Tree association ended. No FamilyTree data was deleted.'
                    : 'No current Family Tree association was active.'
            };
        });

        res.json(result);
    } catch (e) {
        res.status(e.status || 500).json({ message: e.message });
    }
});

router.post('/enter-code', auth, async (req, res) => {
    const code = String(
        (req.body || {}).familyTreeCode || ''
    ).trim().toUpperCase();

    if (!code) {
        return res.status(400).json({
            message: 'Enter a FamilyTreeCode.'
        });
    }

    try {
        const result = await withTx(async c => {
            const resolved = await resolveTreeAlias(
                c,
                code
            );

            if (!resolved) {
                const err = new Error(
                    'FamilyTreeCode was not found.'
                );
                err.status = 404;
                throw err;
            }

            const activeTree =
                await adoptTreeForUser(
                    c,
                    req.user.userId,
                    resolved.activeTree
                );

            return {
                requestedCode:
                    resolved.requestedTree.FamilyTreeCode,
                FamilyTreeID:
                    activeTree.FamilyTreeID,
                FamilyTreeCode:
                    activeTree.FamilyTreeCode,
                redirected:
                    resolved.redirected,
                message:
                    resolved.redirected
                        ? `Family Tree Code ${resolved.requestedTree.FamilyTreeCode} was merged into ${activeTree.FamilyTreeCode}. ${activeTree.FamilyTreeCode} is the current code.`
                        : `Family Tree ${activeTree.FamilyTreeCode} is now active.`
            };
        });

        res.json(result);
    } catch (e) {
        res.status(e.status || 500).json({
            message: e.message
        });
    }
});

/* ============================================================================
   ONE TREE METHOD
   Global duplicate review + controlled Person/FamilyTree reconciliation.
   ============================================================================ */

const ONE_TREE_PERSON_FIELDS = [
    'FirstName',
    'MiddleName',
    'LastName',
    'SuffixName',
    'NickName',
    'MaidenName',
    'Gender',
    'BirthDate',
    'BirthPlace',
    'CurrentCity',
    'CurrentState',
    'Died',
    'DeathDate'
];

function normalizeCompareValue(value) {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value).trim().toLowerCase();
}

function dateOnly(value) {
    if (!value) return null;
    return String(value).slice(0, 10);
}

function olderTreeOf(a, b) {
    if (!a) return b;
    if (!b) return a;
    const aTime = new Date(a.CreatedAt || 0).getTime();
    const bTime = new Date(b.CreatedAt || 0).getTime();
    if (aTime !== bTime) return aTime <= bTime ? a : b;
    return Number(a.FamilyTreeID) <= Number(b.FamilyTreeID) ? a : b;
}

async function treeHasPerson(c, treeID, personID) {
    const [rows] = await c.query(
        `SELECT 1
         FROM FTFamilyTreePersonT
         WHERE FamilyTreeID=? AND PersonID=?
         LIMIT 1`,
        [treeID, personID]
    );
    return !!rows.length;
}

function duplicateScore(input, candidate) {
    const a = {};
    const b = {};
    for (const field of ONE_TREE_PERSON_FIELDS) {
        a[field] = normalizeCompareValue(input[field]);
        b[field] = normalizeCompareValue(candidate[field]);
    }

    let score = 0;
    const reasons = [];

    if (a.FirstName && b.FirstName && a.FirstName === b.FirstName) {
        score += 20;
        reasons.push('same first name');
    }
    if (a.LastName && b.LastName && a.LastName === b.LastName) {
        score += 25;
        reasons.push('same last name');
    }
    if (a.MaidenName && b.MaidenName && a.MaidenName === b.MaidenName) {
        score += 20;
        reasons.push('same maiden name');
    }
    if (
        a.LastName && b.MaidenName && a.LastName === b.MaidenName ||
        a.MaidenName && b.LastName && a.MaidenName === b.LastName
    ) {
        score += 18;
        reasons.push('last/maiden name match');
    }
    if (a.BirthDate && b.BirthDate && a.BirthDate === b.BirthDate) {
        score += 35;
        reasons.push('same birth date');
    }
    if (a.BirthPlace && b.BirthPlace) {
        if (a.BirthPlace === b.BirthPlace) {
            score += 15;
            reasons.push('same birth place');
        } else if (
            a.BirthPlace.includes(b.BirthPlace) ||
            b.BirthPlace.includes(a.BirthPlace)
        ) {
            score += 8;
            reasons.push('similar birth place');
        }
    }
    if (a.MiddleName && b.MiddleName && a.MiddleName === b.MiddleName) {
        score += 8;
        reasons.push('same middle name');
    }
    if (a.Gender && b.Gender && a.Gender === b.Gender) {
        score += 4;
    }
    if (a.DeathDate && b.DeathDate && a.DeathDate === b.DeathDate) {
        score += 20;
        reasons.push('same death date');
    }

    return { score, reasons };
}

async function personContext(c, personID, treeID) {
    const [parentRows] = await c.query(
        `SELECT p.PersonID,p.FirstName,p.MiddleName,p.LastName,p.SuffixName,r.AncestrySide
         FROM FTParentT r
         JOIN FTPersonT p ON p.PersonID=r.ParentPersonID
         WHERE r.FamilyTreeID=? AND r.PersonID=?
           AND COALESCE(r.ParentType,'Parent')<>'Adopted'
         ORDER BY r.AncestrySide,p.LastName,p.FirstName`,
        [treeID, personID]
    );

    const [partnerRows] = await c.query(
        `SELECT p.PersonID,p.FirstName,p.MiddleName,p.LastName,p.SuffixName
         FROM FTPartnerT r
         JOIN FTPersonT p
           ON p.PersonID=IF(r.PersonID=?,r.PartnerPersonID,r.PersonID)
         WHERE r.FamilyTreeID=?
           AND (r.PersonID=? OR r.PartnerPersonID=?)
         ORDER BY p.LastName,p.FirstName`,
        [personID, treeID, personID, personID]
    );

    const [childRows] = await c.query(
        `SELECT p.PersonID,p.FirstName,p.MiddleName,p.LastName,p.SuffixName
         FROM FTParentT r
         JOIN FTPersonT p ON p.PersonID=r.PersonID
         WHERE r.FamilyTreeID=? AND r.ParentPersonID=?
           AND COALESCE(r.ParentType,'Parent')<>'Adopted'
         ORDER BY p.LastName,p.FirstName`,
        [treeID, personID]
    );

    const [eventRows] = await c.query(
        `SELECT e.EventID,e.EventType,e.EventDate,e.EventPlace,e.EventDescription,ep.PersonRole
         FROM FTEventPersonT ep
         JOIN FTEventT e ON e.EventID=ep.EventID
         WHERE ep.PersonID=?
         ORDER BY e.EventDate,e.EventID`,
        [personID]
    );

    const [contactRows] = await c.query(
        `SELECT ContactID,ContactType,ContactValue,ContactNote,IsPrimary
         FROM FTContactT
         WHERE PersonID=?
         ORDER BY ContactType,IsPrimary DESC,ContactID`,
        [personID]
    );

    return {
        parents: parentRows,
        partners: partnerRows,
        children: childRows,
        contacts: contactRows,
        events: eventRows.map(event => ({
            ...event,
            EventDate: dateOnly(event.EventDate)
        }))
    };
}

async function personImagesForReview(c, personID) {
    const [rows] = await c.query(
        `SELECT ImageID,ImageType,ApproxAge,ImageDate,StorageKey,OriginalFileName,Caption,SortOrder
         FROM FTImageT
         WHERE PersonID=?
         ORDER BY CASE WHEN ImageType='Profile' THEN 0 ELSE 1 END,SortOrder,ImageID`,
        [personID]
    );
    const result = [];
    for (const image of rows) {
        let url = null;
        try { url = await publicImageUrl(image.StorageKey); } catch (_) {}
        result.push({ ...image, ImageDate: dateOnly(image.ImageDate), url });
    }
    return result;
}

async function enrichDuplicateCandidate(c, row) {
    const context = await personContext(c, row.PersonID, row.FamilyTreeID);
    let profileImageUrl = null;
    if (row.ProfileStorageKey) {
        try {
            profileImageUrl = await publicImageUrl(row.ProfileStorageKey);
        } catch (_) {}
    }
    const images = await personImagesForReview(c, row.PersonID);
    return {
        ...row,
        BirthDate: dateOnly(row.BirthDate),
        DeathDate: dateOnly(row.DeathDate),
        ProfileImageUrl: profileImageUrl,
        images,
        ...context
    };
}

async function findGlobalDuplicateCandidates(c, input, options = {}) {
    const excludePersonID = Number(options.excludePersonID || 0);
    const restrictTreeID = Number(options.restrictTreeID || 0);

    const first = normalizeCompareValue(input.FirstName);
    const last = normalizeCompareValue(input.LastName);
    const maiden = normalizeCompareValue(input.MaidenName);
    const birth = dateOnly(input.BirthDate);

    const clauses = [];
    const clauseVals = [];

    if (first && last) {
        clauses.push(`(LOWER(TRIM(p.FirstName))=? AND
                      (LOWER(TRIM(p.LastName))=? OR LOWER(TRIM(IFNULL(p.MaidenName,'')))=?))`);
        clauseVals.push(first, last, last);
    }
    if (first && maiden) {
        clauses.push(`(LOWER(TRIM(p.FirstName))=? AND
                      (LOWER(TRIM(p.MaidenName))=? OR LOWER(TRIM(IFNULL(p.LastName,'')))=?))`);
        clauseVals.push(first, maiden, maiden);
    }
    if (birth && last) {
        clauses.push(`(p.BirthDate=? AND
                      (LOWER(TRIM(p.LastName))=? OR LOWER(TRIM(IFNULL(p.MaidenName,'')))=?))`);
        clauseVals.push(birth, last, last);
    }
    if (birth && first) {
        clauses.push('(p.BirthDate=? AND LOWER(TRIM(p.FirstName))=?)');
        clauseVals.push(birth, first);
    }

    if (!clauses.length) return [];

    const prefixVals = [];
    let treeRestriction = '';
    if (restrictTreeID) {
        treeRestriction = ' AND ftp.FamilyTreeID=? ';
        prefixVals.push(restrictTreeID);
    }

    let exclude = '';
    if (excludePersonID) {
        exclude = ' AND p.PersonID<>? ';
        prefixVals.push(excludePersonID);
    }

    const vals = [...prefixVals, ...clauseVals];

    const [rows] = await c.query(
        `SELECT DISTINCT
            p.PersonID,p.FirstName,p.MiddleName,p.LastName,p.SuffixName,
            p.NickName,p.MaidenName,p.Gender,p.BirthDate,p.BirthPlace,p.CurrentCity,p.CurrentState,
            p.Died,p.DeathDate,p.CreatedByUserID,p.CreatedAt,
            ft.FamilyTreeID,ft.FamilyTreeCode,ft.CreatedAt AS FamilyTreeCreatedAt,
            (
                SELECT i.StorageKey
                FROM FTImageT i
                WHERE i.PersonID=p.PersonID AND i.ImageType='Profile'
                ORDER BY i.SortOrder,i.ImageID
                LIMIT 1
            ) AS ProfileStorageKey
         FROM FTPersonT p
         JOIN FTFamilyTreePersonT ftp ON ftp.PersonID=p.PersonID
         JOIN FamilyTreeT ft ON ft.FamilyTreeID=ftp.FamilyTreeID
         WHERE ft.Status='Active'
           ${treeRestriction}
           ${exclude}
           AND (${clauses.join(' OR ')})
         ORDER BY ft.CreatedAt,p.CreatedAt,p.PersonID
         LIMIT 60`,
        vals
    );

    const scored = rows
        .map(row => {
            const result = duplicateScore(input, row);
            return { ...row, MatchScore: result.score, MatchReasons: result.reasons };
        })
        .filter(row => row.MatchScore >= 45)
        .sort((a, b) => b.MatchScore - a.MatchScore || Number(a.PersonID) - Number(b.PersonID))
        .slice(0, 20);

    return Promise.all(scored.map(row => enrichDuplicateCandidate(c, row)));
}

function confirmedDifferentSet(body) {
    return new Set(
        (Array.isArray(body.confirmedDifferentPersonIDs)
            ? body.confirmedDifferentPersonIDs
            : [])
            .map(Number)
            .filter(Boolean)
    );
}

async function requireDuplicateReviewOrContinue(c, body, excludePersonID = 0) {
    const matches = await findGlobalDuplicateCandidates(c, body, { excludePersonID });
    const confirmed = confirmedDifferentSet(body);
    const unresolved = matches.filter(row => !confirmed.has(Number(row.PersonID)));
    if (unresolved.length) {
        const err = new Error('Possible duplicate Person records require review before a new Person can be created.');
        err.status = 409;
        err.responseCode = 'DUPLICATE_REVIEW_REQUIRED';
        err.matches = unresolved;
        throw err;
    }
    return matches;
}

function personConflictList(olderPerson, newerPerson) {
    const conflicts = [];
    for (const field of ONE_TREE_PERSON_FIELDS) {
        const olderValue = field === 'BirthDate' || field === 'DeathDate'
            ? dateOnly(olderPerson[field])
            : olderPerson[field];
        const newerValue = field === 'BirthDate' || field === 'DeathDate'
            ? dateOnly(newerPerson[field])
            : newerPerson[field];
        const a = normalizeCompareValue(olderValue);
        const b = normalizeCompareValue(newerValue);
        if (a && b && a !== b) {
            conflicts.push({ field, olderValue, newerValue });
        }
    }
    return conflicts;
}

async function treePersonRows(c, treeID) {
    const [rows] = await c.query(
        `SELECT p.*,
            (
                SELECT i.StorageKey
                FROM FTImageT i
                WHERE i.PersonID=p.PersonID AND i.ImageType='Profile'
                ORDER BY i.SortOrder,i.ImageID LIMIT 1
            ) AS ProfileStorageKey
         FROM FTPersonT p
         JOIN FTFamilyTreePersonT ftp ON ftp.PersonID=p.PersonID
         WHERE ftp.FamilyTreeID=?
         ORDER BY p.LastName,p.FirstName,p.PersonID`,
        [treeID]
    );
    return rows;
}

async function buildOneTreeReview(c, sourceTree, targetTree) {
    const olderTree = olderTreeOf(sourceTree, targetTree);
    const newerTree = Number(olderTree.FamilyTreeID) === Number(sourceTree.FamilyTreeID)
        ? targetTree
        : sourceTree;

    const newerPeople = await treePersonRows(c, newerTree.FamilyTreeID);
    const groups = [];

    for (const newerPerson of newerPeople) {
        const matches = await findGlobalDuplicateCandidates(c, newerPerson, {
            excludePersonID: newerPerson.PersonID,
            restrictTreeID: olderTree.FamilyTreeID
        });
        if (!matches.length) continue;

        let profileImageUrl = null;
        if (newerPerson.ProfileStorageKey) {
            try { profileImageUrl = await publicImageUrl(newerPerson.ProfileStorageKey); } catch (_) {}
        }
        const newerContext = await personContext(c, newerPerson.PersonID, newerTree.FamilyTreeID);
        const newerImages = await personImagesForReview(c, newerPerson.PersonID);

        groups.push({
            newerPerson: {
                ...newerPerson,
                BirthDate: dateOnly(newerPerson.BirthDate),
                DeathDate: dateOnly(newerPerson.DeathDate),
                ProfileImageUrl: profileImageUrl,
                images: newerImages,
                ...newerContext
            },
            candidates: matches.map(match => ({
                ...match,
                conflicts: personConflictList(match, newerPerson)
            }))
        });
    }

    return { olderTree, newerTree, groups };
}

async function oneTreeReviewNeededResponse(c, sourceTree, targetTree, extras = {}) {
    const review = await buildOneTreeReview(c, sourceTree, targetTree);
    return {
        code: 'ONE_TREE_REVIEW_REQUIRED',
        message: `Family Tree ${review.newerTree.FamilyTreeCode} must be reviewed before it is combined with older Family Tree ${review.olderTree.FamilyTreeCode}.`,
        olderTree: review.olderTree,
        newerTree: review.newerTree,
        candidateGroups: review.groups,
        ...extras
    };
}

function mysqlDateTimeValue(value) {
    if (!value) return null;
    if (value instanceof Date) {
        return value.toISOString().slice(0, 19).replace('T', ' ');
    }
    const text = String(value);
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(text)) {
        return text.slice(0, 19).replace('T', ' ');
    }
    return text;
}

function relationshipKey(...parts) {
    return parts.map(value => String(value ?? '')).join('|');
}

async function captureOneTreeMergeSnapshot(c, olderTree, newerTree, decisions, bridge) {
    const [sourceMemberships] = await c.query(
        'SELECT * FROM FTFamilyTreePersonT WHERE FamilyTreeID=? ORDER BY FamilyTreePersonID',
        [newerTree.FamilyTreeID]
    );
    const sourcePersonIDs = sourceMemberships.map(row => Number(row.PersonID)).filter(Boolean);
    let sourcePeople = [];
    if (sourcePersonIDs.length) {
        const placeholders = sourcePersonIDs.map(() => '?').join(',');
        [sourcePeople] = await c.query(
            `SELECT * FROM FTPersonT WHERE PersonID IN (${placeholders}) ORDER BY PersonID`,
            sourcePersonIDs
        );
    }

    const [sourceParents] = await c.query(
        'SELECT * FROM FTParentT WHERE FamilyTreeID=? ORDER BY ParentRelationshipID',
        [newerTree.FamilyTreeID]
    );
    const [sourcePartners] = await c.query(
        'SELECT * FROM FTPartnerT WHERE FamilyTreeID=? ORDER BY PartnerRelationshipID',
        [newerTree.FamilyTreeID]
    );
    const [sourceSiblings] = await c.query(
        'SELECT * FROM FTSiblingT WHERE FamilyTreeID=? ORDER BY SiblingRelationshipID',
        [newerTree.FamilyTreeID]
    );
    const [sourceUsers] = await c.query(
        'SELECT * FROM FTFamilyTreeUserT WHERE FamilyTreeID=? ORDER BY FamilyTreeUserID',
        [newerTree.FamilyTreeID]
    );

    const [olderMemberships] = await c.query(
        'SELECT * FROM FTFamilyTreePersonT WHERE FamilyTreeID=? ORDER BY FamilyTreePersonID',
        [olderTree.FamilyTreeID]
    );
    const [olderParents] = await c.query(
        'SELECT * FROM FTParentT WHERE FamilyTreeID=? ORDER BY ParentRelationshipID',
        [olderTree.FamilyTreeID]
    );
    const [olderPartners] = await c.query(
        'SELECT * FROM FTPartnerT WHERE FamilyTreeID=? ORDER BY PartnerRelationshipID',
        [olderTree.FamilyTreeID]
    );
    const [olderSiblings] = await c.query(
        'SELECT * FROM FTSiblingT WHERE FamilyTreeID=? ORDER BY SiblingRelationshipID',
        [olderTree.FamilyTreeID]
    );
    const [olderUsers] = await c.query(
        'SELECT * FROM FTFamilyTreeUserT WHERE FamilyTreeID=? ORDER BY FamilyTreeUserID',
        [olderTree.FamilyTreeID]
    );

    const pairs = [];
    for (const decision of decisions || []) {
        if (!decision || decision.decision !== 'same') continue;
        const sourcePersonID = Number(decision.newerPersonID || 0);
        const survivingPersonID = Number(decision.olderPersonID || 0);
        if (!sourcePersonID || !survivingPersonID) continue;

        const [[sourcePerson]] = await c.query(
            'SELECT * FROM FTPersonT WHERE PersonID=? LIMIT 1',
            [sourcePersonID]
        );
        const [[survivingPerson]] = await c.query(
            'SELECT * FROM FTPersonT WHERE PersonID=? LIMIT 1',
            [survivingPersonID]
        );
        const [sourceContacts] = await c.query(
            'SELECT * FROM FTContactT WHERE PersonID=? ORDER BY ContactID',
            [sourcePersonID]
        );
        const [survivingContacts] = await c.query(
            'SELECT * FROM FTContactT WHERE PersonID=? ORDER BY ContactID',
            [survivingPersonID]
        );
        const [sourceEventLinks] = await c.query(
            'SELECT * FROM FTEventPersonT WHERE PersonID=? ORDER BY EventPersonID',
            [sourcePersonID]
        );
        const [survivingEventLinks] = await c.query(
            'SELECT * FROM FTEventPersonT WHERE PersonID=? ORDER BY EventPersonID',
            [survivingPersonID]
        );
        const [sourceImages] = await c.query(
            'SELECT * FROM FTImageT WHERE PersonID=? ORDER BY ImageID',
            [sourcePersonID]
        );
        const [survivingImages] = await c.query(
            'SELECT * FROM FTImageT WHERE PersonID=? ORDER BY ImageID',
            [survivingPersonID]
        );

        pairs.push({
            sourcePersonID,
            survivingPersonID,
            sourcePerson,
            survivingPerson,
            sourceContacts,
            survivingContacts,
            sourceEventLinks,
            survivingEventLinks,
            sourceImages,
            survivingImages
        });
    }

    return {
        version: 1,
        capturedAt: new Date().toISOString(),
        sourceTree: newerTree,
        survivingTree: olderTree,
        sourceMemberships,
        sourcePeople,
        sourceParents,
        sourcePartners,
        sourceSiblings,
        sourceUsers,
        survivingBaseline: {
            memberships: olderMemberships,
            parents: olderParents,
            partners: olderPartners,
            siblings: olderSiblings,
            users: olderUsers
        },
        pairs,
        decisions: decisions || [],
        bridge: bridge || {}
    };
}

async function createOneTreeMergeRecord(c, olderTree, newerTree, userID, decisions, bridge) {
    const snapshot = await captureOneTreeMergeSnapshot(
        c,
        olderTree,
        newerTree,
        decisions,
        bridge
    );

    const [inserted] = await c.query(
        `INSERT INTO FTTreeMergeT
         (SourceFamilyTreeID,SurvivingFamilyTreeID,MergedByUserID,MergedAt,Status,
          BridgeJSON,DecisionsJSON,MergeSnapshot,CreatedR2KeysJSON)
         VALUES (?,?,?,NOW(),'ACTIVE',?,?,?,?)`,
        [
            newerTree.FamilyTreeID,
            olderTree.FamilyTreeID,
            userID,
            JSON.stringify(bridge || {}),
            JSON.stringify(decisions || []),
            JSON.stringify(snapshot),
            JSON.stringify([])
        ]
    );

    return {
        TreeMergeID: inserted.insertId,
        snapshot
    };
}

async function restorePersonFromSnapshot(c, person) {
    if (!person || !person.PersonID) return;
    const [[existing]] = await c.query(
        'SELECT PersonID FROM FTPersonT WHERE PersonID=? LIMIT 1',
        [person.PersonID]
    );
    if (existing) {
        const err = new Error(
            `PersonID ${person.PersonID} already exists and cannot be safely restored.`
        );
        err.status = 409;
        throw err;
    }

    await c.query(
        `INSERT INTO FTPersonT
         (PersonID,FirstName,MiddleName,LastName,SuffixName,NickName,MaidenName,Gender,
          BirthDate,BirthPlace,CurrentCity,CurrentState,Died,DeathDate,CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
            person.PersonID,
            person.FirstName || null,
            person.MiddleName || null,
            person.LastName || null,
            person.SuffixName || null,
            person.NickName || null,
            person.MaidenName || null,
            person.Gender || null,
            person.BirthDate ? dateOnly(person.BirthDate) : null,
            person.BirthPlace || null,
            person.CurrentCity || null,
            person.CurrentState || null,
            Number(person.Died) ? 1 : 0,
            person.DeathDate ? dateOnly(person.DeathDate) : null,
            person.CreatedByUserID,
            mysqlDateTimeValue(person.CreatedAt),
            person.UpdatedByUserID || null,
            mysqlDateTimeValue(person.UpdatedAt)
        ]
    );
}

async function restoreSourceContact(c, row, sourcePersonID, survivingPersonID) {
    const [[existing]] = await c.query(
        'SELECT * FROM FTContactT WHERE ContactID=? LIMIT 1',
        [row.ContactID]
    );

    if (existing && Number(existing.PersonID) === Number(survivingPersonID)) {
        const unchangedIdentity =
            String(existing.ContactType || '').trim().toLowerCase() ===
                String(row.ContactType || '').trim().toLowerCase() &&
            String(existing.ContactValue || '').trim().toLowerCase() ===
                String(row.ContactValue || '').trim().toLowerCase();

        if (unchangedIdentity) {
            await c.query(
                `UPDATE FTContactT
                 SET PersonID=?,ContactType=?,ContactValue=?,ContactNote=?,IsPrimary=?,
                     CreatedByUserID=?,CreatedAt=?,UpdatedByUserID=?,UpdatedAt=?
                 WHERE ContactID=?`,
                [
                    sourcePersonID,
                    row.ContactType,
                    row.ContactValue,
                    existing.ContactNote !== row.ContactNote ? existing.ContactNote : row.ContactNote,
                    row.IsPrimary,
                    row.CreatedByUserID,
                    mysqlDateTimeValue(row.CreatedAt),
                    existing.UpdatedByUserID || row.UpdatedByUserID || null,
                    mysqlDateTimeValue(existing.UpdatedAt || row.UpdatedAt),
                    row.ContactID
                ]
            );
            return;
        }
    }

    if (!existing) {
        try {
            await c.query(
                `INSERT INTO FTContactT
                 (ContactID,PersonID,ContactType,ContactValue,ContactNote,IsPrimary,
                  CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
                 VALUES (?,?,?,?,?,?,?,?,?,?)`,
                [
                    row.ContactID,sourcePersonID,row.ContactType,row.ContactValue,row.ContactNote,
                    row.IsPrimary,row.CreatedByUserID,mysqlDateTimeValue(row.CreatedAt),
                    row.UpdatedByUserID || null,mysqlDateTimeValue(row.UpdatedAt)
                ]
            );
            return;
        } catch (e) {
            if (e.code !== 'ER_DUP_ENTRY') throw e;
        }
    }

    const [dup] = await c.query(
        `SELECT ContactID FROM FTContactT
         WHERE PersonID=? AND LOWER(TRIM(ContactType))=LOWER(TRIM(?))
           AND LOWER(TRIM(ContactValue))=LOWER(TRIM(?)) LIMIT 1`,
        [sourcePersonID,row.ContactType,row.ContactValue]
    );
    if (!dup.length) {
        await c.query(
            `INSERT INTO FTContactT
             (PersonID,ContactType,ContactValue,ContactNote,IsPrimary,
              CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [
                sourcePersonID,row.ContactType,row.ContactValue,row.ContactNote,row.IsPrimary,
                row.CreatedByUserID,mysqlDateTimeValue(row.CreatedAt),
                row.UpdatedByUserID || null,mysqlDateTimeValue(row.UpdatedAt)
            ]
        );
    }
}

async function restoreSourceEventLink(c, row, sourcePersonID, survivingPersonID) {
    const [[existing]] = await c.query(
        'SELECT * FROM FTEventPersonT WHERE EventPersonID=? LIMIT 1',
        [row.EventPersonID]
    );

    if (
        existing &&
        Number(existing.PersonID) === Number(survivingPersonID) &&
        Number(existing.EventID) === Number(row.EventID)
    ) {
        await c.query(
            `UPDATE FTEventPersonT
             SET PersonID=?,PersonRole=?,AddedByUserID=?,AddedAt=?
             WHERE EventPersonID=?`,
            [
                sourcePersonID,
                existing.PersonRole !== row.PersonRole ? existing.PersonRole : row.PersonRole,
                row.AddedByUserID,
                mysqlDateTimeValue(row.AddedAt),
                row.EventPersonID
            ]
        );
        return;
    }

    const [dup] = await c.query(
        'SELECT EventPersonID FROM FTEventPersonT WHERE EventID=? AND PersonID=? LIMIT 1',
        [row.EventID,sourcePersonID]
    );
    if (dup.length) return;

    if (!existing) {
        try {
            await c.query(
                `INSERT INTO FTEventPersonT
                 (EventPersonID,EventID,PersonID,PersonRole,AddedByUserID,AddedAt)
                 VALUES (?,?,?,?,?,?)`,
                [
                    row.EventPersonID,row.EventID,sourcePersonID,row.PersonRole,
                    row.AddedByUserID,mysqlDateTimeValue(row.AddedAt)
                ]
            );
            return;
        } catch (e) {
            if (e.code !== 'ER_DUP_ENTRY') throw e;
        }
    }

    await c.query(
        `INSERT INTO FTEventPersonT
         (EventID,PersonID,PersonRole,AddedByUserID,AddedAt)
         VALUES (?,?,?,?,?)`,
        [row.EventID,sourcePersonID,row.PersonRole,row.AddedByUserID,mysqlDateTimeValue(row.AddedAt)]
    );
}

async function restoreSourceImage(c, row, sourcePersonID, survivingPersonID) {
    const [[existing]] = await c.query(
        'SELECT * FROM FTImageT WHERE ImageID=? LIMIT 1',
        [row.ImageID]
    );

    if (existing && Number(existing.PersonID) === Number(survivingPersonID)) {
        await c.query(
            `UPDATE FTImageT
             SET PersonID=?,ImageType=?,ApproxAge=?,ImageDate=?,StorageKey=?,OriginalFileName=?,
                 Caption=?,SortOrder=?,CreatedByUserID=?,CreatedAt=?,UpdatedByUserID=?,UpdatedAt=?
             WHERE ImageID=?`,
            [
                sourcePersonID,row.ImageType,
                existing.ApproxAge ?? row.ApproxAge,
                existing.ImageDate ? dateOnly(existing.ImageDate) : (row.ImageDate ? dateOnly(row.ImageDate) : null),
                row.StorageKey,
                existing.OriginalFileName || row.OriginalFileName,
                existing.Caption !== row.Caption ? existing.Caption : row.Caption,
                row.SortOrder,row.CreatedByUserID,mysqlDateTimeValue(row.CreatedAt),
                existing.UpdatedByUserID || row.UpdatedByUserID || null,
                mysqlDateTimeValue(existing.UpdatedAt || row.UpdatedAt),
                row.ImageID
            ]
        );
        return;
    }

    if (!existing) {
        try {
            await c.query(
                `INSERT INTO FTImageT
                 (ImageID,PersonID,ImageType,ApproxAge,ImageDate,StorageKey,OriginalFileName,Caption,
                  SortOrder,CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                    row.ImageID,sourcePersonID,row.ImageType,row.ApproxAge,
                    row.ImageDate ? dateOnly(row.ImageDate) : null,row.StorageKey,row.OriginalFileName,
                    row.Caption,row.SortOrder,row.CreatedByUserID,mysqlDateTimeValue(row.CreatedAt),
                    row.UpdatedByUserID || null,mysqlDateTimeValue(row.UpdatedAt)
                ]
            );
            return;
        } catch (e) {
            if (e.code !== 'ER_DUP_ENTRY') throw e;
        }
    }

    const err = new Error(`ImageID ${row.ImageID} cannot be safely restored.`);
    err.status = 409;
    throw err;
}

async function restoreMissingBaselineImage(c, row, survivingPersonID) {
    const [[existing]] = await c.query(
        'SELECT ImageID FROM FTImageT WHERE ImageID=? LIMIT 1',
        [row.ImageID]
    );
    if (existing) return;

    try {
        await c.query(
            `INSERT INTO FTImageT
             (ImageID,PersonID,ImageType,ApproxAge,ImageDate,StorageKey,OriginalFileName,Caption,
              SortOrder,CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                row.ImageID,survivingPersonID,row.ImageType,row.ApproxAge,
                row.ImageDate ? dateOnly(row.ImageDate) : null,row.StorageKey,row.OriginalFileName,
                row.Caption,row.SortOrder,row.CreatedByUserID,mysqlDateTimeValue(row.CreatedAt),
                row.UpdatedByUserID || null,mysqlDateTimeValue(row.UpdatedAt)
            ]
        );
    } catch (e) {
        if (e.code !== 'ER_DUP_ENTRY') throw e;
    }
}

async function safelyRevertSurvivingPersonFields(c, personMergeRow, userID) {
    if (!personMergeRow) return;
    let before;
    let after;
    try {
        before = JSON.parse(personMergeRow.SurvivingPersonSnapshotBefore || '{}');
        after = JSON.parse(personMergeRow.SurvivingPersonSnapshotAfter || '{}');
    } catch (_) {
        return;
    }
    if (!before || !after || !personMergeRow.SurvivingPersonID) return;

    const [[current]] = await c.query(
        'SELECT * FROM FTPersonT WHERE PersonID=? LIMIT 1',
        [personMergeRow.SurvivingPersonID]
    );
    if (!current) return;

    const next = {};
    for (const field of ONE_TREE_PERSON_FIELDS) {
        const currentValue = field === 'BirthDate' || field === 'DeathDate'
            ? dateOnly(current[field])
            : current[field];
        const afterValue = field === 'BirthDate' || field === 'DeathDate'
            ? dateOnly(after[field])
            : after[field];
        const beforeValue = field === 'BirthDate' || field === 'DeathDate'
            ? dateOnly(before[field])
            : before[field];

        next[field] = normalizeCompareValue(currentValue) === normalizeCompareValue(afterValue)
            ? beforeValue
            : currentValue;
    }

    await c.query(
        `UPDATE FTPersonT
         SET FirstName=?,MiddleName=?,LastName=?,SuffixName=?,NickName=?,MaidenName=?,
             Gender=?,BirthDate=?,BirthPlace=?,CurrentCity=?,CurrentState=?,Died=?,DeathDate=?,UpdatedByUserID=?,UpdatedAt=NOW()
         WHERE PersonID=?`,
        [
            next.FirstName || null,next.MiddleName || null,next.LastName || null,
            next.SuffixName || null,next.NickName || null,next.MaidenName || null,
            next.Gender || null,next.BirthDate || null,next.BirthPlace || null,next.CurrentCity || null,next.CurrentState || null,
            Number(next.Died) ? 1 : 0,next.DeathDate || null,userID,
            personMergeRow.SurvivingPersonID
        ]
    );
}

async function removeUndoBridge(c, survivingTreeID, bridge, pairMap) {
    if (!bridge) return;
    const mapID = id => pairMap.get(Number(id)) || Number(id || 0);
    const focal = mapID(bridge.focalPersonID);
    const related = mapID(bridge.relatedPersonID);
    const kind = String(bridge.relationshipKind || '').toLowerCase();
    if (!focal || !related || !kind || focal === related) return;

    if (kind === 'mother' || kind === 'father') {
        await c.query(
            'DELETE FROM FTParentT WHERE FamilyTreeID=? AND PersonID=? AND ParentPersonID=?',
            [survivingTreeID,focal,related]
        );
    } else if (kind === 'child') {
        await c.query(
            'DELETE FROM FTParentT WHERE FamilyTreeID=? AND PersonID=? AND ParentPersonID=?',
            [survivingTreeID,related,focal]
        );
    } else if (kind === 'partner') {
        const a = Math.min(focal,related);
        const z = Math.max(focal,related);
        await c.query(
            'DELETE FROM FTPartnerT WHERE FamilyTreeID=? AND PersonID=? AND PartnerPersonID=?',
            [survivingTreeID,a,z]
        );
    } else if (kind === 'sibling') {
        const a = Math.min(focal,related);
        const z = Math.max(focal,related);
        await c.query(
            'DELETE FROM FTSiblingT WHERE FamilyTreeID=? AND PersonID=? AND SiblingPersonID=?',
            [survivingTreeID,a,z]
        );
    }
}

async function undoOneTreeMerge(c, mergeRow, userID) {
    let snapshot;
    try {
        snapshot = JSON.parse(mergeRow.MergeSnapshot || '{}');
    } catch (_) {
        const err = new Error('The stored One Tree merge snapshot is not readable.');
        err.status = 500;
        throw err;
    }

    const sourceTreeID = Number(mergeRow.SourceFamilyTreeID);
    const survivingTreeID = Number(mergeRow.SurvivingFamilyTreeID);
    const sourceTree = snapshot.sourceTree || {};

    if (
        Number(sourceTree.CreatedByUserID) !== Number(userID) &&
        Number(mergeRow.MergedByUserID) !== Number(userID)
    ) {
        const err = new Error('Only the creator of the merged source Tree or the user who completed the merge may undo it.');
        err.status = 403;
        throw err;
    }

    const [[newerActiveMerge]] = await c.query(
        `SELECT TreeMergeID,MergedAt
         FROM FTTreeMergeT
         WHERE SurvivingFamilyTreeID=? AND Status='ACTIVE' AND MergedAt>?
         ORDER BY MergedAt DESC,TreeMergeID DESC LIMIT 1`,
        [survivingTreeID,mergeRow.MergedAt]
    );
    if (newerActiveMerge) {
        const err = new Error('A newer One Tree merge depends on this Tree. Undo the newer merge first.');
        err.status = 409;
        throw err;
    }

    const [[sourceCurrent]] = await c.query(
        'SELECT * FROM FamilyTreeT WHERE FamilyTreeID=? FOR UPDATE',
        [sourceTreeID]
    );
    if (
        !sourceCurrent ||
        sourceCurrent.Status !== 'Merged' ||
        Number(sourceCurrent.MergedIntoFamilyTreeID) !== survivingTreeID
    ) {
        const err = new Error('The source Family Tree is no longer in the state required for this undo.');
        err.status = 409;
        throw err;
    }

    const [[unexpected]] = await c.query(
        `SELECT
            (SELECT COUNT(*) FROM FTFamilyTreePersonT WHERE FamilyTreeID=?) AS personCount,
            (SELECT COUNT(*) FROM FTParentT WHERE FamilyTreeID=?) AS parentCount,
            (SELECT COUNT(*) FROM FTPartnerT WHERE FamilyTreeID=?) AS partnerCount,
            (SELECT COUNT(*) FROM FTSiblingT WHERE FamilyTreeID=?) AS siblingCount`,
        [sourceTreeID,sourceTreeID,sourceTreeID,sourceTreeID]
    );
    if (
        Number(unexpected.personCount) || Number(unexpected.parentCount) ||
        Number(unexpected.partnerCount) || Number(unexpected.siblingCount)
    ) {
        const err = new Error('The historical source Tree contains unexpected current data. Undo was stopped to protect it.');
        err.status = 409;
        throw err;
    }

    const pairMap = new Map();
    for (const pair of snapshot.pairs || []) {
        pairMap.set(Number(pair.sourcePersonID), Number(pair.survivingPersonID));
    }
    const mapID = id => pairMap.get(Number(id)) || Number(id);

    const [personMergeRows] = await c.query(
        'SELECT * FROM FTPersonMergeT WHERE TreeMergeID=? ORDER BY PersonMergeID',
        [mergeRow.TreeMergeID]
    );

    for (const pair of snapshot.pairs || []) {
        await restorePersonFromSnapshot(c, pair.sourcePerson);
    }

    const baselineMembers = new Set(
        ((snapshot.survivingBaseline || {}).memberships || [])
            .map(row => Number(row.PersonID))
    );
    for (const membership of snapshot.sourceMemberships || []) {
        const mappedID = mapID(membership.PersonID);
        if (!baselineMembers.has(mappedID)) {
            await c.query(
                'DELETE FROM FTFamilyTreePersonT WHERE FamilyTreeID=? AND PersonID=?',
                [survivingTreeID,mappedID]
            );
        }
    }

    const baselineParents = new Set(
        ((snapshot.survivingBaseline || {}).parents || [])
            .map(row => relationshipKey(row.PersonID,row.ParentPersonID))
    );
    for (const rel of snapshot.sourceParents || []) {
        const childID = mapID(rel.PersonID);
        const parentID = mapID(rel.ParentPersonID);
        if (!baselineParents.has(relationshipKey(childID,parentID))) {
            await c.query(
                'DELETE FROM FTParentT WHERE FamilyTreeID=? AND PersonID=? AND ParentPersonID=?',
                [survivingTreeID,childID,parentID]
            );
        }
    }

    const baselinePartners = new Set(
        ((snapshot.survivingBaseline || {}).partners || [])
            .map(row => relationshipKey(Math.min(Number(row.PersonID),Number(row.PartnerPersonID)),Math.max(Number(row.PersonID),Number(row.PartnerPersonID))))
    );
    for (const rel of snapshot.sourcePartners || []) {
        const a = Math.min(mapID(rel.PersonID),mapID(rel.PartnerPersonID));
        const z = Math.max(mapID(rel.PersonID),mapID(rel.PartnerPersonID));
        if (!baselinePartners.has(relationshipKey(a,z))) {
            await c.query(
                'DELETE FROM FTPartnerT WHERE FamilyTreeID=? AND PersonID=? AND PartnerPersonID=?',
                [survivingTreeID,a,z]
            );
        }
    }

    const baselineSiblings = new Set(
        ((snapshot.survivingBaseline || {}).siblings || [])
            .map(row => relationshipKey(Math.min(Number(row.PersonID),Number(row.SiblingPersonID)),Math.max(Number(row.PersonID),Number(row.SiblingPersonID))))
    );
    for (const rel of snapshot.sourceSiblings || []) {
        const a = Math.min(mapID(rel.PersonID),mapID(rel.SiblingPersonID));
        const z = Math.max(mapID(rel.PersonID),mapID(rel.SiblingPersonID));
        if (!baselineSiblings.has(relationshipKey(a,z))) {
            await c.query(
                'DELETE FROM FTSiblingT WHERE FamilyTreeID=? AND PersonID=? AND SiblingPersonID=?',
                [survivingTreeID,a,z]
            );
        }
    }

    let bridge = snapshot.bridge || {};
    try {
        if (mergeRow.BridgeJSON) bridge = JSON.parse(mergeRow.BridgeJSON);
    } catch (_) {}
    await removeUndoBridge(c,survivingTreeID,bridge,pairMap);

    for (const membership of snapshot.sourceMemberships || []) {
        await c.query(
            `INSERT INTO FTFamilyTreePersonT
             (FamilyTreeID,PersonID,OriginFamilyTreeID,AddedByUserID,AddedAt,Notes)
             VALUES (?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE
               OriginFamilyTreeID=VALUES(OriginFamilyTreeID),
               AddedByUserID=VALUES(AddedByUserID),
               AddedAt=VALUES(AddedAt),
               Notes=VALUES(Notes)`,
            [
                sourceTreeID,membership.PersonID,
                membership.OriginFamilyTreeID || sourceTreeID,
                membership.AddedByUserID,mysqlDateTimeValue(membership.AddedAt),membership.Notes
            ]
        );
    }

    for (const rel of snapshot.sourceParents || []) {
        await c.query(
            `INSERT INTO FTParentT
             (FamilyTreeID,PersonID,ParentPersonID,ParentType,AncestrySide,Notes,
              CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
             VALUES (?,?,?,?,?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE
               ParentType=VALUES(ParentType),AncestrySide=VALUES(AncestrySide),Notes=VALUES(Notes),
               UpdatedByUserID=VALUES(UpdatedByUserID),UpdatedAt=VALUES(UpdatedAt)`,
            [
                sourceTreeID,rel.PersonID,rel.ParentPersonID,rel.ParentType,rel.AncestrySide,rel.Notes,
                rel.CreatedByUserID,mysqlDateTimeValue(rel.CreatedAt),rel.UpdatedByUserID || null,
                mysqlDateTimeValue(rel.UpdatedAt)
            ]
        );
    }

    for (const rel of snapshot.sourcePartners || []) {
        await c.query(
            `INSERT INTO FTPartnerT
             (FamilyTreeID,PersonID,PartnerPersonID,RelationshipType,Notes,
              CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
             VALUES (?,?,?,?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE
               RelationshipType=VALUES(RelationshipType),Notes=VALUES(Notes),
               UpdatedByUserID=VALUES(UpdatedByUserID),UpdatedAt=VALUES(UpdatedAt)`,
            [
                sourceTreeID,rel.PersonID,rel.PartnerPersonID,rel.RelationshipType,rel.Notes,
                rel.CreatedByUserID,mysqlDateTimeValue(rel.CreatedAt),rel.UpdatedByUserID || null,
                mysqlDateTimeValue(rel.UpdatedAt)
            ]
        );
    }

    for (const rel of snapshot.sourceSiblings || []) {
        await c.query(
            `INSERT INTO FTSiblingT
             (FamilyTreeID,PersonID,SiblingPersonID,Notes,
              CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
             VALUES (?,?,?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE
               Notes=VALUES(Notes),UpdatedByUserID=VALUES(UpdatedByUserID),UpdatedAt=VALUES(UpdatedAt)`,
            [
                sourceTreeID,rel.PersonID,rel.SiblingPersonID,rel.Notes,
                rel.CreatedByUserID,mysqlDateTimeValue(rel.CreatedAt),rel.UpdatedByUserID || null,
                mysqlDateTimeValue(rel.UpdatedAt)
            ]
        );
    }

    const baselineUsers = new Set(
        ((snapshot.survivingBaseline || {}).users || []).map(row => Number(row.UserID))
    );
    for (const member of snapshot.sourceUsers || []) {
        await c.query(
            `INSERT INTO FTFamilyTreeUserT
             (FamilyTreeID,UserID,JoinedAt,LastActivityAt,IsActive,AddedByUserID)
             VALUES (?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE
               JoinedAt=VALUES(JoinedAt),LastActivityAt=NOW(),IsActive=VALUES(IsActive),AddedByUserID=VALUES(AddedByUserID)`,
            [
                sourceTreeID,member.UserID,mysqlDateTimeValue(member.JoinedAt),
                mysqlDateTimeValue(member.LastActivityAt),Number(member.IsActive) ? 1 : 0,member.AddedByUserID
            ]
        );
        if (!baselineUsers.has(Number(member.UserID))) {
            await c.query(
                `UPDATE FTFamilyTreeUserT
                 SET IsActive=0,LastActivityAt=NOW()
                 WHERE FamilyTreeID=? AND UserID=?`,
                [survivingTreeID,member.UserID]
            );
        }
    }

    for (const pair of snapshot.pairs || []) {
        for (const row of pair.sourceContacts || []) {
            await restoreSourceContact(c,row,pair.sourcePersonID,pair.survivingPersonID);
        }
        for (const row of pair.sourceEventLinks || []) {
            await restoreSourceEventLink(c,row,pair.sourcePersonID,pair.survivingPersonID);
        }
        for (const row of pair.sourceImages || []) {
            await restoreSourceImage(c,row,pair.sourcePersonID,pair.survivingPersonID);
        }
        for (const row of pair.survivingImages || []) {
            await restoreMissingBaselineImage(c,row,pair.survivingPersonID);
        }
    }

    for (const personMergeRow of personMergeRows) {
        await safelyRevertSurvivingPersonFields(c,personMergeRow,userID);
        await c.query(
            `UPDATE FTPersonMergeT
             SET UndoByUserID=?,UndoAt=NOW(),UndoReason='UndoOneTreeMerge'
             WHERE PersonMergeID=?`,
            [userID,personMergeRow.PersonMergeID]
        );
    }

    await c.query(
        `UPDATE FamilyTreeT
         SET Status='Active',MergedIntoFamilyTreeID=NULL,MergedAt=NULL,MergedByUserID=NULL,
             LastActivityAt=NOW(),LastActivityByUserID=?
         WHERE FamilyTreeID=?`,
        [userID,sourceTreeID]
    );
    await c.query(
        `UPDATE FamilyTreeT
         SET LastActivityAt=NOW(),LastActivityByUserID=?
         WHERE FamilyTreeID=?`,
        [userID,survivingTreeID]
    );

    await c.query(
        `UPDATE FTFamilyTreeUserT SET IsActive=0
         WHERE UserID=? AND FamilyTreeID<>?`,
        [userID,sourceTreeID]
    );
    await c.query(
        `INSERT INTO FTFamilyTreeUserT
         (FamilyTreeID,UserID,JoinedAt,LastActivityAt,IsActive,AddedByUserID)
         VALUES (?,?,NOW(),NOW(),1,?)
         ON DUPLICATE KEY UPDATE IsActive=1,LastActivityAt=NOW()`,
        [sourceTreeID,userID,userID]
    );

    await c.query(
        `UPDATE FTTreeMergeT
         SET Status='UNDONE',UndoneByUserID=?,UndoneAt=NOW(),UndoNote='User reversed an incorrect One Tree merge.'
         WHERE TreeMergeID=?`,
        [userID,mergeRow.TreeMergeID]
    );

    await logActivity(
        c,sourceTreeID,userID,'UNDO_MERGE','FamilyTreeT',sourceTreeID,null,
        `Restored Family Tree ${sourceTree.FamilyTreeCode || sourceTreeID} after undoing One Tree merge ${mergeRow.TreeMergeID}`
    );
    await logActivity(
        c,survivingTreeID,userID,'UNDO_MERGE','FamilyTreeT',sourceTreeID,null,
        `Separated Family Tree ${sourceTree.FamilyTreeCode || sourceTreeID} from this Tree by undoing One Tree merge ${mergeRow.TreeMergeID}`
    );

    let cleanupKeys = [];
    try {
        cleanupKeys = JSON.parse(mergeRow.CreatedR2KeysJSON || '[]');
    } catch (_) {}

    return {
        TreeMergeID: mergeRow.TreeMergeID,
        FamilyTreeID: sourceTreeID,
        FamilyTreeCode: sourceTree.FamilyTreeCode,
        separatedFromFamilyTreeID: survivingTreeID,
        cleanupKeys: Array.isArray(cleanupKeys) ? cleanupKeys : []
    };
}

async function mergePersonPairOneTree(c, olderTreeID, newerTreeID, newerPersonID, olderPersonID, resolutions, keepImageIDs, userID, r2Plan, treeMergeID) {
    const [[olderPerson]] = await c.query('SELECT * FROM FTPersonT WHERE PersonID=? FOR UPDATE', [olderPersonID]);
    const [[newerPerson]] = await c.query('SELECT * FROM FTPersonT WHERE PersonID=? FOR UPDATE', [newerPersonID]);
    if (!olderPerson || !newerPerson) {
        const err = new Error('A Person selected for merge no longer exists.');
        err.status = 409;
        throw err;
    }

    const beforeOlder = { ...olderPerson };
    const beforeNewer = { ...newerPerson };
    const update = {};

    for (const field of ONE_TREE_PERSON_FIELDS) {
        const olderValue = field === 'BirthDate' || field === 'DeathDate' ? dateOnly(olderPerson[field]) : olderPerson[field];
        const newerValue = field === 'BirthDate' || field === 'DeathDate' ? dateOnly(newerPerson[field]) : newerPerson[field];
        const olderNorm = normalizeCompareValue(olderValue);
        const newerNorm = normalizeCompareValue(newerValue);

        if (!olderNorm && newerNorm) {
            update[field] = newerValue;
        } else if (olderNorm && newerNorm && olderNorm !== newerNorm) {
            update[field] = resolutions && resolutions[field] === 'newer'
                ? newerValue
                : olderValue;
        } else {
            update[field] = olderValue;
        }
    }

    await c.query(
        `UPDATE FTPersonT
         SET FirstName=?,MiddleName=?,LastName=?,SuffixName=?,NickName=?,MaidenName=?,
             Gender=?,BirthDate=?,BirthPlace=?,CurrentCity=?,CurrentState=?,Died=?,DeathDate=?,UpdatedByUserID=?,UpdatedAt=NOW()
         WHERE PersonID=?`,
        [
            update.FirstName || null,
            update.MiddleName || null,
            update.LastName || null,
            update.SuffixName || null,
            update.NickName || null,
            update.MaidenName || null,
            update.Gender || null,
            update.BirthDate || null,
            update.BirthPlace || null,
            update.CurrentCity || null,
            update.CurrentState || null,
            Number(update.Died) ? 1 : 0,
            update.DeathDate || null,
            userID,
            olderPersonID
        ]
    );

    const [contacts] = await c.query('SELECT * FROM FTContactT WHERE PersonID=? ORDER BY ContactID', [newerPersonID]);
    for (const contact of contacts) {
        const [dup] = await c.query(
            `SELECT ContactID FROM FTContactT
             WHERE PersonID=? AND LOWER(TRIM(ContactType))=LOWER(TRIM(?))
               AND LOWER(TRIM(ContactValue))=LOWER(TRIM(?)) LIMIT 1`,
            [olderPersonID, contact.ContactType, contact.ContactValue]
        );
        if (dup.length) {
            await c.query('DELETE FROM FTContactT WHERE ContactID=?', [contact.ContactID]);
        } else {
            await c.query('UPDATE FTContactT SET PersonID=?,UpdatedByUserID=?,UpdatedAt=NOW() WHERE ContactID=?', [olderPersonID, userID, contact.ContactID]);
        }
    }

    const [eventLinks] = await c.query('SELECT * FROM FTEventPersonT WHERE PersonID=?', [newerPersonID]);
    for (const link of eventLinks) {
        const [dup] = await c.query('SELECT EventPersonID FROM FTEventPersonT WHERE EventID=? AND PersonID=? LIMIT 1', [link.EventID, olderPersonID]);
        if (dup.length) {
            await c.query('DELETE FROM FTEventPersonT WHERE EventPersonID=?', [link.EventPersonID]);
        } else {
            await c.query('UPDATE FTEventPersonT SET PersonID=? WHERE EventPersonID=?', [olderPersonID, link.EventPersonID]);
        }
    }

    let [olderImages] = await c.query('SELECT * FROM FTImageT WHERE PersonID=? ORDER BY CASE WHEN ImageType=\'Profile\' THEN 0 ELSE 1 END,SortOrder,ImageID', [olderPersonID]);
    let [newerImages] = await c.query('SELECT * FROM FTImageT WHERE PersonID=? ORDER BY CASE WHEN ImageType=\'Profile\' THEN 0 ELSE 1 END,SortOrder,ImageID', [newerPersonID]);

    const keepSet = Array.isArray(keepImageIDs)
        ? new Set(keepImageIDs.map(Number))
        : new Set([...olderImages, ...newerImages].map(image => Number(image.ImageID)));

    for (const image of [...olderImages, ...newerImages]) {
        if (!keepSet.has(Number(image.ImageID))) {
            await c.query('DELETE FROM FTImageT WHERE ImageID=?', [image.ImageID]);
        }
    }

    olderImages = olderImages.filter(image => keepSet.has(Number(image.ImageID)));
    newerImages = newerImages.filter(image => keepSet.has(Number(image.ImageID)));

    if (olderImages.length + newerImages.length > 5) {
        const err = new Error(`PersonID ${olderPersonID} and PersonID ${newerPersonID} have more than five selected pictures. Select no more than five pictures to keep.`);
        err.status = 409;
        err.responseCode = 'IMAGE_LIMIT_REVIEW_REQUIRED';
        throw err;
    }

    const hasProfile = olderImages.some(i => String(i.ImageType).toLowerCase() === 'profile');
    const usedLife = new Set(olderImages.filter(i => String(i.ImageType).toLowerCase() !== 'profile').map(i => Number(i.SortOrder)).filter(n => n >= 1 && n <= 4));
    let profileAvailable = !hasProfile;

    for (const image of newerImages) {
        let imageType = 'Life';
        let sortOrder = 0;
        let storageKey;

        if (profileAvailable && String(image.ImageType).toLowerCase() === 'profile') {
            imageType = 'Profile';
            sortOrder = 0;
            storageKey = profileFileName(olderPersonID);
            profileAvailable = false;
        } else {
            let slot = 1;
            while (slot <= 4 && usedLife.has(slot)) slot++;
            if (slot > 4) {
                const err = new Error('No picture slot is available while merging Person records.');
                err.status = 409;
                err.responseCode = 'IMAGE_LIMIT_REVIEW_REQUIRED';
                throw err;
            }
            usedLife.add(slot);
            imageType = 'Life';
            sortOrder = slot;
            storageKey = lifeFileName(olderPersonID, slot);
        }

        if (image.StorageKey !== storageKey) {
            await copyImage(image.StorageKey, storageKey);
            r2Plan.newKeys.push(storageKey);
        }

        await c.query(
            `UPDATE FTImageT
             SET PersonID=?,ImageType=?,SortOrder=?,StorageKey=?,UpdatedByUserID=?,UpdatedAt=NOW()
             WHERE ImageID=?`,
            [olderPersonID, imageType, sortOrder, storageKey, userID, image.ImageID]
        );
    }

    const [[afterOlder]] = await c.query(
        'SELECT * FROM FTPersonT WHERE PersonID=? LIMIT 1',
        [olderPersonID]
    );

    await c.query(
        `INSERT INTO FTPersonMergeT
         (TreeMergeID,SourcePersonID,SurvivingPersonID,SourceFamilyTreeID,SurvivingFamilyTreeID,
          MergedByUserID,MergedAt,MergeReason,ConflictResolutionJSON,
          SourcePersonSnapshot,SurvivingPersonSnapshotBefore,SurvivingPersonSnapshotAfter)
         VALUES (?,?,?,?,?,?,NOW(),'OneTreeMethod',?,?,?,?)`,
        [
            treeMergeID || null,
            newerPersonID,
            olderPersonID,
            newerTreeID,
            olderTreeID,
            userID,
            JSON.stringify(resolutions || {}),
            JSON.stringify(beforeNewer),
            JSON.stringify(beforeOlder),
            JSON.stringify(afterOlder || {})
        ]
    );

    await logActivity(
        c,
        olderTreeID,
        userID,
        'MERGE_PERSON',
        'FTPersonT',
        olderPersonID,
        olderPersonID,
        `OneTreeMethod merged PersonID ${newerPersonID} into PersonID ${olderPersonID}`,
        beforeOlder.CreatedByUserID
    );

    return { newerPersonID, olderPersonID };
}

async function mergeTreesOneTree(c, olderTree, newerTree, decisions, userID, bridge, r2Plan, treeMergeID) {
    const mapping = new Map();
    const resolutionByNewerID = new Map();
    const keepImagesByNewerID = new Map();

    for (const decision of decisions || []) {
        if (decision && decision.decision === 'same') {
            const newerPersonID = Number(decision.newerPersonID);
            const olderPersonID = Number(decision.olderPersonID);
            if (newerPersonID && olderPersonID) {
                mapping.set(newerPersonID, olderPersonID);
                resolutionByNewerID.set(newerPersonID, decision.resolutions || {});
                keepImagesByNewerID.set(newerPersonID, Array.isArray(decision.keepImageIDs) ? decision.keepImageIDs : []);
            }
        }
    }

    for (const [newerPersonID, olderPersonID] of mapping.entries()) {
        if (!(await treeHasPerson(c, newerTree.FamilyTreeID, newerPersonID)) ||
            !(await treeHasPerson(c, olderTree.FamilyTreeID, olderPersonID))) {
            const err = new Error('A selected Person merge no longer matches the two Family Trees. Reload the review.');
            err.status = 409;
            throw err;
        }
        await mergePersonPairOneTree(
            c,
            olderTree.FamilyTreeID,
            newerTree.FamilyTreeID,
            newerPersonID,
            olderPersonID,
            resolutionByNewerID.get(newerPersonID),
            keepImagesByNewerID.get(newerPersonID),
            userID,
            r2Plan,
            treeMergeID
        );
    }

    const mapID = id => mapping.get(Number(id)) || Number(id);

    const [newerMemberships] = await c.query('SELECT * FROM FTFamilyTreePersonT WHERE FamilyTreeID=? ORDER BY FamilyTreePersonID', [newerTree.FamilyTreeID]);
    for (const membership of newerMemberships) {
        const destinationPersonID = mapID(membership.PersonID);
        await c.query(
            `INSERT INTO FTFamilyTreePersonT
             (FamilyTreeID,PersonID,OriginFamilyTreeID,AddedByUserID,AddedAt,Notes)
             VALUES (?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE OriginFamilyTreeID=COALESCE(OriginFamilyTreeID,VALUES(OriginFamilyTreeID))`,
            [
                olderTree.FamilyTreeID,
                destinationPersonID,
                membership.OriginFamilyTreeID || newerTree.FamilyTreeID,
                membership.AddedByUserID,
                membership.AddedAt,
                membership.Notes
            ]
        );
    }

    const [parentRows] = await c.query("SELECT * FROM FTParentT WHERE FamilyTreeID=? AND COALESCE(ParentType,'Parent')<>'Adopted' ORDER BY ParentRelationshipID", [newerTree.FamilyTreeID]);
    for (const rel of parentRows) {
        const childID = mapID(rel.PersonID);
        const parentID = mapID(rel.ParentPersonID);
        if (!childID || !parentID || childID === parentID) continue;

        try {
            await c.query(
                `INSERT INTO FTParentT
                 (FamilyTreeID,PersonID,ParentPersonID,ParentType,AncestrySide,Notes,CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
                 VALUES (?,?,?,?,?,?,?,?,?,?)`,
                [olderTree.FamilyTreeID,childID,parentID,rel.ParentType,rel.AncestrySide,rel.Notes,rel.CreatedByUserID,rel.CreatedAt,rel.UpdatedByUserID,rel.UpdatedAt]
            );
        } catch (e) {
            if (e.code !== 'ER_DUP_ENTRY') throw e;
            // The older tree remains authoritative when the same ancestry slot conflicts.
        }
    }

    const [partnerRows] = await c.query('SELECT * FROM FTPartnerT WHERE FamilyTreeID=? ORDER BY PartnerRelationshipID', [newerTree.FamilyTreeID]);
    for (const rel of partnerRows) {
        let a = mapID(rel.PersonID);
        let z = mapID(rel.PartnerPersonID);
        if (!a || !z || a === z) continue;
        if (a > z) [a, z] = [z, a];
        await c.query(
            `INSERT IGNORE INTO FTPartnerT
             (FamilyTreeID,PersonID,PartnerPersonID,RelationshipType,Notes,CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
             VALUES (?,?,?,?,?,?,?,?,?)`,
            [olderTree.FamilyTreeID,a,z,rel.RelationshipType,rel.Notes,rel.CreatedByUserID,rel.CreatedAt,rel.UpdatedByUserID,rel.UpdatedAt]
        );
    }

    const [users] = await c.query('SELECT * FROM FTFamilyTreeUserT WHERE FamilyTreeID=? ORDER BY FamilyTreeUserID', [newerTree.FamilyTreeID]);
    for (const member of users) {
        await c.query(
            `INSERT INTO FTFamilyTreeUserT
             (FamilyTreeID,UserID,JoinedAt,LastActivityAt,IsActive,AddedByUserID)
             VALUES (?,?,?,?,1,?)
             ON DUPLICATE KEY UPDATE IsActive=1,LastActivityAt=GREATEST(COALESCE(FTFamilyTreeUserT.LastActivityAt,'1900-01-01'),COALESCE(VALUES(LastActivityAt),'1900-01-01'))`,
            [olderTree.FamilyTreeID,member.UserID,member.JoinedAt,member.LastActivityAt,member.AddedByUserID]
        );
    }

    const [siblingRows] = await c.query(
        'SELECT * FROM FTSiblingT WHERE FamilyTreeID=? ORDER BY SiblingRelationshipID',
        [newerTree.FamilyTreeID]
    );
    for (const rel of siblingRows) {
        const personA = mapID(rel.PersonID);
        const personB = mapID(rel.SiblingPersonID);
        if (!personA || !personB || personA === personB) continue;

        const a = Math.min(personA, personB);
        const z = Math.max(personA, personB);

        await c.query(
            `INSERT IGNORE INTO FTSiblingT
             (FamilyTreeID,PersonID,SiblingPersonID,Notes,
              CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
             VALUES (?,?,?,?,?,?,?,?)`,
            [
                olderTree.FamilyTreeID,
                a,
                z,
                rel.Notes,
                rel.CreatedByUserID,
                rel.CreatedAt,
                rel.UpdatedByUserID,
                rel.UpdatedAt
            ]
        );
    }

    await c.query('DELETE FROM FTParentT WHERE FamilyTreeID=?', [newerTree.FamilyTreeID]);
    await c.query('DELETE FROM FTPartnerT WHERE FamilyTreeID=?', [newerTree.FamilyTreeID]);
    await c.query('DELETE FROM FTSiblingT WHERE FamilyTreeID=?', [newerTree.FamilyTreeID]);
    await c.query('DELETE FROM FTFamilyTreePersonT WHERE FamilyTreeID=?', [newerTree.FamilyTreeID]);
    await c.query('UPDATE FTFamilyTreeUserT SET IsActive=0,LastActivityAt=NOW() WHERE FamilyTreeID=?', [newerTree.FamilyTreeID]);

    for (const newerPersonID of mapping.keys()) {
        await c.query('DELETE FROM FTPersonT WHERE PersonID=?', [newerPersonID]);
    }

    await c.query(
        `UPDATE FamilyTreeT
         SET Status='Merged',MergedIntoFamilyTreeID=?,MergedAt=NOW(),MergedByUserID=?,LastActivityAt=NOW(),LastActivityByUserID=?
         WHERE FamilyTreeID=?`,
        [olderTree.FamilyTreeID,userID,userID,newerTree.FamilyTreeID]
    );

    await logActivity(
        c,
        olderTree.FamilyTreeID,
        userID,
        'MERGE',
        'FamilyTreeT',
        newerTree.FamilyTreeID,
        null,
        `OneTreeMethod merged Family Tree ${newerTree.FamilyTreeCode} into older Family Tree ${olderTree.FamilyTreeCode}`
    );

    let focalPersonID = bridge && bridge.focalPersonID ? mapID(bridge.focalPersonID) : null;
    let relatedPersonID = bridge && bridge.relatedPersonID ? mapID(bridge.relatedPersonID) : null;
    const kind = bridge ? String(bridge.relationshipKind || '').toLowerCase() : '';

    if (focalPersonID && relatedPersonID && kind && focalPersonID !== relatedPersonID) {
        await addRelationshipInTree(
            c,
            olderTree.FamilyTreeID,
            userID,
            focalPersonID,
            relatedPersonID,
            kind
        );
    }

    return {
        FamilyTreeID: olderTree.FamilyTreeID,
        FamilyTreeCode: olderTree.FamilyTreeCode,
        focalPersonID,
        relatedPersonID,
        mergedTreeCode: newerTree.FamilyTreeCode,
        mergedPersonCount: mapping.size,
        TreeMergeID: treeMergeID || null
    };
}


router.get('/tree-search', auth, async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ results: [] });
    const like = `%${q}%`;
    try {
        const [rows] = await pool.query(
            `SELECT p.PersonID,p.FirstName,p.MiddleName,p.LastName,p.SuffixName,
                    p.NickName,p.MaidenName,p.BirthDate,p.BirthPlace,
                    ft.FamilyTreeCode
               FROM FTPersonT p
               JOIN FTFamilyTreePersonT ftp ON ftp.PersonID=p.PersonID
               JOIN FamilyTreeT ft ON ft.FamilyTreeID=ftp.FamilyTreeID
              WHERE CONCAT_WS(' ',p.FirstName,p.MiddleName,p.LastName,p.NickName,
                              p.MaidenName,p.BirthPlace,IFNULL(p.BirthDate,'')) LIKE ?
              ORDER BY p.LastName,p.FirstName,p.PersonID
              LIMIT 50`,
            [like]
        );
        res.json({ results: rows });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.post('/use-existing-person', auth, async (req, res) => {
    const b = req.body || {};
    const existingPersonID = Number(b.personID);
    if (!existingPersonID) {
        return res.status(400).json({ message: 'PersonID is required.' });
    }

    try {
        const result = await withTx(async c => {
            const targetTree = await getPersonTree(c, existingPersonID);
            if (!targetTree) {
                const err = new Error('The selected person is not associated with a Family Tree.');
                err.status = 404;
                throw err;
            }

            const focal = Number(b.focalPersonID || 0);
            const kind = String(b.relationshipKind || '').toLowerCase();
            let sourceTree = null;

            if (b.familyTreeCode) {
                sourceTree = await requireTree(c, b.familyTreeCode, req.user.userId);
            } else if (focal) {
                const focalTree = await getPersonTree(c, focal);
                if (focalTree && await userHasTree(c, focalTree.FamilyTreeID, req.user.userId)) {
                    sourceTree = focalTree;
                }
            }

            if (!sourceTree) {
                const [existingTrees] = await c.query(
                    `SELECT ft.*
                     FROM FTFamilyTreeUserT ftu
                     JOIN FamilyTreeT ft ON ft.FamilyTreeID=ftu.FamilyTreeID
                     WHERE ftu.UserID=? AND ftu.IsActive=1 AND ft.Status='Active'
                       AND EXISTS (SELECT 1 FROM FTFamilyTreePersonT ftp WHERE ftp.FamilyTreeID=ft.FamilyTreeID LIMIT 1)
                     ORDER BY ft.CreatedAt,ft.FamilyTreeID
                     LIMIT 1`,
                    [req.user.userId]
                );
                sourceTree = existingTrees[0] || null;
            }

            if (!sourceTree) {
                await c.query(
                    `INSERT INTO FTFamilyTreeUserT
                     (FamilyTreeID,UserID,JoinedAt,LastActivityAt,IsActive,AddedByUserID)
                     VALUES (?,?,NOW(),NOW(),1,?)
                     ON DUPLICATE KEY UPDATE IsActive=1,LastActivityAt=NOW()`,
                    [targetTree.FamilyTreeID,req.user.userId,req.user.userId]
                );
                return {
                    PersonID: existingPersonID,
                    FamilyTreeID: targetTree.FamilyTreeID,
                    FamilyTreeCode: targetTree.FamilyTreeCode
                };
            }

            if (Number(sourceTree.FamilyTreeID) !== Number(targetTree.FamilyTreeID)) {
                const review = await oneTreeReviewNeededResponse(
                    c,
                    sourceTree,
                    targetTree,
                    {
                        bridge: {
                            focalPersonID: focal || null,
                            relatedPersonID: existingPersonID,
                            relationshipKind: kind || null
                        }
                    }
                );
                const err = new Error(review.message);
                err.status = 409;
                err.responseCode = review.code;
                err.review = review;
                throw err;
            }

            if (focal && kind) {
                await addRelationshipInTree(
                    c,
                    sourceTree.FamilyTreeID,
                    req.user.userId,
                    focal,
                    existingPersonID,
                    kind
                );
            }

            return {
                PersonID: existingPersonID,
                FamilyTreeID: sourceTree.FamilyTreeID,
                FamilyTreeCode: sourceTree.FamilyTreeCode
            };
        });

        res.json(result);
    } catch (e) {
        res.status(e.status || 500).json({
            code: e.responseCode || undefined,
            message: e.message,
            review: e.review || undefined
        });
    }
});

router.get('/health', auth, async (req, res) => {
    try {
        const [[db]] = await pool.query('SELECT DATABASE() AS db');
        const [[count]] = await pool.query('SELECT COUNT(*) AS n FROM FamilyTreeT');

        res.json({
            ok: true,
            database: db.db,
            familyTrees: count.n
        });
    } catch (e) {
        res.status(500).json({
            message: 'FamilyTree database connection failed: ' + e.message
        });
    }
});

/*
 * Return the user's current Family Tree together with any active separated
 * branches that share the same original Tree identity. This is derived from
 * database memberships and OriginFamilyTreeID, so it survives refreshes,
 * logout/login, and browser session-storage loss.
 *
 * Reading this endpoint never changes IsActive and never merges Trees.
 */
router.get('/split-view', auth, async (req, res) => {
    try {
        const c = await pool.getConnection();
        try {
            const [currentRows] = await c.query(
                `SELECT ft.FamilyTreeID,
                        ft.FamilyTreeCode,
                        ft.CreatedAt
                   FROM FTFamilyTreeUserT ftu
                   JOIN FamilyTreeT ft
                     ON ft.FamilyTreeID=ftu.FamilyTreeID
                  WHERE ftu.UserID=?
                    AND ftu.IsActive=1
                    AND ft.Status='Active'
                    AND ft.MergedIntoFamilyTreeID IS NULL
                    AND EXISTS (
                        SELECT 1
                          FROM FTFamilyTreePersonT ftp
                         WHERE ftp.FamilyTreeID=ft.FamilyTreeID
                         LIMIT 1
                    )
                  ORDER BY ft.CreatedAt ASC, ft.FamilyTreeID ASC
                  LIMIT 1`,
                [req.user.userId]
            );

            if (!currentRows.length) {
                return res.json({ trees: [], currentFamilyTreeCode: null });
            }

            const currentTree = currentRows[0];

            const [originRows] = await c.query(
                `SELECT DISTINCT
                        COALESCE(OriginFamilyTreeID, FamilyTreeID) AS OriginFamilyTreeID
                   FROM FTFamilyTreePersonT
                  WHERE FamilyTreeID=?`,
                [currentTree.FamilyTreeID]
            );

            const originIDs = [...new Set(
                originRows
                    .map(row => Number(row.OriginFamilyTreeID))
                    .filter(Boolean)
            )];

            if (!originIDs.length) {
                originIDs.push(Number(currentTree.FamilyTreeID));
            }

            const placeholders = originIDs.map(() => '?').join(',');

            const [treeRows] = await c.query(
                `SELECT DISTINCT
                        ft.FamilyTreeID,
                        ft.FamilyTreeCode,
                        ft.CreatedAt,
                        ftu.IsActive
                   FROM FTFamilyTreeUserT ftu
                   JOIN FamilyTreeT ft
                     ON ft.FamilyTreeID=ftu.FamilyTreeID
                  WHERE ftu.UserID=?
                    AND ft.Status='Active'
                    AND ft.MergedIntoFamilyTreeID IS NULL
                    AND EXISTS (
                        SELECT 1
                          FROM FTFamilyTreePersonT ftp0
                         WHERE ftp0.FamilyTreeID=ft.FamilyTreeID
                         LIMIT 1
                    )
                    AND (
                        ft.FamilyTreeID IN (${placeholders})
                        OR EXISTS (
                            SELECT 1
                              FROM FTFamilyTreePersonT ftp1
                             WHERE ftp1.FamilyTreeID=ft.FamilyTreeID
                               AND COALESCE(
                                     ftp1.OriginFamilyTreeID,
                                     ftp1.FamilyTreeID
                                   ) IN (${placeholders})
                             LIMIT 1
                        )
                    )
                  ORDER BY ft.CreatedAt ASC, ft.FamilyTreeID ASC`,
                [
                    req.user.userId,
                    ...originIDs,
                    ...originIDs
                ]
            );

            const trees = [];

            for (const tree of treeRows) {
                const [persons] = await c.query(
                    personSelectSql(`
                        JOIN FTFamilyTreePersonT ftp
                          ON ftp.PersonID=p.PersonID
                        WHERE ftp.FamilyTreeID=?
                    `) + ` ORDER BY p.LastName,p.FirstName,p.MiddleName,p.PersonID`,
                    [tree.FamilyTreeID]
                );

                trees.push({
                    FamilyTreeID: tree.FamilyTreeID,
                    FamilyTreeCode: tree.FamilyTreeCode,
                    isCurrent: Number(tree.IsActive) === 1,
                    persons
                });
            }

            res.json({
                trees,
                currentFamilyTreeCode: currentTree.FamilyTreeCode,
                originalFamilyTreeCode:
                    trees.length ? trees[0].FamilyTreeCode : currentTree.FamilyTreeCode
            });
        } finally {
            c.release();
        }
    } catch (e) {
        res.status(e.status || 500).json({ message: e.message });
    }
});

router.get('/persons', auth, async (req, res) => {
    const code = String(req.query.familyTreeCode || '').trim();
    if (!code) return res.json({ persons: [] });

    try {
        const c = await pool.getConnection();
        try {
            const tree = await requireTree(c, code, req.user.userId);
            const [rows] = await c.query(
                personSelectSql(`
                    JOIN FTFamilyTreePersonT ftp ON ftp.PersonID=p.PersonID
                    WHERE ftp.FamilyTreeID=?
                `) + ` ORDER BY p.LastName,p.FirstName,p.MiddleName,p.PersonID`,
                [tree.FamilyTreeID]
            );
            res.json({ persons: rows, FamilyTreeCode: tree.FamilyTreeCode });
        } finally {
            c.release();
        }
    } catch (e) {
        res.status(e.status || 500).json({ message: e.message });
    }
});

router.get('/persons/duplicates', auth, async (req, res) => {
    try {
        const c = await pool.getConnection();
        try {
            const matches = await findGlobalDuplicateCandidates(c, req.query || {});
            res.json({ matches });
        } finally {
            c.release();
        }
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.get('/persons/search', auth, async (req, res) => {
    try {
        const q = String(req.query.q || '').trim();

        if (!q) {
            return res.json({ results: [] });
        }

        const like = `%${q}%`;

        const [rows] = await pool.query(
            personSelectSql(`
                WHERE CONCAT_WS(
                    ' ',
                    p.FirstName,
                    p.MiddleName,
                    p.LastName,
                    p.NickName,
                    p.MaidenName,
                    p.BirthPlace,
                    IFNULL(p.BirthDate,'')
                ) LIKE ?
            `) + ' ORDER BY p.LastName,p.FirstName LIMIT 30',
            [like]
        );

        res.json({ results: rows });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.post('/persons', auth, async (req, res) => {
    const userID = req.user.userId;
    const b = req.body || {};

    if (!b.FirstName && !b.LastName) {
        return res.status(400).json({
            message: 'First Name or Last Name is required.'
        });
    }

    try {
        const result = await withTx(async c => {
            await requireDuplicateReviewOrContinue(c, b);

            let tree;
            let code = b.familyTreeCode || null;

            if (code) {
                tree = await requireTree(c, code, userID);
            } else {
                code = await createCode(c);

                const [r] = await c.query(
                    `INSERT INTO FamilyTreeT
                     (
                        FamilyTreeCode,
                        CreatedByUserID,
                        CreatedAt,
                        LastActivityAt,
                        LastActivityByUserID,
                        Status
                     )
                     VALUES (?, ?, NOW(), NOW(), ?, 'Active')`,
                    [code, userID, userID]
                );

                tree = {
                    FamilyTreeID: r.insertId,
                    FamilyTreeCode: code
                };

                await c.query(
                    `INSERT INTO FTFamilyTreeUserT
                     (
                        FamilyTreeID,
                        UserID,
                        JoinedAt,
                        LastActivityAt,
                        IsActive,
                        AddedByUserID
                     )
                     VALUES (?,?,NOW(),NOW(),1,?)`,
                    [tree.FamilyTreeID, userID, userID]
                );
            }

            const [p] = await c.query(
                `INSERT INTO FTPersonT
                 (
                    FirstName,
                    MiddleName,
                    LastName,
                    SuffixName,
                    NickName,
                    MaidenName,
                    Gender,
                    BirthDate,
                    BirthPlace,
                    CurrentCity,
                    CurrentState,
                    Died,
                    DeathDate,
                    CreatedByUserID,
                    CreatedAt,
                    UpdatedByUserID,
                    UpdatedAt
                 )
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?, ?,NOW(),NULL,NULL)`,
                [
                    b.FirstName || null,
                    b.MiddleName || null,
                    b.LastName || null,
                    b.SuffixName || null,
                    b.NickName || null,
                    b.MaidenName || null,
                    b.Gender || null,
                    b.BirthDate || null,
                    b.BirthPlace || null,
                    b.CurrentCity || null,
                    b.CurrentState || null,
                    b.Died ? 1 : 0,
                    b.DeathDate || null,
                    userID
                ]
            );

            await c.query(
                `INSERT IGNORE INTO FTFamilyTreePersonT
                 (
                    FamilyTreeID,
                    PersonID,
                    OriginFamilyTreeID,
                    AddedByUserID,
                    AddedAt,
                    Notes
                 )
                 VALUES (?,?,?,?,NOW(),NULL)`,
                [
                    tree.FamilyTreeID,
                    p.insertId,
                    tree.FamilyTreeID,
                    userID
                ]
            );

            await logActivity(
                c,
                tree.FamilyTreeID,
                userID,
                'CREATE',
                'FTPersonT',
                p.insertId,
                p.insertId,
                'Created person'
            );

            return {
                PersonID: p.insertId,
                FamilyTreeID: tree.FamilyTreeID,
                FamilyTreeCode: code
            };
        });

        res.status(201).json(result);
    } catch (e) {
        res.status(e.status || 500).json({
            code: e.responseCode || undefined,
            message: e.message,
            matches: e.matches || undefined
        });
    }
});

router.get('/persons/:id', auth, async (req, res) => {
    const id = Number(req.params.id);
    const code = String(req.query.familyTreeCode || '');

    try {
        const c = await pool.getConnection();

        try {
            const tree = await requireTree(c, code, req.user.userId);

            const [membership] = await c.query(
                `SELECT 1
                 FROM FTFamilyTreePersonT
                 WHERE FamilyTreeID=? AND PersonID=?
                 LIMIT 1`,
                [tree.FamilyTreeID, id]
            );

            if (!membership.length) {
                return res.status(404).json({
                    message: 'Person is not in this Family Tree.'
                });
            }

            const [rows] = await c.query(
                personSelectSql('WHERE p.PersonID=? LIMIT 1'),
                [id]
            );

            if (!rows.length) {
                return res.status(404).json({
                    message: 'Person not found.'
                });
            }

            res.json({
                person: rows[0],
                FamilyTreeCode: code
            });
        } finally {
            c.release();
        }
    } catch (e) {
        res.status(e.status || 500).json({ message: e.message });
    }
});


router.put('/persons/:id', auth, async (req, res) => {
    const id = Number(req.params.id);
    const userID = req.user.userId;
    const b = req.body || {};
    const code = String(b.familyTreeCode || '');

    if (!b.FirstName && !b.LastName) {
        return res.status(400).json({
            message: 'First Name or Last Name is required.'
        });
    }

    if (
        b.BirthDate &&
        b.DeathDate &&
        String(b.DeathDate) < String(b.BirthDate)
    ) {
        return res.status(400).json({
            message: 'Death Date cannot be earlier than Birth Date.'
        });
    }

    try {
        const result = await withTx(async c => {
            const tree = await requireTree(c, code, userID);

            const [member] = await c.query(
                `SELECT 1
                 FROM FTFamilyTreePersonT
                 WHERE FamilyTreeID=? AND PersonID=?
                 LIMIT 1`,
                [tree.FamilyTreeID, id]
            );

            if (!member.length) {
                const err = new Error(
                    'Person is not in this Family Tree.'
                );
                err.status = 404;
                throw err;
            }

            const [existing] = await c.query(
                `SELECT *
                 FROM FTPersonT
                 WHERE PersonID=?
                 LIMIT 1`,
                [id]
            );

            if (!existing.length) {
                const err = new Error('Person not found.');
                err.status = 404;
                throw err;
            }

            const before = existing[0];
            const originalCreatorUserID =
                before.CreatedByUserID;

            const changes = describePersonChanges(before, b);
            if (!changes.length) {
                return {
                    message: 'No person changes were detected.',
                    pendingEmails: []
                };
            }

            await c.query(
                `UPDATE FTPersonT
                 SET FirstName=?,
                     MiddleName=?,
                     LastName=?,
                     SuffixName=?,
                     NickName=?,
                     MaidenName=?,
                     Gender=?,
                     BirthDate=?,
                     BirthPlace=?,
                     CurrentCity=?,
                     CurrentState=?,
                     Died=?,
                     DeathDate=?,
                     UpdatedByUserID=?,
                     UpdatedAt=NOW()
                 WHERE PersonID=?`,
                [
                    b.FirstName || null,
                    b.MiddleName || null,
                    b.LastName || null,
                    b.SuffixName || null,
                    b.NickName || null,
                    b.MaidenName || null,
                    b.Gender || null,
                    b.BirthDate || null,
                    b.BirthPlace || null,
                    b.CurrentCity || null,
                    b.CurrentState || null,
                    b.Died ? 1 : 0,
                    b.Died
                        ? (b.DeathDate || null)
                        : null,
                    userID,
                    id
                ]
            );

            const activityID = await logActivity(
                c,
                tree.FamilyTreeID,
                userID,
                'EDIT',
                'FTPersonT',
                id,
                id,
                'Edited person',
                originalCreatorUserID
            );

            const recipients =
                await getEditNotificationRecipients(
                    c,
                    id,
                    originalCreatorUserID,
                    userID
                );

            const actor =
                await getNotificationUser(c, userID);

            const personName =
                familyTreePersonName(before);

            const actorName = actor
                ? actor.UserName
                : `UserID ${userID}`;

            const subject =
                `FamilyTree: ${personName} was edited`;

            const message =
                `${personName} was edited.\n\n` +
                `What changed:\n- ${changes.join('\n- ')}\n\n` +
                `Changed by: ${actorName}\n` +
                `Date/Time: ${new Date().toISOString()}\n` +
                `FamilyTreeCode: ${tree.FamilyTreeCode}`;

            const pendingEmails =
                await createNotificationRecords(
                    c,
                    {
                        treeID: tree.FamilyTreeID,
                        activityID,
                        notificationType: 'Person Edited',
                        subject,
                        message,
                        recipients,
                        relatedRecordID: id
                    }
                );

            return {
                message: 'Person changes saved.',
                pendingEmails
            };
        });

        await sendPendingFamilyTreeNotifications(
            result.pendingEmails
        );

        delete result.pendingEmails;

        res.json(result);
    } catch (e) {
        res.status(e.status || 500).json({
            message: e.message
        });
    }
});


/* ============================================================================
   ANCESTOR DISPLAY
   ============================================================================ */

router.get('/persons/:id/ancestor', auth, async (req, res) => {
    const id = Number(req.params.id);
    const code = String(req.query.familyTreeCode || '');
    const requestedGeneration = Number(req.query.cousinGeneration || 1);
    const cousinGeneration = Number.isInteger(requestedGeneration)
        ? Math.min(6, Math.max(1, requestedGeneration))
        : 1;

    try {
        const c = await pool.getConnection();

        try {
            const tree = await requireTree(
                c,
                code,
                req.user.userId
            );

            const [people] = await c.query(
                `SELECT
                    p.PersonID,
                    p.FirstName,
                    p.MiddleName,
                    p.LastName,
                    p.SuffixName,
                    p.NickName,
                    p.MaidenName,
                    p.Gender,
                    p.BirthDate,
                    p.Died,
                    p.DeathDate,
                    p.CurrentCity,
                    p.CurrentState,
                    (
                        SELECT i.StorageKey
                          FROM FTImageT i
                         WHERE i.PersonID=p.PersonID
                           AND i.ImageType='Profile'
                         ORDER BY i.ImageID
                         LIMIT 1
                    ) AS ProfileImageUrl
                  FROM FTPersonT p
                  JOIN FTFamilyTreePersonT ftp
                    ON ftp.PersonID=p.PersonID
                 WHERE ftp.FamilyTreeID=?`,
                [tree.FamilyTreeID]
            );

            const personByID = new Map(
                people.map(person => [Number(person.PersonID), person])
            );

            if (!personByID.has(id)) {
                return res.status(404).json({
                    message: 'Person is not in this Family Tree.'
                });
            }

            const [parentEdges] = await c.query(
                `SELECT r.PersonID,
                        r.ParentPersonID,
                        COALESCE(
                            r.AncestrySide,
                            CASE
                                WHEN LOWER(TRIM(p.Gender))='female' THEN 'Mother'
                                WHEN LOWER(TRIM(p.Gender))='male' THEN 'Father'
                                ELSE NULL
                            END
                        ) AS AncestrySide
                   FROM FTParentT r
                   JOIN FTPersonT p ON p.PersonID=r.ParentPersonID
                  WHERE r.FamilyTreeID=?
                    AND COALESCE(r.ParentType,'Parent')<>'Adopted'`,
                [tree.FamilyTreeID]
            );

            const [partnerEdges] = await c.query(
                `SELECT PersonID, PartnerPersonID
                   FROM FTPartnerT
                  WHERE FamilyTreeID=?`,
                [tree.FamilyTreeID]
            );

            const [explicitSiblingEdges] = await c.query(
                `SELECT PersonID, SiblingPersonID
                   FROM FTSiblingT
                  WHERE FamilyTreeID=?`,
                [tree.FamilyTreeID]
            );

            const parentByChild = new Map();
            const childrenByParent = new Map();

            for (const edge of parentEdges) {
                const childID = Number(edge.PersonID);
                const parentID = Number(edge.ParentPersonID);

                if (!parentByChild.has(childID)) {
                    parentByChild.set(childID, []);
                }

                parentByChild.get(childID).push({
                    parentID,
                    side: edge.AncestrySide || null
                });

                if (!childrenByParent.has(parentID)) {
                    childrenByParent.set(parentID, new Set());
                }

                childrenByParent.get(parentID).add(childID);
            }

            function uniqueIDs(values) {
                return [...new Set(values.map(Number).filter(Boolean))];
            }

            function peopleForIDs(ids) {
                return uniqueIDs(ids)
                    .map(personID => personByID.get(personID))
                    .filter(Boolean)
                    .sort((a, b) => {
                        const dateA = a.BirthDate
                            ? String(a.BirthDate).slice(0, 10)
                            : '9999-99-99';
                        const dateB = b.BirthDate
                            ? String(b.BirthDate).slice(0, 10)
                            : '9999-99-99';

                        return dateA.localeCompare(dateB) ||
                            String(a.LastName || '').localeCompare(String(b.LastName || '')) ||
                            String(a.FirstName || '').localeCompare(String(b.FirstName || '')) ||
                            Number(a.PersonID) - Number(b.PersonID);
                    });
            }

            function parentIDFor(childID, side) {
                const edge = (parentByChild.get(Number(childID)) || [])
                    .find(item => item.side === side);

                return edge ? edge.parentID : null;
            }

            const motherID = parentIDFor(id, 'Mother');
            const fatherID = parentIDFor(id, 'Father');

            const maternalGrandmotherID = motherID
                ? parentIDFor(motherID, 'Mother')
                : null;
            const maternalGrandfatherID = motherID
                ? parentIDFor(motherID, 'Father')
                : null;
            const paternalGrandmotherID = fatherID
                ? parentIDFor(fatherID, 'Mother')
                : null;
            const paternalGrandfatherID = fatherID
                ? parentIDFor(fatherID, 'Father')
                : null;

            const maternalGrandmotherMotherID = maternalGrandmotherID ? parentIDFor(maternalGrandmotherID, 'Mother') : null;
            const maternalGrandmotherFatherID = maternalGrandmotherID ? parentIDFor(maternalGrandmotherID, 'Father') : null;
            const maternalGrandfatherMotherID = maternalGrandfatherID ? parentIDFor(maternalGrandfatherID, 'Mother') : null;
            const maternalGrandfatherFatherID = maternalGrandfatherID ? parentIDFor(maternalGrandfatherID, 'Father') : null;
            const paternalGrandmotherMotherID = paternalGrandmotherID ? parentIDFor(paternalGrandmotherID, 'Mother') : null;
            const paternalGrandmotherFatherID = paternalGrandmotherID ? parentIDFor(paternalGrandmotherID, 'Father') : null;
            const paternalGrandfatherMotherID = paternalGrandfatherID ? parentIDFor(paternalGrandfatherID, 'Mother') : null;
            const paternalGrandfatherFatherID = paternalGrandfatherID ? parentIDFor(paternalGrandfatherID, 'Father') : null;

            const childIDs = uniqueIDs(
                [...(childrenByParent.get(id) || [])]
            );

            const partnerIDs = [];
            for (const edge of partnerEdges) {
                const a = Number(edge.PersonID);
                const b = Number(edge.PartnerPersonID);

                if (a === id) partnerIDs.push(b);
                if (b === id) partnerIDs.push(a);
            }

            const grandchildIDs = [];
            for (const childID of childIDs) {
                grandchildIDs.push(
                    ...(childrenByParent.get(childID) || [])
                );
            }

            /*
             * Biological siblings come from either:
             * 1) a shared recorded biological parent; or
             * 2) an explicit biological sibling relationship in FTSiblingT.
             * This allows siblings to be recorded even when their parents
             * are not yet known.
             */
            const siblingIDs = new Set();
            for (const parent of parentByChild.get(id) || []) {
                for (const siblingID of childrenByParent.get(parent.parentID) || []) {
                    if (Number(siblingID) !== id) {
                        siblingIDs.add(Number(siblingID));
                    }
                }
            }

            for (const edge of explicitSiblingEdges) {
                const a = Number(edge.PersonID);
                const b = Number(edge.SiblingPersonID);
                if (a === id && b !== id) siblingIDs.add(b);
                if (b === id && a !== id) siblingIDs.add(a);
            }

            const nephewNieceIDs = [];
            for (const siblingID of siblingIDs) {
                nephewNieceIDs.push(
                    ...(childrenByParent.get(siblingID) || [])
                );
            }

            function ancestorDepths(startID, maxDepth) {
                const depths = new Map();
                let frontier = [Number(startID)];

                for (let depth = 1; depth <= maxDepth; depth++) {
                    const next = [];

                    for (const childID of frontier) {
                        for (const parent of parentByChild.get(childID) || []) {
                            const previous = depths.get(parent.parentID);

                            if (previous == null || depth < previous) {
                                depths.set(parent.parentID, depth);
                                next.push(parent.parentID);
                            }
                        }
                    }

                    frontier = uniqueIDs(next);
                    if (!frontier.length) break;
                }

                return depths;
            }

            const neededDepth = cousinGeneration + 1;
            const focalAncestors = ancestorDepths(id, neededDepth);
            const cousinIDs = [];

            for (const candidate of people) {
                const candidateID = Number(candidate.PersonID);
                if (candidateID === id) continue;

                const candidateAncestors = ancestorDepths(
                    candidateID,
                    neededDepth
                );

                let nearestEqualSharedDepth = null;

                for (const [ancestorID, depth] of focalAncestors) {
                    if (candidateAncestors.get(ancestorID) === depth) {
                        if (
                            nearestEqualSharedDepth == null ||
                            depth < nearestEqualSharedDepth
                        ) {
                            nearestEqualSharedDepth = depth;
                        }
                    }
                }

                if (nearestEqualSharedDepth === neededDepth) {
                    cousinIDs.push(candidateID);
                }
            }

            const signedCache = new Map();

            async function signedPerson(person) {
                if (!person) return null;

                const key = Number(person.PersonID);
                if (!signedCache.has(key)) {
                    signedCache.set(
                        key,
                        await withSignedProfileImage(person)
                    );
                }

                return signedCache.get(key);
            }

            async function signedPeople(list) {
                return Promise.all(list.map(signedPerson));
            }

            const [
                signedPersonRow,
                signedMother,
                signedFather,
                signedMaternalGrandmother,
                signedMaternalGrandfather,
                signedPaternalGrandmother,
                signedPaternalGrandfather,
                signedMaternalGrandmotherMother,
                signedMaternalGrandmotherFather,
                signedMaternalGrandfatherMother,
                signedMaternalGrandfatherFather,
                signedPaternalGrandmotherMother,
                signedPaternalGrandmotherFather,
                signedPaternalGrandfatherMother,
                signedPaternalGrandfatherFather,
                signedSiblings,
                signedPartners,
                signedChildren,
                signedGrandchildren,
                signedNephewsNieces,
                signedCousins
            ] = await Promise.all([
                signedPerson(personByID.get(id)),
                signedPerson(personByID.get(motherID)),
                signedPerson(personByID.get(fatherID)),
                signedPerson(personByID.get(maternalGrandmotherID)),
                signedPerson(personByID.get(maternalGrandfatherID)),
                signedPerson(personByID.get(paternalGrandmotherID)),
                signedPerson(personByID.get(paternalGrandfatherID)),
                signedPerson(personByID.get(maternalGrandmotherMotherID)),
                signedPerson(personByID.get(maternalGrandmotherFatherID)),
                signedPerson(personByID.get(maternalGrandfatherMotherID)),
                signedPerson(personByID.get(maternalGrandfatherFatherID)),
                signedPerson(personByID.get(paternalGrandmotherMotherID)),
                signedPerson(personByID.get(paternalGrandmotherFatherID)),
                signedPerson(personByID.get(paternalGrandfatherMotherID)),
                signedPerson(personByID.get(paternalGrandfatherFatherID)),
                signedPeople(peopleForIDs([...siblingIDs])),
                signedPeople(peopleForIDs(partnerIDs)),
                signedPeople(peopleForIDs(childIDs)),
                signedPeople(peopleForIDs(grandchildIDs)),
                signedPeople(peopleForIDs(nephewNieceIDs)),
                signedPeople(peopleForIDs(cousinIDs))
            ]);

            res.json({
                FamilyTreeCode: tree.FamilyTreeCode,
                cousinGeneration,
                person: signedPersonRow,
                mother: signedMother,
                father: signedFather,
                maternalGrandmother: signedMaternalGrandmother,
                maternalGrandfather: signedMaternalGrandfather,
                paternalGrandmother: signedPaternalGrandmother,
                paternalGrandfather: signedPaternalGrandfather,
                maternalGrandmotherMother: signedMaternalGrandmotherMother,
                maternalGrandmotherFather: signedMaternalGrandmotherFather,
                maternalGrandfatherMother: signedMaternalGrandfatherMother,
                maternalGrandfatherFather: signedMaternalGrandfatherFather,
                paternalGrandmotherMother: signedPaternalGrandmotherMother,
                paternalGrandmotherFather: signedPaternalGrandmotherFather,
                paternalGrandfatherMother: signedPaternalGrandfatherMother,
                paternalGrandfatherFather: signedPaternalGrandfatherFather,
                siblings: signedSiblings,
                partners: signedPartners,
                children: signedChildren,
                grandchildren: signedGrandchildren,
                nephewsNieces: signedNephewsNieces,
                cousins: signedCousins
            });
        } finally {
            c.release();
        }
    } catch (e) {
        res.status(e.status || 500).json({
            message: e.message
        });
    }
});

router.get('/persons/:id/relationships', auth, async (req, res) => {
    const id = Number(req.params.id);
    const code = String(req.query.familyTreeCode || '');

    try {
        const c = await pool.getConnection();

        try {
            const tree = await requireTree(c, code, req.user.userId);
            const tid = tree.FamilyTreeID;

            const base = `
                p.PersonID,
                p.FirstName,
                p.MiddleName,
                p.LastName,
                p.SuffixName,
                p.NickName,
                p.MaidenName,
                p.Gender,
                p.BirthDate,
                p.Died,
                p.DeathDate
            `;

            const [parents] = await c.query(
                `SELECT ${base},
                        COALESCE(
                            r.AncestrySide,
                            CASE
                                WHEN LOWER(TRIM(p.Gender))='female' THEN 'Mother'
                                WHEN LOWER(TRIM(p.Gender))='male' THEN 'Father'
                                ELSE NULL
                            END
                        ) AS AncestrySide,
                        r.ParentType
                 FROM FTParentT r
                 JOIN FTPersonT p
                   ON p.PersonID = r.ParentPersonID
                 WHERE r.FamilyTreeID=?
                   AND r.PersonID=?
                   AND COALESCE(r.ParentType,'Parent')<>'Adopted'
                 ORDER BY AncestrySide,p.LastName,p.FirstName`,
                [tid, id]
            );

            const [children] = await c.query(
                `SELECT ${base},
                        r.ParentType
                 FROM FTParentT r
                 JOIN FTPersonT p
                   ON p.PersonID = r.PersonID
                 WHERE r.FamilyTreeID=?
                   AND r.ParentPersonID=?
                   AND COALESCE(r.ParentType,'Parent')<>'Adopted'
                 ORDER BY p.LastName,p.FirstName`,
                [tid, id]
            );

            const [derivedSiblings] = await c.query(
                `SELECT DISTINCT ${base}
                 FROM FTParentT focalParent
                 JOIN FTParentT siblingParent
                   ON siblingParent.FamilyTreeID=focalParent.FamilyTreeID
                  AND siblingParent.ParentPersonID=focalParent.ParentPersonID
                  AND siblingParent.PersonID<>focalParent.PersonID
                 JOIN FTPersonT p
                   ON p.PersonID=siblingParent.PersonID
                 WHERE focalParent.FamilyTreeID=?
                   AND focalParent.PersonID=?
                   AND COALESCE(focalParent.ParentType,'Parent')<>'Adopted'
                   AND COALESCE(siblingParent.ParentType,'Parent')<>'Adopted'
                 ORDER BY p.LastName,p.FirstName,p.PersonID`,
                [tid, id]
            );

            const [explicitSiblings] = await c.query(
                `SELECT ${base}
                 FROM FTSiblingT r
                 JOIN FTPersonT p
                   ON p.PersonID=IF(r.PersonID=?,r.SiblingPersonID,r.PersonID)
                 WHERE r.FamilyTreeID=?
                   AND (r.PersonID=? OR r.SiblingPersonID=?)
                 ORDER BY p.LastName,p.FirstName,p.PersonID`,
                [id, tid, id, id]
            );

            const siblingMap = new Map();
            [...derivedSiblings, ...explicitSiblings].forEach(person => {
                siblingMap.set(Number(person.PersonID), person);
            });

            const siblings = [...siblingMap.values()].sort((a, b) =>
                String(a.LastName || '').localeCompare(String(b.LastName || '')) ||
                String(a.FirstName || '').localeCompare(String(b.FirstName || '')) ||
                Number(a.PersonID) - Number(b.PersonID)
            );

            const signedSiblings = await Promise.all(
                siblings.map(person => withSignedProfileImage(person))
            );

            const [partners] = await c.query(
                `SELECT ${base}
                 FROM FTPartnerT r
                 JOIN FTPersonT p
                   ON p.PersonID=IF(r.PersonID=?,r.PartnerPersonID,r.PersonID)
                 WHERE r.FamilyTreeID=?
                   AND (r.PersonID=? OR r.PartnerPersonID=?)
                 ORDER BY p.LastName,p.FirstName`,
                [id, tid, id, id]
            );

            res.json({
                mother: parents.filter(x => x.AncestrySide === 'Mother'),
                father: parents.filter(x => x.AncestrySide === 'Father'),
                parents,
                siblings: signedSiblings,
                children,
                partners
            });
        } finally {
            c.release();
        }
    } catch (e) {
        res.status(e.status || 500).json({ message: e.message });
    }
});

router.post('/relationships', auth, async (req, res) => {
    const userID = req.user.userId;
    const b = req.body || {};
    const focal = Number(b.focalPersonID);
    const related = Number(b.relatedPersonID);
    const kind = String(b.relationshipKind || '').toLowerCase();

    if (!focal || !related || focal === related) {
        return res.status(400).json({
            message: 'Two different people are required.'
        });
    }

    try {
        await withTx(async c => {
            const tree = await requireTree(c, b.familyTreeCode, userID);
            const tid = tree.FamilyTreeID;

            const [persons] = await c.query(
                'SELECT PersonID FROM FTPersonT WHERE PersonID IN (?,?)',
                [focal, related]
            );

            if (persons.length !== 2) {
                const e = new Error('Person not found.');
                e.status = 404;
                throw e;
            }

            await c.query(
                `INSERT IGNORE INTO FTFamilyTreePersonT
                 (
                    FamilyTreeID,
                    PersonID,
                    OriginFamilyTreeID,
                    AddedByUserID,
                    AddedAt,
                    Notes
                 )
                 VALUES (?,?,?,?,NOW(),NULL)`,
                [tid, related, tid, userID]
            );

            if (kind === 'mother' || kind === 'father') {
                const side = kind === 'mother' ? 'Mother' : 'Father';

                await c.query(
                    `DELETE FROM FTParentT
                     WHERE FamilyTreeID=?
                       AND PersonID=?
                       AND AncestrySide=?`,
                    [tid, focal, side]
                );

                await c.query(
                    `INSERT INTO FTParentT
                     (
                        FamilyTreeID,
                        PersonID,
                        ParentPersonID,
                        ParentType,
                        AncestrySide,
                        Notes,
                        CreatedByUserID,
                        CreatedAt,
                        UpdatedByUserID,
                        UpdatedAt
                     )
                     VALUES (?,?,?,'Parent',?,NULL,?,NOW(),NULL,NULL)`,
                    [tid, focal, related, side, userID]
                );
            } else if (kind === 'child') {
                await addParentLink(
                    c,
                    tid,
                    userID,
                    related,
                    focal
                );
            } else if (kind === 'sibling') {
                await addSiblingLink(
                    c,
                    tid,
                    userID,
                    focal,
                    related
                );
            } else if (kind === 'partner') {
                const a = Math.min(focal, related);
                const z = Math.max(focal, related);

                await c.query(
                    `INSERT INTO FTPartnerT
                     (
                        FamilyTreeID,
                        PersonID,
                        PartnerPersonID,
                        RelationshipType,
                        Notes,
                        CreatedByUserID,
                        CreatedAt,
                        UpdatedByUserID,
                        UpdatedAt
                     )
                     VALUES (?,?,?,NULL,NULL,?,NOW(),NULL,NULL)`,
                    [tid, a, z, userID]
                );
            } else {
                const e = new Error('Unsupported relationship type.');
                e.status = 400;
                throw e;
            }

            await logActivity(
                c,
                tid,
                userID,
                'ADD_RELATIONSHIP',
                kind,
                null,
                focal,
                `Added ${kind} relationship`
            );
        });

        res.status(201).json({
            message: 'Relationship saved.'
        });
    } catch (e) {
        if (e && e.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'That relationship already exists.'
            });
        }

        res.status(e.status || 500).json({
            message: e.message
        });
    }
});


router.post('/related-person', auth, async (req, res) => {
    const userID = req.user.userId;
    const b = req.body || {};
    const focal = Number(b.focalPersonID);
    const kind = String(b.relationshipKind || '').toLowerCase();

    if (!focal || !kind) {
        return res.status(400).json({ message: 'Focal person and relationship type are required.' });
    }
    if (!b.FirstName && !b.LastName) {
        return res.status(400).json({ message: 'First Name or Last Name is required.' });
    }

    try {
        const result = await withTx(async c => {
            await requireDuplicateReviewOrContinue(c, b);

            const tree = await requireTree(c, b.familyTreeCode, userID);
            const tid = tree.FamilyTreeID;

            const [personResult] = await c.query(
                `INSERT INTO FTPersonT
                 (FirstName,MiddleName,LastName,SuffixName,NickName,MaidenName,Gender,BirthDate,BirthPlace,CurrentCity,CurrentState,Died,DeathDate,
                  CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NULL,NULL)`,
                [
                    b.FirstName || null,
                    b.MiddleName || null,
                    b.LastName || null,
                    b.SuffixName || null,
                    b.NickName || null,
                    b.MaidenName || null,
                    b.Gender || null,
                    b.BirthDate || null,
                    b.BirthPlace || null,
                    b.CurrentCity || null,
                    b.CurrentState || null,
                    b.Died ? 1 : 0,
                    b.Died ? (b.DeathDate || null) : null,
                    userID
                ]
            );

            const related = personResult.insertId;

            await c.query(
                `INSERT INTO FTFamilyTreePersonT
                 (
                    FamilyTreeID,
                    PersonID,
                    OriginFamilyTreeID,
                    AddedByUserID,
                    AddedAt,
                    Notes
                 )
                 VALUES (?,?,?,?,NOW(),NULL)`,
                [tid, related, tid, userID]
            );

            if (kind === 'mother' || kind === 'father') {
                const side = kind === 'mother' ? 'Mother' : 'Father';
                await c.query(
                    `DELETE FROM FTParentT
                     WHERE FamilyTreeID=? AND PersonID=? AND AncestrySide=?`,
                    [tid, focal, side]
                );
                await c.query(
                    `INSERT INTO FTParentT
                     (FamilyTreeID,PersonID,ParentPersonID,ParentType,AncestrySide,Notes,CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
                     VALUES (?,?,?,'Parent',?,NULL,?,NOW(),NULL,NULL)`,
                    [tid, focal, related, side, userID]
                );
            } else if (kind === 'child') {
                await addParentLink(
                    c,
                    tid,
                    userID,
                    related,
                    focal
                );
            } else if (kind === 'sibling') {
                await addSiblingLink(
                    c,
                    tid,
                    userID,
                    focal,
                    related
                );
            } else if (kind === 'partner') {
                const a = Math.min(focal, related);
                const z = Math.max(focal, related);
                await c.query(
                    `INSERT INTO FTPartnerT
                     (FamilyTreeID,PersonID,PartnerPersonID,RelationshipType,Notes,CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
                     VALUES (?,?,?,NULL,NULL,?,NOW(),NULL,NULL)`,
                    [tid, a, z, userID]
                );
            } else {
                const e = new Error('Unsupported relationship type.');
                e.status = 400;
                throw e;
            }

            await logActivity(
                c, tid, userID, 'CREATE', 'FTPersonT', related, related,
                `Created related person as ${kind}`
            );

            return { PersonID: related, FamilyTreeCode: tree.FamilyTreeCode };
        });

        res.status(201).json(result);
    } catch (e) {
        res.status(e.status || 500).json({ code: e.responseCode || undefined, message: e.message, matches: e.matches || undefined });
    }
});



router.post('/siblings/:siblingID/shared-parents', auth, async (req, res) => {
    const siblingID = Number(req.params.siblingID);
    const userID = req.user.userId;
    const b = req.body || {};
    const focalPersonID = Number(b.focalPersonID);
    const parentPersonIDs = [...new Set(
        (Array.isArray(b.parentPersonIDs) ? b.parentPersonIDs : [])
            .map(Number)
            .filter(Boolean)
    )];

    if (!siblingID || !focalPersonID) {
        return res.status(400).json({ message: 'Sibling and focal Person are required.' });
    }

    try {
        await withTx(async c => {
            const tree = await requireTree(c, b.familyTreeCode, userID);
            const tid = tree.FamilyTreeID;
            const siblingIDs = new Set(await biologicalSiblingIDs(c, tid, focalPersonID));

            if (!siblingIDs.has(siblingID)) {
                const err = new Error('The selected Person is not a biological sibling of the focal Person.');
                err.status = 409;
                throw err;
            }

            const [focalParents] = await c.query(
                `SELECT ParentPersonID,AncestrySide
                 FROM FTParentT
                 WHERE FamilyTreeID=?
                   AND PersonID=?
                   AND COALESCE(ParentType,'Parent')<>'Adopted'`,
                [tid, focalPersonID]
            );

            const allowed = new Map(
                focalParents.map(row => [
                    Number(row.ParentPersonID),
                    row.AncestrySide || null
                ])
            );

            for (const parentPersonID of parentPersonIDs) {
                if (!allowed.has(parentPersonID)) {
                    const err = new Error('A selected Person is not a recorded biological parent of the focal Person.');
                    err.status = 409;
                    throw err;
                }

                await addConfirmedParentLink(
                    c,
                    tid,
                    userID,
                    siblingID,
                    parentPersonID,
                    allowed.get(parentPersonID)
                );
            }

            await logActivity(
                c,
                tid,
                userID,
                'ADD_RELATIONSHIP',
                'shared-parent',
                null,
                siblingID,
                `Confirmed ${parentPersonIDs.length} shared biological parent relationship(s) for sibling PersonID ${siblingID}`
            );
        });

        res.json({ message: 'Selected biological parent relationship(s) saved.' });
    } catch (e) {
        res.status(e.status || 500).json({ message: e.message });
    }
});

router.post('/parents/:parentID/shared-siblings', auth, async (req, res) => {
    const parentID = Number(req.params.parentID);
    const userID = req.user.userId;
    const b = req.body || {};
    const focalPersonID = Number(b.focalPersonID);
    const siblingPersonIDs = [...new Set(
        (Array.isArray(b.siblingPersonIDs) ? b.siblingPersonIDs : [])
            .map(Number)
            .filter(Boolean)
    )];

    if (!parentID || !focalPersonID) {
        return res.status(400).json({ message: 'Parent and focal Person are required.' });
    }

    try {
        await withTx(async c => {
            const tree = await requireTree(c, b.familyTreeCode, userID);
            const tid = tree.FamilyTreeID;

            const [parentRows] = await c.query(
                `SELECT ParentPersonID,AncestrySide
                 FROM FTParentT
                 WHERE FamilyTreeID=?
                   AND PersonID=?
                   AND ParentPersonID=?
                   AND COALESCE(ParentType,'Parent')<>'Adopted'
                 LIMIT 1`,
                [tid, focalPersonID, parentID]
            );

            if (!parentRows.length) {
                const err = new Error('That Person is not a recorded biological parent of the focal Person.');
                err.status = 409;
                throw err;
            }

            const validSiblings = new Set(
                await biologicalSiblingIDs(c, tid, focalPersonID)
            );

            for (const siblingPersonID of siblingPersonIDs) {
                if (!validSiblings.has(siblingPersonID)) {
                    const err = new Error('A selected Person is not a biological sibling of the focal Person.');
                    err.status = 409;
                    throw err;
                }

                await addConfirmedParentLink(
                    c,
                    tid,
                    userID,
                    siblingPersonID,
                    parentID,
                    parentRows[0].AncestrySide || null
                );
            }

            await logActivity(
                c,
                tid,
                userID,
                'ADD_RELATIONSHIP',
                'parent-to-siblings',
                null,
                focalPersonID,
                `Confirmed biological parent PersonID ${parentID} for ${siblingPersonIDs.length} sibling(s)`
            );
        });

        res.json({ message: 'Selected sibling parent relationship(s) saved.' });
    } catch (e) {
        res.status(e.status || 500).json({ message: e.message });
    }
});

router.post('/children/:childID/partner-parent', auth, async (req, res) => {
    const childID = Number(req.params.childID);
    const userID = req.user.userId;
    const b = req.body || {};
    const focalPersonID = Number(b.focalPersonID);
    const partnerPersonID = Number(b.partnerPersonID);

    if (!childID || !focalPersonID || !partnerPersonID) {
        return res.status(400).json({ message: 'Child, focal person, and partner are required.' });
    }

    try {
        const result = await withTx(async c => {
            const tree = await requireTree(c, b.familyTreeCode, userID);
            const tid = tree.FamilyTreeID;
            const a = Math.min(focalPersonID, partnerPersonID);
            const z = Math.max(focalPersonID, partnerPersonID);

            const [partnerRows] = await c.query(
                `SELECT 1 FROM FTPartnerT
                 WHERE FamilyTreeID=? AND PersonID=? AND PartnerPersonID=?
                 LIMIT 1`,
                [tid, a, z]
            );
            if (!partnerRows.length) {
                const err = new Error("The selected person is not recorded as this Person's partner.");
                err.status = 400;
                throw err;
            }

            const [members] = await c.query(
                `SELECT PersonID FROM FTFamilyTreePersonT
                 WHERE FamilyTreeID=? AND PersonID IN (?,?)`,
                [tid, childID, partnerPersonID]
            );
            if (members.length !== 2) {
                const err = new Error('Child or partner is not in this Family Tree.');
                err.status = 404;
                throw err;
            }

            await addParentLink(c, tid, userID, childID, partnerPersonID);
            await logActivity(
                c, tid, userID, 'ADD_RELATIONSHIP', 'parent', null, childID,
                `Added Partner PersonID ${partnerPersonID} as a biological parent of Child PersonID ${childID}`
            );

            return { message: 'Partner added as a biological parent of the child.' };
        });
        res.status(201).json(result);
    } catch (e) {
        res.status(e.status || 500).json({ message: e.message });
    }
});

/* ============================================================================
   CONTACTS
   ============================================================================ */
router.get('/persons/:id/contacts', auth, async (req, res) => {
    const id = Number(req.params.id);
    const code = String(req.query.familyTreeCode || '');
    try {
        const c = await pool.getConnection();
        try {
            const tree = await requireTree(c, code, req.user.userId);
            const [member] = await c.query(
                `SELECT 1 FROM FTFamilyTreePersonT WHERE FamilyTreeID=? AND PersonID=? LIMIT 1`,
                [tree.FamilyTreeID, id]
            );
            if (!member.length) return res.status(404).json({ message: 'Person is not in this Family Tree.' });
            const [rows] = await c.query(
                `SELECT ContactID,PersonID,ContactType,ContactValue,ContactNote,IsPrimary
                   FROM FTContactT WHERE PersonID=?
                  ORDER BY ContactType,ContactValue,ContactID`,
                [id]
            );
            res.json({ contacts: rows });
        } finally { c.release(); }
    } catch (e) { res.status(e.status || 500).json({ message: e.message }); }
});

router.post('/persons/:id/contacts', auth, async (req, res) => {
    const id = Number(req.params.id), userID = req.user.userId, b = req.body || {};
    if (!b.ContactType) return res.status(400).json({ message: 'Contact Type is required.' });
    if (!b.ContactValue) return res.status(400).json({ message: 'Contact Value is required.' });
    try {
        const result = await withTx(async c => {
            const tree = await requireTree(c, b.familyTreeCode, userID);
            const [member] = await c.query(`SELECT 1 FROM FTFamilyTreePersonT WHERE FamilyTreeID=? AND PersonID=? LIMIT 1`, [tree.FamilyTreeID, id]);
            if (!member.length) { const e=new Error('Person is not in this Family Tree.'); e.status=404; throw e; }
            if (b.IsPrimary) {
                await c.query(`UPDATE FTContactT SET IsPrimary=0,UpdatedByUserID=?,UpdatedAt=NOW() WHERE PersonID=? AND ContactType=?`, [userID,id,b.ContactType]);
            }
            const [r] = await c.query(
                `INSERT INTO FTContactT(PersonID,ContactType,ContactValue,ContactNote,IsPrimary,CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
                 VALUES(?,?,?,?,?,?,NOW(),NULL,NULL)`,
                [id,b.ContactType,b.ContactValue,b.ContactNote||null,b.IsPrimary?1:0,userID]
            );
            await logActivity(c,tree.FamilyTreeID,userID,'CREATE','FTContactT',r.insertId,id,`Added ${b.ContactType} contact`);
            return { ContactID:r.insertId, message:'Contact saved.' };
        });
        res.status(201).json(result);
    } catch (e) { res.status(e.status || 500).json({ message:e.message }); }
});

router.put('/persons/:id/contacts/:contactID', auth, async (req, res) => {
    const id=Number(req.params.id), contactID=Number(req.params.contactID), userID=req.user.userId, b=req.body||{};
    if (!b.ContactType) return res.status(400).json({ message:'Contact Type is required.' });
    if (!b.ContactValue) return res.status(400).json({ message:'Contact Value is required.' });
    try {
        const result=await withTx(async c=>{
            const tree=await requireTree(c,b.familyTreeCode,userID);
            const [existing]=await c.query(`SELECT ContactID FROM FTContactT WHERE ContactID=? AND PersonID=? LIMIT 1`,[contactID,id]);
            if(!existing.length){const e=new Error('Contact not found.');e.status=404;throw e;}
            if(b.IsPrimary){
                await c.query(`UPDATE FTContactT SET IsPrimary=0,UpdatedByUserID=?,UpdatedAt=NOW() WHERE PersonID=? AND ContactType=? AND ContactID<>?`,[userID,id,b.ContactType,contactID]);
            }
            await c.query(`UPDATE FTContactT SET ContactType=?,ContactValue=?,ContactNote=?,IsPrimary=?,UpdatedByUserID=?,UpdatedAt=NOW() WHERE ContactID=? AND PersonID=?`,[b.ContactType,b.ContactValue,b.ContactNote||null,b.IsPrimary?1:0,userID,contactID,id]);
            await logActivity(c,tree.FamilyTreeID,userID,'EDIT','FTContactT',contactID,id,`Edited ${b.ContactType} contact`);
            return { message:'Contact changes saved.' };
        });
        res.json(result);
    } catch(e){res.status(e.status||500).json({message:e.message});}
});

router.delete('/persons/:id/contacts/:contactID', auth, async (req,res)=>{
    const id=Number(req.params.id), contactID=Number(req.params.contactID), code=String(req.query.familyTreeCode||''), userID=req.user.userId;
    try{
        const result=await withTx(async c=>{
            const tree=await requireTree(c,code,userID);
            const [existing]=await c.query(`SELECT ContactType FROM FTContactT WHERE ContactID=? AND PersonID=? LIMIT 1`,[contactID,id]);
            if(!existing.length){const e=new Error('Contact not found.');e.status=404;throw e;}
            await c.query(`DELETE FROM FTContactT WHERE ContactID=? AND PersonID=?`,[contactID,id]);
            await logActivity(c,tree.FamilyTreeID,userID,'DELETE','FTContactT',contactID,id,`Deleted ${existing[0].ContactType||''} contact`);
            return { message:'Contact deleted.' };
        });
        res.json(result);
    }catch(e){res.status(e.status||500).json({message:e.message});}
});

router.get('/persons/:id/events', auth, async (req, res) => {
    const id = Number(req.params.id);
    const code = String(req.query.familyTreeCode || '');

    try {
        const c = await pool.getConnection();

        try {
            const tree = await requireTree(c, code, req.user.userId);

            const [member] = await c.query(
                `SELECT 1 FROM FTFamilyTreePersonT WHERE FamilyTreeID=? AND PersonID=? LIMIT 1`,
                [tree.FamilyTreeID, id]
            );

            if (!member.length) {
                return res.status(404).json({ message: 'Person is not in this Family Tree.' });
            }

            const [rows] = await c.query(
                `SELECT
                    e.EventID,
                    e.EventType,
                    e.EventDate,
                    e.EventPlace,
                    e.EventDescription
                 FROM FTEventPersonT ep
                 JOIN FTEventT e
                   ON e.EventID=ep.EventID
                 WHERE ep.PersonID=?
                 ORDER BY e.EventType,e.EventDate,e.EventID`,
                [id]
            );

            res.json({ events: rows });
        } finally {
            c.release();
        }
    } catch (e) {
        res.status(e.status || 500).json({ message: e.message });
    }
});

router.post('/persons/:id/events', auth, async (req, res) => {
    const id = Number(req.params.id);
    const userID = req.user.userId;
    const b = req.body || {};

    if (!b.eventType) {
        return res.status(400).json({
            message: 'Event Type is required.'
        });
    }

    try {
        const result = await withTx(async c => {
            const tree = await requireTree(c, b.familyTreeCode, userID);

            const [ev] = await c.query(
                `INSERT INTO FTEventT
                 (
                    EventType,
                    EventDate,
                    EventPlace,
                    EventDescription,
                    CreatedByUserID,
                    CreatedAt,
                    UpdatedByUserID,
                    UpdatedAt
                 )
                 VALUES (?,?,?,?,?,NOW(),NULL,NULL)`,
                [
                    b.eventType,
                    b.eventDate || null,
                    b.eventPlace || null,
                    b.eventDescription || null,
                    userID
                ]
            );

            await c.query(
                `INSERT INTO FTEventPersonT
                 (
                    EventID,
                    PersonID,
                    PersonRole,
                    AddedByUserID,
                    AddedAt
                 )
                 VALUES (?,?,NULL,?,NOW())`,
                [ev.insertId, id, userID]
            );

            await logActivity(
                c,
                tree.FamilyTreeID,
                userID,
                'CREATE',
                'FTEventT',
                ev.insertId,
                id,
                'Added life event'
            );

            return ev.insertId;
        });

        res.status(201).json({
            EventID: result
        });
    } catch (e) {
        res.status(e.status || 500).json({
            message: e.message
        });
    }
});



router.put('/persons/:id/events/:eventID', auth, async (req,res)=>{
    const id=Number(req.params.id), eventID=Number(req.params.eventID), userID=req.user.userId, b=req.body||{};
    if(!b.eventType) return res.status(400).json({message:'Event Type is required.'});
    try{
        const result=await withTx(async c=>{
            const tree=await requireTree(c,b.familyTreeCode,userID);
            const [existing]=await c.query(`SELECT e.EventID FROM FTEventPersonT ep JOIN FTEventT e ON e.EventID=ep.EventID WHERE ep.PersonID=? AND e.EventID=? LIMIT 1`,[id,eventID]);
            if(!existing.length){const e=new Error('Event not found.');e.status=404;throw e;}
            await c.query(`UPDATE FTEventT SET EventType=?,EventDate=?,EventPlace=?,EventDescription=?,UpdatedByUserID=?,UpdatedAt=NOW() WHERE EventID=?`,[b.eventType,b.eventDate||null,b.eventPlace||null,b.eventDescription||null,userID,eventID]);
            await logActivity(c,tree.FamilyTreeID,userID,'EDIT','FTEventT',eventID,id,'Edited life event');
            return {message:'Event changes saved.'};
        });
        res.json(result);
    }catch(e){res.status(e.status||500).json({message:e.message});}
});

router.delete('/persons/:id/events/:eventID', auth, async (req,res)=>{
    const id=Number(req.params.id), eventID=Number(req.params.eventID), code=String(req.query.familyTreeCode||''), userID=req.user.userId;
    try{
        const result=await withTx(async c=>{
            const tree=await requireTree(c,code,userID);
            const [link]=await c.query(`SELECT EventPersonID FROM FTEventPersonT WHERE EventID=? AND PersonID=? LIMIT 1`,[eventID,id]);
            if(!link.length){const e=new Error('Event not found for this person.');e.status=404;throw e;}
            await c.query(`DELETE FROM FTEventPersonT WHERE EventID=? AND PersonID=?`,[eventID,id]);
            const [[remaining]]=await c.query(`SELECT COUNT(*) AS n FROM FTEventPersonT WHERE EventID=?`,[eventID]);
            if(Number(remaining.n)===0) await c.query(`DELETE FROM FTEventT WHERE EventID=?`,[eventID]);
            await logActivity(c,tree.FamilyTreeID,userID,'DELETE','FTEventT',eventID,id,'Deleted life event');
            return {message:'Event deleted.'};
        });
        res.json(result);
    }catch(e){res.status(e.status||500).json({message:e.message});}
});

/* ============================================================================
   PROFILE IMAGE
   Existing FamilyTree convention:
       httpdocs/images/<PersonID>.<ext>

   Example:
       PersonID 24 -> httpdocs/images/24.JPG

   FTImageT.StorageKey stores only:
       24.jpg
   ============================================================================ */

router.get('/persons/:id/profile-image', auth, async (req, res) => {
    const id = Number(req.params.id);
    const code = String(req.query.familyTreeCode || '');

    try {
        const c = await pool.getConnection();

        try {
            await requireTree(c, code, req.user.userId);

            const [rows] = await c.query(
                `SELECT
                    ImageID,
                    StorageKey,
                    Caption
                 FROM FTImageT
                 WHERE PersonID=?
                   AND ImageType='Profile'
                 ORDER BY ImageID
                 LIMIT 1`,
                [id]
            );

            if (!rows.length) {
                return res.status(404).json({
                    message: 'No profile image.'
                });
            }

            res.json({
                ...rows[0],
                url: await publicImageUrl(rows[0].StorageKey)
            });
        } finally {
            c.release();
        }
    } catch (e) {
        res.status(e.status || 500).json({
            message: e.message
        });
    }
});

router.post(
    '/persons/:id/profile-image',
    auth,
    upload.single('profileImage'),
    async (req, res) => {
        const id = Number(req.params.id);
        const userID = req.user.userId;
        const code = String(req.body.familyTreeCode || '');

        if (!req.file) {
            return res.status(400).json({
                message: 'Profile image is required.'
            });
        }

        try {
            const result = await withTx(async c => {
                const tree = await requireTree(c, code, userID);

                const [member] = await c.query(
                    `SELECT 1
                     FROM FTFamilyTreePersonT
                     WHERE FamilyTreeID=?
                       AND PersonID=?
                     LIMIT 1`,
                    [tree.FamilyTreeID, id]
                );

                if (!member.length) {
                    const e = new Error(
                        'Person is not in this Family Tree.'
                    );
                    e.status = 404;
                    throw e;
                }

                const storageKey = profileFileName(id);

                /*
                 * All FamilyTree pictures are optimized to JPEG before R2 storage.
                 * FTImageT.StorageKey continues to store only the filename.
                 */
                const [old] = await c.query(
                    `SELECT
                        ImageID,
                        StorageKey
                     FROM FTImageT
                     WHERE PersonID=?
                       AND ImageType='Profile'
                     ORDER BY ImageID
                     LIMIT 1`,
                    [id]
                );

                const existingStoredFile = await imageExists(storageKey);
                const replaceApproved = String(req.body.replaceProfile || '') === '1';

                if ((old.length || existingStoredFile) && !replaceApproved) {
                    const err = new Error(
                        'A profile picture already exists for this PersonID. Confirm replacement.'
                    );
                    err.status = 409;
                    err.requiresConfirmation = true;
                    throw err;
                }

                const optimizedBuffer =
                    await optimizeFamilyTreeImage(req.file.buffer);

                await putImage(storageKey, optimizedBuffer);

                let imageID;

                if (old.length) {
                    imageID = old[0].ImageID;

                    await c.query(
                        `UPDATE FTImageT
                         SET StorageKey=?,
                             OriginalFileName=?,
                             UpdatedByUserID=?,
                             UpdatedAt=NOW()
                         WHERE ImageID=?`,
                        [
                            storageKey,
                            req.file.originalname,
                            userID,
                            imageID
                        ]
                    );

                    if (
                        old[0].StorageKey &&
                        old[0].StorageKey.toLowerCase() !==
                            storageKey.toLowerCase()
                    ) {
                        await safelyDeleteImage(old[0].StorageKey);
                    }
                } else {
                    const [im] = await c.query(
                        `INSERT INTO FTImageT
                         (
                            PersonID,
                            ImageType,
                            ApproxAge,
                            ImageDate,
                            StorageKey,
                            OriginalFileName,
                            Caption,
                            SortOrder,
                            CreatedByUserID,
                            CreatedAt,
                            UpdatedByUserID,
                            UpdatedAt
                         )
                         VALUES (
                            ?,
                            'Profile',
                            NULL,
                            NULL,
                            ?,
                            ?,
                            NULL,
                            0,
                            ?,
                            NOW(),
                            NULL,
                            NULL
                         )`,
                        [
                            id,
                            storageKey,
                            req.file.originalname,
                            userID
                        ]
                    );

                    imageID = im.insertId;
                }

                await logActivity(
                    c,
                    tree.FamilyTreeID,
                    userID,
                    'ADD_IMAGE',
                    'FTImageT',
                    imageID,
                    id,
                    'Saved profile image'
                );

                return {
                    ImageID: imageID,
                    StorageKey: storageKey,
                    url: await publicImageUrl(storageKey)
                };
            });

            res.status(201).json(result);
        } catch (e) {
            res.status(e.status || 500).json({
                message: e.message
            });
        }
    }
);


/* ============================================================================
   LIFE-STAGE IMAGES
   New convention:
       <PersonID>_1.<ext>
       <PersonID>_2.<ext>
       <PersonID>_3.<ext>
       <PersonID>_4.<ext>

   Example for PersonID 24:
       24_1.jpg
       24_2.jpg
       24_3.jpg
       24_4.jpg

   Maximum:
       1 Profile image
       4 Life images
   ============================================================================ */

router.get('/persons/:id/life-images', auth, async (req, res) => {
    const id = Number(req.params.id);
    const code = String(req.query.familyTreeCode || '');

    try {
        const c = await pool.getConnection();

        try {
            await requireTree(c, code, req.user.userId);

            const [rows] = await c.query(
                `SELECT
                    ImageID,
                    PersonID,
                    ImageType,
                    ApproxAge,
                    ImageDate,
                    StorageKey,
                    OriginalFileName,
                    Caption,
                    SortOrder
                 FROM FTImageT
                 WHERE PersonID=?
                   AND ImageType='Life'
                 ORDER BY SortOrder, ImageID`,
                [id]
            );

            res.json({
                images: await Promise.all(rows.map(async row => ({
                    ...row,
                    url: await publicImageUrl(row.StorageKey)
                })))
            });
        } finally {
            c.release();
        }
    } catch (e) {
        res.status(e.status || 500).json({
            message: e.message
        });
    }
});

router.post(
    '/persons/:id/life-images',
    auth,
    upload.single('lifeImage'),
    async (req, res) => {
        const id = Number(req.params.id);
        const userID = req.user.userId;
        const code = String(req.body.familyTreeCode || '');

        if (!req.file) {
            return res.status(400).json({
                message: 'Life image is required.'
            });
        }

        try {
            const result = await withTx(async c => {
                const tree = await requireTree(c, code, userID);

                const [member] = await c.query(
                    `SELECT 1
                     FROM FTFamilyTreePersonT
                     WHERE FamilyTreeID=?
                       AND PersonID=?
                     LIMIT 1`,
                    [tree.FamilyTreeID, id]
                );

                if (!member.length) {
                    const e = new Error(
                        'Person is not in this Family Tree.'
                    );
                    e.status = 404;
                    throw e;
                }

                const [existing] = await c.query(
                    `SELECT
                        ImageID,
                        SortOrder
                     FROM FTImageT
                     WHERE PersonID=?
                       AND ImageType='Life'
                     ORDER BY SortOrder, ImageID`,
                    [id]
                );

                if (existing.length >= 4) {
                    const e = new Error(
                        'A person may have no more than four life-stage images.'
                    );
                    e.status = 400;
                    throw e;
                }

                const usedNumbers = new Set(
                    existing
                        .map(row => Number(row.SortOrder))
                        .filter(n => n >= 1 && n <= 4)
                );

                let lifeNumber = 1;

                while (
                    lifeNumber <= 4 &&
                    usedNumbers.has(lifeNumber)
                ) {
                    lifeNumber++;
                }

                if (lifeNumber > 4) {
                    const e = new Error(
                        'No available life-image position remains.'
                    );
                    e.status = 400;
                    throw e;
                }

                const storageKey =
                    lifeFileName(id, lifeNumber);

                const optimizedBuffer =
                    await optimizeFamilyTreeImage(req.file.buffer);

                await putImage(storageKey, optimizedBuffer);

                const approxAge =
                    req.body.approxAge === '' ||
                    req.body.approxAge == null
                        ? null
                        : Number(req.body.approxAge);

                const imageDate =
                    req.body.imageDate || null;

                const caption =
                    req.body.caption || null;

                const [im] = await c.query(
                    `INSERT INTO FTImageT
                     (
                        PersonID,
                        ImageType,
                        ApproxAge,
                        ImageDate,
                        StorageKey,
                        OriginalFileName,
                        Caption,
                        SortOrder,
                        CreatedByUserID,
                        CreatedAt,
                        UpdatedByUserID,
                        UpdatedAt
                     )
                     VALUES (
                        ?,
                        'Life',
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        NOW(),
                        NULL,
                        NULL
                     )`,
                    [
                        id,
                        Number.isFinite(approxAge)
                            ? approxAge
                            : null,
                        imageDate,
                        storageKey,
                        req.file.originalname,
                        caption,
                        lifeNumber,
                        userID
                    ]
                );

                await logActivity(
                    c,
                    tree.FamilyTreeID,
                    userID,
                    'ADD_IMAGE',
                    'FTImageT',
                    im.insertId,
                    id,
                    `Saved life-stage image ${lifeNumber}`
                );

                return {
                    ImageID: im.insertId,
                    StorageKey: storageKey,
                    SortOrder: lifeNumber,
                    url: await publicImageUrl(storageKey)
                };
            });

            res.status(201).json(result);
        } catch (e) {
            res.status(e.status || 500).json({
                message: e.message
            });
        }
    }
);



/* ============================================================================
   GENERAL PICTURE MANAGEMENT FOR FTPerson.html

   POST /persons/:id/pictures
     - If no Profile exists, the first picture becomes Profile.
     - Otherwise it becomes the next Life picture.
     - Maximum total: 5 pictures.

   POST /persons/:id/pictures/:imageID/make-profile
     - A Life picture becomes the Profile picture.
     - The former Profile picture is retained as a Life picture in the
       selected picture's prior slot.
   ============================================================================ */

router.post(
    '/persons/:id/pictures',
    auth,
    upload.single('picture'),
    async (req, res) => {
        const id = Number(req.params.id);
        const userID = req.user.userId;
        const code = String(req.body.familyTreeCode || '');

        if (!req.file) {
            return res.status(400).json({
                message: 'Picture is required.'
            });
        }

        try {
            const result = await withTx(async c => {
                const tree = await requireTree(c, code, userID);

                const [member] = await c.query(
                    `SELECT 1
                       FROM FTFamilyTreePersonT
                      WHERE FamilyTreeID=? AND PersonID=?
                      LIMIT 1`,
                    [tree.FamilyTreeID, id]
                );

                if (!member.length) {
                    const err = new Error(
                        'Person is not in this Family Tree.'
                    );
                    err.status = 404;
                    throw err;
                }

                const [images] = await c.query(
                    `SELECT ImageID,ImageType,SortOrder
                       FROM FTImageT
                      WHERE PersonID=?
                      ORDER BY ImageID`,
                    [id]
                );

                if (images.length >= 5) {
                    const err = new Error(
                        'A person may have no more than five pictures.'
                    );
                    err.status = 400;
                    throw err;
                }

                const profile = images.find(
                    image => image.ImageType === 'Profile'
                );

                let imageType;
                let sortOrder;
                let storageKey;

                if (!profile) {
                    imageType = 'Profile';
                    sortOrder = 0;
                    storageKey = profileFileName(id);
                } else {
                    imageType = 'Life';

                    const used = new Set(
                        images
                            .filter(image => image.ImageType === 'Life')
                            .map(image => Number(image.SortOrder))
                            .filter(number => number >= 1 && number <= 4)
                    );

                    sortOrder = 1;

                    while (
                        sortOrder <= 4 &&
                        used.has(sortOrder)
                    ) {
                        sortOrder++;
                    }

                    if (sortOrder > 4) {
                        const err = new Error(
                            'No available picture position remains.'
                        );
                        err.status = 400;
                        throw err;
                    }

                    storageKey =
                        lifeFileName(id, sortOrder);
                }

                const optimizedBuffer =
                    await optimizeFamilyTreeImage(req.file.buffer);

                await putImage(storageKey, optimizedBuffer);

                const approxAge =
                    req.body.approxAge === '' ||
                    req.body.approxAge == null
                        ? null
                        : Number(req.body.approxAge);

                const [imageResult] = await c.query(
                    `INSERT INTO FTImageT
                     (
                        PersonID,
                        ImageType,
                        ApproxAge,
                        ImageDate,
                        StorageKey,
                        OriginalFileName,
                        Caption,
                        SortOrder,
                        CreatedByUserID,
                        CreatedAt,
                        UpdatedByUserID,
                        UpdatedAt
                     )
                     VALUES
                     (?,?,?,?,?,?,?,?,?,NOW(),NULL,NULL)`,
                    [
                        id,
                        imageType,
                        Number.isFinite(approxAge)
                            ? approxAge
                            : null,
                        req.body.imageDate || null,
                        storageKey,
                        req.file.originalname,
                        req.body.caption || null,
                        sortOrder,
                        userID
                    ]
                );

                await logActivity(
                    c,
                    tree.FamilyTreeID,
                    userID,
                    'ADD_IMAGE',
                    'FTImageT',
                    imageResult.insertId,
                    id,
                    imageType === 'Profile'
                        ? 'Added profile picture'
                        : `Added picture ${sortOrder + 1}`
                );

                return {
                    ImageID: imageResult.insertId,
                    ImageType: imageType,
                    SortOrder: sortOrder,
                    StorageKey: storageKey,
                    url: await publicImageUrl(storageKey)
                };
            });

            res.status(201).json(result);
        } catch (e) {
            res.status(e.status || 500).json({
                message: e.message
            });
        }
    }
);

router.delete(
    '/persons/:id/pictures',
    auth,
    async (req, res) => {
        const id = Number(req.params.id);
        const userID = req.user.userId;
        const code = String((req.body || {}).familyTreeCode || '');
        const requestedImageIDs = Array.isArray((req.body || {}).imageIDs)
            ? req.body.imageIDs
            : [];

        const imageIDs = [
            ...new Set(
                requestedImageIDs
                    .map(value => Number(value))
                    .filter(value => Number.isInteger(value) && value > 0)
            )
        ];

        if (!imageIDs.length) {
            return res.status(400).json({
                message: 'Select at least one picture to delete.'
            });
        }

        if (imageIDs.length > 5) {
            return res.status(400).json({
                message: 'A maximum of five pictures can be deleted at one time.'
            });
        }

        try {
            const result = await withTx(async c => {
                const tree = await requireTree(c, code, userID);

                const [member] = await c.query(
                    `SELECT 1
                       FROM FTFamilyTreePersonT
                      WHERE FamilyTreeID=? AND PersonID=?
                      LIMIT 1`,
                    [tree.FamilyTreeID, id]
                );

                if (!member.length) {
                    const err = new Error(
                        'Person is not in this Family Tree.'
                    );
                    err.status = 404;
                    throw err;
                }

                const placeholders = imageIDs.map(() => '?').join(',');

                const [images] = await c.query(
                    `SELECT
                        ImageID,
                        ImageType,
                        SortOrder,
                        StorageKey
                       FROM FTImageT
                      WHERE PersonID=?
                        AND ImageID IN (${placeholders})
                      ORDER BY ImageID`,
                    [id, ...imageIDs]
                );

                if (images.length !== imageIDs.length) {
                    const err = new Error(
                        'One or more selected pictures could not be found.'
                    );
                    err.status = 404;
                    throw err;
                }

                await c.query(
                    `DELETE FROM FTImageT
                      WHERE PersonID=?
                        AND ImageID IN (${placeholders})`,
                    [id, ...imageIDs]
                );

                for (const image of images) {
                    await logActivity(
                        c,
                        tree.FamilyTreeID,
                        userID,
                        'DELETE_IMAGE',
                        'FTImageT',
                        image.ImageID,
                        id,
                        image.ImageType === 'Profile'
                            ? 'Deleted Profile Picture'
                            : `Deleted picture ${Number(image.SortOrder) + 1}`
                    );
                }

                return {
                    deletedCount: images.length,
                    storageKeys: images
                        .map(image => image.StorageKey)
                        .filter(Boolean)
                };
            });

            await Promise.all(
                result.storageKeys.map(storageKey =>
                    safelyDeleteImage(storageKey)
                )
            );

            res.json({
                message: `${result.deletedCount} picture(s) deleted.`,
                deletedCount: result.deletedCount
            });
        } catch (e) {
            res.status(e.status || 500).json({
                message: e.message
            });
        }
    }
);


router.post(
    '/persons/:id/pictures/:imageID/make-profile',
    auth,
    async (req, res) => {
        const id = Number(req.params.id);
        const selectedImageID = Number(req.params.imageID);
        const userID = req.user.userId;
        const code = String((req.body || {}).familyTreeCode || '');

        try {
            const result = await withTx(async c => {
                const tree = await requireTree(c, code, userID);

                const [member] = await c.query(
                    `SELECT 1
                       FROM FTFamilyTreePersonT
                      WHERE FamilyTreeID=? AND PersonID=?
                      LIMIT 1`,
                    [tree.FamilyTreeID, id]
                );

                if (!member.length) {
                    const err = new Error(
                        'Person is not in this Family Tree.'
                    );
                    err.status = 404;
                    throw err;
                }

                const [selectedRows] = await c.query(
                    `SELECT *
                       FROM FTImageT
                      WHERE ImageID=? AND PersonID=?
                      LIMIT 1`,
                    [selectedImageID, id]
                );

                if (!selectedRows.length) {
                    const err = new Error('Picture not found.');
                    err.status = 404;
                    throw err;
                }

                const selected = selectedRows[0];

                if (selected.ImageType === 'Profile') {
                    return {
                        message: 'That picture is already the Profile Picture.'
                    };
                }

                if (
                    selected.ImageType !== 'Life' ||
                    Number(selected.SortOrder) < 1 ||
                    Number(selected.SortOrder) > 4
                ) {
                    const err = new Error(
                        'Only one of the four other pictures can be made Profile.'
                    );
                    err.status = 400;
                    throw err;
                }

                const [profileRows] = await c.query(
                    `SELECT *
                       FROM FTImageT
                      WHERE PersonID=? AND ImageType='Profile'
                      ORDER BY ImageID
                      LIMIT 1`,
                    [id]
                );

                const oldProfile =
                    profileRows.length
                        ? profileRows[0]
                        : null;

                const newProfileKey =
                    profileFileName(id);

                const selectedExists =
                    await imageExists(selected.StorageKey);

                if (!selectedExists) {
                    const err = new Error(
                        'The selected picture file could not be found in R2.'
                    );
                    err.status = 404;
                    throw err;
                }

                const selectedSortOrder =
                    Number(selected.SortOrder);

                const formerProfileLifeKey = oldProfile
                    ? lifeFileName(id, selectedSortOrder)
                    : null;

                const tempSelectedKey =
                    `_swap/${id}_selected_${Date.now()}.jpg`;

                const tempProfileKey = oldProfile
                    ? `_swap/${id}_profile_${Date.now()}.jpg`
                    : null;

                await copyImage(
                    selected.StorageKey,
                    tempSelectedKey
                );

                if (oldProfile) {
                    const oldProfileExists =
                        await imageExists(oldProfile.StorageKey);

                    if (!oldProfileExists) {
                        await safelyDeleteImage(tempSelectedKey);

                        const err = new Error(
                            'The current Profile Picture file could not be found in R2.'
                        );
                        err.status = 404;
                        throw err;
                    }

                    await copyImage(
                        oldProfile.StorageKey,
                        tempProfileKey
                    );
                }

                try {
                    await copyImage(
                        tempSelectedKey,
                        newProfileKey
                    );

                    if (oldProfile) {
                        await copyImage(
                            tempProfileKey,
                            formerProfileLifeKey
                        );

                        await c.query(
                            `UPDATE FTImageT
                                SET ImageType='Life',
                                    SortOrder=?,
                                    StorageKey=?,
                                    UpdatedByUserID=?,
                                    UpdatedAt=NOW()
                              WHERE ImageID=?`,
                            [
                                selectedSortOrder,
                                formerProfileLifeKey,
                                userID,
                                oldProfile.ImageID
                            ]
                        );
                    }

                    await c.query(
                        `UPDATE FTImageT
                            SET ImageType='Profile',
                                SortOrder=0,
                                StorageKey=?,
                                UpdatedByUserID=?,
                                UpdatedAt=NOW()
                          WHERE ImageID=?`,
                        [
                            newProfileKey,
                            userID,
                            selected.ImageID
                        ]
                    );
                } catch (swapError) {
                    try {
                        await copyImage(
                            tempSelectedKey,
                            selected.StorageKey
                        );
                    } catch (_) {}

                    if (oldProfile && tempProfileKey) {
                        try {
                            await copyImage(
                                tempProfileKey,
                                oldProfile.StorageKey
                            );
                        } catch (_) {}
                    } else if (newProfileKey !== selected.StorageKey) {
                        await safelyDeleteImage(newProfileKey);
                    }

                    throw swapError;
                } finally {
                    await safelyDeleteImage(tempSelectedKey);

                    if (tempProfileKey) {
                        await safelyDeleteImage(tempProfileKey);
                    }
                }

                if (
                    selected.StorageKey &&
                    selected.StorageKey !== formerProfileLifeKey
                ) {
                    await safelyDeleteImage(selected.StorageKey);
                }

                if (
                    oldProfile &&
                    oldProfile.StorageKey &&
                    oldProfile.StorageKey !== newProfileKey
                ) {
                    await safelyDeleteImage(oldProfile.StorageKey);
                }

                await logActivity(
                    c,
                    tree.FamilyTreeID,
                    userID,
                    'EDIT_IMAGE',
                    'FTImageT',
                    selected.ImageID,
                    id,
                    'Changed Profile Picture'
                );

                return {
                    message: 'Profile Picture changed.',
                    ImageID: selected.ImageID,
                    StorageKey: newProfileKey,
                    url: await publicImageUrl(newProfileKey)
                };
            });

            res.json(result);
        } catch (e) {
            res.status(e.status || 500).json({
                message: e.message
            });
        }
    }
);


router.delete('/persons/:id', auth, async (req, res) => {
    const id = Number(req.params.id);
    const code = String(req.query.familyTreeCode || '');
    const userID = req.user.userId;

    try {
        const result = await withTx(async c => {
            const tree = await requireTree(
                c,
                code,
                userID
            );

            const treeID = tree.FamilyTreeID;

            const [membership] = await c.query(
                `SELECT FamilyTreePersonID
                   FROM FTFamilyTreePersonT
                  WHERE FamilyTreeID=?
                    AND PersonID=?
                  LIMIT 1`,
                [treeID, id]
            );

            if (!membership.length) {
                const err = new Error(
                    'Person is not in this Family Tree.'
                );
                err.status = 404;
                throw err;
            }

            /*
             * Capture the person's identity and notification recipients
             * BEFORE any relationship/contact rows are removed.
             */
            const [personRows] = await c.query(
                `SELECT *
                 FROM FTPersonT
                 WHERE PersonID=?
                 LIMIT 1`,
                [id]
            );

            if (!personRows.length) {
                const err = new Error('Person not found.');
                err.status = 404;
                throw err;
            }

            const deletedPerson = personRows[0];
            const originalCreatorUserID =
                deletedPerson.CreatedByUserID;

            /*
             * Capture the PRE-delete connected component containing this
             * Person. After the delete, only surviving people from this
             * component are eligible for a delete-triggered split. This
             * prevents unrelated components that were already disconnected
             * from being moved into new Family Trees.
             */
            const preDeleteComponents =
                await loadTreeComponents(c, treeID);

            const affectedBeforeDelete =
                preDeleteComponents.find(
                    component =>
                        component.some(
                            row => Number(row.PersonID) === id
                        )
                ) || [];

            const affectedSurvivorIDs =
                affectedBeforeDelete
                    .map(row => Number(row.PersonID))
                    .filter(personID => personID && personID !== id);

            const deleteRecipients =
                await getDeleteNotificationRecipients(
                    c,
                    treeID,
                    id,
                    originalCreatorUserID,
                    userID
                );

            const actor =
                await getNotificationUser(c, userID);

            const deletedPersonName =
                familyTreePersonName(deletedPerson);

            const actorName = actor
                ? actor.UserName
                : `UserID ${userID}`;

            /*
             * Preserve the permanent audit trail.
             *
             * This Activity row is intentionally written BEFORE a possible
             * deletion of FamilyTreeT / FTFamilyTreeUserT. Because this all
             * occurs in one transaction, the Activity row is retained only
             * when the delete operation succeeds.
             */
            const activityID = await logActivity(
                c,
                treeID,
                userID,
                'DELETE',
                'FTPersonT',
                id,
                id,
                'Deleted person',
                originalCreatorUserID
            );

            const notificationSubject =
                `FamilyTree: ${deletedPersonName} was deleted`;

            const notificationMessage =
                `${deletedPersonName} was deleted from FamilyTree.\n\n` +
                `Deleted by: ${actorName}\n` +
                `Date/Time: ${new Date().toISOString()}\n` +
                `FamilyTreeCode: ${tree.FamilyTreeCode}`;

            const pendingEmails =
                await createNotificationRecords(
                    c,
                    {
                        treeID,
                        activityID,
                        notificationType: 'Person Deleted',
                        subject: notificationSubject,
                        message: notificationMessage,
                        recipients: deleteRecipients,
                        relatedRecordID: id
                    }
                );

            /*
             * Remove this person's relationships from the current Tree.
             */
            await c.query(
                `DELETE FROM FTParentT
                  WHERE FamilyTreeID=?
                    AND (
                        PersonID=? OR
                        ParentPersonID=?
                    )`,
                [treeID, id, id]
            );

            await c.query(
                `DELETE FROM FTPartnerT
                  WHERE FamilyTreeID=?
                    AND (
                        PersonID=? OR
                        PartnerPersonID=?
                    )`,
                [treeID, id, id]
            );

            await c.query(
                `DELETE FROM FTSiblingT
                  WHERE FamilyTreeID=?
                    AND (
                        PersonID=? OR
                        SiblingPersonID=?
                    )`,
                [treeID, id, id]
            );

            await c.query(
                `DELETE FROM FTFamilyTreePersonT
                  WHERE FamilyTreeID=?
                    AND PersonID=?`,
                [treeID, id]
            );

            /*
             * Defensive consistency check: a successful delete must not
             * leave this Person attached to the Tree being edited.
             * Throwing here rolls back the entire transaction rather than
             * allowing a partial Family Tree delete to be committed.
             */
            const [[deletedMembershipCheck]] = await c.query(
                `SELECT COUNT(*) AS n
                   FROM FTFamilyTreePersonT
                  WHERE FamilyTreeID=?
                    AND PersonID=?`,
                [treeID, id]
            );

            if (Number(deletedMembershipCheck.n) !== 0) {
                throw new Error(
                    'Person deletion did not remove the Family Tree membership.'
                );
            }

            /*
             * If the person no longer belongs to ANY Family Tree, delete
             * the global person record and the person's operational data.
             */
            const [[remainingPersonMemberships]] = await c.query(
                `SELECT COUNT(*) AS n
                   FROM FTFamilyTreePersonT
                  WHERE PersonID=?`,
                [id]
            );

            let globalPersonDeleted = false;

            if (Number(remainingPersonMemberships.n) === 0) {
                const [images] = await c.query(
                    `SELECT StorageKey
                       FROM FTImageT
                      WHERE PersonID=?`,
                    [id]
                );

                /*
                 * Capture the EventIDs first. The Event itself is deleted
                 * only if no other person remains linked to it.
                 */
                const [eventLinks] = await c.query(
                    `SELECT EventID
                       FROM FTEventPersonT
                      WHERE PersonID=?`,
                    [id]
                );

                await c.query(
                    `DELETE FROM FTEventPersonT
                      WHERE PersonID=?`,
                    [id]
                );

                for (const eventLink of eventLinks) {
                    await c.query(
                        `DELETE FROM FTEventT
                          WHERE EventID=?
                            AND NOT EXISTS (
                                SELECT 1
                                  FROM FTEventPersonT
                                 WHERE EventID=?
                                 LIMIT 1
                            )`,
                        [
                            eventLink.EventID,
                            eventLink.EventID
                        ]
                    );
                }

                await c.query(
                    `DELETE FROM FTImageT
                      WHERE PersonID=?`,
                    [id]
                );

                await c.query(
                    `DELETE FROM FTContactT
                      WHERE PersonID=?`,
                    [id]
                );

                await c.query(
                    `DELETE FROM FTPersonT
                      WHERE PersonID=?`,
                    [id]
                );

                /*
                 * Defensive consistency check: once the Person has no Tree
                 * memberships, the global Person row must also be gone.
                 */
                const [[deletedPersonCheck]] = await c.query(
                    `SELECT COUNT(*) AS n
                       FROM FTPersonT
                      WHERE PersonID=?`,
                    [id]
                );

                if (Number(deletedPersonCheck.n) !== 0) {
                    throw new Error(
                        'Person deletion left a residual FTPersonT record.'
                    );
                }

                /*
                 * Physical image cleanup remains intentionally best-effort,
                 * as in the existing application.
                 */
                await Promise.all(
                    images.map(image =>
                        safelyDeleteImage(image.StorageKey)
                    )
                );

                globalPersonDeleted = true;
            }

            /*
             * Now determine whether the Family Tree itself has become empty.
             */
            const [[remainingTreePeople]] = await c.query(
                `SELECT COUNT(*) AS n
                   FROM FTFamilyTreePersonT
                  WHERE FamilyTreeID=?`,
                [treeID]
            );

            const treeIsEmpty =
                Number(remainingTreePeople.n) === 0;

            let splitResult = {
                split: false,
                restoredCodes: [],
                preferredFamilyTreeCode:
                    tree.FamilyTreeCode
            };

            if (!treeIsEmpty) {
                splitResult =
                    await splitTreeIfDisconnected(
                        c,
                        tree,
                        userID,
                        affectedSurvivorIDs
                    );
            }

            if (treeIsEmpty) {
                /*
                 * Defensive cleanup of operational Tree records.
                 * These should normally already be empty after the last
                 * person is removed, but they must not survive a deleted Tree.
                 */
                await c.query(
                    `DELETE FROM FTParentT
                      WHERE FamilyTreeID=?`,
                    [treeID]
                );

                await c.query(
                    `DELETE FROM FTPartnerT
                      WHERE FamilyTreeID=?`,
                    [treeID]
                );

                await c.query(
                    `DELETE FROM FTSiblingT
                      WHERE FamilyTreeID=?`,
                    [treeID]
                );

                /*
                 * Notifications and temporary archive data are operational,
                 * not the permanent audit history.
                 */
                /*
                 * FTNotificationT is retained so notification attempts and
                 * delivery results remain recorded.
                 */

                await c.query(
                    `DELETE FROM FTRecordArchiveT
                      WHERE FamilyTreeID=?`,
                    [treeID]
                );

                /*
                 * Remove all user associations so FamilyTree.html can no
                 * longer surface this FamilyTreeCode.
                 */
                await c.query(
                    `DELETE FROM FTFamilyTreeUserT
                      WHERE FamilyTreeID=?`,
                    [treeID]
                );

                /*
                 * Finally remove the empty Tree itself.
                 *
                 * IMPORTANT:
                 * FTFamilyTreeActivityT is deliberately NOT deleted.
                 * It remains as the permanent audit history.
                 */
                await c.query(
                    `DELETE FROM FamilyTreeT
                      WHERE FamilyTreeID=?`,
                    [treeID]
                );

                /*
                 * Defensive consistency check: an empty Tree must not leave
                 * either its FamilyTreeT row or active/user association rows
                 * behind. Any residue rolls back the transaction.
                 */
                const [[deletedTreeCheck]] = await c.query(
                    `SELECT COUNT(*) AS n
                       FROM FamilyTreeT
                      WHERE FamilyTreeID=?`,
                    [treeID]
                );

                const [[deletedTreeUsersCheck]] = await c.query(
                    `SELECT COUNT(*) AS n
                       FROM FTFamilyTreeUserT
                      WHERE FamilyTreeID=?`,
                    [treeID]
                );

                if (
                    Number(deletedTreeCheck.n) !== 0 ||
                    Number(deletedTreeUsersCheck.n) !== 0
                ) {
                    throw new Error(
                        'Empty Family Tree cleanup left residual Tree records.'
                    );
                }

                return {
                    message:
                        'Person deleted. The Family Tree is now empty and was removed. Audit activity was retained.',
                    personDeleted: globalPersonDeleted,
                    treeDeleted: true,
                    FamilyTreeCode: null,
                    pendingEmails
                };
            }

            return {
                message: splitResult.split
                    ? `Person deleted. The family connection was removed and the Family Tree separated. The original Family Tree remains ${splitResult.preferredFamilyTreeCode}. Separated Family Tree code${splitResult.restoredCodes.length === 1 ? '' : 's'}: ${splitResult.restoredCodes.join(', ')}. The separated tree can be opened from Person List, by entering its Family Tree Code, or by searching for a person in that tree.`
                    : (
                        globalPersonDeleted
                            ? 'Person deleted.'
                            : 'Person removed from this Family Tree.'
                    ),
                personDeleted: globalPersonDeleted,
                treeDeleted: false,
                treeSplit: splitResult.split,
                restoredFamilyTreeCodes:
                    splitResult.restoredCodes,
                FamilyTreeCode:
                    splitResult.preferredFamilyTreeCode,
                pendingEmails
            };
        });

        await sendPendingFamilyTreeNotifications(
            result.pendingEmails
        );

        delete result.pendingEmails;

        res.json(result);
    } catch (e) {
        res.status(e.status || 500).json({
            message: e.message
        });
    }
});

router.get('/persons/:id/duplicate-view', auth, async (req, res) => {
    const personID = Number(req.params.id);
    if (!personID) return res.status(400).json({ message: 'PersonID is required.' });

    try {
        const c = await pool.getConnection();
        try {
            const tree = await getPersonTree(c, personID);
            if (!tree) return res.status(404).json({ message: 'Person was not found in an active Family Tree.' });

            const [[person]] = await c.query('SELECT * FROM FTPersonT WHERE PersonID=? LIMIT 1', [personID]);
            if (!person) return res.status(404).json({ message: 'Person was not found.' });

            const context = await personContext(c, personID, tree.FamilyTreeID);
            const [images] = await c.query(
                `SELECT ImageID,ImageType,ApproxAge,ImageDate,StorageKey,OriginalFileName,Caption,SortOrder
                 FROM FTImageT WHERE PersonID=?
                 ORDER BY CASE WHEN ImageType='Profile' THEN 0 ELSE 1 END,SortOrder,ImageID`,
                [personID]
            );
            const signedImages = [];
            for (const image of images) {
                let url = null;
                try { url = await publicImageUrl(image.StorageKey); } catch (_) {}
                signedImages.push({ ...image, ImageDate: dateOnly(image.ImageDate), url });
            }

            res.json({
                person: {
                    ...person,
                    BirthDate: dateOnly(person.BirthDate),
                    DeathDate: dateOnly(person.DeathDate)
                },
                FamilyTreeCode: tree.FamilyTreeCode,
                ...context,
                images: signedImages
            });
        } finally {
            c.release();
        }
    } catch (e) {
        res.status(e.status || 500).json({ message: e.message });
    }
});

router.get('/one-tree/review', auth, async (req, res) => {
    const sourceCode = String(req.query.sourceFamilyTreeCode || '').trim();
    const targetPersonID = Number(req.query.targetPersonID || 0);

    if (!sourceCode || !targetPersonID) {
        return res.status(400).json({ message: 'Source FamilyTreeCode and target PersonID are required.' });
    }

    try {
        const c = await pool.getConnection();
        try {
            const sourceTree = await requireTree(c, sourceCode, req.user.userId);
            const targetTree = await getPersonTree(c, targetPersonID);
            if (!targetTree) {
                return res.status(404).json({ message: 'The selected existing Person is not associated with an active Family Tree.' });
            }
            if (Number(sourceTree.FamilyTreeID) === Number(targetTree.FamilyTreeID)) {
                return res.json({
                    alreadySameTree: true,
                    FamilyTreeID: sourceTree.FamilyTreeID,
                    FamilyTreeCode: sourceTree.FamilyTreeCode,
                    candidateGroups: []
                });
            }

            const review = await buildOneTreeReview(c, sourceTree, targetTree);
            res.json({
                ...review,
                sourceTree,
                targetTree,
                targetPersonID
            });
        } finally {
            c.release();
        }
    } catch (e) {
        res.status(e.status || 500).json({ message: e.message });
    }
});

router.post('/one-tree/merge', auth, async (req, res) => {
    const b = req.body || {};
    const sourceCode = String(b.sourceFamilyTreeCode || '').trim();
    const targetPersonID = Number(b.targetPersonID || 0);
    const decisions = Array.isArray(b.decisions) ? b.decisions : [];
    const bridge = b.bridge || {};

    if (!sourceCode || !targetPersonID) {
        return res.status(400).json({ message: 'Source FamilyTreeCode and target PersonID are required.' });
    }

    const r2Plan = { newKeys: [], oldKeys: [] };

    try {
        const result = await withTx(async c => {
            const sourceTree = await requireTree(c, sourceCode, req.user.userId);
            const targetTree = await getPersonTree(c, targetPersonID);
            if (!targetTree) {
                const err = new Error('The selected existing Person is not associated with an active Family Tree.');
                err.status = 404;
                throw err;
            }

            if (Number(sourceTree.FamilyTreeID) === Number(targetTree.FamilyTreeID)) {
                let focalPersonID = Number(bridge.focalPersonID || 0);
                let relatedPersonID = Number(bridge.relatedPersonID || targetPersonID);
                const kind = String(bridge.relationshipKind || '').toLowerCase();
                if (focalPersonID && relatedPersonID && kind) {
                    await addRelationshipInTree(c, sourceTree.FamilyTreeID, req.user.userId, focalPersonID, relatedPersonID, kind);
                }
                return {
                    FamilyTreeID: sourceTree.FamilyTreeID,
                    FamilyTreeCode: sourceTree.FamilyTreeCode,
                    focalPersonID: focalPersonID || null,
                    relatedPersonID: relatedPersonID || null,
                    mergedPersonCount: 0
                };
            }

            const review = await buildOneTreeReview(c, sourceTree, targetTree);
            const groupsByNewer = new Map(
                review.groups.map(group => [Number(group.newerPerson.PersonID), group])
            );
            const decisionsByNewer = new Map(
                decisions
                    .filter(Boolean)
                    .map(decision => [Number(decision.newerPersonID), decision])
            );

            const selectedOlder = new Set();
            for (const [newerPersonID, group] of groupsByNewer.entries()) {
                const decision = decisionsByNewer.get(newerPersonID);
                if (!decision || !['same', 'different'].includes(decision.decision)) {
                    const err = new Error(`PersonID ${newerPersonID} has possible duplicates that still require a Same Person / Different Person decision.`);
                    err.status = 409;
                    err.responseCode = 'ONE_TREE_REVIEW_INCOMPLETE';
                    throw err;
                }

                if (decision.decision === 'same') {
                    const olderPersonID = Number(decision.olderPersonID || 0);
                    const allowed = group.candidates.some(candidate => Number(candidate.PersonID) === olderPersonID);
                    if (!allowed) {
                        const err = new Error(`The selected match for PersonID ${newerPersonID} is no longer a current duplicate candidate. Reload the review.`);
                        err.status = 409;
                        throw err;
                    }
                    if (selectedOlder.has(olderPersonID)) {
                        const err = new Error(`Two newer Person records cannot both be merged into PersonID ${olderPersonID} in the same operation.`);
                        err.status = 409;
                        throw err;
                    }
                    selectedOlder.add(olderPersonID);
                }
            }

            const normalizedBridge = {
                focalPersonID: Number(bridge.focalPersonID || 0) || null,
                relatedPersonID: Number(bridge.relatedPersonID || targetPersonID) || null,
                relationshipKind: String(bridge.relationshipKind || '').toLowerCase() || null
            };

            const mergeRecord = await createOneTreeMergeRecord(
                c,
                review.olderTree,
                review.newerTree,
                req.user.userId,
                decisions,
                normalizedBridge
            );

            const merged = await mergeTreesOneTree(
                c,
                review.olderTree,
                review.newerTree,
                decisions,
                req.user.userId,
                normalizedBridge,
                r2Plan,
                mergeRecord.TreeMergeID
            );

            await c.query(
                'UPDATE FTTreeMergeT SET CreatedR2KeysJSON=? WHERE TreeMergeID=?',
                [JSON.stringify([...new Set(r2Plan.newKeys)]), mergeRecord.TreeMergeID]
            );

            return merged;
        });

        const newKeySet = new Set(r2Plan.newKeys);
        for (const key of [...new Set(r2Plan.oldKeys)]) {
            if (!newKeySet.has(key)) {
                await safelyDeleteImage(key);
            }
        }

        res.json({
            ...result,
            message: result.mergedTreeCode
                ? `Family Tree ${result.mergedTreeCode} was combined with older Family Tree ${result.FamilyTreeCode}.`
                : 'Family Trees are already combined.'
        });
    } catch (e) {
        for (const key of [...new Set(r2Plan.newKeys)]) {
            await safelyDeleteImage(key);
        }
        res.status(e.status || 500).json({
            code: e.responseCode || undefined,
            message: e.message
        });
    }
});

router.get('/one-tree/undo-options', auth, async (req, res) => {
    const code = String(req.query.familyTreeCode || '').trim();
    if (!code) {
        return res.status(400).json({ message: 'FamilyTreeCode is required.' });
    }

    try {
        const c = await pool.getConnection();
        try {
            const tree = await requireTree(c, code, req.user.userId);
            const [rows] = await c.query(
                `SELECT
                    tm.TreeMergeID,
                    tm.SourceFamilyTreeID,
                    sourceTree.FamilyTreeCode AS SourceFamilyTreeCode,
                    sourceTree.CreatedByUserID AS SourceCreatedByUserID,
                    tm.SurvivingFamilyTreeID,
                    survivingTree.FamilyTreeCode AS SurvivingFamilyTreeCode,
                    tm.MergedByUserID,
                    u.UserName AS MergedByUserName,
                    tm.MergedAt,
                    tm.Status
                 FROM FTTreeMergeT tm
                 JOIN FamilyTreeT sourceTree ON sourceTree.FamilyTreeID=tm.SourceFamilyTreeID
                 JOIN FamilyTreeT survivingTree ON survivingTree.FamilyTreeID=tm.SurvivingFamilyTreeID
                 LEFT JOIN UsersT u ON u.UserID=tm.MergedByUserID
                 WHERE tm.SurvivingFamilyTreeID=? AND tm.Status='ACTIVE'
                 ORDER BY tm.MergedAt DESC,tm.TreeMergeID DESC`,
                [tree.FamilyTreeID]
            );

            const visible = rows.filter(row =>
                Number(row.SourceCreatedByUserID) === Number(req.user.userId) ||
                Number(row.MergedByUserID) === Number(req.user.userId)
            );

            res.json({
                FamilyTreeID: tree.FamilyTreeID,
                FamilyTreeCode: tree.FamilyTreeCode,
                merges: visible
            });
        } finally {
            c.release();
        }
    } catch (e) {
        res.status(e.status || 500).json({ message: e.message });
    }
});

router.get('/one-tree/undo-review/:treeMergeID', auth, async (req, res) => {
    const treeMergeID = Number(req.params.treeMergeID || 0);
    if (!treeMergeID) {
        return res.status(400).json({ message: 'TreeMergeID is required.' });
    }

    try {
        const [[row]] = await pool.query(
            `SELECT
                tm.*,
                sourceTree.FamilyTreeCode AS SourceFamilyTreeCode,
                sourceTree.CreatedByUserID AS SourceCreatedByUserID,
                survivingTree.FamilyTreeCode AS SurvivingFamilyTreeCode,
                u.UserName AS MergedByUserName
             FROM FTTreeMergeT tm
             JOIN FamilyTreeT sourceTree ON sourceTree.FamilyTreeID=tm.SourceFamilyTreeID
             JOIN FamilyTreeT survivingTree ON survivingTree.FamilyTreeID=tm.SurvivingFamilyTreeID
             LEFT JOIN UsersT u ON u.UserID=tm.MergedByUserID
             WHERE tm.TreeMergeID=? LIMIT 1`,
            [treeMergeID]
        );
        if (!row) {
            return res.status(404).json({ message: 'One Tree merge history was not found.' });
        }
        if (row.Status !== 'ACTIVE') {
            return res.status(409).json({ message: 'This One Tree merge has already been undone.' });
        }
        if (
            Number(row.SourceCreatedByUserID) !== Number(req.user.userId) &&
            Number(row.MergedByUserID) !== Number(req.user.userId)
        ) {
            return res.status(403).json({ message: 'You are not authorized to undo this One Tree merge.' });
        }

        let snapshot = {};
        try { snapshot = JSON.parse(row.MergeSnapshot || '{}'); } catch (_) {}
        const samePersonPairs = (snapshot.pairs || []).map(pair => ({
            sourcePersonID: pair.sourcePersonID,
            survivingPersonID: pair.survivingPersonID,
            sourceName: familyTreePersonName(pair.sourcePerson),
            survivingName: familyTreePersonName(pair.survivingPerson)
        }));

        res.json({
            TreeMergeID: row.TreeMergeID,
            SourceFamilyTreeCode: row.SourceFamilyTreeCode,
            SurvivingFamilyTreeCode: row.SurvivingFamilyTreeCode,
            MergedByUserID: row.MergedByUserID,
            MergedByUserName: row.MergedByUserName,
            MergedAt: row.MergedAt,
            sourcePersonCount: (snapshot.sourceMemberships || []).length,
            mergedPersonCount: samePersonPairs.length,
            samePersonPairs
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.post('/one-tree/undo', auth, async (req, res) => {
    const treeMergeID = Number((req.body || {}).treeMergeID || 0);
    if (!treeMergeID) {
        return res.status(400).json({ message: 'TreeMergeID is required.' });
    }

    try {
        const result = await withTx(async c => {
            const [[mergeRow]] = await c.query(
                'SELECT * FROM FTTreeMergeT WHERE TreeMergeID=? FOR UPDATE',
                [treeMergeID]
            );
            if (!mergeRow) {
                const err = new Error('One Tree merge history was not found.');
                err.status = 404;
                throw err;
            }
            if (mergeRow.Status !== 'ACTIVE') {
                const err = new Error('This One Tree merge has already been undone.');
                err.status = 409;
                throw err;
            }
            return undoOneTreeMerge(c,mergeRow,req.user.userId);
        });

        for (const key of [...new Set(result.cleanupKeys || [])]) {
            try {
                const [[used]] = await pool.query(
                    'SELECT COUNT(*) AS n FROM FTImageT WHERE StorageKey=?',
                    [key]
                );
                if (!Number(used.n)) {
                    await safelyDeleteImage(key);
                }
            } catch (_) {
                /* Database undo remains committed even if R2 cleanup cannot finish. */
            }
        }

        res.json({
            TreeMergeID: result.TreeMergeID,
            FamilyTreeID: result.FamilyTreeID,
            FamilyTreeCode: result.FamilyTreeCode,
            message: `Family Tree ${result.FamilyTreeCode} has been restored as a separate Tree.`
        });
    } catch (e) {
        res.status(e.status || 500).json({ message: e.message });
    }
});

router.use((err, req, res, next) => {
    if (
        err instanceof multer.MulterError ||
        /Only JPG/.test(err.message || '')
    ) {
        return res.status(400).json({
            message: err.message
        });
    }

    next(err);
});

module.exports = router;
