'use strict';
window.FTPrivacy = (()=>{
const base=window.location.hostname==='localhost'&&window.location.port!=='8080'?'http://localhost:8080':window.location.origin;
const bearer=()=>({'Authorization':`Bearer ${localStorage.getItem('token')}`,'Content-Type':'application/json',...(currentPageToken?{'X-FT-Page-Token':currentPageToken}:{})});
let currentPageToken=null;
const handoff=id=>`FTPrivacyEntry:${id}`;
function installPageToken(t){currentPageToken=t;/* This token exists only in this page's JavaScript memory. */
 const nativeFetch=window.fetch.bind(window);window.fetch=(url,opts={})=>{const u=String(url);if(u.includes('/familytree/')){const h=new Headers(opts.headers||{});h.set('X-FT-Page-Token',t);return nativeFetch(url,{...opts,headers:h});}return nativeFetch(url,opts);};
}
function popup(title,detail,needKey=false){return new Promise(resolve=>{
  const backdrop=document.createElement('div');backdrop.style.cssText='position:fixed;inset:0;background:#0009;z-index:99999;display:flex;align-items:center;justify-content:center;padding:15px';
  const panel=document.createElement('div');panel.style.cssText='background:white;max-width:430px;width:100%;border-radius:7px;padding:20px;font:16px Arial,sans-serif';
  const h=document.createElement('h2');h.textContent=title;panel.appendChild(h);
  const p=document.createElement('p');p.textContent=detail;panel.appendChild(p);
  let input=null;if(needKey){input=document.createElement('input');input.maxLength=128;input.autocomplete='off';input.placeholder='At least 4 characters';input.setAttribute('aria-label','Privacy key');input.style.cssText='padding:10px;width:100%;margin:8px 0';panel.appendChild(input);}
  const info=document.createElement('p');info.style.color='#a00000';panel.appendChild(info);
  const submit=document.createElement('button');submit.textContent=needKey?'VERIFY KEY':'OK';submit.style.cssText='background:#4caf50;color:white;border:0;padding:10px 18px;margin:8px';
  const cancel=document.createElement('button');cancel.textContent='CANCEL';cancel.style.cssText='padding:10px 18px;margin:8px';
  function close(value){backdrop.remove();resolve(value);}
  submit.onclick=()=>{if(needKey){const value=input.value;if(!/^(?=.{4,128}$)(?!.*[\x00-\x1F\x7F])[\s\S]+$/u.test(value)){info.textContent='Choose any combination of letters, numbers, or symbols. At least four characters (maximum 128).';return;}close(value);}else close(true);};
  cancel.onclick=()=>close(null);panel.append(submit,cancel);backdrop.appendChild(panel);document.body.appendChild(backdrop);input?.focus();
});}
async function api(path,opt={}){const r=await fetch(`${base}/familytree/privacy/${path}`,{...opt,headers:bearer()});let data={};try{data=await r.json();}catch{}if(!r.ok)throw Error(data.message||'Privacy action failed.');return data;}
async function status(personID,familyTreeCode){return api(`status/${personID}?familyTreeCode=${encodeURIComponent(familyTreeCode)}`);}
async function unlock(personID,familyTreeCode){const code=await popup('PRIVACY LOCK','Enter the key code for this Person (at least four characters).',true);if(!code)return false;try{const result=await api(`unlock/${personID}`,{method:'POST',body:JSON.stringify({familyTreeCode,keyCode:code})});return result.pageToken||true;}catch(e){await popup('PRIVACY LOCK',e.message);return false;}}
async function ensurePageAccess(personID,code){try{
 const s=await status(personID,code);if(!s.IsPrivate)return true;
 // Remove handoff immediately. Reloading or reopening the URL requires a NEW key.
 const issued=sessionStorage.getItem(handoff(personID));sessionStorage.removeItem(handoff(personID));
 if(issued){const trial=await api(`status/${personID}?familyTreeCode=${encodeURIComponent(code)}`,{headers:bearerWithPageToken(issued)});if(trial.Authorized){installPageToken(issued);return true;}}
 if(s.IsAdmin)return true;
 const fresh=await unlock(personID,code);if(!fresh||typeof fresh!=='string')return false;
 installPageToken(fresh);return true;
 }catch(e){await popup('PRIVACY LOCK',e.message);return false;}}
function bearerWithPageToken(pageToken){return {...bearer(),'X-FT-Page-Token':pageToken};}
async function openPerson(personID,code){try{
 const s=await status(personID,code);
 if(s.IsPrivate&&!s.IsAdmin){const issued=await unlock(personID,code);if(!issued||typeof issued!=='string')return false;sessionStorage.setItem(handoff(personID),issued);}
 location.href=`FTPerson.html?PersonID=${encodeURIComponent(personID)}&familyTreeCode=${encodeURIComponent(code)}`;return true;
 }catch(e){await popup('PRIVACY LOCK',e.message);return false;}}
function buildControl(personID,treeCode){
 const header=document.querySelector('.section-title.person');if(!header)return;
 header.style.display='flex';header.style.alignItems='center';header.style.gap='8px';header.style.flexWrap='wrap';
 const wrap=document.createElement('span');wrap.style.cssText='margin-left:auto;display:inline-flex;gap:7px;align-items:center;flex-wrap:wrap;font:14px Arial,sans-serif';
 const label=document.createElement('label');label.style.cssText='display:inline-flex;align-items:center;gap:5px;white-space:nowrap';label.textContent='GO PRIVATE';
 const check=document.createElement('input');check.type='checkbox';check.style.width='auto';label.appendChild(check);
 const st=document.createElement('span');st.style.fontWeight='bold';const keyIcon=document.createElement('img');keyIcon.src='images/privacy-key.svg';keyIcon.alt='Privacy Lock';keyIcon.title='Privacy Lock';keyIcon.style.cssText='width:24px;height:24px;display:none';wrap.append(label,keyIcon,st);header.appendChild(wrap);
 const note=document.createElement('div');note.textContent='To GO PRIVATE, check GO PRIVATE. To GO PUBLIC, uncheck GO PRIVATE. Both privacy changes require approval through the verified primary Contact email.';note.style.cssText='font:12px Arial;padding:4px 8px;background:#fff3cd';header.after(note);
 const sync=async()=>{const s=await status(personID,treeCode);check.checked=s.IsPrivate;keyIcon.style.display=s.IsPrivate?'inline-block':'none';st.textContent=s.PendingAction?`Pending GO ${s.PendingAction==='PRIVATE'?'PRIVATE':'PUBLIC'}`:s.IsPrivate?'Verified — Private':'';st.style.cssText=s.PendingAction?'background:#fff2b3;color:#674700;border:1px solid #815900;padding:3px 6px':s.IsPrivate?'background:#fce4e4;color:#a51c16;border:1px solid #b42318;padding:3px 6px':'color:#333';};
 check.onchange=async()=>{const desired=check.checked?'PRIVATE':'PUBLIC';check.disabled=true;try{
   if(!confirm(`Request GO ${desired} for this Person? The privacy status will not change until approved by the verified primary email recipient.`))return;
   let keyCode=null,confirmKeyCode=null;
   if(desired==='PRIVATE'){
     keyCode=await popup('GO PRIVATE','Choose any combination of letters, numbers, or symbols. Must be at least four characters. Enter it twice.',true);if(!keyCode)return;
     confirmKeyCode=await popup('CONFIRM KEY','Re-enter the same key code (case-sensitive).',true);if(!confirmKeyCode)return;
   }
   const result=await api(`request/${personID}`,{method:'POST',body:JSON.stringify({familyTreeCode:treeCode,action:desired,keyCode,confirmKeyCode})});alert(result.message);
  }catch(e){alert(e.message);}finally{await sync().catch(e=>alert(e.message));check.disabled=false;}};
 sync().catch(e=>{st.textContent=e.message;});
}
return {status,openPerson,ensurePageAccess,buildControl};
})();
