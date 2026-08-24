const BASE_URL =
    window.location.hostname === 'localhost' && window.location.port !== '8080'
        ? 'http://localhost:8080'
        : window.location.origin;

function token() {
    return localStorage.getItem('token');
}

function headers() {
    return {
        Authorization: `Bearer ${token()}`,
        'Content-Type': 'application/json'
    };
}

function requireLogin() {
    if (!token()) {
        window.location.href = 'login.html';
        return false;
    }

    return true;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!requireLogin()) return;

    const code = sessionStorage.getItem('familyTreeCode') || '';

    document.getElementById('familyTreeCodeDisplay').textContent =
        code || 'None selected';

    document.querySelectorAll('[data-page]').forEach(button => {
        button.addEventListener('click', () => {
            window.location.href = button.dataset.page;
        });
    });

    document.getElementById('clearTreeBtn').addEventListener('click', () => {
        sessionStorage.removeItem('familyTreeCode');
        document.getElementById('familyTreeCodeDisplay').textContent =
            'None selected';
    });

    try {
        const response = await fetch(`${BASE_URL}/familytree/health`, {
            headers: headers()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Database check failed');
        }

        document.getElementById('dbStatus').textContent =
            `Connected (${data.database})`;

        document.getElementById('dbStatus').className = 'success';
    } catch (error) {
        document.getElementById('dbStatus').textContent = error.message;
        document.getElementById('dbStatus').className = 'error';
    }
});
