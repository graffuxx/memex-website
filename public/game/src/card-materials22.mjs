// Shared material definitions and SVG surface treatment for game and collection.
// Rarity IDs remain stable; these finishes never change card values or ownership.
export const CARD_MATERIALS=Object.freeze({
 common:Object.freeze({name:'Normal',de:'Normal',color:'#7396bd',metal:'#18314d',finish:'Dunkler Standardrahmen',motion:'Ruhiges blaues Metall',palette:null}),
 rare:Object.freeze({name:'Silver',de:'Silber',color:'#dce7f4',metal:'#a5b3c5',finish:'Gebürstetes Silber',motion:'Silberreflexe und kühler Schimmer',palette:['#283748','#a7b7c9','#f7fcff']}),
 epic:Object.freeze({name:'Gold',de:'Gold',color:'#ffd16a',metal:'#c99336',finish:'Poliertes Gold',motion:'Warme Goldreflexe',palette:['#41240b','#c59435','#fff1b0']}),
 legendary:Object.freeze({name:'Diamond',de:'Diamant',color:'#b8efff',metal:'#b4d7ee',finish:'Facettierter Diamant',motion:'Eishelle Facetten und Lichtsplitter',palette:['#243e5a','#aecfe8','#fffaff']}),
 mythic:Object.freeze({name:'Void',de:'Void',color:'#cd8aff',metal:'#4b2470',finish:'Void-Obsidian',motion:'Dunkles Prisma und violette Lichtkanten',palette:['#080612','#371747','#be7ef5']}),
});
export const materialOf=key=>CARD_MATERIALS[Object.hasOwn(CARD_MATERIALS,key)?key:'common'];
const source='/game/assets/cards/frame-v21/navy-gold-frame.webp';
let sourceData;
const frames=new Map();
async function frameData(){
 if(!sourceData)sourceData=(async()=>{
  const response=await fetch(source);if(!response.ok)throw Error('Kartenrahmen konnte nicht geladen werden.');
  const bytes=new Uint8Array(await response.arrayBuffer());let binary='';
  for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));
  return 'data:image/webp;base64,'+btoa(binary);
 })().catch(error=>{sourceData=null;throw error;});
 return sourceData;
}
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
export function materialFrameSvg(key,dataUri){
 const spec=materialOf(key),palette=spec.palette??CARD_MATERIALS.rare.palette;
 const table=channel=>palette.map(color=>rgb(color)[channel].toFixed(5)).join(' ');
 const well=Array.from({length:6},(_,i)=>{const a=(i*60-30)*Math.PI/180;return (627+Math.cos(a)*70)+','+(169+Math.sin(a)*70);}).join(' ');
 // Select blue steel only. Gold value plates, name ribbon and dark wells stay intact.
 const blueMask=`<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -1 -.6 1.6 0 0" result="blue"/><feComponentTransfer in="blue" result="threshold"><feFuncA type="linear" slope="7.6923" intercept="-.23077"/></feComponentTransfer><feComposite in="threshold" in2="SourceAlpha" operator="in" result="mask"/>`;
 const commonDefs=`<filter id="select" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">${blueMask}</filter>`;
 let decoration='';
 if(key==='legendary')decoration=`<g mask="url(#metal-mask)"><rect width="1254" height="1254" fill="url(#facets)" opacity=".47"/><path d="M160 330L1100 920M160 920L1100 330" fill="none" stroke="#efffff" stroke-width="5" opacity=".24"/></g>`;
 if(key==='mythic')decoration=`<g mask="url(#metal-mask)"><rect width="1254" height="1254" fill="url(#void)" opacity=".45"/>${Array.from({length:45},(_,i)=>`<circle cx="${(i*283+73)%1254}" cy="${(i*197+29)%1254}" r="${i%4===0?3.2:1.8}" fill="${i%3===0?'#e5c6ff':'#9b6dff'}" opacity=".7"/>`).join('')}</g>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1254" height="1254" viewBox="0 0 1254 1254"><defs>${commonDefs}
 <filter id="grade" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">${blueMask}
 <feColorMatrix in="SourceGraphic" type="matrix" values=".2126 .7152 .0722 0 0  .2126 .7152 .0722 0 0  .2126 .7152 .0722 0 0  0 0 0 1 0" result="luma"/>
 <feComponentTransfer in="luma" result="bright"><feFuncR type="gamma" amplitude="1.4" exponent=".55" offset="0"/><feFuncG type="gamma" amplitude="1.4" exponent=".55" offset="0"/><feFuncB type="gamma" amplitude="1.4" exponent=".55" offset="0"/></feComponentTransfer>
 <feComponentTransfer in="bright" result="material"><feFuncR type="table" tableValues="${table(0)}"/><feFuncG type="table" tableValues="${table(1)}"/><feFuncB type="table" tableValues="${table(2)}"/></feComponentTransfer>
 <feComposite in="material" in2="mask" operator="in" result="coated"/><feComposite in="SourceGraphic" in2="mask" operator="out" result="original"/><feComposite in="original" in2="coated" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/></filter>
 <clipPath id="wells"><polygon points="${well}"/><circle cx="627" cy="1026" r="82"/></clipPath>
 <mask id="metal-mask" mask-type="alpha"><image width="1254" height="1254" xlink:href="${dataUri}" filter="url(#select)"/></mask>
 <pattern id="facets" width="118" height="136" patternUnits="userSpaceOnUse"><path d="M0 0H118L59 68Z" fill="#f1ffff"/><path d="M0 0L59 68L0 136Z" fill="#6b9ccd" opacity=".7"/><path d="M118 0V136L59 68Z" fill="#d6bfff" opacity=".6"/><path d="M0 136L59 68L118 136Z" fill="#a0d9ed" opacity=".8"/><path d="M0 0L59 68L118 0M0 136L59 68L118 136" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/></pattern>
 <linearGradient id="void" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0b031c"/><stop offset=".36" stop-color="#a953e4" stop-opacity=".45"/><stop offset=".57" stop-color="#090516"/><stop offset=".85" stop-color="#6541a3"/><stop offset="1" stop-color="#11091c"/></linearGradient></defs>
 <image width="1254" height="1254" xlink:href="${dataUri}" filter="url(#grade)"/>${decoration}<image width="1254" height="1254" xlink:href="${dataUri}" clip-path="url(#wells)"/></svg>`;
}
export async function materialFrameUrl(key='common'){
 if(key==='common'||!Object.hasOwn(CARD_MATERIALS,key))return source;
 if(!frames.has(key))frames.set(key,frameData().then(data=>URL.createObjectURL(new Blob([materialFrameSvg(key,data)],{type:'image/svg+xml'}))).catch(error=>{frames.delete(key);throw error;}));
 return frames.get(key);
}
