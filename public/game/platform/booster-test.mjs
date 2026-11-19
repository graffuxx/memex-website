import {NEW_ALPHA_CARDS} from './expansion45.mjs';
import {EXPANSION_CARDS} from './expansion27.mjs';
import {DEFINITIONS,getVariant,starterInventory,starterDeck,validateDeck} from './catalog.mjs';
export const TEST_COLLECTION_KEY='duelverse.booster-test.v1';
export const TEST_DECK_KEY='duelverse.booster-test-deck.v1';
export const PACK_SIZE=5;
export const TEST_SINGLE_DRAW_LIMIT=3;
// Draft odds for the free browser-only test, not final shop prices or live odds.
export const TEST_PACK_ODDS=Object.freeze({
 standard:Object.freeze([['common',7000],['rare',2200],['epic',650],['legendary',130],['mythic',20]]),
 guaranteed:Object.freeze([['rare',7800],['epic',1800],['legendary',350],['mythic',50]])
});
export const blankTestCollection=()=>({version:1,openedPacks:0,inventory:{},lastPack:null,singleDrawsUsed:0,lastDraw:null});
export function testInventory(collection){const inventory={...Object.fromEntries(EXPANSION_CARDS.map(c=>[`${c.id}:common`,1])),...starterInventory()};for(const [id,count]of Object.entries(collection.inventory))inventory[id]=(inventory[id]??0)+count;return inventory;}
export function readTestCollection(storage){
 try{
  const data=JSON.parse(storage.getItem(TEST_COLLECTION_KEY));
  if(data?.version!==1||!Number.isInteger(data.openedPacks)||data.openedPacks<0||data.openedPacks>100000||!data.inventory||Array.isArray(data.inventory))return blankTestCollection();
  for(const [id,count]of Object.entries(data.inventory))if(!getVariant(id)||!Number.isInteger(count)||count<0||count>100000)return blankTestCollection();
  const last=data.lastPack;
  if(last!==null&&(!last||typeof last.id!=='string'||!Array.isArray(last.cards)||last.cards.length!==PACK_SIZE||!last.cards.every(getVariant)||!Array.isArray(last.newIds)||!last.newIds.every(id=>last.cards.includes(id))))return blankTestCollection();
  const used=data.singleDrawsUsed??0,lastDraw=data.lastDraw??null;
  if(!Number.isInteger(used)||used<0||used>TEST_SINGLE_DRAW_LIMIT)return blankTestCollection();
  if(lastDraw!==null&&(!lastDraw||typeof lastDraw.id!=='string'||!getVariant(lastDraw.card)||typeof lastDraw.isNew!=='boolean'))return blankTestCollection();
  return {version:1,openedPacks:data.openedPacks,inventory:{...data.inventory},lastPack:last,singleDrawsUsed:used,lastDraw};
 }catch{return blankTestCollection();}
}
function checkedRandom(random){const value=random();if(!Number.isFinite(value)||value<0||value>=1)throw Error('Invalid random sample.');return value;}
export function rarityForRoll(weights,value){let cumulative=0;const roll=Math.floor(checkedRandom(()=>value)*10000);for(const [rarity,weight]of weights){cumulative+=weight;if(roll<cumulative)return rarity;}throw Error('Invalid pack odds.');}
export function drawTestPack(random=()=>{const value=new Uint32Array(1);globalThis.crypto.getRandomValues(value);return value[0]/4294967296;}){
 return Array.from({length:PACK_SIZE},(_,i)=>{const rarity=rarityForRoll(i===PACK_SIZE-1?TEST_PACK_ODDS.guaranteed:TEST_PACK_ODDS.standard,checkedRandom(random));const definition=DEFINITIONS[Math.floor(checkedRandom(random)*DEFINITIONS.length)];return `${definition.id}:${rarity}`;});
}
export function addTestPack(collection,cards,id){
 if(typeof id!=='string'||!id||cards.length!==PACK_SIZE||!cards.every(getVariant))throw Error('Invalid test booster.');
 if(collection.lastPack?.id===id)return collection;
 const previous=testInventory(collection),inventory={...collection.inventory},newIds=[...new Set(cards.filter(card=>!previous[card]))];
 for(const card of cards){inventory[card]=(inventory[card]??0)+1;if(inventory[card]>100000)throw Error('Test collection limit reached.');}
 if(collection.openedPacks>=100000)throw Error('Test collection limit reached.');
 return {...collection,version:1,openedPacks:collection.openedPacks+1,inventory,lastPack:{id,cards:[...cards],newIds}};
}
export function readTestDeck(storage,inventory){try{const saved=JSON.parse(storage.getItem(TEST_DECK_KEY));if(saved?.version===1&&validateDeck(saved.cards,inventory).valid)return {cards:saved.cards,name:typeof saved.name==='string'?saved.name.slice(0,40):'Test deck'};}catch{}return {cards:starterDeck(),name:'My test deck'};}

// Browser-only rehearsal: all twelve newest motifs plus three core ability candidates.
export function expansionTestDeck(){return [...NEW_ALPHA_CARDS.map(c=>`${c.id}:common`),'pepe:common','doge:common','roll-safe:common'];}

export function drawSingleTestCard(random=()=>{const value=new Uint32Array(1);globalThis.crypto.getRandomValues(value);return value[0]/4294967296;}){
 const rarity=rarityForRoll(TEST_PACK_ODDS.standard,checkedRandom(random));
 return `${DEFINITIONS[Math.floor(checkedRandom(random)*DEFINITIONS.length)].id}:${rarity}`;
}
export function addSingleTestDraw(collection,card,id){
 if(typeof id!=='string'||!id||!getVariant(card))throw Error('Invalid card draw.');
 if(collection.lastDraw?.id===id)return collection;
 if(collection.singleDrawsUsed>=TEST_SINGLE_DRAW_LIMIT)throw Error('All preview draws have been used.');
 const before=testInventory(collection),inventory={...collection.inventory};inventory[card]=(inventory[card]??0)+1;
 return {...collection,inventory,singleDrawsUsed:collection.singleDrawsUsed+1,lastDraw:{id,card,isNew:!before[card]}};
}
