export const CONFIRMATION_PATH109='/account/confirmed';
const normalizedEmail=value=>String(value??'').trim().toLowerCase();
export function signupRedirect109(origin){return new URL(CONFIRMATION_PATH109,origin).href;}
export function confirmationLinkFailed109(href){
 const url=new URL(href),hash=new URLSearchParams(url.hash.slice(1));
 return ['error','error_code'].some(key=>Boolean(url.searchParams.get(key)||hash.get(key)));
}
// Supabase broadcasts sign-in events between tabs. Keep its callback synchronous;
// navigation runs after the auth lock is released and only for this pending email.
export function bindSignupConfirmation109(auth,{getEmail,onConfirmed,schedule=callback=>setTimeout(callback,0)}){
 let active=true,queued=false,finished=false;
 const {data:{subscription}}=auth.onAuthStateChange((_event,session)=>{
  const user=session?.user,expected=normalizedEmail(getEmail());
  if(!active||queued||finished||!expected||!user?.email_confirmed_at||user.is_anonymous||normalizedEmail(user.email)!==expected)return;
  queued=true;
  schedule(()=>{
   queued=false;
   if(!active||finished||normalizedEmail(getEmail())!==normalizedEmail(user.email))return;
   finished=true;onConfirmed();
  });
 });
 return()=>{active=false;subscription.unsubscribe();};
}
// A URL alone is never proof: ask Auth for the current verified user.
export async function verifiedConfirmation109(auth,{timeoutMs=8000}={}){
 let timer;
 try{
  const response=await Promise.race([
   auth.getUser(),
   new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Confirmation check timed out')),timeoutMs);})
  ]);
  if(response.error)throw response.error;
  const user=response.data?.user;
  return user?.email_confirmed_at&&!user.is_anonymous?{id:user.id,email:user.email??''}:null;
 }finally{clearTimeout(timer);}
}
