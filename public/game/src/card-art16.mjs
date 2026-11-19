import {DEFINITIONS,VARIANTS} from '../platform/catalog.mjs';
// Cosmetic artwork progression. Identity, rules and controller remain independent.
export const CARD_ART=Object.freeze(Object.fromEntries(DEFINITIONS.map(c=>[c.id,Object.freeze(Object.fromEntries(VARIANTS.filter(v=>v.definitionId===c.id).map(v=>[v.rarity,v.image.replace('/game/','../')])))])));
export function artworkFor(profile,rarity='common'){
 if(!Object.hasOwn(CARD_ART,profile))throw new Error('Unbekanntes Kartenmotiv.');
 return CARD_ART[profile][Object.hasOwn(CARD_ART[profile],rarity)?rarity:'common'];
}
export const OWNER_MARKERS=Object.freeze([
 Object.freeze({color:'#55ed94',label:'● DU',name:'deine Karte'}),
 Object.freeze({color:'#ff5d72',label:'◆ GEGNER',name:'gegnerische Karte'})
]);
export function ownerMarker(controller){return controller===0||controller===1?OWNER_MARKERS[controller]:null;}
