// Cosmetic artwork progression. Identity, rules and controller remain independent.
export const CARD_ART=Object.freeze({
 pepe:Object.freeze({common:'../assets/cards/v03/overthinker-thinking-pepe.webp',...variants('pepe')}),
 doge:Object.freeze({common:'../assets/cards/frame-v21/swollen-doge.webp',...variants('doge')}),
 'roll-safe':Object.freeze({common:'../assets/cards/v04/roll-safe.webp',...variants('roll-safe')})
});
function variants(profile){return Object.fromEntries(['rare','epic','legendary','mythic'].map(tier=>[tier,`../assets/cards/rarity-v16/${profile}-${tier}.webp`]));}
export function artworkFor(profile,rarity='common'){
 if(!Object.hasOwn(CARD_ART,profile))throw new Error('Unbekanntes Kartenmotiv.');
 return CARD_ART[profile][Object.hasOwn(CARD_ART[profile],rarity)?rarity:'common'];
}
export const OWNER_MARKERS=Object.freeze([
 Object.freeze({color:'#55ed94',label:'● DU',name:'deine Karte'}),
 Object.freeze({color:'#ff5d72',label:'◆ GEGNER',name:'gegnerische Karte'})
]);
export function ownerMarker(controller){return controller===0||controller===1?OWNER_MARKERS[controller]:null;}
