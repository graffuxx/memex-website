import * as T from '../vendor/three.module.min.js';
import {createCardPrototype} from './card-prototype.mjs?v=classics-v04';
const canvas=document.getElementById('render'),gallery=document.getElementById('gallery'),panels=[...document.querySelectorAll('[data-profile]')];
const scene=new T.Scene();scene.add(new T.HemisphereLight('#e6e1ff','#241d31',2.6));
const key=new T.DirectionalLight('#fff0cd',3.5);key.position.set(-3,4,5);scene.add(key);const rim=new T.DirectionalLight('#a58aff',2.6);rim.position.set(3,1,-2);scene.add(rim);
const camera=new T.PerspectiveCamera(30,1,.1,30);camera.position.set(0,0,6);camera.lookAt(0,0,0);
let renderer,models=[],dirty=true,raf;
function resize(){if(!renderer)return;const r=gallery.getBoundingClientRect();renderer.setSize(r.width,r.height,false);dirty=true;}
function render(){raf=requestAnimationFrame(render);if(!dirty||!models.length||document.hidden)return;const bounds=canvas.getBoundingClientRect();renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true);
 for(let i=0;i<panels.length;i++){
  for(let j=0;j<models.length;j++)models[j].group.visible=i===j;
  const r=panels[i].getBoundingClientRect(),x=r.left-bounds.left+10,top=r.top-bounds.top+40,w=r.width-20,h=r.height-164;
  renderer.setViewport(x,bounds.height-top-h,w,h);renderer.setScissor(x,bounds.height-top-h,w,h);camera.aspect=w/h;camera.updateProjectionMatrix();
  const halfHeight=Math.tan(camera.fov*Math.PI/360)*6,scale=Math.min(halfHeight,halfHeight*camera.aspect)/1.07;models[i].group.scale.setScalar(scale);renderer.render(scene,camera);
 }
 renderer.setScissorTest(false);dirty=false;
}
async function init(){try{renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 await document.fonts.ready;models=await Promise.all(panels.map(p=>createCardPrototype({profile:p.dataset.profile})));for(const model of models)scene.add(model.group);resize();new ResizeObserver(resize).observe(gallery);document.getElementById('loadStatus').hidden=true;raf=requestAnimationFrame(render);
 }catch(e){document.getElementById('loadStatus').textContent='Die Karten konnten nicht geladen werden. Bitte neu laden.';console.error(e);}}
document.querySelector('.ownership').onclick=e=>{const b=e.target.closest('[data-owner]');if(!b||models.length!==panels.length)return;const side=b.dataset.owner==='neutral'?null:Number(b.dataset.owner);for(const m of models)m.setOwner(side);for(const button of document.querySelectorAll('[data-owner]'))button.setAttribute('aria-pressed',String(button===b));dirty=true;};
window.addEventListener('resize',resize);window.addEventListener('pageshow',resize);window.addEventListener('pagehide',e=>{if(e.persisted)return;cancelAnimationFrame(raf);for(const m of models)m.dispose();renderer?.dispose();});init();
