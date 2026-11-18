export const CARD_RARITIES=Object.freeze({
 common:Object.freeze({key:'common',label:'Common',rank:1,mark:'I',color:'#b9c7d9',metal:'#77869e',finish:'Geschliffener Stahl',motion:'Ruhiger Metallrahmen'}),
 rare:Object.freeze({key:'rare',label:'Rare',rank:2,mark:'II',color:'#5dcaff',metal:'#245fba',finish:'Azur-Kristall',motion:'Kühler Schimmer über dem Motiv'}),
 epic:Object.freeze({key:'epic',label:'Epic',rank:3,mark:'III',color:'#c091ff',metal:'#733bb4',finish:'Amethyst',motion:'Violett-blauer Motivschimmer'}),
 legendary:Object.freeze({key:'legendary',label:'Legendary',rank:4,mark:'IV',color:'#ffcf75',metal:'#a97632',finish:'Sonnengold',motion:'Goldener Motivglanz und Funken'}),
 mythic:Object.freeze({key:'mythic',label:'Mythic',rank:5,mark:'V',color:'#f1b6ff',metal:'#8b5baf',finish:'Void-Prisma',motion:'Prismatisches Farbspiel im Motiv'}),
});
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
