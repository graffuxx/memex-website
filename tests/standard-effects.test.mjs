import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFINITIONS,starterDeck,expandGameDeck} from '../public/game/platform/catalog.mjs';
import {CELLS,newGame,moveTargets,sideValue} from '../public/game/src/rules.mjs';
import {abilityEdge,effectStrength,placeEffect,previewEffect,standardAbility,twistTargets} from '../public/game/src/table-demo-rules.mjs';
import {fieldFeedback129} from '../public/game/src/field-feedback129.mjs';
import {legalCandidates,positionalValue} from '../public/game/src/tactics-ai.mjs';
import {abilityBursts,abilityMarkers} from '../public/game/src/ability-effects.mjs';
import {edgeLabels,twistLabels} from '../public/game/src/direction-controls.mjs';
import {createTacticsLayout} from '../public/game/src/tactics-layout.mjs';
import {advancePvp90,createPvp90,projectPvp90} from '../server/game/pvp90.mjs';

const makeCard=(variant,seat,ability)=>({...expandGameDeck([variant],seat)[0],uid:seat+':'+variant,ability});
function trial(){
 const game=newGame({seed:13});
 Object.assign(game,{block:'-2,2',board:{},abilityTrial:true,eventFieldsEnabled:false,rotationLocked:true});
 game.players[0].hand=[];game.players[0].deck=[];
 game.players[1].hand=[];game.players[1].deck=[];
 return game;
}
test('every opening round can draw all 19 blockade hexes, including the center',()=>{
 const fields=CELLS.map(({id})=>id).sort();
 const coverage=Array.from({length:4},()=>new Set());
 for(let seed=1;seed<=500;seed++){
  const starts=Array.from({length:20},(_,index)=>createTacticsLayout(seed,index+1));
  assert.equal(new Set(starts.slice(0,19).map(layout=>layout.block)).size,19);
  assert.notEqual(starts[18].block,starts[19].block);
  for(const [index,layout] of starts.entries()){
   assert.ok(!layout.eventCells.includes(layout.block));
   coverage[index]?.add(layout.block);
  }
 }
 for(const seen of coverage)assert.deepEqual([...seen].sort(),fields);
});

test('Fire and Storm resolve their automatic edge and publish the matching displayed value',()=>{
 const game=trial();
 game.elementalTrial=true;
 const fire=makeCard('doge:common',0,'fire'),storm=makeCard('pepe:common',0,'storm');
 game.players[0].hand=[fire,storm];
 game.board['1,0']={...makeCard('roll-safe:common',1),controller:1,rotation:0};
 const fireMove={uid:fire.uid,cell:'0,0'};
 const firePlan=previewEffect(game,fireMove);
 assert.equal(firePlan.comparisons[0].attack.total,6);
 assert.deepEqual(fieldFeedback129(game,firePlan.card,'0,0',0).bonuses,[1,0,0,0,0,0]);
 assert.equal(abilityBursts(placeEffect(game,fireMove))[0].dir,0);
 game.board['-1,0']={...makeCard('doge:common',1),controller:1,rotation:0};
 assert.ok(previewEffect(game,fireMove).comparisons.every(c=>c.attack.ability===0));
 const stormPlan=previewEffect(game,{uid:storm.uid,cell:'0,0'});
 assert.equal(stormPlan.comparisons.find(c=>c.dir===3).attack.total,3);
 assert.deepEqual(fieldFeedback129(game,stormPlan.card,'0,0',0).bonuses,[0,0,0,1,0,0]);
});
test('Water expires after the opposing move, Earth follows the blockade and Air only rotates allies',()=>{
 const game=trial();
 game.elementalTrial=true;game.block='1,0';
 const water=makeCard('pool-noodle:common',0,'water'),earth=makeCard('roll-safe:common',0,'earth'),air=makeCard(DEFINITIONS.find(c=>!c.prime&&!c.iconic&&c.element==='air').id+':common',0,'air');
 game.players[0].hand=[water,earth,air];
 const waterState=placeEffect(game,{uid:water.uid,cell:'0,0',abilityDirection:3});
 assert.equal(fieldFeedback129(waterState,waterState.board['0,0'],'0,0').bonuses[3],2);
 assert.deepEqual(fieldFeedback129({...waterState,placements:2},waterState.board['0,0'],'0,0').bonuses,[0,0,0,0,0,0]);
 const earthState=placeEffect(game,{uid:earth.uid,cell:'0,0'});
 assert.equal(fieldFeedback129(earthState,earthState.board['0,0'],'0,0').bonuses.filter(n=>n===1).length,1);
 assert.ok(fieldFeedback129({...earthState,block:'2,-2'},earthState.board['0,0'],'0,0').bonuses.every(n=>n===0));
 game.board['-1,0']={...earth,controller:0,rotation:0};game.board['0,-1']={...makeCard('doge:common',1),controller:1,rotation:0};
 game.players[0].hand=[air];
 assert.deepEqual(twistTargets(game,'0,0','air'),['-1,0']);
 assert.throws(()=>previewEffect(game,{uid:air.uid,cell:'0,0',twistCell:'0,-1'}),/Drehziel/);
 const move=legalCandidates(game).find(c=>c.action.cell==='0,0'&&c.action.twistCell==='-1,0');
 assert.ok(move);
 const withoutRotation={...move.action,twistCell:null};
 assert.ok(positionalValue(game,move)>positionalValue(game,{action:withoutRotation,plan:previewEffect(game,withoutRotation)}));
 assert.deepEqual(abilityMarkers(game,move.plan).find(marker=>marker.kind==='air'),{kind:'air',cell:'-1,0',preview:true,label:'↻'});
 assert.equal(abilityMarkers(game,previewEffect(game,withoutRotation)).some(marker=>marker.kind==='air'),false);
 const after=placeEffect(game,move.action);
 assert.equal(after.board['-1,0'].rotation,1);
 assert.equal(after.board['-1,0'].controller,0);
 assert.equal(after.last.flips.includes('-1,0'),false);
 assert.ok(abilityBursts(after).some(marker=>marker.cell==='-1,0'&&marker.label==='↻'));
});
test('rotation and edge labels use arrows and plain directions in both game languages',()=>{
 assert.deepEqual(edgeLabels(),['→ Rechts','↘ Unten rechts','↙ Unten links','← Links','↖ Oben links','↗ Oben rechts']);
 assert.deepEqual(edgeLabels(true),['→ Right','↘ Bottom right','↙ Bottom left','← Left','↖ Top left','↗ Top right']);
 assert.match(twistLabels('air',true,true).hint,/nach rechts/);
 assert.match(twistLabels('twist',true,true,true).hint,/one step right/);
 assert.match(twistLabels('air',false,false).hint,/zuerst ein freies Feld/);
});
test('Earth uses the weakest open edge beside an ally in the late game, with the old rule retained for existing duels',()=>{
 const game=trial(),earth={...makeCard('roll-safe:common',0,'earth'),controller:0,rotation:0};
 game.elementalTrial=true;
 game.placements=13;
 game.earthSupport=true;
 const ally={...makeCard('doge:common',0,'fire'),controller:0};
 const enemy={...makeCard('capybara-chill:common',1,'water'),controller:1};
 game.board={'0,0':earth,'1,0':ally,'0,1':enemy,'-1,1':enemy,'-1,0':enemy,'0,-1':enemy};
 const open=abilityEdge(game,earth,'0,0');
 assert.deepEqual(open,{dir:5,amount:1});
 assert.equal(effectStrength(game,earth,'0,0',open.dir,enemy).total,sideValue(earth,open.dir)+1);
 assert.equal(fieldFeedback129(game,earth,'0,0').bonuses[open.dir],1);
 assert.equal(abilityEdge({...game,earthSupport:false},earth,'0,0'),null);
 game.board['1,0']={...ally,controller:1};
 assert.equal(abilityEdge(game,earth,'0,0'),null);
 game.block='1,0';
 delete game.board['1,0'];
 assert.deepEqual(abilityEdge(game,earth,'0,0'),open);
 game.board['1,-1']=enemy;
 assert.equal(abilityEdge(game,earth,'0,0'),null);
});

test('Storm accepts a flanked base 3, but never base 4 or an isolated opponent',()=>{
 const game=trial(),storm=makeCard('distracted:common',0,'storm'),neutral=makeCard('bad-luck-brian:common',0,'storm');
 game.elementalTrial=true;
 game.players[0].hand=[storm,neutral];
 game.board['1,0']={...makeCard('doge:common',1),controller:1,rotation:0};
 const move={uid:storm.uid,cell:'0,0'};
 assert.equal(previewEffect(game,move).comparisons[0].attack.ability,0);
 game.board['0,1']={...makeCard('pepe:common',1),controller:1,rotation:0};
 assert.equal(previewEffect(game,move).comparisons.find(c=>c.dir===0).attack.ability,1);
 assert.ok(previewEffect(game,{...move,uid:neutral.uid}).comparisons.every(c=>c.attack.ability===0));
 const brianMove={...move,uid:neutral.uid};
 game.board['-1,1']={...makeCard('roll-safe:common',1),controller:1,rotation:0};
 const plan=previewEffect(game,brianMove);
 const protectedEdge=plan.comparisons.find(c=>c.dir===2);
 assert.equal(protectedEdge.attack.base,3);
 assert.equal(protectedEdge.attack.total,4);
 assert.equal(protectedEdge.attack.ability,1);
 assert.ok(plan.flips.includes('-1,1'));
 assert.equal(fieldFeedback129(game,plan.card,'0,0',0).bonuses[2],1);
 assert.deepEqual(placeEffect(game,brianMove).last.attackEdges,[{dir:2,total:4}]);
});
test('only Regular cards gain native abilities in newly created private-element rooms',()=>{
 const cards=[...starterDeck().slice(0,13),'evil-ernie:common','rage-guy:common'];
 for(const enabled of [true,false])for(const starter of [0,1]){
  let state=createPvp90([{cards},{cards}],15,1,{elementalTrial:enabled});
  state=advancePvp90(state,0,{kind:'gesture',value:'rock'},2);
  state=advancePvp90(state,1,{kind:'gesture',value:'scissors'},3);
  state=advancePvp90(state,0,{kind:'starter',side:starter},4);
  assert.equal(state.game.starter,starter);
  for(const player of state.game.players)for(const card of [...player.hand,...player.deck]){
   if(enabled)assert.equal(card.ability??null,standardAbility(card));
   else assert.ok(!card.ability||['hype','guard'].includes(card.ability));
  }
  if(enabled)assert.match(state.balance.patch,/-standard-effects$/);
  const view=projectPvp90({id:'test',kind:'private',host_id:'host',guest_id:'guest',identities:[{},{}],state},'guest',5);
  assert.ok(view.game.players[1].hand.every(c=>c.hidden&&!c.ability&&!c.variantId));
 }
});
