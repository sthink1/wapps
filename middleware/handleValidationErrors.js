// File: middleware/handleValidationErrors.js

const { validationResult } = require('express-validator');

// Middleware to handle validation errors
module.exports = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Return the first error message in the standard { error: "message" } format
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
};