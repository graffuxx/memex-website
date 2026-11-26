import {GESTURE_LABELS} from './start-duel18.mjs';

const paths={
 rock:'M18 33V23a5 5 0 0 1 10 0v-4a5 5 0 0 1 10 0v3a5 5 0 0 1 10 0v4a5 5 0 0 1 9 3v13c0 10-7 15-18 15H29c-5 0-9-3-11-7L9 36a5 5 0 0 1 8-6l6 6 M28 23v10 M38 22v10 M48 26v8 M24 46h22',
 paper:'M18 34V17a4 4 0 0 1 8 0v14-21a4 4 0 0 1 8 0v21-19a4 4 0 0 1 8 0v20-13a4 4 0 0 1 8 0v21c0 11-6 17-18 17h-3c-5 0-8-3-11-7L8 36a4 4 0 0 1 6-5l8 8',
 scissors:'M22 34 15 13a5 5 0 0 1 9-3l9 20 10-20a5 5 0 0 1 9 4L41 38a5 5 0 0 1 10 2v5c0 10-8 15-17 15h-7c-7 0-12-5-14-12l-2-6a5 5 0 0 1 9-4l5 8 M26 36l13 8 M37 48h9'
};

const tones={rock:['#ffc678','#503047'],scissors:['#d0a8ff','#41215d'],paper:['#9eecfd','#1c4260']};

function token(gesture){
 if(!Object.hasOwn(paths,gesture))return '';
 const [accent,base]=tones[gesture];
 return `<svg class="rps-emblem" viewBox="0 0 136 122" aria-hidden="true" style="--accent:${accent};--base:${base}">
  <path class="rps-hex" d="M36 4h64l32 57-32 57H36L4 61Z"/>
  <path class="rps-engraving" d="M40 12h56l28 49-28 49H40L12 61Z M45 8h46m-46 106h46"/>
  <path class="rps-gems" d="m68 2 4 2-4 2-4-2Zm0 114 4 2-4 2-4-2Z"/>
  <path class="rps-hand" transform="translate(37 29)" d="${paths[gesture]}"/>
 </svg>`;
}

const setText=(node,text)=>{if(node.textContent!==text)node.textContent=text;};

export function bindStartDuelPresentation(dialog){
 const $=id=>dialog.querySelector('#'+id);
 const win=dialog.ownerDocument?.defaultView;
 const fighters=Array.from(dialog.querySelectorAll('.rps-fighter')).filter(node=>node.classList?.contains('rps-fighter'));
 const buttons=dialog.querySelectorAll('[data-gesture]');
 const anchor=win?dialog.querySelector('.rps-winner-anchor'):null;
 let winner=null,revealedAt=0,shownPair='';
 for(const button of buttons)(button.querySelector('.rps-token')??button.querySelector('.gesture-art')).innerHTML=token(button.dataset.gesture);

 function positionWinner(){
  const fighter=fighters[winner];
  if(!anchor||!fighter||!dialog.open)return;
  const slot=fighter.parentElement.getBoundingClientRect();
  const target=anchor.getBoundingClientRect();
  fighter.style.setProperty('--reveal-x',target.left-slot.left-slot.width/2+'px');
  fighter.style.setProperty('--reveal-y',target.top-slot.top+'px');
 }
 win?.addEventListener('resize',positionWinner);

 return {
  paint({choosing=false,tie=false,winner:side=null,player=null,opponent=null,chooseStarter=false,retry=false,continueRound=false,busy=false,message=''}){
   $('startChoices').hidden=!choosing;
   const result=$('startResult');
   if(result)result.hidden=!(player&&opponent&&!choosing);
   $('startInitiative').hidden=!chooseStarter;
   $('startRetry').hidden=!retry;
   $('startContinue').hidden=!continueRound;
   setText($('startTitle'),tie?'Gleichstand':side===0?'Du entscheidest':side===1?'Gegner entscheidet':'Wer beginnt?');
   setText($('startStatus'),message);
   for(const button of buttons){
    button.disabled=busy||!choosing||Boolean(player);
    button.setAttribute('aria-pressed',String(player===button.dataset.gesture));
   }
   for(const button of dialog.querySelectorAll('[data-starter]'))button.disabled=busy||!chooseStarter;
   const pair=player&&opponent&&!choosing?player+':'+opponent:'';
   if(pair!==shownPair){
    shownPair=pair;
    if(pair){
     $('startPlayerHand').innerHTML=token(player);
     $('startOpponentHand').innerHTML=token(opponent);
     setText($('startPlayerName'),GESTURE_LABELS[player]??'');
     setText($('startOpponentName'),GESTURE_LABELS[opponent]??'');
    }
   }
   const changed=winner!==side;
   winner=side;
   if(side===null){delete dialog.dataset.winner;return;}
   positionWinner();
   if(changed)revealedAt=win?.performance.now()??0;
   dialog.dataset.winner=String(side);
  },
  waitForReveal(){
   if(!anchor||!fighters[winner]||dialog.ownerDocument.hidden||dialog.dataset.motion==='off'||win.matchMedia('(prefers-reduced-motion: reduce)').matches)return null;
   const remaining=720-(win.performance.now()-revealedAt);
   return remaining>0?new Promise(resolve=>win.setTimeout(resolve,remaining)):null;
  }
 };
}
