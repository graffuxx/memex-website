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

 sidestep:{color:'#b9f3ba',path:'M4 18h7m-6-5 3 5-3 5M10 18c7 0 9-3 9-8V4m-4 4 4-4 4 4'},
 laugh:{color:'#ffd584',path:'M4 9c2-2 4-2 6 0m4 0c2-2 4-2 6 0M5 13h14c-1 6-4 8-7 8s-6-2-7-8Z'},
 solitude:{color:'#aee5ff',path:'m12 4 4 8-4 8-4-8zM3 12h.1m18 0h.1'},
 rainbow:{color:'#f8b9f0',path:'M3 17a9 9 0 0 1 18 0M7 17a5 5 0 0 1 10 0m-6 0a1 1 0 0 1 2 0'},
 swipe:{color:'#efbe9c',path:'M12 3 20 6v5c0 5-4 8-8 11-4-3-8-6-8-11V6zM8 12h8'},
 encore:{color:'#fada90',path:'M9 17V6l11-3v12M9 7l11-3M9 17a3 2 0 1 1-6 0 3 2 0 1 1 6 0m11-2a3 2 0 1 1-6 0 3 2 0 1 1 6 0'},
 bid:{color:'#ffca85',path:'M3 7h18v11H3zM7 11h.1m9 3h.1M12 10v5m-2-2.5h4'},
 decoy:{color:'#bdf1e4',path:'M3 12c4-7 14-7 18 0-4 7-14 7-18 0zm9-4v4l4 1m-4 3h.1'},
 chase:{color:'#ffb077',path:'M2 8h5m-4 8h5m0-4h13m-5-5 5 5-5 5'},
 cover:{color:'#e8d3a2',path:'M4 20V9l8-5 8 5v11M8 20v-7l4-3 4 3v7'},
 objection:{color:'#ffab9f',path:'M12 3v11m0 4v.1M4 20 2 11 12 3l10 8-2 9z'},
 thought:{color:'#cdbbff',path:'M4 7h15l-4-4m5 14H5l4 4M8 8c1 3 7 5 8 8M8 16c1-3 7-5 8-8'},
 jam:{color:'#ffbf9e',path:'M3 6h18v12H3zM6 9h1m3 0h1m3 0h1m3 0h1M6 12h1m10 0h1m-9 3h6M9 7l6 10'},
 sandwich:{color:'#f8d998',path:'M3 7l9-4 9 4-9 4zM3 12l9 4 9-4M3 17l9 4 9-4'},
 chorus:{color:'#ffb6e9',path:'M4 9l3-3 3 3M7 6v10m7-1 3 3 3-3m-3 3V8M11 8h2m-2 8h2'},
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
