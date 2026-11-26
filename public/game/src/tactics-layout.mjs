import {CELLS} from './rules.mjs';

// The blockade uses its own shuffle, independent of deck order and starting player.
function shuffleCells(seed,cycle){
 let state=((seed>>>0)^0x9e3779b9^Math.imul(cycle,0x85ebca6b))>>>0;
 const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const cells=CELLS.map(cell=>cell.id);
 for(let i=cells.length-1;i>0;i--){
  const j=Math.floor(random()*(i+1));
  [cells[i],cells[j]]=[cells[j],cells[i]];
 }
 return {cells,crossfireOffset:Math.floor(random()*3)};
}

export function createTacticsLayout(seed,round=1){
 const index=round-1,cycle=Math.floor(index/CELLS.length);
 const {cells,crossfireOffset}=shuffleCells(seed,cycle);
 if(cycle>0&&cells[0]===shuffleCells(seed,cycle-1).cells.at(-1)){
  [cells[0],cells[1]]=[cells[1],cells[0]];
 }
 const block=cells[index%cells.length];
 return {block,eventCells:cells.filter(cell=>cell!==block).slice(0,2),crossfireOffset};
}

export function freshMatchSeed(previous=null){
 const value=crypto.getRandomValues(new Uint32Array(1))[0];
 return value===previous?(value+1)>>>0:value;
}
