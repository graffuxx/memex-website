const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isDuelId=value=>typeof value==='string'&&UUID.test(value);

/** @param {string} matchId @param {{deckId?:string|null,format?:string,muted?:boolean}} [options] */
export function duelResultUrl(matchId,{deckId=null,format='owned',muted=false}={}){
 const query=new URLSearchParams({match:matchId});
 if(isDuelId(deckId))query.set('deck',deckId);
 if(format==='friendly')query.set('format','friendly');
 if(muted)query.set('mute','1');
 return '/game/online.html?'+query;
}

/** @param {string} matchId @param {{deckId?:string|null,format?:string,muted?:boolean}} [options] */
export function rematchDeckUrl(matchId,{deckId=null,format='owned',muted=false}={}){
 const query=new URLSearchParams({rematch:matchId});
 if(isDuelId(deckId))query.set('deck',deckId);
 if(format==='friendly')query.set('format','friendly');
 if(muted)query.set('mute','1');
 return '/decks?'+query;
}
