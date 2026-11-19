import {VARIANTS,getVariant} from './catalog.mjs';
export const ALPHA_BOOSTER=Object.freeze({id:'alpha',name:'Alpha Booster',cards:5,prices:Object.freeze({pixels:100,shards:150}),image:'/game/assets/boosters/alpha-v36/alpha-pack.webp'});
export const ALPHA_ODDS=Object.freeze({standard:Object.freeze([['common',7000],['rare',2200],['epic',650],['legendary',130],['mythic',20]]),guaranteed:Object.freeze([['rare',7800],['epic',1800],['legendary',350],['mythic',50]])});
/** @param {string} rarity @param {Record<string,number>} acquired */
export function protectedCandidates(rarity,acquired={}){const pool=VARIANTS.filter(v=>v.edition==='alpha'&&v.rarity===rarity);const available=pool.filter(v=>(acquired[v.id]??0)<3);return available.length?available:pool;}
export function previewAlphaPack(){return ['smudge:common','harold:rare','doge:epic','disaster-girl:legendary','confused:mythic'];}
export function validAlphaPack(cards){return Array.isArray(cards)&&cards.length===5&&cards.every(id=>getVariant(id)?.edition==='alpha')&&cards.some(id=>getVariant(id)?.rarity!=='common');}
/** Restoring a server result never awards cards; it only restores their reveal state. */
export function revealedSlots(slots){if(!Array.isArray(slots))return [];return [...new Set(slots.filter(n=>Number.isInteger(n)&&n>=0&&n<5))].sort((a,b)=>a-b);}
