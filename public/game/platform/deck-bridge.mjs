import {BETA_BY_ID} from './beta-cards.mjs';
import {validateDeck,originalCards116,originalInventory116,starterInventory,starterDeck,expandGameDeck} from './catalog.mjs';
import {standardAbility,releasedIconicAbility,releasedPrimeAbility,ABILITY_FOR} from '../src/table-demo-rules.mjs?v=hand-effects-46';
import {soloSettings84} from './solo84.mjs';
export const PLAY_DECK_KEY='duelverse.play-deck.v1';
export function readPlayDeck(storage){
 try{const saved=JSON.parse(storage.getItem(PLAY_DECK_KEY));if(saved?.version!==1)return null;
 // This is an unranked local alpha snapshot, never proof of ownership or a reward claim.
 const cards=originalCards116(saved.cards),result=validateDeck(cards,originalInventory116(saved.inventory??{}));
 const practice=soloSettings84(saved.practice);if(saved.practice&&!practice)return null;
 return result.valid?{cards,deckId:typeof saved.deckId==='string'?saved.deckId:null,name:typeof saved.name==='string'?saved.name.slice(0,40):'My deck',source:saved.source==='sandbox'?'sandbox':saved.source==='account'?'account':'guest',...(practice?{practice}:{})}:null;
 }catch{return null;}
}
export function portalTrialAbility(game,card){
 return BETA_BY_ID[card.id]?.ability??standardAbility(card)
  ?? (game.iconicAbilities?releasedIconicAbility(card,game.iconicAbilityWave):null)
  ?? (game.allPrimes||game.releasedPrimeTrio?releasedPrimeAbility(card,game.releasedPrimePair,game.allPrimes,game.iconicAbilityWave):null);
}
export function applyPortalDecks(game,cards,loadouts,{round=1,opponentCards=null}={}){
 if(!Number.isSafeInteger(round)||round<1)throw Error('Invalid round.');
 const next=structuredClone(game);
 next.players=next.players.map((p,side)=>{
  let state=(next.seed*53+side*8017+111)>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const deck=expandGameDeck(side===0?cards:opponentCards??starterDeck(),side);
  if(next.elementalTrial){
   for(const card of deck){const ability=portalTrialAbility(next,card);if(ability)card.ability=ability;}
  }else{
   for(const ability of loadouts[side].abilities){const candidates=deck.filter(c=>ABILITY_FOR[c.id]===ability);if(candidates.length)candidates[Math.floor(random()*candidates.length)].ability=ability;}
  }
  // Keep the physical cards/abilities and arena, but reshuffle both decks for each subsequent round.
  if(round>1)state=(state^Math.imul(round-1,0x9e3779b9))>>>0;
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  return {...p,hand:deck.slice(0,5),deck:deck.slice(5)};
 });
 next.portalDeck=true;
 if(next.players.some(p=>[...p.hand,...p.deck].some(c=>c.beta)))next.betaTrial=true;
 return next;
}
export function defaultPlayDeck(){return {cards:starterDeck(),inventory:starterInventory(),name:'Starter deck',version:1};}
