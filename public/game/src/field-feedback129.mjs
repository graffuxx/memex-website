import {printedValue126} from '../platform/card-ranks126.mjs';
import {eventFieldAt,abilityEdge,wardEdge,awkwardEdges,jamActive} from './table-demo-rules.mjs?v=tactical-rework';
import {cardOf,sideValue} from './rules.mjs?v=tactical-rework';
export function fieldFeedback129(game,card,cell,previewDirection=null){
 const field=eventFieldAt(game,cell);
 const active=game.elementalTrial?abilityEdge(game,card,cell,{attacking:previewDirection!==null,direction:previewDirection})??abilityEdge(game,card,cell):null;
 const ward=game.elementalTrial&&wardEdge(game,card,cell);
 const mark=game.elementalTrial&&awkwardEdges(game,card,cell);
 const weakened=mark?.active?mark.dirs.map(dir=>({dir,ability:'awkward'})):[];
 const effects=[active&&{dir:active.dir,ability:card.ability},ward&&{dir:ward.dir,ability:ward.kind},...weakened].filter(Boolean);
 const bonuses=Array.from({length:6},(_,dir)=>{
  if(sideValue(card,dir)===10)return 0;
  const fieldBonus=field?.type==='resonance'&&field.element===cardOf(card).element||field?.type==='crossfire'&&field.directions.includes(dir)?1:0;
  const bonus=fieldBonus+Math.max(active?.dir===dir?active.amount:0,ward?.dir===dir?ward.amount:0);
  return mark?.active&&mark.dirs.includes(dir)?Math.max(1-sideValue(card,dir),bonus-mark.amount):bonus;
 });
 const values=card.edgeSwap||card.edgeCopy||card.edgeWear||card.betaEdges?Array.from({length:6},(_,dir)=>sideValue(card,dir)):null;
 return {silenced:Boolean((field?.type==='silence'||jamActive(game,card))&&card.ability),bonuses,...(values?{values}:{}),...(effects.length?{effects}:{})};
}


// Keep S distinct from a numbered edge whose bonus happens to bring it to 10.
export function displayedEdgeValue129(base,{value=base,bonus=0,total}={}){
 const effective=total??value+bonus;
 const changed=effective!==base;
 return {label:base===10||!changed?printedValue126(base):String(effective),changed:base!==10&&changed};
}

export function previewEdgeTotals129(plan,defenderCell=null){
 const totals=[];
 for(const comparison of plan?.comparisons??[]){
  if(comparison.roundhouse){
   const {source,dir}=comparison;
   if(defenderCell===source)totals[dir]=comparison.attack.total;
   if(defenderCell===comparison.cell)totals[(dir+3)%6]=comparison.defend.total;
  }else if(comparison.pincer&&plan.pincer){
   const {source,dir}=plan.pincer;
   if(defenderCell===source)totals[dir]=comparison.attack.total;
   if(defenderCell===comparison.cell)totals[(dir+3)%6]=comparison.defend.total;
  }else if(comparison.sandwich&&plan.sandwich?.rearAttack){
   const {source,sourceDir}=plan.sandwich;
   if(defenderCell===source)totals[sourceDir]=comparison.attack.total;
   if(defenderCell===comparison.cell)totals[(sourceDir+3)%6]=comparison.defend.total;
  }else if(defenderCell===null){
   if(!comparison.pursuit&&!comparison.source)totals[comparison.dir]=comparison.attack.total;
  }else if(defenderCell===comparison.cell){
   totals[(comparison.dir+3)%6]=comparison.defend.total;
  }
 }
 return totals;
}
