/**
 * Debug script to compare etf/compare API results with manual calculation
 * Usage: NODE_ENV=development node debug_etf_compare.js
 */

const axios = require('axios');
require('dotenv').config();

const SYMBOLS = ['SHNY', 'KGLD', 'IAUI', 'GLDY'];
const BASE_URL = 'http://localhost:8080';

// Get token via login first)
async function getToken() {
  try {
    const response = await axios.post(`${BASE_URL}/users/login`, {
      username: process.env.TEST_USER || 'testuser',
      password: process.env.TEST_PASS || 'testpass'
    });
    return response.data.token;
  } catch (err) {
    console.error('Login failed:', err.message);
    process.exit(1);
  }
}

async function main() {
  const token = await getToken();
  console.log('✓ Authenticated\n');

  // Fetch only Gold category
  try {
    const resp = await axios.get(`${BASE_URL}/etf/compare?category=Gold&rows=10`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const { current, past } = resp.data;

    console.log('=''.repeat(80));
    console.log('BACKEND /etf/compare RESULTS (Gold Category)');
    console.log('='.repeat(80));

    SYMBOLS.forEach(sym => {
      const currItem = current.find(item => item.symbol === sym);
      if (currItem) {
        console.log(`\n${sym}:`);
        console.log('  Table 1 (Current):');
        console.log(`    1W:  ${currItem.returns['1W']}%`);
        console.log(`    1M:  ${currItem.returns['1M']}%`);
        console.log(`    YTD: ${currItem.returns['YTD']}%`);
        console.log(`    1Y:  ${currItem.returns['1Y']}%`);
        console.log(`    3Y:  ${currItem.returns['3Y']}%`);
        console.log(`    5Y:  ${currItem.returns['5Y']}%`);
        console.log(`  ListDate: ${currItem.listDate}`);
      }

      const pastItem = past.find(item => item.symbol === sym);
      if (pastItem) {
        console.log('  Table 2 (Past):');
        console.log(`    1W:  ${pastItem.returns['1W']}%`);
        console.log(`    1M:  ${pastItem.returns['1M']}%`);
        console.log(`    YTD: ${pastItem.returns['YTD']}%`);
        console.log(`    1Y:  ${pastItem.returns['1Y']}%`);
        console.log(`    3Y:  ${pastItem.returns['3Y']}%`);
        console.log(`    5Y:  ${pastItem.returns['5Y']}%`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('NEXT STEPS:');
    console.log('1. Enable detailed logging in routes/etf.js /compare endpoint');
    console.log('2. Check server logs for date calculations and price lookups');
    console.log('3. Compare Tiingo cache data vs etfAPItest.html manual fetches');
    console.log('='.repeat(80));

  } catch (err) {
    console.error('Failed to fetch compare data:', err.response?.data || err.message);
  }
}

main();
