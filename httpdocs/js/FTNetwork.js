const BASE_URL=window.location.hostname==='localhost'&&window.location.port!=='8080'?'http://localhost:8080':window.location.origin;
const $=id=>document.getElementById(id),token=()=>localStorage.getItem('token');
const ah=()=>({Authorization:`Bearer ${token()}`});
const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let code=sessionStorage.getItem('familyTreeCode')||'';
function values(){return ['q','name','city','state','school','program','profession','company','position','item','help'].reduce((o,k)=>(o[k]=$(k).value.trim(),o),{});}
function clear(){['q','name','city','state','school','program','profession','company','position','item','help'].forEach(k=>$(k).value='');$('body').innerHTML='<tr><td colspan="4">Enter search criteria.</td></tr>';$('status').textContent='';}
async function search(){
 const v=values(); if(!Object.values(v).some(Boolean)){ $('status').textContent='Enter at least one search criterion.'; return; }
 const p=new URLSearchParams({familyTreeCode:code}); Object.entries(v).forEach(([k,val])=>{if(val)p.set(k,val)});
 $('status').textContent='Searching...';
 const r=await fetch(`${BASE_URL}/familytree/network/search?${p}`,{headers:ah()}); const d=await r.json(); if(!r.ok)throw new Error(d.message||'Network search failed.');
 const rows=d.results||[];
 $('body').innerHTML=rows.length?rows.map(x=>`<tr><td><button class="person-link icon-action" data-id="${esc(x.PersonID)}" title="View Person" aria-label="View Person"><img src="images/person.svg" alt=""></button></td><td>${esc(x.Name||'')}</td><td>${esc(x.Location||'')}</td><td class="match">${(x.Matches||[]).map(m=>esc(m)).join('<br>')}</td></tr>`).join(''):'<tr><td colspan="4">No matches found.</td></tr>';
 document.querySelectorAll('.person-link').forEach(b=>b.onclick=()=>location.href=`FTPerson.html?PersonID=${encodeURIComponent(b.dataset.id)}&familyTreeCode=${encodeURIComponent(code)}`);
 $('status').textContent=`${rows.length} match${rows.length===1?'':'es'} found.`;
}
document.addEventListener('DOMContentLoaded',async()=>{if(!token()){location.href='login.html';return}if(!code){$('status').textContent='No current Family Tree is selected.';$('searchBtn').disabled=true;return}$('codeDisplay').textContent=code;$('searchBtn').onclick=()=>search().catch(e=>$('status').textContent=e.message);$('clearBtn').onclick=clear;});
