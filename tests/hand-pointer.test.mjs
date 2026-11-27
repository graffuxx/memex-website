import test from 'node:test';
import assert from 'node:assert/strict';
import {bindHandPointerEnd,captureHandPointer,releaseHandPointer} from '../public/game/src/hand-pointer.mjs';

test('reordering the hand hit node cannot remove capture from the stable overlay',()=>{
 let held=null;
 const classes=new Set(['dragging']);
 const overlay={
  setPointerCapture(id){held=id;},
  hasPointerCapture(id){return held===id;},
  releasePointerCapture(){held=null;}
 };
 const card={dataset:{hand:'portal-0-2'},classList:{remove:name=>classes.delete(name)}};
 const drag=captureHandPointer(overlay,card,{pointerId:3,clientX:40,clientY:60});
 card.parentElement={}; // The hit node can be reinserted while the rendered card rises.
 assert.equal(drag.uid,'portal-0-2');
 assert.equal(held,3);
 releaseHandPointer(overlay,drag);
 assert.equal(held,null);
 assert.equal(classes.has('dragging'),false);
});

test('pointer cancellation clears the drag style even if the browser already lost capture',()=>{
 const classes=new Set(['dragging']);
 const card={classList:{remove:name=>classes.delete(name)}};
 releaseHandPointer({hasPointerCapture:()=>false},{id:1,node:card});
 assert.equal(classes.has('dragging'),false);
});

test('a release outside the overlay and a lost capture both finish the press',()=>{
 const handlers=new Map(),overlay=new EventTarget(),finished=[];
 overlay.ownerDocument={defaultView:{
  addEventListener(type,handler,capture){assert.equal(capture,true);handlers.set(type,handler);}
 }};
 const finish=(event,cancelled=false)=>finished.push([event.type,cancelled]);
 bindHandPointerEnd(overlay,finish);
 handlers.get('pointerup')(new Event('pointerup'));
 handlers.get('pointercancel')(new Event('pointercancel'));
 overlay.dispatchEvent(new Event('lostpointercapture'));
 assert.deepEqual(finished,[['pointerup',false],['pointercancel',true],['lostpointercapture',true]]);
});
