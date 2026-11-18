import * as T from '../vendor/three.module.min.js';
import {cardShape} from './card-prototype.mjs?v=classics-v04';
import {rarityOf} from './card-rarities15.mjs';

// The foil is a separate, face-only pass. It never moves or resamples the portrait.
// Protected areas are shared with QA, so numbers, name and both sockets stay clear.
export function foilCoverage(x,y){
 const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 let mask=1;
 for(let i=0;i<6;i++){const a=-i*Math.PI/3;mask*=smooth(.17,.225,Math.hypot(x-Math.cos(a)*.718,y-Math.sin(a)*.718));}
 for(const sy of [-.803,.803])mask*=smooth(.17,.215,Math.hypot(x,y-sy));
 const qx=Math.abs(x)-.56,qy=Math.abs(y+.33)-.105;
 return mask*smooth(0,.04,Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0));
}
export function createCardFoil(initialRarity){
 const geometry=new T.ShapeGeometry(cardShape(.899));
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,
  uniforms:{uTime:{value:0},uRank:{value:1},uMotion:{value:0},uColor:{value:new T.Color('#ffffff')}},
  vertexShader:'varying vec2 p;void main(){p=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 p;uniform float uTime;uniform float uRank;uniform float uMotion;uniform vec3 uColor;
   float boxDistance(vec2 point,vec2 center,vec2 size){vec2 q=abs(point-center)-size;return length(max(q,0.))+min(max(q.x,q.y),0.);}
   void main(){
    float mask=1.;
    for(int i=0;i<6;i++){float a=-float(i)*1.0471975512;mask*=smoothstep(.17,.225,length(p-vec2(cos(a),sin(a))*.718));}
    mask*=smoothstep(.17,.215,length(p-vec2(0.,.803)));mask*=smoothstep(.17,.215,length(p-vec2(0.,-.803)));
    mask*=smoothstep(0.,.04,boxDistance(p,vec2(0.,-.33),vec2(.56,.105)));
    float level=max(0.,uRank-1.);float foilEnabled=step(1.5,uRank)*uMotion;
    float projection=(p.x*.75+p.y*.58+1.2)/2.4;
    float center=fract(uTime*.145-.15);float delta=projection-center;
    float sweep=exp(-delta*delta/.008);
    vec3 spectrum=.55+.45*cos(vec3(0.,2.1,4.2)+(p.x-p.y)*3.1+uTime*.6);
    float prismatic=step(2.5,uRank)*.27+step(4.5,uRank)*.46;
    vec3 tint=mix(uColor,spectrum,prismatic);
    tint=mix(tint,vec3(.95,.98,1.),sweep*(uRank < 4. ? .45 : .2));
    float alpha=min(.5,(.018+.009*level+sweep*(.16+.07*level)))*mask*foilEnabled;
    gl_FragColor=vec4(tint,alpha);
   }`
 });
 const mesh=new T.Mesh(geometry,material);mesh.name='Portrait foil / masked UI';mesh.position.z=.042;
 let rarity;
 function setRarity(key){rarity=rarityOf({rarity:key});material.uniforms.uRank.value=rarity.rank;material.uniforms.uColor.value.set(rarity.color);mesh.visible=rarity.rank>1;}
 setRarity(initialRarity);
 return {mesh,setRarity,frame(time,motion){material.uniforms.uTime.value=time;material.uniforms.uMotion.value=motion?1:0;},dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();}};
}
