
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

function nullIfBlank(value) {
    const trimmed = String(value ?? '').trim();
    return trimmed === '' ? null : trimmed;
}

function collectPersonForm() {
    const died = document.getElementById('Died').checked;

    return {
        FirstName: nullIfBlank(document.getElementById('FirstName').value),
        MiddleName: nullIfBlank(document.getElementById('MiddleName').value),
        LastName: nullIfBlank(document.getElementById('LastName').value),
        SuffixName: nullIfBlank(document.getElementById('SuffixName').value),
        NickName: nullIfBlank(document.getElementById('NickName').value),
        MaidenName: nullIfBlank(document.getElementById('MaidenName').value),
        Gender: nullIfBlank(document.getElementById('Gender').value),
        BirthDate: nullIfBlank(document.getElementById('BirthDate').value),
        BirthPlace: nullIfBlank(document.getElementById('BirthPlace').value),
        Died: died ? 1 : 0,
        DeathDate: died
            ? nullIfBlank(document.getElementById('DeathDate').value)
            : null
    };
}

function validatePerson(person) {
    // We need enough information to make a person distinguishable in search.
    if (!person.FirstName && !person.LastName) {
        return 'Enter at least a First Name or Last Name.';
    }

    if (person.DeathDate && person.BirthDate && person.DeathDate < person.BirthDate) {
        return 'Death Date cannot be earlier than Birth Date.';
    }

    return null;
}

document.addEventListener('DOMContentLoaded', () => {
    if (!requireLogin()) return;

    const form = document.getElementById('personForm');
    const died = document.getElementById('Died');
    const deathDate = document.getElementById('DeathDate');
    const saveButton = document.getElementById('savePersonBtn');

    died.addEventListener('change', () => {
        deathDate.disabled = !died.checked;
        if (!died.checked) deathDate.value = '';
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
        form.reset();
        deathDate.disabled = true;
        showStatus('');
        document.getElementById('FirstName').focus();
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const person = collectPersonForm();
        const validationMessage = validatePerson(person);
        if (validationMessage) {
            showStatus(validationMessage, 'error');
            return;
        }

        saveButton.disabled = true;
        showStatus('Saving person...');

        try {
            // Backend route to be added in routes/familyTree.js.
            const response = await fetch(`${BASE_URL}/familytree/persons`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(person)
            });

            let data = {};
            try {
                data = await response.json();
            } catch (_) {
                // Keep a useful fallback error below.
            }

            if (!response.ok) {
                throw new Error(data.message || `Unable to save person (HTTP ${response.status}).`);
            }

            const personID = data.PersonID ?? data.personID ?? data.personId;
            if (!personID) {
                throw new Error('Person was saved, but the server did not return a PersonID.');
            }

            showStatus(`Person saved. PersonID ${personID}.`, 'success');

            // FTPerson.html will be generated in the next FamilyTree development stage.
            window.location.href = `FTPerson.html?PersonID=${encodeURIComponent(personID)}`;
        } catch (error) {
            console.error(error);
            showStatus(
                error.message.includes('404')
                    ? 'The FamilyTree API has not yet been connected to server.js.'
                    : error.message,
                'error'
            );
        } finally {
            saveButton.disabled = false;
        }
    });

    trackPageView();
});
