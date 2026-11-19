'use client';
import {useEffect,useRef,useState} from 'react';
import {supabase} from '@/lib/supabaseClient';
import {loadPlayer,type PlayerState} from '@/lib/duelverse/account';
import {starterInventory} from '../../../public/game/platform/catalog.mjs';
import {readTestCollection,testInventory} from '../../../public/game/platform/booster-test.mjs';
export default function usePlayerCollection(){
 const [ready,setReady]=useState(false),[userId,setUserId]=useState<string|null>(null),[player,setPlayer]=useState<PlayerState|null>(null),[error,setError]=useState('');
 const [testMode,setTestMode]=useState(false),[testItems,setTestItems]=useState<Record<string,number>>({});const generation=useRef(0);
 useEffect(()=>{
  if(new URLSearchParams(window.location.search).get('test')==='1'){setTestMode(true);try{setTestItems(testInventory(readTestCollection(localStorage)));}catch{setError('Browser storage is unavailable.');}setReady(true);return;}
  let alive=true,lastId:string|null|undefined;
  async function restore(id:string|null){if(id===lastId)return;lastId=id;const ticket=++generation.current;if(!alive)return;setReady(false);setUserId(id);setPlayer(null);setError('');
   if(!id){try{if(JSON.parse(localStorage.getItem('duelverse.play-deck.v1')??'null')?.source==='account')localStorage.removeItem('duelverse.play-deck.v1');}catch{}setReady(true);return;}
   try{const data=await loadPlayer();if(alive&&ticket===generation.current)setPlayer(data);}
   catch(e){if(alive&&ticket===generation.current)setError(e instanceof Error?e.message:'Collection unavailable.');}
   finally{if(alive&&ticket===generation.current)setReady(true);}
  }
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>{if(alive)void restore(session?.user.id??null);},0);});
  return()=>{alive=false;generation.current++;subscription.unsubscribe();};
 },[]);
 return {ready,userId,player,error,testMode,inventory:testMode?testItems:userId?(player?.inventory??{}):starterInventory()};
}
