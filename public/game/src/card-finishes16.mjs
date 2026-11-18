import * as T from '../vendor/three.module.min.js';
import {createCardRuntime} from './card-runtime-art16.mjs?v=material-frames-22';
import {CARD_RARITIES,RARITY_KEYS} from './card-rarities15.mjs';
const stage=document.getElementById('finishStage'),owner=document.getElementById('studioOwner'),motion=document.getElementById('studioMotion'),profile=document.getElementById('studioProfile'),side=document.getElementById('studioSide');
const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.setClearColor(0,0);stage.prepend(renderer.domElement);
const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,.1,2000);camera.position.z=1000;scene.add(new T.HemisphereLight('#e9ddff','#292039',2.5));const key=new T.DirectionalLight('#ffedc9',3);key.position.set(-3,4,5);scene.add(key);const rim=new T.DirectionalLight('#9674f2',2);rim.position.set(3,1,5);scene.add(rim);
let runtime,cards=[],labels=[],raf,last=0,disposed=false;
function layout(){
 if(!runtime||disposed)return;const width=stage.getBoundingClientRect().width,cols=width<470?1:width<800?2:5,rows=Math.ceil(5/cols),cellWidth=width/cols,cardHeight=Math.min(280,(cellWidth-26)*2/1.82),rowHeight=cardHeight+110,height=rows*rowHeight;
 if(stage.style.height!==height+'px')stage.style.height=height+'px';renderer.setSize(width,height,false);camera.left=-width/2;camera.right=width/2;camera.top=height/2;camera.bottom=-height/2;camera.updateProjectionMatrix();
 for(let i=0;i<cards.length;i++){const x=(i%cols+.5)*cellWidth,y=Math.floor(i/cols)*rowHeight+cardHeight/2+22;cards[i].group.position.set(x-width/2,height/2-y,0);cards[i].group.scale.setScalar(cardHeight/2);cards[i].group.rotation.set(0,side.value==='back'?Math.PI-.07:-.07,.01);labels[i].style.cssText=`left:${i%cols*cellWidth}px;top:${Math.floor(i/cols)*rowHeight+cardHeight+40}px;width:${cellWidth}px;--finish:${CARD_RARITIES[RARITY_KEYS[i]].color}`;}
}
function build(){
 for(const card of cards)card.dispose();for(const label of labels)label.remove();cards=[];labels=[];
 for(const rarity of RARITY_KEYS){const card=runtime.spawn('finish-'+rarity,profile.value,Number(owner.value),0,rarity);scene.add(card.group);cards.push(card);const info=CARD_RARITIES[rarity],caption=document.createElement('div');caption.className='finish-caption';caption.dataset.rarity=rarity;const title=document.createElement('b');title.textContent=info.mark+' · '+info.label;const detail=document.createElement('span');detail.textContent=info.motion;caption.append(title,detail);stage.append(caption);labels.push(caption);}layout();
}
function frame(now){if(disposed)return;raf=requestAnimationFrame(frame);if(document.hidden){last=now;return;}const dt=Math.min(.05,(now-(last||now))/1000);last=now;runtime?.frame(dt,motion.checked,()=>camera);renderer.render(scene,camera);}
try{runtime=await createCardRuntime(renderer);document.getElementById('studioLoading').hidden=true;motion.checked=!matchMedia('(prefers-reduced-motion:reduce)').matches;build();frame(0);}catch(error){document.getElementById('studioLoading').textContent='Die Karten konnten nicht geladen werden.';console.error(error);}
owner.onchange=()=>cards.forEach(c=>c.setOwner(Number(owner.value)));profile.onchange=build;side.onchange=layout;
const observer=new ResizeObserver(layout);observer.observe(stage);window.addEventListener('pagehide',e=>{if(!e.persisted){disposed=true;observer.disconnect();cancelAnimationFrame(raf);runtime?.dispose();renderer.dispose();}});
