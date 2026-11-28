'use client';

import {useEffect,useRef,useState} from 'react';
import {supabase} from '@/lib/supabaseClient';
import {cosmeticTierLabel} from '../../../public/game/platform/cosmetic-shop.mjs';
import {DUEL_STICKERS,STARTER_STICKER_SLOTS,validStickerSlots} from '../../../public/game/platform/duel-stickers.mjs';

type StickerId = keyof typeof DUEL_STICKERS;

function loadout(data:unknown):StickerId[] {
 if(!validStickerSlots(data))throw Error('Sticker loadout unavailable. Please retry.');
 return data as StickerId[];
}

export default function StickerLoadout({owned}:{owned:string[]}){
 const [saved,setSaved]=useState<StickerId[]|null>(null),[draft,setDraft]=useState<StickerId[]>([]);
 const [slot,setSlot]=useState(0),[busy,setBusy]=useState(false),[attempt,setAttempt]=useState(0);
 const [message,setMessage]=useState(''),[error,setError]=useState('');
 const locked=useRef(false);
 const available=(Object.keys(DUEL_STICKERS) as StickerId[]).filter(id=>STARTER_STICKER_SLOTS.includes(id)||owned.includes('sticker:'+id));
 const dirty=saved!==null&&draft.some((id,i)=>id!==saved[i]);

 useEffect(()=>{
  const controller=new AbortController();
  async function read(){
   setError('');
   try{
    const {data,error}=await supabase.rpc('dv_sticker_loadout').abortSignal(controller.signal);
    if(error)throw error;
    if(!controller.signal.aborted){const slots=loadout(data);setSaved(slots);setDraft(slots);}
   }catch{
    if(!controller.signal.aborted)setError('Sticker loadout could not be loaded.');
   }
  }
  void read();
  return ()=>controller.abort();
 },[attempt]);

 function equip(id:StickerId){
  setDraft(current=>{
   const next=[...current],from=next.indexOf(id);
   if(from>=0)next[from]=next[slot];
   next[slot]=id;
   return next;
  });
  setMessage('');
  setError('');
 }

 async function save(){
  if(locked.current||!dirty)return;
  locked.current=true;
  setBusy(true);
  setError('');
  setMessage('');
  try{
   const {data,error}=await supabase.rpc('dv_save_sticker_loadout',{p_slots:draft});
   if(error)throw error;
   const slots=loadout(data);
   setSaved(slots);
   setDraft(slots);
   setMessage('Sticker loadout saved.');
  }catch{
   setError('Sticker loadout could not be saved. Try again.');
  }finally{
   locked.current=false;
   setBusy(false);
  }
 }

 if(!saved)return <section className="profile-stickers" aria-label="Sticker loadout">
  {error?<><p role="alert">{error}</p><button type="button" className="button glass" onClick={()=>setAttempt(value=>value+1)}>Retry</button></>:<p role="status">Loading stickers…</p>}
 </section>;

 return <section className="profile-stickers" aria-label="Sticker loadout">
  <div className="profile-section-heading85"><h2>Equipped stickers</h2><span>Slots 1–4</span></div>
  <div className="profile-sticker-grid" role="group" aria-label="Choose a slot">
   {draft.map((id,i)=><button key={i} type="button" disabled={busy} onClick={()=>setSlot(i)}
     aria-pressed={slot===i} aria-label={`Slot ${i+1} · ${DUEL_STICKERS[id].name} · ${cosmeticTierLabel(DUEL_STICKERS[id].rarity)}`}>
    <kbd aria-hidden="true">{i+1}</kbd><img src={DUEL_STICKERS[id].image} alt=""/>
    <strong>{DUEL_STICKERS[id].name}</strong>
    {DUEL_STICKERS[id].rarity!=='Standard'&&<small>{cosmeticTierLabel(DUEL_STICKERS[id].rarity)}</small>}
   </button>)}
  </div>
  <div className="profile-section-heading85"><h2>Your stickers</h2><a className="player-quiet-link" href="/shop?category=stickers">Sticker shop</a></div>
  <div className="profile-sticker-grid" role="group" aria-label={`Choose a sticker for slot ${slot+1}`}>
   {available.map(id=><button key={id} type="button" disabled={busy} onClick={()=>equip(id)}
     aria-pressed={draft[slot]===id} aria-label={`Equip ${DUEL_STICKERS[id].name} · ${cosmeticTierLabel(DUEL_STICKERS[id].rarity)} in slot ${slot+1}`}>
    <img src={DUEL_STICKERS[id].image} alt=""/><strong>{DUEL_STICKERS[id].name}</strong>
    <small>{cosmeticTierLabel(DUEL_STICKERS[id].rarity)}</small>
   </button>)}
  </div>
  <footer className="profile-save85">
   <div>{error?<p className="error" role="alert">{error}</p>:<p role="status">{message||(dirty?'Unsaved sticker changes':'')}</p>}</div>
   <button type="button" className="button gold" disabled={busy||!dirty} onClick={()=>void save()}>{busy?'Saving…':'Save stickers'}</button>
  </footer>
 </section>;
}
