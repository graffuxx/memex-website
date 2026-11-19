import test from 'node:test';
import assert from 'node:assert/strict';
import {VOID_MIST_COUNT,VOID_MIST_PERIOD,voidMistState,voidMistSamples,voidBorderCoverage} from '../public/game/src/card-void40.mjs';
import {PARTICLE_COUNTS,particleState,effectCoverage,particleSamples} from '../public/game/src/card-particles23.mjs';
test('material particles keep values, name and sockets clear with a bounded particle budget',()=>{
 assert.equal(PARTICLE_COUNTS.common,undefined);assert.equal(PARTICLE_COUNTS.rare,undefined);
 for(const [key,count] of Object.entries(PARTICLE_COUNTS)){
  for(let time=0;time<30;time+=.17)assert.ok(Array.from({length:count},(_,i)=>particleState(key,i,time)).some(p=>p.opacity>.08),`${key} has a visible particle at ${time}`);
  assert.ok(count<=18);
  for(let i=0;i<count;i++)for(let time=0;time<30;time+=.13){const p=particleState(key,i,time);assert.ok(Object.values(p).every(Number.isFinite));assert.ok(p.size>0&&p.size<.08);assert.ok(p.opacity>=0&&p.opacity<=.9);if(p.opacity>0)assert.equal(effectCoverage(p.x,p.y),1);}
 }
});
test('Void mist circulates around all six frame edges in seamless, bounded loops',()=>{
 assert.equal(VOID_MIST_COUNT,12);
 const sectors=new Set();
 for(let i=0;i<VOID_MIST_COUNT;i++){
  for(let t=0;t<VOID_MIST_PERIOD;t+=.07){const p=voidMistState(i,t);assert.ok(Object.values(p).every(Number.isFinite));assert.ok(p.size>=.05&&p.size<=.085);assert.ok(p.opacity>=.47&&p.opacity<=.81);assert.ok(Math.hypot(p.x,p.y)>.80&&Math.hypot(p.x,p.y)<1.01);sectors.add(Math.floor((Math.atan2(p.y,p.x)+Math.PI)/(Math.PI/3)));}
  const first=voidMistState(i,1.3),last=voidMistState(i,1.3+VOID_MIST_PERIOD);for(const key of ['x','y','size','opacity'])assert.ok(Math.abs(first[key]-last[key])<1e-10);
  const samples=voidMistSamples(i,1.3);for(let k=1;k<samples.length;k++)assert.ok(Math.abs(samples[k].angle-samples[k-1].angle)<=Math.PI+.00001);
 }
 assert.equal(sectors.size,6);
 for(let i=0;i<18;i++){const samples=particleSamples('mythic',i,1.3);for(let k=1;k<samples.length;k++)assert.ok(Math.abs(samples[k].angle-samples[k-1].angle)<=Math.PI+.00001);}
 assert.equal(voidBorderCoverage(0,0),0);assert.equal(voidBorderCoverage(0,-.33),0);assert.equal(voidBorderCoverage(0,.84),0);assert.equal(voidBorderCoverage(0,-.84),0);assert.equal(voidBorderCoverage(0,1.2),0);assert.equal(voidBorderCoverage(.80,.25),1);
});

// Shader-only Z displacement is not enough: Three sorts transparent meshes by object depth.
import {createCardParticles} from '../public/game/src/card-particle-layer23.mjs';
test('particles sort in front of the painted card face instead of being covered by it',()=>{
 const effects=createCardParticles('legendary','depth-test');effects.frame(1,true);
 const particles=effects.root.getObjectByName('Visible material particles');
 assert.ok(particles);assert.ok(particles.position.z>.07);assert.equal(particles.visible,true);
 effects.dispose();
});

test('Void uses a full frame fog pass, honors motion off and stays exclusive to the front finish',()=>{
 const effects=createCardParticles('mythic','fog-test'),fog=effects.root.getObjectByName('Void frame fog');assert.ok(fog);assert.ok(fog.position.z>.07);assert.equal(fog.visible,false);
 effects.frame(2,true);assert.equal(fog.visible,true);const before=fog.material.uniforms.uTime.value;effects.frame(3,true);assert.notEqual(fog.material.uniforms.uTime.value,before);
 effects.frame(4,false);assert.equal(fog.visible,false);effects.setRarity('legendary');effects.frame(5,true);assert.equal(fog.visible,false);effects.dispose();assert.equal(effects.root.children.length,0);
});
