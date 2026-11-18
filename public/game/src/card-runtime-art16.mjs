import {CARD_ART,artworkFor,ownerMarker} from './card-art16.mjs';
import {createCardFinishLayer} from './card-finish-layer16.mjs?v=art-owner-16';
import * as T from '../vendor/three.module.min.js';
import {createCardPrototype,CARD_PROFILES,cardShape,CARD_SPEC} from './card-prototype16.mjs?v=art-owner-16';

// Render the approved sculpted face once, then reuse it on thin 3D bodies.
// This retains the exact artwork/layout while keeping a full table inexpensive to draw.
export async function createCardRuntime(renderer){
 const templates=await Promise.all(Object.keys(CARD_PROFILES).map(profile=>createCardPrototype({profile}))),scene=new T.Scene();
 scene.add(new T.HemisphereLight('#e6e1ff','#241d31',2.6));const key=new T.DirectionalLight('#fff0cd',3.5);key.position.set(-3,4,5);scene.add(key);const rim=new T.DirectionalLight('#a58aff',2.6);rim.position.set(3,1,-2);scene.add(rim);
 for(const m of templates)scene.add(m.group);
 const artworkTextures=new Map(templates.map(m=>[artworkFor(m.profile.id),m.artworkTexture]));
 await Promise.all(Object.entries(CARD_ART).flatMap(([profile,tiers])=>Object.keys(tiers).filter(t=>t!=='common').map(async tier=>{
  const path=artworkFor(profile,tier),texture=await new T.TextureLoader().loadAsync(new URL(path,import.meta.url).href);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;artworkTextures.set(path,texture);
 })));
 const camera=new T.OrthographicCamera(-1.024,1.024,1.024,-1.024,.1,10),faces=new Map(),instances=new Set();
 function bake(profile,rotation=0,back=false,rarity='common'){
  const cacheKey=back?'back':profile+'/'+rarity+'/'+rotation;if(faces.has(cacheKey))return faces.get(cacheKey).texture;
  const model=templates.find(m=>m.profile.id===profile);for(const m of templates)m.group.visible=m===model;model.setRotation(rotation);model.setArtwork(artworkTextures.get(artworkFor(profile,rarity)));
  camera.position.set(0,0,back?-6:6);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  const previous=renderer.getRenderTarget(),viewport=renderer.getViewport(new T.Vector4()),scissor=renderer.getScissor(new T.Vector4()),scissorTest=renderer.getScissorTest(),oldClear=renderer.getClearColor(new T.Color()),oldAlpha=renderer.getClearAlpha(),oldExposure=renderer.toneMappingExposure;
  const target=new T.WebGLRenderTarget(768,768,{depthBuffer:true,samples:2});target.texture.colorSpace=T.SRGBColorSpace;target.texture.generateMipmaps=true;target.texture.minFilter=T.LinearMipmapLinearFilter;target.texture.anisotropy=4;
  // Render targets already select their physical-pixel viewport; setViewport would apply devicePixelRatio a second time.
  renderer.setRenderTarget(target);renderer.setScissorTest(false);renderer.setClearColor(0,0);renderer.toneMappingExposure=1.05;renderer.clear();renderer.render(scene,camera);
  renderer.setRenderTarget(previous);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);renderer.setClearColor(oldClear,oldAlpha);renderer.toneMappingExposure=oldExposure;
  faces.set(cacheKey,target);return target.texture;
 }
 function faceGeometry(){const g=new T.ShapeGeometry(cardShape(.995)),p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/2.048+.5,p.getY(i)/2.048+.5);return g;}
 const ownerTitleGeometry=new T.PlaneGeometry(1.04,.175),ownerTitleTextures=new Map();
 function ownerTitleTexture(profile,side){
  const key=profile+'/'+side;if(ownerTitleTextures.has(key))return ownerTitleTextures.get(key);
  const marker=ownerMarker(side),c=document.createElement('canvas');c.width=640;c.height=108;const ctx=c.getContext('2d');
  ctx.fillStyle=side===0?'#103b2d':'#481b2b';ctx.fillRect(0,0,640,108);ctx.strokeStyle=marker.color;ctx.lineWidth=9;ctx.strokeRect(4,4,632,100);
  ctx.fillStyle=marker.color;ctx.beginPath();if(side===0)ctx.arc(42,54,12,0,Math.PI*2);else{ctx.moveTo(42,38);ctx.lineTo(58,54);ctx.lineTo(42,70);ctx.lineTo(26,54);ctx.closePath();}ctx.fill();
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 65px Arial,sans-serif';ctx.fillStyle='#fff7e7';ctx.fillText(CARD_PROFILES[profile].name.toUpperCase(),344,57,525);
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;ownerTitleTextures.set(key,texture);return texture;
 }
 const face=faceGeometry(),body=new T.ExtrudeGeometry(cardShape(),{depth:CARD_SPEC.bodyDepth,bevelEnabled:true,bevelSegments:3,bevelSize:.012,bevelThickness:.009,steps:1});body.translate(0,0,-CARD_SPEC.bodyDepth/2);
 const metal=new T.MeshStandardMaterial({color:'#aa8754',metalness:.72,roughness:.35});
 const boostGeometry=new T.PlaneGeometry(.027,.22),boostMaterial=new T.MeshBasicMaterial({color:'#ffdb71',toneMapped:false}),badgeGeometry=new T.PlaneGeometry(.215,.215),badgeTextures=new Map();
 function abilityTexture(key){if(badgeTextures.has(key))return badgeTextures.get(key);const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#131d29';ctx.beginPath();ctx.arc(64,64,60,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f4ce81';ctx.lineWidth=8;ctx.stroke();ctx.font='bold 90px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#ffe8a7';ctx.fillText({hype:'H',guard:'S',twist:'↻'}[key]??'',64,69);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;badgeTextures.set(key,t);return t;}
 const backMaterial=new T.MeshBasicMaterial({map:bake('pepe',0,true),toneMapped:false});
 function spawn(uid,profile,owner,rotation=0,rarity='common'){
  const group=new T.Group();group.name=uid;
  const side=new T.Mesh(body,metal);side.castShadow=true;group.add(side);
  const frontMaterial=new T.MeshBasicMaterial({map:bake(profile,rotation,false,rarity),toneMapped:false}),front=new T.Mesh(face,frontMaterial);front.position.z=.035;group.add(front);
  const back=new T.Mesh(face,backMaterial);back.rotation.y=Math.PI;back.position.z=-.035;group.add(back);
  const finish=createCardFinishLayer(rarity,owner);group.add(finish.root);
  const ownerTitleMaterial=new T.MeshBasicMaterial({map:ownerTitleTexture(profile,owner),toneMapped:false}),ownerTitle=new T.Mesh(ownerTitleGeometry,ownerTitleMaterial);ownerTitle.position.set(0,-.33,.048);group.add(ownerTitle);
  const badgeMaterial=new T.MeshBasicMaterial({transparent:true,depthWrite:false,toneMapped:false}),badge=new T.Mesh(badgeGeometry,badgeMaterial);badge.position.set(0,CARD_SPEC.socketY,.043);badge.visible=false;group.add(badge);const boost=new T.Mesh(boostGeometry,boostMaterial);boost.visible=false;group.add(boost);
  let currentRotation=rotation;const card={uid,profile,group,finish,setRarity(key){if(key===finish.rarity)return;finish.setRarity(key);frontMaterial.map=bake(profile,currentRotation,false,finish.rarity);},setBoost(direction){boost.visible=Number.isInteger(direction);if(boost.visible){const a=-direction*Math.PI/3;boost.position.set(Math.cos(a)*.827,Math.sin(a)*.827,.046);boost.rotation.z=a;}},setAbility(ability,suppressed=false){badge.visible=Boolean(ability);if(ability){badgeMaterial.map=abilityTexture(ability);badgeMaterial.color.set(suppressed?'#646b78':'#ffffff');badgeMaterial.opacity=suppressed?.7:1;badgeMaterial.needsUpdate=true;}},setOwner(side){finish.setOwner(side);ownerTitleMaterial.map=ownerTitleTexture(profile,side);},setRotation(r){currentRotation=((r%6)+6)%6;frontMaterial.map=bake(profile,currentRotation,false,finish.rarity);},dispose(){frontMaterial.dispose();ownerTitleMaterial.dispose();finish.dispose();badgeMaterial.dispose();group.removeFromParent();instances.delete(card);}};instances.add(card);return card;
 }
 const normal=new T.Vector3(),viewDirection=new T.Vector3(),quaternion=new T.Quaternion();
 return {spawn,frame(dt,motion,cameraForCard=null){for(const c of instances)if(c.group.visible){c.finish.frame(dt,motion);const camera=cameraForCard?.(c);if(camera){c.group.updateWorldMatrix(true,false);normal.set(0,0,1).applyQuaternion(c.group.getWorldQuaternion(quaternion));camera.getWorldDirection(viewDirection);c.finish.setFrontVisible(normal.dot(viewDirection)<-.005);}}},dispose(){for(const c of [...instances])c.dispose();for(const t of faces.values())t.dispose();for(const [path,t] of artworkTextures)if(!templates.some(m=>m.artworkTexture===t))t.dispose();for(const t of templates)t.dispose();for(const t of badgeTextures.values())t.dispose();for(const t of ownerTitleTextures.values())t.dispose();ownerTitleGeometry.dispose();boostGeometry.dispose();boostMaterial.dispose();badgeGeometry.dispose();face.dispose();body.dispose();metal.dispose();backMaterial.dispose();}};
}
