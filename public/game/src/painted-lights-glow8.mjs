import * as T from '../vendor/three.module.min.js';

// Positions are normalized artwork coordinates (top left = 0,0), outside the playable floor.
export const ARENA_LIGHTS=[
 {u:.102,v:.423,w:.071,h:.080,power:.13,period:7.3,phase:.4,color:'#bb80ff'},
 {u:.219,v:.195,w:.095,h:.065,power:.085,period:8.8,phase:1.7,color:'#ab64fa'},
 {u:.777,v:.173,w:.062,h:.071,power:.080,period:9.6,phase:3.1,color:'#ad75ff'},
 {u:.930,v:.351,w:.057,h:.066,power:.065,period:7.9,phase:2.3,color:'#b98aff'},
 {u:.135,v:.700,w:.078,h:.060,power:.080,period:10.2,phase:4.5,color:'#ae70ff'},
 {u:.853,v:.702,w:.066,h:.071,power:.075,period:8.4,phase:5.2,color:'#b27cff'},
 {u:.208,v:.105,w:.008,h:.021,power:.32,period:6.8,phase:1.2,color:'#ebdfff',glint:true},
 {u:.784,v:.108,w:.007,h:.018,power:.28,period:8.2,phase:3.6,color:'#e4ddff',glint:true},
 {u:.112,v:.634,w:.007,h:.019,power:.27,period:9.1,phase:5.1,color:'#eadbff',glint:true},
 {u:.858,v:.652,w:.007,h:.018,power:.29,period:7.7,phase:2.4,color:'#eadbff',glint:true}
];
export const ARENA_MOTES=[
 ...Array.from({length:3},(_,i)=>({u:.102,v:.423,rx:.026,ry:.031,size:.007,phase:i*2.094,period:23+i*2,orbit:true})),
 ...[{u:.219,v:.171},{u:.777,v:.158},{u:.927,v:.335},{u:.132,v:.680},{u:.855,v:.687}].flatMap((p,i)=>[
  {...p,rx:.009,ry:.022,size:.0065,phase:i*.93+.4,period:7.5+i*.55},
  {...p,u:p.u+.012,v:p.v+.013,rx:.006,ry:.018,size:.0055,phase:i*.73+3.1,period:9+i*.38}
 ])
];
export const BLOCKADE_LIGHTS=[
 {u:.510,v:.455,w:.23,h:.24,power:.075,period:8.3,phase:2.1,color:'#a86bff'},
 {u:.553,v:.201,w:.025,h:.055,power:.25,period:9.7,phase:4.2,color:'#e6d5ff',glint:true}
];
export const BLOCKADE_MOTES=[{u:.49,v:.36,rx:.025,ry:.09,size:.045,phase:1.4,period:9}];

export function samplePaintedMote(def,time,out={}){
 const phase=time/def.period*2*Math.PI+def.phase;
 if(def.orbit){out.u=def.u+Math.cos(phase)*def.rx;out.v=def.v+Math.sin(phase)*def.ry;out.opacity=.26+.22*(.5+.5*Math.sin(phase*1.7));}
 else {const age=((time/def.period+def.phase/(2*Math.PI))%1+1)%1;out.u=def.u+Math.sin(phase)*def.rx;out.v=def.v-age*def.ry;out.opacity=.52*Math.sin(age*Math.PI)**2;}
 return out;
}

export function createPaintedLightTextures(){
 const create=sharp=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);
  for(const [at,alpha]of sharp?[[0,1],[.10,1],[.18,.65],[.34,.14],[.65,.025],[1,0]]:[[0,.9],[.22,.5],[.55,.12],[1,0]])gradient.addColorStop(at,`rgba(255,255,255,${alpha})`);
  ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=texture.magFilter=T.LinearFilter;return texture;
 };
 const glow=create(false),mote=create(true);return {glow,mote,dispose(){glow.dispose();mote.dispose();}};
}

export function createPaintedLights(textures,{lights=ARENA_LIGHTS,motes=ARENA_MOTES}={}){
 const root=new T.Group();root.name='Local painted light accents';root.visible=false;let elapsed=0;
 const sprite=(texture,color)=>{const material=new T.SpriteMaterial({map:texture,color,transparent:true,opacity:0,blending:T.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false,fog:false});const node=new T.Sprite(material);node.renderOrder=5;root.add(node);return node;};
 const glows=lights.map(def=>{const node=sprite(textures.glow,def.color);node.position.set(def.u-.5,.5-def.v,.003);node.scale.set(def.w,def.h,1);return {def,node};});
 const particles=motes.map(def=>{const node=sprite(textures.mote,'#e2cbff');node.scale.set(def.size,def.size,1);return {def,node,sample:{}};});
 function frame(dt,motion){root.visible=Boolean(motion);if(!motion)return;elapsed+=Math.max(0,Math.min(Number.isFinite(dt)?dt:0,.05));
  for(const {def,node}of glows){const wave=.5+.5*Math.sin(elapsed/def.period*2*Math.PI+def.phase);node.material.opacity=def.power*(def.glint?wave**12:.52+.48*wave);}
  for(const {def,node,sample}of particles){samplePaintedMote(def,elapsed,sample);node.position.set(sample.u-.5,.5-sample.v,.004);node.material.opacity=sample.opacity;}
 }
 return {root,frame,dispose(){root.removeFromParent();root.children.forEach(n=>n.material.dispose());root.clear();}};
}
