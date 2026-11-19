import * as T from '../vendor/three.module.min.js';
import {PARTICLE_COUNTS,effectOffset,particleState} from './card-particles23.mjs?v=visible-particles-24';
import {FRAME_LAYOUT} from './card-layout21.mjs';
import {VOID_FOG_FRAGMENT} from './card-void40.mjs';
const uiMask=`float clearSurface(vec2 p){
 float m=1.-step(1.11,max(abs(p.x),abs(p.y)));
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
   void main(){vLocal=position.xy;vAlpha=aPose.w;vec2 p=position.xy*aPose.z;if(uKind>4.5)p.x*=1.8;float c=cos(aAngle),s=sin(aAngle);vCard=aPose.xy+mat2(c,s,-s,c)*p;gl_Position=projectionMatrix*modelViewMatrix*vec4(vCard,0.,1.);}`,
  fragmentShader:`uniform float uKind;varying vec2 vLocal;varying vec2 vCard;varying float vAlpha;${uiMask}
   void main(){vec2 p=vLocal;float r=length(p),alpha;vec3 color;
    if(uKind<3.5){alpha=exp(-r*r*4.8);color=mix(vec3(1.,.63,.17),vec3(1.,.96,.69),exp(-r*r*16.));}
    else if(uKind<4.5){float rays=exp(-abs(p.x)*28.)*pow(max(0.,1.-abs(p.y)),1.5)+exp(-abs(p.y)*28.)*pow(max(0.,1.-abs(p.x)),1.5);alpha=min(1.,rays+exp(-dot(p,p)*28.));color=mix(vec3(.54,.82,1.),vec3(1.),exp(-dot(p,p)*18.));}
    else {alpha=exp(-r*r*4.);color=mix(vec3(.12,.025,.22),vec3(.83,.52,1.),exp(-r*r*15.));}
    alpha*=vAlpha*clearSurface(vCard);if(alpha<.008)discard;gl_FragColor=vec4(color,alpha);
   }`
 });
 const particles=new T.Mesh(geometry,material);particles.name='Visible material particles';
 // Transparent sorting uses object depth, not shader-displaced vertex depth.
 particles.position.z=.085;particles.frustumCulled=false;root.add(particles);
 const fogGeometry=new T.PlaneGeometry(2.24,2.24),fogMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{uTime:{value:0}},vertexShader:'varying vec2 vCard;void main(){vCard=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:VOID_FOG_FRAGMENT});
 const fog=new T.Mesh(fogGeometry,fogMaterial);fog.name='Void frame fog';fog.position.z=.082;root.add(fog);
 const offset=effectOffset(seed);let key;
 function setRarity(next){key=next;geometry.instanceCount=PARTICLE_COUNTS[key]??0;material.uniforms.uKind.value=key==='epic'?3:key==='legendary'?4:5;material.blending=key==='mythic'?T.NormalBlending:T.AdditiveBlending;material.needsUpdate=true;}
 function frame(time,motion){const count=PARTICLE_COUNTS[key]??0;particles.visible=Boolean(motion&&count);fog.visible=Boolean(motion&&key==='mythic');if(!motion||!count)return;
  for(let i=0;i<count;i++){const p=particleState(key,i,time+offset);poses.set([p.x,p.y,p.size,p.opacity],i*4);angles[i]=p.angle;}
  poseAttribute.needsUpdate=angleAttribute.needsUpdate=true;fogMaterial.uniforms.uTime.value=time+offset;
 }
 setRarity(initialRarity);frame(0,false);
 return {root,setRarity,frame,dispose(){root.removeFromParent();geometry.dispose();material.dispose();fogGeometry.dispose();fogMaterial.dispose();root.clear();}};
}
