const BASE_URL=window.location.hostname==='localhost'&&window.location.port!=='8080'?'http://localhost:8080':window.location.origin;
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
const $=id=>document.getElementById(id),token=()=>localStorage.getItem('token');const personID=Number(new URLSearchParams(location.search).get('PersonID')||0);const nameOf=p=>[p.LastName?p.LastName+',':'',p.FirstName,p.MiddleName,p.SuffixName].filter(Boolean).join(' ');const names=a=>(a||[]).map(nameOf).join('; ')||'None';
async function load(){const r=await fetch(`${BASE_URL}/familytree/persons/${personID}/duplicate-view`,{headers:{Authorization:`Bearer ${token()}`}}),d=await r.json();if(!r.ok)throw new Error(d.message||'Unable to load Person.');const p=d.person,profile=(d.images||[]).find(x=>String(x.ImageType).toLowerCase()==='profile'),profileUrl=profile?safeImageUrl(profile.url):'';$('personCard').innerHTML=`<div class="person-grid"><div>${profileUrl?`<img class="profile" src="${escapeHtml(profileUrl)}" alt="">`:''}</div><div><h2>${escapeHtml(nameOf(p))}</h2><div class="facts"><b>PersonID</b><div>${escapeHtml(p.PersonID)}</div><b>FamilyTreeCode</b><div>${escapeHtml(d.FamilyTreeCode||'')}</div><b>Gender</b><div>${escapeHtml(p.Gender||'')}</div><b>Birth Date</b><div>${escapeHtml(p.BirthDate||'')}</div><b>Birth Place</b><div>${escapeHtml(p.BirthPlace||'')}</div><b>Nickname</b><div>${escapeHtml(p.NickName||'')}</div><b>Maiden Name</b><div>${escapeHtml(p.MaidenName||'')}</div><b>Died</b><div>${Number(p.Died)?'Yes':'No'}</div><b>Death Date</b><div>${escapeHtml(p.DeathDate||'')}</div></div></div></div>`;$('parents').textContent=names(d.parents);$('partners').textContent=names(d.partners);$('children').textContent=names(d.children);$('pictures').innerHTML=(d.images||[]).map(x=>{const url=safeImageUrl(x.url);return url?`<div><img src="${escapeHtml(url)}" alt=""><div>${escapeHtml(x.ImageType||'')}${x.Caption?` — ${escapeHtml(x.Caption)}`:''}</div></div>`:''}).join('')||'None'}
document.addEventListener('DOMContentLoaded',()=>{if(!token()){location.href='login.html';return}if(!personID){$('status').textContent='PersonID is required.';return}load().catch(e=>$('status').textContent=e.message)});
