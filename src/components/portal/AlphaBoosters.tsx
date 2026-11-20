'use client';
import {useEffect,useRef,useState} from 'react';
import AlphaBoosterPack from './AlphaBoosterPack';
import PlayerBalances from './PlayerBalances';
import useBoosterAudio from './useBoosterAudio';
import BoosterTear from './BoosterTear';
import BoosterRevealCard from './BoosterRevealCard';
import usePlayerCollection from './usePlayerCollection';
import {BoosterPurchaseError,buyAlphaBooster,loadBooster,loadBoosterHistory,loadUnopenedBoosters,findBoosterRequest,openAlphaBooster,type BoosterCurrency,type BoosterPurchase} from '@/lib/duelverse/account';
import {ALPHA_BOOSTER,ALPHA_ODDS,previewAlphaPack,revealedSlots,validAlphaPack} from '../../../public/game/platform/alpha-booster36.mjs';
import {ALL_PACK_SLOTS,unopenedPacks,prepareManualOpening,flipPackSlot} from '../../../public/game/platform/booster-opening58.mjs';
import {RARITIES,getVariant} from '../../../public/game/platform/catalog.mjs';
import {requestedBooster} from '../../../public/game/platform/player-area49.mjs';
import './alpha-boosters.css';
import './booster-opening.css';
type Pending={id:string;currency:BoosterCurrency};
type Phase='idle'|'saving'|'manual'|'done'|'error';
const pendingKey=(user:string)=>'duelverse.booster-pending.v36:'+user;
function readPending(user:string):Pending|null{const key=pendingKey(user);try{const raw=localStorage.getItem(key);if(!raw)return null;const p=JSON.parse(raw);if(typeof p?.id==='string'&&/^[0-9a-f-]{36}$/i.test(p.id)&&['pixels','shards'].includes(p.currency))return p;}catch{}localStorage.removeItem(key);return null;}

export default function AlphaBoosters({shop=false}:{shop?:boolean}){
 const {ready,userId,player,error:accountError,refresh}=usePlayerCollection(),sound=useBoosterAudio();
 const [pack,setPack]=useState<BoosterPurchase|null>(null),[history,setHistory]=useState<BoosterPurchase[]>([]),[stage,setStage]=useState<'sealed'|'opening'>('sealed'),[packOpened,setPackOpened]=useState(false),[preview,setPreview]=useState(false),[shown,setShown]=useState<number[]>([]),[phase,setPhase]=useState<Phase>('idle');
 const [confirmation,setConfirmation]=useState<BoosterCurrency|null>(null),[pending,setPending]=useState<Pending|null>(null),[busy,setBusy]=useState(false),[loadingHistory,setLoadingHistory]=useState(false),[error,setError]=useState(''),[reload,setReload]=useState(0),[previewRun,setPreviewRun]=useState(0);
 const dialog=useRef<HTMLDialogElement>(null),openingRef=useRef<HTMLDivElement>(null),generation=useRef(0),openingRun=useRef(0),purchaseLock=useRef(false),historyRef=useRef<BoosterPurchase[]>([]),mounted=useRef(true);
 const currentUser=useRef(userId),shownRef=useRef<number[]>([]);currentUser.current=userId;
 function showSlots(slots:number[]){shownRef.current=slots;setShown(slots);}
 const live=(ticket:number)=>mounted.current&&ticket===generation.current;
 const cards=preview?previewAlphaPack():pack?.cards??[],opening=stage==='opening'&&cards.length===5;
 const queued=unopenedPacks(history,opening?pack?.id??null:null) as BoosterPurchase[];
 const working=phase==='saving',locked=busy||loadingHistory||!!pending||confirmation!==null;
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;generation.current++;openingRun.current++;};},[]);
 function updateHistory(p:BoosterPurchase){const rows=[p,...historyRef.current.filter(row=>row.id!==p.id)];historyRef.current=rows;setHistory(rows);}
 function acceptPack(p:BoosterPurchase){
  if(!validAlphaPack(p.cards))throw Error('This booster could not be displayed. Your cards remain saved.');
  openingRun.current++;sound.stop();setError('');const url=new URL(window.location.href);url.searchParams.set('booster',p.id);window.history.replaceState(null,'',url.pathname+url.search);setPack(p);showSlots(revealedSlots(p.revealed_slots));setPackOpened(p.revealed_slots.length>0);setPhase(revealedSlots(p.revealed_slots).length===5?'done':'idle');setPreview(false);setStage('opening');
 }
 useEffect(()=>{
  sound.stop();const ticket=++generation.current;openingRun.current++;purchaseLock.current=false;setPack(null);setHistory([]);historyRef.current=[];setPreview(false);setPackOpened(false);setStage('sealed');showSlots([]);setPhase('idle');setConfirmation(null);setPending(null);setBusy(false);setError('');
  if(!ready||!userId||!player){setLoadingHistory(false);return;}
  const owner=userId;setLoadingHistory(true);
  (async()=>{try{
   const saved=readPending(owner);if(live(ticket))setPending(saved);
   const [recent,unopened]=await Promise.all([loadBoosterHistory(),loadUnopenedBoosters()]);if(!live(ticket))return;
   const rows=[...new Map([...recent,...unopened].map(p=>[p.id,p])).values()];historyRef.current=rows;setHistory(rows);
   if(saved){const restored=rows.find(p=>p.request_id===saved.id)??await findBoosterRequest(saved.id);if(!live(ticket))return;if(restored){updateHistory(restored);acceptPack(restored);localStorage.removeItem(pendingKey(owner));setPending(null);await refresh();}}
   else {const requested=requestedBooster(window.location.search);if(requested){const restored=rows.find(p=>p.id===requested)??await loadBooster(requested);if(!live(ticket))return;updateHistory(restored);acceptPack(restored);}}
  }catch(e){if(live(ticket))setError(e instanceof Error?e.message:'Your boosters could not be loaded.');}finally{if(live(ticket))setLoadingHistory(false);}})();
 // Balance refreshes preserve the current opening; identity changes replace it.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[ready,userId,Boolean(player),reload]);
 useEffect(()=>{if(confirmation)dialog.current?.showModal();else dialog.current?.close();},[confirmation]);
 useEffect(()=>{if(opening)openingRef.current?.scrollIntoView({block:'start',behavior:'instant'});},[opening,packOpened,preview,pack?.id]);
 async function beginOpening(){
  const target=pack,owner=userId,ticket=generation.current,run=++openingRun.current;
  if(!preview&&(!target||!owner))return;
  const active=()=>live(ticket)&&run===openingRun.current&&currentUser.current===owner;
  setError('');setPhase('saving');
  try{
   const result=await prepareManualOpening({cards,shown:shownRef.current,save:preview?async()=>{}:()=>openAlphaBooster(target!.id),active});
   if(!result)return;
   if(target&&!preview){const complete={...target,revealed_slots:result.savedSlots};setPack(complete);updateHistory(complete);}
   showSlots(result.visibleSlots);setPhase(result.visibleSlots.length===5?'done':'manual');
  }catch(e){if(active()){setPhase('error');setError(e instanceof Error?e.message:'Opening could not be confirmed. Please retry this pack.');}}
 }
 useEffect(()=>{
  if(!opening||!packOpened||(!preview&&revealedSlots(pack?.revealed_slots??[]).length===5))return;
  void beginOpening();
  // Save the whole pack after tearing; individual flips remain under the player’s control.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[opening,packOpened,pack?.id,preview,previewRun]);
 function startPreview(){if(busy||working)return;openingRun.current++;sound.stop();setPack(null);setPreview(true);setPreviewRun(n=>n+1);showSlots([]);setPackOpened(false);setPhase('idle');setStage('opening');setError('');}
 function revealAll(){if(phase!=='manual')return;openingRun.current++;sound.stop();showSlots([...ALL_PACK_SLOTS]);setPhase('done');}
 function revealCard(slot:number){if(phase!=='manual'||shownRef.current.includes(slot))return;const next=flipPackSlot(shownRef.current,slot);showSlots(next);sound.unlock();sound.reveal(getVariant(cards[slot])!.rarity);if(next.length===5)setPhase('done');}
 useEffect(()=>{
  if(!opening||!packOpened||phase!=='manual')return;
  const finish=()=>{sound.stop();showSlots([...ALL_PACK_SLOTS]);setPhase('done');};
  const hidden=()=>{if(document.hidden)finish();};
  document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',finish);hidden();
  return()=>{document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',finish);};
  // The saved pack is already complete, including when closing the browser abruptly.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[opening,packOpened,phase,pack?.id,previewRun]);
 function back(){if(phase==='saving'||busy)return;const url=new URL(window.location.href);url.searchParams.delete('booster');window.history.replaceState(null,'',url.pathname+url.search);openingRun.current++;sound.stop();setPack(null);setStage('sealed');setPreview(false);setPhase('idle');setError('');}
 function openNext(){const next=queued[0];if(!next||locked||working)return;sound.unlock();acceptPack(next);}
 async function purchase(currency:BoosterCurrency){
  if(purchaseLock.current||!userId||!player)return;const owner=userId,ticket=generation.current;purchaseLock.current=true;setBusy(true);setError('');let request:Pending|undefined;
  try{
   request=readPending(owner)??{id:crypto.randomUUID(),currency};if(request.currency!==currency)throw Error('Restore the pending purchase before choosing another currency.');
   localStorage.setItem(pendingKey(owner),JSON.stringify(request));if(live(ticket))setPending(request);
   const id=await buyAlphaBooster(request.id,request.currency),result=await loadBooster(id);if(!live(ticket))return;
   updateHistory(result);acceptPack(result);setConfirmation(null);localStorage.removeItem(pendingKey(owner));setPending(null);await refresh();
  }catch(e){if(!live(ticket))return;if(e instanceof BoosterPurchaseError&&e.definitive){localStorage.removeItem(pendingKey(owner));setPending(null);}setConfirmation(null);setError(e instanceof Error?e.message:'Your purchase could not be confirmed.');}
  finally{if(live(ticket)){setBusy(false);purchaseLock.current=false;}}
 }
 const selectedPrice=confirmation?ALPHA_BOOSTER.prices[confirmation]:0;
 return <section className="portal-section top-space alpha-booster-page">
 <div className="alpha-shop-heading"><div><h1>{shop?'Shop':'Boosters'}</h1>{!shop&&<a className="alpha-back-link" href="/shop">Back to shop</a>}{userId&&<a className="alpha-history-link" href="/account/private/boosters">Your booster history</a>}</div><div className="alpha-shop-controls"><PlayerBalances ready={ready} userId={userId} player={player}/><button className="alpha-sound-toggle" type="button" aria-label="Booster sound" aria-pressed={sound.enabled} disabled={!sound.available} onClick={sound.toggle} data-audio-state={sound.running?'running':'idle'} data-last-sound={sound.lastCue} data-sound-count={sound.playCount}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/>{sound.enabled?<><path d="M16 8c2 2 2 6 0 8M19 5c4 4 4 10 0 14"/></>:<path d="m17 9 5 6m0-6-5 6"/>}</svg><span>{sound.available?`Sound ${sound.enabled?'on':'off'}`:'Sound unavailable'}</span></button></div></div>
 {(accountError||error)&&<div className="alpha-booster-error" role="alert"><p>{error||accountError}</p>{!opening&&<button className="button glass" onClick={()=>setReload(n=>n+1)}>Try again</button>}</div>}
 {pending&&<div className="player-note" role="status">A purchase needs confirmation. Restore the same pack without a second charge. <button className="button glass" disabled={busy||loadingHistory} onClick={()=>purchase(pending.currency)}>{busy?'Checking…':'Restore purchase'}</button></div>}
 {opening?<div className="alpha-opening alpha-opening--guided" ref={openingRef} data-opening-phase={phase}>
  <div className="alpha-opening-heading"><div><span className="alpha-eyebrow">Alpha · First edition {preview?'· Preview':pack?.currency==='starter'?'· Welcome gift':''}</span><h2>{!packOpened?'Ready to rip?':phase==='done'?'Your five new cards.':'A little chaos. Five cards.'}</h2><p role="status">{!packOpened?'Tear it open. Flip each card yourself.':phase==='saving'?'Preparing your pack…':phase==='error'?'Your pack is safe. Retry to finish opening.':phase==='done'?(preview?'Preview complete. No account cards changed.':'Pack complete. All five cards are saved.'):'Click a card to flip it. Leaving reveals the rest.'}</p></div>{packOpened&&<div className="alpha-reveal-count" aria-label={`${shown.length} of 5 cards revealed`}>{Array.from({length:5},(_,i)=><i key={i} className={i<shown.length?'is-lit':''}/>)}<span>{shown.length} / 5</span></div>}</div>
  {preview&&<div className="alpha-preview-note">Effects preview · no account cards or currency are changed.</div>}
  {!packOpened?<BoosterTear key={preview?'preview:'+previewRun:pack?.id} onOpened={()=>setPackOpened(true)} onOpen={sound.tear} onSkip={sound.stop}/>:<div className="alpha-reveal-grid">{cards.map((id,i)=><BoosterRevealCard key={(preview?'preview:'+previewRun:pack?.id)+':'+i} id={id} slot={i} visible={shown.includes(i)} saving={phase==='saving'} disabled={phase!=='manual'} isNew={!preview&&Boolean(pack?.new_variants.includes(id))} onReveal={()=>revealCard(i)}/>)}</div>}
  <div className="alpha-pack-finish" data-complete={phase==='done'}>
   <div className="alpha-pack-finish-copy"><strong>{phase==='done'?'Pack complete':preview?'Opening preview':`${queued.length} more ${queued.length===1?'booster':'boosters'}`}</strong><span>{phase==='done'?(preview?'Try it again or open your own packs.':queued.length?`${queued.length} unopened ${queued.length===1?'pack is':'packs are'} waiting.`:'All your packs are open. Time to build a deck.'):'Your cards and opening progress are safe.'}</span></div>
   <div className="actions alpha-opening-actions">
    {phase==='error'&&<button className="button gold" onClick={()=>void beginOpening()}>Retry opening</button>}
    {phase==='manual'&&<button className="button glass" onClick={revealAll}>Reveal all now</button>}
    {(phase==='done'||phase==='manual')&&!preview&&queued.length>0&&<button className="button gold alpha-next-pack" disabled={locked} onClick={openNext}>Open next booster <span aria-hidden="true">→</span></button>}
    {phase==='done'&&preview&&<button className="button gold" onClick={startPreview}>Replay preview</button>}
    {phase==='done'&&!preview&&queued.length===0&&<a className="button gold" href="/decks">Build a deck</a>}
    <button className="button glass" disabled={phase==='saving'||busy} onClick={back}>Back to shop</button>
   </div>
  </div>
 </div>:<>
  {userId&&<section className="alpha-owned-vault" aria-label="Your unopened boosters"><div className="alpha-owned-stack" aria-hidden="true">{[0,1,2].map(n=><div key={n}><AlphaBoosterPack compact/></div>)}</div><div className="alpha-owned-copy"><span className="alpha-eyebrow">Your packs</span><h2>{loadingHistory?'Finding your boosters…':`${queued.length} ${queued.length===1?'booster':'boosters'} waiting.`}</h2><p>{queued.length?'Already yours. Open them without spending currency.':'Your opened cards are waiting in your collection.'}</p></div><div className="alpha-owned-action">{queued.length>0?<button className="button gold" disabled={locked} onClick={openNext}>Open a booster <span aria-hidden="true">→</span></button>:<a href="/collection" className="button glass">View collection</a>}</div></section>}
  <div className="alpha-booster-showcase"><div className="alpha-booster-art-stage"><AlphaBoosterPack/><span>ALPHA BOOSTER · FIRST EDITION</span></div><div className="alpha-booster-product"><span className="alpha-eyebrow">First edition</span><h2>Alpha Booster</h2><div className="alpha-booster-flags"><span>5 cards</span><span>At least 1 Silver or higher</span><span>Duplicate protection</span></div><div className="alpha-purchase-options"><button className="button gold" disabled={locked||!player||player.pixels<100} onClick={()=>setConfirmation('pixels')}><strong>100 Pixels</strong><span>Buy with Pixels</span></button><button className="button glass" disabled={locked||!player||player.shards<150} onClick={()=>setConfirmation('shards')}><strong>150 Shards</strong><span>Buy with Shards</span></button></div>{ready&&!userId?<p className="muted"><a href="/account">Sign in</a> to buy.</p>:player&&<p className="muted">Uses your current balance · Shards top-ups unavailable.</p>}<button className="alpha-preview-button" disabled={locked} onClick={startPreview}>Try the opening preview</button></div></div>
  <a className="alpha-crafting-link" href="/collection"><span><strong>Craft cards</strong><small>Normal · Silver · Gold</small></span><span>Use Echoes</span></a>
 </>}
 <details className="booster-odds alpha-booster-odds"><summary>Contents &amp; drop rates</summary><p>Four slots use the standard rates below. One additional slot guarantees Silver or higher. The five slots are shuffled before opening. Welcome gifts, paid-currency and earned-currency boosters use the same rules.</p><table><thead><tr><th>Finish</th><th>Each standard slot</th><th>Guarantee slot</th></tr></thead><tbody>{RARITIES.map(r=><tr key={r.id}><th>{r.name}</th><td>{(Number(ALPHA_ODDS.standard.find(([id])=>id===r.id)?.[1]??0)/100).toFixed(2)}%</td><td>{(Number(ALPHA_ODDS.guaranteed.find(([id])=>id===r.id)?.[1]??0)/100).toFixed(2)}%</td></tr>)}</tbody></table><p>The finish is rolled first. Within it, variants acquired fewer than three times are selected uniformly. When every variant of that finish has been acquired three times, further duplicates become possible. This history includes crafted, starter and dismantled cards. A saved 15-card deck still permits at most three copies of a motif across all finishes.</p><p>Your five cards are saved when the pack is granted or purchased. Purchases save the charge in the same transaction. Flip cards individually. Leaving an opened pack reveals the rest; the complete contents are safely saved when you tear it open. Reloading never duplicates cards or charges again.</p></details>
 <dialog ref={dialog} className="card-trade-dialog alpha-purchase-dialog" aria-labelledby="alphaPurchaseTitle" onCancel={e=>{e.preventDefault();if(!busy)setConfirmation(null);}}><h2 id="alphaPurchaseTitle">Buy one Alpha Booster?</h2><AlphaBoosterPack compact/><p>Five cards. At least one Silver or higher. Duplicate protection included.</p><p><strong>{selectedPrice} {confirmation==='pixels'?'Pixels':'Shards'}</strong> will be deducted from your account balance.</p><div className="actions"><button className="button glass" disabled={busy} onClick={()=>setConfirmation(null)}>Cancel</button><button className="button gold" disabled={busy||!confirmation} onClick={()=>confirmation&&purchase(confirmation)}>{busy?'Saving your booster…':`Buy for ${selectedPrice} ${confirmation==='pixels'?'Pixels':'Shards'}`}</button></div></dialog>
 </section>;
}
