// File: routes/users.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { pool } = require('../dbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { handleDbError } = require('../utils');

require('dotenv').config();

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in .env');
    process.exit(1);
}

router.post('/register', [
    body('username')
        .trim()
        .notEmpty().withMessage('User Name cannot be blank.(be)')
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage('User Name can only contain letters, numbers, underscores, and hyphens.(be)'),
    body('password')
        .trim()
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.(be)'),
    body('email')
        .isEmail().withMessage('Please provide a valid email.(be)'),
    body('phone1')
        .trim()
        .notEmpty().withMessage('Phone 1 cannot be blank.(be)')
        .custom(value => {
            const cleanedPhone = value.replace(/[^\d]/g, '');
            if (!/^\d{10}$/.test(cleanedPhone)) {
                throw new Error('Phone number must be 10 digits (e.g., 123-456-7890).(be)');
            }
            return true;
        }),
    body('phone2')
        .optional({ nullable: true })
        .custom(value => {
            if (value && value.trim() !== '') {
                const cleanedPhone = value.replace(/[^\d]/g, '');
                if (!/^\d{10}$/.test(cleanedPhone)) {
                    throw new Error('Phone number must be 10 digits (e.g., 123-456-7890). (be)');
                }
            }
            return true;
        }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }

    let { username, password, email, phone1, phone2 } = req.body;
    username = username.toLowerCase();

    const formatPhone = (phone) => {
        const cleaned = phone.replace(/[^\d]/g, '');
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    };
    phone1 = formatPhone(phone1);
    phone2 = phone2 && phone2.trim() !== '' ? formatPhone(phone2) : null;

    try {
        const [usernameResults] = await pool.query('SELECT * FROM UsersT WHERE LOWER(UserName) = ?', [username]);
        if (usernameResults.length > 0) {
            return res.status(400).json({ error: 'User already exists. (be)' });
        }

        const [emailResults] = await pool.query('SELECT * FROM UsersT WHERE Email = ?', [email]);
        if (emailResults.length > 0) {
            return res.status(400).json({ error: 'Email already exists. (be)' });
        }

        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        await pool.query(
            'INSERT INTO UsersT SET ?',
            { UserName: username, PasswordHash: hash, Email: email, Phone1: phone1, Phone2: phone2 || null }
        );

        // Generate JWT with 8-hour expiration
        const userId = (await pool.query('SELECT UserID FROM UsersT WHERE UserName = ?', [username]))[0][0].UserID;
        const token = jwt.sign(
            { userId, username },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        handleDbError(error, res, 'Error registering user');
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [results] = await pool.query('SELECT * FROM UsersT WHERE UserName = ?', [username]);
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.PasswordHash);
        if (match) {
            const token = jwt.sign(
                { userId: user.UserID, username: user.UserName },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );
            res.status(200).json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        handleDbError(error, res, 'Error during login');
    }
});

router.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;