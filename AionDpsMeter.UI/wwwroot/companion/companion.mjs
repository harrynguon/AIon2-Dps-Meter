import {validateEvents,timeline} from './schedule.mjs';
import {initialState,validateState} from './state.mjs';

const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const remaining=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor(s/60%60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;};
export async function mount(root,bridge) {
  const data=await (await fetch(new URL('./cubes.json',import.meta.url))).json();
  let state=initialState();
  let warning='';
  let unreadableSave=null,saveBlocked=false;
  try {unreadableSave=await bridge.invokeMethodAsync('Load');if(unreadableSave)state=validateState(JSON.parse(unreadableSave),data);unreadableSave=null;}
  catch {saveBlocked=true;warning='Saved progress could not be loaded. Changes will not overwrite it. Export the original file, then import a valid backup or start fresh in Settings.';}
  let activeTab='schedule',search='',hideFound=false,selected=null,scale=1,tx=0,ty=0,drag=null,moved=false,disposed=false;
  let saveChain=Promise.resolve();
  const found=()=>state.profiles[state.profile];
  const save=()=>{if(saveBlocked){status.textContent=warning;return;}const json=JSON.stringify(state);saveChain=saveChain.catch(()=>{}).then(()=>bridge.invokeMethodAsync('Save',json)).then(()=>{if(!disposed)status.textContent='Saved on this PC';}).catch(()=>{if(!disposed)status.textContent='Save failed — export a backup before closing.';});};
  root.innerHTML=`<div class="wc-shell">
    <header class="wc-header"><div><span class="wc-eyebrow">RATMETER / WORLD COMPANION</span><h1>Your next adventure.</h1></div><div class="wc-window-actions"><button data-action="drag" title="Drag window">Move</button><button data-action="close" title="Close companion">✕</button></div></header>
    <div class="wc-toolbar"><nav aria-label="Companion tabs"><button data-tab="schedule" class="selected">Schedule</button><button data-tab="cubes">Hidden cubes</button><button data-tab="settings">Settings</button></nav><span class="wc-clock"></span></div>
    <div class="wc-warning">Schedule defaults are unverified for Global Asia. Check your in-game calendar and adjust Settings. “Active” is a scheduled window, not a live boss report.</div>
    <div class="wc-recovery" role="alert" hidden><p></p><button data-action="export-original">Export original file</button><button data-action="start-fresh">Start fresh</button></div>
    <section data-panel="schedule"><div class="wc-hero"></div><div class="wc-event-list"></div></section>
    <section data-panel="cubes" hidden><div class="wc-cube-tools"><label>Character <select class="wc-profile"></select></label><button data-action="new-profile">New character</button><label>Map <select class="wc-zone"><option value="verteron">Verteron · Elyos</option><option value="altgard">Altgard · Asmodian</option></select></label><input class="wc-search" aria-label="Search cubes" placeholder="Search landmark or group…"><label><input type="checkbox" class="wc-hide"> Hide found</label></div><div class="wc-progress"></div><div class="wc-map-layout"><div class="wc-map" tabindex="0" aria-label="Cube map. Drag to pan, scroll to zoom. Use checklist to select pins."><div class="wc-plane"><img draggable="false" alt="Game map"><div class="wc-pins"></div></div><div class="wc-zoom"><button data-action="zoom-in" aria-label="Zoom in">+</button><button data-action="zoom-out" aria-label="Zoom out">−</button><button data-action="fit">Fit</button></div><div class="wc-inspector" hidden></div></div><aside class="wc-checklist" aria-label="Cube checklist"></aside></div></section>
    <section data-panel="settings" hidden><h2>Global Asia · Nezekan</h2><p>Server clock and computer-local display are separate. UTC+9 is the initial Asia clock assumption. Editing this clock never shifts entries explicitly set to UTC.</p><label>Server UTC offset <input class="wc-offset" type="number" min="-12" max="14" step="0.25"></label><p>Hours: comma-separated 0–23. Days: 0=Sunday … 6=Saturday; blank means daily. Changes apply only after Save schedule.</p><form class="wc-settings-form"><div class="wc-editor"></div><button type="submit">Save schedule</button><span class="wc-editor-status" role="status"></span></form><hr><h2>Your progress</h2><p>Each character has separate progress for both maps. Export includes all profiles and schedule settings.</p><button data-action="export">Export backup</button><label class="wc-import">Import backup <input class="wc-import-file" type="file" accept="application/json,.json"></label><p>Map and cube data: Byanski / Corpus.gg companion dataset. Coordinates are reference locations; completion is marked manually.</p></section>
    <footer><span class="wc-save-status" role="status"></span><span>Offline maps · Local progress</span></footer></div>`;
  const q=s=>root.querySelector(s),status=q('.wc-save-status');status.textContent=warning||'Saved on this PC';
  const recovery=q('.wc-recovery');recovery.hidden=!saveBlocked;recovery.querySelector('p').textContent=warning;q('[data-action=export-original]').disabled=unreadableSave===null;
  const map=q('.wc-map'),plane=q('.wc-plane'),pins=q('.wc-pins'),inspector=q('.wc-inspector');
  const localTime=t=>new Date(t).toLocaleString(undefined,{weekday:'short',hour:'2-digit',minute:'2-digit'});
  const serverTime=t=>new Date(t+state.offset*3600000).toLocaleString(undefined,{timeZone:'UTC',weekday:'short',hour:'2-digit',minute:'2-digit'});
  function renderSchedule(){
    if(disposed)return;
    const now=Date.now(),events=timeline(state.events,now,state.offset),next=events[0];
    q('.wc-clock').textContent=`Server ${serverTime(now)} · Local ${localTime(now)}`;
    if(activeTab!=='schedule')return;
    q('.wc-hero').innerHTML=`<span class="wc-eyebrow">${next.active?escapeHtml(next.phase):'NEXT UP'}</span><div class="wc-hero-body"><div><h2>${escapeHtml(next.name)}</h2><p>${escapeHtml(next.location)}</p></div><strong>${remaining(next.remaining)}</strong></div><p>${next.active?'Window ends':'Starts'} · ${localTime(next.active?next.end:next.start)} local · ${serverTime(next.active?next.end:next.start)} server</p><progress max="100" value="${next.progress}" aria-label="${next.active?'Active window elapsed':'One-hour approach progress'}"></progress><small>${next.active?'Elapsed scheduled window':'Progress fills during the final hour before start'}</small>`;
    q('.wc-event-list').innerHTML=events.map(e=>`<article class="wc-event ${e.active?'active':''}"><div><span class="wc-eyebrow">${escapeHtml(e.phase)}</span><h3>${escapeHtml(e.name)}</h3><p>${escapeHtml(e.location)}</p><small>${e.active?'Next start':'Starts'} ${localTime(e.active?e.next:e.start)} local · ${e.basis==='utc'?'UTC schedule':'Server schedule'}</small></div><strong>${remaining(e.remaining)}</strong></article>`).join('');
  }
  function renderProfiles(){q('.wc-profile').innerHTML=Object.keys(state.profiles).map(p=>`<option ${p===state.profile?'selected':''}>${escapeHtml(p)}</option>`).join('');q('.wc-zone').value=state.zone;}
  function visibleGroups(){return data.zones[state.zone].groups.filter(g=>(!hideFound||!found()[g.id])&&`${g.area} ${g.group} ${g.id}`.toLowerCase().includes(search.toLowerCase()));}
  function renderCubes(){
    const zone=data.zones[state.zone],groups=visibleGroups(),done=zone.groups.filter(g=>found()[g.id]).length;
    q('.wc-progress').innerHTML=`<span>${done} / ${zone.groups.length} groups found · ${Math.round(done/zone.groups.length*100)}%</span><progress max="${zone.groups.length}" value="${done}" aria-label="Map completion"></progress>`;
    q('.wc-checklist').innerHTML=groups.length?groups.map(g=>`<div class="wc-check-row"><input type="checkbox" data-check="${g.id}" ${found()[g.id]?'checked':''} aria-label="${escapeHtml(g.group+' '+g.area)} found"><button data-focus="${g.id}"><b>${escapeHtml(g.group)}</b> ${escapeHtml(g.area)}<small>${g.spots.length} potential spots</small></button></div>`).join(''):'<p>No matching groups.</p>';
    plane.querySelector('img').src=new URL(zone.mapImage,import.meta.url).href;
    pins.innerHTML=groups.map(g=>`<button class="wc-pin ${found()[g.id]?'found':''} ${selected?.id===g.id?'picked':''}" style="left:${g.x}%;top:${g.y}%" data-pin="${g.id}" title="${escapeHtml(g.group+' · '+g.area)}">${escapeHtml(g.group)}</button>`).join('');
    if(selected && groups.some(g=>g.id===selected.id)){
      pins.insertAdjacentHTML('beforeend',selected.spots.map(s=>`<span class="wc-spot" style="left:${s.x}%;top:${s.y}%" title="Spot ${s.num} · ${escapeHtml(s.terrain)}${s.keyRequired?' · key required':''}">${s.num}</span>`).join(''));
      inspector.hidden=false;inspector.innerHTML=`<button class="wc-inspector-close" data-action="dismiss" aria-label="Close inspector">✕</button><h3>${escapeHtml(selected.group+' · '+selected.area)}</h3><p>${selected.spots.length} potential spots · ${selected.x.toFixed(2)}%, ${selected.y.toFixed(2)}%</p><label><input type="checkbox" data-check="${selected.id}" ${found()[selected.id]?'checked':''}> Group found</label><small>Numbered dots show individual candidate locations.</small>`;
    }else{inspector.hidden=true;selected=null;}
    transform();
  }
  function transform(){plane.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;plane.style.setProperty('--pin-scale',1/scale);}
  function fit(){const r=map.getBoundingClientRect();if(!r.width||!r.height)return;scale=Math.min(r.width,r.height)/2048;tx=(r.width-2048*scale)/2;ty=(r.height-2048*scale)/2;transform();}
  function zoom(factor,x=map.clientWidth/2,y=map.clientHeight/2){const next=Math.max(.1,Math.min(8,scale*factor)),ratio=next/scale;tx=x-(x-tx)*ratio;ty=y-(y-ty)*ratio;scale=next;transform();}
  function select(id,center=false){selected=data.zones[state.zone].groups.find(g=>g.id===id);if(!selected)return;if(center){scale=Math.max(scale,1.4);tx=map.clientWidth/2-selected.x/100*2048*scale;ty=map.clientHeight/2-selected.y/100*2048*scale;}renderCubes();}
  function renderEditor(){q('.wc-offset').value=state.offset;q('.wc-editor').innerHTML=state.events.map(e=>`<fieldset data-event="${e.id}"><legend>${escapeHtml(e.name)}</legend><label>Clock <select name="basis"><option value="server" ${e.basis==='server'?'selected':''}>Server</option><option value="utc" ${e.basis==='utc'?'selected':''}>UTC</option></select></label><label>Hours <input name="hours" value="${e.hours.join(',')}" required></label><label>Minute <input name="minute" type="number" min="0" max="59" value="${e.minute}" required></label><label>Days <input name="days" value="${e.days?.join(',')??''}" placeholder="Daily"></label><label>${e.kind==='rift'?'Entry window':'Window'} minutes <input name="duration" type="number" min="0" max="1440" value="${e.duration}" required></label>${e.kind==='rift'?`<label>Total active minutes <input name="activeDuration" type="number" min="0" max="1440" value="${e.activeDuration}" required></label>`:''}</fieldset>`).join('');}
  const abort=new AbortController(),on=(el,type,fn,opts={})=>el.addEventListener(type,fn,{...opts,signal:abort.signal});
  on(root,'click',async e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.tab){activeTab=b.dataset.tab;root.querySelectorAll('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==activeTab);root.querySelectorAll('[data-tab]').forEach(p=>p.classList.toggle('selected',p.dataset.tab===activeTab));if(activeTab==='cubes'){renderCubes();requestAnimationFrame(fit);}renderSchedule();return;}
    if(b.dataset.pin&&!moved)select(b.dataset.pin);
    if(b.dataset.focus)select(b.dataset.focus,true);
    const action=b.dataset.action;
    if(action==='close'){await saveChain;await bridge.invokeMethodAsync('Close');}
    if(action==='zoom-in')zoom(1.3);if(action==='zoom-out')zoom(1/1.3);if(action==='fit')fit();
    if(action==='dismiss'){selected=null;renderCubes();}
    if(action==='new-profile'){const name=prompt('Character name (include server if useful):');if(name?.trim()){const key=name.trim().slice(0,100);if(['__proto__','constructor','prototype'].includes(key))return;if(!Object.hasOwn(state.profiles,key))state.profiles[key]={};state.profile=key;selected=null;renderProfiles();renderCubes();save();}}
    if(action==='start-fresh'&&confirm('Start fresh and replace unreadable progress? The original file will be retained as companion.json.bak on the first save.')){state=initialState();saveBlocked=false;unreadableSave=null;warning='';recovery.hidden=true;selected=null;renderProfiles();renderEditor();renderCubes();renderSchedule();save();}
    if(action==='export'||action==='export-original'){const blob=new Blob([action==='export-original'?unreadableSave:JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=action==='export-original'?'ratmeter-companion-original.json':'ratmeter-companion-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  });
  on(q('[data-action="drag"]'),'pointerdown',()=>bridge.invokeMethodAsync('Drag'));
  on(root,'change',e=>{if(e.target.dataset.check){found()[e.target.dataset.check]=e.target.checked;renderCubes();save();}});
  on(q('.wc-profile'),'change',e=>{state.profile=e.target.value;selected=null;renderCubes();save();});
  on(q('.wc-zone'),'change',e=>{state.zone=e.target.value;selected=null;renderCubes();fit();save();});
  on(q('.wc-search'),'input',e=>{search=e.target.value;renderCubes();});
  on(q('.wc-hide'),'change',e=>{hideFound=e.target.checked;renderCubes();});
  on(q('.wc-settings-form'),'submit',e=>{e.preventDefault();try{
    const offset=Number(q('.wc-offset').value);if(!Number.isFinite(offset)||offset < -12||offset>14)throw Error('UTC offset must be −12 to +14.');
    const events=state.events.map(ev=>{const f=q(`[data-event="${ev.id}"]`),v=n=>f.querySelector(`[name="${n}"]`).value;const next={...ev,basis:v('basis'),hours:v('hours').split(',').map(x=>x.trim()===''?NaN:Number(x)),minute:Number(v('minute')),duration:Number(v('duration'))};delete next.days;if(v('days').trim())next.days=v('days').split(',').map(x=>x.trim()===''?NaN:Number(x));if(ev.kind==='rift')next.activeDuration=Number(v('activeDuration'));return next;});
    validateEvents(events);state.events=events;state.offset=offset;save();renderSchedule();q('.wc-editor-status').textContent=saveBlocked?'Not saved: recover your progress file first.':'Schedule applied.';
  }catch(err){q('.wc-editor-status').textContent=err.message;}});
  on(q('.wc-import-file'),'change',async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>2000000)throw Error('Backup is too large.');const imported=validateState(JSON.parse(await file.text()),data);if(!confirm('Replace all companion profiles and settings with this backup?'))return;state=imported;saveBlocked=false;unreadableSave=null;warning='';recovery.hidden=true;selected=null;renderProfiles();renderEditor();renderCubes();save();}catch(err){status.textContent=`Import failed: ${err.message}`;}finally{e.target.value='';}});
  on(map,'wheel',e=>{e.preventDefault();const r=map.getBoundingClientRect();zoom(Math.exp(-e.deltaY*.0015),e.clientX-r.left,e.clientY-r.top);},{passive:false});
  on(map,'pointerdown',e=>{moved=false;if(e.button!==0||e.target.closest('.wc-zoom,.wc-inspector'))return;drag={x:e.clientX,y:e.clientY,tx,ty};map.setPointerCapture(e.pointerId);});
  on(map,'pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>4)moved=true;tx=drag.tx+dx;ty=drag.ty+dy;transform();});
  on(map,'pointerup',e=>{if(drag&&!moved){const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-pin]');if(hit)select(hit.dataset.pin);}drag=null;if(map.hasPointerCapture(e.pointerId))map.releasePointerCapture(e.pointerId);});
  on(map,'pointercancel',()=>drag=null);
  const resize=new ResizeObserver(()=>{if(activeTab==='cubes')fit();});resize.observe(map);
  renderProfiles();renderEditor();renderSchedule();renderCubes();
  const timer=setInterval(renderSchedule,1000);
  return {dispose(){disposed=true;clearInterval(timer);abort.abort();resize.disconnect();root.replaceChildren();}};
}
