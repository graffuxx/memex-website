'use client';

import {useEffect,useRef,useState,type FormEvent} from 'react';
import {supabase} from '@/lib/supabaseClient';
import {socialAction92,socialSearch92,friendReply92,friendInvite92,type Friend92} from '@/lib/duelverse/friends92';
import {socialInbox111,useSocialInbox111,type InboxItem111,type InboxState111} from '@/lib/duelverse/socialInbox111';
import {matchRequest90} from '@/lib/duelverse/matchmaking90';
import {loadIdentity85,type PlayerIdentity85,type SavedDeck} from '@/lib/duelverse/account';
import {portrait85} from '../../../public/game/platform/identity85.mjs';
import CurrentDuel112 from './CurrentDuel112';
import './social-bubble111.css';

type Tab='friends'|'requests'|'duels';
type FriendAction='request'|'accept'|'decline'|'cancel'|'remove'|'block'|'unblock';
type FriendIdentity=Pick<Friend92,'id'|'identity'>;
type ConfirmAction={person:FriendIdentity;action:'remove'|'block'};
const tabs=[['friends','Friends'],['requests','Requests'],['duels','Duels']] as const;
const sentMessages:Record<FriendAction,string>={
 request:'Friend request sent.',accept:'Friend added.',decline:'Request declined.',cancel:'Request cancelled.',
 remove:'Friend removed.',block:'Player blocked.',unblock:'Player unblocked.'
};
const presenceLabels={online:'Online',away:'Away',offline:'Offline',unknown:'Status unavailable'};
const ChatIcon=()=> <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.4c0 4.1-3.6 7.4-8 7.4a9.3 9.3 0 0 1-3.2-.6L4 20l1.3-4.5A6.8 6.8 0 0 1 4 11.4C4 7.3 7.6 4 12 4s8 3.3 8 7.4Z" stroke="currentColor" strokeWidth="1.7"/><circle cx="8" cy="11" r="1" fill="currentColor"/><circle cx="12" cy="11" r="1" fill="currentColor"/><circle cx="16" cy="11" r="1" fill="currentColor"/></svg>;

function Person({identity,label}:{identity:PlayerIdentity85;label:string}){
 return <div className="social111-person">
  <img src={portrait85(identity.avatarId).image} alt=""/>
  <div><strong>{identity.displayName}</strong><span>{label}</span></div>
 </div>;
}

export default function SocialBubble111({embedded=false,hidden=false}:{embedded?:boolean;hidden?:boolean}){
 const inbox=useSocialInbox111();
 return <FriendsPanel key={inbox.userId} inbox={inbox} embedded={embedded} hidden={hidden}/>;
}

function FriendsPanel({inbox,embedded,hidden}:{inbox:InboxState111;embedded:boolean;hidden:boolean}){
 const owner=inbox.userId;
 const [tab,setTab]=useState<Tab>('friends');
 const [open,setOpen]=useState(false);
 const [selected,setSelected]=useState<string|null>(null);
 const [decks,setDecks]=useState<SavedDeck[]|null>(null);
 const [deck,setDeck]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [identity,setIdentity]=useState<PlayerIdentity85|null>(null);
 const [name,setName]=useState('');
 const [result,setResult]=useState<Friend92|null|undefined>(undefined);
 const [confirmation,setConfirmation]=useState<ConfirmAction|null>(null);
 const scope=useRef(owner);
 const lock=useRef(false);
 const launcher=useRef<HTMLButtonElement>(null);
 const root=useRef<HTMLDivElement>(null);
 const confirmationPanel=useRef<HTMLDivElement>(null);
 scope.current=owner;

 useEffect(()=>{
  scope.current=owner;
  const requested=embedded?null:new URLSearchParams(location.search).get('friends');
  const preferred=tabs.find(([id])=>id===requested)?.[0];
  setOpen(Boolean(owner&&preferred));
  setTab(preferred??'friends');
  return()=>{scope.current=null;};
 },[owner,embedded]);

 useEffect(()=>{
  if(!open||tab!=='friends'||!owner||identity)return;
  let alive=true;
  void loadIdentity85().then(value=>{
   if(alive&&scope.current===owner)setIdentity(value);
  }).catch(()=>{});
  return()=>{alive=false;};
 },[open,tab,owner,identity]);

 useEffect(()=>{
  if(!inbox.toast)return;
  const timer=setTimeout(()=>socialInbox111.dismiss(),9000);
  return()=>clearTimeout(timer);
 },[inbox.toast]);

 useEffect(()=>{
  if(!open)return;
  const outside=(event:PointerEvent)=>{
   if(!root.current?.contains(event.target as Node))setOpen(false);
  };
  document.addEventListener('pointerdown',outside);
  return()=>document.removeEventListener('pointerdown',outside);
 },[open]);

 useEffect(()=>{
  if(!embedded)return;
  const onMessage=(event:MessageEvent)=>{
   if(event.origin!==location.origin||event.source!==window.parent)return;
   if(event.data?.type==='duelverse-social111-close')setOpen(false);
   if(event.data?.type==='duelverse-social111-open'&&owner){
    setTab('friends');
    socialInbox111.dismiss();
    setOpen(true);
    void socialInbox111.refresh();
   }
  };
  window.addEventListener('message',onMessage);
  return()=>window.removeEventListener('message',onMessage);
 },[embedded,owner]);

 useEffect(()=>{
  if(!embedded)return;
  window.parent.postMessage({
   type:'duelverse-social111-size',
   width:owner?(open||inbox.toast?390:160):0,
   height:owner?(open?640:inbox.toast?190:90):0
  },location.origin);
 },[embedded,open,inbox.toast,owner]);

 useEffect(()=>{if(hidden)setOpen(false);},[hidden]);
 useEffect(()=>{if(confirmation)confirmationPanel.current?.focus();},[confirmation]);

 function show(section:Tab='friends'){
  setTab(section);
  setSelected(null);
  setDecks(null);
  setDeck('');
  setConfirmation(null);
  setError('');
  setNotice('');
  socialInbox111.dismiss();
  setOpen(true);
  void socialInbox111.refresh();
 }

 function close(){
  setOpen(false);
  launcher.current?.focus();
 }

 async function run(work:(account:string)=>Promise<void>){
  if(lock.current||!owner)return;
  lock.current=true;
  setBusy(true);
  setError('');
  setNotice('');
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(session?.user.id!==owner)throw Error('Your sign-in changed. Refresh and try again.');
   if(scope.current===owner)await work(owner);
  }catch(error){
   if(scope.current===owner){
    setError(error instanceof Error?error.message:'Please try again.');
    void socialInbox111.refresh();
   }
  }finally{
   if(scope.current===owner){lock.current=false;setBusy(false);}
  }
 }

 function search(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  const query=name.trim();
  if(query.length<3)return;
  void run(async account=>{
   const player=await socialSearch92(query);
   if(scope.current===account)setResult(player);
  });
 }

 function manage(person:FriendIdentity,action:FriendAction){
  void run(async account=>{
   await socialAction92(person.id,action);
   if(scope.current!==account)return;
   setConfirmation(null);
   if(result?.id===person.id)setResult(undefined);
   if(action==='request')setTab('requests');
   if(action==='accept')setTab('friends');
   if(action==='accept'||action==='decline'||action==='block')socialInbox111.remove('friend:'+person.id);
   setNotice(sentMessages[action]);
  });
 }

 async function chooseDeck(account:string,key:string){
  if(decks){
   setSelected(key);
   return;
  }
  const {data,error}=await supabase.from('dv_decks').select('id,name,cards,active,format').order('created_at');
  if(error)throw Error('Your saved decks could not be loaded. Try again.');
  if(scope.current!==account)return;
  const available=(data??[]).filter(d=>Array.isArray(d.cards)&&d.cards.length===15) as SavedDeck[];
  setDecks(available);
  setDeck(available.find(d=>d.active)?.id??available[0]?.id??'');
  setSelected(key);
 }

 function joinDuel(id:string,account:string){
  try{localStorage.setItem('duelverse.match90.'+account,id);}catch{}
  if(embedded)window.parent.postMessage({type:'duelverse-social111-join',id},location.origin);
  else location.assign('/game/online.html?match='+encodeURIComponent(id));
 }

 function invite(friend:Friend92){
  const key='invite:'+friend.id;
  void run(async account=>{
   if(selected!==key){await chooseDeck(account,key);return;}
   if(!decks?.some(d=>d.id===deck))throw Error('Choose a saved 15-card deck first.');
   const sent=await friendInvite92(friend.id,deck);
   if(scope.current!==account)return;
   try{localStorage.setItem('duelverse.match90.'+account,sent.id);}catch{}
   window.dispatchEvent(new Event('duelverse-social92'));
   if(embedded)window.parent.postMessage({type:'duelverse-social115-lobby',id:sent.id,friendName:sent.friendName},location.origin);
   else location.assign('/play?friend='+encodeURIComponent(sent.friendName));
  });
 }

 function reply(item:InboxItem111,action:'accept'|'decline'){
  void run(async account=>{
   if(action==='accept'&&selected!==item.key){await chooseDeck(account,item.key);return;}
   if(action==='accept'&&!decks?.some(d=>d.id===deck))throw Error('Choose a saved 15-card deck first.');
   const id=await friendReply92(item.id,action,action==='accept'?deck:null);
   if(scope.current!==account)return;
   if(action==='accept'){
    if(!id)throw Error('The invitation is no longer available.');
    joinDuel(id,account);
   }else{
    socialInbox111.remove(item.key);
    setSelected(null);
    setNotice('Invitation declined.');
   }
  });
 }

 function cancelInvite(id:string){
  void run(async account=>{
   await matchRequest90({op:'cancel',id});
   if(scope.current!==account)return;
   try{
    const key='duelverse.match90.'+account;
    if(localStorage.getItem(key)===id)localStorage.removeItem(key);
   }catch{}
   window.dispatchEvent(new Event('duelverse-match112'));
   window.dispatchEvent(new Event('duelverse-social92'));
   setNotice('Duel invitation cancelled.');
  });
 }

 function deckPicker(key:string){
  return <div className="social111-deck">
   <label htmlFor={'social-deck-'+key}>Your saved 15-card deck</label>
   <select id={'social-deck-'+key} value={deck} disabled={busy||!decks?.length} onChange={event=>setDeck(event.target.value)}>
    {!decks?.length?<option value="">No saved 15-card decks</option>:decks.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
   </select>
   {!decks?.length&&<a href="/decks" target={embedded?'_top':undefined}>Build a deck</a>}
  </div>;
 }

 function confirmAction(person:FriendIdentity,action:ConfirmAction['action']){
  setConfirmation({person,action});
  setError('');
  setNotice('');
 }

 function friendOptions(friend:Friend92){
  return <details className="social145-options">
   <summary aria-label={'Options for '+friend.identity.displayName}>⋯</summary>
   <div>
    <button type="button" disabled={busy} onClick={()=>confirmAction(friend,'remove')}>Remove friend</button>
    <button type="button" disabled={busy} onClick={()=>confirmAction(friend,'block')}>Block player</button>
   </div>
  </details>;
 }

 function requestActions(person:FriendIdentity,relationship:'incoming'|'outgoing'|'none'){
  return <div className="social111-actions">
   {relationship==='incoming'?<>
    <button className="social111-primary" disabled={busy} onClick={()=>manage(person,'accept')}>Accept</button>
    <button disabled={busy} onClick={()=>manage(person,'decline')}>Decline</button>
    <button disabled={busy} onClick={()=>confirmAction(person,'block')}>Block</button>
   </>:relationship==='outgoing'?
    <button disabled={busy} onClick={()=>manage(person,'cancel')}>Cancel request</button>:
    <button className="social111-primary" disabled={busy||identity?.nameClaimed===false} onClick={()=>manage(person,'request')}>Add friend</button>}
  </div>;
 }

 if(!owner||hidden)return null;
 const incoming=inbox.items.filter(item=>item.kind==='friend');
 const incomingDuels=inbox.items.filter(item=>item.kind==='duel');
 const counts={friends:inbox.friends.length,requests:incoming.length,duels:incomingDuels.length};
 const target=embedded?'_top':undefined;
 return <div ref={root} className={'social111'+(embedded?' social111-embedded':'')} onKeyDown={event=>{
  if(event.key==='Escape'&&open){event.preventDefault();event.stopPropagation();close();}
 }}>
  {!open&&inbox.toast&&<aside className="social111-toast" aria-label="New request">
   <button className="social111-toast-body" onClick={()=>show(inbox.toast?.kind==='duel'?'duels':'requests')}>
    <img src={portrait85(inbox.toast.identity.avatarId).image} alt=""/>
    <span><small>{inbox.toast.kind==='duel'?'DUEL INVITATION':'FRIEND REQUEST'}</small><strong>{inbox.toast.identity.displayName}</strong><span>{inbox.toast.kind==='duel'?'Ready for a duel?':'Wants to add you.'}</span></span>
   </button>
   <button className="social111-dismiss" aria-label="Dismiss notification" onClick={()=>socialInbox111.dismiss()}>×</button>
  </aside>}
  {open&&<section id="social111-inbox" className="social111-panel" role="region" aria-label="Friends and invitations">
   <header><h2>Friends & duels</h2><div className="social145-header-actions"><button className="social111-close" disabled={busy} onClick={()=>void socialInbox111.refresh()} aria-label="Refresh friends and invitations">↻</button><button className="social111-close" onClick={close} aria-label="Close friends inbox">×</button></div></header>
   <nav className="social114-tabs" aria-label="Friends inbox sections">
    {tabs.map(([id,label])=><button key={id} type="button" aria-pressed={tab===id} onClick={()=>{setTab(id);setConfirmation(null);}}>{label}{counts[id]>0&&<> <b>{counts[id]}</b></>}</button>)}
   </nav>
   <div className="social111-scroll">
    {(error||inbox.error)&&<p className="social111-error" role="alert">{error||inbox.error}</p>}
    {notice&&<p className="social111-notice" role="status">{notice}</p>}
    {confirmation&&<div ref={confirmationPanel} tabIndex={-1} className="social145-confirm" role="group" aria-label="Confirm friend action">
     <p>{confirmation.action==='remove'?'Remove':'Block'} <strong>{confirmation.person.identity.displayName}</strong>?</p>
     {confirmation.action==='block'&&<span>This ends the friendship and stops new requests.</span>}
     <div className="social111-actions"><button disabled={busy} onClick={()=>setConfirmation(null)}>Cancel</button><button disabled={busy} className="social111-primary" onClick={()=>manage(confirmation.person,confirmation.action)}>{confirmation.action==='block'?'Block player':'Remove friend'}</button></div>
    </div>}
    {!inbox.ready&&!inbox.error&&<p className="social111-empty" role="status">Loading friends and invitations…</p>}

    {tab==='friends'&&<>
     <div className="social145-tools">
      {identity?.nameClaimed?<div className="social145-own">
       <span>You · <strong>{identity.displayName}</strong></span>
       <button type="button" onClick={()=>void navigator.clipboard.writeText(identity.displayName).then(()=>{
        if(scope.current===owner)setNotice('Player name copied.');
       }).catch(()=>{if(scope.current===owner)setError('Select and copy your player name.');})}>Copy name</button>
      </div>:identity&&<a href="/account/private/profile" target={target}>Choose your player name</a>}
      <form className="social145-search" onSubmit={search}>
       <input aria-label="Exact player name" placeholder="Exact player name" value={name} onChange={event=>{setName(event.target.value);setResult(undefined);}} maxLength={24} autoComplete="off" disabled={busy}/>
       <button type="submit" disabled={busy||name.trim().length<3}>Find player</button>
      </form>
     </div>
     {result===null&&<p className="social111-notice" role="status">No player found. Check the exact name.</p>}
     {result&&<article className="social111-request" aria-label={'Search result for '+result.identity.displayName}>
      <Person identity={result.identity} label={result.relationship==='friend'?'Already friends':result.relationship==='incoming'?'Incoming request':result.relationship==='outgoing'?'Request sent':'Search result'}/>
      {result.relationship!=='friend'&&requestActions(result,result.relationship)}
     </article>}
     {inbox.ready&&<section className="social114-friends" aria-label="Your friends">
      <div className="social114-summary"><span>{inbox.friends.filter(f=>f.presence==='online').length} online</span></div>
      {inbox.friends.length?inbox.friends.map(friend=>{
       const key='invite:'+friend.id;
       const choosing=selected===key;
       const presence=friend.presence??'unknown';
       return <article className="social114-friend" key={friend.id} aria-label={`${friend.identity.displayName}, ${presenceLabels[presence]}`}>
        <div className="social115-friend-row">
         <span className="social114-avatar"><img src={portrait85(friend.identity.avatarId).image} alt=""/><i data-presence={presence} aria-hidden="true"/></span>
         <div className="social115-identity"><strong>{friend.identity.displayName}</strong><span data-presence={presence}>{presenceLabels[presence]}</span></div>
         <button type="button" className="social115-invite" disabled={busy} aria-label={'Invite '+friend.identity.displayName+' to duel'} aria-expanded={choosing} onClick={()=>choosing?setSelected(null):invite(friend)}>Invite</button>
         {friendOptions(friend)}
        </div>
        {choosing&&<div className="social115-invite-setup">{deckPicker(key)}<div className="social111-actions"><button className="social111-primary" disabled={busy||!deck} onClick={()=>invite(friend)}>Send invite</button><button disabled={busy} onClick={()=>setSelected(null)}>Cancel</button></div></div>}
       </article>;
      }):<p className="social111-empty">Find a player by name to add your first friend.</p>}
     </section>}
     {inbox.blocked.length>0&&<details className="social145-blocked"><summary>Blocked players · {inbox.blocked.length}</summary>
      {inbox.blocked.map(person=><div className="social145-blocked-row" key={person.id}><span>{person.identity.displayName}</span><button disabled={busy} onClick={()=>manage(person,'unblock')}>Unblock</button></div>)}
     </details>}
    </>}

    {tab==='requests'&&<>
     {incoming.map(item=><article className="social111-request" key={item.key} aria-label={'Friend request from '+item.identity.displayName}>
      <Person identity={item.identity} label="Incoming friend request"/>
      {requestActions(item,'incoming')}
     </article>)}
     {inbox.outgoing.map(person=><article className="social111-request" key={person.id} aria-label={'Friend request to '+person.identity.displayName}>
      <Person identity={person.identity} label="Friend request sent"/>
      {requestActions(person,'outgoing')}
     </article>)}
     {inbox.ready&&!incoming.length&&!inbox.outgoing.length&&!inbox.error&&<p className="social111-empty">No pending friend requests.</p>}
    </>}

    {tab==='duels'&&<>
     <CurrentDuel112 userId={owner} embedded={embedded}/>
     {incomingDuels.map(item=><article className="social111-request" key={item.key} aria-label={'Duel invitation from '+item.identity.displayName}>
      <Person identity={item.identity} label="Invites you to a private duel"/>
      {selected===item.key&&deckPicker(item.key)}
      <div className="social111-actions"><button className="social111-primary" disabled={busy||(selected===item.key&&!deck)} onClick={()=>reply(item,'accept')}>{selected===item.key?'Join duel':'Choose deck'}</button><button disabled={busy} onClick={()=>reply(item,'decline')}>Decline</button></div>
     </article>)}
     {inbox.invites.map(item=><article className="social111-request" key={item.id} aria-label={`Duel with ${item.identity.displayName}`}>
      <Person identity={item.identity} label={item.status==='matched'?'Your duel is ready':'Waiting for your friend'}/>
      <div className="social111-actions">{item.status==='matched'?
       <button className="social111-primary" disabled={busy} onClick={()=>joinDuel(item.id,owner)}>Enter duel</button>:<>
        <a href="/play" target={target}>Open waiting room</a>
        <button disabled={busy} onClick={()=>cancelInvite(item.id)}>Cancel invitation</button>
       </>}
      </div>
     </article>)}
     {inbox.ready&&!incomingDuels.length&&!inbox.invites.length&&!inbox.error&&<p className="social111-empty">No private invitations right now.</p>}
    </>}
   </div>
  </section>}
  <div className="social111-launcher-row">
   <span className="social111-live" role="status" aria-live="polite">{inbox.toast?`${inbox.toast.kind==='duel'?'Duel invitation':'Friend request'} from ${inbox.toast.identity.displayName}`:''}</span>
   <button ref={launcher} className="social111-launcher" aria-label={`Friends and duels${inbox.items.length?`, ${inbox.items.length} pending`:''}`} aria-expanded={open} aria-controls="social111-inbox" onClick={()=>open?close():show()}>
    <ChatIcon/><span>Friends</span>{inbox.items.length>0&&<b>{inbox.items.length>99?'99+':inbox.items.length}</b>}
   </button>
  </div>
 </div>;
}
