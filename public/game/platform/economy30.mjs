import {STARTER_IDS,STARTER_COPIES,getVariant,countCards} from './catalog.mjs';
// Shards: purchased currency. Pixels: round rewards and boosters. Echoes: dismantling and crafting.
export const RESOURCE_NAMES=Object.freeze({premium:'Shards',earned:'Pixels',crafting:'Echoes'});
export const BOOSTER_OFFER=Object.freeze({cards:5,pixels:100,shards:150,minimumFinish:'rare',active:true});
// First balancing pass. Finishes remain cosmetic; values and deck limits never change.
export const CRAFT_COST=Object.freeze({common:100,rare:400,epic:1600});
export const DISMANTLE_VALUE=Object.freeze({common:10,rare:25,epic:60,legendary:150,mythic:400});
export const ROUND_PIXELS=Object.freeze({win:5,loss:2,draw:2});
export function roundPixels(result){if(!Object.hasOwn(ROUND_PIXELS,result))throw Error('Unknown round result.');return ROUND_PIXELS[result];}
/** @param {string} variantId @param {{cards:string[]}[]} [decks] */
export function protectedCopies(variantId,decks=[]){
 const variant=getVariant(variantId);if(!variant)throw Error('Unknown card.');
 const starter=variant.rarity==='common'&&STARTER_IDS.includes(variant.definitionId)?STARTER_COPIES:0;
 return Math.max(starter,...decks.map(deck=>countCards(deck.cards)[variantId]??0));
}
/** @param {'craft'|'dismantle'} kind @param {string} variantId @param {{inventory?:Record<string,number>,echoes?:number,decks?:{cards:string[]}[]}} [options] */
export function tradeQuote(kind,variantId,{inventory={},echoes=0,decks=[]}={}){
 const variant=getVariant(variantId);if(!variant)throw Error('Unknown card.');
 const owned=inventory[variantId]??0,reserved=protectedCopies(variantId,decks);
 if(variant.edition==='recruiter')return {allowed:false,echoes:null,owned,reserved:owned,reason:'Permanent referral reward'};
 if(kind==='craft'){
  const cost=CRAFT_COST[variant.rarity];
  return {allowed:cost!==undefined&&echoes>=cost&&owned<100000,echoes:cost??null,owned,reserved,reason:cost===undefined?'Booster exclusive':owned>=100000?'Collection limit reached':echoes<cost?'Not enough Echoes':''};
 }
 if(kind==='dismantle')return {allowed:owned>reserved,echoes:DISMANTLE_VALUE[variant.rarity],owned,reserved,reason:owned<=reserved?(reserved?'Protected by a starter set or saved deck':'No spare copy'):''};
 throw Error('Unknown card action.');
}
