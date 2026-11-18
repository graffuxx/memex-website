// Shared by the website, deck validator, database seed and playable alpha.
export const DECK_SIZE = 15;
export const STARTER_COPIES = 6;
export const CATALOG_VERSION = 1;
export const RARITIES = Object.freeze([
 {id:'common',name:'Common',color:'#b9c7d9'}, {id:'rare',name:'Rare',color:'#5dcaff'},
 {id:'epic',name:'Epic',color:'#c091ff'}, {id:'legendary',name:'Legendary',color:'#ffcf75'},
 {id:'mythic',name:'Mythic',color:'#f1b6ff'}
]);
export const DEFINITIONS = Object.freeze([
 {id:'pepe',name:'Pepe',ruleId:'oracle',element:'storm',values:[7,6,3,2,3,3],ability:'guard',quote:'Feels good, man.',image:'/game/assets/cards/v03/overthinker-thinking-pepe.webp'},
 {id:'doge',name:'Doge',ruleId:'brain',element:'fire',values:[5,2,5,2,5,5],ability:'hype',quote:'Such strategy. Much wow.',image:'/game/assets/cards/frame-v21/swollen-doge.webp'},
 {id:'roll-safe',name:'Roll Safe',ruleId:'trust',element:'stone',values:[5,5,5,3,3,3],ability:'twist',quote:'Can’t lose if you think ahead.',image:'/game/assets/cards/v04/roll-safe.webp'}
]);
export const VARIANTS = Object.freeze(DEFINITIONS.flatMap(card=>RARITIES.map(rarity=>Object.freeze({
 id:`${card.id}:${rarity.id}`,definitionId:card.id,rarity:rarity.id,
 image:rarity.id==='common'?card.image:`/game/assets/cards/rarity-v16/${card.id}-${rarity.id}.webp`
}))));
export function getVariant(id){return VARIANTS.find(v=>v.id===id);}
export function starterInventory(){return Object.fromEntries(DEFINITIONS.map(c=>[`${c.id}:common`,STARTER_COPIES]));}
export function starterDeck(){return DEFINITIONS.flatMap(c=>Array(5).fill(`${c.id}:common`));}
export function countCards(cards){const counts={};for(const id of cards)counts[id]=(counts[id]??0)+1;return counts;}
export function validateDeck(cards,inventory){
 const errors=[];
 if(!Array.isArray(cards)||cards.length!==DECK_SIZE)errors.push(`Your deck needs exactly ${DECK_SIZE} cards.`);
 if(!Array.isArray(cards))return {valid:false,errors};
 for(const [id,count] of Object.entries(countCards(cards))){
  if(!getVariant(id))errors.push('This deck contains an unknown card.');
  else if(!Number.isInteger(inventory[id])||inventory[id]<count)errors.push(`Not enough copies of ${DEFINITIONS.find(c=>c.id===getVariant(id).definitionId).name} (${getVariant(id).rarity}).`);
 }
 return {valid:errors.length===0,errors};
}
export function expandGameDeck(cards,side){
 return cards.map((variantId,i)=>{const v=getVariant(variantId);if(!v)throw Error('Unknown card variant');const c=DEFINITIONS.find(c=>c.id===v.definitionId);return {id:c.ruleId,uid:`portal-${side}-${i}`,origin:side,rarity:v.rarity,variantId};});
}
