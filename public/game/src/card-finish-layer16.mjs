import {createCardParticles} from './card-particle-layer23.mjs?v=visible-particles-24';
import {createCardFoil} from './card-foil.mjs?v=visible-particles-24';
import * as T from '../vendor/three.module.min.js';
import {cardShape,cardPoints} from './card-prototype.mjs?v=classics-v04';
import {FRAME_LAYOUT} from './card-layout21.mjs';
import {OWNER_COLORS,rarityOf} from './card-rarities15.mjs';

function bezel(outer,inner){const shape=cardShape(outer),hole=new T.Path();cardPoints(inner).reverse().forEach(([x,y],i)=>i?hole.lineTo(x,y):hole.moveTo(x,y));hole.closePath();shape.holes.push(hole);return shape;}
export function createCardFinishLayer(initialRarity='common',owner=0,seed=''){
 const root=new T.Group();root.name='Rarity finish';const front=new T.Group();front.name='Face-only collector finish';root.add(front);
 const bandGeometry=new T.ExtrudeGeometry(bezel(.989,.977),{depth:.008,bevelEnabled:true,bevelSegments:2,bevelSize:.003,bevelThickness:.002,steps:1});
 const surface=document.createElement('canvas');surface.width=surface.height=512;const ctx=surface.getContext('2d');
 const point=([x,y])=>[256+x*250,256-y*250],outer=cardPoints(1.008).map(point),inner=cardPoints(.942).map(point);
 ctx.fillStyle='#8792a7';ctx.fillRect(0,0,512,512);
 for(let i=0;i<6;i++){const j=(i+1)%6,mid=[(outer[i][0]+outer[j][0])/2,(outer[i][1]+outer[j][1])/2],inside=[(inner[i][0]+inner[j][0])/2,(inner[i][1]+inner[j][1])/2];
  const g=ctx.createLinearGradient(mid[0],mid[1],inside[0],inside[1]);g.addColorStop(0,'#384052');g.addColorStop(.15,'#d8e3f5');g.addColorStop(.3,i%2?'#bac5d8':'#8696ae');g.addColorStop(.8,'#65738a');g.addColorStop(.95,'#dce6f6');g.addColorStop(1,'#31384b');ctx.fillStyle=g;ctx.beginPath();[outer[i],outer[j],inner[j],inner[i]].forEach(([x,y],n)=>n?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();
  for(const t of [.22,.28,.72,.78]){const x=outer[i][0]+(outer[j][0]-outer[i][0])*t,y=outer[i][1]+(outer[j][1]-outer[i][1])*t;ctx.strokeStyle='#13182788';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(256-x)*.032,y+(256-y)*.032);ctx.stroke();}
 }
 const metalTexture=new T.CanvasTexture(surface);metalTexture.colorSpace=T.SRGBColorSpace;metalTexture.anisotropy=4;
 const positions=bandGeometry.attributes.position,uv=bandGeometry.attributes.uv;for(let i=0;i<positions.count;i++)uv.setXY(i,positions.getX(i)/2.048+.5,positions.getY(i)/2.048+.5);
 const bandMaterial=new T.MeshStandardMaterial({map:metalTexture,metalness:.5,roughness:.32,emissiveIntensity:.08});
 const band=new T.Mesh(bandGeometry,bandMaterial);band.position.z=.044;front.add(band);
 const ownerGeometry=new T.ShapeGeometry(bezel(1.021,1.008)),ownerMaterial=new T.MeshBasicMaterial({color:OWNER_COLORS[owner],toneMapped:false});
 // A separate outer hairline conveys controller; a capture never changes the finish.
 for(const sign of [-1,1]){const edge=new T.Mesh(ownerGeometry,ownerMaterial);edge.position.z=sign*.057;if(sign<0)edge.rotation.y=Math.PI;root.add(edge);}
 const glintGeometry=new T.ShapeGeometry(bezel(.995,.84));
 const glintMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending,
  uniforms:{uTime:{value:0},uRank:{value:1},uMotion:{value:1},uColor:{value:new T.Color('#ffffff')}},
  vertexShader:'varying vec2 p; void main(){p=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 p;uniform float uTime;uniform float uRank;uniform float uMotion;uniform vec3 uColor;
   void main(){float angle=atan(p.y,p.x);float phase=angle-uTime*.55;
    float sweep=pow(max(0.,cos(phase)),28.);float second=pow(max(0.,cos(angle+uTime*.27+2.)),54.);
    float pulse=.5+.5*sin(uTime*1.25);float level=step(1.5,uRank);
    vec3 foil=.5+.5*cos(vec3(0.,2.1,4.2)+angle*2.+uTime*.6);
    vec3 tint=mix(uColor,mix(uColor,foil,.65),step(4.5,uRank)*uMotion);
    float strength=.05+level*uMotion*(sweep*(.38+.07*uRank)+second*.17+step(2.5,uRank)*pulse*.045);
    float mask=1.;
    ${FRAME_LAYOUT.values.map(([x,y])=>`mask*=smoothstep(.19,.22,length(p-vec2(${x.toFixed(4)},${y.toFixed(4)})));`).join('\n')}
    mask*=smoothstep(.20,.23,length(p-vec2(0.,${FRAME_LAYOUT.abilityY})));mask*=smoothstep(.20,.23,length(p-vec2(0.,${FRAME_LAYOUT.elementY})));
    if(abs(p.x)<.58&&abs(p.y-(${FRAME_LAYOUT.titleY}))<.13)mask=0.;
    float materialStrength=uRank<2.5?.18:uRank<3.5?.32:uRank<4.5?.25:.2;
    gl_FragColor=vec4(tint,strength*materialStrength*mask);}`
 });
 const glint=new T.Mesh(glintGeometry,glintMaterial);glint.position.z=.057;front.add(glint);
 const gemGeometry=new T.CircleGeometry(.027,4),gemMaterial=new T.MeshBasicMaterial({toneMapped:false}),gems=[];
 for(const [x,y] of cardPoints(.974)){const gem=new T.Mesh(gemGeometry,gemMaterial);gem.position.set(x,y,.061);gem.rotation.z=Math.PI/4;front.add(gem);gems.push(gem);}
 const particleEffects=createCardParticles(initialRarity,seed);front.add(particleEffects.root);
 const foil=createCardFoil(initialRarity);front.add(foil.mesh);
 let rarity,elapsed=0;
 function setRarity(key){
  const next=rarityOf({rarity:key});if(rarity?.key===next.key)return;
  rarity=next;root.userData.rarity=rarity.key;
  bandMaterial.color.set(rarity.metal);bandMaterial.emissive.set(rarity.color);gemMaterial.color.set(rarity.color);
  glintMaterial.uniforms.uRank.value=rarity.rank;glintMaterial.uniforms.uColor.value.set(rarity.color);
  foil.setRarity(rarity.key);
  particleEffects.setRarity(rarity.key);gems.forEach((g,i)=>g.visible=rarity.rank>=2||i===1||i===4);
 }
 function frame(dt,motion=true){
  if(motion)elapsed+=Math.min(.05,Math.max(0,dt));
  foil.frame(elapsed,motion);glintMaterial.uniforms.uTime.value=motion?elapsed:0;glintMaterial.uniforms.uMotion.value=motion?1:0;
  particleEffects.frame(elapsed,motion);
 }
 setRarity(initialRarity);frame(0,false);
 return {root,setRarity,setFrontVisible(value){front.visible=value;},setOwner(side){ownerMaterial.color.set(OWNER_COLORS[side]??OWNER_COLORS[0]);},frame,get rarity(){return rarity;},dispose(){root.removeFromParent();for(const g of [bandGeometry,ownerGeometry,glintGeometry,gemGeometry])g.dispose();for(const m of [bandMaterial,ownerMaterial,glintMaterial,gemMaterial])m.dispose();foil.dispose();particleEffects.dispose();metalTexture.dispose();root.clear();}};
}
