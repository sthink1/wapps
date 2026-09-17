const BASE_URL = window.location.hostname === 'localhost' && window.location.port !== '8080'
    ? 'http://localhost:8080'
    : window.location.origin;

const $ = id => document.getElementById(id);
const token = () => localStorage.getItem('token');
const headers = () => ({
    'Authorization': `Bearer ${token()}`,
    'Content-Type': 'application/json'
});

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
}

function formatDate(value) {
    if (!value) return '';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

async function getCurrentCode() {
    const fromQuery = new URLSearchParams(location.search).get('familyTreeCode');
    if (fromQuery) return fromQuery;
    const r = await fetch(`${BASE_URL}/familytree/current-tree`, {
        headers: { Authorization: `Bearer ${token()}` }
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Unable to determine the current Family Tree.');
    return d.tree ? d.tree.FamilyTreeCode : '';
}

async function loadOptions() {
    const code = await getCurrentCode();
    if (!code) {
        $('mergeHost').textContent = 'There is no current Family Tree.';
        return;
    }

    const r = await fetch(
        `${BASE_URL}/familytree/one-tree/undo-options?familyTreeCode=${encodeURIComponent(code)}`,
        { headers: { Authorization: `Bearer ${token()}` } }
    );
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Unable to load One Tree merge history.');

    if (!d.merges || !d.merges.length) {
        $('mergeHost').textContent = 'No reversible One Tree merges are available for this Tree.';
        return;
    }

    $('mergeHost').innerHTML = d.merges.map(row => `
        <div class="merge-card">
            <b>Restore Tree ${escapeHtml(row.SourceFamilyTreeCode)}</b><br>
            Currently merged into: ${escapeHtml(row.SurvivingFamilyTreeCode)}<br>
            Merged: ${escapeHtml(formatDate(row.MergedAt))}<br>
            Merged by: ${escapeHtml(row.MergedByUserName || row.MergedByUserID)}
            <div class="actions">
                <button class="review-btn" data-id="${escapeHtml(row.TreeMergeID)}">REVIEW UNDO</button>
            </div>
            <div id="review-${escapeHtml(row.TreeMergeID)}"></div>
        </div>
    `).join('');

    document.querySelectorAll('.review-btn').forEach(button => {
        button.addEventListener('click', () => reviewMerge(Number(button.dataset.id)));
    });
}

async function reviewMerge(treeMergeID) {
    $('status').textContent = '';
    const r = await fetch(`${BASE_URL}/familytree/one-tree/undo-review/${treeMergeID}`, {
        headers: { Authorization: `Bearer ${token()}` }
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || 'Unable to review this merge.');

    const pairs = (d.samePersonPairs || []).length
        ? d.samePersonPairs.map(pair => `
            <div class="pair">
                Source PersonID ${escapeHtml(pair.sourcePersonID)}: ${escapeHtml(pair.sourceName)}<br>
                was merged into PersonID ${escapeHtml(pair.survivingPersonID)}: ${escapeHtml(pair.survivingName)}
            </div>
        `).join('')
        : '<p>No Person records were combined as SAME PERSON in this merge.</p>';

    const host = $(`review-${treeMergeID}`);
    host.innerHTML = `
        <div class="warning" style="margin-top:10px;">
            <b>Undo summary</b><br>
            Restore Family Tree: <b>${escapeHtml(d.SourceFamilyTreeCode)}</b><br>
            Separate it from: <b>${escapeHtml(d.SurvivingFamilyTreeCode)}</b><br>
            People in the source Tree when merged: ${escapeHtml(d.sourcePersonCount)}<br>
            SAME PERSON merges to reverse: ${escapeHtml(d.mergedPersonCount)}
            ${pairs}
            <p>The restored Tree will become your current Tree. This action is itself recorded in Family Tree activity history.</p>
            <div class="actions">
                <button class="danger confirm-undo" data-id="${escapeHtml(treeMergeID)}">CONFIRM UNDO ONE TREE MERGE</button>
            </div>
        </div>
    `;

    host.querySelector('.confirm-undo').addEventListener('click', () => undoMerge(treeMergeID));
}

async function undoMerge(treeMergeID) {
    const ok = window.confirm(
        'Undo this One Tree merge and restore the newer Family Tree as a separate Tree?\n\n' +
        'Use this only if the Trees were combined by mistake.'
    );
    if (!ok) return;

    $('status').textContent = 'Restoring the separate Family Tree...';
    document.querySelectorAll('button').forEach(button => button.disabled = true);

    try {
        const r = await fetch(`${BASE_URL}/familytree/one-tree/undo`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ treeMergeID })
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.message || 'Unable to undo this One Tree merge.');

        sessionStorage.setItem('familyTreeCode', d.FamilyTreeCode);
        $('status').textContent = d.message || `Family Tree ${d.FamilyTreeCode} was restored.`;
        setTimeout(() => {
            window.location.href = 'FamilyTree.html';
        }, 900);
    } catch (e) {
        $('status').textContent = e.message;
        document.querySelectorAll('button').forEach(button => button.disabled = false);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!token()) {
        window.location.href = 'login.html';
        return;
    }
    loadOptions().catch(e => {
        $('mergeHost').textContent = '';
        $('status').textContent = e.message;
    });
});
