import {FRAME_LAYOUT} from './card-layout21.mjs';

export const ABILITY_ICON_SIZE=.228;
const symbols={
 'beta-cinema':{color:'#ffd28e',path:'M3 11h18v9H3zM3 8l17-4 1 4-17 4M8 7l3 3m3-5 3 4'},
 'beta-hamster':{color:'#83ccff',path:'M11 3C9 8 5 12 5 16a6 6 0 0 0 12 0c0-4-4-8-6-13zm7 2v5m-2-2 2 2 2-2'},
 'beta-tpose':{color:'#e8c686',path:'M12 4h.1M3 9h18m-9-3v8m0 0-4 7m4-7 4 7'},
 'beta-continued':{color:'#a4efdb',path:'M3 17c5 0 6-8 12-8h5m-4-4 4 4-4 4M5 7h3m-5 4h3'},
 'beta-hackerman':{color:'#cfabff',path:'m8 6-5 6 5 6m8-12 5 6-5 6m-4-1 1-10'},
 'beta-spicy':{color:'#ff9f73',path:'M9 4c0 4-5 5-5 11a5 5 0 0 0 10 0c0-3-1-4-2-5m4-5c0 3 4 4 4 7a3 3 0 0 1-2 3'},
 'beta-headout':{color:'#8bd9ff',path:'M14 4H5v16h9m-5-8h12m-4-4 4 4-4 4'},
 'beta-highground':{color:'#f2d09a',path:'M3 20h6v-5h5v-5h7m-5-4 3-3 3 3m-3-3v5'},
 'beta-parkour':{color:'#abfbe8',path:'M3 12c3-7 12-7 17 0m-5-1 5 1-1-5M8 20v-5h7v5'},
 'beta-over9000':{color:'#e5b7ff',path:'M3 17a9 9 0 1 1 18 0H3zm9-1 5-7M6 13h.1m6-5h.1'},

 hype:{color:'#ffe6a5',path:'M14 2 5 14h7l-2 8 9-12h-7z',solid:true},
 guard:{color:'#ffe6a5',path:'M12 2.5 20 6v5c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V6z'},
 twist:{color:'#ffe6a5',path:'M20 4v5h-5M20 9a8 8 0 1 0 .1 6'},
 fire:{color:'#ffc272',path:'M12 2c3 4 4 7 3 10l4-4c3 5 3 13-7 14-7 0-9-5-7-10l2-4 3 4c1-3 0-6 2-10z',solid:true},
 water:{color:'#8eeaff',path:'M12 2.5 20 6v5c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V6z M7 12c2-3 3-3 5 0s3 3 5 0'},
 earth:{color:'#f1d494',path:'M3 16 7 7l6-4 6 4 3 9-5 4H7z M7 7l4 6 8-6m-8 6-4 7'},
 air:{color:'#baf4e8',path:'M2 8h13a3 3 0 1 0-3-3M2 12h16a3 3 0 1 1-3 3M4 16h6a2.5 2.5 0 1 1-2.5 2.5'},
 storm:{color:'#d4bdff',path:'M14 2 4 14h7l-1 8L20 9h-7z',solid:true},
 rage:{color:'#ffbb71',path:'m12 7 5 5-5 5-5-5z M3 9l-2 3 2 3m18-6 2 3-2 3'},
 buttons:{color:'#9ae8ff',path:'M4 7h6v10H4z M14 7h6v10h-6z M7 12h.1m10 0h.1'},
 exchange:{color:'#a7f2dd',path:'M3 8h17l-4-4m4 12H3l4 4'},
 handCycle:{color:'#efdb9c',path:'M3 8h16l-4-4m6 12H5l4 4M7 5v6m10 2v6'},
 boardRecall:{color:'#ffd9a8',path:'M5 15h14v5H5zM12 13V4m-4 4 4-4 4 4'},
 handDisrupt:{color:'#ffb6e9',path:'M3 7h18M6 12h12M9 17h6m-5 4 2-4 2 4'},
 luxury:{color:'#efdb9c',path:'M3 8h16l-4-4m6 12H5l4 4M7 5v6m10 2v6'},
 wander:{color:'#c1edd6',path:'M6 4v5h5M6 9a7 7 0 1 1 0 7m12 4v-5h-5'},
 sidestep:{color:'#b9f3ba',path:'M4 18h7m-6-5 3 5-3 5M10 18c7 0 9-3 9-8V4m-4 4 4-4 4 4'},
 laugh:{color:'#ffd584',path:'M4 9c2-2 4-2 6 0m4 0c2-2 4-2 6 0M5 13h14c-1 6-4 8-7 8s-6-2-7-8Z'},
 solitude:{color:'#aee5ff',path:'m12 4 4 8-4 8-4-8zM3 12h.1m18 0h.1'},
 rainbow:{color:'#f8b9f0',path:'M3 17a9 9 0 0 1 18 0M7 17a5 5 0 0 1 10 0m-6 0a1 1 0 0 1 2 0'},
 swipe:{color:'#efbe9c',path:'M12 3 20 6v5c0 5-4 8-8 11-4-3-8-6-8-11V6zM8 12h8'},
 loot:{color:'#ffe4a0',path:'M12 3 20 6v5c0 5-4 8-8 11-4-3-8-6-8-11V6zm0 5 3 4-3 4-3-4z'},
 encore:{color:'#fada90',path:'M9 17V6l11-3v12M9 7l11-3M9 17a3 2 0 1 1-6 0 3 2 0 1 1 6 0m11-2a3 2 0 1 1-6 0 3 2 0 1 1 6 0'},
 bid:{color:'#ffca85',path:'M3 7h18v11H3zM7 11h.1m9 3h.1M12 10v5m-2-2.5h4'},
 decoy:{color:'#bdf1e4',path:'M3 12c4-7 14-7 18 0-4 7-14 7-18 0zm9-4v4l4 1m-4 3h.1'},
 chase:{color:'#ffb077',path:'M2 8h5m-4 8h5m0-4h13m-5-5 5 5-5 5'},
 cover:{color:'#e8d3a2',path:'M4 20V9l8-5 8 5v11M8 20v-7l4-3 4 3v7'},
 objection:{color:'#ffab9f',path:'M12 3v11m0 4v.1M4 20 2 11 12 3l10 8-2 9z'},
 thought:{color:'#cdbbff',path:'M4 7h15l-4-4m5 14H5l4 4M8 8c1 3 7 5 8 8M8 16c1-3 7-5 8-8'},
 awkward:{color:'#9ce3f8',path:'M3 5h18v11H9l-5 4v-4H3zM8 10h.1m4 0h.1m4 0h.1'},
 plotTwist:{color:'#f2c0ff',path:'M13 2 4 14h7l-1 8 10-12h-7z'},
 ambush:{color:'#f2c0ff',path:'M4 13h16m-6-6 6 6-6 6M4 7v12'},
 nested:{color:'#bfcaff',path:'M3 7l9-4 9 4v10l-9 4-9-4zm5 3 4-2 4 2v4l-4 2-4-2z'},
 phalanx:{color:'#ffc792',path:'M3 8l4-4 4 4v5l-4 3-4-3zm10 0 4-4 4 4v5l-4 3-4-3zm-4 11 3-3 3 3-3 3z'},
 dash:{color:'#92ddff',path:'M3 8h7m-6 8h6m0-11 6 7-6 7m6-14 5 7-5 7'},
 bailout:{color:'#b2e0ff',path:'M12 3 20 9v10l-8 3-8-3V9zm0 4v10m-4-5h8'},
 blink:{color:'#bba9ff',path:'M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12zm10-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z'},
 cling:{color:'#ffa3d3',path:'M10 8 8 6a4 4 0 0 0-6 6l4 4a4 4 0 0 0 6 0l6-6a4 4 0 0 1 4 0m-8 6 2 2a4 4 0 0 0 6-6l-4-4a4 4 0 0 0-6 0l-6 6'},
 fan:{color:'#f8bfa4',path:'M4 6h16v12H4zM4 6l16 12m0-12L4 18'},
 overload:{color:'#ffbf9e',path:'M3 6h18v12H3zM6 9h1m3 0h1m3 0h1m3 0h1M6 12h1m10 0h1m-9 3h6M11 6l4 6-3 6'},
 jam:{color:'#ffbf9e',path:'M3 6h18v12H3zM6 9h1m3 0h1m3 0h1m3 0h1M6 12h1m10 0h1m-9 3h6M9 7l6 10'},
 pincerSandwich:{color:'#f8d998',path:'M3 9l4 3-4 3m18-6-4 3 4 3m-9-7-4 4 4 4 4-4z'},
 sandwich:{color:'#f8d998',path:'M3 7l9-4 9 4-9 4zM3 12l9 4 9-4M3 17l9 4 9-4'},
 chorus:{color:'#ffb6e9',path:'M4 9l3-3 3 3M7 6v10m7-1 3 3 3-3m-3 3V8M11 8h2m-2 8h2'},
 patience:{color:'#90e2d7',path:'M6 3h12M6 21h12M8 3v3l4 5 4-5V3m-8 18v-3l4-5 4 5v3'},
 relay:{color:'#90e2d7',path:'M4 7h14l-4-4m4 14H5l4 4M5 17l4-4M18 7l-4 4'},
 retry:{color:'#ffd9a8',path:'M7 7a8 8 0 1 1-1 11m1-11V3m0 4h5'},
 pincer:{color:'#a9f6fb',path:'M3 18c7 0 9-3 9-12m9 12c-7 0-9-3-9-12M8 9l4-4 4 4'},
 roundhouse:{color:'#ffae76',path:'M19 4v5h-5m5 0a7.8 7.8 0 1 0 .5 6M12 7v6l4 2'},
 gate:{color:'#e7cc94',path:'M4 21V3m16 18V3M4 6h16M4 12h16m-11 0V6m6 6V6'},
 ernie:{color:'#ff8da7',path:'M12 2.5 21 6v5c0 5-4 8.5-9 11-5-2.5-9-6-9-11V6z M12 6c0 3-3 4-3 7a3 3 0 0 0 6 0c0-2-1-3-1-4l-1 2c0-2 0-3-1-5z'},
};

function iconPath(ability,strokeWidth=1.8){
 const icon=Object.hasOwn(symbols,ability)?symbols[ability]:null;
 if(!icon)return '';
 return `<path d="${icon.path}" fill="${icon.solid?icon.color:'none'}" stroke="${icon.solid?'none':icon.color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
export function abilityIconTextureSvg(ability,{strokeWidth=1.8}={}){
 const path=iconPath(ability,strokeWidth);
 return path?`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24">${path}</svg>`:'';
}
export const ABILITY_ICON_KEYS=Object.keys(symbols);

export function cardAbilityIconMarkup(ability){
 const path=iconPath(ability),radius=ABILITY_ICON_SIZE/2;
 return path?`<svg data-card-ability="${ability}" x="${-radius}" y="${-FRAME_LAYOUT.abilityY-radius}" width="${ABILITY_ICON_SIZE}" height="${ABILITY_ICON_SIZE}" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`:'';
}
