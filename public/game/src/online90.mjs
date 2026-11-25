import {bindSignatureControls} from './signature-controls.mjs?v=two-buttons';
import {edgeLabels,updateTwistControl} from './direction-controls.mjs';
import {animateResolvedFlips,bindFlipCombo} from './flip-combo.mjs?v=two-buttons';
import {bindBoardCardPreview146} from './board-card-preview146.mjs?v=penguin-mark';
import {createPollRecovery139} from './start-recovery139.mjs';
import {bindSeriesHud129} from './duel-hud129.mjs';
import {createPresentationRecovery133} from './online-recovery133.mjs';
import {onlineInput117,boardCellAt117} from './online-input117.mjs';
import {series113} from '../platform/series113.mjs';
import {bindDuelExit112} from './duel-exit112.mjs';
import {lockArenaSelection112} from '../platform/arena-availability112.mjs';
import {connectOnline90} from '../platform/account-client50.mjs?v=start-recovery-139';
import {createTableView} from './table-demo-view-hand17.mjs?v=penguin-mark';
import {previewEffect,abilityDescription,aimsAbility,turnsCards,ABILITIES,twistTargets,rageTargets,dashTargets,eventFields,fieldText,nextEvent} from './table-demo-rules.mjs?v=penguin-mark';
import {scores,moveTargets,cardOf,blockadeLocked,reservedCell} from './rules.mjs?v=final-guard';
import {createVoidAtmosphere} from './void-atmosphere.mjs?v=void-painted-2';
import {createTableAudio} from './table-audio.mjs?v=arcade-voices';
import {bindTableMusic107} from './table-music107.mjs?v=venom-live';
import {bindRoundCeremony} from './round-ceremony42.mjs?v=fight-43';
import {bindPortraitIntro86} from './portrait-intro86.mjs?v=start-recovery-139';
import {frame85,frameSvg85,portrait85,progression85,title85} from '../platform/identity85.mjs';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),id=params.get('match'),muted=params.get('mute')==='1',stage=$('stage'),svg=$('interaction');
let client,view,data=null,game=null,selected=null,target=null,hover=null,mode='card',abilityDirection=0,twistCell=null,blockadeCell=null,working=false,animating=false,drag=null,stopped=false,remaining=null,receivedAt=Date.now(),lastRound=0,lastEnd='',notice='Connecting to your saved duel…',sound=!muted,identityKey='',polling=false,moveEpoch=0;
let leaving112=false,booting139=false;
const pollRecovery139=createPollRecovery139();
lockArenaSelection112($('arenaTheme'));
const renderSeries129=bindSeriesHud129();
const atmosphere=createVoidAtmosphere(),audio=createTableAudio({muted}),portraitIntro=bindPortraitIntro86($('startDuel'),{motion:()=>$('motion').checked});
bindTableMusic107(audio);
const flipCombo=bindFlipCombo(stage,svg,{audio,motion:()=>$('motion').checked});
const presentation=createPresentationRecovery133({cancel:()=>{view?.cancel();flipCombo.clear();ceremony.cancel();portraitIntro.cancel();lastEnd='';}});
const ceremony=bindRoundCeremony($('roundPresentation'),{audio,onContinue:()=>{if(working||animating||presentation.needsSnapshot)return false;if(data?.phase==='between')void move({kind:'ready'});else if(data?.phase==='ended')location.assign('/play');return true;}});
const gestureNames={rock:'Rock',paper:'Paper',scissors:'Scissors'},glyphs={rock:'✊',paper:'✋',scissors:'✌'};
const inputState=()=>onlineInput117({game,phase:data?.phase,working,animating:animating||presentation.needsSnapshot,leaving:leaving112});
const locked=()=>Boolean(game?.pendingDraw)||!inputState().play;
const boardPreview=bindBoardCardPreview146(stage,svg,{getGame:()=>game,canInspect:()=>inputState().inspect});
const signatureControls=bindSignatureControls($('abilityOptions'),{english:true,onChange:render,onDraw:index=>void move({kind:'draw',index})});
function clear(){signatureControls.clear();boardPreview.clear();if(selected)view?.release(selected);selected=target=hover=twistCell=null;blockadeCell=null;mode='card';abilityDirection=0;}
function action(){return {uid:selected,cell:target,rotation:0,abilityDirection,twistCell,blockadeCell,...signatureControls.action()};}
function plan(){if(!selected||!target||!game||game.pendingDraw||game.turn!==0)return null;try{return previewEffect(game,action());}catch{return null;}}
function portrait(node,identity){if(!identity)return;const f=frame85(identity),p=portrait85(identity.avatarId),wrap=document.createElement('span'),img=document.createElement('img'),ring=document.createElement('span');wrap.className='identity-portrait85';wrap.dataset.tier=f.tier;wrap.style.setProperty('--portrait-size','62px');wrap.style.setProperty('--frame-color',f.color);img.src=p.image;img.alt='';ring.className='identity-ring85';ring.innerHTML=frameSvg85(f,progression85(identity.xp).level);wrap.append(img,ring);node.replaceChildren(wrap);}
function profiles(){const k=JSON.stringify([data?.players,data?.opponentStyle,data?.opponentEngine]);if(k===identityKey||!data?.players)return;identityKey=k;const [own,enemy]=data.players;const enemyTitle=data.opponentType==='ai'?'AI · '+(data.opponentStyle?.label??'Standard'):title85(enemy);$('gameSessionNote84').textContent=data.opponentType==='ai'?'Random · IS-MCTS · adapting from '+(data.opponentEngine?.observedMoves??0)+' visible moves':'Online alpha · human opponent · server-verified moves';$('gameAccountInfo').querySelector('small').textContent=data.opponentType==='ai'?'Win +5 Pixels +100 XP · loss / draw +2 Pixels · play & win quests':data.kind==='random'?'Human Random duel · Pixels, XP, quests & titles':'Private duel · friendly play';portrait($('ownPortrait85'),own);portrait($('enemyPortrait85'),enemy);$('playerName85').textContent=own.displayName;$('playerTitle85').textContent=title85(own);$('playerTitle85').hidden=!title85(own);$('enemyName90').textContent=enemy.displayName;$('enemyTitle90').textContent=enemyTitle;$('startEnemyName90').textContent=enemy.displayName;$('startEnemyTitle90').textContent=enemyTitle;}
function clock(){const sec=remaining===null?0:Math.max(0,Math.ceil((remaining-(Date.now()-receivedAt))/1000));
 const timer=$('startClock');
 timer.hidden=remaining===null||!['rps','initiative'].includes(data?.phase);
 if(!timer.hidden){const label='Time remaining: '+sec+' s';if(timer.textContent!==label)timer.textContent=label;}
 $('turnTimer').hidden=!game||data.phase!=='play';$('timerLabel').textContent=game?.pendingDraw?'DRAW CHOICE':(data?.afkStreak?.[game?.turn]??0)>=2?'AFK · 3 SEKUNDEN':game?.turn===0?'YOUR TURN':'OPPONENT TURN';$('timerValue').textContent=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');$('timerFill').style.transform='scaleX('+Math.max(0,sec/(game?.pendingDraw?15:(data?.afkStreak?.[game?.turn]??0)>=2?3:90))+')';$('turnTimer').dataset.state=sec<=5?'critical':sec<=15?'warning':'normal';}
function render(){
 boardPreview.sync();
 profiles();if(data?.wallet){$('gameWallet').hidden=false;for(const c of ['pixels','shards','echoes'])$('game'+c).textContent=data.wallet[c].toLocaleString('en-US');}
 if(!game)return;renderSeries129(data.round,data.results);const s=scores(game),p=plan(),card=game.players[0].hand.find(c=>c.uid===selected),busy=locked();
 for(const side of [0,1]){$('score'+side).textContent=s[side];$('stock'+side).textContent=game.players[side].hand.length+' hand · '+game.players[side].deck.length+' deck';}
 $('handCount').textContent=game.players[0].hand.length+' / 5';$('enemyHandCount').textContent=game.players[1].hand.length;$('ownDeckCount').textContent=game.players[0].deck.length+' cards';$('enemyDeckCount').textContent=game.players[1].deck.length+' cards';
 $('turnCount').textContent=game.placements+' / 18 cards';$('turnLabel').textContent=data.phase==='ended'?'Duel complete':game.finished?'Round complete':game.turn===1?'Opponent is thinking':busy?'Saving turn…':'Your turn';$('openingBadge').textContent=(data.kind==='random'?'Random':'Private')+' · '+'Round '+data.round;
 const series=series113(data.results);$('seriesStatus').textContent='Round wins '+series.wins[0]+' : '+series.wins[1]+' · First to 2';$('firstMove').textContent='First move: '+(game.starter===0?'you':'opponent');
 $('confirm').hidden=mode!=='shift';$('confirm').disabled=busy||!moveTargets(game).includes(target);$('confirm').textContent='Move blockade';$('cancel').disabled=busy||!selected&&mode!=='shift';$('shiftBlock').disabled=busy||!moveTargets(game).length;$('shiftBlock').textContent=blockadeLocked(game)?'⊣ Blockade sealed':'◆ Blockade · '+game.players[0].shifts+'/1';$('shiftBlock').classList.toggle('active',mode==='shift');
 $('nextRound').hidden=data.phase!=='between'&&data.phase!=='ended';$('nextRound').disabled=working||animating||presentation.needsSnapshot||data.phase==='between'&&data.ready[0];$('nextRound').textContent=data.phase==='ended'?'Back to matchmaking':data.ready[0]?'Next round starts automatically':'Continue sooner';
 $('statusTitle').textContent=notice||(game.finished?'Round complete':mode==='shift'?'Move the blockade':card?cardOf(card).name:game.turn===0?'Your move':'Opponent is thinking');$('statusDetail').textContent=data.phase==='ended'?(data.kind==='random'?'Duel result saved. Return to matchmaking.':'Private duel complete · unranked.') :p?p.flips.length+' possible captures':mode==='shift'?'Choose an adjacent free cell. Your card turn remains.':card?(game.turn===0?'Choose a free field. Escape cancels.':'Inspect your hand while your opponent plays.'):game.turn===0?'Drag a card onto a free field or select and confirm.':'Your hand and future draws stay private.';
 $('previewText').textContent=p?p.comparisons.map(c=>(c.attack.rank==='S'?'S':c.attack.total)+' vs '+(c.defend.rank==='S'?'S':c.defend.total)+(c.roundhouse?' · Roundhouse':c.thought?' · Thought Experiment flips':c.rainbow?' · Second Rainbow ✓':c.swipe?' · Shield Swipe ✓':c.bid?' · Sweeten the Deal ✓':c.decoy?' · Wrong Edge ✓':c.pursuit?' · No Escape ✓':c.objection?' · Objection holds':c.finalGuard?' · Final Guard holds':c.bailout?' · Last-Second Save':c.redirect?' · Clingy Bond → '+cardOf(game.board[c.redirect]).name:c.pincer?(game.abilityRework?' · Shockwave':' · Double Trouble'):c.phalanx?' · Phalanx ✓':c.sandwich?' · Sandwich ✓':c.ambush?' · Ambush ✓':c.defend.awkward?(c.flip?' · Awkward Silence ✓':' · Awkward Silence'):c.flip?' ✓':c.tieProtected?' · KEKW blocks the tie':'')).join(' · '):'';
 $('abilityOptions').hidden=!card?.ability||mode==='shift';$('abilityLabel').textContent=card?.ability?ABILITIES[card.ability].name:'';$('abilityHint').textContent=abilityDescription(game,card?.ability);$('directionLabel').hidden=!aimsAbility(card?.ability);$('abilityDirection').value=String(abilityDirection);$('abilityDirection').disabled=busy||Boolean(p?.suppressed);
 const rotationAbility=turnsCards(card?.ability)&&!p?.suppressed?card.ability:null;
 const rotationTargets=target&&rotationAbility?twistTargets(game,target,rotationAbility):[];
 updateTwistControl({wrapper:$('twistLabel'),title:$('twistTitle'),hint:$('twistHint'),select:$('twistTarget'),
  ability:rotationAbility,ready:Boolean(target),targets:rotationTargets,selected:twistCell,busy,english:true,name:cell=>cardOf(game.board[cell]).name});
 document.querySelector('.field-panel').hidden=game.eventFieldsEnabled===false;$('fieldLegend').replaceChildren(...eventFields(game).map(f=>{const e=document.createElement('span');e.textContent=fieldText(f);return e;}));const next=nextEvent(game);$('eventShort').textContent=next?'Change in '+next.remaining+' turns':'Final phase';$('eventCountdown').textContent='';
 const rush=card?.ability==='dash'&&target===game.block;
 const rage=card?.ability==='rage';
 $('blockadeLabel').hidden=!rush&&!rage;
 if(rush||rage){
  const cells=target?(rush?dashTargets(game,card,target):rageTargets(game,target)):[];
  $('blockadeTarget').replaceChildren(new Option(rush&&cells.length?'Automatic · '+cells[0]:'Keep blockade',''),...cells.map(c=>new Option(c,c)));
  $('blockadeTarget').value=blockadeCell??'';
  $('blockadeTarget').disabled=busy||!cells.length;
 }
 const draw=game.pendingDraw;
 signatureControls.update({game,card,target,plan:p,busy:draw?working||animating||presentation.needsSnapshot||leaving112:busy,options:draw?.options,waiting:draw?.side===1});
 if(draw)$('turnLabel').textContent=draw.side===0?'Choose one card to draw':'Opponent is choosing a card';
 if(game.finished&&game.last?.finalGuard)$('statusDetail').textContent='Final Guard saved '+cardOf(game.board[game.last.finalGuard.cell]).name+'.';
 $('controls').dataset.context='active';view.update(game,{selected,target,hover,inspect:null,mode,busy,confirmPlacement:Boolean(p&&!busy&&!drag?.moved),inspectable:inputState().inspect,cameraBusy:!inputState().camera,plan:p,abilityDirection,twistCell,rotationTargets});clock();
}
function rps(){
 if(!data)return;
 const dialog=$('startDuel'),show=['rps','initiative'].includes(data.phase);if(!show)return;
 if(!dialog.open){profiles();try{portraitIntro.open();}catch{}dialog.showModal();}
 $('startAttempt').textContent='ATTEMPT '+data.attempt;$('startTitle').textContent=data.phase==='initiative'?(data.rpsWinner===0?'You won the start right.':'Your opponent won the start right.'):'Who makes the first move?';
 $('startStatus').textContent=pollRecovery139.message|| (data.phase==='initiative'?(data.rpsWinner===0?'Choose who starts.':'Waiting for the opponent to choose.'):data.ownChoice?'Choice locked. Waiting for your opponent…':data.lastRps?.winner===null?'A tie. Choose again.':'Choose your hand sign privately.');
 $('startChoices').hidden=data.phase!=='rps';$('startInitiative').hidden=data.phase!=='initiative'||data.rpsWinner!==0;$('startRetry').hidden=true;$('startContinue').hidden=true;
 for(const b of dialog.querySelectorAll('[data-gesture]')){b.querySelector('.gesture-art').textContent=glyphs[b.dataset.gesture];b.disabled=working||Boolean(data.ownChoice);b.setAttribute('aria-pressed',String(b.dataset.gesture===data.ownChoice));}
 const choices=data.phase==='initiative'?data.lastRps.choices:[data.ownChoice,null];$('startPlayerHand').textContent=glyphs[choices[0]]??'?';$('startOpponentHand').textContent=glyphs[choices[1]]??'?';$('startPlayerName').textContent=gestureNames[choices[0]]??'Your choice';$('startOpponentName').textContent=choices[1]?gestureNames[choices[1]]:data.opponentChosen?'Locked':'Hidden choice';
 for(const b of dialog.querySelectorAll('[data-starter]'))b.disabled=working;
}
async function accept(next){
 if(!next.unchanged&&data&&next.version<data.version)return;
 if(next.unchanged){remaining=next.remainingMs;receivedAt=Date.now();if(data)data.wallet=next.wallet;clock();return;}
 const recovering=presentation.needsSnapshot,previous=data,changed=recovering||!previous||next.version!==previous.version;data=next;remaining=next.remainingMs;receivedAt=Date.now();profiles();
 if(next.status==='cancelled'||next.phase==='waiting'||next.phase==='preparing'){notice=next.status==='cancelled'?'This search was cancelled. Return to the match lobby.':'Waiting for your opponent. Return to the match lobby to manage the search.';$('loadStatus').querySelector('strong').textContent=notice;$('loadStatus').querySelector('span').textContent='Match lobby: /play';return;}
 if(next.forfeit!=null){flipCombo.clear();if(!recovering&&previous?.version===next.version&&previous.forfeit===next.forfeit){render();return;}portraitIntro.cancel();if($('startDuel').open)$('startDuel').close();$('loadStatus').hidden=true;notice=(next.forfeit===0?'You left the duel.':'Your opponent left the duel.')+(next.kind==='random'?(next.forfeit===0?' Defeat recorded.':' Victory recorded.'):' Private duel · no rewards.');animating=true;try{await presentation.run(async check=>{if(next.game){await view.prepareGame(next.game);check();view.initGame(next.game);}game=next.game;});}finally{animating=false;}render();ceremony.restore(id+':exit');ceremony.finish(id+':exit',{round:next.round,results:next.results,score:next.game?scores(next.game):[0,0],forfeit:next.forfeit,rated:next.kind==='random',motion:$('motion').checked,autoContinueMs:5000});return;}
 if(!next.game){if(next.phase==='ended'){portraitIntro.cancel();if($('startDuel').open)$('startDuel').close();$('loadStatus').hidden=false;$('loadStatus').querySelector('strong').textContent='The duel was conceded.';$('loadStatus').querySelector('span').textContent='Return to the match lobby: /play';}else rps();return;}
 if(!changed){render();return;}
 clear();animating=true;
 try{await presentation.run(async check=>{
 if($('startDuel').open){const flying=portraitIntro.fly();$('startDuel').close();await flying;check();}
 const sameRound=Boolean(previous?.game&&next.round===previous.round);
 const step=next.step,animate=Boolean(!recovering&&sameRound&&previous.version+1===next.version&&step&&step.before.placements===previous.game.placements);
 if(animate){game=step.before;await view.prepareGame(game);check();view.initGame(game,{keepCamera:true});render();if(step.kind==='place'){const rotation=step.after.last.transforms?.find(t=>t.uid===step.action.uid)?.from??step.after.last.blink?.from??Object.values(step.after.board).find(card=>card.uid===step.action.uid).rotation;view.setRotation(step.action.uid,rotation);if(next.game.last.dash){await view.shift(next.game.last.blockadeMove.to);check();audio.play('shift');}await view.place(step.action.uid,step.action.cell);check();audio.play('place');if(next.game.last.ability==='exchange'&&next.game.last.swapCells){await view.swapCards(next.game.last.swapCells,step.action.uid);check();audio.play('shift');}if(next.game.last.relocation){await view.slideCard(next.game.last.relocation);check();audio.play('shift');}if(next.game.last.blockadeMove&&!next.game.last.dash){await view.shift(next.game.last.blockadeMove.to);check();audio.play('shift');}}else if(step.kind==='shift'){await view.shift(step.cell);check();audio.play('shift');}else audio.play('draw');}
 await view.prepareGame(next.game);check();game=next.game;view.initGame(game,{keepCamera:sameRound});$('loadStatus').hidden=true;notice='';render();
 if(animate&&step.kind==='place'){
  const {flips,side,event,transforms,ability,suppressed}=game.last;
  view.react(game.last);if(!game.last.pincer?.shockwave)view.abilityBurst(game);
  if(transforms?.length&&ability!=='encore'&&!game.last.roundhouse){
   audio.play('twist');
   for(const effect of transforms){await view.turnCard(effect.uid,effect.from,effect.to);check();}
  }
  if(['guard','water'].includes(ability)&&!suppressed)audio.play('guard');
  for(const cell of flips)view.card(game.board[cell].uid)?.setOwner(step.before.board[cell].controller);
  if(flips.length)audio.play('capture',{side,count:flips.length});
  await animateResolvedFlips(view,game,flipCombo,async()=>{
   check();
   if(game.last.pincer?.shockwave){view.abilityBurst(game);return;}
   audio.play('twist');
   for(const {uid,from,to} of transforms){await view.turnCard(uid,from,to);check();}
  });check();
  if(ability==='encore'&&transforms?.length){audio.play('twist');for(const effect of transforms){await view.turnCard(effect.uid,effect.from,effect.to);check();}}
  if(game.last.blink){const {uid,from,to}=game.last.blink;audio.play('twist');await view.turnCard(uid,from,to);check();}
  for(const cell of flips)view.card(game.board[cell].uid)?.setOwner(game.board[cell].controller);
  if(event!==null){view.eventChange();audio.play('event');}
  if(!game.pendingDraw)audio.play('draw');
 }
 if(lastRound!==next.round){flipCombo.clear();$('gameRoundReward').hidden=true;ceremony.cancel();if(game.placements===0&&!game.finished)await ceremony.intro(next.round,{round:next.round,starter:game.starter,motion:$('motion').checked});else ceremony.restore(next.round);check();lastRound=next.round;}
 });}finally{animating=false;}
 render();rps();
 if(game.finished){const key=id+':'+next.round;if(lastEnd!==key){lastEnd=key;ceremony.finish(next.round,{round:next.round,match:true,results:next.results,score:scores(game),motion:$('motion').checked,autoContinueMs:next.phase==='ended'?5000:Math.max(0,next.remainingMs??8000)});}if(next.kind==='random'){$('gameRoundReward').hidden=false;const award=game.winner===0?5:2;$('gameRoundReward').textContent='+'+award+' Pixels'+(award===5?' · +100 XP':'')+' · Random round saved';}}

}
async function move(input){if(leaving112||working||animating||!client||!view||!data)return;working=true;moveEpoch++;notice='Saving…';try{render();rps();await accept(await client.move(data.version,input));pollRecovery139.reset();$('gameAccountError').hidden=true;}catch(e){pollRecovery139.failed(e);notice=e.message;$('gameAccountError').hidden=false;$('gameAccountErrorText').textContent=e.message;}finally{working=false;render();rps();}}
async function poll(){if(working||animating||stopped||booting139||document.hidden||!client||!view||polling||!pollRecovery139.ready)return;polling=true;const epoch=moveEpoch;try{const next=await client.poll(presentation.needsSnapshot?undefined:data?.version);if(epoch!==moveEpoch||working)return;await accept(next);pollRecovery139.reset();$('gameAccountError').hidden=true;}catch(e){if(epoch===moveEpoch){pollRecovery139.failed(e);$('gameAccountError').hidden=false;$('gameAccountErrorText').textContent=e.message;}}finally{polling=false;render();rps();}}
function choose(uid){if(!inputState().inspect||!game.players[0].hand.some(c=>c.uid===uid))return;const wasHovered=hover===uid;clear();selected=uid;hover=wasHovered?uid:null;audio.play('select');render();}
function canStage(cell){const card=game?.players[0].hand.find(c=>c.uid===selected);return Boolean(cell&&cell!==reservedCell(game)&&!game.board[cell]&&(game.block!==cell||dashTargets(game,card,cell).length));}
function field(cell){
 const ability=game?.players[0].hand.find(card=>card.uid===selected)?.ability;
 const pair=game?.abilityRework&&ability==='exchange'&&!locked()?plan()?.swaps.find(([,ally])=>ally===cell):null;
 if(pair){boardPreview.clear();signatureControls.swapWith(pair);render();return;}
 if(game?.abilityTrial&&!locked()&&target&&turnsCards(ability)&&twistTargets(game,target,ability).includes(cell)){
  boardPreview.clear();twistCell=twistCell===cell?null:cell;render();return;
 }
 if(boardPreview.toggle(cell))return;
 boardPreview.clear();
 if(locked())return;
 if(mode==='shift'){target=moveTargets(game).includes(cell)?cell:null;}
 else if(selected&&canStage(cell)){target=cell;twistCell=null;blockadeCell=null;signatureControls.clear();}
 render();
}
function confirm(){if(locked())return;if(mode==='shift'){if(moveTargets(game).includes(target))void move({kind:'shift',cell:target});}else if(plan())void move({kind:'place',action:action()});}
$('confirm').onclick=confirm;$('cancel').onclick=()=>{if(!locked()){clear();render();}};$('shiftBlock').onclick=()=>{if(locked())return;const old=mode;clear();mode=old==='shift'?'card':'shift';render();};
$('abilityDirection').replaceChildren(...edgeLabels(true).map((label,i)=>new Option(label,String(i))));$('abilityDirection').onchange=()=>{abilityDirection=Number($('abilityDirection').value);render();};$('twistTarget').onchange=()=>{twistCell=$('twistTarget').value||null;render();};$('blockadeTarget').onchange=()=>{blockadeCell=$('blockadeTarget').value||null;render();};
$('nextRound').onclick=()=>{if(data.phase==='between')void move({kind:'ready'});else location.assign('/play');};$('gameAccountRetry').onclick=()=>{pollRecovery139.reset();if(!client||!view)void bootOnline139();else void poll();};$('showRules').onclick=()=>{$('rulesPanel').open=!$('rulesPanel').open;};
for(const b of $('startDuel').querySelectorAll('[data-gesture]'))b.onclick=()=>void move({kind:'gesture',value:b.dataset.gesture,attempt:data.attempt});for(const b of $('startDuel').querySelectorAll('[data-starter]'))b.onclick=()=>void move({kind:'starter',side:Number(b.dataset.starter)});$('startDuel').addEventListener('cancel',e=>e.preventDefault());
bindDuelExit112({concede:async()=>{if(!client||!data||working)throw Error('Bitte kurz warten, bis der aktuelle Zug gespeichert ist.');working=true;moveEpoch++;try{await accept(await client.move(data.version,{kind:'resign'}));}finally{working=false;render();}},leave:async()=>{if(!client)throw Error('Open the match lobby to leave while sign-in is loading.');leaving112=true;stopped=true;try{await client.leave();}catch(e){leaving112=false;stopped=false;throw e;}}});
svg.addEventListener('click',e=>{const c=e.target.closest('[data-cell]');if(c)field(c.dataset.cell);});svg.addEventListener('keydown',e=>{if(!['Enter','Space'].includes(e.code))return;const h=e.target.closest('[data-hand]'),c=e.target.closest('[data-cell]');if(h||c){e.preventDefault();e.stopPropagation();h?choose(h.dataset.hand):field(c.dataset.cell);}});
svg.addEventListener('focusin',e=>{const uid=e.target.closest('[data-hand]')?.dataset.hand??null;if(inputState().inspect&&uid!==hover){hover=uid;render();}});
svg.addEventListener('focusout',e=>{if(!drag&&hover&&e.target.closest('[data-hand]')){hover=null;render();}});
svg.addEventListener('pointermove',e=>{
 if(!inputState().inspect)return;
 if(drag&&e.pointerId===drag.id){
  if(locked())return;
  if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8){const d=drag;choose(d.uid);drag=d;drag.moved=true;drag.node.classList.add('dragging');}
  if(drag.moved){const r=stage.getBoundingClientRect();view.drag(drag.uid,e.clientX-r.left,e.clientY-r.top);const cell=boardCellAt117(svg,e.clientX,e.clientY);target=canStage(cell)?cell:null;twistCell=null;blockadeCell=null;signatureControls.clear();render();}return;
 }
 const uid=e.target.closest('[data-hand]')?.dataset.hand??null;if(uid!==hover){hover=uid;render();}
});
svg.addEventListener('pointerdown',e=>{const h=e.target.closest('[data-hand]');if(!h||!inputState().inspect||e.button!==0)return;drag={uid:h.dataset.hand,id:e.pointerId,node:h,x:e.clientX,y:e.clientY,moved:false};h.setPointerCapture(e.pointerId);});
function release(e,cancelled=false){
 if(!drag||drag.id!==e.pointerId)return;
 const d=drag,cell=cancelled?null:boardCellAt117(svg,e.clientX,e.clientY);drag=null;
 d.node.classList.remove('dragging');try{d.node.releasePointerCapture(e.pointerId);}catch{}
 if(cancelled){view.release(d.uid);clear();render();return;}
 if(!d.moved){choose(d.uid);return;}
 view.release(d.uid);target=canStage(cell)?cell:null;twistCell=null;blockadeCell=null;signatureControls.clear();
 const placement=locked()?null:plan();
 if(!placement){clear();render();return;}
 const optional=placement.buttonAttack||placement.buttonDefense!=null||placement.pivotTarget||placement.steps?.length||placement.bidTargets?.length
  ||placement.swaps.length||placement.valueSwaps?.length||placement.ability==='wander'&&placement.turnChoices?.length
  ||placement.ability==='rage'&&rageTargets(game,target).length
  ||placement.turnChoices?.length||placement.dash||['water','air'].includes(placement.ability);
 if(optional)render();else confirm();
}
svg.addEventListener('pointerup',e=>release(e));svg.addEventListener('pointercancel',e=>release(e,true));svg.addEventListener('pointerleave',()=>{if(!drag&&hover){hover=null;render();}});
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(e.code==='Escape'){if(boardPreview.close()){e.preventDefault();return;}if(!ceremony.dismiss()&&inputState().inspect){e.preventDefault();clear();render();}return;}if(e.target.matches('input,select,button'))return;if(e.code==='Enter')confirm();});
async function soundOn(value){sound=!muted&&value;$('arenaSound').textContent=sound?'♪ Sound on':'♪ Sound off';$('arenaSound').setAttribute('aria-label',muted?'Sound muted for this test':sound?'Mute game sound':'Enable game sound');$('arenaSound').setAttribute('aria-pressed',String(sound));$('soundEnabled').checked=sound;await audio.setEnabled(sound);}
if(muted){$('arenaSound').disabled=true;$('soundEnabled').disabled=true;void soundOn(false);}
document.addEventListener('pointerdown',e=>{if(e.isTrusted&&sound&&!audio.running)void audio.setEnabled(true);},{capture:true});$('arenaSound').onclick=()=>void soundOn(!sound);$('soundEnabled').onchange=()=>void soundOn($('soundEnabled').checked);$('soundVolume').oninput=()=>audio.setVolume(Number($('soundVolume').value)/100);$('ambientEnabled').onchange=()=>audio.setAmbient($('ambientEnabled').checked);$('motion').onchange=()=>{view.setMotion($('motion').checked);atmosphere.setMotion($('motion').checked);};
$('arenaTheme').onchange=async()=>{const select=$('arenaTheme');lockArenaSelection112(select);select.disabled=true;try{await view.setArena('voidforge');audio.setArena('voidforge');}finally{select.disabled=false;}};
async function bootOnline139(){if(booting139||stopped)return;booting139=true;let ready=false;try{
 if(!/^[0-9a-f-]{36}$/.test(id??''))throw Error('Open a duel from the match lobby.');
 if(!client)client=await connectOnline90(id);if(!view){view=await createTableView(stage,svg,{onConfirmPlacement:confirm,confirmPlacementLabel:'Play card',rotationTargetLabel:'Can turn right',rotationSelectedLabel:'Will turn right',swapTargetLabel:'Can swap places',blinkLabel:'BLINK',tieShieldLabel:'TIE SHIELD',finalGuardLabel:'FINAL GUARD',getMusicTimeline:()=>audio.getMusicTimeline(),onResize:({own,opponent,height})=>{for(const [key,p,y]of [['ownDeckLabel',own,height-24],['enemyDeckLabel',opponent,82]]){$(key).style.left=p.x+'px';$(key).style.top=(p.labelY??y)+'px';}}});await view.setArena('voidforge');audio.setArena('voidforge');audio.setAmbient($('ambientEnabled').checked);if(!muted)void audio.preloadAnnouncements();}
 $('gameAccountInfo').hidden=false;$('accountDeckName').textContent='Online duel';$('gameAccountInfo').querySelector('small').textContent='Random: titles & rewards · Private: friendly play';$('gameSessionNote84').textContent='Online alpha · shared, server-verified game state';ready=true;
}catch(e){$('loadStatus').querySelector('strong').textContent=e.message;$('loadStatus').querySelector('span').textContent='Return to /play to sign in or resume your duel.';$('gameAccountError').hidden=false;$('gameAccountErrorText').textContent=e.message;}finally{booting139=false;}if(ready)await poll();}
void bootOnline139();
const pollTimer=setInterval(()=>void poll(),1800),clockTimer=setInterval(clock,250);window.addEventListener('focus',()=>void poll());document.addEventListener('visibilitychange',()=>{if(!document.hidden)void poll();});window.addEventListener('pagehide',()=>{stopped=true;clearInterval(pollTimer);clearInterval(clockTimer);portraitIntro.cancel();ceremony.dispose();audio.dispose();view?.dispose();});
