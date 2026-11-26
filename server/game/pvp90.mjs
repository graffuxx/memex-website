import {series113,seriesStarter113} from '../../public/game/platform/series113.mjs';
import {createTacticsMatch} from '../../public/game/src/table-demo-state.mjs';
import {applyPortalDecks} from '../../public/game/platform/deck-bridge.mjs';
import {LOADOUTS,placeEffect,resolveDraw} from '../../public/game/src/table-demo-rules.mjs';
import {shiftBlock,scores} from '../../public/game/src/rules.mjs';
import {timeoutAction} from '../../public/game/src/turn-clock.mjs';
import {balanceVersion94,BALANCE_FINGERPRINT94} from './balance-version94.mjs';
import {RANDOM_AI_WAIT_MS98} from '../../public/game/platform/matchmaking98.mjs';
import {botPersonality134} from './bot-personality134.mjs';
import {observeOpponent135} from './opponent-model135.mjs';
export const PVP_RULE90='pvp-90',TURN_MS90=90000;
export const AFK_AFTER129=2,AFK_TURN_MS129=3000,ROUND_BREAK_MS129=8000;
const gestures=['rock','paper','scissors'];
const due=(now,s=null,side=null)=>now+(side!==null&&(s?.afkStreak129?.[side]??0)>=AFK_AFTER129?AFK_TURN_MS129:TURN_MS90);
export function refreshPvpRules129(state,now=Date.now()){if(!state?.game||state.game.eventFieldsEnabled===false&&!(state.phase==='between'&&!state.deadline))return null;const s=structuredClone(state);s.game.eventFieldsEnabled=false;if(s.balance&&s.balance.fingerprint!==BALANCE_FINGERPRINT94){s.balance.mixed=true;s.balance.current=balanceVersion94(now);}if(s.phase==='between'&&!s.deadline)s.deadline=now+ROUND_BREAK_MS129;return s;}
export function createPvp90(decks,seed,now=Date.now(),{elementalTrial=false,iconicAbilities=false,iconicAbilityWave=iconicAbilities?1:0,releasedPrimeTrio=false,releasedPrimePair=false,allPrimes=false,finalGuard=false,randomAbilities=false,earthSupport=false,abilityRework=false}={}){
 if(decks.length!==2||decks.some(d=>d.cards?.length!==15))throw Error('Two saved 15-card decks required.');
 const balance=balanceVersion94(now);
 if(randomAbilities)balance.patch+='-random-full-abilities';
 else if(finalGuard)balance.patch+=elementalTrial?'-final-guard':'-random-final-guard';
 else if(elementalTrial)balance.patch+=iconicAbilityWave>=7?'-iconic-complete':allPrimes?'-prime-complete':releasedPrimePair?'-prime-jordan-fan':releasedPrimeTrio?'-prime-trio':iconicAbilityWave>=6?'-iconic-twelve':iconicAbilityWave>=5?'-iconic-ten':iconicAbilityWave>=4?'-iconic-eight':iconicAbilityWave>=3?'-iconic-six':iconicAbilityWave>=2?'-iconic-four':iconicAbilities?'-greg-kekw':'-standard-effects';
 if(earthSupport)balance.patch+='-earth-support';
 return {ruleset:PVP_RULE90,balance,elementalTrial,iconicAbilities,iconicAbilityWave,releasedPrimeTrio,releasedPrimePair,allPrimes,finalGuard,earthSupport,abilityRework,decks,seed,phase:'rps',round:1,starter:null,results:[],choices:[null,null],ready:[false,false],attempt:1,lastRps:null,deadline:due(now),game:null,step:null,afkStreak129:[0,0]};
}
function newRound(s,now){
 const loadouts=[LOADOUTS['hype-guard'],LOADOUTS['hype-guard']];
 let g=createTacticsMatch({seed:s.seed,round:s.round,starter:seriesStarter113(s.starter,s.round),loadouts:['hype-guard','hype-guard']});
 g.elementalTrial=s.elementalTrial===true;
 g.abilityTrial=g.elementalTrial;
 g.iconicAbilities=s.iconicAbilities===true;
 g.iconicAbilityWave=s.iconicAbilityWave??(s.iconicAbilities?1:0);
 g.releasedPrimeTrio=s.releasedPrimeTrio===true;
 g.releasedPrimePair=s.releasedPrimePair===true;
 g.allPrimes=s.allPrimes===true;
 g.finalGuard=s.finalGuard===true;
 g.earthSupport=s.earthSupport===true;
 g.abilityRework=s.abilityRework===true;
 g=applyPortalDecks(g,s.decks[0].cards,loadouts,{round:s.round,opponentCards:s.decks[1].cards});
 g.elementRules=5;g.rotationLocked=true;g.eventFieldsEnabled=false;g.resonanceOffset=s.seed%5;
 // Opaque per-round card tokens never reveal a hidden motif or rarity.
 g.players.forEach((p,side)=>[...p.hand,...p.deck].forEach((c,i)=>{c.uid=s.iconicAbilityWave>=7?crypto.randomUUID():`r${s.round}-p${side}-c${i}`;}));
 s.game=g;s.phase='play';s.deadline=due(now,s,g.turn);s.ready=[false,false];s.step=null;
 if(s.balance)s.balance.roundStartedAt=now;
}
function resolveRps(s,now){
 if(s.choices.some(c=>c===null))return;
 const [a,b]=s.choices,winner=a===b?null:(a==='rock'&&b==='scissors'||a==='paper'&&b==='rock'||a==='scissors'&&b==='paper'?0:1);
 s.lastRps={choices:[a,b],winner};
 if(winner===null){s.choices=[null,null];s.attempt++;}else{s.phase='initiative';s.rpsWinner=winner;}
 s.deadline=due(now);
}
const DRAW_CHOICE_MS=15000;
function draw(s,index,now){
 const before=s.game;
 s.game=resolveDraw(before,index);
 s.step={kind:'draw',before:structuredClone(before),after:structuredClone(s.game)};
 s.deadline=due(now,s,s.game.turn);
}
function place(s,action,now,{chooseDraw=true}={}){
 const before=s.game;s.game=placeEffect(before,action,{chooseDraw:chooseDraw&&s.iconicAbilityWave>=7});s.step={kind:'place',action,before:structuredClone(before),after:structuredClone(s.game)};
 if(s.game.finished){s.results[s.round-1]=scores(s.game);s.phase=series113(s.results).finished?'ended':'between';s.deadline=s.phase==='between'?now+ROUND_BREAK_MS129:null;}else s.deadline=s.game.pendingDraw?now+DRAW_CHOICE_MS:due(now,s,s.game.turn);
}
export function advancePvp90(state,side,input,now=Date.now()){
 if(state.ruleset!==PVP_RULE90||![0,1].includes(side))throw Error('Invalid online duel.');
 const s=structuredClone(state);s.step=null;s.afkStreak129??=[0,0];if(s.game)s.game.eventFieldsEnabled=false;
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
 if(s.game.pendingDraw){
  if(input.kind!=='draw')throw Error('Choose a card to draw first.');
  draw(s,input.index,now);
  return s;
 }
 if(input.kind==='shift'){const before=s.game;s.game=shiftBlock(s.game,input.cell);s.step={kind:'shift',cell:input.cell,before:structuredClone(before),after:structuredClone(s.game)};return s;}
 if(input.kind!=='place'||input.action?.rotation!==0)throw Error('Invalid card action.');
 s.afkStreak129[side]=0;place(s,input.action,now);
 if(s.bot96&&side===0)s.bot96.opponent135=observeOpponent135(s.bot96.opponent135,state.game,s.game,input.action,`${s.round}:${s.game.placements}`);
 return s;
}
export function expirePvp90(state,now=Date.now()){
 if(!state.deadline||now<state.deadline)return null;
 const s=structuredClone(state);s.step=null;s.afkStreak129??=[0,0];if(s.game)s.game.eventFieldsEnabled=false;
 if(s.balance&&s.balance.fingerprint!==BALANCE_FINGERPRINT94){s.balance.mixed=true;s.balance.current=balanceVersion94(now);}
 if(s.phase==='rps'){for(const side of [0,1])if(s.choices[side]===null)s.choices[side]=gestures[((s.seed>>>side)+s.attempt+side)%3];resolveRps(s,now);return s;}
 if(s.phase==='initiative'){s.starter=s.rpsWinner;newRound(s,now);return s;}
 if(s.phase==='between'){s.round++;newRound(s,now);return s;}
 if(s.phase==='play'){
  if(s.game.pendingDraw){draw(s,0,now);return s;}
  s.afkStreak129[s.game.turn]++;
  place(s,timeoutAction(s.game),now,{chooseDraw:false});
  return s;
 }return null;
}
function perspectiveGame(game,side,revealUid=null){
 if(!game)return null;const g=structuredClone(game),swap=n=>n===null||n===undefined?n:side===1?1-n:n;
 // Board geometry is public; the seed also shuffles hidden draws and stays server-side.
 delete g.seed;
 const card=c=>{
  const v={...c};
  for(const key of ['origin','controller','guardOwner','laughOwner'])if(v[key]!==undefined)v[key]=swap(v[key]);
  for(const key of ['coverWard','ernieWard','phalanxLink','awkwardMark'])if(v[key])v[key]={...v[key],owner:swap(v[key].owner)};
  return v;
 };
 const hidden=c=>({id:'oracle',uid:c.uid,origin:swap(c.origin),controller:swap(c.controller),rotation:0,hidden:true});
 g.players=(side===1?[g.players[1],g.players[0]]:g.players).map(({discard,...p},i)=>({...p,
  ...(discard?{discardCount:discard.length,...(i===0?{discard:discard.map(card)}:{})}:{}),
  hand:p.hand.map(c=>i===0||c.uid===revealUid?card(c):hidden(c)),
  deck:p.deck.map((c,index)=>g.iconicAbilityWave>=7?{...hidden(c),uid:`deck-${i}-${index}`}:hidden(c))}));
 g.board=Object.fromEntries(Object.entries(g.board).map(([k,c])=>[k,card(c)]));
 if(g.pendingDraw){
  const owner=g.pendingDraw.side;
  g.pendingDraw={side:swap(owner),...(owner===side?{options:game.players[owner].deck.slice(0,2).map(card)}:{})};
 }
 if(g.fanReserve)g.fanReserve.owner=swap(g.fanReserve.owner);
 if(g.blockadeLock)g.blockadeLock.owner=swap(g.blockadeLock.owner);
 for(const k of ['turn','starter','winner'])g[k]=swap(g[k]);
 g.history=g.history.map(e=>({...e,side:swap(e.side)}));if(g.last)g.last={...g.last,side:swap(g.last.side)};
 return g;
}
export function projectPvp90(row,uid,now=Date.now()){
 const side=row.host_id===uid?0:row.guest_id===uid?1:null;if(side===null)throw Error('Duel unavailable.');
 const s=row.state,swap=n=>n===null||n===undefined?n:side===1?1-n:n;
 if(!s)return {id:row.id,kind:row.kind,status:row.status,code:row.kind==='private'?row.invite_code:null,version:row.version,searchRemainingMs:row.kind==='random'?Math.max(0,RANDOM_AI_WAIT_MS98-(now-Date.parse(row.created_at))):null,phase:row.status==='waiting'?'waiting':'preparing'};
 const players=side===1?[row.identities[1],row.identities[0]]:row.identities;
 const personality=row.ai_opponent96&&s.bot96?(s.bot96.personality134??botPersonality134(s.bot96.seed)):null;
 let step=null;
 if(s.step){
  const action=s.step.action?{...s.step.action}:null;
  if(action&&s.step.before.turn!==side)delete action.cycleUid;
  step={...s.step,...(action?{action}:{}),before:perspectiveGame(s.step.before,side,action?.uid),after:perspectiveGame(s.step.after,side)};
 }
 return {id:row.id,kind:row.kind,status:row.status,version:row.version,phase:s.phase,opponentType:row.ai_opponent96?'ai':'human',opponentStyle:personality?{id:personality.id,label:personality.label,description:personality.description}:null,opponentEngine:row.ai_opponent96?{name:'IS-MCTS',adaptive:true,observedMoves:s.bot96?.opponent135?.observations??0}:null,round:s.round,starter:swap(s.starter),players,series:series113(s.results.map(r=>side===1?[r[1],r[0]]:r)),winner:s.forfeit!=null?swap(1-s.forfeit):swap(series113(s.results).winner),rated:row.kind==='random',
  results:s.results.map(r=>side===1?[r[1],r[0]]:r),game:perspectiveGame(s.game,side),ready:side===1?[s.ready[1],s.ready[0]]:s.ready,
  ownChoice:s.choices[side],opponentChosen:Boolean(s.choices[1-side]),attempt:s.attempt,rpsWinner:swap(s.rpsWinner),
  lastRps:s.lastRps?{choices:side===1?[s.lastRps.choices[1],s.lastRps.choices[0]]:s.lastRps.choices,winner:swap(s.lastRps.winner)}:null,
  afkStreak:side===1?[s.afkStreak129?.[1]??0,s.afkStreak129?.[0]??0]:s.afkStreak129??[0,0],remainingMs:s.deadline?Math.max(0,s.deadline-now):null,forfeit:swap(s.forfeit),wallet:row.wallet,
  step};
}
