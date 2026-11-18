import {freeCells} from './rules.mjs';
import {previewEffect} from './table-demo-rules.mjs?v=random-layout-1';

export const TURN_DURATION_MS=90_000;
// Wall-clock deadlines keep counting when a browser tab is hidden or throttled.
export function createTurnClock({durationMs=TURN_DURATION_MS,now=Date.now}={}){
 let key=null,remaining=durationMs,deadline=null;
 function snapshot(){const ms=Math.max(0,deadline===null?remaining:deadline-now());return {remainingMs:ms,seconds:Math.ceil(ms/1000),running:deadline!==null,expired:ms===0,fraction:ms/durationMs};}
 return {
  enter(nextKey){if(key!==nextKey){key=nextKey;remaining=durationMs;deadline=null;}return snapshot();},
  resume(){if(deadline===null&&remaining>0)deadline=now()+remaining;return snapshot();},
  pause(){remaining=snapshot().remainingMs;deadline=null;return snapshot();},
  snapshot
 };
}
// A timeout never gains tactical search or extra card rotation: first legal card/field.
export function timeoutAction(game){
 if(game.finished)return null;
 for(const card of game.players[game.turn].hand)for(const cell of freeCells(game)){
  const action={uid:card.uid,cell,rotation:0,abilityDirection:0,twistCell:null};
  try{previewEffect(game,action);return action;}catch{}
 }
 return null;
}
