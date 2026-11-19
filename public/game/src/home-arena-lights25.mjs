import * as T from '../vendor/three.module.min.js';

// Coordinates are anchored to the new painting, never to a card or a board cell.
export const CRYSTAL_FACETS=[
 {points:[[.087,.032],[.145,.080],[.177,.226],[.118,.173]],period:7.1,phase:.3},
 {points:[[.219,.105],[.238,.147],[.207,.227],[.192,.181]],period:8.8,phase:2.5},
 {points:[[.941,.047],[.908,.188],[.836,.248],[.870,.125]],period:8.2,phase:4.2},
 {points:[[.823,.152],[.842,.232],[.798,.275],[.795,.213]],period:6.8,phase:1.4},
 {points:[[.106,.604],[.158,.668],[.168,.715],[.126,.685]],period:9.5,phase:3.5},
 {points:[[.916,.633],[.882,.716],[.849,.738],[.871,.677]],period:8.5,phase:5.3}
];
export const FIRE_SOURCES=[
 [.061,.355],[.933,.359],[.070,.524],[.950,.481],
 [.246,.146],[.647,.129],[.165,.840],[.340,.863],
 [.562,.884],[.736,.847],[.925,.819]
];
export const EMBER_COUNT=44;
export function sampleArenaEmber(index,time,out={}){
 const source=FIRE_SOURCES[index%FIRE_SOURCES.length],seed=(index*.61803398875)%1;
 const duration=2.8+(index%5)*.47,age=((time/duration+seed)%1+1)%1;
 out.u=source[0]+Math.sin(age*3.6+index*2.4)*(.002+(index%3)*.0015);
 out.v=source[1]-age*(source[1]>.75?.035:.028);
 out.opacity=Math.sin(Math.PI*age)**1.4*(.55+(index%3)*.12);
 out.size=(.0024+(index%4)*.00055)*(1-age*.45);
 out.age=age;return out;
}

export function createHomeArenaLights(textures){
 const root=new T.Group();root.name='Crystal reflections and fissure embers';let elapsed=0;
 const materials=[],geometries=[];
 const sprite=(texture,color,z=.018)=>{
  const material=new T.SpriteMaterial({map:texture,color,transparent:true,opacity:0,blending:T.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false});
  const node=new T.Sprite(material);node.renderOrder=15;node.position.z=z;materials.push(material);root.add(node);return node;
 };
 const glows=[
  ...[[.158,.213],[.836,.245],[.141,.692],[.876,.717]].map(([u,v])=>({u,v,w:.095,h:.065,color:'#b367ff',power:.21})),
  ...FIRE_SOURCES.map(([u,v])=>({u,v,w:.060,h:.033,color:'#ff7626',power:.24}))
 ].map((def,i)=>{const node=sprite(textures.glow,def.color);node.position.set(def.u-.5,.5-def.v,.012);node.scale.set(def.w,def.h,1);return {node,def,phase:i*.91};});
 const reflections=CRYSTAL_FACETS.map(def=>{
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(def.points.flatMap(([u,v])=>[u-.5,.5-v,.02]),3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute([0,1,1,1,1,0,0,0],2));geometry.setIndex([0,1,2,0,2,3]);geometries.push(geometry);
  const material=new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,toneMapped:false,uniforms:{uTime:{value:0},uPeriod:{value:def.period},uPhase:{value:def.phase}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float uTime,uPeriod,uPhase;void main(){float cycle=mod(uTime/uPeriod+uPhase,1.);float band=exp(-pow((vUv.y+vUv.x*.18-(cycle*1.6-.3))*18.,2.));float mask=sin(clamp(vUv.x,0.,1.)*3.14159265);float glint=band*mask*.54;gl_FragColor=vec4(vec3(.62,.85,1.),glint);}`});
  materials.push(material);const mesh=new T.Mesh(geometry,material);mesh.name='Moving facet reflection';mesh.renderOrder=16;root.add(mesh);return material;
 });
 const embers=Array.from({length:EMBER_COUNT},(_,index)=>{const node=sprite(textures.mote,index%3?'#ff9e43':'#ffe7a0',.024);return {node,sample:{},index};});
 function frame(dt,motion){root.visible=Boolean(motion);if(!motion)return;elapsed+=Math.max(0,Math.min(Number.isFinite(dt)?dt:0,.05));
  for(const {node,def,phase}of glows)node.material.opacity=def.power*(.65+.23*Math.sin(elapsed*1.1+phase)+.12*Math.sin(elapsed*3.3+phase));
  for(const material of reflections)material.uniforms.uTime.value=elapsed;
  for(const {node,sample,index}of embers){sampleArenaEmber(index,elapsed,sample);node.position.set(sample.u-.5,.5-sample.v,.024);node.scale.set(sample.size,sample.size*1.8,1);node.material.opacity=sample.opacity;node.material.rotation=Math.sin(elapsed*.6+index)*.35;}
 }
 root.visible=false;
 return {root,frame,dispose(){root.removeFromParent();for(const material of materials)material.dispose();for(const geometry of geometries)geometry.dispose();root.clear();}};
}
