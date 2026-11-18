import * as T from '../vendor/three.module.min.js';
import {PARTICLE_COUNTS,VORTEX,effectOffset,particleState} from './card-particles23.mjs';
import {FRAME_LAYOUT} from './card-layout21.mjs';
const uiMask=`float clearSurface(vec2 p){
 float m=1.-step(.872,abs(p.x));m*=1.-step(1.012,abs(p.y)+abs(p.x)*.577350269);
 ${FRAME_LAYOUT.values.map(([x,y])=>`m*=smoothstep(.19,.205,length(p-vec2(${x.toFixed(4)},${y.toFixed(4)})));`).join('\n')}
 m*=smoothstep(.19,.205,length(p-vec2(0.,${FRAME_LAYOUT.abilityY})));m*=smoothstep(.19,.205,length(p-vec2(0.,${FRAME_LAYOUT.elementY})));
 m*=step(.57,abs(p.x))+step(.115,abs(p.y-(${FRAME_LAYOUT.titleY})));return clamp(m,0.,1.);}`;
export function createCardParticles(initialRarity='common',seed=''){
 const root=new T.Group();root.name='Material particles';
 const source=new T.PlaneGeometry(2,2),geometry=new T.InstancedBufferGeometry();geometry.index=source.index.clone();for(const [name,a]of Object.entries(source.attributes))geometry.setAttribute(name,a.clone());source.dispose();
 const poses=new Float32Array(18*4),angles=new Float32Array(18),poseAttribute=new T.InstancedBufferAttribute(poses,4),angleAttribute=new T.InstancedBufferAttribute(angles,1);
 poseAttribute.setUsage(T.DynamicDrawUsage);angleAttribute.setUsage(T.DynamicDrawUsage);geometry.setAttribute('aPose',poseAttribute);geometry.setAttribute('aAngle',angleAttribute);
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,
  uniforms:{uKind:{value:0}},
  vertexShader:`attribute vec4 aPose;attribute float aAngle;uniform float uKind;varying vec2 vLocal;varying vec2 vCard;varying float vAlpha;
   void main(){vLocal=position.xy;vAlpha=aPose.w;vec2 p=position.xy*aPose.z;if(uKind>4.5)p.x*=3.2;float c=cos(aAngle),s=sin(aAngle);vCard=aPose.xy+mat2(c,s,-s,c)*p;gl_Position=projectionMatrix*modelViewMatrix*vec4(vCard,.078,1.);}`,
  fragmentShader:`uniform float uKind;varying vec2 vLocal;varying vec2 vCard;varying float vAlpha;${uiMask}
   void main(){vec2 p=vLocal;float r=length(p),alpha;vec3 color;
    if(uKind<3.5){alpha=exp(-r*r*4.8);color=mix(vec3(1.,.63,.17),vec3(1.,.96,.69),exp(-r*r*16.));}
    else if(uKind<4.5){float rays=exp(-abs(p.x)*28.)*pow(max(0.,1.-abs(p.y)),1.5)+exp(-abs(p.y)*28.)*pow(max(0.,1.-abs(p.x)),1.5);alpha=min(1.,rays+exp(-dot(p,p)*28.));color=mix(vec3(.54,.82,1.),vec3(1.),exp(-dot(p,p)*18.));}
    else {alpha=(1.-smoothstep(.12,1.,r));float rim=exp(-pow((r-.56)*4.,2.));color=mix(vec3(.015,.006,.028),vec3(.43,.17,.68),rim*.65);}
    alpha*=vAlpha*clearSurface(vCard);if(alpha<.008)discard;gl_FragColor=vec4(color,alpha);
   }`
 });
 const particles=new T.Mesh(geometry,material);particles.frustumCulled=false;root.add(particles);
 const vortexGeometry=new T.PlaneGeometry(.24,.16),vortexMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,
  uniforms:{uTime:{value:0}},vertexShader:'varying vec2 vUv;varying vec2 vCard;void main(){vUv=uv;vCard=position.xy+vec2(.34,.735);gl_Position=projectionMatrix*modelViewMatrix*vec4(position.xy,0.,1.);}',
  fragmentShader:`varying vec2 vUv;varying vec2 vCard;uniform float uTime;${uiMask}
   void main(){vec2 p=(vUv-.5)*2.;float r=length(p),a=atan(p.y,p.x);float disk=1.-smoothstep(.24,.34,r);float ring=exp(-pow((r-.55)*18.,2.));float halo=exp(-pow((r-.59)*5.,2.))*.18;float arc=.55+.45*pow(.5+.5*cos(a*2.-uTime*.7),3.);float alpha=max(disk,max(ring*arc,halo))*clearSurface(vCard);if(alpha<.008)discard;vec3 color=mix(vec3(.005,.002,.013),vec3(.63,.31,.91),clamp(ring*1.2+halo,0.,1.));gl_FragColor=vec4(color,alpha);}`
 });
 const vortex=new T.Mesh(vortexGeometry,vortexMaterial);vortex.position.set(VORTEX.x,VORTEX.y,.079);root.add(vortex);
 const offset=effectOffset(seed);let key;
 function setRarity(next){key=next;geometry.instanceCount=PARTICLE_COUNTS[key]??0;material.uniforms.uKind.value=key==='epic'?3:key==='legendary'?4:5;material.blending=key==='mythic'?T.NormalBlending:T.AdditiveBlending;material.needsUpdate=true;}
 function frame(time,motion){const count=PARTICLE_COUNTS[key]??0;particles.visible=Boolean(motion&&count);vortex.visible=Boolean(motion&&key==='mythic');if(!motion||!count)return;
  for(let i=0;i<count;i++){const p=particleState(key,i,time+offset);poses.set([p.x,p.y,p.size,p.opacity],i*4);angles[i]=p.angle;}
  poseAttribute.needsUpdate=angleAttribute.needsUpdate=true;vortexMaterial.uniforms.uTime.value=time+offset;
 }
 setRarity(initialRarity);frame(0,false);
 return {root,setRarity,frame,dispose(){root.removeFromParent();geometry.dispose();material.dispose();vortexGeometry.dispose();vortexMaterial.dispose();root.clear();}};
}
