import {arenaCameraPose78} from './arena-navigation78.mjs?v=void-storm-79';
import {createVoidNebula78} from './void-nebula78.mjs?v=venom-weather';
import * as T from '../vendor/three.module.min.js';
import {CELLS} from './rules.mjs';
import {tileCenter} from './arena-projection.mjs';
import {cardPoints} from './card-prototype.mjs';
import {createGlowPipeline} from './voidforge-post77.mjs?v=void-effects-78';
import {createAtmosphere} from './voidforge-atmosphere77.mjs?v=void-effects-78';
import {createRockIsland} from './voidforge-platform77.mjs';

// Approved v76 geometry and materials. Game cards and hit targets remain in the table view.
export async function createVoidforge77(renderer){
 const scene=new T.Scene();
scene.fog=new T.FogExp2('#080919',.012);
scene.add(new T.HemisphereLight('#c6cddd','#292334',1.8));const key=new T.DirectionalLight('#eee7df',3.5);key.position.set(-5,13,7);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:35});key.shadow.bias=-.0005;key.shadow.normalBias=.035;key.shadow.radius=3;scene.add(key);
const rimLight=new T.DirectionalLight('#7a55a9',1.1);rimLight.position.set(5,7,-7);scene.add(rimLight);const warmLight=new T.PointLight('#ff842e',28,18,2);warmLight.position.set(0,-1.1,6.3);scene.add(warmLight);
const loadTexture=async url=>{const t=await new T.TextureLoader().loadAsync(url);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;};
const [slabMap,cliffMap,crystalMap,cutMap]=await Promise.all(['slab-painted.webp','cliff-painted.webp','crystal-painted.webp','fracture-face.webp'].map(n=>loadTexture(new URL('../assets/arenas/voidforge-v77/'+n,import.meta.url).href)));
const blankMap=new T.DataTexture(new Uint8Array([175,182,200,255]),1,1);blankMap.colorSpace=T.SRGBColorSpace;blankMap.needsUpdate=true;
const texturedMaterials=[];function registerMaterial(m){texturedMaterials.push({m,map:m.map,bumpMap:m.bumpMap,emissiveMap:m.emissiveMap});return m;}
const crystalTime={value:0},effectAmount={value:1};
const sideStone=registerMaterial(new T.MeshStandardMaterial({map:cliffMap,bumpMap:cliffMap,bumpScale:.055,color:'#d5d2e3',emissiveMap:cliffMap,emissive:'#8487b3',emissiveIntensity:.24,roughness:.9,metalness:.02,side:T.DoubleSide}));
let seed=681;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const mesh=(geometry,material,parent=scene)=>{const m=new T.Mesh(geometry,material);m.castShadow=m.receiveShadow=true;parent.add(m);return m;};
const root=new T.Group();root.name='Voidforge / continuous sculpted pedestal';scene.add(root);
function baseShape(radius){const s=new T.Shape(),points=[];for(let i=0;i<96;i++){const a=i/96*Math.PI*2;const sector=((a+Math.PI/6)%(Math.PI/3))-Math.PI/6;const r=radius*Math.cos(Math.PI/6)/Math.cos(sector);const jag=1+.014*Math.sin(i*1.7)+.011*Math.cos(i*3.3);points.push([Math.cos(a)*r*jag,Math.sin(a)*r*jag]);}points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;}
const cutStone=registerMaterial(new T.MeshStandardMaterial({map:cutMap,bumpMap:cutMap,bumpScale:.035,color:'#bfc5d9',emissiveMap:cutMap,emissive:'#7884b0',emissiveIntensity:.13,roughness:.93,metalness:.02}));
const slabStone=registerMaterial(new T.MeshStandardMaterial({map:cutMap,bumpMap:cutMap,bumpScale:.025,color:'#9ea9cd',emissiveMap:cutMap,emissive:'#687db6',emissiveIntensity:.16,roughness:.89,metalness:.02}));
const coreStone=registerMaterial(sideStone.clone());coreStone.color.set('#7886a1');coreStone.emissiveIntensity=.07;
const island=createRockIsland({topMaterial:slabStone,plateMaterial:slabStone,cliffMaterial:sideStone,coreMaterial:coreStone,fractureMaterial:cutStone,heatTime:crystalTime,effects:effectAmount});root.add(island.root);

const noise=`float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}float fbm(vec2 p){return noise(p)*.6+noise(p*2.1)*.27+noise(p*4.3)*.13;}`;
const lavaMaterial=new T.ShaderMaterial({toneMapped:false,side:T.DoubleSide,uniforms:{uTime:{value:0},uActive:effectAmount,uCenters:{value:CELLS.map(c=>{const p=tileCenter(c);return new T.Vector2(p.x,p.z);})}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 p;uniform float uTime,uActive;uniform vec2 uCenters[19];${noise}void main(){float boundary=100.;for(int i=0;i<19;i++){vec2 q=p.xz-uCenters[i];float h=max(abs(q.x),max(abs(.5*q.x+.8660254*q.y),abs(.5*q.x-.8660254*q.y)))-.872;boundary=min(boundary,h);}if(boundary>0.)discard;vec2 flow=vec2(fbm(p.xz*.9+uTime*.008),fbm(p.xz*.7-uTime*.006));float n=fbm(p.xz*2.6+flow*1.2+vec2(uTime*.009,-uTime*.006));float hot=.36+.44*smoothstep(.25,.73,n);float breath=.95+.05*sin(uTime*.45+p.x*.17+p.z*.13);float core=exp(-length(p.xz)*.22);vec3 c=mix(vec3(.11,.003,.001),vec3(2.25,.24,.012),hot*breath);gl_FragColor=vec4(mix(vec3(.025,.018,.035),c*(.44+core*.52),uActive),1.);}`});
const moltenGeometry=new T.ShapeGeometry(baseShape(5.35));moltenGeometry.rotateX(-Math.PI/2);const molten=mesh(moltenGeometry,lavaMaterial,root);molten.position.y=.145;molten.castShadow=molten.receiveShadow=false;
const tiles=new Map(),tileGeometries=[];
for(const [index,c]of CELLS.entries()){
 const shape=new T.Shape();cardPoints(.88).forEach(([x,y],i)=>{const r=1-.007*Math.sin(index*8.1+i*2.3);i?shape.lineTo(x*r,y*r):shape.moveTo(x*r,y*r);});shape.closePath();
 const g=new T.ExtrudeGeometry(shape,{depth:.17,bevelEnabled:true,bevelSegments:5,bevelSize:.035,bevelThickness:.023,steps:1});g.rotateX(-Math.PI/2);const p=tileCenter(c),v=g.attributes.position,u=g.attributes.uv;for(let i=0;i<v.count;i++){const a=(index%6)*Math.PI/3,x=v.getX(i)/1.76,z=-v.getZ(i)/1.76;u.setXY(i,x*Math.cos(a)-z*Math.sin(a)+.5,x*Math.sin(a)+z*Math.cos(a)+.5);}tileGeometries.push(g);
 const m=registerMaterial(new T.MeshStandardMaterial({map:slabMap,bumpMap:slabMap,bumpScale:.027,color:new T.Color('#eeecff').multiplyScalar(.94+(index%4)*.025),emissiveMap:slabMap,emissive:'#8c99bf',emissiveIntensity:.26,roughness:.86,metalness:.03}));const tileSide=registerMaterial(sideStone.clone());tileSide.color.set('#565c75');tileSide.emissiveIntensity=.08;const tile=mesh(g,[m,tileSide],root);tile.position.set(p.x,.018+(index%3)*.008,p.z);tiles.set(c.id,tile);
 // The narrow dark bevel separates stone from the real emissive channel below.
 const edgeGeo=new T.EdgesGeometry(g,38),edgeMat=new T.LineBasicMaterial({color:'#24304a',transparent:true,opacity:.38});tile.add(new T.LineSegments(edgeGeo,edgeMat));
}

// Individually tapered, tilted crystal prisms grow out of the stone perimeter.
const crystalMaterial=registerMaterial(new T.MeshPhysicalMaterial({map:crystalMap,bumpMap:crystalMap,bumpScale:.016,vertexColors:false,flatShading:false,color:'#ddd8ff',roughness:.30,metalness:.12,clearcoat:.85,clearcoatRoughness:.24,emissiveMap:crystalMap,emissive:'#c0a3ff',emissiveIntensity:.34}));
crystalMaterial.onBeforeCompile=shader=>{shader.uniforms.uCrystalTime=crystalTime;shader.uniforms.uVfx=effectAmount;shader.vertexShader='varying vec3 vCrystalCoord;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCrystalCoord=(modelMatrix*vec4(position,1.)).xyz;');shader.fragmentShader='uniform float uCrystalTime,uVfx;varying vec3 vCrystalCoord;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat glint=pow(max(0.,sin(vCrystalCoord.y*2.1+vCrystalCoord.x*.7-uCrystalTime*.8)),20.);totalEmissiveRadiance += vec3(.32,.12,.85)*glint*uVfx;');};
crystalMaterial.customProgramCacheKey=()=> 'painted-crystal69';
function prism(index){const positions=[],uvs=[],cols=[],ids=[],n=6,rows=[[0,.20],[.17,.30],[1.45,.245],[1.98,.0]];for(let row=0;row<4;row++)for(let j=0;j<n;j++){const a=j/n*Math.PI*2;positions.push(Math.cos(a)*rows[row][1],rows[row][0],Math.sin(a)*rows[row][1]);uvs.push(j/n,row/3);const col=new T.Color(j%2?'#281c72':'#122957').lerp(new T.Color('#756cb6'),row*.10);cols.push(col.r,col.g,col.b);}for(let row=0;row<3;row++)for(let j=0;j<n;j++){const a=row*n+j,b=row*n+(j+1)%n;ids.push(a,a+n,b,b,a+n,b+n);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setAttribute('color',new T.Float32BufferAttribute(cols,3));g.setIndex(ids);g.computeVertexNormals();return g;}
const crystalEdges=new T.LineBasicMaterial({color:'#6759ac',transparent:true,opacity:.08});const crystalClusters=[];
for(const [ci,[x,z,h]]of [[-4.25,-2.7,1.55],[4.10,-2.9,1.35],[4.7,2.6,.9]].entries()){
 const cluster=new T.Group();cluster.position.set(x,island.heightAt(x,z)+.025,z);root.add(cluster);crystalClusters.push(cluster);
 for(let i=0;i<6;i++){const g=prism(ci*6+i),m=mesh(g,crystalMaterial,cluster),a=i*2.4;const size=i===0?h:h*(.4+rand()*.4);m.scale.setScalar(size);m.position.set(Math.cos(a)*(i? .45:0),i===0?0:-.1,Math.sin(a)*.42);m.rotation.set((rand()-.5)*.26,rand()*Math.PI,(i-2)*.11);m.add(new T.LineSegments(new T.EdgesGeometry(g,25),crystalEdges));}
 const light=new T.PointLight('#9c43ff',5,6,2);light.position.set(0,.7,0);cluster.add(light);
}
const coreMaterial=new T.MeshBasicMaterial({color:new T.Color(1.4,.2,3.4),transparent:true,opacity:.4,toneMapped:false,depthWrite:false,blending:T.AdditiveBlending});
for(const cluster of crystalClusters){const inner=mesh(new T.OctahedronGeometry(.25,1),coreMaterial,cluster);inner.position.y=.55;inner.scale.set(.9,2.2,.9);inner.castShadow=false;}
const arcs=[];
for(const cluster of crystalClusters)for(let j=0;j<3;j++){const points=[];for(let i=0;i<13;i++){const t=i/12;points.push(new T.Vector3(Math.sin(t*12+j)*.14+(t-.5)*.7,.08+t*(j===0?1.9:1.2),Math.cos(t*14+j)*.1));}const material=new T.MeshBasicMaterial({color:new T.Color(1.4,.45,3.6),transparent:true,opacity:.6,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending});const arc=mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),32,.011,4,false),material,cluster);arc.castShadow=false;arcs.push({arc,phase:j+cluster.position.x});}


 const atmosphere=createAtmosphere({scene,clusters:crystalClusters,root}),glow=createGlowPipeline(renderer),nebula=createVoidNebula78();
 let elapsed=0,lastWidth=0,lastHeight=0;
 return {
  frame(dt,camera,animated,musicTimeline=null){nebula.frame(dt,animated,musicTimeline);if(animated)elapsed+=dt;crystalTime.value=elapsed;effectAmount.value=animated?1:0;atmosphere.frame(elapsed,camera,animated);lavaMaterial.uniforms.uTime.value=elapsed;for(const {arc,phase}of arcs)arc.material.opacity=animated?Math.pow(Math.max(0,Math.sin(elapsed*.75+phase)),10)*.7:0;coreMaterial.opacity=animated?.24+.07*Math.sin(elapsed*1.1):0;warmLight.intensity=animated?28+Math.sin(elapsed*.48)*1.2:0;},
  renderBackground(width,height){nebula.render(renderer,width,height);},
  render(camera,viewport){const ratio=renderer.getPixelRatio(),w=Math.round(viewport[2]*ratio),h=Math.round(viewport[3]*ratio);if(w!==lastWidth||h!==lastHeight){glow.resize(w,h);lastWidth=w;lastHeight=h;}glow.render(scene,camera,viewport);},
  dispose(){nebula.dispose();glow.dispose();const geometries=new Set(),materials=new Set(),textures=new Set([blankMap]);scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){materials.add(m);for(const t of Object.values(m))if(t?.isTexture)textures.add(t);}o.shadow?.dispose();});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();scene.clear();}
 };
}

export const VOIDFORGE_ZOOM79=Object.freeze({min:.85,max:1.5});
export function fitVoidforgeCamera77(camera,width,height,requested=1,orbit){
 const value=T.MathUtils.clamp(Number.isFinite(requested)?requested:1,VOIDFORGE_ZOOM79.min,VOIDFORGE_ZOOM79.max),pitch=68*Math.PI/180,focus=new T.Vector3(0,-.30,0);
 camera.up.set(0,1,0);camera.fov=35;camera.aspect=width/height;camera.updateProjectionMatrix();
 const pose=d=>{camera.position.copy(focus).add(new T.Vector3(0,Math.sin(pitch),Math.cos(pitch)).multiplyScalar(d));camera.lookAt(focus);camera.updateMatrixWorld();};
 const bounds=CELLS.flatMap(c=>{const p=tileCenter(c);return cardPoints(1.1).map(([x,z])=>new T.Vector3(p.x+x,.42,p.z+z));});bounds.push(new T.Vector3(-6.8,2.8,-3.8),new T.Vector3(6.8,2.8,-3.8),new T.Vector3(0,-3.9,3.1));
 let lo=8,hi=60;for(let i=0;i<24;i++){const d=(lo+hi)/2;pose(d);if(bounds.every(p=>{const v=p.clone().project(camera);return Math.abs(v.x)<.91&&Math.abs(v.y)<.90;}))hi=d;else lo=d;}pose(hi/value);if(orbit)arenaCameraPose78(camera,hi/value,orbit);
 return {value,min:VOIDFORGE_ZOOM79.min,max:VOIDFORGE_ZOOM79.max,pan:{x:0,y:0},canPan:false};
}
