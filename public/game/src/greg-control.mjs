import {cardOf} from './rules.mjs';

export function bindGregControl(abilities,{english=false,onChange}){
 const label=document.createElement('label'),select=document.createElement('select');
 label.append(english?'Move an allied card':'Eigene Karte verschieben',select);
 abilities.append(label);
 let cells=null;
 select.onchange=()=>{cells=select.value?select.value.split('|'):null;onChange();};
 return {
  clear(){cells=null;},
  cells:()=>cells,
  update(game,card,plan,busy){
   label.hidden=card?.ability!=='sidestep';
   if(label.hidden)return;
   const pairs=plan?.steps??[];
   select.replaceChildren(new Option(english?'Keep positions':'Positionen behalten',''),...pairs.map(([from,to])=>new Option(cardOf(game.board[from]).name+' · '+from+' → '+to,[from,to].join('|'))));
   select.value=cells?.join('|')??'';
   select.disabled=busy||!pairs.length;
  },
 };
}
