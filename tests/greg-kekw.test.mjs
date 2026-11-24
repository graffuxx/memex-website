import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFINITIONS,starterDeck,expandGameDeck} from '../public/game/platform/catalog.mjs';
import {newGame,moveTargets,sideValue,freeCells} from '../public/game/src/rules.mjs';
import {placeEffect,previewEffect,standardAbility,releasedIconicAbility,sidestepTargets,laughActive} from '../public/game/src/table-demo-rules.mjs';
import {createTableAudio} from '../public/game/src/table-audio.mjs';
import {fieldFeedback129} from '../public/game/src/field-feedback129.mjs';
import {legalCandidates,positionalValue} from '../public/game/src/tactics-ai.mjs';
import {abilityBursts,abilityMarkers,abilityMarkerGeometry} from '../public/game/src/ability-effects.mjs';
import {advancePvp90,createPvp90,expirePvp90,projectPvp90} from '../server/game/pvp90.mjs';

const makeCard=(variant,seat,ability)=>({...expandGameDeck([variant],seat)[0],uid:seat+':'+variant,ability});
function trial(){
 const game=newGame({seed:13});
 Object.assign(game,{block:'-2,2',board:{},abilityTrial:true,eventFieldsEnabled:false,rotationLocked:true});
 game.players[0].hand=[];game.players[0].deck=[];
 game.players[1].hand=[];game.players[1].deck=[];
 return game;
}
for(const seat of [0,1]){
 test(`Greg can move an existing Regular exactly one step alongside a capture for starter ${seat}`,()=>{
  const game=trial(),other=1-seat,greg=makeCard('good-guy-greg:common',seat,'sidestep');
  game.turn=seat;game.starter=seat;game.elementalTrial=true;
  const ally={...makeCard('roll-safe:common',seat,'earth'),controller:seat,rotation:2};
  game.board['1,0']=ally;
  game.players[seat].hand=[greg];
  const action={uid:greg.uid,cell:'0,0',rotation:0};
  assert.ok(sidestepTargets(game,action.cell).some(([from,to])=>from==='1,0'&&to==='0,1'));
  assert.ok(legalCandidates(game).some(({action:a})=>a.cell==='0,0'&&a.stepCells?.[1]==='0,1'));
  assert.throws(()=>previewEffect(game,{...action,stepCells:['1,0','0,-1']}),/Platz machen/);
  const initial=structuredClone(game);
  const moved=placeEffect(game,{...action,stepCells:['1,0','0,1']});
  assert.deepEqual(game,initial);
  assert.equal(moved.board['1,0'],undefined);
  assert.deepEqual(moved.board['0,1'],ally);
  assert.deepEqual(moved.last.flips,[]);
  assert.deepEqual(moved.last.relocation,{from:'1,0',to:'0,1',uid:ally.uid});
  assert.equal(freeCells(moved).length,freeCells(initial).length-1);
  assert.equal(moved.turn,other);
  game.board['-1,0']={...makeCard('bad-luck-brian:common',other),controller:other,rotation:0};
  assert.deepEqual(previewEffect(game,action).flips,['-1,0']);
  assert.throws(()=>previewEffect(game,{...action,stepCells:['-1,0','-1,1']}),/Platz machen/);
  const captureAndMove=placeEffect(game,{...action,stepCells:['1,0','0,1']});
  assert.deepEqual(captureAndMove.last.flips,['-1,0']);
  assert.equal(captureAndMove.board['-1,0'].controller,seat);
  assert.deepEqual(captureAndMove.board['0,1'],ally);
 });

 test(`KEKW holds against an element tie for one reply, but can lose to a higher edge or S for starter ${seat}`,()=>{
  const game=trial(),other=1-seat,kekw=makeCard('kekw:common',seat,'laugh');
  game.turn=seat;game.starter=seat;game.elementalTrial=true;game.elementRules=5;
  const seal=makeCard('spinning-seal:common',other,'air');
  const nyan=makeCard('nyan-cat:common',other,'air');
  const prime=makeCard('numa-numa:common',other);
  game.players[seat].hand=[kekw];game.players[other].hand=[seal,nyan,prime];
  const seen=placeEffect(game,{uid:kekw.uid,cell:'0,0'});
  const action=uid=>({uid,cell:'1,0',rotation:0});
  assert.equal(laughActive(seen,seen.board['0,0'],'0,0'),true);
  const comparison=previewEffect(seen,action(seal.uid)).comparisons[0];
  assert.equal(comparison.attack.total,3);
  assert.equal(comparison.defend.total,3);
  assert.equal(comparison.tieProtected,true);
  assert.equal(comparison.flip,false);
  assert.deepEqual(previewEffect({...seen,placements:2},action(seal.uid)).flips,['0,0']);
  assert.ok(previewEffect(seen,action(nyan.uid)).flips.includes('0,0'));
  assert.ok(previewEffect(seen,action(prime.uid)).flips.includes('0,0'));
  const resolved=placeEffect(seen,action(seal.uid));
  assert.equal(laughActive(resolved,resolved.board['0,0'],'0,0'),false);
  assert.deepEqual(resolved.last.tieBlocks,[{cell:'0,0',dir:0}]);
  assert.ok(abilityBursts(resolved).some(marker=>marker.kind==='laugh'&&marker.label==='='));
  const state={...createPvp90([{cards:starterDeck()},{cards:starterDeck()}],7),game:seen};
  const guest=projectPvp90({id:'trial',kind:'private',host_id:'host',guest_id:'guest',identities:[{},{}],state},'guest');
  assert.equal(guest.game.board['0,0'].laughOwner,other);
  assert.equal(laughActive(guest.game,guest.game.board['0,0'],'0,0'),true);
 });
}


test('Greg and KEKW are the only released Iconic powers and start in newly opted-in private matches',()=>{
 const deck=[...starterDeck().slice(0,12),'good-guy-greg:epic','kekw:mythic','evil-ernie:rare'];
 const decks=[{cards:deck},{cards:deck}];
 for(const flags of [{elementalTrial:true,iconicAbilities:true},{elementalTrial:true},{}]){
  let state=createPvp90(decks,9,1,flags);
  state=advancePvp90(state,0,{kind:'gesture',value:'rock'},2);
  state=advancePvp90(state,1,{kind:'gesture',value:'scissors'},3);
  state=advancePvp90(state,0,{kind:'starter',side:0},4);
  for(const player of state.game.players){
   const assigned=[...player.hand,...player.deck];
   assert.equal(assigned.find(c=>c.variantId==='good-guy-greg:epic').ability,flags.iconicAbilities?'sidestep':undefined);
   assert.equal(assigned.find(c=>c.variantId==='kekw:mythic').ability,flags.iconicAbilities?'laugh':undefined);
   assert.equal(assigned.find(c=>c.variantId==='evil-ernie:rare').ability,undefined);
  }
 }
 const released=DEFINITIONS.filter(d=>releasedIconicAbility(makeCard(d.id+':common',0))).map(d=>d.id).sort();
 assert.deepEqual(released,['good-guy-greg','kekw']);
});
