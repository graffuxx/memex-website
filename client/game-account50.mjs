import {createClient} from '@supabase/supabase-js';
const URL='https://vnwvwwukqlbwzqroaqeu.supabase.co',PUBLIC_KEY='sb_publishable_Nz664DzwUuBcOpLzCXgB_Q_4SzenMlV';
const auth=createClient(URL,PUBLIC_KEY),ENDPOINT=URL+'/functions/v1/duelverse-game50';
export async function readPlayerIdentity85(){const {data:{session},error}=await auth.auth.getSession();if(error)throw Error('Player profile unavailable.');if(!session)return null;const result=await auth.rpc('dv_identity85');if(result.error)throw Error('Player profile unavailable.');return result.data;}
export async function connectAccountGame({sandbox=false}={}){
 if(sandbox)return null;
 const {data:{session},error}=await auth.auth.getSession();if(error)throw Error('Deine Anmeldung konnte nicht geprüft werden. Bitte neu anmelden.');if(!session)return null;
 const userId=session.user.id,storageKey='duelverse.account-game.v50.'+userId;
 let current=null,pending=null,stored={};try{stored=JSON.parse(localStorage.getItem(storageKey)??'{}');pending=stored.pending??null;}catch{}
 function persist(){localStorage.setItem(storageKey,JSON.stringify({id:current?.id??stored.id??null,pending}));}
 async function invoke(body){const {data:{session},error}=await auth.auth.getSession();if(error||!session||session.user.id!==userId)throw Error('Bitte erneut anmelden, um dein Duell fortzusetzen.');const res=await fetch(ENDPOINT,{method:'POST',headers:{apikey:PUBLIC_KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify(body)});let data;try{data=await res.json();}catch{throw Error('Spielserver nicht erreichbar. Deinen letzten Zug wiederherstellen.');}if(!res.ok){const e=Object.assign(Error(data.error??data.message??'Spielzug konnte nicht bestätigt werden.'),{status:res.status});throw e;}return data;}
 async function mutate(body){if(pending)throw Error('Zuerst den letzten Spielzug wiederherstellen.');pending=body;persist();try{const data=await invoke(body);current=data;stored.id=data.id;pending=null;persist();return data;}catch(e){if(e.status&&e.status<500&&![408,429].includes(e.status)){pending=null;persist();}throw e;}}
 const profile=await invoke({op:'profile'});
 if(pending){try{current=await invoke(pending);stored.id=current.id;pending=null;persist();}catch(e){if(e.status&&e.status<500&&![408,429].includes(e.status)){pending=null;persist();}throw e;}}
 let resumed=null;
 if(stored.id){try{resumed=await invoke({op:'resume',id:stored.id});current=resumed;}catch(e){if(e.status!==404)throw e;stored.id=null;persist();}}
 return {profile,resumed,forget(){if(!pending)localStorage.removeItem(storageKey);},get current(){return current;},get pending(){return Boolean(pending);},start(settings){return mutate({op:'start',id:crypto.randomUUID(),...settings});},move(move){if(!current)throw Error('Kein gespeichertes Duell.');return mutate({op:'action',id:current.id,version:current.version,requestId:crypto.randomUUID(),move});},async refreshWallet(){return (await invoke({op:'profile'})).wallet;}};
}
