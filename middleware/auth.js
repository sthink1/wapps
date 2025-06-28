// File: middleware/auth.js
const jwt = require('jsonwebtoken');
const logger = require('../logger');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        logger.warn('Access attempt without token');
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: decoded.userId };
        next();
    } catch (error) {
        logger.error('Token verification failed: ' + error.message);
        res.status(401).json({ error: 'Invalid token.' });
    }
};

module.exports = auth;