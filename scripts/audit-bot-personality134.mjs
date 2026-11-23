// Paired-seat audit against the previous standard positional bot. No live accounts.
import {performance} from 'node:perf_hooks';
import {createPvp90,advancePvp90} from '../server/game/pvp90.mjs';
import {createBot96,random96} from '../server/game/bot96.mjs';
import {botPersonality134,BOT_STYLES134} from '../server/game/bot-personality134.mjs';
import {chooseTactic} from '../public/game/src/tactics-ai.mjs';
const count=Number(process.argv[2]??30);
if(!Number.isInteger(count)||count<1||count>200)throw Error('Use 1–200 paired seeds.');
const result=[];
for(const style of BOT_STYLES134){
 const stats={style:style.id,games:count*2,wins:0,losses:0,draws:0,meanOwnCards:0},times=[];
 for(let seed=1;seed<=count;seed++)for(const seat of[0,1]){
  let personalitySeed=seed;while(botPersonality134(personalitySeed).id!==style.id)personalitySeed+=1009;
  const personality=botPersonality134(personalitySeed),decks=[createBot96(seed*13).deck,createBot96(seed*71).deck];
  let s=createPvp90(decks,seed,0);
  for(const [side,move]of[[0,{kind:'gesture',value:'rock'}],[1,{kind:'gesture',value:'scissors'}],[0,{kind:'starter',side:seed%2}]])s=advancePvp90(s,side,move,0);
  while(!s.game.finished){const start=performance.now(),active=s.game.turn;
   const move=chooseTactic(s.game,{policy:'position',random:random96(seed*991+s.game.placements),...(active===seat?{personality}:{})}).chosen.action;
   if(active===seat)times.push(performance.now()-start);
   s=advancePvp90(s,active,{kind:'place',action:move},1);
  }
  if(s.game.winner===null)stats.draws++;else if(s.game.winner===seat)stats.wins++;else stats.losses++;
  stats.meanOwnCards+=s.results[0][seat];
 }
 times.sort((a,b)=>a-b);stats.meanOwnCards=Number((stats.meanOwnCards/stats.games).toFixed(2));stats.p95DecisionMs=Number(times[Math.floor(times.length*.95)].toFixed(2));result.push(stats);
}
console.log(JSON.stringify({opponent:'previous standard position policy',seedCount:count,results:result},null,2));
