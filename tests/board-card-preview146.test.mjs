import test from 'node:test';
import assert from 'node:assert/strict';
import {boardPreviewFace146} from '../public/game/src/board-card-preview146.mjs';
import {expandGameDeck,starterDeck} from '../public/game/platform/catalog.mjs';
import {sideValue} from '../public/game/src/rules.mjs';
import {createTacticsMatch} from '../public/game/src/table-demo-state.mjs';
import {displayedEdgeValue129,fieldFeedback129,previewEdgeTotals129} from '../public/game/src/field-feedback129.mjs';
import {previewEffect} from '../public/game/src/table-demo-rules.mjs';
import {advancePvp90,createPvp90,projectPvp90} from '../server/game/pvp90.mjs';

test('board previews read only played cards and preserve their finish, owner and rotated edges',()=>{
 const game=createTacticsMatch({seed:146,starter:0});
 const card={...expandGameDeck(['evil-ernie:legendary'],1)[0],rotation:2,controller:0};
 game.board={'0,0':card};
 const before=structuredClone(game);
 const preview=boardPreviewFace146(game,'0,0');
 assert.equal(preview.variant.id,'evil-ernie:legendary');
 assert.equal(preview.card.controller,0);
 assert.equal(preview.definition.prime,true);
 assert.deepEqual(preview.values,Array.from({length:6},(_,direction)=>sideValue(card,direction)));
 assert.equal(boardPreviewFace146(game,'1,0'),null);
 assert.equal(boardPreviewFace146(null,'0,0'),null);
 assert.deepEqual(game,before);
});


test('temporary and permanent modifiers display as numbers in their original slots, with S preserved',()=>{
 assert.deepEqual(displayedEdgeValue129(3,{value:5}),{label:'5',changed:true});
 assert.deepEqual(displayedEdgeValue129(8,{bonus:2}),{label:'10',changed:true});
 assert.deepEqual(displayedEdgeValue129(10,{total:11}),{label:'S',changed:false});
 assert.deepEqual(displayedEdgeValue129(4,{bonus:2,total:3}),{label:'3',changed:true});
 const plan={comparisons:[{cell:'1,0',dir:0,attack:{total:7},defend:{total:5}}]};
 assert.equal(previewEdgeTotals129(plan)[0],7);
 assert.equal(previewEdgeTotals129(plan,'1,0')[3],5);
 assert.deepEqual(previewEdgeTotals129(plan,'-1,0'),[]);
});

for(const starter of [0,1])test('Yo Dawg copies a Regular value into the same edge for both players, starter '+starter,()=>{
 const cards=[...starterDeck().slice(0,14),'yo-dawg:common'];
 let state=createPvp90([{cards},{cards}],146,1,{elementalTrial:true,iconicAbilities:true,iconicAbilityWave:7,allPrimes:true,finalGuard:true});
 state=advancePvp90(state,0,{kind:'gesture',value:'rock'},2);
 state=advancePvp90(state,1,{kind:'gesture',value:'scissors'},3);
 state=advancePvp90(state,0,{kind:'starter',side:starter},4);
 const game=state.game;
 const player=game.players[starter];
 const yo=[...player.hand,...player.deck].find(c=>c.variantId==='yo-dawg:common');
 assert.equal(yo.ability,'nested');
 player.deck=player.deck.filter(c=>c.uid!==yo.uid);
 player.hand=[yo];
 game.block='-2,2';
 game.placements=1;
 const move={uid:yo.uid,cell:'0,0',rotation:0};
 const target=(id,ability)=>({...expandGameDeck([id+':common'],1-starter)[0],controller:1-starter,ability});
 game.board={'1,0':target('rage-guy','rage')};
 const iconicPlan=previewEffect(game,move);
 assert.deepEqual(iconicPlan.flips,['1,0']);
 assert.equal(iconicPlan.nested,null);
 game.board={'1,0':target('doge','fire')};
 const plan=previewEffect(game,move);
 assert.deepEqual(plan.nested,{dir:1,value:5});
 assert.equal(yo.edgeCopy,undefined,'the preview does not mutate the hand');
 const after=advancePvp90(state,starter,{kind:'place',action:move},5);
 assert.deepEqual(after.game.last.nested,plan.nested);
 assert.equal(sideValue(after.game.board['0,0'],1),5);
 for(const viewer of ['host','guest']){
  const row={id:'yo-dawg',kind:'private',state:after,host_id:'host',guest_id:'guest',identities:[{},{}]};
  const board=projectPvp90(row,viewer,6).game;
  const feedback=fieldFeedback129(board,board.board['0,0'],'0,0');
  assert.equal(feedback.values[1],5);
  assert.equal(boardPreviewFace146(board,'0,0').values[1],5);
 }
});
