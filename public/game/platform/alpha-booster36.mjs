import {VARIANTS,getVariant} from './catalog.mjs';
export const ALPHA_BOOSTER=Object.freeze({id:'alpha',name:'Alpha Booster',cards:5,prices:Object.freeze({pixels:100,shards:150}),image:'/game/assets/boosters/alpha-v36/alpha-pack.webp'});
export const BETA_BOOSTER=Object.freeze({id:'beta',price:100,primeChance:25});
export const ALPHA_ODDS=Object.freeze({standard:Object.freeze([['common',7700],['rare',2000],['epic',250],['legendary',45],['mythic',5]]),guaranteed:Object.freeze([['rare',9300],['epic',600],['legendary',90],['mythic',10]])});
export const ALPHA_CLASS_ODDS=Object.freeze({prime:100,iconic:300,regular:9600});
export const chanceOfClassInAlphaPack=weight=>1-(1-weight/10000)**ALPHA_BOOSTER.cards;
/** @param {string} rarity @param {Record<string,number>} acquired */
export function protectedCandidates(rarity,acquired={}){const pool=VARIANTS.filter(v=>v.edition==='alpha'&&v.rarity===rarity);const available=pool.filter(v=>(acquired[v.id]??0)<1);return available.length?available:pool;}
export function previewAlphaPack(){return ['smudge:common','harold:rare','doge:epic','disaster-girl:legendary','confused:mythic'];}
export function validBetaPack(cards){
 if(!Array.isArray(cards)||cards.length!==5)return false;
 const variants=cards.map(getVariant);
 return variants.filter(v=>v?.edition==='beta').length===1&&variants.filter(v=>v?.edition==='alpha').length===4&&variants.some(v=>v?.rarity!=='common');
}
export function validAlphaPack(cards){return Array.isArray(cards)&&cards.length===5&&cards.every(id=>getVariant(id)?.edition==='alpha')&&cards.some(id=>getVariant(id)?.rarity!=='common');}
/** Restoring a server result never awards cards; it only restores their reveal state. */
export function revealedSlots(slots){if(!Array.isArray(slots))return [];return [...new Set(slots.filter(n=>Number.isInteger(n)&&n>=0&&n<5))].sort((a,b)=>a-b);}

export function boosterCostLabel(pack){return pack.currency==='starter'?'Welcome gift':pack.currency==='quest'?'Quest reward':`${pack.cost} ${pack.currency==='pixels'?'Pixels':'Shards'}`;}
