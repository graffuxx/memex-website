import test from 'node:test';
import assert from 'node:assert/strict';
import {roundIntro,roundOutcome,createRoundGate} from '../public/game/src/round-presentation42.mjs';
import {bindRoundCeremony} from '../public/game/src/round-ceremony42.mjs';
import {createTurnClock} from '../public/game/src/turn-clock.mjs';

test('first to two counts round wins, never the summed cards; draws keep the duel open',()=>{
 assert.equal(roundOutcome({score:[12,6]}).kind,'victory');assert.equal(roundOutcome({score:[12,6],viewer:1}).kind,'defeat');assert.equal(roundOutcome({score:[9,9]}).kind,'draw');
 const split=roundOutcome({round:2,score:[11,7],results:[[4,14],[11,7]]});assert.equal(split.kind,'victory');assert.equal(split.label,'ROUND 2 COMPLETE');assert.equal(split.next,'Next round');
 const final=roundOutcome({round:3,score:[10,8],results:[[4,14],[11,7],[10,8]]});assert.equal(final.kind,'victory');assert.deepEqual([final.own,final.enemy],[2,1]);assert.equal(final.label,'DUEL COMPLETE');assert.equal(roundOutcome({round:3,score:[10,8],results:[[4,14],[11,7],[10,8]],viewer:1}).kind,'defeat');
 const draws=roundOutcome({round:3,score:[9,9],results:[[9,9],[10,8],[9,9]]});assert.equal(draws.kind,'draw');assert.equal(draws.next,'Next round');
 assert.equal(roundIntro({round:3,starter:1}).voice,'rematch');assert.match(roundIntro({starter:0}).detail,/Du beginnst/);
 assert.equal(roundOutcome({forfeit:0,rated:true,results:[],score:[0,0]}).kind,'defeat');assert.equal(roundOutcome({forfeit:0,rated:false,results:[],score:[0,0]}).title,'FRIENDLY DUEL ENDED');
});
test('round events cannot double-fire or accept a stale end after reset',()=>{
 const gate=createRoundGate();assert.equal(gate.finish(1),false);assert.equal(gate.begin(1),true);assert.equal(gate.begin(1),false);assert.equal(gate.finish(1),true);assert.equal(gate.finish(1),false);gate.begin(2);assert.equal(gate.finish(1),false);gate.cancel();assert.equal(gate.finish(2),false);
});
function fixture(){
 const nodes=new Map(),root={hidden:true,dataset:{},querySelector(selector){if(!nodes.has(selector))nodes.set(selector,{hidden:false,textContent:'',focus(){}});return nodes.get(selector);}};
 const node=id=>root.querySelector(`[data-round="${id}"]`),voices=[],audio={cancelAnnouncements(){},say:k=>voices.push(k),play(){}};
 let callback=null,continueAllowed=false;globalThis.document={activeElement:null};
 const controller=bindRoundCeremony(root,{audio,onContinue:()=>continueAllowed,setTimer:fn=>(callback=fn,1),clearTimer:()=>callback=null});
 return {controller,node,voices,root,fire:()=>callback?.(),allow:()=>continueAllowed=true};
}
test('intro pauses the turn clock; skip/cancel resolve safely and replay starts a new intro',async()=>{
 const f=fixture();let now=0;const clock=createTurnClock({now:()=>now});clock.enter('round1');
 const intro=f.controller.intro(1,{round:1,starter:0});now=3000;assert.equal(clock.snapshot().seconds,90);assert.equal(f.root.hidden,false);assert.deepEqual(f.voices,['intro']);
 f.node('skip').onclick();assert.equal(await intro,true);clock.resume();now+=1000;assert.equal(clock.snapshot().seconds,89);
 assert.equal(await f.controller.intro(1,{round:1}),false);const next=f.controller.intro(2,{round:2,starter:1});f.controller.cancel();assert.equal(await next,false);assert.equal(f.root.hidden,true);assert.equal(f.controller.finish(2,{score:[10,8]}),false);
});
test('result waits for an allowed continuation and dismissed results never replay',async()=>{
 const f=fixture(),intro=f.controller.intro(1,{round:1});f.fire();await intro;
 assert.equal(f.controller.finish(1,{score:[10,8]}),true);assert.equal(f.node('title').textContent,'VICTORY');assert.equal(f.node('continue').textContent,'Next round');
 f.node('continue').onclick();assert.equal(f.root.hidden,false);f.allow();f.node('continue').onclick();assert.equal(f.root.hidden,true);assert.equal(f.controller.finish(1,{score:[10,8]}),false);assert.deepEqual(f.voices,['intro','victory']);
});
test('the result callout leaves the arena automatically without replaying its voice',async()=>{
 const f=fixture(),intro=f.controller.intro(1,{round:1});f.fire();await intro;
 f.controller.finish(1,{score:[8,10]});assert.equal(f.root.hidden,false);assert.equal(f.node('title').textContent,'DEFEAT');
 f.fire();assert.equal(f.root.hidden,true);assert.deepEqual(f.voices,['intro','defeat']);assert.equal(f.controller.finish(1,{score:[8,10]}),false);
});
