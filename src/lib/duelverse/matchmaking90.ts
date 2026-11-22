import {supabase} from '@/lib/supabaseClient';
export type Lobby90={id:string;kind:'random'|'private';status:string;phase:string;code?:string|null;version:number;searchRemainingMs?:number|null;opponentType?:'ai'|'human'};
export async function matchRequest90(body:Record<string,unknown>):Promise<Lobby90>{
 const {data:{session}}=await supabase.auth.getSession();if(!session)throw Error('Sign in to play online.');
 const response=await fetch('/api/duel',{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify(body)});
 const data=await response.json();if(!response.ok)throw Error(data.error??'Online duel unavailable.');return data;
}

export async function activeDuel112():Promise<Lobby90|null>{return matchRequest90({op:'active'});}
export async function leaveDuel112(id:string,userId:string){
 const {data:{session}}=await supabase.auth.getSession();if(session?.user.id!==userId)throw Error('Your sign-in changed. Refresh and try again.');
 await matchRequest90({op:'leave',id});
 try{if(localStorage.getItem('duelverse.match90.'+userId)===id)localStorage.removeItem('duelverse.match90.'+userId);}catch{}
 window.dispatchEvent(new Event('duelverse-match112'));window.dispatchEvent(new Event('duelverse-social92'));
}
