import test from 'node:test';
import assert from 'node:assert/strict';
import {createVoidNebula78} from '../public/game/src/void-nebula78.mjs';
import {voidStormState79} from '../public/game/src/void-storm79.mjs';
import {VOID_WEATHER_CUES137,VOID_MUSIC137,voidMusicWeather137} from '../public/game/src/void-weather137.mjs';

test('all nine approved weather cues use the correct stereo side, including subsequent loops',()=>{
 assert.equal(VOID_MUSIC137.duration,192);assert.equal(VOID_WEATHER_CUES137.length,9);
 for(const {at,pan}of VOID_WEATHER_CUES137){
  for(const loop of [0,1,100]){
   const pulse=voidMusicWeather137({position:at+192*loop,duration:192});
   assert.ok(pulse[pan<0?'left':'right']>.95);
   assert.equal(pulse[pan<0?'right':'left'],0);
  }
  assert.deepEqual(voidMusicWeather137({position:at-1,duration:192}),{left:0,right:0});
  assert.deepEqual(voidMusicWeather137({position:at+2,duration:192}),{left:0,right:0});
 }
});

test('cue pulses stay smooth and bounded; disabled motion and invalid input produce no flashes',()=>{
 let previous={left:0,right:0};
 for(let time=0;time<192;time+=.02){
  const state=voidMusicWeather137({position:time,duration:192});
  for(const side of ['left','right']){
   assert.ok(state[side]>=0&&state[side]<=1);
   assert.ok(Math.abs(state[side]-previous[side])<.06);
  }
  previous=state;
 }
 for(const timeline of [null,{}, {position:NaN,duration:192}, {position:4,duration:0}])assert.deepEqual(voidMusicWeather137(timeline),{left:0,right:0});
 assert.deepEqual(voidMusicWeather137({position:4,duration:192},false),{left:0,right:0});
 assert.deepEqual(voidMusicWeather137({position:8,duration:384}),voidMusicWeather137({position:4,duration:192}));
});

test('the real nebula shader tracks audio after slow frames and seeks, but retains silent ambient fallback',()=>{
 const nebula=createVoidNebula78();let scene;
 nebula.render({setViewport(){},setScissorTest(){},render(value){scene=value;}},1000,700);
 const uniform=scene.children.find(o=>o.isMesh).material.uniforms.uStorm.value;
 for(const position of [4,26,49,96,196]){
  nebula.frame(.5,true,{position,duration:192});
  const expected=voidMusicWeather137({position,duration:192});
  assert.deepEqual(uniform.toArray(),[expected.left,expected.right]);
 }
 nebula.frame(.05,false,{position:4,duration:192});
 assert.deepEqual(uniform.toArray(),[0,0]);
 nebula.frame(.05,true,null);
 const ambient=voidStormState79(.3);
 assert.ok(Math.abs(uniform.x-ambient.left)<1e-10);
 assert.ok(Math.abs(uniform.y-ambient.right)<1e-10);
 nebula.dispose();
});
