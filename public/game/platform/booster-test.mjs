import {ELEMENT_CARDS} from './expansion53.mjs';
import {ELEMENT_IDS} from './elements53.mjs';
import {ALPHA_ADDITIONS} from './expansion48.mjs';
import {EXPANSION_CARDS} from './expansion27.mjs';
import {DEFINITIONS,VARIANTS,MAX_MOTIF_COPIES,getVariant,starterInventory,starterDeck,validateDeck} from './catalog.mjs';
export const TEST_COLLECTION_KEY='duelverse.booster-test.v1';
export const TEST_DECK_KEY='duelverse.booster-test-deck.v1';
export const PACK_SIZE=5;
export const TEST_SINGLE_DRAW_LIMIT=3;
// The local preview uses the published live odds; it never grants account cards.
export {ALPHA_ODDS as TEST_PACK_ODDS} from './alpha-booster36.mjs';
import {ALPHA_ODDS as TEST_PACK_ODDS} from './alpha-booster36.mjs';
export const blankTestCollection=()=>({version:1,openedPacks:0,inventory:{},lastPack:null,singleDrawsUsed:0,lastDraw:null});
// Editor-only sandbox allowance. Never persist this as collection ownership.
export function fullTestDeckInventory(){return Object.fromEntries(VARIANTS.map(v=>[v.id,MAX_MOTIF_COPIES]));}
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
 return Array.from({length:PACK_SIZE},(_,i)=>{const rarity=rarityForRoll(i===PACK_SIZE-1?TEST_PACK_ODDS.guaranteed:TEST_PACK_ODDS.standard,checkedRandom(random));const definition=DEFINITIONS[Math.floor(checkedRandom(random)*DEFINITIONS.length)];const element=ELEMENT_IDS[Math.floor(checkedRandom(random)*ELEMENT_IDS.length)];return VARIANTS.find(v=>v.definitionId===definition.id&&v.rarity===rarity&&v.element===element).id;});
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

// Browser-only rehearsal: ten newest motifs, three core abilities and two earlier memes.
export function expansionTestDeck(){return [...ALPHA_ADDITIONS.map(c=>`${c.id}:common`),'pepe:common','doge:common','roll-safe:common','gigachad:common','trollface:common'];}

export function drawSingleTestCard(random=()=>{const value=new Uint32Array(1);globalThis.crypto.getRandomValues(value);return value[0]/4294967296;}){
 const rarity=rarityForRoll(TEST_PACK_ODDS.standard,checkedRandom(random));
 const pool=VARIANTS.filter(v=>v.rarity===rarity);return pool[Math.floor(checkedRandom(random)*pool.length)].id;
}
export function addSingleTestDraw(collection,card,id){
 if(typeof id!=='string'||!id||!getVariant(card))throw Error('Invalid card draw.');
 if(collection.lastDraw?.id===id)return collection;
 if(collection.singleDrawsUsed>=TEST_SINGLE_DRAW_LIMIT)throw Error('All preview draws have been used.');
 const before=testInventory(collection),inventory={...collection.inventory};inventory[card]=(inventory[card]??0)+1;
 return {...collection,inventory,singleDrawsUsed:collection.singleDrawsUsed+1,lastDraw:{id,card,isNew:!before[card]}};
}

// A mixed-element rehearsal, isolated from account inventory and rewards.
export function elementTestDeck(){return Array.from({length:15},(_,i)=>{const group=Math.floor(i/3),card=ELEMENT_CARDS[group*10+i%3],element=ELEMENT_IDS[(group+i%3)%5],rarity=['common','rare','epic','legendary','mythic'][i%5];return VARIANTS.find(v=>v.definitionId===card.id&&v.element===element&&v.rarity===rarity).id;});}
