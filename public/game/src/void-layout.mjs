import * as T from '../vendor/three.module.min.js';
export const VOID_ANCHORS={portal:{x:-6.55,y:1.25,z:0},playerA:{x:0,y:-.18,z:5.85},playerB:{x:0,y:-.18,z:-5.85},crystals:{x:-4.45,y:-.15,z:-4.05}};
export const VOID_BOUNDS={min:{x:-8.25,y:-5.65,z:-7.1},max:{x:6.25,y:3.1,z:7.1}};
export const VOID_FRAME_POINTS=[];
for(let i=0;i<24;i++){const a=i*Math.PI/12;for(const y of [-1.0,.35])VOID_FRAME_POINTS.push({x:Math.cos(a)*5.55,y,z:Math.sin(a)*5.55});}
for(const sign of [-1,1])for(const x of [-1.9,1.9])for(const y of [-.5,.35])VOID_FRAME_POINTS.push({x,y,z:sign*6.95});
for(const sign of [-1,1])for(const x of [-2.1,2.1])VOID_FRAME_POINTS.push({x,y:1.25,z:sign*6.15});
for(const x of [-7.9,-5.2])for(const y of [-.25,2.8])for(const z of [-1.1,1.1])VOID_FRAME_POINTS.push({x,y,z});
for(const x of [-5.2,-3.7])for(const y of [-.1,2.8])for(const z of [-4.7,-3.4])VOID_FRAME_POINTS.push({x,y,z});
VOID_FRAME_POINTS.push({x:0,y:-5.55,z:0});
export function fitVoidCamera(camera,width,height,view='a',framing='game'){
 camera.aspect=Math.max(.1,width/height);camera.zoom=1;const top=view==='top',sign=view==='b'?-1:1,focus=new T.Vector3(-.65,-.18,0),direction=new T.Vector3(0,top?1:framing==='showcase'?.50:.86,top?.001:(framing==='showcase'?1:.72)*sign).normalize();camera.up.set(0,top?0:1,top?-1:0);camera.updateProjectionMatrix();
 // During play the tiles take priority; the workshop frames the complete island.
 const points=(framing==='showcase'?VOID_FRAME_POINTS:Array.from({length:24},(_,i)=>({x:Math.cos(i*Math.PI/12)*5.3,y:.3,z:Math.sin(i*Math.PI/12)*5.3}))).map(p=>new T.Vector3(p.x,p.y,p.z));
 const fits=d=>{camera.position.copy(focus).addScaledVector(direction,d);camera.lookAt(focus);camera.updateMatrixWorld();return points.every(p=>{const v=p.clone().project(camera);return Math.abs(v.x)<.94&&Math.abs(v.y)<.94;});};
 let lo=9,hi=65;for(let i=0;i<20;i++){const mid=(lo+hi)/2;if(fits(mid))hi=mid;else lo=mid;}fits(hi);return camera;
}
