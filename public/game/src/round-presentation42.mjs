import {series113} from '../platform/series113.mjs';
// Results are viewer-relative; only round wins decide the first-to-two series.
export function roundIntro({round=1,starter=0}={}){
 return {kind:'intro',voice:round>1?'rematch':'intro',label:`ROUND ${round}`,title:round>1?'MAKE IT COUNT!':'LET THE MEMES BEGIN!',detail:starter===0?'Du beginnst. Dein erster Zug wartet.':'Der Gegner beginnt. Bereit für den Gegenzug?',next:''};
}
export function roundOutcome({round=1,match=true,results=[],score,viewer=0,forfeit=null,rated=false}={}){
 if(forfeit!==null&&!rated)return{kind:'draw',voice:'draw',label:'DUEL CLOSED',title:'FRIENDLY DUEL ENDED',own:0,enemy:0,detail:'Private duel · no win or loss recorded',next:'Back to lobby'};
 const series=series113(results),final=match&&(series.finished||forfeit!==null),total=final?series.wins:score;
 const own=total[viewer],enemy=total[1-viewer],winner=forfeit!==null?1-forfeit:final?series.winner:own===enemy?null:own>enemy?viewer:1-viewer,outcome=winner===null?'draw':winner===viewer?'victory':'defeat';
 return {kind:outcome,voice:outcome,label:final?'DUEL COMPLETE':`ROUND ${round} COMPLETE`,title:outcome.toUpperCase(),own,enemy,
  detail:forfeit!==null?(rated?'Random duel · concession counts as a loss':'Private duel · unranked exit'):final?'Round wins · first to 2':own===enemy?'Draw · neither player gains a round win':'Cards controlled · first to 2 round wins',
  next:match&&!final?'Next round':'Back to lobby'};
}
// A reset invalidates pending intros and results; repeated render calls cannot replay them.
export function createRoundGate(){
 let active=null,ended=false;
 return {begin(key){if(key===active)return false;active=key;ended=false;return true;},finish(key){if(key!==active||ended)return false;ended=true;return true;},cancel(){active=null;ended=false;}};
}
