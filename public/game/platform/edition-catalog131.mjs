import {SETS131,setSlot131,editionOf131,cardCategory131} from './set-manifest131.mjs';
import {DEFINITIONS,VARIANTS,getVariant,validateDeck} from './catalog.mjs';
export {SETS131,setSlot131,editionOf131,cardCategory131};
export const editionContains131=(edition,variant)=>edition==='all'||editionOf131(variant.definitionId)===edition;
export function editionProgress131(id,inventory={}){const set=SETS131.find(s=>s.id===id);if(!set)throw Error('Unknown edition');const released=DEFINITIONS.filter(c=>editionOf131(c.id)===id);const owned=new Set(Object.entries(inventory).filter(([,n])=>Number(n)>0).map(([id])=>getVariant(id)?.definitionId).filter(Boolean));return {id,name:set.name,size:set.size,released:released.length,collected:released.filter(c=>owned.has(c.id)).length,pending:set.size-released.length,categories:Object.fromEntries(Object.keys(set.limits).map(k=>[k,{released:released.filter(c=>cardCategory131(c.id)===k).length,size:set.limits[k]}]))};}
// Private-only loans never become inventory, crafting history or reward progress.
export function friendlyInventory131(owned={}){return Object.fromEntries(VARIANTS.filter(v=>v.edition!=='recruiter'||(owned[v.id]??0)>0).map(v=>[v.id,Math.max(1,owned[v.id]??0)]));}
export function validateMatchDeck131(cards,owned,kind='random',format='owned'){return validateDeck(cards,kind==='private'&&format==='friendly'?friendlyInventory131(owned):owned);}
/** @template {{format?:string}} T @param {T[]} decks @param {string} [kind] @returns {T[]} */
export const eligibleDecks131=(decks,kind='random')=>decks.filter(d=>kind==='private'||d.format!=='friendly');
// Only this one Ranked entry is visible; the future split is configuration, not active queues.
export const RANKED131=Object.freeze({enabled:false,label:'Ranked',status:'Coming soon',futureFormats:Object.freeze(['current-edition','open'])});
