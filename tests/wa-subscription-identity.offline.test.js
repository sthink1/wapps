'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { EXPECTED, main } = require('../tools/wa-subscription-one-time-migration');

// Extracted from the authoritative November 18 wappsHelioTestDump.sql UsersT INSERT.
// This fixture intentionally lives outside the migration's EXPECTED data so it can
// detect accidentally mistyped usernames rather than testing a list against itself.
const dumpIdentities = new Map([
  [1, 'sthink'], [40, 'eg'], [42, 'egalvin'], [43, 'malcolm4'],
  [44, 'laurel'], [45, 'sthink6386'], [48, 'mpgoutlook'], [49, 'cotravel'],
  [51, 'mmintonec'], [52, 'janet'], [53, 'jlm4212'],
  [54, 'b0ulderagalvin'], [55, 'dswim'], [56, 'mpgiii'],
  [57, 'mgalvinnj'], [58, 'kelsey'], [63, 'glaw'], [64, 'charter']
]);

test('All 18 expected identities match independent November 18 SQL dump fixture', () => {
  assert.equal(EXPECTED.length, dumpIdentities.size);
  for (const row of EXPECTED) {
    assert.equal(row[1], dumpIdentities.get(row[0]), `UserID ${row[0]}`);
  }
});

test('An incorrect username fails closed without migration updates', async () => {
  const former = process.env.DB_NAME;
  process.env.DB_NAME = 'wapps_test';
  let writes = 0;
  let rollbacks = 0;
  const connection = {
    beginTransaction: async () => {},
    rollback: async () => { rollbacks++; },
    release: () => {},
    query: async (sql) => {
      if (sql.startsWith('SELECT DATABASE()')) return [[{ db: 'wapps_test' }]];
      if (sql.includes('FROM UsersT WHERE UserID IN')) {
        return [[...dumpIdentities].map(([UserID, UserName]) => ({
          UserID, UserName: UserID === 57 ? 'different-name' : UserName
        }))];
      }
      writes++;
      throw new Error('Unexpected query after identity failure');
    }
  };
  try {
    await assert.rejects(main(['--check'], {getConnection: async () => connection}), /identity snapshot/);
    assert.equal(writes, 0);
    assert.equal(rollbacks, 1);
  } finally {
    if (former === undefined) delete process.env.DB_NAME;
    else process.env.DB_NAME = former;
  }
});
