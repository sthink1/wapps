// File: routes/weights.js
const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();
const { pool, getNextUserSpecificID } = require('../dbConnection');
const auth = require('../middleware/auth');
const { handleDbError, withTransaction } = require('../utils');
const logger = require('../logger');

router.get('/', 
    auth,
    [
        query('startDate')
            .optional()
            .isISO8601().withMessage('startDate must be YYYY-MM-DD format(be)'),
        query('endDate')
            .optional()
            .isISO8601().withMessage('endDate must be YYYY-MM-DD format(be)')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const userId = req.user.userId;
        const { startDate, endDate } = req.query;

        let query = `SELECT WeightID, DateWeight, Weight, UserWeightID 
                     FROM WeightsT 
                     WHERE UserID = ?`;
        const params = [userId];

        if (startDate && endDate) {
            query += ` AND DateWeight BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        } else if (startDate) {
            query += ` AND DateWeight >= ?`;
            params.push(startDate);
        } else if (endDate) {
            query += ` AND DateWeight <= ?`;
            params.push(endDate);
        }

        query += ` ORDER BY DateWeight ASC`;

        try {
            const [rows] = await pool.query(query, params);
            res.json(rows);
        } catch (error) {
            handleDbError(error, res, 'Error fetching weights');
        }
    }
);

router.get(
    '/search',
    auth,
    [
        query('weight')
            .optional()
            .isFloat({ min: 1, max: 1000 }).withMessage('Weight must be between 1 and 1000(be)'),
        query('activity')
            .optional()
            .trim().notEmpty().withMessage('Activity name cannot be empty(be)')
            .isLength({ max: 50 }).withMessage('Activity name must be 50 characters or less(be)'),
        query('date')
            .optional()
            .isISO8601().withMessage('Date must be YYYY-MM-DD format(be)')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const userId = req.user.userId;
        const { weight, activity, date } = req.query;

        // Validate exactly one parameter is provided
        const providedParams = [weight, activity, date].filter(param => param !== undefined).length;
        if (providedParams !== 1) {
            return res.status(400).json({ error: 'Exactly one search criterion (weight, activity, or date) must be provided(be)' });
        }

        let query = `
            SELECT DISTINCT w.WeightID, w.DateWeight, w.Weight, w.UserWeightID 
            FROM WeightsT w
        `;
        const params = [userId];

        if (weight) {
            query += ` WHERE w.UserID = ? AND w.Weight = ?`;
            params.push(parseFloat(weight));
        } else if (date) {
            query += ` WHERE w.UserID = ? AND w.DateWeight = ?`;
            params.push(date);
        } else if (activity) {
            query += `
                LEFT JOIN WeightActivitiesT wa ON w.WeightID = wa.WeightID
                LEFT JOIN ActivitiesT a ON wa.ActivityID = a.ActivityID
                WHERE w.UserID = ? AND a.Activity = ? AND a.UserID = ?
            `;
            params.push(activity, userId);
        }

        query += ` ORDER BY w.DateWeight ASC`;

        try {
            const [rows] = await pool.query(query, params);
            res.json(rows);
        } catch (error) {
            handleDbError(error, res, 'Error searching weights');
        }
    }
);

router.get(
    '/:userWeightId',
    auth,
    [
        param('userWeightId').isInt({ min: 1 }).withMessage('UserWeightID must be a positive integer(be)')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const userId = req.user.userId;
        const { userWeightId } = req.params;

        try {
            const [results] = await pool.query(
                'SELECT WeightID, DateWeight, Weight, UserWeightID FROM WeightsT WHERE UserWeightID = ? AND UserID = ?',
                [userWeightId, userId]
            );
            if (results.length === 0) {
                return res.status(404).json({ error: 'Weight not found(be)' });
            }
            res.json(results[0]);
        } catch (err) {
            handleDbError(err, res, 'Error fetching weight by UserWeightID');
        }
    }
);

router.post('/', 
    auth,
    [
        body('DateWeight')
            .isISO8601().withMessage('DateWeight must be a YYYY-MM-DD format(be)'),
        body('Weight')
            .isFloat({ min: 1, max: 1000 }).withMessage('Weight must be between 1 and 1000(be)'),
        body('Activities')
            .isArray({ min: 0, max: 5 }).withMessage('Must provide 0 to 5 activities(be)'),
        body('Activities.*.ActivityName')
            .trim().notEmpty().withMessage('Activity name cannot be empty(be)')
            .isLength({ max: 50 }).withMessage('Activity name must be 50 characters or less(be)')
            .optional(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const userId = req.user.userId;
        const { DateWeight, Weight, Activities = [] } = req.body;

        const activityNames = Activities.map(a => a.ActivityName);
        const uniqueActivities = new Set(activityNames);
        if (uniqueActivities.size !== activityNames.length) {
            return res.status(400).json({ error: 'Activities must be unique(be)' });
        }

        try {
            await withTransaction(async (connection) => {
                const userWeightID = await getNextUserSpecificID(userId, 'WeightsT', 'UserWeightID');
                const [weightResult] = await connection.query(
                    `INSERT INTO WeightsT (DateWeight, Weight, UserID, UserWeightID) 
                     VALUES (?, ?, ?, ?)`,
                    [DateWeight, Weight, userId, userWeightID]
                );
                const weightId = weightResult.insertId;

                for (const activity of Activities) {
                    const { ActivityName } = activity;
                    let [activityResult] = await connection.query(
                        'SELECT ActivityID FROM ActivitiesT WHERE Activity = ? AND UserID = ?',
                        [ActivityName, userId]
                    );

                    let activityId;
                    if (activityResult.length === 0) {
                        const userActivityID = await getNextUserSpecificID(userId, 'ActivitiesT', 'UserActivityID');
                        const [newActivity] = await connection.query(
                            'INSERT INTO ActivitiesT (Activity, UserID, UserActivityID) VALUES (?, ?, ?)',
                            [ActivityName, userId, userActivityID]
                        );
                        activityId = newActivity.insertId;
                    } else {
                        activityId = activityResult[0].ActivityID;
                    }

                    await connection.query(
                        `INSERT INTO WeightActivitiesT (WeightID, ActivityID, UserID) 
                         VALUES (?, ?, ?)`,
                        [weightId, activityId, userId]
                    );
                }

                res.status(201).json({ success: true, message: 'Weight added successfully', WeightID: weightId, UserWeightID: userWeightID });
            });
        } catch (error) {
            handleDbError(error, res, 'Error adding weight');
        }
    }
);

router.delete(
    '/range',
    auth,
    [
        body('startDate')
            .isISO8601().withMessage('startDate must be a YYYY-MM-DD format(be)'),
        body('endDate')
            .isISO8601().withMessage('endDate must be a YYYY-MM-DD format(be)')
    ],
    async (req, res) => {
        logger.info(`Handling DELETE /weights/range with body: ${JSON.stringify(req.body)}`);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const userId = req.user.userId;
        const { startDate, endDate } = req.body;

        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ error: 'startDate cannot be after endDate(be)' });
        }

        try {
            await withTransaction(async (connection) => {
                const [weights] = await connection.query(
                    'SELECT WeightID FROM WeightsT WHERE UserID = ? AND DateWeight BETWEEN ? AND ?',
                    [userId, startDate, endDate]
                );
                if (weights.length === 0) {
                    return res.status(404).json({ error: 'No weights found in the specified date range(be)' });
                }

                const weightIds = weights.map(w => w.WeightID);

                await connection.query(
                    'DELETE FROM WeightActivitiesT WHERE WeightID IN (?) AND UserID = ?',
                    [weightIds, userId]
                );

                const [result] = await connection.query(
                    'DELETE FROM WeightsT WHERE WeightID IN (?) AND UserID = ?',
                    [weightIds, userId]
                );

                res.status(200).json({ success: true, message: `${result.affectedRows} weight entries deleted successfully` });
            });
        } catch (error) {
            handleDbError(error, res, 'Error deleting weights in range');
        }
    }
);

router.delete(
    '/:id',
    auth,
    [param('id').isInt().withMessage('ID must be an integer(be)')],
    async (req, res) => {
        logger.info(`Handling DELETE /weights/:id with id=${req.params.id}`);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const userId = req.user.userId;
        const weightId = req.params.id;

        try {
            await withTransaction(async (connection) => {
                const [result] = await connection.query(
                    `DELETE FROM WeightsT WHERE WeightID = ? AND UserID = ?`,
                    [weightId, userId]
                );
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Weight not found(be)' });
                }
                res.json({ message: 'Weight deleted successfully (UserWeightID unchanged)' });
            });
        } catch (error) {
            handleDbError(error, res, 'Error deleting weight');
        }
    }
);

router.put(
    '/:id',
    auth,
    [
        param('id').isInt().withMessage('ID must be an integer(be)'),
        body('DateWeight')
            .isISO8601().withMessage('DateWeight must be a valid date(be)')
            .optional({ nullable: true }),
        body('Weight')
            .isFloat({ min: 1, max: 1000 }).withMessage('Weight must be between 1 and 1000(be)')
            .optional({ nullable: true })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const userId = req.user.userId;
        const weightId = req.params.id;
        const { DateWeight, Weight } = req.body;

        if (!DateWeight && Weight === undefined) {
            return res.status(400).json({ error: 'At least one field required(be)' });
        }

        try {
            await withTransaction(async (connection) => {
                if (DateWeight) {
                    const [existing] = await connection.query(
                        'SELECT 1 FROM WeightsT WHERE DateWeight = ? AND UserID = ? AND WeightID != ?',
                        [DateWeight, userId, weightId]
                    );
                    if (existing.length > 0) {
                        return res.status(400).json({ error: 'Date already exists(be)' });
                    }
                }

                const fields = [];
                const values = [];
                if (DateWeight) {
                    fields.push('DateWeight = ?');
                    values.push(DateWeight);
                }
                if (Weight !== undefined) {
                    fields.push('Weight = ?');
                    values.push(Weight);
                }
                values.push(weightId, userId);

                const query = `UPDATE WeightsT SET ${fields.join(', ')} WHERE WeightID = ? AND UserID = ?`;
                const [result] = await connection.query(query, values);
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Weight not found(be)' });
                }
                res.status(204).send();
            });
        } catch (error) {
            handleDbError(error, res, 'Error updating weight');
        }
    }
);

router.put(
    '/:userWeightId/full',
    auth,
    [
        param('userWeightId').isInt({ min: 1 }).withMessage('UserWeightID must be a positive integer(be)'),
        body('DateWeight')
            .isISO8601().withMessage('DateWeight must be a YYYY-MM-DD format(be)')
            .optional({ nullable: true }),
        body('Weight')
            .isFloat({ min: 1, max: 1000 }).withMessage('Weight must be between 1 and 1000(be)')
            .optional({ nullable: true }),
        body('Activities')
            .isArray({ min: 0, max: 5 }).withMessage('Must provide 0 to 5 activities(be)')
            .optional(),
        body('Activities.*.ActivityName')
            .trim().notEmpty().withMessage('Activity name cannot be empty(be)')
            .isLength({ max: 50 }).withMessage('Activity name must be 50 characters or less(be)')
            .optional()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const userId = req.user.userId;
        const { userWeightId } = req.params;
        const { DateWeight, Weight, Activities = [] } = req.body;

        const activityNames = Activities.map(a => a.ActivityName);
        const uniqueActivities = new Set(activityNames);
        if (uniqueActivities.size !== activityNames.length) {
            return res.status(400).json({ error: 'Activities must be unique(be)' });
        }

        try {
            await withTransaction(async (connection) => {
                const [weightResults] = await connection.query(
                    'SELECT WeightID, DateWeight, Weight FROM WeightsT WHERE UserWeightID = ? AND UserID = ?',
                    [userWeightId, userId]
                );
                if (weightResults.length === 0) {
                    return res.status(404).json({ error: 'Weight not found(be)' });
                }
                const weight = weightResults[0];
                const weightId = weight.WeightID;
                const originalDateWeight = weight.DateWeight;

                if (DateWeight && DateWeight !== originalDateWeight) {
                    const [existing] = await connection.query(
                        'SELECT 1 FROM WeightsT WHERE DateWeight = ? AND UserID = ? AND WeightID != ?',
                        [DateWeight, userId, weightId]
                    );
                    if (existing.length > 0) {
                        return res.status(400).json({ error: 'Date already exists(be)' });
                    }
                }

                let updated = false;
                const fields = [];
                const values = [];
                if (DateWeight && DateWeight !== originalDateWeight) {
                    fields.push('DateWeight = ?');
                    values.push(DateWeight);
                    updated = true;
                }
                if (Weight !== undefined && Weight !== weight.Weight) {
                    fields.push('Weight = ?');
                    values.push(Weight);
                    updated = true;
                }
                if (fields.length > 0) {
                    values.push(weightId, userId);
                    await connection.query(
                        `UPDATE WeightsT SET ${fields.join(', ')} WHERE WeightID = ? AND UserID = ?`,
                        values
                    );
                }

                const [currentActivities] = await connection.query(
                    'SELECT ActivityID FROM WeightActivitiesT WHERE WeightID = ? AND UserID = ?',
                    [weightId, userId]
                );
                const currentActivityIds = currentActivities.map(a => a.ActivityID);

                const newActivityIds = [];
                for (const activity of Activities) {
                    const { ActivityName } = activity;
                    let [activityResult] = await connection.query(
                        'SELECT ActivityID FROM ActivitiesT WHERE Activity = ? AND UserID = ?',
                        [ActivityName, userId]
                    );

                    let activityId;
                    if (activityResult.length === 0) {
                        const userActivityID = await getNextUserSpecificID(userId, 'ActivitiesT', 'UserActivityID');
                        const [newActivity] = await connection.query(
                            'INSERT INTO ActivitiesT (Activity, UserID, UserActivityID) VALUES (?, ?, ?)',
                            [ActivityName, userId, userActivityID]
                        );
                        activityId = newActivity.insertId;
                    } else {
                        activityId = activityResult[0].ActivityID;
                    }
                    newActivityIds.push(activityId);
                }

                const activitiesToDelete = currentActivityIds.filter(id => !newActivityIds.includes(id));
                if (activitiesToDelete.length > 0) {
                    await connection.query(
                        'DELETE FROM WeightActivitiesT WHERE WeightID = ? AND ActivityID IN (?) AND UserID = ?',
                        [weightId, activitiesToDelete, userId]
                    );
                    updated = true;
                }

                const activitiesToAdd = newActivityIds.filter(id => !currentActivityIds.includes(id));
                for (const activityId of activitiesToAdd) {
                    await connection.query(
                        'INSERT INTO WeightActivitiesT (WeightID, ActivityID, UserID) VALUES (?, ?, ?)',
                        [weightId, activityId, userId]
                    );
                    updated = true;
                }

                if (!updated) {
                    return res.status(400).json({ error: 'No changes provided(be)' });
                }

                res.json({ success: true, message: 'Weight entry updated successfully' });
            });
        } catch (error) {
            handleDbError(error, res, 'Error updating weight entry');
        }
    }
);

module.exports = router;