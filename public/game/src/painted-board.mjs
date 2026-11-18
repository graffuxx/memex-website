import * as T from '../vendor/three.module.min.js';
import {CELLS} from './rules.mjs';
import {tileCenter} from './arena-projection.mjs';

export function boardPerimeter(){
 const edges=new Map(),key=p=>p.map(v=>Math.round(v*1e6)).join(',');
 for(const cell of CELLS){const c=tileCenter(cell),points=Array.from({length:6},(_,i)=>{const a=(i*60-30)*Math.PI/180;return [c.x+Math.cos(a),c.z+Math.sin(a)];});
  for(let i=0;i<6;i++){const a=points[i],b=points[(i+1)%6],ka=key(a),kb=key(b),id=[ka,kb].sort().join('|');if(edges.has(id))edges.delete(id);else edges.set(id,{a,b,ka,kb});}
 }
 const boundary=[...edges.values()],links=new Map(),coords=new Map();for(const e of boundary){coords.set(e.ka,e.a);coords.set(e.kb,e.b);for(const [a,b]of [[e.ka,e.kb],[e.kb,e.ka]]){if(!links.has(a))links.set(a,[]);links.get(a).push(b);}}
 const start=boundary[0].ka,outline=[];let current=start,previous=null;do{outline.push(coords.get(current));const next=links.get(current).find(k=>k!==previous);previous=current;current=next;if(outline.length>boundary.length)throw Error('Invalid arena perimeter');}while(current!==start);return outline;
}

export function createPaintedBoardRecess(scene){
 const points=boardPerimeter(),shape=new T.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
 const baseGeometry=new T.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,steps:1});baseGeometry.rotateX(-Math.PI/2);
 const baseMaterial=new T.MeshStandardMaterial({color:'#393346',roughness:.86,metalness:.1});const base=new T.Mesh(baseGeometry,baseMaterial);base.position.y=.135;base.receiveShadow=true;
 const root=new T.Group();root.name='Plinth socket / aligned to painted bezel';root.add(base);root.visible=false;scene.add(root);
 return {setVisible:value=>{root.visible=value;},dispose(){scene.remove(root);baseGeometry.dispose();baseMaterial.dispose();}};
}
