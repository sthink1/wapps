const BASE_URL = window.location.hostname === 'localhost' && window.location.port !== '8080'
    ? 'http://localhost:8080'
    : window.location.origin;

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
}

function safeImageUrl(value) {
    if (!value) return '';
    try {
        const url = new URL(String(value), window.location.origin);
        return ['http:', 'https:', 'blob:'].includes(url.protocol) ? url.href : '';
    } catch {
        return '';
    }
}

const $ = id => document.getElementById(id);
const token = () => localStorage.getItem('token');
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

const params = new URLSearchParams(window.location.search);
const personID = Number(params.get('PersonID'));
let familyTreeCode = params.get('familyTreeCode') || sessionStorage.getItem('familyTreeCode') || '';
let cousinGeneration = Number(sessionStorage.getItem('familyTreeCousinGeneration') || 1);

if (!Number.isInteger(cousinGeneration) || cousinGeneration < 1 || cousinGeneration > 6) {
    cousinGeneration = 1;
}

function nameOf(person) {
    if (!person) return '';
    const first = [person.FirstName, person.MiddleName, person.SuffixName].filter(Boolean).join(' ');
    let name = [person.LastName ? `${person.LastName},` : '', first].filter(Boolean).join(' ').trim();
    const extra = [person.NickName, person.MaidenName].filter(Boolean).join(' ');
    if (extra) name += ` (${extra})`;
    return name;
}

function isDeceased(person) {
    return Boolean(person && (Number(person.Died) === 1 || person.DeathDate));
}

function ageOf(person) {
    if (!person || !person.BirthDate) return '';

    const deceased = Number(person.Died) === 1 || !!person.DeathDate;

    // A deceased Person without a death date has no calculable age at death.
    if (deceased && !person.DeathDate) return '';

    const birth = new Date(`${String(person.BirthDate).slice(0, 10)}T00:00:00`);
    const end = person.DeathDate
        ? new Date(`${String(person.DeathDate).slice(0, 10)}T00:00:00`)
        : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const monthDifference = end.getMonth() - birth.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && end.getDate() < birth.getDate())) age--;
    return age >= 0 ? age : '';
}

function lifespan(person) {
    if (!person) return '';

    const birthYear = person.BirthDate
        ? String(person.BirthDate).slice(0, 4)
        : '';
    const deathYear = person.DeathDate
        ? String(person.DeathDate).slice(0, 4)
        : '';
    const diedChecked = Number(person.Died) === 1;

    let endText = '';
    if (deathYear) {
        endText = deathYear;
    } else if (diedChecked) {
        endText = 'Died';
    } else if (birthYear) {
        endText = 'Living';
    }

    if (birthYear && endText) return `${birthYear}–${endText}`;
    if (!birthYear && deathYear) return `Died ${deathYear}`;
    if (!birthYear && diedChecked) return 'Died';
    return '';
}

function homeOf(person) {
    return [person && person.CurrentCity, person && person.CurrentState].filter(Boolean).join(', ');
}

function openPerson(id) {
    location.href = `FTPerson.html?PersonID=${encodeURIComponent(id)}&familyTreeCode=${encodeURIComponent(familyTreeCode)}`;
}

function makeFocus(id) {
    location.href = `FTAncestor.html?PersonID=${encodeURIComponent(id)}&familyTreeCode=${encodeURIComponent(familyTreeCode)}`;
}

function card(person, isFocus = false) {
    if (!person) return '<div class="ancestor-card empty"></div>';
    const photo = person.ProfileImageUrl
        ? safeImageUrl(person.ProfileImageUrl)
        : 'images/person-placeholder.svg';

    return `<div class="ancestor-card">
        <img class="photo" src="${escapeHtml(photo)}" alt="${escapeHtml(nameOf(person))}">
        <div class="name">${escapeHtml(nameOf(person))}</div>
        <div class="meta">${escapeHtml(lifespan(person))}</div>
        <div class="meta">${escapeHtml(homeOf(person))}</div>
        <div class="icon-row">
            <button class="icon-action person-link" data-id="${person.PersonID}" type="button" title="View Person" aria-label="View Person"><img src="images/person.svg" alt=""></button>
            <button class="icon-action tree-link" data-id="${person.PersonID}" type="button" title="${isFocus ? 'Current Tree Person' : 'View Ancestor Tree'}" aria-label="${isFocus ? 'Current Tree Person' : 'View Ancestor Tree'}" ${isFocus ? 'disabled' : ''}><img src="images/tree.svg" alt=""></button>
        </div>
    </div>`;
}

function personTableRow(person) {
    const photo = person.ProfileImageUrl
        ? safeImageUrl(person.ProfileImageUrl)
        : 'images/person-placeholder.svg';

    return `<tr>
        <td class="photo-cell"><img class="table-photo" src="${escapeHtml(photo)}" alt="${escapeHtml(nameOf(person))}"></td>
        <td class="icon-cell"><button class="icon-action person-link" data-id="${person.PersonID}" type="button" title="View Person"><img src="images/person.svg" alt=""></button></td>
        <td class="icon-cell"><button class="icon-action tree-link" data-id="${person.PersonID}" type="button" title="View Ancestor Tree"><img src="images/tree.svg" alt=""></button></td>
        <td>${escapeHtml(person.Gender || '')}</td>
        <td class="${isDeceased(person) ? 'deceased-age' : ''}">${ageOf(person)}</td>
        <td>${escapeHtml(nameOf(person))}</td>
    </tr>`;
}

function fill(bodyID, people) {
    const rows = people || [];
    $(bodyID).innerHTML = rows.length
        ? rows.map(personTableRow).join('')
        : '<tr><td colspan="6">None entered</td></tr>';
}

function wire() {
    document.querySelectorAll('.person-link').forEach(button => {
        button.onclick = () => openPerson(Number(button.dataset.id));
    });
    document.querySelectorAll('.tree-link:not(:disabled)').forEach(button => {
        button.onclick = () => makeFocus(Number(button.dataset.id));
    });
}

function updateTreeScrollWidth() {
    const tree = $('ancestorTree');
    const spacer = $('treeScrollSpacer');
    if (!tree || !spacer) return;
    spacer.style.width = `${tree.scrollWidth}px`;
}

function initializeTreeScrollSync() {
    const topScroll = $('treeScrollTop');
    const treeWrap = $('treeWrap');
    if (!topScroll || !treeWrap) return;

    let syncingTop = false;
    let syncingBottom = false;

    topScroll.addEventListener('scroll', () => {
        if (syncingBottom) return;
        syncingTop = true;
        treeWrap.scrollLeft = topScroll.scrollLeft;
        syncingTop = false;
    });

    treeWrap.addEventListener('scroll', () => {
        if (syncingTop) return;
        syncingBottom = true;
        topScroll.scrollLeft = treeWrap.scrollLeft;
        syncingBottom = false;
    });

    updateTreeScrollWidth();
    window.addEventListener('resize', updateTreeScrollWidth);

    if (window.ResizeObserver) {
        const observer = new ResizeObserver(updateTreeScrollWidth);
        observer.observe($('ancestorTree'));
    }
}

function renderTree(data) {
    const greatGrandparents = [
        data.maternalGrandmotherMother,
        data.maternalGrandmotherFather,
        data.maternalGrandfatherMother,
        data.maternalGrandfatherFather,
        data.paternalGrandmotherMother,
        data.paternalGrandmotherFather,
        data.paternalGrandfatherMother,
        data.paternalGrandfatherFather
    ];

    const grandparents = [
        data.maternalGrandmother,
        data.maternalGrandfather,
        data.paternalGrandmother,
        data.paternalGrandfather
    ];

    const parents = [data.mother, data.father];

    $('greatGeneration').innerHTML = greatGrandparents.map(person => card(person)).join('');
    $('grandGeneration').innerHTML = grandparents.map(person => card(person)).join('');
    $('parentGeneration').innerHTML = parents.map(person => card(person)).join('');
    $('focusGeneration').innerHTML = card(data.person, true);
    updateTreeScrollWidth();
}

async function loadAncestor() {
    const response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}/ancestor?familyTreeCode=${encodeURIComponent(familyTreeCode)}&cousinGeneration=${encodeURIComponent(cousinGeneration)}`,
        { headers: authHeaders() }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to load family information.');

    familyTreeCode = data.FamilyTreeCode || familyTreeCode;
    sessionStorage.setItem('familyTreeCode', familyTreeCode);

    renderTree(data);
    $('siblingTitle').textContent = `BIOLOGICAL SIBLINGS (${(data.siblings || []).length})`;
    $('partnerTitle').textContent = `PARTNERS (${(data.partners || []).length})`;
    $('childTitle').textContent = `BIOLOGICAL CHILDREN (${(data.children || []).length})`;
    $('grandchildTitle').textContent = `GRANDCHILDREN (${(data.grandchildren || []).length})`;
    $('nephewNieceTitle').textContent = `NEPHEWS AND NIECES (${(data.nephewsNieces || []).length})`;
    $('cousinTitle').textContent = `COUSINS (${(data.cousins || []).length})`;

    fill('siblingBody', data.siblings);
    fill('partnerBody', data.partners);
    fill('childBody', data.children);
    fill('grandchildBody', data.grandchildren);
    fill('nephewNieceBody', data.nephewsNieces);
    fill('cousinBody', data.cousins);
    wire();
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!token()) {
        location.href = 'login.html';
        return;
    }

    if (!personID || !familyTreeCode) {
        $('ancestorStatus').textContent = 'PersonID and FamilyTreeCode are required.';
        return;
    }

    initializeTreeScrollSync();

    $('backBtn').onclick = () => history.length > 1
        ? history.back()
        : location.href = `FTPerson.html?PersonID=${encodeURIComponent(personID)}&familyTreeCode=${encodeURIComponent(familyTreeCode)}`;

    $('cousinGenerationSelect').value = String(cousinGeneration);
    $('cousinGenerationSelect').onchange = async () => {
        cousinGeneration = Number($('cousinGenerationSelect').value || 1);
        sessionStorage.setItem('familyTreeCousinGeneration', String(cousinGeneration));
        $('ancestorStatus').textContent = 'Loading cousins...';
        try {
            await loadAncestor();
            $('ancestorStatus').textContent = '';
        } catch (error) {
            $('ancestorStatus').textContent = error.message;
        }
    };

    try {
        await loadAncestor();
        updateTreeScrollWidth();
    } catch (error) {
        $('ancestorStatus').textContent = error.message;
    }
});
