import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFINITIONS,expandGameDeck} from '../public/game/platform/catalog.mjs';
import {CELLS,freeCells,newGame} from '../public/game/src/rules.mjs';
import {previewEffect,placeEffect,releasedPrimeAbility} from '../public/game/src/table-demo-rules.mjs';
import {abilityMarkers,abilityBursts} from '../public/game/src/ability-effects.mjs';
import {legalCandidates} from '../public/game/src/tactics-ai.mjs';
import {projectPvp90} from '../server/game/pvp90.mjs';
import {applyPortalDecks} from '../public/game/platform/deck-bridge.mjs';
const makeCard=(variant,seat,ability)=>({...expandGameDeck([variant],seat)[0],uid:seat+':'+variant,ability});
function trial(){
 const game=newGame({seed:13});
 Object.assign(game,{block:'-2,2',board:{},abilityTrial:true,eventFieldsEnabled:false,rotationLocked:true});
 game.players[0].hand=[];game.players[0].deck=[];
 game.players[1].hand=[];game.players[1].deck=[];
 return game;
}
test('the new Prime pair requires its own release snapshot in addition to the trio',()=>{
 const intended={'crying-jordan':'bailout','disappointed-fan':'fan'};
 const ordinary=DEFINITIONS.filter(c=>!c.prime&&!c.iconic).slice(0,14).map(c=>c.id+':common');
 for(const prime of DEFINITIONS.filter(c=>Object.hasOwn(intended,c.id))){
  assert.equal(releasedPrimeAbility({id:prime.ruleId}),null);
  const cards=[...ordinary,prime.id+':common'];
  for(const releasedPrimePair of [false,true]){
   const game=trial();
   Object.assign(game,{elementalTrial:true,iconicAbilityWave:6,iconicAbilities:true,releasedPrimeTrio:true,releasedPrimePair});
   const mapped=applyPortalDecks(game,cards,[],{opponentCards:cards});
   const unit=mapped.players[0].hand.concat(mapped.players[0].deck).find(c=>c.id===prime.ruleId);
   assert.equal(unit.ability,releasedPrimePair?intended[prime.id]:undefined);
  }
 }
});
for(const starter of [0,1]){
 test(`Jordan saves one Regular from a close attack for starter ${starter}`,()=>{
  const game=trial(),defender=1-starter;
  Object.assign(game,{turn:starter,starter,elementalTrial:true,signatureTrial:true,elementRules:5});
  const attacker=makeCard('stonks:common',starter,'storm');
  const standard={...makeCard('sad-keanu:common',defender),controller:defender,rotation:0};
  const jordan={...makeCard('crying-jordan:common',defender,'bailout'),controller:defender,rotation:0};
  game.players[starter].hand=[attacker];
  game.board={'1,0':standard,'0,1':jordan};
  const action={uid:attacker.uid,cell:'0,0'};
  const plan=previewEffect(game,action);
  assert.deepEqual(plan.bailout,{cell:'1,0',protector:'0,1',dir:3});
  assert.deepEqual(plan.flips,[]);
  assert.equal(placeEffect(game,action).board['0,1'].bailoutSpent,true);
  assert.ok(abilityBursts(placeEffect(game,action)).some(mark=>mark.kind==='bailout'));
  assert.ok(abilityMarkers(game,plan).some(m=>m.kind==='bailout'&&m.cell==='1,0'));
  game.board['0,1']={...jordan,bailoutSpent:true};
  assert.deepEqual(previewEffect(game,action).flips,['1,0']);
  game.board['0,1']={...jordan,rotation:4};
  assert.equal(previewEffect(game,action).bailout,null);
  assert.deepEqual(previewEffect(game,action).flips,['1,0','0,1']);
  const sEdge=makeCard('evil-ernie:common',starter);
  game.players[starter].hand=[sEdge];
  game.board['0,1']=jordan;
  const special=previewEffect(game,{...action,uid:sEdge.uid});
  assert.equal(special.bailout,null);
  assert.deepEqual(special.flips,['1,0']);
 });

 test(`Fan reserves a shared tile for the opponent's next placement only for starter ${starter}`,()=>{
  const game=trial(),other=1-starter;
  Object.assign(game,{turn:starter,starter,elementalTrial:true,signatureTrial:true,elementRules:5});
  const fan=makeCard('disappointed-fan:common',starter,'fan'),enemy=makeCard('harold:common',other);
  game.players[starter].hand=[fan];
  game.players[other].hand=[enemy];
  game.board={'1,0':{...makeCard('doge:common',starter),controller:starter,rotation:0}};
  const placement={uid:fan.uid,cell:'0,0'};
  assert.deepEqual(previewEffect(game,placement).steps,[['0,1'],['1,-1']]);
  const action={...placement,stepCells:['0,1']};
  const plan=previewEffect(game,action);
  assert.ok(abilityMarkers(game,plan).some(m=>m.kind==='fan'&&m.cell==='0,1'));
  assert.ok(legalCandidates(game).some(option=>option.plan.reserve==='0,1'));
  const placed=placeEffect(game,action);
  assert.ok(abilityBursts(placed).some(mark=>mark.kind==='fan'));
  assert.ok(!freeCells(placed).includes('0,1'));
  assert.throws(()=>previewEffect(placed,{uid:enemy.uid,cell:'0,1'}),/Platzierung/);
  assert.throws(()=>previewEffect(game,{...placement,stepCells:['-1,0']}),/Leere Ränge/);
  const response=placeEffect(placed,{uid:enemy.uid,cell:'2,0'});
  assert.equal(response.fanReserve,undefined);
  assert.ok(freeCells(response).includes('0,1'));
  const state={phase:'play',game:placed,results:[],round:1,ready:[false,false],choices:[null,null]};
  const projected=projectPvp90({id:'test',kind:'private',state,identities:[{},{}],host_id:'host',guest_id:'guest'},'guest');
  assert.equal(projected.game.fanReserve.owner,1-starter);
  assert.ok(!freeCells(projected.game).includes('0,1'));
  const crowded={...game,board:Object.fromEntries(
   CELLS.filter(({id})=>![game.block,'0,0','0,1'].includes(id))
    .map(({id})=>[id,{...game.board['1,0'],uid:'fixture:'+id}])
  )};
  assert.deepEqual(previewEffect(crowded,placement).steps,[]);
 });
}
