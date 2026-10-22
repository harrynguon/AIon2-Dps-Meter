import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {defaults,occurrence,timeline,validateEvents} from '../AionDpsMeter.UI/wwwroot/companion/schedule.mjs';
const at=s=>Date.parse(s),event=id=>defaults.find(e=>e.id===id);
test('UTC schedules do not move with the server clock',()=>{
  for(const offset of [-8,0,5.5,9,11])assert.equal(occurrence(event('kaira'),at('2026-10-23T00:59:59Z'),offset).start,at('2026-10-23T01:00:00Z'));
});
test('Friday Nahma uses Asia server date and rolls to Sunday after activity',()=>{
  assert.equal(occurrence(event('nahma'),at('2026-10-23T11:59:59Z'),9).start,at('2026-10-23T12:00:00Z'));
  assert.equal(occurrence(event('nahma'),at('2026-10-23T12:45:00Z'),9).start,at('2026-10-25T12:00:00Z'));
});
test('rift has exact entry and activity boundaries',()=>{
  assert.equal(occurrence(event('rift'),at('2026-10-23T00:00:00Z'),9).phase,'Portal open');
  assert.equal(occurrence(event('rift'),at('2026-10-23T00:09:59Z'),9).phase,'Portal open');
  assert.equal(occurrence(event('rift'),at('2026-10-23T00:10:00Z'),9).phase,'Active · entry closed');
  assert.equal(occurrence(event('rift'),at('2026-10-23T00:59:59Z'),9).active,true);
  assert.equal(occurrence(event('rift'),at('2026-10-23T01:00:00Z'),9).active,false);
  assert.equal(occurrence(event('rift'),at('2026-10-23T01:00:00Z'),9).start,at('2026-10-23T03:00:00Z'));
});
test('reset rolls across year and weekly boundary without fake active state',()=>{
  assert.equal(occurrence(event('daily'),at('2026-12-31T23:59:59Z'),9).start,at('2027-01-01T00:00:00Z'));
  assert.equal(occurrence(event('daily'),at('2027-01-01T00:00:00Z'),9).start,at('2027-01-02T00:00:00Z'));
  assert.equal(occurrence(event('weekly'),at('2026-10-28T00:00:00Z'),9).start,at('2026-11-04T00:00:00Z'));
});
test('fractional offset handles hourly schedule',()=>{
  assert.equal(occurrence(event('shugo'),at('2026-10-23T00:16:00Z'),5.5).start,at('2026-10-23T00:30:00Z'));
});
test('hero prioritizes scheduled activity and keeps simultaneous events',()=>{
  const all=timeline(defaults,at('2026-10-24T12:00:00Z'),9);
  assert.equal(all.length,9);assert.ok(all[0].active);assert.ok(all.find(e=>e.id==='siege').active);
  for(const e of all){assert.ok(e.remaining>=0);assert.ok(e.progress>=0&&e.progress<=100);}
});
test('invalid schedule edits are rejected',()=>{
  assert.doesNotThrow(()=>validateEvents(defaults));
  for(const change of [{hours:[]},{hours:[24]},{minute:60},{days:[7]},{duration:-1},{basis:'local'}]){
    const events=structuredClone(defaults);Object.assign(events[0],change);assert.throws(()=>validateEvents(events));
  }
  const events=structuredClone(defaults);events.find(e=>e.id==='rift').activeDuration=1;assert.throws(()=>validateEvents(events));
});
test('cube catalog is complete with unique IDs and usable coordinates',async()=>{
  const data=JSON.parse(await readFile(new URL('../AionDpsMeter.UI/wwwroot/companion/cubes.json',import.meta.url)));
  assert.equal(data.zones.verteron.groups.length,95);assert.equal(data.zones.altgard.groups.length,59);
  const ids=new Set();let count=0;
  for(const zone of Object.values(data.zones))for(const group of zone.groups){
    assert.ok(!ids.has(group.id));ids.add(group.id);
    for(const p of [group,...group.spots]){assert.ok(p.x>=0&&p.x<=100);assert.ok(p.y>=0&&p.y<=100);}
    count+=group.spots.length;
  }
  assert.equal(count,2811);
});
