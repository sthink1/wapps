// File: utils.js
const logger = require('./logger');
const { pool } = require('./dbConnection');

function handleDbError(error, res, customMessage = 'Database error') {
    logger.error(`${customMessage}: ${error.message}`);
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Duplicate entry(be)' });
    }
    res.status(500).json({ error: customMessage });
}

async function withTransaction(callback) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

module.exports = { handleDbError, withTransaction };