'use client';

import {useEffect,useRef,useState,type FormEvent} from 'react';
import './auth-confirmation109.css';
import {supabase,passwordRecovery106} from '@/lib/supabaseClient';
import {referralCode95} from '../../../public/game/platform/quests95.mjs';
import {authErrorMessage108,isAuthRateLimit108,isAuthTemporary108} from '../../../public/game/platform/auth-errors108.mjs';
import {signupRedirect109,bindSignupConfirmation109,verifiedConfirmation109,confirmationLinkFailed109} from '../../../public/game/platform/auth-confirmation109.mjs';

type Mode='login'|'register'|'reset'|'update';
const titles={login:'Welcome to the Duelverse.',register:'Make it your collection.',reset:'Reset your password.',update:'Choose a new password.'};
const submitLabels={login:'Sign in',register:'Create account',reset:'Send reset link',update:'Save password'};

function openPlayerArea(){
 window.location.replace('/account/private');
}

export default function AuthForm({mode,confirmation=false}:{mode:Mode;confirmation?:boolean}){
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [confirm,setConfirm]=useState('');
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const [recovery,setRecovery]=useState(false);
 const [canResend,setCanResend]=useState(false);
 const [resendAt,setResendAt]=useState(0);
 const [resendSeconds,setResendSeconds]=useState(0);
 const [referral,setReferral]=useState<string|null>(null);
 const [inboxEmail,setInboxEmail]=useState('');
 const [checkAgain,setCheckAgain]=useState(false);
 const [checking,setChecking]=useState(confirmation);
 const requestLock=useRef(false);
 const pendingConfirmationEmail=useRef('');

 useEffect(()=>{
  if(mode==='register')setReferral(referralCode95(window.location.search));
  if(mode!=='register'&&mode!=='login')return;
  return bindSignupConfirmation109(supabase.auth,{getEmail:()=>pendingConfirmationEmail.current,onConfirmed:openPlayerArea});
 },[mode]);

 useEffect(()=>{
  if(!confirmation)return;
  let alive=true;
  async function verify(){
   try{
    if(!confirmationLinkFailed109(window.location.href)&&await verifiedConfirmation109(supabase.auth)){
     if(alive)openPlayerArea();
     return;
    }
    if(alive)setError('This link has expired or was already used. If your email is confirmed, sign in below. Otherwise, request a new confirmation email.');
   }catch(error){
    if(!alive)return;
    if(isAuthTemporary108(error)){
     setCheckAgain(true);
     setError('We could not check the link right now. Retry the check or sign in below.');
    }else{
     setError('This link could not sign you in. Sign in below if you already confirmed your email, or request a new link.');
    }
   }finally{
    if(alive){setCanResend(true);setChecking(false);}
   }
  }
  void verify();
  return()=>{alive=false;};
 },[confirmation]);

 useEffect(()=>{
  if(mode!=='update')return;
  let alive=true;
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
   if(alive)setRecovery(event==='PASSWORD_RECOVERY'||Boolean(passwordRecovery106?.isFor(session?.user.id)));
  });
  return()=>{alive=false;subscription.unsubscribe();};
 },[mode]);

 useEffect(()=>{
  if(!resendAt)return;
  const update=()=>{
   const seconds=Math.max(0,Math.ceil((resendAt-Date.now())/1000));
   setResendSeconds(seconds);
   if(!seconds)setResendAt(0);
  };
  update();
  const timer=window.setInterval(update,1000);
  return()=>window.clearInterval(timer);
 },[resendAt]);

 function startCooldown(){
  setResendAt(Date.now()+60000);
  setResendSeconds(60);
 }

 async function resend(){
  if(requestLock.current||Date.now()<resendAt)return;
  const target=(inboxEmail||email).trim();
  if(!target)return;
  requestLock.current=true;
  pendingConfirmationEmail.current=target;
  setBusy(true);
  setError('');
  setMessage('');
  try{
   const {error}=await supabase.auth.resend({type:'signup',email:target,options:{emailRedirectTo:signupRedirect109(window.location.origin)}});
   if(error)throw error;
   startCooldown();
   setMessage('Confirmation requested. Check your inbox and spam folder, and use the newest link.');
  }catch(error){
   if(isAuthRateLimit108(error))startCooldown();
   setError(authErrorMessage108(error,'resend'));
  }finally{
   requestLock.current=false;
   setBusy(false);
  }
 }

 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(requestLock.current||checking)return;
  requestLock.current=true;
  setBusy(true);
  setError('');
  setMessage('');
  const target=email.trim();
  try{
   if((mode==='register'||mode==='update')&&password!==confirm)throw new Error('Passwords do not match.');
   if(mode==='login'){
    const {error}=await supabase.auth.signInWithPassword({email:target,password});
    if(error){
     if(error.code==='email_not_confirmed'){
      pendingConfirmationEmail.current=target;
      setCanResend(true);
     }
     throw error;
    }
    openPlayerArea();
   }
   if(mode==='register'){
    pendingConfirmationEmail.current=target;
    const {data,error}=await supabase.auth.signUp({
     email:target,password,
     options:{emailRedirectTo:signupRedirect109(window.location.origin),...(referral?{data:{duelverse_referral95:referral}}:{})}
    });
    if(error)throw error;
    if(data.session){openPlayerArea();return;}
    setInboxEmail(target);
    setCanResend(true);
    setPassword('');
    setConfirm('');
    startCooldown();
   }
   if(mode==='reset'){
    const {error}=await supabase.auth.resetPasswordForEmail(target,{redirectTo:window.location.origin+'/account/update'});
    if(error)throw error;
    setMessage('If an account exists for this address, you will receive a reset link.');
   }
   if(mode==='update'){
    if(!recovery)throw new Error('Open the password reset link from your email first.');
    const {error}=await supabase.auth.updateUser({password});
    if(error)throw error;
    passwordRecovery106?.clear();
    setRecovery(false);
    setMessage('Password updated. You can now return to your account.');
   }
  }catch(error){
   setError(authErrorMessage108(error,mode));
  }finally{
   requestLock.current=false;
   setBusy(false);
  }
 }

 return <section className="portal-auth">
  <span className="eyebrow">YOUR PLAYER ACCOUNT</span>
  <h1>{inboxEmail?'Check your inbox.':titles[mode]}</h1>
  {!inboxEmail&&!checking&&<p className="muted">
   {mode==='register'?'Confirm your email for 10 free Alpha Boosters.':mode==='login'?'Sign in with your email to access your cards and decks.':'Use your account email to recover access.'}
  </p>}
  {referral&&!inboxEmail&&<p className="player-note">You followed a player invitation. Your inviter can see your quest progress, never your email.</p>}
  {checking&&<p className="auth-confirmation-check109" role="status">Checking your email confirmation…</p>}
  {error&&<p className="error" role="alert">{error}</p>}
  {checkAgain&&<button className="button glass" type="button" onClick={()=>window.location.reload()}>Retry confirmation check</button>}
  {inboxEmail&&<div className="auth-confirmation109" role="status">
   <div><strong>{inboxEmail}</strong><span>Open the confirmation link in your inbox or spam folder. It takes you straight to your player area. Already registered? Sign in below.</span></div>
  </div>}
  {!inboxEmail&&!checking&&<form onSubmit={submit}>
   {mode!=='update'&&<label>Email<input className="portal-input" type="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)}/></label>}
   {mode!=='reset'&&<label>Password<input className="portal-input" type="password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={mode==='login'?undefined:8} required value={password} onChange={event=>setPassword(event.target.value)}/></label>}
   {(mode==='register'||mode==='update')&&<label>Repeat password<input className="portal-input" type="password" autoComplete="new-password" required value={confirm} onChange={event=>setConfirm(event.target.value)}/></label>}
   <button type="submit" className="button gold" disabled={busy||(mode==='update'&&!recovery)}>{busy?'Please wait…':submitLabels[mode]}</button>
  </form>}
  {message&&<p role="status">{message}</p>}
  {canResend&&!checking&&<button className="button glass" type="button" disabled={busy||resendSeconds>0||!email.trim()} onClick={resend}>
   {resendSeconds?`Resend available in ${resendSeconds}s`:'Resend confirmation email'}
  </button>}
  <div className="auth-links">
   {mode==='update'&&message&&<a href="/account/private">Back to account</a>}
   {inboxEmail&&<button className="auth-change-email" type="button" disabled={busy} onClick={()=>{
    pendingConfirmationEmail.current='';
    setInboxEmail('');
    setCanResend(false);
    setError('');
    setMessage('');
   }}>Use a different email</button>}
   <a href={mode==='login'&&!confirmation?'/account/register':'/account'}>{mode==='login'&&!confirmation?'Create account':'Sign in'}</a>
   <a href="/account/reset">Forgot password?</a>
   <a href="/decks">Try as guest</a>
  </div>
 </section>;
}
