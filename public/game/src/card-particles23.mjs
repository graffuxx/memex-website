import {FRAME_LAYOUT} from './card-layout21.mjs';
import {voidSparkState} from './card-void40.mjs';
export const PARTICLE_COUNTS=Object.freeze({epic:8,legendary:12,mythic:18});
export const PARTICLE_PERIODS=Object.freeze({epic:18,legendary:5.6,mythic:8.5});
const TAU=Math.PI*2,fract=v=>v-Math.floor(v);
export function effectOffset(seed=''){let h=2166136261;for(const c of String(seed)){h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;}return (h%1000)/100;}
export function effectCoverage(x,y,margin=0){
 if(Math.max(Math.abs(x),Math.abs(y))>1.11-margin)return 0;
 for(const [sx,sy] of FRAME_LAYOUT.values)if(Math.hypot(x-sx,y-sy)<.19+margin)return 0;
 for(const sy of [FRAME_LAYOUT.abilityY,FRAME_LAYOUT.elementY])if(Math.hypot(x,y-sy)<.19+margin)return 0;
 if(Math.abs(x)<.57+margin&&Math.abs(y-FRAME_LAYOUT.titleY)<.115+margin)return 0;
 return 1;
}
function edgePoint(t,radius=1.025){const p=fract(t)*6,i=Math.floor(p),f=p-i;const a=(i*60-30)*Math.PI/180,b=((i+1)*60-30)*Math.PI/180;return {x:(Math.cos(a)*(1-f)+Math.cos(b)*f)*radius,y:(Math.sin(a)*(1-f)+Math.sin(b)*f)*radius};}
export function particleState(key,index,time){
 let x=0,y=0,size=0,opacity=0,angle=0;
 const period=PARTICLE_PERIODS[key];if(!period)return {x,y,size,opacity,angle};
 if(key==='epic'){
  const p=fract(time/period+index*.381966),point=edgePoint(p);x=point.x;y=point.y;
  size=.022+(index%3)*.003;opacity=.36+.28*(.5+.5*Math.sin(TAU*(time/period*2+index*.13)));
 }else if(key==='legendary'){
  const point=edgePoint((index%6)/6+Math.floor(index/6)*.027);x=point.x;y=point.y;
  const phase=fract(time/period+index*.381966),wave=phase<.42?Math.pow(Math.sin(phase/.42*Math.PI),3):0;
  size=.035+.030*wave;opacity=.88*wave;angle=(index%3)*Math.PI/8;
 }else{
  ({x,y,size,opacity,angle}=voidSparkState(index,time));
 }
 opacity*=effectCoverage(x,y,key==='mythic'?.018:size*.35);
 return {x,y,size,opacity,angle};
}
export function particleSamples(key,index,offset=0){
 const period=PARTICLE_PERIODS[key]??1,steps=key==='mythic'?48:32;
 const samples=Array.from({length:steps+1},(_,i)=>particleState(key,index,offset+i/steps*period));
 // SVG interpolates angles numerically; unwrap them so a trail never spins at +/- pi.
 for(let i=1;i<samples.length;i++){while(samples[i].angle-samples[i-1].angle>Math.PI)samples[i].angle-=TAU;while(samples[i].angle-samples[i-1].angle< -Math.PI)samples[i].angle+=TAU;}
 return samples;
}
