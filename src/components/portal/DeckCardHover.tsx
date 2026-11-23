'use client';

import {useEffect,useImperativeHandle,useState,type Ref} from 'react';
import {createPortal} from 'react-dom';
import GameCardFace from './GameCardFace';
import {DEFINITIONS,RARITIES,getVariant} from '../../../public/game/platform/catalog.mjs';

export type DeckCardHoverHandle={show:(anchor:HTMLElement,id:string)=>void;hide:()=>void};
type Hover={id:string;left:number;top:number;size:number};

export default function DeckCardHover({ref}:{ref:Ref<DeckCardHoverHandle>}){
 const [hover,setHover]=useState<Hover|null>(null);
 useImperativeHandle(ref,()=>({
  show(anchor,id){
   const bounds=anchor.getBoundingClientRect(),width=window.innerWidth,height=window.innerHeight;
   const size=Math.min(248,width-24,height*.48),gap=12;
   const side=bounds.right+size+gap<=width-gap?bounds.right+gap:bounds.left-size-gap;
   const left=Math.max(gap,Math.min(width-size-gap,side));
   const top=Math.max(gap,Math.min(height-size-gap,bounds.top+(bounds.height-size)/2));
   setHover({id,left,top,size});
  },
  hide(){setHover(null);}
 }),[]);
 useEffect(()=>{
  const hide=()=>setHover(null);
  window.addEventListener('resize',hide);
  window.addEventListener('scroll',hide,true);
  return()=>{window.removeEventListener('resize',hide);window.removeEventListener('scroll',hide,true);};
 },[]);
 if(!hover)return null;
 const variant=getVariant(hover.id);
 if(!variant)return null;
 const card=DEFINITIONS.find(card=>card.id===variant.definitionId),rarity=RARITIES.find(rarity=>rarity.id===variant.rarity);
 if(!card||!rarity)return null;
 return createPortal(<div className="dv-portal deck-card-hover" aria-hidden="true" style={{left:hover.left,top:hover.top,width:hover.size}}>
  <GameCardFace card={card} variant={variant} color={rarity.color} compact/>
 </div>,document.body);
}
