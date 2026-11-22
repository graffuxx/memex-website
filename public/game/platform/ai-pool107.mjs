import {DEFINITIONS,VARIANTS} from './catalog.mjs';
// Bots may only draw released Alpha variants, never prototypes or referral exclusives.
export const AI_DEFINITIONS107=Object.freeze(DEFINITIONS.filter(c=>c.edition==='alpha'));
const ids=new Set(AI_DEFINITIONS107.map(c=>c.id));
export const AI_VARIANTS107=Object.freeze(VARIANTS.filter(v=>v.edition==='alpha'&&ids.has(v.definitionId)));
