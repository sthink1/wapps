
const BASE_URL =
    window.location.hostname === 'localhost' && window.location.port !== '8080'
        ? 'http://localhost:8080'
        : window.location.origin;

function getToken() {
    return localStorage.getItem('token');
}

function requireLogin() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return null;
    }
    return token;
}

function authHeaders(includeJson = true) {
    const token = getToken();
    const headers = { Authorization: `Bearer ${token}` };
    if (includeJson) headers['Content-Type'] = 'application/json';
    return headers;
}

function showStatus(message, type = '') {
    const el = document.getElementById('statusMessage');
    if (!el) return;
    el.textContent = message || '';
    el.className = `status ${type}`.trim();
}

function trackPageView() {
    const token = getToken();
    if (!token) return;

    fetch(`${BASE_URL}/track/log/page`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ page: window.location.pathname })
    }).catch(() => {
        // Tracking must never prevent FamilyTree use.
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (!requireLogin()) return;

    // A selected FamilyTreeCode can later be stored by the FamilyTree access workflow.
    const familyTreeCode =
        sessionStorage.getItem('familyTreeCode') ||
        localStorage.getItem('familyTreeCode');

    document.getElementById('familyTreeCodeDisplay').textContent =
        familyTreeCode || 'No Family Tree selected';

    document.querySelectorAll('[data-page]').forEach(button => {
        button.addEventListener('click', () => {
            window.location.href = button.dataset.page;
        });
    });

    trackPageView();
});
