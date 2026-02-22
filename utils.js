// File: utils.js
const logger = require('./logger');
const { pool } = require('./dbConnection');

// ────────────────────────────────────────────────
// NYSE Holidays 2020–2036 (from etfHolidays.html)
// Used for adjusting dates to prior trading days in ETF compare
const HOLIDAYS_2020_2036 = [
  [2020, 1, 1], [2020, 1, 20], [2020, 2, 17], [2020, 4, 10], [2020, 5, 25], [2020, 7, 3], [2020, 9, 7], [2020, 11, 26], [2020, 12, 25],
  [2021, 1, 1], [2021, 1, 18], [2021, 2, 15], [2021, 4, 2], [2021, 5, 31], [2021, 6, 18], [2021, 7, 5], [2021, 9, 6], [2021, 11, 25], [2021, 12, 24],
  [2022, 1, 17], [2022, 2, 21], [2022, 4, 15], [2022, 5, 30], [2022, 6, 20], [2022, 7, 4], [2022, 9, 5], [2022, 11, 24], [2022, 12, 26],
  [2023, 1, 2], [2023, 1, 16], [2023, 2, 20], [2023, 4, 7], [2023, 5, 29], [2023, 6, 19], [2023, 7, 4], [2023, 9, 4], [2023, 11, 23], [2023, 12, 25],
  [2024, 1, 1], [2024, 1, 15], [2024, 2, 19], [2024, 3, 29], [2024, 5, 27], [2024, 6, 19], [2024, 7, 4], [2024, 9, 2], [2024, 11, 28], [2024, 12, 25],
  [2025, 1, 1], [2025, 1, 20], [2025, 2, 17], [2025, 4, 18], [2025, 5, 26], [2025, 6, 19], [2025, 7, 4], [2025, 9, 1], [2025, 11, 27], [2025, 12, 25],
  // ... continue with the rest of your array up to 2036 ...
  [2036, 1, 1], [2036, 1, 21], [2036, 2, 18], [2036, 4, 11], [2036, 5, 26], [2036, 6, 19], [2036, 7, 4], [2036, 9, 1], [2036, 11, 27], [2036, 12, 25]
];

const holidays = HOLIDAYS_2020_2036.map(([y, m, d]) => new Date(y, m - 1, d));

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

module.exports = {
    handleDbError,
    withTransaction,
    holidays          // ← export the Date objects array
};