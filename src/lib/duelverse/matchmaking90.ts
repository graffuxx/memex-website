import {supabase} from '@/lib/supabaseClient';
export type Lobby90={id:string;kind:'random'|'private';status:string;phase:string;code?:string|null;version:number;searchRemainingMs?:number|null;opponentType?:'ai'|'human'};
export async function matchRequest90(body:Record<string,unknown>):Promise<Lobby90>{
 const {data:{session}}=await supabase.auth.getSession();if(!session)throw Error('Sign in to play online.');
 const response=await fetch('/api/duel',{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify(body)});
 const data=await response.json();if(!response.ok)throw Error(data.error??'Online duel unavailable.');return data;
}
