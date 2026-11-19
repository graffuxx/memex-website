'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import AlphaBoosterPack from './AlphaBoosterPack';
import {UNIVERSAL_CARD_BACK} from '../../../public/game/platform/edition36.mjs';
export default function BoosterTear({onOpened}:{onOpened:()=>void}){
 const [tearing,setTearing]=useState(false),done=useRef(false),callback=useRef(onOpened);callback.current=onOpened;
 function finish(){if(done.current)return;done.current=true;callback.current();}
 useEffect(()=>{if(!tearing)return;const timer=setTimeout(()=>{if(!done.current){done.current=true;callback.current();}},1700);return()=>clearTimeout(timer);},[tearing]);
 function open(){if(tearing)return;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}setTearing(true);}
 return <div className={'alpha-tear-stage'+(tearing?' is-tearing':'')}>
  <div className="alpha-tear-halo" aria-hidden="true"/>
  <div className="alpha-tear-fan" aria-hidden="true">{Array.from({length:5},(_,i)=><img key={i} src={UNIVERSAL_CARD_BACK} alt="" style={{'--fan':i-2} as CSSProperties}/>)}</div>
  <button className="alpha-tear-pack" onClick={open} disabled={tearing} aria-label="Tear open Alpha Booster">
   <span className="alpha-wrapper-body" aria-hidden="true"><AlphaBoosterPack/></span>
   <span className="alpha-wrapper-top" aria-hidden="true"><AlphaBoosterPack/></span>
   <span className="alpha-tear-seam" aria-hidden="true"/>
  </button>
  <div className="alpha-foil-bits" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{'--bit':i,'--dx':`${(i%2?-1:1)*(35+i*12)}px`,'--dy':`${-40-(i%4)*24}px`} as CSSProperties}/>)}</div>
  <div className="alpha-tear-controls"><button className="button gold" disabled={tearing} onClick={open}>{tearing?'Opening…':'Tear open pack'}</button>{tearing&&<button className="alpha-preview-button" onClick={finish}>Skip animation</button>}</div>
 </div>;
}
