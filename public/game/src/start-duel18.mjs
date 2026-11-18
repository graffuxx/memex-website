export const GESTURES=Object.freeze(['rock','paper','scissors']);
export const GESTURE_LABELS=Object.freeze({rock:'Stein',paper:'Papier',scissors:'Schere'});
const beats=Object.freeze({rock:'scissors',paper:'rock',scissors:'paper'});
export function randomGesture(){
 const value=new Uint32Array(1);do{globalThis.crypto.getRandomValues(value);}while(value[0]>=4294967295);
 return GESTURES[value[0]%3];
}
export function gestureWinner(player,opponent){
 if(!GESTURES.includes(player)||!GESTURES.includes(opponent))throw Error('Ungültiges Handzeichen.');
 return player===opponent?null:beats[player]===opponent?0:1;
}
export function roundStarter(first,round){
 if(![0,1].includes(first)||![1,2].includes(round))throw Error('Ungültiges Startrecht.');
 return round===1?first:1-first;
}
// The opponent commits before the player's selection. The pending choice is
// deliberately absent from every public snapshot until the player also commits.
export function createStartDuel({pick=randomGesture}={}){
 let opponent=pick(),phase='choose',attempt=1,player=null,winner=null,starter=null;
 const validate=()=>{if(!GESTURES.includes(opponent))throw Error('Ungültige Gegnerwahl.');};validate();
 const snapshot=()=>Object.freeze({phase,attempt,player,opponent:phase==='choose'?null:opponent,winner,starter});
 return {
  snapshot,
  play(choice){if(phase!=='choose')throw Error('Wahl ist bereits festgelegt.');if(!GESTURES.includes(choice))throw Error('Ungültiges Handzeichen.');player=choice;winner=gestureWinner(player,opponent);phase=winner===null?'tie':winner===0?'choose-starter':'ready';starter=winner===1?1:null;return snapshot();},
  retry(){if(phase!=='tie')throw Error('Keine Wiederholung offen.');opponent=pick();validate();phase='choose';player=null;winner=null;starter=null;attempt++;return snapshot();},
  chooseStarter(side){if(phase!=='choose-starter'||![0,1].includes(side))throw Error('Startrecht darf nicht gewählt werden.');starter=side;phase='ready';return snapshot();},
  finish(){if(phase!=='ready')throw Error('Startduell ist nicht abgeschlossen.');phase='done';return starter;}
 };
}
