import test from 'node:test';
import assert from 'node:assert/strict';
import {expandGameDeck} from '../public/game/platform/catalog.mjs';
import {newGame,sideValue} from '../public/game/src/rules.mjs';
import {abilityMarkers,abilityBursts} from '../public/game/src/ability-effects.mjs';
import {fieldFeedback129} from '../public/game/src/field-feedback129.mjs';
import {portalTrialAbility} from '../public/game/platform/deck-bridge.mjs';
import {guideAbilities} from '../src/app/how-to-play/ability-reference.mjs';
import {abilityIconTextureSvg} from '../public/game/src/card-ability-icon.mjs';
import {placementKey135} from '../server/game/opponent-model135.mjs';
import {createPvp90,advancePvp90,projectPvp90} from '../server/game/pvp90.mjs';
import {CURRENT_ICONIC_WAVE,actionOptions,placeEffect,previewEffect} from '../public/game/src/table-demo-rules.mjs';

const card=(id,side,rotation=0,ability)=>({...expandGameDeck([id+':common'],side)[0],uid:side+':'+id,controller:side,rotation,ability});
const play=(card,cell='0,0')=>({uid:card.uid,cell,rotation:0});
function trial(seat,held,board={}){
 const game=Object.assign(newGame({seed:13}),{board,turn:seat,starter:seat,block:'-2,2',abilityTrial:true,elementalTrial:true,abilityRework:true,iconicAbilityWave:9,elementRules:5,eventFieldsEnabled:false,allPrimes:true});
 game.players[seat].hand=[held];
 game.players[seat].deck=[];
 return game;
}

for(const side of [0,1]){
 const enemy=1-side;
 test(`Plot Twist offers one Storm vs. Fire target at a deficit of three for seat ${side}`,()=>{
  const plot=card('always-has-been',side,0,'plotTwist');
  const game=trial(side,plot,{'1,0':card('rage-guy',enemy,2),'1,-1':card('evil-ernie',enemy,2)});
  assert.deepEqual(previewEffect(game,play(plot)).flips,[]);
  assert.deepEqual(actionOptions(game,plot,'0,0',0).map(action=>action.plotTarget),[undefined,'1,0']);
  const result=placeEffect(game,{...play(plot),plotTarget:'1,0'});
  assert.deepEqual(result.last.plot,{cell:'1,0',margin:3});
  assert.equal(result.board['1,0'].controller,side);
  assert.ok(abilityBursts(result).some(marker=>marker.kind==='plotTwist'&&marker.cell==='1,0'));
  assert.equal(result.board['1,-1'].controller,enemy);
  assert.throws(()=>previewEffect(game,{...play(plot),plotTarget:'1,-1'}),/Kein gültiges Ziel/);
  const biggerDeficit={...game,board:{...game.board,'1,0':card('rage-guy',enemy,3)}};
  assert.deepEqual(previewEffect(biggerDeficit,play(plot)).plotTargets,[]);
  assert.deepEqual(previewEffect({...game,placements:17,starter:enemy,finalGuard:true},{...play(plot),plotTarget:'1,0'}).flips,[]);
 });

 test(`Pablo charges a single bonus for the next allied card for seat ${side}`,()=>{
  const pablo=card('pablo-waiting',side,0,'patience');
  const nextCard=card('pepe',side);
  const rival=card('doge',enemy);
  const game=trial(side,pablo,{'1,0':card('rage-guy',enemy,3)});
  game.players[side].hand.push(nextCard);
  const armed=placeEffect(game,play(pablo,'-1,0'));
  assert.equal(armed.last.patienceArmed,true);
  armed.players[enemy].hand=[rival];
  assert.equal(previewEffect(armed,play(rival,'2,-2')).patience,null);
  const nextOwnTurn=placeEffect(armed,play(rival,'2,-2'));
  const attempt=play(nextCard);
  const result=placeEffect(nextOwnTurn,attempt);
  assert.deepEqual(result.last.patience,{cell:'1,0',amount:2});
  assert.ok(abilityMarkers(nextOwnTurn,previewEffect(nextOwnTurn,attempt)).some(marker=>marker.kind==='patience'&&marker.label==='+2'));
  assert.equal(result.players[side].patienceUntil,undefined);
  assert.equal(result.board['1,0'].controller,side);
  assert.equal(sideValue(result.board['0,0'],0),7);
  assert.deepEqual(previewEffect({...nextOwnTurn,placements:4},attempt).flips,[]);
  assert.deepEqual(previewEffect(nextOwnTurn,play(nextCard,'-2,1')).flips,[]);
 });

 test(`Overload is optional and the price survives capture without affecting S for seat ${side}`,()=>{
  const crusher=card('keyboard-crusher',side,0,'overload');
  const game=trial(side,crusher,{'1,0':card('rage-guy',enemy,3),'1,-1':card('evil-ernie',enemy,2)});
  assert.deepEqual(actionOptions(game,crusher,'0,0',0).map(action=>action.overloadTarget),[undefined,'1,0']);
  assert.equal(placeEffect(game,play(crusher)).board['0,0'].edgeWear,undefined);
  assert.throws(()=>previewEffect(game,{...play(crusher),overloadTarget:'1,-1'}),/Kein gültiges Ziel/);
  const move={...play(crusher),overloadTarget:'1,0'};
  const active=placeEffect(game,move);
  assert.deepEqual(active.last.overload,{cell:'1,0',amount:2,cost:2});
  assert.deepEqual(fieldFeedback129(active,active.board['0,0'],'0,0').values,[4,5,10,1,1,3]);
  assert.notEqual(placementKey135(move),placementKey135(play(crusher)));
  const rival=card('double-rainbow',enemy);
  active.players[enemy].hand=[rival];
  const captured=placeEffect(active,play(rival,'-1,0'));
  assert.equal(captured.board['0,0'].controller,enemy);
  assert.equal(sideValue(captured.board['0,0'],3),1);
  const guarded=placeEffect({...game,placements:17,starter:enemy,finalGuard:true},move);
  assert.equal(guarded.last.overload,undefined);
  assert.equal(guarded.board['0,0'].edgeWear,undefined);
 });

 test(`Sandwich uses the rear ally's actual edge for one capture for seat ${side}`,()=>{
  const sandwich=card('idiot-sandwich',side,0,'pincerSandwich');
  const front=card('pepe',enemy,4);
  const ally=card('scumbag-steve',side);
  const game=trial(side,sandwich,{'0,1':front,'0,2':ally});
  const plan=previewEffect(game,play(sandwich));
  assert.deepEqual(plan.flips,['0,1']);
  assert.deepEqual(plan.sandwich,{cell:'0,1',dir:1,source:'0,2',sourceDir:4,rearAttack:true});
  assert.equal(plan.comparisons[0].source,'0,2');
  assert.ok(abilityMarkers(game,plan).some(marker=>marker.kind==='sandwich'&&marker.cell==='0,2'));
  const result=placeEffect(game,play(sandwich));
  assert.equal(result.board['0,1'].controller,side);
  assert.equal(result.board['0,2'].uid,ally.uid);
  assert.deepEqual(previewEffect({...game,board:{'0,1':front}},play(sandwich)).flips,[]);
 });
}


test('new duels and the guide pick the new abilities while old duel snapshots keep their original abilities',()=>{
 const motifs={'always-has-been':['ambush','plotTwist'],'pablo-waiting':['relay','patience'],
  'keyboard-crusher':['jam','overload'],'idiot-sandwich':['sandwich','pincerSandwich']};
 for(const [motif,[oldKey,key]] of Object.entries(motifs)){
  const held=card(motif,0);
  const rules={allPrimes:true,iconicAbilities:true,iconicAbilityWave:CURRENT_ICONIC_WAVE};
  assert.equal(portalTrialAbility(rules,held),key);
  assert.equal(portalTrialAbility({...rules,iconicAbilityWave:CURRENT_ICONIC_WAVE-1},held),oldKey);
  assert.ok(guideAbilities.some(entry=>entry.id===key));
  assert.ok(abilityIconTextureSvg(key));
 }
});

for(const side of [0,1]){
 test(`online play commits a selectable ability and both seats get the resulting edge values (actor ${side})`,()=>{
  const floor=Array(15).fill('doge:common');
  const state=createPvp90([{cards:floor},{cards:floor}],17);
  const held=card('keyboard-crusher',side,0,'overload');
  state.phase='play';
  state.game=trial(side,held,{'1,0':card('rage-guy',1-side,3)});
  const action={...play(held),overloadTarget:'1,0'};
  const next=advancePvp90(state,side,{kind:'place',action},1000);
  assert.deepEqual(next.game.last.flips,['1,0']);
  for(const seat of [0,1]){
   const player=['a','b'][seat];
   const view=projectPvp90({id:'fixture',host_id:'a',guest_id:'b',kind:'private',identities:[{},{}],state:next},player,1000);
   assert.equal(view.game.board['0,0'].controller,seat===side?0:1);
   assert.deepEqual(fieldFeedback129(view.game,view.game.board['0,0'],'0,0').values,[4,5,10,1,1,3]);
  }
 });
}
