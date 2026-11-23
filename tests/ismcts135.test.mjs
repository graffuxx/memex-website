import test from 'node:test';
import assert from 'node:assert/strict';
import {searchIsmcts135,determinize135,observeGame135} from '../server/game/ismcts135.mjs';
import {createOpponentModel135,observeOpponent135,opponentBeliefs135} from '../server/game/opponent-model135.mjs';
import {BOT_STYLES134,botPersonality134} from '../server/game/bot-personality134.mjs';
import {createPvp90,advancePvp90,expirePvp90,projectPvp90} from '../server/game/pvp90.mjs';
import {createBot96,armBot96,stepBot96,random96} from '../server/game/bot96.mjs';
import {chooseTactic} from '../public/game/src/tactics-ai.mjs';
import {placeEffect} from '../public/game/src/table-demo-rules.mjs';
import {getVariant,countPrimes,DEFINITIONS} from '../public/game/platform/catalog.mjs';

function open(seed=3,starter=0){let s=createPvp90([createBot96(seed*13).deck,createBot96(seed*71).deck],seed,0);for(const [side,move]of[[0,{kind:'gesture',value:'rock'}],[1,{kind:'gesture',value:'scissors'}],[0,{kind:'starter',side:starter}]])s=advancePvp90(s,side,move,0);return s;}
const fixed={limits:{iterations:16,maxMs:1000},now:()=>0};
const motif=c=>getVariant(c.variantId).definitionId;
const search=(s,extra={})=>searchIsmcts135(s.game,{observer:s.game.turn,ownDeck:s.decks[s.game.turn].cards,random:random96(135),personality:botPersonality134(135),...fixed,...extra});

test('hidden worlds preserve revealed cards, known own composition, hand counts and singleton/one-Prime rules',()=>{
 let s=open();for(let i=0;i<6;i++)s=advancePvp90(s,s.game.turn,{kind:'place',action:chooseTactic(s.game,{policy:'position'}).chosen.action},1);
 const original=JSON.stringify(s.game),observer=s.game.turn,seen=new Set();
 for(let seed=1;seed<=30;seed++){
  const g=determinize135(s.game,{observer,ownDeck:s.decks[observer].cards,random:random96(seed)});
  assert.deepEqual(g.board,s.game.board);assert.deepEqual(g.players[observer].hand,s.game.players[observer].hand);assert.ok(!('seed'in g));
  for(const side of[0,1]){assert.equal(g.players[side].hand.length,s.game.players[side].hand.length);assert.equal(g.players[side].deck.length,s.game.players[side].deck.length);
   const all=[...g.players[side].hand,...g.players[side].deck,...Object.values(g.board).filter(c=>c.origin===side)];assert.equal(all.length,15);assert.equal(new Set(all.map(motif)).size,15);
   assert.ok(countPrimes(all.map(c=>c.variantId))<=1);for(const c of all)assert.equal(getVariant(c.variantId).element,DEFINITIONS.find(d=>d.id===motif(c)).element);
   if(side===observer)assert.deepEqual(all.map(c=>c.variantId).sort(),[...s.decks[side].cards].sort());
  }seen.add(g.players[1-observer].hand.map(motif).join(','));
 }
 assert.ok(seen.size>25);assert.equal(JSON.stringify(s.game),original);
});
test('search is independent of actual secret hands, both draw orders, deck-list order and server seed',()=>{
 const s=open(7,1),first=search(s),changed=structuredClone(s);
 changed.game.seed=999;changed.game.players[0].hand.forEach(c=>{c.id='brain';c.variantId='doge:common';c.ability='hype';});
 for(const p of changed.game.players){p.deck.reverse();for(const c of p.deck){c.id='brain';c.variantId='doge:common';}}
 changed.decks[1].cards.reverse();const second=search(changed);
 assert.deepEqual(second.action,first.action);assert.deepEqual(second.choices,first.choices);assert.equal(second.simulations,16);
});
test('shared information-set search expands alternatives, resolves real rules and never mutates the live game',()=>{
 let s=open(10);for(let i=0;i<18;i++){
  if([0,8,14,17].includes(i)){const before=JSON.stringify(s),result=search(s);assert.equal(result.engine,'is-mcts-1');assert.ok(result.action);placeEffect(s.game,result.action);assert.equal(JSON.stringify(s),before);
   if(i===17){assert.equal(result.reason,'exact-final-move');const chosen=placeEffect(s.game,result.action),baseline=placeEffect(s.game,chooseTactic(s.game,{policy:'position'}).chosen.action);const own=g=>Object.values(g.board).filter(c=>c.controller===s.game.turn).length;assert.ok(own(chosen)>=own(baseline));}
   else{assert.equal(result.simulations,16);assert.ok(result.nodes>1);assert.ok(result.choices.length>1);assert.equal(result.choices.reduce((n,c)=>n+c.visits,0),16);}
  }s=advancePvp90(s,s.game.turn,{kind:'place',action:chooseTactic(s.game,{policy:'position'}).chosen.action},1);
 }
});
test('opponent evidence changes from revealed placement preferences without reading hidden hands',()=>{
 let learned=createOpponentModel135(),examples=0;
 for(let seed=1;seed<=80&&examples<15;seed++){
  let s=open(seed);for(let i=0;i<8;i++)s=advancePvp90(s,s.game.turn,{kind:'place',action:chooseTactic(s.game,{policy:'position'}).chosen.action},1);
  for(const card of s.game.players[0].hand){const restricted={...s.game,players:s.game.players.map((p,side)=>side===0?{...p,hand:[card]}:p)};
   const actions=BOT_STYLES134.map(style=>chooseTactic(restricted,{policy:'position',personality:{weights:style,variety:0}}).chosen.action);
   if(JSON.stringify(actions[0])===JSON.stringify(actions[1]))continue;
   const after=placeEffect(s.game,actions[0]),key=String(examples++),before=JSON.stringify(s.game);
   const safe=structuredClone(s.game);for(const p of safe.players){Object.defineProperty(p,'hand',{get(){throw Error('Read secret hand');},enumerable:true});Object.defineProperty(p,'deck',{get(){throw Error('Read secret draw');},enumerable:true});}
   learned=observeOpponent135(learned,safe,after,actions[0],key);assert.equal(JSON.stringify(s.game),before);assert.deepEqual(observeOpponent135(learned,safe,after,actions[0],key),learned);break;
  }
 }
 assert.ok(examples>=10);assert.equal(learned.observations,examples);const beliefs=opponentBeliefs135(learned);assert.ok(beliefs[0]>beliefs[1]);assert.ok(beliefs.every(p=>p>=.1&&p<=.8));assert.ok(Math.abs(beliefs.reduce((a,b)=>a+b,0)-1)<1e-9);
});
test('accepted manual moves learn once, timeout moves do not, and evidence survives a round and reload',()=>{
 let s=open(10);s.bot96={seed:321,nextAt:null};s=armBot96(s,0);let manual=0;
 while(!s.game.finished){const side=s.game.turn,action=chooseTactic(s.game,{policy:'position'}).chosen.action;s=advancePvp90(s,side,{kind:'place',action},1);if(side===0)manual++;assert.equal(s.bot96.opponent135.observations,manual);}
 const learned=structuredClone(s.bot96.opponent135);s=advancePvp90(advancePvp90(s,0,{kind:'ready'},2),1,{kind:'ready'},2);s=JSON.parse(JSON.stringify(s));assert.deepEqual(s.bot96.opponent135,learned);
 const timed=expirePvp90(s,s.deadline);assert.deepEqual(timed.bot96.opponent135,learned);
 const host='13513513-5135-4135-8135-000000000001',view=projectPvp90({id:host,host_id:host,identities:[{},{}],kind:'random',status:'matched',version:3,ai_opponent96:{isAi:true},state:s},host,3);
 assert.equal(view.opponentEngine.name,'IS-MCTS');assert.equal(view.opponentEngine.observedMoves,9);assert.ok(!JSON.stringify(view).includes('logEvidence'));assert.ok(!JSON.stringify(view).includes('"seed"'));
});
test('opponent beliefs affect simulated replies and actual search choices on identical visible boards',()=>{
 let differentMoves=0;
 for(let seed=1;seed<=3;seed++){
  let s=open(seed);for(let i=0;i<8;i++)s=advancePvp90(s,s.game.turn,{kind:'place',action:chooseTactic(s.game,{policy:'position'}).chosen.action},1);
  const run=logEvidence=>search(s,{limits:{iterations:32,maxMs:1000},opponentModel:{version:1,logEvidence,observations:12}}),aggressive=run([0,-12,-12]),defensive=run([-12,0,-12]);
  assert.notDeepEqual(aggressive.choices,defensive.choices);if(JSON.stringify(aggressive.action)!==JSON.stringify(defensive.action))differentMoves++;
  placeEffect(s.game,aggressive.action);placeEffect(s.game,defensive.action);
 }
 assert.ok(differentMoves>=1);
});
test('budget exhaustion still returns a legal fallback; real bot steps execute the search',()=>{
 let s=open(5,1);const noTime=search(s,{limits:{iterations:100,maxMs:0}});assert.equal(noTime.simulations,0);assert.equal(noTime.reason,'budget-fallback');placeEffect(s.game,noTime.action);
 s.bot96={seed:42,nextAt:0};const next=stepBot96(s,0,fixed);assert.equal(next.bot96.search135.engine,'is-mcts-1');assert.equal(next.bot96.search135.reason,'search');assert.equal(next.bot96.search135.simulations,16);assert.equal(next.game.placements,1);
 assert.deepEqual(observeGame135(s.game,1).players[0].hand.map(c=>Object.keys(c).sort()),s.game.players[0].hand.map(()=>['hidden','origin','uid']));
});
test('thinking respects the server deadline and the next player receives a fresh full turn',()=>{
 let s=open(5,1);s.bot96={seed:42,nextAt:0};let tick=0;
 const next=stepBot96(s,100,{limits:{iterations:10,maxMs:1000},now:()=>tick++});
 assert.equal(next.deadline,100+next.bot96.search135.elapsedMs+90000);
 const expired=stepBot96(s,s.deadline,{limits:{iterations:10,maxMs:1000},now:()=>0});
 assert.equal(expired.bot96.search135.reason,'turn-expired');assert.equal(expired.afkStreak129[1],1);assert.equal(expired.game.placements,1);
});
