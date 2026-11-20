import {voidStormState79} from './void-storm79.mjs';
import * as T from '../vendor/three.module.min.js';

// This layer stays behind the terrain. No refraction, blur or deformation touches the board.
export function createVoidNebula78(){
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,0,1),time={value:0},aspect={value:1},storm={value:new T.Vector2()};
 const material=new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending,uniforms:{uTime:time,uAspect:aspect,uStorm:storm},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
 varying vec2 vUv;uniform float uTime,uAspect;uniform vec2 uStorm;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
 float cloud(vec2 p){return noise(p)*.57+noise(p*2.06)*.29+noise(p*4.13)*.14;}
 // A jagged path and two short branches live at each outer edge of the sky.
 float lightning(vec2 uv,float side,float seed){
  float y=uv.y,x=side+sin(y*7.+seed)*.027+(noise(vec2(y*13.,seed))-.5)*.067+(noise(vec2(y*43.,seed+9.))-.5)*.018;
  float trunk=abs(uv.x-x),branch=abs(uv.x-(x+(y-.48)*.45));
  float branch2=abs(uv.x-(x-(y-.69)*.30));
  float branches=max(exp(-branch*branch/0.000012)*smoothstep(.18,.24,y)*(1.-smoothstep(.46,.49,y)),exp(-branch2*branch2/0.000009)*smoothstep(.68,.70,y)*(1.-smoothstep(.83,.88,y)));
  float ends=smoothstep(.12,.22,y)*(1.-smoothstep(.84,.94,y));
  float core=exp(-trunk*trunk/0.000004)*ends+branches*.66;
  float halo=exp(-trunk*trunk/0.00024)*ends;
  return core+halo*.30;
 }
 void main(){vec2 uv=vUv,p=(uv-.5)*vec2(uAspect,1.);float t=uTime*.025;
 vec2 warp=vec2(cloud(p*2.1+vec2(t,-t*.3)),cloud(p*2.7+vec2(-t*.4,t*.6)));
 float n=cloud(p*3.1+warp*1.5+vec2(t*.5,t*.12));
 float ribbon=pow(max(0.,1.-abs(sin(p.y*3.4+p.x*2.1+warp.x*3.6+t*.4))),3.);
 float edge=smoothstep(.20,.58,length(p*vec2(.8,1.15)));
 float density=smoothstep(.35,.78,n)*(.32+ribbon*.68)*edge;
 vec3 violet=mix(vec3(.32,.065,.70),vec3(.085,.20,.48),smoothstep(.30,.75,warp.y));
 float weather=(exp(-dot(uv-vec2(.15,.61),uv-vec2(.15,.61))*12.)*uStorm.x+exp(-dot(uv-vec2(.85,.55),uv-vec2(.85,.55))*12.)*uStorm.y)*edge;
 float veins=(lightning(uv,.13,2.7)*uStorm.x+lightning(uv,.88,8.1)*uStorm.y)*edge;
 vec3 fog=violet*(.72+density*.55+weather*.55);
 float alpha=clamp(density*.84+weather*.24+veins*.78,0.,.90);
 gl_FragColor=vec4(fog+vec3(.55,.39,.90)*min(1.,veins),alpha);
 }`});
 const geometry=new T.PlaneGeometry(2,2),quad=new T.Mesh(geometry,material);quad.frustumCulled=false;scene.add(quad);
 // A bounded layer of distant motes, outside the quiet screen center.
 const positions=[],seeds=[];for(let i=0;i<42;i++){const a=i*2.399963,r=.58+(i%9)*.052;positions.push(Math.cos(a)*r,Math.sin(a)*r,0);seeds.push((i*.61803398875)%1);}
 const starsGeometry=new T.BufferGeometry();starsGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));starsGeometry.setAttribute('seed',new T.Float32BufferAttribute(seeds,1));
 const starsMaterial=new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending,uniforms:{uTime:time,uAspect:aspect,uRatio:{value:Math.min(globalThis.devicePixelRatio||1,1.75)}},vertexShader:'attribute float seed;uniform float uTime,uAspect,uRatio;varying float fade;void main(){vec2 p=position.xy+vec2(sin(uTime*.06+seed*20.)*.022,cos(uTime*.045+seed*14.)*.018);p.x/=max(.8,uAspect*.72);gl_Position=vec4(p,0.,1.);gl_PointSize=(1.5+seed*2.5)*uRatio;fade=.22+.30*pow(.5+.5*sin(uTime*.45+seed*30.),3.);}',fragmentShader:'varying float fade;void main(){float d=length((gl_PointCoord-.5)*2.);if(d>1.)discard;gl_FragColor=vec4(.43,.32,1.,exp(-d*d*5.)*fade);}'});
 const stars=new T.Points(starsGeometry,starsMaterial);stars.frustumCulled=false;scene.add(stars);let elapsed=0;
 return {frame(dt,animated){if(animated)elapsed+=Math.min(.05,Math.max(0,dt));time.value=elapsed;const weather=voidStormState79(elapsed,animated);storm.value.set(weather.left,weather.right);stars.visible=animated;},render(renderer,width,height){aspect.value=width/Math.max(1,height);renderer.setViewport(0,0,width,height);renderer.setScissorTest(false);renderer.autoClear=false;renderer.render(scene,camera);},dispose(){geometry.dispose();material.dispose();starsGeometry.dispose();starsMaterial.dispose();scene.clear();}};
}
