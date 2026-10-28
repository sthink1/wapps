/* Wonderful Apps Stage 6 Test 9D — LOCAL DEVTOOLS ONLY.
   Paste this entire script into the Console of TWO Chrome Normal tabs at
   http://localhost:8080/home.html. Both must be signed into the same KMLI session.
   It briefly HOLDS the existing WA Web Lock, queues two WA.session.restore()
   calls, then releases the lock. Never copies/prints tokens or cookies.
   No DB schema/code modifications. Do NOT use in production.
*/
(() => {
  'use strict';
  const PREFIX = '[S6-9D-Controlled]';
  if (location.origin !== 'http://localhost:8080' || !window.WA?.session?.restore ||
      !navigator.locks?.request || !navigator.locks?.query ||
      !window.BroadcastChannel || !localStorage.getItem('token')) {
    console.error(`${PREFIX} STOP: expected localhost:8080, signed-in session, Web Locks, BroadcastChannel and WA.session.restore.`);
    return;
  }
  if (window.__waControlled9D) { console.warn(`${PREFIX} Already armed here`); return; }
  const id = Math.random().toString(36).slice(2, 8); // log label, not secret
  const channel = new BroadcastChannel('wa-stage6-9d-controlled-v2');
  const seen = new Map();
  let activeRun = null;
  let lastRun = null;
  let closed = false;
  const log = (message) => console.log(`${PREFIX} ${id} ${message}`);
  const broadcast = m => channel.postMessage({ ...m, protocol: 's6-9d-v2' });
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  async function participant(runId) {
    if (activeRun || lastRun === runId) return;
    activeRun = runId;
    lastRun = runId;
    const started = performance.now();
    const localItem = seen.get(runId) || { entered: new Set(), results: new Map() };
    localItem.entered.add(id);
    seen.set(runId, localItem);
    broadcast({ type: 'entered', runId, id });
    log(`ENTER restore() run=${runId}`);
    try {
      const r = await WA.session.restore();
      const outcome = { authenticated: !!r.authenticated, restored: !!r.restored,
                        reason: r.reason || 'none', durationMs: Math.round(performance.now() - started) };
      log(`RESULT run=${runId} ${JSON.stringify(outcome)}`);
      localItem.results.set(id, outcome);
      broadcast({ type: 'result', runId, id, outcome });
    } catch (error) {
      const outcome = { error: error?.message || String(error) };
      log(`ERROR run=${runId} ${JSON.stringify(outcome)}`);
      localItem.results.set(id, outcome);
      broadcast({ type: 'result', runId, id, outcome });
    } finally { activeRun = null; }
  }

  channel.onmessage = e => {
    const m = e.data;
    if (!m || m.protocol !== 's6-9d-v2') return;
    if (m.type === 'start') void participant(m.runId);
    if (m.type === 'entered' || m.type === 'result') {
      const item = seen.get(m.runId) || { entered: new Set(), results: new Map() };
      if (m.type === 'entered') item.entered.add(m.id);
      else item.results.set(m.id, m.outcome);
      seen.set(m.runId, item);
    }
  };

  window.__waControlled9D = {
    async start() {
      if (activeRun || this.running) { log('STOP: test already running'); return; }
      this.running = true;
      const runId = `${Date.now()}-${id}`;
      const item = { entered: new Set(), results: new Map() };
      seen.set(runId, item);
      log(`Preparing run=${runId}. Do not reload or log out.`);
      try {
        await navigator.locks.request('wa-web-refresh', { mode: 'exclusive' }, async () => {
          // While holding the real WA lock, eliminate the access token once.
          // Both restoration operations must now wait on this lock.
          localStorage.removeItem('token');
          broadcast({ type: 'start', runId });
          void participant(runId);
          const deadline = Date.now() + 5000;
          while (item.entered.size < 2 && Date.now() < deadline) await delay(50);
          if (item.entered.size !== 2) {
            log(`ABORT: only ${item.entered.size} tab(s) joined; releasing lock. No pass claim.`);
            return;
          }
          await delay(400); // allow both WA.session.restore() calls to queue
          const state = await navigator.locks.query();
          const pending = state.pending.filter(x => x.name === 'wa-web-refresh').length;
          const held = state.held.filter(x => x.name === 'wa-web-refresh').length;
          log(`LOCK EVIDENCE: entered=${item.entered.size}, pending=${pending}, held=${held}`);
          log('Releasing gate lock. Expected: one refresh rotation; both restore authenticated.');
        });
        const deadline = Date.now() + 8000;
        while (item.results.size < 2 && Date.now() < deadline) await delay(75);
        const outcomes = [...item.results.values()];
        log(`SUMMARY: results=${outcomes.length}/2, authenticated=${outcomes.filter(x => x.authenticated).length}/2, restoredTrue=${outcomes.filter(x => x.restored).length}.`);
        log('Inspect each tab Network > refresh-session statuses. Do not share token/cookie values.');
        if (outcomes.length < 2) log('INCOMPLETE: Both tab results not received.');
      } catch (error) { console.error(PREFIX, 'Test error:', error?.message || String(error)); }
      finally { this.running = false; }
    },
    close() { if (!closed) channel.close(); closed = true; delete window.__waControlled9D; log('Closed'); }
  };
  log('READY. Arm the other tab; then in Tab 1 run __waControlled9D.start()');
})();
