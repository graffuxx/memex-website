import test from 'node:test';
import assert from 'node:assert/strict';
import {RARITIES,starterDeck,validateDeck,countCards} from '../public/game/platform/catalog.mjs';
import {TEST_PACK_ODDS,TEST_COLLECTION_KEY,TEST_DECK_KEY,blankTestCollection,drawTestPack,rarityForRoll,addTestPack,readTestCollection,testInventory,readTestDeck} from '../public/game/platform/booster-test.mjs';
import {applyPortalDecks} from '../public/game/platform/deck-bridge.mjs';
import {createTacticsMatch} from '../public/game/src/table-demo-state.mjs';
import {LOADOUTS} from '../public/game/src/table-demo-rules.mjs';
import {roundStarter} from '../public/game/src/start-duel18.mjs';

test('return round reshuffles both physical decks without changing card pool, abilities, board or starter rotation',()=>{
 for(const seed of [51,92,783,2026]){
  const loadouts=['hype-guard','hype-twist'].map(k=>LOADOUTS[k]);
  const first=applyPortalDecks(createTacticsMatch({seed,starter:0}),starterDeck(),loadouts,{round:1});
  const second=applyPortalDecks(createTacticsMatch({seed,starter:roundStarter(0,2)}),starterDeck(),loadouts,{round:2});
  assert.equal(second.turn,1);assert.equal(second.block,first.block);assert.deepEqual(second.eventCells,first.eventCells);assert.equal(second.crossfireOffset,first.crossfireOffset);assert.equal(second.resonanceOffset,first.resonanceOffset);
  for(let side=0;side<2;side++){
   const a=[...first.players[side].hand,...first.players[side].deck],b=[...second.players[side].hand,...second.players[side].deck];
   assert.deepEqual(countCards(a.map(c=>c.variantId)),countCards(b.map(c=>c.variantId)));
   assert.notDeepEqual(a.map(c=>c.uid),b.map(c=>c.uid));assert.notDeepEqual(a.slice(0,5).map(c=>c.uid),b.slice(0,5).map(c=>c.uid));
   assert.deepEqual([...a].sort((a,b)=>a.uid.localeCompare(b.uid)),[...b].sort((a,b)=>a.uid.localeCompare(b.uid)));
  }
  assert.deepEqual(second.players,applyPortalDecks(createTacticsMatch({seed,starter:1}),starterDeck(),loadouts,{round:2}).players);
 }
});
test('five-card test boosters guarantee Silver or better and exactly match published per-slot odds',()=>{
 for(const weights of Object.values(TEST_PACK_ODDS)){
  assert.equal(weights.reduce((s,[,n])=>s+n,0),10000);const counts={};
  for(let i=0;i<10000;i++){const rarity=rarityForRoll(weights,(i+.5)/10000);counts[rarity]=(counts[rarity]??0)+1;}
  assert.deepEqual(counts,Object.fromEntries(weights));
 }
 for(const value of [0,.6999,.7,.92,.985,.998,.99999]){const cards=drawTestPack(()=>value);assert.equal(cards.length,5);assert.notEqual(cards[4].split(':')[1],'common');}
 for(const value of [-1,1,NaN,Infinity])assert.throws(()=>drawTestPack(()=>value));
 assert.equal(RARITIES.length,5);
});
test('test copies persist separately, duplicates count, a retry cannot award the same pack twice, and decks validate',()=>{
 const storage={data:new Map(),getItem(key){return this.data.get(key)??null;}};
 assert.deepEqual(readTestCollection(storage),blankTestCollection());
 const first=addTestPack(blankTestCollection(),['pepe:epic','doge:rare','pepe:epic','roll-safe:common','doge:mythic'],'test-1');
 assert.equal(first.inventory['pepe:epic'],2);assert.equal(first.openedPacks,1);assert.equal(first.lastPack.newIds.filter(id=>id==='pepe:epic').length,1);
 assert.equal(addTestPack(first,first.lastPack.cards,'test-1'),first);
 storage.data.set(TEST_COLLECTION_KEY,JSON.stringify(first));assert.deepEqual(readTestCollection(storage),first);
 const inventory=testInventory(first),deck=starterDeck();deck[0]='pepe:epic';assert.equal(validateDeck(deck,inventory).valid,true);
 storage.data.set(TEST_DECK_KEY,JSON.stringify({version:1,name:'Booster deck',cards:deck}));assert.deepEqual(readTestDeck(storage,inventory).cards,deck);
 storage.data.set(TEST_COLLECTION_KEY,'{broken');assert.deepEqual(readTestCollection(storage),blankTestCollection());
 storage.data.set(TEST_COLLECTION_KEY,JSON.stringify({...first,inventory:{fake:100}}));assert.deepEqual(readTestCollection(storage),blankTestCollection());
 assert.equal(storage.data.has('duelverse.guest-deck.v1'),false);
});
