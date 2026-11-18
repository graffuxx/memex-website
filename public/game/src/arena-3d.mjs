import * as T from '../vendor/three.module.min.js';
import {CELLS,ELEMENTS,cardOf,fieldAt} from './rules.mjs';
import {cardSVG,hex} from './art.mjs';
import {tileCenter,fitArenaCamera,projectHex} from './arena-projection.mjs';
import {createArenaWorld,ARENA_THEMES} from './arena-world.mjs?v=living-arenas-2';
const colors=['#74d7ef','#fa997d'],names=['Kobalt','Rost'];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function shape(radius){const s=new T.Shape();for(let i=0;i<6;i++){const a=(i*60-30)*Math.PI/180,x=Math.cos(a)*radius,y=Math.sin(a)*radius;i?s.lineTo(x,y):s.moveTo(x,y);}s.closePath();return s;}
function texture(svg,size=256,onReady=()=>{}){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;
 const img=new Image();img.onload=()=>{const ctx=canvas.getContext('2d');ctx.clearRect(0,0,size,size);ctx.drawImage(img,0,0,size,size);tex.needsUpdate=true;onReady();};img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);return tex;
}
function ring(radius,color,opacity=1){const mesh=new T.Mesh(new T.TorusGeometry(radius,.018,6,96),new T.MeshBasicMaterial({color,transparent:opacity<1,opacity}));mesh.rotation.x=Math.PI/2;return mesh;}
function stoneTexture(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#ddd4e1';ctx.fillRect(0,0,256,256);
 let n=731;const rnd=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
 for(let i=0;i<5000;i++){ctx.fillStyle=rnd()>.5?'#ffffff15':'#21142713';ctx.fillRect(rnd()*256,rnd()*256,1+rnd()*2,1+rnd()*2);}
 ctx.lineWidth=.7;for(let i=0;i<100;i++){const x=rnd()*256,y=rnd()*256;ctx.strokeStyle='#56435915';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+3+rnd()*16,y-2+rnd()*4);ctx.stroke();}
 ctx.strokeStyle='#55445f38';ctx.lineWidth=.9;for(const x of [18,186]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+7,20);ctx.lineTo(x-4,33);ctx.lineTo(x+9,48);ctx.stroke();}
 const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(.5,.5);tex.offset.set(.5,.5);return tex;
}
export function createArena3D(svg,{onViewChange=()=>{}}={}){
 const wrap=svg.parentElement,renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 renderer.domElement.className='arena-canvas';renderer.domElement.setAttribute('aria-hidden','true');wrap.prepend(renderer.domElement);svg.classList.add('arena-hit-overlay');svg.dataset.renderer='webgl';
 const scene=new T.Scene();scene.fog=new T.FogExp2('#142b35',.025);const camera=new T.PerspectiveCamera(36,1,.1,90),dynamic=new T.Group();scene.add(dynamic);
 const world=createArenaWorld(scene);
 scene.add(new T.HemisphereLight('#d7d9ff','#21182c',2.2));
 const key=new T.DirectionalLight('#ffe8c7',3.6);key.position.set(-5,12,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=key.shadow.camera.bottom=-7;key.shadow.camera.right=key.shadow.camera.top=7;key.shadow.camera.near=.1;key.shadow.camera.far=30;key.shadow.normalBias=.03;key.shadow.bias=-.0002;scene.add(key);
 const rim=new T.DirectionalLight('#9980ff',2.6);rim.position.set(4,5,-6);scene.add(rim);
 const floor=new T.Mesh(new T.PlaneGeometry(90,90),new T.MeshStandardMaterial({color:'#111323',roughness:.93,metalness:.12}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.1;floor.receiveShadow=true;scene.add(floor);
 const base=new T.Mesh(new T.CylinderGeometry(5.12,4.88,.45,6,1),new T.MeshStandardMaterial({color:'#252438',roughness:.58,metalness:.46}));base.rotation.y=Math.PI/6;base.position.y=-.75;base.castShadow=base.receiveShadow=true;scene.add(base);
 const lip=new T.Mesh(new T.CylinderGeometry(5.2,5.2,.08,6),new T.MeshStandardMaterial({color:'#9c805c',roughness:.45,metalness:.72}));lip.rotation.y=Math.PI/6;lip.position.y=-.5;scene.add(lip);
 const plate=new T.Mesh(new T.CylinderGeometry(5.14,5.14,.12,6),new T.MeshStandardMaterial({color:'#29283c',roughness:.75,metalness:.3}));plate.rotation.y=Math.PI/6;plate.position.y=-.4;plate.receiveShadow=true;scene.add(plate);
 for(const radius of [4.64,4.78]){const r=ring(radius,'#bd9872',.55);r.position.y=-.326;scene.add(r);}
 for(let i=0;i<18;i++){const a=i*Math.PI/9,mark=new T.Mesh(new T.BoxGeometry(.055,.012,.14),new T.MeshBasicMaterial({color:i%3===0?'#b5a1ed':'#746478'}));mark.position.set(Math.cos(a)*4.71,-.31,Math.sin(a)*4.71);mark.rotation.y=-a;scene.add(mark);}
 const outerGlow=ring(5.05,'#9c6bd6',.38);outerGlow.position.y=-1.05;scene.add(outerGlow);
 const crystals=[];
 for(const x of [-4.35,4.35]){
  const plinth=new T.Mesh(new T.CylinderGeometry(.28,.38,.6,5),new T.MeshStandardMaterial({color:'#343046',roughness:.65,metalness:.4}));plinth.position.set(x,-.1,-2.9);plinth.castShadow=true;scene.add(plinth);
  const crown=new T.Mesh(new T.CylinderGeometry(.31,.31,.07,5),new T.MeshStandardMaterial({color:'#c5a273',metalness:.8,roughness:.4}));crown.position.set(x,.23,-2.9);scene.add(crown);
  const crystal=new T.Mesh(new T.OctahedronGeometry(.22),new T.MeshStandardMaterial({color:'#c1a8ff',emissive:'#7440c0',emissiveIntensity:1.1,roughness:.24,metalness:.4}));crystal.position.set(x,.64,-2.9);crystal.scale.y=1.45;scene.add(crystal);crystals.push(crystal);
  const glow=new T.PointLight('#9d70ff',1.2,4);glow.position.copy(crystal.position);scene.add(glow);
 }
 const tileGeom=new T.ExtrudeGeometry(shape(.955),{depth:.23,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.025});tileGeom.rotateX(-Math.PI/2);
 const supportGeom=new T.CylinderGeometry(.88,.91,.34,6);
 const tileTop=new T.MeshStandardMaterial({color:'#73677d',map:stoneTexture(),roughness:.82,metalness:.12}),tileSide=new T.MeshStandardMaterial({color:'#292638',roughness:.67,metalness:.38});
 const trimGeom=new T.EdgesGeometry(new T.ExtrudeGeometry(shape(.958),{depth:.01,bevelEnabled:false}));trimGeom.rotateX(-Math.PI/2);
 const planeGeom=new T.PlaneGeometry(2.22,2.22),fieldGeom=new T.ShapeGeometry(shape(.9));fieldGeom.rotateX(-Math.PI/2);
 const blockGeom=new T.DodecahedronGeometry(.64,0),runeGeom=new T.TorusGeometry(.2,.018,5,6),blockMat=new T.MeshStandardMaterial({color:'#61576a',roughness:.72,metalness:.23,flatShading:true});
 const matCache=new Map(),cardTextures=new Map(),glyphTextures=new Map();
 const basic=(color,opacity=1)=>{const key=color+'/'+opacity;if(!matCache.has(key))matCache.set(key,new T.MeshBasicMaterial({color,transparent:opacity<1,opacity,depthWrite:opacity===1}));return matCache.get(key);};
 const line=color=>{const key='line'+color;if(!matCache.has(key))matCache.set(key,new T.LineBasicMaterial({color,transparent:true,opacity:.9}));return matCache.get(key);};
 function cardTexture(card,owner){const key=card.id+'/'+card.rotation+'/'+owner;if(!cardTextures.has(key))cardTextures.set(key,texture(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="-62 -62 124 124">${cardSVG(card,{owner})}</svg>`,256,()=>{needsRender=true;}));return cardTextures.get(key);}
 function glyph(element){if(!glyphTextures.has(element)){const e=ELEMENTS[element];glyphTextures.set(element,texture(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100"><circle r="32" fill="none" stroke="${e.color}" opacity=".5" stroke-width="1"/><text y="3" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="42" fill="${e.color}">${e.symbol}</text></svg>`,128,()=>{needsRender=true;}));}return glyphTextures.get(element);}
 let state=null,ui=null,width=620,height=500,mix=0,targetMix=0,lastTime=0,dirty=true,needsRender=true,theme='grove',motion=true,previousAction=null;
 function setTheme(id){theme=ARENA_THEMES[id]?id:'grove';const p=ARENA_THEMES[theme];world.setTheme(theme);scene.fog.color.set(p.fog);floor.material.color.set(p.floor);base.material.color.set(p.side);plate.material.color.set(p.side);tileTop.color.set(p.stone);tileSide.color.set(p.side);lip.material.color.set(p.trim);rim.color.set(p.rim);outerGlow.material.color.set(p.accent);wrap.dataset.arena=theme;needsRender=true;}
 setTheme(theme);
 const transient=[];
 function materialFor(map,opacity=1){const m=new T.MeshBasicMaterial({map,transparent:true,opacity,depthWrite:false,side:T.DoubleSide});transient.push(m);return m;}
 function update(game,selection){
  // Selection, rotation and theme changes are not new moves; never replay their effects.
  const signature=JSON.stringify([game.seed,game.placements,game.block,game.last]);
  const newAction=previousAction!==null&&signature!==previousAction&&game.last!==null;
  previousAction=signature;if(newAction&&motion)world.react(game.last);world.setTurn(game.turn);
  state=game;ui=selection;dynamic.clear();needsRender=true;renderer.shadowMap.needsUpdate=true;for(const m of transient)m.dispose();transient.length=0;
  for(const cell of CELLS){const c=tileCenter(cell),held=game.board[cell.id],field=fieldAt(game,cell.id),selected=selection.target===cell.id,possible=selection.targets.includes(cell.id),tile=new T.Mesh(tileGeom,[tileTop,tileSide]);tile.position.set(c.x,0,c.z);tile.castShadow=tile.receiveShadow=true;dynamic.add(tile);const support=new T.Mesh(supportGeom,tileSide);support.position.set(c.x,-.17,c.z);support.rotation.y=Math.PI/6;support.castShadow=support.receiveShadow=true;dynamic.add(support);
   const outline=new T.LineSegments(trimGeom,line(selected?'#f1d6a0':possible?'#e7c68a':held?colors[held.controller]:field?ELEMENTS[field.element].color:'#6a617e'));outline.position.set(c.x,.265,c.z);dynamic.add(outline);
   if(field){const halo=new T.Mesh(fieldGeom,basic(ELEMENTS[field.element].color,held?.controller!==undefined ? .12 : .18));halo.position.set(c.x,.275,c.z);dynamic.add(halo);
    if(!held){const symbol=new T.Mesh(planeGeom,materialFor(glyph(field.element),.75));symbol.rotation.x=-Math.PI/2;symbol.scale.setScalar(.67);symbol.position.set(c.x,.285,c.z);symbol.userData.resonance=true;dynamic.add(symbol);}
   }
   if(selected||possible){const light=new T.Mesh(fieldGeom,basic(selected?'#e2c58f':'#d0a7fc',selected ? .23 : .13));light.position.set(c.x,.28,c.z);dynamic.add(light);}
   if(game.block===cell.id){const rock=new T.Mesh(blockGeom,blockMat);rock.position.set(c.x,.67,c.z);rock.scale.set(.88,1.08,.85);rock.rotation.set(.1,.27,.14);rock.castShadow=true;dynamic.add(rock);
    const rune=new T.Mesh(runeGeom,basic('#c4a0ff'));rune.rotation.x=-Math.PI/2;rune.position.set(c.x,.985,c.z);dynamic.add(rune);
   }
   const incoming=selection.plan?.cell===cell.id?selection.plan.card:null,shown=held??incoming;
   if(shown){const card=new T.Mesh(planeGeom,materialFor(cardTexture(shown,shown.controller),held?1:.65));card.rotation.x=-Math.PI/2;card.scale.setScalar(.95);card.position.set(c.x,.32,c.z);dynamic.add(card);
    const justPlaced=motion&&newAction&&game.last?.type==='place'&&game.last.cell===cell.id,justFlipped=motion&&newAction&&game.last?.type==='place'&&game.last.flips.includes(cell.id);
    if(justPlaced||justFlipped){card.userData.motion={kind:justPlaced?'place':'flip',start:performance.now()};}
   }
  }
  dirty=true;drawOverlay();
 }
 function drawOverlay(){if(!state||!ui)return;svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  svg.innerHTML=CELLS.map(cell=>{const held=state.board[cell.id],field=fieldAt(state,cell.id),blocked=state.block===cell.id,pts=projectHex(camera,cell,width,height),points=pts.map(p=>p.x+','+p.y).join(' '),center=pts.reduce((p,q)=>({x:p.x+q.x/6,y:p.y+q.y/6}),{x:0,y:0});
   const label=blocked?'Blockade':held?cardOf(held).name+', '+names[held.controller]:'Freies Feld '+cell.id,fieldLabel=field?', '+ELEMENTS[field.element].name+'-Feld plus '+field.bonus:'',flips=ui.plan?.flips.includes(cell.id),highlight=ui.target===cell.id||ui.targets.includes(cell.id);
   return `<g role="button" tabindex="0" class="cell hit-cell ${highlight?'targeted':''}" data-cell="${cell.id}" aria-label="${escape(label+fieldLabel)}"><title>${escape(label+fieldLabel)}</title><polygon class="hit-area" points="${points}" fill="transparent"/>${flips?`<polygon points="${points}" fill="${colors[state.turn]}22" stroke="${colors[state.turn]}" stroke-width="2" stroke-dasharray="5 3" pointer-events="none"/><text x="${center.x}" y="${Math.min(...pts.map(p=>p.y))-5}" text-anchor="middle" fill="#c9f9df" font-size="10" pointer-events="none">ÜBERNAHME</text>`:''}${field?`<text class="field-label" x="${center.x}" y="${Math.max(...pts.map(p=>p.y))-3}" text-anchor="middle" fill="${ELEMENTS[field.element].color}" font-size="9" pointer-events="none">${ELEMENTS[field.element].symbol} +${field.bonus}</text>`:''}</g>`;
  }).join('');dirty=false;
 }
 function resize(){const r=wrap.getBoundingClientRect();if(!r.width||!r.height)return;width=r.width;height=r.height;renderer.setSize(width,height,false);fitArenaCamera(camera,width,height,mix);dirty=true;needsRender=true;drawOverlay();}
 const observer=new ResizeObserver(resize);observer.observe(wrap);resize();
 let raf;
 function frame(now){raf=requestAnimationFrame(frame);if(document.hidden)return;const dt=Math.min(.05,(now-(lastTime||now))/1000);lastTime=now;
  if(!motion&&!needsRender&&Math.abs(targetMix-mix)<=.0005)return;
  if(Math.abs(targetMix-mix)>.0005){mix=motion?mix+(targetMix-mix)*Math.min(1,dt*8):targetMix;fitArenaCamera(camera,width,height,mix);dirty=true;}
  if(dirty)drawOverlay();world.frame(now,dt,motion);rim.intensity=2.2+world.flash*1.2;
  for(const crystal of crystals){crystal.rotation.y=motion?now*.0003:0;crystal.position.y=.64+(motion?Math.sin(now*.0015+crystal.position.x)*.04:0);}
  for(const obj of dynamic.children){if(obj.userData.resonance)obj.material.opacity=motion?.68+Math.sin(now*.0018+obj.position.x)*.12:.75;const m=obj.userData.motion;if(!m)continue;const t=motion?Math.min(1,(now-m.start)/550):1;if(m.kind==='place'){obj.position.y=.32+(1-t)**3*.7;}else{obj.rotation.z=Math.sin(t*Math.PI)*.1;obj.scale.x=.95*(.3+.7*Math.abs(Math.cos(t*Math.PI)));}if(t===1){obj.rotation.z=0;obj.scale.x=.95;delete obj.userData.motion;}}
  renderer.render(scene,camera);needsRender=false;
 }
 raf=requestAnimationFrame(frame);
 return {update,setTheme,setMotion(enabled){motion=Boolean(enabled);needsRender=true;},toggleView(){targetMix=targetMix>.5?0:1;onViewChange(targetMix>.5);},get overhead(){return targetMix>.5;},dispose(){cancelAnimationFrame(raf);observer.disconnect();world.dispose();renderer.dispose();renderer.domElement.remove();for(const m of transient)m.dispose();for(const t of [...cardTextures.values(),...glyphTextures.values()])t.dispose();}};
}
