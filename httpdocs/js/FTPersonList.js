
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

let allPersons = [];

function formatDate(value) {
    if (!value) return '';
    const datePart = String(value).slice(0, 10);
    const parts = datePart.split('-');
    if (parts.length !== 3) return datePart;
    return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

function fullName(person) {
    const last = person.LastName || '';
    const first = person.FirstName || '';
    const middle = person.MiddleName || '';
    const suffix = person.SuffixName || '';
    const nickname = person.NickName || '';
    const maiden = person.MaidenName || '';

    // Mirrors the legacy Access display order while suppressing empty-space artifacts.
    const given = [first, middle, suffix].filter(Boolean).join(' ');
    let name = [last ? `${last},` : '', given].filter(Boolean).join(' ').trim();

    const parenthetical = [nickname, maiden].filter(Boolean).join(' ');
    if (parenthetical) name += ` (${parenthetical})`;

    return name || `Person ${person.PersonID}`;
}

function renderPersons(persons) {
    const tbody = document.getElementById('personTableBody');
    tbody.innerHTML = '';

    if (!persons.length) {
        tbody.innerHTML =
            '<tr><td colspan="5" class="empty-row">No persons found.</td></tr>';
        return;
    }

    persons.forEach(person => {
        const row = document.createElement('tr');

        const idCell = document.createElement('td');
        const idButton = document.createElement('button');
        idButton.type = 'button';
        idButton.className = 'person-id-btn';
        idButton.textContent = person.PersonID;
        idButton.title = `Open PersonID ${person.PersonID}`;
        idButton.addEventListener('click', () => {
            window.location.href =
                `FTPerson.html?PersonID=${encodeURIComponent(person.PersonID)}`;
        });
        idCell.appendChild(idButton);

        const nameCell = document.createElement('td');
        nameCell.textContent = fullName(person);

        const birthCell = document.createElement('td');
        birthCell.textContent = formatDate(person.BirthDate);

        const placeCell = document.createElement('td');
        placeCell.textContent = person.BirthPlace || '';

        const deathCell = document.createElement('td');
        deathCell.textContent = formatDate(person.DeathDate);

        row.append(idCell, nameCell, birthCell, placeCell, deathCell);
        tbody.appendChild(row);
    });
}

function applyFilter() {
    const term = document.getElementById('filterInput').value.trim().toLowerCase();

    if (!term) {
        renderPersons(allPersons);
        return;
    }

    const filtered = allPersons.filter(person => {
        const searchable = [
            person.PersonID,
            fullName(person),
            person.BirthDate,
            person.BirthPlace,
            person.DeathDate
        ]
            .filter(value => value !== null && value !== undefined)
            .join(' ')
            .toLowerCase();

        return searchable.includes(term);
    });

    renderPersons(filtered);
}

async function loadPersons() {
    const tbody = document.getElementById('personTableBody');
    tbody.innerHTML =
        '<tr><td colspan="5" class="empty-row">Loading...</td></tr>';
    showStatus('');

    try {
        // Backend route to be added in routes/familyTree.js.
        const response = await fetch(`${BASE_URL}/familytree/persons`, {
            method: 'GET',
            headers: authHeaders(false)
        });

        let data = {};
        try {
            data = await response.json();
        } catch (_) {}

        if (!response.ok) {
            throw new Error(data.message || `Unable to load persons (HTTP ${response.status}).`);
        }

        allPersons = Array.isArray(data)
            ? data
            : (data.persons || data.results || []);

        renderPersons(allPersons);
        showStatus(`${allPersons.length} person${allPersons.length === 1 ? '' : 's'} displayed.`);
    } catch (error) {
        console.error(error);
        allPersons = [];
        renderPersons([]);
        showStatus(
            error.message.includes('404')
                ? 'The FamilyTree API has not yet been connected to server.js.'
                : error.message,
            'error'
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!requireLogin()) return;

    document.getElementById('filterInput').addEventListener('input', applyFilter);
    document.getElementById('refreshBtn').addEventListener('click', loadPersons);

    loadPersons();
    trackPageView();
});
