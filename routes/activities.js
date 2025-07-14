// File: routes/activities.js
const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const { pool, getNextUserSpecificID } = require('../dbConnection');
const handleValidationErrors = require('../middleware/handleValidationErrors');
const auth = require('../middleware/auth');
const { handleDbError, withTransaction } = require('../utils');

router.get('/', auth, async (req, res) => {
    const userId = req.user.userId;
    const choice = req.query.choice || 'all';

    let query = 'SELECT ActivityID, Activity, UserActivityID FROM ActivitiesT WHERE UserID = ?';
    let params = [userId];

    if (choice === 'inUse') {
        query = `
            SELECT a.ActivityID, a.Activity, a.UserActivityID, COUNT(wa.WeightActivityID) as countInWeights
            FROM ActivitiesT a
            LEFT JOIN WeightActivitiesT wa ON a.ActivityID = wa.ActivityID AND wa.UserID = ?
            WHERE a.UserID = ?
            GROUP BY a.ActivityID, a.Activity, a.UserActivityID
            HAVING countInWeights > 0;
        `;
        params = [userId, userId];
    } else if (choice === 'notInUse') {
        query = `
            SELECT a.ActivityID, a.Activity, a.UserActivityID, COUNT(wa.WeightActivityID) as countInWeights
            FROM ActivitiesT a
            LEFT JOIN WeightActivitiesT wa ON a.ActivityID = wa.ActivityID AND wa.UserID = ?
            WHERE a.UserID = ?
            GROUP BY a.ActivityID, a.Activity, a.UserActivityID
            HAVING countInWeights = 0;
        `;
        params = [userId, userId];
    }

    try {
        const [results] = await pool.query(query, params);
        res.json(results);
    } catch (err) {
        handleDbError(err, res, 'Error fetching activities');
    }
});

router.get(
    '/:userActivityId',
    [param('userActivityId').isInt({ min: 1 }).withMessage('UserActivityID must be a positive integer(be)')],
    handleValidationErrors,
    auth,
    async (req, res) => {
        const userId = req.user.userId;
        const { userActivityId } = req.params;

        try {
            const [results] = await pool.query(
                'SELECT ActivityID, Activity, UserActivityID FROM ActivitiesT WHERE UserActivityID = ? AND UserID = ?',
                [userActivityId, userId]
            );
            if (results.length === 0) {
                return res.status(404).json({ error: 'Activity not found(be)' });
            }
            res.json(results[0]);
        } catch (err) {
            handleDbError(err, res, 'Error fetching activity');
        }
    }
);

router.get(
    '/:userActivityId/check',
    [param('userActivityId').isInt({ min: 1 }).withMessage('UserActivityID must be a positive integer(be)')],
    handleValidationErrors,
    auth,
    async (req, res) => {
        const userId = req.user.userId;
        const { userActivityId } = req.params;

        try {
            const [activityCheck] = await pool.query(
                'SELECT ActivityID, Activity FROM ActivitiesT WHERE UserActivityID = ? AND UserID = ?',
                [userActivityId, userId]
            );
            if (activityCheck.length === 0) {
                return res.status(404).json({ error: 'Activity not found(be)' });
            }

            const activityId = activityCheck[0].ActivityID;
            const activityName = activityCheck[0].Activity;

            const [inUseResults] = await pool.query(
                'SELECT 1 FROM WeightActivitiesT WHERE ActivityID = ? AND UserID = ? LIMIT 1',
                [activityId, userId]
            );

            res.json({
                id: userActivityId,
                activity: activityName,
                inUse: inUseResults.length > 0
            });
        } catch (err) {
            handleDbError(err, res, 'Error checking activity usage');
        }
    }
);

router.post(
    '/',
    [
        body('activity')
            .isLength({ max: 50 }).withMessage('Activity name must be 50 characters or less(be)')
            .trim().notEmpty().withMessage('Activity name cannot be empty(be)'),
    ],
    handleValidationErrors,
    auth,
    async (req, res) => {
        const userId = req.user.userId;
        const { activity } = req.body;

        try {
            await withTransaction(async (connection) => {
                const [existing] = await connection.query(
                    'SELECT 1 FROM ActivitiesT WHERE Activity = ? AND UserID = ?',
                    [activity, userId]
                );
                if (existing.length > 0) {
                    return res.status(400).json({ error: 'Activity Name already exists. Please enter a unique name.(be)' });
                }

                const userActivityId = await getNextUserSpecificID(userId, 'ActivitiesT', 'UserActivityID');
                const [result] = await connection.query(
                    'INSERT INTO ActivitiesT (Activity, UserID, UserActivityID) VALUES (?, ?, ?)',
                    [activity, userId, userActivityId]
                );
                res.status(201).json({ message: 'Activity added successfully', id: result.insertId });
            });
        } catch (err) {
            handleDbError(err, res, 'Error adding activity');
        }
    }
);

router.put(
    '/:userActivityId',
    [
        param('userActivityId').isInt({ min: 1 }).withMessage('UserActivityID must be a positive integer(be)'),
        body('activity')
            .isLength({ max: 50 }).withMessage('Activity name must be 50 characters or less(be)')
            .trim().notEmpty().withMessage('Activity name cannot be empty(be)')
            .optional({ nullable: true }),
    ],
    handleValidationErrors,
    auth,
    async (req, res) => {
        const userId = req.user.userId;
        const { userActivityId } = req.params;
        const { activity } = req.body;

        if (!activity) {
            return res.status(400).json({ error: 'Activity field must be provided for the update(be)' });
        }

        try {
            await withTransaction(async (connection) => {
                const [checkResults] = await connection.query(
                    'SELECT 1 FROM ActivitiesT WHERE UserActivityID = ? AND UserID = ?',
                    [userActivityId, userId]
                );
                if (checkResults.length === 0) {
                    return res.status(404).json({ error: 'Activity not found(be)' });
                }

                const [duplicateCheck] = await connection.query(
                    'SELECT 1 FROM ActivitiesT WHERE Activity = ? AND UserID = ? AND UserActivityID != ?',
                    [activity, userId, userActivityId]
                );
                if (duplicateCheck.length > 0) {
                    return res.status(400).json({ error: 'Activity Name already exists. Please enter a unique name.' });
                }

                const [result] = await connection.query(
                    `UPDATE ActivitiesT SET Activity = ? WHERE UserActivityID = ? AND UserID = ?`,
                    [activity, userActivityId, userId]
                );
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Activity not found(be)' });
                }
                res.status(204).send();
            });
        } catch (err) {
            handleDbError(err, res, 'Error updating activity');
        }
    }
);

router.delete(
    '/:userActivityId',
    [param('userActivityId').isInt({ min: 1 }).withMessage('UserActivityID must be a positive integer(be)')],
    handleValidationErrors,
    auth,
    async (req, res) => {
        const userId = req.user.userId;
        const { userActivityId } = req.params;

        try {
            await withTransaction(async (connection) => {
                const [checkResults] = await connection.query(
                    'SELECT 1 FROM ActivitiesT WHERE UserActivityID = ? AND UserID = ?',
                    [userActivityId, userId]
                );
                if (checkResults.length === 0) {
                    return res.status(404).json({ error: 'Activity not found(be)' });
                }

                await connection.query(
                    'DELETE FROM ActivitiesT WHERE UserActivityID = ? AND UserID = ?',
                    [userActivityId, userId]
                );
                res.status(204).send();
            });
        } catch (err) {
            handleDbError(err, res, 'Error deleting activity');
        }
    }
);

module.exports = router;