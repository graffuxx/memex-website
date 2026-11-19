import {DEFINITIONS,VARIANTS} from './catalog.mjs';
import {revealedSlots} from './alpha-booster36.mjs';
export const PLAYER_LINKS=Object.freeze([['/account/private','Overview'],['/collection','Collection'],['/decks','Decks'],['/account/private/boosters','Boosters']]);
export function playerAreaRoute(path){return PLAYER_LINKS.find(([url])=>path===url)?.[0]??null;}
export function collectionSummary(inventory){
 const owned=VARIANTS.filter(v=>Number.isInteger(inventory[v.id])&&inventory[v.id]>0);
 return {copies:owned.reduce((sum,v)=>sum+inventory[v.id],0),variants:owned.length,motifs:new Set(owned.map(v=>v.definitionId)).size,totalMotifs:DEFINITIONS.length};
}
export function boosterProgress(pack){const revealed=revealedSlots(pack.revealed_slots).length;return {revealed,state:revealed===5?'complete':revealed===0?'sealed':'partial',label:revealed===5?'Opened':revealed===0?'Unopened':'In progress',action:revealed===5?'View cards':revealed===0?'Open booster':'Continue opening'};}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function requestedBooster(search){const id=new URLSearchParams(search).get('booster');return id&&uuid.test(id)?id:null;}
export function boosterLink(id){if(!uuid.test(id))throw Error('Invalid booster ID.');return '/boosters?booster='+encodeURIComponent(id);}
/** @param {{id:string,created_at:string}} cursor */
export function boosterHistoryFilter(cursor){
 if(!uuid.test(cursor.id)||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/.test(cursor.created_at)||!Number.isFinite(Date.parse(cursor.created_at)))throw Error('Invalid booster history cursor.');
 return `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`;
}
/** @param {Array<{id:string}>} previous @param {Array<{id:string}>} incoming */
export function mergeBoosterHistory(previous,incoming){const rows=new Map(previous.map(p=>[p.id,p]));for(const p of incoming)rows.set(p.id,p);return [...rows.values()];}
