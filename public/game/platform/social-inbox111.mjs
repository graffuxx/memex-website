import {sortFriends114} from './presence114.mjs';
// Account-scoped inbox state. No credentials or private table access are stored here.
export const EMPTY_INBOX111=Object.freeze({userId:null,ready:false,friends:[],items:[],toast:null,error:''});
export function incoming111(data){return [...(data.people??[]).filter(p=>p.relationship==='incoming').map(p=>({...p,key:'friend:'+p.id,kind:'friend'})),...(data.invites??[]).filter(p=>p.direction==='incoming'&&p.status==='waiting').map(p=>({...p,key:'duel:'+p.id,kind:'duel'}))];}
/** @param {{load:()=>Promise<any>,readSeen?:(id:string|null)=>string[],writeSeen?:(id:string|null,keys:string[])=>void}} options */
export function createInbox111({load,readSeen=()=>[],writeSeen=()=>{}}){
 let state=EMPTY_INBOX111,generation=0,request=0,seen=new Set(),listeners=new Set();
 const emit=patch=>{state={...state,...patch};for(const listener of listeners)listener();};
 function remember(){try{writeSeen(state.userId,[...seen].slice(-250));}catch{}}
 return {
  getSnapshot:()=>state,
  subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);},
  setUser(userId){if(userId===state.userId)return;generation++;request++;seen=new Set();try{seen=new Set(readSeen(userId)||[]);}catch{}emit({...EMPTY_INBOX111,userId});},
  async refresh(){const userId=state.userId;if(!userId)return;const owner=generation,ticket=++request;try{const data=await load(),items=incoming111(data),friends=sortFriends114(data.people);if(owner!==generation||ticket!==request)return;const fresh=items.filter(item=>!seen.has(item.key));seen=new Set(items.map(item=>item.key));remember();emit({items,friends,ready:true,error:'',toast:fresh.at(-1)??(items.some(i=>i.key===state.toast?.key)?state.toast:null)});}catch{if(owner===generation&&ticket===request)emit({friends:state.friends.map(p=>({...p,presence:'unknown'})),ready:true,error:'Requests could not be refreshed. Try again.'});}},
  dismiss(){emit({toast:null});},
  remove(key){emit({items:state.items.filter(item=>item.key!==key),toast:state.toast?.key===key?null:state.toast});}
 };
}
