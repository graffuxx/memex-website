import {chooseTactic} from './tactics-ai.mjs?v=hand-effects-46';
export function soloAction84(game,difficulty='standard'){
 if(game.finished)return null;
 let seed=(game.seed^Math.imul(game.placements+1,2654435761))>>>0;
 return chooseTactic(game,{policy:difficulty==='easy'?'greedy':difficulty==='tactical'?'reply':'position',random:()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}}).chosen?.action??null;
}
