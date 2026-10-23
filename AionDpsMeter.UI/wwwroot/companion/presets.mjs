import {defaults} from './schedule.mjs';
// Global rules: times and window lengths follow taengu/A2Tools-Plugins event-timers data at b11f345
// (see docs/TIMER-COMPARISON.md); no A2Tools code is used. Never mutate saved settings.
export function globalSchedule() {
  return structuredClone(defaults).map(e => {
    if (['daily','weekly'].includes(e.id)) Object.assign(e,{basis:'utc',hours:[7]});
    if (e.id==='kaira') e.basis='server';
    if (['kaira','nahma','executors','siege'].includes(e.id)) e.duration=0;
    if (e.id==='rift') Object.assign(e,{basis:'server',hours:[2,5,8,11,14,17,20,23],duration:10,activeDuration:10});
    if (e.id==='shugo') Object.assign(e,{duration:7,entryDuration:3});
    if (e.id==='invasion') Object.assign(e,{duration:13,entryDuration:3});
    return e;
  });
}
