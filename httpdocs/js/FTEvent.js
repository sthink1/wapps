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
let editEventID = null;
let events = [];
let currentPerson = null;

function nullable(value) {
    const text = String(value ?? '').trim();
    return text === '' ? null : text;
}

function dateUS(value) {
    if (!value) return '';
    const parts = String(value).slice(0, 10).split('-');
    return parts.length === 3 ? `${parts[1]}/${parts[2]}/${parts[0]}` : value;
}

function dateInputValue(value) {
    return value ? String(value).slice(0, 10) : '';
}

function personName(person) {
    const first = [person.FirstName, person.MiddleName, person.SuffixName].filter(Boolean).join(' ');
    let name = [person.LastName ? `${person.LastName},` : '', first].filter(Boolean).join(' ').trim();
    const extra = [person.NickName, person.MaidenName].filter(Boolean).join(' ');
    if (extra) name += ` (${extra})`;
    return name;
}

function ageAtEvent(eventDate) {
    if (!currentPerson || !currentPerson.BirthDate || !eventDate) return '';
    const birth = new Date(`${String(currentPerson.BirthDate).slice(0, 10)}T00:00:00`);
    const event = new Date(`${String(eventDate).slice(0, 10)}T00:00:00`);
    let age = event.getFullYear() - birth.getFullYear();
    const monthDifference = event.getMonth() - birth.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && event.getDate() < birth.getDate())) age--;
    return age >= 0 ? age : '';
}

function clearForm() {
    editEventID = null;
    $('eventType').value = '';
    $('eventDate').value = '';
    $('eventPlace').value = '';
    $('eventDescription').value = '';
    $('formTitle').textContent = 'ADD EVENT';
    $('saveEventBtn').textContent = 'SAVE EVENT';
    $('cancelEditBtn').style.display = 'none';
    $('formStatus').textContent = '';
}

function fillEdit(eventID) {
    const event = events.find(item => Number(item.EventID) === Number(eventID));
    if (!event) return;
    editEventID = Number(event.EventID);
    $('eventType').value = event.EventType || '';
    $('eventDate').value = dateInputValue(event.EventDate);
    $('eventPlace').value = event.EventPlace || '';
    $('eventDescription').value = event.EventDescription || '';
    $('formTitle').textContent = `EDIT EVENT ${event.EventID}`;
    $('saveEventBtn').textContent = 'SAVE CHANGES';
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
    currentPerson = data.person;
    familyTreeCode = data.FamilyTreeCode || familyTreeCode;
    sessionStorage.setItem('familyTreeCode', familyTreeCode);
    $('personIDDisplay').textContent = personID;
    $('familyTreeCodeDisplay').textContent = familyTreeCode;
    $('personNameDisplay').textContent = personName(currentPerson);
    $('birthDateDisplay').textContent = dateUS(currentPerson.BirthDate);
}

async function loadEvents() {
    const response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}/events?familyTreeCode=${encodeURIComponent(familyTreeCode)}`,
        { headers: authHeaders(false) }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to load events.');
    events = data.events || [];
    $('eventBody').innerHTML = events.length
        ? events.map(event => `
            <tr>
                <td>${event.EventID}</td>
                <td>${event.EventType || ''}</td>
                <td>${dateUS(event.EventDate)}</td>
                <td>${ageAtEvent(event.EventDate)}</td>
                <td>${event.EventPlace || ''}</td>
                <td>${event.EventDescription || ''}</td>
                <td><button class="edit-event" data-id="${event.EventID}" type="button">EDIT</button></td>
                <td><button class="delete-event" data-id="${event.EventID}" type="button">DELETE</button></td>
            </tr>`).join('')
        : '<tr><td colspan="8">No events entered.</td></tr>';
    $('listStatus').textContent = `${events.length} event${events.length === 1 ? '' : 's'} displayed.`;
    document.querySelectorAll('.edit-event').forEach(button => button.onclick = () => fillEdit(Number(button.dataset.id)));
    document.querySelectorAll('.delete-event').forEach(button => {
        button.onclick = () => deleteEvent(Number(button.dataset.id)).catch(error => $('listStatus').textContent = error.message);
    });
}

async function saveEvent() {
    const wasEditing = !!editEventID;
    const body = {
        familyTreeCode,
        eventType: nullable($('eventType').value),
        eventDate: nullable($('eventDate').value),
        eventPlace: nullable($('eventPlace').value),
        eventDescription: nullable($('eventDescription').value)
    };
    if (!body.eventType) return $('formStatus').textContent = 'Event Type is required.';
    const url = editEventID
        ? `${BASE_URL}/familytree/persons/${personID}/events/${editEventID}`
        : `${BASE_URL}/familytree/persons/${personID}/events`;
    const response = await fetch(url, {
        method: editEventID ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to save event.');
    clearForm();
    $('formStatus').textContent = wasEditing ? 'Event changes saved.' : 'Event saved.';
    await loadEvents();
}

async function deleteEvent(eventID) {
    const event = events.find(item => Number(item.EventID) === Number(eventID));
    if (!event) return;
    if (!window.confirm(`Delete ${event.EventType || 'this event'}${event.EventDate ? ` dated ${dateUS(event.EventDate)}` : ''}?`)) return;
    const response = await fetch(
        `${BASE_URL}/familytree/persons/${personID}/events/${eventID}?familyTreeCode=${encodeURIComponent(familyTreeCode)}`,
        { method: 'DELETE', headers: authHeaders(false) }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to delete event.');
    if (editEventID === eventID) clearForm();
    $('listStatus').textContent = 'Event deleted.';
    await loadEvents();
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!token()) return window.location.href = 'login.html';
    if (!personID || !familyTreeCode) return $('formStatus').textContent = 'PersonID and FamilyTreeCode are required.';
    $('backBtn').onclick = () => window.location.href = `FTPerson.html?PersonID=${encodeURIComponent(personID)}&familyTreeCode=${encodeURIComponent(familyTreeCode)}`;
    $('saveEventBtn').onclick = () => saveEvent().catch(error => $('formStatus').textContent = error.message);
    $('clearBtn').onclick = clearForm;
    $('cancelEditBtn').onclick = clearForm;
    try {
        await loadPerson();
        await loadEvents();
    } catch (error) {
        $('formStatus').textContent = error.message;
    }
});
