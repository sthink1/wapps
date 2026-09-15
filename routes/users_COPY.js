// File: routes/users.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { pool } = require('../dbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { handleDbError } = require('../utils');
const { sendVerificationCode } = require('../send_email');
const crypto = require('crypto');

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
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Credentials are valid - generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const tempToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Store verification code in database
        await pool.query(
            'INSERT INTO LoginVerificationT SET UserID = ?, VerificationCode = ?, TempToken = ?, ExpiresAt = ?, IsVerified = 0',
            [user.UserID, verificationCode, tempToken, expiresAt]
        );

        // Send verification code via email
        try {
            await sendVerificationCode({
                email: user.Email,
                verificationCode: verificationCode,
                username: user.UserName
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message);
            return res.status(500).json({ error: 'Failed to send verification code. Email service error.(be)' });
        }

        // Return temporary token instead of final JWT
        res.status(200).json({
            message: 'Verification code sent to your email.',
            tempToken: tempToken,
            userId: user.UserID
        });
    } catch (error) {
        console.error('Login error:', error.message);
        handleDbError(error, res, 'Error during login');
    }
});

router.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});

router.post('/verify-code', async (req, res) => {
    const { tempToken, verificationCode } = req.body;

    if (!tempToken || !verificationCode) {
        return res.status(400).json({ error: 'Temporary token and verification code are required.(be)' });
    }

    try {
        // Find the verification record
        const [verifications] = await pool.query(
            'SELECT * FROM LoginVerificationT WHERE TempToken = ? AND IsVerified = 0 ORDER BY VerificationID DESC LIMIT 1',
            [tempToken]
        );

        if (verifications.length === 0) {
            return res.status(401).json({ error: 'Invalid or expired verification request.(be)' });
        }

        const verification = verifications[0];

        // Check if code has expired
        const now = new Date();
        if (now > new Date(verification.ExpiresAt)) {
            return res.status(401).json({ error: 'Verification code has expired. Please log in again.(be)' });
        }

        // Check if code matches
        if (verificationCode !== verification.VerificationCode) {
            return res.status(401).json({ error: 'Invalid verification code.(be)' });
        }

        // Code is valid - mark as verified
        await pool.query(
            'UPDATE LoginVerificationT SET IsVerified = 1 WHERE VerificationID = ?',
            [verification.VerificationID]
        );

        // Get user info
        const [users] = await pool.query(
            'SELECT UserID, UserName FROM UsersT WHERE UserID = ?',
            [verification.UserID]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'User not found.(be)' });
        }

        const user = users[0];

        // Generate final JWT token with 8-hour expiration
        const token = jwt.sign(
            { userId: user.UserID, username: user.UserName },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        handleDbError(error, res, 'Error during code verification');
    }
});

router.get('/is-admin', (req, res) => {
    try {
        // Extract token from Authorization header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get admin username from environment variables
        const adminUsername = process.env.ADMIN_USERNAME;
        
        if (!adminUsername) {
            return res.status(500).json({ error: 'Admin username not configured.' });
        }
        
        // Check if the current user is the admin
        const isAdmin = decoded.username === adminUsername;
        
        res.status(200).json({ isAdmin, username: decoded.username });
    } catch (error) {
        console.error('Error checking admin status:', error.message);
        res.status(401).json({ error: 'Invalid token or token verification failed.' });
    }
});

module.exports = router;