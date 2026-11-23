import test from 'node:test';import assert from 'node:assert/strict';
import {createPvp90,advancePvp90,expirePvp90,refreshPvpRules129,projectPvp90} from '../server/game/pvp90.mjs';
import {starterDeck,DEFINITIONS,VARIANTS,expandGameDeck} from '../public/game/platform/catalog.mjs';
import {chooseTactic} from '../public/game/src/tactics-ai.mjs';
import {createTacticsMatch} from '../public/game/src/table-demo-state.mjs';
import {eventFields,previewEffect} from '../public/game/src/table-demo-rules.mjs';
import {fieldFeedback129} from '../public/game/src/field-feedback129.mjs';
import {fieldAt,cardOf} from '../public/game/src/rules.mjs';
import {seriesHud129} from '../public/game/src/duel-hud129.mjs';
import {createTurnClock} from '../public/game/src/turn-clock.mjs';
import {bindRoundCeremony} from '../public/game/src/round-ceremony42.mjs';
const deck={name:'Test',cards:starterDeck()};
function opening(seed=42){let s=createPvp90([deck,deck],seed,0);for(const [side,input]of [[0,{kind:'gesture',value:'rock'}],[1,{kind:'gesture',value:'scissors'}],[0,{kind:'starter',side:0}]])s=advancePvp90(s,side,input,0);return s;}
const play=(s,now)=>advancePvp90(s,s.game.turn,{kind:'place',action:chooseTactic(s.game).chosen.action},now);
test('two own missed turns shorten only the idle player to three seconds; a legal card restores ninety',()=>{
 let s=opening();s=expirePvp90(s,s.deadline);assert.deepEqual(s.afkStreak129,[1,0]);s=play(s,s.deadline-1);s=expirePvp90(s,s.deadline);assert.deepEqual(s.afkStreak129,[2,0]);const t=s.deadline-1;s=play(s,t);assert.equal(s.game.turn,0);assert.equal(s.deadline,t+3000);assert.equal(expirePvp90(s,t+2999),null);
 const before=structuredClone(s);s=play(s,t+1000);assert.deepEqual(before.afkStreak129,[2,0]);assert.deepEqual(s.afkStreak129,[0,0]);assert.equal(s.deadline,t+91000);s=play(s,t+2000);assert.equal(s.deadline,t+92000);
 const row={id:'x',host_id:'a',guest_id:'b',state:{...s,afkStreak129:[2,1]},identities:[{},{}],kind:'private',version:2,status:'matched'};assert.deepEqual(projectPvp90(row,'b',t).afkStreak,[1,2]);
});
test('server deadlines start the next round once without either ready flag; reconnect cannot skip a round or extend it',()=>{
 let s=opening(7);while(!s.game.finished)s=play(s,100);assert.equal(s.phase,'between');assert.deepEqual(s.ready,[false,false]);assert.equal(s.deadline,8100);assert.equal(expirePvp90(s,8099),null);
 const next=expirePvp90(s,8100);assert.equal(next.round,2);assert.equal(next.phase,'play');assert.equal(next.game.placements,0);assert.equal(next.game.starter,1);assert.equal(next.deadline,98100);assert.equal(expirePvp90(next,8100),null);
 const legacy={...s,deadline:null,game:{...s.game,eventFieldsEnabled:undefined}};const restored=refreshPvpRules129(legacy,20000);assert.equal(restored.deadline,28000);assert.equal(restored.game.eventFieldsEnabled,false);assert.equal(refreshPvpRules129(restored,21000),null);assert.equal(legacy.deadline,null);
 const ended={...s,phase:'ended',deadline:null};assert.equal(expirePvp90(ended,999999),null);
});
test('normal matches have no event fields, changing stats or field rotations; dormant field feedback still matches the rule engine',()=>{
 const s=opening();assert.deepEqual(eventFields(s.game),[]);assert.equal(fieldAt({...s.game,events:[{cell:'0,0',element:'fire'}]},'0,0'),null);
 const g=createTacticsMatch({seed:11,eventFieldsEnabled:true}),card=g.players[0].hand[0];g.demoFields=[{cell:'0,0',type:'crossfire',directions:[0,3]}];assert.deepEqual(fieldFeedback129(g,card,'0,0').bonuses,[1,0,0,1,0,0]);g.eventFieldsEnabled=false;assert.deepEqual(fieldFeedback129(g,card,'0,0').bonuses,[0,0,0,0,0,0]);g.eventFieldsEnabled=true;g.demoFields=[{cell:'0,0',type:'resonance',element:'fire'}];const prime=DEFINITIONS.find(c=>c.prime&&c.element==='fire'),fire=expandGameDeck([prime.id+':common'],0)[0];assert.equal(fieldFeedback129(g,fire,'0,0').bonuses[cardOf(fire).values.indexOf(10)],0);
});
test('round HUD separates controlled cards from round wins and completed rounds',()=>{assert.deepEqual(seriesHud129(4,[[9,9],[12,6],[6,12]]),{round:4,played:3,wins:[1,1],draws:1,finished:false});assert.equal(seriesHud129(3,[[13,5],[10,8]]).finished,true);});
test('the local three-second clock cannot be extended by repeated render/enter calls',()=>{let now=0;const c=createTurnClock({now:()=>now});c.enter('t1',{durationMs:3000});c.resume();now=1000;c.enter('t1',{durationMs:90000});assert.equal(c.snapshot().remainingMs,2000);assert.ok(Math.abs(c.snapshot().fraction-2/3)<1e-6);now=3000;assert.equal(c.snapshot().expired,true);c.enter('t2');assert.equal(c.snapshot().remainingMs,90000);});
test('result dismissal does not stop auto-continuation, but starting a new round cancels a stale transition',async()=>{
 globalThis.document={activeElement:null};const nodes=new Map(),root={hidden:true,dataset:{},querySelector(s){if(!nodes.has(s))nodes.set(s,{focus(){},hidden:false,textContent:''});return nodes.get(s);}};let n=0,continued=0;const timers=new Map(),ceremony=bindRoundCeremony(root,{audio:{say(){},play(){},cancelAnnouncements(){}},onContinue:()=>{continued++;return true;},setTimer:fn=>{timers.set(++n,fn);return n;},clearTimer:id=>timers.delete(id)});
 ceremony.restore('r1');ceremony.finish('r1',{score:[10,8],autoContinueMs:8000});ceremony.dismiss();assert.equal(root.hidden,true);for(const [id,fn]of [...timers]){timers.delete(id);fn();}assert.equal(continued,1);
 ceremony.restore('r2');ceremony.finish('r2',{score:[8,10],autoContinueMs:5000});const intro=ceremony.intro('r3',{round:3});assert.equal(timers.size,1);ceremony.cancel();await intro;assert.equal(timers.size,0);assert.equal(continued,1);
});
test('Let Him Cook keeps the existing motif ID, fire element and all five cosmetic finishes',()=>{const c=DEFINITIONS.find(c=>c.id==='salt-bae');assert.equal(c.name,'Let Him Cook');assert.equal(c.element,'fire');assert.deepEqual(c.values,[7,2,4,3,4,4]);const variants=VARIANTS.filter(v=>v.definitionId===c.id);assert.equal(variants.length,5);assert.ok(variants.every(v=>v.image.startsWith('/game/assets/cards/replacements-v129/let-him-cook.webp?finish=')));});
