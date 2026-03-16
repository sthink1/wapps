const express = require('express');
const router = express.Router();
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const logger = require('../logger');

const pool = require('../dbConnection');
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

router.delete('/symbol/:id', auth, async (req, res) => {
  const userId = req.user.userId;
  const symbolID = req.params.id;
  try {
    await withTransaction(async (connection) => {
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
              if (todayPrice) logger.info(`Finnhub success for ${symbol}: ${todayPrice}`);
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

            let ret = years < 1
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

module.exports = router;