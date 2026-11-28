'use client';

import {useEffect,useRef,useState} from 'react';
import {supabase} from '@/lib/supabaseClient';
import {SHOP_PORTRAITS,cosmeticTierLabel} from '../../../public/game/platform/cosmetic-shop.mjs';
import {DUEL_STICKERS,STARTER_STICKER_SLOTS,stickerSceneLayers} from '../../../public/game/platform/duel-stickers.mjs';
import PlayerPortrait85 from './PlayerPortrait85';
import {DEFAULT_IDENTITY85} from '../../../public/game/platform/identity85.mjs';
import usePlayerCollection from './usePlayerCollection';
import '../../../public/game/sticker-scenes.css';

type Kind = 'sticker'|'portrait';
type Listing = {id:string;kind:Kind;price:number};
type Art = {name:string;image:string;rarity?:string;motion?:string|null;prop?:string;parts?:ReadonlyArray<{part:string;image?:string}>};
type Product = Listing & Art;

const portraits = new Map<string,Art>(SHOP_PORTRAITS.map(item=>[item.id,item]));
const stickers = new Map<string,Art>(Object.entries(DUEL_STICKERS).filter(([id])=>!STARTER_STICKER_SLOTS.includes(id)));

export default function CosmeticShop({kind}:{kind:Kind}){
 const {ready,userId,player,refresh}=usePlayerCollection();
 return <CosmeticCatalog key={kind+':'+(userId??'guest')} {...{kind,ready,userId,player,refresh}}/>;
}

function CosmeticCatalog({kind,ready,userId,player,refresh}:{kind:Kind}&Pick<ReturnType<typeof usePlayerCollection>,'ready'|'userId'|'player'|'refresh'>){
 const [items,setItems]=useState<Product[]|null>(null),[attempt,setAttempt]=useState(0);
 const [selected,setSelected]=useState<Product|null>(null),[busy,setBusy]=useState(false);
 const [purchase,setPurchase]=useState<{owned:string[];balance:number}|null>(null);
 const [message,setMessage]=useState(''),[error,setError]=useState('');
 const [preview,setPreview]=useState({id:'',sequence:0});
 const modal=useRef<HTMLDialogElement>(null),lock=useRef(false);
 const profileHref=kind==='sticker'?'/account/private/profile?tab=stickers':'/account/private/profile?tab=portraits';
 const balance=purchase?.balance??player?.shards;
 const owns=(item:Product)=>Boolean(purchase?.owned.includes(item.id)||player?.identity.owned.includes(item.kind+':'+item.id));

 useEffect(()=>{
  const controller=new AbortController();
  async function fetchItems(){
   setError('');
   const {data,error}=await supabase.rpc('dv_cosmetic_shop_items').abortSignal(controller.signal);
   if(controller.signal.aborted)return;
   if(error||!Array.isArray(data)){setError('The cosmetic shop could not load.');return;}
   setItems((data as Listing[]).flatMap(item=>{
    if(item.kind!==kind)return [];
    const art=(kind==='portrait'?portraits:stickers).get(item.id);
    return art?[{...art,...item}]:[];
   }));
  }
  void fetchItems().catch(()=>{if(!controller.signal.aborted)setError('The cosmetic shop could not load.');});
  return ()=>controller.abort();
 },[attempt,kind]);

 useEffect(()=>{
  if(selected)modal.current?.showModal();
  else modal.current?.close();
 },[selected]);

 function select(item:Product){
  setError('');
  setMessage('');
  setSelected(item);
 }

 async function buy(){
  if(!selected||!userId||lock.current)return;
  lock.current=true;
  setBusy(true);
  setError('');
  try{
   const {data:{session}}=await supabase.auth.getSession();
   if(session?.user.id!==userId)throw Error('Please sign in again.');
   const {data,error}=await supabase.rpc('dv_buy_cosmetic',{p_id:selected.id,p_price:selected.price});
   if(error){
    const known=['Not enough Shards','Cosmetic unavailable','The price changed. Refresh the shop and try again.'];
    throw Error(known.includes(error.message)?error.message:'Purchase could not be confirmed. Try again.');
   }
   if(data?.id!==selected.id||!Number.isSafeInteger(data?.shards))throw Error('Purchase could not be confirmed. Try again.');
   setPurchase(previous=>({owned:[...(previous?.owned??[]),selected.id],balance:data.shards}));
   setMessage(selected.name+' is in your profile.');
   setSelected(null);
   try{await refresh();setPurchase(null);}catch{/* Keep the confirmed purchase visible until the next profile refresh. */}
  }catch(error){
   setError(error instanceof Error?error.message:'Purchase could not be confirmed.');
  }finally{lock.current=false;setBusy(false);}
 }

 return <section className="cosmetic-shop" aria-label={kind==='sticker'?'Sticker shop':'Portrait shop'}>
  <header className="cosmetic-shop-header">
   <h2>{kind==='sticker'?'Stickers':'Portraits'}</h2>
   {balance!==undefined&&<a className="player-quiet-link" href="/shop?category=shards">{balance.toLocaleString('en-US')} Shards</a>}
  </header>
  {error&&!selected&&<p className="alpha-booster-error" role="alert">{error} <button type="button" className="button glass" onClick={()=>setAttempt(count=>count+1)}>Retry</button></p>}
  {message&&<p className="player-note" role="status">{message} <a href={profileHref}>Equip in profile</a></p>}
  {!items&&!error&&<p role="status">Loading cosmetics…</p>}
  {items?.length===0&&<p>No cosmetics on sale right now.</p>}
  <div className="cosmetic-shop-grid">
   {items?.map(item=><article key={item.id} data-rarity={item.rarity}>
    <div className="cosmetic-shop-art">
     {kind==='portrait'?<PlayerPortrait85 identity={{...DEFAULT_IDENTITY85,avatarId:item.id}} size={144}/>
      :item.motion?<span className="sticker-scene" key={preview.id===item.id?preview.sequence:0} data-motion={item.motion} data-play={preview.id===item.id?'':undefined}>
       {stickerSceneLayers(item).map(({part,image})=>{
        if(!image)return <span key={part} className={'sticker-'+part} aria-hidden="true"/>;
        if(part==='character'&&item.motion==='loot-goblin')return <span key={part} className="sticker-pocket">
         <img className="sticker-character" src={image} alt="" loading="lazy"/>
        </span>;
        return <img key={part} className={'sticker-'+part} src={image} alt="" loading="lazy"/>;
       })}
      </span>:<img src={item.image} alt="" loading="lazy"/>}
    </div>
    <h3>{item.name}</h3>
    <small>{cosmeticTierLabel(item.rarity)}</small>
    {item.motion&&<button type="button" className="cosmetic-motion-preview" aria-label={`Preview ${item.name} animation`}
      onClick={()=>setPreview(previous=>({id:item.id,sequence:previous.sequence+1}))}>Preview animation</button>}
    {owns(item)?<a href={profileHref} className="button glass">Owned · Equip</a>
     :ready&&!userId?<a href="/account" className="button glass">Sign in to buy</a>
     :<button className="button gold" type="button" disabled={!player||busy}
       aria-label={`Buy ${item.name} · ${cosmeticTierLabel(item.rarity)} for ${item.price} Shards`} onClick={()=>select(item)}>{item.price} Shards</button>}
   </article>)}
  </div>
  <dialog ref={modal} className="card-trade-dialog cosmetic-shop-dialog" aria-labelledby="cosmeticPurchaseTitle" onCancel={event=>{event.preventDefault();if(!busy)setSelected(null);}}>
   <h2 id="cosmeticPurchaseTitle">{selected?.name}</h2>
   {selected&&<p>{cosmeticTierLabel(selected.rarity)} · {selected.price} Shards {balance!==undefined&&balance<selected.price&&<span>· {balance} available</span>}</p>}
   {error&&<p role="alert" className="alpha-booster-error">{error}</p>}
   <div className="actions">
    <button type="button" className="button glass" disabled={busy} onClick={()=>{setSelected(null);if(error?.includes('price changed'))setAttempt(count=>count+1);}}>Cancel</button>
    {selected&&balance!==undefined&&balance<selected.price?<a href="/shop?category=shards" className="button gold">Get Shards</a>:
     <button type="button" className="button gold" disabled={busy||!selected} onClick={()=>void buy()}>{busy?'Saving…':'Confirm purchase'}</button>}
   </div>
  </dialog>
 </section>;
}
