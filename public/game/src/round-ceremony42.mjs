import {createRoundGate,roundIntro,roundOutcome} from './round-presentation42.mjs';

export function bindRoundCeremony(root,{audio,onContinue=()=>false,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 const gate=createRoundGate(),find=id=>root.querySelector(`[data-round="${id}"]`);
 let transitionTimer=null,timer=null,resolveIntro=null,previousFocus=null,kind=null;
 function cancelTransition(){clearTimer(transitionTimer);transitionTimer=null;}
 function hide(ok=true){clearTimer(timer);timer=null;root.hidden=true;audio.cancelAnnouncements();const resolve=resolveIntro;resolveIntro=null;kind=null;resolve?.(ok);if(previousFocus?.isConnected&&!previousFocus.disabled)previousFocus.focus({preventScroll:true});previousFocus=null;}
 function show(data,motion){
  kind=data.kind;previousFocus=document.activeElement;root.dataset.kind=kind;root.dataset.voice=data.voice;root.dataset.motion=motion?'on':'off';
  for(const id of ['label','title','detail'])find(id).textContent=data[id];
  find('score').hidden=kind==='intro'||Boolean(data.hideScore);find('own').textContent=data.own??'';find('enemy').textContent=data.enemy??'';
  find('skip').hidden=kind!=='intro';find('actions').hidden=kind==='intro';find('continue').textContent=data.next;
  root.hidden=false;
  if(kind==='intro'){audio.play('round-start');void audio.say(data.voice);find('skip').focus({preventScroll:true});}
  else{audio.play(kind==='victory'?'win':kind==='defeat'?'loss':'event');void audio.say(data.voice);find('continue').focus({preventScroll:true});}
 }
 find('skip').onclick=()=>hide();find('board').onclick=()=>hide();find('continue').onclick=()=>{if(onContinue())hide();};
 return {
  get visible(){return !root.hidden;},
  restore(key){cancelTransition();gate.begin(key);hide(false);},
  intro(key,{round,starter,motion=true}){if(!gate.begin(key))return Promise.resolve(false);cancelTransition();hide(false);show(roundIntro({round,starter}),motion);return new Promise(resolve=>{resolveIntro=resolve;timer=setTimer(()=>hide(),round===2?3200:2800);});},
  finish(key,options){if(!gate.finish(key))return false;hide(false);const result=roundOutcome(options);if(Number.isFinite(options.autoContinueMs))result.detail+=' · '+(result.label==='DUEL COMPLETE'?'Returning to matchmaking automatically':'Next round starts automatically');show(result,options.motion!==false);if(Number.isFinite(options.autoContinueMs)){transitionTimer=setTimer(()=>{transitionTimer=null;onContinue();hide();},Math.max(0,options.autoContinueMs));}else timer=setTimer(()=>hide(),3400);return true;},
  dismiss(){if(root.hidden)return false;hide();return true;},
  cancel(){cancelTransition();gate.cancel();hide(false);},
  dispose(){cancelTransition();gate.cancel();hide(false);find('skip').onclick=find('board').onclick=find('continue').onclick=null;}
 };
}
