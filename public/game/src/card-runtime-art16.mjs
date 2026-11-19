import {materialFrameUrl,CARD_MATERIALS} from './card-materials22.mjs';
import {getVariant} from '../platform/catalog.mjs';
import {CARD_ART,artworkFor,ownerMarker} from './card-art16.mjs';
import {createCardFinishLayer} from './card-finish-layer16.mjs?v=alpha-cards-45';
import {FRAME_LAYOUT,valuePosition} from './card-layout21.mjs';
import * as T from '../vendor/three.module.min.js';
import {createCardPrototype,CARD_PROFILES,cardShape,CARD_SPEC} from './card-prototype16.mjs?v=alpha-cards-45';

// Render the approved sculpted face once, then reuse it on thin 3D bodies.
// This retains the exact artwork/layout while keeping a full table inexpensive to draw.
export async function createCardRuntime(renderer,{variants=null}={}){
 const frames=new Map(await Promise.all(Object.keys(CARD_MATERIALS).map(async key=>{const texture=await new T.TextureLoader().loadAsync(await materialFrameUrl(key));texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;return [key,texture];})));
 const requested=variants===null?null:new Set(variants.map(id=>getVariant(id)?.definitionId).filter(Boolean));
 const profiles=Object.keys(CARD_PROFILES).filter(id=>requested===null||['pepe','doge','roll-safe'].includes(id)||requested.has(id));
 const templates=await Promise.all(profiles.map(profile=>createCardPrototype({profile,frames}))),scene=new T.Scene();
 scene.add(new T.HemisphereLight('#e6e1ff','#241d31',2.6));const key=new T.DirectionalLight('#fff0cd',3.5);key.position.set(-3,4,5);scene.add(key);const rim=new T.DirectionalLight('#a58aff',2.6);rim.position.set(3,1,-2);scene.add(rim);
 for(const m of templates)scene.add(m.group);
 const artworkTextures=new Map(templates.map(m=>[artworkFor(m.profile.id),m.artworkTexture]));
 await Promise.all(Object.entries(CARD_ART).filter(([profile])=>profiles.includes(profile)).flatMap(([profile,tiers])=>Object.keys(tiers).filter(t=>t!=='common'&&(variants===null||['pepe','doge','roll-safe'].includes(profile)||variants.includes(`${profile}:${t}`))).map(async tier=>{
  const path=artworkFor(profile,tier),texture=await new T.TextureLoader().loadAsync(new URL(path,import.meta.url).href);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;artworkTextures.set(path,texture);
 })));
 const preparing=new Map();
 async function prepare(profile){
  if(!Object.hasOwn(CARD_PROFILES,profile))throw Error('Unknown card motif.');
  if(preparing.has(profile))return preparing.get(profile);
  const pending=(async()=>{
   if(!templates.some(m=>m.profile.id===profile)){const model=await createCardPrototype({profile,frames});templates.push(model);scene.add(model.group);artworkTextures.set(artworkFor(profile),model.artworkTexture);}
   await Promise.all(Object.keys(CARD_ART[profile]).filter(tier=>!artworkTextures.has(artworkFor(profile,tier))).map(async tier=>{const path=artworkFor(profile,tier),texture=await new T.TextureLoader().loadAsync(new URL(path,import.meta.url).href);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;artworkTextures.set(path,texture);}));
  })();preparing.set(profile,pending);
  try{await pending;}catch(error){preparing.delete(profile);throw error;}
 }
 const camera=new T.OrthographicCamera(-1.048,1.048,1.048,-1.048,.1,10),faces=new Map(),instances=new Set();
 function bake(profile,rotation=0,back=false,rarity='common'){
  const cacheKey=back?'back':profile+'/'+rarity+'/'+rotation;if(faces.has(cacheKey))return faces.get(cacheKey).texture;
  const model=templates.find(m=>m.profile.id===profile);for(const m of templates)m.group.visible=m===model;model.setRotation(rotation);model.setFinish(rarity);model.setArtwork(artworkTextures.get(artworkFor(profile,rarity)));
  camera.position.set(0,0,back?-6:6);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  const previous=renderer.getRenderTarget(),viewport=renderer.getViewport(new T.Vector4()),scissor=renderer.getScissor(new T.Vector4()),scissorTest=renderer.getScissorTest(),oldClear=renderer.getClearColor(new T.Color()),oldAlpha=renderer.getClearAlpha(),oldExposure=renderer.toneMappingExposure;
  const target=new T.WebGLRenderTarget(1024,1024,{depthBuffer:true,samples:2});target.texture.colorSpace=T.SRGBColorSpace;target.texture.generateMipmaps=true;target.texture.minFilter=T.LinearMipmapLinearFilter;target.texture.anisotropy=4;
  // Render targets already select their physical-pixel viewport; setViewport would apply devicePixelRatio a second time.
  renderer.setRenderTarget(target);renderer.setScissorTest(false);renderer.setClearColor(0,0);renderer.toneMappingExposure=1.05;renderer.clear();renderer.render(scene,camera);
  renderer.setRenderTarget(previous);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);renderer.setClearColor(oldClear,oldAlpha);renderer.toneMappingExposure=oldExposure;
  faces.set(cacheKey,target);return target.texture;
 }
 function faceGeometry(){return new T.PlaneGeometry(2.096,2.096);}
 const ownerTitleGeometry=new T.PlaneGeometry(.07,.07),ownerTitleTextures=new Map();
 function ownerTitleTexture(profile,side){
  const key=String(side);if(ownerTitleTextures.has(key))return ownerTitleTextures.get(key);
  const marker=ownerMarker(side),c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
  ctx.fillStyle='#0b1524';ctx.beginPath();ctx.arc(64,64,60,0,Math.PI*2);ctx.fill();ctx.fillStyle=marker.color;ctx.beginPath();
  if(side===0)ctx.arc(64,64,39,0,Math.PI*2);else{ctx.moveTo(64,19);ctx.lineTo(109,64);ctx.lineTo(64,109);ctx.lineTo(19,64);ctx.closePath();}ctx.fill();
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;ownerTitleTextures.set(key,texture);return texture;
 }
 const face=faceGeometry(),body=new T.ExtrudeGeometry(cardShape(),{depth:CARD_SPEC.bodyDepth,bevelEnabled:true,bevelSegments:3,bevelSize:.012,bevelThickness:.009,steps:1});body.translate(0,0,-CARD_SPEC.bodyDepth/2);
 const metal=new T.MeshStandardMaterial({color:'#142a43',metalness:.72,roughness:.35});
 const boostGeometry=new T.PlaneGeometry(.025,.18),boostMaterial=new T.MeshBasicMaterial({color:'#ffdb71',toneMapped:false}),badgeGeometry=new T.PlaneGeometry(.19,.19),badgeTextures=new Map();
 function abilityTexture(key){
  if(badgeTextures.has(key))return badgeTextures.get(key);const c=document.createElement('canvas');c.width=c.height=192;const ctx=c.getContext('2d');
  ctx.strokeStyle='#ffe1a0';ctx.fillStyle='#ffe1a0';ctx.lineWidth=13;ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='#ffce66';ctx.shadowBlur=7;
  if(key==='guard'){ctx.beginPath();ctx.moveTo(96,25);ctx.lineTo(151,47);ctx.lineTo(142,116);ctx.quadraticCurveTo(127,149,96,170);ctx.quadraticCurveTo(65,149,50,116);ctx.lineTo(41,47);ctx.closePath();ctx.stroke();}
  else if(key==='hype'){ctx.beginPath();ctx.moveTo(113,18);ctx.lineTo(48,105);ctx.lineTo(89,105);ctx.lineTo(76,175);ctx.lineTo(149,81);ctx.lineTo(106,81);ctx.closePath();ctx.fill();}
  else if(key==='twist'){ctx.beginPath();ctx.arc(96,101,55,-1.1,4.4);ctx.stroke();ctx.beginPath();ctx.moveTo(140,23);ctx.lineTo(153,81);ctx.lineTo(96,66);ctx.closePath();ctx.fill();}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;badgeTextures.set(key,t);return t;
 }
 const backMaterial=new T.MeshBasicMaterial({map:bake('pepe',0,true),transparent:true,alphaTest:.025,toneMapped:false});
 function spawn(uid,profile,owner,rotation=0,rarity='common'){
  const group=new T.Group();group.name=uid;
  const side=new T.Mesh(body,metal);side.castShadow=true;group.add(side);
  const frontMaterial=new T.MeshBasicMaterial({map:bake(profile,rotation,false,rarity),transparent:true,alphaTest:.025,toneMapped:false}),front=new T.Mesh(face,frontMaterial);front.position.z=.035;group.add(front);
  const back=new T.Mesh(face,backMaterial);back.rotation.y=Math.PI;back.position.z=-.035;group.add(back);
  const finish=createCardFinishLayer(rarity,owner,uid);group.add(finish.root);
  const ownerTitleMaterial=new T.MeshBasicMaterial({map:ownerTitleTexture(profile,owner),transparent:true,depthWrite:false,toneMapped:false}),ownerTitle=new T.Mesh(ownerTitleGeometry,ownerTitleMaterial);ownerTitle.position.set(-.43,FRAME_LAYOUT.titleY,.069);group.add(ownerTitle);
  const badgeMaterial=new T.MeshBasicMaterial({transparent:true,depthWrite:false,toneMapped:false}),badge=new T.Mesh(badgeGeometry,badgeMaterial);badge.position.set(0,CARD_SPEC.socketY,.07);badge.visible=false;group.add(badge);const boost=new T.Mesh(boostGeometry,boostMaterial);boost.visible=false;group.add(boost);
  let currentRotation=rotation;const card={uid,profile,group,finish,setRarity(key){if(key===finish.rarity.key)return;finish.setRarity(key);frontMaterial.map=bake(profile,currentRotation,false,finish.rarity.key);},setBoost(direction){boost.visible=Number.isInteger(direction);if(boost.visible){const [x,y]=valuePosition(direction);boost.position.set(x*.79,y*.79,.072);boost.rotation.z=Math.atan2(y,x);}},setAbility(ability,suppressed=false){badge.visible=Boolean(ability);if(ability){badgeMaterial.map=abilityTexture(ability);badgeMaterial.color.set(suppressed?'#646b78':'#ffffff');badgeMaterial.opacity=suppressed?.7:1;badgeMaterial.needsUpdate=true;}},setOwner(side){finish.setOwner(side);ownerTitleMaterial.map=ownerTitleTexture(profile,side);},setRotation(r){currentRotation=((r%6)+6)%6;frontMaterial.map=bake(profile,currentRotation,false,finish.rarity.key);},dispose(){frontMaterial.dispose();ownerTitleMaterial.dispose();finish.dispose();badgeMaterial.dispose();group.removeFromParent();instances.delete(card);}};instances.add(card);return card;
 }
 const normal=new T.Vector3(),viewDirection=new T.Vector3(),quaternion=new T.Quaternion();
 return {spawn,prepare,frame(dt,motion,cameraForCard=null){for(const c of instances)if(c.group.visible){c.finish.frame(dt,motion);const camera=cameraForCard?.(c);if(camera){c.group.updateWorldMatrix(true,false);normal.set(0,0,1).applyQuaternion(c.group.getWorldQuaternion(quaternion));camera.getWorldDirection(viewDirection);c.finish.setFrontVisible(normal.dot(viewDirection)<-.005);}}},dispose(){for(const c of [...instances])c.dispose();for(const t of faces.values())t.dispose();for(const [path,t] of artworkTextures)if(!templates.some(m=>m.artworkTexture===t))t.dispose();for(const t of templates)t.dispose();for(const t of frames.values())t.dispose();for(const t of badgeTextures.values())t.dispose();for(const t of ownerTitleTextures.values())t.dispose();ownerTitleGeometry.dispose();boostGeometry.dispose();boostMaterial.dispose();badgeGeometry.dispose();face.dispose();body.dispose();metal.dispose();backMaterial.dispose();}};
}
