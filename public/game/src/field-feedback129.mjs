import {eventFieldAt} from './table-demo-rules.mjs';
import {cardOf,sideValue} from './rules.mjs';
export function fieldFeedback129(game,card,cell){const f=eventFieldAt(game,cell);return {silenced:Boolean(f?.type==='silence'&&card.ability),bonuses:Array.from({length:6},(_,dir)=>sideValue(card,dir)===10?0:f?.type==='resonance'&&f.element===cardOf(card).element||f?.type==='crossfire'&&f.directions.includes(dir)?1:0)};}
