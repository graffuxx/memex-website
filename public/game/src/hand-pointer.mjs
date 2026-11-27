// Keep capture on the stable overlay. Hand hit nodes are reordered as cards rise.
export function captureHandPointer(overlay,node,event){
 try{overlay.setPointerCapture(event.pointerId);}catch{return null;}
 return {uid:node.dataset.hand,node,id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
}

export function releaseHandPointer(overlay,drag){
 drag.node.classList.remove('dragging');
 if(overlay.hasPointerCapture(drag.id))overlay.releasePointerCapture(drag.id);
}

export function bindHandPointerEnd(overlay,finish){
 const win=overlay.ownerDocument.defaultView;
 // An interrupted capture can deliver the final event outside the arena.
 win.addEventListener('pointerup',finish,true);
 win.addEventListener('pointercancel',event=>finish(event,true),true);
 overlay.addEventListener('lostpointercapture',event=>finish(event,true));
}
