// File: testConnection.js
const { pool } = require('./dbConnection');
const logger = require('./logger');

async function testConnection() {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query('SELECT 1 + 1 AS result');
        logger.info('Query result: ' + results[0].result);
    } catch (err) {
        logger.error('Error testing connection: ' + err.message);
    } finally {
        if (connection) connection.release();
    }
}

testConnection();