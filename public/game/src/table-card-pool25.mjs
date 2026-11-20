// A new match or demo may use different card IDs, or reuse an ID with another motif.
export function syncTableCards(cards,states,{spawn,profileFor,rarityFor,elementFor=()=>undefined}){
 const current=new Map(states.map(state=>[state.uid,state]));
 for(const [uid,card]of cards){const state=current.get(uid);if(!state||card.profile!==profileFor(state)){card.dispose();cards.delete(uid);}}
 for(const state of current.values()){
  let card=cards.get(state.uid);const owner=state.controller??state.origin??0;
  if(!card){card=spawn(state.uid,profileFor(state),owner,state.rotation??0,rarityFor(state),elementFor(state));cards.set(state.uid,card);}
  card.setElement?.(elementFor(state));card.setRarity(rarityFor(state));card.setRotation(state.rotation??0);card.setOwner(owner);
 }
 return cards;
}
