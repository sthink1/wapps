const BASE_URL =
    window.location.hostname === 'localhost' && window.location.port !== '8080'
        ? 'http://localhost:8080'
        : window.location.origin;

const $ = id => document.getElementById(id);
const token = () => localStorage.getItem('token');

const authHeaders = (json = true) => {
    const headers = { Authorization: `Bearer ${token()}` };
    if (json) headers['Content-Type'] = 'application/json';
    return headers;
};

const params = new URLSearchParams(window.location.search);
const personID = Number(params.get('PersonID'));
let familyTreeCode = params.get('familyTreeCode') || sessionStorage.getItem('familyTreeCode') || '';
let editContactID = null;
let contacts = [];

function nullable(value) {
    const text = String(value ?? '').trim();
    return text === '' ? null : text;
}

function personName(person) {
    const first = [person.FirstName, person.MiddleName, person.SuffixName].filter(Boolean).join(' ');
    let name = [person.LastName ? `${person.LastName},` : '', first].filter(Boolean).join(' ').trim();
    const extra = [person.NickName, person.MaidenName].filter(Boolean).join(' ');
    if (extra) name += ` (${extra})`;
    return name;
}

function clearForm() {
    editContactID = null;
    $('contactType').value = '';
    $('contactValue').value = '';
    $('contactNote').value = '';
    $('isPrimary').checked = false;
    $('formTitle').textContent = 'ADD CONTACT';
    $('saveContactBtn').textContent = 'SAVE CONTACT';
    $('cancelEditBtn').style.display = 'none';
    $('formStatus').textContent = '';
}

function fillEdit(contactID) {
    const contact = contacts.find(item => Number(item.ContactID) === Number(contactID));
    if (!contact) return;
    editContactID = Number(contact.ContactID);
    $('contactType').value = contact.ContactType || '';
    $('contactValue').value = contact.ContactValue || '';
    $('contactNote').value = contact.ContactNote || '';
    $('isPrimary').checked = Number(contact.IsPrimary) === 1;
    $('formTitle').textContent = `EDIT CONTACT ${contact.ContactID}`;
    $('saveContactBtn').textContent = 'SAVE CHANGES';
    $('cancelEditBtn').style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadPerson() {
    const response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}?familyTreeCode=${encodeURIComponent(familyTreeCode)}`,
        { headers: authHeaders(false) }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to load person.');
    familyTreeCode = data.FamilyTreeCode || familyTreeCode;
    sessionStorage.setItem('familyTreeCode', familyTreeCode);
    $('personIDDisplay').textContent = personID;
    $('familyTreeCodeDisplay').textContent = familyTreeCode;
    $('personNameDisplay').textContent = personName(data.person);
}

async function loadContacts() {
    const response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}/contacts?familyTreeCode=${encodeURIComponent(familyTreeCode)}`,
        { headers: authHeaders(false) }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to load contacts.');
    contacts = data.contacts || [];
    $('contactBody').innerHTML = contacts.length
        ? contacts.map(contact => `
            <tr>
                <td>${contact.ContactID}</td>
                <td>${contact.ContactType || ''}</td>
                <td>${contact.ContactValue || ''}</td>
                <td>${contact.ContactNote || ''}</td>
                <td>${Number(contact.IsPrimary) === 1 ? 'Yes' : ''}</td>
                <td><button class="edit-contact" data-id="${contact.ContactID}" type="button">EDIT</button></td>
                <td><button class="delete-contact" data-id="${contact.ContactID}" type="button">DELETE</button></td>
            </tr>`).join('')
        : '<tr><td colspan="7">No contacts entered.</td></tr>';
    $('listStatus').textContent = `${contacts.length} contact${contacts.length === 1 ? '' : 's'} displayed.`;
    document.querySelectorAll('.edit-contact').forEach(button => {
        button.onclick = () => fillEdit(Number(button.dataset.id));
    });
    document.querySelectorAll('.delete-contact').forEach(button => {
        button.onclick = () => deleteContact(Number(button.dataset.id)).catch(error => {
            $('listStatus').textContent = error.message;
        });
    });
}

async function saveContact() {
    const wasEditing = !!editContactID;
    const body = {
        familyTreeCode,
        ContactType: nullable($('contactType').value),
        ContactValue: nullable($('contactValue').value),
        ContactNote: nullable($('contactNote').value),
        IsPrimary: $('isPrimary').checked ? 1 : 0
    };
    if (!body.ContactType) return $('formStatus').textContent = 'Contact Type is required.';
    if (!body.ContactValue) return $('formStatus').textContent = 'Contact Value is required.';
    const url = editContactID
        ? `${BASE_URL}/familytree/persons/${personID}/contacts/${editContactID}`
        : `${BASE_URL}/familytree/persons/${personID}/contacts`;
    const response = await fetch(url, {
        method: editContactID ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to save contact.');
    clearForm();
    $('formStatus').textContent = wasEditing ? 'Contact changes saved.' : 'Contact saved.';
    await loadContacts();
}

async function deleteContact(contactID) {
    const contact = contacts.find(item => Number(item.ContactID) === Number(contactID));
    if (!contact) return;
    if (!window.confirm(`Delete ${contact.ContactType || 'this contact'}: ${contact.ContactValue || ''}?`)) return;
    const response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}/contacts/${contactID}?familyTreeCode=${encodeURIComponent(familyTreeCode)}`,
        { method: 'DELETE', headers: authHeaders(false) }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to delete contact.');
    if (editContactID === contactID) clearForm();
    $('listStatus').textContent = 'Contact deleted.';
    await loadContacts();
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!token()) return window.location.href = 'login.html';
    if (!personID || !familyTreeCode) return $('formStatus').textContent = 'PersonID and FamilyTreeCode are required.';
    $('backBtn').onclick = () => history.length > 1 ? history.back() : window.location.href = `FTPerson.html?PersonID=${encodeURIComponent(personID)}&familyTreeCode=${encodeURIComponent(familyTreeCode)}`;
    $('saveContactBtn').onclick = () => saveContact().catch(error => $('formStatus').textContent = error.message);
    $('clearBtn').onclick = clearForm;
    $('cancelEditBtn').onclick = clearForm;
    try {
        await loadPerson();
        await loadContacts();
    } catch (error) {
        $('formStatus').textContent = error.message;
    }
});
