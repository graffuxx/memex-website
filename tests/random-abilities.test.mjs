import test from 'node:test';
import assert from 'node:assert/strict';
import {random96,armBot96,stepBot96} from '../server/game/bot96.mjs';
import {determinize135,searchIsmcts135} from '../server/game/ismcts135.mjs';
import {createPvp90,advancePvp90,projectPvp90} from '../server/game/pvp90.mjs';
import {starterDeck,DEFINITIONS,countCards,validateDeck} from '../public/game/platform/catalog.mjs';
import {portalTrialAbility} from '../public/game/platform/deck-bridge.mjs';
import {preferredDrawIndex,placeEffect} from '../public/game/src/table-demo-rules.mjs';
import {legalCandidates} from '../public/game/src/tactics-ai.mjs';

const rules={elementalTrial:true,iconicAbilities:true,iconicAbilityWave:7,allPrimes:true,finalGuard:true,randomAbilities:true};
const base=starterDeck().slice(0,12);
const testDecks=[
 {cards:['two-buttons:common','is-this-a-pigeon:common','sparta-kick:common',...base]},
 {cards:['two-buttons:common','double-rainbow:common','evil-ernie:common',...base]}
];
function open(seed,starter,decks=testDecks){
 const state=createPvp90(decks,seed,0,rules);
 return advancePvp90({...state,phase:'initiative',rpsWinner:0},0,{kind:'starter',side:starter},0);
}
function prepared(starter,actor){
 for(let seed=1;seed<=100;seed++){
  let state=open(seed,starter);
  if(starter!==actor){
   const first=legalCandidates(state.game).find(c=>c.plan.card.ability!=='buttons');
   if(!first)continue;
   state=advancePvp90(state,starter,{kind:'place',action:first.action},1);
  }
  const choice=legalCandidates(state.game).find(c=>c.plan.ability==='buttons');
  if(choice)return {state,choice};
 }
 assert.fail('No legal Two Buttons fixture.');
}
for(const starter of [0,1]){
 test('Random search samples the enabled Element, Iconic and Prime rules from starter '+starter,()=>{
  const roster=DEFINITIONS.filter(c=>c.iconic||c.prime);
  const regular=DEFINITIONS.filter(c=>!c.iconic&&!c.prime&&!c.quest);
  const allElements=[...new Map(regular.map(c=>[c.element,c.id+':common'])).values()];
  const base=[...new Set([...allElements,...starterDeck()])].slice(0,14);
  const known=new Set(),hidden=new Set();
  for(const [index,special] of roster.entries()){
   const own=[special.id+':common',...base];
   assert.ok(validateDeck(own,countCards(own)).valid);
   const decks=[testDecks[0],{cards:own}],s=open(13+index,starter,decks);
   const s0=s.game;
   const sampled=determinize135(s0,{observer:1,ownDeck:own,random:random96(index*17+198)});
   assert.deepEqual(sampled.players[1].hand,s0.players[1].hand);
   assert.ok(sampled.finalGuard);
   for(const side of [0,1])for(const c of [...sampled.players[side].hand,...sampled.players[side].deck]){
    assert.equal(c.ability??null,portalTrialAbility(s0,c),c.variantId);
    (side===1?known:hidden).add(c.ability);
   }
  }
  assert.equal(known.size,50);
  assert.ok(hidden.size>=25);
  const {state,choice}=prepared(starter,1);
  const result=searchIsmcts135(state.game,{observer:1,ownDeck:state.decks[1].cards,random:random96(93),limits:{iterations:12,maxMs:1000},now:()=>0});
  assert.equal(result.reason,'search');assert.equal(result.simulations,12);
  const played=placeEffect(state.game,choice.action,{chooseDraw:true});
  assert.ok(played.pendingDraw);
 });
 test('Two Buttons hands off bot and human draws from starter '+starter,()=>{
  const row={id:'test',host_id:'a',guest_id:null,identities:[{},{}],kind:'random',status:'matched',ai_opponent96:{isAi:true}};
  for(const actor of [0,1]){
   const {state,choice}=prepared(starter,actor);
   let s=advancePvp90(state,actor,{kind:'place',action:choice.action},2);
   assert.deepEqual(s.game.pendingDraw,{side:actor});
   assert.equal(s.game.turn,actor);
   const n=s.game.placements,oldBoard=s.game.board,options=s.game.players[actor].deck.slice(0,2);
   const publicState=projectPvp90({...row,state:s},'a',3);
   assert.deepEqual(Object.keys(publicState.game.pendingDraw).sort(),actor===0?['options','side']:['side']);
   assert.ok(publicState.game.players[1].deck.every(c=>c.hidden&&!c.variantId));
   if(actor===1){
    s=armBot96({...s,bot96:{seed:505,nextAt:null}},3);
    assert.ok(s.bot96.nextAt<s.deadline);
    assert.equal(stepBot96(s,s.bot96.nextAt-1),null);
    s=stepBot96(s,s.bot96.nextAt);
   }else{
    assert.throws(()=>advancePvp90(s,1,{kind:'draw',index:0},3),/not your turn/i);
    s=advancePvp90(s,0,{kind:'draw',index:preferredDrawIndex(options)},3);
   }
   assert.equal(s.step.kind,'draw');
   assert.equal(s.game.pendingDraw,undefined);
   assert.equal(s.game.turn,1-actor);
   assert.equal(s.game.placements,n);
   assert.deepEqual(s.game.board,oldBoard);
   assert.equal(s.game.players[actor].hand.at(-1).uid,options[preferredDrawIndex(options)].uid);
  }
 });
}
