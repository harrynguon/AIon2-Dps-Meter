// Schedule calculations are independent of the display and computer time zone.
// Defaults reproduce the selected Byanski schedule, NOT a verified Global timetable.
export const defaults = [
  {id:'kaira',name:'Watcher Kaira',location:'Abandoned Island · Chaotic Lower Reshanta',kind:'boss',basis:'utc',hours:[1,4,7,10,13,16,19,22],minute:0,duration:30},
  {id:'nahma',name:'Guardian Lord Nahma',location:"Reshanta’s Root",kind:'boss',basis:'server',days:[0,5],hours:[21],minute:0,duration:45},
  {id:'executors',name:'Executors · Tamasa & Argo',location:"Reshanta’s Root & Siel’s Heart",kind:'boss',basis:'server',days:[1,4,6],hours:[21],minute:30,duration:30},
  {id:'rift',name:'Spacetime Rift',location:'Contested zones & enemy territory',kind:'rift',basis:'utc',hours:[0,3,6,9,12,15,18,21],minute:0,duration:10,activeDuration:60},
  {id:'siege',name:'Artifact Siege',location:'Reshanta artifact outposts',kind:'event',basis:'server',days:[1,4,6],hours:[21],minute:0,duration:45},
  {id:'invasion',name:'Dimensional Invasion',location:'Borderlands',kind:'event',basis:'server',hours:Array.from({length:24},(_,i)=>i),minute:30,duration:15},
  {id:'shugo',name:'Shugo Festival',location:'Shugo Pavilion · Jump Jump, Hidden Lugi, Goldrin',kind:'event',basis:'server',hours:Array.from({length:24},(_,i)=>i),minute:0,duration:15},
  {id:'daily',name:'Daily reset',location:'Daily quests, missions & entries',kind:'reset',basis:'server',hours:[9],minute:0,duration:0},
  {id:'weekly',name:'Weekly reset',location:'Wednesday · Abyss rank tally',kind:'reset',basis:'server',days:[3],hours:[9],minute:0,duration:0}
];

// Validate editable rules at import and save boundaries.
export function validateEvents(events) {
  if (!Array.isArray(events) || events.length !== defaults.length) throw Error('Keep all nine schedule entries.');
  const ids = new Set();
  for (const e of events) {
    if (!defaults.some(d=>d.id===e.id) || ids.has(e.id)) throw Error('Invalid or duplicate event.');
    ids.add(e.id);
    if (!['utc','server'].includes(e.basis)) throw Error('Choose UTC or server time.');
    if (!Array.isArray(e.hours) || !e.hours.length || e.hours.some(h=>!Number.isInteger(h)||h<0||h>23)) throw Error('Hours must be 0–23.');
    if (e.days && (!Array.isArray(e.days)||!e.days.length||e.days.some(d=>!Number.isInteger(d)||d<0||d>6))) throw Error('Days must be 0–6 (Sunday–Saturday).');
    if (!Number.isInteger(e.minute)||e.minute<0||e.minute>59) throw Error('Minutes must be 0–59.');
    if (!Number.isFinite(e.duration)||e.duration<0||e.duration>1440) throw Error('Duration must be 0–1440 minutes.');
    if (e.entryDuration !== undefined && (!Number.isFinite(e.entryDuration)||e.entryDuration<0||e.entryDuration>e.duration)) throw Error('Entry duration must be between zero and total duration.');
    if (e.activeDuration !== undefined && (!Number.isFinite(e.activeDuration)||e.activeDuration<e.duration||e.activeDuration>1440)) throw Error('Active duration must be at least the entry window, at most 1440 minutes.');
  }
  return events;
}

// Resolve the current phase and next start independently of the PC timezone.
export function occurrence(event, now=Date.now(), serverOffset=9) {
  const shift = event.basis==='utc' ? 0 : serverOffset*3600000;
  const ref = new Date(now+shift);
  const candidates=[];
  for (let day=-8;day<=8;day++) {
    const midnight=Date.UTC(ref.getUTCFullYear(),ref.getUTCMonth(),ref.getUTCDate()+day);
    if(event.days && !event.days.includes(new Date(midnight).getUTCDay())) continue;
    for(const hour of event.hours) candidates.push(midnight+hour*3600000+event.minute*60000-shift);
  }
  candidates.sort((a,b)=>a-b);
  const previous=candidates.filter(t=>t<=now).at(-1);
  const next=candidates.find(t=>t>now);
  const end=previous+(event.activeDuration??event.duration)*60000;
  const active=previous!==undefined && now<end;
  const entryMinutes=event.entryDuration ?? (event.kind==='rift'?event.duration:undefined);
  const entryEnd=entryMinutes===undefined?undefined:previous+entryMinutes*60000;
  const entryOpen=active && entryEnd!==undefined && now<entryEnd;
  const phase=active ? (entryEnd!==undefined ? (entryOpen ? (event.kind==='rift'?'Portal open':'Entry open') : 'Active · entry closed') : 'Scheduled active') : 'Upcoming';
  const target=active?(entryOpen?entryEnd:end):next;
  return {...event,phase,active,start:active?previous:next,next,end,targetEnd:target,entryOpen,remaining:target-now,
    progress:active?Math.min(100,(now-previous)/(target-previous)*100):Math.max(0,Math.min(100,(1-(next-now)/3600000)*100))};
}

// Retain simultaneous events and prioritize scheduled activity.
export function timeline(events,now,offset) {
  return events.map(e=>occurrence(e,now,offset)).sort((a,b)=>Number(b.active)-Number(a.active)||a.remaining-b.remaining||a.id.localeCompare(b.id));
}
