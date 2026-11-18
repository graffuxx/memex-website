// Orthographic UI depth. Whole cards need space for body, bevel, tilted face and foil.
// Frontmost selection changes immediately; only the on-screen pose is eased.
export const HUD_DEPTH=Object.freeze({hover:300,selected:340,preview:440,flight:600,drag:780});
export function handCardDepth(side,index,selected=false,hover=false){
 if(side===1)return 70+index*8;
 return selected?HUD_DEPTH.selected:hover?HUD_DEPTH.hover:100+index*20;
}
export function handHitOrder(uids,hover=null,selected=null){
 const foreground=[...new Set([hover,selected])].filter(uid=>uids.includes(uid));
 return [...uids.filter(uid=>!foreground.includes(uid)),...foreground];
}
