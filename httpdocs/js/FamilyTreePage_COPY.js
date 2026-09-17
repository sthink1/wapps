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
const $=id=>document.getElementById(id),token=()=>localStorage.getItem('token');
const ah=(json=true)=>{const h={Authorization:`Bearer ${token()}`};if(json)h['Content-Type']='application/json';return h};
let currentCode='';

function personName(p){return [p.LastName?p.LastName+',':'',p.FirstName,p.MiddleName,p.SuffixName].filter(Boolean).join(' ');}
function setCurrent(code){
 currentCode=code||'';
 if(currentCode)sessionStorage.setItem('familyTreeCode',currentCode);else sessionStorage.removeItem('familyTreeCode');
 $('familyTreeCodeDisplay').textContent=currentCode||'None associated';
 if($('changeTreeBtn'))$('changeTreeBtn').disabled=!currentCode;
}
async function loadCurrentTree(){
 const r=await fetch(`${BASE_URL}/familytree/current-tree`,{headers:ah(false)}),d=await r.json();
 if(!r.ok)throw new Error(d.message||'Unable to determine Family Tree.');
 setCurrent(d.tree?d.tree.FamilyTreeCode:'');
}
async function enterCode(code){
 const r=await fetch(`${BASE_URL}/familytree/enter-code`,{method:'POST',headers:ah(),body:JSON.stringify({familyTreeCode:code})}),d=await r.json();
 if(!r.ok)throw new Error(d.message||'Unable to enter Family Tree.');
 setCurrent(d.FamilyTreeCode);return d;
}
document.addEventListener('DOMContentLoaded',async()=>{
 if(!token()){location.href='login.html';return}
 // Never trust another user's old browser session code. Server membership is authoritative.
 sessionStorage.removeItem('familyTreeCode');
 document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>location.href=b.dataset.page);
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).classList.remove('show'));
 $('enterCodeBtn').onclick=()=>{$('codeInput').value='';$('codeStatus').textContent='';$('codeModal').classList.add('show')};
 $('searchPersonBtn').onclick=()=>{$('searchInput').value='';$('searchBody').innerHTML='';$('searchTable').style.display='none';$('searchStatus').textContent='';$('searchModal').classList.add('show')};
 $('personListBtn').onclick=()=>{if(!currentCode){$('statusMessage').textContent='Enter, search for, or create a Family Tree first.';return}location.href='FTPersonList.html'};
 $('changeTreeBtn').onclick=async()=>{if(!currentCode)return;const ok=window.confirm(`Change from Family Tree ${currentCode}?\n\nThis will NOT delete people, pictures, relationships, contacts, events, or activity. It only ends your current association so you can enter another Family Tree or start a new one.`);if(!ok)return;try{const r=await fetch(`${BASE_URL}/familytree/change-tree`,{method:'POST',headers:ah()}),d=await r.json();if(!r.ok)throw new Error(d.message||'Unable to change Family Tree.');setCurrent('');$('statusMessage').textContent=d.message||'You are no longer associated with a current Family Tree. Enter another code, search for a person, or create a new person.';}catch(e){$('statusMessage').textContent=e.message}};
 $('codeSubmit').onclick=async()=>{try{const d=await enterCode($('codeInput').value.trim());$('codeStatus').textContent=d.message||`Family Tree ${d.FamilyTreeCode} is now active.`;setTimeout(()=>$('codeModal').classList.remove('show'),500)}catch(e){$('codeStatus').textContent=e.message}};
 $('searchSubmit').onclick=async()=>{try{const q=$('searchInput').value.trim();if(!q)return $('searchStatus').textContent='Enter search information.';const r=await fetch(`${BASE_URL}/familytree/tree-search?q=${encodeURIComponent(q)}`,{headers:ah(false)}),d=await r.json();if(!r.ok)throw new Error(d.message||'Search failed');$('searchBody').innerHTML=(d.results||[]).map(p=>`<tr><td>${escapeHtml(p.PersonID)}</td><td>${escapeHtml(personName(p))}</td><td>${escapeHtml(p.BirthDate||'')}</td><td>${escapeHtml(p.BirthPlace||'')}</td><td>${escapeHtml(p.FamilyTreeCode||'')}</td><td><button class="use-tree" data-code="${escapeHtml(p.FamilyTreeCode||'')}">USE THIS TREE</button></td></tr>`).join('');$('searchTable').style.display=(d.results||[]).length?'table':'none';$('searchStatus').textContent=(d.results||[]).length?`${d.results.length} match(es) found.`:'No matches found.';document.querySelectorAll('.use-tree').forEach(b=>b.onclick=async()=>{try{const d2=await enterCode(b.dataset.code);$('searchStatus').textContent=d2.message||`Family Tree ${d2.FamilyTreeCode} is now active.`;setTimeout(()=>$('searchModal').classList.remove('show'),500)}catch(e){$('searchStatus').textContent=e.message}})}catch(e){$('searchStatus').textContent=e.message}};
 try{
  await loadCurrentTree();
 }catch(e){$('statusMessage').textContent=e.message}
});