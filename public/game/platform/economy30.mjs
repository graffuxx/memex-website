import {STARTER_IDS,STARTER_COPIES,getVariant,countCards} from './catalog.mjs';
// First balancing pass. Finishes remain cosmetic; values and deck limits never change.
export const CRAFT_COST=Object.freeze({common:100,rare:400,epic:1600});
export const DISMANTLE_VALUE=Object.freeze({common:10,rare:25,epic:60,legendary:150,mythic:400});
export const ROUND_TOKENS=Object.freeze({win:5,loss:2,draw:2});
export function roundTokens(result){if(!Object.hasOwn(ROUND_TOKENS,result))throw Error('Unknown round result.');return ROUND_TOKENS[result];}
/** @param {string} variantId @param {{cards:string[]}[]} [decks] */
export function protectedCopies(variantId,decks=[]){
 const variant=getVariant(variantId);if(!variant)throw Error('Unknown card.');
 const starter=variant.rarity==='common'&&STARTER_IDS.includes(variant.definitionId)?STARTER_COPIES:0;
 return Math.max(starter,...decks.map(deck=>countCards(deck.cards)[variantId]??0));
}
/** @param {'craft'|'dismantle'} kind @param {string} variantId @param {{inventory?:Record<string,number>,tokens?:number,decks?:{cards:string[]}[]}} [options] */
export function tradeQuote(kind,variantId,{inventory={},tokens=0,decks=[]}={}){
 const variant=getVariant(variantId);if(!variant)throw Error('Unknown card.');
 const owned=inventory[variantId]??0,reserved=protectedCopies(variantId,decks);
 if(kind==='craft'){
  const cost=CRAFT_COST[variant.rarity];
  return {allowed:cost!==undefined&&tokens>=cost&&owned<100000,tokens:cost??null,owned,reserved,reason:cost===undefined?'Booster exclusive':owned>=100000?'Collection limit reached':tokens<cost?'Not enough Tokens':''};
 }
 if(kind==='dismantle')return {allowed:owned>reserved,tokens:DISMANTLE_VALUE[variant.rarity],owned,reserved,reason:owned<=reserved?(reserved?'Protected by a starter set or saved deck':'No spare copy'):''};
 throw Error('Unknown card action.');
}
