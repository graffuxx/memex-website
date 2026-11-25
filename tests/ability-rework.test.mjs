import test from 'node:test';
import assert from 'node:assert/strict';
import {expandGameDeck,starterDeck} from '../public/game/platform/catalog.mjs';
import {newGame} from '../public/game/src/rules.mjs';
import {abilityDescription,actionOptions,placeEffect,previewEffect,wardEdge} from '../public/game/src/table-demo-rules.mjs';
import {fieldFeedback129,previewEdgeTotals129} from '../public/game/src/field-feedback129.mjs';
import {abilityMarkers} from '../public/game/src/ability-effects.mjs';
import {animateResolvedFlips} from '../public/game/src/flip-combo.mjs';
import {advancePvp90,createPvp90,projectPvp90} from '../server/game/pvp90.mjs';
import {placementKey135} from '../server/game/opponent-model135.mjs';

function card(id,side,rotation=0,ability){
 return {...expandGameDeck([id+':common'],side)[0],uid:side+':'+id,controller:side,rotation,ability};
}
function trial(turn){
 const game=newGame({seed:13});
 Object.assign(game,{board:{},turn,starter:turn,block:'-2,2',abilityRework:true,elementalTrial:true,abilityTrial:true,elementRules:5,eventFieldsEnabled:false});
 for(const player of game.players){player.hand=[];player.deck=[];}
 return game;
}

for(const seat of [0,1]){
 test(`Emotional Damage chains one new flip without an existing ally for seat ${seat}`,async()=>{
  const game=trial(seat),enemy=1-seat,emotional=card('emotional-damage',seat,0,'pincer');
  game.players[seat].hand=[emotional];
  game.board={'1,0':card('doge',enemy),'2,0':card('cat-jam',enemy),'2,-1':card('roll-safe',enemy)};
  const action={uid:emotional.uid,cell:'0,0',rotation:0};
  const legacy=previewEffect({...game,abilityRework:false},action);
  const plan=previewEffect(game,action),result=placeEffect(game,action);
  assert.deepEqual(legacy.flips,['1,0']);
  assert.deepEqual(plan.flips,['1,0','2,-1']);
  assert.deepEqual(result.last.pincer,{source:'1,0',cell:'2,-1',dir:5,shockwave:true});
  assert.equal(result.board['2,0'].controller,enemy);
  assert.ok(abilityMarkers(game,plan).some(marker=>marker.cell==='2,-1'&&marker.label==='✦'));
  const protectedPlan=previewEffect({...game,placements:17,starter:enemy,finalGuard:true},action);
  assert.equal(protectedPlan.finalGuard.cell,'2,-1');
  assert.deepEqual(protectedPlan.flips,['1,0']);
  const log=[];
  await animateResolvedFlips({flip(uid,_side,options){log.push(uid);options?.onImpact?.();}},result,
   {announce(tier){log.push(tier.id);},flash(){}},()=>{log.push('shockwave');});
  assert.deepEqual(log,[enemy+':doge','shockwave',enemy+':roll-safe','double']);
  delete game.board['1,0'];
  assert.equal(previewEffect(game,action).pincer,null);
 });

 test(`Roundhouse flips one newly exposed neighbour after the S capture for seat ${seat}`,async()=>{
  const game=trial(seat),enemy=1-seat,nuck=card('nuck-chorris',seat,0,'roundhouse');
  game.players[seat].hand=[nuck];
  game.board={'0,1':card('doge',enemy,3),'1,1':card('cat-jam',enemy,1)};
  const action={uid:nuck.uid,cell:'0,0',rotation:0},left={...action,pivotDirection:-1};
  assert.deepEqual(previewEffect(game,action).flips,['0,1']);
  assert.ok(actionOptions(game,nuck,'0,0',0).some(choice=>choice.pivotDirection===1));
  assert.deepEqual(previewEffect({...game,abilityRework:false},left).flips,['0,1']);
  const preview=previewEffect(game,left),result=placeEffect(game,left);
  assert.deepEqual(preview.flips,['0,1','1,1']);
  assert.deepEqual(result.last.roundhouse,{source:'0,1',cell:'1,1',dir:0});
  assert.equal(result.board['0,1'].rotation,2);
  assert.equal(result.board['1,1'].controller,seat);
  assert.equal(abilityMarkers(game,preview).find(mark=>mark.label==='✦')?.cell,'1,1');
  assert.deepEqual(previewEffect({...game,placements:17,starter:enemy,finalGuard:true},left).flips,['0,1']);
  const log=[];
  await animateResolvedFlips({flip(uid,_side,options){log.push(uid);options?.onImpact?.();}},result,
   {announce(tier){log.push(tier.id);},flash(){}},()=>{log.push('turn');});
  assert.deepEqual(log,[enemy+':doge','turn',enemy+':cat-jam','double']);
 });

 test(`Philosoraptor wins one otherwise lost numeric tie and KEKW can stop it for seat ${seat}`,()=>{
  const game=trial(seat),enemy=1-seat,thinker=card('philosoraptor',seat,0,'thought');
  game.players[seat].hand=[thinker];
  game.board={'1,0':card('pepe',enemy,1)};
  const action={uid:thinker.uid,cell:'0,0',rotation:0};
  assert.deepEqual(previewEffect({...game,abilityRework:false},action).flips,[]);
  assert.deepEqual(previewEffect(game,action).flips,['1,0']);
  assert.equal(placeEffect(game,action).last.thought,'1,0');
  game.board['1,0']={...card('kekw',enemy,0,'laugh'),laughOwner:enemy,laughUntil:game.placements+1};
  assert.equal(previewEffect(game,action).thought,null);
  game.board['1,0']=card('pepe',enemy,1);
  game.board['0,-1']=card('doge',enemy);
  assert.equal(previewEffect(game,action).thought,null);
  game.board={'1,0':card('kekw',enemy,4)};
  const near=previewEffect(game,action);
  assert.equal(near.comparisons[0].defend.total,near.comparisons[0].attack.total+1);
  assert.equal(near.thought,'1,0');
 });

 test(`Change My Mind attacks from the position of one swapped allied Regular for seat ${seat}`,()=>{
  const game=trial(seat),debater=card('change-my-mind',seat,0,'exchange'),ally=card('doge',seat,2);
  game.players[seat].hand=[debater];
  game.board={'1,0':ally,'1,1':card('roll-safe',1-seat),'0,-1':card('kekw',seat)};
  const action={uid:debater.uid,cell:'0,0',rotation:0},before=previewEffect(game,action);
  assert.deepEqual(before.swaps,[['0,0','1,0']]);
  assert.deepEqual(previewEffect({...game,abilityRework:false},action).swaps,[]);
  assert.deepEqual(before.flips,[]);
  const swapped=placeEffect(game,{...action,swapCells:before.swaps[0]});
  assert.deepEqual(swapped.last.flips,['1,1']);
  assert.equal(swapped.board['0,0'].uid,ally.uid);
  assert.equal(swapped.board['0,0'].rotation,2);
  assert.equal(swapped.board['1,0'].uid,debater.uid);
  assert.throws(()=>placeEffect(game,{...action,swapCells:['0,0','0,-1']}),/Kartentausch/);
 });

 test(`Brian's Storm can boost a 4 but still needs two enemies for seat ${seat}`,()=>{
  const game=trial(seat),brian=card('bad-luck-brian',seat,0,'storm');
  game.players[seat].hand=[brian];
  game.board={'1,0':card('pepe',1-seat),'-1,0':card('doge',1-seat)};
  const action={uid:brian.uid,cell:'0,0',rotation:0};
  const plan=previewEffect(game,action);
  assert.equal(previewEdgeTotals129(plan)[0],5);
  assert.deepEqual(placeEffect(game,action).last.attackEdges,[{dir:0,total:5}]);
  assert.equal(placeEffect({...game,abilityRework:false},action).last.attackEdges,undefined);
  assert.doesNotMatch(abilityDescription(game,'storm'),/\b3\b/);
  assert.match(abilityDescription({...game,abilityRework:false},'storm'),/\b3\b/);
  delete game.board['-1,0'];
  assert.equal(placeEffect(game,action).last.attackEdges,undefined);
 });

 test(`Two Buttons previews and resolves one extra flip or a temporary shield for seat ${seat}`,()=>{
  const game=trial(seat),enemy=1-seat,buttons=card('two-buttons',seat,0,'buttons');
  const drawn=card('cat-jam',seat);
  game.players[seat].hand=[buttons];
  game.players[seat].deck=[drawn,card('doge',seat)];
  game.board={'1,0':card('pepe',enemy,3)};
  const action={uid:buttons.uid,cell:'0,0',rotation:0};
  const attack={...action,buttonChoice:'attack'},defense={...action,buttonChoice:'defense'};
  const plain=previewEffect(game,action);
  assert.deepEqual(plain.flips,[]);
  assert.deepEqual(plain.buttonAttack,{dir:0,cell:'1,0'});
  assert.equal(plain.buttonDefense,2);
  assert.deepEqual(actionOptions(game,buttons,'0,0',0).map(choice=>choice.buttonChoice),[undefined,'attack','defense']);
  assert.equal(new Set([action,attack,defense].map(placementKey135)).size,3);
  const red=previewEffect(game,attack);
  assert.deepEqual(red.flips,['1,0']);
  assert.equal(previewEdgeTotals129(red)[0],8);
  const captured=placeEffect(game,attack,{chooseDraw:true});
  assert.deepEqual(captured.last.flips,red.flips);
  assert.deepEqual(captured.last.attackEdges,[{dir:0,total:8}]);
  assert.equal(captured.board['1,0'].controller,seat);
  assert.equal(captured.players[seat].hand[0].uid,drawn.uid);
  assert.ok(!captured.pendingDraw);
  const blue=previewEffect(game,defense);
  assert.equal(fieldFeedback129(game,blue.card,'0,0').bonuses[2],2);
  assert.deepEqual(blue.flips,[]);
  const shielded=placeEffect(game,defense);
  const guarded=shielded.board['0,0'];
  assert.deepEqual(wardEdge(shielded,guarded,'0,0'),{dir:2,amount:2,kind:'buttons'});
  assert.equal(fieldFeedback129(shielded,guarded,'0,0').bonuses[2],2);
  assert.equal(fieldFeedback129({...shielded,placements:2},guarded,'0,0').bonuses[2],0);
  assert.equal(game.board['0,0'],undefined);
  assert.equal(game.board['1,0'].controller,enemy);
  const legacy={...game,abilityRework:false};
  assert.throws(()=>previewEffect(legacy,attack),/nicht verfügbar/);
  assert.equal(placeEffect(legacy,action,{chooseDraw:true}).pendingDraw.side,seat);
  assert.throws(()=>previewEffect({...game,board:{}},attack),/nicht verfügbar/);

  const state=createPvp90([0,1].map(()=>({cards:starterDeck()})),13,1,{elementalTrial:true,abilityRework:true,randomAbilities:true});
  const updated=advancePvp90({...state,phase:'play',game},seat,{kind:'place',action:attack},2);
  assert.equal(updated.step.action.buttonChoice,'attack');
  assert.deepEqual(updated.game.last.flips,red.flips);
 });
}

test('New private and Random duels preserve the ruleset for both perspectives and the rematch',()=>{
 for(const kind of ['private','random']){
  let state=createPvp90([0,1].map(()=>({cards:starterDeck()})),13,1,{elementalTrial:true,abilityRework:true,randomAbilities:kind==='random'});
  state=advancePvp90(state,0,{kind:'gesture',value:'rock'},2);
  state=advancePvp90(state,1,{kind:'gesture',value:'scissors'},3);
  state=advancePvp90(state,0,{kind:'starter',side:0},4);
  for(const uid of ['host','guest'])assert.equal(projectPvp90({id:kind,kind,host_id:'host',guest_id:'guest',identities:[{},{}],state},uid).game.abilityRework,true);
  state.phase='between';
  state=advancePvp90(state,0,{kind:'ready'},5);
  state=advancePvp90(state,1,{kind:'ready'},6);
  assert.equal(state.game.abilityRework,true);
 }
});
