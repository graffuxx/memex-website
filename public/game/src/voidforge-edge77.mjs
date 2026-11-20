const protectedSeats=[[-4.25,-2.7],[4.10,-2.9],[4.7,2.6]];
function generator(seed){let state=seed>>>0;return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}

// Fixed random seed keeps the sculpt stable. Damage changes the solid's silhouette,
// including its exposed walls; it is not a texture/decal or a ring of added stones.
export function chipBoundary(points,plate,edges={outerStart:5,outerEnd:12,rightStart:13,rightEnd:17}){
 const random=generator(74039+plate*2909),out=[],bites=[];
 const center=points.reduce((v,p)=>[v[0]+p[0]/points.length,v[1]+p[1]/points.length],[0,0]);
 for(let i=0;i<points.length;i++){
  const a=points[i],b=points[(i+1)%points.length],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
  out.push(a);
  const outer=i>=edges.outerStart&&i<=edges.outerEnd,fault=(i<edges.outerStart||i>=edges.rightStart&&i<=edges.rightEnd)&&Math.hypot(mx,mz)>4.65;
  if(!outer&&!fault||length<.265)continue;
  if(protectedSeats.some(([x,z])=>Math.hypot(mx-x,mz-z)<.60))continue;
  const chance=outer?([2,3,6].includes(plate)?.68:.45):.28;
  if(random()>chance)continue;
  const tx=dx/length,tz=dz/length;let nx=-tz,nz=tx;
  if(nx*(center[0]-mx)+nz*(center[1]-mz)<0){nx=-nx;nz=-nz;}
  const width=Math.min(length*.75,(outer?.22:.16)+random()*(outer?.22:.11));
  const depth=outer?.13+random()*.23:.07+random()*.09;
  const span=width/length,t=span*.5+.06+random()*(1-span-.12),start=t-span*.5,end=t+span*.5;
  const at=(fraction,inset)=>[a[0]+dx*fraction+nx*inset,a[1]+dz*fraction+nz*inset];
  // Unequal fracture lips and a chipped floor give each missing bite a different profile.
  out.push(at(start,0),at(start+(end-start)*.20,depth*.64),at(start+(end-start)*(.48+random()*.15),depth),at(end-(end-start)*.11,depth*.23),at(end,0));
  bites.push({x:a[0]+dx*t,z:a[1]+dz*t,nx,nz,tx,tz,width,depth,plate,reach:.28+random()*.42,through:random()<.18});
 }
 return {points:out,bites};
}
