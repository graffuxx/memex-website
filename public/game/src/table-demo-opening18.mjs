import {readPlayDeck,applyPortalDecks,defaultPlayDeck} from '../platform/deck-bridge.mjs';
import {bindStartDuelDialog} from './start-duel-dialog18.mjs';
import {roundStarter} from './start-duel18.mjs';
import {withDemoFinishes,rarityOf} from './card-rarities15.mjs?v=opening-brand-18';
import {createTurnClock,timeoutAction} from './turn-clock.mjs?v=turn-clock-12';
import {freshMatchSeed} from './tactics-layout.mjs?v=random-layout-1';
import {createVoidAtmosphere} from './void-atmosphere.mjs?v=void-painted-2';
import {createTableAudio} from './table-audio.mjs?v=balance-2';
import {createTableView} from './table-demo-view-hand17.mjs?v=home-rift-25b';
import {createTableDemo,createTacticsMatch,demoAction,drawnCard,DEMO_PROFILES} from './table-demo-state.mjs?v=random-layout-1';
import {scores,ELEMENTS,shiftBlock,moveTargets,sideValue} from './rules.mjs';
import {previewEffect,placeEffect,ABILITIES,LOADOUTS,DIRECTION_NAMES,eventFields,eventFieldAt,nextEvent,fieldText,abilityAt,twistTargets,guardActive} from './table-demo-rules.mjs?v=random-layout-1';
import {CARD_PROFILES} from './card-prototype.mjs?v=classics-v04';
let portalDeck;try{portalDeck=readPlayDeck(localStorage)??defaultPlayDeck();}catch{portalDeck=defaultPlayDeck();}
const $=id=>document.getElementById(id),stage=$('stage'),svg=$('interaction');
let game=createTableDemo(),view,selected=null,target=null,rotation=0,abilityDirection=0,twistCell=null,hover=null,inspect=null,mode='card',busy=true,phase='loading',epoch=0,drag=null,notice='',round=1,roundResults=[],matchSeed=null,firstStarter=null;
const startDialog=bindStartDuelDialog($('startDuel'));
const atmosphere=createVoidAtmosphere();
const audio=createTableAudio({onState:({enabled,available,running})=>{$('soundEnabled').checked=enabled;$('soundStatus').textContent=!available?'Ton hier nicht verfügbar':enabled&&running?'Sounds aktiv':'Stumm';}});
let messageTimer;
const turnClock=createTurnClock();let clockInterval;
function renderClock(){
 const state=turnClock.snapshot(),timer=$('turnTimer');
 timer.hidden=!view||phase==='opening';timer.dataset.state=game.finished?'ended':game.turn===1?'opponent':state.seconds<=5?'critical':state.seconds<=15?'warning':'normal';
 $('timerLabel').textContent=game.finished?'RUNDE BEENDET':game.turn===1?'GEGNERZUG':busy&&state.seconds>0?'ZUGZEIT · PAUSE':state.expired?'ZEIT ABGELAUFEN':'ZUGZEIT';
 $('timerValue').textContent=game.finished||game.turn===1?'—':Math.floor(state.seconds/60)+':'+String(state.seconds%60).padStart(2,'0');
 $('timerFill').style.transform='scaleX('+state.fraction+')';
 timer.setAttribute('aria-label',game.finished?'Runde beendet':game.turn===1?'Gegner ist am Zug':'Verbleibende Zugzeit: '+state.seconds+' Sekunden');
}
function syncClock(){
 turnClock.enter(epoch+':'+game.placements+':'+game.turn);
 if(view&&!game.finished&&game.turn===0&&!busy)turnClock.resume();else turnClock.pause();
 renderClock();
}
function expireTurn(){
 if(busy||game.finished||game.turn!==0||!turnClock.snapshot().expired)return false;
 const automatic=timeoutAction(game);if(!automatic)return false;
 cancelSelection();announce('Zeit abgelaufen · automatische Platzierung');cycle(automatic,false,true);return true;
}
function announce(text){clearTimeout(messageTimer);$('arenaMessage').textContent=text;$('arenaMessage').classList.remove('active');void $('arenaMessage').offsetWidth;$('arenaMessage').classList.add('active');messageTimer=setTimeout(()=>$('arenaMessage').classList.remove('active'),1700);}
const isMatch=()=>$('sceneMode').value==='match';
const profile=c=>CARD_PROFILES[DEMO_PROFILES[c.id]],name=c=>profile(c).name;
function selectedCard(){return game.players[0].hand.find(c=>c.uid===selected);}
function action(){return {uid:selected,cell:target,rotation,abilityDirection,twistCell};}
function plan(){if(mode!=='card'||!selected||!target||game.turn!==0)return null;try{return previewEffect(game,action());}catch{return null;}}
function detailStrength(s){return `${s.total} (Basis ${s.base}${s.field?' + Feld '+s.field:''}${s.element?' + Element '+s.element:''}${s.ability?' + Fähigkeit '+s.ability:''})`;}
function render(){
 const s=scores(game),p=plan(),card=selectedCard(),shiftValid=mode==='shift'&&moveTargets(game).includes(target);
 for(const side of [0,1]){$('score'+side).textContent=s[side];$('stock'+side).textContent=game.players[side].hand.length+' Hand · '+game.players[side].deck.length+' Deck';}
 $('handCount').textContent=game.players[0].hand.length+' / 5';$('enemyHandCount').textContent=game.players[1].hand.length;$('ownDeckCount').textContent=game.players[0].deck.length+(game.players[0].deck.length===1?' Karte':' Karten');$('enemyDeckCount').textContent=game.players[1].deck.length+' Karten';
 $('turnCount').textContent=game.placements+' / 18 Karten gelegt';$('turnLabel').textContent=game.finished?'Demo beendet':busy?phase==='opponent'?'Gegner ist am Zug':phase==='dealing'?'Karten werden ausgeteilt':phase==='opening'?'Startduell läuft':'Karten in Bewegung':'Du bist am Zug';
 $('confirm').disabled=busy||!(p||shiftValid)||game.finished;$('confirm').textContent=mode==='shift'?'Verschieben':'Ausspielen';$('cancel').disabled=busy||(!selected&&mode!=='shift'&&!inspect);$('autoDemo').disabled=busy||game.finished;$('resetDemo').disabled=!view||phase==='opening';$('newDuel').disabled=busy;$('openingBadge').textContent=phase==='opening'?'Startduell':isMatch()?'Runde '+round+' / 2':'Training';$('firstMove').textContent=phase==='opening'?'Startrecht wird ausgespielt':isMatch()?'Erster Zug: '+(game.starter===0?'Du':'Gegner'):'';$('shiftBlock').disabled=busy||!moveTargets(game).length||game.finished;$('shiftBlock').classList.toggle('active',mode==='shift');$('shiftBlock').textContent='◆ Blockade · '+game.players[0].shifts+'/1';$('loadout').disabled=busy;$('opponentLoadout').disabled=busy||!isMatch();$('sceneMode').disabled=busy;
 $('seriesStatus').hidden=!isMatch();const aggregate=roundResults.reduce((s,r)=>[s[0]+r[0],s[1]+r[1]],[0,0]);$('seriesStatus').textContent=`Doppelduell · Runde ${round}/2 · Gesamt ${aggregate[0]} : ${aggregate[1]}`;
 $('nextRound').hidden=!isMatch()||!game.finished;$('nextRound').textContent=round===1?'Rückspiel · '+(roundStarter(firstStarter??0,2)===0?'Du beginnst':'Gegner beginnt'):'Neues Doppelduell';$('resetDemo').textContent=isMatch()?'Neues Doppelduell':'Neu austeilen';
 const fields=eventFields(game);$('fieldLegend').replaceChildren(...fields.map(f=>{const el=document.createElement('span');el.style.setProperty('--field',({resonance:'#ba93ff',crossfire:'#ffbe62',silence:'#e1a6d5'})[f.type]);el.textContent=fieldText(f);return el;}));
 const next=nextEvent(game);$('eventShort').textContent=next?'Wechsel in '+next.remaining+' Zügen':'Letzte Phase';$('eventCountdown').textContent=next?'Danach: '+next.fields.map(f=>fieldText(f)).join(' / '):'Keine weiteren Feldwechsel';
 $('abilityOptions').hidden=!card||!card.ability||mode==='shift';const a=card?.ability,muted=card&&target&&eventFieldAt(game,target)?.type==='silence';
 $('abilityLabel').textContent=a?ABILITIES[a].name+(muted?' · im Funkloch deaktiviert':''):'';$('abilityHint').textContent=a?ABILITIES[a].description:'';
 $('directionLabel').hidden=!['hype','guard'].includes(a);$('abilityDirection').value=String(abilityDirection);$('abilityDirection').disabled=busy||Boolean(muted);
 $('twistLabel').hidden=a!=='twist';const options=[{cell:'',label:'Keine Karte drehen'},...(target?twistTargets(game,target).map(cell=>({cell,label:name(game.board[cell])+' · '+cell})):[])];
 $('twistTarget').replaceChildren(...options.map(o=>{const el=document.createElement('option');el.value=o.cell;el.textContent=o.label;return el;}));$('twistTarget').value=twistCell??'';$('twistTarget').disabled=busy||!target||Boolean(muted);
 if(game.finished){const final=isMatch()&&round===2,result=final?aggregate:s;$('statusTitle').textContent=(final?'Doppelduell: ':'Runde: ')+(result[0]===result[1]?'Unentschieden':result[0]>result[1]?'Du gewinnst':'Der Gegner gewinnt')+` ${result[0]} : ${result[1]}.`;$('statusDetail').textContent=isMatch()&&round===1?'Im Rückspiel beginnt '+(roundStarter(firstStarter??0,2)===0?'dein Team':'der Gegner')+'. Gleiche Decks und Kartenreihenfolge.':'Es zählt der Besitz am Ende, im Doppelduell die Summe beider Runden.';}
 else if(busy){$('statusTitle').textContent=notice||'Die Karten sind in Bewegung.';$('statusDetail').textContent=phase==='opening'?'Erst das Startrecht klären, dann die Karten austeilen.':phase==='dealing'?'Fünf Karten wandern vom Stapel in deine Hand.':phase==='opponent'?'Der Demo-Gegner nutzt dieselben Feld- und Fähigkeitsregeln.':'Fähigkeit → Vergleiche → Übernehmen → Nachziehen.';}
 else if(mode==='shift'){$('statusTitle').textContent='Blockade verschieben';$('statusDetail').textContent=shiftValid?'Mit Verschieben bestätigen. Dein Karten-Zug bleibt erhalten.':'Ein markiertes freies Nachbarfeld wählen. Einmal pro Partie.';}
 else if(card){$('statusTitle').textContent=name(card)+' · '+ELEMENTS[profile(card).element].name;$('statusDetail').textContent=p?`${p.flips.length} Übernahme${p.flips.length===1?'':'n'}${p.suppressed?' · Fähigkeit deaktiviert':p.transforms.length?' · Drehziel bleibt diesen Zug geschützt':''}. Mit Ausspielen bestätigen.`:'Auf ein freies Feld ziehen und loslassen – oder Feld wählen und Ausspielen.';}
 else if(inspect&&game.board[inspect]){const c=game.board[inspect];$('statusTitle').textContent=name(c)+' · '+(c.controller===0?'DEINE KARTE':'GEGNER');$('statusDetail').textContent=(c.ability?ABILITIES[c.ability].name+(eventFieldAt(game,inspect)?.type==='silence'?' · deaktiviert':guardActive(game,c,inspect)?' · Schutz aktiv bis zu deinem nächsten Karten-Zug':' · bereits ausgespielt'):'Ohne Spezialfähigkeit')+' · '+fieldText(eventFieldAt(game,inspect));}
 else{$('statusTitle').textContent='Karte wählen oder aufs Feld ziehen.';$('statusDetail').textContent='';}
 const described=card??(inspect?game.board[inspect]:null)??game.players[0].hand.find(c=>c.uid===hover);$('rarityInfo').hidden=!described;if(described){const r=rarityOf(described);$('rarityInfo').style.setProperty('--rarity-color',r.color);$('rarityName').textContent=r.mark+' · '+r.label;$('rarityFinish').textContent=r.finish;}
 $('controls').dataset.context=busy||card||inspect||mode==='shift'||game.finished?'active':'idle';
 $('previewText').textContent=p?p.comparisons.map(c=>name(game.board[c.cell])+': '+detailStrength(c.attack)+(c.setup?' → nur gedreht · ':c.flip?' > ':c.attack.total===c.defend.total?' = ':' < ')+detailStrength(c.defend)).join(' · '):inspect&&game.board[inspect]?'Basiswerte O / SO / SW / W / NW / NO: '+DIRECTION_NAMES.map((_,d)=>sideValue(game.board[inspect],d)).join(' / '):'';
 syncClock();
 view?.update(game,{selected,target,hover,busy,plan:p,mode,twistCell,inspect,abilityDirection});
}
function clear(){selected=null;target=null;rotation=0;abilityDirection=0;twistCell=null;hover=null;inspect=null;mode='card';}
function choose(uid){if(expireTurn()||busy||game.finished)return;if(selected!==uid){clear();selected=uid;view.setRotation(uid,0);audio.play('select');}render();}
function chooseField(cell){if(expireTurn()||busy||game.finished)return;if(mode==='shift'){target=moveTargets(game).includes(cell)?cell:null;render();return;}
 if(game.board[cell]){if(selectedCard()?.ability==='twist'&&target&&abilityAt(game,selectedCard(),target)==='twist'&&twistTargets(game,target).includes(cell)){twistCell=twistCell===cell?null:cell;}else if(!selected){inspect=cell;}else{target=null;twistCell=null;}render();return;}
 if(!selected)return;target=game.block===cell?null:cell;twistCell=null;inspect=null;render();}
function cancelSelection(){if(busy)return;if(drag){const d=drag;drag=null;d.node.classList.remove('dragging');try{d.node.releasePointerCapture(d.id);}catch{}view.release(d.uid);}if(selected||mode==='shift')audio.play('cancel');if(selected){view.release(selected);view.setRotation(selected,0);}clear();render();}
async function playAction(a,token){
 const side=game.turn,before=game,resolution=previewEffect(game,a),next=placeEffect(game,a),draw=drawnCard(before,next,side),played=before.players[side].hand.find(c=>c.uid===a.uid);
 phase=side===1?'opponent':'placing';notice=name(played)+' wird ausgespielt'+(played.ability?' · '+ABILITIES[played.ability].name:'')+'.';view.setRotation(a.uid,a.rotation);render();
 if(!await view.place(a.uid,a.cell)||token!==epoch)return false;audio.play('place');
 if(draw){view.hide(draw.uid);view.hold(draw.uid);}game=next;if(isMatch()&&game.finished)roundResults[round-1]=scores(game);clear();render();
 if(next.last.transforms.length){notice='Think Again · Ziel vorbereitet, keine Übernahme dieses Zugs.';announce('↻ Think Again · Gegenzug bleibt möglich');audio.play('twist');render();for(const t of next.last.transforms)if(!await view.turnCard(t.uid,t.from,t.to)||token!==epoch)return false;}
 if(next.last.ability==='guard'&&!next.last.suppressed){audio.play('guard');announce('Schutz · gewählte Seite +2');}
 const blocked=resolution.comparisons.filter(c=>!c.setup&&c.defend.ability>0&&c.attack.total>c.defend.total-c.defend.ability&&c.attack.total<=c.defend.total).map(c=>c.cell);if(blocked.length){audio.play('guard');announce('Abgewehrt · Schutz hält');if(!await view.shieldBlock(blocked)||token!==epoch)return false;}
 view.react(next.last);
 if(next.last.flips.length){audio.play('capture',{side,count:next.last.flips.length});announce((side===0?'Deine Übernahme':'Gegner übernimmt')+' · '+next.last.flips.length);notice=next.last.flips.length+(next.last.flips.length===1?' Karte wechselt':' Karten wechseln')+' die Seite.';render();await Promise.all(next.last.flips.map(cell=>view.flip(next.board[cell].uid,side)));if(token!==epoch)return false;}
 if(draw){audio.play('draw');notice=(side===0?'Du ziehst':'Der Gegner zieht')+' eine Karte nach.';phase=side===1?'opponent':'drawing';render();if(!await view.draw(draw.uid,side)||token!==epoch)return false;}
 if(next.last.event!==null){view.eventChange();announce('Feldwechsel · neue Resonanz');audio.play('event');}
 if(game.finished){const s=isMatch()&&round===2?roundResults.reduce((a,b)=>[a[0]+b[0],a[1]+b[1]],[0,0]):scores(game);audio.play(s[0]===s[1]?'event':s[0]>s[1]?'win':'loss');announce((isMatch()&&round===2?'Doppelduell':'Runde')+' beendet · '+s[0]+' : '+s[1]);}
 return true;
}
async function cycle(a,showPreview=false,fromTimeout=false){if(!fromTimeout&&expireTurn())return;if(busy||game.finished||!a)return;const token=epoch;busy=true;
 try{
  if(showPreview){selected=a.uid;target=a.cell;rotation=a.rotation;abilityDirection=a.abilityDirection;twistCell=a.twistCell;mode='card';view.setRotation(selected,rotation);notice='Vorschau: '+name(selectedCard())+' auf das markierte Feld.';phase='preview';render();if(!await view.animate(850,()=>{})||token!==epoch)return;}
  if(!await playAction(a,token))return;
  if(!game.finished&&game.turn===1){phase='opponent';notice='Der Gegner wählt seinen Demo-Zug.';render();if(!await view.animate(240,()=>{})||token!==epoch)return;const response=demoAction(game);if(response&&!await playAction(response,token))return;}
 }catch(error){notice=error.message;console.error(error);}finally{if(token===epoch){busy=false;phase='idle';clear();render();if(!game.finished)audio.play('turn',{side:game.turn});}}
}
async function confirm(){if(expireTurn()||busy)return;if(mode!=='shift'){if(plan())cycle(action());return;}if(!moveTargets(game).includes(target))return;
 const token=epoch,next=shiftBlock(game,target);busy=true;notice='Blockade wird verschoben.';audio.play('shift');render();const ok=await view.shift(target);if(ok&&token===epoch){game=next;busy=false;notice='';clear();render();}}
async function reset({preserveSeries=false}={}){
 if(!view)return;const token=++epoch;startDialog.cancel();
 if(drag){drag.node.classList.remove('dragging');try{drag.node.releasePointerCapture(drag.id);}catch{}drag=null;}
 view.cancel();audio.cancel();clearTimeout(messageTimer);$('arenaMessage').classList.remove('active');
 if(!preserveSeries){round=1;roundResults=[];matchSeed=freshMatchSeed(matchSeed);firstStarter=null;}
 busy=true;clear();phase=isMatch()&&!preserveSeries?'opening':'dealing';notice=phase==='opening'?'Spielt das Startrecht aus.':'Neue Karten werden ausgeteilt.';
 game=isMatch()?createTacticsMatch({loadouts:[$('loadout').value,$('opponentLoadout').value],seed:matchSeed,starter:roundStarter(firstStarter??0,round)}):createTableDemo($('loadout').value);
 if(isMatch())game=applyPortalDecks(game,portalDeck.cards,[$('loadout').value,$('opponentLoadout').value].map(id=>LOADOUTS[id]));
 game=withDemoFinishes(game);game.rotationLocked=true;view.initGame(game);
 if(phase==='opening'){
  for(const card of game.players[0].hand)view.hide(card.uid);render();
  $('startDuel').dataset.motion=$('motion').checked?'on':'off';const starter=await startDialog.open();if(token!==epoch||starter===null)return;
  firstStarter=starter;game.starter=game.turn=roundStarter(firstStarter,round);
 }
 phase='dealing';notice='Neue Karten werden ausgeteilt.';render();const ok=await view.deal();if(!ok||token!==epoch)return;
 if(game.turn===1){phase='opponent';notice=round===1?'Der Gegner hat den ersten Zug gewählt.':'Rückspiel: Der Gegner beginnt.';render();const response=demoAction(game);if(!await playAction(response,token)||token!==epoch)return;}
 busy=false;phase='idle';notice='';render();
}

function pointerCell(e){return document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-cell]')?.getAttribute('data-cell')??null;}
svg.addEventListener('pointerdown',e=>{const node=e.target.closest('[data-hand]');if(!node||busy||game.finished||e.button!==0)return;drag={uid:node.dataset.hand,node,id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};node.setPointerCapture(e.pointerId);});
svg.addEventListener('pointermove',e=>{if(drag&&e.pointerId===drag.id){if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8){choose(drag.uid);if(!drag||busy)return;drag.moved=true;drag.node.classList.add('dragging');}
 if(drag.moved){const r=stage.getBoundingClientRect();view.drag(drag.uid,e.clientX-r.left,e.clientY-r.top);const c=pointerCell(e);target=c&&!game.board[c]&&c!==game.block?c:null;twistCell=null;render();}return;}
 if(busy)return;const uid=e.target.closest('[data-hand]')?.dataset.hand??null;if(uid!==hover){hover=uid;render();}});
function stopDrag(e,cancelled=false){
 if(!drag||e.pointerId!==drag.id)return;
 const d=drag,cell=cancelled?null:pointerCell(e);drag=null;
 d.node.classList.remove('dragging');try{d.node.releasePointerCapture(e.pointerId);}catch{}
 if(!d.moved&&!cancelled){choose(d.uid);return;}
 if(cancelled){view.release(d.uid);cancelSelection();return;}
 target=cell&&!game.board[cell]&&cell!==game.block?cell:null;twistCell=null;
 if(target&&plan()){cycle(action());return;}
 // Invalid drops never reserve a tile, consume a card or start an opponent turn.
 view.release(d.uid);cancelSelection();
}
svg.addEventListener('pointerup',e=>stopDrag(e));svg.addEventListener('pointercancel',e=>stopDrag(e,true));svg.addEventListener('pointerleave',()=>{if(!drag&&!busy&&hover){hover=null;render();}});
svg.addEventListener('click',e=>{const c=e.target.closest('[data-cell]');if(c)chooseField(c.dataset.cell);});
svg.addEventListener('keydown',e=>{if(e.code!=='Enter'&&e.code!=='Space')return;const h=e.target.closest('[data-hand]'),c=e.target.closest('[data-cell]');if(h||c){e.preventDefault();e.stopPropagation();h?choose(h.dataset.hand):chooseField(c.dataset.cell);}});
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;if(e.code==='Escape'){e.preventDefault();cancelSelection();return;}if(['SELECT','INPUT'].includes(e.target.tagName))return;if(e.code==='Enter'&&e.target.tagName!=='BUTTON'&&(plan()||mode==='shift')&&!busy){e.preventDefault();confirm();}});
$('newDuel').onclick=()=>reset();$('showRules').onclick=()=>{const panel=$('rulesPanel');panel.open=!panel.open;if(panel.open)panel.scrollIntoView({block:'nearest',behavior:'smooth'});};
$('confirm').onclick=confirm;$('cancel').onclick=cancelSelection;$('autoDemo').onclick=()=>cycle(demoAction(game),true);$('resetDemo').onclick=reset;
$('shiftBlock').onclick=()=>{if(expireTurn()||busy)return;if(mode==='shift')cancelSelection();else{cancelSelection();mode='shift';render();}};
$('abilityDirection').onchange=()=>{abilityDirection=Number($('abilityDirection').value);render();};$('twistTarget').onchange=()=>{twistCell=$('twistTarget').value||null;render();};$('loadout').onchange=reset;$('opponentLoadout').onchange=reset;$('sceneMode').onchange=reset;
$('nextRound').onclick=()=>{if(busy||!game.finished)return;if(round===1){round=2;reset({preserveSeries:true});}else reset();};
for(const selector of ['loadout','opponentLoadout'])$(selector).replaceChildren(...Object.entries(LOADOUTS).map(([key,value])=>{const o=document.createElement('option');o.value=key;o.textContent=value.name;return o;}));
$('opponentLoadout').value='hype-twist';
$('abilityDirection').replaceChildren(...DIRECTION_NAMES.map((n,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=['→','↘','↙','←','↖','↗'][i]+' '+n;return o;}));
$('motion').checked=!matchMedia('(prefers-reduced-motion:reduce)').matches;atmosphere.setMotion($('motion').checked);$('motion').onchange=()=>{atmosphere.setMotion($('motion').checked);view?.setMotion($('motion').checked);stage.dataset.motion=$('motion').checked?'on':'off';};
$('arenaTheme').onchange=()=>{view?.setArena($('arenaTheme').value);audio.setArena($('arenaTheme').value);$('arenaName').textContent=({painted:'VOID-KLUFT · 2,5D',grove:'RESONANZHAIN',rift:'GLUTKLUFT',void:'VOID-SANKTUARIUM'})[$('arenaTheme').value];};
$('soundEnabled').onchange=async()=>{const ok=await audio.setEnabled($('soundEnabled').checked);if(ok)audio.play('select');};$('soundVolume').oninput=()=>audio.setVolume(Number($('soundVolume').value)/100);$('ambientEnabled').onchange=()=>audio.setAmbient($('ambientEnabled').checked);$('soundTest').onclick=async()=>{if(await audio.setEnabled(true))audio.test();};
try{view=await createTableView(stage,svg,{onResize:({own,opponent,height})=>{for(const [id,p,y] of [['ownDeckLabel',own,height-24],['enemyDeckLabel',opponent,82]]){$(id).style.left=p.x+'px';$(id).style.top=(p.labelY??y)+'px';}}});view.setMotion($('motion').checked);stage.dataset.motion=$('motion').checked?'on':'off';view.setArena($('arenaTheme').value);$('arenaName').textContent=({painted:'VOID-KLUFT · 2,5D',grove:'RESONANZHAIN',rift:'GLUTKLUFT',void:'VOID-SANKTUARIUM'})[$('arenaTheme').value];$('loadStatus').hidden=true;await reset();}catch(error){$('loadStatus').querySelector('strong').textContent='Der Spieltisch konnte nicht geladen werden.';$('loadStatus').querySelector('span').textContent='Bitte die Seite neu laden.';console.error(error);}
clockInterval=setInterval(()=>{renderClock();expireTurn();},250);
document.addEventListener('visibilitychange',()=>{renderClock();expireTurn();});
window.addEventListener('pagehide',e=>{if(!e.persisted){epoch++;startDialog.cancel();clearInterval(clockInterval);clearTimeout(messageTimer);audio.dispose();view?.dispose();}});
