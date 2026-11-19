import * as T from '../vendor/three.module.min.js';

export function paintedDrawDeckPose(width,height,index=0){
 const narrow=width<500,compact=width<700,medium=width<950;
 const plinthWidth=narrow?120:compact?160:medium?195:225;
 const x=narrow?width-68:Math.min(width-plinthWidth/2-18,width/2+300);
 const y=height-(narrow?86:compact?113:111),h=narrow?70:compact?82:104;
 return {x:x+index*1.3,y:y+index*1.3,z:45-index*.5,h,plinthWidth,labelY:Math.min(height-35,y+plinthWidth/1.5*.62+6),quaternion:new T.Quaternion().setFromEuler(new T.Euler(-22*Math.PI/180,Math.PI,.07))};
}

export function paintedOpponentDeckPose(width,height,index=0){
 const narrow=width<500,compact=width<700,plinthWidth=narrow?110:compact?135:165;
 const x=Math.min(width-plinthWidth/2-12,width/2+(compact?205:300)),y=narrow?68:62,h=narrow?58:compact?68:76;
 return {x:x+index*1.3,y:y+index*1.3,z:45-index*.5,h,plinthWidth,labelY:y+plinthWidth/1.5*.62+5,quaternion:new T.Quaternion().setFromEuler(new T.Euler(-22*Math.PI/180,Math.PI,-.06))};
}

export async function createPaintedDeckPlinth(renderer){
 const texture=await new T.TextureLoader().loadAsync(new URL('../assets/arenas/home-rift-v25/deck-shelf.webp',import.meta.url).href);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());
 const root=new T.Group();root.name='Draw deck / painted rock plinth';root.visible=false;
 const geometry=new T.PlaneGeometry(1,1),material=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}),plinth=new T.Mesh(geometry,material);plinth.position.z=12;root.add(plinth);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,8,32,32,32);gradient.addColorStop(0,'#08051066');gradient.addColorStop(.58,'#08051044');gradient.addColorStop(1,'#08051000');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
 const shadowTexture=new T.CanvasTexture(canvas),shadowMaterial=new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,toneMapped:false}),shadow=new T.Mesh(geometry,shadowMaterial);shadow.position.z=20;root.add(shadow);let cards=0;
 return {root,setVisible(value){root.visible=value;},setCount(count){cards=count;shadow.visible=cards>0;},layout(width,height,pose){
  const w=pose.plinthWidth,h=w/(texture.image.width/texture.image.height),left=pose.x-w*.5,top=pose.y-h*.38;
  plinth.position.set(left+w/2-width/2,height/2-top-h/2,12);plinth.scale.set(w,h,1);
  shadow.position.set(pose.x+2-width/2,height/2-pose.y-5,20);shadow.scale.set(pose.h*1.04,pose.h*.87,1);shadow.visible=cards>0;
 },dispose(){root.removeFromParent();geometry.dispose();material.dispose();texture.dispose();shadowMaterial.dispose();shadowTexture.dispose();root.clear();}};
}
