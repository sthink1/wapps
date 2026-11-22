// File: dbConnection.js
require('dotenv').config();
const mysqlPromise = require('mysql2/promise');
const logger = require('./logger');

// Validate critical environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        logger.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
});

// Environment identity is verified by stage6Environment before this module is loaded.
// Require TLS and bounded connection pools in hosted production as well as staging.
const helioTest = ['local', 'staging'].includes(process.env.WA_ENV) &&
    process.env.DB_HOST === 'morty2.heliohost.org' &&
    process.env.DB_NAME === 'wapps_test' &&
    process.env.DB_USER === 'wapps_test';
const hosted = process.env.WA_ENV === 'staging' || process.env.WA_ENV === 'production';
const sslPolicy = String(process.env.DB_SSL || '').trim().toLowerCase();
if (!['', 'required'].includes(sslPolicy) || (hosted && sslPolicy !== 'required')) {
    throw new Error('WA_DB_TLS_POLICY_INVALID');
}
const databasePort = Number(process.env.DB_PORT);
if (!Number.isSafeInteger(databasePort) || databasePort < 1 || databasePort > 65535) {
    throw new Error('WA_DB_PORT_INVALID');
}
const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT || 50);
if (!Number.isSafeInteger(connectionLimit) || connectionLimit < 1 ||
    (hosted && connectionLimit > 5)) {
    throw new Error('WA_DB_CONNECTION_LIMIT_INVALID');
}
if (helioTest && sslPolicy !== 'required') {
    throw new Error('HELIO_TEST_TLS_REQUIRED');
}

// Create a Promise-based pool with adjusted configuration
const pool = mysqlPromise.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: databasePort,
    ...(sslPolicy === 'required' ? { ssl: { rejectUnauthorized: true } } : {}),
    waitForConnections: true,
    connectionLimit,
    queueLimit: 0,
    charset: 'utf8mb4',
    // Standardize JavaScript Date <-> MySQL conversion on UTC.
    timezone: 'Z',
    dateStrings: ['DATE'], // Return DATE fields as YYYY-MM-DD strings
    // Removed acquireTimeout to suppress warning
});

// Standardize every MySQL connection session on UTC.
// This also makes NOW(), CURRENT_TIMESTAMP and TIMESTAMP reads/writes use UTC.
pool.on('connection', (connection) => {
    connection.query("SET time_zone = '+00:00'", (err) => {
        if (err) {
            logger.error('Unable to set MySQL session time zone to UTC (details omitted)');
        }
    });
});

// Stage 6B Group 0d: startup waits for this identity check before accepting HTTP.
const ready = (async () => {
    const connection = await pool.getConnection();
    try {
        const [[timeZoneRow]] = await connection.query(
            "SELECT @@session.time_zone AS SessionTimeZone, NOW() AS SessionNow, UTC_TIMESTAMP() AS UtcNow"
        );
        if (timeZoneRow.SessionTimeZone !== '+00:00') {
            throw new Error(`MySQL session time zone is ${timeZoneRow.SessionTimeZone}, expected +00:00.`);
        }
        logger.info('Connected to the MySQL database with UTC session time.');
        return timeZoneRow;
    } finally { connection.release(); }
})();

// Log pool statistics every 5 minutes (simplified)
setInterval(() => {
    // Log basic pool status; mysql2/promise does not expose detailed stats
    logger.info('Connection pool active');
}, 300000);

// Function to get the next user-specific ID using UserSequenceT
async function getNextUserSpecificID(userId, tableName, columnName) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        // Attempt to update and fetch NextID
        const [updateResult] = await connection.execute(
            `UPDATE UserSequenceT 
             SET NextID = NextID + 1 
             WHERE UserID = ? AND TableName = ?`,
            [userId, tableName]
        );
        
        if (updateResult.affectedRows === 0) {
            // Initialize sequence if not exists
            await connection.execute(
                `INSERT INTO UserSequenceT (UserID, TableName, NextID) 
                 VALUES (?, ?, 1)`,
                [userId, tableName]
            );
            await connection.commit();
            return 1;
        }

        // Fetch the updated NextID
        const [selectResult] = await connection.execute(
            `SELECT NextID 
             FROM UserSequenceT 
             WHERE UserID = ? AND TableName = ?`,
            [userId, tableName]
        );
        await connection.commit();
        return selectResult[0].NextID;
    } catch (err) {
        await connection.rollback();
        logger.error('Error generating ID (identifiers and details omitted)');
        throw err;
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    ready,
    getNextUserSpecificID
};
