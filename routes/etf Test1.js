const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const logger = require('../logger');

const pool = require('../dbConnection');
const { withTransaction, handleDbError, holidays } = require('../utils');
const auth = require('../middleware/auth');
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

// ────────────────────────────────────────────────
// Helper: Adjust date to most recent prior trading day
function getPriorTradingDay(dateStr, listDateStr) {
  let date = new Date(dateStr);
  const listDate = new Date(listDateStr);
  if (date < listDate) return null; // Before listing → N/A
  while (
    date.getDay() === 0 || // Sunday
    date.getDay() === 6 || // Saturday
    holidays.some(h => h.getTime() === date.getTime())
  ) {
    date.setDate(date.getDate() - 1);
  }
  if (date < listDate) return null;
  return date.toISOString().split('T')[0];
}

// ────────────────────────────────────────────────
// Helper: Calculate anchor date for performance periods
function getAnchorDate(baseDate, period) {
  const date = new Date(baseDate);
  if (period === 'YTD') {
    date.setMonth(0, 1); // Jan 1
    date.setDate(0);     // Last day of previous year
  } else if (period === '1W') {
    date.setDate(date.getDate() - 7);
  } else if (period === '1M') {
    date.setMonth(date.getMonth() - 1);
  } else if (period === '1Y') {
    date.setFullYear(date.getFullYear() - 1);
  } else if (period === '3Y') {
    date.setFullYear(date.getFullYear() - 3);
  } else if (period === '5Y') {
    date.setFullYear(date.getFullYear() - 5);
  }
  return date.toISOString().split('T')[0];
}

// ────────────────────────────────────────────────
// Mock data generator (used only when mock=true or API fails)
function getMockData(symbol, field) {
  if (field === 'price') return (Math.random() * 40 + 10).toFixed(2);
  if (field === 'aum') return Math.floor(Math.random() * 1000000000).toString();
  if (field === 'volume') return Math.floor(Math.random() * 1000000).toString();
  return 'N/A';
}

/* =====================================================
   Existing routes (unchanged)
===================================================== */
// POST /etf/category
router.post(
  '/category',
  auth,
  [body('category').trim().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid input (be)" });
    }

    const { category } = req.body;
    const userId = req.user.userId;

    try {
      await withTransaction(async (connection) => {
        const [existing] = await connection.query(
          `SELECT 1 FROM etfCategoryT WHERE category = ? AND UserID = ?`,
          [category, userId]
        );
        if (existing.length > 0) {
          throw new Error("Category already exists (be)");
        }
        await connection.query(
          `INSERT INTO etfCategoryT (category, UserID) VALUES (?, ?)`,
          [category, userId]
        );
        res.json({ message: "Category saved" });
      });
    } catch (err) {
      if (err.message.endsWith("(be)")) {
        return res.status(400).json({ message: err.message });
      }
      logger.error(`POST /etf/category: ${err.message}`);
      res.status(500).json({ message: "Server error (be)" });
    }
  }
);

// GET /etf/category
router.get('/category', auth, async (req, res) => {
  const userId = req.user.userId;
  try {
    await withTransaction(async (connection) => {
      const [rows] = await connection.query(
        `SELECT etfCategoryID, category FROM etfCategoryT WHERE UserID = ? ORDER BY category ASC`,
        [userId]
      );
      res.json({ message: "Success", data: rows });
    });
  } catch (err) {
    logger.error(`GET /etf/category: ${err.message}`);
    res.status(500).json({ message: "Server error (be)" });
  }
});

// PUT /etf/category/:id
router.put(
  '/category/:id',
  auth,
  [body('category').trim().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid input (be)" });
    }
    const userId = req.user.userId;
    const categoryID = req.params.id;
    const { category } = req.body;
    try {
      await withTransaction(async (connection) => {
        const [result] = await connection.query(
          `UPDATE etfCategoryT SET category = ? WHERE etfCategoryID = ? AND UserID = ?`,
          [category, categoryID, userId]
        );
        if (result.affectedRows === 0) {
          throw new Error("Category not found (be)");
        }
        res.json({ message: "Category updated" });
      });
    } catch (err) {
      if (err.message.endsWith("(be)")) {
        return res.status(400).json({ message: err.message });
      }
      logger.error(`PUT /etf/category/:id: ${err.message}`);
      res.status(500).json({ message: "Server error (be)" });
    }
  }
);

// DELETE /etf/category/:id
router.delete('/category/:id', auth, async (req, res) => {
  const userId = req.user.userId;
  const categoryID = req.params.id;
  try {
    await withTransaction(async (connection) => {
      const [symbols] = await connection.query(
        `SELECT COUNT(*) AS count FROM etfSymbolT WHERE etfCategoryID = ? AND UserID = ?`,
        [categoryID, userId]
      );
      if (symbols[0].count > 0) {
        throw new Error("Cannot delete category with existing symbols (be)");
      }
      const [result] = await connection.query(
        `DELETE FROM etfCategoryT WHERE etfCategoryID = ? AND UserID = ?`,
        [categoryID, userId]
      );
      if (result.affectedRows === 0) {
        throw new Error("Category not found (be)");
      }
      res.json({ message: "Category deleted" });
    });
  } catch (err) {
    if (err.message.endsWith("(be)")) {
      return res.status(400).json({ message: err.message });
    }
    logger.error(`DELETE /etf/category/:id: ${err.message}`);
    res.status(500).json({ message: "Server error (be)" });
  }
});

// POST /etf/symbol
router.post(
  '/symbol',
  auth,
  [body('symbol').trim().notEmpty(), body('etfCategoryID').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid input (be)" });
    }
    const { symbol, etfCategoryID } = req.body;
    const userId = req.user.userId;
    try {
      await withTransaction(async (connection) => {
        const upperSymbol = symbol.toUpperCase();
        const [existing] = await connection.query(
          `SELECT 1 FROM etfSymbolT WHERE symbol = ? AND UserID = ?`,
          [upperSymbol, userId]
        );
        if (existing.length > 0) {
          throw new Error("Symbol already exists (be)");
        }
        let name = null;
        let listDate = null;
        try {
          const response = await axios.get(
            `https://api.polygon.io/v3/reference/tickers/${upperSymbol}?apiKey=${POLYGON_API_KEY}`
          );
          if (
            response.data.status !== "OK" ||
            !response.data.results ||
            response.data.results.active !== true
          ) {
            throw new Error("Symbol not found. Please check symbol entered.(be)");
          }
          name = response.data.results.name;
          listDate = response.data.results.list_date || null;
          if (!name) {
            throw new Error("Symbol not found. Please check symbol entered.(be)");
          }
        } catch (err) {
          if (err.response && err.response.status === 404) {
            throw new Error("Symbol not found. Please check symbol entered.(be)");
          }
          logger.error(`Polygon validation error for ${upperSymbol}: ${err.message}`);
          throw new Error("Symbol not found. Please check symbol entered.(be)");
        }
        await connection.query(
          `INSERT INTO etfSymbolT (symbol, name, listDate, etfCategoryID, UserID) VALUES (?, ?, ?, ?, ?)`,
          [upperSymbol, name, listDate, etfCategoryID, userId]
        );
        res.json({ message: "Symbol saved", data: { symbol: upperSymbol, name, listDate } });
      });
    } catch (err) {
      if (err.message.endsWith("(be)")) {
        return res.status(400).json({ message: err.message });
      }
      logger.error(`POST /etf/symbol: ${err.message}`);
      return res.status(500).json({ message: "Server error (be)" });
    }
  }
);

// GET /etf/symbol
router.get('/symbol', auth, async (req, res) => {
  const userId = req.user.userId;
  try {
    await withTransaction(async (connection) => {
      const [rows] = await connection.query(
        `SELECT s.etfSymbolID, s.symbol, s.name, s.listDate, c.category, s.etfCategoryID
         FROM etfSymbolT s JOIN etfCategoryT c ON s.etfCategoryID = c.etfCategoryID
         WHERE s.UserID = ? ORDER BY s.symbol ASC`,
        [userId]
      );
      res.json({ message: "Success", data: rows });
    });
  } catch (err) {
    logger.error(`GET /etf/symbol: ${err.message}`);
    res.status(500).json({ message: "Server error (be)" });
  }
});

// PUT /etf/symbol/:id
router.put(
  '/symbol/:id',
  auth,
  [body('etfCategoryID').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid input (be)" });
    }
    const userId = req.user.userId;
    const symbolID = req.params.id;
    const { etfCategoryID } = req.body;
    try {
      await withTransaction(async (connection) => {
        const [result] = await connection.query(
          `UPDATE etfSymbolT SET etfCategoryID = ? WHERE etfSymbolID = ? AND UserID = ?`,
          [etfCategoryID, symbolID, userId]
        );
        if (result.affectedRows === 0) {
          throw new Error("Symbol not found (be)");
        }
        res.json({ message: "Symbol updated" });
      });
    } catch (err) {
      if (err.message.endsWith("(be)")) {
        return res.status(400).json({ message: err.message });
      }
      logger.error(`PUT /etf/symbol/:id: ${err.message}`);
      res.status(500).json({ message: "Server error (be)" });
    }
  }
);

// DELETE /etf/symbol/:id
router.delete('/symbol/:id', auth, async (req, res) => {
  const userId = req.user.userId;
  const symbolID = req.params.id;
  try {
    await withTransaction(async (connection) => {
      // 7-Year Rule placeholder remains commented
      const [result] = await connection.query(
        `DELETE FROM etfSymbolT WHERE etfSymbolID = ? AND UserID = ?`,
        [symbolID, userId]
      );
      if (result.affectedRows === 0) {
        throw new Error("Symbol not found (be)");
      }
      res.json({ message: "Symbol deleted" });
    });
  } catch (err) {
    if (err.message.endsWith("(be)")) {
      return res.status(400).json({ message: err.message });
    }
    logger.error(`DELETE /etf/symbol/:id: ${err.message}`);
    res.status(500).json({ message: "Server error (be)" });
  }
});

// ────────────────────────────────────────────────
// NEW: GET /etf/compare
router.get('/compare', auth, async (req, res) => {
  const userId = req.user.userId;
  const {
    category,
    currentDate,
    pastDate,
    rows = '10',
    sortBy = 'YTD',
    order = 'desc',
    mock = 'false'
  } = req.query;

  const useMock = mock === 'true';

  try {
    await withTransaction(async (connection) => {
      let query = `
        SELECT s.etfSymbolID, s.symbol, s.name, s.listDate, c.category 
        FROM etfSymbolT s 
        JOIN etfCategoryT c ON s.etfCategoryID = c.etfCategoryID 
        WHERE s.UserID = ?
      `;
      let params = [userId];
      if (category && category !== 'ALL') {
        query += ` AND c.category = ?`;
        params.push(category);
      }
      const [symbols] = await connection.query(query, params);

      const limitedSymbols = rows === 'all' ? symbols : symbols.slice(0, parseInt(rows));

      const periods = ['YTD', '1W', '1M', '1Y', '3Y', '5Y'];

      // Helper to fetch adjusted close for a specific date
      const fetchAdjClose = async (symbol, targetDate) => {
        if (useMock) return parseFloat(getMockData(symbol, 'price'));
        try {
          const tiingoResp = await axios.get(
            `https://api.tiingo.com/tiingo/daily/${symbol.toLowerCase()}/prices?startDate=${targetDate}&endDate=${targetDate}&token=${process.env.TIINGO_API_KEY}`
          );
          return tiingoResp.data[0]?.adjClose || 0;
        } catch (e) {
          try {
            const polygonResp = await axios.get(
              `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${targetDate}/${targetDate}?adjusted=true&apiKey=${process.env.POLYGON_API_KEY}`
            );
            return polygonResp.data.results?.[0]?.c || 0;
          } catch {
            return 0;
          }
        }
      };

      const enrichForDate = async (baseDate, isCurrent) => {
        const results = [];
        for (const sym of limitedSymbols) {
          const data = {
            symbol: sym.symbol,
            name: sym.name,
            listDate: sym.listDate,
            isMock: useMock
          };

          const adjBaseDate = getPriorTradingDay(baseDate, sym.listDate);
          if (!adjBaseDate) {
            data.price = 'N/A';
            data.aum = 'N/A';
            data.volume = 'N/A';
            data.returns = periods.reduce((acc, p) => ({ ...acc, [p]: 'N/A' }), {});
            results.push(data);
            continue;
          }

          // Current price (Finnhub) or historical (Tiingo/Polygon)
          let price = 0;
          if (isCurrent && !useMock) {
            try {
              const finnhubResp = await axios.get(
                `https://finnhub.io/api/v1/quote?symbol=${sym.symbol}&token=${process.env.FINNHUB_API_KEY}`
              );
              price = finnhubResp.data.c || 0;
            } catch {
              price = await fetchAdjClose(sym.symbol, adjBaseDate);
            }
          } else {
            price = await fetchAdjClose(sym.symbol, adjBaseDate);
          }
          data.price = price === 0 ? 'N/A' : price.toFixed(2);

          // AUM & Volume (Polygon)
          if (useMock) {
            data.aum = getMockData(sym.symbol, 'aum');
            data.volume = getMockData(sym.symbol, 'volume');
          } else {
            try {
              const tickerResp = await axios.get(
                `https://api.polygon.io/v3/reference/tickers/${sym.symbol}?apiKey=${process.env.POLYGON_API_KEY}`
              );
              data.aum = tickerResp.data.results?.market_cap || 'N/A';
            } catch {
              data.aum = 'N/A';
            }
            try {
              const volResp = await axios.get(
                `https://api.polygon.io/v2/aggs/ticker/${sym.symbol}/range/1/day/${adjBaseDate}/${adjBaseDate}?adjusted=true&apiKey=${process.env.POLYGON_API_KEY}`
              );
              data.volume = volResp.data.results?.[0]?.v || 'N/A';
            } catch {
              data.volume = 'N/A';
            }
          }

          // Returns for each period
          data.returns = {};
          for (const period of periods) {
            const anchor = getAnchorDate(baseDate, period);
            const adjAnchor = getPriorTradingDay(anchor, sym.listDate);
            if (!adjAnchor) {
              data.returns[period] = 'N/A';
              continue;
            }
            const pastPrice = await fetchAdjClose(sym.symbol, adjAnchor);
            const ret = pastPrice > 0 && price > 0
              ? (((price - pastPrice) / pastPrice) * 100).toFixed(2)
              : 'N/A';
            data.returns[period] = ret;
          }

          await new Promise(resolve => setTimeout(resolve, 12000));  // 12 seconds
          results.push(data);
        }
        return results;
      };

      const currentData = await enrichForDate(currentDate || new Date().toISOString().split('T')[0], true);
      const pastData = await enrichForDate(pastDate, false);

      // Sort both tables
      const sortKey = sortBy;

      // Sort both by sortBy/order (treat N/A as -Infinity for descending = bottom)
const sortFunc = (a, b) => {
  let valA = a.returns[sortBy];
  let valB = b.returns[sortBy];

  // Convert to number, treat N/A or invalid as -Infinity
  valA = (valA === 'N/A' || valA == null || isNaN(parseFloat(valA))) ? -Infinity : parseFloat(valA);
  valB = (valB === 'N/A' || valB == null || isNaN(parseFloat(valB))) ? -Infinity : parseFloat(valB);

  return order === 'desc' ? valB - valA : valA - valB;
};

      currentData.sort(sortFunc);
      pastData.sort(sortFunc);

      // Calculate movement (position change)
      const pastMap = new Map(pastData.map((d, idx) => [d.symbol, idx]));
      currentData.forEach(d => {
        const pastPos = pastMap.get(d.symbol);
        if (pastPos !== undefined) {
          const currPos = currentData.findIndex(cd => cd.symbol === d.symbol);
          const diff = pastPos - currPos;
          d.movement = diff > 0 ? `↑${diff}` : diff < 0 ? `↓${Math.abs(diff)}` : '';
        } else {
          d.movement = '';
        }
      });

      res.json({ current: currentData, past: pastData });
    });
  } catch (err) {
    handleDbError(err, res, 'Error fetching compare data');
  }
});

// ────────────────────────────────────────────────
// GET /etf/config  — supply API keys to etfAPItest.html
router.get('/config', auth, (req, res) => {
  res.json({
    FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
    POLYGON_API_KEY: process.env.POLYGON_API_KEY,
    TIINGO_API_KEY:  process.env.TIINGO_API_KEY,
  });
});

module.exports = router;
