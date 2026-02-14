const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, validationResult } = require('express-validator');

const pool = require('../dbConnection');
const { withTransaction } = require('../utils');
const auth = require('../auth');


/* =====================================================
   POST /etf/symbol
   Create ETF Symbol
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
            return res.status(400).json({
                message: "Invalid input (be)"
            });
        }

        const { symbol, etfCategoryID } = req.body;
        const UserID = req.user.UserID;

        try {

            await withTransaction(pool, async (connection) => {

                /* ---- Check Duplicate ---- */
                const [existing] = await connection.query(
                    `SELECT 1
                     FROM etfSymbolT
                     WHERE symbol = ?
                     AND UserID = ?`,
                    [symbol.toUpperCase(), UserID]
                );

                if (existing.length > 0) {
                    throw new Error("Symbol already exists (be)");
                }

                /* ---- Verify via Yahoo ---- */
                let valid = 0;
                let name = null;

                try {
                    const url =
                        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;

                    const response = await axios.get(url);

                    if (
                        response.data &&
                        response.data.quoteResponse &&
                        response.data.quoteResponse.result.length > 0
                    ) {
                        valid = 1;
                        name =
                            response.data.quoteResponse.result[0].longName ||
                            response.data.quoteResponse.result[0].shortName ||
                            null;
                    }

                } catch (apiError) {
                    // If API fails, symbol simply marked invalid
                    valid = 0;
                }

                /* ---- Insert ---- */
                await connection.query(
                    `INSERT INTO etfSymbolT
                     (symbol, name, valid, etfCategoryID, UserID)
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        symbol.toUpperCase(),
                        name,
                        valid,
                        etfCategoryID,
                        UserID
                    ]
                );

                res.json({
                    message: "Symbol saved",
                    data: {
                        symbol: symbol.toUpperCase(),
                        name,
                        valid
                    }
                });

            });

        } catch (err) {

            if (err.message.endsWith("(be)")) {
                return res.status(400).json({ message: err.message });
            }

            console.error(err);
            return res.status(500).json({
                message: "Server error (be)"
            });
        }
    }
);

module.exports = router;
