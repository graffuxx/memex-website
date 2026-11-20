import {CATALOG,CELLS,ELEMENTS,LAYOUTS,newGame,loadGame,cardOf,preview,placeCard,shiftBlock,moveTargets,scores,eventPhase,fieldAt,sideValue} from './rules.mjs';
import {hex,cardSVG} from './art.mjs';
import {createArena3D} from './arena-3d.mjs?v=living-arenas-2';
import {ARENA_THEMES} from './arena-world.mjs?v=living-arenas-2';
const $=id=>document.getElementById(id),names=['Kobalt','Rost'],colors=['#74d7ef','#fa997d'],storageKey='duelverse-prototype-v1';
// A previously cached page shell may load this entrypoint after publication.
// Upgrade that shell before binding controls, without touching the saved match.
if(!$('arenaName'))document.querySelector('.arena-title h1').id='arenaName';
if(!$('arenaTheme')){const b=document.createElement('button');b.id='arenaTheme';b.className='badge';document.querySelector('.arena-views').prepend(b);}
if(!$('motionToggle')){const b=document.createElement('button');b.id='motionToggle';b.className='arena-motion';document.querySelector('.board-wrap').append(b);}
const stylesheet=document.querySelector('link[rel="stylesheet"]');
if(!stylesheet.href.includes('v=living-arenas-2'))stylesheet.href='./style.css?v=living-arenas-2';
let game;try{game=loadGame(localStorage.getItem(storageKey));}catch{game=newGame({seed:20261116});}
let selected=null,inspected=null,target=null,rotation=0,shifting=false,busy=false,pendingLayout=game.layout,pendingStarter=1-game.starter,toastTimer;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(storageKey,JSON.stringify(game));}catch{$('seedLabel').textContent='Speicherung nicht verfügbar';}}
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2400);}
function plan(){if(!selected||!target||shifting)return null;try{return preview(game,{uid:selected,cell:target,rotation});}catch{return null;}}
let arena3D=null,arenaTheme='grove',arenaMotion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
try{const v=JSON.parse(localStorage.getItem('duelverse-arena-preferences'));if(ARENA_THEMES[v?.theme])arenaTheme=v.theme;if(typeof v?.motion==='boolean')arenaMotion=v.motion;}catch{}
function arenaPreferences(){
 if(!arena3D){$('arenaTheme').disabled=$('motionToggle').disabled=true;$('arenaName').textContent='Die Resonanzkammer · 2D';return;}
 const p=ARENA_THEMES[arenaTheme];$('arenaName').textContent=p.name;$('arenaTheme').textContent='◉ '+p.short;$('arenaTheme').setAttribute('aria-label','Arena wechseln · aktuell '+p.name);$('motionToggle').textContent=arenaMotion?'✧ Bewegung an':'✧ Bewegung aus';$('motionToggle').setAttribute('aria-pressed',String(arenaMotion));
 arena3D?.setTheme(arenaTheme);arena3D?.setMotion(arenaMotion);
 try{localStorage.setItem('duelverse-arena-preferences',JSON.stringify({theme:arenaTheme,motion:arenaMotion}));}catch{}
}
const point=c=>({x:310+Math.sqrt(3)*53*(c.q+c.r/2),y:250+79.5*c.r});
function svgFor(card,stats=true){return `<svg class="portrait-main" viewBox="-62 -62 124 124" aria-hidden="true">${cardSVG(card,{stats})}</svg>`;}
function renderBoard(){
 const p=plan(),targets=shifting?moveTargets(game):[],last=game.last;
 if(arena3D){arena3D.update(game,{target,targets,plan:p,animate:busy});return;}
 const defs=`<defs><radialGradient id="floorGlow"><stop stop-color="#80709f" stop-opacity=".18"/><stop offset="1" stop-color="#746080" stop-opacity="0"/></radialGradient><linearGradient id="tileShade" x2=".8" y2="1"><stop stop-color="#29283d"/><stop offset="1" stop-color="#191b2c"/></linearGradient><linearGradient id="stoneShade" x2=".6" y2="1"><stop stop-color="#837482"/><stop offset=".4" stop-color="#483e55"/><stop offset="1" stop-color="#232135"/></linearGradient><filter id="blockShadow" x="-.5" y="-.5" width="2" height="2"><feDropShadow dx="0" dy="8" stdDeviation="5" flood-opacity=".6"/></filter></defs>`;
 const floor=`<ellipse cx="310" cy="265" rx="260" ry="225" fill="url(#floorGlow)"/><g fill="none" stroke="#96809a" stroke-opacity=".12"><circle cx="310" cy="250" r="235"/><circle cx="310" cy="250" r="220" stroke-dasharray="2 12"/><path d="M30 250h560M310 8v484"/><polygon points="${hex(310,250,242)}"/></g><g fill="#dbc393" opacity=".35" font-family="Barlow Condensed,system-ui" font-size="10"><text x="310" y="9" text-anchor="middle">M E M E X</text><text x="310" y="496" text-anchor="middle">D U E L V E R S E</text></g>`;
 $('board').innerHTML=defs+floor+CELLS.map(c=>{
  const {x,y}=point(c),held=game.board[c.id],blocked=c.id===game.block,field=fieldAt(game,c.id),flipping=busy&&last?.type==='place'&&last.flips.includes(c.id),placed=busy&&last?.type==='place'&&last.cell===c.id;
  const label=blocked?'Blockade':held?`${cardOf(held).name}, ${names[held.controller]}`:`Freies Feld ${c.id}`;
  const fieldLabel=field?`, ${ELEMENTS[field.element].name}-Feld plus ${field.bonus}`:'';
  const fieldArt=field?`<polygon points="${hex(0,0,52)}" fill="${ELEMENTS[field.element].color}10" stroke="${ELEMENTS[field.element].color}88" stroke-width="2"/><text y="0" text-anchor="middle" font-size="29" fill="${ELEMENTS[field.element].color}" opacity=".45">${ELEMENTS[field.element].symbol}</text><text y="19" text-anchor="middle" font-family="Barlow,system-ui" font-size="9" fill="${ELEMENTS[field.element].color}">+${field.bonus} ${ELEMENTS[field.element].name.toUpperCase()}</text>`:'';
  const stone=blocked?`<g class="board-stone"><polygon points="-30,11 -23,-24 0,-34 29,-19 34,12 6,29" fill="#221c2e" stroke="#b99d83" stroke-width="1.5"/><path d="m-30 11 7-35 22 4L6 29Z" fill="url(#stoneShade)"/><path d="m-1-20 30 1 5 31L6 29Z" fill="#494050"/><path d="m-23-24 23-10 29 15-30-1Z" fill="#8e7d8c"/><path d="m0-18-6 8 12 8-4 14m16-29-3 8 12 7" fill="none" stroke="#c9b290" stroke-width="1.5"/><path d="m-16 7 8 6 6-8" stroke="#b198dd" stroke-width="2" fill="none"/><text y="35" text-anchor="middle" font-size="6.5" letter-spacing=".5" fill="#cfb9a1">BLOCKADE</text></g>`:'';
  const marker=p?.flips.includes(c.id)?`<polygon points="${hex(0,0,56)}" fill="${colors[game.turn]}22" stroke="${colors[game.turn]}" stroke-width="2" stroke-dasharray="5 3"/><text x="0" y="-58" text-anchor="middle" fill="#acedd4" font-family="Barlow,system-ui" font-size="10">ÜBERNAHME</text>`:'';
  const ghost=p&&c.id===target?`<g class="ghost">${cardSVG(p.card,{owner:game.turn})}</g>`:'';
  const occupiedField=field&&held?`<circle cy="-43" r="8" fill="#181624" stroke="${ELEMENTS[field.element].color}"/><text y="-42" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="${ELEMENTS[field.element].color}">${ELEMENTS[field.element].symbol}</text>`:'';
  return `<g class="cell ${target===c.id?'selected':''} ${targets.includes(c.id)?'possible':''}" role="button" tabindex="0" data-cell="${c.id}" aria-label="${esc(label+fieldLabel)}" transform="translate(${x} ${y})"><title>${esc(label+fieldLabel)}</title><polygon points="${hex(0,4,54)}" fill="#080e1e" stroke="#72617c22"/><polygon class="empty-cell" points="${hex(0,0,52)}" fill="url(#tileShade)" stroke="#9a82ac3b" stroke-width="1.2"/>${fieldArt}${!held&&!blocked&&!field?'<circle r="2" fill="#8d799252"/>':''}${held?`<g class="${flipping?'flipping':placed?'placed':''}">${cardSVG(held,{owner:held.controller})}</g>`:''}${occupiedField}${stone}${ghost}${marker}</g>`;
 }).join('');
}
function render(){
 const s=scores(game),p=game.players[game.turn],current=p.hand.find(c=>c.uid===selected),card=current?{...current,rotation}:inspected;
 for(const side of [0,1]){$('score'+side).textContent=s[side];$('stock'+side).textContent=game.players[side].hand.length+' Hand · '+game.players[side].deck.length+' Deck';$('player'+side).classList.toggle('active',!game.finished&&side===game.turn);}
 $('turnLabel').textContent=game.finished?game.winner===null?'Unentschieden':names[game.winner]+' gewinnt':names[game.turn]+' ist am Zug';$('turnLabel').style.color=game.finished?'#dfc48a':colors[game.turn];$('turnCount').textContent=game.placements+' / 18 Karten platziert';$('layoutName').textContent=LAYOUTS.find(l=>l.id===game.layout).name;
 $('handTitle').textContent=names[game.turn].toUpperCase()+' · HAND';$('handCount').textContent=p.hand.length+' / 5';$('deckCount').textContent=p.deck.length+' Karten im Nachziehstapel';$('seedLabel').textContent='SPIELTEST 01 · '+game.seed;
 $('cards').innerHTML=p.hand.map((c,i)=>`<button class="handcard ${selected===c.uid?'selected':''}" data-card="${c.uid}" ${busy||game.finished?'disabled':''} aria-label="${esc(cardOf(c).name+' wählen')}" aria-pressed="${selected===c.uid}"><svg viewBox="-62 -62 124 124" aria-hidden="true">${cardSVG({...c,rotation:0},{stats:false})}</svg><span class="card-copy"><strong>${esc(cardOf(c).name)}</strong><small style="color:${ELEMENTS[cardOf(c).element].color}">${ELEMENTS[cardOf(c).element].symbol} ${ELEMENTS[cardOf(c).element].name} · 24 Punkte</small></span><span class="index">${i+1}</span></button>`).join('');
 $('inspector').innerHTML=card?`${svgFor(card)}<h2 class="inspect-title">${esc(cardOf(card).name)}</h2><div class="inspect-sub" style="color:${ELEMENTS[cardOf(card).element].color}">${ELEMENTS[cardOf(card).element].symbol} ${ELEMENTS[cardOf(card).element].name.toUpperCase()}${card.controller!==undefined?' · '+names[card.controller].toUpperCase():''}</div><div class="side-values" aria-label="Seitenwerte">${["→","↘","↙","←","↖","↗"].map((arrow,d)=>`<span><small>${arrow}</small><b>${sideValue(card,d)}</b></span>`).join("")}</div><p class="inspect-quote">„${esc(cardOf(card).quote)}“</p>`:'<div class="empty-inspect"><span>✧</span><strong>Dein nächster Zug.</strong><p>Wähle rechts eine Karte.<br>Oder eine Karte auf dem Brett, um ihre Werte anzusehen.</p></div>';
 $('rotateLeft').disabled=$('rotateRight').disabled=!selected||busy||game.finished;$('rotationLabel').textContent=selected?rotation*60+'° · R dreht':'Ausrichtung';
 const pl=plan();$('selectionHelp').textContent=game.finished?'Runde beendet. Fordere eine Revanche.':shifting?'Wähle ein markiertes Nachbarfeld für die Blockade.':selected?'Wähle ein freies Feld. Noch wird nichts ausgespielt.':inspected?'Die Zahlen zeigen die Stärke auf jeder Seite.':'Karte wählen → Feld wählen → bestätigen.';
 $('planReadout').innerHTML=pl?`<strong>${pl.flips.length} ${pl.flips.length===1?'Übernahme':'Übernahmen'}</strong>${pl.comparisons.map(c=>`<div class="compare ${c.flip?'win':''}"><span>${esc(c.name)}</span><span>${c.attack.total} ${c.attack.total===c.defend.total?'=':c.attack.total>c.defend.total?'>':'<'} ${c.defend.total}${c.attack.total===c.defend.total&&c.flip?' · Element':''}</span></div>`).join('')}`:shifting&&target?'<strong>Verschieben · Karten-Zug bleibt frei</strong>':'';
 $('confirm').disabled=busy||game.finished||!(pl||shifting&&target&&moveTargets(game).includes(target));$('confirm').textContent=shifting?'Blockade verschieben':'Platzierung bestätigen';$('cancel').disabled=busy||!selected&&!inspected&&!shifting;$('shift').disabled=busy||game.finished||!p.shifts||!moveTargets(game).length;$('shift').classList.toggle('active',shifting);$('shiftCount').textContent=p.shifts;
 const phase=eventPhase(game);$('eventTitle').textContent=phase===0?'Angekündigt: Resonanzschub':phase===1?'Resonanzschub aktiv · Polwechsel folgt':'Polwechsel aktiv';$('eventDetail').textContent=phase===0?'Nach Karte 6: passende Felder geben +2.':phase===1?'Aktuell +2. Nach Karte 12: Elemente tauschen, Bonus +1.':'Sturm und Flut haben getauscht · passende Karten +1.';$('eventCountdown').textContent=phase<2?(phase===0?6:12)-game.placements:'↔';
 const last=game.last;$('lastAction').textContent=!last?'Das Brett wartet auf schlechte Entscheidungen.':last.type==='shift'?names[last.side]+' hat die Blockade verschoben.':names[last.side]+' spielte '+last.name+' · '+last.flips.length+(last.flips.length===1?' Übernahme.':' Übernahmen.');
 renderBoard();
}
function clearSelection(){selected=null;inspected=null;target=null;rotation=0;shifting=false;}
function chooseCell(cell){if(busy||game.finished)return;if(shifting){if(cell===game.block){toast('Wähle ein markiertes freies Nachbarfeld.');return;}if(!moveTargets(game).includes(cell)){toast('Dieses Feld ist für die Blockade nicht erreichbar.');return;}target=cell;render();return;}
 if(game.board[cell]){clearSelection();inspected=game.board[cell];render();return;}
 if(cell===game.block){toast('Die Blockade sperrt dieses Feld. Du kannst sie mit „Blockade verschieben“ bewegen.');return;}
 if(!selected){toast('Wähle zuerst rechts eine Handkarte.');return;}target=cell;render();
}
function result(){const s=scores(game);$('resultTitle').textContent=game.winner===null?'Gleichstand. Keine Ausreden.':names[game.winner]+' kontrolliert die Kammer.';$('resultScores').innerHTML=`<div class="result-score"><span>${s[0]}<small>KOBALT</small></span><em>:</em><span>${s[1]}<small>ROST</small></span></div>`;$('resultText').textContent='Erfolgreiche Flips: Kobalt '+game.players[0].flips+' · Rost '+game.players[1].flips+'.';if(!$('resultDialog').open)$('resultDialog').showModal();}
function commit(){if(busy)return;try{if(shifting){game=shiftBlock(game,target);clearSelection();save();render();toast('Blockade verschoben. Wähle jetzt deine Karte.');return;}
 if(!plan())return;game=placeCard(game,{uid:selected,cell:target,rotation});clearSelection();busy=true;save();render();
 if(game.last.event!==null){$('arenaNotice').textContent=game.last.event===1?'RESONANZSCHUB · Felder jetzt +2':'POLWECHSEL · Sturm ↔ Flut';$('arenaNotice').classList.remove('show');requestAnimationFrame(()=>$('arenaNotice').classList.add('show'));}
 setTimeout(()=>{busy=false;render();if(game.finished)result();},600);
 }catch(e){toast(e.message);}}
function rotate(step){if(!selected||busy)return;rotation=(rotation+step+6)%6;render();}
function start({seed=crypto.getRandomValues(new Uint32Array(1))[0],layout=pendingLayout,starter=pendingStarter}={}){game=newGame({seed,layout,starter});busy=false;clearSelection();for(const d of document.querySelectorAll('dialog[open]'))d.close();save();render();toast(names[game.turn]+' beginnt. Beide Teams haben denselben Kartensatz.');}
function setup(){pendingLayout=game.layout;pendingStarter=1-game.starter;renderChoices();$('setupDialog').showModal();}
function renderChoices(){$('layoutChoices').innerHTML=LAYOUTS.map(l=>`<button data-layout="${l.id}" class="${l.id===pendingLayout?'selected':''}" aria-pressed="${l.id===pendingLayout}">${l.name}</button>`).join('');for(const b of $('starterChoices').children){b.classList.toggle('selected',Number(b.dataset.starter)===pendingStarter);b.setAttribute('aria-pressed',String(Number(b.dataset.starter)===pendingStarter));}}
function activateBoard(event){const node=event.target.closest('[data-cell]');if(node)chooseCell(node.dataset.cell);}
function selectCard(uid){if(busy||game.finished)return;clearSelection();selected=uid;render();}
function cancel(){if(busy)return;clearSelection();render();}
function key(e){if(document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;if(e.code==='Escape'){e.preventDefault();cancel();}else if(e.code==='KeyR'){e.preventDefault();rotate(e.shiftKey?-1:1);}else if(e.code==='Enter'&&target){e.preventDefault();commit();}else if(/^Digit[1-5]$/.test(e.code)){const c=game.players[game.turn].hand[Number(e.code.slice(-1))-1];if(c)selectCard(c.uid);}}
document.addEventListener('keydown',key);$('board').addEventListener('click',activateBoard);$('board').addEventListener('keydown',e=>{if(e.code==='Enter'||e.code==='Space'){e.preventDefault();e.stopPropagation();activateBoard(e);}});
 $('cards').addEventListener('click',e=>{const b=e.target.closest('[data-card]');if(b)selectCard(b.dataset.card);});$('confirm').onclick=commit;$('cancel').onclick=cancel;$('rotateLeft').onclick=()=>rotate(-1);$('rotateRight').onclick=()=>rotate(1);
 $('shift').onclick=()=>{if(!moveTargets(game).length||busy)return;clearSelection();shifting=true;render();};$('rulesButton').onclick=()=>$('rulesDialog').showModal();$('closeRules').onclick=()=>$('rulesDialog').close();$('newButton').onclick=setup;$('dismissSetup').onclick=()=>$('setupDialog').close();$('startGame').onclick=()=>start();
 $('layoutChoices').onclick=e=>{const b=e.target.closest('[data-layout]');if(b){pendingLayout=b.dataset.layout;renderChoices();}};$('starterChoices').onclick=e=>{const b=e.target.closest('[data-starter]');if(b){pendingStarter=Number(b.dataset.starter);renderChoices();}};$('viewBoard').onclick=()=>$('resultDialog').close();$('rematch').onclick=()=>start({seed:game.seed,layout:game.layout,starter:1-game.starter});
 try{arena3D=createArena3D($('board'),{onViewChange:top=>{$('viewToggle').textContent=top?'3D-Ansicht':'Draufsicht';$('viewToggle').setAttribute('aria-pressed',String(top));}});$('viewToggle').onclick=()=>arena3D.toggleView();}catch(error){console.warn('3D-Ansicht nicht verfügbar. 2D bleibt spielbar.',error);$('viewToggle').textContent='2D-Ansicht';$('viewToggle').disabled=true;}
 $('arenaTheme').onclick=()=>{arenaTheme=arenaTheme==='grove'?'rift':'grove';arenaPreferences();};$('motionToggle').onclick=()=>{arenaMotion=!arenaMotion;arenaPreferences();};arenaPreferences();
 save();render();
