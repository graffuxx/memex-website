import * as T from '../vendor/three.module.min.js';
import {createPaintedLightTextures,createPaintedLights,BLOCKADE_LIGHTS,BLOCKADE_MOTES} from './painted-lights-glow8.mjs?v=crystal-glow-8b';

export async function createPaintedBlockade(renderer){
 const texture=await new T.TextureLoader().loadAsync(new URL('../assets/arenas/crystal-v07/void-blockade.webp',import.meta.url).href);
 texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());
 return createPaintedBlockadeLayer(texture,createPaintedLightTextures());
}

export function createPaintedBlockadeLayer(texture,lightTextures){
 const material=new T.SpriteMaterial({map:texture,transparent:true,toneMapped:false,depthWrite:false,fog:false});
 const root=new T.Group();root.name='Painted obsidian blockade';root.position.y=-.445;root.visible=false;
 const sprite=new T.Sprite(material);sprite.scale.set(1.55,1.55,1);sprite.center.set(.5,.16);
 const effects=createPaintedLights(lightTextures,{lights:BLOCKADE_LIGHTS,motes:BLOCKADE_MOTES}),up=new T.Vector3();effects.root.scale.setScalar(1.55);root.add(sprite,effects.root);
 return {root,sprite:root,setVisible(value){root.visible=value;},frame(dt,motion,camera){effects.frame(dt,motion);if(!motion)return;effects.root.quaternion.copy(camera.quaternion);up.set(0,1,0).applyQuaternion(camera.quaternion);effects.root.position.copy(up).multiplyScalar(.34*1.55);},dispose(){root.removeFromParent();effects.dispose();lightTextures.dispose();texture.dispose();material.dispose();root.clear();}};
}
