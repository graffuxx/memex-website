import {PRIME_CARDS} from './primes126.mjs';
import {ATLAS_REGIONS} from './art-atlases53.mjs';
import {ELEMENT_IDS,normalizeElement} from './elements53.mjs';
import {EXPANSION_CARDS} from './expansion27.mjs';
import {ALPHA_IDS} from './edition36.mjs';
import {CARD_MATERIALS} from '../src/card-materials22.mjs';
import {RECRUITER_VARIANTS95} from './quests95.mjs';
// Shared by the website, deck validator, database seed and playable alpha.
export const DECK_SIZE = 15;
export const MAX_MOTIF_COPIES = 1;
export const STARTER_COPIES = 1;
export const CATALOG_VERSION = 11;
export const RARITIES = Object.freeze(Object.entries(CARD_MATERIALS).map(([id,m])=>Object.freeze({id,name:m.name,color:m.color})));
export const DEFINITIONS = Object.freeze([
 {id:'pepe',name:'Pepe',short:'Pepe',ruleId:'oracle',element:'storm',values:[7,6,3,2,3,3],ability:'guard',quote:'Feels good, man.',image:'/game/assets/cards/v03/overthinker-thinking-pepe.webp'},
 {id:'doge',name:'Doge',short:'Doge',ruleId:'brain',element:'fire',values:[5,2,5,2,5,5],ability:'hype',quote:'Such strategy. Much wow.',image:'/game/assets/cards/frame-v21/swollen-doge.webp'},
 {id:'roll-safe',name:'Roll Safe',short:'Roll Safe',ruleId:'trust',element:'stone',values:[5,5,5,3,3,3],ability:'twist',quote:'Can’t lose if you think ahead.',image:'/game/assets/cards/v04/roll-safe.webp'},
 ...EXPANSION_CARDS,
 ...PRIME_CARDS
].map(c=>Object.freeze({...c,prime:'prime' in c?Boolean(c.prime):false,element:normalizeElement(c.element),edition:ALPHA_IDS.includes(c.id)?'alpha':null})));
export const STARTER_IDS=Object.freeze(['pepe','doge','roll-safe','harold','disaster-girl','confused','side-eye','success-kid','grumpy-cat','aliens-guy','smudge','bad-luck-brian','gigachad','stonks','trollface']);
const UNSORTED_VARIANTS = DEFINITIONS.flatMap(card=>ELEMENT_IDS.flatMap(element=>RARITIES.map(rarity=>Object.freeze({
 id:`${card.id}:${rarity.id}${element===card.element?'':':'+element}`,definitionId:card.id,element,rarity:rarity.id,edition:card.edition,
 image:card.prime?`/game/assets/cards/primes-v126/${card.id}-${rarity.id}.webp`:card.artAtlas?card.image+'?finish='+rarity.id:rarity.id==='common'?card.image:EXPANSION_CARDS.some(c=>c.id===card.id)?`/game/assets/cards/${card.artDirectory??'memes-v27'}/${card.id}-${rarity.id}.webp`:`/game/assets/cards/rarity-v16/${card.id}-${rarity.id}.webp`,
 artOffsetY:card.artOffsetY??0,artRegion:card.artRegion??(card.artAtlas?Object.freeze({x:RARITIES.findIndex(r=>r.id===rarity.id)/5,...ATLAS_REGIONS[card.id]}):null)
}))));
const definitionOrder=new Map(DEFINITIONS.map((c,i)=>[c.id,i]));
const nativeElement=new Map(DEFINITIONS.map(c=>[c.id,c.element]));
const rarityOrder=new Map(RARITIES.map((r,i)=>[r.id,i]));
// One original element per motif; finishes remain cosmetic.
export const VARIANTS=Object.freeze([...UNSORTED_VARIANTS.filter(v=>v.element===nativeElement.get(v.definitionId)),...RECRUITER_VARIANTS95].sort((a,b)=>rarityOrder.get(a.rarity)-rarityOrder.get(b.rarity)||Number(a.element!==nativeElement.get(a.definitionId))-Number(b.element!==nativeElement.get(b.definitionId))||definitionOrder.get(a.definitionId)-definitionOrder.get(b.definitionId)||ELEMENT_IDS.indexOf(a.element)-ELEMENT_IDS.indexOf(b.element)));
// Old frozen matches may finish with their original rules. Retired IDs never enter
// a new catalog, booster or deck; storage boundaries migrate them to native IDs.
const VARIANT_INDEX=new Map([...UNSORTED_VARIANTS,...RECRUITER_VARIANTS95].map(v=>[v.id,v]));
const ACTIVE_IDS116=new Set(VARIANTS.map(v=>v.id));
export function originalVariantId116(id){const v=VARIANT_INDEX.get(id);return v&&!ACTIVE_IDS116.has(id)?`${v.definitionId}:${v.rarity}`:id;}
export function originalCards116(cards){return Array.isArray(cards)?cards.map(originalVariantId116):cards;}
export function originalInventory116(inventory){
 /** @type {Record<string,number>} */ const next={};for(const [id,count] of Object.entries(inventory??{})){
  if(!Number.isSafeInteger(count)||count<0)throw Error('Invalid collection copies.');
  const original=originalVariantId116(id);if(!count&&original!==id)continue;
  next[original]=(next[original]??0)+count;if(!Number.isSafeInteger(next[original]))throw Error('Invalid collection copies.');
 }return next;
}
export function getVariant(id){return VARIANT_INDEX.get(id);}
export function starterInventory(){return Object.fromEntries(STARTER_IDS.map(id=>[`${id}:common`,STARTER_COPIES]));}
export function starterDeck(){return STARTER_IDS.map(id=>`${id}:common`);}
export const MAX_PRIMES=1;
export function countPrimes(cards){return cards.filter(id=>DEFINITIONS.find(c=>c.id===getVariant(id)?.definitionId)?.prime).length;}
export function deckAddError126(cards,id){const v=getVariant(id);if(!v)return 'Unknown card.';if((countMotifs(cards)[v.definitionId]??0)>=MAX_MOTIF_COPIES)return 'Maximum 1 copy of each meme per deck, across all finishes.';if(DEFINITIONS.find(c=>c.id===v.definitionId)?.prime&&countPrimes(cards)>=MAX_PRIMES)return 'Maximum 1 Prime per deck, across all finishes.';return null;}
export function countCards(cards){const counts={};for(const id of cards)counts[id]=(counts[id]??0)+1;return counts;}
export function countMotifs(cards){const counts={};for(const id of cards){const v=getVariant(id);if(v)counts[v.definitionId]=(counts[v.definitionId]??0)+1;}return counts;}
export function validateDeck(cards,inventory){
 const errors=[];
 if(!Array.isArray(cards)||cards.length!==DECK_SIZE)errors.push(`Your deck needs exactly ${DECK_SIZE} cards.`);
 if(!Array.isArray(cards))return {valid:false,errors};
 if(countPrimes(cards)>MAX_PRIMES)errors.push('Maximum 1 Prime per deck, across all finishes.');
 for(const [id,count] of Object.entries(countMotifs(cards)))if(count>MAX_MOTIF_COPIES)errors.push(`${DEFINITIONS.find(c=>c.id===id).name}: maximum ${MAX_MOTIF_COPIES} copies per motif, across all finishes.`);
 for(const [id,count] of Object.entries(countCards(cards))){
  if(!getVariant(id))errors.push('This deck contains an unknown card.');
  else if(!ACTIVE_IDS116.has(id))errors.push('This element variant has retired. Reload to use the original card.');
  else if(!Number.isInteger(inventory[id])||inventory[id]<count)errors.push(`Not enough copies of ${DEFINITIONS.find(c=>c.id===getVariant(id).definitionId).name} (${getVariant(id).rarity}).`);
 }
 return {valid:errors.length===0,errors};
}
export function expandGameDeck(cards,side){
 return cards.map((variantId,i)=>{const v=getVariant(variantId);if(!v)throw Error('Unknown card variant');const c=DEFINITIONS.find(c=>c.id===v.definitionId);return {id:c.ruleId,uid:`portal-${side}-${i}`,origin:side,rarity:v.rarity,element:v.element,variantId};});
}
