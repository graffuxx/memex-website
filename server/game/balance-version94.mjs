import {DEFINITIONS,CATALOG_VERSION} from '../../public/game/platform/catalog.mjs';
import {ELEMENT_LIST} from '../../public/game/platform/elements53.mjs';
// Bump the patch for rule/ability changes as well as card-value changes.
export const BALANCE_PATCH94='alpha-2026-11-23.3';
export const BALANCE_RULES94=Object.freeze({patch:BALANCE_PATCH94,revision:3,catalog:CATALOG_VERSION,
 elements:ELEMENT_LIST.map(e=>({id:e.id,beats:e.beats})),nativeElementsOnly:true,eventFieldsEnabled:false,afkAfter:2,afkTurnMs:3000,automaticNextRound:true,elementTiesOnly:true,rotationLocked:true,
 turnMs:90000,handSize:5,deckSize:15,maxMotifCopies:1,maxPrimes:1,sRankElementOnly:true,abilities:{hype:1,guard:2,guardPlacements:2,twistDegrees:60},
 cards:DEFINITIONS.map(c=>({id:c.id,element:c.element,values:c.values,ability:c.ability??null,prime:Boolean(c.prime)}))});
const source=JSON.stringify(BALANCE_RULES94);
let hash=0xcbf29ce484222325n;
for(const c of source){hash^=BigInt(c.charCodeAt(0));hash=BigInt.asUintN(64,hash*0x100000001b3n);}
export const BALANCE_FINGERPRINT94=hash.toString(16).padStart(16,'0');
export const balanceVersion94=(now=Date.now())=>({patch:BALANCE_PATCH94,fingerprint:BALANCE_FINGERPRINT94,rules:BALANCE_RULES94,roundStartedAt:now});
