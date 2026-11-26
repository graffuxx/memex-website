import {createStartDuel} from './start-duel18.mjs';
import {bindStartDuelPresentation} from './start-duel-presentation.mjs?v=arena-start-duel';
export function bindStartDuelDialog(dialog,{onOpen=()=>{},onClose=()=>{},onBeforeClose=()=>{},onCancel=()=>{},createDuel=()=>createStartDuel()}={}){
 const $=id=>dialog.querySelector('#'+id);let duel=null,resolve=null,previousFocus=null,finishing=false,generation=0;
 const presentation=bindStartDuelPresentation(dialog);
 function paint(){
  const {phase,player,opponent,winner}=duel.snapshot();
  presentation.paint({choosing:phase==='choose',tie:phase==='tie',player,opponent,winner,
   chooseStarter:phase==='choose-starter',retry:phase==='tie',continueRound:phase==='ready',
   message:phase==='ready'&&winner===1?'Der Gegner beginnt.':''});
 }
 async function finish(){
  if(finishing||!duel||duel.snapshot().phase!=='ready')return;
  finishing=true;const done=resolve,run=generation;let transition;
  const reveal=presentation.waitForReveal();
  if(reveal)await reveal;
  if(run!==generation||resolve!==done)return;
  const starter=duel.finish();
  // Measure the visible portraits before the native dialog leaves the top layer.
  try{transition=onBeforeClose();}catch{}
  dialog.close();onClose();
  try{await transition;}catch{}
  if(run!==generation||resolve!==done)return;
  resolve=null;finishing=false;previousFocus?.focus?.();done?.(starter);
 }
 for(const button of dialog.querySelectorAll('[data-gesture]')){button.onclick=()=>{if(!duel||duel.snapshot().phase!=='choose')return;duel.play(button.dataset.gesture);paint();const phase=duel.snapshot().phase,target=phase==='tie'?$('startRetry'):phase==='choose-starter'?dialog.querySelector('[data-starter]'):$('startContinue');target?.focus();};}
 $('startRetry').onclick=()=>{duel.retry();paint();dialog.querySelector('[data-gesture]')?.focus();};
 for(const button of dialog.querySelectorAll('[data-starter]'))button.onclick=()=>{if(duel?.snapshot().phase!=='choose-starter')return;duel.chooseStarter(Number(button.dataset.starter));finish();};
 $('startContinue').onclick=finish;
 dialog.addEventListener('cancel',event=>event.preventDefault());
 return {
  open(){this.cancel();duel=createDuel();previousFocus=document.activeElement;paint();try{onOpen();}catch{}dialog.showModal();dialog.querySelector('[data-gesture]')?.focus();return new Promise(r=>{resolve=r;});},
  cancel(){generation++;finishing=false;onCancel();if(resolve){const done=resolve;resolve=null;if(dialog.open)dialog.close();onClose();done(null);}}
 };
}
