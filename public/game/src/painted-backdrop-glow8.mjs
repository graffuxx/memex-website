import * as T from '../vendor/three.module.min.js';
import {createPaintedLightTextures} from './painted-lights-glow8.mjs?v=crystal-glow-8b';
import {createHomeArenaLights} from './home-arena-lights25.mjs?v=home-rift-25';

// Only the separate additive light layer animates; the painting is never filtered or resampled.
export function createPaintedBackdropLayer(texture,lightTextures){
 const geometry=new T.PlaneGeometry(1,1),material=new T.MeshBasicMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}),plane=new T.Mesh(geometry,material);
 const effects=createHomeArenaLights(lightTextures);plane.add(effects.root);
 return {plane,frame:effects.frame,dispose(){effects.dispose();geometry.dispose();material.dispose();}};
}
export async function createPaintedBackdrop(renderer){
 const image=new Image();image.src=new URL('../assets/arenas/home-rift-v25/arena.webp',import.meta.url).href;await image.decode();
 const texture=new T.Texture(image);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=true;texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;texture.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());texture.needsUpdate=true;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,.1,2000);camera.position.z=1000;
 const lightTextures=createPaintedLightTextures(),layer=createPaintedBackdropLayer(texture,lightTextures),plane=layer.plane;scene.add(plane);scene.visible=false;
 return {
  setVisible(value){scene.visible=value;},
  layout(bounds,width,height){camera.left=-width/2;camera.right=width/2;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();plane.position.set(bounds.left+bounds.width/2-width/2,height/2-bounds.top-bounds.height/2,0);plane.scale.set(bounds.width,bounds.height,1);},
  frame(now,dt,motion){layer.frame(dt,motion);},
  render(renderer){if(scene.visible)renderer.render(scene,camera);},
  react(){},
  dispose(){layer.dispose();lightTextures.dispose();texture.dispose();scene.clear();}
 };
}
