import {sortFriends114} from './presence114.mjs';
// Account-scoped inbox state. No credentials or private table access are stored here.
export const EMPTY_INBOX111=Object.freeze({userId:null,ready:false,friends:[],outgoing:[],blocked:[],invites:[],items:[],signals:[],toast:null,error:''});
export function incoming111(data){return [...(data.people??[]).filter(p=>p.relationship==='incoming').map(p=>({...p,key:'friend:'+p.id,kind:'friend'})),...(data.invites??[]).filter(p=>p.direction==='incoming'&&p.status==='waiting').map(p=>({...p,key:'duel:'+p.id,kind:'duel'}))];}
function notifications(items,signals){
 return [...items.filter(item=>item.kind==='duel'),...items.filter(item=>item.kind==='friend'),
  ...signals.map(item=>({...item,key:'signal:'+item.id,kind:'signal'}))];
}
/** @param {{load:()=>Promise<any>,readSeen?:(id:string|null)=>string[],writeSeen?:(id:string|null,keys:string[])=>void}} options */
export function createInbox111({load,readSeen=()=>[],writeSeen=()=>{}}){
 let state=EMPTY_INBOX111,generation=0,request=0,seen=new Set(),listeners=new Set();
 const emit=patch=>{state={...state,...patch};for(const listener of listeners)listener();};
 const nextToast=(items,signals)=>notifications(items,signals).find(item=>!seen.has(item.key))??null;
 function remember(){try{writeSeen(state.userId,[...seen].slice(-250));}catch{}}
 return {
  getSnapshot:()=>state,
  subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);},
  setUser(userId){if(userId===state.userId)return;generation++;request++;seen=new Set();try{seen=new Set(readSeen(userId)||[]);}catch{}emit({...EMPTY_INBOX111,userId});},
  async refresh(){
   if(!state.userId)return;
   const owner=generation,ticket=++request;
   try{
    const data=await load();
    if(owner!==generation||ticket!==request)return;
    const items=incoming111(data),signals=data.signals??[];
    const activeKeys=new Set(notifications(items,signals).map(item=>item.key));
    seen=new Set([...seen].filter(key=>activeKeys.has(key)));
    remember();
    const next=nextToast(items,signals);
    emit({
     items,signals,friends:sortFriends114(data.people),outgoing:(data.people??[]).filter(p=>p.relationship==='outgoing'),
     blocked:data.blocked??[],invites:(data.invites??[]).filter(i=>i.direction==='outgoing'||i.status==='matched'),
     ready:true,error:'',toast:next?.key===state.toast?.key?state.toast:next
    });
   }catch{
    if(owner===generation&&ticket===request)emit({
     friends:state.friends.map(p=>({...p,presence:'unknown'})),ready:true,error:'Friends and invitations could not be refreshed. Try again.'
    });
   }
  },
  dismiss(key=state.toast?.key){
   if(!key||state.toast?.key!==key)return;
   seen.add(key);remember();emit({toast:nextToast(state.items,state.signals)});
  },
  remove(key){
   const items=state.items.filter(item=>item.key!==key);
   emit({items,toast:state.toast?.key===key?nextToast(items,state.signals):state.toast});
  }
 };
}
