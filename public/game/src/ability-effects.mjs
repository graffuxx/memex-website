import {abilityEdge,guardActive,guardBonus,laughActive} from './table-demo-rules.mjs?v=encore-pair-release';

const SVG='http://www.w3.org/2000/svg';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const interpolate=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const coordinates=p=>`${p.x},${p.y}`;

export function abilityMarkers(game,plan){
 if(!game?.abilityTrial)return [];
 const markers=[];
 if(game.elementalTrial){
  for(const [cell,card] of Object.entries(game.board)){
   const edge=abilityEdge(game,card,cell);
   if(edge)markers.push({kind:card.ability,cell,dir:edge.dir,label:`+${edge.amount}`});
   if(laughActive(game,card,cell))markers.push({kind:'laugh',cell,label:'='});
  }
  if(plan?.ability){
   const working={...game,board:plan.board};
   const edge=abilityEdge(working,plan.card,plan.cell,{attacking:true,direction:plan.abilityDirection})??abilityEdge(working,plan.card,plan.cell);
   if(edge)markers.push({kind:plan.ability,cell:plan.cell,dir:edge.dir,preview:true,label:`+${edge.amount}`});
   for(const target of plan.transforms)markers.push({kind:plan.ability,cell:target.cell,preview:true,label:'↻'});
   if(plan.relocation){
    markers.push({kind:'sidestep',cell:plan.relocation.from,preview:true,label:'↗'});
    markers.push({kind:'sidestep',cell:plan.relocation.to,preview:true,label:'◆'});
   }

   if(plan.pivot)markers.push({kind:'encore',cell:plan.cell,preview:true,label:plan.pivot.to===(plan.pivot.from+5)%6?'↶':'↻'});
   if(plan.swipe)markers.push({kind:'swipe',cell:plan.swipe.cell,dir:(plan.swipe.dir+3)%6,preview:true,label:`−${plan.swipe.amount}`});
   if(plan.rainbow)markers.push({kind:'rainbow',cell:plan.cell,dir:plan.rainbow.dir,preview:true,label:'⌒'});
  }
  return markers;
 }
 for(const [cell,card] of Object.entries(game.board)){
  if(guardActive(game,card,cell))markers.push({kind:'guard',cell,dir:card.guardDirection,label:`+${guardBonus(game)}`});
 }
 if(plan?.ability==='hype'||plan?.ability==='guard'){
  markers.push({
   kind:plan.ability,cell:plan.cell,dir:plan.abilityDirection,preview:true,
   label:plan.ability==='guard'?`+${guardBonus(game)}`:'+1',
  });
 }
 for(const target of plan?.transforms??[])markers.push({kind:'twist',cell:target.cell,preview:true,label:'↻'});
 return markers;
}

export function abilityBursts(game){
 const last=game?.last;
 if(!game?.abilityTrial||last?.type!=='place'||last.suppressed)return [];
 if(game.elementalTrial){
  const {ability,abilityEdge:edge}=last;
  const markers=(last.tieBlocks??[]).map(stop=>({kind:'laugh',...stop,label:'='}));
  if(last.relocation)markers.push({kind:'sidestep',cell:last.relocation.to,label:'↗'});
  if(last.swipe)markers.push({kind:'swipe',cell:last.swipe.cell,dir:(last.swipe.dir+3)%6,label:`−${last.swipe.amount}`});
  if(last.rainbow)markers.push({kind:'rainbow',cell:last.rainbow.cell,dir:(last.rainbow.dir+3)%6,label:'⌒'});
  if(edge)markers.push({kind:ability,cell:last.cell,dir:edge.dir,label:`+${edge.amount}`});
  return [...markers,...(last.transforms??[]).map(target=>({kind:ability,cell:target.cell,label:ability==='encore'&&(target.to-target.from+6)%6===5?'↶':'↻'}))];
 }
 if(last.ability==='hype'||last.ability==='guard'){
  return [{kind:last.ability,cell:last.cell,dir:last.abilityDirection,label:last.ability==='guard'?`+${guardBonus(game)}`:'+1'}];
 }
 return (last.transforms??[]).map(target=>({kind:'twist',cell:target.cell,label:'↻'}));
}

/** Match each axial direction to its projected hex edge, even when the camera orbits. */
export function abilityMarkerGeometry(points,direction){
 const center={x:points.reduce((sum,p)=>sum+p.x,0)/6,y:points.reduce((sum,p)=>sum+p.y,0)/6};
 if(direction===undefined)return {center,points};
 const edge=[points[direction],points[(direction+1)%6]];
 const midpoint=interpolate(edge[0],edge[1],.5);
 return {center:interpolate(center,midpoint,1.10),points:[interpolate(...edge,.17),interpolate(...edge,.83)]};
}

export function createAbilityEffects(layer){
 const nodes=new Map();
 let bursts=[],timer=null,lastPaint=null;

 function svg(tag){return layer.ownerDocument.createElementNS(SVG,tag);}
 function create(marker){
  const root=svg('g'),stroke=svg('polyline'),badge=svg('path'),text=svg('text');
  root.dataset.ability=marker.kind;
  root.dataset.state=marker.burst?'burst':marker.preview?'preview':'active';
  root.append(stroke,badge,text);
  layer.append(root);
  return {root,stroke,badge,text};
 }
 function paint(game,plan,project){
  lastPaint=[game,plan,project];
  const keys=new Set();
  for(const marker of [...abilityMarkers(game,plan),...bursts]){
   const key=[marker.kind,marker.cell,marker.dir,marker.burst?'burst':marker.preview?'preview':'active'].join(':');
   keys.add(key);
   if(!nodes.has(key))nodes.set(key,create(marker));
   const {stroke,badge,text}=nodes.get(key),geometry=abilityMarkerGeometry(project(marker.cell),marker.dir);
   const {x,y}=geometry.center,size=clamp(Math.hypot(geometry.points[0].x-geometry.points[1].x,geometry.points[0].y-geometry.points[1].y)*.23,9,14);
   stroke.setAttribute('points',(marker.dir===undefined?[...geometry.points,geometry.points[0]]:geometry.points).map(coordinates).join(' '));
   badge.setAttribute('d',['guard','water','earth','solitude'].includes(marker.kind)
    ?`M ${x-size} ${y-size*.75} h ${size*2} v ${size} l ${-size} ${size*.6} l ${-size} ${-size*.6} Z`
    :`M ${x} ${y-size} l ${size} ${size} l ${-size} ${size} l ${-size} ${-size} Z`);
   text.setAttribute('x',x);text.setAttribute('y',y);text.textContent=marker.label;
  }
  for(const [key,{root}] of nodes)if(!keys.has(key)){root.remove();nodes.delete(key);}
 }
 function clear(){
  clearTimeout(timer);bursts=[];lastPaint=null;
  for(const {root} of nodes.values())root.remove();
  nodes.clear();
 }
 return {paint,clear,burst(game){
  const markers=abilityBursts(game);
  if(!markers.length||!lastPaint)return;
  clearTimeout(timer);
  for(const [key,{root}] of nodes)if(root.dataset.state==='burst'){root.remove();nodes.delete(key);}
  bursts=markers.map(marker=>({...marker,burst:true}));
  paint(...lastPaint);
  timer=setTimeout(()=>{bursts=[];if(lastPaint)paint(...lastPaint);},520);
 }};
}
