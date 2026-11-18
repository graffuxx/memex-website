// Registration of the approved frame artwork in card-local coordinates.
// Direction order is the rules order: E, SE, SW, W, NW, NE.
export const FRAME_LAYOUT=Object.freeze({
 width:1254/540,height:1254/610,
 values:Object.freeze([[.719,0],[.522,-.574],[-.522,-.574],[-.719,0],[-.522,.525],[.522,.525]].map(Object.freeze)),
 abilityY:.75,elementY:-.655,titleY:-.341,titleWidth:1.08,titleHeight:.145,
});
export function valuePosition(direction){return FRAME_LAYOUT.values[((direction%6)+6)%6];}
