import * as T from '../vendor/three.module.min.js';

export const DEFAULT_ARENA_POSE78=Object.freeze({yaw:0,pitch:68,panX:0,panZ:0});
export function normalizeArenaPose78(pose={}){
 const finite=(v,f)=>Number.isFinite(v)?v:f;
 return {yaw:T.MathUtils.euclideanModulo(finite(pose.yaw,0)+Math.PI,Math.PI*2)-Math.PI,pitch:T.MathUtils.clamp(finite(pose.pitch,68),48,78),panX:T.MathUtils.clamp(finite(pose.panX,0),-1.65,1.65),panZ:T.MathUtils.clamp(finite(pose.panZ,0),-1.5,1.5)};
}
export function dragArenaPose78(start,dx,dy,mode){
 if(mode==='pan'){const x=-dx*.012,z=-dy*.012;return normalizeArenaPose78({...start,panX:start.panX+x*Math.cos(start.yaw)+z*Math.sin(start.yaw),panZ:start.panZ-x*Math.sin(start.yaw)+z*Math.cos(start.yaw)});}
 return normalizeArenaPose78({...start,yaw:start.yaw-dx*.006,pitch:start.pitch+dy*.10});
}
export function arenaCameraPose78(camera,distance,pose){
 const p=normalizeArenaPose78(pose),a=p.pitch*Math.PI/180,focus=new T.Vector3(p.panX,-.30,p.panZ);
 camera.position.copy(focus).add(new T.Vector3(Math.sin(p.yaw)*Math.cos(a),Math.sin(a),Math.cos(p.yaw)*Math.cos(a)).multiplyScalar(distance));camera.lookAt(focus);camera.updateMatrixWorld();
}
export function boardCardProjection78(camera,position,width,height,top=0,scale=.84){
 const center=position.clone().project(camera),depth=-position.clone().applyMatrix4(camera.matrixWorldInverse).z;
 return {x:(center.x+1)*width/2,y:(1-center.y)*height/2+top,scale:scale*height*.5*camera.projectionMatrix.elements[5]/Math.max(.1,depth),quaternion:camera.quaternion.clone().invert().multiply(new T.Quaternion().setFromEuler(new T.Euler(-Math.PI/2,0,0)))};
}
export function bindArenaNavigation78(stage,{enabled,canStart,getPose,onChange,onEnd=()=>{}}){
 let drag=null,mode='orbit';
 function down(e){
  if(!enabled()||!canStart()||e.pointerType==='touch'||e.target.closest('button,input,select,textarea,a,[data-hand],.arena-zoom'))return;
  const kind=e.button===1||e.button===0&&e.shiftKey?'pan':e.button===2?'orbit':e.button===0&&!e.target.closest('[data-cell]')?mode:null;
  if(!kind)return;e.preventDefault();e.stopPropagation();drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:{...getPose()},kind};stage.setPointerCapture(e.pointerId);stage.dataset.cameraDragging=kind;
 }
 function move(e){if(!drag||drag.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();onChange(dragArenaPose78(drag.start,e.clientX-drag.x,e.clientY-drag.y,drag.kind));}
 function up(e){if(!drag||e.pointerId!==drag.id)return;e.preventDefault();e.stopPropagation();try{stage.releasePointerCapture(e.pointerId);}catch{}drag=null;delete stage.dataset.cameraDragging;onEnd();}
 function context(e){if(enabled()){e.preventDefault();e.stopPropagation();}}
 function lost(){if(!drag)return;drag=null;delete stage.dataset.cameraDragging;onEnd();}
 stage.addEventListener('pointerdown',down,true);stage.addEventListener('pointermove',move,true);stage.addEventListener('pointerup',up,true);stage.addEventListener('pointercancel',up,true);stage.addEventListener('lostpointercapture',lost);stage.addEventListener('contextmenu',context);
 return {setMode(v){mode=v==='pan'?'pan':'orbit';stage.dataset.cameraMode=mode;},dispose(){for(const [event,handler,capture]of [['pointerdown',down,true],['pointermove',move,true],['pointerup',up,true],['pointercancel',up,true],['lostpointercapture',lost,false],['contextmenu',context,false]])stage.removeEventListener(event,handler,capture);delete stage.dataset.cameraDragging;delete stage.dataset.cameraMode;}};
}
