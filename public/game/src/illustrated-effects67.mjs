import * as T from '../vendor/three.module.min.js';
import {insideArtworkFloor67} from './illustrated-arenas67.mjs';

export const ARENA_PARTICLE_LIMIT67=56;
export function artworkLightWeight67(id,r,g,b){if(id==='lava')return r>.55&&r-g>.12&&r-b>.25?r-g:0;if(id==='city')return Math.min(g,b)-r>.1&&g>.38?g-r:0;if(id==='cosmos')return b>.55&&b-r>.08?b*.6+g*.4:0;return r>.52&&r-b>.18?r-b:0;}
export function findArtworkSources67(arena,pixels,width,height){const candidates=[];for(let y=2;y<height-2;y+=2)for(let x=2;x<width-2;x+=2){const u=x/width,v=y/height;if(insideArtworkFloor67(arena,u,v,.11))continue;const i=(y*width+x)*4,weight=artworkLightWeight67(arena.id,pixels[i]/255,pixels[i+1]/255,pixels[i+2]/255);if(weight)candidates.push({u,v,weight});}candidates.sort((a,b)=>b.weight-a.weight);const sources=[];for(const p of candidates){if(sources.every(q=>Math.hypot(p.u-q.u,p.v-q.v)>.035))sources.push(p);if(sources.length===28)break;}return sources;}
const floorMask=`uniform vec2 uFloor[6];bool onFloor(vec2 uv){bool pos=false;bool neg=false;for(int i=0;i<6;i++){vec2 a=uFloor[i];vec2 b=uFloor[(i+1)%6];float c=(b.x-a.x)*(uv.y-a.y)-(b.y-a.y)*(uv.x-a.x);if(c>0.)pos=true;if(c<0.)neg=true;}return !(pos&&neg);}`;
export function createIllustratedEffects67(arena,texture,image,pixelRatio=1){
 const root=new T.Group();root.name=arena.name+' / light and particles';root.visible=false;
 const center=arena.corners.reduce((p,[x,y])=>[p[0]+x/6/arena.width,p[1]+y/6/arena.height],[0,0]),floor=arena.corners.map(([x,y])=>new T.Vector2(center[0]+(x/arena.width-center[0])*1.11,center[1]+(y/arena.height-center[1])*1.11)),type=({city:0,lava:1,ruins:2,cosmos:3})[arena.id];
 const common={uTime:{value:0},uTheme:{value:type},uFloor:{value:floor},uColor:{value:new T.Color(arena.color)}};
 const geometry=new T.PlaneGeometry(1,1),material=new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,uniforms:{...common,uArt:{value:texture}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform sampler2D uArt;uniform float uTime,uTheme;uniform vec3 uColor;${floorMask}
  float wave(vec2 p){return sin(p.y*92.+uTime*1.8+sin(p.x*31.-uTime*.43)*1.3)*.5+.5;}
  void main(){vec2 uv=vec2(vUv.x,1.-vUv.y);if(onFloor(uv))discard;vec3 c=texture2D(uArt,vUv).rgb;float mask=0.;float power=0.;
   if(uTheme<.5){mask=smoothstep(.08,.3,min(c.g,c.b)-c.r)*smoothstep(.28,.8,c.g);power=.035+.065*pow(.5+.5*sin(uTime*.7+uv.y*26.),3.);}
   else if(uTheme<1.5){mask=smoothstep(.12,.42,c.r-max(c.g*.8,c.b))*smoothstep(.42,.96,c.r)*smoothstep(.12,.4,c.g);power=.045+.17*pow(wave(uv),2.)+.025*sin(uTime*3.1+uv.x*53.);}
   else if(uTheme<2.5){mask=smoothstep(.15,.4,c.r-c.b)*smoothstep(.4,.85,c.r);power=.025+.06*(.5+.5*sin(uTime*.9+uv.y*17.));}
   else{mask=smoothstep(.07,.3,c.b-c.r)*smoothstep(.4,.9,c.b);power=.03+.055*(.5+.5*sin(uTime*.36+uv.x*19.-uv.y*13.));}
   gl_FragColor=vec4(uColor,max(0.,power)*mask);}`});
 const light=new T.Mesh(geometry,material);light.position.z=.01;light.renderOrder=4;root.add(light);
 const sample=document.createElement('canvas');sample.width=192;sample.height=128;const ctx=sample.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,192,128);const sources=findArtworkSources67(arena,ctx.getImageData(0,0,192,128).data,192,128);
 const count=sources.length?ARENA_PARTICLE_LIMIT67:0,positions=new Float32Array(count*3),seeds=new Float32Array(count);
 for(let i=0;i<count;i++){const p=sources[i%sources.length];positions.set([p.u,p.v,0],i*3);seeds[i]=(i*.61803398875)%1;}
 const particleGeometry=new T.BufferGeometry();particleGeometry.setAttribute('position',new T.BufferAttribute(positions,3));particleGeometry.setAttribute('seed',new T.BufferAttribute(seeds,1));
 const particleMaterial=new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,uniforms:{...common,uPixelRatio:{value:pixelRatio}},vertexShader:`attribute float seed;uniform float uTime,uTheme,uPixelRatio;varying float vFade;varying vec2 vImageUv;void main(){float age=fract(uTime/(3.6+seed*4.)+seed);float rise=uTheme>.5&&uTheme<1.5?.045:.017;vec2 p=position.xy+vec2(sin(uTime*.65+seed*41.)*.003,-age*rise);vImageUv=p;vFade=pow(sin(age*3.14159265),1.6);gl_Position=projectionMatrix*modelViewMatrix*vec4(p.x-.5,.5-p.y,.025,1.);gl_PointSize=(1.5+seed*2.)*uPixelRatio;}`,fragmentShader:`uniform vec3 uColor;varying float vFade;varying vec2 vImageUv;${floorMask}void main(){if(onFloor(vImageUv))discard;float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(uColor,exp(-d*d*5.)*vFade*.72);}`});
 const particles=new T.Points(particleGeometry,particleMaterial);particles.frustumCulled=false;particles.renderOrder=6;root.add(particles);let elapsed=0;
 return {root,sources,count,frame(dt,motion){root.visible=Boolean(motion);if(!motion)return;elapsed+=Math.min(.05,Math.max(0,Number.isFinite(dt)?dt:0));common.uTime.value=elapsed;},dispose(){root.removeFromParent();geometry.dispose();material.dispose();particleGeometry.dispose();particleMaterial.dispose();root.clear();}};
}
