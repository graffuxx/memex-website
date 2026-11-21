// Remember the recovery event before React mounts. No password or auth token is stored here.
const KEY='duelverse.password-recovery106';
/** @param {any} auth @param {{storage?: Storage|null, now?: ()=>number}} options */
export function bindPasswordRecovery106(auth,{storage=null,now=()=>Date.now()}={}){
 let memory=null;
 function clear(){memory=null;try{storage?.removeItem(KEY);}catch{}}
 function read(){if(memory)return memory;try{const value=JSON.parse(storage?.getItem(KEY)??'null');return value&&typeof value.userId==='string'&&Number.isFinite(value.until)?value:null;}catch{return null;}}
 const {data:{subscription}}=auth.onAuthStateChange((event,session)=>{
  if(event==='PASSWORD_RECOVERY'&&session?.user?.id){memory={userId:session.user.id,until:now()+15*60*1000};try{storage?.setItem(KEY,JSON.stringify(memory));}catch{}}
  else if(event==='SIGNED_OUT'||event==='SIGNED_IN')clear();
 });
 return {clear,isFor(userId){const value=read();if(!value||value.until<=now()){clear();return false;}return Boolean(userId&&value.userId===userId);},dispose(){subscription.unsubscribe();}};
}
