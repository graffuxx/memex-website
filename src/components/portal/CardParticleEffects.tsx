import {PARTICLE_COUNTS,PARTICLE_PERIODS,VORTEX,effectOffset,particleSamples} from '../../../public/game/src/card-particles23.mjs';
import {FRAME_LAYOUT} from '../../../public/game/src/card-layout21.mjs';
type Props={rarity:string;id:string};
const hex=Array.from({length:6},(_,i)=>{const a=(i*60-30)*Math.PI/180;return `${Math.cos(a)*1.012},${Math.sin(a)*1.012}`;}).join(' ');
const fmt=(n:number)=>n.toFixed(4);
export default function CardParticleEffects({rarity,id}:Props){
 const count=PARTICLE_COUNTS[rarity as keyof typeof PARTICLE_COUNTS]??0;if(!count)return null;
 const period=PARTICLE_PERIODS[rarity as keyof typeof PARTICLE_PERIODS],offset=effectOffset(id),mask=`${id}-fx-mask`,dust=`${id}-fx-dust`;
 return <g className="card-fx" data-effect={rarity} aria-hidden="true" pointerEvents="none">
  <defs>
   <mask id={mask} maskUnits="userSpaceOnUse" x="-1.12" y="-1.12" width="2.24" height="2.24"><rect x="-1.11" y="-1.11" width="2.22" height="2.22" fill="#fff"/>{FRAME_LAYOUT.values.map(([x,y],i)=><circle key={i} cx={x} cy={-y} r=".205" fill="#000"/>)}<circle cy={-FRAME_LAYOUT.abilityY} r=".205" fill="#000"/><circle cy={-FRAME_LAYOUT.elementY} r=".205" fill="#000"/><rect x="-.57" y={-FRAME_LAYOUT.titleY-.115} width="1.14" height=".23" fill="#000"/></mask>
   <radialGradient id={dust}>{rarity==='mythic'?<><stop stopColor="#06020d" stopOpacity=".95"/><stop offset=".5" stopColor="#49206a" stopOpacity=".7"/><stop offset="1" stopColor="#7e47ac" stopOpacity="0"/></>:<><stop stopColor="#fff7c5"/><stop offset=".3" stopColor="#ffdf8b" stopOpacity=".7"/><stop offset="1" stopColor="#ffc363" stopOpacity="0"/></>}</radialGradient>
  </defs>
  <g mask={`url(#${mask})`}>
   {Array.from({length:count},(_,index)=>{
    const samples=particleSamples(rarity,index,offset),duration=`${period}s`;
    return <g key={index}>
     <animateTransform attributeName="transform" type="translate" values={samples.map(p=>`${fmt(p.x)} ${fmt(-p.y)}`).join(';')} dur={duration} repeatCount="indefinite"/>
     <animate attributeName="opacity" values={samples.map(p=>fmt(p.opacity)).join(';')} dur={duration} repeatCount="indefinite"/>
     <g><animateTransform attributeName="transform" type="rotate" values={samples.map(p=>fmt(-p.angle*180/Math.PI)).join(';')} dur={duration} repeatCount="indefinite"/>
      <g><animateTransform attributeName="transform" type="scale" values={samples.map(p=>fmt(p.size)).join(';')} dur={duration} repeatCount="indefinite"/>
       {rarity==='legendary'?<><path d="M0 -1L.12 -.12L1 0L.12 .12L0 1L-.12 .12L-1 0L-.12 -.12Z" fill="#efffff"/><circle r=".2" fill="#fff"/></>:<ellipse rx={rarity==='mythic'?3.2:1} ry="1" fill={`url(#${dust})`}/>}
      </g>
     </g>
    </g>;
   })}
   {rarity==='mythic'&&<g transform={`translate(${VORTEX.x} ${-VORTEX.y})`}><circle r=".055" fill="#030109"/><g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite"/><ellipse rx=".10" ry=".060" fill="none" stroke="#ad6be4" strokeWidth=".008" opacity=".78"/><ellipse rx=".12" ry=".072" fill="none" stroke="#7133a0" strokeWidth=".01" opacity=".24"/></g></g>}
  </g>
 </g>;
}
