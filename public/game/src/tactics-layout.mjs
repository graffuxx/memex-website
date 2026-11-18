import {CELLS} from './rules.mjs';

// A separate seed stream keeps scenery independent of deck order and starting player.
export function createTacticsLayout(seed){
 let state=((seed>>>0)^0x9e3779b9)>>>0;
 const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const cells=CELLS.map(c=>c.id);
 for(let i=cells.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]];}
 return {block:cells[0],eventCells:cells.slice(1,3),crossfireOffset:Math.floor(random()*3)};
}

export function freshMatchSeed(previous=null){
 const value=crypto.getRandomValues(new Uint32Array(1))[0];
 return value===previous?(value+1)>>>0:value;
}
