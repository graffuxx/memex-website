import {FRAME_LAYOUT} from './card-layout21.mjs';

export const ABILITY_ICON_SIZE=.228;
const symbols={
 hype:{color:'#ffe6a5',path:'M14 2 5 14h7l-2 8 9-12h-7z',solid:true},
 guard:{color:'#ffe6a5',path:'M12 2.5 20 6v5c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V6z'},
 twist:{color:'#ffe6a5',path:'M20 4v5h-5M20 9a8 8 0 1 0 .1 6'},
 fire:{color:'#ffc272',path:'M12 2c3 4 4 7 3 10l4-4c3 5 3 13-7 14-7 0-9-5-7-10l2-4 3 4c1-3 0-6 2-10z',solid:true},
 water:{color:'#8eeaff',path:'M12 2.5 20 6v5c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V6z M7 12c2-3 3-3 5 0s3 3 5 0'},
 earth:{color:'#f1d494',path:'M3 16 7 7l6-4 6 4 3 9-5 4H7z M7 7l4 6 8-6m-8 6-4 7'},
 air:{color:'#baf4e8',path:'M2 8h13a3 3 0 1 0-3-3M2 12h16a3 3 0 1 1-3 3M4 16h6a2.5 2.5 0 1 1-2.5 2.5'},
 storm:{color:'#d4bdff',path:'M14 2 4 14h7l-1 8L20 9h-7z',solid:true},

};

function iconPath(ability){
 const icon=Object.hasOwn(symbols,ability)?symbols[ability]:null;
 if(!icon)return '';
 return `<path d="${icon.path}" fill="${icon.solid?icon.color:'none'}" stroke="${icon.solid?'none':icon.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
}
export function abilityIconTextureSvg(ability){
 const path=iconPath(ability);
 return path?`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24">${path}</svg>`:'';
}
export const ABILITY_ICON_KEYS=Object.keys(symbols);

export function cardAbilityIconMarkup(ability){
 const path=iconPath(ability),radius=ABILITY_ICON_SIZE/2;
 return path?`<svg data-card-ability="${ability}" x="${-radius}" y="${-FRAME_LAYOUT.abilityY-radius}" width="${ABILITY_ICON_SIZE}" height="${ABILITY_ICON_SIZE}" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`:'';
}
