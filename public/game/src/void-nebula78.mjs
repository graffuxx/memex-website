import * as T from '../vendor/three.module.min.js';

// This layer stays behind the terrain. No refraction, blur or deformation touches the board.
export function createVoidNebula78(){
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,0,1),time={value:0},aspect={value:1};
 const material=new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending,uniforms:{uTime:time,uAspect:aspect},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
 varying vec2 vUv;uniform float uTime,uAspect;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
 float cloud(vec2 p){return noise(p)*.57+noise(p*2.06)*.29+noise(p*4.13)*.14;}
 void main(){vec2 uv=vUv,p=(uv-.5)*vec2(uAspect,1.);float t=uTime*.025;
 vec2 warp=vec2(cloud(p*2.1+vec2(t,-t*.3)),cloud(p*2.7+vec2(-t*.4,t*.6)));
 float n=cloud(p*3.1+warp*1.5+vec2(t*.5,t*.12));
 float ribbon=pow(max(0.,1.-abs(sin(p.y*3.4+p.x*2.1+warp.x*3.6+t*.4))),3.);
 float edge=smoothstep(.20,.58,length(p*vec2(.8,1.15)));
 float density=smoothstep(.35,.78,n)*(.32+ribbon*.68)*edge;
 vec3 violet=mix(vec3(.21,.035,.57),vec3(.075,.16,.36),smoothstep(.30,.75,warp.y));
 gl_FragColor=vec4(violet,density*.53);
 }`});
 const geometry=new T.PlaneGeometry(2,2),quad=new T.Mesh(geometry,material);quad.frustumCulled=false;scene.add(quad);
 // A bounded layer of distant motes, outside the quiet screen center.
 const positions=[],seeds=[];for(let i=0;i<42;i++){const a=i*2.399963,r=.58+(i%9)*.052;positions.push(Math.cos(a)*r,Math.sin(a)*r,0);seeds.push((i*.61803398875)%1);}
 const starsGeometry=new T.BufferGeometry();starsGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));starsGeometry.setAttribute('seed',new T.Float32BufferAttribute(seeds,1));
 const starsMaterial=new T.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending,uniforms:{uTime:time,uAspect:aspect,uRatio:{value:Math.min(globalThis.devicePixelRatio||1,1.75)}},vertexShader:'attribute float seed;uniform float uTime,uAspect,uRatio;varying float fade;void main(){vec2 p=position.xy+vec2(sin(uTime*.06+seed*20.)*.022,cos(uTime*.045+seed*14.)*.018);p.x/=max(.8,uAspect*.72);gl_Position=vec4(p,0.,1.);gl_PointSize=(1.5+seed*2.5)*uRatio;fade=.22+.30*pow(.5+.5*sin(uTime*.45+seed*30.),3.);}',fragmentShader:'varying float fade;void main(){float d=length((gl_PointCoord-.5)*2.);if(d>1.)discard;gl_FragColor=vec4(.43,.32,1.,exp(-d*d*5.)*fade);}'});
 const stars=new T.Points(starsGeometry,starsMaterial);stars.frustumCulled=false;scene.add(stars);let elapsed=0;
 return {frame(dt,animated){if(animated)elapsed+=Math.min(.05,Math.max(0,dt));time.value=elapsed;stars.visible=animated;},render(renderer,width,height){aspect.value=width/Math.max(1,height);renderer.setViewport(0,0,width,height);renderer.setScissorTest(false);renderer.autoClear=false;renderer.render(scene,camera);},dispose(){geometry.dispose();material.dispose();starsGeometry.dispose();starsMaterial.dispose();scene.clear();}};
}
