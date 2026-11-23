'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {createBoosterAudio} from '../../../public/game/src/booster-audio41.mjs';
const KEY='duelverse.booster-sound.v41';
type State={enabled:boolean;available:boolean;running:boolean;lastCue:string;playCount:number};
export default function useBoosterAudio(){
 const audio=useRef<ReturnType<typeof createBoosterAudio>|null>(null);
 const [state,setState]=useState<State>({enabled:true,available:true,running:false,lastCue:'',playCount:0});
 useEffect(()=>{let alive=true;const engine=createBoosterAudio({onState:(next:State)=>{if(alive)setState(next);}});audio.current=engine;let enabled=true;try{enabled=localStorage.getItem(KEY)!=='off';}catch{}engine.setEnabled(enabled);void engine.preloadTear();
  const visibility=()=>{if(document.hidden)engine.suspend();};document.addEventListener('visibilitychange',visibility);
  return()=>{alive=false;document.removeEventListener('visibilitychange',visibility);engine.dispose();if(audio.current===engine)audio.current=null;};
 },[]);
 const toggle=useCallback(()=>{const engine=audio.current;if(!engine)return;const next=!state.enabled;engine.setEnabled(next);if(next)engine.unlock();try{localStorage.setItem(KEY,next?'on':'off');}catch{}},[state.enabled]);
 const unlock=useCallback(()=>audio.current?.unlock(),[]),stop=useCallback(()=>audio.current?.stop(),[]);
 const tear=useCallback(()=>{const engine=audio.current;if(engine?.unlock())engine.play('tear');},[]);
 const reveal=useCallback((rarity:string)=>audio.current?.play(rarity),[]);
 return {...state,toggle,unlock,stop,tear,reveal};
}
