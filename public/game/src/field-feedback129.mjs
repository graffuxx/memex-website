import {eventFieldAt,abilityEdge} from './table-demo-rules.mjs?v=pigeon-pair-release';
import {cardOf,sideValue} from './rules.mjs';
export function fieldFeedback129(game,card,cell,previewDirection=null){
 const field=eventFieldAt(game,cell);
 const active=game.elementalTrial?abilityEdge(game,card,cell,{attacking:previewDirection!==null,direction:previewDirection})??abilityEdge(game,card,cell):null;
 const effects=[active&&{dir:active.dir,ability:card.ability}].filter(Boolean);
 const bonuses=Array.from({length:6},(_,dir)=>{
  if(sideValue(card,dir)===10)return 0;
  const fieldBonus=field?.type==='resonance'&&field.element===cardOf(card).element||field?.type==='crossfire'&&field.directions.includes(dir)?1:0;
  return fieldBonus+(active?.dir===dir?active.amount:0);
 });
 return {silenced:Boolean(field?.type==='silence'&&card.ability),bonuses,...(effects.length?{effects}:{})};
}
