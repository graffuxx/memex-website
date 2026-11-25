import test from 'node:test';
import assert from 'node:assert/strict';
import {expandGameDeck} from '../public/game/platform/catalog.mjs';
import {newGame,neighbors} from '../public/game/src/rules.mjs';
import {abilityDescription,AMBUSH_BONUS,PENGUIN_REWORK_WAVE,previewEffect} from '../public/game/src/table-demo-rules.mjs';
import {abilityMarkers} from '../public/game/src/ability-effects.mjs';
import {glossary,guideAbilities} from '../src/app/how-to-play/ability-reference.mjs';

test('all 35 Iconic and Prime explanations use board-relative language in game and in the guide',()=>{
 const cards=guideAbilities.filter(entry=>entry.category==='iconic'||entry.category==='prime');
 assert.equal(cards.filter(entry=>entry.category==='iconic').length,20);
 assert.equal(cards.filter(entry=>entry.category==='prime').length,15);
 const technicalDirection=/\b(?:nord(?:en|ost(?:en)?|west(?:en)?)?|süd(?:en|ost(?:en)?|west(?:en)?)?|ost(?:en)?|west(?:en)?|north(?:east|west)?|south(?:east|west)?|east|uhrzeigersinn|clockwise|counterclockwise)\b|\d+\s*°/i;
 for(const {id,name,trigger,effect} of cards){
  const current=abilityDescription({abilityRework:true,iconicAbilityWave:PENGUIN_REWORK_WAVE},id);
  const catalog=abilityDescription(null,id);
  const previous=abilityDescription({abilityRework:false},id);
  assert.equal(catalog,current,name);
  for(const description of [current,previous,trigger,effect]){
   assert.ok(description.trim(),name);
   assert.doesNotMatch(description,technicalDirection,name);
  }
 }
 assert.doesNotMatch(glossary.find(entry=>entry.term==='Draw').text,/Two Buttons/);
});

test('card previews without a match show the same Earth and Storm rules as new duels',()=>{
 for(const id of ['earth','storm']){
  const catalog=abilityDescription(null,id);
  assert.equal(catalog,abilityDescription({abilityRework:true,earthSupport:true},id));
  assert.notEqual(catalog,abilityDescription({abilityRework:false,earthSupport:false},id));
 }
});

function card(id,controller,rotation=0,ability){
 return {...expandGameDeck([id+':common'],controller)[0],controller,rotation,ability,uid:controller+':'+id};
}

test('Legacy Always Has Been can use a teammate across the card for any attack side',()=>{
 const game=Object.assign(newGame({seed:13}),{turn:0,block:'-2,2',abilityRework:true,abilityTrial:true,elementalTrial:true,elementRules:5,eventFieldsEnabled:false});
 const ambusher=card('always-has-been',0,0,'ambush');
 game.players[0].hand=[ambusher];
 const action={uid:ambusher.uid,cell:'0,0',rotation:0};
 const ring=neighbors(action.cell);
 const defenderRotations=[5,2,1,3,4,2];
 for(const {id,dir} of ring){
  const enemy=card('cat-jam',1,defenderRotations[dir]);
  const ally=card('roll-safe',0);
  game.board={[id]:enemy};
  const unsupported=previewEffect(game,action);
  assert.equal(unsupported.ambush,null);
  assert.deepEqual(unsupported.flips,[]);
  for(const offset of [1,2,3,4,5]){
   game.board={[id]:enemy,[ring[(dir+offset)%6].id]:ally};
   const result=previewEffect(game,action);
   if(offset===1||offset===5){
    assert.equal(result.ambush,null);
    continue;
   }
   assert.equal(result.ambush,dir);
   assert.deepEqual(result.flips,[id]);
   assert.equal(result.comparisons[0].attack.total,unsupported.comparisons[0].attack.total+AMBUSH_BONUS);
   assert.ok(abilityMarkers(game,result).some(marker=>marker.kind==='ambush'&&marker.dir===dir&&marker.preview));
  }
 }
 assert.ok(abilityDescription({abilityRework:true},'ambush').includes('+'+AMBUSH_BONUS));
});
