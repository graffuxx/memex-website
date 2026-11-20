import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as T from '../public/game/vendor/three.module.min.js';
import {CELLS} from '../public/game/src/rules.mjs';
import {tileCenter,projectHex} from '../public/game/src/arena-projection.mjs';
import {ILLUSTRATED_ARENAS,createIllustratedCamera67,fitIllustratedCamera67,insideArtworkFloor67} from '../public/game/src/illustrated-arenas67.mjs';
import {findArtworkSources67,ARENA_PARTICLE_LIMIT67} from '../public/game/src/illustrated-effects67.mjs';

test('all four calibrated arenas keep all 19 playable hexes in view on PC and tablet, including zoom limits',()=>{
 for(const id of Object.keys(ILLUSTRATED_ARENAS))for(const [width,height]of [[1034,500],[1100,650],[780,600],[720,650],[540,700]])for(const zoom of [.85,1,1.12]){
  const camera=createIllustratedCamera67(),layout=fitIllustratedCamera67(camera,width,height,id,zoom);
  assert.ok(layout.art.width>0&&layout.art.height>0);
  for(const c of CELLS)for(const p of projectHex(camera,c,width,height,1.025,.36))assert.ok(p.x>=3&&p.x<=width-3&&p.y>=3&&p.y<=height-3,`${id} ${width}x${height} zoom ${zoom} ${c.id}: ${p.x},${p.y}`);
  for(const c of CELLS){const world=tileCenter(c),p=new T.Vector3(world.x,.235,world.z).project(camera);const roundTrip=p.clone().unproject(camera);assert.ok(roundTrip.distanceTo(new T.Vector3(world.x,.235,world.z))<1e-7);}
 }
});
test('light/particle origins exclude the complete floor and rim for every arena, with a bounded particle budget',()=>{
 assert.ok(ARENA_PARTICLE_LIMIT67<=64);
 for(const arena of Object.values(ILLUSTRATED_ARENAS)){
  const width=192,height=128,pixels=new Uint8ClampedArray(width*height*4);for(let i=0;i<pixels.length;i+=4){pixels[i]=arena.id==='city'||arena.id==='cosmos'?20:255;pixels[i+1]=150;pixels[i+2]=arena.id==='city'||arena.id==='cosmos'?240:20;pixels[i+3]=255;}
  const origins=findArtworkSources67(arena,pixels,width,height);assert.ok(origins.length>0&&origins.length<=28);
  for(const p of origins)assert.equal(insideArtworkFloor67(arena,p.u,p.v,.11),false);
  assert.equal(insideArtworkFloor67(arena,.5,.48),true);
 }
});
test('all four background assets are present, bounded in total size and selected without changing game rules',async()=>{
 let bytes=0;for(const arena of Object.values(ILLUSTRATED_ARENAS)){const stat=await fs.stat(new URL('../public/game/assets/arenas/illustrated-v67/'+arena.id+'.webp',import.meta.url));assert.ok(stat.size>50000&&stat.size<600000);bytes+=stat.size;}
 assert.ok(bytes<1600000);
 const html=await fs.readFile(new URL('../public/game/table-demo.html',import.meta.url),'utf8');for(const id of Object.keys(ILLUSTRATED_ARENAS))assert.ok(html.includes(`value="${id}"`));
});
