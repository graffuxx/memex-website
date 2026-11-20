import {DEFINITIONS,VARIANTS,validateDeck,starterDeck} from './catalog.mjs';
import {ELEMENT_IDS} from './elements53.mjs';
export const SOLO_LEVELS84=Object.freeze([
 {id:'easy',name:'Easy',description:'Focuses on immediate captures.'},
 {id:'standard',name:'Standard',description:'Balances captures and board position.'},
 {id:'tactical',name:'Tactical',description:'Also checks possible counterattacks.'}
]);
export const SOLO_OPPONENTS84=Object.freeze([
 {id:'balanced',name:'Mixed elements',description:'A varied deck across all five elements.'},
 {id:'pressure',name:'Pressure deck',description:'More exposed high-value attacking sides.'},
 {id:'mirror',name:'Mirror my deck',description:'The AI uses the same 15 cards as you.'}
]);
export function soloSettings84(value){
 if(!value||!['training','deck-test'].includes(value.mode))return null;
 return {mode:value.mode,difficulty:SOLO_LEVELS84.some(l=>l.id===value.difficulty)?value.difficulty:'standard',opponent:SOLO_OPPONENTS84.some(o=>o.id===value.opponent)?value.opponent:'balanced',timed:value.timed===true};
}
export function prepareSolo84(deck,inventory,settings){
 const practice=soloSettings84(settings),result=validateDeck(deck?.cards,inventory??{});
 if(!practice||!result.valid)throw Error(result.errors?.[0]??'Choose a valid practice mode.');
 return {version:1,cards:[...deck.cards],inventory:{...inventory},name:typeof deck.name==='string'?deck.name.slice(0,40):'Practice deck',deckId:typeof deck.deckId==='string'?deck.deckId:null,source:['account','sandbox'].includes(deck.source)?deck.source:'guest',practice};
}
export function soloOpponent84(style,cards,seed=1){
 if(style==='mirror')return [...cards];
 let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const base=['pepe','doge','roll-safe'],pool=DEFINITIONS.filter(c=>!base.includes(c.id)&&(style!=='pressure'||Math.max(...c.values)>=6));
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 const motifs=[...base,...pool.slice(0,2).map(c=>c.id)];
 if(motifs.length!==5)return starterDeck();
 return Array.from({length:15},(_,i)=>VARIANTS.find(v=>v.definitionId===motifs[Math.floor(i/3)]&&v.element===ELEMENT_IDS[i%5]&&v.rarity==='common').id);
}
// All solo practice is local and cannot be used as a currency reward claim.
export const localSolo84=deck=>Boolean(soloSettings84(deck?.practice));
