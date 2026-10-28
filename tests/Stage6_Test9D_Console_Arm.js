/* WA Stage 6 Test #9D — paste into DevTools Console in EACH of two Chrome Normal tabs.
   LOCAL TEST ONLY. Does not change server code, DB schema, cookie values, or JWT contents.
   Do not copy any credential values from DevTools into reports. */
(() => {
  'use strict';
  if (!window.WA?.session?.restore || !navigator.locks?.request) {
    console.error('[S6-9D] STOP: WA.session.restore or Web Locks unavailable');
    return;
  }
  if (window.__waS6test9D) {
    console.log('[S6-9D] Already armed in this tab');
    return;
  }
  const channel = new BroadcastChannel('wa-s6-test9d-local');
  const id = Math.random().toString(36).slice(2, 8); // diagnostic label only, NOT a credential
  let scheduled = false;
  const runAt = async (wallClockMs) => {
    const delay = Math.max(0, wallClockMs - Date.now());
    console.log(`[S6-9D ${id}] armed, start in ${delay}ms`);
    setTimeout(async () => {
      const started = Date.now();
      console.log(`[S6-9D ${id}] START ${new Date(started).toISOString()}`);
      try {
        const result = await window.WA.session.restore();
        console.log(`[S6-9D ${id}] END ${new Date().toISOString()} authenticated=${!!result.authenticated} restored=${!!result.restored} reason=${result.reason || 'none'}`);
      } catch (e) {
        console.error(`[S6-9D ${id}] ERROR ${e?.name || 'Error'} ${e?.message || ''}`);
      }
    }, delay);
  };
  channel.onmessage = (event) => {
    const m = event.data;
    if (!m || m.test !== 'stage6-9d' || m.kind !== 'start' || scheduled) return;
    scheduled = true;
    runAt(m.at);
  };
  window.__waS6test9D = {
    start() {
      if (scheduled) { console.warn('[S6-9D] Already started; re-arm after page reload for repeat'); return; }
      scheduled = true;
      const at = Date.now() + 4000;
      // localStorage is shared by both tabs; remove the access token only.
      // The HttpOnly KMLI cookie is deliberately left unchanged.
      localStorage.removeItem('token');
      channel.postMessage({ test: 'stage6-9d', kind: 'start', at });
      runAt(at);
    },
    close() { channel.close(); delete window.__waS6test9D; console.log('[S6-9D] unarmed'); }
  };
  console.log(`[S6-9D ${id}] READY. Arm the other tab too, then in ONE tab run: __waS6test9D.start()`);
})();
