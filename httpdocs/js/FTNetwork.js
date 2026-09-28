const BASE_URL =
    window.location.hostname === 'localhost' &&
    window.location.port !== '8080'
        ? 'http://localhost:8080'
        : window.location.origin;

const $ = id => document.getElementById(id);
const token = () => localStorage.getItem('token');

const authHeaders = () => ({
    Authorization: `Bearer ${token()}`
});

const escapeHtml = value =>
    String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);

const SEARCH_FIELDS = [
    'BusinessSeekingVendor',
    'VendorSeekingBusiness',
    'SeekingProfessionalServices',
    'ProfessionalOfferingServices',
    'CustomerSeekingBusiness',
    'BusinessSeekingCustomers',
    'SeekingRelativesInArea',
    'SeekingSchoolConnection'
];

const params = new URLSearchParams(window.location.search);
const personID = Number(params.get('PersonID'));

let familyTreeCode =
    params.get('familyTreeCode') ||
    sessionStorage.getItem('familyTreeCode') ||
    '';

function personName(person) {
    return [
        person.FirstName,
        person.MiddleName,
        person.LastName,
        person.SuffixName
    ].filter(Boolean).join(' ').trim() ||
        `Person ${person.PersonID}`;
}

function selectedCriteria() {
    return SEARCH_FIELDS.filter(field => {
        const checkbox = $(field);
        return checkbox && checkbox.checked;
    });
}

function clearSearch() {
    SEARCH_FIELDS.forEach(field => {
        const checkbox = $(field);

        if (checkbox) {
            checkbox.checked = false;
        }
    });

    $('body').innerHTML =
        '<tr><td colspan="3">Select search criteria.</td></tr>';

    $('status').textContent = '';
}

async function loadFocalPerson() {
    const response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}` +
        `?familyTreeCode=${encodeURIComponent(familyTreeCode)}`,
        {
            headers: authHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to load the Person for this Networking search.'
        );
    }

    if (data.FamilyTreeCode) {
        familyTreeCode = data.FamilyTreeCode;
        sessionStorage.setItem('familyTreeCode', familyTreeCode);
        $('codeDisplay').textContent = familyTreeCode;
    }

    const person = data.person || {};
    $('searchPersonDisplay').textContent =
        `${personName(person)} (PersonID ${personID})`;
}

async function searchNetwork() {
    const criteria = selectedCriteria();

    if (!criteria.length) {
        $('status').textContent =
            'Select at least one Networking search criterion.';
        return;
    }

    const query = new URLSearchParams({
        familyTreeCode,
        PersonID: String(personID),
        criteria: criteria.join(',')
    });

    $('status').textContent = 'Searching...';

    const response = await fetch(
        `${BASE_URL}/familytree/network/search?${query.toString()}`,
        {
            headers: authHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || 'Network search failed.'
        );
    }

    const rows = data.results || [];

    $('body').innerHTML = rows.length
        ? rows.map(person => `
            <tr>
              <td>
                <button
                  class="person-link icon-action"
                  data-id="${escapeHtml(person.PersonID)}"
                  type="button"
                  title="View Person"
                  aria-label="View Person"
                >
                  <img src="images/person.svg" alt="">
                </button>
              </td>
              <td>${escapeHtml(person.Name || '')}</td>
              <td class="match">
                ${(person.Matches || [])
                    .map(match => escapeHtml(match))
                    .join('<br>')}
              </td>
            </tr>
          `).join('')
        : '<tr><td colspan="3">No matches found.</td></tr>';

    document.querySelectorAll('.person-link').forEach(button => {
        button.onclick = () => {
            window.location.href =
                `FTPerson.html?PersonID=${encodeURIComponent(button.dataset.id)}` +
                `&familyTreeCode=${encodeURIComponent(familyTreeCode)}`;
        };
    });

    $('status').textContent =
        `${rows.length} match${rows.length === 1 ? '' : 'es'} found.`;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!token()) {
        window.location.href = 'login.html';
        return;
    }

    if (!personID) {
        $('searchPersonDisplay').textContent = 'No Person was selected.';
        $('status').textContent =
            'Start a Networking search from a Person Page by clicking SEARCH NETWORKING.';
        $('searchBtn').disabled = true;
        return;
    }

    if (!familyTreeCode) {
        $('status').textContent = 'No current Family Tree is selected.';
        $('searchBtn').disabled = true;
        return;
    }

    $('codeDisplay').textContent = familyTreeCode;
    $('searchBtn').disabled = true;

    $('searchBtn').onclick = () =>
        searchNetwork().catch(error => {
            $('status').textContent = error.message;
        });

    $('clearBtn').onclick = clearSearch;

    try {
        await loadFocalPerson();
        $('searchBtn').disabled = false;
    } catch (error) {
        $('searchPersonDisplay').textContent = 'Unable to determine.';
        $('status').textContent = error.message;
        $('searchBtn').disabled = true;
    }
});
