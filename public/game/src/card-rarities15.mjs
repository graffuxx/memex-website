import {CARD_MATERIALS} from './card-materials22.mjs';
export const CARD_RARITIES=Object.freeze(Object.fromEntries(Object.entries(CARD_MATERIALS).map(([key,m],index)=>[key,Object.freeze({key,label:m.de,rank:index+1,mark:['I','II','III','IV','V'][index],color:m.color,metal:m.metal,finish:m.finish,motion:m.motion})])));
export const RARITY_KEYS=Object.freeze(Object.keys(CARD_RARITIES));
export const OWNER_COLORS=Object.freeze(['#55ed94','#ff5d72']);
export function rarityOf(card){return Object.hasOwn(CARD_RARITIES,card?.rarity)?CARD_RARITIES[card.rarity]:CARD_RARITIES.common;}
// Demo finishes are stable, symmetric and independent of the three card profiles.
// They are sample metadata, not booster odds, inventory or gameplay upgrades.
export function withDemoFinishes(game){
 const next=structuredClone(game);
 for(const card of [...next.players.flatMap(p=>[...p.hand,...p.deck]),...Object.values(next.board)]){
  if(Object.hasOwn(CARD_RARITIES,card.rarity))continue;
  const index=Number(/(\d+)$/.exec(card.uid)?.[1]??0);
  card.rarity=RARITY_KEYS[index%RARITY_KEYS.length];
 }
 return next;
}
