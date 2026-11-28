export const DUEL_STICKERS = Object.freeze({
  kekw: Object.freeze({name:'KEKW', emotion:'Laugh', rarity:'Standard', image:'/game/assets/stickers/laugh.png'}),
  'rage-guy': Object.freeze({name:'Rage Guy', emotion:'Angry', rarity:'Standard', image:'/game/assets/stickers/rage.png'}),
  'dramatic-chipmunk': Object.freeze({name:'Dramatic Chipmunk', emotion:'Shock', rarity:'Standard', image:'/game/assets/stickers/shock.png'}),
  'crying-cat': Object.freeze({name:'Crying Cat', emotion:'Sad', rarity:'Standard', image:'/game/assets/stickers/cry.png'}),
  'sticker-wow-static': Object.freeze({name:'Wow', emotion:'Amazed', rarity:'Standard', image:'/game/assets/stickers/wow.png'}),
  'sticker-one-more-static': Object.freeze({name:'One More?', emotion:'Playful', rarity:'Standard', image:'/game/assets/stickers/one-more.png'}),
  'sticker-wow': Object.freeze({name:'Wow', emotion:'Amazed', rarity:'Gold', image:'/game/assets/stickers/wow.png'}),
  'sticker-one-more': Object.freeze({name:'One More?', emotion:'Playful', rarity:'Gold', image:'/game/assets/stickers/one-more.png'}),
  'sticker-boom': Object.freeze({name:'Boom', emotion:'Triumph', rarity:'Void', image:'/game/assets/stickers/boom.png'}),
  'sticker-grass-dlc': Object.freeze({name:'Grass DLC', emotion:'Teasing', rarity:'Standard', image:'/game/assets/stickers/grass.png'}),
  'sticker-404-brain': Object.freeze({name:'404 Brain', emotion:'Confused', rarity:'Standard', image:'/game/assets/stickers/brain.png'}),
  'sticker-desk-flip': Object.freeze({name:'Desk Flip', emotion:'Angry', rarity:'Gold', image:'/game/assets/stickers/desk-flip.png', motion:'desk-flip', prop:'/game/assets/stickers/desk-prop.png'}),
  'sticker-bonk-goose': Object.freeze({name:'Bonk Goose', emotion:'Teasing', rarity:'Gold', image:'/game/assets/stickers/goose.png', motion:'bonk', prop:'/game/assets/stickers/bonk-prop.png'}),
  'sticker-alt-f4-cat': Object.freeze({name:'Alt+F4 Cat', emotion:'Playful', rarity:'Void', image:'/game/assets/stickers/cat.png', motion:'portal-cat'})
});
export const STARTER_STICKER_SLOTS = Object.freeze(['kekw','rage-guy','dramatic-chipmunk','crying-cat']);

export function validStickerSlots(slots) {
  return Array.isArray(slots)
    && slots.length === STARTER_STICKER_SLOTS.length
    && new Set(slots).size === slots.length
    && slots.every(id => typeof id === 'string' && Object.hasOwn(DUEL_STICKERS,id));
}
