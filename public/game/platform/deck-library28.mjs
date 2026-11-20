import {ELEMENT_IDS} from './elements53.mjs';
import {DECK_SIZE,MAX_MOTIF_COPIES,countMotifs,DEFINITIONS,RARITIES,getVariant,starterDeck,countCards} from './catalog.mjs';
export const DECK_LIBRARY_LIMIT=10;
export const LEGACY_GUEST_DECK_KEY='duelverse.guest-deck.v1';
export const libraryKey=(source,userId='')=>`duelverse.deck-library.v1.${source==='account'?'account.'+userId:source}`;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const knownCards=cards=>Array.isArray(cards)&&cards.length<=DECK_SIZE&&cards.every(id=>typeof id==='string'&&Boolean(getVariant(id)));
function snapshot(value){return value&&typeof value.name==='string'&&value.name.length<=40&&knownCards(value.cards)?{name:value.name,cards:[...value.cards]}:null;}
/** @param {string} name @param {string[]} [cards] @param {{id?:string,cloudId?:string|null,saved?:boolean}} [options] */
export function makeEditorDeck(name,cards=[],{id='local:'+globalThis.crypto.randomUUID(),cloudId=null,saved=false}={}){
 if(!knownCards(cards)||typeof name!=='string'||name.length>40)throw Error('Invalid deck.');
 return {id,cloudId,name,cards:[...cards],saved:saved?{name,cards:[...cards]}:null};
}
export const deckIsDirty=deck=>!deck.saved||!same({name:deck.name,cards:deck.cards},deck.saved);
function cleanRecord(value){
 if(!value||typeof value.id!=='string'||!value.id||value.id.length>100||!knownCards(value.cards)||typeof value.name!=='string'||value.name.length>40)return null;
 return {id:value.id,cloudId:typeof value.cloudId==='string'?value.cloudId:null,name:value.name,cards:[...value.cards],saved:snapshot(value.saved)};
}
// Working drafts are cached separately per account/test/guest; only Save writes to the account.
/** @param {{getItem:(key:string)=>string|null}} storage @param {string} key @param {{serverDecks?:Array<{id:string,name:string,cards:string[],active?:boolean}>|null,legacyKey?:string|null,fallbackName?:string,fallbackCards?:string[],requestedId?:string|null}} [options] */
export function readDeckLibrary(storage,key,{serverDecks=null,legacyKey=null,fallbackName='My first deck',fallbackCards=starterDeck(),requestedId=null}={}){
 let cached=null;try{cached=JSON.parse(storage.getItem(key));}catch{}
 let records=[];
 if(cached?.version===1&&Array.isArray(cached.decks)){const seen=new Set();for(const raw of cached.decks){const deck=cleanRecord(raw);if(deck&&!seen.has(deck.id)&&records.length<DECK_LIBRARY_LIMIT){records.push(deck);seen.add(deck.id);}}}
 let selected=cached?.selectedId;
 if(serverDecks!==null){
  const cloud=serverDecks.map(saved=>{const base={name:saved.name,cards:saved.cards},local=records.find(d=>d.cloudId===saved.id);return local&&same(local.saved,base)?{...local,id:saved.id}:makeEditorDeck(saved.name,saved.cards,{id:saved.id,cloudId:saved.id,saved:true});});
  records=[...cloud,...records.filter(d=>!d.cloudId).slice(0,Math.max(0,DECK_LIBRARY_LIMIT-cloud.length))];
  if(!records.some(d=>d.id===selected))selected=serverDecks.find(d=>d.active)?.id;
 }
 if(!records.length){let legacy=null;try{legacy=JSON.parse(legacyKey?storage.getItem(legacyKey):null);}catch{}const validLegacy=legacy?.version===1&&snapshot(legacy)&&legacy.cards.length===DECK_SIZE;
  records=[makeEditorDeck(validLegacy?legacy.name:fallbackName,validLegacy?legacy.cards:fallbackCards,{saved:true})];
 }
 const requested=records.find(d=>requestedId&&(d.id===requestedId||d.cloudId===requestedId));
 return {version:1,selectedId:requested?.id??(records.some(d=>d.id===selected)?selected:records[0].id),decks:records};
}
export function persistDeckLibrary(storage,key,library){
 if(!library.decks.length||library.decks.length>DECK_LIBRARY_LIMIT||library.decks.some(d=>!cleanRecord(d)))throw Error('Invalid deck library.');
 storage.setItem(key,JSON.stringify(library));
}
export function addEditorDeck(library,name,cards=[],id){
 if(library.decks.length>=DECK_LIBRARY_LIMIT)throw Error(`You can keep up to ${DECK_LIBRARY_LIMIT} decks.`);
 const deck=makeEditorDeck(name,cards,id?{id}:{});return {...library,selectedId:deck.id,decks:[...library.decks,deck]};
}
export function updateEditorDeck(library,id,patch){return {...library,decks:library.decks.map(deck=>deck.id===id?{...deck,...patch}:deck)};}
/** @param {any} library @param {string} id @param {string|null} [cloudId] */
export function commitEditorDeck(library,id,cloudId=null){
 const current=library.decks.find(d=>d.id===id);if(!current)throw Error('Deck not found.');
 const nextId=cloudId??id;
 return {...library,selectedId:library.selectedId===id?nextId:library.selectedId,decks:library.decks.map(deck=>deck.id===id?{...deck,id:nextId,cloudId:cloudId??deck.cloudId,name:deck.name.trim(),saved:{name:deck.name.trim(),cards:[...deck.cards]}}:deck)};
}
export function addDeckCard(cards,id,inventory){
 if(!getVariant(id))throw Error('Unknown card.');
 if(cards.length>=DECK_SIZE)throw Error('Your deck is full. Remove a card first.');
 if((countMotifs(cards)[getVariant(id).definitionId]??0)>=MAX_MOTIF_COPIES)throw Error('Maximum 3 copies of this meme per deck, including all elements and finishes.');
 if((countCards(cards)[id]??0)>=(inventory[id]??0))throw Error('All available copies are already in this deck.');
 return [...cards,id];
}
export function removeDeckCard(cards,id){const index=cards.indexOf(id);if(index<0)return cards;const next=[...cards];next.splice(index,1);return next;}
export function summarizeDeck(cards){
 const elements=Object.fromEntries(ELEMENT_IDS.map(id=>[id,0])),rarities=Object.fromEntries(RARITIES.map(r=>[r.id,0])),motifs=new Set();
 for(const id of cards){const variant=getVariant(id);if(!variant)continue;const card=DEFINITIONS.find(c=>c.id===variant.definitionId);elements[variant.element]++;rarities[variant.rarity]++;motifs.add(card.id);}
 return {total:cards.length,remaining:Math.max(0,DECK_SIZE-cards.length),elements,rarities,uniqueMotifs:motifs.size};
}

// Explicit editor action only; saved decks and owned cards are never silently removed.
export function rebuildLegalDeck(cards,inventory){
 let result=[];
 for(const id of cards)if(result.length<DECK_SIZE)try{result=addDeckCard(result,id,inventory);}catch{}
 for(const id of Object.keys(inventory).sort((a,b)=>Number(!a.endsWith(':common'))-Number(!b.endsWith(':common'))))for(let i=0;i<Math.min(MAX_MOTIF_COPIES,inventory[id]??0)&&result.length<DECK_SIZE;i++)try{result=addDeckCard(result,id,inventory);}catch{}
 return result;
}
