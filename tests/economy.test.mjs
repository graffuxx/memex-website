import test from 'node:test';import assert from 'node:assert/strict';
import {DEFINITIONS,VARIANTS,starterInventory,starterDeck} from '../public/game/platform/catalog.mjs';
import {RESOURCE_NAMES,BOOSTER_OFFER,CRAFT_COST,DISMANTLE_VALUE,roundPixels,protectedCopies,tradeQuote} from '../public/game/platform/economy30.mjs';
test('only Regular cards through Gold are craftable and every craft-dismantle cycle costs Echoes',()=>{
 assert.deepEqual(CRAFT_COST,{common:100,rare:400,epic:1600});
 assert.deepEqual(RESOURCE_NAMES,{premium:'Shards',earned:'Pixels',crafting:'Echoes'});
 assert.deepEqual(BOOSTER_OFFER,{cards:5,pixels:100,shards:150,minimumFinish:'rare',active:true});
 assert.deepEqual([roundPixels('win'),roundPixels('loss'),roundPixels('draw')],[5,2,2]);assert.throws(()=>roundPixels('aborted'));
 assert.equal(tradeQuote('craft','doge:rare',{pixels:10000,shards:10000}).allowed,false); // Neither wallet substitutes for Echoes.
 for(const variant of VARIANTS){
  const card=DEFINITIONS.find(definition=>definition.id===variant.definitionId);
  const quote=tradeQuote('craft',variant.id,{echoes:1600});
  const craftable=card.category==='regular'&&variant.edition!=='recruiter'&&['common','rare','epic'].includes(variant.rarity);
  assert.equal(quote.allowed,craftable,variant.id);
  if(quote.allowed)assert.ok(quote.echoes>DISMANTLE_VALUE[variant.rarity]);
 }
 assert.equal(tradeQuote('craft','doge:rare',{echoes:399}).allowed,false);
 assert.equal(tradeQuote('craft','doge:rare',{echoes:400}).allowed,true);
 assert.equal(tradeQuote('craft','doge:epic',{echoes:1600,inventory:{'doge:epic':100000}}).allowed,false);
});
test('dismantling protects starter and deck copies using highest per-deck use, not the sum across decks',()=>{
 const decks=[{cards:starterDeck()},{cards:starterDeck()}];
 assert.equal(protectedCopies('pepe:common',decks),1);
 assert.equal(tradeQuote('dismantle','pepe:common',{inventory:starterInventory(),decks}).allowed,false);
 assert.equal(tradeQuote('dismantle','pepe:common',{inventory:{'pepe:common':4},decks}).allowed,true);
 const saved=[{cards:['smudge:epic','smudge:epic']},{cards:['smudge:epic','smudge:epic']}];
 assert.equal(protectedCopies('smudge:epic',saved),1);
 assert.equal(tradeQuote('dismantle','smudge:epic',{inventory:{'smudge:epic':3},decks:saved}).allowed,true);
 assert.equal(tradeQuote('dismantle','smudge:epic',{inventory:{'smudge:epic':1},decks:saved}).allowed,false);
});
