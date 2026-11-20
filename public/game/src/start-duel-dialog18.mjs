import {createStartDuel,GESTURE_LABELS} from './start-duel18.mjs';
const paths={
 rock:'M18 33V23a5 5 0 0 1 10 0v-4a5 5 0 0 1 10 0v3a5 5 0 0 1 10 0v4a5 5 0 0 1 9 3v13c0 10-7 15-18 15H29c-5 0-9-3-11-7L9 36a5 5 0 0 1 8-6l6 6 M28 23v10 M38 22v10 M48 26v8 M24 46h22',
 paper:'M18 34V17a4 4 0 0 1 8 0v14-21a4 4 0 0 1 8 0v21-19a4 4 0 0 1 8 0v20-13a4 4 0 0 1 8 0v21c0 11-6 17-18 17h-3c-5 0-8-3-11-7L8 36a4 4 0 0 1 6-5l8 8',
 scissors:'M22 34 15 13a5 5 0 0 1 9-3l9 20 10-20a5 5 0 0 1 9 4L41 38a5 5 0 0 1 10 2v5c0 10-8 15-17 15h-7c-7 0-12-5-14-12l-2-6a5 5 0 0 1 9-4l5 8 M26 36l13 8 M37 48h9'
};
function glyph(key){return key?`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="${paths[key]}"/></svg>`:'<span aria-hidden="true">?</span>';}
export function bindStartDuelDialog(dialog,{onOpen=()=>{},onClose=()=>{},onBeforeClose=()=>{},onCancel=()=>{},createDuel=()=>createStartDuel()}={}){
 const $=id=>dialog.querySelector('#'+id);let duel=null,resolve=null,previousFocus=null,finishing=false,generation=0;
 function paint(){
  const s=duel.snapshot(),choosing=s.phase==='choose';dialog.dataset.phase=s.phase;
  $('startAttempt').textContent='VERSUCH '+s.attempt;
  $('startPlayerHand').innerHTML=glyph(s.player);$('startOpponentHand').innerHTML=glyph(s.opponent);
  $('startPlayerName').textContent=s.player?GESTURE_LABELS[s.player]:'Deine Wahl';$('startOpponentName').textContent=s.opponent?GESTURE_LABELS[s.opponent]:'Verdeckt gewählt';
  for(const b of dialog.querySelectorAll('[data-gesture]')){b.disabled=!choosing;b.setAttribute('aria-pressed',String(s.player===b.dataset.gesture));}
  $('startChoices').hidden=!choosing;$('startRetry').hidden=s.phase!=='tie';$('startInitiative').hidden=s.phase!=='choose-starter';$('startContinue').hidden=s.phase!=='ready';
  $('startTitle').textContent=choosing?'Wer macht den ersten Zug?':s.phase==='tie'?'Unentschieden. Noch einmal.':s.winner===0?'Du gewinnst das Startrecht.':'Der Gegner gewinnt das Startrecht.';
  $('startStatus').textContent=choosing?'Stein schlägt Schere. Schere schlägt Papier. Papier schlägt Stein.':s.phase==='tie'?'Beide haben dasselbe Zeichen gewählt. Der Gegner legt erneut verdeckt vor.':s.winner===0?'Wähle, ob du selbst oder der Gegner die erste Karte legt.':'Der Demo-Gegner entscheidet sich für den ersten Zug.';
 }
 async function finish(){
  if(finishing||!duel||duel.snapshot().phase!=='ready')return;
  finishing=true;const starter=duel.finish(),done=resolve,run=generation;let transition;
  // Measure the visible portraits before the native dialog leaves the top layer.
  try{transition=onBeforeClose();}catch{}
  dialog.close();onClose();
  try{await transition;}catch{}
  if(run!==generation||resolve!==done)return;
  resolve=null;finishing=false;previousFocus?.focus?.();done?.(starter);
 }
 for(const button of dialog.querySelectorAll('[data-gesture]')){button.querySelector('.gesture-art').innerHTML=glyph(button.dataset.gesture);button.onclick=()=>{if(!duel||duel.snapshot().phase!=='choose')return;duel.play(button.dataset.gesture);paint();const phase=duel.snapshot().phase,target=phase==='tie'?$('startRetry'):phase==='choose-starter'?dialog.querySelector('[data-starter]'):$('startContinue');target?.focus();};}
 $('startRetry').onclick=()=>{duel.retry();paint();dialog.querySelector('[data-gesture]')?.focus();};
 for(const button of dialog.querySelectorAll('[data-starter]'))button.onclick=()=>{if(duel?.snapshot().phase!=='choose-starter')return;duel.chooseStarter(Number(button.dataset.starter));finish();};
 $('startContinue').onclick=finish;
 dialog.addEventListener('cancel',event=>event.preventDefault());
 return {
  open(){this.cancel();duel=createDuel();previousFocus=document.activeElement;paint();onOpen();dialog.showModal();dialog.querySelector('[data-gesture]')?.focus();return new Promise(r=>{resolve=r;});},
  cancel(){generation++;finishing=false;onCancel();if(resolve){const done=resolve;resolve=null;if(dialog.open)dialog.close();onClose();done(null);}}
 };
}
