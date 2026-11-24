import {CELLS} from './rules.mjs';

// A separate seed stream keeps scenery independent of deck order and starting player.
const innerCells=new Set(CELLS.filter(({q,r})=>Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r))<2).map(({id})=>id));
export function createTacticsLayout(seed,round=1){
 let state=((seed>>>0)^0x9e3779b9)>>>0;
 const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const cells=CELLS.map(c=>c.id);
 for(let i=cells.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]];}
 // Keep the full-board draw for round one and guarantee an interior field in the rematch.
 const second=cells.findIndex((cell,index)=>index>0&&innerCells.has(cell));
 const starts=[cells[0],cells[second],...cells.filter((_,index)=>index>0&&index!==second)];
 const block=starts[(round-1)%starts.length];
 return {block,eventCells:cells.filter(cell=>cell!==block).slice(0,2),crossfireOffset:Math.floor(random()*3)};
}

export function freshMatchSeed(previous=null){
 const value=crypto.getRandomValues(new Uint32Array(1))[0];
 return value===previous?(value+1)>>>0:value;
}
