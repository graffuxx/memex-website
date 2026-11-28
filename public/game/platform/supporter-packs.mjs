const path='/game/assets/portraits/supporters/';

export const SUPPORTER_PACKS=Object.freeze([
  {id:'supporter-5',name:'Pixel Ally',cents:500,currency:'EUR',boosters:1,
   portraitId:'supporter-pixel-pigeon',portraitName:'Pixel Pigeon',image:path+'pixel-pigeon.webp',rarity:'Standard',motion:null,titleId:null,titleName:null,stickerId:null},
  {id:'supporter-25',name:'Chaos Patron',cents:2500,currency:'EUR',boosters:3,
   portraitId:'supporter-hype-goose',portraitName:'Hype Goose',image:path+'hype-goose.webp',rarity:'Gold',motion:'warp',titleId:'supporter-chaos-patron',titleName:'Chaos Patron',stickerId:null},
  {id:'supporter-50',name:'Rift Keeper',cents:5000,currency:'EUR',boosters:5,
   portraitId:'supporter-rift-raccoon',portraitName:'Rift Raccoon',image:path+'rift-raccoon.webp',rarity:'Void',motion:'rift',titleId:'supporter-rift-keeper',titleName:'Rift Keeper',stickerId:null},
  {id:'supporter-100',name:'Cash Cow',cents:10000,currency:'EUR',boosters:10,
   portraitId:'supporter-cash-cow',portraitName:'Cash Cow',image:path+'cash-cow.webp',rarity:'Void',motion:'cash',
   titleId:'supporter-certified-cash-cow',titleName:'Certified Cash Cow',stickerId:'sticker-make-it-rain'}
].map(pack=>Object.freeze(pack)));

export const supporterPack=id=>SUPPORTER_PACKS.find(pack=>pack.id===id)??null;
