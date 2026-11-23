'use client';
import {editionProgress131} from '../../../public/game/platform/edition-catalog131.mjs';
import './editions131.css';
const ALPHA131=editionProgress131('alpha');
import {useEffect,useRef,useState} from 'react';
import AlphaBoosterPack from './AlphaBoosterPack';
import AlphaBoosterOdds from './AlphaBoosterOdds';
import PlayerBalances from './PlayerBalances';
import {ShopTabs81,ShardShop81,ArenaSkins81,IdentityCosmetics85,type ShopCategory81} from './ShopCatalog81';
import useBoosterAudio from './useBoosterAudio';
import BoosterTear from './BoosterTear';
import BoosterRevealCard from './BoosterRevealCard';
import BoosterStack from './BoosterStack';
import usePlayerCollection from './usePlayerCollection';
import {BoosterPurchaseError,buyAlphaBooster,loadBooster,loadUnopenedBoosters,findBoosterRequest,openAlphaBooster,type BoosterCurrency,type BoosterPurchase} from '@/lib/duelverse/account';
import {ALPHA_BOOSTER,previewAlphaPack,revealedSlots,validAlphaPack} from '../../../public/game/platform/alpha-booster36.mjs';
import {ALL_PACK_SLOTS,unopenedPacks,prepareManualOpening,flipPackSlot} from '../../../public/game/platform/booster-opening58.mjs';
import {getVariant} from '../../../public/game/platform/catalog.mjs';
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
 const [autoTear,setAutoTear]=useState(false),[revealEffectSlot,setRevealEffectSlot]=useState<number|null>(null);
 const [confirmation,setConfirmation]=useState<BoosterCurrency|null>(null),[pending,setPending]=useState<Pending|null>(null),[busy,setBusy]=useState(false),[loadingHistory,setLoadingHistory]=useState(false),[error,setError]=useState(''),[reload,setReload]=useState(0),[previewRun,setPreviewRun]=useState(0);
 const dialog=useRef<HTMLDialogElement>(null),openingRef=useRef<HTMLDialogElement>(null),generation=useRef(0),openingRun=useRef(0),purchaseLock=useRef(false),historyRef=useRef<BoosterPurchase[]>([]),mounted=useRef(true);
 const currentUser=useRef(userId),shownRef=useRef<number[]>([]);currentUser.current=userId;
 function showSlots(slots:number[]){shownRef.current=slots;setShown(slots);}
 const live=(ticket:number)=>mounted.current&&ticket===generation.current;
 const cards=preview?previewAlphaPack():pack?.cards??[],opening=stage==='opening'&&cards.length===5;
 const revealFinish=revealEffectSlot===null?null:getVariant(cards[revealEffectSlot])?.rarity;
 const queued=unopenedPacks(history,opening?pack?.id??null:null) as BoosterPurchase[];
 const working=phase==='saving',locked=busy||loadingHistory||!!pending||confirmation!==null;
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;generation.current++;openingRun.current++;};},[]);
 function updateHistory(p:BoosterPurchase){const rows=[p,...historyRef.current.filter(row=>row.id!==p.id)];historyRef.current=rows;setHistory(rows);}
 function acceptPack(p:BoosterPurchase,tear=false){
  if(!validAlphaPack(p.cards))throw Error('This booster could not be displayed. Your cards remain saved.');
  openingRun.current++;sound.stop();setError('');const url=new URL(window.location.href);url.searchParams.delete('open');url.searchParams.set('booster',p.id);window.history.replaceState(null,'',url.pathname+url.search);setPack(p);showSlots(revealedSlots(p.revealed_slots));setPackOpened(p.revealed_slots.length>0);setPhase(revealedSlots(p.revealed_slots).length===5?'done':'idle');setPreview(false);setAutoTear(tear);setRevealEffectSlot(null);setStage('opening');
 }
 useEffect(()=>{
  sound.stop();const ticket=++generation.current;openingRun.current++;purchaseLock.current=false;setPack(null);setHistory([]);historyRef.current=[];setPreview(false);setPackOpened(false);setAutoTear(false);setRevealEffectSlot(null);setStage('sealed');showSlots([]);setPhase('idle');setConfirmation(null);setPending(null);setBusy(false);setError('');
  if(!ready||!userId||!player){setLoadingHistory(false);return;}
  const owner=userId;setLoadingHistory(true);
  (async()=>{try{
   const saved=readPending(owner);if(live(ticket))setPending(saved);
   const rows=await loadUnopenedBoosters();if(!live(ticket))return;
   historyRef.current=rows;setHistory(rows);
   if(saved){const restored=rows.find(p=>p.request_id===saved.id)??await findBoosterRequest(saved.id);if(!live(ticket))return;if(restored){updateHistory(restored);acceptPack(restored);localStorage.removeItem(pendingKey(owner));setPending(null);await refresh();}}
   else {
    const requested=requestedBooster(window.location.search);
    if(requested){const restored=rows.find(p=>p.id===requested)??await loadBooster(requested);if(!live(ticket))return;updateHistory(restored);acceptPack(restored);}
    else if(new URLSearchParams(window.location.search).get('open')==='next'){
     const next=(unopenedPacks(rows) as BoosterPurchase[])[0];
     if(next)acceptPack(next);
    }
   }
  }catch(e){if(live(ticket))setError(e instanceof Error?e.message:'Your boosters could not be loaded.');}finally{if(live(ticket))setLoadingHistory(false);}})();
 // Balance refreshes preserve the current opening; identity changes replace it.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[ready,userId,Boolean(player),reload]);
 useEffect(()=>{if(confirmation)dialog.current?.showModal();else dialog.current?.close();},[confirmation]);
 useEffect(()=>{
  const scene=openingRef.current;
  if(!opening||!scene)return;
  scene.showModal();
  return()=>scene.close();
 },[opening]);
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
 function startPreview(){if(busy||working)return;openingRun.current++;sound.stop();setPack(null);setPreview(true);setPreviewRun(n=>n+1);showSlots([]);setPackOpened(false);setAutoTear(false);setRevealEffectSlot(null);setPhase('idle');setStage('opening');setError('');}
 function revealAll(){if(phase!=='manual')return;openingRun.current++;sound.stop();setRevealEffectSlot(null);showSlots([...ALL_PACK_SLOTS]);setPhase('done');}
 function revealCard(slot:number){if(phase!=='manual'||shownRef.current.includes(slot))return;const next=flipPackSlot(shownRef.current,slot);setRevealEffectSlot(slot);showSlots(next);sound.unlock();sound.reveal(getVariant(cards[slot])!.rarity);if(next.length===5)setPhase('done');}
 useEffect(()=>{
  if(!opening||!packOpened||phase!=='manual')return;
  const finish=()=>{sound.stop();setRevealEffectSlot(null);showSlots([...ALL_PACK_SLOTS]);setPhase('done');};
  const hidden=()=>{if(document.hidden)finish();};
  document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',finish);hidden();
  return()=>{document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',finish);};
  // The saved pack is already complete, including when closing the browser abruptly.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[opening,packOpened,phase,pack?.id,previewRun]);
 function back(){if(phase==='saving'||busy)return;const url=new URL(window.location.href);url.searchParams.delete('booster');url.searchParams.delete('open');window.history.replaceState(null,'',url.pathname+url.search);openingRun.current++;sound.stop();setPack(null);setStage('sealed');setPreview(false);setRevealEffectSlot(null);setPhase('idle');setError('');}
 function openNext(){const next=queued[0];if(!next||locked||working)return;sound.unlock();acceptPack(next,true);}
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
 const [category,setCategory]=useState<ShopCategory81>('boosters');
 useEffect(()=>{const c=new URLSearchParams(window.location.search).get('category');if(c==='shards'||c==='arenas'||c==='frames'||c==='portraits')setCategory(c);},[]);
 function changeCategory(c:ShopCategory81){setCategory(c);const url=new URL(window.location.href);url.searchParams.set('category',c);window.history.replaceState(null,'',url.pathname+url.search);}
 const selectedPrice=confirmation?ALPHA_BOOSTER.prices[confirmation]:0;
 const stock=loadingHistory?<p role="status">Loading boosters…</p>:!error&&<BoosterStack count={queued.length} onOpen={openNext} disabled={locked}/>;
 return <section className="portal-section top-space alpha-booster-page">
 <div className="alpha-shop-heading"><div><h1>{shop?'Shop':'Boosters'}</h1><div className="alpha-shop-links">{!shop&&<a className="alpha-back-link" href="/shop">Back to shop</a>}{userId&&<a className="alpha-history-link" href="/account/private/boosters">Your boosters</a>}</div></div><div className="alpha-shop-controls">{shop&&!opening&&category!=='shards'&&<a className="button gold alpha-buy-shards82" href="/shop?category=shards" onClick={e=>{e.preventDefault();changeCategory('shards');}}>Buy Shards</a>}<PlayerBalances ready={ready} userId={userId} player={player}/></div></div>
 {shop&&!opening&&<ShopTabs81 category={category} onChange={changeCategory}/>}
 {!opening&&(accountError||error)&&<div className="alpha-booster-error" role="alert"><p>{error||accountError}</p><button className="button glass" onClick={()=>setReload(n=>n+1)}>Try again</button></div>}
 {pending&&<div className="player-note" role="status">A purchase needs confirmation. Restore the same pack without a second charge. <button className="button glass" disabled={busy||loadingHistory} onClick={()=>purchase(pending.currency)}>{busy?'Checking…':'Restore purchase'}</button></div>}
 {opening?<dialog className="alpha-opening alpha-opening--guided" ref={openingRef} data-opening-phase={phase} data-revealing={packOpened} aria-labelledby="alpha-opening-title" onCancel={e=>{e.preventDefault();back();}}>
  <div className="alpha-opening-toolbar">
   <button type="button" className="alpha-opening-exit" disabled={working||busy} onClick={back}><span aria-hidden="true">←</span> Back to boosters</button>
   {sound.available&&<button type="button" className="alpha-sound-toggle" aria-pressed={sound.enabled} onClick={sound.toggle}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/>{sound.enabled?<path d="M16 8a6 6 0 0 1 0 8m3-10a9 9 0 0 1 0 12"/>:<path d="m16 9 5 6m0-6-5 6"/>}</svg>
    Sound {sound.enabled?'on':'off'}
   </button>}
  </div>
  <div className="alpha-opening-heading">
   <span className="alpha-eyebrow">{preview?'Opening preview':pack?.currency==='starter'?'Welcome gift':'Alpha edition'}</span>
   <h2 id="alpha-opening-title">{!packOpened?'Alpha Booster':phase==='done'?'Pack complete':'Reveal your cards'}</h2>
   {packOpened&&<div className="alpha-reveal-count" role="status" aria-label={`${shown.length} of 5 cards revealed`}>{Array.from({length:5},(_,i)=><i key={i} className={i<shown.length?'is-lit':''}/>)}<span>{shown.length} / 5</span></div>}
  </div>
  {(error||phase==='saving')&&<p className="alpha-opening-status" role={error?'alert':'status'}>{error||'Preparing your pack…'}</p>}
  <div className="alpha-opening-viewport">
   <div className="alpha-forge" aria-hidden="true"><div className="alpha-forge-halo"/></div>
   {!packOpened?<BoosterTear key={preview?'preview:'+previewRun:pack?.id} autoStart={autoTear} onOpened={()=>setPackOpened(true)} onOpen={sound.tear} onSkip={sound.stop}/>:<div className="alpha-reveal-stage">
    {revealFinish&&['epic','legendary','mythic'].includes(revealFinish)&&<div key={revealEffectSlot} className="alpha-stage-surge" data-finish={revealFinish} aria-hidden="true"/>}
    <div className="alpha-reveal-grid" aria-busy={phase==='saving'}>{cards.map((id,i)=><BoosterRevealCard key={(preview?'preview:'+previewRun:pack?.id)+':'+i} id={id} slot={i} visible={shown.includes(i)} celebrateFlip={revealEffectSlot===i} disabled={phase!=='manual'} isNew={!preview&&Boolean(pack?.new_variants.includes(id))} onReveal={()=>revealCard(i)}/>)}</div>
   </div>}
  </div>
  <div className="alpha-pack-finish">
   <div className="actions alpha-opening-actions">
    {phase==='error'&&<button className="button gold" onClick={()=>void beginOpening()}>Retry opening</button>}
    {phase==='manual'&&<button className="button glass" onClick={revealAll}>Reveal all now</button>}
    {(phase==='done'||phase==='manual')&&!preview&&queued.length>0&&<button className="button gold alpha-next-pack" disabled={locked} onClick={openNext}>Open next booster <span className="alpha-next-count">×{queued.length}</span><span aria-hidden="true">→</span></button>}
    {phase==='done'&&preview&&<button className="button gold" onClick={startPreview}>Replay preview</button>}
    {phase==='done'&&!preview&&queued.length===0&&<a className="button gold" href="/decks">Build a deck</a>}
   </div>
  </div>
 </dialog>:shop&&category==='shards'?<ShardShop81/>:shop&&category==='arenas'?<ArenaSkins81/>:shop&&(category==='frames'||category==='portraits')?<IdentityCosmetics85 kind={category}/>:<>
  {!shop&&userId?<section className="alpha-stock" aria-label="Your unopened boosters">
   {stock}
   <div className="alpha-stock-links">{queued.length>0&&<a href="/shop">Get boosters</a>}<button className="alpha-preview-button" disabled={locked} onClick={startPreview}>Try the opening preview</button></div>
  </section>:<div className="alpha-booster-showcase">
   <div className="alpha-booster-art-stage">{queued.length>0&&!error?stock:<><AlphaBoosterPack/><span className="alpha-booster-art-caption">ALPHA BOOSTER · FIRST EDITION</span></>}</div>
   <div className="alpha-booster-product"><span className="alpha-eyebrow">First edition</span><h2>Alpha Booster</h2><small className="alpha-set131">Alpha · {ALPHA131.released}/{ALPHA131.size} motifs released · {ALPHA131.pending} in development. Packs contain released cards only.</small><div className="alpha-booster-flags"><span>5 cards</span><span>At least 1 Silver or higher</span><span>Duplicate protection</span></div><div className="alpha-purchase-options"><button className="button gold" disabled={locked||!player||player.pixels<100} onClick={()=>setConfirmation('pixels')}><strong>100 Pixels</strong><span>Buy with Pixels</span></button><button className="button glass" disabled={locked||!player||player.shards<150} onClick={()=>setConfirmation('shards')}><strong>150 Shards</strong><span>Buy with Shards</span></button></div>{ready&&!userId?<p className="muted"><a href="/account">Sign in</a> to buy.</p>:player&&<p className="muted">Uses your current balance · <a href="/shop?category=shards" onClick={e=>{if(shop){e.preventDefault();changeCategory('shards');}}}>Get Shards</a></p>}<button className="alpha-preview-button" disabled={locked} onClick={startPreview}>Try the opening preview</button></div>
  </div>}
  <a className="alpha-crafting-link" href="/collection"><span><strong>Craft cards</strong><small>Regular · Normal, Silver, Gold</small></span><span>Use Echoes</span></a>
 </>}
 {!opening&&(!shop||category==='boosters')&&<AlphaBoosterOdds/>}
 <dialog ref={dialog} className="card-trade-dialog alpha-purchase-dialog" aria-labelledby="alphaPurchaseTitle" onCancel={e=>{e.preventDefault();if(!busy)setConfirmation(null);}}><h2 id="alphaPurchaseTitle">Buy one Alpha Booster?</h2><AlphaBoosterPack compact/><p>Five cards. At least one Silver or higher. Duplicate protection included.</p><p><strong>{selectedPrice} {confirmation==='pixels'?'Pixels':'Shards'}</strong> will be deducted from your account balance.</p><div className="actions"><button className="button glass" disabled={busy} onClick={()=>setConfirmation(null)}>Cancel</button><button className="button gold" disabled={busy||!confirmation} onClick={()=>confirmation&&purchase(confirmation)}>{busy?'Saving your booster…':`Buy for ${selectedPrice} ${confirmation==='pixels'?'Pixels':'Shards'}`}</button></div></dialog>
 </section>;
}
