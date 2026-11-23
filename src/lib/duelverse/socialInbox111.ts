'use client';
import {useSyncExternalStore} from 'react';
import {supabase} from '@/lib/supabaseClient';
import {socialList114,type Friend92,type DuelInvite92} from './friends92';
import type {PlayerIdentity85} from './account';
import {createInbox111,EMPTY_INBOX111} from '../../../public/game/platform/social-inbox111.mjs';
export type InboxItem111={id:string;key:string;kind:'friend'|'duel';identity:PlayerIdentity85};
export type InboxState111={userId:string|null;ready:boolean;friends:Friend92[];outgoing:Friend92[];blocked:Friend92[];invites:DuelInvite92[];items:InboxItem111[];toast:InboxItem111|null;error:string};
export const socialInbox111=createInbox111({load:socialList114,readSeen:(id:string|null)=>{try{return id?JSON.parse(sessionStorage.getItem('duelverse.inbox111.'+id)??'[]'):[];}catch{return[];}},writeSeen:(id:string|null,keys:string[])=>{if(id)sessionStorage.setItem('duelverse.inbox111.'+id,JSON.stringify(keys));}});
import {createPresence114} from '../../../public/game/platform/presence114.mjs';
const presence114=createPresence114({send:async(id:string,visible:boolean)=>{const {error}=await supabase.rpc('dv_presence_ping114',{p_client:id,p_visible:visible});if(error)throw error;},leave:async(id:string)=>{await supabase.rpc('dv_presence_leave114',{p_client:id});}});
export async function closePresence114(){let timeout:ReturnType<typeof setTimeout>|undefined;try{await Promise.race([presence114.close(),new Promise(resolve=>{timeout=setTimeout(resolve,1200);})]);}finally{clearTimeout(timeout);}}
let subscribers=0,stop:(()=>void)|null=null;
function start(){
 let alive=true;
 const heartbeat=()=>{if(alive){presence114.setUser(socialInbox111.getSnapshot().userId);void presence114.ping(!document.hidden);}};
 const update=()=>{heartbeat();if(!document.hidden)void socialInbox111.refresh();};
 const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>{if(!alive)return;const user=session?.user;const id=user?.email_confirmed_at&&!user.is_anonymous?user.id:null;const changed=id!==socialInbox111.getSnapshot().userId;socialInbox111.setUser(id);presence114.setUser(id);if(changed)update();},0);});
 const timer=setInterval(()=>{if(!document.hidden)void socialInbox111.refresh();},10000),presenceTimer=setInterval(heartbeat,30000);
 const pagehide=(e:PageTransitionEvent)=>{if(e.persisted)void presence114.ping(false);else void presence114.close();};window.addEventListener('pagehide',pagehide);
 window.addEventListener('focus',update);document.addEventListener('visibilitychange',update);window.addEventListener('duelverse-social92',update);
 return()=>{alive=false;clearInterval(timer);clearInterval(presenceTimer);window.removeEventListener('pagehide',pagehide);void presence114.close();subscription.unsubscribe();window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',update);window.removeEventListener('duelverse-social92',update);socialInbox111.setUser(null);};
}
function subscribe(callback:()=>void){const unsubscribe=socialInbox111.subscribe(callback);if(++subscribers===1)stop=start();return()=>{unsubscribe();if(--subscribers===0){stop?.();stop=null;}};}
export function useSocialInbox111(){return useSyncExternalStore(subscribe,socialInbox111.getSnapshot,()=>EMPTY_INBOX111) as InboxState111;}
