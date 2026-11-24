import {createTacticsLayout} from './tactics-layout.mjs?v=random-layout-1';
import {newGame,placeCard,freeCells} from './rules.mjs?v=tie-break-63';
import {LOADOUTS,ABILITY_FOR} from './table-demo-rules.mjs?v=tie-break-63';
import {chooseTactic} from './tactics-ai.mjs?v=prime-trio-release';
import {DEFINITIONS} from '../platform/catalog.mjs';
export const DEMO_PROFILES=Object.fromEntries(DEFINITIONS.map(c=>[c.ruleId,c.id]));
export function createTableDemo(loadout='hype-guard'){
 if(!Object.hasOwn(LOADOUTS,loadout))throw Error('Unbekannte Deckvariante.');
 let game=newGame({seed:20261116,layout:'core',starter:0});
 game.players=[0,1].map(side=>{const cards=Array.from({length:9},(_,i)=>({id:['oracle','brain','trust'][i%3],uid:`demo-${side}-${i}`,origin:side}));return {hand:cards.slice(0,5),deck:cards.slice(5),shifts:1,flips:0};});
 for(const [side,index,cell] of [[0,0,'-1,-1'],[1,1,'1,0'],[0,2,'-1,1'],[1,0,'1,-1']])game=placeCard(game,{uid:`demo-${side}-${index}`,cell,rotation:0});
 game.events=[];game.loadout=loadout;
 for(const p of game.players)for(const ability of LOADOUTS[loadout].abilities){const card=p.hand.find(c=>ABILITY_FOR[c.id]===ability);card.ability=ability;}
 return game;
}
// Bounded public-board lookahead; no access to the opponent's hidden hand.
export function demoAction(game){return game.finished?null:chooseTactic(game).chosen?.action??null;}
export function createTacticsMatch({loadouts=['hype-guard','hype-twist'],seed=20261117,starter=0,swap=false,disableRole=null,eventFieldsEnabled=false}={}){
 if(loadouts.length!==2||loadouts.some(id=>!Object.hasOwn(LOADOUTS,id)))throw Error('Ungültige Deckauswahl.');
 const game=newGame({seed,starter});game.eventFieldsEnabled=eventFieldsEnabled;Object.assign(game,createTacticsLayout(seed));game.events=[];game.resonanceOffset=((seed%5)+5)%5;game.mode='match';game.loadouts=swap?[...loadouts].reverse():[...loadouts];
 game.players=loadouts.map((loadout,role)=>{let state=(seed*53+role*8017+111)>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;},side=swap?1-role:role;
  const cards=Array.from({length:9},(_,i)=>({id:['oracle','brain','trust'][i%3],uid:`demo-${side}-${i}`,origin:side}));
  for(const ability of LOADOUTS[loadout].abilities){const list=cards.filter(c=>ABILITY_FOR[c.id]===ability);list[Math.floor(random()*list.length)].ability=ability;}
  if(disableRole===role)for(const card of cards)delete card.ability;
  for(let i=cards.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
  return {hand:cards.slice(0,5),deck:cards.slice(5),shifts:1,flips:0};
 });if(swap)game.players.reverse();return game;
}
export function drawnCard(before,after,side){const old=new Set(before.players[side].hand.map(c=>c.uid));return after.players[side].hand.find(c=>!old.has(c.uid))??null;}
