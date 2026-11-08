(() => {
    'use strict';

    const token = localStorage.getItem('token');
    if (!token) return;

    const BASE_URL =
        window.location.hostname === 'localhost' && window.location.port !== '8080'
            ? 'http://localhost:8080'
            : window.location.origin;

    const page = window.location.pathname || '/';
    let startedAt = Date.now();
    let timeSent = false;

    function send(path, payload, keepalive = false) {
        return fetch(`${BASE_URL}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload),
            keepalive
        }).catch(error => {
            console.error(`Usage tracking error (${path}):`, error.message);
        });
    }

    function logPageView() {
        send('/track/log/page', { page });
    }

    function sendElapsedTime() {
        if (timeSent) return;
        timeSent = true;

        const duration = Math.floor((Date.now() - startedAt) / 1000);
        if (duration <= 0) return;

        send('/track/log/time-spent', { page, duration }, true);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', logPageView, { once: true });
    } else {
        logPageView();
    }

    // pagehide works reliably for ordinary navigation and mobile browser page changes.
    // beforeunload is retained as a fallback; the guard prevents a duplicate write.
    window.addEventListener('pagehide', sendElapsedTime);
    window.addEventListener('beforeunload', sendElapsedTime);

    // A page restored from the browser back/forward cache becomes a new timed visit.
    window.addEventListener('pageshow', event => {
        if (!event.persisted) return;
        startedAt = Date.now();
        timeSent = false;
        logPageView();
    });
})();
