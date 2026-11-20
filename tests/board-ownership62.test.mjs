import test from 'node:test';import assert from 'node:assert/strict';
import {createCardFinishLayer} from '../public/game/src/card-finish-layer16.mjs';
// No WebGL is needed to verify the real Three.js ownership meshes. Canvas pixels are irrelevant here.
test('green/red ownership meshes hide off-board while rarity materials and particles remain independent',()=>{
 const oldDocument=globalThis.document;
 const gradient={addColorStop(){}};const ctx={fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},createLinearGradient(){return gradient;}};
 globalThis.document={createElement(tag){assert.equal(tag,'canvas');return {width:0,height:0,getContext(){return ctx;}};}};
 let finish;try{
  finish=createCardFinishLayer('legendary',null,'owner-test');const outline=finish.root.getObjectByName('Board ownership outline');assert.ok(outline);assert.equal(outline.visible,false);assert.equal(outline.children.length,2);assert.equal(finish.rarity.key,'legendary');
  finish.setOwner(0);assert.equal(outline.visible,true);assert.equal(outline.children[0].material.color.getHexString(),'55ed94');
  finish.setOwner(1);assert.equal(outline.visible,true);assert.equal(outline.children[0].material.color.getHexString(),'ff5d72');assert.equal(finish.rarity.key,'legendary');
  finish.setOwner(null);assert.equal(outline.visible,false);finish.setRarity('mythic');finish.frame(.2,true);assert.equal(outline.visible,false);assert.equal(finish.rarity.key,'mythic');
 }finally{finish?.dispose();if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;}
});
