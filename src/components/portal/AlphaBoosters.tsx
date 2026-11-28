'use client';
import {editionProgress131} from '../../../public/game/platform/edition-catalog131.mjs';
import {useEffect,useRef,useState} from 'react';
import AlphaBoosterPack from './AlphaBoosterPack';
import AlphaBoosterOdds from './AlphaBoosterOdds';
import PlayerBalances from './PlayerBalances';
import CosmeticShop from './CosmeticShop';
import {ShopTabs81,ShardShop81,ArenaSkins81,FramePreview85,type ShopCategory81} from './ShopCatalog81';
import useBoosterAudio from './useBoosterAudio';
import BoosterTear from './BoosterTear';
import BoosterRevealCard from './BoosterRevealCard';
import CardDetailsDialog from './CardDetailsDialog';
import usePlayerCollection from './usePlayerCollection';
import {BoosterPurchaseError,buyAlphaBooster,loadBooster,loadUnopenedBoosters,findBoosterRequest,openAlphaBooster,type BoosterCurrency,type BoosterProduct,type BoosterPurchase} from '@/lib/duelverse/account';
import {ALPHA_BOOSTER,previewAlphaPack,revealedSlots,validAlphaPack,validBetaPack} from '../../../public/game/platform/alpha-booster36.mjs';
import {ALL_PACK_SLOTS,unopenedPacks,prepareManualOpening,flipPackSlot} from '../../../public/game/platform/booster-opening58.mjs';
import {getVariant} from '../../../public/game/platform/catalog.mjs';
import {requestedBooster} from '../../../public/game/platform/player-area49.mjs';
import './alpha-boosters.css';
import './booster-opening.css';
type Pending={id:string;currency:BoosterCurrency;product?:BoosterProduct};
type Phase='idle'|'saving'|'manual'|'done'|'error';
const editions=['alpha','beta'] as const;
const editionName={alpha:'Alpha Booster',beta:'Beta Preview Booster'};
const alphaSet=editionProgress131('alpha');
const pendingKey=(user:string)=>'duelverse.booster-pending.v36:'+user;
function readPending(user:string):Pending|null{const key=pendingKey(user);try{const raw=localStorage.getItem(key);if(!raw)return null;const p=JSON.parse(raw);if(typeof p?.id==='string'&&/^[0-9a-f-]{36}$/i.test(p.id)&&['pixels','shards'].includes(p.currency))return p;}catch{}localStorage.removeItem(key);return null;}

export default function AlphaBoosters({shop=false}:{shop?:boolean}){
 const {ready,userId,player,error:accountError,refresh}=usePlayerCollection(),sound=useBoosterAudio();
 const [pack,setPack]=useState<BoosterPurchase|null>(null),[history,setHistory]=useState<BoosterPurchase[]>([]),[stage,setStage]=useState<'sealed'|'opening'>('sealed'),[packOpened,setPackOpened]=useState(false),[preview,setPreview]=useState(false),[shown,setShown]=useState<number[]>([]),[phase,setPhase]=useState<Phase>('idle');
 const [inspectedCard,setInspectedCard]=useState<string|null>(null);
 const [autoTear,setAutoTear]=useState(false),[revealEffectSlot,setRevealEffectSlot]=useState<number|null>(null);
 const [confirmation,setConfirmation]=useState<BoosterCurrency|null>(null),[pending,setPending]=useState<Pending|null>(null),[busy,setBusy]=useState(false),[loadingHistory,setLoadingHistory]=useState(false),[error,setError]=useState(''),[reload,setReload]=useState(0),[previewRun,setPreviewRun]=useState(0);
 const dialog=useRef<HTMLDialogElement>(null),openingRef=useRef<HTMLDialogElement>(null),generation=useRef(0),openingRun=useRef(0),purchaseLock=useRef(false),historyRef=useRef<BoosterPurchase[]>([]),mounted=useRef(true);
 const currentUser=useRef(userId),shownRef=useRef<number[]>([]);currentUser.current=userId;
 function showSlots(slots:number[]){shownRef.current=slots;setShown(slots);}
 const live=(ticket:number)=>mounted.current&&ticket===generation.current;
 const cards=preview?previewAlphaPack():pack?.cards??[],opening=stage==='opening'&&cards.length===5;
 const revealFinish=revealEffectSlot===null?null:getVariant(cards[revealEffectSlot])?.rarity;
 const queued=unopenedPacks(history,opening?pack?.id??null:null) as BoosterPurchase[];
 const queues={alpha:queued.filter(p=>p.product_id==='alpha'),beta:queued.filter(p=>p.product_id==='beta')};
 const currentEdition=pack?.product_id==='beta'?'beta':'alpha';
 const nextPack=queues[currentEdition][0]??queued[0];
 const nextEdition=nextPack?.product_id==='beta'?'beta':'alpha';
 const working=phase==='saving',locked=busy||loadingHistory||!!pending||confirmation!==null;
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;generation.current++;openingRun.current++;};},[]);
 function updateHistory(p:BoosterPurchase){const rows=[p,...historyRef.current.filter(row=>row.id!==p.id)];historyRef.current=rows;setHistory(rows);}
 function acceptPack(p:BoosterPurchase,tear=false){
  if(!(p.product_id==='beta'?validBetaPack(p.cards):validAlphaPack(p.cards)))throw Error('This booster could not be displayed. Your cards remain saved.');
  openingRun.current++;sound.stop();setError('');const url=new URL(window.location.href);url.searchParams.delete('open');url.searchParams.delete('edition');url.searchParams.set('booster',p.id);window.history.replaceState(null,'',url.pathname+url.search);setPack(p);showSlots(revealedSlots(p.revealed_slots));setPackOpened(p.revealed_slots.length>0);setPhase(revealedSlots(p.revealed_slots).length===5?'done':'idle');setPreview(false);setAutoTear(tear);setRevealEffectSlot(null);setStage('opening');
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
     const edition=new URLSearchParams(window.location.search).get('edition');
     const unopened=unopenedPacks(rows) as BoosterPurchase[];
     const next=edition==='alpha'||edition==='beta'?unopened.find(p=>p.product_id===edition):unopened[0];
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
   const result=await prepareManualOpening({cards,product:pack?.product_id,shown:shownRef.current,save:preview?async()=>{}:()=>openAlphaBooster(target!.id),active});
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
 function back(){if(phase==='saving'||busy)return;const url=new URL(window.location.href);url.searchParams.delete('booster');url.searchParams.delete('open');url.searchParams.delete('edition');window.history.replaceState(null,'',url.pathname+url.search);openingRun.current++;sound.stop();setPack(null);setStage('sealed');setPreview(false);setRevealEffectSlot(null);setPhase('idle');setError('');}
 function openQueued(next:BoosterPurchase|undefined){if(!next||locked||working)return;sound.unlock();acceptPack(next,true);}
 async function purchase(currency:BoosterCurrency,product:BoosterProduct='alpha'){
  if(purchaseLock.current||!userId||!player)return;const owner=userId,ticket=generation.current;purchaseLock.current=true;setBusy(true);setError('');let request:Pending|undefined;
  try{
   request=readPending(owner)??{id:crypto.randomUUID(),currency,product};if(request.currency!==currency||(request.product??'alpha')!==product)throw Error('Restore the pending purchase before choosing another currency.');
   localStorage.setItem(pendingKey(owner),JSON.stringify(request));if(live(ticket))setPending(request);
   const id=await buyAlphaBooster(request.id,request.currency,request.product),result=await loadBooster(id);if(!live(ticket))return;
   updateHistory(result);acceptPack(result);setConfirmation(null);localStorage.removeItem(pendingKey(owner));setPending(null);await refresh();
  }catch(e){if(!live(ticket))return;if(e instanceof BoosterPurchaseError&&e.definitive){localStorage.removeItem(pendingKey(owner));setPending(null);}setConfirmation(null);setError(e instanceof Error?e.message:'Your purchase could not be confirmed.');}
  finally{if(live(ticket)){setBusy(false);purchaseLock.current=false;}}
 }
 const [category,setCategory]=useState<ShopCategory81>('boosters');
 useEffect(()=>{const c=new URLSearchParams(window.location.search).get('category');if(c==='shards'||c==='arenas'||c==='frames'||c==='portraits'||c==='stickers')setCategory(c);},[]);
 function changeCategory(c:ShopCategory81){setCategory(c);const url=new URL(window.location.href);url.searchParams.set('category',c);window.history.replaceState(null,'',url.pathname+url.search);}
 const selectedPrice=confirmation?ALPHA_BOOSTER.prices[confirmation]:0;
 const betaOpening=pack?.product_id==='beta';
 const inventory=!shop&&Boolean(userId);
 return <section className="portal-section top-space alpha-booster-page">
 <div className="alpha-shop-heading"><div><h1>{shop?'Shop':'Boosters'}</h1><div className="alpha-shop-links">{!shop&&<a className="alpha-back-link" href="/shop">Back to shop</a>}{userId&&<a className="alpha-history-link" href="/account/private/boosters">Your boosters</a>}</div></div><div className="alpha-shop-controls"><PlayerBalances ready={ready} userId={userId} player={player}/></div></div>
 {shop&&!opening&&<ShopTabs81 category={category} onChange={changeCategory}/>}
 {!opening&&(accountError||error)&&<div className="alpha-booster-error" role="alert"><p>{error||accountError}</p><button className="button glass" onClick={()=>setReload(n=>n+1)}>Try again</button></div>}
 {pending&&<div className="player-note" role="status">A purchase needs confirmation. Restore the same pack without a second charge. <button className="button glass" disabled={busy||loadingHistory} onClick={()=>purchase(pending.currency,pending.product)}>{busy?'Checking…':'Restore purchase'}</button></div>}
 {opening?<dialog className="alpha-opening alpha-opening--guided" ref={openingRef} data-opening-phase={phase} data-revealing={packOpened} aria-labelledby="alpha-opening-title" onCancel={e=>{e.preventDefault();back();}}>
  <div className="alpha-opening-toolbar">
   <button type="button" className="alpha-opening-exit" disabled={working||busy} onClick={back}><span aria-hidden="true">←</span> Back to boosters</button>
   {sound.available&&<button type="button" className="alpha-sound-toggle" aria-pressed={sound.enabled} onClick={sound.toggle}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/>{sound.enabled?<path d="M16 8a6 6 0 0 1 0 8m3-10a9 9 0 0 1 0 12"/>:<path d="m16 9 5 6m0-6-5 6"/>}</svg>
    Sound {sound.enabled?'on':'off'}
   </button>}
  </div>
  <div className="alpha-opening-heading">
   <span className="alpha-eyebrow">{preview?'Opening preview':betaOpening?'Beta preview':pack?.currency==='starter'?'Welcome gift':'Alpha edition'}</span>
   <h2 id="alpha-opening-title">{!packOpened?(betaOpening?'Beta Preview Booster':'Alpha Booster'):phase==='done'?'Pack complete':'Reveal your cards'}</h2>
   {packOpened&&<div className="alpha-reveal-count" role="status" aria-label={`${shown.length} of 5 cards revealed`}>{Array.from({length:5},(_,i)=><i key={i} className={i<shown.length?'is-lit':''}/>)}<span>{shown.length} / 5</span></div>}
  </div>
  {(error||phase==='saving')&&<p className="alpha-opening-status" role={error?'alert':'status'}>{error||'Preparing your pack…'}</p>}
  <div className="alpha-opening-viewport">
   <div className="alpha-forge" aria-hidden="true"><div className="alpha-forge-halo"/></div>
   {!packOpened?<BoosterTear key={preview?'preview:'+previewRun:pack?.id} autoStart={autoTear} beta={betaOpening} onOpened={()=>setPackOpened(true)} onOpen={sound.tear} onSkip={sound.stop}/>:<div className="alpha-reveal-stage">
    {revealFinish&&['epic','legendary','mythic'].includes(revealFinish)&&<div key={revealEffectSlot} className="alpha-stage-surge" data-finish={revealFinish} aria-hidden="true"/>}
    <div className="alpha-reveal-grid" aria-busy={phase==='saving'}>{cards.map((id,i)=><BoosterRevealCard key={(preview?'preview:'+previewRun:pack?.id)+':'+i} id={id} slot={i} visible={shown.includes(i)} celebrateFlip={revealEffectSlot===i} disabled={phase!=='manual'} isNew={!preview&&Boolean(pack?.new_variants.includes(id))} onReveal={()=>revealCard(i)} onInspect={()=>setInspectedCard(id)}/>)}</div>
   </div>}
  </div>
  <div className="alpha-pack-finish">
   <div className="actions alpha-opening-actions">
    {phase==='error'&&<button className="button gold" onClick={()=>void beginOpening()}>Retry opening</button>}
    {phase==='manual'&&<button className="button glass" onClick={revealAll}>Reveal all now</button>}
    {(phase==='done'||phase==='manual')&&!preview&&nextPack&&<button className="button gold alpha-next-pack" disabled={locked} onClick={()=>openQueued(nextPack)}>Open next {nextEdition==='beta'?'Beta':'Alpha'} booster <span className="alpha-next-count">×{queues[nextEdition].length}</span><span aria-hidden="true">→</span></button>}
    {phase==='done'&&preview&&<button className="button gold" onClick={startPreview}>Replay preview</button>}
    {phase==='done'&&!preview&&queued.length===0&&<a className="button gold" href="/decks" onClick={back}>Build a deck</a>}
   </div>
  </div>
 </dialog>:shop&&category==='shards'?<ShardShop81/>:shop&&category==='arenas'?<ArenaSkins81/>:shop&&category==='frames'?<FramePreview85/>:shop&&(category==='portraits'||category==='stickers')?<CosmeticShop kind={category==='portraits'?'portrait':'sticker'}/>:<>
  {loadingHistory&&<p className="booster-shelf-status" role="status">Loading your boosters…</p>}
  <div className="booster-editions" aria-label={inventory?'Your unopened boosters':'Booster editions'}>
   {editions.map(edition=>{
    const beta=edition==='beta';
    const owned=queues[edition];
    const art=<><span aria-hidden="true"><AlphaBoosterPack beta={beta}/></span>
     {player&&!loadingHistory&&!error&&<span className="booster-edition-count" aria-label={owned.length+' unopened'}>×{owned.length.toLocaleString()}</span>}</>;
    return <article className="booster-edition" key={edition} data-edition={edition} aria-labelledby={edition+'-booster-title'}>
     {owned.length>0&&!error?<button className="booster-edition-art booster-edition-open" type="button" disabled={locked}
      aria-label={`Open ${editionName[edition]} · ${owned.length} unopened`} onClick={()=>openQueued(owned[0])}>{art}</button>:<div className="booster-edition-art">{art}</div>}
     <div className="booster-edition-info">
      <h2 id={edition+'-booster-title'}>{editionName[edition]}</h2>
      {beta?<p className="booster-edition-open-label">Booster preview · Coming soon</p>
       :<><p>5 Alpha cards · At least 1 Silver or higher</p><small>{alphaSet.released} motifs · Duplicate protection</small></>}
      {inventory||beta?(!loadingHistory&&!error&&<div className="booster-edition-actions">
       {owned.length>0?<span className="booster-edition-open-label">{beta?'Open a saved pack':'Click the pack to open'}</span>:!beta&&<a className="button glass" href="/shop">Get boosters</a>}
      </div>):<div className="booster-edition-actions">
       <button className="button gold" type="button" disabled={locked||!player||player.pixels<ALPHA_BOOSTER.prices.pixels}
        aria-label="Buy Alpha Booster with Pixels" onClick={()=>setConfirmation('pixels')}>{ALPHA_BOOSTER.prices.pixels} Pixels</button>
       <button className="button glass" type="button" disabled={locked||!player||player.shards<ALPHA_BOOSTER.prices.shards}
        aria-label="Buy Alpha Booster with Shards" onClick={()=>setConfirmation('shards')}>{ALPHA_BOOSTER.prices.shards} Shards</button>
      </div>}
     </div>
    </article>;
   })}
  </div>
  <div className="booster-shelf-links">
   {ready&&!userId&&<a href="/account">Sign in to buy</a>}
   <button className="alpha-preview-button" type="button" disabled={locked} onClick={startPreview}>Try the Alpha opening</button>
  </div>
  <a className="alpha-crafting-link" href="/collection"><span><strong>Craft cards</strong><small>Regular · Normal, Silver, Gold</small></span><span>Use Echoes</span></a>
 </>}
 {!opening&&(!shop||category==='boosters')&&<AlphaBoosterOdds/>}
 <dialog ref={dialog} className="card-trade-dialog alpha-purchase-dialog" aria-labelledby="alphaPurchaseTitle" onCancel={e=>{e.preventDefault();if(!busy)setConfirmation(null);}}><h2 id="alphaPurchaseTitle">Buy one Alpha Booster?</h2><AlphaBoosterPack compact/><p>Five cards. At least one Silver or higher. Duplicate protection included.</p><p><strong>{selectedPrice} {confirmation==='pixels'?'Pixels':'Shards'}</strong> will be deducted from your account balance.</p><div className="actions"><button className="button glass" disabled={busy} onClick={()=>setConfirmation(null)}>Cancel</button><button className="button gold" disabled={busy||!confirmation} onClick={()=>confirmation&&purchase(confirmation)}>{busy?'Saving your booster…':`Buy for ${selectedPrice} ${confirmation==='pixels'?'Pixels':'Shards'}`}</button></div></dialog>
 <CardDetailsDialog variantId={opening&&packOpened?inspectedCard:null} onClose={()=>setInspectedCard(null)}/>
 </section>;
}
