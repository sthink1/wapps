const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const router = express.Router();

const { pool } = require('../dbConnection');
const auth = require('../middleware/auth');
const { sendFamilyTreeNotification } = require('../send_email');
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
    const [rows] = await c.query(
        'SELECT FamilyTreeUserID FROM FTFamilyTreeUserT WHERE FamilyTreeID=? AND UserID=? AND IsActive=1 LIMIT 1',
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
    originalCreatorUserID,
    actingUserID
) {
    const recipients = new Map();

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
        recipients
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
                email,
                subject,
                message
            });
        }
    }

    return pendingEmails;
}

async function sendPendingFamilyTreeNotifications(pendingEmails) {
    for (const pending of pendingEmails || []) {
        try {
            await sendFamilyTreeNotification({
                email: pending.email,
                subject: pending.subject,
                message: pending.message
            });

            await pool.query(
                `UPDATE FTNotificationT
                 SET Status='Sent',
                     SentAt=NOW(),
                     FailureReason=NULL
                 WHERE NotificationID=?`,
                [pending.NotificationID]
            );
        } catch (error) {
            try {
                await pool.query(
                    `UPDATE FTNotificationT
                     SET Status='Failed',
                         FailureReason=?
                     WHERE NotificationID=?`,
                    [
                        String(error.message || error).slice(0, 500),
                        pending.NotificationID
                    ]
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
    const resolvedTarget = await resolveTreeAlias(
        c,
        targetTree
    );

    if (!resolvedTarget) {
        const err = new Error('Target Family Tree was not found.');
        err.status = 404;
        throw err;
    }

    targetTree = resolvedTarget.activeTree;

    const [sourceTrees] = await c.query(
        `SELECT DISTINCT
            ft.FamilyTreeID,
            ft.FamilyTreeCode,
            ft.CreatedAt
         FROM FTFamilyTreeUserT ftu
         JOIN FamilyTreeT ft
           ON ft.FamilyTreeID=ftu.FamilyTreeID
         WHERE ftu.UserID=?
           AND ftu.IsActive=1
           AND ft.FamilyTreeID<>?
           AND EXISTS (
               SELECT 1
               FROM FTFamilyTreePersonT ftp
               WHERE ftp.FamilyTreeID=ft.FamilyTreeID
               LIMIT 1
           )`,
        [userID, targetTree.FamilyTreeID]
    );

    for (const source of sourceTrees) {
        const sourceID = source.FamilyTreeID;

        /*
         * Preserve every person's original Tree identity while the Tree is
         * merged into the authoritative target Tree.
         */
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
             SELECT
                ?,
                PersonID,
                COALESCE(OriginFamilyTreeID, ?),
                AddedByUserID,
                AddedAt,
                Notes
             FROM FTFamilyTreePersonT
             WHERE FamilyTreeID=?
             ON DUPLICATE KEY UPDATE
                OriginFamilyTreeID=
                    COALESCE(
                        FTFamilyTreePersonT.OriginFamilyTreeID,
                        VALUES(OriginFamilyTreeID)
                    )`,
            [
                targetTree.FamilyTreeID,
                sourceID,
                sourceID
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
             WHERE FamilyTreeID=?`,
            [targetTree.FamilyTreeID, sourceID]
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
             WHERE FamilyTreeID=?`,
            [targetTree.FamilyTreeID, sourceID]
        );

        await c.query(
            `DELETE FROM FTParentT
             WHERE FamilyTreeID=?`,
            [sourceID]
        );

        await c.query(
            `DELETE FROM FTPartnerT
             WHERE FamilyTreeID=?`,
            [sourceID]
        );

        await c.query(
            `DELETE FROM FTFamilyTreePersonT
             WHERE FamilyTreeID=?`,
            [sourceID]
        );

        /*
         * Do NOT delete the old Tree record. It becomes a historical alias
         * pointing to the currently authoritative Tree.
         */
        await c.query(
            `UPDATE FamilyTreeT
             SET Status='Merged',
                 MergedIntoFamilyTreeID=?,
                 MergedAt=NOW(),
                 MergedByUserID=?,
                 LastActivityAt=NOW(),
                 LastActivityByUserID=?
             WHERE FamilyTreeID=?`,
            [
                targetTree.FamilyTreeID,
                userID,
                userID,
                sourceID
            ]
        );

        await c.query(
            `UPDATE FTFamilyTreeUserT
             SET IsActive=0,
                 LastActivityAt=NOW()
             WHERE FamilyTreeID=?`,
            [sourceID]
        );

        await logActivity(
            c,
            targetTree.FamilyTreeID,
            userID,
            'MERGE',
            'FamilyTreeT',
            sourceID,
            null,
            `Merged Family Tree ${source.FamilyTreeCode} into ${targetTree.FamilyTreeCode}`
        );
    }

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
             VALUES (?,?,?,NULL,?,NULL,?,NOW(),NULL,NULL)`,
            [treeID, focal, related, side, userID]
        );
    } else if (kind === 'child') {
        await c.query(
            `INSERT INTO FTParentT
             (FamilyTreeID,PersonID,ParentPersonID,ParentType,AncestrySide,Notes,
              CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
             VALUES (?,?,?,NULL,NULL,NULL,?,NOW(),NULL,NULL)`,
            [treeID, related, focal, userID]
        );
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
         WHERE FamilyTreeID=?`,
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
        `INSERT INTO FTFamilyTreePersonT
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
           AND PersonID IN (${placeholders})
         ON DUPLICATE KEY UPDATE
            OriginFamilyTreeID=
                COALESCE(
                    FTFamilyTreePersonT.OriginFamilyTreeID,
                    VALUES(OriginFamilyTreeID)
                )`,
        [
            destinationTreeID,
            sourceTreeID,
            sourceTreeID,
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
        `DELETE FROM FTFamilyTreePersonT
         WHERE FamilyTreeID=?
           AND PersonID IN (${placeholders})`,
        [sourceTreeID, ...personIDs]
    );
}

async function splitTreeIfDisconnected(
    c,
    tree,
    userID
) {
    await ensureOriginTreeID(
        c,
        tree.FamilyTreeID
    );

    const components = await loadTreeComponents(
        c,
        tree.FamilyTreeID
    );

    if (components.length <= 1) {
        return {
            split: false,
            restoredCodes: [],
            preferredFamilyTreeCode:
                tree.FamilyTreeCode
        };
    }

    /*
     * The component containing people who originated in the currently
     * authoritative Tree keeps the current code. If no component contains
     * such a person, the largest component keeps the current code.
     */
    let anchorIndex = components.findIndex(
        component =>
            component.some(
                row =>
                    row.OriginFamilyTreeID ===
                    tree.FamilyTreeID
            )
    );

    if (anchorIndex < 0) {
        anchorIndex = components
            .map((component, index) => ({
                index,
                size: component.length
            }))
            .sort((a, b) => b.size - a.size)[0].index;
    }

    const restored = [];

    for (let i = 0; i < components.length; i++) {
        if (i === anchorIndex) {
            continue;
        }

        const component = components[i];
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
     * If the deleting user originally owned one of the restored Trees,
     * return that Tree as the user's active Tree. This matches the common
     * case where a user's newer Tree had been temporarily absorbed into an
     * older Tree and later becomes independent again.
     */
    const preferred =
        restored.find(
            item =>
                Number(item.CreatedByUserID) ===
                Number(userID)
        ) ||
        restored.find(() => true) ||
        null;

    if (preferred) {
        const [[hadMembership]] = await c.query(
            `SELECT COUNT(*) AS n
             FROM FTFamilyTreeUserT
             WHERE FamilyTreeID=?
               AND UserID=?`,
            [
                preferred.FamilyTreeID,
                userID
            ]
        );

        if (Number(hadMembership.n) > 0) {
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
                [
                    preferred.FamilyTreeID,
                    userID
                ]
            );
        }
    }

    return {
        split: true,
        restoredCodes:
            restored.map(
                item => item.FamilyTreeCode
            ),
        preferredFamilyTreeCode:
            preferred
                ? preferred.FamilyTreeCode
                : tree.FamilyTreeCode
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
    if (!existingPersonID) return res.status(400).json({ message: 'PersonID is required.' });

    try {
        const result = await withTx(async c => {
            const targetTree = await getPersonTree(c, existingPersonID);
            if (!targetTree) {
                const err = new Error('The selected person is not associated with a Family Tree.');
                err.status = 404;
                throw err;
            }

            await adoptTreeForUser(c, req.user.userId, targetTree);

            const focal = Number(b.focalPersonID || 0);
            const kind = String(b.relationshipKind || '').toLowerCase();
            if (focal && kind) {
                // The focal person may have just been created by this user in a temporary tree.
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
                     SELECT
                        ?,
                        PersonID,
                        COALESCE(
                            OriginFamilyTreeID,
                            FamilyTreeID
                        ),
                        AddedByUserID,
                        AddedAt,
                        Notes
                     FROM FTFamilyTreePersonT
                     WHERE PersonID=?
                     LIMIT 1
                     ON DUPLICATE KEY UPDATE
                        OriginFamilyTreeID=
                            COALESCE(
                                FTFamilyTreePersonT.OriginFamilyTreeID,
                                VALUES(OriginFamilyTreeID)
                            )`,
                    [targetTree.FamilyTreeID, focal]
                );
                await addRelationshipInTree(
                    c, targetTree.FamilyTreeID, req.user.userId,
                    focal, existingPersonID, kind
                );
            }

            return {
                PersonID: existingPersonID,
                FamilyTreeID: targetTree.FamilyTreeID,
                FamilyTreeCode: targetTree.FamilyTreeCode
            };
        });

        res.json(result);
    } catch (e) {
        res.status(e.status || 500).json({ message: e.message });
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
        const {
            FirstName,
            LastName,
            BirthDate,
            BirthPlace,
            MaidenName,
            DeathDate
        } = req.query;

        if (!FirstName && !LastName && !BirthDate) {
            return res.json({ matches: [] });
        }

        const parts = [];
        const vals = [];

        if (FirstName) {
            parts.push('p.FirstName LIKE ?');
            vals.push(`${FirstName}%`);
        }

        if (LastName) {
            parts.push('p.LastName LIKE ?');
            vals.push(`${LastName}%`);
        }

        if (BirthDate) {
            parts.push('p.BirthDate = ?');
            vals.push(BirthDate);
        }

        if (BirthPlace) {
            parts.push('p.BirthPlace LIKE ?');
            vals.push(`%${BirthPlace}%`);
        }

        if (MaidenName) {
            parts.push('p.MaidenName LIKE ?');
            vals.push(`${MaidenName}%`);
        }

        if (DeathDate) {
            parts.push('p.DeathDate = ?');
            vals.push(DeathDate);
        }

        const [rows] = await pool.query(
            personSelectSql('WHERE ' + parts.join(' AND ')) +
                ' ORDER BY p.LastName,p.FirstName LIMIT 20',
            vals
        );

        res.json({ matches: rows });
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
                    Died,
                    DeathDate,
                    CreatedByUserID,
                    CreatedAt,
                    UpdatedByUserID,
                    UpdatedAt
                 )
                 VALUES (?,?,?,?,?,?,?,?,?,?,?, ?,NOW(),NULL,NULL)`,
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
        res.status(e.status || 500).json({ message: e.message });
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
                        recipients
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
                    p.DeathDate,
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
                `SELECT PersonID, ParentPersonID, AncestrySide
                   FROM FTParentT
                  WHERE FamilyTreeID=?`,
                [tree.FamilyTreeID]
            );

            const [partnerEdges] = await c.query(
                `SELECT PersonID, PartnerPersonID
                   FROM FTPartnerT
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
             * A sibling shares at least one recorded parent with the focal person.
             * This intentionally includes full and half siblings.
             */
            const siblingIDs = new Set();
            for (const parent of parentByChild.get(id) || []) {
                for (const siblingID of childrenByParent.get(parent.parentID) || []) {
                    if (Number(siblingID) !== id) {
                        siblingIDs.add(Number(siblingID));
                    }
                }
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
                p.DeathDate
            `;

            const [parents] = await c.query(
                `SELECT ${base},
                        r.AncestrySide,
                        r.ParentType
                 FROM FTParentT r
                 JOIN FTPersonT p
                   ON p.PersonID = r.ParentPersonID
                 WHERE r.FamilyTreeID=?
                   AND r.PersonID=?
                 ORDER BY r.AncestrySide,p.LastName,p.FirstName`,
                [tid, id]
            );

            const [children] = await c.query(
                `SELECT ${base}
                 FROM FTParentT r
                 JOIN FTPersonT p
                   ON p.PersonID = r.PersonID
                 WHERE r.FamilyTreeID=?
                   AND r.ParentPersonID=?
                 ORDER BY p.LastName,p.FirstName`,
                [tid, id]
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
                     VALUES (?,?,?,NULL,?,NULL,?,NOW(),NULL,NULL)`,
                    [tid, focal, related, side, userID]
                );
            } else if (kind === 'child') {
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
                     VALUES (?,?,?,NULL,NULL,NULL,?,NOW(),NULL,NULL)`,
                    [tid, related, focal, userID]
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
            const tree = await requireTree(c, b.familyTreeCode, userID);
            const tid = tree.FamilyTreeID;

            const [personResult] = await c.query(
                `INSERT INTO FTPersonT
                 (FirstName,MiddleName,LastName,SuffixName,NickName,MaidenName,Gender,BirthDate,BirthPlace,Died,DeathDate,
                  CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
                 VALUES (?,?,?,?,?,?,?,?,?,0,NULL,?,NOW(),NULL,NULL)`,
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
                     VALUES (?,?,?,NULL,?,NULL,?,NOW(),NULL,NULL)`,
                    [tid, focal, related, side, userID]
                );
            } else if (kind === 'child') {
                await c.query(
                    `INSERT INTO FTParentT
                     (FamilyTreeID,PersonID,ParentPersonID,ParentType,AncestrySide,Notes,CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
                     VALUES (?,?,?,NULL,NULL,NULL,?,NOW(),NULL,NULL)`,
                    [tid, related, focal, userID]
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
                  ORDER BY IsPrimary DESC,ContactType,ContactID`,
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
                 ORDER BY e.EventDate,e.EventID`,
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
                        recipients: deleteRecipients
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
                `DELETE FROM FTFamilyTreePersonT
                  WHERE FamilyTreeID=?
                    AND PersonID=?`,
                [treeID, id]
            );

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
                        userID
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
                    ? `Person deleted. The family connection was removed and the Tree separated. Active code: ${splitResult.preferredFamilyTreeCode}.`
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
