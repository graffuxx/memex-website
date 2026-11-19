import {validateDeck,starterInventory,starterDeck,expandGameDeck} from './catalog.mjs';
export const PLAY_DECK_KEY='duelverse.play-deck.v1';
export function readPlayDeck(storage){
 try{const saved=JSON.parse(storage.getItem(PLAY_DECK_KEY));if(saved?.version!==1)return null;
 // This is an unranked local alpha snapshot, never proof of ownership or a reward claim.
 const result=validateDeck(saved.cards,saved.inventory??{});
 return result.valid?{cards:saved.cards,name:typeof saved.name==='string'?saved.name.slice(0,40):'My deck',source:saved.source==='sandbox'?'sandbox':saved.source==='account'?'account':'guest'}:null;
 }catch{return null;}
}
export function applyPortalDecks(game,cards,loadouts,{round=1}={}){
 if(![1,2].includes(round))throw Error('Invalid round.');
 const next=structuredClone(game);
 next.players=next.players.map((p,side)=>{
  let state=(next.seed*53+side*8017+111)>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const deck=expandGameDeck(side===0?cards:starterDeck(),side);
  // Preserve the current prototype's maximum of two ability cards per side.
  for(const ability of loadouts[side].abilities){const candidates=deck.filter(c=>({oracle:'guard',brain:'hype',trust:'twist'})[c.id]===ability);if(candidates.length)candidates[Math.floor(random()*candidates.length)].ability=ability;}
  // Keep the physical cards/abilities and arena, but reshuffle both decks for the return round.
  if(round===2)state=(state^0x9e3779b9)>>>0;
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  return {...p,hand:deck.slice(0,5),deck:deck.slice(5)};
 });
 next.portalDeck=true;return next;
}
export function defaultPlayDeck(){return {cards:starterDeck(),inventory:starterInventory(),name:'Starter deck',version:1};}
