/* Wonderful Apps - Stage 6 usage tracker pilot, 2026-11-08.
 * Single owner for page views/time-spent per page; no global fetch patch.
 * Requires js/waPlatform.js to be loaded first.
 * All POSTs are made once. Never replay an uncertain mutation.
 */
(() => {
    'use strict';
    if (window.__waUsageTrackingInstalled) return;
    window.__waUsageTrackingInstalled = true;

    const PERIOD_MS = 30000;
    const page = window.location.pathname || '/';
    let started = false;
    let startInProgress = false;
    let foregroundStart = null;
    let elapsedCarry = 0;
    let secondsSubmitted = 0;
    let suspended = false;
    let tickHandle = null;

    const currentToken = () => window.WA?.session?.getAccessToken?.() || null;

    // Ordinary requests use the Stage 6 session facade: current token, refresh
    // coordination and no automatic replay of rejected POSTs.
    async function sendNormal(path, payload) {
        if (!window.WA?.api?.request) return;
        try {
            const response = await window.WA.api.request(path, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                cache: 'no-store'
            });
            if (!response.ok) console.warn('Usage tracking request rejected:', path, response.status);
        } catch (error) {
            // Do not retry a request when delivery status is uncertain.
            console.warn('Usage tracking request unavailable (exception details omitted):', path);
        }
    }

    // Page-exit requests must be synchronous to initiate: no await in pagehide.
    // A Bearer token is required, so navigator.sendBeacon() alone is unsuitable.
    function sendExit(path, payload) {
        const token = currentToken();
        if (!token || localStorage.getItem('wa_explicit_logout') === '1') return;
        try {
            fetch(path, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
                credentials: 'same-origin',
                cache: 'no-store',
                keepalive: true
            }).catch(() => {});
        } catch (_) { /* unloading: no retry */ }
    }

    function accumulateForeground() {
        if (foregroundStart !== null) {
            elapsedCarry += Math.max(0, performance.now() - foregroundStart);
            foregroundStart = null;
        }
    }

    function checkpoint(exit = false) {
        if (!started) return;
        accumulateForeground();
        // Submit only whole seconds, preserving fractional milliseconds for
        // subsequent checkpoints. Mark time consumed before any network request.
        const seconds = Math.floor(elapsedCarry / 1000);
        elapsedCarry -= seconds * 1000;
        if (seconds > 0) {
            secondsSubmitted += seconds;
            const payload = { page, duration: seconds };
            if (exit) sendExit('/track/log/time-spent', payload);
            else void sendNormal('/track/log/time-spent', payload);
        }
        if (!exit && !document.hidden && !suspended) foregroundStart = performance.now();
    }

    async function start() {
        if (started || startInProgress) return;
        if (!window.WA?.session?.restore) return;
        startInProgress = true;
        let session;
        try { session = await window.WA.session.restore(); }
        catch (_) { startInProgress = false; return; }
        startInProgress = false;
        if (!session?.authenticated || localStorage.getItem('wa_explicit_logout') === '1') return;
        started = true;
        suspended = false;
        if (!document.hidden) foregroundStart = performance.now();
        void sendNormal('/track/log/page', { page });
        tickHandle = setInterval(() => { if (started && !suspended) checkpoint(false); }, PERIOD_MS);
    }

    function pause() {
        if (!started || suspended) return;
        suspended = true;
        checkpoint(true);
    }
    function resume(restoredFromCache = false) {
        if (!started) { void start(); return; }
        if (!suspended) return;
        suspended = false;
        if (!document.hidden) foregroundStart = performance.now();
        if (restoredFromCache) void sendNormal('/track/log/page', { page });
    }
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) pause();
        else resume(false);
    });
    window.addEventListener('pagehide', pause);
    window.addEventListener('pageshow', e => {
        if (e.persisted) resume(true);
    });
    // Beforeunload is not a reliable primary event; pagehide/visibilitychange
    // owns delivery. Calling pause again is harmless (idempotency guard).
    window.addEventListener('beforeunload', pause);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else void start();
})();
