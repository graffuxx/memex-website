import test from 'node:test';
import assert from 'node:assert/strict';
import {PARTICLE_COUNTS,VORTEX,particleState,effectCoverage,particleSamples} from '../public/game/src/card-particles23.mjs';
test('material particles keep values, name and sockets clear with a bounded particle budget',()=>{
 assert.equal(PARTICLE_COUNTS.common,undefined);assert.equal(PARTICLE_COUNTS.rare,undefined);
 for(const [key,count] of Object.entries(PARTICLE_COUNTS)){
  for(let time=0;time<30;time+=.17)assert.ok(Array.from({length:count},(_,i)=>particleState(key,i,time)).some(p=>p.opacity>.08),`${key} has a visible particle at ${time}`);
  assert.ok(count<=18);
  for(let i=0;i<count;i++)for(let time=0;time<30;time+=.13){const p=particleState(key,i,time);assert.ok(Object.values(p).every(Number.isFinite));assert.ok(p.size>0&&p.size<.08);assert.ok(p.opacity>=0&&p.opacity<=.9);if(p.opacity>0)assert.equal(effectCoverage(p.x,p.y),1);}
 }
});
test('Void particles move inward and browser motion samples avoid angular jumps',()=>{
 let previous=Infinity;
 for(const time of [.1,1,2,3,4,5]){const p=particleState('mythic',0,time),radius=Math.hypot(p.x-VORTEX.x,(p.y-VORTEX.y)/.42);assert.ok(radius<previous);previous=radius;}
 for(let i=0;i<18;i++){const samples=particleSamples('mythic',i,1.3);for(let k=1;k<samples.length;k++)assert.ok(Math.abs(samples[k].angle-samples[k-1].angle)<=Math.PI+.00001);}
});

// Shader-only Z displacement is not enough: Three sorts transparent meshes by object depth.
import {createCardParticles} from '../public/game/src/card-particle-layer23.mjs';
test('particles sort in front of the painted card face instead of being covered by it',()=>{
 const effects=createCardParticles('legendary','depth-test');effects.frame(1,true);
 const particles=effects.root.getObjectByName('Visible material particles');
 assert.ok(particles);assert.ok(particles.position.z>.07);assert.equal(particles.visible,true);
 effects.dispose();
});
