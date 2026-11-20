import {getVariant} from './catalog.mjs';
import {revealedSlots,validAlphaPack} from './alpha-booster36.mjs';
export const ALL_PACK_SLOTS=Object.freeze([0,1,2,3,4]);
/** @param {Array<{id:string,revealed_slots:number[],created_at:string}>} packs @param {string|null} except */
export function unopenedPacks(packs,except=null){
 return [...new Map(packs.map(p=>[p.id,p])).values()].filter(p=>p.id!==except&&revealedSlots(p.revealed_slots).length<5).sort((a,b)=>{
  const partialA=revealedSlots(a.revealed_slots).length>0,partialB=revealedSlots(b.revealed_slots).length>0;
  return Number(partialB)-Number(partialA)||a.created_at.localeCompare(b.created_at)||a.id.localeCompare(b.id);
 });
}
/** @param {string} rarity */
export function revealPause(rarity){return ({common:420,rare:550,epic:1100,legendary:1600,mythic:2600})[rarity]??420;}
/** Save first: interrupted animations never leave partly opened packs or award cards again.
 * @param {{cards:string[],shown?:number[],save:()=>Promise<void>,committed:()=>void,display:(slots:number[],slot:number|null)=>void,complete:()=>void,active:()=>boolean,wait:(ms:number)=>Promise<void>,reducedMotion?:boolean}} opts
 */
export async function playPackOpening({cards,shown=[],save,committed,display,complete,active,wait,reducedMotion=false}){
 if(!validAlphaPack(cards))throw Error('Invalid Alpha Booster.');
 await save();if(!active())return false;committed();
 let visible=revealedSlots(shown);
 if(reducedMotion){display([...ALL_PACK_SLOTS],null);complete();return true;}
 for(const slot of ALL_PACK_SLOTS){if(visible.includes(slot))continue;if(!active())return false;visible=[...visible,slot];display(visible,slot);await wait(revealPause(getVariant(cards[slot]).rarity));}
 if(!active())return false;complete();return true;
}
