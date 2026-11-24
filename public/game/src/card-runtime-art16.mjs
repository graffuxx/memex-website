import {ABILITY_ICON_KEYS,ABILITY_ICON_SIZE,abilityIconTextureSvg} from './card-ability-icon.mjs?v=no-escape-pair-release';
import {ELEMENT_IDS,ELEMENTS,elementSvg} from '../platform/elements53.mjs';
import {CARD_PROFILES as PROFILES} from './card-profiles27.mjs';
import {materialFrameUrl,CARD_MATERIALS} from './card-materials22.mjs';
import {getVariant} from '../platform/catalog.mjs';
import {RECRUITER_VARIANTS95} from '../platform/quests95.mjs';
import {CARD_ART,artworkFor,ownerMarker} from './card-art16.mjs';
import {createCardFinishLayer} from './card-finish-layer16.mjs?v=board-ownership-62';
import {FRAME_LAYOUT,valuePosition} from './card-layout21.mjs';
import * as T from '../vendor/three.module.min.js';
import {createCardPrototype,CARD_PROFILES,cardShape,CARD_SPEC} from './card-prototype16.mjs?v=element-53';

// Render the approved sculpted face once, then reuse it on thin 3D bodies.
// This retains the exact artwork/layout while keeping a full table inexpensive to draw.
export async function createCardRuntime(renderer,{variants=null}={}){
 const elementTextures=new Map(await Promise.all(ELEMENT_IDS.map(async id=>{const t=await new T.TextureLoader().loadAsync('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(elementSvg(id)));t.colorSpace=T.SRGBColorSpace;return [id,t];})));
 const badgeTextures=new Map(await Promise.all(ABILITY_ICON_KEYS.map(async ability=>{
  const svg=abilityIconTextureSvg(ability),texture=await new T.TextureLoader().loadAsync('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg));
  texture.colorSpace=T.SRGBColorSpace;
  return [ability,texture];
 })));
 const finishTexture=(t,profile,tier)=>{if(PROFILES[profile].artAtlas){const i=Object.keys(CARD_MATERIALS).indexOf(tier);const h=t.image.width/5/t.image.height;t.repeat.set(.2,h);t.offset.set(i/5,.6-h/2);}else if(PROFILES[profile].artRegion){const {x,y,w,h}=PROFILES[profile].artRegion;t.repeat.set(w,h);t.offset.set(x,1-y-h);}return t;};
 const frames=new Map(await Promise.all(Object.keys(CARD_MATERIALS).map(async key=>{const texture=await new T.TextureLoader().loadAsync(await materialFrameUrl(key));texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;return [key,texture];})));
 const requested=variants===null?null:new Set(variants.map(id=>getVariant(id)?.definitionId).filter(Boolean));
 const profiles=Object.keys(CARD_PROFILES).filter(id=>requested===null||['pepe','doge','roll-safe'].includes(id)||requested.has(id));
 const templates=await Promise.all(profiles.map(profile=>createCardPrototype({profile,frames}))),scene=new T.Scene();
 scene.add(new T.HemisphereLight('#e6e1ff','#241d31',2.6));const key=new T.DirectionalLight('#fff0cd',3.5);key.position.set(-3,4,5);scene.add(key);const rim=new T.DirectionalLight('#a58aff',2.6);rim.position.set(3,1,-2);scene.add(rim);
 for(const m of templates)scene.add(m.group);
 const artworkTextures=new Map(templates.map(m=>[artworkFor(m.profile.id),m.artworkTexture]));
 await Promise.all(RECRUITER_VARIANTS95.filter(v=>profiles.includes(v.definitionId)).map(async v=>{const t=await new T.TextureLoader().loadAsync(v.image);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;artworkTextures.set(v.image,t);}));
 const atlasBases=new Map(templates.filter(m=>m.profile.artAtlas).map(m=>[m.profile.id,m.artworkTexture]));
 async function loadArtwork(profile,tier){
  if(PROFILES[profile].artAtlas){const base=atlasBases.get(profile);if(!base)throw Error('Portrait atlas not prepared.');const texture=base.clone();texture.needsUpdate=true;return finishTexture(texture,profile,tier);}
  const texture=await new T.TextureLoader().loadAsync(new URL(artworkFor(profile,tier),import.meta.url).href);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;return finishTexture(texture,profile,tier);
 }

 await Promise.all(Object.entries(CARD_ART).filter(([profile])=>profiles.includes(profile)).flatMap(([profile,tiers])=>Object.keys(tiers).filter(t=>t!=='common'&&(variants===null||['pepe','doge','roll-safe'].includes(profile)||variants.includes(`${profile}:${t}`))).map(async tier=>{
  const path=artworkFor(profile,tier),texture=await loadArtwork(profile,tier);artworkTextures.set(path,texture);
 })));
 const preparing=new Map();
 async function prepare(profile){
  if(!Object.hasOwn(CARD_PROFILES,profile))throw Error('Unknown card motif.');
  if(preparing.has(profile))return preparing.get(profile);
  const pending=(async()=>{
   if(!templates.some(m=>m.profile.id===profile)){const model=await createCardPrototype({profile,frames});templates.push(model);scene.add(model.group);artworkTextures.set(artworkFor(profile),model.artworkTexture);if(model.profile.artAtlas)atlasBases.set(profile,model.artworkTexture);}
   await Promise.all(Object.keys(CARD_ART[profile]).filter(tier=>!artworkTextures.has(artworkFor(profile,tier))).map(async tier=>{const path=artworkFor(profile,tier),texture=await loadArtwork(profile,tier);artworkTextures.set(path,texture);}));
  })();preparing.set(profile,pending);
  try{await pending;}catch(error){preparing.delete(profile);throw error;}
 }
 const camera=new T.OrthographicCamera(-1.048,1.048,1.048,-1.048,.1,10),faces=new Map(),instances=new Set();
 function bake(profile,rotation=0,back=false,rarity='common',variantId=null){
  const variant=getVariant(variantId),art=variant?.edition==='recruiter'?variant.image:artworkFor(profile,rarity);
  const cacheKey=back?'back':profile+'/'+rarity+'/'+rotation+'/'+art;if(faces.has(cacheKey))return faces.get(cacheKey).texture;
  const model=templates.find(m=>m.profile.id===profile);for(const m of templates)m.group.visible=m===model;model.setRotation(rotation);model.setFinish(rarity);model.setArtwork(artworkTextures.get(art));
  camera.position.set(0,0,back?-6:6);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  const previous=renderer.getRenderTarget(),viewport=renderer.getViewport(new T.Vector4()),scissor=renderer.getScissor(new T.Vector4()),scissorTest=renderer.getScissorTest(),oldClear=renderer.getClearColor(new T.Color()),oldAlpha=renderer.getClearAlpha(),oldExposure=renderer.toneMappingExposure;
  const target=new T.WebGLRenderTarget(1024,1024,{depthBuffer:true,samples:2});target.texture.colorSpace=T.SRGBColorSpace;target.texture.generateMipmaps=true;target.texture.minFilter=T.LinearMipmapLinearFilter;target.texture.anisotropy=4;
  // Render targets already select their physical-pixel viewport; setViewport would apply devicePixelRatio a second time.
  renderer.setRenderTarget(target);renderer.setScissorTest(false);renderer.setClearColor(0,0);renderer.toneMappingExposure=1.05;renderer.clear();renderer.render(scene,camera);
  renderer.setRenderTarget(previous);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);renderer.setClearColor(oldClear,oldAlpha);renderer.toneMappingExposure=oldExposure;
  faces.set(cacheKey,target);return target.texture;
 }
 function faceGeometry(){return new T.PlaneGeometry(2.096,2.096);}
 const ownerTitleGeometry=new T.PlaneGeometry(.18,.18),ownerTitleTextures=new Map();
 function ownerTitleTexture(profile,side){
  const key=String(side);if(ownerTitleTextures.has(key))return ownerTitleTextures.get(key);
  const marker=ownerMarker(side),c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
  if(marker){ctx.fillStyle='#0b1524';ctx.beginPath();ctx.arc(64,64,60,0,Math.PI*2);ctx.fill();ctx.fillStyle=marker.color;ctx.beginPath();
  if(side===0)ctx.arc(64,64,39,0,Math.PI*2);else{ctx.moveTo(64,19);ctx.lineTo(109,64);ctx.lineTo(64,109);ctx.lineTo(19,64);ctx.closePath();}ctx.fill();}
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;ownerTitleTextures.set(key,texture);return texture;
 }
 const face=faceGeometry(),body=new T.ExtrudeGeometry(cardShape(),{depth:CARD_SPEC.bodyDepth,bevelEnabled:true,bevelSegments:3,bevelSize:.012,bevelThickness:.009,steps:1});body.translate(0,0,-CARD_SPEC.bodyDepth/2);
 const metal=new T.MeshStandardMaterial({color:'#142a43',metalness:.72,roughness:.35});
 const boostGeometry=new T.PlaneGeometry(.025,.18),boostMaterial=new T.MeshBasicMaterial({color:'#ffdb71',toneMapped:false}),badgeGeometry=new T.PlaneGeometry(ABILITY_ICON_SIZE,ABILITY_ICON_SIZE);
 const valueEffectGeo=new T.PlaneGeometry(.35,.29),valueEffectTextures=new Map();
 function valueEffectTexture(value,kind='field'){
  const key=kind+':'+value;
  if(valueEffectTextures.has(key))return valueEffectTextures.get(key);
  const canvas=document.createElement('canvas');canvas.width=192;canvas.height=160;
  const ctx=canvas.getContext('2d'),element=ELEMENTS[kind];
  ctx.fillStyle=element?.from??'#ffe39c';ctx.strokeStyle=element?.to??'#7b4e19';ctx.lineWidth=9;
  ctx.beginPath();ctx.roundRect(5,5,182,150,30);ctx.fill();ctx.stroke();
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#251927';
  ctx.font='900 100px Arial';ctx.fillText(String(value),96,element?82:67);
  if(!element){ctx.font='900 30px Arial';ctx.fillText('+1 FIELD',96,128);}
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;valueEffectTextures.set(key,texture);return texture;
 }
 const backMaterial=new T.MeshBasicMaterial({map:bake('pepe',0,true),transparent:true,alphaTest:.025,toneMapped:false});
 function spawn(uid,profile,owner,rotation=0,rarity='common',element=PROFILES[profile].element,variantId=null){
  const group=new T.Group();group.name=uid;
  const side=new T.Mesh(body,metal);side.castShadow=true;group.add(side);
  const frontMaterial=new T.MeshBasicMaterial({map:bake(profile,rotation,false,rarity,variantId),transparent:true,alphaTest:.025,toneMapped:false}),front=new T.Mesh(face,frontMaterial);front.position.z=.035;group.add(front);
  const back=new T.Mesh(face,backMaterial);back.rotation.y=Math.PI;back.position.z=-.035;group.add(back);
  const finish=createCardFinishLayer(rarity,owner,uid);group.add(finish.root);
  const ownerTitleMaterial=new T.MeshBasicMaterial({map:ownerTitleTexture(profile,owner),transparent:true,depthWrite:false,toneMapped:false}),ownerTitle=new T.Mesh(ownerTitleGeometry,ownerTitleMaterial);ownerTitle.position.set(-.49,FRAME_LAYOUT.titleY,.079);ownerTitle.visible=owner===0||owner===1;group.add(ownerTitle);
  const badgeMaterial=new T.MeshBasicMaterial({transparent:true,depthWrite:false,toneMapped:false}),badge=new T.Mesh(badgeGeometry,badgeMaterial);badge.position.set(0,CARD_SPEC.socketY,.07);badge.visible=false;group.add(badge);const boost=new T.Mesh(boostGeometry,boostMaterial);boost.visible=false;group.add(boost);
  const socket=new T.Mesh(new T.CircleGeometry(.127,32),new T.MeshBasicMaterial({color:'#101829',toneMapped:false}));socket.position.set(0,FRAME_LAYOUT.elementY,.073);group.add(socket);
  const glyphMaterial=new T.MeshBasicMaterial({map:elementTextures.get(element),transparent:true,depthWrite:false,toneMapped:false}),glyph=new T.Mesh(new T.PlaneGeometry(.245,.245),glyphMaterial);glyph.position.set(0,FRAME_LAYOUT.elementY,.075);group.add(glyph);
  let effectKey='';const fieldValueMeshes=Array.from({length:6},(_,dir)=>{const mesh=new T.Mesh(valueEffectGeo,new T.MeshBasicMaterial({transparent:true,depthWrite:false,toneMapped:false}));const [x,y]=valuePosition(dir);mesh.position.set(x,y,.086);mesh.visible=false;group.add(mesh);return mesh;});
  let currentRotation=rotation;const card={uid,profile,group,finish,setFieldEffects(feedback={bonuses:[]}){const key=JSON.stringify([currentRotation,feedback]);if(key===effectKey)return;effectKey=key;fieldValueMeshes.forEach((mesh,dir)=>{const base=PROFILES[profile].values[((dir-currentRotation)%6+6)%6],bonus=feedback.bonuses[dir]??0;mesh.visible=bonus>0&&base!==10;if(mesh.visible){mesh.material.map=valueEffectTexture(base+bonus,feedback.effects?.find(effect=>effect.dir===dir)?.ability);mesh.material.needsUpdate=true;}});},setVariant(id){if(id===variantId)return;variantId=id;frontMaterial.map=bake(profile,currentRotation,false,finish.rarity.key,variantId);},setElement(id){glyphMaterial.map=elementTextures.get(id);},setRarity(key){if(key===finish.rarity.key)return;finish.setRarity(key);frontMaterial.map=bake(profile,currentRotation,false,finish.rarity.key,variantId);},setBoost(direction){boost.visible=Number.isInteger(direction);if(boost.visible){const [x,y]=valuePosition(direction);boost.position.set(x*.79,y*.79,.072);boost.rotation.z=Math.atan2(y,x);}},setAbility(ability,suppressed=false){badge.visible=badgeTextures.has(ability);if(badge.visible){badgeMaterial.map=badgeTextures.get(ability);badgeMaterial.color.set(suppressed?'#646b78':'#ffffff');badgeMaterial.opacity=suppressed?.7:1;badgeMaterial.needsUpdate=true;}},setOwner(side){finish.setOwner(side);ownerTitle.visible=side===0||side===1;if(ownerTitle.visible)ownerTitleMaterial.map=ownerTitleTexture(profile,side);},setRotation(r){currentRotation=((r%6)+6)%6;frontMaterial.map=bake(profile,currentRotation,false,finish.rarity.key,variantId);},dispose(){for(const mesh of fieldValueMeshes)mesh.material.dispose();glyphMaterial.dispose();glyph.geometry.dispose();socket.geometry.dispose();socket.material.dispose();frontMaterial.dispose();ownerTitleMaterial.dispose();finish.dispose();badgeMaterial.dispose();group.removeFromParent();instances.delete(card);}};instances.add(card);return card;
 }
 const normal=new T.Vector3(),viewDirection=new T.Vector3(),quaternion=new T.Quaternion();
 return {spawn,prepare,frame(dt,motion,cameraForCard=null){for(const c of instances)if(c.group.visible){c.finish.frame(dt,motion);const camera=cameraForCard?.(c);if(camera){c.group.updateWorldMatrix(true,false);normal.set(0,0,1).applyQuaternion(c.group.getWorldQuaternion(quaternion));camera.getWorldDirection(viewDirection);c.finish.setFrontVisible(normal.dot(viewDirection)<-.005);}}},dispose(){for(const c of [...instances])c.dispose();for(const t of faces.values())t.dispose();for(const [path,t] of artworkTextures)if(!templates.some(m=>m.artworkTexture===t))t.dispose();for(const t of templates)t.dispose();for(const t of frames.values())t.dispose();for(const t of elementTextures.values())t.dispose();for(const t of badgeTextures.values())t.dispose();for(const t of ownerTitleTextures.values())t.dispose();for(const texture of valueEffectTextures.values())texture.dispose();valueEffectGeo.dispose();ownerTitleGeometry.dispose();boostGeometry.dispose();boostMaterial.dispose();badgeGeometry.dispose();face.dispose();body.dispose();metal.dispose();backMaterial.dispose();}};
}
