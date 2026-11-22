import test from 'node:test';import assert from 'node:assert/strict';
import {onlineInput117,pointInPolygon117,boardCellAt117} from '../public/game/src/online-input117.mjs';

test('both players can inspect their hand and orbit; only the active player may place a card',()=>{
 for(const turn of[0,1]){const state={game:{turn,finished:false},phase:'play'};assert.deepEqual(onlineInput117(state),{inspect:true,camera:true,play:turn===0});for(const lock of['working','animating','leaving'])assert.deepEqual(onlineInput117({...state,[lock]:true}),{inspect:false,camera:false,play:false});}
 for(const phase of['waiting','rps','initiative','preparing','between','ended'])assert.deepEqual(onlineInput117({game:{turn:0},phase}),{inspect:false,camera:false,play:false});
 assert.equal(onlineInput117({game:{turn:0,finished:true},phase:'play'}).play,false);assert.deepEqual(onlineInput117(),{inspect:false,camera:false,play:false});
});
test('drop targets follow the projected hex geometry at different zooms and positions, independent of HUD occlusion',()=>{
 const hex=[{x:0,y:-10},{x:10,y:-5},{x:10,y:5},{x:0,y:10},{x:-10,y:5},{x:-10,y:-5}];
 assert.equal(pointInPolygon117(0,0,hex),true);assert.equal(pointInPolygon117(10,0,hex),true);assert.equal(pointInPolygon117(11,0,hex),false);assert.equal(pointInPolygon117(0,0,[...hex].reverse()),true);
 for(const scale of[.6,1,1.8])for(const offset of[0,200]){
  const node={querySelector:()=>({points:{numberOfItems:6,getItem:i=>hex[i]}}),getAttribute:()=>'1,-1'};
  const svg={getScreenCTM:()=>({inverse:()=>({scale,offset})}),createSVGPoint(){return{x:0,y:0,matrixTransform(m){return{x:(this.x-m.offset)/m.scale,y:(this.y-m.offset)/m.scale};}};},querySelectorAll:()=>[node]};
  assert.equal(boardCellAt117(svg,offset,offset),'1,-1');assert.equal(boardCellAt117(svg,offset+30*scale,offset),null);
 }
 assert.equal(boardCellAt117({getScreenCTM:()=>null},10,10),null);
});
