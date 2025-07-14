// File: routes/interestEarned.js
const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const { pool, getNextUserSpecificID } = require('../dbConnection');
const auth = require('../middleware/auth');
const handleValidationErrors = require('../middleware/handleValidationErrors');

// Fetch distinct CompanyNames
router.get('/companies', auth, async (req, res) => {
    const userId = req.user.userId;
    try {
        const [rows] = await pool.query(
            'SELECT DISTINCT CompanyName FROM InterestEarnedT WHERE UserID = ? ORDER BY CompanyName ASC',
            [userId]
        );
        res.json(rows.map(row => row.CompanyName));
    } catch (error) {
        console.error('Error fetching companies:', error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// Fetch ContractNumbers for a CompanyName
router.get('/contracts/:companyName', 
    [
        param('companyName')
            .trim().notEmpty().withMessage('Company name cannot be empty(be)')
            .isLength({ max: 50 }).withMessage('Company name must be 50 characters or less(be)'),
        handleValidationErrors,
        auth
    ],
    async (req, res) => {
        const userId = req.user.userId;
        const { companyName } = req.params;
        try {
            const [rows] = await pool.query(
                'SELECT ContractNumber FROM InterestEarnedT WHERE UserID = ? AND CompanyName = ? ORDER BY ContractNumber ASC',
                [userId, companyName]
            );
            res.json(rows.map(row => row.ContractNumber));
        } catch (error) {
            console.error('Error fetching contracts:', error.message);
            res.status(500).json({ error: 'Database error' });
        }
    }
);

// Fetch all interest records
router.get('/', auth, async (req, res) => {
    const userId = req.user.userId;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM InterestEarnedT WHERE UserID = ? ORDER BY DateOpened DESC',
            [userId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching interest records:', error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// Fetch a specific interest record
router.get('/:userIntErndId',
    [
        param('userIntErndId').isInt({ min: 1 }).withMessage('UserIntErndID must be a positive integer(be)'),
        handleValidationErrors,
        auth
    ],
    async (req, res) => {
        const userId = req.user.userId;
        const { userIntErndId } = req.params;
        try {
            const [results] = await pool.query(
                'SELECT * FROM InterestEarnedT WHERE UserIntErndID = ? AND UserID = ?',
                [userIntErndId, userId]
            );
            if (results.length === 0) {
                return res.status(404).json({ error: 'Interest record not found(be)' });
            }
            res.json(results[0]);
        } catch (error) {
            console.error('Error fetching interest record:', error.message);
            res.status(500).json({ error: 'Database error' });
        }
    }
);

// Add a new interest record
router.post('/',
    [
        body('CompanyName')
            .trim().notEmpty().withMessage('Company name cannot be empty(be)')
            .isLength({ max: 50 }).withMessage('Company name must be 50 characters or less(be)'),
        body('ContractNumber')
            .trim().notEmpty().withMessage('Contract number cannot be empty(be)')
            .isLength({ max: 20 }).withMessage('Contract number must be 20 characters or less(be)'),
        body('DateOpened')
            .isISO8601().withMessage('DateOpened must be a YYYY-MM-DD format(be)'),
        body('Rate')
            .isFloat({ min: 0, max: 100 }).withMessage('Rate must be between 0 and 100(be)'),
        handleValidationErrors,
        auth
    ],
    async (req, res) => {
        const userId = req.user.userId;
        const { CompanyName, ContractNumber, DateOpened, Rate } = req.body;

        try {
            const userIntErndID = await getNextUserSpecificID(userId, 'InterestEarnedT', 'UserIntErndID');
            const [result] = await pool.query(
                `INSERT INTO InterestEarnedT (UserIntErndID, UserID, CompanyName, ContractNumber, DateOpened, Rate)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userIntErndID, userId, CompanyName, ContractNumber, DateOpened, Rate]
            );
            res.status(201).json({ success: true, message: 'Contract added successfully', InterestEarnedID: result.insertId, UserIntErndID: userIntErndID });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Contract already exists' });
            }
            console.error('Error adding interest record:', error.message);
            res.status(500).json({ error: 'Database error' });
        }
    }
);

module.exports = router;