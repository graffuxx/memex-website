import {performance} from 'node:perf_hooks';
import {ELEMENT_CARDS} from '../public/game/platform/expansion53.mjs';
import {ELEMENT_IDS} from '../public/game/platform/elements53.mjs';
import {VARIANTS,expandGameDeck} from '../public/game/platform/catalog.mjs';
import {createTacticsMatch} from '../public/game/src/table-demo-state.mjs';
import {chooseTactic} from '../public/game/src/tactics-ai.mjs';
import {placeEffect} from '../public/game/src/table-demo-rules.mjs';
const t=performance.now(),wins=[0,0],elementGames=Object.fromEntries(ELEMENT_IDS.map(e=>[e,0]));let draws=0,maxDecisionMs=0,decisions=0;
const nativeVariant=new Map(VARIANTS.map(v=>[`${v.definitionId}/${v.rarity}/${v.element}`,v.id]));
for(let seed=0;seed<128;seed++)for(const starter of [0,1]){
 let r=seed+4501;const random=()=>{r=(Math.imul(r,1664525)+1013904223)>>>0;return r/4294967296;};
 const gameSeed=Math.floor(random()*4294967296);let game=createTacticsMatch({seed:gameSeed,starter});game.rotationLocked=true;
 game.players=game.players.map((p,side)=>{const motifs=[...ELEMENT_CARDS];for(let i=motifs.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[motifs[i],motifs[j]]=[motifs[j],motifs[i]];}
  const cards=motifs.slice(0,15).map((c,i)=>{const element=ELEMENT_IDS[(i+seed+side)%5];elementGames[element]++;return nativeVariant.get(`${c.id}/common/${element}`);}),deck=expandGameDeck(cards,side);return {...p,hand:deck.slice(0,5),deck:deck.slice(5)};
 });
 while(!game.finished){const at=performance.now(),choice=chooseTactic(game,{random}).chosen;if(!choice)throw Error('No legal action');maxDecisionMs=Math.max(maxDecisionMs,performance.now()-at);decisions++;game=placeEffect(game,choice.action);}
 if(game.placements!==18)throw Error('Incomplete round');if(game.winner===null)draws++;else wins[game.winner]++;
}
console.log(JSON.stringify({rounds:256,decisions,wins,draws,elementCopiesDealt:elementGames,maxDecisionMs:Math.round(maxDecisionMs*100)/100,elapsedMs:Math.round(performance.now()-t),scope:'Seeded mirrored-start AI smoke test; not a human win-rate or final metagame claim.'},null,2));
