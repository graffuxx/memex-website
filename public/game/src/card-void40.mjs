import {FRAME_LAYOUT} from './card-layout21.mjs';
export const VOID_MIST_COUNT=12,VOID_MIST_PERIOD=17;
const TAU=Math.PI*2,fract=x=>x-Math.floor(x);
function edgePoint(t,radius){const p=fract(t)*6,i=Math.floor(p),f=p-i,a=(i*60-30)*Math.PI/180,b=((i+1)*60-30)*Math.PI/180;return {x:(Math.cos(a)*(1-f)+Math.cos(b)*f)*radius,y:(Math.sin(a)*(1-f)+Math.sin(b)*f)*radius};}
export function voidMistState(index,time){const phase=fract(time/VOID_MIST_PERIOD+index/VOID_MIST_COUNT),p=edgePoint(phase,.995+.014*Math.sin(phase*TAU*2+index*1.7));return {...p,size:.068+.016*Math.sin(phase*TAU*2+index),opacity:.64+.16*Math.sin(phase*TAU+index),angle:Math.atan2(p.y,p.x)+Math.PI/2};}
export function voidMistSamples(index,offset=0){const samples=Array.from({length:49},(_,i)=>voidMistState(index,offset+i/48*VOID_MIST_PERIOD));for(let i=1;i<samples.length;i++){while(samples[i].angle-samples[i-1].angle>Math.PI)samples[i].angle-=TAU;while(samples[i].angle-samples[i-1].angle< -Math.PI)samples[i].angle+=TAU;}return samples;}
export function voidSparkState(index,time){const phase=fract(time/8.5+index*.381966),p=edgePoint(phase,.966+.018*Math.sin(TAU*phase*2+index));return {...p,size:.010+(index%3)*.003,opacity:.48*Math.pow(.5+.5*Math.sin(TAU*(phase*3+index*.19)),2),angle:Math.atan2(p.y,p.x)+Math.PI/2};}
export function voidBorderCoverage(x,y){const radius=Math.max(Math.abs(x)*1.15470054,Math.abs(y)+Math.abs(x)*.57735027);if(radius<.80||radius>1.10)return 0;for(const [sx,sy]of FRAME_LAYOUT.values)if(Math.hypot(x-sx,y-sy)<.205)return 0;for(const sy of[FRAME_LAYOUT.abilityY,FRAME_LAYOUT.elementY])if(Math.hypot(x,y-sy)<.205)return 0;if(Math.abs(x)<.59&&Math.abs(y-FRAME_LAYOUT.titleY)<.13)return 0;return 1;}
export const VOID_FOG_FRAGMENT=`varying vec2 vCard;uniform float uTime;
float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise21(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash21(i),hash21(i+vec2(1.,0.)),f.x),mix(hash21(i+vec2(0.,1.)),hash21(i+vec2(1.,1.)),f.x),f.y);}
float fogNoise(vec2 p){return .57*noise21(p)+.28*noise21(p*2.07+4.7)+.15*noise21(p*4.13+8.1);}
float protectedSurface(vec2 p){float m=1.;
${FRAME_LAYOUT.values.map(([x,y])=>`m*=smoothstep(.195,.225,length(p-vec2(${x.toFixed(4)},${y.toFixed(4)})));`).join('\n')}
m*=smoothstep(.195,.225,length(p-vec2(0.,${FRAME_LAYOUT.abilityY})));m*=smoothstep(.195,.225,length(p-vec2(0.,${FRAME_LAYOUT.elementY})));
if(abs(p.x)<.59&&abs(p.y-(${FRAME_LAYOUT.titleY}))<.13)m=0.;return m;}
void main(){vec2 p=vCard;float hex=max(abs(p.x)*1.15470054,abs(p.y)+abs(p.x)*.57735027);float band=smoothstep(.80,.91,hex)*(1.-smoothstep(1.045,1.12,hex));float mask=band*protectedSurface(p)*smoothstep(.003,.012,abs(hex-1.021));if(mask<.001)discard;
float t=uTime*.16;vec2 drift=vec2(t,-t*.7);float n=fogNoise(p*6.+drift);float curl=fogNoise(p*8.+vec2(-t*.6,t)+vec2(n*1.8));float cloud=smoothstep(.26,.75,n*.55+curl*.65);float veins=pow(max(0.,sin(hex*46.+curl*9.-t*2.)),12.);float sweep=.5+.5*sin(atan(p.y,p.x)*3.-uTime*.55+curl*4.);
vec3 color=mix(vec3(.045,.009,.080),vec3(.59,.31,.84),cloud);color=mix(color,vec3(.77,.47,1.),veins*sweep*.7);float alpha=mask*(.24+.59*cloud+.16*veins);gl_FragColor=vec4(color,alpha);}`;
