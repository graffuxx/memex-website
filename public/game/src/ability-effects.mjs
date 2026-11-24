import {blockadeLocked,sideValue} from './rules.mjs?v=final-guard';
import {abilityEdge,wardEdge,awkwardEdges,pabloWaiting,jamActive,effectStrength,AMBUSH_BONUS,PHALANX_BONUS,phalanxFormations,abilityAt,clingPartner,guardActive,guardBonus,laughActive} from './table-demo-rules.mjs?v=storm-tie-shield';

const SVG='http://www.w3.org/2000/svg';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const interpolate=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const turnArrow=({from,to})=>(to-from+6)%6===5?'↶':'↻';
const coordinates=p=>`${p.x},${p.y}`;

export function abilityMarkers(game,plan,{finalGuardLabel='SCHLUSSSCHUTZ',blinkLabel='BLINZLER',tieShieldLabel='SCHUTZ BEI PATT'}={}){
 const markers=[];
 const saved=game?.last?.finalGuard;
 if(saved)markers.push({kind:'final-guard',cell:saved.cell,label:finalGuardLabel});
 else if(plan?.finalGuard)markers.push({kind:'final-guard',cell:plan.finalGuard.cell,preview:true,label:finalGuardLabel});
 if(!game?.abilityTrial)return markers;
 if(game.elementalTrial){
  if(blockadeLocked(game))markers.push({kind:'gate',cell:game.block,label:'⊣'});
  for(const [cell,card] of Object.entries(game.board)){
   const edge=abilityEdge(game,card,cell);
   const ward=wardEdge(game,card,cell);
   const mark=awkwardEdges(game,card,cell);
   if(edge&&ward?.dir!==edge.dir&&!mark?.dirs.includes(edge.dir))markers.push({kind:card.ability,cell,dir:edge.dir,label:`+${edge.amount}`});
   if(card.ability==='bailout'&&!card.bailoutSpent&&!jamActive(game,card))markers.push({kind:'bailout',cell,label:'❖'});
   if(abilityAt(game,card,cell)==='blink'&&!card.blinkSpent&&plan?.blink?.source!==cell)markers.push({kind:'blink',cell,label:'⟳'});
   if(abilityAt(game,card,cell)==='cling'&&clingPartner(game,cell,card))markers.push({kind:'cling',cell,label:'∞'});
   if(jamActive(game,card))markers.push({kind:'jam',cell,label:'⌧'});
   if(pabloWaiting(game,card,cell))markers.push({kind:'relay',cell,label:'⌛'});
   if(laughActive(game,card,cell))markers.push({kind:'laugh',cell,label:tieShieldLabel});
   if(ward&&!mark?.dirs.includes(ward.dir))markers.push({kind:ward.kind,cell,dir:ward.dir,label:`+${ward.amount}`});
   if(mark&&!mark.active)markers.push({kind:'awkward',cell,label:'…'});
   if(mark?.active)for(const dir of mark.dirs){
    const penalty=effectStrength(game,card,cell,dir,card).awkward;
    if(penalty)markers.push({kind:'awkward',cell,dir,label:`−${penalty}`});
   }
  }
  if(game.fanReserve&&game.placements<game.fanReserve.until)markers.push({kind:'fan',cell:game.fanReserve.cell,label:'⊠'});
  if(plan?.reserve)markers.push({kind:'fan',cell:plan.reserve,preview:true,label:'⊠'});
  if(plan?.bailout)markers.push({kind:'bailout',cell:plan.bailout.cell,dir:plan.bailout.dir,preview:true,label:'❖'});
  if(plan?.blink){
   markers.push({kind:'blink',cell:plan.blink.source,preview:true,label:blinkLabel});
   markers.push({kind:'blink',cell:plan.blink.cell,preview:true,label:'↻ 60°'});
  }
  if(plan?.link)markers.push({kind:'cling',cell:plan.link,preview:true,label:'∞'});
  if(plan?.attachment)markers.push({kind:'cling',cell:plan.attachment.cell,preview:true,label:'∞'});
  for(const formation of phalanxFormations(game)){
   for(const cell of formation.tiles)markers.push({kind:'phalanx',cell,label:formation.ready?'⇧':'◇'});
  }
  for(const cell of plan?.phalanx?.tiles??[])markers.push({kind:'phalanx',cell,preview:true,label:'⇧'});
  if(plan?.rally)markers.push({kind:'phalanx',cell:plan.cell,dir:plan.rally.dir,preview:true,label:`+${PHALANX_BONUS}`});
  if(plan?.pincer)markers.push({kind:'pincer',cell:plan.pincer.source,dir:plan.pincer.dir,preview:true,label:'⤢'});
  if(plan?.relay&&plan.swapCells)for(const cell of plan.swapCells)markers.push({kind:'relay',cell,preview:true,label:'⇆'});
  if(plan?.ability){
   const working={...game,board:plan.board};
   const edge=abilityEdge(working,plan.card,plan.cell,{attacking:true,direction:plan.abilityDirection})??abilityEdge(working,plan.card,plan.cell);
   if(edge)markers.push({kind:plan.ability,cell:plan.cell,dir:edge.dir,preview:true,label:`+${edge.amount}`});
   if(plan.bid!=null)markers.push({kind:'bid',cell:plan.cell,dir:plan.bid,preview:true,label:'+1'});
   if(plan.decoy)markers.push({kind:'decoy',...plan.decoy,preview:true,label:`−${plan.decoy.amount}`});
   if(plan.pursuit)markers.push({kind:'chase',...plan.pursuit,preview:true,label:'»'});
   for(const target of plan.transforms)markers.push({kind:plan.ability,cell:target.cell,preview:true,label:turnArrow(target)});
   if(plan.blockadeMove)markers.push({kind:plan.dash?'dash':'rage',cell:plan.blockadeMove.to,preview:true,label:plan.dash?'»':'◆'});
   if(plan.swapCells&&!plan.relay)for(const cell of plan.swapCells)markers.push({kind:plan.ability,cell,preview:true,label:'⇄'});
   if(plan.objection)markers.push({kind:'objection',...plan.objection,preview:true,label:'!'});
   if(plan.awkward)for(const dir of plan.awkward.dirs)markers.push({kind:'awkward',cell:plan.awkward.cell,dir,preview:true,label:'…'});
   if(plan.ambush!=null)markers.push({kind:'ambush',cell:plan.cell,dir:plan.ambush,preview:true,label:`+${AMBUSH_BONUS}`});
   if(plan.jam)markers.push({kind:'jam',cell:plan.jam,preview:true,label:'⌧'});
   if(plan.sandwich){
    markers.push({kind:'sandwich',cell:plan.cell,dir:plan.sandwich.dir,preview:true,label:`+${plan.sandwich.amount}`});
    markers.push({kind:'sandwich',cell:plan.sandwich.source,dir:plan.sandwich.sourceDir,preview:true,label:'⟫'});
   }
   if(plan.nested)markers.push({kind:'nested',cell:plan.cell,dir:plan.nested.dir,preview:true,label:String(plan.nested.value)});
   if(plan.pivot)markers.push({kind:plan.ability,cell:plan.pivot.cell,preview:true,label:turnArrow(plan.pivot)});
   if(plan.blockadeLock)markers.push({kind:'gate',cell:game.block,preview:true,label:'⊣'});
   if(plan.valueSwap)for(const dir of plan.valueSwap)markers.push({kind:'luxury',cell:plan.cell,dir,preview:true,label:String(sideValue(plan.card,dir))});
   if(plan.selfTurn)markers.push({kind:plan.ability,cell:plan.cell,preview:true,label:plan.selfTurn<0?'↶':'↻'});
   if(plan.relocation){
    markers.push({kind:plan.ability,cell:plan.relocation.from,preview:true,label:'↗'});
    markers.push({kind:plan.ability,cell:plan.relocation.to,preview:true,label:'◆'});
   }
   if(plan.rainbow)markers.push({kind:'rainbow',cell:plan.cell,dir:plan.rainbow.dir,preview:true,label:'⌒'});
   if(plan.swipe)markers.push({kind:'swipe',cell:plan.swipe.cell,dir:(plan.swipe.dir+3)%6,preview:true,label:`−${plan.swipe.amount}`});
   if(plan.ward)markers.push({kind:'ernie',...plan.ward,preview:true,label:'+1'});
   for(const ward of plan.coverWards??[])markers.push({kind:'cover',...ward,preview:true,label:`+${ward.amount??1}`});
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

export function abilityBursts(game,{blinkLabel='BLINZLER'}={}){
 const last=game?.last;
 if(!game?.abilityTrial||last?.type!=='place'||(last.suppressed&&!last.blink&&!last.attachment))return [];
 if(game.elementalTrial){
  const {ability,abilityEdge:edge}=last;
  const blocked=(last.tieBlocks??[]).map(stop=>({kind:'laugh',...stop,label:'='}));
  const played=[];
  if(last.blockadeMove)played.push({kind:last.dash?'dash':'rage',cell:last.blockadeMove.to,label:last.dash?'»':'◆'});
  if(last.waiting)played.push({kind:'relay',cell:last.cell,label:'⌛'});
  if(last.swapCells)for(const cell of last.swapCells)played.push({kind:last.relay?'relay':ability,cell,label:'⇄'});
  if(last.objection)played.push({kind:'objection',...last.objection,label:'!'});
  if(last.phalanx)for(const cell of last.phalanx.allies??[last.phalanx.ally])played.push({kind:'phalanx',cell,label:'⇧'});
  if(last.rally)played.push({kind:'phalanx',cell:last.cell,dir:last.rally.dir,label:`+${PHALANX_BONUS}`});
  if(last.pincer){
   played.push({kind:'pincer',cell:last.pincer.source,dir:last.pincer.dir,label:'⤢'});
   played.push({kind:'pincer',cell:last.pincer.cell,dir:(last.pincer.dir+3)%6,label:'✦'});
  }
  if(last.reserve)played.push({kind:'fan',cell:last.reserve,label:'⊠'});
  if(last.bailout)played.push({kind:'bailout',cell:last.bailout.cell,dir:last.bailout.dir,label:'❖'});
  if(last.blink){
   played.push({kind:'blink',cell:last.blink.source,label:blinkLabel});
   played.push({kind:'blink',cell:last.blink.cell,label:'↻ 60°'});
  }
  if(last.link)played.push({kind:'cling',cell:last.link,label:'∞'});
  if(last.attachment)for(const cell of [last.attachment.target,last.attachment.cell])played.push({kind:'cling',cell,label:'∞'});
  if(last.jam)played.push({kind:'jam',cell:last.jam,label:'⌧'});
  if(last.sandwich){
   played.push({kind:'sandwich',cell:last.cell,dir:last.sandwich.dir,label:`+${last.sandwich.amount}`});
   played.push({kind:'sandwich',cell:last.sandwich.source,dir:last.sandwich.sourceDir??(last.sandwich.dir+3)%6,label:'⟫'});
  }
  if(last.nested)played.push({kind:'nested',cell:last.cell,dir:last.nested.dir,label:String(last.nested.value)});
  if(last.awkward)played.push({kind:'awkward',cell:last.awkward.cell,label:'…'});
  if(last.relocation)played.push({kind:ability,cell:last.relocation.to,label:'↗'});
  if(last.rainbow)played.push({kind:'rainbow',cell:last.rainbow.cell,dir:(last.rainbow.dir+3)%6,label:'⌒'});
  if(last.swipe)played.push({kind:'swipe',cell:last.swipe.cell,dir:(last.swipe.dir+3)%6,label:`−${last.swipe.amount}`});
  if(last.decoy)played.push({kind:'decoy',...last.decoy,label:`−${last.decoy.amount}`});
  if(last.pursuit)played.push({kind:'chase',...last.pursuit,label:'»'});
  if(last.blockadeLock)played.push({kind:'gate',cell:game.block,label:'⊣'});
  if(last.valueSwap)for(const dir of last.valueSwap)played.push({kind:'luxury',cell:last.cell,dir,label:String(sideValue(game.board[last.cell],dir))});
  if(last.selfTurn)played.push({kind:ability,cell:last.cell,label:last.selfTurn<0?'↶':'↻'});
  if(last.ward)played.push({kind:'ernie',...last.ward,label:'+1'});
  for(const ward of last.coverWards??[])played.push({kind:'cover',...ward,label:`+${ward.amount??1}`});
  if(edge)played.push({kind:ability,cell:last.cell,dir:edge.dir,label:`+${edge.amount}`});
  for(const target of last.transforms??[])played.push({kind:ability,cell:target.cell,label:turnArrow(target)});
  return [...blocked,...played];
 }
 if(last.ability==='hype'||last.ability==='guard'){
  return [{kind:last.ability,cell:last.cell,dir:last.abilityDirection,label:last.ability==='guard'?`+${guardBonus(game)}`:'+1'}];
 }
 return (last.transforms??[]).map(target=>({kind:'twist',cell:target.cell,label:turnArrow(target)}));
}

/** Match each axial direction to its projected hex edge, even when the camera orbits. */
export function abilityMarkerGeometry(points,direction){
 const center={x:points.reduce((sum,p)=>sum+p.x,0)/6,y:points.reduce((sum,p)=>sum+p.y,0)/6};
 if(direction===undefined)return {center,points};
 const edge=[points[direction],points[(direction+1)%6]];
 const midpoint=interpolate(edge[0],edge[1],.5);
 return {center:interpolate(center,midpoint,1.10),points:[interpolate(...edge,.17),interpolate(...edge,.83)]};
}

export function createAbilityEffects(layer,options){
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
  for(const marker of [...abilityMarkers(game,plan,options),...bursts]){
   // The updated number is rendered in the original slot of the card.
   if(game?.elementalTrial&&marker.dir!==undefined&&/^[+−-]?\d+$/.test(marker.label))continue;
   const key=[marker.kind,marker.cell,marker.dir,marker.burst?'burst':marker.preview?'preview':'active'].join(':');
   keys.add(key);
   if(!nodes.has(key))nodes.set(key,create(marker));
   const {stroke,badge,text}=nodes.get(key),geometry=abilityMarkerGeometry(project(marker.cell),marker.dir);
   const {x,y}=geometry.center,size=clamp(Math.hypot(geometry.points[0].x-geometry.points[1].x,geometry.points[0].y-geometry.points[1].y)*.23,9,14);
   stroke.setAttribute('points',(marker.dir===undefined?[...geometry.points,geometry.points[0]]:geometry.points).map(coordinates).join(' '));
   const rotation=marker.label==='↻'||marker.label==='↶';
   nodes.get(key).root.toggleAttribute('data-rotation',rotation);
   if(rotation){
    const top=Math.max(18,Math.min(...geometry.points.map(point=>point.y))-7);
    badge.setAttribute('d',`M ${x} ${top-12} a 12 12 0 1 1 0 24 a 12 12 0 1 1 0 -24 Z`);
    text.setAttribute('x',x);text.setAttribute('y',top);text.textContent=marker.label;
    continue;
   }
   if(marker.kind==='final-guard'||(marker.kind==='blink'||marker.kind==='laugh')&&marker.label.length>1){
    const labelY=Math.max(14,Math.min(...geometry.points.map(point=>point.y))-8);
    const half=marker.label.length*3.7+8;
    badge.setAttribute('d',`M ${x-half+5} ${labelY-9} h ${2*half-10} q 5 0 5 5 v 8 q 0 5 -5 5 h ${10-2*half} q -5 0 -5 -5 v -8 q 0 -5 5 -5 Z`);
    text.setAttribute('x',x);text.setAttribute('y',labelY);text.textContent=marker.label;
    continue;
   }
   badge.setAttribute('d',['guard','water','earth','ernie','solitude','cover'].includes(marker.kind)
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
  const markers=abilityBursts(game,options);
  if(!markers.length||!lastPaint)return;
  clearTimeout(timer);
  for(const [key,{root}] of nodes)if(root.dataset.state==='burst'){root.remove();nodes.delete(key);}
  bursts=markers.map(marker=>({...marker,burst:true}));
  paint(...lastPaint);
  timer=setTimeout(()=>{bursts=[];if(lastPaint)paint(...lastPaint);},520);
 }};
}
