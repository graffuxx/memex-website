import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../public/game/vendor/three.module.min.js';
import {EMBER_COUNT,sampleArenaEmber,createHomeArenaLights} from '../public/game/src/home-arena-lights25.mjs';

test('embers stay finite, bounded and outside the quiet playable floor',()=>{
 assert.ok(EMBER_COUNT<=48);
 for(let index=0;index<EMBER_COUNT;index++)for(let time=0;time<40;time+=.19){
  const p=sampleArenaEmber(index,time);
  assert.ok(Object.values(p).every(Number.isFinite));
  assert.ok(p.opacity>=0&&p.opacity<=.8);assert.ok(p.size>0&&p.size<.006);
  assert.ok(p.u<.12||p.u>.90||p.v<.17||p.v>.80,'No fire particle crosses a playable tile');
 }
});
test('crystal reflections and fissure sparks animate independently of the painting and honor motion off',()=>{
 const texture=new T.Texture(),effect=createHomeArenaLights({glow:texture,mote:texture});
 effect.frame(.03,true);assert.equal(effect.root.visible,true);
 const reflection=effect.root.getObjectByName('Moving facet reflection');
 assert.ok(reflection);const before=reflection.material.uniforms.uTime.value;
 effect.frame(.03,true);assert.ok(reflection.material.uniforms.uTime.value>before);
 assert.equal(reflection.material.depthTest,false);assert.ok(reflection.renderOrder>0);
 effect.frame(.03,false);assert.equal(effect.root.visible,false);
 assert.equal(reflection.material.uniforms.uTime.value,before+.03);
 effect.dispose();texture.dispose();
});
