const BASE_URL=window.location.hostname==='localhost'&&window.location.port!=='8080'?'http://localhost:8080':window.location.origin;
const $=id=>document.getElementById(id),token=()=>localStorage.getItem('token');
const ah=(json=true)=>{const h={Authorization:`Bearer ${token()}`};if(json)h['Content-Type']='application/json';return h};
let currentCode='';

function personName(p){return [p.LastName?p.LastName+',':'',p.FirstName,p.MiddleName,p.SuffixName].filter(Boolean).join(' ');}
function setCurrent(code){
 currentCode=code||'';
 if(currentCode)sessionStorage.setItem('familyTreeCode',currentCode);else sessionStorage.removeItem('familyTreeCode');
 $('familyTreeCodeDisplay').textContent=currentCode||'None associated';
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
 $('codeSubmit').onclick=async()=>{try{const d=await enterCode($('codeInput').value.trim());$('codeStatus').textContent=d.message||`Family Tree ${d.FamilyTreeCode} is now active.`;setTimeout(()=>$('codeModal').classList.remove('show'),500)}catch(e){$('codeStatus').textContent=e.message}};
 $('searchSubmit').onclick=async()=>{try{const q=$('searchInput').value.trim();if(!q)return $('searchStatus').textContent='Enter search information.';const r=await fetch(`${BASE_URL}/familytree/tree-search?q=${encodeURIComponent(q)}`,{headers:ah(false)}),d=await r.json();if(!r.ok)throw new Error(d.message||'Search failed');$('searchBody').innerHTML=(d.results||[]).map(p=>`<tr><td>${p.PersonID}</td><td>${personName(p)}</td><td>${p.BirthDate||''}</td><td>${p.BirthPlace||''}</td><td>${p.FamilyTreeCode||''}</td><td><button class="use-tree" data-code="${p.FamilyTreeCode}">USE THIS TREE</button></td></tr>`).join('');$('searchTable').style.display=(d.results||[]).length?'table':'none';$('searchStatus').textContent=(d.results||[]).length?`${d.results.length} match(es) found.`:'No matches found.';document.querySelectorAll('.use-tree').forEach(b=>b.onclick=async()=>{try{const d2=await enterCode(b.dataset.code);$('searchStatus').textContent=d2.message||`Family Tree ${d2.FamilyTreeCode} is now active.`;setTimeout(()=>$('searchModal').classList.remove('show'),500)}catch(e){$('searchStatus').textContent=e.message}})}catch(e){$('searchStatus').textContent=e.message}};
 try{
  const r=await fetch(`${BASE_URL}/familytree/health`,{headers:ah(false)}),d=await r.json();if(!r.ok)throw new Error(d.message||'Database check failed');$('dbStatus').textContent=`Connected (${d.database})`;$('dbStatus').className='success';
  await loadCurrentTree();
 }catch(e){$('dbStatus').textContent=e.message;$('dbStatus').className='error'}
});