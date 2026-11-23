import test from 'node:test';
import assert from 'node:assert/strict';
import {botPersonality134,BOT_STYLES134} from '../server/game/bot-personality134.mjs';
import {createBot96,armBot96,stepBot96,random96} from '../server/game/bot96.mjs';
import {createPvp90,advancePvp90,projectPvp90} from '../server/game/pvp90.mjs';
import {chooseTactic,legalCandidates} from '../public/game/src/tactics-ai.mjs';
import {starterDeck} from '../public/game/platform/catalog.mjs';

const deck={name:'Test player',cards:starterDeck()},signature=action=>JSON.stringify(action);
function open(seed=1,starter=1){let s=createPvp90([deck,createBot96(seed).deck],seed,0);for(const [side,move]of[[0,{kind:'gesture',value:'rock'}],[1,{kind:'gesture',value:'scissors'}],[0,{kind:'starter',side:starter}]])s=advancePvp90(s,side,move,0);return s;}
const personas=new Map();for(let seed=0;seed<100&&personas.size<3;seed++){const p=botPersonality134(seed);if(!personas.has(p.id))personas.set(p.id,p);}

test('opponents have reproducible but individual traits across all three styles',()=>{
 assert.equal(personas.size,3);const unique=new Set(),counts={};
 for(let seed=0;seed<300;seed++){const p=botPersonality134(seed);assert.deepEqual(p,botPersonality134(seed));const base=BOT_STYLES134.find(s=>s.id===p.id);assert.ok(base);counts[p.id]=(counts[p.id]??0)+1;unique.add(JSON.stringify(p));for(const key of['capture','safety','contacts','twist'])assert.ok(p.weights[key]>=base[key]*.899&&p.weights[key]<=base[key]*1.101);assert.ok(p.variety>0&&p.variety<.23);}
 assert.equal(unique.size,300);assert.ok(Object.values(counts).every(n=>n>70&&n<130));
});
test('personalities change choices on the same visible positions and all choices remain legal',()=>{
 let diverse=0,positions=0;
 for(let seed=1;seed<=12;seed++){let s=open(seed);while(!s.game.finished){const outcomes=[];for(const personality of personas.values()){
   const before=JSON.stringify(s.game),move=chooseTactic(s.game,{policy:'position',personality,random:random96(seed*101+s.game.placements)}).chosen.action;
   assert.equal(JSON.stringify(s.game),before);assert.ok(legalCandidates(s.game).some(c=>signature(c.action)===signature(move)));outcomes.push(signature(move));
  }positions++;if(new Set(outcomes).size>1)diverse++;s=advancePvp90(s,s.game.turn,{kind:'place',action:chooseTactic(s.game,{policy:'position'}).chosen.action},1);}}
 assert.ok(diverse>=positions*.10,`${diverse}/${positions} positions distinguish the styles`);
});
test('all styles finish legal rounds in both seats and take the best available final capture',()=>{
 for(const personality of personas.values())for(let seed=1;seed<=8;seed++)for(const seat of[0,1]){
  let s=open(seed,seed%2);while(!s.game.finished){const turn=s.game.turn,policy=turn===seat?{personality}:{};
   const chosen=chooseTactic(s.game,{policy:'position',...policy,random:random96(seed*73+s.game.placements)}).chosen;
   if(turn===seat&&s.game.placements===17)assert.equal(chosen.plan.flips.length,Math.max(...legalCandidates(s.game).map(c=>c.plan.flips.length)));
   s=advancePvp90(s,turn,{kind:'place',action:chosen.action},1);
  }assert.equal(s.game.placements,18);assert.equal(s.game.finished,true);
 }
});
test('a bot keeps its personality across moves, round boundaries and saved-state reloads',()=>{
 let s=open(10);s.bot96={seed:42,nextAt:null};s=armBot96(s,0);const expected=structuredClone(s.bot96.personality134);
 while(s.phase==='play'){
  if(s.game.turn===1){s=armBot96(s,1);s=stepBot96(JSON.parse(JSON.stringify(s)),s.bot96.nextAt);}
  else s=armBot96(advancePvp90(s,0,{kind:'place',action:chooseTactic(s.game,{policy:'position'}).chosen.action},1),1);
  assert.deepEqual(s.bot96.personality134,expected);
 }
 s=advancePvp90(s,0,{kind:'ready'},2);s=armBot96(s,2);s=stepBot96(s,s.bot96.nextAt);assert.equal(s.round,2);assert.deepEqual(s.bot96.personality134,expected);
 const host='13413413-4134-4134-8134-000000000001',view=projectPvp90({id:host,host_id:host,identities:[{},{}],kind:'random',status:'matched',version:2,ai_opponent96:{isAi:true},state:s},host,3);
 assert.deepEqual(view.opponentStyle,{id:expected.id,label:expected.label,description:expected.description});assert.ok(!JSON.stringify(view).includes('personality134'));assert.ok(!JSON.stringify(view).includes('"seed"'));
});
