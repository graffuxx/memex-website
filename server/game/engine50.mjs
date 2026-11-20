import {createTacticsMatch} from '../../public/game/src/table-demo-state.mjs';
import {applyPortalDecks} from '../../public/game/platform/deck-bridge.mjs';
import {validateDeck} from '../../public/game/platform/catalog.mjs';
import {LOADOUTS,placeEffect} from '../../public/game/src/table-demo-rules.mjs';
import {shiftBlock,scores} from '../../public/game/src/rules.mjs';
import {chooseTactic} from '../../public/game/src/tactics-ai.mjs';
import {timeoutAction} from '../../public/game/src/turn-clock.mjs';
export const RULESET='account-50';
export function createAccountDuel({deck,inventory,seed,starter,loadouts=['hype-guard','hype-twist']}){
 if(!deck||!validateDeck(deck.cards,inventory).valid)throw Error('Saved deck is not playable.');
 if(!Number.isInteger(seed)||seed<0||seed>0xffffffff||![0,1].includes(starter)||!Array.isArray(loadouts)||loadouts.length!==2||loadouts.some(l=>!Object.hasOwn(LOADOUTS,l)))throw Error('Invalid duel settings.');
 const state={ruleset:RULESET,elementRules:5,deck:{id:deck.id,name:deck.name,cards:[...deck.cards]},seed,starter,loadouts:[...loadouts],round:1,results:[],awards:[],game:null};
 state.game=roundGame(state);return state;
}
function roundGame(state){const starter=state.round===1?state.starter:1-state.starter;let game=createTacticsMatch({seed:state.seed,starter,loadouts:state.loadouts});game=applyPortalDecks(game,state.deck.cards,state.loadouts.map(id=>LOADOUTS[id]),{round:state.round});game.elementRules=state.elementRules??state.game?.elementRules??3;game.resonanceOffset=((state.seed%(game.elementRules===5?5:3))+(game.elementRules===5?5:3))%(game.elementRules===5?5:3);game.rotationLocked=true;return game;}
function ai(game){let seed=(game.seed^Math.imul(game.placements+1,2654435761))>>>0;return chooseTactic(game,{random:()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}}).chosen?.action;}
function place(state,action,steps){const before=state.game;state.game=placeEffect(before,action);steps.push({before:structuredClone(before),action,after:structuredClone(state.game)});if(state.game.finished){state.results[state.round-1]=scores(state.game);state.awards[state.round-1]=state.game.winner===0?5:2;}}
export function beginAccountRound(state){const next=structuredClone(state),steps=[];if(next.game.turn===1&&!next.game.finished)place(next,ai(next.game),steps);return {state:next,steps,award:0};}
export function advanceAccountDuel(state,input){
 if(state.ruleset!==RULESET)throw Error('This duel uses an older ruleset. Start a new duel.');
 const next=structuredClone(state),steps=[];
 if(input.kind==='next'){
  if(!next.game.finished||next.round!==1)throw Error('Finish round one before the return round.');
  next.round=2;next.game=roundGame(next);return beginAccountRound(next);
 }
 if(next.game.finished||next.game.turn!==0)throw Error('It is not your turn.');
 if(input.kind==='shift')next.game=shiftBlock(next.game,input.cell);
 else if(input.kind==='place'||input.kind==='timeout'){
  const action=input.kind==='timeout'?timeoutAction(next.game):input.action;
  if(!action||typeof action.uid!=='string'||typeof action.cell!=='string'||action.rotation!==0)throw Error('Invalid card action.');
  place(next,action,steps);if(!next.game.finished&&next.game.turn===1)place(next,ai(next.game),steps);
 }else throw Error('Unknown game action.');
 return {state:next,steps,award:next.game.finished&&!state.game.finished?next.awards[next.round-1]:0};
}
