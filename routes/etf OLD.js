const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const logger = require('../logger');

const pool = require('../dbConnection');
const { withTransaction } = require('../utils');
const auth = require('../middleware/auth');
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

/* =====================================================
   POST /etf/category
===================================================== */
router.post(
    '/category',
    auth,
    [ body('category').trim().notEmpty() ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Invalid input (be)" });
        }

        const { category } = req.body;
        const userId = req.user.userId;

        try {

            await withTransaction(async (connection) => {

                const [existing] = await connection.query(
                    `SELECT 1 FROM etfCategoryT
                     WHERE category = ?
                     AND UserID = ?`,
                    [category, userId]
                );

                if (existing.length > 0) {
                    throw new Error("Category already exists (be)");
                }

                await connection.query(
                    `INSERT INTO etfCategoryT
                     (category, UserID)
                     VALUES (?, ?)`,
                    [category, userId]
                );

                res.json({ message: "Category saved" });

            });

        } catch (err) {

            if (err.message.endsWith("(be)")) {
                return res.status(400).json({ message: err.message });
            }

            logger.error(`POST /etf/category: ${err.message}`);
            res.status(500).json({ message: "Server error (be)" });
        }
    }
);

/* =====================================================
   GET /etf/category
===================================================== */
router.get('/category', auth, async (req, res) => {

    const userId = req.user.userId;

    try {

        await withTransaction(async (connection) => {

            const [rows] = await connection.query(
                `SELECT etfCategoryID, category
                 FROM etfCategoryT
                 WHERE UserID = ?
                 ORDER BY category ASC`,
                [userId]
            );

            res.json({ message: "Success", data: rows });

        });

    } catch (err) {
        logger.error(`GET /etf/category: ${err.message}`);
        res.status(500).json({ message: "Server error (be)" });
    }
});

/* =====================================================
   PUT /etf/category
===================================================== */
router.put(
    '/category/:id',
    auth,
    [ body('category').trim().notEmpty() ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Invalid input (be)" });
        }

        const userId = req.user.userId;
        const categoryID = req.params.id;
        const { category } = req.body;

        try {

            await withTransaction(async (connection) => {

                const [result] = await connection.query(
                    `UPDATE etfCategoryT
                     SET category = ?
                     WHERE etfCategoryID = ?
                     AND UserID = ?`,
                    [category, categoryID, userId]
                );

                if (result.affectedRows === 0) {
                    throw new Error("Category not found (be)");
                }

                res.json({ message: "Category updated" });

            });

        } catch (err) {
            if (err.message.endsWith("(be)")) {
                return res.status(400).json({ message: err.message });
            }
            logger.error(`PUT /etf/category/:id: ${err.message}`);
            res.status(500).json({ message: "Server error (be)" });
        }
    }
);

/* =====================================================
   DELETE /etf/category
===================================================== */
router.delete('/category/:id', auth, async (req, res) => {

    const userId = req.user.userId;
    const categoryID = req.params.id;

    try {

        await withTransaction(async (connection) => {

         
         /* ---- Check for existing symbols ---- */
            const [symbols] = await connection.query(
                `SELECT COUNT(*) AS count
                 FROM etfSymbolT
                 WHERE etfCategoryID = ?
                 AND UserID = ?`,
                [categoryID, userId]
            );

            if (symbols[0].count > 0) {
                throw new Error(
                    "Cannot delete category with existing symbols (be)"
                );
            }

            const [result] = await connection.query(
                `DELETE FROM etfCategoryT
                 WHERE etfCategoryID = ?
                 AND UserID = ?`,
                [categoryID, userId]
            );

            if (result.affectedRows === 0) {
                throw new Error("Category not found (be)");
            }

            res.json({ message: "Category deleted" });

        });

    } catch (err) {

        if (err.message.endsWith("(be)")) {
            return res.status(400).json({ message: err.message });
        }

        logger.error(`DELETE /etf/category/:id: ${err.message}`);
        res.status(500).json({ message: "Server error (be)" });
    }
});


/* =====================================================
   POST /etf/symbol
===================================================== */
router.post(
    '/symbol',
    auth,
    [
        body('symbol').trim().notEmpty(),
        body('etfCategoryID').isInt()
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Invalid input (be)" });
        }

        const { symbol, etfCategoryID } = req.body;
        const userId = req.user.userId;

        try {

            await withTransaction(async (connection) => {

                const upperSymbol = symbol.toUpperCase();

                
                /* ---- Duplicate Check ---- */
                const [existing] = await connection.query(
                    `SELECT 1 FROM etfSymbolT
                     WHERE symbol = ?
                     AND UserID = ?`,
                    [upperSymbol, userId]
                );

                if (existing.length > 0) {
                    throw new Error("Symbol already exists (be)");
                }

                /* ---- Validate via Polygon ---- */
                let name = null;
                let listDate = null;

                try {

                    const url = `https://api.polygon.io/v3/reference/tickers/${upperSymbol}?apiKey=${POLYGON_API_KEY}`;

                    const response = await axios.get(url);

                    if (
                        response.data.status !== "OK" ||
                        !response.data.results ||
                        response.data.results.active !== true
                    ) {
                        throw new Error("Symbol not found. Please check symbol entered.(be)");
                    }

                    name = response.data.results.name;
                    listDate = response.data.results.list_date || null;

                    if (!name) {
                        throw new Error("Symbol not found. Please check symbol entered.(be)");
                    }

                } catch (err) {

                   
                   // If Polygon returned 404 (invalid symbol)
                    if (err.response && err.response.status === 404) {
                        throw new Error("Symbol not found. Please check symbol entered.(be)");
                    }

                    
                    // For everything else, treat it the same way
                    logger.error(`Polygon validation error for ${upperSymbol}: ${err.message}`);
                    throw new Error("Symbol not found. Please check symbol entered.(be)");
                }

                
                /* ---- Insert ---- */
                await connection.query(
                    `INSERT INTO etfSymbolT
                     (symbol, name, listDate, etfCategoryID, UserID)
                     VALUES (?, ?, ?, ?, ?)`,
                    [upperSymbol, name, listDate, etfCategoryID, userId]
                );

                res.json({
                    message: "Symbol saved",
                    data: { symbol: upperSymbol, name, listDate }
                });

            });

        } catch (err) {

            if (err.message.endsWith("(be)")) {
                return res.status(400).json({ message: err.message });
            }

            logger.error(`POST /etf/symbol: ${err.message}`);
            return res.status(500).json({ message: "Server error (be)" });
        }
    }
);


/* =====================================================
   GET /etf/symbol
===================================================== */
router.get('/symbol', auth, async (req, res) => {

    const userId = req.user.userId;

    try {

        await withTransaction(async (connection) => {

            const [rows] = await connection.query(
                `SELECT s.etfSymbolID,
                        s.symbol,
                        s.name,
                        s.listDate,
                        c.category,
                        s.etfCategoryID
                 FROM etfSymbolT s
                 JOIN etfCategoryT c
                   ON s.etfCategoryID = c.etfCategoryID
                 WHERE s.UserID = ?
                 ORDER BY s.symbol ASC`,
                [userId]
            );

            res.json({ message: "Success", data: rows });

        });

    } catch (err) {
        logger.error(`GET /etf/symbol: ${err.message}`);
        res.status(500).json({ message: "Server error (be)" });
    }
});


/* =====================================================
   PUT /etf/symbol/:id
   Update category only
   ===================================================== */
router.put(
    '/symbol/:id',
    auth,
    [ body('etfCategoryID').isInt() ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Invalid input (be)" });
        }

        const userId = req.user.userId;
        const symbolID = req.params.id;
        const { etfCategoryID } = req.body;

        try {

            await withTransaction(async (connection) => {

                const [result] = await connection.query(
                    `UPDATE etfSymbolT
                     SET etfCategoryID = ?
                     WHERE etfSymbolID = ?
                     AND UserID = ?`,
                    [etfCategoryID, symbolID, userId]
                );

                if (result.affectedRows === 0) {
                    throw new Error("Symbol not found (be)");
                }

                res.json({ message: "Symbol updated" });

            });

        } catch (err) {
            if (err.message.endsWith("(be)")) {
                return res.status(400).json({ message: err.message });
            }
            logger.error(`PUT /etf/symbol/:id: ${err.message}`);
            res.status(500).json({ message: "Server error (be)" });
        }
    }
);


/* =====================================================
   DELETE /etf/symbol/:id

7-Year Rule Placeholder
===================================================== */
router.delete('/symbol/:id', auth, async (req, res) => {

    const userId = req.user.userId;
    const symbolID = req.params.id;

    try {

        await withTransaction(async (connection) => {


            /* ---- Future 7-Year Rule ---- */
            /*
            const [activity] = await connection.query(
                `SELECT COUNT(*) AS count
                 FROM etfActivityT
                 WHERE etfSymbolID = ?
                 AND UserID = ?
                 AND activityDate >= DATE_SUB(CURDATE(), INTERVAL 7 YEAR)`,
                [symbolID, UserID]
            );

            if (activity[0].count > 0) {
                throw new Error(
                    "Cannot delete symbol with activity in last 7 years (be)"
                );
            }
            */
            const [result] = await connection.query(
                `DELETE FROM etfSymbolT
                 WHERE etfSymbolID = ?
                 AND UserID = ?`,
                [symbolID, userId]
            );

            if (result.affectedRows === 0) {
                throw new Error("Symbol not found (be)");
            }

            res.json({ message: "Symbol deleted" });

        });

    } catch (err) {

        if (err.message.endsWith("(be)")) {
            return res.status(400).json({ message: err.message });
        }

        logger.error(`DELETE /etf/symbol/:id: ${err.message}`);
        res.status(500).json({ message: "Server error (be)" });
    }
});


module.exports = router;