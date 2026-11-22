import {series113,seriesStarter113} from '../../public/game/platform/series113.mjs';
import {createTacticsMatch} from '../../public/game/src/table-demo-state.mjs';
import {applyPortalDecks} from '../../public/game/platform/deck-bridge.mjs';
import {LOADOUTS,placeEffect} from '../../public/game/src/table-demo-rules.mjs';
import {shiftBlock,scores} from '../../public/game/src/rules.mjs';
import {timeoutAction} from '../../public/game/src/turn-clock.mjs';
import {balanceVersion94,BALANCE_FINGERPRINT94} from './balance-version94.mjs';
import {RANDOM_AI_WAIT_MS98} from '../../public/game/platform/matchmaking98.mjs';
export const PVP_RULE90='pvp-90',TURN_MS90=90000;
const gestures=['rock','paper','scissors'];
const due=now=>now+TURN_MS90;
export function createPvp90(decks,seed,now=Date.now()){
 if(decks.length!==2||decks.some(d=>d.cards?.length!==15))throw Error('Two saved 15-card decks required.');
 return {ruleset:PVP_RULE90,balance:balanceVersion94(now),decks,seed,phase:'rps',round:1,starter:null,results:[],choices:[null,null],ready:[false,false],attempt:1,lastRps:null,deadline:due(now),game:null,step:null};
}
function newRound(s,now){
 const loadouts=[LOADOUTS['hype-guard'],LOADOUTS['hype-guard']];
 let g=createTacticsMatch({seed:s.seed,starter:seriesStarter113(s.starter,s.round),loadouts:['hype-guard','hype-guard']});
 g=applyPortalDecks(g,s.decks[0].cards,loadouts,{round:s.round,opponentCards:s.decks[1].cards});
 g.elementRules=5;g.rotationLocked=true;g.resonanceOffset=s.seed%5;
 // Opaque per-round card tokens never reveal a hidden motif or rarity.
 g.players.forEach((p,side)=>[...p.hand,...p.deck].forEach((c,i)=>{c.uid=`r${s.round}-p${side}-c${i}`;}));
 s.game=g;s.phase='play';s.deadline=due(now);s.ready=[false,false];s.step=null;
 if(s.balance)s.balance.roundStartedAt=now;
}
function resolveRps(s,now){
 if(s.choices.some(c=>c===null))return;
 const [a,b]=s.choices,winner=a===b?null:(a==='rock'&&b==='scissors'||a==='paper'&&b==='rock'||a==='scissors'&&b==='paper'?0:1);
 s.lastRps={choices:[a,b],winner};
 if(winner===null){s.choices=[null,null];s.attempt++;}else{s.phase='initiative';s.rpsWinner=winner;}
 s.deadline=due(now);
}
function place(s,action,now){
 const before=s.game;s.game=placeEffect(before,action);s.step={kind:'place',action,before:structuredClone(before),after:structuredClone(s.game)};
 if(s.game.finished){s.results[s.round-1]=scores(s.game);s.phase=series113(s.results).finished?'ended':'between';s.deadline=null;}else s.deadline=due(now);
}
export function advancePvp90(state,side,input,now=Date.now()){
 if(state.ruleset!==PVP_RULE90||![0,1].includes(side))throw Error('Invalid online duel.');
 const s=structuredClone(state);s.step=null;
 if(s.balance&&s.balance.fingerprint!==BALANCE_FINGERPRINT94){s.balance.mixed=true;s.balance.current=balanceVersion94(now);}
 if(input.kind==='resign'){if(s.phase==='ended')throw Error('Duel has ended.');s.phase='ended';s.forfeit=side;s.deadline=null;return s;}
 if(input.kind==='gesture'){
  if(s.phase!=='rps'||s.choices[side]!==null||!gestures.includes(input.value))throw Error('Choose one hidden hand sign.');
  s.choices[side]=input.value;resolveRps(s,now);return s;
 }
 if(input.kind==='starter'){
  if(s.phase!=='initiative'||s.rpsWinner!==side||![0,1].includes(input.side))throw Error('The start-right winner chooses who starts.');
  s.starter=input.side;newRound(s,now);return s;
 }
 if(input.kind==='ready'){
  if(s.phase!=='between')throw Error('Finish this round first.');s.ready[side]=true;
  if(s.ready.every(Boolean)){s.round++;newRound(s,now);}return s;
 }
 if(s.phase!=='play'||s.game.turn!==side)throw Error('It is not your turn.');
 if(input.kind==='shift'){const before=s.game;s.game=shiftBlock(s.game,input.cell);s.step={kind:'shift',cell:input.cell,before:structuredClone(before),after:structuredClone(s.game)};return s;}
 if(input.kind!=='place'||input.action?.rotation!==0)throw Error('Invalid card action.');
 place(s,input.action,now);return s;
}
export function expirePvp90(state,now=Date.now()){
 if(!state.deadline||now<state.deadline)return null;
 const s=structuredClone(state);s.step=null;
 if(s.balance&&s.balance.fingerprint!==BALANCE_FINGERPRINT94){s.balance.mixed=true;s.balance.current=balanceVersion94(now);}
 if(s.phase==='rps'){for(const side of [0,1])if(s.choices[side]===null)s.choices[side]=gestures[((s.seed>>>side)+s.attempt+side)%3];resolveRps(s,now);return s;}
 if(s.phase==='initiative'){s.starter=s.rpsWinner;newRound(s,now);return s;}
 if(s.phase==='play'){place(s,timeoutAction(s.game),now);return s;}return null;
}
function perspectiveGame(game,side,revealUid=null){
 if(!game)return null;const g=structuredClone(game),swap=n=>n===null||n===undefined?n:side===1?1-n:n;
 const card=c=>{const v={...c};for(const k of ['origin','controller','guardOwner'])if(v[k]!==undefined)v[k]=swap(v[k]);return v;};
 const hidden=c=>({id:'oracle',uid:c.uid,origin:swap(c.origin),controller:swap(c.controller),rotation:0,hidden:true});
 g.players=(side===1?[g.players[1],g.players[0]]:g.players).map((p,i)=>({...p,hand:p.hand.map(c=>i===0||c.uid===revealUid?card(c):hidden(c)),deck:p.deck.map(hidden)}));
 g.board=Object.fromEntries(Object.entries(g.board).map(([k,c])=>[k,card(c)]));
 for(const k of ['turn','starter','winner'])g[k]=swap(g[k]);
 g.history=g.history.map(e=>({...e,side:swap(e.side)}));if(g.last)g.last={...g.last,side:swap(g.last.side)};
 return g;
}
export function projectPvp90(row,uid,now=Date.now()){
 const side=row.host_id===uid?0:row.guest_id===uid?1:null;if(side===null)throw Error('Duel unavailable.');
 const s=row.state,swap=n=>n===null||n===undefined?n:side===1?1-n:n;
 if(!s)return {id:row.id,kind:row.kind,status:row.status,code:row.kind==='private'?row.invite_code:null,version:row.version,searchRemainingMs:row.kind==='random'?Math.max(0,RANDOM_AI_WAIT_MS98-(now-Date.parse(row.created_at))):null,phase:row.status==='waiting'?'waiting':'preparing'};
 const players=side===1?[row.identities[1],row.identities[0]]:row.identities;
 return {id:row.id,kind:row.kind,status:row.status,version:row.version,phase:s.phase,opponentType:row.ai_opponent96?'ai':'human',round:s.round,starter:swap(s.starter),players,series:series113(s.results.map(r=>side===1?[r[1],r[0]]:r)),winner:s.forfeit!=null?swap(1-s.forfeit):swap(series113(s.results).winner),rated:row.kind==='random',
  results:s.results.map(r=>side===1?[r[1],r[0]]:r),game:perspectiveGame(s.game,side),ready:side===1?[s.ready[1],s.ready[0]]:s.ready,
  ownChoice:s.choices[side],opponentChosen:Boolean(s.choices[1-side]),attempt:s.attempt,rpsWinner:swap(s.rpsWinner),
  lastRps:s.lastRps?{choices:side===1?[s.lastRps.choices[1],s.lastRps.choices[0]]:s.lastRps.choices,winner:swap(s.lastRps.winner)}:null,
  remainingMs:s.deadline?Math.max(0,s.deadline-now):null,forfeit:swap(s.forfeit),wallet:row.wallet,
  step:s.step?{...s.step,before:perspectiveGame(s.step.before,side,s.step.action?.uid),after:perspectiveGame(s.step.after,side)}:null};
}
