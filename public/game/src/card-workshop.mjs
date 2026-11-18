import * as T from '../vendor/three.module.min.js';
import {createCardPrototype,CARD_PROFILES} from './card-prototype.mjs?v=classics-v04';
import {ELEMENTS} from './rules.mjs';

const $=id=>document.getElementById(id),canvas=$('render'),studio=$('studio');
const requestedProfile=new URLSearchParams(location.search).get('card'),selectedProfile=Object.hasOwn(CARD_PROFILES,requestedProfile)?requestedProfile:'pepe',profile=CARD_PROFILES[selectedProfile];
($('cardTitle')??document.querySelector('.intro h1')).textContent=profile.name;($('profileEyebrow')??document.querySelector('.intro .eyebrow')).textContent='MEME-KLASSIKER / '+ELEMENTS[profile.element].name.toUpperCase();($('profileCaption')??document.querySelector('.view-caption')).textContent=profile.caption;($('valueSummary')??document.querySelector('.values p')).textContent='24 Grundpunkte · '+ELEMENTS[profile.element].name+' · Musterwerte';
let owner=null,rotation=0,spin=false,dirty=true,model,renderer,raf;
const scene=new T.Scene();scene.add(new T.HemisphereLight('#e6e1ff','#241d31',2.6));
const key=new T.DirectionalLight('#fff0cd',3.5);key.position.set(-3,4,5);scene.add(key);
const rim=new T.DirectionalLight('#a58aff',2.6);rim.position.set(3,1,-2);scene.add(rim);
const table=new T.Group();scene.add(table);
const stone=new T.MeshStandardMaterial({color:'#354751',roughness:.85}),edge=new T.MeshStandardMaterial({color:'#918164',metalness:.5,roughness:.45});
const floor=new T.Mesh(new T.CylinderGeometry(1.17,1.2,.09,6),stone);floor.rotation.y=Math.PI/6;floor.position.y=-.08;table.add(floor);
const trim=new T.Mesh(new T.CylinderGeometry(1.21,1.21,.025,6),edge);trim.rotation.y=Math.PI/6;trim.position.y=-.135;table.add(trim);
for(const [x,z] of [[2.1,0],[-2.1,0],[1.05,-1.82],[-1.05,-1.82]]){const m=new T.Mesh(floor.geometry,stone);m.rotation.y=Math.PI/6;m.position.set(x,-.18,z);table.add(m);}
const camera=new T.PerspectiveCamera(30,1,.1,30),ortho=new T.OrthographicCamera(-1.2,1.2,1.2,-1.2,.1,20);
const viewSettings={front:{position:[0,0,6],scale:1.1},angle:{position:[3.1,1.1,5],scale:1.04},back:{position:[0,0,-6],scale:1.05},edge:{position:[5,.55,1.6],scale:1.03},table:{position:[0,5.4,3.4],scale:1.3},small70:{position:[0,0,6],scale:1.01},small110:{position:[0,0,6],scale:1.01}};
const views=[...document.querySelectorAll('[data-view]')];
function values(){if(!model)return;$('valueReadout').innerHTML=model.values.map((n,i)=>`<span><small>${['→','↘','↙','←','↖','↗'][i]}</small>${n}</span>`).join('');$('rotationValue').textContent=rotation*60+'°';}
function resize(){if(!renderer)return;const r=studio.getBoundingClientRect();const bottom=Math.max(r.bottom,...views.map(v=>v.getBoundingClientRect().bottom));renderer.setSize(r.width,bottom-r.top,false);canvas.style.height=bottom-r.top+'px';dirty=true;}
function render(now){raf=requestAnimationFrame(render);if(!model||document.hidden||!dirty&&!spin)return;
 const bounds=canvas.getBoundingClientRect();renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true);
 for(const view of views){
  const id=view.dataset.view,s=viewSettings[id],rect=view.getBoundingClientRect(),small=id.startsWith('small'),left=rect.left-bounds.left;
  const top=rect.top-bounds.top+(small?0:48),h=rect.height-(small?12:id==='front'?108:62),w=rect.width- (small?0:20),x=left+(small?0:10),y=bounds.height-top-h;
  renderer.setViewport(x,y,w,h);renderer.setScissor(x,y,w,h);
  const aspect=w/h,c=small?ortho:camera;
  if(small){const cardWidth=Math.sqrt(3)*1.024;ortho.left=-cardWidth/2;ortho.right=cardWidth/2;ortho.top=cardWidth/aspect/2;ortho.bottom=-ortho.top;}else{camera.aspect=aspect;}
  c.position.set(...s.position);if(id==='front'&&spin){const a=Math.sin(now*.0006)*1.05;c.position.set(Math.sin(a)*6,.15,Math.cos(a)*6);}
  c.up.set(0,1,0);c.lookAt(0,0,0);c.updateProjectionMatrix();
  if(!small){const vertical=Math.tan(camera.fov*Math.PI/360)*c.position.length(),fit=Math.min(vertical,vertical*aspect);model.group.scale.setScalar(fit/s.scale);}
  else model.group.scale.setScalar(1);
  table.visible=id==='table';model.group.rotation.set(id==='table'?-Math.PI/2:0,0,0);table.scale.setScalar(model.group.scale.x);
  renderer.render(scene,c);
 }
 renderer.setScissorTest(false);dirty=false;
}
async function init(){try{
 renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 await document.fonts.ready;model=await createCardPrototype({profile:selectedProfile});scene.add(model.group);values();resize();new ResizeObserver(resize).observe(document.querySelector('main'));$('loadStatus').hidden=true;$('renderStatus').textContent='Echtes 3D-Modell · alle Ansichten aus derselben Geometrie';raf=requestAnimationFrame(render);
 }catch(error){$('loadStatus').textContent='Die 3D-Studie konnte nicht geladen werden. Bitte neu laden.';console.error(error);}}
document.querySelector('.ownership').addEventListener('click',e=>{const b=e.target.closest('[data-owner]');if(!b||!model)return;owner=b.dataset.owner==='neutral'?null:Number(b.dataset.owner);model.setOwner(owner);for(const btn of document.querySelectorAll('[data-owner]'))btn.setAttribute('aria-pressed',String(btn===b));dirty=true;});
$('rotateValues').onclick=()=>{if(!model)return;rotation=(rotation+1)%6;model.setRotation(rotation);values();dirty=true;};
$('spin').onclick=()=>{spin=!spin;$('spin').setAttribute('aria-pressed',String(spin));$('spin').textContent=spin?'Drehung stoppen':'Modell drehen';dirty=true;};
window.addEventListener('resize',resize);window.addEventListener('scroll',()=>{dirty=true;},{passive:true});
window.addEventListener('pageshow',resize);window.addEventListener('pagehide',e=>{if(e.persisted)return;cancelAnimationFrame(raf);model?.dispose();renderer?.dispose();});
init();
