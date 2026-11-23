import {AI_DEFINITIONS107 as DEFINITIONS,AI_VARIANTS107 as VARIANTS} from '../../public/game/platform/ai-pool107.mjs';
import {ELEMENT_IDS} from '../../public/game/platform/elements53.mjs';
import {PORTRAITS85} from '../../public/game/platform/identity85.mjs';
import {chooseTactic} from '../../public/game/src/tactics-ai.mjs';
import {advancePvp90,expirePvp90} from './pvp90.mjs';
import {RANDOM_AI_WAIT_MS98} from '../../public/game/platform/matchmaking98.mjs';
import {botPersonality134} from './bot-personality134.mjs';
import {searchIsmcts135,ISMCTS_VERSION135,SEARCH_LIMITS135} from './ismcts135.mjs';
import {createOpponentModel135} from './opponent-model135.mjs';
export const BOT_WAIT_MS96=RANDOM_AI_WAIT_MS98;
// Search has a bounded standard budget; stronger budgets are reserved for later Tower calibration.
export const BOT_DIFFICULTY97='standard',BOT_POLICY97='is-mcts';
export function random96(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
const pick=(list,r)=>list[Math.floor(r()*list.length)];
function shuffle(list,r){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function createBot96(seed){
 const r=random96(seed),first=['Pixel','Void','Salty','Turbo','Meme','Neon','Cosmic','Sleepy','Crystal','Chaos','Quantum','Glitch'],last=['Goblin','Doge','Wizard','Potato','Gremlin','Wombat','Ninja','Pickle','Raccoon','Toast','Panda','Gecko'];
 const identity={displayName:pick(first,r)+pick(last,r)+String(Math.floor(r()*90)+10),avatarId:pick(PORTRAITS85.filter(p=>!p.quest),r).id,frameId:'starter',titleId:'',xp:0,isAi:true};
 const motifs=shuffle(ELEMENT_IDS.flatMap(element=>shuffle(DEFINITIONS.filter(c=>!c.prime&&c.element===element),r).slice(0,3)),r);
 if(r()<.5){const primes=DEFINITIONS.filter(c=>c.prime);if(primes.length){const prime=pick(primes,r);motifs[motifs.findIndex(c=>c.element===prime.element)]=prime;}}
 const cards=motifs.map((c,i)=>{const roll=r(),rarity=roll<.5?'common':roll<.8?'rare':roll<.95?'epic':roll<.99?'legendary':'mythic';return VARIANTS.find(v=>v.edition==='alpha'&&v.definitionId===c.id&&v.rarity===rarity).id;});
 return {identity,deck:{name:'Random AI deck',cards},seed:seed>>>0};
}
function needed(s){return s.phase==='rps'&&s.choices[1]===null||s.phase==='initiative'&&s.rpsWinner===1||s.phase==='play'&&s.game?.turn===1||s.phase==='between'&&!s.ready[1];}
export function armBot96(state,now){
 if(!state.bot96)return state;const s=structuredClone(state);
 s.bot96.personality134??=botPersonality134(s.bot96.seed);
 s.bot96.opponent135??=createOpponentModel135();
 if(!needed(s))s.bot96.nextAt=null;
 else if(s.bot96.nextAt===null)s.bot96.nextAt=now+1200+Math.floor(random96(s.bot96.seed^Math.imul((s.game?.placements??0)+s.attempt+s.round,2654435761))()*1500);
 return s;
}
export function stepBot96(state,now,searchOptions={}){
 if(!state.bot96||!needed(state)||now<state.bot96.nextAt)return null;
 const r=random96(state.bot96.seed^Math.imul((state.game?.placements??0)+state.round*37+state.attempt*101,2654435761));let move,search;
 // The hand sign depends on the server seed and attempt, never the human's choice.
 if(state.phase==='rps')move={kind:'gesture',value:pick(['rock','paper','scissors'],r)};
 else if(state.phase==='initiative')move={kind:'starter',side:r()<.75?1:0};
 else if(state.phase==='between')move={kind:'ready'};
 else {
  // The policy receives only its own hand, the public board and hidden card counts.
  const visible=structuredClone(state.game);visible.players[0].hand=visible.players[0].hand.map(c=>({uid:c.uid,hidden:true}));for(const p of visible.players)p.deck=p.deck.map(c=>({uid:c.uid,hidden:true}));
  const personality=state.bot96.personality134??botPersonality134(state.bot96.seed);
  const requested=searchOptions.limits??SEARCH_LIMITS135.standard,limits={...requested,maxMs:Math.min(requested.maxMs,Math.max(0,(state.deadline??now+requested.maxMs+10)-now-10))};
  try{search=searchIsmcts135(visible,{...searchOptions,limits,observer:1,ownDeck:state.decks[1].cards,opponentModel:state.bot96.opponent135,personality,random:r});}
  catch{search={engine:ISMCTS_VERSION135,simulations:0,reason:'invalid-belief-fallback',action:chooseTactic(visible,{policy:'position',personality,random:r}).chosen?.action};}
  const action=search.action;if(!action)throw Error('AI has no legal move.');move={kind:'place',action};
 }
 const decidedAt=now+Math.ceil(search?.elapsedMs??0),expired=search?expirePvp90(state,decidedAt):null,next=expired??advancePvp90(state,1,move,decidedAt);
 if(search)next.bot96.search135={engine:search.engine,simulations:search.simulations,elapsedMs:Math.round(search.elapsedMs??0),nodes:search.nodes??0,reason:expired?'turn-expired':search.reason};next.bot96.nextAt=null;return armBot96(next,decidedAt);
}
