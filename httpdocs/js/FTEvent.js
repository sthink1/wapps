const BASE_URL =
    window.location.hostname === 'localhost' && window.location.port !== '8080'
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
let historyOpen = false;

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

function isDeceased(person) {
    return Boolean(
        person &&
        (Number(person.Died) === 1 || person.DeathDate)
    );
}

function ageClass(person) {
    return isDeceased(person) ? 'deceased-age' : '';
}

function clearForm() {
    editEventID = null;
    $('eventType').disabled = false;
    $('eventDate').disabled = false;
    $('eventPlace').disabled = false;
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
    if (event.AutoPersonID) { $('formStatus').textContent = 'Change this Birth/Death date and place on the Person page. The event description remains editable here.'; }
    $('eventType').disabled = !!event.AutoPersonID;
    $('eventDate').disabled = !!event.AutoPersonID;
    $('eventPlace').disabled = !!event.AutoPersonID;
    $('formTitle').textContent = 'EDIT EVENT';
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
    events = (data.events || []).sort((a, b) => {
        const typeCompare = String(a.EventType || '').localeCompare(
            String(b.EventType || ''),
            undefined,
            { sensitivity: 'base' }
        );
        if (typeCompare) return typeCompare;
        const aDate = a.EventDate ? String(a.EventDate).slice(0, 10) : '9999-12-31';
        const bDate = b.EventDate ? String(b.EventDate).slice(0, 10) : '9999-12-31';
        return aDate.localeCompare(bDate) || Number(a.EventID) - Number(b.EventID);
    });
    $('eventBody').innerHTML = events.length
        ? events.map((event, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(event.EventType || '')}</td>
                <td>${dateUS(event.EventDate)}</td>
                <td class="${ageClass(currentPerson)}">${ageAtEvent(event.EventDate)}</td>
                <td>${escapeHtml(event.EventPlace || '')}</td>
                <td>${escapeHtml(event.EventDescription || '')}</td>
                <td><button class="edit-event" data-id="${event.EventID}" type="button">EDIT</button></td>
                <td>${event.AutoPersonID ? '<span title="Managed on Person page">PERSON PAGE</span>' : `<button class="delete-event" data-id="${event.EventID}" type="button">DELETE</button>`}</td>
            </tr>`).join('')
        : '<tr><td colspan="8">No events entered.</td></tr>';
    $('listStatus').textContent = `${events.length} event${events.length === 1 ? '' : 's'} displayed.`;
    if (historyOpen) renderHistory();
    document.querySelectorAll('.edit-event').forEach(button => button.onclick = () => fillEdit(Number(button.dataset.id)));
    document.querySelectorAll('.delete-event').forEach(button => {
        button.onclick = () => deleteEvent(Number(button.dataset.id)).catch(error => $('listStatus').textContent = error.message);
    });
}

function renderHistory() {
    // ISO date strings sort chronologically; null/undated rows come last.
    const ordered = [...events].sort((a,b) => {
        const ad = a.EventDate ? String(a.EventDate).slice(0,10) : null;
        const bd = b.EventDate ? String(b.EventDate).slice(0,10) : null;
        if (ad && !bd) return -1;
        if (!ad && bd) return 1;
        return (ad && bd ? ad.localeCompare(bd) : 0) || Number(a.EventID)-Number(b.EventID);
    });
    $('historyEventBody').innerHTML = ordered.length ? ordered.map((event,index) => `
      <tr><td>${index+1}</td><td>${escapeHtml(event.EventType||'')}</td><td>${dateUS(event.EventDate)}</td>
      <td class="${ageClass(currentPerson)}">${ageAtEvent(event.EventDate)}</td><td>${escapeHtml(event.EventPlace||'')}</td>
      <td>${escapeHtml(event.EventDescription||'')}</td>
      <td><button type="button" class="history-edit-event" data-id="${event.EventID}">EDIT</button></td>
      <td>${event.AutoPersonID ? 'PERSON PAGE' : `<button type="button" class="history-delete-event" data-id="${event.EventID}">DELETE</button>`}</td></tr>`).join('') : '<tr><td colspan="8">No events entered.</td></tr>';
    document.querySelectorAll('.history-edit-event').forEach(b=>b.onclick=()=>{closeHistory();fillEdit(Number(b.dataset.id));});
    document.querySelectorAll('.history-delete-event').forEach(b=>b.onclick=()=>deleteEvent(Number(b.dataset.id)).catch(err=>$('listStatus').textContent=err.message));
}
function openHistory() { historyOpen=true; renderHistory(); $('eventsHistoryModal').style.display='flex'; }
function closeHistory() { historyOpen=false; $('eventsHistoryModal').style.display='none'; }

async function saveEvent() {
    const wasEditing = !!editEventID;
    const existingAuto = editEventID && events.find(e=>Number(e.EventID)===editEventID && e.AutoPersonID);
    const body = {
        familyTreeCode,
        eventType: nullable($('eventType').value),
        eventDate: nullable($('eventDate').value),
        eventPlace: nullable($('eventPlace').value),
        eventDescription: nullable($('eventDescription').value)
    };
    if (existingAuto) { body.eventType=existingAuto.EventType; body.eventDate=dateInputValue(existingAuto.EventDate)||null; body.eventPlace=existingAuto.EventPlace||null; }
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
    if (event.AutoPersonID) { $('listStatus').textContent='Birth/Death events managed by the Person page cannot be deleted here.'; return; }
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
    $('backBtn').onclick = () => history.length > 1 ? history.back() : window.location.href = `FTPerson.html?PersonID=${encodeURIComponent(personID)}&familyTreeCode=${encodeURIComponent(familyTreeCode)}`;
    $('saveEventBtn').onclick = () => saveEvent().catch(error => $('formStatus').textContent = error.message);
    $('clearBtn').onclick = clearForm;
    $('cancelEditBtn').onclick = clearForm;
    $('showHistoryBtn').onclick = openHistory;
    $('closeHistoryBtn').onclick = closeHistory;
    $('eventsHistoryModal').onclick = event => { if(event.target === $('eventsHistoryModal')) closeHistory(); };
    document.addEventListener('keydown', event => { if(event.key === 'Escape') closeHistory(); });
    try {
        await loadPerson();
        await loadEvents();
    } catch (error) {
        $('formStatus').textContent = error.message;
    }
});
