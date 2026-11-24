import {eventFieldAt,abilityEdge,wardEdge,awkwardEdges,jamActive} from './table-demo-rules.mjs?v=final-guard';
import {cardOf,sideValue} from './rules.mjs?v=final-guard';
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
 const values=card.edgeSwap||card.edgeCopy?Array.from({length:6},(_,dir)=>sideValue(card,dir)):null;
 return {silenced:Boolean((field?.type==='silence'||jamActive(game,card))&&card.ability),bonuses,...(values?{values}:{}),...(effects.length?{effects}:{})};
}
