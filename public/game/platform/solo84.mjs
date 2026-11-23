import {validateDeck,countCards,starterDeck,MAX_ICONICS} from './catalog.mjs?v=booster-classes-140';
import {ELEMENT_IDS} from './elements53.mjs';
import {AI_DEFINITIONS107 as DEFINITIONS,AI_VARIANTS107 as VARIANTS} from './ai-pool107.mjs';
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
 if(style==='mirror'){if(!validateDeck(cards,countCards(cards)).valid)throw Error('Mirror opponent needs a legal 15-card deck.');return [...cards];}
 let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const pool=DEFINITIONS.filter(c=>!c.prime&&!c.iconic&&(style!=='pressure'||Math.max(...c.values)>=6));
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 const selected=ELEMENT_IDS.flatMap(element=>pool.filter(c=>c.element===element).slice(0,3));
 if(selected.length!==15)return starterDeck();
 if(random()<.5){const primes=DEFINITIONS.filter(c=>c.prime);if(primes.length){const prime=primes[Math.floor(random()*primes.length)],index=selected.findIndex(c=>c.element===prime.element);selected[index]=prime;}}
 const iconics=DEFINITIONS.filter(card=>card.iconic);
 for(let slot=0;slot<MAX_ICONICS&&iconics.length&&random()<(slot===0?.8:.35);slot++){
  const [iconic]=iconics.splice(Math.floor(random()*iconics.length),1);
  const index=selected.findIndex(card=>!card.prime&&!card.iconic&&card.element===iconic.element);
  if(index>=0)selected[index]=iconic;
 }
 return selected.map(c=>VARIANTS.find(v=>v.definitionId===c.id&&v.rarity==='common').id);
}
// All solo practice is local and cannot be used as a currency reward claim.
export const localSolo84=deck=>Boolean(soloSettings84(deck?.practice));
