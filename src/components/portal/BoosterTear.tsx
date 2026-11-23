'use client';
import {useCallback,useEffect,useRef,useState,type CSSProperties} from 'react';
import AlphaBoosterPack from './AlphaBoosterPack';
import {UNIVERSAL_CARD_BACK} from '../../../public/game/platform/edition36.mjs';
export default function BoosterTear({autoStart,onOpened,onOpen,onSkip}:{autoStart:boolean;onOpened:()=>void;onOpen:()=>void;onSkip:()=>void}){
 const [tearing,setTearing]=useState(false),done=useRef(false),openLock=useRef(false),callback=useRef(onOpened);callback.current=onOpened;
 const finish=useCallback(()=>{if(done.current)return;done.current=true;callback.current();},[]);
 useEffect(()=>{if(!tearing)return;const timer=setTimeout(finish,1320);return()=>clearTimeout(timer);},[tearing,finish]);
 const open=useCallback(()=>{
  if(done.current||openLock.current)return;
  openLock.current=true;
  onOpen();
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
  setTearing(true);
 },[finish,onOpen]);
 useEffect(()=>{if(autoStart)open();},[autoStart,open]);
 return <div className={'alpha-tear-stage'+(tearing?' is-tearing':'')}>
  <div className="alpha-tear-halo" aria-hidden="true"/>
  <div className="alpha-tear-wake" aria-hidden="true"><i/><i/><i/></div>
  <div className="alpha-rip-flare" aria-hidden="true"/>
  <div className="alpha-tear-fan" aria-hidden="true">{Array.from({length:5},(_,i)=><img key={i} src={UNIVERSAL_CARD_BACK} alt="" style={{'--fan':i-2} as CSSProperties}/>)}</div>
  <button className="alpha-tear-pack" onClick={open} disabled={tearing} aria-label="Tear open Alpha Booster">
   <span className="alpha-wrapper-body" aria-hidden="true"><AlphaBoosterPack/></span>
   <span className="alpha-wrapper-top" aria-hidden="true"><AlphaBoosterPack/></span>
   <span className="alpha-tear-seam" aria-hidden="true"/>
  </button>
  <div className="alpha-foil-bits" aria-hidden="true">{tearing&&Array.from({length:18},(_,i)=><i key={i} style={{'--bit':i,'--dx':`${(i%2?-1:1)*(38+(i%9)*19)}px`,'--dy':`${-20+(i%5)*34}px`} as CSSProperties}/>)}</div>
  <div className="alpha-tear-controls">{tearing?<button type="button" className="alpha-preview-button" onClick={()=>{onSkip();finish();}}>Skip animation</button>:<span>Click the pack to open</span>}</div>
 </div>;
}
