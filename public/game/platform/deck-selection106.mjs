// A direct deck link selects that owned deck before falling back to the active starter.
export function chooseOnlineDeck106(decks,current='',requested=''){
 return decks.find(d=>d.id===current)?.id??decks.find(d=>d.id===requested)?.id??decks.find(d=>d.active)?.id??decks[0]?.id??'';
}
