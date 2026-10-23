import {validateEvents,timeline} from './schedule.mjs';
import {initialState,validateState} from './state.mjs';
import {globalSchedule} from './presets.mjs';

const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const remaining=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor(s/60%60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;};
// Mount the offline companion; disposal removes all listeners and timers.
export async function mount(root,bridge) {
  let state=initialState();
  let warning='';
  let unreadableSave=null,saveBlocked=false;
  try {unreadableSave=await bridge.invokeMethodAsync('Load');if(unreadableSave)state=validateState(JSON.parse(unreadableSave));unreadableSave=null;}
  catch {saveBlocked=true;warning='Saved settings could not be loaded. Changes will not overwrite the file. Export the original file, then import a valid backup or start fresh in Settings.';}
  let activeTab='schedule',disposed=false;
  let saveChain=Promise.resolve();
  const save=()=>{if(saveBlocked){status.textContent=warning;return;}const json=JSON.stringify(state);saveChain=saveChain.catch(()=>{}).then(()=>bridge.invokeMethodAsync('Save',json)).then(()=>{if(!disposed)status.textContent='Saved on this PC';}).catch(()=>{if(!disposed)status.textContent='Save failed — export a backup before closing.';});};
  root.innerHTML=`<div class="wc-shell">
    <header class="wc-header"><div><span class="wc-eyebrow">RATMETER / WORLD COMPANION</span><h1>Your next adventure.</h1></div><div class="wc-window-actions"><button data-action="drag" title="Drag window">Move</button><button data-action="close" title="Close companion">✕</button></div></header>
    <div class="wc-toolbar"><nav aria-label="Companion tabs"><button data-tab="schedule" class="selected">Schedule</button><button data-tab="settings">Settings</button></nav><span class="wc-clock"></span></div>
    <div class="wc-warning">Global preset follows A2Tools source; live Nezekan verification is pending. Check your in-game calendar and adjust Settings. “Active” is a scheduled window, not a live boss report.</div>
    <div class="wc-recovery" role="alert" hidden><p></p><button data-action="export-original">Export original file</button><button data-action="start-fresh">Start fresh</button></div>
    <section data-panel="schedule"><div class="wc-hero"></div><div class="wc-event-list"></div></section>
    <section data-panel="settings" hidden><h2>Global Asia · Nezekan</h2><p>Server clock and computer-local display are separate. UTC+9 is the initial Asia clock assumption. Editing this clock never shifts entries explicitly set to UTC.</p><label>Server UTC offset <input class="wc-offset" type="number" min="-12" max="14" step="0.25"></label><p>Hours: comma-separated 0–23. Days: 0=Sunday … 6=Saturday; blank means daily. Changes apply only after Save schedule.</p><p>Global preset: reset 07:00 UTC; rifts 02:00 server every 3 hours; Shugo/Invasion entry 3 minutes. Boss/siege end times are unknown. Saved rules change only after Save schedule.</p><button data-action="global-preset">Load Global preset</button><form class="wc-settings-form"><div class="wc-editor"></div><button type="submit">Save schedule</button><span class="wc-editor-status" role="status"></span></form><hr><h2>Your settings</h2><p>Export includes your clock and schedule settings.</p><button data-action="export">Export backup</button><label class="wc-import">Import backup <input class="wc-import-file" type="file" accept="application/json,.json"></label></section>
    <footer><span class="wc-save-status" role="status"></span><span>Event timers · Local settings</span></footer></div>`;
  const q=s=>root.querySelector(s),status=q('.wc-save-status');status.textContent=warning||'Saved on this PC';
  const recovery=q('.wc-recovery');recovery.hidden=!saveBlocked;recovery.querySelector('p').textContent=warning;q('[data-action=export-original]').disabled=unreadableSave===null;
  const localTime=t=>new Date(t).toLocaleString(undefined,{weekday:'short',hour:'2-digit',minute:'2-digit'});
  const serverTime=t=>new Date(t+state.offset*3600000).toLocaleString(undefined,{timeZone:'UTC',weekday:'short',hour:'2-digit',minute:'2-digit'});
  // Refresh clocks, phases and next-event banner.
  function renderSchedule(){
    if(disposed)return;
    const now=Date.now(),events=timeline(state.events,now,state.offset),next=events[0];
    q('.wc-clock').textContent=`Server ${serverTime(now)} · Local ${localTime(now)}`;
    if(activeTab!=='schedule')return;
    q('.wc-hero').innerHTML=`<span class="wc-eyebrow">${next.active?escapeHtml(next.phase):'NEXT UP'}</span><div class="wc-hero-body"><div><h2>${escapeHtml(next.name)}</h2><p>${escapeHtml(next.location)}</p></div><strong>${remaining(next.remaining)}</strong></div><p>${next.active?(next.entryOpen?'Entry closes':'Window ends'):'Starts'} · ${localTime(next.active?next.targetEnd:next.start)} local · ${serverTime(next.active?next.targetEnd:next.start)} server</p><progress max="100" value="${next.progress}" aria-label="${next.active?'Active window elapsed':'One-hour approach progress'}"></progress><small>${next.active?'Elapsed scheduled window':'Progress fills during the final hour before start'}</small>`;
    q('.wc-event-list').innerHTML=events.map(e=>`<article class="wc-event ${e.active?'active':''}"><div><span class="wc-eyebrow">${escapeHtml(e.phase)}</span><h3>${escapeHtml(e.name)}</h3><p>${escapeHtml(e.location)}</p><small>${e.active?'Next start':'Starts'} ${localTime(e.active?e.next:e.start)} local · ${e.basis==='utc'?'UTC schedule':'Server schedule'}${e.duration===0&&e.kind!=='reset'?' · End time unknown':''}</small></div><strong>${remaining(e.remaining)}</strong></article>`).join('');
  }
  // Render editable rules without saving.
  function renderEditor(){q('.wc-offset').value=state.offset;q('.wc-editor').innerHTML=state.events.map(e=>`<fieldset data-event="${e.id}"><legend>${escapeHtml(e.name)}</legend><label>Clock <select name="basis"><option value="server" ${e.basis==='server'?'selected':''}>Server</option><option value="utc" ${e.basis==='utc'?'selected':''}>UTC</option></select></label><label>Hours <input name="hours" value="${e.hours.join(',')}" required></label><label>Minute <input name="minute" type="number" min="0" max="59" value="${e.minute}" required></label><label>Days <input name="days" value="${e.days?.join(',')??''}" placeholder="Daily"></label><label>${e.kind==='rift'?'Entry window':'Window'} minutes <input name="duration" type="number" min="0" max="1440" value="${e.duration}" required></label>${['shugo','invasion'].includes(e.id)?`<label>Entry minutes (blank = unspecified) <input name="entryDuration" type="number" min="0" max="1440" value="${e.entryDuration??''}"></label>`:''}${e.kind==='rift'?`<label>Total active minutes <input name="activeDuration" type="number" min="0" max="1440" value="${e.activeDuration}" required></label>`:''}</fieldset>`).join('');}
  const abort=new AbortController(),on=(el,type,fn,opts={})=>el.addEventListener(type,fn,{...opts,signal:abort.signal});
  on(root,'click',async e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.tab){activeTab=b.dataset.tab;root.querySelectorAll('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==activeTab);root.querySelectorAll('[data-tab]').forEach(p=>p.classList.toggle('selected',p.dataset.tab===activeTab));renderSchedule();return;}
    const action=b.dataset.action;
    // Preview rules in the editor; Save schedule is the explicit apply action.
    if(action==='global-preset'){const saved=state.events;state.events=globalSchedule();renderEditor();state.events=saved;q('.wc-editor-status').textContent='Preset loaded for review. Save schedule to apply.';}
    if(action==='close'){await saveChain;await bridge.invokeMethodAsync('Close');}
    if(action==='start-fresh'&&confirm('Start fresh and replace unreadable settings? The original file will be retained as companion.json.bak on the first save.')){state=initialState();saveBlocked=false;unreadableSave=null;warning='';recovery.hidden=true;renderEditor();renderSchedule();save();}
    if(action==='export'||action==='export-original'){const blob=new Blob([action==='export-original'?unreadableSave:JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=action==='export-original'?'ratmeter-companion-original.json':'ratmeter-companion-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  });
  on(q('[data-action="drag"]'),'pointerdown',()=>bridge.invokeMethodAsync('Drag'));
  on(q('.wc-settings-form'),'submit',e=>{e.preventDefault();try{
    const offset=Number(q('.wc-offset').value);if(!Number.isFinite(offset)||offset < -12||offset>14)throw Error('UTC offset must be −12 to +14.');
    const events=state.events.map(ev=>{const f=q(`[data-event="${ev.id}"]`),v=n=>f.querySelector(`[name="${n}"]`).value;const next={...ev,basis:v('basis'),hours:v('hours').split(',').map(x=>x.trim()===''?NaN:Number(x)),minute:Number(v('minute')),duration:Number(v('duration'))};delete next.days;if(v('days').trim())next.days=v('days').split(',').map(x=>x.trim()===''?NaN:Number(x));if(['shugo','invasion'].includes(ev.id)){delete next.entryDuration;if(v('entryDuration')!=='')next.entryDuration=Number(v('entryDuration'));}if(ev.kind==='rift')next.activeDuration=Number(v('activeDuration'));return next;});
    validateEvents(events);state.events=events;state.offset=offset;save();renderSchedule();q('.wc-editor-status').textContent=saveBlocked?'Not saved: recover your settings file first.':'Schedule applied.';
  }catch(err){q('.wc-editor-status').textContent=err.message;}});
  on(q('.wc-import-file'),'change',async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>2000000)throw Error('Backup is too large.');const imported=validateState(JSON.parse(await file.text()));if(!confirm('Replace all companion settings with this backup?'))return;state=imported;saveBlocked=false;unreadableSave=null;warning='';recovery.hidden=true;renderEditor();save();}catch(err){status.textContent=`Import failed: ${err.message}`;}finally{e.target.value='';}});
  renderEditor();renderSchedule();
  const timer=setInterval(renderSchedule,1000);
  return {dispose(){disposed=true;clearInterval(timer);abort.abort();root.replaceChildren();}};
}
