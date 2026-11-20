import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../public/game/vendor/three.module.min.js';
import {createBoardOwnership80} from '../public/game/src/board-ownership80.mjs';
import {createTableDemo} from '../public/game/src/table-demo-state.mjs';
import {syncTableCards} from '../public/game/src/table-card-pool25.mjs';

test('physical ownership underframes follow the current controller, ignore empty cells, survive captures and clear on a new board',()=>{
 const scene=new T.Scene(),field=createBoardOwnership80(scene),game=createTableDemo();field.update(game.board,.84);
 assert.equal(field.root.children.filter(g=>g.visible).length,Object.keys(game.board).length);
 for(const [cell,card]of Object.entries(game.board)){const g=field.root.getObjectByName('Ownership '+cell);assert.equal(g.visible,true);assert.equal(g.userData.controller,card.controller);assert.equal(g.children[4].material.color.getHexString(),card.controller===0?'55ed94':'ff5d72');assert.equal(g.children[3].material.color.getHexString(),'03050b');assert.equal(g.scale.x,.84);assert.ok(g.position.y<.30);for(const m of g.children)assert.ok([...m.geometry.attributes.position.array].every(Number.isFinite));}
 const cell=Object.keys(game.board)[0],card=game.board[cell],before=card.controller;card.controller=1-before;field.update(game.board,.84);const g=field.root.getObjectByName('Ownership '+cell);assert.equal(g.userData.controller,1-before);assert.equal(g.children[4].material.color.getHexString(),before===0?'ff5d72':'55ed94');
 field.update(game.board,.92);assert.equal(g.scale.x,.92);field.update({});assert.ok(field.root.children.every(g=>!g.visible));field.update({'0,0':{controller:null},'1,0':{origin:0}});assert.ok(field.root.children.every(g=>!g.visible));field.dispose();assert.equal(scene.children.length,0);
});
test('ownership remains independent of rarity and never leaks to hand/deck cards when models are reused',()=>{
 const cards=new Map(),spawn=(uid,profile,owner,rotation,rarity)=>({uid,profile,owner,rarity,setRarity(r){this.rarity=r;},setRotation(){},setOwner(o){this.owner=o;},dispose(){}}),states=[{uid:'face',id:'doge',controller:0,rarity:'mythic'},{uid:'hand',id:'pepe',origin:0,rarity:'legendary'}];
 const sync=boardUids=>syncTableCards(cards,states,{spawn,profileFor:c=>c.id,rarityFor:c=>c.rarity,boardUids});sync(new Set(['face']));assert.equal(cards.get('face').owner,0);assert.equal(cards.get('hand').owner,null);assert.equal(cards.get('face').rarity,'mythic');states[0].controller=1;sync(new Set(['face']));assert.equal(cards.get('face').owner,1);assert.equal(cards.get('face').rarity,'mythic');sync(new Set());assert.equal(cards.get('face').owner,null);assert.equal(cards.get('hand').owner,null);
});
