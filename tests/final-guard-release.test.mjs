import test from 'node:test';
import assert from 'node:assert/strict';
import {expandGameDeck} from '../public/game/platform/catalog.mjs';
import {CELLS,newGame,scores} from '../public/game/src/rules.mjs';
import {abilityMarkers} from '../public/game/src/ability-effects.mjs';
import {previewEffect,placeEffect} from '../public/game/src/table-demo-rules.mjs';

function closingFixture(starter,attacker,ability){
 const turn=1-starter,game=newGame({seed:91,starter});
 Object.assign(game,{turn,placements:17,block:'2,-2',rotationLocked:true,eventFieldsEnabled:false,elementalTrial:true,allPrimes:true,abilityTrial:true});
 const card=(id,side,cell)=>({...expandGameDeck([id+':common'],side)[0],uid:id+'@'+cell,controller:side,rotation:0});
 game.board=Object.fromEntries(CELLS.filter(c=>c.id!==game.block&&c.id!=='0,0').map(c=>[c.id,card('doge',turn,c.id)]));
 const incoming={...card(attacker,turn,'hand'),ability};
 game.players[turn].hand=[incoming];
 return {game,card,action:{uid:incoming.uid,cell:'0,0',rotation:0}};
}

for(const starter of [0,1]){
 test('automatic closing guard stops one numeric capture on either starting seat '+starter,()=>{
  const {game,card,action}=closingFixture(starter,'why-are-you-running','chase');
  game.board['-1,0']=card('side-eye',starter,'-1,0');
  game.board['-2,0']=card('roll-safe',starter,'-2,0');
  game.board['0,-1']=card('pepe',starter,'0,-1');
  const normal=previewEffect(game,action);
  assert.deepEqual(normal.flips,['-1,0','0,-1','-2,0']);
  const guarded={...game,finalGuard:true};
  const planned=previewEffect(guarded,action);
  assert.equal(planned.comparisons.filter(a=>a.finalGuard).length,1);
  assert.deepEqual(planned.flips,['0,-1']);
  assert.equal(planned.pursuit,null);
  const done=placeEffect(guarded,action);
  assert.equal(done.board['-1,0'].controller,starter);
  assert.equal(done.board['0,-1'].controller,1-starter);
  assert.equal(done.finished,true);
  assert.deepEqual(done.last.finalGuard,{cell:'-1,0',uid:game.board['-1,0'].uid});
  assert.deepEqual(abilityMarkers(game,planned).find(m=>m.kind==='final-guard'),
    {kind:'final-guard',cell:'-1,0',preview:true,label:'SCHLUSSSCHUTZ'});
  assert.deepEqual(abilityMarkers(done,null,{finalGuardLabel:'FINAL GUARD'}).find(m=>m.kind==='final-guard'),
    {kind:'final-guard',cell:'-1,0',label:'FINAL GUARD'});
  assert.equal(scores(done).reduce((a,b)=>a+b),18);
  assert.equal(game.board['0,0'],undefined);
  const earlier={...guarded,placements:15};
  assert.deepEqual(previewEffect(earlier,action).flips,normal.flips);
 });

 test('S still captures in the last move and the numeric guard can save another card '+starter,()=>{
  const {game,card,action}=closingFixture(starter,'evil-ernie','ernie');
  game.board['1,0']=card('sad-keanu',starter,'1,0');
  game.board['0,1']=card('pepe',starter,'0,1');
  const guarded={...game,finalGuard:true};
  const plan=previewEffect(guarded,action);
  assert.equal(plan.comparisons[0].attack.rank,'S');
  assert.deepEqual(plan.flips,['1,0']);
  assert.equal(plan.comparisons[1].finalGuard,true);
  assert.equal(plan.ward?.cell,'1,0');
 });

 test('S cannot trigger or consume the automatic numeric guard when it is the only attack '+starter,()=>{
  const {game,card,action}=closingFixture(starter,'evil-ernie','ernie');
  game.board['1,0']=card('sad-keanu',starter,'1,0');
  const guarded={...game,finalGuard:true};
  assert.deepEqual(previewEffect(guarded,action).flips,['1,0']);
  assert.equal(previewEffect(guarded,action).comparisons.some(a=>a.finalGuard),false);
 });

}
