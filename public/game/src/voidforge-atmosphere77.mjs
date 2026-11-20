import * as T from '../vendor/three.module.min.js';

// All sprites live in 3D at the island perimeter, with depth testing enabled.
// No screen-space overlays or geometry deformation can soften the game board.
export function createAtmosphere({scene,clusters,root}){
 const time={value:0},ratio={value:Math.min(devicePixelRatio||1,1.75)},objects=[];
 const noise=`float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}`;
 const points=(positions,seeds,vertex,fragment,blend=T.AdditiveBlending)=>{
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('seed',new T.Float32BufferAttribute(seeds,1));
  const m=new T.ShaderMaterial({uniforms:{uTime:time,uRatio:ratio},transparent:true,depthWrite:false,depthTest:true,blending:blend,toneMapped:false,vertexShader:vertex,fragmentShader:fragment});
  const p=new T.Points(g,m);p.frustumCulled=false;scene.add(p);objects.push(p);return p;
 };
 let positions=[],seeds=[];
 for(let i=0;i<15;i++){const c=clusters[i%clusters.length].position,a=i*2.39996,r=.4+(i%7)*.13;positions.push(c.x+Math.cos(a)*r,c.y+.15,c.z+Math.sin(a)*r);seeds.push((i*.61803398875)%1);}
 points(positions,seeds,
  'attribute float seed;uniform float uTime,uRatio;varying float fade,vSeed;void main(){float age=fract(uTime/(4.+seed*4.)+seed);vec3 p=position+vec3(sin(uTime*.14+seed*19.)*.25,age*1.2,cos(uTime*.12+seed*27.)*.21);fade=pow(sin(age*3.14159),1.8);vSeed=seed;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((2.+seed*3.)*uRatio*18./(-mv.z),1.,8.*uRatio);}',
  'varying float fade,vSeed;void main(){vec2 p=(gl_PointCoord-.5)*2.;float d=dot(p,p);if(d>1.)discard;vec3 c=mix(vec3(.7,.18,3.6),vec3(.5,1.8,3.),vSeed);float core=exp(-d*18.)+.4*exp(-d*4.);gl_FragColor=vec4(c,core*fade*.35);}'
 );
 positions=[];seeds=[];
 for(let i=0;i<24;i++){const a=i*2.39996,r=5.15+(i%3)*.28;positions.push(Math.cos(a)*r,-1.2,Math.sin(a)*r);seeds.push((i*.61803398875)%1);}
 points(positions,seeds,
  'attribute float seed;uniform float uTime,uRatio;varying float age,vSeed;void main(){age=fract(uTime/(7.+seed*6.)+seed);vec3 p=position+vec3(sin(seed*23.+age*2.)*.48,age*2.8,cos(seed*37.+age*3.)*.3);vSeed=seed;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((.8+age*.8)*uRatio*850./(-mv.z),1.,105.*uRatio);}',
  `uniform float uTime;varying float age,vSeed;${noise}void main(){vec2 p=(gl_PointCoord-.5)*2.;float d=dot(p,p);if(d>1.)discard;float n=noise(p*3.+vec2(vSeed*33.,uTime*.13));float alpha=pow(1.-d,2.)*n*sin(age*3.14159)*.15;vec3 c=mix(vec3(.17,.13,.24),vec3(.33,.22,.21),vSeed);gl_FragColor=vec4(c,alpha);}`,
  T.NormalBlending
 );
 for(const cluster of clusters){
  const g=new T.PlaneGeometry(2.6,2.6);g.rotateX(-Math.PI/2);
  const m=new T.ShaderMaterial({uniforms:{uTime:time},transparent:true,depthWrite:false,depthTest:true,blending:T.AdditiveBlending,toneMapped:false,side:T.DoubleSide,vertexShader:'varying vec2 uvv;void main(){uvv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 uvv;uniform float uTime;void main(){float d=length(uvv-.5)*2.;float a=exp(-d*d*4.)*(1.-smoothstep(.7,1.,d))*(.18+.035*sin(uTime*.9));gl_FragColor=vec4(.40,.07,1.2,a);}'});
  const halo=new T.Mesh(g,m);halo.position.copy(cluster.position);halo.position.y=cluster.position.y-.025;root.add(halo);objects.push(halo);
 }
 return {frame(t,camera,enabled){time.value=t;for(const object of objects)object.visible=enabled;}};
}
