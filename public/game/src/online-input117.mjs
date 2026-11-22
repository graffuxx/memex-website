// Looking around and inspecting your own hand never grants permission to play.
export function onlineInput117({game,phase,working=false,animating=false,leaving=false}={}){
 const inspect=Boolean(game)&&phase==='play'&&!working&&!animating&&!leaving;
 return {inspect,camera:inspect,play:inspect&&game.turn===0&&!game.finished};
}
export function pointInPolygon117(x,y,points){
 if(!Number.isFinite(x)||!Number.isFinite(y)||!Array.isArray(points)||points.length<3)return false;
 let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
  const a=points[i],b=points[j],cross=(x-a.x)*(b.y-a.y)-(y-a.y)*(b.x-a.x);
  if(Math.abs(cross)<1e-6&&x>=Math.min(a.x,b.x)-1e-6&&x<=Math.max(a.x,b.x)+1e-6&&y>=Math.min(a.y,b.y)-1e-6&&y<=Math.max(a.y,b.y)+1e-6)return true;
  if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;
 }return inside;
}
// Use projected board geometry, independently of the dragged card, SVG masks,
// pointer capture, scaling, browser zoom and the current camera orientation.
export function boardCellAt117(svg,clientX,clientY){
 const matrix=svg.getScreenCTM();if(!matrix)return null;
 const point=svg.createSVGPoint();point.x=clientX;point.y=clientY;
 let local;try{local=point.matrixTransform(matrix.inverse());}catch{return null;}
 for(const node of svg.querySelectorAll('[data-cell]')){
  const polygon=node.querySelector('.field-hit');if(!polygon)continue;
  const points=Array.from({length:polygon.points.numberOfItems},(_,i)=>polygon.points.getItem(i));
  if(pointInPolygon117(local.x,local.y,points))return node.getAttribute('data-cell');
 }return null;
}
