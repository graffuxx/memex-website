'use client';
import {closePresence114} from '@/lib/duelverse/socialInbox111';
import {useState,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {supabase} from '@/lib/supabaseClient';
import usePlayerCollection from './usePlayerCollection';
import PlayerBalances from './PlayerBalances';
import {useFriendsCount92} from './FriendsNotice92';
import './friends92.css';
import {PLAYER_LINKS,playerAreaRoute} from '../../../public/game/platform/player-area49.mjs';
import './player-area.css';

export default function PlayerArea({children}:{children:ReactNode}){
 const {ready,userId,player,testMode}=usePlayerCollection(),path=usePathname();
 const social=useFriendsCount92(userId,ready&&!testMode);
 const visible=ready&&userId&&!testMode&&playerAreaRoute(path);
 if(!visible)return <>{children}</>;
 return <div className="player-area"><header className="player-area-bar"><nav aria-label="Player area">{PLAYER_LINKS.map(([url,label])=><a key={url} href={url} aria-current={path===url?'page':undefined}>{label}{url==='/account/private/friends'&&social.requests+social.invites>0&&<b className="friend-count92" aria-label={`${social.requests+social.invites} pending requests and invitations`}>{social.requests+social.invites}</b>}</a>)}</nav><div className="player-area-tools"><PlayerBalances ready={ready} userId={userId} player={player}/><PlayerAccountActions/></div></header><div className="player-area-content">{children}</div></div>;
}
export function PlayerAreaGate({children}:{children:ReactNode}){
 const {ready,userId,player,error,refresh}=usePlayerCollection(),[retrying,setRetrying]=useState(false);
 if(!ready)return <section className="portal-section player-gate"><h1>Your player area.</h1><p role="status">Loading your account…</p></section>;
 if(!userId&&error)return <section className="portal-section player-gate"><h1>Your player area.</h1><p className="error" role="alert">{error}</p><button className="button glass" onClick={()=>window.location.reload()}>Try again</button></section>;
 if(!userId)return <section className="portal-section player-gate"><img src="/memex-mainlogo.png" alt="MemeX Duelverse"/><h1>Your player area.</h1><p>Sign in to find your cards, decks and saved boosters.</p><div className="actions"><a className="button gold" href="/account">Sign in</a><a className="button glass" href="/account/register">Create account</a></div></section>;
 if(!player)return <section className="portal-section player-gate"><h1>Your player area.</h1><p className="error" role="alert">{error||'Your account could not be loaded.'}</p><button className="button glass" disabled={retrying} onClick={async()=>{setRetrying(true);try{await refresh();}catch{}finally{setRetrying(false);}}}>{retrying?'Loading…':'Try again'}</button></section>;
 return <>{children}</>;
}
export function PlayerAccountActions(){
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 return <div className="player-account-controls" role="group" aria-label="Account controls">
  <a className="player-password-action" href="/account/reset"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="8" cy="8" r="4"/><path d="m11 11 9 9m-4-4 3-3m-6 0 3-3"/></svg><span>Reset password</span></a>
  <button className="player-logout-action" type="button" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await closePresence114();const result=await supabase.auth.signOut();if(result.error)throw result.error;window.location.assign('/account');}catch{setError('Log out failed. Please retry.');setBusy(false);}}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M10 4H5v16h5M10 12h11m-4-4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg><span>{busy?'Logging out…':'Log out'}</span></button>
  {error&&<p className="player-account-error" role="alert">{error}</p>}
 </div>;
}
