// Each page owns a lease. Closing one page cannot make another open page offline.
export function createPresence114({send,leave,makeId=()=>crypto.randomUUID()}){
 let owner=null,client=null,epoch=0,pending=false,lastVisible=null,queued=null;
 return {
  setUser(userId){if(userId===owner)return;owner=userId;client=userId?makeId():null;epoch++;pending=false;lastVisible=null;queued=null;},
  async ping(visible){if(!owner||!client)return;const current=epoch,id=client;visible=Boolean(visible);if(pending){queued=visible;return;}pending=true;lastVisible=visible;
   try{await send(id,visible);}catch{}finally{if(current===epoch){pending=false;if(queued!==null){const next=queued;queued=null;if(next!==lastVisible)void this.ping(next);}}}
  },
  async close(){const id=client;epoch++;owner=client=null;queued=null;pending=false;if(id)try{await leave(id);}catch{}},
  get current(){return {owner,client};}
 };
}
export function friendPresence114(value){return ['online','away','offline'].includes(value)?value:'unknown';}
export function sortFriends114(people=[]){const order={online:0,away:1,offline:2,unknown:3};return people.filter(p=>p.relationship==='friend').map(p=>({...p,presence:friendPresence114(p.presence)})).sort((a,b)=>order[a.presence]-order[b.presence]||a.identity.displayName.localeCompare(b.identity.displayName));}
export function hideSocial114(path){const route=String(path??'').split(/[?#]/,1)[0];return route==='/decks'||route.startsWith('/decks/');}
