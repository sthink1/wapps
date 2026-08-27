const express = require('express');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();

const { pool } = require('../dbConnection');
const auth = require('../middleware/auth');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
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
        'SELECT FamilyTreeID, FamilyTreeCode FROM FamilyTreeT WHERE FamilyTreeCode = ? LIMIT 1',
        [code]
    );
    return rows[0] || null;
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

    const tree = await getTreeByCode(c, code);

    if (!tree) {
        const err = new Error('FamilyTreeCode was not found.');
        err.status = 404;
        throw err;
    }

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
    description
) {
    await c.query(
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
            userID,
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

function extensionFromMimeType(mimeType) {
    switch (mimeType) {
        case 'image/png':
            return 'png';
        case 'image/webp':
            return 'webp';
        case 'image/jpeg':
        default:
            return 'jpg';
    }
}

function profileFileName(personID, extension) {
    return `${personID}.${extension}`;
}

function lifeFileName(personID, lifeNumber, extension) {
    return `${personID}_${lifeNumber}.${extension}`;
}

function imageFilePath(storageKey) {
    return path.join(__dirname, '..', 'httpdocs', 'images', storageKey);
}

function publicImageUrl(storageKey) {
    return `/images/${String(storageKey).replace(/\\/g, '/')}`;
}

function safelyDeleteImage(storageKey) {
    if (!storageKey) return;

    try {
        const filePath = imageFilePath(storageKey);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        // Image-file cleanup should not cause an otherwise-valid DB operation to fail.
        console.error('Unable to delete old FamilyTree image:', err.message);
    }
}


function findExistingProfileFile(personID) {
    const imagesDir = path.join(__dirname, '..', 'httpdocs', 'images');

    if (!fs.existsSync(imagesDir)) {
        return null;
    }

    const personPrefix = `${String(personID).toLowerCase()}.`;
    const supportedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);

    const match = fs.readdirSync(imagesDir).find(fileName => {
        const lower = String(fileName).toLowerCase();

        if (!lower.startsWith(personPrefix)) {
            return false;
        }

        const extension = lower.split('.').pop();

        return supportedExtensions.has(extension);
    });

    return match || null;
}


async function getPersonTree(c, personID) {
    const [rows] = await c.query(
        `SELECT ft.FamilyTreeID, ft.FamilyTreeCode
           FROM FTFamilyTreePersonT ftp
           JOIN FamilyTreeT ft ON ft.FamilyTreeID=ftp.FamilyTreeID
          WHERE ftp.PersonID=?
          ORDER BY ftp.AddedAt ASC, ft.CreatedAt ASC, ft.FamilyTreeID ASC
          LIMIT 1`,
        [personID]
    );
    return rows[0] || null;
}

async function adoptTreeForUser(c, userID, targetTree) {
    const [sourceTrees] = await c.query(
        `SELECT FamilyTreeID
           FROM FTFamilyTreeUserT
          WHERE UserID=? AND IsActive=1 AND FamilyTreeID<>?`,
        [userID, targetTree.FamilyTreeID]
    );

    for (const source of sourceTrees) {
        const sourceID = source.FamilyTreeID;

        // Move only people this user personally added.
        await c.query(
            `INSERT IGNORE INTO FTFamilyTreePersonT
             (FamilyTreeID,PersonID,AddedByUserID,AddedAt,Notes)
             SELECT ?,PersonID,AddedByUserID,AddedAt,Notes
               FROM FTFamilyTreePersonT
              WHERE FamilyTreeID=? AND AddedByUserID=?`,
            [targetTree.FamilyTreeID, sourceID, userID]
        );

        // Move parent relationships created by this user.
        await c.query(
            `INSERT IGNORE INTO FTParentT
             (FamilyTreeID,PersonID,ParentPersonID,ParentType,AncestrySide,Notes,
              CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
             SELECT ?,PersonID,ParentPersonID,ParentType,AncestrySide,Notes,
                    CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt
               FROM FTParentT
              WHERE FamilyTreeID=? AND CreatedByUserID=?`,
            [targetTree.FamilyTreeID, sourceID, userID]
        );

        // Move partner relationships created by this user.
        await c.query(
            `INSERT IGNORE INTO FTPartnerT
             (FamilyTreeID,PersonID,PartnerPersonID,RelationshipType,Notes,
              CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt)
             SELECT ?,PersonID,PartnerPersonID,RelationshipType,Notes,
                    CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt
               FROM FTPartnerT
              WHERE FamilyTreeID=? AND CreatedByUserID=?`,
            [targetTree.FamilyTreeID, sourceID, userID]
        );

        await c.query(
            `DELETE FROM FTParentT
              WHERE FamilyTreeID=? AND CreatedByUserID=?`,
            [sourceID, userID]
        );
        await c.query(
            `DELETE FROM FTPartnerT
              WHERE FamilyTreeID=? AND CreatedByUserID=?`,
            [sourceID, userID]
        );
        await c.query(
            `DELETE FROM FTFamilyTreePersonT
              WHERE FamilyTreeID=? AND AddedByUserID=?`,
            [sourceID, userID]
        );
    }

    // One active FamilyTreeCode per user.
    await c.query(
        `UPDATE FTFamilyTreeUserT SET IsActive=0
          WHERE UserID=? AND FamilyTreeID<>?`,
        [userID, targetTree.FamilyTreeID]
    );

    await c.query(
        `INSERT INTO FTFamilyTreeUserT
         (FamilyTreeID,UserID,JoinedAt,LastActivityAt,IsActive,AddedByUserID)
         VALUES (?,?,NOW(),NOW(),1,?)
         ON DUPLICATE KEY UPDATE IsActive=1, LastActivityAt=NOW()`,
        [targetTree.FamilyTreeID, userID, userID]
    );

    return targetTree;
}

async function addRelationshipInTree(c, treeID, userID, focal, related, kind) {
    await c.query(
        `INSERT IGNORE INTO FTFamilyTreePersonT
         (FamilyTreeID,PersonID,AddedByUserID,AddedAt,Notes)
         VALUES (?,?,?,NOW(),NULL)`,
        [treeID, related, userID]
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

router.get('/current-tree', auth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT ft.FamilyTreeID, ft.FamilyTreeCode
               FROM FTFamilyTreeUserT ftu
               JOIN FamilyTreeT ft ON ft.FamilyTreeID=ftu.FamilyTreeID
              WHERE ftu.UserID=? AND ftu.IsActive=1
              ORDER BY ftu.JoinedAt ASC, ft.FamilyTreeID ASC`,
            [req.user.userId]
        );
        res.json({ tree: rows[0] || null, activeCount: rows.length });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.post('/enter-code', auth, async (req, res) => {
    const code = String((req.body || {}).familyTreeCode || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ message: 'Enter a FamilyTreeCode.' });

    try {
        const result = await withTx(async c => {
            const tree = await getTreeByCode(c, code);
            if (!tree) {
                const err = new Error('FamilyTreeCode was not found.');
                err.status = 404;
                throw err;
            }
            await adoptTreeForUser(c, req.user.userId, tree);
            return tree;
        });
        res.json({ FamilyTreeID: result.FamilyTreeID, FamilyTreeCode: result.FamilyTreeCode });
    } catch (e) {
        res.status(e.status || 500).json({ message: e.message });
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
                    `INSERT IGNORE INTO FTFamilyTreePersonT
                     (FamilyTreeID,PersonID,AddedByUserID,AddedAt,Notes)
                     SELECT ?,PersonID,AddedByUserID,AddedAt,Notes
                       FROM FTFamilyTreePersonT
                      WHERE PersonID=?`,
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
                    AddedByUserID,
                    AddedAt,
                    Notes
                 )
                 VALUES (?,?,?,NOW(),NULL)`,
                [tree.FamilyTreeID, p.insertId, userID]
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
                const err = new Error('Person is not in this Family Tree.');
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
                    b.Died ? (b.DeathDate || null) : null,
                    userID,
                    id
                ]
            );

            await logActivity(
                c,
                tree.FamilyTreeID,
                userID,
                'EDIT',
                'FTPersonT',
                id,
                id,
                'Edited person'
            );

            return {
                message: 'Person changes saved.'
            };
        });

        res.json(result);
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
                    AddedByUserID,
                    AddedAt,
                    Notes
                 )
                 VALUES (?,?,?,NOW(),NULL)`,
                [tid, related, userID]
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
                 (FamilyTreeID,PersonID,AddedByUserID,AddedAt,Notes)
                 VALUES (?,?,?,NOW(),NULL)`,
                [tid, related, userID]
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
                url: publicImageUrl(rows[0].StorageKey)
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

                const extension = extensionFromMimeType(req.file.mimetype);
                const storageKey = profileFileName(id, extension);
                const filePath = imageFilePath(storageKey);

                /*
                 * Check for an existing profile image.
                 * If the extension changes (for example 24.JPG -> 24.png),
                 * remove the old physical image after the new file is written.
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

                const existingPhysicalFile = findExistingProfileFile(id);
                const replaceApproved = String(req.body.replaceProfile || '') === '1';

                if ((old.length || existingPhysicalFile) && !replaceApproved) {
                    const err = new Error(
                        'A profile picture already exists for this PersonID. Confirm replacement.'
                    );
                    err.status = 409;
                    err.requiresConfirmation = true;
                    throw err;
                }

                fs.mkdirSync(
                    path.join(__dirname, '..', 'httpdocs', 'images'),
                    { recursive: true }
                );

                fs.writeFileSync(filePath, req.file.buffer);

                if (
                    replaceApproved &&
                    existingPhysicalFile &&
                    existingPhysicalFile.toLowerCase() !== storageKey.toLowerCase()
                ) {
                    safelyDeleteImage(existingPhysicalFile);
                }

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
                        safelyDeleteImage(old[0].StorageKey);
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
                    url: publicImageUrl(storageKey)
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
                images: rows.map(row => ({
                    ...row,
                    url: publicImageUrl(row.StorageKey)
                }))
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

                const extension =
                    extensionFromMimeType(req.file.mimetype);

                const storageKey =
                    lifeFileName(id, lifeNumber, extension);

                const filePath =
                    imageFilePath(storageKey);

                fs.mkdirSync(
                    path.join(__dirname, '..', 'httpdocs', 'images'),
                    { recursive: true }
                );

                fs.writeFileSync(filePath, req.file.buffer);

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
                    url: publicImageUrl(storageKey)
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

                const extension =
                    extensionFromMimeType(req.file.mimetype);

                const imagesDirectory = path.join(
                    __dirname,
                    '..',
                    'httpdocs',
                    'images'
                );

                fs.mkdirSync(imagesDirectory, {
                    recursive: true
                });

                let imageType;
                let sortOrder;
                let storageKey;

                if (!profile) {
                    imageType = 'Profile';
                    sortOrder = 0;
                    storageKey = profileFileName(id, extension);
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
                        lifeFileName(id, sortOrder, extension);
                }

                fs.writeFileSync(
                    imageFilePath(storageKey),
                    req.file.buffer
                );

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
                    url: publicImageUrl(storageKey)
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

                const selectedExtension =
                    path.extname(selected.StorageKey)
                        .replace('.', '')
                        .toLowerCase() || 'jpg';

                const newProfileKey =
                    profileFileName(
                        id,
                        selectedExtension
                    );

                const selectedPath =
                    imageFilePath(selected.StorageKey);

                const tempKey =
                    `${id}_profile_swap_${Date.now()}.${selectedExtension}`;

                const tempPath =
                    imageFilePath(tempKey);

                if (!fs.existsSync(selectedPath)) {
                    const err = new Error(
                        'The selected picture file could not be found.'
                    );
                    err.status = 404;
                    throw err;
                }

                fs.renameSync(
                    selectedPath,
                    tempPath
                );

                let formerProfileLifeKey = null;

                try {
                    if (oldProfile) {
                        const oldProfilePath =
                            imageFilePath(
                                oldProfile.StorageKey
                            );

                        const oldExtension =
                            path.extname(
                                oldProfile.StorageKey
                            )
                                .replace('.', '')
                                .toLowerCase() || 'jpg';

                        formerProfileLifeKey =
                            lifeFileName(
                                id,
                                Number(selected.SortOrder),
                                oldExtension
                            );

                        if (
                            fs.existsSync(
                                oldProfilePath
                            )
                        ) {
                            fs.renameSync(
                                oldProfilePath,
                                imageFilePath(
                                    formerProfileLifeKey
                                )
                            );
                        }

                        await c.query(
                            `UPDATE FTImageT
                                SET ImageType='Life',
                                    SortOrder=?,
                                    StorageKey=?,
                                    UpdatedByUserID=?,
                                    UpdatedAt=NOW()
                              WHERE ImageID=?`,
                            [
                                Number(selected.SortOrder),
                                formerProfileLifeKey,
                                userID,
                                oldProfile.ImageID
                            ]
                        );
                    }

                    fs.renameSync(
                        tempPath,
                        imageFilePath(
                            newProfileKey
                        )
                    );

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
                    if (
                        fs.existsSync(tempPath) &&
                        !fs.existsSync(selectedPath)
                    ) {
                        try {
                            fs.renameSync(
                                tempPath,
                                selectedPath
                            );
                        } catch (_) {}
                    }

                    throw swapError;
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
                    url: publicImageUrl(newProfileKey)
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
            const tree = await requireTree(c, code, userID);

            const [membership] = await c.query(
                `SELECT FamilyTreePersonID
                   FROM FTFamilyTreePersonT
                  WHERE FamilyTreeID=? AND PersonID=? LIMIT 1`,
                [tree.FamilyTreeID, id]
            );
            if (!membership.length) {
                const err = new Error('Person is not in this Family Tree.');
                err.status = 404;
                throw err;
            }

            await c.query(
                `DELETE FROM FTParentT
                  WHERE FamilyTreeID=? AND (PersonID=? OR ParentPersonID=?)`,
                [tree.FamilyTreeID, id, id]
            );
            await c.query(
                `DELETE FROM FTPartnerT
                  WHERE FamilyTreeID=? AND (PersonID=? OR PartnerPersonID=?)`,
                [tree.FamilyTreeID, id, id]
            );
            await c.query(
                `DELETE FROM FTFamilyTreePersonT
                  WHERE FamilyTreeID=? AND PersonID=?`,
                [tree.FamilyTreeID, id]
            );

            const [[remaining]] = await c.query(
                `SELECT COUNT(*) AS n FROM FTFamilyTreePersonT WHERE PersonID=?`,
                [id]
            );

            if (Number(remaining.n) === 0) {
                const [images] = await c.query(
                    `SELECT StorageKey FROM FTImageT WHERE PersonID=?`,
                    [id]
                );
                await c.query(`DELETE FROM FTEventPersonT WHERE PersonID=?`, [id]);
                await c.query(`DELETE FROM FTImageT WHERE PersonID=?`, [id]);
                await c.query(`DELETE FROM FTContactT WHERE PersonID=?`, [id]);
                await c.query(`DELETE FROM FTPersonT WHERE PersonID=?`, [id]);
                images.forEach(x => safelyDeleteImage(x.StorageKey));
                return { message: 'Person deleted.' };
            }

            return { message: 'Person removed from this Family Tree.' };
        });

        res.json(result);
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
