import {EXPANSION_CARDS} from './expansion27.mjs';
import {ALPHA_IDS} from './edition36.mjs';
import {CARD_MATERIALS} from '../src/card-materials22.mjs';
// Shared by the website, deck validator, database seed and playable alpha.
export const DECK_SIZE = 15;
export const MAX_MOTIF_COPIES = 3;
export const STARTER_COPIES = 3;
export const CATALOG_VERSION = 5;
export const RARITIES = Object.freeze(Object.entries(CARD_MATERIALS).map(([id,m])=>Object.freeze({id,name:m.name,color:m.color})));
export const DEFINITIONS = Object.freeze([
 {id:'pepe',name:'Pepe',short:'Pepe',ruleId:'oracle',element:'storm',values:[7,6,3,2,3,3],ability:'guard',quote:'Feels good, man.',image:'/game/assets/cards/v03/overthinker-thinking-pepe.webp'},
 {id:'doge',name:'Doge',short:'Doge',ruleId:'brain',element:'fire',values:[5,2,5,2,5,5],ability:'hype',quote:'Such strategy. Much wow.',image:'/game/assets/cards/frame-v21/swollen-doge.webp'},
 {id:'roll-safe',name:'Roll Safe',short:'Roll Safe',ruleId:'trust',element:'stone',values:[5,5,5,3,3,3],ability:'twist',quote:'Can’t lose if you think ahead.',image:'/game/assets/cards/v04/roll-safe.webp'},
 ...EXPANSION_CARDS
].map(c=>Object.freeze({...c,edition:ALPHA_IDS.includes(c.id)?'alpha':null})));
export const STARTER_IDS=Object.freeze(['pepe','doge','roll-safe','harold','disaster-girl','confused']);
export const VARIANTS = Object.freeze(DEFINITIONS.flatMap(card=>RARITIES.map(rarity=>Object.freeze({
 id:`${card.id}:${rarity.id}`,definitionId:card.id,rarity:rarity.id,edition:card.edition,
 image:rarity.id==='common'?card.image:EXPANSION_CARDS.some(c=>c.id===card.id)?`/game/assets/cards/${card.artDirectory??'memes-v27'}/${card.id}-${rarity.id}.webp`:`/game/assets/cards/rarity-v16/${card.id}-${rarity.id}.webp`,
 artOffsetY:card.artOffsetY??0
}))));
export function getVariant(id){return VARIANTS.find(v=>v.id===id);}
export function starterInventory(){return Object.fromEntries(STARTER_IDS.map(id=>[`${id}:common`,STARTER_COPIES]));}
export function starterDeck(){return STARTER_IDS.flatMap((id,i)=>Array(i<3?3:2).fill(`${id}:common`));}
export function countCards(cards){const counts={};for(const id of cards)counts[id]=(counts[id]??0)+1;return counts;}
export function countMotifs(cards){const counts={};for(const id of cards){const v=getVariant(id);if(v)counts[v.definitionId]=(counts[v.definitionId]??0)+1;}return counts;}
export function validateDeck(cards,inventory){
 const errors=[];
 if(!Array.isArray(cards)||cards.length!==DECK_SIZE)errors.push(`Your deck needs exactly ${DECK_SIZE} cards.`);
 if(!Array.isArray(cards))return {valid:false,errors};
 for(const [id,count] of Object.entries(countMotifs(cards)))if(count>MAX_MOTIF_COPIES)errors.push(`${DEFINITIONS.find(c=>c.id===id).name}: maximum ${MAX_MOTIF_COPIES} copies per motif, including all finishes.`);
 for(const [id,count] of Object.entries(countCards(cards))){
  if(!getVariant(id))errors.push('This deck contains an unknown card.');
  else if(!Number.isInteger(inventory[id])||inventory[id]<count)errors.push(`Not enough copies of ${DEFINITIONS.find(c=>c.id===getVariant(id).definitionId).name} (${getVariant(id).rarity}).`);
 }
 return {valid:errors.length===0,errors};
}
export function expandGameDeck(cards,side){
 return cards.map((variantId,i)=>{const v=getVariant(variantId);if(!v)throw Error('Unknown card variant');const c=DEFINITIONS.find(c=>c.id===v.definitionId);return {id:c.ruleId,uid:`portal-${side}-${i}`,origin:side,rarity:v.rarity,variantId};});
}
