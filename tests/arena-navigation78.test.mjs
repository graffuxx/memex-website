import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../public/game/vendor/three.module.min.js';
import {DEFAULT_ARENA_POSE78,normalizeArenaPose78,dragArenaPose78,boardCardProjection78,bindArenaNavigation78} from '../public/game/src/arena-navigation78.mjs';
import {fitVoidforgeCamera77} from '../public/game/src/voidforge-arena77.mjs';
import {createVoidNebula78} from '../public/game/src/void-nebula78.mjs';
import {createAtmosphere} from '../public/game/src/voidforge-atmosphere77.mjs';

test('orbit wraps fully, pitch and panning stay bounded, and reset preserves original 68 degree view',()=>{
 const pose=normalizeArenaPose78({yaw:100,pitch:-100,panX:100,panZ:-100});assert.equal(pose.pitch,48);assert.equal(pose.panX,1.65);assert.equal(pose.panZ,-1.5);assert.ok(Math.abs(pose.yaw)<=Math.PI);
 const orbit=dragArenaPose78(DEFAULT_ARENA_POSE78,200,-100,'orbit');assert.notEqual(orbit.yaw,0);assert.equal(orbit.pitch,58);
 const pan=dragArenaPose78({...DEFAULT_ARENA_POSE78,yaw:Math.PI/2},100,0,'pan');assert.ok(Math.abs(pan.panX)<1e-12);assert.ok(pan.panZ>1);assert.equal(pan.pitch,68);
 assert.deepEqual(normalizeArenaPose78({yaw:NaN,pitch:Infinity}),DEFAULT_ARENA_POSE78);
});
test('projected card flights keep correct scale and orientation at side, reverse and panned camera views',()=>{
 for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2])for(const pitch of [48,68,78]){
  const camera=new T.PerspectiveCamera(35,1,.1,90);camera.up.set(0,0,-1);fitVoidforgeCamera77(camera,1000,530,1.12,{yaw,pitch,panX:1.2,panZ:-.8});
  assert.deepEqual(camera.up.toArray(),[0,1,0]);const world=new T.Vector3(1.7,.30,1.5),p=boardCardProjection78(camera,world,1000,530,58);assert.ok(p.scale>20&&Number.isFinite(p.x)&&Number.isFinite(p.y));
  const expected=new T.Quaternion().setFromEuler(new T.Euler(-Math.PI/2,0,0));assert.ok(camera.quaternion.clone().multiply(p.quaternion).angleTo(expected)<1e-6);
  const projected=world.clone().project(camera),unprojected=projected.clone().unproject(camera);assert.ok(unprojected.distanceTo(world)<1e-10);
 }
});
test('camera input leaves left card/field actions alone; supports right orbit and shift/middle/background pan',()=>{
 const listeners=new Map(),stage={dataset:{},addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:n=>listeners.delete(n),setPointerCapture(){},releasePointerCapture(){}};let pose={...DEFAULT_ARENA_POSE78},allowed=true,changes=0;
 const input=bindArenaNavigation78(stage,{enabled:()=>true,canStart:()=>allowed,getPose:()=>pose,onChange:p=>{pose=p;changes++;}});
 const event=(button,field=false,shiftKey=false,x=0,y=0)=>({button,shiftKey,pointerId:1,clientX:x,clientY:y,pointerType:'mouse',target:{closest:s=>s==='[data-cell]'&&field?{}:null},preventDefault(){},stopPropagation(){}});
 listeners.get('pointerdown')(event(0,true));listeners.get('pointermove')(event(0,true,false,100,50));assert.equal(changes,0);
 listeners.get('pointerdown')(event(2,true));listeners.get('pointermove')(event(2,true,false,100,50));listeners.get('pointerup')(event(2));assert.notEqual(pose.yaw,0);assert.equal(stage.dataset.cameraDragging,undefined);
 input.setMode('pan');const before=pose.panX;listeners.get('pointerdown')(event(0));listeners.get('pointermove')(event(0,false,false,60,30));listeners.get('pointerup')(event(0));assert.notEqual(pose.panX,before);
 allowed=false;const count=changes;listeners.get('pointerdown')(event(1));listeners.get('pointermove')(event(1,false,false,100,100));assert.equal(changes,count);input.dispose();assert.equal(listeners.size,0);
});
test('nebula stays on a separate background layer, time freezes with motion off and particle budget is bounded',()=>{
 const nebula=createVoidNebula78();let scene;const renderer={setViewport(){},setScissorTest(){},render(s){scene=s;}};nebula.frame(.04,true);nebula.render(renderer,1200,700);
 const mist=scene.children.find(o=>o.isMesh),stars=scene.children.find(o=>o.isPoints);assert.equal(mist.material.depthWrite,false);assert.equal(mist.material.depthTest,false);assert.equal(stars.geometry.attributes.position.count,42);
 const time=mist.material.uniforms.uTime.value;nebula.frame(.05,false);assert.equal(mist.material.uniforms.uTime.value,time);assert.equal(stars.visible,false);nebula.dispose();assert.equal(scene.children.length,0);
 const terrain=new T.Scene(),root=new T.Group(),clusters=[[-4.25,-2.7],[4.1,-2.9],[4.7,2.6]].map(([x,z])=>{const g=new T.Group();g.position.set(x,.1,z);return g;});terrain.add(root);const atmosphere=createAtmosphere({scene:terrain,clusters,root});atmosphere.frame(4,null,true);
 const points=terrain.children.filter(o=>o.isPoints);assert.equal(points[0].geometry.attributes.position.count,33);assert.equal(points.reduce((n,o)=>n+o.geometry.attributes.position.count,0),57);atmosphere.frame(4,null,false);assert.ok(points.every(o=>!o.visible));terrain.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
});
