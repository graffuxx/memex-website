import test from 'node:test';
import assert from 'node:assert/strict';
import {expandGameDeck,starterDeck} from '../public/game/platform/catalog.mjs';
import {portalTrialAbility} from '../public/game/platform/deck-bridge.mjs';
import {newGame} from '../public/game/src/rules.mjs';
import {CURRENT_ICONIC_WAVE,PENGUIN_REWORK_WAVE,STEVE_LOOT_WARD,placeEffect,previewEffect,wardEdge} from '../public/game/src/table-demo-rules.mjs';
import {abilityMarkers} from '../public/game/src/ability-effects.mjs';
import {abilityIconTextureSvg} from '../public/game/src/card-ability-icon.mjs';
import {fieldFeedback129} from '../public/game/src/field-feedback129.mjs';
import {guideAbilities} from '../src/app/how-to-play/ability-reference.mjs';
import {advancePvp90,createPvp90} from '../server/game/pvp90.mjs';

function card(id,controller,ability=null){
 return {...expandGameDeck([id+':common'],controller)[0],uid:controller+':'+id,controller,rotation:0,ability};
}

for(const seat of [0,1]){
 test(`Steve secures one capture against the immediate reply for seat ${seat}`,()=>{
  const enemy=1-seat;
  const game=Object.assign(newGame({seed:13}),{board:{'1,0':card('doge',enemy),'-1,0':card('roll-safe',enemy)},turn:seat,starter:seat,block:'-2,2',abilityTrial:true,elementalTrial:true,abilityRework:true,iconicAbilityWave:CURRENT_ICONIC_WAVE,elementRules:5,eventFieldsEnabled:false});
  const steve=card('scumbag-steve',seat,'loot');
  game.players[seat].hand=[steve];
  const play={uid:steve.uid,cell:'0,0',rotation:0};
  const plan=previewEffect(game,play);
  assert.deepEqual(plan.flips,['1,0','-1,0']);
  assert.deepEqual(plan.coverWards,[{cell:'1,0',dir:1,kind:'loot',amount:STEVE_LOOT_WARD}]);
  assert.ok(abilityMarkers(game,plan).some(marker=>marker.kind==='loot'&&marker.cell==='1,0'&&marker.preview&&marker.label==='+2'));
  assert.equal(game.board['1,0'].coverWard,undefined);
  assert.deepEqual(previewEffect({...game,board:{}},play).coverWards,[]);

  const next=placeEffect(game,play),captured=next.board['1,0'];
  assert.equal(captured.controller,seat);
  assert.deepEqual(wardEdge(next,captured,'1,0'),{dir:1,amount:STEVE_LOOT_WARD,kind:'loot'});
  assert.equal(wardEdge(next,next.board['-1,0'],'-1,0'),null);
  assert.equal(fieldFeedback129(next,captured,'1,0').bonuses[1],STEVE_LOOT_WARD);
  assert.equal(wardEdge({...next,placements:2},captured,'1,0'),null);

  const reply=card('pepe',enemy);
  next.players[enemy].hand=[reply];
  const attack={uid:reply.uid,cell:'1,1',rotation:0};
  const unprotected={...captured};
  delete unprotected.coverWard;
  assert.ok(previewEffect({...next,board:{...next.board,'1,0':unprotected}},attack).flips.includes('1,0'));
  assert.ok(!previewEffect(next,attack).flips.includes('1,0'));
 });
}

test('new duels, the website guide and the card icon use Beute sichern while old duels use Schildklau',()=>{
 const steve=card('scumbag-steve',0);
 assert.equal(portalTrialAbility({iconicAbilities:true,iconicAbilityWave:PENGUIN_REWORK_WAVE},steve),'swipe');
 assert.equal(portalTrialAbility({iconicAbilities:true,iconicAbilityWave:CURRENT_ICONIC_WAVE},steve),'loot');
 assert.equal(guideAbilities.find(entry=>entry.name==='Scumbag Steve')?.id,'loot');
 assert.ok(abilityIconTextureSvg('loot'));

 const starter=starterDeck();
 const decks=[{cards:['scumbag-steve:common',...starter.slice(1)]},{cards:starter}];
 let state=createPvp90(decks,13,1,{iconicAbilities:true,iconicAbilityWave:CURRENT_ICONIC_WAVE,elementalTrial:true});
 state=advancePvp90(state,0,{kind:'gesture',value:'rock'},2);
 state=advancePvp90(state,1,{kind:'gesture',value:'scissors'},3);
 state=advancePvp90(state,0,{kind:'starter',side:0},4);
 const {hand,deck}=state.game.players[0];
 assert.equal([...hand,...deck].find(c=>c.id===steve.id)?.ability,'loot');
});
