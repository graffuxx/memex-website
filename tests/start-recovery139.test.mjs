import test from 'node:test';
import assert from 'node:assert/strict';
import {sessionDeadline139,createPollRecovery139} from '../public/game/src/start-recovery139.mjs';

test('stalled sign-in refresh releases the UI and a late result cannot submit a move',async()=>{
 let expire,resolve,submitted=false,cleared=0;
 const pending=sessionDeadline139(()=>new Promise(done=>{resolve=done;}),{setTimer(fn){expire=fn;return fn;},clearTimer(){cleared++;}}).then(()=>{submitted=true;});
 await Promise.resolve();const rejected=assert.rejects(pending,/Sign-in connection interrupted/);
 expire();await rejected;resolve({data:{session:{}}});await Promise.resolve();await Promise.resolve();
 assert.equal(submitted,false);assert.equal(cleared,1);
 assert.deepEqual(await sessionDeadline139(async()=>({data:{session:{id:'same-player'}}})),{data:{session:{id:'same-player'}}});
});

test('repeated storage failures back off instead of hammering Supabase, and recovery resets immediately',()=>{
 let now=0;const recovery=createPollRecovery139({now:()=>now});
 assert.equal(recovery.ready,true);
 for(const delay of [1800,3600,7200,14400,15000,15000]){
  recovery.failed(Error('Connection temporarily unavailable'));assert.equal(recovery.message,'Connection temporarily unavailable');assert.equal(recovery.ready,false);
  now+=delay-1;assert.equal(recovery.ready,false);now++;assert.equal(recovery.ready,true);
 }
 recovery.failed(Error('Retry'));recovery.reset();assert.equal(recovery.ready,true);assert.equal(recovery.message,'');
});
