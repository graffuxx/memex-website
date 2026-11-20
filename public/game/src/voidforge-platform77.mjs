import * as T from '../vendor/three.module.min.js';
import {chipBoundary} from './voidforge-edge77.mjs';
import {outerBreakPoints} from './voidforge-breaks77.mjs';

const TAU=Math.PI*2,wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const bump=(a,c,w)=>Math.exp(-Math.pow(wrap(a-c)/w,2));
const limits=[-.09,.76,1.36,2.22,2.97,3.37,4.13,5.14,5.43,TAU-.09];
// Each slab has its own mass, displacement and outward pitch. Crystal slabs stay seated.
const specs=[
 {drop:-.035,pitch:0,out:0,depth:1.35},
 {drop:-.20,pitch:-.10,out:.12,depth:1.04},
 {drop:.065,pitch:-.27,out:.17,depth:1.55},
 {drop:.01,pitch:.19,out:.09,depth:1.30},
 {drop:.11,pitch:.22,out:.10,depth:1.08},
 {drop:-.03,pitch:0,out:0,depth:1.25},
 {drop:.055,pitch:.36,out:.07,depth:1.53},
 {drop:-.31,pitch:-.14,out:.21,depth:.80},
 {drop:-.025,pitch:.018,out:0,depth:1.30},
];
function coast(a){return Math.max(4.78,5.10+.15*Math.sin(3*a+.4)+.09*Math.cos(7*a-.7)+.045*Math.sin(17*a)
 +.57*bump(a,3.71,.30)+.43*bump(a,5.67,.28)+.62*bump(a,.51,.29));}
function coreRadius(a,y){
 const rows=[[0,1],[-.40,.93],[-1.10,.80],[-1.80,.79],[-2.6,.69],[-3.35,.59],[-4.1,.42],[-4.65,.20],[-4.95,.025]];
 let scale=rows.at(-1)[1];for(let i=1;i<rows.length;i++)if(y>=rows[i][0]){const t=(y-rows[i-1][0])/(rows[i][0]-rows[i-1][0]);scale=T.MathUtils.lerp(rows[i-1][1],rows[i][1],t);break;}
 const radius=(4.39+.055*Math.sin(a*7+.8)+.040*Math.sin(a*13-.4))*scale;let recess=0;
 for(const [i,seam]of limits.slice(0,-1).entries()){const d=Math.abs(wrap(a-seam-.012*Math.sin(y*2.3+i)))*radius;recess=Math.max(recess,.055*(1-T.MathUtils.smoothstep(d,.015,.14)));}
 return radius-recess;
}
const innerR=(a,i)=>4.31+.045*Math.sin(a*4.4+i*.8);
const bend=(a,t)=>.026*Math.sin(t*Math.PI)*Math.sin(t*Math.PI*2+a*3.1);
function edge(a,t,i,side){const aa=a+side*.025+bend(a,t),r=T.MathUtils.lerp(innerR(a,i),coast(aa),t);return [Math.cos(aa)*r,Math.sin(aa)*r];}
function slabHeight(spec,x,z,i){const a=Math.atan2(z,x),r=Math.hypot(x,z);return -.13+spec.drop+spec.pitch*(r-4.35)+.025*Math.sin(a*9.1+i)+.014*Math.sin(x*6.2+z*3.8);}
function mesh(parent,g,m,name){const o=new T.Mesh(g,m);o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function geo(p,u,indices){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.setIndex(indices);g.computeVertexNormals();return g;}

function solidSlab(points,depth,height,seed,topMaterial,fractureMaterial,damage=[]){
 const s=new T.Shape();points.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();
 const g=new T.ExtrudeGeometry(s,{depth,steps:damage.length?4:1,bevelEnabled:true,bevelSize:.029,bevelThickness:.025,bevelSegments:2});g.rotateX(-Math.PI/2);
 const p=g.attributes.position,u=g.attributes.uv,cx=points.reduce((v,p)=>v+p[0],0)/points.length,cz=points.reduce((v,p)=>v+p[1],0)/points.length;
 for(let i=0;i<p.count;i++){
  const ox=p.getX(i),oz=p.getZ(i),py=p.getY(i),under=1-T.MathUtils.clamp(py/depth,0,1);let x=ox,z=oz;
  // The chip fades back into the intact side below its own break depth.
  for(const bite of damage){const dx=ox-bite.x,dz=oz-bite.z,along=dx*bite.tx+dz*bite.tz,inset=dx*bite.nx+dz*bite.nz;if(Math.abs(along)<bite.width*.60&&inset>.005&&inset<bite.depth+.055){const recover=(bite.through?.13:1)*T.MathUtils.smoothstep(under,0,bite.reach);x-=bite.nx*inset*recover;z-=bite.nz*inset*recover;}}
  const a=Math.atan2(z,x),bottom=.94+.10*Math.sin(a*8.3+seed)+.055*Math.sin(x*3.4-z*2.1);
  p.setX(i,cx+(x-cx)*(1-under*.16));p.setZ(i,cz+(z-cz)*(1-under*.13));p.setY(i,height(ox,oz)+(py-depth)*bottom);u.setXY(i,ox/2.8,oz/2.8);
 }
 // Separate unwrap for exposed fracture walls, retaining detail across the full thickness.
 for(const group of g.groups)if(group.materialIndex===1)for(let i=group.start;i<group.start+group.count;i++){
  const x=p.getX(i),z=p.getZ(i);u.setXY(i,(x*.54+z*.43)+seed*.137,p.getY(i)/1.7);
 }
 g.computeVertexNormals();return {g,materials:[topMaterial,fractureMaterial]};
}

function splinter(size,height,seed){
 const v=[[-.82*size,0,-.32*size],[.72*size,.025,-.42*size],[.12*size,.015,.66*size],[-.46*size,-height*.78,-.18*size],[.31*size,-height,-.22*size],[.02*size,-height*.63,.33*size]].map(p=>new T.Vector3(...p));
 const center=v.reduce((a,b)=>a.add(b),new T.Vector3()).multiplyScalar(1/v.length),p=[],u=[],groups=[];
 const faces=[[0,1,2],[3,5,4],[0,3,4],[0,4,1],[1,4,5],[1,5,2],[2,5,3],[2,3,0]];
 for(const [i,face]of faces.entries()){
  let [a,b,c]=face.map(j=>v[j]);const normal=b.clone().sub(a).cross(c.clone().sub(a)),fc=a.clone().add(b).add(c).multiplyScalar(1/3);
  if(normal.dot(fc.sub(center))<0)[b,c]=[c,b];
  for(const q of [a,b,c]){p.push(q.x,q.y,q.z);u.push((q.x+size)/(2*size)+seed*.13,(q.y+height)/(height+size));}
  groups.push([i*3,3,i===0?0:1]);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));for(const group of groups)g.addGroup(...group);g.computeVertexNormals();return g;
}

export function createRockIsland({topMaterial,plateMaterial=topMaterial,cliffMaterial,coreMaterial=cliffMaterial,fractureMaterial=cliffMaterial,heatTime={value:0},effects={value:1}}){
 const root=new T.Group();root.name='Fractured basalt platform / individually separated plates';
 const core=new T.Group();root.add(core);const n=160;
 // A joined surface is stitched to the actual inner edges of the broken slabs.
 const joinedBoundary=[];
 const ys=[0,-.40,-1.10,-1.80,-2.6,-3.35,-4.1,-4.65,-4.95];
 for(let row=0;row<ys.length-1;row++){
  const p=[],u=[],ids=[];
  for(let j=0;j<2;j++)for(let i=0;i<=n;i++){const a=i/n*TAU,y=ys[row+j],r=coreRadius(a,y);p.push(Math.cos(a)*r,y-.18,Math.sin(a)*r);u.push(a*1.55,-y/4.6);}
  for(let i=0;i<n;i++){const a=i,b=i+n+1;ids.push(a,a+1,b,b,a+1,b+1);}mesh(core,geo(p,u,ids),coreMaterial,'Fractured central cliff '+row).position.y=-.36;
 }
 const plateObjects=[],edgeBites=[];let majorBreakCount=0;
 specs.forEach((spec,i)=>{
  const a0=limits[i],a1=limits[i+1],center=(a0+a1)/2,points=[];
  for(let k=0;k<=5;k++)points.push(edge(a0,k/5,i,+1));
  const outer=outerBreakPoints(i,a0+.025,a1-.025,coast,innerR);points.push(...outer.points);majorBreakCount+=outer.breakCount;const rightStart=points.length;
  for(let k=5;k>=0;k--)points.push(edge(a1,k/5,i,-1));
  for(let k=1;k<6;k++){const a=T.MathUtils.lerp(a1-.025,a0+.025,k/6),r=innerR(a,i);points.push([Math.cos(a)*r,Math.sin(a)*r]);}
  const damage=chipBoundary(points,i,{outerStart:5,outerEnd:rightStart-1,rightStart,rightEnd:rightStart+4});
  for(const bite of damage.bites)edgeBites.push({...bite,spec,center});
  const {g,materials}=solidSlab(damage.points,spec.depth,(x,z)=>slabHeight(spec,x,z,i),i,plateMaterial,fractureMaterial,damage.bites);
  const o=mesh(root,g,materials,'Separated rim slab '+i);o.position.set(Math.cos(center)*spec.out,0,Math.sin(center)*spec.out);plateObjects.push(o);
  const innerPath=[points[0],...points.slice(rightStart+6).reverse(),points[rightStart+5]];
  for(const [x,z]of innerPath)joinedBoundary.push({x:x+o.position.x,y:slabHeight(spec,x,z,i)+.025,z:z+o.position.z,u:x/2.8,v:z/2.8});
 });
 // The same stone material and matching edge heights remove the visible circular insert.
 const centerPos=[0,-.13,0],centerUv=[0,0],centerIds=[];
 for(const p of joinedBoundary){centerPos.push(p.x,p.y,p.z);centerUv.push(p.u,p.v);}
 for(let i=0;i<joinedBoundary.length;i++)centerIds.push(0,(i+1)%joinedBoundary.length+1,i+1);
 mesh(core,geo(centerPos,centerUv,centerIds),plateMaterial,'Joined stone surface beneath the playable hexes');
 // Real loose splinters sit below two failing edges, not in an orbit around the scene.
 const chips=[
  {x:-1.10,z:5.02,y:-.67,scale:.48,angle:1.8},
  {x:1.92,z:4.95,y:-.84,scale:.32,angle:-.3},
  {x:-5.02,z:.65,y:-.57,scale:.31,angle:1.1},
 ];
 for(const [i,c]of chips.entries()){
  const g=splinter(c.scale,.35+c.scale*.5,i),materials=[plateMaterial,fractureMaterial];
  const o=mesh(root,g,materials,'Separated edge splinter '+i);o.position.set(c.x,c.y,c.z);o.rotation.set(.13,c.angle,-.19);
 }
 // Only a few of the larger missing pieces remain immediately below their break.
 const visibleBites=edgeBites.filter(b=>b.width>.26&&b.z>-.7).sort((a,b)=>b.depth-a.depth).slice(0,6);
 visibleBites.forEach((b,i)=>{
  const size=Math.min(.21,b.width*.48),g=splinter(size,.19+i%3*.055,117+i),materials=[plateMaterial,fractureMaterial];
  const o=mesh(root,g,materials,'Edge flake beside physical chip '+i);o.position.set(b.x-b.nx*.10+Math.cos(b.center)*b.spec.out,slabHeight(b.spec,b.x,b.z,b.plate)-.26-i%3*.11,b.z-b.nz*.10+Math.sin(b.center)*b.spec.out);o.rotation.set(.12+i*.025,i*1.31,-.13-i*.025);
 });
 const heatMaterial=new T.ShaderMaterial({side:T.DoubleSide,toneMapped:false,uniforms:{uTime:heatTime,uActive:effects},vertexShader:'varying vec2 heatUv;void main(){heatUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 heatUv;uniform float uTime,uActive;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
 void main(){float d=abs(heatUv.x-.5)*2.;float crust=noise(heatUv*vec2(5.,13.)+vec2(0.,uTime*.018));float molten=1.-smoothstep(.20,.92,d+crust*.23);float breath=.95+.05*sin(uTime*.45+heatUv.y*4.);vec3 c=mix(vec3(.026,.007,.013),vec3(2.3,.24,.012)*breath,molten*(.67+.25*crust)*uActive);gl_FragColor=vec4(c,1.);}`});
 for(const [i,a0]of limits.slice(0,-1).entries()){
  const p=[],u=[],ids=[],steps=32,left=(i+specs.length-1)%specs.length,right=i;
  for(let j=0;j<=steps;j++){
   const t=j/steps,a=a0+bend(a0,t),r=T.MathUtils.lerp(4.28,coast(a)-.045,t),x=Math.cos(a)*r,z=Math.sin(a)*r;
   const y=Math.min(slabHeight(specs[left],x,z,left),slabHeight(specs[right],x,z,right))-.115;
   const width=.16+.035*Math.sin(t*7.3+i);for(const sign of [-1,1]){p.push(x-Math.sin(a)*width*sign,y,z+Math.cos(a)*width*sign);u.push(sign===-1?0:1,t);}
   if(j<steps){const k=j*2;ids.push(k,k+1,k+2,k+1,k+3,k+2);}
  }
  const floor=mesh(root,geo(p,u,ids),heatMaterial,'Recessed lava floor between slabs '+i);floor.castShadow=floor.receiveShadow=false;
  // A thin recessed seam follows the central cliff below the separated crust.
  const vp=[],vu=[],vi=[];
  for(let j=0;j<=48;j++){
   const t=j/48,y=-.65-t*3.55,a=a0+.012*Math.sin(y*2.3+i);
   for(const sign of [-1,1]){const aa=a+sign*.015,r=coreRadius(aa,y)+.008;vp.push(Math.cos(aa)*r,y-.18,Math.sin(aa)*r);vu.push(sign===-1?0:1,t);}
   if(j<48){const k=j*2;vi.push(k,k+1,k+2,k+1,k+3,k+2);}
  }
  const seam=mesh(root,geo(vp,vu,vi),heatMaterial,'Lava seam inside central cliff '+i);seam.castShadow=seam.receiveShadow=false;seam.position.y=-.36;
 }
 function heightAt(x,z){let a=Math.atan2(z,x);while(a<limits[0])a+=TAU;while(a>=limits.at(-1))a-=TAU;let i=specs.findIndex((_,i)=>a>=limits[i]&&a<limits[i+1]);if(i<0||Math.hypot(x,z)<4.30)return -.18;const center=(limits[i]+limits[i+1])/2,spec=specs[i];return slabHeight(spec,x-Math.cos(center)*spec.out,z-Math.sin(center)*spec.out,i)+.041;}
 return {root,heightAt,fissures:[],plateCount:specs.length,chipCount:edgeBites.length,majorBreakCount,heatMaterial};
}
