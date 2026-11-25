import test from 'node:test';
import assert from 'node:assert/strict';
import {expandGameDeck,starterDeck} from '../public/game/platform/catalog.mjs';
import {newGame,sideValue} from '../public/game/src/rules.mjs';
import {abilityDescription,awkwardEdges,effectStrength,placeEffect,previewEffect,PENGUIN_REWORK_WAVE} from '../public/game/src/table-demo-rules.mjs';
import {abilityMarkers} from '../public/game/src/ability-effects.mjs';
import {fieldFeedback129} from '../public/game/src/field-feedback129.mjs';
import {advancePvp90,createPvp90,projectPvp90} from '../server/game/pvp90.mjs';

function card(id,side,ability=null){
 return {...expandGameDeck([id+':common'],side)[0],uid:side+':'+id,rotation:0,controller:side,ability};
}

for(const seat of [0,1]){
 test(`Penguin marks without flipping and sets up a later capture for seat ${seat}`,()=>{
  const game=Object.assign(newGame({seed:13}),{board:{},turn:seat,starter:seat,block:'-2,2',abilityRework:true,elementalTrial:true,abilityTrial:true,iconicAbilityWave:PENGUIN_REWORK_WAVE,elementRules:5,eventFieldsEnabled:false});
  const enemy=1-seat,target='1,0';
  const penguin=card('awkward-penguin',seat,'awkward'),defender=card('nuck-chorris',enemy,'roundhouse');
  game.players[seat].hand=[penguin];
  game.players[seat].deck=[];
  game.board[target]=defender;
  const play={uid:penguin.uid,cell:'0,0',rotation:0};
  const plan=previewEffect(game,play);
  assert.deepEqual(plan.flips,[]);
  assert.deepEqual(plan.awkward,{cell:target,amount:1,persistent:true});
  assert.ok(abilityMarkers(game,plan).some(marker=>marker.cell===target&&marker.preview&&marker.label==='−1 DEF'));
  assert.equal(game.board[target].awkwardMark,undefined);

  const next=placeEffect(game,play),marked=next.board[target];
  assert.equal(next.turn,enemy);
  assert.equal(awkwardEdges(next,marked,target).active,true);
  assert.ok(abilityMarkers(next,null).some(marker=>marker.cell===target&&marker.label==='−1 DEF'));
  const srank=Array.from({length:6},(_,dir)=>dir).find(dir=>sideValue(marked,dir)===10);
  assert.ok(srank!==undefined);
  assert.equal(fieldFeedback129(next,marked,target).bonuses[srank],0);
  assert.equal(effectStrength(next,marked,target,srank,penguin).rank,'S');
  assert.equal(effectStrength(next,marked,target,0,penguin,{attacking:true}).total,sideValue(marked,0));

  const legacy={...game,iconicAbilityWave:7};
  const old=placeEffect(legacy,play);
  assert.equal(awkwardEdges(old,old.board[target],target).active,false);
  assert.equal(awkwardEdges({...old,placements:3},old.board[target],target),null);
  assert.match(abilityDescription(legacy,'awkward'),/nächsten Zug/);
  assert.match(abilityDescription(game,'awkward'),/bis sie geflippt wird/);
  assert.equal(previewEffect({...game,board:{}},play).awkward,null);
  const further={...game,board:{'2,0':defender}};
  assert.equal(previewEffect(further,play).awkward?.cell,'2,0');
  assert.equal(previewEffect({...further,iconicAbilityWave:7},play).awkward,null);

  const follow=card('aliens-guy',seat);
  next.turn=seat;
  next.placements=5;
  next.players[seat].hand=[follow];
  const attack={uid:follow.uid,cell:'2,0',rotation:0};
  const unmarked={...next,board:{...next.board,[target]:defender}};
  assert.deepEqual(previewEffect(unmarked,attack).flips,[]);
  assert.deepEqual(previewEffect(next,attack).flips,[target]);
  assert.equal(fieldFeedback129(next,marked,target).bonuses[0],-1);
  const captured=placeEffect(next,attack).board[target];
  assert.equal(captured.controller,seat);
  assert.equal(captured.awkwardMark,undefined);
 });
}

test('the current Penguin rules survive online projection for both players and the next round',()=>{
 const decks=[{cards:starterDeck()},{cards:starterDeck()}];
 let state=createPvp90(decks,42,1,{iconicAbilityWave:PENGUIN_REWORK_WAVE,elementalTrial:true,abilityRework:true});
 state=advancePvp90(state,0,{kind:'gesture',value:'rock'},2);
 state=advancePvp90(state,1,{kind:'gesture',value:'scissors'},3);
 state=advancePvp90(state,0,{kind:'starter',side:0},4);
 for(const user of ['host','guest']){
  const duel=projectPvp90({id:'test',kind:'private',host_id:'host',guest_id:'guest',identities:[{},{}],state},user);
  assert.equal(duel.game.iconicAbilityWave,PENGUIN_REWORK_WAVE);
 }
 state.phase='between';
 state=advancePvp90(state,0,{kind:'ready'},5);
 state=advancePvp90(state,1,{kind:'ready'},6);
 assert.equal(state.game.iconicAbilityWave,PENGUIN_REWORK_WAVE);
});
