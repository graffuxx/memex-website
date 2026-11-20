import test from 'node:test';import assert from 'node:assert/strict';
import {starterDeck,starterInventory,validateDeck} from '../public/game/platform/catalog.mjs';
import {TEST_DECK_KEY,blankTestCollection,testInventory,expansionTestDeck} from '../public/game/platform/booster-test.mjs';
import {libraryKey,readDeckLibrary,persistDeckLibrary,addEditorDeck,updateEditorDeck,commitEditorDeck,deckIsDirty,addDeckCard,removeDeckCard,summarizeDeck} from '../public/game/platform/deck-library28.mjs';
const memory=()=>({data:new Map(),getItem(k){return this.data.get(k)??null;},setItem(k,v){this.data.set(k,v);}});
test('migrate the existing named test deck, keep independent decks and unsaved working drafts across reloads',()=>{
 const storage=memory(),key=libraryKey('sandbox');storage.setItem(TEST_DECK_KEY,JSON.stringify({version:1,name:'My old meme deck',cards:expansionTestDeck()}));
 let library=readDeckLibrary(storage,key,{legacyKey:TEST_DECK_KEY});const oldId=library.selectedId;assert.equal(library.decks[0].name,'My old meme deck');assert.equal(deckIsDirty(library.decks[0]),false);
 library=addEditorDeck(library,'Storm experiment',[],'local:second');library=updateEditorDeck(library,'local:second',{cards:['confused:common'],name:'Storm notes'});persistDeckLibrary(storage,key,library);
 const reloaded=readDeckLibrary(storage,key,{legacyKey:TEST_DECK_KEY});assert.equal(reloaded.selectedId,'local:second');assert.equal(reloaded.decks.length,2);assert.deepEqual(reloaded.decks[1].cards,['confused:common']);assert.equal(deckIsDirty(reloaded.decks[1]),true);assert.equal(reloaded.decks.find(d=>d.id===oldId).cards.length,15);
 library=updateEditorDeck(reloaded,'local:second',{cards:expansionTestDeck()});library=commitEditorDeck(library,'local:second');assert.equal(deckIsDirty(library.decks[1]),false);assert.equal(library.decks[0].name,'My old meme deck');
});
test('account drafts are isolated, new cloud IDs replace draft IDs, and newer server data wins over stale cached bases',()=>{
 const storage=memory(),server=[{id:'server:one',name:'Cloud deck',cards:starterDeck(),active:true}],key=libraryKey('account','user-a');
 let library=readDeckLibrary(storage,key,{serverDecks:server});library=updateEditorDeck(library,'server:one',{name:'Unfinished rename'});persistDeckLibrary(storage,key,library);
 assert.equal(readDeckLibrary(storage,key,{serverDecks:server}).decks[0].name,'Unfinished rename');assert.equal(readDeckLibrary(storage,libraryKey('account','user-b'),{serverDecks:server}).decks[0].name,'Cloud deck');
 assert.equal(readDeckLibrary(storage,key,{serverDecks:[{...server[0],name:'Changed on another device'}]}).decks[0].name,'Changed on another device');
 library=addEditorDeck(library,'New account deck',starterDeck(),'local:new');library=commitEditorDeck(library,'local:new','server:two');assert.equal(library.selectedId,'server:two');assert.equal(library.decks.find(d=>d.id==='server:two').cloudId,'server:two');assert.equal(library.decks.find(d=>d.id==='server:one').name,'Unfinished rename');
 assert.notEqual(libraryKey('guest'),libraryKey('sandbox'));assert.notEqual(key,libraryKey('account','user-b'));
});
test('copy limits apply within the current deck, all rarities count toward the right elements and copies stay reusable across decks',()=>{
 const inventory=testInventory(blankTestCollection());let cards=expansionTestDeck();const original=[...cards],first=cards[0];cards=removeDeckCard(cards,first);cards=addDeckCard(cards,first,inventory);assert.ok(validateDeck(cards,inventory).valid);assert.deepEqual(original.sort(),cards.toSorted());
 assert.throws(()=>addDeckCard(cards,'confused:common',inventory),/full/);assert.throws(()=>addDeckCard([], 'fake',inventory),/Unknown/);assert.throws(()=>addDeckCard(['smudge:common'],'smudge:common',inventory),/available/);
 const summary=summarizeDeck(['harold:mythic','harold:legendary','success-kid:epic','confused:rare']);assert.deepEqual(summary.elements,{fire:1,water:0,earth:2,air:0,storm:1});assert.equal(summary.uniqueMotifs,3);assert.equal(summary.rarities.mythic,1);assert.equal(summary.remaining,11);assert.deepEqual(summarizeDeck([]).elements,{fire:0,water:0,earth:0,air:0,storm:0});
 const before={...inventory};assert.deepEqual(addDeckCard([],'harold:common',inventory),['harold:common']);assert.deepEqual(addDeckCard([],'harold:common',inventory),['harold:common']);assert.deepEqual(inventory,before);
});
test('malformed libraries recover safely; duplicate IDs and unknown cards cannot corrupt a collection',()=>{
 const storage=memory(),key=libraryKey('guest');storage.setItem(key,'{bad');let library=readDeckLibrary(storage,key);assert.equal(library.decks.length,1);
 for(let n=1;n<10;n++)library=addEditorDeck(library,'Deck '+n,[],`local:${n}`);assert.throws(()=>addEditorDeck(library,'Too many'),/10 decks/);persistDeckLibrary(storage,key,library);assert.equal(readDeckLibrary(storage,key).decks.length,10);
 storage.setItem(key,JSON.stringify({version:1,selectedId:'bad',decks:[{id:'bad',name:'Broken',cards:['fake'],saved:null},{...library.decks[0]},{...library.decks[0]}]}));const recovered=readDeckLibrary(storage,key);assert.equal(recovered.decks.length,1);assert.equal(recovered.selectedId,recovered.decks[0].id);
});
test('three-copy ceiling is shared by finishes; explicit repair preserves ownership and does not force triples',async()=>{
 const {rebuildLegalDeck}=await import('../public/game/platform/deck-library28.mjs');
 const owned={'pepe:common':6,'pepe:rare':2,...starterInventory()};assert.throws(()=>addDeckCard(['pepe:common','pepe:common','pepe:rare'],'pepe:common',owned),/Maximum 3/);
 const before={...owned},old=['pepe','doge','roll-safe'].flatMap(id=>Array(5).fill(id+':common'));const repaired=rebuildLegalDeck(old,owned);assert.equal(repaired.length,15);assert.equal(validateDeck(repaired,owned).valid,true);assert.deepEqual(owned,before);assert.equal(old.length,15);
});
