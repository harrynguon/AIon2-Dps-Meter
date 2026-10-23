import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initialState,validateState} from '../AionDpsMeter.UI/wwwroot/companion/state.mjs';

const catalog=JSON.parse(await readFile(new URL('../AionDpsMeter.UI/wwwroot/companion/cubes.json',import.meta.url)));

test('valid saved progress survives validation without shared mutable references',()=>{
  const input=initialState();input.profiles[input.profile].verteron_A=true;
  const output=validateState(input,catalog);assert.deepEqual(output,input);
  output.profiles[output.profile].verteron_A=false;
  output.events[0].hours.push(23);
  assert.equal(input.profiles[input.profile].verteron_A,true);assert.ok(!input.events[0].hours.includes(23));
});

test('corrupt profile shapes cannot reach the cube UI',()=>{
  for(const progress of [null,[],42,'done',{'not-a-cube':true},{verteron_A:'true'}]){
    const input=initialState();input.profiles[input.profile]=progress;
    assert.throws(()=>validateState(input,catalog));
  }
  for(const change of [{profile:'missing'},{zone:'constructor'},{profiles:[]},{profiles:{}},{version:2},{offset:Infinity}]){
    assert.throws(()=>validateState({...initialState(),...change},catalog));
  }
});

test('reserved profile names and missing rift duration are rejected',()=>{
  for(const name of ['__proto__','constructor','prototype','', 'a'.repeat(101)]){
    const input=initialState();input.profile=name;input.profiles=JSON.parse(`{${JSON.stringify(name)}:{}}`);
    assert.throws(()=>validateState(input,catalog));
  }
  const input=initialState();delete input.events.find(e=>e.id==='rift').activeDuration;
  assert.throws(()=>validateState(input,catalog));
});

test('backup schedule values cannot change event identity or metadata',()=>{
  const input=initialState();input.events[0].name='arbitrary';input.events[0].kind='reset';input.events[0].hours=[4,1,1];input.unexpected={anything:true};
  const clean=validateState(input,catalog);
  assert.equal(clean.events[0].name,'Watcher Kaira');assert.equal(clean.events[0].kind,'boss');
  assert.deepEqual(clean.events[0].hours,[1,4]);assert.ok(!('unexpected' in clean));
});
