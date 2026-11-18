'use client';
import {useEffect,useState} from 'react';
import {supabase} from '@/lib/supabaseClient';
import {loadPlayer} from '@/lib/duelverse/account';
import {starterDeck,starterInventory,validateDeck} from '../../../public/game/platform/catalog.mjs';
const PLAY_KEY='duelverse.play-deck.v1';
export default function PlayArena(){
 const [ready,setReady]=useState(false),[deckName,setDeckName]=useState('Starter deck'),[notice,setNotice]=useState('');
 useEffect(()=>{let alive=true;async function prepare(){
  let cards=starterDeck(),inventory=starterInventory(),name='Starter deck',source='guest';
  try{
   const {data:{session},error}=await supabase.auth.getSession();if(error)throw error;
   if(session){const player=await loadPlayer();if(!alive)return;const deck=player.decks.find(d=>d.active)??player.decks[0];if(!deck||!validateDeck(deck.cards,player.inventory).valid)throw Error('Saved deck unavailable');cards=deck.cards;inventory=player.inventory;name=deck.name;source='account';}
   else{const draft=JSON.parse(localStorage.getItem('duelverse.guest-deck.v1')??'null');if(draft?.version===1&&validateDeck(draft.cards,inventory).valid){cards=draft.cards;name=typeof draft.name==='string'?draft.name.slice(0,40):'Guest deck';}}
  }catch{if(alive)setNotice('Saved deck could not be loaded. This session uses the starter preview; check your deck before playing.');}
  if(!alive)return;
  try{localStorage.setItem(PLAY_KEY,JSON.stringify({version:1,cards,inventory,name,source}));}catch{setNotice('Browser storage is unavailable. The arena will use its starter preview.');name='Starter preview';}
  setDeckName(name);setReady(true);
 }void prepare();return()=>{alive=false;};},[]);
 return <>{notice&&<p className="player-note" role="status">{notice} <a href="/decks">Open deck builder</a></p>}<div className="player-toolbar"><span className="muted" role="status">{ready?`Deck: ${deckName} · 15 cards`:'Loading your selected deck…'}</span>{ready&&<a className="button glass" href="/game/table-demo.html">Open full-screen arena</a>}</div>{ready?<iframe className="arena-frame" title="MemeX Duelverse playable alpha against demo AI" src="/game/table-demo.html" allow="fullscreen" allowFullScreen/>:<div className="arena-frame" role="status">Preparing your deck…</div>}</>;
}
