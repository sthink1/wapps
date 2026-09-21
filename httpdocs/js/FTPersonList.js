const BASE_URL =
    window.location.hostname === 'localhost' && window.location.port !== '8080'
        ? 'http://localhost:8080'
        : window.location.origin;

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[ch]);
}

const token = () => localStorage.getItem('token');

let trees = [];
let currentCode = '';
let originalCode = '';
let filterText = '';

function nameOf(person) {
    const given = [
        person.FirstName,
        person.MiddleName,
        person.SuffixName
    ].filter(Boolean).join(' ');

    let name = [
        person.LastName ? `${person.LastName},` : '',
        given
    ].filter(Boolean).join(' ');

    const extra = [
        person.NickName,
        person.MaidenName
    ].filter(Boolean).join(' ');

    return name + (extra ? ` (${extra})` : '');
}

function dateUS(value) {
    if (!value) return '';

    const parts = String(value).slice(0, 10).split('-');
    return parts.length === 3
        ? `${parts[1]}/${parts[2]}/${parts[0]}`
        : value;
}

function personMatchesFilter(person) {
    if (!filterText) return true;

    return [
        person.PersonID,
        nameOf(person),
        person.BirthDate,
        person.BirthPlace,
        person.DeathDate
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(filterText);
}

async function useTree(familyTreeCode) {
    const response = await fetch(
        `${BASE_URL}/familytree/enter-code`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ familyTreeCode })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Unable to use this Family Tree.');
    }

    currentCode = data.FamilyTreeCode || familyTreeCode;
    sessionStorage.setItem('familyTreeCode', currentCode);
    return currentCode;
}

function openPerson(personID, familyTreeCode) {
    /*
     * Opening a person is read-only navigation. It does not call enter-code,
     * change IsActive, or merge/switch Trees.
     */
    window.location.href =
        `FTPerson.html?PersonID=${encodeURIComponent(personID)}` +
        `&familyTreeCode=${encodeURIComponent(familyTreeCode)}`;
}

function showSplitNotice() {
    const notice = document.getElementById('splitNotice');

    if (trees.length <= 1) {
        notice.style.display = 'none';
        notice.textContent = '';
        return;
    }

    const separatedCodes = trees
        .map(tree => tree.FamilyTreeCode)
        .filter(code => code !== originalCode);

    notice.innerHTML = `
        <b>This family is represented by ${trees.length} separated Family Trees.</b><br>
        The original Family Tree is <b>${escapeHtml(originalCode)}</b>.<br>
        Separated Family Tree code${separatedCodes.length === 1 ? '' : 's'}:
        <b>${separatedCodes.map(escapeHtml).join(', ')}</b>.<br>
        Opening a person below does not change your Current Family Tree. Use <b>USE THIS TREE</b> only when you intentionally want to make another code current. A separated tree can also be found by entering its Family Tree Code or by searching for a person in that tree.
    `;
    notice.style.display = 'block';
}

function renderTreeSections() {
    const host = document.getElementById('treeSections');

    host.innerHTML = trees.map((tree, index) => {
        const filteredPersons = (tree.persons || []).filter(personMatchesFilter);
        const isOriginal = tree.FamilyTreeCode === originalCode || index === 0;
        const isCurrent = Boolean(tree.isCurrent);
        const label = trees.length > 1
            ? (isOriginal ? 'ORIGINAL FAMILY TREE' : 'SEPARATED FAMILY TREE')
            : 'FAMILY TREE';

        const rows = filteredPersons.length
            ? filteredPersons.map(person => `
                <tr>
                    <td>
                        <button
                            class="pid"
                            type="button"
                            data-id="${escapeHtml(person.PersonID)}"
                            data-code="${escapeHtml(tree.FamilyTreeCode)}"
                        >${escapeHtml(person.PersonID)}</button>
                    </td>
                    <td>${escapeHtml(nameOf(person))}</td>
                    <td>${escapeHtml(dateUS(person.BirthDate))}</td>
                    <td>${escapeHtml(person.BirthPlace || '')}</td>
                    <td>${escapeHtml(dateUS(person.DeathDate))}</td>
                    <td>${escapeHtml(tree.FamilyTreeCode)}</td>
                </tr>
            `).join('')
            : '<tr><td colspan="6">No persons found.</td></tr>';

        return `
            <section class="tree-section">
                <div class="tree-heading">
                    <h2 class="tree-title">
                        ${label}: <span class="tree-code">${escapeHtml(tree.FamilyTreeCode)}</span>
                    </h2>
                    <div>
                        ${isCurrent
                            ? '<span class="current-label">CURRENT TREE</span>'
                            : `<button class="use-tree" type="button" data-code="${escapeHtml(tree.FamilyTreeCode)}">USE THIS TREE</button>`}
                    </div>
                </div>

                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>PersonID</th>
                                <th>Name</th>
                                <th>Birth Date</th>
                                <th>Birth Place</th>
                                <th>Death Date</th>
                                <th>FamilyTreeCode</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </section>
        `;
    }).join('');

    document.querySelectorAll('.pid').forEach(button => {
        button.onclick = () => {
            openPerson(
                button.dataset.id,
                button.dataset.code
            );
        };
    });

    document.querySelectorAll('.use-tree').forEach(button => {
        button.onclick = async () => {
            try {
                await useTree(button.dataset.code);
                await load();
            } catch (error) {
                document.getElementById('statusMessage').textContent = error.message;
            }
        };
    });
}

async function load() {
    const response = await fetch(
        `${BASE_URL}/familytree/split-view`,
        {
            headers: {
                Authorization: `Bearer ${token()}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Unable to load Family Trees.');
    }

    trees = data.trees || [];
    currentCode = data.currentFamilyTreeCode || '';
    originalCode = data.originalFamilyTreeCode ||
        (trees[0] ? trees[0].FamilyTreeCode : '');

    if (currentCode) {
        sessionStorage.setItem('familyTreeCode', currentCode);
    } else {
        sessionStorage.removeItem('familyTreeCode');
    }

    document.getElementById('codeDisplay').textContent = currentCode || 'None';

    if (!trees.length) {
        document.getElementById('treeSections').innerHTML = '';
        document.getElementById('statusMessage').textContent =
            'No current Family Tree was found.';
        document.getElementById('splitNotice').style.display = 'none';
        return;
    }

    showSplitNotice();
    renderTreeSections();

    const total = trees.reduce(
        (sum, tree) => sum + (tree.persons || []).length,
        0
    );

    document.getElementById('statusMessage').textContent =
        `${total} person${total === 1 ? '' : 's'} in ${trees.length} Family Tree${trees.length === 1 ? '' : 's'}.`;
}

document.addEventListener('DOMContentLoaded', () => {
    if (!token()) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('backBtn').onclick = () =>
        history.length > 1
            ? history.back()
            : window.location.href = 'FamilyTree.html';

    document.getElementById('refreshBtn').onclick = () => {
        load().catch(error => {
            document.getElementById('statusMessage').textContent = error.message;
        });
    };

    document.getElementById('filterInput').oninput = event => {
        filterText = event.target.value.trim().toLowerCase();
        renderTreeSections();
    };

    load().catch(error => {
        document.getElementById('statusMessage').textContent = error.message;
    });
});
