import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../public/game/vendor/three.module.min.js';
import {VOIDFORGE_ZOOM79,fitVoidforgeCamera77} from '../public/game/src/voidforge-arena77.mjs';
import {boardCardProjection78,expandedArenaCamera79} from '../public/game/src/arena-navigation78.mjs';
import {voidStormState79,VOID_STORM_TIMING79} from '../public/game/src/void-storm79.mjs';
import {createVoidNebula78} from '../public/game/src/void-nebula78.mjs';

test('150% close zoom genuinely moves the camera closer and preserves pick/projection math after pan or rotation',()=>{
 for(const [w,h]of [[1000,530],[780,620]])for(const yaw of [0,Math.PI/2,Math.PI]){
  const camera=new T.PerspectiveCamera(35,1,.1,90),pose={yaw,pitch:68,panX:.8,panZ:-.6};
  fitVoidforgeCamera77(camera,w,h,1.12,pose);const focus=new T.Vector3(.8,-.3,-.6),before=camera.position.distanceTo(focus),beforeScale=boardCardProjection78(camera,new T.Vector3(0,.3,0),w,h).scale;
  const state=fitVoidforgeCamera77(camera,w,h,1.5,pose);assert.equal(state.value,1.5);assert.equal(state.max,1.5);assert.ok(camera.position.distanceTo(focus)<before*.76);
  const world=new T.Vector3(0,.3,0),p=world.clone().project(camera);assert.ok(p.clone().unproject(camera).distanceTo(world)<1e-10);assert.ok(boardCardProjection78(camera,world,w,h).scale>beforeScale*1.3);
  assert.equal(fitVoidforgeCamera77(camera,w,h,99).value,VOIDFORGE_ZOOM79.max);assert.equal(fitVoidforgeCamera77(camera,w,h,NaN).value,1);
 }
});
test('weather light pulses are separated, smooth and finite and stop completely with animation off',()=>{
 const {left,right,duration,period}=VOID_STORM_TIMING79;assert.ok(period>15&&duration>1.5);
 assert.equal(voidStormState79(left).left,0);assert.ok(voidStormState79(left+duration/2).left>.999);assert.equal(voidStormState79(right+duration/2).left,0);assert.ok(voidStormState79(right+duration/2).right>.999);
 let last=voidStormState79(0);for(let t=.02;t<60;t+=.02){const p=voidStormState79(t);assert.ok(p.left>=0&&p.left<=1&&p.right>=0&&p.right<=1);assert.ok(Math.abs(p.left-last.left)<.04&&Math.abs(p.right-last.right)<.04);assert.ok(p.left===0||p.right===0);last=p;}
 assert.deepEqual(voidStormState79(NaN),{left:0,right:0});assert.deepEqual(voidStormState79(left+duration/2,false),{left:0,right:0});
 const nebula=createVoidNebula78();let scene;nebula.render({setViewport(){},setScissorTest(){},render(s){scene=s;}},1000,700);for(let i=0;i<80;i++)nebula.frame(.05,true);const mist=scene.children.find(o=>o.isMesh);assert.ok(mist.material.uniforms.uStorm.value.x>.5);nebula.frame(.05,false);assert.deepEqual(mist.material.uniforms.uStorm.value.toArray(),[0,0]);nebula.dispose();
});

 test('expanded terrain rendering preserves exact board hit coordinates but removes the old rectangular crop',()=>{
 const logical=new T.PerspectiveCamera(35,1,.1,90),render=new T.PerspectiveCamera();
 for(const zoom of [1,1.5])for(const pose of [{yaw:0,pitch:68,panX:0,panZ:0},{yaw:.8,pitch:54,panX:.8,panZ:-.7}]){
 fitVoidforgeCamera77(logical,1000,480,zoom,pose);expandedArenaCamera79(render,logical,640,58,480);
 for(const p of [new T.Vector3(0,.3,0),new T.Vector3(-4,2.8,-4),new T.Vector3(0,-3,5)]){const a=p.clone().project(logical),b=p.clone().project(render);assert.ok(Math.abs(a.x-b.x)<1e-10);assert.ok(Math.abs((1-a.y)*480/2+58-(1-b.y)*640/2)<1e-9);assert.ok(p.clone().project(render).unproject(render).distanceTo(p)<1e-9);}
 assert.ok(render.projectionMatrix.elements[5]<logical.projectionMatrix.elements[5]);
 }
 });
