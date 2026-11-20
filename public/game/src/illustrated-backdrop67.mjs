import * as T from '../vendor/three.module.min.js';
import {ILLUSTRATED_ARENAS} from './illustrated-arenas67.mjs';
import {createIllustratedEffects67} from './illustrated-effects67.mjs';

export function createIllustratedBackdrop67(renderer){
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,.1,2000);camera.position.z=1000;scene.visible=false;
 const resources=new Map();let current=null,generation=0,disposed=false;
 async function load(id){if(!resources.has(id)){const pending=(async()=>{const arena=ILLUSTRATED_ARENAS[id];if(!arena)throw Error('Unknown arena.');const image=new Image();image.src=new URL(arena.asset,import.meta.url).href;await image.decode();if(disposed)throw Error('Arena view closed.');
 const texture=new T.Texture(image);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=true;texture.minFilter=T.LinearMipmapLinearFilter;texture.magFilter=T.LinearFilter;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());texture.needsUpdate=true;
 const fadeCanvas=document.createElement('canvas');fadeCanvas.width=2;fadeCanvas.height=128;const fadeContext=fadeCanvas.getContext('2d'),fadeGradient=fadeContext.createLinearGradient(0,0,0,128);for(const [at,color]of [[0,'black'],[.09,'white'],[.91,'white'],[1,'black']])fadeGradient.addColorStop(at,color);fadeContext.fillStyle=fadeGradient;fadeContext.fillRect(0,0,2,128);const fadeTexture=new T.CanvasTexture(fadeCanvas);const geometry=new T.PlaneGeometry(1,1),material=new T.MeshBasicMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}),plane=new T.Mesh(geometry,material),effects=createIllustratedEffects67(arena,texture,image,renderer.getPixelRatio());plane.add(effects.root);
 return {id,plane,effects,material,fadeTexture,dispose(){plane.removeFromParent();effects.dispose();geometry.dispose();material.dispose();texture.dispose();fadeTexture.dispose();}};})();resources.set(id,pending);pending.catch(()=>resources.delete(id));}return resources.get(id);}
 return {async setArena(id){const token=++generation,next=await load(id);if(disposed||token!==generation)return false;if(current!==next){current?.plane.removeFromParent();current=next;scene.add(current.plane);}return true;},
 setVisible(value){scene.visible=value;},layout(bounds,width,height){if(!current)return;const fade=bounds.height<height?current.fadeTexture:null;if(current.material.alphaMap!==fade){current.material.alphaMap=fade;current.material.needsUpdate=true;}camera.left=-width/2;camera.right=width/2;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();current.plane.position.set(bounds.left+bounds.width/2-width/2,height/2-bounds.top-bounds.height/2,0);current.plane.scale.set(bounds.width,bounds.height,1);},
 frame(now,dt,motion){current?.effects.frame(dt,motion);},render(renderer){if(scene.visible&&current)renderer.render(scene,camera);},react(){},
 dispose(){disposed=true;generation++;scene.clear();for(const resource of resources.values())resource.then(r=>r.dispose()).catch(()=>{});resources.clear();current=null;}
 };
}
