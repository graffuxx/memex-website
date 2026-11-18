import * as T from '../vendor/three.module.min.js';
import {CATALOG,sideValue} from './rules.mjs';
import {FRAME_LAYOUT,valuePosition} from './card-layout21.mjs';
export {cardShape,cardPoints} from './card-prototype.mjs?v=classics-v04';
import {cardShape} from './card-prototype.mjs?v=classics-v04';

export const CARD_PROFILES={
 pepe:{id:'pepe',name:'Pepe',ruleId:'oracle',element:'storm',asset:'../assets/cards/v03/overthinker-thinking-pepe.webp'},
 doge:{id:'doge',name:'Doge',ruleId:'brain',element:'fire',asset:'../assets/cards/frame-v21/swollen-doge.webp'},
 'roll-safe':{id:'roll-safe',name:'Roll Safe',ruleId:'trust',element:'stone',asset:'../assets/cards/v04/roll-safe.webp'}
};
export const CARD_SPEC={radius:1,bodyDepth:.045,bevel:.009,socketY:FRAME_LAYOUT.abilityY,symbolSize:.245};
const artGeometry=()=>{
 const g=new T.ShapeGeometry(cardShape(.96)),p=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/1.92+.5,p.getY(i)/1.92+.5);
 return g;
};
function canvasTexture(draw,width=256,height=width){
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;draw(canvas.getContext('2d'),width,height);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;return texture;
}
export async function createCardPrototype({owner=null,rotation=0,profile='pepe'}={}){
 if(!Object.hasOwn(CARD_PROFILES,profile))throw Error('Unbekanntes Kartenmuster.');
 const p=CARD_PROFILES[profile],group=new T.Group(),geometries=new Set(),materials=new Set(),textures=new Set();
 group.name='Duelverse / '+p.name+' / homepage frame';
 const geo=g=>(geometries.add(g),g),mat=m=>(materials.add(m),m),tex=t=>(textures.add(t),t);
 const add=(geometry,material,z=0)=>{const mesh=new T.Mesh(geometry,material);mesh.position.z=z;group.add(mesh);return mesh;};
 const load=async path=>{const texture=await new T.TextureLoader().loadAsync(new URL(path,import.meta.url).href);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;return tex(texture);};
 const [image,frame,back]=await Promise.all([load(p.asset),load('../assets/cards/frame-v21/navy-gold-frame.webp'),load('../assets/cards/frame-v21/memex-back.webp')]);
 const metal=mat(new T.MeshStandardMaterial({color:'#142a43',metalness:.65,roughness:.3}));
 const body=geo(new T.ExtrudeGeometry(cardShape(),{depth:CARD_SPEC.bodyDepth,bevelEnabled:true,bevelSegments:3,bevelSize:.009,bevelThickness:.006,steps:1}));body.translate(0,0,-CARD_SPEC.bodyDepth/2);
 add(body,metal).castShadow=true;
 // Portrait, cutout frame and live values remain separate layers.
 const portraitMaterial=mat(new T.MeshBasicMaterial({map:image,toneMapped:false}));add(geo(artGeometry()),portraitMaterial,.034);
 add(geo(new T.PlaneGeometry(FRAME_LAYOUT.width,FRAME_LAYOUT.height)),mat(new T.MeshBasicMaterial({map:frame,transparent:true,alphaTest:.025,toneMapped:false})),.045);
 const rear=add(geo(new T.PlaneGeometry(2.048,2.048)),mat(new T.MeshBasicMaterial({map:back,transparent:true,alphaTest:.025,toneMapped:false})),-.036);rear.rotation.y=Math.PI;
 const numberTextures=new Map(),badges=[];
 const numberTexture=n=>{
  if(!numberTextures.has(n))numberTextures.set(n,tex(canvasTexture((ctx,w)=>{
   ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`800 ${w*.86}px Arial,sans-serif`;
   ctx.shadowColor='#fff0a0';ctx.shadowOffsetY=1;ctx.fillStyle='#17150d';ctx.fillText(String(n),w/2,w*.54);
  })));
  return numberTextures.get(n);
 };
 const numberGeometry=geo(new T.PlaneGeometry(.232,.232));
 for(let dir=0;dir<6;dir++){
  const [x,y]=valuePosition(dir),numeric=add(numberGeometry,mat(new T.MeshBasicMaterial({map:numberTexture(sideValue({id:p.ruleId,rotation},dir)),transparent:true,depthWrite:false,toneMapped:false})),.063);
  numeric.position.set(x,y,.063);badges.push(numeric);
 }
 const titleTexture=tex(canvasTexture((ctx,w,h)=>{
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='800 78px Arial,sans-serif';ctx.fillStyle='#19170f';ctx.fillText(p.name.toUpperCase(),w/2,h*.53,w*.9);
 },768,108));
 const title=add(geo(new T.PlaneGeometry(FRAME_LAYOUT.titleWidth,FRAME_LAYOUT.titleHeight)),mat(new T.MeshBasicMaterial({map:titleTexture,transparent:true,depthWrite:false,toneMapped:false})),.064);title.position.y=FRAME_LAYOUT.titleY;
 const elementTexture=tex(canvasTexture((ctx,w)=>{
  const gradient=ctx.createLinearGradient(0,w*.1,0,w*.92);gradient.addColorStop(0,p.element==='storm'?'#fff3c2':p.element==='stone'?'#f7e7ae':'#fff07a');gradient.addColorStop(1,p.element==='storm'?'#a49aff':p.element==='stone'?'#b98a40':'#ff8d12');ctx.fillStyle=gradient;ctx.strokeStyle='#ffd876';ctx.lineWidth=5;ctx.shadowColor=p.element==='storm'?'#907aff':'#ff9a28';ctx.shadowBlur=15;
  ctx.beginPath();
  if(p.element==='fire'){ctx.moveTo(w*.54,w*.08);ctx.bezierCurveTo(w*.44,w*.4,w*.86,w*.42,w*.76,w*.72);ctx.bezierCurveTo(w*.61,w*.97,w*.22,w*.98,w*.21,w*.65);ctx.bezierCurveTo(w*.20,w*.46,w*.40,w*.33,w*.54,w*.08);}
  else if(p.element==='stone'){ctx.moveTo(w*.5,w*.1);ctx.lineTo(w*.82,w*.5);ctx.lineTo(w*.5,w*.9);ctx.lineTo(w*.18,w*.5);}
  else {ctx.moveTo(w*.59,w*.08);ctx.lineTo(w*.23,w*.54);ctx.lineTo(w*.46,w*.54);ctx.lineTo(w*.36,w*.92);ctx.lineTo(w*.79,w*.42);ctx.lineTo(w*.53,w*.42);}
  ctx.closePath();ctx.fill();ctx.stroke();
 }));
 const element=add(geo(new T.PlaneGeometry(.245,.245)),mat(new T.MeshBasicMaterial({map:elementTexture,transparent:true,depthWrite:false,toneMapped:false})),.065);element.position.y=FRAME_LAYOUT.elementY;
 const accent=new T.LineLoop(geo(new T.BufferGeometry().setFromPoints(cardShape(1.007).getPoints().map(v=>new T.Vector3(v.x,v.y,.048)))),mat(new T.LineBasicMaterial({color:owner===1?'#ff5d72':'#55ed94',toneMapped:false})));accent.visible=owner!==null;group.add(accent);
 return {group,profile:p,artworkTexture:image,setArtwork(texture){portraitMaterial.map=texture;},setOwner(side){accent.visible=side!==null;accent.material.color.set(side===1?'#ff5d72':'#55ed94');},setRotation(value){rotation=((value%6)+6)%6;badges.forEach((badge,dir)=>{badge.material.map=numberTexture(sideValue({id:p.ruleId,rotation},dir));});},get values(){return CATALOG.find(c=>c.id===p.ruleId).values.map((_,dir)=>sideValue({id:p.ruleId,rotation},dir));},dispose(){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();}};
}
