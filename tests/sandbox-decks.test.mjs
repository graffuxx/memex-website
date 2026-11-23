import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFINITIONS,VARIANTS,RARITIES,starterInventory,validateDeck} from '../public/game/platform/catalog.mjs';
import {fullTestDeckInventory,blankTestCollection,testInventory} from '../public/game/platform/booster-test.mjs';
import {addDeckCard,makeEditorDeck,commitEditorDeck,readDeckLibrary,persistDeckLibrary,libraryKey} from '../public/game/platform/deck-library28.mjs';
import {readPlayDeck,PLAY_DECK_KEY,applyPortalDecks} from '../public/game/platform/deck-bridge.mjs';
import {createTacticsMatch,demoAction} from '../public/game/src/table-demo-state.mjs';
import {LOADOUTS,placeEffect} from '../public/game/src/table-demo-rules.mjs';

test('sandbox grants one editor copy of every finish without modifying collection ownership',()=>{
 const collection=blankTestCollection(),before=JSON.stringify(collection),inventory=fullTestDeckInventory();
 assert.equal(Object.keys(inventory).length,VARIANTS.length);
 for(const v of VARIANTS)assert.equal(inventory[v.id],1);
 inventory['pepe:common']=99;assert.equal(fullTestDeckInventory()['pepe:common'],1);
 assert.equal(JSON.stringify(collection),before);assert.equal(testInventory(collection)['gigachad:mythic'],undefined);assert.equal(starterInventory()['gigachad:mythic'],undefined);
});

test('custom sandbox decks save independently, launch all finishes and complete both rounds',()=>{
 const inventory=fullTestDeckInventory(),data=new Map(),storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
 for(const rarity of RARITIES){
  let cards=[];for(const card of [...DEFINITIONS.filter(c=>!c.prime&&!c.iconic).slice(-14),DEFINITIONS.find(c=>c.prime)])cards=addDeckCard(cards,`${card.id}:${rarity.id}`,inventory);
  assert.equal(validateDeck(cards,inventory).valid,true);
  const deck=makeEditorDeck('Test '+rarity.name,cards),library=commitEditorDeck({version:1,selectedId:deck.id,decks:[deck]},deck.id);
  persistDeckLibrary(storage,libraryKey('sandbox'),library);
  assert.deepEqual(readDeckLibrary(storage,libraryKey('sandbox')).decks[0].cards,cards);
  assert.equal(storage.getItem(libraryKey('guest')),null);
  storage.setItem(PLAY_DECK_KEY,JSON.stringify({version:1,name:deck.name,cards,inventory,source:'sandbox'}));
  const loaded=readPlayDeck(storage);assert.equal(loaded.source,'sandbox');assert.deepEqual(loaded.cards,cards);
  for(const round of [1,2]){
   let game=applyPortalDecks(createTacticsMatch({seed:46,starter:round-1}),loaded.cards,[LOADOUTS['hype-guard'],LOADOUTS['hype-twist']],{round});game.rotationLocked=true;
   assert.ok([...game.players[0].hand,...game.players[0].deck].every(c=>c.rarity===rarity.id));
   for(let i=0;!game.finished&&i<19;i++){const action=demoAction(game);assert.ok(action);game=placeEffect(game,action);}
   assert.equal(game.finished,true);assert.equal(game.placements,18);
  }
 }
 const three=['gigachad:common','gigachad:rare','gigachad:epic'];
 assert.throws(()=>addDeckCard(three,'gigachad:mythic',inventory),/Maximum 1/);
 assert.throws(()=>addDeckCard(Array(15).fill('doge:common'),'hodl:mythic',inventory),/full/);
 assert.equal(validateDeck(['gigachad:mythic'],inventory).valid,false);
});
