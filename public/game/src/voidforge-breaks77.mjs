// Metre-scale missing corners reshape the outline; small edge chips remain secondary.
const breaks=[
 {plate:0,angle:.12,width:.065,depth:.38},
 {plate:1,angle:1.015,width:.13,depth:.76},
 {plate:2,angle:1.61,width:.135,depth:.83},
 {plate:2,angle:1.985,width:.088,depth:.56},
 {plate:3,angle:2.52,width:.14,depth:.80},
 {plate:3,angle:2.84,width:.067,depth:.43},
 {plate:4,angle:3.16,width:.09,depth:.68},
 {plate:5,angle:3.98,width:.07,depth:.50},
 {plate:6,angle:4.39,width:.13,depth:.86},
 {plate:6,angle:4.77,width:.11,depth:.69},
 {plate:6,angle:4.99,width:.055,depth:.39},
 {plate:7,angle:5.27,width:.055,depth:.60},
 {plate:8,angle:6.00,width:.075,depth:.56},
];
const profile=[[-1,0],[-.64,.12],[-.34,.84],[.12,1],[.43,.73],[.81,.10],[1,0]];
function insetAt(a,b){const t=(a-b.angle)/b.width;if(t<=-1||t>=1)return 0;for(let i=1;i<profile.length;i++)if(t<=profile[i][0]){const [x0,y0]=profile[i-1],[x1,y1]=profile[i];return b.depth*(y0+(y1-y0)*(t-x0)/(x1-x0));}return 0;}
export function outerBreakPoints(plate,start,end,coast,innerRadius){
 const local=breaks.filter(b=>b.plate===plate),angles=[];
 for(let k=1;k<8;k++)angles.push(start+(end-start)*k/8);
 for(const b of local)for(const [t]of profile){const a=b.angle+t*b.width;if(a>start+.0001&&a<end-.0001)angles.push(a);}
 angles.sort((a,b)=>a-b);const unique=angles.filter((a,i)=>!i||a-angles[i-1]>.00001);
 const points=unique.map(a=>{
  const inset=Math.max(0,...local.map(b=>insetAt(a,b)));
  const r=Math.max(innerRadius(a,plate)+.15,coast(a)-inset+.025*Math.sin(a*43+plate));
  return [Math.cos(a)*r,Math.sin(a)*r];
 });
 return {points,breakCount:local.length};
}
