import test from 'node:test';
import assert from 'node:assert/strict';
import {createVoidNebula78} from '../public/game/src/void-nebula78.mjs';
import {voidStormState79} from '../public/game/src/void-storm79.mjs';
import {VOID_WEATHER_CUES137,VOID_MUSIC137,voidMusicWeather137} from '../public/game/src/void-weather137.mjs';

test('all eight Venom weather cues peak on the intended side in every loop',()=>{
 const loopDuration=VOID_MUSIC137.duration;
 assert.equal(loopDuration,40*240/110);assert.equal(VOID_MUSIC137.bpm,110);assert.equal(VOID_WEATHER_CUES137.length,8);
 for(const {thunderDelay} of VOID_WEATHER_CUES137)assert.ok(thunderDelay>=.18&&thunderDelay<=.3);
 for(const {at,pan}of VOID_WEATHER_CUES137){
  for(const loop of [0,1,100]){
   const pulse=voidMusicWeather137({position:at+loopDuration*loop,duration:loopDuration});
   assert.ok(pulse[pan<0?'left':'right']>.95);
   assert.equal(pulse[pan<0?'right':'left'],0);
  }
  assert.deepEqual(voidMusicWeather137({position:at-1.1,duration:loopDuration}),{left:0,right:0});
  assert.deepEqual(voidMusicWeather137({position:at+2,duration:loopDuration}),{left:0,right:0});
 }
});

test('cue pulses stay smooth and bounded; disabled motion and invalid input produce no flashes',()=>{
 let previous={left:0,right:0};
 for(let time=0;time<VOID_MUSIC137.duration;time+=.02){
  const state=voidMusicWeather137({position:time,duration:VOID_MUSIC137.duration});
  for(const side of ['left','right']){
   assert.ok(state[side]>=0&&state[side]<=1);
   assert.ok(Math.abs(state[side]-previous[side])<.06);
  }
  previous=state;
 }
 const {duration}=VOID_MUSIC137,at=VOID_WEATHER_CUES137[0].at;
 for(const timeline of [null,{}, {position:NaN,duration}, {position:4,duration:0}])assert.deepEqual(voidMusicWeather137(timeline),{left:0,right:0});
 assert.deepEqual(voidMusicWeather137({position:at,duration},false),{left:0,right:0});
 assert.deepEqual(voidMusicWeather137({position:at*2,duration:duration*2}),voidMusicWeather137({position:at,duration}));
});

test('the real nebula shader tracks audio after slow frames and seeks, but retains silent ambient fallback',()=>{
 const nebula=createVoidNebula78();let scene;
 nebula.render({setViewport(){},setScissorTest(){},render(value){scene=value;}},1000,700);
 const uniform=scene.children.find(o=>o.isMesh).material.uniforms.uStorm.value;
 const {duration}=VOID_MUSIC137,at=VOID_WEATHER_CUES137[0].at;
 for(const position of [at,VOID_WEATHER_CUES137[4].at,duration,duration+at]){
  nebula.frame(.5,true,{position,duration});
  const expected=voidMusicWeather137({position,duration});
  assert.deepEqual(uniform.toArray(),[expected.left,expected.right]);
 }
 nebula.frame(.05,false,{position:at,duration});
 assert.deepEqual(uniform.toArray(),[0,0]);
 nebula.frame(.05,true,null);
 const ambient=voidStormState79(.3);
 assert.ok(Math.abs(uniform.x-ambient.left)<1e-10);
 assert.ok(Math.abs(uniform.y-ambient.right)<1e-10);
 nebula.dispose();
});
