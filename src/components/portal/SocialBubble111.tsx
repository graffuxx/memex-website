'use client';
import {useEffect,useRef,useState} from 'react';
import {supabase} from '@/lib/supabaseClient';
import {socialAction92,friendReply92} from '@/lib/duelverse/friends92';
import {socialInbox111,useSocialInbox111,type InboxItem111} from '@/lib/duelverse/socialInbox111';
import {type SavedDeck} from '@/lib/duelverse/account';
import {portrait85} from '../../../public/game/platform/identity85.mjs';
import './social-bubble111.css';
type DeckState={owner:string;decks:SavedDeck[]};
const ChatIcon=()=> <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.4c0 4.1-3.6 7.4-8 7.4a9.3 9.3 0 0 1-3.2-.6L4 20l1.3-4.5A6.8 6.8 0 0 1 4 11.4C4 7.3 7.6 4 12 4s8 3.3 8 7.4Z" stroke="currentColor" strokeWidth="1.7"/><circle cx="8" cy="11" r="1" fill="currentColor"/><circle cx="12" cy="11" r="1" fill="currentColor"/><circle cx="16" cy="11" r="1" fill="currentColor"/></svg>;
export default function SocialBubble111({embedded=false}:{embedded?:boolean}){
 const inbox=useSocialInbox111(),[open,setOpen]=useState(false),[selected,setSelected]=useState<string|null>(null),[decks,setDecks]=useState<DeckState|null>(null),[deck,setDeck]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const scope=useRef(inbox.userId),lock=useRef(false),panel=useRef<HTMLElement>(null),launcher=useRef<HTMLButtonElement>(null),root=useRef<HTMLDivElement>(null);scope.current=inbox.userId;
 useEffect(()=>{setOpen(false);setSelected(null);setDecks(null);setDeck('');setError('');setNotice('');setBusy(false);lock.current=false;},[inbox.userId]);
 useEffect(()=>{if(!inbox.toast)return;const timer=setTimeout(()=>socialInbox111.dismiss(),9000);return()=>clearTimeout(timer);},[inbox.toast]);
 useEffect(()=>{if(!open)return;const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[open]);
 useEffect(()=>{if(!embedded)return;const send=()=>{window.parent.postMessage({type:'duelverse-social111-size',width:inbox.userId?(open||inbox.toast?390:160):0,height:inbox.userId?(open?640:inbox.toast?190:90):0},location.origin);};send();const closeMessage=(e:MessageEvent)=>{if(e.origin===location.origin&&e.source===window.parent&&e.data?.type==='duelverse-social111-close')setOpen(false);};window.addEventListener('message',closeMessage);return()=>window.removeEventListener('message',closeMessage);},[embedded,open,inbox.toast,inbox.userId]);
 function show(){setError('');setNotice('');socialInbox111.dismiss();setOpen(true);void socialInbox111.refresh();}
 function close(){setOpen(false);launcher.current?.focus();}
 async function act(item:InboxItem111,action:'accept'|'decline'){
  if(lock.current||!inbox.userId)return;lock.current=true;setBusy(true);setError('');setNotice('');const owner=inbox.userId;
  try{
   // Recheck the live session; a previous account's bubble must never act for a new account.
   const {data:{session}}=await supabase.auth.getSession();if(session?.user.id!==owner)throw Error('Your sign-in changed. Refresh and try again.');
   if(item.kind==='friend'){await socialAction92(item.id,action);if(scope.current!==owner)return;socialInbox111.remove(item.key);setNotice(action==='accept'?'Friend added.':'Request declined.');}
   else if(action==='decline'){await friendReply92(item.id,'decline',null);if(scope.current!==owner)return;socialInbox111.remove(item.key);setSelected(null);setNotice('Invitation declined.');}
   else if(selected!==item.key){
    setSelected(item.key);
    const {data,error:loadError}=await supabase.from('dv_decks').select('id,name,cards,active').order('created_at');if(loadError){setSelected(null);throw Error('Your saved decks could not be loaded. Try again.');}if(scope.current!==owner)return;
    const available=(data??[]).filter(d=>Array.isArray(d.cards)&&d.cards.length===15) as SavedDeck[];setDecks({owner,decks:available});setDeck(available.find(d=>d.active)?.id??available[0]?.id??'');
   }else{
    if(!deck||decks?.owner!==owner||!decks.decks.some(d=>d.id===deck))throw Error('Choose a saved 15-card deck first.');
    const id=await friendReply92(item.id,'accept',deck);if(scope.current!==owner)return;
    if(!id)throw Error('The invitation is no longer available.');
    try{localStorage.setItem('duelverse.match90.'+owner,id);}catch{}
    const url='/game/online.html?match='+encodeURIComponent(id);if(embedded)window.parent.postMessage({type:'duelverse-social111-join',id},location.origin);else location.assign(url);
   }
   if(scope.current===owner)await socialInbox111.refresh();
  }catch(e){if(scope.current===owner){setError(e instanceof Error?e.message:'Please try again.');void socialInbox111.refresh();}}
  finally{if(scope.current===owner){lock.current=false;setBusy(false);}}
 }
 if(!inbox.userId)return null;
 const requests=inbox.items.filter(i=>i.kind==='friend').length,duels=inbox.items.length-requests;
 return <div ref={root} className={'social111'+(embedded?' social111-embedded':'')} onKeyDown={e=>{if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();close();}}}>
  {!open&&inbox.toast&&<aside className="social111-toast" aria-label="New request"><button className="social111-toast-body" onClick={show}><img src={portrait85(inbox.toast.identity.avatarId).image} alt=""/><span><small>{inbox.toast.kind==='duel'?'DUEL INVITATION':'FRIEND REQUEST'}</small><strong>{inbox.toast.identity.displayName}</strong><span>{inbox.toast.kind==='duel'?'Ready for a duel?':'Wants to add you.'}</span></span></button><button className="social111-dismiss" aria-label="Dismiss notification" onClick={()=>socialInbox111.dismiss()}>×</button></aside>}
  {open&&<section ref={panel} id="social111-inbox" className="social111-panel" role="region" aria-label="Friends and invitations">
   <header><div><small>YOUR DUELVERSE</small><h2>Friends & duels</h2></div><button className="social111-close" onClick={close} aria-label="Close friends inbox">×</button></header>
   <div className="social111-counts"><span>{requests} friend request{requests!==1?'s':''}</span><span>{duels} duel invite{duels!==1?'s':''}</span><button onClick={()=>void socialInbox111.refresh()} aria-label="Refresh requests">↻</button></div>
   <div className="social111-scroll">
    {(error||inbox.error)&&<p className="social111-error" role="alert">{error||inbox.error}</p>}
    {notice&&<p className="social111-notice" role="status">{notice}</p>}
    {!inbox.ready&&!inbox.error&&<p className="social111-empty" role="status">Checking your requests…</p>}
    {inbox.ready&&!inbox.items.length&&!inbox.error&&<div className="social111-empty"><ChatIcon/><strong>All caught up.</strong><p>Friend requests and duel invitations<br/>will pop up right here.</p></div>}
    {inbox.items.map(item=><article className="social111-request" key={item.key} aria-label={`${item.kind==='duel'?'Duel invitation':'Friend request'} from ${item.identity.displayName}`}>
     <div className="social111-person"><img src={portrait85(item.identity.avatarId).image} alt=""/><div><small>{item.kind==='duel'?'DUEL INVITATION':'FRIEND REQUEST'}</small><strong>{item.identity.displayName}</strong><span>{item.kind==='duel'?'Invites you to a private duel.':'Wants to join your friends.'}</span></div></div>
     {item.kind==='duel'&&selected===item.key&&<div className="social111-deck"><label htmlFor={'social-deck-'+item.id}>Your 15-card deck</label><select id={'social-deck-'+item.id} value={deck} disabled={busy} onChange={e=>setDeck(e.target.value)}>{decks?.owner!==inbox.userId?<option value="">Loading decks…</option>:!decks.decks.length?<option value="">No saved 15-card decks</option>:decks.decks.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select>{decks?.owner===inbox.userId&&!decks.decks.length&&<a href="/decks" target={embedded?'_top':undefined}>Build a deck</a>}</div>}
     <div className="social111-actions"><button className="social111-primary" disabled={busy||item.kind==='duel'&&selected===item.key&&!deck} onClick={()=>void act(item,'accept')}>{busy?'Please wait…':item.kind==='friend'?'Accept':selected===item.key?'Join duel':'Choose deck'}</button><button disabled={busy} onClick={()=>void act(item,'decline')}>Decline</button></div>
    </article>)}
   </div><footer><a href="/account/private/friends" target={embedded?'_top':undefined}>Open friend list</a></footer>
  </section>}
  <div className="social111-launcher-row"><span className="social111-live" role="status" aria-live="polite">{inbox.toast?`${inbox.toast.kind==='duel'?'Duel invitation':'Friend request'} from ${inbox.toast.identity.displayName}`:''}</span><button ref={launcher} className="social111-launcher" aria-label={`Friends and duels${inbox.items.length?`, ${inbox.items.length} pending`:''}`} aria-expanded={open} aria-controls="social111-inbox" onClick={()=>open?close():show()}><ChatIcon/><span>Friends</span>{inbox.items.length>0&&<b>{inbox.items.length>99?'99+':inbox.items.length}</b>}</button></div>
 </div>;
}
