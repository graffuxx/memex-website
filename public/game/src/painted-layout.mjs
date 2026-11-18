import * as T from '../vendor/three.module.min.js';
import {CELLS} from './rules.mjs';
import {projectHex} from './arena-projection.mjs';
export const PAINTED_DEFAULT_ZOOM=1;
export const PAINTED_MIN_ZOOM=.85;
export const PAINTED_MAX_ZOOM=1.12;
export const PAINTED_CAMERA_ANGLE=68;
// At the fixed angle the floor and the square illustration have the same native proportions.
export const PAINTED_FLOOR={centerX:.5,centerY:.48,width:.72,height:.6154336446296348};
export function paintedLayout(camera,width,height){
 const points=CELLS.flatMap(c=>projectHex(camera,c,width,height,.96,.235)),x0=Math.min(...points.map(p=>p.x)),x1=Math.max(...points.map(p=>p.x)),y0=Math.min(...points.map(p=>p.y)),y1=Math.max(...points.map(p=>p.y)),w=(x1-x0)/PAINTED_FLOOR.width,h=(y1-y0)/PAINTED_FLOOR.height;
 return {left:(x0+x1)/2-w*PAINTED_FLOOR.centerX,top:(y0+y1)/2-h*PAINTED_FLOOR.centerY,width:w,height:h};
}
export function createPaintedCamera(){return new T.OrthographicCamera(-1,1,1,-1,.1,100);}
export function paintedBoardBounds(camera,width,height){
 const points=CELLS.flatMap(c=>projectHex(camera,c,width,height,.99,.36));
 return {left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))};
}
export function fitPaintedCamera(camera,width,height){applyPaintedZoom(camera,width,height);return camera;}
export function applyPaintedZoom(camera,width,height,requested=PAINTED_DEFAULT_ZOOM){
 const value=T.MathUtils.clamp(Number.isFinite(requested)?requested:PAINTED_DEFAULT_ZOOM,PAINTED_MIN_ZOOM,PAINTED_MAX_ZOOM);
 camera.clearViewOffset();camera.zoom=1;
 const angle=T.MathUtils.degToRad(PAINTED_CAMERA_ANGLE),focus=new T.Vector3(0,.235,0);
 camera.up.set(0,1,0);camera.position.copy(focus).add(new T.Vector3(0,Math.sin(angle)*30,Math.cos(angle)*30));camera.lookAt(focus);camera.updateMatrixWorld();
 camera.left=-10*width/height;camera.right=-camera.left;camera.top=10;camera.bottom=-10;camera.updateProjectionMatrix();
 const b=paintedBoardBounds(camera,width,height),padding=24;
 const fit=Math.min((width-padding*2)/(b.right-b.left),(height-padding*2)/(b.bottom-b.top));
 camera.zoom=fit*.86*value;camera.updateProjectionMatrix();
 const fitted=paintedBoardBounds(camera,width,height),x=width/2-(fitted.left+fitted.right)/2;
 const y=Math.max(padding-fitted.top,Math.min(-height*.018,height-padding-fitted.bottom));
 camera.setViewOffset(width,height,-x,-y,width,height);camera.updateProjectionMatrix();
 return {value,min:PAINTED_MIN_ZOOM,max:PAINTED_MAX_ZOOM,pan:{x:0,y:0},canPan:false,angle:PAINTED_CAMERA_ANGLE};
}
