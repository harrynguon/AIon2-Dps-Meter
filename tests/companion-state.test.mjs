import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaults} from '../AionDpsMeter.Companion/wwwroot/schedule.mjs';
import {initialState,validateState} from '../AionDpsMeter.Companion/wwwroot/state.mjs';

test('timer-only state survives validation without shared mutable references',()=>{
  const input=initialState();
  const output=validateState(input);assert.deepEqual(output,input);assert.equal(output.version,2);
  output.events[0].hours.push(23);assert.ok(!input.events[0].hours.includes(23));
});

// Cube-era (version 1) saves keep their timer rules; retired cube fields are dropped, not validated.
test('cube-era saves migrate with legacy custom schedules intact',()=>{
  const old={version:1,offset:9,profile:'Example',zone:'verteron',profiles:{Example:{verteron_A:true}},events:structuredClone(defaults)};
  old.events.find(e=>e.id==='daily').hours=[18];
  const clean=validateState(old);
  assert.deepEqual(clean,{version:2,offset:9,events:old.events.map(e=>({...e}))});
  assert.equal(clean.events.find(e=>e.id==='daily').hours[0],18);
  // Retired fields are not inspected, so old or corrupt cube progress cannot block the timers.
  assert.equal(validateState({...old,profiles:null,zone:'unknown'}).version,2);
});

test('malformed state is rejected for fail-closed recovery',()=>{
  for(const change of [{version:0},{version:3},{version:'2'},{offset:Infinity},{offset:-13},{offset:15},{events:null}])
    assert.throws(()=>validateState({...initialState(),...change}));
  assert.throws(()=>validateState(null));
  const input=initialState();delete input.events.find(e=>e.id==='rift').activeDuration;
  assert.throws(()=>validateState(input));
});

test('backup schedule values cannot change event identity or metadata',()=>{
  const input=initialState();input.events[0].name='arbitrary';input.events[0].kind='reset';input.events[0].hours=[4,1,1];input.unexpected={anything:true};
  const clean=validateState(input);
  assert.equal(clean.events[0].name,'Watcher Kaira');assert.equal(clean.events[0].kind,'boss');
  assert.deepEqual(clean.events[0].hours,[1,4]);assert.ok(!('unexpected' in clean));
});
