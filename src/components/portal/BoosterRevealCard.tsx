'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import GameCardFace from './GameCardFace';
import {DEFINITIONS,RARITIES,getVariant} from '../../../public/game/platform/catalog.mjs';
import {UNIVERSAL_CARD_BACK} from '../../../public/game/platform/edition36.mjs';
type Props={id:string;slot:number;visible:boolean;saving:boolean;disabled:boolean;isNew:boolean;onReveal:()=>void};
export default function BoosterRevealCard({id,slot,visible,saving,disabled,isNew,onReveal}:Props){
 const variant=getVariant(id)!,card=DEFINITIONS.find(c=>c.id===variant.definitionId)!,rarity=RARITIES.find(r=>r.id===variant.rarity)!;
 const previous=useRef(visible),[celebrate,setCelebrate]=useState(false);
 const special=['epic','legendary','mythic'].includes(variant.rarity);
 useEffect(()=>{const fresh=visible&&!previous.current;previous.current=visible;if(!fresh||!special){setCelebrate(false);return;}setCelebrate(true);const timer=setTimeout(()=>setCelebrate(false),variant.rarity==='mythic'?5000:3000);return()=>clearTimeout(timer);},[visible,special,variant.rarity]);
 return <article className={'alpha-reveal-slot '+(visible?'is-revealed ':'')+(celebrate?'is-celebrating':'')} data-finish={variant.rarity}>
  <span className="alpha-card-number">CARD {String(slot+1).padStart(2,'0')}</span>
  <div className="alpha-reveal-art">
   {celebrate&&<div className="alpha-rarity-burst" aria-hidden="true">{variant.rarity==='mythic'?<>
    <div className="alpha-void-singularity"><span className="alpha-void-eclipse"/><span className="alpha-void-disk alpha-void-disk--one"/><span className="alpha-void-disk alpha-void-disk--two"/><span className="alpha-void-shockwave"/><span className="alpha-void-shockwave alpha-void-shockwave--echo"/><span className="alpha-void-lens"/>{Array.from({length:8},(_,i)=><span className="alpha-void-rift" key={i} style={{'--rift-angle':`${i*45+12}deg`,'--rift-delay':`${(i%3)*.13}s`} as CSSProperties}/>)}</div><span className="alpha-void-title">VOID</span>
   </>:<><span className="alpha-rarity-ring"/><span className="alpha-rarity-aura"/></>}{Array.from({length:variant.rarity==='mythic'?64:variant.rarity==='legendary'?24:16},(_,i)=><i key={i} style={{'--angle':`${i*137.508}deg`,'--distance':`${variant.rarity==='mythic'?125+(i%7)*16:70+(i%5)*16}px`,'--delay':`${(i%8)*.07}s`,'--spin':`${i*29}deg`} as CSSProperties}/>)}</div>}

   <button className="alpha-card-reveal" disabled={visible||disabled} aria-label={visible?`${card.name} ${rarity.name}`:`Reveal card ${slot+1}`} onClick={onReveal}>
    <span className={'alpha-card-flipper'+(visible?' is-face-up':'')}><span className="alpha-card-back" aria-hidden={visible}><img src={UNIVERSAL_CARD_BACK} alt="Face-down card · universal X back"/></span><span className="alpha-card-front" aria-hidden={!visible}>{visible&&<GameCardFace card={card} variant={variant} color={rarity.color}/>}<i className="alpha-reveal-gleam" aria-hidden="true"/></span></span>
   </button>
  </div>
  <div className="alpha-reveal-meta">{visible?<><strong>{card.name}</strong><span style={{color:rarity.color}}>{rarity.name} · {variant.element}</span>{isNew&&<small>New variant</small>}</>:<span>{saving?'Saving reveal…':'Click to reveal'}</span>}</div>
 </article>;
}
