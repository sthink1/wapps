const BASE_URL =
    window.location.hostname === 'localhost' && window.location.port !== '8080'
        ? 'http://localhost:8080'
        : window.location.origin;

const $ = id => document.getElementById(id);
const token = () => localStorage.getItem('token');

const params = new URLSearchParams(window.location.search);
const personID = Number(params.get('PersonID'));

let familyTreeCode =
    params.get('familyTreeCode') ||
    sessionStorage.getItem('familyTreeCode') ||
    '';

function nameOf(person) {
    const first = [
        person.FirstName,
        person.MiddleName,
        person.SuffixName
    ].filter(Boolean).join(' ');

    let name = [
        person.LastName ? `${person.LastName},` : '',
        first
    ].filter(Boolean).join(' ').trim();

    const extra = [
        person.NickName,
        person.MaidenName
    ].filter(Boolean).join(' ');

    if (extra) {
        name += ` (${extra})`;
    }

    return name;
}

function ageOf(person) {
    if (!person.BirthDate) return '';

    const birth = new Date(
        `${String(person.BirthDate).slice(0, 10)}T00:00:00`
    );

    const end = person.DeathDate
        ? new Date(`${String(person.DeathDate).slice(0, 10)}T00:00:00`)
        : new Date();

    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();

    if (
        m < 0 ||
        (m === 0 && end.getDate() < birth.getDate())
    ) {
        age--;
    }

    return age >= 0 ? age : '';
}

function openPerson(id) {
    window.location.href =
        `FTPerson.html?PersonID=${encodeURIComponent(id)}` +
        `&familyTreeCode=${encodeURIComponent(familyTreeCode)}`;
}

async function load() {
    const response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}/relationships` +
        `?familyTreeCode=${encodeURIComponent(familyTreeCode)}`,
        {
            headers: {
                Authorization: `Bearer ${token()}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            'Unable to load children.'
        );
    }

    const personResponse = await fetch(
        `${BASE_URL}/familytree/persons/${personID}` +
        `?familyTreeCode=${encodeURIComponent(familyTreeCode)}`,
        {
            headers: {
                Authorization: `Bearer ${token()}`
            }
        }
    );

    const personData = await personResponse.json();

    if (!personResponse.ok) {
        throw new Error(
            personData.message ||
            'Unable to load person.'
        );
    }

    $('personNameDisplay').textContent =
        nameOf(personData.person);

    const children = data.children || [];

    $('rows').innerHTML = children.length
        ? children.map(person => `
            <tr>
                <td class="p-cell">
                    <button
                        class="p-btn"
                        data-id="${person.PersonID}"
                        title="PersonID ${person.PersonID}"
                        type="button"
                    >P</button>
                </td>
                <td>${person.Gender || ''}</td>
                <td>${ageOf(person)}</td>
                <td>${nameOf(person)}</td>
            </tr>
        `).join('')
        : '<tr><td colspan="4">No children entered.</td></tr>';

    document.querySelectorAll('.p-btn').forEach(button => {
        button.onclick = () =>
            openPerson(Number(button.dataset.id));
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!token()) {
        window.location.href = 'login.html';
        return;
    }

    $('backBtn').onclick = () => {
        if (history.length > 1) history.back();
        else window.location.href = `FTAncestor.html?PersonID=${encodeURIComponent(personID)}&familyTreeCode=${encodeURIComponent(familyTreeCode)}`;
    };

    try {
        await load();
    } catch (error) {
        $('status').textContent = error.message;
    }
});
