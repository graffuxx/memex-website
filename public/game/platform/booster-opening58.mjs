import {revealedSlots,validAlphaPack} from './alpha-booster36.mjs';
export const ALL_PACK_SLOTS=Object.freeze([0,1,2,3,4]);
/** @param {Array<{id:string,revealed_slots:number[],created_at:string}>} packs @param {string|null} except */
export function unopenedPacks(packs,except=null){
 return [...new Map(packs.map(p=>[p.id,p])).values()].filter(p=>p.id!==except&&revealedSlots(p.revealed_slots).length<5).sort((a,b)=>{
  const partialA=revealedSlots(a.revealed_slots).length>0,partialB=revealedSlots(b.revealed_slots).length>0;
  return Number(partialB)-Number(partialA)||a.created_at.localeCompare(b.created_at)||a.id.localeCompare(b.id);
 });
}
/** Save all contents before enabling manual flips, so leaving cannot strand a half-open pack.
 * @param {{cards:string[],shown?:number[],save:()=>Promise<void>,active:()=>boolean}} opts
 */
export async function prepareManualOpening({cards,shown=[],save,active}){
 if(!validAlphaPack(cards))throw Error('Invalid Alpha Booster.');
 await save();if(!active())return null;
 return {savedSlots:[...ALL_PACK_SLOTS],visibleSlots:revealedSlots(shown)};
}
/** A click reveals exactly one slot; repeated clicks cannot replay a reveal. */
export function flipPackSlot(shown,slot){
 if(!Number.isInteger(slot)||slot<0||slot>4)throw Error('Invalid card slot.');
 const visible=revealedSlots(shown);return visible.includes(slot)?visible:[...visible,slot];
}
