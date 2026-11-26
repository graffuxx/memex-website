import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import * as T from '../public/game/vendor/three.module.min.js';
import {createRockIsland} from '../public/game/src/voidforge-platform77.mjs';
import {fitVoidforgeCamera77} from '../public/game/src/voidforge-arena77.mjs';
import {CELLS} from '../public/game/src/rules.mjs';
import {tileCenter} from '../public/game/src/arena-projection.mjs';
import {cardPoints} from '../public/game/src/card-prototype.mjs';

test('approved fractured platform has continuous center, real chips and finite textured geometry',()=>{
 const material=new T.MeshStandardMaterial(),island=createRockIsland({topMaterial:material,cliffMaterial:material});
 assert.equal(island.plateCount,9);assert.equal(island.chipCount,24);assert.equal(island.majorBreakCount,13);
 const center=island.root.getObjectByName('Joined stone surface beneath the playable hexes');assert.ok(center);
 let vertices=0;island.root.traverse(o=>{if(!o.geometry)return;assert.notEqual(o.geometry.type,'CylinderGeometry');for(const name of ['position','normal','uv']){const a=o.geometry.getAttribute(name);assert.ok(a,name);assert.ok([...a.array].every(Number.isFinite),name);}vertices+=o.geometry.getAttribute('position').count;});
 assert.ok(vertices>20000&&vertices<40000);assert.ok(center.geometry.index.count>30);
 for(const [x,z] of [[-4.25,-2.7],[4.1,-2.9],[4.7,2.6]])assert.ok(Number.isFinite(island.heightAt(x,z)));
 island.root.traverse(o=>o.geometry?.dispose());island.heatMaterial.dispose();material.dispose();
});
test('all 19 hexes remain inside real perspective view at PC and tablet sizes and zoom endpoints',()=>{
 for(const [w,h] of [[1000,480],[1280,650],[760,700],[1050,500]])for(const zoom of [.85,1,1.12]){
  const camera=new T.PerspectiveCamera(35,1,.1,100),state=fitVoidforgeCamera77(camera,w,h,zoom);assert.equal(state.value,zoom);
  for(const c of CELLS){const p=tileCenter(c);for(const [x,z]of cardPoints(.93)){const v=new T.Vector3(p.x+x,.30,p.z+z).project(camera);assert.ok(Math.abs(v.x)<.99&&Math.abs(v.y)<.99,`${w}x${h} zoom ${zoom} cell ${c.id}`);assert.ok(v.z>-1&&v.z<1);}}
 }
});
test('production default and bounded local textures use approved arena instead of the raster floor',async()=>{
 const entry=await readFile(new URL('../public/game/table-demo.html',import.meta.url),'utf8');assert.doesNotMatch(entry,/<select[^>]+id="arenaTheme"/);
 const setup=await readFile(new URL('../public/game/src/table-demo-opening18.mjs',import.meta.url),'utf8');
 const arena=await readFile(new URL('../public/game/platform/arena-availability112.mjs',import.meta.url),'utf8');
 assert.match(setup,/view.setArena\(PLAYABLE_ARENA112\)/);
 assert.match(arena,/PLAYABLE_ARENA112='voidforge'/);assert.match(entry,/src\/table-demo-opening18\.mjs\?v=/);
 let size=0;for(const name of ['sky','slab-painted','cliff-painted','crystal-painted','fracture-face'])size+=(await stat(new URL(`../public/game/assets/arenas/voidforge-v77/${name}.webp`,import.meta.url))).size;
 assert.ok(size<4*1024*1024,`${size} bytes`);
});
