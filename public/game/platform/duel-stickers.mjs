export const DUEL_STICKERS = Object.freeze({
  kekw: Object.freeze({name:'KEKW', emotion:'Laugh', rarity:'Standard', image:'/game/assets/stickers/laugh.png'}),
  'rage-guy': Object.freeze({name:'Rage Guy', emotion:'Angry', rarity:'Standard', image:'/game/assets/stickers/rage.png'}),
  'dramatic-chipmunk': Object.freeze({name:'Dramatic Chipmunk', emotion:'Shock', rarity:'Standard', image:'/game/assets/stickers/shock.png'}),
  'crying-cat': Object.freeze({name:'Crying Cat', emotion:'Sad', rarity:'Standard', image:'/game/assets/stickers/cry.png'}),
  'sticker-wow-static': Object.freeze({name:'Wow', emotion:'Amazed', rarity:'Standard', image:'/game/assets/stickers/wow.png'}),
  'sticker-one-more-static': Object.freeze({name:'One More?', emotion:'Playful', rarity:'Standard', image:'/game/assets/stickers/one-more.png'}),
  'sticker-wow': Object.freeze({name:'Wow', emotion:'Amazed', rarity:'Gold', image:'/game/assets/stickers/wow.png'}),
  'sticker-one-more': Object.freeze({name:'One More?', emotion:'Playful', rarity:'Gold', image:'/game/assets/stickers/one-more.png'}),
  'sticker-boom': Object.freeze({name:'Boom', emotion:'Triumph', rarity:'Void', image:'/game/assets/stickers/boom.png'})
});
export const STARTER_STICKER_SLOTS = Object.freeze(['kekw','rage-guy','dramatic-chipmunk','crying-cat']);

export function validStickerSlots(slots) {
  return Array.isArray(slots)
    && slots.length === STARTER_STICKER_SLOTS.length
    && new Set(slots).size === slots.length
    && slots.every(id => typeof id === 'string' && Object.hasOwn(DUEL_STICKERS,id));
}
