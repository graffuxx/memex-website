// All results are relative to the viewer; the second round also reports the series.
export function roundIntro({round=1,starter=0}={}){
 return {kind:'intro',voice:round===2?'rematch':'intro',label:`ROUND ${round}`,title:round===2?'MAKE IT COUNT!':'LET THE MEMES BEGIN!',detail:starter===0?'Du beginnst. Dein erster Zug wartet.':'Der Gegner beginnt. Bereit für den Gegenzug?',next:''};
}
export function roundOutcome({round=1,match=true,results=[],score,viewer=0}={}){
 const final=match&&round===2,total=final?results.reduce((a,b)=>[a[0]+b[0],a[1]+b[1]],[0,0]):score;
 const own=total[viewer],enemy=total[1-viewer],outcome=own===enemy?'draw':own>enemy?'victory':'defeat';
 return {kind:outcome,voice:outcome,label:final?'DUEL COMPLETE':`ROUND ${round} COMPLETE`,title:outcome.toUpperCase(),own,enemy,
  detail:final?`Gesamtwertung · Runde ${round}: ${score[viewer]} : ${score[1-viewer]}`:'Deine Karten · gegnerische Karten',
  next:match&&round===1?'Rückspiel starten':'Neues Duell'};
}
// A reset invalidates pending intros and results; repeated render calls cannot replay them.
export function createRoundGate(){
 let active=null,ended=false;
 return {begin(key){if(key===active)return false;active=key;ended=false;return true;},finish(key){if(key!==active||ended)return false;ended=true;return true;},cancel(){active=null;ended=false;}};
}
