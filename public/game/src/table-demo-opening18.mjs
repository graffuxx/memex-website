import {bindSignatureControls} from './signature-controls.mjs?v=final-guard';
import {animateResolvedFlips,bindFlipCombo} from './flip-combo.mjs?v=4';
import {bindBoardCardPreview146} from './board-card-preview146.mjs?v=board-ability-symbols';
import {bindSeriesHud129} from './duel-hud129.mjs';
import {printedValue126} from '../platform/card-ranks126.mjs';
import {series113} from '../platform/series113.mjs';
import {bindDuelExit112} from './duel-exit112.mjs';
import {lockArenaSelection112} from '../platform/arena-availability112.mjs';
import {bindPortraitIntro86} from './portrait-intro86.mjs?v=start-recovery-139';
import {mountPlayerPresence85} from './player-presence85.mjs';
import {SOLO_LEVELS84,soloOpponent84,localSolo84} from '../platform/solo84.mjs?v=booster-classes-140';
import {soloAction84} from './solo-ai84.mjs?v=final-guard';
import {ILLUSTRATED_ARENAS} from './illustrated-arenas67.mjs';
import {attackWins} from '../platform/elements53.mjs?v=tie-break-63';
import {connectAccountGame,leaveStoredAccount112} from '../platform/account-client50.mjs?v=identity-85';
import {readPlayDeck,applyPortalDecks,defaultPlayDeck} from '../platform/deck-bridge.mjs?v=final-guard';
import {bindStartDuelDialog} from './start-duel-dialog18.mjs?v=start-recovery-139';
import {roundStarter} from './start-duel18.mjs';
import {withDemoFinishes,rarityOf} from './card-rarities15.mjs?v=opening-brand-18';
import {createTurnClock,timeoutAction} from './turn-clock.mjs?v=turn-clock-12';
import {freshMatchSeed} from './tactics-layout.mjs?v=random-layout-1';
import {createVoidAtmosphere} from './void-atmosphere.mjs?v=void-painted-2';
import {createTableAudio} from './table-audio.mjs?v=final-guard';
import {bindTableMusic107} from './table-music107.mjs?v=venom-live';
import {bindRoundCeremony} from './round-ceremony42.mjs?v=fight-43';
import {createTableView} from './table-demo-view-hand17.mjs?v=board-ability-symbols';
import {createTableDemo,createTacticsMatch,demoAction,drawnCard,DEMO_PROFILES} from './table-demo-state.mjs?v=final-guard';
import {scores,ELEMENTS,cardOf,shiftBlock,moveTargets,sideValue,blockadeLocked,reservedCell} from './rules.mjs?v=final-guard';
import {previewEffect,placeEffect,resolveDraw,preferredDrawIndex,ABILITIES,LOADOUTS,DIRECTION_NAMES,eventFields,eventFieldAt,nextEvent,fieldText,abilityAt,twistTargets,rageTargets,dashTargets,WATER_BONUS,guardActive,guardBonus,abilityDescription,aimsAbility,turnsCards} from './table-demo-rules.mjs?v=final-guard';
import {CARD_PROFILES} from './card-prototype.mjs?v=element-53';
let conceded129=false,afkStreak129=0;
let portalDeck;try{portalDeck=readPlayDeck(localStorage)??defaultPlayDeck();}catch{portalDeck=defaultPlayDeck();}
const practice=localSolo84(portalDeck)?portalDeck.practice:null;
const opponentAction84=game=>practice?soloAction84(game,practice.difficulty):demoAction(game);
const $=id=>document.getElementById(id),stage=$('stage'),svg=$('interaction');
const renderSeries129=bindSeriesHud129();
const refreshPresence85=mountPlayerPresence85();void refreshPresence85();
if(portalDeck.source==='sandbox')for(const link of document.querySelectorAll('a[href="/decks"]'))link.href='/decks?test=1';
let game=createTableDemo(),view,selected=null,target=null,rotation=0,abilityDirection=0,twistCell=null,blockadeCell=null,hover=null,mode='card',busy=true,phase='loading',epoch=0,drag=null,notice='',round=1,roundResults=[],matchSeed=null,firstStarter=null;
const boardPreview=bindBoardCardPreview146(stage,svg,{getGame:()=>game,canInspect:()=>Boolean(view&&!busy),onPinChange:render});
const portraitIntro86=bindPortraitIntro86($('startDuel'),{motion:()=>$('motion').checked});
const startDialog=bindStartDuelDialog($('startDuel'),{onOpen:()=>portraitIntro86.open(),onBeforeClose:()=>portraitIntro86.fly(),onCancel:()=>portraitIntro86.cancel()});
const atmosphere=createVoidAtmosphere();
const mutedTest=new URLSearchParams(location.search).get('mute')==='1';
let soundWanted=!mutedTest;try{soundWanted=!mutedTest&&localStorage.getItem('duelverse.arena-sound.v42')!=='off';}catch{}
function renderSound(){const button=$('arenaSound');button.textContent=soundWanted?'♪ Ton an':'♪ Ton aus';button.setAttribute('aria-pressed',String(soundWanted));button.setAttribute('aria-label',soundWanted?'Spielton ausschalten':'Spielton einschalten');$('soundEnabled').checked=soundWanted;}
const audio=createTableAudio({muted:mutedTest,onState:({available,running})=>{renderSound();$('soundStatus').textContent=!available?'Ton hier nicht verfügbar':soundWanted&&running?'Sounds & Ansagen aktiv':soundWanted?'Ton startet mit deiner ersten Eingabe':'Stumm';}});
const ceremony=bindRoundCeremony($('roundPresentation'),{audio,onContinue:advanceRound});
const flipCombo=bindFlipCombo(stage,svg,{audio,motion:()=>$('motion').checked});
bindTableMusic107(audio);audio.setAmbient($('ambientEnabled').checked);if(!mutedTest)void audio.preloadAnnouncements();
if(mutedTest){$('arenaSound').disabled=true;$('soundEnabled').disabled=true;$('soundTest').disabled=true;}
renderSound();
function unlockSound(e){if(e.isTrusted&&soundWanted&&!audio.running)void audio.setEnabled(true);}
document.addEventListener('pointerdown',unlockSound,{capture:true});
document.addEventListener('keydown',unlockSound,{capture:true});
let accountGame=null,accountSnapshot=null,accountResume=null,accountFailed=false;
bindDuelExit112({concede:async()=>{if(busy)throw Error('Bitte den laufenden Zug kurz abwarten.');if(accountGame)await accountGame.leave();conceded129=true;busy=true;const key='concede:'+epoch;ceremony.restore(key);ceremony.finish(key,{round,results:roundResults,score:scores(game),forfeit:0,rated:false,autoContinueMs:5000});},leave:async()=>{if(accountGame)await accountGame.leave();else if(portalDeck.source==='account'&&!practice)await leaveStoredAccount112();}});
function accountWallet(wallet){if(!wallet)return;for(const c of ['pixels','shards','echoes'])$('game'+c).textContent=wallet[c].toLocaleString('en-US');}
function acceptAccount(data){accountSnapshot=data;portalDeck={...data.state.deck,deckId:data.state.deck.id,source:'account'};round=data.state.round;roundResults=data.state.results;firstStarter=data.state.starter;matchSeed=data.state.seed;accountWallet(data.wallet);if(data.award>0)void refreshPresence85();$('accountDeckName').textContent=data.state.deck.name;}
function accountProblem(error){accountFailed=true;$('gameAccountError').hidden=false;$('gameAccountErrorText').textContent=error.message;busy=true;phase='connection';render();}
$('gameAccountRetry').onclick=()=>window.location.reload();
$('gameAccountNew').onclick=()=>{if(accountGame?.pending)return;try{accountGame?.forget();}catch{}window.location.reload();};
let messageTimer;
const turnClock=createTurnClock();let clockInterval;
function renderClock(){
 const state=turnClock.snapshot(),timer=$('turnTimer');if(practice&&!practice.timed){timer.hidden=true;return;}
 timer.hidden=!view||phase==='opening'||phase==='intro';timer.dataset.state=game.finished?'ended':game.turn===1?'opponent':state.seconds<=5?'critical':state.seconds<=15?'warning':'normal';
 $('timerLabel').textContent=game.finished?'RUNDE BEENDET':game.turn===1?'GEGNERZUG':busy&&state.seconds>0?'ZUGZEIT · PAUSE':state.expired?'ZEIT ABGELAUFEN':afkStreak129>=2?'AFK · 3 SEKUNDEN':'ZUGZEIT';
 $('timerValue').textContent=game.finished||game.turn===1?'—':Math.floor(state.seconds/60)+':'+String(state.seconds%60).padStart(2,'0');
 $('timerFill').style.transform='scaleX('+state.fraction+')';
 timer.setAttribute('aria-label',game.finished?'Runde beendet':game.turn===1?'Gegner ist am Zug':'Verbleibende Zugzeit: '+state.seconds+' Sekunden');
}
function syncClock(){
 turnClock.enter(epoch+':'+game.placements+':'+game.turn,{durationMs:afkStreak129>=2?3000:90000});
 if((!practice||practice.timed)&&view&&!game.finished&&game.turn===0&&!busy)turnClock.resume();else turnClock.pause();
 renderClock();
}
function expireTurn(){
 if(practice&&!practice.timed||busy||game.finished||game.turn!==0||!turnClock.snapshot().expired)return false;
 const automatic=timeoutAction(game);if(!automatic)return false;
 afkStreak129++;cancelSelection();announce('Zeit abgelaufen · automatische Platzierung');cycle(automatic,false,true);return true;
}
function announce(text){clearTimeout(messageTimer);$('arenaMessage').textContent=text;$('arenaMessage').classList.remove('active');void $('arenaMessage').offsetWidth;$('arenaMessage').classList.add('active');messageTimer=setTimeout(()=>$('arenaMessage').classList.remove('active'),1700);}
const isMatch=()=>$('sceneMode').value==='match';
const profile=c=>({...CARD_PROFILES[DEMO_PROFILES[c.id]],element:cardOf(c).element}),name=c=>profile(c).name;
function selectedCard(){return game.players[0].hand.find(c=>c.uid===selected);}
function action(){return {uid:selected,cell:target,rotation,abilityDirection,twistCell,blockadeCell,...signatureControls.action()};}
function plan(){if(mode!=='card'||!selected||!target||game.turn!==0)return null;try{return previewEffect(game,action());}catch{return null;}}
function detailStrength(s){if(s.rank==='S')return 'S (S-Rang; Zahlenboni ohne Wirkung)';return `${s.total} (Basis ${printedValue126(s.base)}${s.field?' + Feld '+s.field:''}${(game.elementRules??3)===3&&s.element?' + Element '+s.element:''}${s.ability?' + Fähigkeit '+s.ability:''}${s.formation?' + Phalanx '+s.formation:''}${s.sandwich?' + Sandwich '+s.sandwich:''}${s.misread?' − Falsche Kante '+s.misread:''}${s.distancePenalty?' − Distanz '+s.distancePenalty:''}${s.awkward?' − Peinliche Stille '+s.awkward:''})`;}
function render(){
 boardPreview.sync();
 const inspect=boardPreview.pinnedCell;
 renderSeries129(round,roundResults);const s=scores(game),p=plan(),card=selectedCard(),shiftValid=mode==='shift'&&moveTargets(game).includes(target);
 for(const side of [0,1]){$('score'+side).textContent=s[side];$('stock'+side).textContent=game.players[side].hand.length+' Hand · '+game.players[side].deck.length+' Deck';}
 $('handCount').textContent=game.players[0].hand.length+' / 5';$('enemyHandCount').textContent=game.players[1].hand.length;$('ownDeckCount').textContent=game.players[0].deck.length+(game.players[0].deck.length===1?' Karte':' Karten');$('enemyDeckCount').textContent=game.players[1].deck.length+' Karten';
 $('turnCount').textContent=game.placements+' / 18 Karten gelegt';$('turnLabel').textContent=game.finished?'Runde beendet':busy?phase==='opponent'?'Gegner ist am Zug':phase==='dealing'?'Karten werden ausgeteilt':phase==='opening'?'Startduell läuft':phase==='intro'?'Die Runde beginnt':'Karten in Bewegung':'Du bist am Zug';
 $('arenaTheme').disabled=busy;$('confirm').disabled=busy||!(p||shiftValid)||game.finished;$('confirm').textContent=mode==='shift'?'Verschieben':'Ausspielen';$('cancel').disabled=busy||(!selected&&mode!=='shift'&&!inspect);$('autoDemo').disabled=busy||game.finished||Boolean(accountGame);$('resetDemo').disabled=!view||phase==='opening';$('newDuel').disabled=busy;$('openingBadge').textContent=(phase==='opening'?'Startduell':isMatch()?'Runde '+round:'Training')+(practice?' · '+(practice.mode==='deck-test'?'Deck-Test':'Training')+' · '+SOLO_LEVELS84.find(l=>l.id===practice.difficulty).name:portalDeck.source==='sandbox'?' · Testdeck':'');$('firstMove').textContent=phase==='opening'?'Startrecht wird ausgespielt':isMatch()?'Erster Zug: '+(game.starter===0?'Du':'Gegner'):'';$('shiftBlock').disabled=busy||!moveTargets(game).length||game.finished;$('shiftBlock').classList.toggle('active',mode==='shift');$('shiftBlock').textContent=blockadeLocked(game)?'⊣ Blockade gesperrt':'◆ Blockade · '+game.players[0].shifts+'/1';$('loadout').closest('label').hidden=game.elementalTrial===true;$('opponentLoadout').closest('label').hidden=game.elementalTrial===true;$('loadout').disabled=busy;$('opponentLoadout').disabled=busy||!isMatch()||practice?.opponent==='mirror';$('sceneMode').disabled=busy||Boolean(accountGame)||Boolean(practice);$('practiceHint84').disabled=busy||game.finished||game.turn!==0;
 $('seriesStatus').hidden=!isMatch();const series=series113(roundResults),aggregate=series.wins;$('seriesStatus').textContent=`Rundensiege ${aggregate[0]} : ${aggregate[1]} · Zuerst 2 Siege`;
 $('nextRound').hidden=!isMatch()||!game.finished;$('nextRound').textContent=!series.finished?'Nächste Runde · '+(roundStarter(firstStarter??0,round+1)===0?'Du beginnst':'Gegner beginnt'):'Neues Duell';$('resetDemo').textContent=isMatch()?'Neues Duell':'Neu austeilen';
 document.querySelector('.field-panel').hidden=game.eventFieldsEnabled===false;const fields=eventFields(game);$('fieldLegend').replaceChildren(...fields.map(f=>{const el=document.createElement('span');el.style.setProperty('--field',({resonance:'#ba93ff',crossfire:'#ffbe62',silence:'#e1a6d5'})[f.type]);el.textContent=fieldText(f);return el;}));
 const next=nextEvent(game);$('eventShort').textContent=next?'Wechsel in '+next.remaining+' Zügen':'Letzte Phase';$('eventCountdown').textContent=next?'Danach: '+next.fields.map(f=>fieldText(f)).join(' / '):'Keine weiteren Feldwechsel';
 $('abilityOptions').hidden=!card||!card.ability||mode==='shift';const a=card?.ability,muted=card&&target&&eventFieldAt(game,target)?.type==='silence';
 $('abilityLabel').textContent=a?ABILITIES[a].name+(muted?' · im Funkloch deaktiviert':''):'';$('abilityHint').textContent=abilityDescription(game,a);
 $('directionLabel').hidden=!aimsAbility(a);$('abilityDirection').value=String(abilityDirection);$('abilityDirection').disabled=busy||Boolean(muted);
 $('twistLabel').hidden=!turnsCards(a);const options=[{cell:'',label:'Keine Karte drehen'},...(target&&turnsCards(a)?twistTargets(game,target,a).map(cell=>({cell,label:name(game.board[cell])+' · '+cell})):[])];
 $('twistTarget').replaceChildren(...options.map(o=>{const el=document.createElement('option');el.value=o.cell;el.textContent=o.label;return el;}));$('twistTarget').value=twistCell??'';$('twistTarget').disabled=busy||!target||Boolean(muted);
 const rush=card?.ability==='dash'&&target===game.block;
 const rage=card?.ability==='rage';
 $('blockadeLabel').hidden=!rush&&!rage;
 if(rush||rage){
  const cells=target?(rush?dashTargets(game,card,target):rageTargets(game,target)):[];
  $('blockadeTarget').replaceChildren(new Option(rush&&cells.length?'Automatisch · '+cells[0]:'Blockade stehen lassen',''),...cells.map(c=>new Option(c,c)));
  $('blockadeTarget').value=blockadeCell??'';
  $('blockadeTarget').disabled=busy||!cells.length;
 }
 if(game.finished){const final=isMatch()&&series.finished,result=final?aggregate:s;$('statusTitle').textContent=(final?'Duell: ':'Runde: ')+(result[0]===result[1]?'Unentschieden':result[0]>result[1]?'Du gewinnst':'Der Gegner gewinnt')+` ${result[0]} : ${result[1]}.`;$('statusDetail').textContent=isMatch()&&!series.finished?'In der nächsten Runde beginnt '+(roundStarter(firstStarter??0,round+1)===0?'dein Team':'der Gegner')+'. Beide Decks werden neu gemischt.':'Wer zuerst zwei Runden gewinnt, gewinnt das Duell. Unentschieden zählen nicht als Rundensieg.';}
 else if(busy){$('statusTitle').textContent=notice||'Die Karten sind in Bewegung.';$('statusDetail').textContent=phase==='opening'?'Erst das Startrecht klären, dann die Karten austeilen.':phase==='dealing'?'Fünf Karten wandern vom Stapel in deine Hand.':phase==='opponent'?'Der Demo-Gegner nutzt dieselben Feld- und Fähigkeitsregeln.':'Fähigkeit → Vergleiche → Übernehmen → Nachziehen.';}
 else if(mode==='shift'){$('statusTitle').textContent='Blockade verschieben';$('statusDetail').textContent=shiftValid?'Mit Verschieben bestätigen. Dein Karten-Zug bleibt erhalten.':'Ein markiertes freies Nachbarfeld wählen. Einmal pro Partie.';}
 else if(card){$('statusTitle').textContent=name(card)+' · '+ELEMENTS[profile(card).element].name;$('statusDetail').textContent=p?`${p.flips.length} Übernahme${p.flips.length===1?'':'n'}${p.suppressed?' · Fähigkeit deaktiviert':p.transforms.length?(a==='air'?' · Eigene Karte neu ausgerichtet':' · Drehziel bleibt diesen Zug geschützt'):''}. Mit Ausspielen bestätigen.`:'Auf ein freies Feld ziehen und loslassen – oder Feld wählen und Ausspielen.';}
 else if(inspect&&game.board[inspect]){const c=game.board[inspect];$('statusTitle').textContent=name(c)+' · '+(c.controller===0?'DEINE KARTE':'GEGNER');$('statusDetail').textContent=(c.ability?ABILITIES[c.ability].name+(eventFieldAt(game,inspect)?.type==='silence'?' · deaktiviert':guardActive(game,c,inspect)?' · Schutz aktiv bis zu deinem nächsten Karten-Zug':' · bereits ausgespielt'):'Ohne Spezialfähigkeit')+' · '+fieldText(eventFieldAt(game,inspect));}
 else{$('statusTitle').textContent='Karte wählen oder aufs Feld ziehen.';$('statusDetail').textContent='';}
 const described=card??(inspect?game.board[inspect]:null)??game.players[0].hand.find(c=>c.uid===hover);$('rarityInfo').hidden=!described;if(described){const r=rarityOf(described);$('rarityInfo').style.setProperty('--rarity-color',r.color);$('rarityName').textContent=r.mark+' · '+r.label;$('rarityFinish').textContent=r.finish;}
 $('controls').dataset.context=busy||card||inspect||mode==='shift'||game.finished?'active':'idle';
 $('previewText').textContent=p?p.comparisons.map(c=>name(game.board[c.cell])+': '+detailStrength(c.attack)+(c.setup?' → nur gedreht · ':c.attack.rank==='S'||c.defend.rank==='S'?(c.attack.rank===c.defend.rank?' = ':c.attack.rank==='S'?' > ':' < '):c.attack.total===c.defend.total?' = ':c.attack.total>c.defend.total?' > ':' < ')+detailStrength(c.defend)+(c.rainbow?' · Zweiter Bogen':c.swipe?' · Schildklau':c.bid?' · Nachschlag':c.decoy?' · Falsche Kante':c.pursuit?' · Kein Entkommen':c.objection?' · Einspruch hält':c.finalGuard?' · Schlussschutz hält':c.bailout?' · Rettung in letzter Sekunde':c.redirect?' · Klammergriff → '+name(game.board[c.redirect]):c.pincer?' · Doppelansage':c.phalanx?' · Phalanx':c.sandwich?' · Sandwich':c.ambush?' · Hinterhalt':game.elementRules===5&&c.attack.total===c.defend.total&&c.attack.element!==c.defend.element?(c.tieProtected?' · KEKW hält den Gleichstand':c.flip?' · Element entscheidet: Übernahme':' · Element entscheidet: Verteidigung hält'):'')).join(' · '):inspect&&game.board[inspect]?'Basiswerte O / SO / SW / W / NW / NO: '+DIRECTION_NAMES.map((_,d)=>printedValue126(sideValue(game.board[inspect],d))).join(' / '):'';
 signatureControls.update({game,card,target,plan:p,busy:finishDraw?false:busy,options:finishDraw?game.players[0].deck.slice(0,2):null,waiting:game.pendingDraw?.side===1});
 syncClock();
 view?.update(game,{selected,target,hover,busy,plan:p,mode,twistCell,inspect,abilityDirection});
}
let finishDraw=null;
const signatureControls=bindSignatureControls($('abilityOptions'),{onChange:render,onDraw:index=>finishDraw?.(index)});
function askDraw(){
 return new Promise(resolve=>{
  const timer=setTimeout(()=>finishDraw?.(0),15000);
  finishDraw=index=>{clearTimeout(timer);finishDraw=null;resolve(index);};
  render();
 });
}
function clear(){signatureControls.clear();boardPreview.clear();selected=null;target=null;rotation=0;abilityDirection=0;twistCell=null;blockadeCell=null;hover=null;mode='card';}
function choose(uid){if(expireTurn()||busy||game.finished)return;if(selected!==uid){const wasHovered=hover===uid;clear();selected=uid;hover=wasHovered?uid:null;view.setRotation(uid,0);audio.play('select');}render();}
function canStage(cell){return Boolean(cell&&cell!==reservedCell(game)&&!game.board[cell]&&(game.block!==cell||dashTargets(game,selectedCard(),cell).length));}
function chooseField(cell){
 if(busy)return;
 if(game.board[cell]){
  if(!game.finished&&turnsCards(selectedCard()?.ability)&&target&&abilityAt(game,selectedCard(),target)&&twistTargets(game,target,selectedCard().ability).includes(cell)&&!expireTurn()){
   twistCell=twistCell===cell?null:cell;render();return;
  }
  boardPreview.toggle(cell);return;
 }
 const inspected=boardPreview.pinnedCell;
 boardPreview.clear();
 if(expireTurn()||game.finished)return;
 if(mode==='shift'){target=moveTargets(game).includes(cell)?cell:null;render();return;}
 if(!selected){if(inspected)render();return;}
 target=canStage(cell)?cell:null;twistCell=null;blockadeCell=null;signatureControls.clear();render();
}
function showPracticeHint84(){
 if(!practice||busy||game.finished||game.turn!==0)return;
 const suggestion=soloAction84(game,'tactical');if(!suggestion)return;
 cancelSelection();selected=suggestion.uid;target=suggestion.cell;rotation=0;abilityDirection=suggestion.abilityDirection??0;twistCell=suggestion.twistCell??null;blockadeCell=suggestion.blockadeCell??null;signatureControls.setAction(suggestion);view.setRotation(selected,0);render();announce('Zughinweis · Vorschlag prüfen, ändern oder ausspielen');
}
$('practiceHint84').onclick=showPracticeHint84;
function cancelSelection(){if(busy)return;if(drag){const d=drag;drag=null;d.node.classList.remove('dragging');try{d.node.releasePointerCapture(d.id);}catch{}view.release(d.uid);}if(selected||mode==='shift')audio.play('cancel');if(selected){view.release(selected);view.setRotation(selected,0);}clear();render();}
async function playAction(a,token,serverNext=null){
 const side=game.turn,before=game,resolution=previewEffect(game,a),next=serverNext??placeEffect(game,a,{chooseDraw:game.iconicAbilityWave>=7}),draw=drawnCard(before,next,side),played=before.players[side].hand.find(c=>c.uid===a.uid);
 phase=side===1?'opponent':'placing';notice=name(played)+' wird ausgespielt'+(played.ability?' · '+ABILITIES[played.ability].name:'')+'.';render();view.setRotation(a.uid,resolution.card.rotation);
 if(next.last.dash){if(!await view.shift(next.last.blockadeMove.to)||token!==epoch)return false;audio.play('shift');}
 if(!await view.place(a.uid,a.cell)||token!==epoch)return false;audio.play('place');
 if(next.last.relocation){if(!await view.slideCard(next.last.relocation)||token!==epoch)return false;audio.play('shift');}
 if(next.last.blockadeMove&&!next.last.dash){if(!await view.shift(next.last.blockadeMove.to)||token!==epoch)return false;audio.play('shift');}
 if(draw){view.hide(draw.uid);view.hold(draw.uid);}game=next;if(isMatch()&&game.finished)roundResults[round-1]=scores(game);clear();render();view.abilityBurst(next);
 if(next.last.transforms.length&&next.last.ability!=='encore'){const allied=next.last.ability==='air',chorus=next.last.ability==='chorus';notice=chorus?'Choreografie · Zwei eigene Karten gedreht.':next.last.ability==='roundhouse'?'Roundhouse · eroberte Karte gedreht.':allied?'Rückenwind · eigene Karte gedreht.':'Think Again · Ziel vorbereitet, keine Übernahme dieses Zugs.';announce(chorus?'♫ Choreografie':next.last.ability==='roundhouse'?'↻ Roundhouse':allied?'↻ Rückenwind':'↻ Think Again · Gegenzug bleibt möglich');audio.play('twist');render();for(const t of next.last.transforms)if(!await view.turnCard(t.uid,t.from,t.to)||token!==epoch)return false;}
 if(['guard','water'].includes(next.last.ability)&&!next.last.suppressed){audio.play('guard');announce('Schutz · gewählte Seite +'+(next.last.ability==='water'?WATER_BONUS:guardBonus(game)));}
 const blocked=resolution.comparisons.filter(c=>!c.setup&&!c.flip&&c.defend.ability>0&&attackWins(c.attack,{...c.defend,total:c.defend.total-c.defend.ability},game.elementRules??3)).map(c=>c.cell);if(blocked.length){audio.play('guard');announce('Abgewehrt · Schutz hält');if(!await view.shieldBlock(blocked)||token!==epoch)return false;}
 view.react(next.last);
 if(next.last.flips.length){audio.play('capture',{side,count:next.last.flips.length});if(next.last.flips.length===1)announce(side===0?'Deine Übernahme':'Gegner übernimmt');notice=next.last.flips.length+(next.last.flips.length===1?' Karte wechselt':' Karten wechseln')+' die Seite.';render();await animateResolvedFlips(view,next,flipCombo);if(token!==epoch)return false;}
 if(next.last.ability==='encore'&&next.last.transforms.length){audio.play('twist');announce('♫ Zugabe');for(const t of next.last.transforms)if(!await view.turnCard(t.uid,t.from,t.to)||token!==epoch)return false;}
 if(next.last.finalGuard)announce('Schlussschutz · Karte bleibt auf ihrer Seite');
 if(next.last.blink){const {uid,from,to}=next.last.blink;audio.play('twist');announce('⟳ Blinzler');if(!await view.turnCard(uid,from,to)||token!==epoch)return false;}
 if(next.pendingDraw){
  const index=side===0?await askDraw():preferredDrawIndex(next.players[side].deck.slice(0,2));
  if(token!==epoch)return false;
  game=resolveDraw(next,index);
  const chosen=drawnCard(next,game,side);
  if(chosen){
   view.hide(chosen.uid);view.hold(chosen.uid);render();audio.play('draw');
   if(!await view.draw(chosen.uid,side)||token!==epoch)return false;
  }
 }
 if(draw){audio.play('draw');notice=(side===0?'Du ziehst':'Der Gegner zieht')+' eine Karte nach.';phase=side===1?'opponent':'drawing';render();if(!await view.draw(draw.uid,side)||token!==epoch)return false;}
 if(next.last.event!==null){view.eventChange();announce('Feldwechsel · neue Resonanz');audio.play('event');}
 if(game.finished){$('arenaMessage').classList.remove('active');ceremony.finish(token,{round,match:isMatch(),results:roundResults,score:scores(game),motion:$('motion').checked,autoContinueMs:series113(roundResults).finished?5000:8000});if(accountGame){const awarded=accountSnapshot?.state.awards[round-1]??0;$('gameRoundReward').hidden=false;$('gameRoundReward').textContent='+'+awarded+' Pixels'+(awarded===5?' · +100 XP':'')+' · Runde '+round+' gutgeschrieben';}}
 return true;
}
async function cycle(a,showPreview=false,fromTimeout=false){if(!fromTimeout&&expireTurn())return;if(busy||game.finished||!a)return;const token=epoch;if(!fromTimeout)afkStreak129=0;busy=true;
 try{
  if(accountGame){phase='connection';notice='Spielzug wird gespeichert.';render();const data=await accountGame.move({kind:fromTimeout?'timeout':'place',action:a});acceptAccount(data);for(const step of data.steps){if(token!==epoch)return;if(!await playAction(step.action,token,step.after))return;}return;}
  if(showPreview){selected=a.uid;target=a.cell;rotation=a.rotation;abilityDirection=a.abilityDirection;twistCell=a.twistCell;blockadeCell=a.blockadeCell??null;signatureControls.setAction(a);mode='card';view.setRotation(selected,rotation);notice='Vorschau: '+name(selectedCard())+' auf das markierte Feld.';phase='preview';render();if(!await view.animate(850,()=>{})||token!==epoch)return;}
  if(!await playAction(a,token))return;
  if(!game.finished&&game.turn===1){phase='opponent';notice='Der Gegner wählt seinen Demo-Zug.';render();if(!await view.animate(240,()=>{})||token!==epoch)return;const response=opponentAction84(game);if(response&&!await playAction(response,token))return;}
 }catch(error){notice=error.message;console.error(error);if(accountGame)accountProblem(error);}finally{if(token===epoch){busy=accountFailed;phase='idle';clear();render();if(!game.finished)audio.play('turn',{side:game.turn});}}
}
async function confirm(){if(expireTurn()||busy)return;if(mode!=='shift'){if(plan())cycle(action());return;}if(!moveTargets(game).includes(target))return;
 const token=epoch;let next;if(accountGame){busy=true;phase='connection';render();try{const data=await accountGame.move({kind:'shift',cell:target});acceptAccount(data);next=data.state.game;}catch(error){accountProblem(error);return;}}else next=shiftBlock(game,target);busy=true;notice='Blockade wird verschoben.';audio.play('shift');render();const ok=await view.shift(target);if(ok&&token===epoch){game=next;busy=false;notice='';clear();render();}}
async function reset({preserveSeries=false}={}){
 if(!view||accountFailed)return;const token=++epoch;finishDraw?.(0);startDialog.cancel();ceremony.cancel();
 if(drag){drag.node.classList.remove('dragging');try{drag.node.releasePointerCapture(drag.id);}catch{}drag=null;}
 view.cancel();flipCombo.clear();audio.cancel();clearTimeout(messageTimer);$('arenaMessage').classList.remove('active');
 if(!preserveSeries){conceded129=false;afkStreak129=0;round=1;roundResults=[];matchSeed=freshMatchSeed(matchSeed);firstStarter=null;}
 busy=true;clear();phase=isMatch()&&!preserveSeries?'opening':'dealing';notice=phase==='opening'?'Spielt das Startrecht aus.':'Neue Karten werden ausgeteilt.';
 let accountData=null;
 if(accountGame){
  try{
   if(accountResume){accountData=accountResume;accountResume=null;acceptAccount(accountData);phase='restoring';}
   else if(preserveSeries){accountData=await accountGame.move({kind:'next'});acceptAccount(accountData);phase='dealing';}
  }catch(error){accountProblem(error);return;}
 }
 game=isMatch()?createTacticsMatch({loadouts:[$('loadout').value,$('opponentLoadout').value],seed:matchSeed,starter:roundStarter(firstStarter??0,round)}):createTableDemo($('loadout').value);
 if(practice?.mode==='deck-test'){game.abilityTrial=true;game.elementalTrial=true;game.iconicAbilities=true;game.iconicAbilityWave=7;game.releasedPrimeTrio=true;game.releasedPrimePair=true;game.allPrimes=true;game.finalGuard=true;}
 if(isMatch())game=applyPortalDecks(game,portalDeck.cards,[$('loadout').value,$('opponentLoadout').value].map(id=>LOADOUTS[id]),{round,opponentCards:practice?soloOpponent84(practice.opponent,portalDeck.cards,matchSeed):null});
 if(accountData)game=accountData.state.game;
 game=withDemoFinishes(game);game.rotationLocked=true;await view.prepareGame(game);if(token!==epoch)return;view.initGame(game);
 if(phase==='opening'){
  for(const card of game.players[0].hand)view.hide(card.uid);render();
  $('startDuel').dataset.motion=$('motion').checked?'on':'off';const starter=await startDialog.open();if(token!==epoch||starter===null)return;
  firstStarter=starter;game.starter=game.turn=roundStarter(firstStarter,round);
  if(accountGame){try{accountData=await accountGame.start({starter,deckId:portalDeck.deckId??null,loadouts:[$('loadout').value,$('opponentLoadout').value]});acceptAccount(accountData);game=accountData.steps[0]?.before??accountData.state.game;await view.prepareGame(game);view.initGame(game);}catch(error){accountProblem(error);return;}}
 }
 if(accountData&&phase==='restoring'){ceremony.restore(token);game=accountData.state.game;view.initGame(game);busy=false;phase='idle';notice='Gespeichertes Duell wiederhergestellt.';if(game.finished){const award=accountData.state.awards[round-1]??0;$('gameRoundReward').hidden=false;$('gameRoundReward').textContent='+'+award+' Pixels'+(award===5?' · +100 XP':'')+' · Runde '+round+' bereits gutgeschrieben';}render();return;}
 if(accountData){game=accountData.steps[0]?.before??accountData.state.game;view.initGame(game);}
 $('gameRoundReward').hidden=true;
 phase='dealing';notice='Neue Karten werden ausgeteilt.';render();const ok=await view.deal();if(!ok||token!==epoch)return;
 phase='intro';notice='Die Runde beginnt.';render();
 if(!await ceremony.intro(token,{round,starter:game.turn,motion:$('motion').checked})||token!==epoch)return;
 if(accountData){for(const step of accountData.steps){if(!await playAction(step.action,token,step.after)||token!==epoch)return;}game=accountData.state.game;}
 else if(game.turn===1){phase='opponent';notice=round===1?'Der Gegner hat den ersten Zug gewählt.':'Rückspiel: Der Gegner beginnt.';render();const response=opponentAction84(game);if(!await playAction(response,token)||token!==epoch)return;}
 busy=false;phase='idle';notice='';render();
}

function pointerCell(e){return document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-cell]')?.getAttribute('data-cell')??null;}
svg.addEventListener('focusin',e=>{const uid=e.target.closest('[data-hand]')?.dataset.hand??null;if(!busy&&uid!==hover){hover=uid;render();}});
svg.addEventListener('focusout',e=>{if(!drag&&hover&&e.target.closest('[data-hand]')){hover=null;render();}});
svg.addEventListener('pointerdown',e=>{const node=e.target.closest('[data-hand]');if(!node||busy||game.finished||e.button!==0)return;drag={uid:node.dataset.hand,node,id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};node.setPointerCapture(e.pointerId);});
svg.addEventListener('pointermove',e=>{if(drag&&e.pointerId===drag.id){if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8){choose(drag.uid);if(!drag||busy)return;drag.moved=true;drag.node.classList.add('dragging');}
 if(drag.moved){const r=stage.getBoundingClientRect();view.drag(drag.uid,e.clientX-r.left,e.clientY-r.top);const c=pointerCell(e);target=canStage(c)?c:null;twistCell=null;blockadeCell=null;signatureControls.clear();render();}return;}
 if(busy)return;const uid=e.target.closest('[data-hand]')?.dataset.hand??null;if(uid!==hover){hover=uid;render();}});
function stopDrag(e,cancelled=false){
 if(!drag||e.pointerId!==drag.id)return;
 const d=drag,cell=cancelled?null:pointerCell(e);drag=null;
 d.node.classList.remove('dragging');try{d.node.releasePointerCapture(e.pointerId);}catch{}
 if(!d.moved&&!cancelled){choose(d.uid);return;}
 if(cancelled){view.release(d.uid);cancelSelection();return;}
 target=canStage(cell)?cell:null;twistCell=null;blockadeCell=null;signatureControls.clear();
 const placement=target&&plan();
 if(placement){
  if(placement.pivotTarget||placement.steps.length||placement.bidTargets.length||placement.swaps.length||placement.valueSwaps?.length||placement.turnChoices.length||placement.dash||placement.ability==='rage'&&rageTargets(game,target).length||['water','air'].includes(placement.ability)){
   view.release(d.uid);render();
  }else cycle(action());
  return;
 }
 // Invalid drops never reserve a tile, consume a card or start an opponent turn.
 view.release(d.uid);cancelSelection();
}
svg.addEventListener('pointerup',e=>stopDrag(e));svg.addEventListener('pointercancel',e=>stopDrag(e,true));svg.addEventListener('pointerleave',()=>{if(!drag&&!busy&&hover){hover=null;render();}});
svg.addEventListener('click',e=>{const c=e.target.closest('[data-cell]');if(c)chooseField(c.dataset.cell);});
svg.addEventListener('keydown',e=>{if(e.code!=='Enter'&&e.code!=='Space')return;const h=e.target.closest('[data-hand]'),c=e.target.closest('[data-cell]');if(h||c){e.preventDefault();e.stopPropagation();h?choose(h.dataset.hand):chooseField(c.dataset.cell);}});
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;if(e.code==='Escape'){e.preventDefault();if(!boardPreview.close()&&!ceremony.dismiss())cancelSelection();return;}if(['SELECT','INPUT'].includes(e.target.tagName))return;if(e.code==='Enter'&&e.target.tagName!=='BUTTON'&&(plan()||mode==='shift')&&!busy){e.preventDefault();confirm();}});
$('newDuel').onclick=()=>reset();$('showRules').onclick=()=>{const panel=$('rulesPanel');panel.open=!panel.open;if(panel.open)panel.scrollIntoView({block:'nearest',behavior:'smooth'});};
$('confirm').onclick=confirm;$('cancel').onclick=cancelSelection;$('autoDemo').onclick=()=>cycle(demoAction(game),true);$('resetDemo').onclick=reset;
$('shiftBlock').onclick=()=>{if(expireTurn()||busy)return;if(mode==='shift')cancelSelection();else{cancelSelection();mode='shift';render();}};
$('abilityDirection').onchange=()=>{abilityDirection=Number($('abilityDirection').value);render();};$('twistTarget').onchange=()=>{twistCell=$('twistTarget').value||null;render();};$('blockadeTarget').onchange=()=>{blockadeCell=$('blockadeTarget').value||null;render();};$('loadout').onchange=()=>{if(practice?.opponent==='mirror')$('opponentLoadout').value=$('loadout').value;reset();};$('opponentLoadout').onchange=reset;$('sceneMode').onchange=reset;
function advanceRound(){if(conceded129||game.finished&&series113(roundResults).finished){location.assign('/play');return true;}if(busy||!game.finished)return false;if(isMatch()&&!series113(roundResults).finished){round++;void reset({preserveSeries:true});}else void reset();return true;}
$('nextRound').onclick=advanceRound;
for(const selector of ['loadout','opponentLoadout'])$(selector).replaceChildren(...Object.entries(LOADOUTS).map(([key,value])=>{const o=document.createElement('option');o.value=key;o.textContent=value.name;return o;}));
$('opponentLoadout').value=practice?.opponent==='mirror'?$('loadout').value:practice?.opponent==='balanced'?'guard-twist':'hype-twist';
$('abilityDirection').replaceChildren(...DIRECTION_NAMES.map((n,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=['→','↘','↙','←','↖','↗'][i]+' '+n;return o;}));
$('motion').checked=!matchMedia('(prefers-reduced-motion:reduce)').matches;atmosphere.setMotion($('motion').checked);$('motion').onchange=()=>{atmosphere.setMotion($('motion').checked);view?.setMotion($('motion').checked);stage.dataset.motion=$('motion').checked?'on':'off';};
let arenaRequest=0,currentArena='voidforge';
function arenaLabel(id){return ILLUSTRATED_ARENAS[id]?.name??({voidforge:'Voidforge',painted:'Void-Kluft',grove:'Resonanzhain',rift:'Glutkluft',void:'Void-Sanktuarium'})[id];}
lockArenaSelection112($('arenaTheme'));currentArena='voidforge';
$('arenaTheme').onchange=async()=>{const id=lockArenaSelection112($('arenaTheme')),request=++arenaRequest;$('arenaTheme').setAttribute('aria-busy','true');$('arenaLoadState').textContent='Arena lädt …';try{const ready=await view?.setArena(id);if(request!==arenaRequest||!ready)return;currentArena=id;audio.setArena(id);$('arenaName').textContent=arenaLabel(id);try{localStorage.setItem('duelverse.arena.v77',id);}catch{}}catch{if(request===arenaRequest){$('arenaTheme').value=currentArena;announce('Arena konnte nicht geladen werden. Bitte erneut versuchen.');}}finally{if(request===arenaRequest){$('arenaTheme').removeAttribute('aria-busy');$('arenaLoadState').textContent='';}}};
async function setSound(value){if(mutedTest)return;soundWanted=Boolean(value);try{localStorage.setItem('duelverse.arena-sound.v42',soundWanted?'on':'off');}catch{}renderSound();const ok=await audio.setEnabled(soundWanted);if(ok)audio.play('select');}
$('arenaSound').onclick=()=>setSound(!soundWanted);$('soundEnabled').onchange=()=>setSound($('soundEnabled').checked);$('soundVolume').oninput=()=>audio.setVolume(Number($('soundVolume').value)/100);$('ambientEnabled').onchange=()=>audio.setAmbient($('ambientEnabled').checked);$('soundTest').onclick=async()=>{await setSound(true);if(audio.running){audio.test();}};
try{
 accountGame=await connectAccountGame({sandbox:Boolean(practice)||portalDeck.source==='sandbox'});
 if(accountGame){const chosen=accountGame.profile.decks.find(d=>d.id===portalDeck.deckId)??accountGame.profile.decks.find(d=>d.active)??accountGame.profile.decks[0];if(!chosen)throw Error('Bitte zuerst ein gültiges 15-Karten-Deck speichern.');portalDeck={...chosen,deckId:chosen.id,source:'account'};accountResume=accountGame.resumed&&accountGame.resumed.state.deck.id===chosen.id&&JSON.stringify(accountGame.resumed.state.deck.cards)===JSON.stringify(chosen.cards)?accountGame.resumed:null;accountWallet(accountGame.profile.wallet);$('gameSessionNote84').textContent='KI-Duell · servergeprüfte Pixel-Belohnungen';$('gameWallet').hidden=false;$('gameAccountInfo').hidden=false;$('accountDeckName').textContent=chosen.name;$('sceneMode').value='match';$('autoDemo').hidden=true;window.addEventListener('focus',()=>void accountGame.refreshWallet().then(accountWallet).catch(()=>{}));}
 else if(practice){document.body.dataset.soloMode=practice.mode;$('sceneMode').value='match';$('gameAccountInfo').hidden=false;$('accountDeckName').textContent=portalDeck.name;const link=$('gameAccountInfo').querySelector('a');link.href='/play?mode='+practice.mode;link.textContent='Solo-Menü';$('gameAccountInfo').querySelector('small').textContent=(practice.mode==='deck-test'?'Deck-Test':'Training')+' · '+SOLO_LEVELS84.find(l=>l.id===practice.difficulty).name+' · '+(practice.timed?'90 Sekunden pro Zug':'ohne Zeitlimit')+' · keine Pixel-Belohnungen';$('practiceHint84').hidden=false;$('autoDemo').hidden=true;$('gameSessionNote84').textContent='Freies Training gegen KI · keine Währungsbelohnungen';}else{$('guestRewardNote').hidden=false;}
 view=await createTableView(stage,svg,{getMusicTimeline:()=>audio.getMusicTimeline(),onResize:({own,opponent,height})=>{for(const [id,p,y] of [['ownDeckLabel',own,height-24],['enemyDeckLabel',opponent,82]]){$(id).style.left=p.x+'px';$(id).style.top=(p.labelY??y)+'px';}}});view.setMotion($('motion').checked);stage.dataset.motion=$('motion').checked?'on':'off';await view.setArena($('arenaTheme').value);currentArena=$('arenaTheme').value;audio.setArena(currentArena);$('arenaName').textContent=arenaLabel(currentArena);$('loadStatus').hidden=true;await reset();}catch(error){$('loadStatus').hidden=false;$('loadStatus').querySelector('strong').textContent='Der Spieltisch konnte nicht geladen werden.';$('loadStatus').querySelector('span').textContent='Bitte die Seite neu laden.';console.error(error);$('gameAccountError').hidden=false;$('gameAccountErrorText').textContent=error.message;}
clockInterval=setInterval(()=>{renderClock();expireTurn();},250);
document.addEventListener('visibilitychange',()=>{renderClock();expireTurn();});
window.addEventListener('pagehide',e=>{if(!e.persisted){epoch++;startDialog.cancel();ceremony.dispose();document.removeEventListener('pointerdown',unlockSound,true);document.removeEventListener('keydown',unlockSound,true);clearInterval(clockInterval);clearTimeout(messageTimer);audio.dispose();view?.dispose();}});
