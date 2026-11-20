import * as T from '../vendor/three.module.min.js';
import {cardShape,cardPoints} from './card-prototype.mjs';

// A neutral, face-down card occupies the same footprint as the playable cards.
export async function createSealedBlockade(renderer){
 const texture=await new T.TextureLoader().loadAsync(new URL('../assets/cards/frame-v21/memex-back.webp',import.meta.url).href);
 texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const root=new T.Group();root.name='Sealed blockade card';root.rotation.x=-Math.PI/2;root.scale.setScalar(.92);
 const bodyGeometry=new T.ExtrudeGeometry(cardShape(),{depth:.055,bevelEnabled:true,bevelSize:.012,bevelThickness:.008,bevelSegments:3,steps:1});
 bodyGeometry.translate(0,0,-.0275);
 const bodyMaterial=new T.MeshStandardMaterial({color:'#090b12',metalness:.65,roughness:.42});
 const body=new T.Mesh(bodyGeometry,bodyMaterial);body.castShadow=true;root.add(body);
 const faceGeometry=new T.PlaneGeometry(2.048,2.048),faceMaterial=new T.MeshBasicMaterial({map:texture,color:'#66606e',transparent:true,alphaTest:.025,toneMapped:false});
 const face=new T.Mesh(faceGeometry,faceMaterial);face.position.z=.037;root.add(face);

 const rimShape=cardShape(1.012),hole=new T.Path();
 cardPoints(.995).reverse().forEach(([x,y],i)=>i?hole.lineTo(x,y):hole.moveTo(x,y));hole.closePath();rimShape.holes.push(hole);
 const rimGeometry=new T.ShapeGeometry(rimShape),rimMaterial=new T.MeshBasicMaterial({color:'#a38ac8',transparent:true,opacity:.48,depthWrite:false,toneMapped:false});
 const rim=new T.Mesh(rimGeometry,rimMaterial);rim.position.z=.041;root.add(rim);

 // A small lock distinguishes this obstacle from either player's hidden cards.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#0b0b14';ctx.strokeStyle='#c8b6df';ctx.lineWidth=9;ctx.lineJoin='round';
 ctx.beginPath();ctx.arc(128,108,42,Math.PI,0);ctx.lineTo(170,142);ctx.lineTo(86,142);ctx.closePath();ctx.stroke();
 ctx.fillRect(67,117,122,96);ctx.strokeRect(67,117,122,96);ctx.fillStyle='#c8b6df';ctx.beginPath();ctx.arc(128,160,11,0,Math.PI*2);ctx.fill();ctx.fillRect(122,160,12,26);
 const sealTexture=new T.CanvasTexture(canvas);sealTexture.colorSpace=T.SRGBColorSpace;
 const sealGeometry=new T.PlaneGeometry(.36,.36),sealMaterial=new T.MeshBasicMaterial({map:sealTexture,transparent:true,depthWrite:false,toneMapped:false});
 const seal=new T.Mesh(sealGeometry,sealMaterial);seal.position.set(0,-.59,.044);root.add(seal);
 let elapsed=0;
 return {root,frame(dt,motion){if(motion)elapsed+=dt;rimMaterial.opacity=motion?.48+Math.sin(elapsed*1.5)*.07:.48;},dispose(){root.removeFromParent();for(const geometry of [bodyGeometry,faceGeometry,rimGeometry,sealGeometry])geometry.dispose();for(const material of [bodyMaterial,faceMaterial,rimMaterial,sealMaterial])material.dispose();texture.dispose();sealTexture.dispose();root.clear();}};
}
