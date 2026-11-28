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
  'sticker-alt-f4-cat': Object.freeze({name:'Alt+F4 Cat', emotion:'Playful', rarity:'Void', image:'/game/assets/stickers/cat.png', motion:'portal-cat'}),
  'sticker-loot-goblin': Object.freeze({
    name:'Loot Goblin', emotion:'Excited', rarity:'Void', motion:'loot-goblin',
    image:'/game/assets/stickers/loot-goblin-raccoon.png',
    prop:'/game/assets/stickers/loot-goblin-chest.png',
    parts:Object.freeze([
      {part:'lid',image:'/game/assets/stickers/loot-goblin-lid.png'},
      {part:'coin-one'}, {part:'coin-two'}, {part:'coin-three'}
    ])
  }),
  'sticker-panic-button': Object.freeze({
    name:'Panic Button', emotion:'Panic', rarity:'Void', motion:'panic-button',
    image:'/game/assets/stickers/panic-button-octopus.png',
    prop:'/game/assets/stickers/panic-button-console.png',
    parts:Object.freeze([{part:'light'},{part:'mark'}])
  }),
  'sticker-make-it-rain': Object.freeze({
    name:'Make It Rain', emotion:'Triumph', rarity:'Void', motion:'make-it-rain',
    image:'/game/assets/stickers/make-it-rain.webp',
    parts:Object.freeze(Array.from({length:6},(_,index)=>Object.freeze({part:'bill-'+(index+1)})))
  })
});
export const STARTER_STICKER_SLOTS = Object.freeze(['kekw','rage-guy','dramatic-chipmunk','crying-cat']);

export function validStickerSlots(slots) {
  return Array.isArray(slots)
    && slots.length === STARTER_STICKER_SLOTS.length
    && new Set(slots).size === slots.length
    && slots.every(id => typeof id === 'string' && Object.hasOwn(DUEL_STICKERS,id));
}

/**
 * @param {{image:string, prop?:string, parts?:ReadonlyArray<{part:string,image?:string}>}} sticker
 * @returns {{part:string,image?:string}[]}
 */
export function stickerSceneLayers(sticker) {
  return [
    {part:'character',image:sticker.image},
    sticker.prop ? {part:'prop',image:sticker.prop} : {part:'effect'},
    ...(sticker.parts ?? [])
  ];
}
