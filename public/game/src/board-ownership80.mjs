import * as T from '../vendor/three.module.min.js';
import {CELLS} from './rules.mjs';
import {tileCenter} from './arena-projection.mjs';
import {cardShape,cardPoints} from './card-prototype.mjs';
import {OWNER_COLORS} from './card-rarities15.mjs';

function bezel(outer,inner){const shape=cardShape(outer),hole=new T.Path();cardPoints(inner).reverse().forEach(([x,y],i)=>i?hole.lineTo(x,y):hole.moveTo(x,y));hole.closePath();shape.holes.push(hole);return new T.ShapeGeometry(shape);}
// Physical, board-only ownership surrounds the card. It never colors portraits or collector frames.
export function createBoardOwnership80(scene){
 const root=new T.Group();root.name='Board controller underframes';scene.add(root);const cells=new Map();
 const geometries=[bezel(1.26,1.20),bezel(1.20,1.14),bezel(1.14,1.075),bezel(1.12,1.012),bezel(1.105,1.025)];
 const ink=new T.MeshBasicMaterial({color:'#03050b',depthWrite:false,side:T.DoubleSide,toneMapped:false});
 const materials=OWNER_COLORS.map(color=>[.045,.085,.18,1].map(opacity=>new T.MeshBasicMaterial({color,transparent:opacity<1,opacity,depthWrite:false,side:T.DoubleSide,toneMapped:false})));
 for(const c of CELLS){const p=tileCenter(c),group=new T.Group();group.name='Ownership '+c.id;group.position.set(p.x,.277,p.z);group.rotation.x=-Math.PI/2;group.visible=false;root.add(group);
  const meshes=geometries.map((g,i)=>{const m=new T.Mesh(g,i===3?ink:materials[0][i===4?3:i]);m.position.z=i<3?-.008:i===3?0:.002;m.renderOrder=i<3?-2:i===3?-1:0;group.add(m);return m;});cells.set(c.id,{group,meshes});
 }
 return {root,update(board={},radius=.84){for(const [id,{group,meshes}]of cells){const side=board[id]?.controller;group.visible=side===0||side===1;group.userData.controller=group.visible?side:null;group.scale.setScalar(radius);if(!group.visible)continue;for(const i of [0,1,2,4])meshes[i].material=materials[side][i===4?3:i];}},dispose(){root.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials.flat())m.dispose();ink.dispose();cells.clear();root.clear();}};
}
