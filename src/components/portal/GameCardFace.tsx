'use client';
import {useId,useEffect,useState,type CSSProperties} from 'react';
import CardParticleEffects from './CardParticleEffects';
import {materialFrameUrl,materialOf} from '../../../public/game/src/card-materials22.mjs';
import {alphaNameplateMarkup} from '../../../public/game/platform/edition36.mjs';
import {FRAME_LAYOUT} from '../../../public/game/src/card-layout21.mjs';

type Props={
 card:{name:string;short?:string;element:string;values:readonly number[]};
 variant:{image:string;rarity:string;edition?:string|null;artOffsetY?:number};
 color:string;
 owned?:boolean;
 compact?:boolean;
};
const hex=(radius:number)=>Array.from({length:6},(_,i)=>{
 const angle=(i*60-30)*Math.PI/180;return `${Math.cos(angle)*radius},${Math.sin(angle)*radius}`;
}).join(' ');
const elements:Record<string,{path:string;from:string;to:string}>={
 fire:{path:'M138 20 C113 102 220 108 195 184 C156 248 56 251 54 166 C51 118 102 84 138 20 Z',from:'#fff07a',to:'#ff8d12'},
 stone:{path:'M128 26 L210 128 L128 230 L46 128 Z',from:'#f7e7ae',to:'#b98a40'},
 storm:{path:'M151 20 L59 138 L118 138 L92 236 L202 108 L136 108 Z',from:'#fff3c2',to:'#a49aff'},
};

// The website and 3D game use the same portrait, cutout frame and registration.
// SVG keeps a full collection light without starting a WebGL renderer per card.
export default function GameCardFace({card,variant,color,owned=false,compact=false}:Props){
 const id=useId().replace(/:/g,''),element=elements[card.element]??elements.stone;
 const [frame,setFrame]=useState('/game/assets/cards/frame-v21/navy-gold-frame.webp');
 useEffect(()=>{let active=true;materialFrameUrl(variant.rarity).then(url=>{if(active)setFrame(url);}).catch(()=>{});return()=>{active=false;};},[variant.rarity]);
 const title=(card.short??card.name).toUpperCase();
 const artId=`${id}-art`,foilId=`${id}-foil`,elementId=`${id}-element`;
 return <div className={'duelverse-card'+(compact?' duelverse-card--mini':'')} data-finish={variant.rarity} style={{'--card-finish':color,'--foil-strength':variant.rarity==='epic'?.35:variant.rarity==='legendary'?.30:variant.rarity==='mythic'?.23:.55} as CSSProperties}>
  <svg viewBox="-1.048 -1.048 2.096 2.096" role="img" aria-label={`${card.name} · ${materialOf(variant.rarity).name} · ${card.element} · Edge values: ${card.values.join(', ')}${variant.edition==='alpha'?' · Alpha edition':''}`}>
   <defs>
    <clipPath id={artId}><polygon points={hex(.96)}/></clipPath>
    <linearGradient id={foilId} x1="0" y1="1" x2="1" y2="0"><stop offset="20%" stopColor={color} stopOpacity="0"/><stop offset="48%" stopColor={color} stopOpacity=".12"/><stop offset="52%" stopColor="#fff" stopOpacity=".22"/><stop offset="75%" stopColor={color} stopOpacity="0"/></linearGradient>
    <linearGradient id={elementId} x1="0" y1="0" x2="0" y2="1"><stop stopColor={element.from}/><stop offset="1" stopColor={element.to}/></linearGradient>
   </defs>
   <g clipPath={`url(#${artId})`}>
    <polygon points={hex(.96)} fill="#0b1028"/>
    <image href={variant.image} x="-.96" y={-.96+(variant.artOffsetY??0)} width="1.92" height="1.92" preserveAspectRatio="xMidYMid slice"/>
    {variant.rarity!=='common'&&<rect className="duelverse-card__foil" x="-1" y="-1" width="2" height="2" fill={`url(#${foilId})`}/>}
   </g>
   <image href={frame} x={-FRAME_LAYOUT.width/2} y={-FRAME_LAYOUT.height/2} width={FRAME_LAYOUT.width} height={FRAME_LAYOUT.height} preserveAspectRatio="none"/>
   <polygon className="duelverse-card__rarity" points={hex(.983)} fill="none" stroke={color} strokeWidth=".009"/>
   {owned&&<polygon points={hex(1.014)} fill="none" stroke="#55ed94" strokeWidth=".012"/>}
   <g fill="#17150d" fontFamily="Arial,sans-serif" fontWeight="800" textAnchor="middle" dominantBaseline="central">
    {FRAME_LAYOUT.values.map(([x,y],i)=><text key={i} x={x} y={-y+.0093} fontSize=".1995">{card.values[i]}</text>)}
    <text x="0" y={-FRAME_LAYOUT.titleY+.004} fontSize=".105" textLength={title.length>10?.66:undefined} lengthAdjust="spacingAndGlyphs">{title}</text>
   </g>
   {variant.edition==='alpha'&&<g dangerouslySetInnerHTML={{__html:alphaNameplateMarkup(FRAME_LAYOUT.titleY)}}/>}
   {owned&&<g transform={`translate(-.43 ${-FRAME_LAYOUT.titleY})`}><circle r=".029" fill="#0b1524"/><circle r=".02" fill="#55ed94"/></g>}
   <svg x="-.1225" y={-FRAME_LAYOUT.elementY-.1225} width=".245" height=".245" viewBox="0 0 256 256" aria-hidden="true">
    <path d={element.path} fill={`url(#${elementId})`} stroke="#ffd876" strokeWidth="5" strokeLinejoin="round"/>
   </svg>
   {!compact&&<CardParticleEffects rarity={variant.rarity} id={id}/>}
  </svg>
 </div>;
}
