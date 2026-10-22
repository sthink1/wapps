'use strict';
// Fail closed unless the explicit Group 0d test-only environment contract passes.
require('./stage6Environment');
const DAY_MS = 24 * 60 * 60 * 1000;
const START_DELAY_MS = 60 * 1000;
const BATCH = 250;
const MAX_BATCHES = 12; // At most 3,000 old entries per maintenance run.
const DELETE_SQL = `DELETE FROM PasswordResetRateT
 WHERE WindowStart < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 48 HOUR)
 ORDER BY WindowStart ASC LIMIT ${BATCH}`;

async function cleanupOnce(pool, log = console) {
  let deleted = 0;
  let batches = 0;
  try {
    for (let n = 0; n < MAX_BATCHES; n++) {
      const [result] = await pool.query(DELETE_SQL);
      const count = Number(result.affectedRows);
      if (!Number.isSafeInteger(count) || count < 0 || count > BATCH) {
        throw new Error('Unexpected cleanup affectedRows');
      }
      deleted += count;
      batches++;
      if (count < BATCH) break; // No backlog remaining.
    }
    log.info?.(`Stage6A reset rate cleanup: removed ${deleted} expired records in ${batches} batch(es).`);
    return {ok:true,deleted,batches,mayHaveMore:batches===MAX_BATCHES};
  } catch (err) {
    // A partial cleanup is safe: only expired rows were removed. Never bypass rate limiting.
    log.error?.(`Stage6A reset rate cleanup failed after ${deleted} removed: ${err.message}`);
    return {ok:false,deleted,batches};
  }
}
function start(pool, log = console) {
  if (!pool || typeof pool.query !== 'function') throw new Error('Database pool required');
  let running = false;
  let stopped = false;
  const tick = async () => {
    if (running || stopped) return;
    running = true;
    try { await cleanupOnce(pool, log); }
    finally { running = false; }
  };
  const interval = setInterval(() => { void tick(); }, DAY_MS);
  interval.unref?.();
  const first = setTimeout(() => { void tick(); }, START_DELAY_MS);
  first.unref?.();
  return () => { stopped = true; clearTimeout(first); clearInterval(interval); };
}
module.exports={cleanupOnce,start,DELETE_SQL,BATCH,MAX_BATCHES,DAY_MS,START_DELAY_MS};
