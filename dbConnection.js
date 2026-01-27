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

// Create a Promise-based pool with adjusted configuration
const pool = mysqlPromise.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 0,
    charset: 'utf8mb4',
    dateStrings: ['DATE'],// // Return DATE fields as YYYY-MM-DD strings
    // Removed acquireTimeout to suppress warning
});

// Test the database connection
(async () => {
    try {
        const connection = await pool.getConnection();
        logger.info('Connected to the MySQL database!');
        connection.release();
    } catch (err) {
        logger.error('Error connecting to the MySQL database: ' + err.message);
        process.exit(1);
    }
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
        logger.error(`Error generating ID for UserID=${userId}, Table=${tableName}: ${err.message}`);
        throw err;
    } finally {
        connection.release();
    }
}

module.exports = {
    pool,
    getNextUserSpecificID
};