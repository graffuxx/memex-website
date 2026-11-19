'use client';
import {useEffect,useRef,useState} from 'react';
import {VOID_MIST_COUNT,VOID_MIST_PERIOD,voidMistSamples} from '../../../public/game/src/card-void40.mjs';
const hex=(r:number)=>Array.from({length:6},(_,i)=>{const a=(i*60-30)*Math.PI/180;return `${Math.cos(a)*r},${Math.sin(a)*r}`;}).join(' ');
const fmt=(n:number)=>n.toFixed(4);
export default function VoidCardMist({id,offset}:{id:string;offset:number}){
 const root=useRef<SVGGElement>(null),[visible,setVisible]=useState(false);
 useEffect(()=>{const svg=root.current?.ownerSVGElement;if(!svg)return;if(typeof IntersectionObserver==='undefined'){setVisible(true);return;}const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{rootMargin:'120px'});observer.observe(svg);return()=>observer.disconnect();},[]);
 const fog=id+'-void-fog',noise=id+'-void-grain',energy=id+'-void-energy';
 return <g className="card-void-mist" data-void-finish="nebula-frame" ref={root}>{visible&&<>
  <defs>
   <radialGradient id={fog}><stop stopColor="#ead6ff" stopOpacity=".98"/><stop offset=".22" stopColor="#b986ef" stopOpacity=".92"/><stop offset=".56" stopColor="#71358f" stopOpacity=".65"/><stop offset="1" stopColor="#10031c" stopOpacity="0"/></radialGradient>
   <linearGradient id={energy} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ead5ff" stopOpacity=".8"/><stop offset=".3" stopColor="#8550bd" stopOpacity=".2"/><stop offset=".65" stopColor="#bb7ffa" stopOpacity=".7"/><stop offset="1" stopColor="#240839" stopOpacity=".1"/></linearGradient>
   <filter id={noise} filterUnits="userSpaceOnUse" x="-1.15" y="-1.15" width="2.3" height="2.3" colorInterpolationFilters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="4.1 5.3" numOctaves="2" seed="13" result="grain"/><feDisplacementMap in="SourceGraphic" in2="grain" scale=".075" xChannelSelector="R" yChannelSelector="B"/><feGaussianBlur stdDeviation=".016"/></filter>
  </defs>
  <g filter={`url(#${noise})`}>
   <polygon points={hex(.99)} fill="none" stroke="#9356bd" strokeWidth=".10" opacity=".48"/>
   {Array.from({length:VOID_MIST_COUNT},(_,i)=>{const samples=voidMistSamples(i,offset);return <g key={i}><animateTransform attributeName="transform" type="translate" values={samples.map(p=>`${fmt(p.x)} ${fmt(-p.y)}`).join(';')} dur={`${VOID_MIST_PERIOD}s`} repeatCount="indefinite"/><animate attributeName="opacity" values={samples.map(p=>fmt(p.opacity)).join(';')} dur={`${VOID_MIST_PERIOD}s`} repeatCount="indefinite"/><g><animateTransform attributeName="transform" type="rotate" values={samples.map(p=>fmt(-p.angle*180/Math.PI)).join(';')} dur={`${VOID_MIST_PERIOD}s`} repeatCount="indefinite"/><g><animateTransform attributeName="transform" type="scale" values={samples.map(p=>fmt(p.size)).join(';')} dur={`${VOID_MIST_PERIOD}s`} repeatCount="indefinite"/><ellipse rx="2.7" ry="1.3" fill={`url(#${fog})`}/><ellipse cx="1.2" cy=".4" rx="1.8" ry=".85" fill={`url(#${fog})`}/></g></g></g>;})}
  </g>
  <polygon points={hex(.978)} fill="none" stroke={`url(#${energy})`} strokeWidth=".012" strokeLinecap="round" pathLength="6" strokeDasharray=".32 1.18" opacity=".7"><animate attributeName="stroke-dashoffset" from="0" to="-6" dur="15s" repeatCount="indefinite"/></polygon>
  <polygon points={hex(.915)} fill="none" stroke="#c090f7" strokeWidth=".006" strokeLinecap="round" pathLength="6" strokeDasharray=".15 1.85" opacity=".38"><animate attributeName="stroke-dashoffset" from="-6" to="0" dur="22s" repeatCount="indefinite"/></polygon>
 </>}</g>;
}
