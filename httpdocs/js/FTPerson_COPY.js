const BASE_URL =
    window.location.hostname === 'localhost' && window.location.port !== '8080'
        ? 'http://localhost:8080'
        : window.location.origin;

const $ = id => document.getElementById(id);
const token = () => localStorage.getItem('token');

const authHeaders = (json = true) => {
    const headers = {
        Authorization: `Bearer ${token()}`
    };

    if (json) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};

const params = new URLSearchParams(window.location.search);
const personID = Number(params.get('PersonID'));

let familyTreeCode =
    params.get('familyTreeCode') ||
    sessionStorage.getItem('familyTreeCode') ||
    '';

let activeRelationship = '';
let currentPerson = null;
let currentProfile = null;
let currentLifeImages = [];
let contextImageID = null;

function ageOf(person) {
    if (!person || !person.BirthDate) return '';

    const start = new Date(`${String(person.BirthDate).slice(0, 10)}T00:00:00`);
    const end = person.DeathDate
        ? new Date(`${String(person.DeathDate).slice(0, 10)}T00:00:00`)
        : new Date();

    let age = end.getFullYear() - start.getFullYear();
    const monthDifference = end.getMonth() - start.getMonth();

    if (
        monthDifference < 0 ||
        (monthDifference === 0 && end.getDate() < start.getDate())
    ) {
        age--;
    }

    return age >= 0 ? age : '';
}

function nameOf(person) {
    const firstPart = [
        person.FirstName,
        person.MiddleName,
        person.SuffixName
    ].filter(Boolean).join(' ');

    let name = [
        person.LastName ? `${person.LastName},` : '',
        firstPart
    ].filter(Boolean).join(' ').trim();

    const parenthetical = [
        person.NickName,
        person.MaidenName
    ].filter(Boolean).join(' ');

    if (parenthetical) {
        name += ` (${parenthetical})`;
    }

    return name || `Person ${person.PersonID}`;
}

function dateUS(value) {
    if (!value) return '';

    const parts = String(value).slice(0, 10).split('-');

    return parts.length === 3
        ? `${parts[1]}/${parts[2]}/${parts[0]}`
        : value;
}

function dateInputValue(value) {
    return value ? String(value).slice(0, 10) : '';
}

function nullable(value) {
    const text = String(value ?? '').trim();
    return text === '' ? null : text;
}

function setPageStatus(message) {
    $('pageStatus').textContent = message || '';
}

function personRow(person, extraCells = []) {
    return `
        <tr>
            <td>
                <button
                    class="person-link"
                    data-id="${person.PersonID}"
                    title="Open PersonID ${person.PersonID}"
                >${person.PersonID}</button>
            </td>
            <td>${person.Gender || ''}</td>
            <td>${ageOf(person)}</td>
            <td>${person.FirstName || ''}</td>
            <td>${person.MiddleName || ''}</td>
            <td>${person.LastName || ''}</td>
            <td>${person.SuffixName || ''}</td>
            <td>${person.NickName || ''}</td>
            <td>${person.MaidenName || ''}</td>
            ${extraCells.map(value => `<td>${value || ''}</td>`).join('')}
        </tr>
    `;
}

function wirePersonLinks() {
    document.querySelectorAll('.person-link').forEach(button => {
        button.onclick = () => {
            window.location.href =
                `FTPerson.html?PersonID=${encodeURIComponent(button.dataset.id)}` +
                `&familyTreeCode=${encodeURIComponent(familyTreeCode)}`;
        };
    });
}

async function loadPerson() {
    const response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}` +
        `?familyTreeCode=${encodeURIComponent(familyTreeCode)}`,
        {
            headers: authHeaders(false)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Unable to load person.');
    }

    currentPerson = data.person;
    familyTreeCode = data.FamilyTreeCode || familyTreeCode;

    sessionStorage.setItem('familyTreeCode', familyTreeCode);

    [
        'PersonID',
        'Gender',
        'FirstName',
        'MiddleName',
        'LastName',
        'SuffixName',
        'NickName',
        'MaidenName',
        'BirthPlace'
    ].forEach(key => {
        $(key).textContent = currentPerson[key] || '';
    });

    $('BirthDate').textContent = dateUS(currentPerson.BirthDate);
    $('DeathDate').textContent = dateUS(currentPerson.DeathDate);
    $('Age').textContent = ageOf(currentPerson);
    $('Died').textContent = Number(currentPerson.Died) ? 'Yes' : 'No';
    $('FamilyTreeCode').textContent = familyTreeCode;
}

async function loadRelationships() {
    const response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}/relationships` +
        `?familyTreeCode=${encodeURIComponent(familyTreeCode)}`,
        {
            headers: authHeaders(false)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Unable to load relationships.');
    }

    const parents = [
        ...(data.mother || []),
        ...(data.father || [])
    ];

    $('parentBody').innerHTML = parents.length
        ? parents
            .map(person =>
                personRow(
                    person,
                    [person.ParentType, person.AncestrySide]
                )
            )
            .join('')
        : '<tr><td colspan="11">None entered</td></tr>';

    $('partnerBody').innerHTML = (data.partners || []).length
        ? data.partners.map(person => personRow(person)).join('')
        : '<tr><td colspan="9">None entered</td></tr>';

    $('childBody').innerHTML = (data.children || []).length
        ? data.children.map(person => personRow(person)).join('')
        : '<tr><td colspan="9">None entered</td></tr>';

    wirePersonLinks();
}

function showImageContextMenu(event, imageID, isProfile) {
    event.preventDefault();

    contextImageID = isProfile ? null : Number(imageID);

    const menu = $('imageContextMenu');
    const makeProfileButton = $('makeProfileMenuBtn');

    if (isProfile) {
        makeProfileButton.textContent = 'CURRENT PROFILE PICTURE';
        makeProfileButton.disabled = true;
    } else {
        makeProfileButton.textContent = 'MAKE PROFILE PICTURE';
        makeProfileButton.disabled = false;
    }

    menu.style.left = `${Math.min(event.clientX, window.innerWidth - 210)}px`;
    menu.style.top = `${Math.min(event.clientY, window.innerHeight - 70)}px`;
    menu.classList.add('show');
}

function hideImageContextMenu() {
    $('imageContextMenu').classList.remove('show');
}

async function loadImages() {
    currentProfile = null;
    currentLifeImages = [];

    let response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}/profile-image` +
        `?familyTreeCode=${encodeURIComponent(familyTreeCode)}`,
        {
            headers: authHeaders(false)
        }
    );

    const profileImage = $('profileImage');

    if (response.ok) {
        const data = await response.json();

        currentProfile = data;
        profileImage.src = `${data.url}?v=${Date.now()}`;
        profileImage.dataset.imageId = data.ImageID;
        profileImage.oncontextmenu = event =>
            showImageContextMenu(event, data.ImageID, true);
    } else {
        profileImage.removeAttribute('src');
        profileImage.removeAttribute('data-image-id');
        profileImage.oncontextmenu = null;
    }

    response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}/life-images` +
        `?familyTreeCode=${encodeURIComponent(familyTreeCode)}`,
        {
            headers: authHeaders(false)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Unable to load other pictures.');
    }

    currentLifeImages = data.images || [];

    const host = $('lifeStrip');
    host.innerHTML = '';

    for (let slot = 1; slot <= 4; slot++) {
        const image = currentLifeImages.find(
            item => Number(item.SortOrder) === slot
        );

        const card = document.createElement('div');
        card.className = 'life-card';

        if (image) {
            const img = document.createElement('img');
            img.src = `${image.url}?v=${Date.now()}`;
            img.alt = image.Caption || `Picture ${slot + 1}`;
            img.title = 'Right-click for picture options';
            img.dataset.imageId = image.ImageID;
            img.oncontextmenu = event =>
                showImageContextMenu(event, image.ImageID, false);

            const caption = document.createElement('div');
            caption.textContent = image.Caption || '';

            const details = document.createElement('div');
            details.className = 'small';

            const detailsText = [];

            if (image.ApproxAge != null) {
                detailsText.push(`Approx. age ${image.ApproxAge}`);
            }

            if (image.ImageDate) {
                detailsText.push(dateUS(image.ImageDate));
            }

            details.textContent = detailsText.join(' — ');

            const label = document.createElement('div');
            label.className = 'picture-label';
            label.textContent = `Picture ${slot + 1}`;

            card.append(img, caption, details, label);
        } else {
            card.innerHTML =
                `<div class="small">Picture ${slot + 1}<br>Not entered</div>`;
        }

        host.appendChild(card);
    }
}

function fillEditForm() {
    if (!currentPerson) return;

    $('eFirstName').value = currentPerson.FirstName || '';
    $('eMiddleName').value = currentPerson.MiddleName || '';
    $('eLastName').value = currentPerson.LastName || '';
    $('eSuffixName').value = currentPerson.SuffixName || '';
    $('eNickName').value = currentPerson.NickName || '';
    $('eMaidenName').value = currentPerson.MaidenName || '';
    $('eGender').value = currentPerson.Gender || '';
    $('eBirthDate').value = dateInputValue(currentPerson.BirthDate);
    $('eBirthPlace').value = currentPerson.BirthPlace || '';
    $('eDied').checked = Number(currentPerson.Died) === 1;
    $('eDeathDate').value = dateInputValue(currentPerson.DeathDate);
    $('eDeathDate').disabled = !$('eDied').checked;
    $('editStatus').textContent = '';
}

async function saveEdit() {
    const body = {
        familyTreeCode,
        FirstName: nullable($('eFirstName').value),
        MiddleName: nullable($('eMiddleName').value),
        LastName: nullable($('eLastName').value),
        SuffixName: nullable($('eSuffixName').value),
        NickName: nullable($('eNickName').value),
        MaidenName: nullable($('eMaidenName').value),
        Gender: nullable($('eGender').value),
        BirthDate: nullable($('eBirthDate').value),
        BirthPlace: nullable($('eBirthPlace').value),
        Died: $('eDied').checked ? 1 : 0,
        DeathDate: $('eDied').checked
            ? nullable($('eDeathDate').value)
            : null
    };

    if (!body.FirstName && !body.LastName) {
        $('editStatus').textContent =
            'First Name or Last Name is required.';
        return;
    }

    if (
        body.BirthDate &&
        body.DeathDate &&
        body.DeathDate < body.BirthDate
    ) {
        $('editStatus').textContent =
            'Death Date cannot be earlier than Birth Date.';
        return;
    }

    const response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}`,
        {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(body)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Unable to save person changes.');
    }

    $('editPersonModal').classList.remove('show');
    setPageStatus('Person changes saved.');
    await loadPerson();
}

function clearPictureForm() {
    $('newPictureFile').value = '';
    $('newPictureAge').value = '';
    $('newPictureDate').value = '';
    $('newPictureCaption').value = '';
    $('addPictureStatus').textContent = '';
}

async function saveNewPicture() {
    const file = $('newPictureFile').files[0];

    if (!file) {
        $('addPictureStatus').textContent = 'Select a picture first.';
        return;
    }

    const formData = new FormData();
    formData.append('picture', file);
    formData.append('familyTreeCode', familyTreeCode);
    formData.append('approxAge', $('newPictureAge').value);
    formData.append('imageDate', $('newPictureDate').value);
    formData.append('caption', $('newPictureCaption').value);

    const response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}/pictures`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token()}`
            },
            body: formData
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Unable to save picture.');
    }

    $('addPictureModal').classList.remove('show');
    $('pictureStatus').textContent =
        data.ImageType === 'Profile'
            ? 'Profile picture saved.'
            : 'Picture saved.';

    await loadImages();
}

async function makeProfilePicture() {
    if (!contextImageID) return;

    const image = currentLifeImages.find(
        item => Number(item.ImageID) === Number(contextImageID)
    );

    if (!image) return;

    const confirmed = window.confirm(
        'Make this the Profile Picture? The current Profile Picture will remain with the other pictures.'
    );

    if (!confirmed) return;

    const response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}/pictures/${contextImageID}/make-profile`,
        {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                familyTreeCode
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || 'Unable to change the Profile Picture.'
        );
    }

    hideImageContextMenu();
    $('pictureStatus').textContent = 'Profile Picture changed.';
    await loadImages();
}

function relatedPersonData() {
    return {
        FirstName: nullable($('rFirstName').value),
        MiddleName: nullable($('rMiddleName').value),
        LastName: nullable($('rLastName').value),
        SuffixName: nullable($('rSuffixName').value),
        NickName: nullable($('rNickName').value),
        MaidenName: nullable($('rMaidenName').value),
        Gender: nullable($('rGender').value),
        BirthDate: nullable($('rBirthDate').value),
        BirthPlace: nullable($('rBirthPlace').value)
    };
}

function clearRelatedForm() {
    [
        'rFirstName',
        'rMiddleName',
        'rLastName',
        'rSuffixName',
        'rNickName',
        'rMaidenName',
        'rBirthDate',
        'rBirthPlace'
    ].forEach(id => {
        $(id).value = '';
    });

    $('rGender').value = '';
    $('rDupWrap').classList.add('hidden');
    $('rDupBody').innerHTML = '';
    $('rStatus').textContent = '';
}

async function checkRelatedDuplicates() {
    const person = relatedPersonData();
    const query = new URLSearchParams();

    [
        'FirstName',
        'LastName',
        'BirthDate',
        'BirthPlace',
        'MaidenName'
    ].forEach(key => {
        if (person[key]) {
            query.set(key, person[key]);
        }
    });

    if (!person.FirstName && !person.LastName && !person.BirthDate) {
        $('rStatus').textContent = 'Enter a name or birth date first.';
        return;
    }

    const response = await fetch(
        `${BASE_URL}/familytree/persons/duplicates?${query.toString()}`,
        {
            headers: authHeaders(false)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Duplicate check failed.');
    }

    const matches = data.matches || [];

    $('rDupWrap').classList.toggle('hidden', !matches.length);

    $('rDupBody').innerHTML = matches.map(person => `
        <tr>
            <td>${person.PersonID}</td>
            <td>${nameOf(person)}</td>
            <td>${dateUS(person.BirthDate)}</td>
            <td>${person.BirthPlace || ''}</td>
            <td>${person.OldestFamilyTreeCode || ''}</td>
            <td>
                <button
                    class="use-existing"
                    data-id="${person.PersonID}"
                >USE EXISTING</button>
            </td>
        </tr>
    `).join('');

    $('rStatus').textContent = matches.length
        ? `${matches.length} possible duplicate(s) found.`
        : 'No possible duplicates found.';

    document.querySelectorAll('.use-existing').forEach(button => {
        button.onclick = () =>
            useExistingRelationship(Number(button.dataset.id));
    });
}

async function useExistingRelationship(relatedPersonID) {
    const response = await fetch(
        `${BASE_URL}/familytree/relationships`,
        {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                familyTreeCode,
                focalPersonID: personID,
                relatedPersonID,
                relationshipKind: activeRelationship
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Unable to create relationship.');
    }

    $('relatedModal').classList.remove('show');
    setPageStatus(`${activeRelationship} saved.`);
    await loadRelationships();
}

async function saveRelatedPerson() {
    const person = relatedPersonData();

    if (!person.FirstName && !person.LastName) {
        $('rStatus').textContent =
            'Enter First Name or Last Name.';
        return;
    }

    const response = await fetch(
        `${BASE_URL}/familytree/related-person`,
        {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                ...person,
                familyTreeCode,
                focalPersonID: personID,
                relationshipKind: activeRelationship
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Unable to save related person.');
    }

    $('relatedModal').classList.remove('show');
    setPageStatus(`${activeRelationship} saved.`);
    await loadRelationships();
}

function navigateTo(fileName) {
    window.location.href =
        `${fileName}?PersonID=${encodeURIComponent(personID)}` +
        `&familyTreeCode=${encodeURIComponent(familyTreeCode)}`;
}

async function deletePerson() {
    const confirmed = window.confirm(
        `Delete PersonID ${personID} from this Family Tree?`
    );

    if (!confirmed) return;

    const response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}` +
        `?familyTreeCode=${encodeURIComponent(familyTreeCode)}`,
        {
            method: 'DELETE',
            headers: authHeaders(false)
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Delete failed.');
    }

    window.alert(data.message || 'Person deleted.');
    window.location.href = 'FTPersonList.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!token()) {
        window.location.href = 'login.html';
        return;
    }

    if (!personID || !familyTreeCode) {
        setPageStatus('PersonID and FamilyTreeCode are required.');
        return;
    }

    try {
        await loadPerson();
        await Promise.all([
            loadRelationships(),
            loadImages()
        ]);
    } catch (error) {
        setPageStatus(error.message);
    }

    document.querySelectorAll('[data-addrel]').forEach(button => {
        button.onclick = () => {
            activeRelationship = button.dataset.addrel;
            clearRelatedForm();
            $('relatedTitle').textContent =
                `ADD ${activeRelationship.toUpperCase()}`;
            $('relatedModal').classList.add('show');
        };
    });

    $('rCloseBtn').onclick = () =>
        $('relatedModal').classList.remove('show');

    $('rCheckBtn').onclick = () =>
        checkRelatedDuplicates()
            .catch(error => {
                $('rStatus').textContent = error.message;
            });

    $('rSaveBtn').onclick = () =>
        saveRelatedPerson()
            .catch(error => {
                $('rStatus').textContent = error.message;
            });

    $('ancestorBtn').onclick = () =>
        navigateTo('FTAncestor.html');

    $('contactBtn').onclick = () =>
        navigateTo('FTContact.html');

    $('eventBtn').onclick = () =>
        navigateTo('FTEvent.html');

    $('editBtn').onclick = () => {
        fillEditForm();
        $('editPersonModal').classList.add('show');
    };

    $('cancelEditBtn').onclick = () =>
        $('editPersonModal').classList.remove('show');

    $('eDied').onchange = () => {
        $('eDeathDate').disabled = !$('eDied').checked;

        if (!$('eDied').checked) {
            $('eDeathDate').value = '';
        }
    };

    $('saveEditBtn').onclick = () =>
        saveEdit()
            .catch(error => {
                $('editStatus').textContent = error.message;
            });

    $('deleteBtn').onclick = () =>
        deletePerson()
            .catch(error => {
                setPageStatus(error.message);
            });

    $('addPictureBtn').onclick = () => {
        clearPictureForm();
        $('addPictureModal').classList.add('show');
    };

    $('cancelPictureBtn').onclick = () =>
        $('addPictureModal').classList.remove('show');

    $('savePictureBtn').onclick = () =>
        saveNewPicture()
            .catch(error => {
                $('addPictureStatus').textContent = error.message;
            });

    $('makeProfileMenuBtn').onclick = () =>
        makeProfilePicture()
            .catch(error => {
                hideImageContextMenu();
                setPageStatus(error.message);
            });

    document.addEventListener('click', event => {
        if (!event.target.closest('#imageContextMenu')) {
            hideImageContextMenu();
        }
    });

    window.addEventListener('scroll', hideImageContextMenu);
    window.addEventListener('resize', hideImageContextMenu);
});
