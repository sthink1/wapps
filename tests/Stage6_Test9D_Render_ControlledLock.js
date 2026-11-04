/* Wonderful Apps Stage 6 / Group 5D — RENDER STAGING ONLY.
 * DevTools console: paste into TWO normal Chrome tabs at the exact test URL.
 * This diagnostic changes shared localStorage('token') and performs actual
 * POST /users/refresh-session calls against the Stage 6 test database.
 * Never use on production. Never paste credentials or network headers in reports.
 */
(() => {
  'use strict';
  const EXPECTED_ORIGIN = 'https://wapps-stage6-test.onrender.com';
  const PREFIX = '[S6-5D-Hosted]';
  if (location.origin !== EXPECTED_ORIGIN || location.pathname !== '/home.html' ||
      typeof window.WA?.session?.restore !== 'function' ||
      typeof navigator.locks?.request !== 'function' ||
      typeof navigator.locks?.query !== 'function' ||
      typeof window.BroadcastChannel !== 'function' ||
      !window.isSecureContext || !localStorage.getItem('token')) {
    console.error(`${PREFIX} STOP: requires the exact Stage 6 test home page, signed-in access token, HTTPS, WA facade, Web Locks and BroadcastChannel.`);
    return;
  }
  if (window.__waHosted5D) { console.warn(`${PREFIX} Already armed in this tab`); return; }
  const id = Math.random().toString(36).slice(2, 9);
  const channel = new BroadcastChannel('wa-stage6-5d-hosted-v1');
  const runs = new Map();
  let active = null, closed = false, running = false;
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const log = s => console.log(`${PREFIX} ${id}: ${s}`);
  const broadcast = obj => { if (!closed) channel.postMessage({protocol:'wa-stage6-5d-v1', ...obj}); };
  const entry = runId => {
    if (!runs.has(runId)) runs.set(runId, {ready:new Set(), entered:new Set(), results:new Map()});
    return runs.get(runId);
  };
  async function participant(runId) {
    if (active || closed) return;
    active = runId;
    const item = entry(runId);
    item.entered.add(id);
    broadcast({type:'entered', runId, id});
    const started = performance.now();
    log(`RESTORE entered run=${runId}`);
    try {
      const r = await WA.session.restore();
      const outcome = {authenticated:r?.authenticated === true, restored:r?.restored === true,
                       reason:String(r?.reason || 'none').slice(0,60), durationMs:Math.round(performance.now()-started)};
      item.results.set(id, outcome);
      log(`RESTORE result ${JSON.stringify(outcome)}`);
      broadcast({type:'result', runId, id, outcome});
    } catch (e) {
      // Error class only; never serialize the error object, response, URL or credentials.
      const outcome = {errorType:String(e?.name || 'Error').slice(0,50)};
      item.results.set(id, outcome);
      log(`RESTORE error type=${outcome.errorType}`);
      broadcast({type:'result', runId, id, outcome});
    } finally { active = null; }
  }
  channel.onmessage = event => {
    if (closed) return;
    const m = event.data;
    if (!m || m.protocol !== 'wa-stage6-5d-v1' || typeof m.runId !== 'string') return;
    if (m.type === 'probe') {
      if (!active && localStorage.getItem('token')) {
        entry(m.runId).ready.add(id);
        broadcast({type:'ready',runId:m.runId,id});
      }
      return;
    }
    if (m.type === 'ready' || m.type === 'entered' || m.type === 'result') {
      const item = entry(m.runId);
      if (m.type === 'ready') item.ready.add(m.id);
      if (m.type === 'entered') item.entered.add(m.id);
      if (m.type === 'result') item.results.set(m.id, m.outcome);
    }
    if (m.type === 'start') void participant(m.runId);
  };
  window.__waHosted5D = {
    async start(confirmation) {
      if (confirmation !== 'RUN_STAGE6_TEST') { log('STOP: start requires explicit RUN_STAGE6_TEST confirmation'); return; }
      if (running || active || closed) { log('STOP: already running or closed'); return; }
      if (location.origin !== EXPECTED_ORIGIN || location.pathname !== '/home.html' || !localStorage.getItem('token')) {
        log('STOP: wrong page or no access token'); return;
      }
      running = true;
      const runId = `${Date.now()}-${id}`;
      const item = entry(runId);
      item.ready.add(id);
      try {
        // Confirm both tabs are listening BEFORE modifying shared access-token state.
        broadcast({type:'probe',runId,id});
        const readyUntil = Date.now() + 5000;
        while (item.ready.size < 2 && Date.now() < readyUntil) await delay(50);
        if (item.ready.size !== 2) { log('ABORT: second tab not ready; no token removed'); return; }
        log('Two tabs acknowledged. Starting controlled refresh test.');
        await navigator.locks.request('wa-web-refresh', {mode:'exclusive'}, async () => {
          // This is intentional. Same-origin tabs share localStorage.
          localStorage.removeItem('token');
          broadcast({type:'start',runId,id});
          void participant(runId);
          const enterUntil = Date.now() + 5000;
          while (item.entered.size < 2 && Date.now() < enterUntil) await delay(50);
          if (item.entered.size !== 2) { log('INCOMPLETE: both tabs did not enter; releasing lock'); return; }
          await delay(400);
          const state = await navigator.locks.query();
          const pending = state.pending.filter(x => x.name === 'wa-web-refresh').length;
          const held = state.held.filter(x => x.name === 'wa-web-refresh').length;
          log(`LOCK counts: pending=${pending}, held=${held}, entered=${item.entered.size}`);
        });
        const resultsUntil = Date.now() + 12000;
        while (item.results.size < 2 && Date.now() < resultsUntil) await delay(75);
        const outcomes = [...item.results.values()];
        log(`SUMMARY: results=${outcomes.length}/2, authenticated=${outcomes.filter(x=>x.authenticated).length}/2, restored=${outcomes.filter(x=>x.restored).length}/2`);
        log('Check Network for refresh-session HTTP statuses and count; do NOT share cookies/JWTs/headers.');
        if (outcomes.length < 2 || outcomes.some(x=>!x.authenticated)) log('NOT PASS: incomplete or unsuccessful restoration; review without claiming success.');
      } catch (e) { log(`ERROR type=${String(e?.name || 'Error').slice(0,50)}; no pass claim`); }
      finally { running = false; }
    },
    close() {
      if (closed) return;
      closed = true;
      channel.close();
      delete window.__waHosted5D;
      log('Closed');
    }
  };
  log('ARMED. Arm second tab, then in one tab call __waHosted5D.start("RUN_STAGE6_TEST")');
})();
