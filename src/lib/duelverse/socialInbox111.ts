'use client';
import {useSyncExternalStore} from 'react';
import {supabase} from '@/lib/supabaseClient';
import {socialList92} from './friends92';
import type {PlayerIdentity85} from './account';
import {createInbox111,EMPTY_INBOX111} from '../../../public/game/platform/social-inbox111.mjs';
export type InboxItem111={id:string;key:string;kind:'friend'|'duel';identity:PlayerIdentity85};
export type InboxState111={userId:string|null;ready:boolean;items:InboxItem111[];toast:InboxItem111|null;error:string};
export const socialInbox111=createInbox111({load:socialList92,readSeen:(id:string|null)=>{try{return id?JSON.parse(sessionStorage.getItem('duelverse.inbox111.'+id)??'[]'):[];}catch{return[];}},writeSeen:(id:string|null,keys:string[])=>{if(id)sessionStorage.setItem('duelverse.inbox111.'+id,JSON.stringify(keys));}});
let subscribers=0,stop:(()=>void)|null=null;
function start(){
 let alive=true;
 const update=()=>{if(!document.hidden)void socialInbox111.refresh();};
 const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>{if(!alive)return;const user=session?.user;const id=user?.email_confirmed_at&&!user.is_anonymous?user.id:null;const changed=id!==socialInbox111.getSnapshot().userId;socialInbox111.setUser(id);if(changed)update();},0);});
 const timer=setInterval(update,10000);
 window.addEventListener('focus',update);document.addEventListener('visibilitychange',update);window.addEventListener('duelverse-social92',update);
 return()=>{alive=false;clearInterval(timer);subscription.unsubscribe();window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',update);window.removeEventListener('duelverse-social92',update);socialInbox111.setUser(null);};
}
function subscribe(callback:()=>void){const unsubscribe=socialInbox111.subscribe(callback);if(++subscribers===1)stop=start();return()=>{unsubscribe();if(--subscribers===0){stop?.();stop=null;}};}
export function useSocialInbox111(){return useSyncExternalStore(subscribe,socialInbox111.getSnapshot,()=>EMPTY_INBOX111) as InboxState111;}
