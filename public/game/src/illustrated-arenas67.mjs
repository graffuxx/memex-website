import * as T from '../vendor/three.module.min.js';

const make=(id,name,corners,color)=>Object.freeze({id,name,width:1536,height:1024,angle:-120,asset:`../assets/arenas/illustrated-v67/${id}.webp`,corners:Object.freeze(corners.map(p=>Object.freeze(p))),color});
export const ILLUSTRATED_ARENAS=Object.freeze({
 city:make('city','Geisterstadt',[[554,161],[982,161],[1190,486],[983,821],[555,821],[340,486]],'#9fead8'),
 lava:make('lava','Lava-Abgrund',[[554,162],[980,162],[1198,486],[979,820],[556,820],[335,486]],'#ffad52'),
 ruins:make('ruins','Vergessene Ruinen',[[541,151],[996,151],[1208,487],[991,836],[542,836],[299,487]],'#ffd5a2'),
 cosmos:make('cosmos','Kosmische Festung',[[542,146],[983,146],[1207,471],[983,826],[533,826],[303,471]],'#a6cbff')
});
export const isIllustratedArena=id=>Object.hasOwn(ILLUSTRATED_ARENAS,id);
export const ILLUSTRATED_ZOOM=Object.freeze({min:.85,max:1.12});
function solve(a,b){const n=b.length,m=a.map((r,i)=>[...r,b[i]]);for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.abs(m[i][k])>Math.abs(m[p][k]))p=i;[m[k],m[p]]=[m[p],m[k]];const q=m[k][k];if(Math.abs(q)<1e-12)throw Error('Invalid arena calibration.');for(let j=k;j<=n;j++)m[k][j]/=q;for(let i=0;i<n;i++)if(i!==k){const f=m[i][k];for(let j=k;j<=n;j++)m[i][j]-=f*m[k][j];}}return m.map(r=>r[n]);}
export function floorHomography67(points,angle=-120){const a=[],b=[];for(let i=0;i<6;i++){const theta=(angle+i*60)*Math.PI/180,x=Math.cos(theta)*5.2,z=Math.sin(theta)*5.2,[u,v]=points[i];a.push([x,z,1,0,0,0,-u*x,-u*z],[0,0,0,x,z,1,-v*x,-v*z]);b.push(u,v);}const ata=Array.from({length:8},(_,i)=>Array.from({length:8},(_,j)=>a.reduce((s,r)=>s+r[i]*r[j],0))),atb=Array.from({length:8},(_,i)=>a.reduce((s,r,k)=>s+r[i]*b[k],0));return [...solve(ata,atb),1];}
export function createIllustratedCamera67(){const camera=new T.Camera();camera.name='Calibrated illustrated arena';camera.userData.illustrated=true;
 // The calibrated projection is expressed in world axes; expose the physical viewing direction to card finishes.
 camera.getWorldDirection=out=>out.set(0,-.93,-.37).normalize();return camera;}
export function fitIllustratedCamera67(camera,width,height,id,requested=1){
 const arena=ILLUSTRATED_ARENAS[id];if(!arena)throw Error('Unknown illustrated arena.');
 const value=T.MathUtils.clamp(Number.isFinite(requested)?requested:1,ILLUSTRATED_ZOOM.min,ILLUSTRATED_ZOOM.max),xs=arena.corners.map(p=>p[0]),ys=arena.corners.map(p=>p[1]);
 const floorWidth=Math.max(...xs)-Math.min(...xs),floorHeight=Math.max(...ys)-Math.min(...ys),scale=Math.min((width-48)/floorWidth,(height-28)/floorHeight)*value;
 const art={left:(width-arena.width*scale)/2,top:height*.50-(Math.min(...ys)+Math.max(...ys))/2*scale,width:arena.width*scale,height:arena.height*scale};
 const points=arena.corners.map(([x,y])=>[(art.left+x*scale)/width*2-1,1-(art.top+y*scale)/height*2]),h=floorHomography67(points,arena.angle);
 camera.projectionMatrix.set(h[0],0,h[1],h[2],h[3],.12,h[4],h[5]-.12*.235,0,-.025,0,0,h[6],0,h[7],1);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();camera.updateMatrixWorld();
 return {art,value,min:ILLUSTRATED_ZOOM.min,max:ILLUSTRATED_ZOOM.max,pan:{x:0,y:0},canPan:false};
}
export function insideArtworkFloor67(arena,u,v,margin=0){const cx=arena.corners.reduce((s,p)=>s+p[0],0)/6/arena.width,cy=arena.corners.reduce((s,p)=>s+p[1],0)/6/arena.height;const pts=arena.corners.map(([x,y])=>[cx+(x/arena.width-cx)*(1+margin),cy+(y/arena.height-cy)*(1+margin)]);let positive=false,negative=false;for(let i=0;i<6;i++){const a=pts[i],b=pts[(i+1)%6],cross=(b[0]-a[0])*(v-a[1])-(b[1]-a[1])*(u-a[0]);if(cross>1e-9)positive=true;if(cross< -1e-9)negative=true;}return !(positive&&negative);}
