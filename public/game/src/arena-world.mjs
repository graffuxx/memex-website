import * as T from '../vendor/three.module.min.js';

export const ARENA_THEMES={
 grove:{name:'Der Resonanzhain',short:'Hain',fog:'#142b35',floor:'#142631',stone:'#819092',side:'#303c49',trim:'#b8a17a',rim:'#7fd4d3',accent:'#7fe3ca'},
 rift:{name:'Die Glutkluft',short:'Kluft',fog:'#251e2d',floor:'#251c29',stone:'#8a7b86',side:'#3e303d',trim:'#c19a70',rim:'#f4a070',accent:'#ffb165'}
};

// Scenery lives outside the playing surface. No decorative object participates in rules or input.
export function createArenaWorld(scene,{ownershipColors=['#74d7ef','#fa997d']}={}){
 const root=new T.Group(),grove=new T.Group(),rift=new T.Group(),shared=new T.Group();
 root.add(shared,grove,rift);scene.add(root);
 const geometries=new Set(),materials=new Set(),textures=new Set(),ripples=[],flames=[],effects=[];
 const geo=g=>(geometries.add(g),g),mat=m=>(materials.add(m),m);
 const stone=mat(new T.MeshStandardMaterial({color:'#3a555c',roughness:.9}));
 const edge=mat(new T.MeshStandardMaterial({color:'#b5a07e',roughness:.52,metalness:.35}));
 const bark=mat(new T.MeshStandardMaterial({color:'#69515d',roughness:.94}));
 const leafMat=mat(new T.MeshStandardMaterial({color:'#7aaca0',roughness:.95}));
 const rockMat=mat(new T.MeshStandardMaterial({color:'#434252',roughness:.94,flatShading:true}));
 const warm=mat(new T.MeshBasicMaterial({color:'#ffe4a6'}));
 const metal=mat(new T.MeshStandardMaterial({color:'#474251',roughness:.7,metalness:.45}));
 const orbMat=mat(new T.MeshStandardMaterial({color:'#cefff0',emissive:'#60ccb8',emissiveIntensity:1.1,roughness:.25,metalness:.2}));
 const sphere=geo(new T.SphereGeometry(1,14,10)),rock=geo(new T.DodecahedronGeometry(1,0));
 let seed=6303;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const mesh=(geometry,material,parent=shared,x=0,y=0,z=0,sx=1,sy=sx,sz=sx)=>{const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=m.receiveShadow=true;parent.add(m);return m;};
 const tube=(points,radius,material,parent=shared)=>mesh(geo(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),28,radius,7,false)),material,parent);
 function ring(radius,width,color,opacity=1,parent=shared){
  const m=mesh(geo(new T.RingGeometry(radius-width,radius,80)),mat(new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,side:T.DoubleSide})),parent);m.rotation.x=-Math.PI/2;m.castShadow=m.receiveShadow=false;return m;
 }
 function batch(geometry,material,items,parent){
  const m=new T.InstancedMesh(geometry,material,items.length),dummy=new T.Object3D();
  for(let i=0;i<items.length;i++){const d=items[i];dummy.position.set(...d.p);dummy.rotation.set(...(d.r??[0,0,0]));dummy.scale.set(...d.s);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);if(d.color)m.setColorAt(i,new T.Color(d.color));}
  m.castShadow=m.receiveShadow=true;parent.add(m);return m;
 }

 // A basin gives the board a physical setting, with a shore rather than an empty black void.
 const basin=ring(8.9,3.85,'#234d60',.8);basin.position.y=-1.025;
 const waterCanvas=document.createElement('canvas');waterCanvas.width=waterCanvas.height=256;
 const ctx=waterCanvas.getContext('2d');ctx.fillStyle='#1c6371';ctx.fillRect(0,0,256,256);
 for(let i=0;i<32;i++){ctx.strokeStyle=i%3?'#8de7d41c':'#b4f5df40';ctx.lineWidth=i%3?1:2;ctx.beginPath();for(let x=0;x<=256;x+=4){const y=i*9+Math.sin(x*.035+i)*3;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
 const waterMap=new T.CanvasTexture(waterCanvas);textures.add(waterMap);waterMap.wrapS=waterMap.wrapT=T.RepeatWrapping;waterMap.repeat.set(5,5);waterMap.colorSpace=T.SRGBColorSpace;
 const water=mesh(geo(new T.RingGeometry(5.2,8.8,100)),mat(new T.MeshStandardMaterial({map:waterMap,color:'#549ca8',roughness:.3,metalness:.36,transparent:true,opacity:.8,side:T.DoubleSide})),grove);water.rotation.x=-Math.PI/2;water.position.y=-1.0;water.castShadow=false;
 const lavaCanvas=document.createElement('canvas');lavaCanvas.width=lavaCanvas.height=256;
 const lc=lavaCanvas.getContext('2d'),pixels=lc.createImageData(256,256),sites=[];
 for(let y=0;y<6;y++)for(let x=0;x<6;x++)sites.push([(x+rand()*.65)*256/6,(y+rand()*.65)*256/6]);
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){
  let first=1e9,second=1e9;
  for(const p of sites){const dx=Math.min(Math.abs(x-p[0]),256-Math.abs(x-p[0])),dy=Math.min(Math.abs(y-p[1]),256-Math.abs(y-p[1])),d=dx*dx+dy*dy;if(d<first){second=first;first=d;}else if(d<second)second=d;}
  const crack=Math.exp(-(Math.sqrt(second)-Math.sqrt(first))*.85),noise=rand()*9,i=(y*256+x)*4;
  pixels.data[i]=38+crack*210+noise;pixels.data[i+1]=20+crack*112+noise*.4;pixels.data[i+2]=29+crack*15;pixels.data[i+3]=255;
 }
 lc.putImageData(pixels,0,0);const lavaMap=new T.CanvasTexture(lavaCanvas);textures.add(lavaMap);lavaMap.wrapS=lavaMap.wrapT=T.RepeatWrapping;lavaMap.repeat.set(2.8,2.8);lavaMap.colorSpace=T.SRGBColorSpace;
 const lava=mesh(geo(new T.RingGeometry(5.2,8.8,100)),mat(new T.MeshStandardMaterial({map:lavaMap,color:'#edc4ad',emissiveMap:lavaMap,emissive:'#f47d36',emissiveIntensity:1,roughness:.8,side:T.DoubleSide})),rift);lava.rotation.x=-Math.PI/2;lava.position.y=-1.0;lava.castShadow=false;

 const shore=[],moss=[],basalt=[];
 for(let i=0;i<56;i++){
  const a=i/56*Math.PI*2,r=7.5+rand()*.95,x=Math.cos(a)*r,z=Math.sin(a)*r;
  shore.push({p:[x,-.92,z],s:[.5+rand()*.7,.22+rand()*.4,.55+rand()*.5],r:[rand()*.2,rand()*5,rand()*.3],color:i%3?'#405d62':'#56777a'});
  if(i%2===0)moss.push({p:[x,-.53,z],s:[.65,.15,.6],color:i%3?'#4f8270':'#76a18b'});
  basalt.push({p:[x,-.65,z],s:[.45+rand()*.4,.45+rand()*.6,.5+rand()*.4],r:[rand()*.3,rand()*5,rand()*.3],color:i%3?'#45404e':'#655362'});
 }
 batch(rock,stone,shore,grove);batch(sphere,leafMat,moss,grove);batch(rock,rockMat,basalt,rift);

 // Hand-shaped boughs and soft clustered crowns, not stacks of cubes.
 const crowns=[];
 for(const [x,z,h,sign] of [[-6.7,-2.7,2.6,1],[6.8,-3.1,2.3,-1],[-7.8,2.3,1.3,1]]){
  const tree=new T.Group();tree.position.set(x,-.7,z);grove.add(tree);
  tube([[0,0,0],[-sign*.22,.9,.05],[sign*.08,h*.7,-.1],[sign*.6,h,.1]],.23,bark,tree);
  for(const s of [-1,1]){
   tube([[0,h*.4,0],[s*.55,h*.7,.1],[s*1.0,h*.86,-.1]],.11,bark,tree);
   tube([[0,.1,0],[s*.45,-.05,.25],[s*.9,-.15,.45]],.1,bark,tree);
  }
  for(let i=0;i<13;i++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*1.1;crowns.push({p:[x+Math.cos(a)*r,-.7+h+rand()*.6,z+Math.sin(a)*r*.75],s:[.65+rand()*.35,.32+rand()*.2,.58+rand()*.4],r:[rand()*.25,rand()*5,0],color:i%5===0?'#d0a3bb':i%3===0?'#88b8ad':'#4b8d88'});}
 }
 const canopy=batch(sphere,leafMat,crowns,grove);canopy.castShadow=true;
 // Tall fractured minerals replace the trees in the second setting.
 const shards=[];
 for(const [x,z] of [[-6.7,-2.7],[6.8,-3.1],[-7.8,2.3]])for(let i=0;i<6;i++)shards.push({p:[x+(rand()-.5)*1.3,-.2,z+(rand()-.5)*1.1],s:[.3+rand()*.35,.7+rand()*1.5,.35+rand()*.3],r:[rand()*.25,rand()*5,(rand()-.5)*.3],color:i%3?'#55485d':'#977182'});
 batch(geo(new T.ConeGeometry(1,2,5)),rockMat,shards,rift);
 for(const [x,z] of [[-6.5,-2.5],[6.7,-2.8]]){const r=ring(.8,.07,'#ffac6c',.7,rift);r.position.set(x,-.78,z);}

 // Broken sanctuary behind the board; nothing tall is placed in front of a card.
 const arch=new T.Group();arch.position.set(0,-.65,-6.6);arch.scale.set(.88,.68,.8);shared.add(arch);
 mesh(geo(new T.CylinderGeometry(2.0,2.25,.3,8)),stone,arch,0,0,0);
 tube([[-1.55,.15,0],[-1.5,1.5,0],[-.9,2.3,0],[0,2.65,0],[.95,2.22,0],[1.5,1.4,0],[1.55,.15,0]],.19,stone,arch);
 tube([[-1.34,.4,.04],[-1.3,1.5,.04],[-.6,2.18,.04],[0,2.35,.04],[.7,2.08,.04],[1.3,1.45,.04],[1.34,.4,.04]],.035,edge,arch);
 for(const x of [-1.5,1.5]){mesh(geo(new T.CylinderGeometry(.32,.4,.2,6)),edge,arch,x,.22,0);mesh(geo(new T.CylinderGeometry(.3,.3,.15,6)),edge,arch,x,1.1,0);}
 const suspended=mesh(geo(new T.OctahedronGeometry(.3)),orbMat,arch,0,1.7,0);suspended.scale.y=1.5;
 const halo=ring(.57,.025,'#9cebdc',.75,arch);halo.rotation.x=0;halo.position.set(0,1.7,0);

 // Lantern piers frame both players. Waterfalls descend beyond the hex platform.
 const lanterns=[];
 for(const sign of [-1,1]){
  const g=new T.Group();g.position.set(sign*6.0,-.75,2.05);shared.add(g);
  mesh(geo(new T.CylinderGeometry(.65,.85,.3,8)),stone,g,0,0,0);
  mesh(geo(new T.CylinderGeometry(.12,.2,1.0,8)),metal,g,0,.6,0);
  mesh(geo(new T.CylinderGeometry(.35,.3,.12,6)),edge,g,0,1.15,0);
  const glass=mesh(geo(new T.SphereGeometry(.21,12,8)),mat(warm.clone()),g,0,1.4,0);glass.scale.y=1.3;lanterns.push(glass);
  mesh(geo(new T.ConeGeometry(.4,.25,6)),metal,g,0,1.72,0);
  for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])mesh(geo(new T.CylinderGeometry(.025,.025,.42,5)),metal,g,Math.cos(a)*.22,1.4,Math.sin(a)*.22);
  mesh(geo(new T.PlaneGeometry(.5,1.15,1,8)),mat(new T.MeshBasicMaterial({color:'#a3f1e4',map:waterMap,transparent:true,opacity:.3,side:T.DoubleSide,depthWrite:false})),grove,sign*5.65,-.55,.85);
  const splash=ring(.48,.025,'#b1f7ed',.3,grove);splash.position.set(sign*5.65,-.97,.85);ripples.push(splash);
  const fire=mesh(geo(new T.SphereGeometry(.28,10,8)),mat(new T.MeshBasicMaterial({color:'#ffba73',transparent:true,opacity:.8,depthWrite:false})),rift,sign*6,.75,2.05,.6,1.9,.6);flames.push(fire);
 }

 // Sparse shoreline flowers and reeds add scale. All instances share their geometry/material.
 const reeds=[],flowers=[];
 for(let i=0;i<65;i++){
  const a=rand()*Math.PI*2,r=6.7+rand()*1.7,x=Math.cos(a)*r,z=Math.sin(a)*r;
  reeds.push({p:[x,-.55,z],s:[.035,.2+rand()*.25,.035],r:[(rand()-.5)*.4,0,(rand()-.5)*.4],color:i%3?'#79a691':'#bfd1a0'});
  if(i%3===0)flowers.push({p:[x,-.27,z],s:[.09,.055,.09],color:i%2?'#e9acc4':'#d6deb5'});
 }
 batch(geo(new T.ConeGeometry(1,2,5)),leafMat,reeds,grove);batch(sphere,leafMat,flowers,grove);

 const spriteCanvas=document.createElement('canvas');spriteCanvas.width=spriteCanvas.height=32;
 const sc=spriteCanvas.getContext('2d'),gradient=sc.createRadialGradient(16,16,0,16,16,16);gradient.addColorStop(0,'#fff');gradient.addColorStop(.22,'#ffffffe0');gradient.addColorStop(1,'#ffffff00');sc.fillStyle=gradient;sc.fillRect(0,0,32,32);
 const spriteMap=new T.CanvasTexture(spriteCanvas);textures.add(spriteMap);
 const particlePositions=new Float32Array(46*3),particleSeeds=[];
 for(let i=0;i<46;i++){const a=rand()*Math.PI*2;particleSeeds.push({a,r:5.5+rand()*3,h:rand()*2.5,s:.1+rand()*.25});}
 const particleGeo=geo(new T.BufferGeometry());particleGeo.setAttribute('position',new T.BufferAttribute(particlePositions,3));
 const particleMat=mat(new T.PointsMaterial({color:'#c1f5d9',size:.1,map:spriteMap,transparent:true,opacity:.7,depthWrite:false,blending:T.AdditiveBlending}));
 const particles=new T.Points(particleGeo,particleMat);root.add(particles);particles.frustumCulled=false;

 // An original little arena wisp follows the match, reacting to captures rather than taking turns.
 const keeper=new T.Group();keeper.position.set(5.85,.05,.35);shared.add(keeper);
 const keeperBody=mesh(sphere,orbMat,keeper,0,0,0,.28,.34,.28);keeperBody.castShadow=false;
 const tail=tube([[0,-.17,0],[.1,-.4,0],[.3,-.5,0]],.075,orbMat,keeper);tail.castShadow=false;
 const eyeMat=mat(new T.MeshBasicMaterial({color:'#203546'}));
 for(const x of [-.085,.085])mesh(sphere,eyeMat,keeper,x,.04,.25,.03,.055,.025);
 const wings=[];for(const s of [-1,1]){const wing=mesh(sphere,orbMat,keeper,s*.33,.01,-.03,.19,.07,.12);wing.rotation.z=s*.4;wings.push(wing);}

 const runes=[];
 for(let i=0;i<18;i++){const a=i*Math.PI/9,r=4.85,g=new T.Group();g.position.set(Math.cos(a)*r,-.23,Math.sin(a)*r);g.rotation.y=-a;shared.add(g);
  const base=mesh(geo(new T.CylinderGeometry(.09,.12,.06,6)),edge,g);base.castShadow=false;
  const inset=mesh(geo(new T.BoxGeometry(.028,.012,.12)),mat(new T.MeshBasicMaterial({color:'#78bfb3',transparent:true,opacity:.45})),g,0,.038,0);inset.castShadow=false;runes.push(inset);
 }
 const victoryRing=ring(5.25,.035,'#d9bf8c',.16);victoryRing.position.y=-.22;
 let theme='grove',turn=0,reaction=0,eventFlash=0,lastNow=0;
 const sharedRingGeo=geo(new T.RingGeometry(.86,.91,56)),sparkGeo=geo(new T.SphereGeometry(.045,6,4));
 function release(effect){root.remove(effect.group);for(const g of effect.ownedGeometries??[])g.dispose();for(const m of effect.ownedMaterials)m.dispose();}
 function react(action){
  if(!action)return;reaction=1;if(action.event!=null)eventFlash=1;
  const color=ownershipColors[action.side]??'#d9bb83',g=new T.Group(),ownedMaterials=[],ownedGeometries=[];
  const makeMat=(opacity=1)=>{const m=new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,side:T.DoubleSide});ownedMaterials.push(m);return m;};
  const center=id=>{const [q,r]=id.split(',').map(Number);return new T.Vector3(Math.sqrt(3)*(q+r/2),.37,1.5*r);};
  const origin=center(action.cell??action.to),impact=new T.Mesh(sharedRingGeo,makeMat(.9));impact.rotation.x=-Math.PI/2;impact.position.copy(origin);g.add(impact);
  const sparks=[];for(let i=0;i<12;i++){const p=new T.Mesh(sparkGeo,makeMat(.8));p.position.copy(origin);p.userData.angle=i*Math.PI/6;sparks.push(p);g.add(p);}
  const arcs=[];for(const id of action.flips??[]){const dest=center(id),mid=origin.clone().lerp(dest,.5);mid.y=1.25;const path=new T.QuadraticBezierCurve3(origin,mid,dest),geometry=new T.TubeGeometry(path,24,.025,5,false);ownedGeometries.push(geometry);const arc=new T.Mesh(geometry,makeMat(.85));g.add(arc);arcs.push(arc);}
  root.add(g);effects.push({group:g,start:lastNow||performance.now(),origin,impact,sparks,arcs,ownedMaterials,ownedGeometries});
  while(effects.length>4)release(effects.shift());
 }
 function frame(now,dt,animated){
  lastNow=now;const t=animated?now*.001:0;
  waterMap.offset.set((t*.012)%1,(t*.02)%1);lavaMap.offset.set((t*.003)%1,(t*.004)%1);lava.material.emissiveIntensity=.85+Math.sin(t*.7)*.15;
  suspended.rotation.y=t*.5;suspended.position.y=1.7+Math.sin(t*1.3)*.08;halo.rotation.z=t*.13;
  for(let i=0;i<ripples.length;i++){const s=1+(t*.65+i*.5)%1;ripples[i].scale.setScalar(s);ripples[i].material.opacity=animated?.3*(2-s):.16;}
  for(let i=0;i<flames.length;i++){flames[i].scale.y=1.8+Math.sin(t*6+i)*.2;}
  reaction=Math.max(0,reaction-dt*1.1);eventFlash=Math.max(0,eventFlash-dt*.5);
  keeper.position.y=.05+Math.sin(t*2)*.1+(animated?reaction*.25:0);keeper.rotation.z=animated?Math.sin(t*1.3)*.08:0;
  for(let i=0;i<2;i++)wings[i].rotation.z=(i?1:-1)*(.4+Math.sin(t*7)*.2);
  const blink=animated&&Math.sin(t*.9)>.994?.15:1;for(const m of keeper.children)if(m.material===eyeMat)m.scale.y=.055*blink;
  orbMat.emissiveIntensity=1+reaction*.8;victoryRing.material.opacity=.1+(animated?eventFlash*.4:0);for(let i=0;i<runes.length;i++){runes[i].material.color.set(ownershipColors[turn]);runes[i].material.opacity=.25+(animated?Math.max(0,Math.sin(t*1.7-i*.45))*.22+eventFlash*.3:0);}particleMat.color.set(theme==='grove'?'#b4efce':'#ffba7f');
  for(let i=0;i<particleSeeds.length;i++){const p=particleSeeds[i],a=p.a+t*p.s*.08;particlePositions[i*3]=Math.cos(a)*p.r;particlePositions[i*3+1]=p.h+(theme==='rift'?(t*p.s)%1.5:Math.sin(t*p.s+i)*.3);particlePositions[i*3+2]=Math.sin(a)*p.r;}
  particleGeo.attributes.position.needsUpdate=true;particles.visible=animated;
  for(let i=effects.length-1;i>=0;i--){const e=effects[i],p=Math.min(1,(now-e.start)/850);if(!animated||p>=1){release(e);effects.splice(i,1);continue;}
   e.impact.scale.setScalar(1+p*.7);e.impact.material.opacity=(1-p)*.8;
   for(const s of e.sparks){const a=s.userData.angle;s.position.set(e.origin.x+Math.cos(a)*p*.9,e.origin.y+Math.sin(p*Math.PI)*.55,e.origin.z+Math.sin(a)*p*.9);s.material.opacity=1-p;}
   for(const a of e.arcs)a.material.opacity=Math.sin(p*Math.PI)*.85;
  }
 }
 function setTheme(id){theme=ARENA_THEMES[id]?id:'grove';grove.visible=theme==='grove';rift.visible=theme==='rift';basin.material.color.set(theme==='grove'?'#234d60':'#6d3635');stone.color.set(theme==='grove'?'#4d666a':'#635363');orbMat.color.set(theme==='grove'?'#cefff0':'#ffdfb9');orbMat.emissive.set(theme==='grove'?'#60ccb8':'#db6632');}
 function setTurn(side){turn=side;for(let i=0;i<lanterns.length;i++){const s=i===turn?1.25:.85;lanterns[i].scale.set(s,s*1.3,s);lanterns[i].material.color.set(i===turn?ownershipColors[i]:'#b3a997');}}
 setTheme('grove');
 return {setTheme,setTurn,react,frame,setVisible(v){root.visible=Boolean(v);},get flash(){return eventFlash;},dispose(){for(const e of effects)release(e);for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();scene.remove(root);}};
}
