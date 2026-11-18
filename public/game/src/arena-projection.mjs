import * as T from '../vendor/three.module.min.js';
export const tileCenter=c=>({x:Math.sqrt(3)*(c.q+c.r/2),z:1.5*c.r});
export function fitArenaCamera(camera,width,height,mix=0){
 camera.aspect=Math.max(.1,width/height);camera.up.set(0,0,-1);camera.updateProjectionMatrix();
 const direction=new T.Vector3(0,.83+.17*mix,.56*(1-mix)+.001).normalize(),focus=new T.Vector3(0,.15,0);
 const fits=distance=>{
  camera.position.copy(focus).addScaledVector(direction,distance);camera.lookAt(focus);camera.updateMatrixWorld();
  for(let a=0;a<Math.PI*2;a+=Math.PI/12)for(const y of [-.8,.45]){
   const p=new T.Vector3(Math.cos(a)*5.05,y,Math.sin(a)*5.05).project(camera);if(Math.abs(p.x)>.94||Math.abs(p.y)>.94)return false;
  }
  return true;
 };
 let low=6,high=50;for(let i=0;i<18;i++){const middle=(low+high)/2;if(fits(middle))high=middle;else low=middle;}fits(high);
 return camera;
}
export function projectHex(camera,cell,width,height,radius=.96,y=.32){
 const c=tileCenter(cell);return Array.from({length:6},(_,i)=>{const a=(i*60-30)*Math.PI/180,p=new T.Vector3(c.x+Math.cos(a)*radius,y,c.z+Math.sin(a)*radius).project(camera);return {x:(p.x+1)*width/2,y:(1-p.y)*height/2};});
}
