import * as T from '../vendor/three.module.min.js';
import {CATALOG,ELEMENTS,sideValue} from './rules.mjs';

export const CARD_PROFILES={
 pepe:{id:'pepe',name:'Pepe',ruleId:'oracle',element:'storm',asset:'../assets/cards/v03/overthinker-thinking-pepe.webp',caption:'Feels good, man.'},
 doge:{id:'doge',name:'Doge',ruleId:'brain',element:'fire',asset:'../assets/cards/v04/doge.webp',caption:'such strategy. much wow.'},
 'roll-safe':{id:'roll-safe',name:'Roll Safe',ruleId:'trust',element:'stone',asset:'../assets/cards/v04/roll-safe.webp',caption:'Kann nicht verlieren, wenn du nicht mitspielst.'}
};

export const CARD_SPEC={id:'oracle',radius:1,bodyDepth:.045,bevel:.012,artRadius:.91,valueOrbit:.718,socketRadius:.145,socketY:.803,symbolSize:.225,asset:'../assets/cards/v03/overthinker-thinking-pepe.webp',logo:'../assets/brand/memex-duelverse-original.webp'};
const valueInset=[[-.128,-.105],[-.155,0],[-.128,.105],[.125,.155],[.135,.12],[.135,-.12],[.125,-.155]];
export function valueSlotPoints(direction,inset=1){const a=-direction*Math.PI/3,c=Math.cos(a),s=Math.sin(a);return valueInset.map(([x,y])=>{x=x*inset+CARD_SPEC.valueOrbit;y*=inset;return [x*c-y*s,x*s+y*c];});}
function polygonShape(points){const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;}
const owners=['#74d7ef','#fa997d'];
export function cardPoints(radius=1){return Array.from({length:6},(_,i)=>{const a=(i*60-30)*Math.PI/180;return [Math.cos(a)*radius,Math.sin(a)*radius];});}
export function cardShape(radius=1){const s=new T.Shape();cardPoints(radius).forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;}
function faceGeometry(radius){const g=new T.ShapeGeometry(cardShape(radius));const pos=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/2+.5,pos.getY(i)/2+.5);return g;}
function bezelShape(outer,inner){const s=cardShape(outer),hole=new T.Path();cardPoints(inner).reverse().forEach(([x,y],i)=>i?hole.lineTo(x,y):hole.moveTo(x,y));hole.closePath();s.holes.push(hole);return s;}
function canvasTexture(draw,width=512,height=width){const c=document.createElement('canvas');c.width=width;c.height=height;draw(c.getContext('2d'),width,height);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
function backTexture(logo){return canvasTexture((ctx,w)=>{
 ctx.fillStyle='#171827';ctx.fillRect(0,0,w,w);const center=w/2;
 const hex=(r,spin=0)=>{ctx.beginPath();for(let i=0;i<6;i++){const a=(i*60-30)*Math.PI/180+spin,x=center+Math.cos(a)*r,y=center+Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.stroke();};
 ctx.strokeStyle='#c6aa7045';ctx.lineWidth=1.2;for(let r=60;r<230;r+=13)hex(r);
 ctx.strokeStyle='#bba276';ctx.lineWidth=3;hex(214);hex(205);
 const glow=ctx.createRadialGradient(center,center,0,center,center,w*.36);glow.addColorStop(0,'#1b3158');glow.addColorStop(1,'#17182700');ctx.fillStyle=glow;ctx.fillRect(w*.1,w*.1,w*.8,w*.8);
 const lw=w*.76,lh=lw*logo.height/logo.width;ctx.drawImage(logo,(w-lw)/2,(w-lh)/2,lw,lh);
});}
export async function createCardPrototype({owner=null,rotation=0,profile='pepe'}={}){
 if(!Object.hasOwn(CARD_PROFILES,profile))throw Error('Unbekanntes Kartenmuster.');const p=CARD_PROFILES[profile];
 const cardValue=dir=>sideValue({id:p.ruleId,rotation},dir);
 const group=new T.Group();group.name='Duelverse / '+p.name+' / v04';
 const geometries=new Set(),materials=new Set(),textures=new Set();
 const geo=g=>(geometries.add(g),g),mat=m=>(materials.add(m),m),tex=t=>(textures.add(t),t);
 const add=(g,m,z=0)=>{const mesh=new T.Mesh(g,m);mesh.position.z=z;group.add(mesh);return mesh;};
 const bronze=mat(new T.MeshStandardMaterial({color:'#9c794c',metalness:.74,roughness:.35}));
 const gold=mat(new T.MeshStandardMaterial({color:'#e1c68f',metalness:.65,roughness:.3}));
 const dark=mat(new T.MeshStandardMaterial({color:'#171d2c',metalness:.4,roughness:.55}));
 const accent=mat(new T.MeshBasicMaterial({color:owner===null?'#dfc48a':owners[owner]}));
 const bodyGeo=geo(new T.ExtrudeGeometry(cardShape(),{depth:CARD_SPEC.bodyDepth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:CARD_SPEC.bevel,bevelThickness:.009}));bodyGeo.translate(0,0,-CARD_SPEC.bodyDepth/2);
 const body=add(bodyGeo,bronze);body.castShadow=body.receiveShadow=true;
 const frontBezel=geo(new T.ExtrudeGeometry(bezelShape(.995,.904),{depth:.015,bevelEnabled:true,bevelSegments:2,bevelSize:.005,bevelThickness:.004}));add(frontBezel,gold,.027);
 const rearBezel=add(frontBezel,bronze,-.027);rearBezel.rotation.y=Math.PI;
 const ownershipGeo=geo(new T.ShapeGeometry(bezelShape(.974,.953)));add(ownershipGeo,accent,.052);
 const backAccent=add(ownershipGeo,accent,-.052);backAccent.rotation.y=Math.PI;
 const [image,logo]=await Promise.all([new T.TextureLoader().loadAsync(new URL(p.asset,import.meta.url).href),new T.ImageLoader().loadAsync(new URL(CARD_SPEC.logo,import.meta.url).href)]);image.colorSpace=T.SRGBColorSpace;image.anisotropy=8;tex(image);
 const portraitMaterial=mat(new T.MeshBasicMaterial({map:image}));add(geo(faceGeometry(.905)),portraitMaterial,.035);
 const rear=add(geo(faceGeometry(.905)),mat(new T.MeshBasicMaterial({map:tex(backTexture(logo))})),-.035);rear.rotation.y=Math.PI;

 const badges=[],numberTextures=new Map();
 const numberTexture=n=>{if(!numberTextures.has(n)){numberTextures.set(n,tex(canvasTexture((ctx,w)=>{ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`800 ${w*.95}px Arial,sans-serif`;ctx.strokeStyle='#101422';ctx.lineWidth=8;ctx.strokeText(String(n),w/2,w*.54);ctx.fillStyle='#fff7e7';ctx.fillText(String(n),w/2,w*.54);},160)));}return numberTextures.get(n);};
 const numberPlane=geo(new T.PlaneGeometry(.224,.224));
 const ownershipCut=geo(new T.PlaneGeometry(.012,.17));
 for(let dir=0;dir<6;dir++){
  const a=-dir*Math.PI/3,x=Math.cos(a)*CARD_SPEC.valueOrbit,y=Math.sin(a)*CARD_SPEC.valueOrbit;
  // Faceted inserts overlap the outer bezel and become part of the continuous frame.
  add(geo(new T.ExtrudeGeometry(polygonShape(valueSlotPoints(dir)),{depth:.014,bevelEnabled:true,bevelSegments:2,bevelSize:.003,bevelThickness:.003})),[gold,bronze],.047);
  add(geo(new T.ShapeGeometry(polygonShape(valueSlotPoints(dir,.82)))),dark,.067);
  const tick=add(ownershipCut,accent,.071);tick.position.set(Math.cos(a)*(CARD_SPEC.valueOrbit+.116),Math.sin(a)*(CARD_SPEC.valueOrbit+.116),.071);tick.rotation.z=a;
  const numeric=add(numberPlane,mat(new T.MeshBasicMaterial({map:numberTexture(cardValue(dir)),transparent:true,depthWrite:false})),.082);numeric.position.set(x,y,.082);badges.push(numeric);
 }
 const titleTexture=tex(canvasTexture((ctx,w,h)=>{ctx.fillStyle='#151624f2';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#ccb181';ctx.lineWidth=4;ctx.strokeRect(2,2,w-4,h-4);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#f4e9d2';ctx.font='bold 70px Arial,sans-serif';ctx.fillText(p.name.toUpperCase(),w/2,h*.54);},640,108));
 const title=add(geo(new T.PlaneGeometry(1.04,.175)),mat(new T.MeshBasicMaterial({map:titleTexture,transparent:true,depthWrite:false})),.055);title.position.y=-.33;
 const socketGeometry=geo(new T.ExtrudeGeometry(bezelShape(CARD_SPEC.socketRadius,.117),{depth:.019,bevelEnabled:true,bevelSegments:2,bevelSize:.004,bevelThickness:.004}));
 const socketFloor=geo(new T.ShapeGeometry(cardShape(.118)));
 for(const side of [-1,1]){const rim=add(socketGeometry,gold,.049);rim.position.y=side*CARD_SPEC.socketY;const well=add(socketFloor,dark,.058);well.position.y=side*CARD_SPEC.socketY;}
 // The upper well is intentionally empty: reserved for a later ability, without implying a rule.
 const stormTexture=tex(canvasTexture((ctx,w)=>{ctx.fillStyle=ELEMENTS[p.element].color;ctx.beginPath();if(p.element==='fire'){ctx.moveTo(w*.53,w*.08);ctx.bezierCurveTo(w*.46,w*.4,w*.9,w*.45,w*.76,w*.75);ctx.bezierCurveTo(w*.62,w*.98,w*.2,w*.98,w*.2,w*.63);ctx.bezierCurveTo(w*.2,w*.44,w*.38,w*.32,w*.53,w*.08);}else if(p.element==='stone'){ctx.moveTo(w*.5,w*.09);ctx.lineTo(w*.84,w*.5);ctx.lineTo(w*.5,w*.91);ctx.lineTo(w*.16,w*.5);}else{ctx.moveTo(w*.55,w*.1);ctx.lineTo(w*.21,w*.55);ctx.lineTo(w*.47,w*.55);ctx.lineTo(w*.36,w*.91);ctx.lineTo(w*.8,w*.4);ctx.lineTo(w*.52,w*.4);}ctx.closePath();ctx.fill();},128));
 const storm=add(geo(new T.PlaneGeometry(CARD_SPEC.symbolSize,CARD_SPEC.symbolSize)),mat(new T.MeshBasicMaterial({map:stormTexture,transparent:true,depthWrite:false})),.08);storm.position.y=-CARD_SPEC.socketY;
 // Six small inset cuts make the frame read as one manufactured object from oblique views.
 for(let i=0;i<6;i++){const a=(i*60+30)*Math.PI/180;const cut=add(geo(new T.BoxGeometry(.045,.009,.009)),dark,.05);cut.position.set(Math.cos(a)*.946,Math.sin(a)*.946,.05);cut.rotation.z=a+Math.PI/2;}
 function setOwner(side){owner=side;accent.color.set(side===null?'#dfc48a':owners[side]);}
 function setRotation(value){rotation=((value%6)+6)%6;for(let dir=0;dir<6;dir++)badges[dir].material.map=numberTexture(cardValue(dir));}
 return {group,setOwner,setRotation,setArtwork(texture){portraitMaterial.map=texture;portraitMaterial.needsUpdate=true;},artworkTexture:image,profile:p,get values(){return CATALOG.find(c=>c.id===p.ruleId).values.map((_,dir)=>cardValue(dir));},dispose(){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();}};
}
