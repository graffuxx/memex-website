// Reproducible paired-seat comparison. No live accounts, matchmaking or rewards.
import {performance} from 'node:perf_hooks';
import {createPvp90,advancePvp90} from '../server/game/pvp90.mjs';
import {createBot96,random96} from '../server/game/bot96.mjs';
import {botPersonality134} from '../server/game/bot-personality134.mjs';
import {chooseTactic} from '../public/game/src/tactics-ai.mjs';
import {searchIsmcts135} from '../server/game/ismcts135.mjs';
import {createOpponentModel135,observeOpponent135} from '../server/game/opponent-model135.mjs';
const count=Number(process.argv[2]??12),iterations=Number(process.argv[3]??80);
if(!Number.isInteger(count)||count<1||count>100||!Number.isInteger(iterations)||iterations<1||iterations>640)throw Error('Use 1–100 paired seeds and 1–640 iterations.');
const stats={games:count*2,iterations,maxMs:550,wins:0,losses:0,draws:0,meanOwnCards:0,searchMoves:0,budgetFallbacks:0,meanSimulations:0},times=[];
for(let seed=1;seed<=count;seed++)for(const seat of[0,1]){
 const decks=[createBot96(seed*13).deck,createBot96(seed*71).deck],personality=botPersonality134(seed*17);let model=createOpponentModel135(),s=createPvp90(decks,seed,0);
 for(const [side,move]of[[0,{kind:'gesture',value:'rock'}],[1,{kind:'gesture',value:'scissors'}],[0,{kind:'starter',side:seed%2}]])s=advancePvp90(s,side,move,0);
 while(!s.game.finished){const active=s.game.turn,before=s.game,r=random96(seed*991+s.game.placements);let action;
  if(active===seat){const start=performance.now(),result=searchIsmcts135(s.game,{observer:seat,ownDeck:decks[seat].cards,personality,opponentModel:model,random:r,limits:{iterations,maxMs:550}});times.push(performance.now()-start);action=result.action;stats.searchMoves++;stats.meanSimulations+=result.simulations;if(result.reason==='budget-fallback')stats.budgetFallbacks++;}
  else action=chooseTactic(s.game,{policy:'position',random:r,personality}).chosen.action;
  s=advancePvp90(s,active,{kind:'place',action},1);
  if(active!==seat)model=observeOpponent135(model,before,s.game,action,String(s.game.placements));
 }
 if(s.game.winner===null)stats.draws++;else if(s.game.winner===seat)stats.wins++;else stats.losses++;
 stats.meanOwnCards+=s.results[0][seat];
 console.log(JSON.stringify({progress:seed+'/'+count,seat,score:s.results[0],winner:s.game.winner}));
}
times.sort((a,b)=>a-b);stats.meanOwnCards=Number((stats.meanOwnCards/stats.games).toFixed(2));stats.meanSimulations=Number((stats.meanSimulations/stats.searchMoves).toFixed(1));stats.p95DecisionMs=Number(times[Math.floor(times.length*.95)].toFixed(2));stats.maxDecisionMs=Number(times.at(-1).toFixed(2));
console.log(JSON.stringify(stats,null,2));
