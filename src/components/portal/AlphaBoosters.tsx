'use client';
import {useEffect,useRef,useState} from 'react';
import AlphaBoosterPack from './AlphaBoosterPack';
import PlayerBalances from './PlayerBalances';
import useBoosterAudio from './useBoosterAudio';
import BoosterTear from './BoosterTear';
import BoosterRevealCard from './BoosterRevealCard';
import usePlayerCollection from './usePlayerCollection';
import {BoosterPurchaseError,buyAlphaBooster,loadBooster,loadBoosterHistory,findBoosterRequest,revealBoosterCard,type BoosterCurrency,type BoosterPurchase} from '@/lib/duelverse/account';
import {ALPHA_BOOSTER,ALPHA_ODDS,previewAlphaPack,revealedSlots,validAlphaPack} from '../../../public/game/platform/alpha-booster36.mjs';
import {RARITIES,getVariant} from '../../../public/game/platform/catalog.mjs';
import {requestedBooster} from '../../../public/game/platform/player-area49.mjs';
import './alpha-boosters.css';
import './booster-opening.css';
type Pending={id:string;currency:BoosterCurrency};
const pendingKey=(user:string)=>'duelverse.booster-pending.v36:'+user;
function readPending(user:string):Pending|null{const key=pendingKey(user);try{const raw=localStorage.getItem(key);if(!raw)return null;const p=JSON.parse(raw);if(typeof p?.id==='string'&&/^[0-9a-f-]{36}$/i.test(p.id)&&['pixels','shards'].includes(p.currency))return p;}catch{}localStorage.removeItem(key);return null;}

export default function AlphaBoosters({shop=false}:{shop?:boolean}){
 const {ready,userId,player,error:accountError,refresh}=usePlayerCollection();
 const sound=useBoosterAudio(),previewShown=useRef(new Set<number>());
 const [pack,setPack]=useState<BoosterPurchase|null>(null),[history,setHistory]=useState<BoosterPurchase[]>([]),[stage,setStage]=useState<'sealed'|'opening'>('sealed'),[packOpened,setPackOpened]=useState(true),[preview,setPreview]=useState(false),[localReveals,setLocalReveals]=useState<number[]>([]);
 const [confirmation,setConfirmation]=useState<BoosterCurrency|null>(null),[pending,setPending]=useState<Pending|null>(null),[busy,setBusy]=useState(false),[revealing,setRevealing]=useState<number|null>(null),[loadingHistory,setLoadingHistory]=useState(false),[error,setError]=useState('');
 const openingRef=useRef<HTMLDivElement>(null),[previewRun,setPreviewRun]=useState(0);
 const dialog=useRef<HTMLDialogElement>(null),generation=useRef(0),purchaseLock=useRef(false),revealLock=useRef(false),historyRef=useRef<BoosterPurchase[]>([]),mounted=useRef(true);
 const currentUser=useRef(userId);currentUser.current=userId;
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;generation.current++;};},[]);
 const live=(ticket:number)=>mounted.current&&ticket===generation.current;
 function acceptPack(p:BoosterPurchase,fresh=false){sound.stop();if(!validAlphaPack(p.cards))throw Error('This booster could not be displayed. Your purchase is saved in your account.');setPack(p);setPackOpened(!fresh);setPreview(false);setStage('opening');}
 useEffect(()=>{sound.stop();const ticket=++generation.current;purchaseLock.current=false;revealLock.current=false;setPack(null);setHistory([]);historyRef.current=[];setPreview(false);setPackOpened(true);setStage('sealed');setConfirmation(null);setPending(null);setBusy(false);setRevealing(null);setError('');
  if(!ready||!userId||!player){setLoadingHistory(false);return;}
  const owner=userId;setLoadingHistory(true);
  (async()=>{try{
   const saved=readPending(owner);if(live(ticket))setPending(saved);
   const rows=await loadBoosterHistory();if(!live(ticket))return;setHistory(rows);historyRef.current=rows;
   if(saved){const restored=rows.find(p=>p.request_id===saved.id)??await findBoosterRequest(saved.id);if(!live(ticket))return;if(restored){acceptPack(restored);localStorage.removeItem(pendingKey(owner));setPending(null);await refresh();}}
   else {
    const requested=requestedBooster(window.location.search);
    if(requested){const restored=rows.find(p=>p.id===requested)??await loadBooster(requested);if(!live(ticket))return;acceptPack(restored);if(!rows.some(p=>p.id===restored.id)){const expanded=[...rows,restored];setHistory(expanded);historyRef.current=expanded;}}
    else {const unfinished=rows.find(p=>revealedSlots(p.revealed_slots).length<5);if(unfinished)acceptPack(unfinished);}
   }
  }catch(e){if(live(ticket))setError(e instanceof Error?e.message:'Your booster history could not be loaded.');}finally{if(live(ticket))setLoadingHistory(false);}})();
 // A wallet refresh keeps the current opening. Identity changes reset it.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[ready,userId,Boolean(player)]);
 useEffect(()=>{if(confirmation)dialog.current?.showModal();else dialog.current?.close();},[confirmation]);
 const cards=preview?previewAlphaPack():pack?.cards??[],shown=preview?localReveals:revealedSlots(pack?.revealed_slots??[]),opening=stage==='opening'&&cards.length===5;
 const locked=busy||loadingHistory||!!pending||confirmation!==null;
 useEffect(()=>{if(opening)openingRef.current?.scrollIntoView({block:'start',behavior:'instant'});},[opening,preview,pack?.id]);
 function startPreview(){if(busy||revealing!==null)return;sound.stop();previewShown.current.clear();setPreview(true);setPreviewRun(n=>n+1);setLocalReveals([]);setPackOpened(false);setStage('opening');setError('');}
 async function purchase(currency:BoosterCurrency){
  if(purchaseLock.current||!userId||!player)return;const owner=userId,ticket=generation.current;purchaseLock.current=true;setBusy(true);setError('');let request:Pending|undefined;
  try{
   request=readPending(owner)??{id:crypto.randomUUID(),currency};
   if(request.currency!==currency)throw Error('Restore the pending purchase before choosing another currency.');
   localStorage.setItem(pendingKey(owner),JSON.stringify(request));if(live(ticket))setPending(request);
   const id=await buyAlphaBooster(request.id,request.currency);const result=await loadBooster(id);if(!live(ticket))return;
   acceptPack(result,true);setConfirmation(null);localStorage.removeItem(pendingKey(owner));setPending(null);
   const updated=[result,...historyRef.current.filter(p=>p.id!==result.id)].slice(0,20);setHistory(updated);historyRef.current=updated;
   await refresh();
  }catch(e){if(!live(ticket))return;if(e instanceof BoosterPurchaseError&&e.definitive){localStorage.removeItem(pendingKey(owner));setPending(null);setConfirmation(null);}else setConfirmation(null);setError(e instanceof Error?e.message:'Your purchase could not be confirmed.');}
  finally{if(live(ticket)){setBusy(false);purchaseLock.current=false;}}
 }
 async function reveal(slot:number){
  if(shown.includes(slot)||revealLock.current||!opening||!packOpened)return;
  sound.unlock();
  if(preview){if(previewShown.current.has(slot))return;previewShown.current.add(slot);setLocalReveals(s=>s.includes(slot)?s:[...s,slot]);sound.reveal(getVariant(cards[slot])!.rarity);return;}
  if(!pack||!userId)return;const ticket=generation.current,target=pack;revealLock.current=true;setRevealing(slot);setError('');
  try{await revealBoosterCard(target.id,slot);if(!live(ticket))return;const updated={...target,revealed_slots:[...target.revealed_slots,slot]};setPack(updated);sound.reveal(getVariant(target.cards[slot])!.rarity);const rows=historyRef.current.map(p=>p.id===target.id?updated:p);historyRef.current=rows;setHistory(rows);}
  catch(e){if(live(ticket))setError(e instanceof Error?e.message:'Please retry this card.');}
  finally{if(live(ticket)){revealLock.current=false;setRevealing(null);}}
 }
 const selectedPrice=confirmation?ALPHA_BOOSTER.prices[confirmation]:0;
 return <section className="portal-section top-space alpha-booster-page">
 <div className="alpha-shop-heading" ref={openingRef}><div><h1>{shop?'Shop':'Boosters'}</h1>{!shop&&<a className="alpha-back-link" href="/shop">Back to shop</a>}{userId&&<a className="alpha-history-link" href="/account/private/boosters">Your booster history</a>}</div><div className="alpha-shop-controls"><PlayerBalances ready={ready} userId={userId} player={player}/><button className="alpha-sound-toggle" type="button" aria-label="Booster sound" aria-pressed={sound.enabled} disabled={!sound.available} onClick={sound.toggle} data-audio-state={sound.running?'running':'idle'} data-last-sound={sound.lastCue} data-sound-count={sound.playCount} title={sound.available?'Enable or mute booster sounds':'Sound unavailable in this browser'}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/>{sound.enabled?<><path d="M16 8c2 2 2 6 0 8M19 5c4 4 4 10 0 14"/></>:<path d="m17 9 5 6m0-6-5 6"/>}</svg><span>{sound.available?`Sound ${sound.enabled?'on':'off'}`:'Sound unavailable'}</span></button></div></div>
 {(accountError||error)&&<p className="error alpha-booster-error" role="alert">{error||accountError}</p>}
 {pending&&<div className="player-note" role="status">A previous purchase still needs confirmation. Retrying restores the same booster and cannot charge it twice. <button className="button glass" disabled={busy||loadingHistory} onClick={()=>purchase(pending.currency)}>{busy?'Checking purchase…':'Restore pending purchase'}</button></div>}
 {opening?<div className="alpha-opening">
  <div className="alpha-opening-heading"><div><span className="alpha-eyebrow">Alpha Booster · First edition</span><h2>{packOpened?'Reveal your cards':'Open your booster'}</h2>{packOpened&&<p>Click a card to reveal it.</p>}</div><div className="alpha-reveal-count" aria-live="polite" hidden={!packOpened}>{Array.from({length:5},(_,i)=><i key={i} className={i<shown.length?'is-lit':''}/>)}<span>{shown.length} / 5 revealed</span></div></div>
  {preview&&<div className="alpha-preview-note" role="status">Effects preview · fixed cards, one of each finish · no account cards or currency are changed.</div>}
  {!packOpened?<BoosterTear key={preview?'preview:'+previewRun:pack?.id} onOpened={()=>setPackOpened(true)} onOpen={sound.tear} onSkip={sound.stop}/>:<>
  <div className="alpha-reveal-grid">{cards.map((id,i)=><BoosterRevealCard key={(preview?'preview':pack?.id)+':'+i} id={id} slot={i} visible={shown.includes(i)} saving={revealing===i} disabled={revealing!==null} isNew={!preview&&Boolean(pack?.new_variants.includes(id))} onReveal={()=>reveal(i)}/>)}</div>
  <p className="alpha-opening-status" role="status">{shown.length===5?'All five revealed. Silver-or-higher guarantee fulfilled.':shown.some(i=>getVariant(cards[i])?.rarity!=='common')?`Silver-or-higher guarantee fulfilled. ${5-shown.length} cards left.`:`${5-shown.length} cards left. At least one Silver or higher is guaranteed.`}</p>
  </>}

  <div className="actions alpha-opening-actions">{preview&&<button className="button glass" onClick={startPreview}>Restart preview</button>}<button className="button glass" disabled={revealing!==null} onClick={()=>{sound.stop();setStage('sealed');setPreview(false);}}>Back to boosters</button>{!preview&&<a className="button gold" href="/collection">View collection</a>}</div>
 </div>:<div className="alpha-booster-showcase"><div className="alpha-booster-art-stage"><AlphaBoosterPack/><span>ALPHA BOOSTER · FIRST EDITION</span></div><div className="alpha-booster-product"><span className="alpha-eyebrow">First edition</span><h2>Alpha Booster</h2><div className="alpha-booster-flags"><span>5 cards</span><span>At least 1 Silver or higher</span><span>Duplicate protection</span></div><div className="alpha-purchase-options"><button className="button gold" disabled={locked||!player||player.pixels<100} onClick={()=>setConfirmation('pixels')}><strong>100 Pixels</strong><span>Buy with Pixels</span></button><button className="button glass" disabled={locked||!player||player.shards<150} onClick={()=>setConfirmation('shards')}><strong>150 Shards</strong><span>Buy with Shards</span></button></div>{ready&&!userId?<p className="muted"><a href="/account">Sign in</a> to buy.</p>:player&&<p className="muted">Uses your current balance · Shards top-ups unavailable.</p>}<button className="alpha-preview-button" onClick={startPreview}>Try the opening preview</button></div></div>}
 {!opening&&<a className="alpha-crafting-link" href="/collection"><span><strong>Craft cards</strong><small>Normal · Silver · Gold</small></span><span>Use Echoes</span></a>}
 {history.length>0&&<div className="alpha-booster-history"><label htmlFor="alphaBoosterHistory">Recent boosters</label><select id="alphaBoosterHistory" value={pack?.id??''} disabled={busy||revealing!==null||!packOpened} onChange={e=>{const row=history.find(p=>p.id===e.target.value);if(row){setError('');acceptPack(row);}}}><option value="" disabled>Choose a saved booster</option>{history.map(p=><option key={p.id} value={p.id}>{new Date(p.created_at).toLocaleString()} · {p.cost} {p.currency==='pixels'?'Pixels':'Shards'} · {revealedSlots(p.revealed_slots).length}/5 revealed</option>)}</select><span>Reopening never charges again.</span></div>}
 <details className="booster-odds alpha-booster-odds"><summary>Contents &amp; drop rates</summary><p>Four slots use the standard rates below. One additional slot guarantees Silver or higher. The five slots are shuffled before opening. Paid-currency and earned-currency boosters use the same rules.</p><table><thead><tr><th>Finish</th><th>Each standard slot</th><th>Guarantee slot</th></tr></thead><tbody>{RARITIES.map(r=><tr key={r.id}><th>{r.name}</th><td>{(Number(ALPHA_ODDS.standard.find(([id])=>id===r.id)?.[1]??0)/100).toFixed(2)}%</td><td>{(Number(ALPHA_ODDS.guaranteed.find(([id])=>id===r.id)?.[1]??0)/100).toFixed(2)}%</td></tr>)}</tbody></table><p>The finish is rolled first. Within it, variants acquired fewer than three times are selected uniformly. When every variant of that finish has been acquired three times, further duplicates become possible. This history includes crafted, starter and dismantled cards. A saved 15-card deck still permits at most three copies of a motif across all finishes.</p><p>Your five cards and charge are saved together at purchase. Individual reveals are saved to your account so you can continue after reloading.</p></details>
 <dialog ref={dialog} className="card-trade-dialog alpha-purchase-dialog" aria-labelledby="alphaPurchaseTitle" onCancel={e=>{e.preventDefault();if(!busy)setConfirmation(null);}}><h2 id="alphaPurchaseTitle">Buy one Alpha Booster?</h2><AlphaBoosterPack compact/><p>Five cards. At least one Silver or higher. Duplicate protection included.</p><p><strong>{selectedPrice} {confirmation==='pixels'?'Pixels':'Shards'}</strong> will be deducted from your account balance.</p><div className="actions"><button className="button glass" disabled={busy} onClick={()=>setConfirmation(null)}>Cancel</button><button className="button gold" disabled={busy||!confirmation} onClick={()=>confirmation&&purchase(confirmation)}>{busy?'Saving your booster…':`Buy for ${selectedPrice} ${confirmation==='pixels'?'Pixels':'Shards'}`}</button></div></dialog>
 </section>;
}
