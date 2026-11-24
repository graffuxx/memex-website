import {cardOf} from './rules.mjs';

export function bindReleasedIconicControls(abilities,{english=false,onChange}){
 const label=document.createElement('label'),select=document.createElement('select');
 label.append(english?'Move an allied card':'Eigene Karte verschieben',select);
 const encoreLabel=document.createElement('label'),encore=document.createElement('select');
 encoreLabel.append(english?'Rotate Epic Sax Guy':'Epic Sax Guy drehen',encore);
 encore.append(new Option(english?'Keep orientation':'Ausrichtung behalten','0'),
  new Option(english?'↶ 60° counterclockwise':'↶ 60° nach links','-1'),
  new Option(english?'↻ 60° clockwise':'↻ 60° nach rechts','1'));
 label.hidden=encoreLabel.hidden=true;
 abilities.append(label,encoreLabel);
 let cells=null,pivotDirection=0;
 encore.onchange=()=>{pivotDirection=Number(encore.value);onChange();};
 select.onchange=()=>{cells=select.value?select.value.split('|'):null;onChange();};
 return {
  clear(){cells=null;pivotDirection=0;},
  set(action){cells=action.stepCells??null;pivotDirection=action.pivotDirection??0;},
  action(){return {stepCells:cells,pivotDirection};},
  update(game,card,plan,busy){
   encoreLabel.hidden=card?.ability!=='encore';
   encore.disabled=busy||!plan?.pivotTarget;
   encore.value=String(pivotDirection);
   label.hidden=card?.ability!=='sidestep';
   if(label.hidden)return;
   const pairs=plan?.steps??[];
   select.replaceChildren(new Option(english?'Keep positions':'Positionen behalten',''),...pairs.map(([from,to])=>new Option(cardOf(game.board[from]).name+' · '+from+' → '+to,[from,to].join('|'))));
   select.value=cells?.join('|')??'';
   select.disabled=busy||!pairs.length;
  },
 };
}
