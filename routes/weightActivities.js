const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const { pool } = require('../dbConnection');
const handleValidationErrors = require('../middleware/handleValidationErrors');
const auth = require('../middleware/auth');

// GET all weight activities for the authenticated user
router.get('/', auth, async (req, res) => {
    const userId = req.user.userId;

    try {
        const [results] = await pool.query(
            'SELECT * FROM WeightActivitiesT WHERE UserID = ?',
            [userId]
        );
        res.json(results);
    } catch (err) {
        console.error('Error fetching weight activities:', err.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST a new weight activity with a constraint of maximum 5 activities per weight entry
router.post(
    '/',
    [
        body('weightID')
            .isInt({ min: 1 }).withMessage('WeightID must be a positive integer(be)'),
        body('activityID')
            .isInt({ min: 1 }).withMessage('ActivityID must be a positive integer(be)'),
    ],
    handleValidationErrors,
    auth,
    async (req, res) => {
        const userId = req.user.userId;
        const { weightID, activityID } = req.body;

        try {
            // Verify that the WeightID and ActivityID belong to the user
            const [weightCheck] = await pool.query(
                'SELECT 1 FROM WeightsT WHERE WeightID = ? AND UserID = ?',
                [weightID, userId]
            );
            if (weightCheck.length === 0) {
                return res.status(400).json({ error: 'WeightID does not exist(be)' });
            }

            const [activityCheck] = await pool.query(
                'SELECT 1 FROM ActivitiesT WHERE ActivityID = ? AND UserID = ?',
                [activityID, userId]
            );
            if (activityCheck.length === 0) {
                return res.status(400).json({ error: 'ActivityID does not exist(be)' });
            }

            // Query to count the number of activities for the given weightID
            const [countResults] = await pool.query(
                'SELECT COUNT(*) AS activityCount FROM WeightActivitiesT WHERE WeightID = ? AND UserID = ?',
                [weightID, userId]
            );
            const activityCount = countResults[0].activityCount;

            // Enforce the limit of 5 activities per weight entry
            if (activityCount >= 5) {
                return res.status(400).json({ error: 'A weight entry cannot have more than 5 activities(be)' });
            }

            // Insert the new weight activity
            const [result] = await pool.query(
                'INSERT INTO WeightActivitiesT (WeightID, ActivityID, UserID) VALUES (?, ?, ?)',
                [weightID, activityID, userId]
            );
            res.status(201).json({ message: 'Weight activity added successfully', id: result.insertId });
        } catch (err) {
            console.error('Error adding weight activity:', err.message);
            res.status(500).json({ error: 'Database error' });
        }
    }
);

// DELETE a weight activity for the authenticated user
router.delete(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer(be)'),
    ],
    handleValidationErrors,
    auth,
    async (req, res) => {
        const userId = req.user.userId;
        const { id } = req.params;

        try {
            // Check if the record exists and belongs to the user
            const [checkResults] = await pool.query(
                'SELECT 1 FROM WeightActivitiesT WHERE WeightActivityID = ? AND UserID = ?',
                [id, userId]
            );
            if (checkResults.length === 0) {
                return res.status(404).json({ error: 'Weight activity not found(be)' });
            }

            // Delete the record
            await pool.query(
                'DELETE FROM WeightActivitiesT WHERE WeightActivityID = ? AND UserID = ?',
                [id, userId]
            );
            res.status(204).send();
        } catch (err) {
            console.error('Error deleting weight activity:', err.message);
            res.status(500).json({ error: 'Database error' });
        }
    }
);

// New endpoint to delete all weight activities for a given WeightID
router.delete(
    '/by-weight/:weightId',
    [
        param('weightId').isInt({ min: 1 }).withMessage('WeightID must be a positive integer(be)'),
    ],
    handleValidationErrors,
    auth,
    async (req, res) => {
        const userId = req.user.userId;
        const { weightId } = req.params;

        try {
            // Check if the WeightID exists and belongs to the user
            const [weightCheck] = await pool.query(
                'SELECT 1 FROM WeightsT WHERE WeightID = ? AND UserID = ?',
                [weightId, userId]
            );
            if (weightCheck.length === 0) {
                return res.status(404).json({ error: 'WeightID not found(be)' });
            }

            // Delete all WeightActivitiesT records for the WeightID
            await pool.query(
                'DELETE FROM WeightActivitiesT WHERE WeightID = ? AND UserID = ?',
                [weightId, userId]
            );
            res.status(204).send();
        } catch (err) {
            console.error('Error deleting weight activities by WeightID:', err.message);
            res.status(500).json({ error: 'Database error' });
        }
    }
);

// UPDATE a weight activity for the authenticated user
router.put(
    '/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer(be)'),
        body('weightID')
            .isInt({ min: 1 }).withMessage('WeightID must be a positive integer(be)')
            .optional({ nullable: true }),
        body('activityID')
            .isInt({ min: 1 }).withMessage('ActivityID must be a positive integer(be)')
            .optional({ nullable: true }),
    ],
    handleValidationErrors,
    auth,
    async (req, res) => {
        const userId = req.user.userId;
        const { id } = req.params;
        const { weightID, activityID } = req.body;

        // Ensure at least one field is provided for the update
        if (!weightID && !activityID) {
            return res.status(400).json({ error: 'At least one field (weightID or activityID) must be provided for the update(be)' });
        }

        try {
            // Check if the weight activity exists and belongs to the user
            const [checkResults] = await pool.query(
                'SELECT 1 FROM WeightActivitiesT WHERE WeightActivityID = ? AND UserID = ?',
                [id, userId]
            );
            if (checkResults.length === 0) {
                return res.status(404).json({ error: 'Weight activity not found(be)' });
            }

            // Validate new WeightID and ActivityID if provided
            if (weightID) {
                const [weightCheck] = await pool.query(
                    'SELECT 1 FROM WeightsT WHERE WeightID = ? AND UserID = ?',
                    [weightID, userId]
                );
                if (weightCheck.length === 0) {
                    return res.status(400).json({ error: 'WeightID does not exist(be)' });
                }

                // Check the activity count for the new WeightID
                const [countResults] = await pool.query(
                    'SELECT COUNT(*) AS activityCount FROM WeightActivitiesT WHERE WeightID = ? AND UserID = ? AND WeightActivityID != ?',
                    [weightID, userId, id]
                );
                const activityCount = countResults[0].activityCount;
                if (activityCount >= 5) {
                    return res.status(400).json({ error: 'The new WeightID cannot have more than 5 activities(be)' });
                }
            }

            if (activityID) {
                const [activityCheck] = await pool.query(
                    'SELECT 1 FROM ActivitiesT WHERE ActivityID = ? AND UserID = ?',
                    [activityID, userId]
                );
                if (activityCheck.length === 0) {
                    return res.status(400).json({ error: 'ActivityID does not exist(be)' });
                }
            }

            // Dynamically build the query based on provided fields
            const fields = [];
            const values = [];

            if (weightID) {
                fields.push('WeightID = ?');
                values.push(weightID);
            }
            if (activityID) {
                fields.push('ActivityID = ?');
                values.push(activityID);
            }
            values.push(id, userId);

            const query = `UPDATE WeightActivitiesT SET ${fields.join(', ')} WHERE WeightActivityID = ? AND UserID = ?`;

            const [result] = await connection.query(query, values);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Weight activity not found(be)' });
            }
            res.status(204).send();
        } catch (err) {
            console.error('Error updating weight activity:', err.message);
            res.status(500).json({ error: 'Database error' });
        }
    }
);

module.exports = router;