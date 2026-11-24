import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFINITIONS,starterDeck,expandGameDeck} from '../public/game/platform/catalog.mjs';
import {CELLS,newGame,moveTargets,sideValue,freeCells} from '../public/game/src/rules.mjs';
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


test('New private duels start the latest ability wave and older games retain their original wave',()=>{
 const deck=[...starterDeck().slice(0,2),'good-guy-greg:epic','kekw:mythic','forever-alone:common','double-rainbow:rare','scumbag-steve:rare','epic-sax-guy:common','take-my-money:rare','is-this-a-pigeon:common','why-are-you-running:rare','overly-manly-man:common','no-god-please-no:rare','philosoraptor:common','evil-ernie:rare'];
 const decks=[{cards:deck},{cards:deck}];
 for(const flags of [{elementalTrial:true,iconicAbilities:true,iconicAbilityWave:6},{elementalTrial:true,iconicAbilities:true,iconicAbilityWave:5},{elementalTrial:true,iconicAbilities:true,iconicAbilityWave:4},{elementalTrial:true,iconicAbilities:true,iconicAbilityWave:3},{elementalTrial:true,iconicAbilities:true,iconicAbilityWave:2},{elementalTrial:true,iconicAbilities:true},{elementalTrial:true},{}]){
  let state=createPvp90(decks,9,1,flags);
  state=advancePvp90(state,0,{kind:'gesture',value:'rock'},2);
  state=advancePvp90(state,1,{kind:'gesture',value:'scissors'},3);
  state=advancePvp90(state,0,{kind:'starter',side:0},4);
  for(const player of state.game.players){
   const assigned=[...player.hand,...player.deck];
   assert.equal(assigned.find(c=>c.variantId==='good-guy-greg:epic').ability,flags.iconicAbilities?'sidestep':undefined);
   assert.equal(assigned.find(c=>c.variantId==='kekw:mythic').ability,flags.iconicAbilities?'laugh':undefined);
   assert.equal(assigned.find(c=>c.variantId==='forever-alone:common').ability,flags.iconicAbilityWave>=2?'solitude':undefined);
   assert.equal(assigned.find(c=>c.variantId==='double-rainbow:rare').ability,flags.iconicAbilityWave>=2?'rainbow':undefined);
   assert.equal(assigned.find(c=>c.variantId==='scumbag-steve:rare').ability,flags.iconicAbilityWave>=3?'swipe':undefined);
   assert.equal(assigned.find(c=>c.variantId==='epic-sax-guy:common').ability,flags.iconicAbilityWave>=3?'encore':undefined);
   assert.equal(assigned.find(c=>c.variantId==='take-my-money:rare').ability,flags.iconicAbilityWave>=4?'bid':undefined);
   assert.equal(assigned.find(c=>c.variantId==='is-this-a-pigeon:common').ability,flags.iconicAbilityWave>=4?'decoy':undefined);
   assert.equal(assigned.find(c=>c.variantId==='why-are-you-running:rare').ability,flags.iconicAbilityWave>=5?'chase':undefined);
   assert.equal(assigned.find(c=>c.variantId==='overly-manly-man:common').ability,flags.iconicAbilityWave>=5?'cover':undefined);
   assert.equal(assigned.find(c=>c.variantId==='no-god-please-no:rare').ability,flags.iconicAbilityWave===6?'objection':undefined);
   assert.equal(assigned.find(c=>c.variantId==='philosoraptor:common').ability,flags.iconicAbilityWave===6?'thought':undefined);
   assert.equal(assigned.find(c=>c.variantId==='evil-ernie:rare').ability,undefined);
  }
 }
 const released=DEFINITIONS.filter(d=>releasedIconicAbility(makeCard(d.id+':common',0))).map(d=>d.id).sort();
 assert.deepEqual(released,['good-guy-greg','kekw']);
});
for(const seat of [0,1]){
 test(`Forever Alone defends its weakest available edge only when isolated for starter ${seat}`,()=>{
  const game=trial(),other=1-seat;
  Object.assign(game,{turn:other,starter:seat,elementalTrial:true,elementRules:5});
  const defender={...makeCard('forever-alone:common',seat,'solitude'),controller:seat};
  const attacker=makeCard('diamond-hands:common',other);
  game.board['0,0']=defender;
  game.players[other].hand=[attacker];
  const play={uid:attacker.uid,cell:'0,1'};
  assert.equal(previewEffect(game,play).comparisons[0].defend.ability,1);
  assert.equal(previewEffect(game,play).comparisons[0].flip,false);
  assert.deepEqual(abilityMarkers(game,null),[{kind:'solitude',cell:'0,0',dir:1,label:'+1'}]);
  assert.equal(fieldFeedback129(game,defender,'0,0').bonuses[1],1);
  game.board['1,0']={...makeCard('doge:common',seat),controller:seat};
  assert.equal(previewEffect(game,play).comparisons.find(c=>c.cell==='0,0').flip,true);
  game.board['1,0'].controller=other;
  assert.equal(previewEffect(game,play).comparisons.find(c=>c.cell==='0,0').flip,false);
  game.block='0,1';
  assert.equal(abilityMarkers(game,null).find(m=>m.kind==='solitude').dir,2);
 });

 test(`Double Rainbow adds at most one numeric tie in clockwise order and respects KEKW for starter ${seat}`,()=>{
  const game=trial(),other=1-seat;
  Object.assign(game,{turn:seat,starter:seat,elementalTrial:true,elementRules:5});
  const double=makeCard('double-rainbow:common',seat,'rainbow');
  const enemy={...makeCard('bad-luck-brian:common',other),controller:other};
  game.players[seat].hand=[double];
  game.board={'1,0':{...enemy,uid:'east'},'-1,0':{...makeCard('triggered:common',other),controller:other},'0,1':{...makeCard('side-eye:common',other),controller:other}};
  const move={uid:double.uid,cell:'0,0'};
  const plan=previewEffect(game,move);
  assert.deepEqual(plan.flips,['1,0','-1,0']);
  assert.deepEqual(plan.rainbow,{cell:'-1,0',dir:3});
  assert.ok(abilityMarkers(game,plan).some(m=>m.kind==='rainbow'&&m.dir===3));
  const placed=placeEffect(game,move);
  assert.equal(placed.board['0,1'].controller,other);
  assert.deepEqual(abilityBursts(placed),[{kind:'rainbow',cell:'-1,0',dir:0,label:'⌒'}]);
  delete game.board['1,0'];
  assert.deepEqual(previewEffect(game,move).flips,[]);
  game.board['1,0']={...enemy,uid:'east'};
  game.board['-1,0']={...makeCard('kekw:common',other,'laugh'),controller:other,rotation:1,laughOwner:other,laughUntil:2};
  assert.deepEqual(previewEffect(game,move).flips,['1,0']);
  assert.equal(previewEffect(game,move).rainbow,null);
  game.board['-1,0']={...makeCard('triggered:common',other),controller:other};
  game.board['0,1']={...makeCard('coffin-dance:common',other),controller:other};
  assert.deepEqual(previewEffect(game,move).flips,['1,0','0,1']);
  assert.deepEqual(previewEffect(game,move).rainbow,{cell:'0,1',dir:1});
 });
}
for(const seat of [0,1]){
 test(`Scumbag Steve bypasses up to two points of only one useful defense bonus for starter ${seat}`,()=>{
  const game=trial(),opponent=1-seat,steve=makeCard('scumbag-steve:common',seat,'swipe');
  Object.assign(game,{turn:seat,starter:seat,elementalTrial:true,elementRules:5});
  game.players[seat].hand=[steve];
  const guarded=(id,dir)=>({...makeCard(id+':common',opponent,'water'),controller:opponent,rotation:0,guardDirection:dir,guardOwner:opponent,guardUntil:2});
  game.board={'-1,1':guarded('capybara-chill',5),'-1,0':guarded('sad-keanu',0)};
  const action={uid:steve.uid,cell:'0,0'};
  const plan=previewEffect(game,action);
  assert.deepEqual(plan.flips,['-1,1']);
  assert.deepEqual(plan.swipe,{cell:'-1,1',dir:2,amount:2});
  assert.equal(plan.comparisons[0].defend.ability,0);
  assert.equal(plan.comparisons[1].defend.ability,2);
  assert.equal(game.board['-1,1'].guardOwner,opponent);
  const after=placeEffect(game,action);
  assert.equal(after.board['-1,0'].controller,opponent);
  assert.deepEqual(abilityBursts(after),[{kind:'swipe',cell:'-1,1',dir:5,label:'−2'}]);
  game.board['-1,1'].guardUntil=0;
  const open=previewEffect(game,action);
  assert.deepEqual(open.flips,['-1,1','-1,0']);
  assert.deepEqual(open.swipe,{cell:'-1,0',dir:3,amount:2});
 });

 test(`Epic Sax Guy rotates only after one flip for starter ${seat}`,()=>{
  const game=trial(),opponent=1-seat,sax=makeCard('epic-sax-guy:common',seat,'encore');
  Object.assign(game,{turn:seat,starter:seat,elementalTrial:true,elementRules:5});
  game.players[seat].hand=[sax];
  const enemy=id=>({...makeCard(id+':common',opponent),controller:opponent,rotation:0});
  game.board['-1,1']=enemy('capybara-chill');
  const action={uid:sax.uid,cell:'0,0',rotation:0,pivotDirection:-1};
  const plan=previewEffect(game,action);
  assert.deepEqual(plan.flips,['-1,1']);
  assert.equal(plan.card.rotation,0);
  assert.deepEqual(plan.pivot,{cell:'0,0',uid:sax.uid,from:0,to:5});
  assert.ok(abilityMarkers(game,plan).some(m=>m.kind==='encore'&&m.cell==='0,0'));
  const after=placeEffect(game,action);
  assert.equal(after.board['0,0'].rotation,5);
  assert.equal(after.board['-1,1'].rotation,0);
  assert.deepEqual(after.last.flips,['-1,1']);
  assert.ok(abilityBursts(after).some(m=>m.kind==='encore'&&m.label==='↶'));
  assert.ok(legalCandidates(game).some(({action:a})=>a.cell==='0,0'&&a.pivotDirection===1));
  game.board['-1,0']=enemy('sad-keanu');
  assert.throws(()=>previewEffect(game,action),/Drehung/);
  game.board={};
  assert.throws(()=>previewEffect(game,action),/Drehung/);
 });
}
for(const seat of [0,1]){
 test(`Take My Money may spend a blockade charge for one winning edge while behind for starter ${seat}`,()=>{
  const game=trial(),other=1-seat,money=makeCard('take-my-money:common',seat,'bid');
  Object.assign(game,{turn:seat,starter:seat,elementalTrial:true,elementRules:5});
  game.players[seat].hand=[money];
  game.board={
   '1,0':{...makeCard('sad-keanu:common',other),controller:other},
   '-1,0':{...makeCard('seal-of-approval:common',other),controller:other},
  };
  const action={uid:money.uid,cell:'0,0'};
  const before=structuredClone(game);
  const initial=previewEffect(game,action);
  assert.deepEqual(initial.flips,[]);
  assert.deepEqual(initial.bidTargets,[0,3]);
  const chosen={...action,bidDirection:0};
  const plan=previewEffect(game,chosen);
  assert.deepEqual(game,before);
  assert.deepEqual(plan.flips,['1,0']);
  assert.deepEqual(abilityMarkers(game,plan),[{kind:'bid',cell:'0,0',dir:0,preview:true,label:'+1'}]);
  const next=placeEffect(game,chosen);
  assert.equal(next.players[seat].shifts,0);
  assert.equal(next.block,game.block);
  assert.equal(next.board['-1,0'].controller,other);
  assert.equal(placeEffect(game,action).players[seat].shifts,1);
  assert.ok(legalCandidates(game).some(({action:a})=>a.cell==='0,0'&&a.bidDirection===3));
  assert.throws(()=>previewEffect(game,{...action,bidDirection:1}),/Nachschlag/);
  game.players[seat].shifts=0;
  assert.throws(()=>previewEffect(game,chosen),/Nachschlag/);
  game.players[seat].shifts=1;
  game.board['0,1']={...makeCard('doge:common',seat),controller:seat};
  game.board['0,-1']={...makeCard('pepe:common',seat),controller:seat};
  assert.throws(()=>previewEffect(game,chosen),/Nachschlag/);
 });

 test(`Pigeon can misread one numeric edge without changing cards or ignoring shields for starter ${seat}`,()=>{
  const game=trial(),other=1-seat,pigeon=makeCard('is-this-a-pigeon:common',seat,'decoy');
  Object.assign(game,{turn:seat,starter:seat,elementalTrial:true,elementRules:5});
  game.players[seat].hand=[pigeon];
  const enemy=(id,extras={})=>({...makeCard(id+':common',other),controller:other,rotation:0,...extras});
  game.board={'1,0':enemy('side-eye'),'-1,0':enemy('sad-keanu')};
  const action={uid:pigeon.uid,cell:'0,0'};
  const plan=previewEffect(game,action);
  assert.deepEqual(plan.flips,['1,0']);
  assert.deepEqual(plan.decoy,{cell:'1,0',dir:3,amount:2});
  assert.equal(plan.comparisons[0].defend.base,5);
  assert.equal(plan.comparisons[0].defend.total,3);
  assert.equal(abilityMarkers(game,plan).find(m=>m.kind==='decoy').label,'−2');
  const next=placeEffect(game,action);
  assert.equal(next.board['0,0'].element,'air');
  assert.equal(next.board['1,0'].rotation,0);
  assert.equal(sideValue(next.board['1,0'],3),5);
  assert.deepEqual(next.last.decoy,plan.decoy);
  assert.equal(next.board['-1,0'].controller,other);

  game.board={'-1,0':enemy('sad-keanu',{ability:'water',guardOwner:other,guardDirection:0,guardUntil:2})};
  assert.equal(previewEffect(game,action).decoy,null);
  game.board['-1,0'].guardUntil=0;
  assert.deepEqual(previewEffect(game,action).flips,['-1,0']);

  game.board={'1,0':enemy('evil-ernie',{rotation:3})};
  assert.equal(previewEffect(game,action).decoy,null);
  assert.equal(previewEffect(game,action).comparisons[0].defend.rank,'S');

  game.board={'0,1':enemy('kekw',{ability:'laugh',rotation:3,laughOwner:other,laughUntil:2})};
  assert.deepEqual(previewEffect(game,action).flips,[]);
  assert.deepEqual(previewEffect({...game,placements:2},action).flips,['0,1']);
 });
}
for(const seat of [0,1]){
 test(`Kein Entkommen works on the last open cell with at most one extra flip for starter ${seat}`,()=>{
  const game=trial(),other=1-seat,chaser=makeCard('why-are-you-running:common',seat,'chase');
  Object.assign(game,{turn:seat,starter:seat,block:'2,-2',elementalTrial:true,elementRules:5,placements:17});
  game.players[seat].hand=[chaser];
  const cardAt=(id,controller,cell)=>({...makeCard(id+':common',controller),uid:id+'@'+cell,controller});
  game.board=Object.fromEntries(CELLS.filter(c=>c.id!==game.block&&c.id!=='0,0').map(c=>[c.id,cardAt('doge',seat,c.id)]));
  game.board['-1,0']=cardAt('side-eye',other,'-1,0');
  game.board['-2,0']=cardAt('roll-safe',other,'-2,0');
  game.board['0,-1']=cardAt('pepe',other,'0,-1');
  game.board['0,-2']=cardAt('diamond-hands',other,'0,-2');
  const action={uid:chaser.uid,cell:'0,0'};
  assert.deepEqual(freeCells(game),['0,0']);
  const plan=previewEffect(game,action);
  assert.deepEqual(plan.flips,['-1,0','0,-1','-2,0']);
  assert.deepEqual(plan.pursuit,{cell:'-2,0',dir:0,through:'-1,0'});
  const ranged=plan.comparisons.find(c=>c.pursuit);
  assert.deepEqual([ranged.attack.total,ranged.defend.total],[6,5]);
  assert.ok(abilityMarkers(game,plan).some(m=>m.kind==='chase'&&m.cell==='-2,0'));
  const next=placeEffect(game,action);
  assert.equal(next.finished,true);
  assert.equal(next.board['0,-2'].controller,other);
  assert.equal(next.board['-2,0'].controller,seat);
  assert.deepEqual(next.last.pursuit,plan.pursuit);
  assert.ok(abilityBursts(next).some(m=>m.kind==='chase'&&m.cell==='-2,0'));

  delete game.board['0,-1'];
  game.board['-2,0']=cardAt('evil-ernie',other,'-2,0');
  assert.deepEqual(previewEffect(game,action).flips,['-1,0']);
  game.board['-1,0']=cardAt('evil-ernie',other,'-1,0');
  game.board['-2,0']=cardAt('roll-safe',other,'-2,0');
  assert.deepEqual(previewEffect(game,action).flips,[]);
 });

 test(`Rückendeckung protects up to two Regular allies for one opposing turn for starter ${seat}`,()=>{
  const game=trial(),other=1-seat,manly=makeCard('overly-manly-man:common',seat,'cover');
  Object.assign(game,{turn:seat,starter:seat,elementalTrial:true,elementRules:5});
  const ally=id=>({...makeCard(id+':common',seat),controller:seat,rotation:0});
  game.board={'1,0':ally('doge'),'0,1':ally('side-eye'),'-1,0':ally('pepe')};
  game.players[seat].hand=[manly];
  const attacker=makeCard('rage-hamster:common',other);
  game.players[other].hand=[attacker];
  const action={uid:manly.uid,cell:'0,0'};
  const plan=previewEffect(game,action);
  assert.deepEqual(plan.coverWards,[{cell:'1,0',dir:1},{cell:'0,1',dir:2}]);
  assert.equal(abilityMarkers(game,plan).filter(m=>m.kind==='cover'&&m.label==='+1').length,2);
  const next=placeEffect(game,action);
  assert.equal(next.board['-1,0'].coverWard,undefined);
  assert.equal(next.board['1,0'].coverWard.owner,seat);
  assert.equal(fieldFeedback129(next,next.board['1,0'],'1,0').bonuses[1],1);
  const reply={uid:attacker.uid,cell:'1,1'};
  assert.equal(previewEffect(next,reply).comparisons.find(c=>c.cell==='1,0').flip,false);
  const after=placeEffect(next,reply);
  assert.equal(fieldFeedback129(after,after.board['1,0'],'1,0').bonuses[1],0);
  const state={...createPvp90([{cards:starterDeck()},{cards:starterDeck()}],7),game:next};
  const guest=projectPvp90({id:'trial',kind:'private',host_id:'host',guest_id:'guest',identities:[{},{}],state},'guest');
  assert.equal(guest.game.board['1,0'].coverWard.owner,other);
 });
}
for(const seat of [0,1]){
 test(`Einspruch stops one close direct flip in a multi-capture once per round for starter ${seat}`,()=>{
  const game=trial(),other=1-seat;
  Object.assign(game,{turn:seat,starter:seat,elementalTrial:true,elementRules:5});
  const rainbow=makeCard('double-rainbow:common',seat,'rainbow');
  const ernie=makeCard('evil-ernie:common',seat,'ernie');
  const objector={...makeCard('no-god-please-no:common',other,'objection'),controller:other,rotation:0};
  const defender=id=>({...makeCard(id+':common',other),controller:other,rotation:0});
  game.players[seat].hand=[rainbow,ernie];
  game.board={'1,0':objector,'-1,0':defender('capybara-chill')};
  const action={uid:rainbow.uid,cell:'0,0'};
  const plan=previewEffect(game,action);
  assert.deepEqual(plan.flips,['-1,0']);
  assert.deepEqual(plan.objection,{cell:'1,0',dir:3});
  assert.deepEqual(plan.comparisons.map(c=>[c.attack.total,c.defend.total]),[[8,7],[4,3]]);
  assert.equal(game.board['1,0'].objectionSpent,undefined);
  assert.ok(abilityMarkers(game,plan).some(m=>m.kind==='objection'&&m.cell==='1,0'));
  const next=placeEffect(game,action);
  assert.equal(next.board['1,0'].controller,other);
  assert.equal(next.board['1,0'].objectionSpent,true);
  assert.ok(abilityBursts(next).some(m=>m.kind==='objection'&&m.cell==='1,0'));
  game.board['1,0'].objectionSpent=true;
  assert.deepEqual(previewEffect(game,action).flips,['1,0','-1,0']);
  game.board['1,0'].objectionSpent=false;
  game.board['1,0'].rotation=1;
  assert.equal(previewEffect(game,action).objection,null);
  game.board['1,0'].rotation=0;
  game.board['-1,0']=defender('nyan-cat');
  assert.deepEqual(previewEffect(game,{...action,uid:ernie.uid}).flips,['1,0','-1,0']);
  delete game.board['-1,0'];
  assert.deepEqual(previewEffect(game,action).flips,['1,0']);
 });

 test(`Gedankenexperiment swaps only two unflipped enemy Regulars and keeps orientation for starter ${seat}`,()=>{
  const game=trial(),other=1-seat,thinker=makeCard('philosoraptor:common',seat,'thought');
  Object.assign(game,{turn:seat,starter:seat,elementalTrial:true,elementRules:5});
  game.players[seat].hand=[thinker];
  const enemy=(id,extras={})=>({...makeCard(id+':common',other),controller:other,rotation:0,...extras});
  const first=enemy('nyan-cat',{rotation:2}),second=enemy('side-eye');
  game.board={'1,0':first,'0,1':second,'-1,0':enemy('capybara-chill')};
  const action={uid:thinker.uid,cell:'0,0'};
  const before=structuredClone(game);
  const choice={...action,swapCells:['1,0','0,1']};
  const plan=previewEffect(game,choice);
  assert.deepEqual(plan.swaps,[['0,1','1,0']]);
  assert.deepEqual(plan.flips,['-1,0']);
  assert.deepEqual(game,before);
  assert.ok(abilityMarkers(game,plan).some(m=>m.kind==='thought'&&m.cell==='1,0'));
  const after=placeEffect(game,choice);
  assert.deepEqual(after.board['0,1'],first);
  assert.deepEqual(after.board['1,0'],second);
  assert.equal(after.board['-1,0'].controller,seat);
  assert.ok(legalCandidates(game).some(({action:a})=>a.cell==='0,0'&&a.swapCells));
  assert.throws(()=>previewEffect(game,{...action,swapCells:['1,0','-1,0']}),/Kartentausch/);
  game.board['1,0']=enemy('kekw');
  assert.deepEqual(previewEffect(game,action).swaps,[]);
  game.board['0,2']=enemy('doge');
  const follow=placeEffect(game,{...action,swapCells:['0,1','0,2']});
  assert.equal(follow.board['0,2'].uid,second.uid);
  assert.equal(follow.board['0,1'].variantId,'doge:common');
 });
}
