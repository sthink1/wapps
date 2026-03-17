const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, param, query, validationResult } = require('express-validator');
const logger = require('../logger');

const pool = require('../dbConnection');
const { getNextUserSpecificID } = require('../dbConnection');
const { withTransaction, handleDbError, holidays } = require('../utils');
const auth = require('../middleware/auth');
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

// Simple in-memory cache: userId + category → { data, timestamp }
const compareCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes

// ────────────────────────────────────────────────
// Date helpers (consistent with etfAPItest.html)
function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dy}`;
}

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getPriorTradingDay(dateStr, listDateStr = '1900-01-01') {
  let date = parseDate(dateStr);
  const listDate = parseDate(listDateStr);
  if (date < listDate) return null;
  while (
    date.getDay() === 0 || date.getDay() === 6 ||
    holidays.some(h => h.getFullYear() === date.getFullYear() &&
                       h.getMonth() === date.getMonth() &&
                       h.getDate() === date.getDate())
  ) {
    date.setDate(date.getDate() - 1);
  }
  if (date < listDate) return null;
  return toDateStr(date);
}

function isTodayTradingDay() {
  const now = new Date();
  return now.getDay() !== 0 && now.getDay() !== 6 &&
         !holidays.some(h => h.getFullYear() === now.getFullYear() &&
                             h.getMonth() === now.getMonth() &&
                             h.getDate() === now.getDate());
}

// ────────────────────────────────────────────────
// Helper: Calculate anchor date for performance periods
function getAnchorDate(baseDateStr, period) {
  const date = parseDate(baseDateStr);  // Use parseDate helper for consistent string parsing
  if (period === 'YTD') {
    date.setMonth(0, 1); // Jan 1 of current year
    date.setDate(0);     // Dec 31 of previous year
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
  return toDateStr(date);
}

// ────────────────────────────────────────────────
// ────────────────────────────────────────────────
// Existing routes (cleaned up, fixed string literals and queries)
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
          'SELECT 1 FROM etfCategoryT WHERE category = ? AND UserID = ?',
          [category, userId]
        );
        if (existing.length > 0) {
          throw new Error("Category already exists (be)");
        }
        await connection.query(
          'INSERT INTO etfCategoryT (category, UserID) VALUES (?, ?)',
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

router.get('/category', auth, async (req, res) => {
  const userId = req.user.userId;
  try {
    await withTransaction(async (connection) => {
      const [rows] = await connection.query(
        'SELECT etfCategoryID, category FROM etfCategoryT WHERE UserID = ? ORDER BY category ASC',
        [userId]
      );
      res.json({ message: "Success", data: rows });
    });
  } catch (err) {
    logger.error(`GET /etf/category: ${err.message}`);
    res.status(500).json({ message: "Server error (be)" });
  }
});

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
          'UPDATE etfCategoryT SET category = ? WHERE etfCategoryID = ? AND UserID = ?',
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

router.delete('/category/:id', auth, async (req, res) => {
  const userId = req.user.userId;
  const categoryID = req.params.id;
  try {
    await withTransaction(async (connection) => {
      const [symbols] = await connection.query(
        'SELECT COUNT(*) AS count FROM etfSymbolT WHERE etfCategoryID = ? AND UserID = ?',
        [categoryID, userId]
      );
      if (symbols[0].count > 0) {
        throw new Error("Cannot delete category with existing symbols (be)");
      }
      const [result] = await connection.query(
        'DELETE FROM etfCategoryT WHERE etfCategoryID = ? AND UserID = ?',
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
          'SELECT 1 FROM etfSymbolT WHERE symbol = ? AND UserID = ?',
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
          'INSERT INTO etfSymbolT (symbol, name, listDate, etfCategoryID, UserID) VALUES (?, ?, ?, ?, ?)',
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

router.get('/symbol', auth, async (req, res) => {
  const userId = req.user.userId;
  try {
    await withTransaction(async (connection) => {
      const [rows] = await connection.query(
        'SELECT s.etfSymbolID, s.symbol, s.name, s.listDate, c.category, s.etfCategoryID ' +
        'FROM etfSymbolT s JOIN etfCategoryT c ON s.etfCategoryID = c.etfCategoryID ' +
        'WHERE s.UserID = ? ORDER BY s.symbol ASC',
        [userId]
      );
      res.json({ message: "Success", data: rows });
    });
  } catch (err) {
    logger.error(`GET /etf/symbol: ${err.message}`);
    res.status(500).json({ message: "Server error (be)" });
  }
});

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
          'UPDATE etfSymbolT SET etfCategoryID = ? WHERE etfSymbolID = ? AND UserID = ?',
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

// ────────────────────────────────────────────────
// DELETE /etf/symbol/:id
// Blocks deletion if symbol has ANY activity in etfActivityT,
// OR if it has SELL activity within the last 7 years.
router.delete('/symbol/:id', auth, async (req, res) => {
  const userId = req.user.userId;
  const symbolID = req.params.id;
  try {
    await withTransaction(async (connection) => {
      // Check for any BUY activity still in inventory (shares bought > shares sold)
      const [buyRows] = await connection.query(
        `SELECT COALESCE(SUM(Shares), 0) AS totalBought
         FROM etfActivityT
         WHERE etfSymbolID = ? AND UserID = ? AND TransactionType = 'BUY'`,
        [symbolID, userId]
      );
      const [sellRows] = await connection.query(
        `SELECT COALESCE(SUM(Shares), 0) AS totalSold
         FROM etfActivityT
         WHERE etfSymbolID = ? AND UserID = ? AND TransactionType = 'SELL'`,
        [symbolID, userId]
      );
      const totalBought = parseFloat(buyRows[0].totalBought) || 0;
      const totalSold   = parseFloat(sellRows[0].totalSold)   || 0;

      if (totalBought > totalSold) {
        throw new Error("Cannot delete symbol with shares still in inventory (be)");
      }

      // Check for SELL activity within the last 7 years
      const sevenYearsAgo = new Date();
      sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);
      const sevenYearsAgoStr = toDateStr(sevenYearsAgo);

      const [recentSells] = await connection.query(
        `SELECT COUNT(*) AS count
         FROM etfActivityT
         WHERE etfSymbolID = ? AND UserID = ? AND TransactionType = 'SELL'
           AND TransactionDate >= ?`,
        [symbolID, userId, sevenYearsAgoStr]
      );
      if (recentSells[0].count > 0) {
        throw new Error("Cannot delete symbol with sale activity within the last 7 years (be)");
      }

      const [result] = await connection.query(
        'DELETE FROM etfSymbolT WHERE etfSymbolID = ? AND UserID = ?',
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

// GET /etf/compare — one Tiingo call per symbol, shared cache for both tables
// 60 minutes cache
// Add ?nocache=true to bypass cache during testing
router.get('/compare', auth, async (req, res) => {
  const userId = req.user.userId;
  const {
    category = 'ALL',
    currentDate: clientCurrentDate,
    pastDate: clientPastDate,
    rows = '10',
    sortBy = 'YTD',
    order = 'desc',
    nocache = 'false'
  } = req.query;

  const bypassCache = nocache === 'true';
  const cacheKey = `${userId}|${category}`;

  const cached = compareCache.get(cacheKey);
  if (!bypassCache && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    logger.info(`Cache hit for ${cacheKey}`);
    let { current, past } = cached.data;

    const numRows = rows === 'all' ? current.length : parseInt(rows);
    current = current.slice(0, numRows);
    past = past.slice(0, numRows);

    const sortFunc = (a, b) => {
      let va = parseFloat(a.returns[sortBy]) || -Infinity;
      let vb = parseFloat(b.returns[sortBy]) || -Infinity;
      return order === 'desc' ? vb - va : va - vb;
    };
    current.sort(sortFunc);
    past.sort(sortFunc);

    return res.json({ current, past });
  }

  try {
    await withTransaction(async (connection) => {
      let query = `
        SELECT s.symbol, s.name, s.listDate
        FROM etfSymbolT s
        JOIN etfCategoryT c ON s.etfCategoryID = c.etfCategoryID
        WHERE s.UserID = ?
      `;
      let params = [userId];
      if (category !== 'ALL') {
        query += ' AND c.category = ?';
        params.push(category);
      }
      const [symbols] = await connection.query(query, params);

      if (symbols.length === 0) {
        return res.json({ current: [], past: [] });
      }

      const limitedSymbols = rows === 'all' ? symbols : symbols.slice(0, parseInt(rows));

      const today = new Date();
      const currentAnchor = getPriorTradingDay(toDateStr(today)) || toDateStr(today);
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const pastAnchor = getPriorTradingDay(toDateStr(oneYearAgo)) || toDateStr(oneYearAgo);

      // Always use today's actual date for calculations (matching etfAPItest.html logic)
      // Ignore clientCurrentDate and clientPastDate which may be stale trading days
      const currBase = toDateStr(today);
      const pastBase = toDateStr(oneYearAgo);

      const curr5Y = getAnchorDate(currBase, '5Y');
      const past5Y = getAnchorDate(pastBase, '5Y');
      const globalStart = curr5Y < past5Y ? curr5Y : past5Y;

      // Fetch Tiingo data up to TODAY, not currBase, to ensure we have all recent trading day prices
      // (matches etfAPItest.html logic which uses todayStr as endDate)
      // Start 7 days before globalStart to account for weekends and holidays
      // (getPriorTradingDay may back up up to 4 days from a given date)
      const todayStr = toDateStr(today);
      const startDateForFetch = new Date(parseDate(globalStart));
      startDateForFetch.setDate(startDateForFetch.getDate() - 7);
      const fetchStartDate = toDateStr(startDateForFetch);

      const fetchTiingoRangeForSymbol = async (symbol, start, end) => {
        try {
          const resp = await axios.get(
            `https://api.tiingo.com/tiingo/daily/${symbol.toLowerCase()}/prices?startDate=${start}&endDate=${end}&token=${process.env.TIINGO_API_KEY}`
          );
          const map = new Map();
          resp.data.forEach(row => {
            const key = row.date.substring(0,10);
            map.set(key, {
              price: parseFloat(row.close),
              adjPrice: parseFloat(row.adjClose)
            });
          });
          return map;
        } catch (err) {
          logger.error(`Tiingo range failed for ${symbol}: ${err.message}`);
          return new Map();
        }
      };

      const tiingoPromises = limitedSymbols.map(sym =>
        fetchTiingoRangeForSymbol(sym.symbol, fetchStartDate, todayStr)
          .then(cache => ({ symbol: sym.symbol, name: sym.name, listDate: sym.listDate, cache }))
      );

      const enrichedSymbols = await Promise.all(tiingoPromises);

      const periods = ['YTD', '1W', '1M', '1Y', '3Y', '5Y'];
      const PERIOD_YEARS = { 'YTD': null, '1W': 1/52, '1M': 1/12, '1Y': 1, '3Y': 3, '5Y': 5 };

      const getEffectivePrice = (cache, dateKey) => {
        const entry = cache.get(dateKey);
        if (!entry) return null;
        const adj = entry.adjPrice;
        return (adj !== null && !isNaN(adj)) ? adj : entry.price;
      };

      const getRawPrice = (cache, dateKey) => {
        const entry = cache.get(dateKey);
        if (!entry) return null;
        return entry.price;
      };

      // FIXED: Added 'async' here
      const enrichData = async (baseDateStr, isCurrentTable, symbolDataArray) => {
        const results = [];
        for (const { symbol, name, listDate, cache } of symbolDataArray) {
          const data = {
            symbol, name, listDate,
            price: 'N/A',
            returns: periods.reduce((acc, p) => ({ ...acc, [p]: 'N/A' }), {})
          };

          let todayPrice = null;
          if (isCurrentTable && isTodayTradingDay()) {
            try {
              const finnResp = await axios.get(
                `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
              );
              todayPrice = finnResp.data.c && finnResp.data.c > 0 ? finnResp.data.c : null;
            } catch (e) {
              logger.warn(`Finnhub failed for ${symbol}: ${e.message}`);
            }
          }

          const baseOpenDate = getPriorTradingDay(baseDateStr, listDate || '1900-01-01');
          if (!baseOpenDate) {
            results.push(data);
            continue;
          }

          // Use exact date from Tiingo cache, no fallback (matches etfAPItest.html)
          const baseEffPrice = todayPrice ?? getEffectivePrice(cache, baseOpenDate);

          // Display raw price, not adjusted price
          data.price = todayPrice ?? (getRawPrice(cache, baseOpenDate)?.toFixed(2) ?? 'N/A');

          for (const period of periods) {
            const anchorStr = getAnchorDate(baseDateStr, period);
            let anchorOpen = getPriorTradingDay(anchorStr, listDate || '1900-01-01');
            
            // If anchor date is before list date OR anchor date >= base date, return N/A
            // (matches etfAPItest.html logic: isAfterListDate check)
            if (!anchorOpen || anchorOpen >= baseOpenDate) {
              data.returns[period] = 'N/A';
              continue;
            }

            const anchorEff = getEffectivePrice(cache, anchorOpen);
            
            if (!anchorEff || !baseEffPrice || baseEffPrice === 0) {
              data.returns[period] = 'N/A';
              continue;
            }

            let years = PERIOD_YEARS[period];
            if (years === null) {
              const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
              years = (parseDate(baseDateStr) - parseDate(anchorStr)) / msPerYear;
            }

            let ret = years <= 1
              ? ((baseEffPrice - anchorEff) / anchorEff) * 100
              : (Math.pow(baseEffPrice / anchorEff, 1 / years) - 1) * 100;

            data.returns[period] = ret.toFixed(2);
          }

          results.push(data);
        }
        return results;
      };

      const current = await enrichData(currBase, true, enrichedSymbols);
      const past    = await enrichData(pastBase, false, enrichedSymbols);

      const sortFunc = (a, b) => {
        let va = parseFloat(a.returns[sortBy]) || -Infinity;
        let vb = parseFloat(b.returns[sortBy]) || -Infinity;
        return order === 'desc' ? vb - va : va - vb;
      };

      current.sort(sortFunc);
      past.sort(sortFunc);

      // Calculate Movement AFTER sorting, based on displayed positions
      const pastMap = new Map(past.map((d, idx) => [d.symbol, idx]));
      current.forEach(d => {
        const pastPos = pastMap.get(d.symbol);
        if (pastPos !== undefined) {
          const currPos = current.findIndex(c => c.symbol === d.symbol);
          const diff = pastPos - currPos;
          d.movement = diff > 0 ? `↑${diff}` : diff < 0 ? `↓${Math.abs(diff)}` : '–';
        } else {
          d.movement = '–';
        }
      });

      compareCache.set(cacheKey, {
        data: { current, past },
        timestamp: Date.now()
      });

      for (const [key, val] of compareCache.entries()) {
        if (Date.now() - val.timestamp > CACHE_TTL_MS) {
          compareCache.delete(key);
        }
      }

      res.json({ current, past });
    });
  } catch (err) {
    logger.error(`GET /etf/compare failed: ${err.message} - Stack: ${err.stack}`);
    res.status(500).json({ message: 'Server error fetching comparison data' });
  }
});

// ────────────────────────────────────────────────
// GET /etf/config
router.get('/config', auth, (req, res) => {
  res.json({
    FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
    POLYGON_API_KEY: process.env.POLYGON_API_KEY,
    TIINGO_API_KEY:  process.env.TIINGO_API_KEY,
  });
});

// ────────────────────────────────────────────────
// GET /etf/tiingo-proxy
router.get('/tiingo-proxy', auth, async (req, res) => {
  const { symbol, date, startDate, endDate } = req.query;
  if (!symbol) return res.status(400).json({ message: 'symbol required' });

  const start = startDate || date;
  const end   = endDate   || date;
  if (!start || !end) return res.status(400).json({ message: 'date or startDate+endDate required' });

  try {
    const response = await axios.get(
      `https://api.tiingo.com/tiingo/daily/${symbol.toLowerCase()}/prices?startDate=${start}&endDate=${end}&token=${process.env.TIINGO_API_KEY}`
    );
    res.json(response.data);
  } catch (err) {
    logger.error(`GET /etf/tiingo-proxy: ${err.message}`);
    res.status(500).json({ message: 'Tiingo proxy error' });
  }
});

// ────────────────────────────────────────────────
// GET /etf/polygon-proxy (optional — can be removed if no longer needed)
router.get('/polygon-proxy', auth, async (req, res) => {
  const { symbol, date } = req.query;
  if (!symbol || !date) return res.status(400).json({ message: 'symbol and date required' });

  try {
    const adjResp = await axios.get(
      `https://api.polygon.io/v2/aggs/ticker/${symbol.toUpperCase()}/range/1/day/${date}/${date}?adjusted=true&sort=asc&apiKey=${process.env.POLYGON_API_KEY}`
    );
    const adjClose = adjResp.data.results?.[0]?.c ?? null;

    const rawResp = await axios.get(
      `https://api.polygon.io/v2/aggs/ticker/${symbol.toUpperCase()}/range/1/day/${date}/${date}?adjusted=false&sort=asc&apiKey=${process.env.POLYGON_API_KEY}`
    );
    const rawClose = rawResp.data.results?.[0]?.c ?? null;

    res.json({ adjClose, rawClose });
  } catch (err) {
    if (err.response?.status === 429) {
      logger.error(`Polygon rate limit (429) for ${symbol} on ${date}`);
      return res.status(429).json({ message: 'Polygon rate limit' });
    }
    logger.error(`GET /etf/polygon-proxy: ${err.message}`);
    res.status(500).json({ message: 'Polygon proxy error' });
  }
});

// ════════════════════════════════════════════════
// ETF ACTIVITY ROUTES  (Part 3 — new)
// ════════════════════════════════════════════════

// ────────────────────────────────────────────────
// GET /etf/activity/symbols-by-category/:categoryId
// Returns symbols for a given category (used by chained dropdown)
router.get('/activity/symbols-by-category/:categoryId', auth, async (req, res) => {
  const userId = req.user.userId;
  const categoryId = req.params.categoryId;
  try {
    await withTransaction(async (connection) => {
      const [rows] = await connection.query(
        `SELECT etfSymbolID, symbol, name, listDate
         FROM etfSymbolT
         WHERE etfCategoryID = ? AND UserID = ?
         ORDER BY symbol ASC`,
        [categoryId, userId]
      );
      res.json({ message: "Success", data: rows });
    });
  } catch (err) {
    logger.error(`GET /etf/activity/symbols-by-category: ${err.message}`);
    res.status(500).json({ message: "Server error (be)" });
  }
});

// ────────────────────────────────────────────────
// POST /etf/activity/buy
// Record a securities purchase
router.post(
  '/activity/buy',
  auth,
  [
    body('etfCategoryID').isInt({ min: 1 }),
    body('etfSymbolID').isInt({ min: 1 }),
    body('TransactionDate').isDate(),
    body('Shares').isFloat({ gt: 0 }),
    body('PurchaseCost').isFloat({ gt: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid input (be)" });
    }
    const userId = req.user.userId;
    const { etfCategoryID, etfSymbolID, TransactionDate, Shares, PurchaseCost } = req.body;
    try {
      // Verify the symbol belongs to this user and category
      await withTransaction(async (connection) => {
        const [symCheck] = await connection.query(
          `SELECT 1 FROM etfSymbolT
           WHERE etfSymbolID = ? AND etfCategoryID = ? AND UserID = ?`,
          [etfSymbolID, etfCategoryID, userId]
        );
        if (symCheck.length === 0) {
          throw new Error("Symbol not found for this category (be)");
        }

        const userEtfActivityID = await getNextUserSpecificID(userId, 'etfActivityT', 'UserEtfActivityID');

        await connection.query(
          `INSERT INTO etfActivityT
             (UserEtfActivityID, UserID, etfCategoryID, etfSymbolID,
              TransactionType, TransactionDate, Shares, PurchaseCost)
           VALUES (?, ?, ?, ?, 'BUY', ?, ?, ?)`,
          [userEtfActivityID, userId, etfCategoryID, etfSymbolID,
           TransactionDate, Shares, PurchaseCost]
        );
        res.json({ message: "Purchase recorded" });
      });
    } catch (err) {
      if (err.message.endsWith("(be)")) {
        return res.status(400).json({ message: err.message });
      }
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: "Duplicate entry (be)" });
      }
      logger.error(`POST /etf/activity/buy: ${err.message}`);
      res.status(500).json({ message: "Server error (be)" });
    }
  }
);

// ────────────────────────────────────────────────
// POST /etf/activity/sell
// Record a securities sale
router.post(
  '/activity/sell',
  auth,
  [
    body('etfCategoryID').isInt({ min: 1 }),
    body('etfSymbolID').isInt({ min: 1 }),
    body('TransactionDate').isDate(),
    body('Shares').isFloat({ gt: 0 }),
    body('SalePrice').isFloat({ gt: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Invalid input (be)" });
    }
    const userId = req.user.userId;
    const { etfCategoryID, etfSymbolID, TransactionDate, Shares, SalePrice } = req.body;
    try {
      await withTransaction(async (connection) => {
        const [symCheck] = await connection.query(
          `SELECT 1 FROM etfSymbolT
           WHERE etfSymbolID = ? AND etfCategoryID = ? AND UserID = ?`,
          [etfSymbolID, etfCategoryID, userId]
        );
        if (symCheck.length === 0) {
          throw new Error("Symbol not found for this category (be)");
        }

        // Verify user is not selling more shares than they hold
        const [buyRows] = await connection.query(
          `SELECT COALESCE(SUM(Shares), 0) AS totalBought
           FROM etfActivityT
           WHERE etfSymbolID = ? AND UserID = ? AND TransactionType = 'BUY'`,
          [etfSymbolID, userId]
        );
        const [sellRows] = await connection.query(
          `SELECT COALESCE(SUM(Shares), 0) AS totalSold
           FROM etfActivityT
           WHERE etfSymbolID = ? AND UserID = ? AND TransactionType = 'SELL'`,
          [etfSymbolID, userId]
        );
        const currentInventory = parseFloat(buyRows[0].totalBought) - parseFloat(sellRows[0].totalSold);
        if (parseFloat(Shares) > currentInventory) {
          throw new Error(`Cannot sell more shares than held. Current inventory: ${currentInventory.toFixed(6)} (be)`);
        }

        const userEtfActivityID = await getNextUserSpecificID(userId, 'etfActivityT', 'UserEtfActivityID');

        await connection.query(
          `INSERT INTO etfActivityT
             (UserEtfActivityID, UserID, etfCategoryID, etfSymbolID,
              TransactionType, TransactionDate, Shares, SalePrice)
           VALUES (?, ?, ?, ?, 'SELL', ?, ?, ?)`,
          [userEtfActivityID, userId, etfCategoryID, etfSymbolID,
           TransactionDate, Shares, SalePrice]
        );
        res.json({ message: "Sale recorded" });
      });
    } catch (err) {
      if (err.message.endsWith("(be)")) {
        return res.status(400).json({ message: err.message });
      }
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: "Duplicate entry (be)" });
      }
      logger.error(`POST /etf/activity/sell: ${err.message}`);
      res.status(500).json({ message: "Server error (be)" });
    }
  }
);

// ────────────────────────────────────────────────
// GET /etf/activity/inventory
// Inventory report using average cost method, grouped by category.
// Returns current price via Finnhub (trading day) or Tiingo (fallback).
router.get('/activity/inventory', auth, async (req, res) => {
  const userId = req.user.userId;
  try {
    await withTransaction(async (connection) => {
      // Get all symbols that have a net positive inventory for this user
      const [rows] = await connection.query(
        `SELECT
           s.etfSymbolID,
           s.symbol,
           s.name,
           s.listDate,
           c.etfCategoryID,
           c.category,
           COALESCE(SUM(CASE WHEN a.TransactionType = 'BUY'  THEN a.Shares ELSE 0 END), 0) AS totalBought,
           COALESCE(SUM(CASE WHEN a.TransactionType = 'SELL' THEN a.Shares ELSE 0 END), 0) AS totalSold,
           COALESCE(SUM(CASE WHEN a.TransactionType = 'BUY'  THEN a.Shares * a.PurchaseCost ELSE 0 END), 0) AS totalCostBasis
         FROM etfActivityT a
         JOIN etfSymbolT s  ON a.etfSymbolID   = s.etfSymbolID
         JOIN etfCategoryT c ON a.etfCategoryID = c.etfCategoryID
         WHERE a.UserID = ?
         GROUP BY s.etfSymbolID, s.symbol, s.name, s.listDate, c.etfCategoryID, c.category
         HAVING (totalBought - totalSold) > 0
         ORDER BY c.category ASC, s.symbol ASC`,
        [userId]
      );

      if (rows.length === 0) {
        return res.json({ message: "Success", data: [] });
      }

      const todayStr = toDateStr(new Date());
      const isTrading = isTodayTradingDay();

      // Fetch current price for each symbol (Finnhub if trading day, else Tiingo)
      const pricePromises = rows.map(async (row) => {
        let currentPrice = null;

        if (isTrading) {
          try {
            const finnResp = await axios.get(
              `https://finnhub.io/api/v1/quote?symbol=${row.symbol}&token=${process.env.FINNHUB_API_KEY}`
            );
            currentPrice = finnResp.data.c && finnResp.data.c > 0 ? finnResp.data.c : null;
          } catch (e) {
            logger.warn(`Finnhub failed for ${row.symbol}: ${e.message}`);
          }
        }

        if (currentPrice === null) {
          // Tiingo fallback: fetch last 7 days to find most recent trading day
          try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const startStr = toDateStr(sevenDaysAgo);
            const tiingoResp = await axios.get(
              `https://api.tiingo.com/tiingo/daily/${row.symbol.toLowerCase()}/prices?startDate=${startStr}&endDate=${todayStr}&token=${process.env.TIINGO_API_KEY}`
            );
            if (tiingoResp.data && tiingoResp.data.length > 0) {
              const last = tiingoResp.data[tiingoResp.data.length - 1];
              const adj = parseFloat(last.adjClose);
              const raw = parseFloat(last.close);
              currentPrice = (!isNaN(adj) && adj > 0) ? adj : (!isNaN(raw) && raw > 0 ? raw : null);
            }
          } catch (e) {
            logger.warn(`Tiingo fallback failed for ${row.symbol}: ${e.message}`);
          }
        }

        const netShares    = parseFloat(row.totalBought) - parseFloat(row.totalSold);
        const totalCost    = parseFloat(row.totalCostBasis);
        // Average cost per share = total cost of all purchases / total shares purchased
        const avgCostPerShare = parseFloat(row.totalBought) > 0
          ? totalCost / parseFloat(row.totalBought)
          : 0;
        // Cost basis for current inventory (avg cost × shares held)
        const inventoryCost  = avgCostPerShare * netShares;
        const totalValue     = currentPrice !== null ? currentPrice * netShares : null;
        const changeAmount   = totalValue !== null ? totalValue - inventoryCost : null;

        return {
          etfCategoryID:  row.etfCategoryID,
          category:       row.category,
          etfSymbolID:    row.etfSymbolID,
          symbol:         row.symbol,
          name:           row.name,
          shares:         netShares,
          avgCostPerShare,
          inventoryCost,
          currentPrice,
          totalValue,
          changeAmount
        };
      });

      const inventoryData = await Promise.all(pricePromises);
      res.json({ message: "Success", data: inventoryData });
    });
  } catch (err) {
    logger.error(`GET /etf/activity/inventory: ${err.message}`);
    res.status(500).json({ message: "Server error (be)" });
  }
});

// ────────────────────────────────────────────────
// GET /etf/activity/sales-report
// Sales report by period, grouped by category.
// Query params: period = 'current-year' | 'last-year' | 'custom'
//               startDate, endDate (required when period = 'custom', YYYY-MM-DD)
router.get('/activity/sales-report', auth, async (req, res) => {
  const userId = req.user.userId;
  const { period, startDate, endDate } = req.query;

  // Determine date range
  let rangeStart, rangeEnd;
  const now = new Date();

  if (period === 'current-year') {
    rangeStart = `${now.getFullYear()}-01-01`;
    rangeEnd   = toDateStr(now);
  } else if (period === 'last-year') {
    const lastYear = now.getFullYear() - 1;
    rangeStart = `${lastYear}-01-01`;
    rangeEnd   = `${lastYear}-12-31`;
  } else if (period === 'custom') {
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate required for custom period (be)" });
    }
    rangeStart = startDate;
    rangeEnd   = endDate;
  } else {
    return res.status(400).json({ message: "Invalid period. Use current-year, last-year, or custom (be)" });
  }

  try {
    await withTransaction(async (connection) => {
      const [rows] = await connection.query(
        `SELECT
           a.etfActivityID,
           a.TransactionDate,
           a.Shares,
           a.SalePrice,
           s.etfSymbolID,
           s.symbol,
           s.name,
           c.etfCategoryID,
           c.category,
           -- Average cost per share at time of sale (all BUY rows for this symbol/user)
           (
             SELECT COALESCE(SUM(b.Shares * b.PurchaseCost), 0) /
                    NULLIF(SUM(b.Shares), 0)
             FROM etfActivityT b
             WHERE b.etfSymbolID = a.etfSymbolID
               AND b.UserID      = a.UserID
               AND b.TransactionType = 'BUY'
           ) AS avgCostPerShare
         FROM etfActivityT a
         JOIN etfSymbolT   s ON a.etfSymbolID   = s.etfSymbolID
         JOIN etfCategoryT c ON a.etfCategoryID = c.etfCategoryID
         WHERE a.UserID = ?
           AND a.TransactionType = 'SELL'
           AND a.TransactionDate BETWEEN ? AND ?
         ORDER BY c.category ASC, s.symbol ASC, a.TransactionDate ASC`,
        [userId, rangeStart, rangeEnd]
      );

      const salesData = rows.map(row => {
        const saleProceeds  = parseFloat(row.Shares) * parseFloat(row.SalePrice);
        const costBasis     = parseFloat(row.Shares) * parseFloat(row.avgCostPerShare || 0);
        const profitLoss    = saleProceeds - costBasis;
        return {
          etfCategoryID:  row.etfCategoryID,
          category:       row.category,
          etfSymbolID:    row.etfSymbolID,
          symbol:         row.symbol,
          name:           row.name,
          transactionDate: row.TransactionDate,
          shares:         parseFloat(row.Shares),
          salePrice:      parseFloat(row.SalePrice),
          saleProceeds,
          avgCostPerShare: parseFloat(row.avgCostPerShare || 0),
          costBasis,
          profitLoss
        };
      });

      res.json({ message: "Success", data: salesData, rangeStart, rangeEnd });
    });
  } catch (err) {
    logger.error(`GET /etf/activity/sales-report: ${err.message}`);
    res.status(500).json({ message: "Server error (be)" });
  }
});

// ────────────────────────────────────────────────
// GET /etf/activity/transactions
// Returns all transactions for the current user (for activity log / audit)
router.get('/activity/transactions', auth, async (req, res) => {
  const userId = req.user.userId;
  try {
    await withTransaction(async (connection) => {
      const [rows] = await connection.query(
        `SELECT
           a.etfActivityID,
           a.UserEtfActivityID,
           a.TransactionType,
           a.TransactionDate,
           a.Shares,
           a.PurchaseCost,
           a.SalePrice,
           a.TimeStamp,
           s.symbol,
           s.name,
           c.category,
           c.etfCategoryID,
           s.etfSymbolID
         FROM etfActivityT a
         JOIN etfSymbolT   s ON a.etfSymbolID   = s.etfSymbolID
         JOIN etfCategoryT c ON a.etfCategoryID = c.etfCategoryID
         WHERE a.UserID = ?
         ORDER BY a.TransactionDate DESC, a.etfActivityID DESC`,
        [userId]
      );
      res.json({ message: "Success", data: rows });
    });
  } catch (err) {
    logger.error(`GET /etf/activity/transactions: ${err.message}`);
    res.status(500).json({ message: "Server error (be)" });
  }
});

// ────────────────────────────────────────────────
// DELETE /etf/activity/:id
// Delete a single transaction (with user ownership check)
router.delete('/activity/:id', auth, async (req, res) => {
  const userId = req.user.userId;
  const activityId = req.params.id;
  try {
    await withTransaction(async (connection) => {
      // If deleting a BUY, make sure it would not leave inventory negative
      const [txRow] = await connection.query(
        `SELECT TransactionType, etfSymbolID, Shares
         FROM etfActivityT
         WHERE etfActivityID = ? AND UserID = ?`,
        [activityId, userId]
      );
      if (txRow.length === 0) {
        throw new Error("Transaction not found (be)");
      }
      if (txRow[0].TransactionType === 'BUY') {
        const [buyRows] = await connection.query(
          `SELECT COALESCE(SUM(Shares), 0) AS totalBought
           FROM etfActivityT
           WHERE etfSymbolID = ? AND UserID = ? AND TransactionType = 'BUY'`,
          [txRow[0].etfSymbolID, userId]
        );
        const [sellRows] = await connection.query(
          `SELECT COALESCE(SUM(Shares), 0) AS totalSold
           FROM etfActivityT
           WHERE etfSymbolID = ? AND UserID = ? AND TransactionType = 'SELL'`,
          [txRow[0].etfSymbolID, userId]
        );
        const newInventory = parseFloat(buyRows[0].totalBought) - parseFloat(txRow[0].Shares)
                           - parseFloat(sellRows[0].totalSold);
        if (newInventory < 0) {
          throw new Error("Cannot delete purchase: would make inventory negative (be)");
        }
      }
      const [result] = await connection.query(
        'DELETE FROM etfActivityT WHERE etfActivityID = ? AND UserID = ?',
        [activityId, userId]
      );
      if (result.affectedRows === 0) {
        throw new Error("Transaction not found (be)");
      }
      res.json({ message: "Transaction deleted" });
    });
  } catch (err) {
    if (err.message.endsWith("(be)")) {
      return res.status(400).json({ message: err.message });
    }
    logger.error(`DELETE /etf/activity/:id: ${err.message}`);
    res.status(500).json({ message: "Server error (be)" });
  }
});

module.exports = router;
