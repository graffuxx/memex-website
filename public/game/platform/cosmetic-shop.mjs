const TIER_LABELS = new Map([
  ['Standard','Normal'],
  ['Gold','Animated'],
  ['Void','Premium Animated']
]);

/** @param {string} [rarity] */
export function cosmeticTierLabel(rarity) {
  return TIER_LABELS.get(rarity ?? 'Standard') ?? 'Normal';
}

const portraitArt='/game/assets/portraits/shop-v1/';

export const SHOP_PORTRAITS = Object.freeze([
  {id:'portrait-cosmic-doge', kind:'portrait', name:'Cosmic Doge', rarity:'Standard', motion:null, image:portraitArt+'cosmic-doge.webp'},
  {id:'portrait-crystal-cat', kind:'portrait', name:'Crystal Keyboard Cat', rarity:'Standard', motion:null, image:portraitArt+'crystal-keyboard-cat.webp'},
  {id:'portrait-void-pepe', kind:'portrait', name:'Void Pepe', rarity:'Standard', motion:null, image:portraitArt+'void-pepe.webp'},
  {id:'portrait-cosmic-doge-animated', kind:'portrait', name:'Cosmic Doge', rarity:'Gold', motion:'warp', image:portraitArt+'cosmic-doge-animated.webp'},
  {id:'portrait-void-pepe-animated', kind:'portrait', name:'Void Pepe', rarity:'Void', motion:'rift', image:portraitArt+'void-pepe-animated.webp'}
]);
