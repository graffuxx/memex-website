'use client';

import {useEffect,useRef,useState} from 'react';
import {PayPalButtons,PayPalScriptProvider} from '@paypal/react-paypal-js';
import {supabase} from '@/lib/supabaseClient';
import {SUPPORTER_PACKS} from '../../../public/game/platform/supporter-packs.mjs';
import {euro81} from '../../../public/game/platform/shard-packs81.mjs';
import {cosmeticTierLabel} from '../../../public/game/platform/cosmetic-shop.mjs';
import {DEFAULT_IDENTITY85} from '../../../public/game/platform/identity85.mjs';
import PlayerPortrait85 from './PlayerPortrait85';
import {DUEL_STICKERS} from '../../../public/game/platform/duel-stickers.mjs';
import StickerArt from './StickerArt';
import usePlayerCollection from './usePlayerCollection';
import './supporter-packs.css';

const supporterStickers=new Map(Object.entries(DUEL_STICKERS));

type Pack=typeof SUPPORTER_PACKS[number];
type Config={enabled:boolean;environment:'sandbox';clientId:string|null};
type Checkout={pack:Pack;requestId:string;id?:string;orderId?:string};
type Order={id:string;request_id:string;product_id:string;paypal_order_id:string|null;status:'created'|'completed'};

export default function SupporterPacks({sandboxCheckout=false}:{sandboxCheckout?:boolean}){
  const {ready,userId,player,refresh}=usePlayerCollection();
  return <SupporterCheckout key={userId??'guest'} ready={ready} userId={userId}
    canLoadAccount={Boolean(player)} refresh={refresh} sandboxCheckout={sandboxCheckout}/>;
}

function SupporterCheckout({ready,userId,canLoadAccount,refresh,sandboxCheckout}:{
  ready:boolean;userId:string|null;canLoadAccount:boolean;refresh:()=>Promise<unknown>;sandboxCheckout:boolean
}){
  const [config,setConfig]=useState<Config|null>(null);
  const [orders,setOrders]=useState<Order[]>([]);
  const [selected,setSelected]=useState<Checkout|null>(null);
  const [stickerPreview,setStickerPreview]=useState(0);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[complete,setComplete]=useState<Pack|null>(null);
  const dialog=useRef<HTMLDialogElement>(null),current=useRef<Checkout|null>(null),lock=useRef(false);

  useEffect(()=>{
    if(!sandboxCheckout||!ready)return;
    const controller=new AbortController();
    async function load(){
      const {data:{session}}=await supabase.auth.getSession();
      const headers=session&&session.user.id===userId?{Authorization:'Bearer '+session.access_token}:undefined;
      const response=await fetch('/api/support/checkout/config',{headers,signal:controller.signal,cache:'no-store'});
      const data=await response.json() as Config;
      if(!response.ok||data.environment!=='sandbox')throw Error('The test checkout could not be loaded.');
      if(!data.enabled){setConfig(data);return;}
      const history=await fetch('/api/support/checkout/orders',{headers,signal:controller.signal,cache:'no-store'});
      if(!history.ok)throw Error('Your test purchases could not be loaded.');
      const result=await history.json();
      if(!controller.signal.aborted){setOrders(result.orders);setConfig(data);}
    }
    void load().catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'The test checkout could not be loaded.');});
    return ()=>controller.abort();
  },[ready,userId,sandboxCheckout]);

  useEffect(()=>{
    if(selected&&!dialog.current?.open)dialog.current?.showModal();
    if(!selected&&dialog.current?.open)dialog.current.close();
  },[selected]);

  async function post(action:'create'|'capture',data:object){
    const {data:{session}}=await supabase.auth.getSession();
    if(!session||session.user.id!==userId)throw Error('Please sign in to the test account again.');
    const response=await fetch('/api/support/checkout/'+action,{method:'POST',cache:'no-store',
      headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify(data)});
    const result=await response.json();
    if(!response.ok)throw Error(result.error||'Test checkout could not be confirmed.');
    return result;
  }

  function select(pack:Pack){
    const pending=orders.find(row=>row.product_id===pack.id&&row.status==='created');
    const order:Checkout={pack,requestId:pending?.request_id??crypto.randomUUID(),id:pending?.id,orderId:pending?.paypal_order_id??undefined};
    current.current=order;
    setComplete(null);
    setError('');
    setSelected(order);
  }

  function close(){
    if(lock.current)return;
    current.current=null;
    setError('');
    setSelected(null);
  }

  async function create(){
    const order=current.current;
    if(!order||lock.current)throw Error('Select a supporter package.');
    lock.current=true;
    try{
      const result=await post('create',{requestId:order.requestId,productId:order.pack.id});
      const updated={...order,id:result.id,orderId:result.orderId};
      current.current=updated;
      setSelected(updated);
      setOrders(old=>[{id:result.id,request_id:order.requestId,product_id:order.pack.id,paypal_order_id:result.orderId,status:'created'},
        ...old.filter(row=>row.id!==result.id)]);
      return result.orderId as string;
    }catch(e){
      setError(e instanceof Error?e.message:'Could not start PayPal Sandbox.');
      throw e;
    }finally{lock.current=false;}
  }

  async function capture(orderId?:string){
    const order=current.current;
    if(lock.current||!order?.id||!order.orderId)return;
    if(orderId&&orderId!==order.orderId){setError('PayPal returned a different test order.');return;}
    lock.current=true;
    setBusy(true);
    setError('');
    try{
      const result=await post('capture',{id:order.id,orderId:order.orderId});
      if(result.status!=='completed'||result.sandbox!==true||result.boosters!==order.pack.boosters||
         result.portraitId!==order.pack.portraitId||result.titleId!==order.pack.titleId||result.stickerId!==order.pack.stickerId)throw Error('The test rewards could not be confirmed.');
      setOrders(old=>old.filter(row=>row.id!==order.id));
      setComplete(order.pack);
      setSelected(null);
      current.current=null;
      try{await refresh();}catch{/* Committed rewards will appear on the next account load. */}
    }catch(e){setError(e instanceof Error?e.message:'Could not confirm the test payment.');}
    finally{lock.current=false;setBusy(false);}
  }

  const enabled=config?.enabled&&canLoadAccount;

  return <section className="portal-section supporter-packs">
    <header className="supporter-heading">
      <h1>Support the Duelverse</h1>
      <p>Support development with a one-time package. MemeX is free to play. Always.</p>
      <span className="supporter-test">{enabled?'PayPal Sandbox · test purchases only':'Checkout coming soon'}</span>
    </header>
    {complete&&<div className="supporter-receipt" role="status">
      <strong>Test rewards unlocked.</strong>
      <a href="/account/private/boosters">Your boosters</a>
      <a href="/account/private/profile?tab=portraits">Your portrait</a>
      {complete.titleId&&<a href="/account/private/profile?tab=titles">Your title</a>}
      {complete.stickerId&&<a href="/account/private/profile?tab=stickers">Your sticker</a>}
    </div>}
    {!selected&&error&&<p className="alpha-booster-error" role="alert">{error}</p>}
    <div className="supporter-grid">
      {SUPPORTER_PACKS.map(pack=>{
        const sticker=pack.stickerId?supporterStickers.get(pack.stickerId):undefined;
        return <article key={pack.id} data-rarity={pack.rarity} data-sticker={sticker?'exclusive':undefined}>
          <PlayerPortrait85 identity={{...DEFAULT_IDENTITY85,avatarId:pack.portraitId}} size={155}/>
          <h2>{pack.name}</h2>
          <strong className="supporter-price">{euro81(pack.cents)}</strong>
          <ul>
            <li>{pack.boosters} Alpha {pack.boosters===1?'Booster':'Boosters'}</li>
            <li>{pack.portraitName} · {cosmeticTierLabel(pack.rarity)} portrait</li>
            {pack.titleName&&<li>Title · {pack.titleName}</li>}
            {sticker&&<li>
              <button type="button" className="supporter-sticker-preview"
                aria-label={`Preview ${sticker.name} sticker animation`}
                onClick={()=>setStickerPreview(n=>n+1)}>
                <span className="supporter-sticker-art" aria-hidden="true">
                  <StickerArt key={stickerPreview} art={sticker} animate={stickerPreview>0}/>
                </span>
                <span>{sticker.name}<small>Animated sticker</small></span>
              </button>
            </li>}
          </ul>
          {enabled?<button className="button gold" onClick={()=>select(pack)}>
            {orders.some(row=>row.product_id===pack.id&&row.status==='created')?'Resume '+pack.name:'Test '+pack.name}
          </button>:null}
        </article>;
      })}
    </div>

    <dialog ref={dialog} className="card-trade-dialog supporter-dialog" aria-labelledby="supporter-checkout-title"
      onCancel={e=>{e.preventDefault();close();}}>
      {selected&&<>
        <h2 id="supporter-checkout-title">{selected.pack.name}</h2>
        <p>{euro81(selected.pack.cents)} · PayPal Sandbox</p>
        {error&&<p className="alpha-booster-error" role="alert">{error}</p>}
        {busy&&<p role="status">Confirming test rewards…</p>}
        {config?.clientId&&enabled&&<PayPalScriptProvider options={{clientId:config.clientId,environment:'sandbox',
          currency:'EUR',intent:'capture',components:'buttons',disableFunding:'card,credit,paylater,venmo'}}>
          <PayPalButtons fundingSource="paypal" disabled={busy} createOrder={create}
            style={{layout:'vertical',label:'pay',shape:'rect'}} onApprove={data=>capture(data.orderID)}
            onCancel={()=>setError('Test checkout cancelled.')}
            onError={()=>setError(previous=>previous||'Could not open PayPal Sandbox. Try again.')}/>
        </PayPalScriptProvider>}
        <div className="actions">
          {selected.orderId&&<button type="button" className="button glass" disabled={busy}
            onClick={()=>void capture()}>Check test payment</button>}
          <button type="button" className="button glass" disabled={busy} onClick={close}>Close</button>
        </div>
      </>}
    </dialog>
  </section>;
}
