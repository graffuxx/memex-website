import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFINITIONS,expandGameDeck} from '../public/game/platform/catalog.mjs';
import {newGame,sideValue} from '../public/game/src/rules.mjs';
import {previewEffect,placeEffect,releasedIconicAbility} from '../public/game/src/table-demo-rules.mjs';
import {fieldFeedback129} from '../public/game/src/field-feedback129.mjs';
import {createPvp90,advancePvp90,expirePvp90,projectPvp90} from '../server/game/pvp90.mjs';
const regulars=DEFINITIONS.filter(c=>!c.prime&&!c.iconic);
function game(turn,block='-2,2'){
 const g=newGame({seed:13});
 Object.assign(g,{turn,starter:turn,block,board:{},abilityTrial:true,elementalTrial:true,allPrimes:true,eventFieldsEnabled:false,elementRules:5,rotationLocked:true});
 for(const p of g.players){p.hand=[];p.deck=[];}
 return g;
}
const make=(id,side,ability,rotation=0)=>({...expandGameDeck([id+':common'],side)[0],controller:side,rotation,ability});
const held=(g,c,cell='0,0')=>{g.players[g.turn].hand=[c];return {uid:c.uid,cell,rotation:0};};
for(const turn of [0,1]){
 const other=1-turn;
 test('Chase cannot continue through a card Jordan saved '+turn,()=>{
  const g=game(turn),move=held(g,make('why-are-you-running',turn,'chase'));
  const braced=regulars.find(d=>d.values[0]===7);
  assert.ok(braced);
  g.board={'-1,0':make(braced.id,other,braced.element),'-2,0':make('roll-safe',other,'air'),'-1,-1':make('crying-jordan',other,'bailout')};
  const result=previewEffect(g,move);
  assert.equal(result.bailout?.cell,'-1,0');
  assert.deepEqual(result.flips,[]);
  assert.equal(result.pursuit,null);
 });
 test('Double Rainbow needs a successful first capture despite Jordan '+turn,()=>{
  const g=game(turn),d=make('double-rainbow',turn,'rainbow'),move=held(g,d);
  g.board={'-1,0':make('triggered',other)};
  const vulnerable=regulars.find(def=>{
   g.board['1,0']=make(def.id,other);
   const plan=previewEffect(g,move),head=plan.comparisons[0];
   return head?.flip&&head.attack.total-head.defend.total<=1&&plan.rainbow?.cell==='-1,0';
  });
  assert.ok(vulnerable,'there needs to be one close first flip and one tie');
  g.board['2,0']=make('crying-jordan',other,'bailout');
  const result=previewEffect(g,move);
  assert.equal(result.bailout?.cell,'1,0');
  assert.deepEqual(result.flips,[]);
  assert.equal(result.rainbow,null);
 });
 test('Emotional Damage needs its own successful first flip despite Jordan '+turn,()=>{
  const g=game(turn),move=held(g,make('emotional-damage',turn,'pincer'));
  g.board={'-1,1':make('doge',other,'fire'),'0,1':make('nyan-cat',other,'air'),'1,0':make('yo-dawg',turn,'nested',4)};
  assert.equal(previewEffect(g,move).pincer?.cell,'0,1');
  g.board['-2,1']=make('crying-jordan',other,'bailout');
  const result=previewEffect(g,move);
  assert.equal(result.bailout?.cell,'-1,1');
  assert.deepEqual(result.flips,[]);
  assert.equal(result.pincer,null);
 });
 test('Rage Pivot respects Torwache and Earth follows the moved blockade '+turn,()=>{
  const g=game(turn,'1,0');
  g.placements=3;
  const move=held(g,make('rage-guy',turn,'rage'),'-1,1');
  const e=regulars.find(d=>d.element==='earth');
  g.board={'-2,1':make('sad-keanu',other,'water'), '1,1':make(e.id,other,'earth')};
  g.blockadeLock={owner:other,until:g.placements+1};
  assert.throws(()=>previewEffect(g,{...move,blockadeCell:'0,0'}),/Blockade/);
  assert.ok(fieldFeedback129(g,g.board['1,1'],'1,1').bonuses.some(x=>x===1));
  delete g.blockadeLock;
  const open=placeEffect(g,{...move,blockadeCell:'0,0'});
  assert.equal(open.block,'0,0');
  assert.deepEqual(fieldFeedback129(open,open.board['1,1'],'1,1').bonuses,[0,0,0,0,0,0]);
 });
 test('Scumbag Steve bypasses Numa shield up to two, S remains stronger '+turn,()=>{
  const g=game(turn);
  const move=held(g,make('scumbag-steve',turn,'swipe'));
  const defender={...make('capybara-chill',other,'water'),coverWard:{dir:5,owner:other,until:2,kind:'chorus',amount:2}};
  g.board={'-1,1':defender};
  assert.equal(previewEffect(g,move).swipe?.amount,2);
  g.board['-1,1']={...make('evil-ernie',other,'ernie',5),coverWard:defender.coverWard};
  assert.equal(previewEffect(g,move).swipe,null);
  assert.equal(sideValue(g.board['-1,1'],5),10);
 });
 test('Double Rainbow respects an innate element and KEKW rejects a numeric tie '+turn,()=>{
  const g=game(turn);
  const move=held(g,make('double-rainbow',turn,'rainbow'));
  g.board={'1,0':make('bad-luck-brian',other,'fire'),'-1,0':{...make('kekw',other,'laugh',1),laughOwner:other,laughUntil:2}};
  assert.deepEqual(previewEffect(g,move).flips,['1,0']);
  assert.equal(previewEffect(g,move).rainbow,null);
 });
 test('Blink shifts an Iconic with a single numeric flip after scoring '+turn,()=>{
  const g=game(turn);
  const move=held(g,make('double-rainbow',turn,'rainbow'));
  g.board={'1,0':make('bad-luck-brian',other,'fire'),'2,0':make('blinking-guy',other,'blink')};
  const next=placeEffect(g,move);
  assert.equal(next.board['1,0'].controller,turn);
  assert.equal(next.board['0,0'].rotation,1);
 });
 test('Chase cannot continue through a flip transferred by Overly Attached '+turn,()=>{
  const g=game(turn);
  const move=held(g,make('why-are-you-running',turn,'chase'));
  const ally=make('side-eye',other,'water');
  g.board={'-1,0':ally,'-2,0':make('roll-safe',other,'air'),'-1,-1':{...make('overly-attached',other,'cling'),attachedLink:{cell:'-1,0',uid:ally.uid}}};
  const next=previewEffect(g,move);
  assert.equal(next.attachment?.target,'-1,0');
  assert.deepEqual(next.flips,['-1,-1']);
  assert.equal(next.pursuit,null);
 });
}


test('the eight remaining Iconic abilities use the new private snapshot',()=>{
 const abilities={'rage-guy':'rage','two-buttons':'buttons','change-my-mind':'exchange','first-world-problems':'luxury',
  'confused-travolta':'wander','awkward-penguin':'awkward','always-has-been':'ambush','yo-dawg':'nested'};
 const catalog=DEFINITIONS.filter(c=>c.edition==='alpha'&&c.iconic);
 assert.equal(catalog.length,20);
 assert.equal(new Set(catalog.map(c=>releasedIconicAbility({id:c.ruleId},7))).size,20);
 for(const definition of catalog){
  const expected=abilities[definition.id];
  if(expected){
   assert.equal(releasedIconicAbility({id:definition.ruleId},6),null);
   assert.equal(releasedIconicAbility({id:definition.ruleId},7),expected);
  }
  const cards=[definition.id+':common','nuck-chorris:common',...regulars.slice(0,13).map(c=>c.id+':common')];
  for(const flags of [{},{elementalTrial:true,iconicAbilities:true,iconicAbilityWave:6},{elementalTrial:true,iconicAbilities:true,iconicAbilityWave:7}]){
   let state=createPvp90([{cards},{cards}],1489,0,flags);
   state=advancePvp90({...state,phase:'initiative',rpsWinner:0},0,{kind:'starter',side:0},1);
   const player=state.game.players[0],own=[...player.hand,...player.deck].find(c=>c.id===definition.ruleId);
   assert.equal(own.ability,releasedIconicAbility(own,flags.iconicAbilityWave??0)??undefined);
  }
 }
});

for(const seat of [0,1])test('Two Buttons choice is private, survives reconnect and times out without an AFK strike for seat '+seat,()=>{
 const cards=['two-buttons:common','nuck-chorris:common',...regulars.slice(0,13).map(c=>c.id+':common')];
 let state=createPvp90([{cards},{cards}],1489,0,{elementalTrial:true,iconicAbilities:true,iconicAbilityWave:7,allPrimes:true});
 state=advancePvp90({...state,phase:'initiative',rpsWinner:0},0,{kind:'starter',side:seat},2);
 const p=state.game.players[seat];
 const index=p.deck.findIndex(c=>c.id==='iconic-two-buttons');
 if(index>=0)[p.hand[0],p.deck[index]]=[p.deck[index],p.hand[0]];
 const played=p.hand.find(c=>c.id==='iconic-two-buttons');
 const [first,second]=p.deck;
 const cell=state.game.block==='0,0'?'1,0':'0,0';
 const pending=advancePvp90(state,seat,{kind:'place',action:{uid:played.uid,cell,rotation:0}},10);
 const names=['host','guest'];
 const row={id:'two-buttons',kind:'private',state:pending,identities:[{},{}],host_id:names[0],guest_id:names[1]};
 const own=projectPvp90(row,names[seat],10),other=projectPvp90(row,names[1-seat],10);
 assert.deepEqual(own.game.pendingDraw.options.map(c=>c.uid),[first.uid,second.uid]);
 assert.deepEqual(other.game.pendingDraw,{side:1});
 assert.deepEqual(other.step.after.pendingDraw,{side:1});
 assert.ok(other.game.players[1].deck.every(c=>c.hidden&&![first.uid,second.uid].includes(c.uid)));
 assert.equal(own.remainingMs,15000);
 assert.throws(()=>advancePvp90(pending,1-seat,{kind:'draw',index:1},11),/turn/);
 assert.throws(()=>advancePvp90(pending,seat,{kind:'draw',index:2},11),/Nachziehwahl/);
 assert.equal(expirePvp90(pending,pending.deadline-1),null);
 const draw=advancePvp90(pending,seat,{kind:'draw',index:1},11);
 assert.equal(draw.game.players[seat].hand.at(-1).uid,second.uid);
 assert.equal(draw.game.players[seat].deck[0].uid,first.uid);
 assert.equal(draw.game.placements,1);
 assert.equal(draw.game.turn,1-seat);
 const timed=expirePvp90(pending,pending.deadline);
 assert.equal(timed.game.players[seat].hand.at(-1).uid,first.uid);
 assert.equal(timed.game.placements,1);
 assert.deepEqual(timed.afkStreak129,[0,0]);
});
