import {series113} from '../platform/series113.mjs';
export function seriesHud129(round,results=[]){const s=series113(results);return {round,played:results.length,wins:s.wins,draws:s.draws,finished:s.finished};}
export function bindSeriesHud129(doc=document){
 const dock=doc.getElementById('playerDock97');if(!dock)return()=>{};
 const badges=['.cobalt','.rust'].map(selector=>{const host=dock.querySelector(selector);if(!host)return null;const badge=doc.createElement('small');badge.className='round-wins129';host.append(badge);return badge;});
 const center=doc.createElement('div');center.className='series-counter129';center.setAttribute('aria-live','polite');dock.append(center);
 return(round,results=[])=>{const s=seriesHud129(round,results);badges.forEach((badge,side)=>{if(badge)badge.textContent=s.wins[side]+' Rundensiege';});center.textContent='Runde '+round+' · '+s.wins.join(' : ')+' · '+s.played+' gespielt';};
}
