import test from 'node:test';
import assert from 'node:assert/strict';
import {createPresentationRecovery133,duelRequest133} from '../public/game/src/online-recovery133.mjs';

function timers(){const pending=new Set();return{setTimer(fn){pending.add(fn);return fn;},clearTimer(fn){pending.delete(fn);},fire(){for(const fn of[...pending]){pending.delete(fn);fn();}},get size(){return pending.size;}};}
test('failed round painting forces a full snapshot; a successful retry restores controls',async()=>{
 let cancelled=0;const clock=timers(),view=createPresentationRecovery133({...clock,cancel:()=>cancelled++});
 assert.equal(view.needsSnapshot,true);await view.run(async()=>{});assert.equal(view.needsSnapshot,false);
 await assert.rejects(view.run(async()=>{throw Error('Texture unavailable');}),/Texture unavailable/);
 assert.equal(view.needsSnapshot,true);assert.equal(cancelled,1);assert.equal(clock.size,0);
 await view.run(async()=>{});assert.equal(view.needsSnapshot,false);
});
test('a stuck final-card animation releases the transition and cannot paint over the recovered round',async()=>{
 const clock=timers();let release,stalePainted=false;const view=createPresentationRecovery133({...clock});
 const stalled=view.run(async check=>{await new Promise(resolve=>release=resolve);check();stalePainted=true;});
 await Promise.resolve();const rejected=assert.rejects(stalled,/Restoring your saved duel/);clock.fire();await rejected;
 assert.equal(view.needsSnapshot,true);await view.run(async()=>{});release();await Promise.resolve();await Promise.resolve();
 assert.equal(stalePainted,false);assert.equal(view.needsSnapshot,false);assert.equal(clock.size,0);
});
test('stalled network and stalled response bodies abort instead of blocking all further polls',async()=>{
 for(const bodyStalls of[false,true]){
  const clock=timers();let signal;const request=duelRequest133(async(_url,options)=>{signal=options.signal;return bodyStalls?{ok:true,json:()=>new Promise(()=>{})}:new Promise(()=>{});},'/api/duel',{},clock);
  const rejected=assert.rejects(request,/Connection interrupted/);await Promise.resolve();clock.fire();await rejected;
  assert.equal(signal.aborted,true);assert.equal(clock.size,0);
 }
 assert.deepEqual(await duelRequest133(async()=>Response.json({round:2}),'/api/duel',{}),{round:2});
 await assert.rejects(duelRequest133(async()=>Response.json({error:'Changed'},{status:409}),'/api/duel',{}),e=>e.status===409);
});
