import {DEFINITIONS,VARIANTS} from '../../public/game/platform/catalog.mjs';
import {PORTRAITS85} from '../../public/game/platform/identity85.mjs';
import {ELEMENT_IDS} from '../../public/game/platform/elements53.mjs';
import {chooseTactic} from '../../public/game/src/tactics-ai.mjs';
import {advancePvp90} from './pvp90.mjs';
export const BOT_WAIT_MS96=15000;
// Match the existing middle training tier: captures + position, without reply search.
export const BOT_DIFFICULTY97='standard',BOT_POLICY97='position';
export function random96(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
const pick=(list,r)=>list[Math.floor(r()*list.length)];
function shuffle(list,r){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function createBot96(seed){
 const r=random96(seed),first=['Pixel','Void','Salty','Turbo','Meme','Neon','Cosmic','Sleepy','Crystal','Chaos','Quantum','Glitch'],last=['Goblin','Doge','Wizard','Potato','Gremlin','Wombat','Ninja','Pickle','Raccoon','Toast','Panda','Gecko'];
 const identity={displayName:pick(first,r)+pick(last,r)+String(Math.floor(r()*90)+10),avatarId:pick(PORTRAITS85,r).id,frameId:'starter',titleId:'',xp:0,isAi:true};
 const motifs=shuffle(DEFINITIONS,r).slice(0,15),elements=shuffle(ELEMENT_IDS.flatMap(e=>[e,e,e]),r);
 const cards=motifs.map((c,i)=>{const roll=r(),rarity=roll<.5?'common':roll<.8?'rare':roll<.95?'epic':roll<.99?'legendary':'mythic';return VARIANTS.find(v=>v.edition==='alpha'&&v.definitionId===c.id&&v.element===elements[i]&&v.rarity===rarity).id;});
 return {identity,deck:{name:'Random AI deck',cards},seed:seed>>>0};
}
function needed(s){return s.phase==='rps'&&s.choices[1]===null||s.phase==='initiative'&&s.rpsWinner===1||s.phase==='play'&&s.game?.turn===1||s.phase==='between'&&!s.ready[1];}
export function armBot96(state,now){
 if(!state.bot96)return state;const s=structuredClone(state);
 if(!needed(s))s.bot96.nextAt=null;
 else if(s.bot96.nextAt===null)s.bot96.nextAt=now+1200+Math.floor(random96(s.bot96.seed^Math.imul((s.game?.placements??0)+s.attempt+s.round,2654435761))()*1500);
 return s;
}
export function stepBot96(state,now){
 if(!state.bot96||!needed(state)||now<state.bot96.nextAt)return null;
 const r=random96(state.bot96.seed^Math.imul((state.game?.placements??0)+state.round*37+state.attempt*101,2654435761));let move;
 // The hand sign depends on the server seed and attempt, never the human's choice.
 if(state.phase==='rps')move={kind:'gesture',value:pick(['rock','paper','scissors'],r)};
 else if(state.phase==='initiative')move={kind:'starter',side:r()<.75?1:0};
 else if(state.phase==='between')move={kind:'ready'};
 else {
  // The policy receives only its own hand, the public board and hidden card counts.
  const visible=structuredClone(state.game);visible.players[0].hand=visible.players[0].hand.map(c=>({uid:c.uid,hidden:true}));for(const p of visible.players)p.deck=p.deck.map(c=>({uid:c.uid,hidden:true}));
  const action=chooseTactic(visible,{policy:BOT_POLICY97,random:r}).chosen?.action;if(!action)throw Error('AI has no legal move.');move={kind:'place',action};
 }
 const next=advancePvp90(state,1,move,now);next.bot96.nextAt=null;return armBot96(next,now);
}
