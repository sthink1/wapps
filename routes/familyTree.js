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
    try {
        const sql =
            personSelectSql(`
                JOIN FTFamilyTreePersonT ftp
                  ON ftp.PersonID = p.PersonID
                JOIN FTFamilyTreeUserT ftu
                  ON ftu.FamilyTreeID = ftp.FamilyTreeID
                WHERE ftu.UserID=? AND ftu.IsActive=1
            `) +
            ` GROUP BY p.PersonID
              ORDER BY p.LastName,p.FirstName,p.MiddleName,p.PersonID`;

        const [rows] = await pool.query(sql, [req.user.userId]);

        res.json({ persons: rows });
    } catch (e) {
        res.status(500).json({ message: e.message });
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

router.get('/persons/:id/events', auth, async (req, res) => {
    const id = Number(req.params.id);
    const code = String(req.query.familyTreeCode || '');

    try {
        const c = await pool.getConnection();

        try {
            await requireTree(c, code, req.user.userId);

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

                fs.mkdirSync(
                    path.join(__dirname, '..', 'httpdocs', 'images'),
                    { recursive: true }
                );

                fs.writeFileSync(filePath, req.file.buffer);

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
