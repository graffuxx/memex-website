export const BOT_PERSONALITY_VERSION134='personalities-1';
export const BOT_STYLES134=Object.freeze([
 {id:'aggressive',label:'Aggressive',description:'Pressures exposed cards and accepts more positional risk.',capture:2.65,safety:.29,contacts:.12,twist:.85,variety:.20},
 {id:'defensive',label:'Defensive',description:'Protects exposed edges and builds connected positions.',capture:1.90,safety:.62,contacts:.22,twist:1.10,variety:.06},
 {id:'balanced',label:'Balanced',description:'Balances captures, safe edges and board position.',capture:2.15,safety:.43,contacts:.17,twist:1,variety:.12}
].map(style=>Object.freeze(style)));

// A stable personality belongs to the opponent for the whole duel, including reconnects.
// This is seeded parameter variation, not training or a model-provider connection.
export function botPersonality134(seed){
 let n=((seed>>>0)^0x9e3779b9)>>>0;
 n=Math.imul(n^(n>>>16),0x85ebca6b);n=Math.imul(n^(n>>>13),0xc2b2ae35);n=(n^(n>>>16))>>>0;
 const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
 const style=BOT_STYLES134[Math.floor(random()*BOT_STYLES134.length)],vary=value=>Number((value*(.90+random()*.20)).toFixed(5));
 return {version:BOT_PERSONALITY_VERSION134,id:style.id,label:style.label,description:style.description,
  weights:{capture:vary(style.capture),safety:vary(style.safety),contacts:vary(style.contacts),twist:vary(style.twist)},variety:vary(style.variety)};
}
