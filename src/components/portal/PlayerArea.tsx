'use client';
import {useState,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {supabase} from '@/lib/supabaseClient';
import usePlayerCollection from './usePlayerCollection';
import PlayerBalances from './PlayerBalances';
import {PLAYER_LINKS,playerAreaRoute} from '../../../public/game/platform/player-area49.mjs';
import './player-area.css';

export default function PlayerArea({children}:{children:ReactNode}){
 const {ready,userId,player,testMode}=usePlayerCollection(),path=usePathname();
 const visible=ready&&userId&&!testMode&&playerAreaRoute(path);
 if(!visible)return <>{children}</>;
 return <div className="player-area"><header className="player-area-bar"><nav aria-label="Player area">{PLAYER_LINKS.map(([url,label])=><a key={url} href={url} aria-current={path===url?'page':undefined}>{label}</a>)}</nav><PlayerBalances ready={ready} userId={userId} player={player}/></header><div className="player-area-content">{children}</div></div>;
}
export function PlayerAreaGate({children}:{children:ReactNode}){
 const {ready,userId,player,error,refresh}=usePlayerCollection(),[retrying,setRetrying]=useState(false);
 if(!ready)return <section className="portal-section player-gate"><h1>Your player area.</h1><p role="status">Loading your account…</p></section>;
 if(!userId)return <section className="portal-section player-gate"><img src="/memex-mainlogo.png" alt="MemeX Duelverse"/><h1>Your player area.</h1><p>Sign in to find your cards, decks and saved boosters.</p><div className="actions"><a className="button gold" href="/account">Sign in</a><a className="button glass" href="/account/register">Create account</a></div></section>;
 if(!player)return <section className="portal-section player-gate"><h1>Your player area.</h1><p className="error" role="alert">{error||'Your account could not be loaded.'}</p><button className="button glass" disabled={retrying} onClick={async()=>{setRetrying(true);try{await refresh();}catch{}finally{setRetrying(false);}}}>{retrying?'Loading…':'Try again'}</button></section>;
 return <>{children}</>;
}
export function PlayerAccountActions(){
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 return <details className="player-account-options"><summary>Account options</summary><div><a href="/account/reset">Reset password</a><button disabled={busy} onClick={async()=>{setBusy(true);setError('');const result=await supabase.auth.signOut();if(result.error){setError('Sign out failed. Please retry.');setBusy(false);}else window.location.assign('/account');}}>{busy?'Signing out…':'Sign out'}</button></div>{error&&<p role="alert">{error}</p>}</details>;
}
