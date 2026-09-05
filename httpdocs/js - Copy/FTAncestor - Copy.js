const BASE_URL =
    window.location.hostname === 'localhost' && window.location.port !== '8080'
        ? 'http://localhost:8080'
        : window.location.origin;

const $ = id => document.getElementById(id);

const token = () => localStorage.getItem('token');

const authHeaders = () => ({
    Authorization: `Bearer ${token()}`
});

const params = new URLSearchParams(window.location.search);

const personID = Number(params.get('PersonID'));

let familyTreeCode =
    params.get('familyTreeCode') ||
    sessionStorage.getItem('familyTreeCode') ||
    '';

let ancestorData = null;
let cousinGeneration = Number(
    sessionStorage.getItem('familyTreeCousinGeneration') || 1
);

if (!Number.isInteger(cousinGeneration) || cousinGeneration < 1 || cousinGeneration > 6) {
    cousinGeneration = 1;
}

function nameOf(person) {
    if (!person) return '';

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
    if (!person || !person.BirthDate) return '';

    const birth = new Date(
        `${String(person.BirthDate).slice(0, 10)}T00:00:00`
    );

    const end = person.DeathDate
        ? new Date(`${String(person.DeathDate).slice(0, 10)}T00:00:00`)
        : new Date();

    let age = end.getFullYear() - birth.getFullYear();

    const monthDifference =
        end.getMonth() - birth.getMonth();

    if (
        monthDifference < 0 ||
        (
            monthDifference === 0 &&
            end.getDate() < birth.getDate()
        )
    ) {
        age--;
    }

    return age >= 0 ? age : '';
}

function openPerson(id) {
    if (!id) return;

    window.location.href =
        `FTPerson.html?PersonID=${encodeURIComponent(id)}` +
        `&familyTreeCode=${encodeURIComponent(familyTreeCode)}`;
}

function makeAncestorFocalPerson(id) {
    if (!id) return;

    window.location.href =
        `FTAncestor.html?PersonID=${encodeURIComponent(id)}` +
        `&familyTreeCode=${encodeURIComponent(familyTreeCode)}`;
}

function bindRelative(rowID, buttonID, nameID, photoID, person) {
    const row = $(rowID);
    const button = $(buttonID);
    const name = $(nameID);
    const photo = $(photoID);

    if (!person) {
        row.style.visibility = 'hidden';
        photo.removeAttribute('src');
        photo.style.visibility = 'hidden';
        button.onclick = null;
        name.onclick = null;
        name.removeAttribute('title');
        return;
    }

    row.style.visibility = 'visible';
    name.textContent = nameOf(person);

    button.title = `PersonID ${person.PersonID}`;
    button.onclick = () => openPerson(person.PersonID);

    name.title = `Make ${nameOf(person)} the focal person`;
    name.onclick = () => makeAncestorFocalPerson(person.PersonID);

    if (person.ProfileImageUrl) {
        photo.src = person.ProfileImageUrl;
        photo.style.visibility = 'visible';
    } else {
        photo.removeAttribute('src');
        photo.style.visibility = 'hidden';
    }
}

function personTableRow(person) {
    const photo = person.ProfileImageUrl
        ? `<img class="table-photo" src="${person.ProfileImageUrl}" alt="${nameOf(person)}">`
        : '';

    return `
        <tr>
            <td class="photo-cell">${photo}</td>
            <td class="person-button-cell">
                <button
                    type="button"
                    class="table-person-button"
                    data-id="${person.PersonID}"
                    title="PersonID ${person.PersonID}"
                >P</button>
            </td>
            <td>${person.Gender || ''}</td>
            <td>${ageOf(person)}</td>
            <td class="table-name" data-id="${person.PersonID}" title="Make ${nameOf(person)} the focal person">${nameOf(person)}</td>
        </tr>
    `;
}

function fillFamilyTable(bodyID, people) {
    const body = $(bodyID);
    const rows = people || [];

    body.innerHTML = rows.length
        ? rows.map(personTableRow).join('')
        : '<tr><td colspan="5">None entered</td></tr>';
}

function wireTableButtons() {
    document.querySelectorAll('.table-person-button').forEach(button => {
        button.onclick = () =>
            openPerson(Number(button.dataset.id));
    });

    document.querySelectorAll('.table-name').forEach(cell => {
        cell.onclick = () =>
            makeAncestorFocalPerson(Number(cell.dataset.id));
    });
}

function applyBloodLineHighlight() {
    const selected = $('bloodLineSelect').value;

    [
        'maternalGrandmotherRow',
        'maternalGrandfatherRow',
        'motherRow',
        'paternalGrandmotherRow',
        'paternalGrandfatherRow',
        'fatherRow'
    ].forEach(id => {
        $(id).classList.remove('blood-line');
    });

    if (selected === 'Mother') {
        [
            'maternalGrandmotherRow',
            'maternalGrandfatherRow',
            'motherRow'
        ].forEach(id => {
            $(id).classList.add('blood-line');
        });
    }

    if (selected === 'Father') {
        [
            'paternalGrandmotherRow',
            'paternalGrandfatherRow',
            'fatherRow'
        ].forEach(id => {
            $(id).classList.add('blood-line');
        });
    }

    sessionStorage.setItem(
        'familyTreeBloodLine',
        selected
    );
}

async function loadAncestor() {
    const response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}/ancestor` +
        `?familyTreeCode=${encodeURIComponent(familyTreeCode)}` +
        `&cousinGeneration=${encodeURIComponent(cousinGeneration)}`,
        {
            headers: authHeaders()
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            'Unable to load family information.'
        );
    }

    ancestorData = data;
    familyTreeCode = data.FamilyTreeCode || familyTreeCode;
    cousinGeneration = Number(data.cousinGeneration || cousinGeneration);

    sessionStorage.setItem(
        'familyTreeCode',
        familyTreeCode
    );

    sessionStorage.setItem(
        'familyTreeCousinGeneration',
        String(cousinGeneration)
    );

    $('cousinGenerationSelect').value = String(cousinGeneration);

    bindRelative(
        'maternalGrandmotherRow',
        'mgmPersonBtn',
        'maternalGrandmother',
        'mgmPhoto',
        data.maternalGrandmother
    );

    bindRelative(
        'maternalGrandfatherRow',
        'mgfPersonBtn',
        'maternalGrandfather',
        'mgfPhoto',
        data.maternalGrandfather
    );

    bindRelative(
        'paternalGrandmotherRow',
        'pgmPersonBtn',
        'paternalGrandmother',
        'pgmPhoto',
        data.paternalGrandmother
    );

    bindRelative(
        'paternalGrandfatherRow',
        'pgfPersonBtn',
        'paternalGrandfather',
        'pgfPhoto',
        data.paternalGrandfather
    );

    bindRelative(
        'motherRow',
        'motherPersonBtn',
        'motherName',
        'motherPhoto',
        data.mother
    );

    bindRelative(
        'fatherRow',
        'fatherPersonBtn',
        'fatherName',
        'fatherPhoto',
        data.father
    );

    $('currentName').textContent = nameOf(data.person);
    $('currentPersonBtn').title = `PersonID ${data.person.PersonID}`;
    $('currentPersonBtn').onclick = () =>
        openPerson(data.person.PersonID);

    if (data.person.ProfileImageUrl) {
        $('currentPhoto').src = data.person.ProfileImageUrl;
        $('currentPhoto').style.visibility = 'visible';
    } else {
        $('currentPhoto').removeAttribute('src');
        $('currentPhoto').style.visibility = 'hidden';
    }

    fillFamilyTable('partnerBody', data.partners);
    fillFamilyTable('childBody', data.children);
    fillFamilyTable('grandchildBody', data.grandchildren);
    fillFamilyTable('nephewNieceBody', data.nephewsNieces);
    fillFamilyTable('cousinBody', data.cousins);

    wireTableButtons();
    applyBloodLineHighlight();
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!token()) {
        window.location.href = 'login.html';
        return;
    }

    if (!personID || !familyTreeCode) {
        $('ancestorStatus').textContent =
            'PersonID and FamilyTreeCode are required.';
        return;
    }

    $('backBtn').onclick = () => {
        if (history.length > 1) history.back();
        else window.location.href = `FTPerson.html?PersonID=${encodeURIComponent(personID)}&familyTreeCode=${encodeURIComponent(familyTreeCode)}`;
    };

    $('bloodLineSelect').value =
        sessionStorage.getItem('familyTreeBloodLine') ||
        'None';

    $('bloodLineSelect').onchange =
        applyBloodLineHighlight;

    $('cousinGenerationSelect').value = String(cousinGeneration);
    $('cousinGenerationSelect').onchange = async () => {
        cousinGeneration = Number($('cousinGenerationSelect').value || 1);
        sessionStorage.setItem(
            'familyTreeCousinGeneration',
            String(cousinGeneration)
        );

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
    } catch (error) {
        $('ancestorStatus').textContent = error.message;
    }
});
