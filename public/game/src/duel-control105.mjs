// Both ribbon fills use the same current board ownership as the visible score.
// Rarity, original deck and hand size never increase a card's weight.
export function duelControl105(board={}){
 const counts=[0,0];
 for(const card of Object.values(board??{}))if(card?.controller===0||card?.controller===1)counts[card.controller]++;
 const total=counts[0]+counts[1];
 return {counts,total,shares:total?counts.map(count=>count/total):[.5,.5]};
}
export function bindDuelControl105(doc=document){
 const teams=['.cobalt','.rust'].map(selector=>doc.querySelector('#playerDock97 .team'+selector));
 const meters=teams.map(team=>{
  if(!team)return null;
  let meter=team.querySelector('.duel-meter105');
  if(!meter){meter=doc.createElement('i');meter.className='duel-meter105';meter.setAttribute('role','meter');meter.setAttribute('aria-valuemin','0');meter.setAttribute('aria-valuemax','100');meter.append(doc.createElement('em'));team.append(meter);}
  return meter;
 });
 return game=>{
  const state=duelControl105(game?.board);
  for(const side of [0,1]){
   const team=teams[side],meter=meters[side];if(!team||!meter)continue;
   const percent=Math.round(state.shares[side]*100);
   team.style.setProperty('--control-share',String(state.shares[side]));
   meter.setAttribute('aria-label',side===0?'Dein Kartenbesitz':'Gegnerischer Kartenbesitz');
   meter.setAttribute('aria-valuenow',String(percent));
   meter.setAttribute('aria-valuetext',state.total?state.counts[side]+' von '+state.total+' ausgespielten Karten': 'Noch keine Karten ausgespielt');
  }
 };
}
