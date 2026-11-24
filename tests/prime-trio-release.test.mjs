import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFINITIONS,expandGameDeck} from '../public/game/platform/catalog.mjs';
import {newGame} from '../public/game/src/rules.mjs';
import {previewEffect,placeEffect,abilityAt,releasedPrimeAbility} from '../public/game/src/table-demo-rules.mjs';
import {abilityMarkers} from '../public/game/src/ability-effects.mjs';
import {fieldFeedback129} from '../public/game/src/field-feedback129.mjs';
import {legalCandidates} from '../public/game/src/tactics-ai.mjs';
import {applyPortalDecks} from '../public/game/platform/deck-bridge.mjs';
const makeCard=(variant,seat,ability)=>({...expandGameDeck([variant],seat)[0],uid:seat+':'+variant,ability});
function trial(){
 const game=newGame({seed:13});
 Object.assign(game,{block:'-2,2',board:{},abilityTrial:true,eventFieldsEnabled:false,rotationLocked:true});
 game.players[0].hand=[];game.players[0].deck=[];
 game.players[1].hand=[];game.players[1].deck=[];
 return game;
}
test('the release grants only the three named Primes to the enabled match snapshot',()=>{
 const intended={'numa-numa':'chorus','keyboard-crusher':'jam','idiot-sandwich':'sandwich'};
 const ordinary=DEFINITIONS.filter(c=>!c.prime&&!c.iconic).slice(0,14).map(c=>c.id+':common');
 for(const prime of DEFINITIONS.filter(c=>c.prime)){
  assert.equal(releasedPrimeAbility({id:prime.ruleId}),intended[prime.id]??null);
  const cards=[...ordinary,prime.id+':common'];
  for(const releasedPrimeTrio of [false,true]){
   const game=trial();
   Object.assign(game,{elementalTrial:true,iconicAbilityWave:6,iconicAbilities:true,releasedPrimeTrio});
   const mapped=applyPortalDecks(game,cards,[],{opponentCards:cards});
   const unit=mapped.players[0].hand.concat(mapped.players[0].deck).find(c=>c.id===prime.ruleId);
   assert.equal(unit.ability,releasedPrimeTrio?intended[prime.id]:undefined);
  }
 }
});
for(const seat of [0,1]){
 test(`Numa Numa rotates a pair of different elements without extra flips for starter ${seat}`,()=>{
  const game=trial(),other=1-seat,numa=makeCard('numa-numa:common',seat,'chorus');
  Object.assign(game,{turn:seat,starter:seat,elementalTrial:true,signatureTrial:true,elementRules:5});
  const card=(id,controller)=>({...makeCard(id+':common',controller),controller,rotation:0});
  game.players[seat].hand=[numa];
  game.board={'-1,0':card('doge',seat),'0,-1':card('harold',seat),'1,-1':card('pepe',other)};
  const action={uid:numa.uid,cell:'0,0'};
  const base=previewEffect(game,action);
  assert.deepEqual(base.flips,['1,-1']);
  assert.deepEqual(base.steps,[['-1,0','cw'],['-1,0','ccw'],['-1,0','0,-1'],['0,-1','cw'],['0,-1','ccw'],['0,-1','-1,0']]);
  const choreography={...action,stepCells:['-1,0','0,-1']};
  const plan=previewEffect(game,choreography);
  assert.deepEqual(plan.flips,base.flips);
  assert.deepEqual(plan.transforms.map(t=>[t.cell,t.from,t.to]),[['-1,0',0,1],['0,-1',0,5]]);
  assert.deepEqual(abilityMarkers(game,plan).filter(m=>m.kind==='chorus').map(m=>m.label),['↻','↶','+2','+2']);
  assert.ok(legalCandidates(game).some(candidate=>candidate.action.cell==='0,0'&&candidate.action.stepCells));
  const done=placeEffect(game,choreography);
  assert.equal(done.board['-1,0'].uid,game.board['-1,0'].uid);
  assert.equal(done.board['0,-1'].uid,game.board['0,-1'].uid);
  assert.equal(done.board['-1,0'].rotation,1);
  assert.equal(done.board['0,-1'].rotation,5);
  for(const ward of plan.coverWards){
   assert.equal(done.board[ward.cell].coverWard.kind,'chorus');
   assert.equal(fieldFeedback129(done,done.board[ward.cell],ward.cell).bonuses[ward.dir],2);
   assert.equal(fieldFeedback129({...done,placements:done.placements+1},done.board[ward.cell],ward.cell).bonuses[ward.dir],0);
  }
  assert.equal(game.board['-1,0'].rotation,0);
  const solo=previewEffect(game,{...action,stepCells:['-1,0','ccw']});
  assert.equal(solo.transforms[0].to,5);
  assert.equal(solo.coverWards[0].amount,1);
  game.board['-2,0']=card('harold',seat);
  assert.equal(previewEffect(game,{...action,stepCells:['-1,0','-2,0']}).transforms.length,2);
  game.board['0,-1']=card('doge',seat);
  assert.throws(()=>previewEffect(game,choreography),/Choreografie/);
  assert.throws(()=>previewEffect(game,{...action,stepCells:['-1,0','1,-1']}),/Choreografie/);
 });
}

for(const seat of [0,1]){
 test(`Keyboard Crusher mutes one native power in time for capture for starter ${seat}`,()=>{
  const game=trial(),other=1-seat,crusher=makeCard('keyboard-crusher:common',seat,'jam');
  Object.assign(game,{turn:seat,starter:seat,elementalTrial:true,signatureTrial:true,elementRules:5});
  game.players[seat].hand=[crusher];
  const foe={...makeCard('sad-keanu:common',other,'water'),controller:other,rotation:3,guardOwner:other,guardUntil:5,guardDirection:3};
  game.board={'1,0':foe};
  const action={uid:crusher.uid,cell:'0,0'};
  assert.deepEqual(previewEffect(game,action).flips,[]);
  const choice={...action,stepCells:['1,0']};
  const plan=previewEffect(game,choice);
  assert.deepEqual(plan.flips,['1,0']);
  assert.equal(plan.comparisons[0].defend.total,5);
  assert.equal(plan.jam,'1,0');
  assert.equal(game.board['1,0'].jammedUntil,undefined);
  assert.ok(abilityMarkers(game,plan).some(m=>m.kind==='jam'&&m.cell==='1,0'));
  assert.equal(placeEffect(game,choice).board['1,0'].jammedUntil,undefined);
  foe.coverWard={dir:3,owner:other,until:5};
  const warded=previewEffect(game,choice);
  assert.equal(warded.comparisons[0].defend.total,6);
  assert.equal(warded.comparisons[0].defend.ability,1);
  delete game.board['1,0'];
  game.board['-1,0']={...foe,rotation:0,guardDirection:0};
  const muted=placeEffect(game,{...action,stepCells:['-1,0']});
  assert.equal(muted.board['-1,0'].controller,other);
  assert.equal(abilityAt(muted,muted.board['-1,0'],'-1,0'),null);
  assert.equal(abilityAt({...muted,placements:muted.placements+1},muted.board['-1,0'],'-1,0'),null);
  assert.equal(abilityAt({...muted,placements:muted.placements+2},muted.board['-1,0'],'-1,0'),'water');
  assert.throws(()=>previewEffect(game,{...action,stepCells:['0,1']}),/Eingabestopp/);
 });

 test(`Idiot Sandwich uses numeric surplus from behind for starter ${seat}`,()=>{
  const game=trial(),other=1-seat,prime=makeCard('idiot-sandwich:common',seat,'sandwich');
  Object.assign(game,{turn:seat,starter:seat,elementalTrial:true,signatureTrial:true,elementRules:5});
  const card=(id,controller,rotation=0)=>({...makeCard(id+':common',controller),controller,rotation});
  game.players[seat].hand=[prime];
  game.board={'-1,0':card('harold',other),'-2,0':card('rage-guy',seat)};
  const action={uid:prime.uid,cell:'0,0'};
  const plan=previewEffect(game,action);
  assert.deepEqual(plan.sandwich,{cell:'-1,0',source:'-2,0',sourceDir:0,dir:3,amount:3});
  assert.equal(plan.comparisons[0].attack.total,5);
  assert.deepEqual(plan.flips,['-1,0']);
  assert.ok(abilityMarkers(game,plan).some(m=>m.kind==='sandwich'&&m.label==='+3'));
  assert.equal(placeEffect(game,action).board['-1,0'].controller,seat);
  game.board['-2,0']=card('doge',seat);
  assert.equal(previewEffect(game,action).sandwich,null);
  game.board['-2,1']=card('rage-guy',seat,5);
  const diagonal=previewEffect(game,action);
  assert.equal(diagonal.sandwich.source,'-2,1');
  assert.equal(diagonal.sandwich.sourceDir,5);
  assert.ok(abilityMarkers(game,diagonal).some(m=>m.kind==='sandwich'&&m.cell==='-2,1'&&m.dir===5));
  delete game.board['-2,1'];
  game.board['-2,0']=card('evil-ernie',seat);
  assert.equal(previewEffect(game,action).sandwich,null);
  game.board['-2,0']=card('rage-guy',seat);
  game.board['-1,0']=card('evil-ernie',other);
  assert.equal(previewEffect(game,action).sandwich,null);
 });
}
