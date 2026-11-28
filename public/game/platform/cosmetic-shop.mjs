const TIER_LABELS = new Map([
  ['Standard','Normal'],
  ['Gold','Animated'],
  ['Void','Premium Animated']
]);

/** @param {string} [rarity] */
export function cosmeticTierLabel(rarity) {
  return TIER_LABELS.get(rarity ?? 'Standard') ?? 'Normal';
}

export const SHOP_PORTRAITS = Object.freeze([
  {id:'portrait-cosmic-doge', kind:'portrait', name:'Cosmic Doge', rarity:'Standard', motion:null, image:'/game/assets/cards/rarity-v16/doge-legendary.webp'},
  {id:'portrait-crystal-cat', kind:'portrait', name:'Crystal Keyboard Cat', rarity:'Standard', motion:null, image:'/game/assets/cards/memes-v48/keyboard-cat-legendary.webp'},
  {id:'portrait-void-pepe', kind:'portrait', name:'Void Pepe', rarity:'Standard', motion:null, image:'/game/assets/cards/rarity-v16/pepe-mythic.webp'},
  {id:'portrait-cosmic-doge-animated', kind:'portrait', name:'Cosmic Doge', rarity:'Gold', motion:'gold', image:'/game/assets/cards/rarity-v16/doge-legendary.webp'},
  {id:'portrait-void-pepe-animated', kind:'portrait', name:'Void Pepe', rarity:'Void', motion:'void', image:'/game/assets/cards/rarity-v16/pepe-mythic.webp'}
]);
