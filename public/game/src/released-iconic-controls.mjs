import {cardOf} from './rules.mjs';

export function bindReleasedIconicControls(abilities,{english=false,onChange}){
 const label=document.createElement('label'),select=document.createElement('select');
 label.append(english?'Move an allied card':'Eigene Karte verschieben',select);
 const encoreLabel=document.createElement('label'),encore=document.createElement('select');
 encoreLabel.append(english?'Rotate Epic Sax Guy':'Epic Sax Guy drehen',encore);
 encore.append(new Option(english?'Keep orientation':'Ausrichtung behalten','0'),
  new Option(english?'↶ 60° counterclockwise':'↶ 60° nach links','-1'),
  new Option(english?'↻ 60° clockwise':'↻ 60° nach rechts','1'));
 const bidLabel=document.createElement('label'),bid=document.createElement('select');
 bidLabel.append(english?'Spend blockade move':'Blockadezug einsetzen',bid);
 const directions=english?['E','SE','SW','W','NW','NE']:['Ost','Südost','Südwest','West','Nordwest','Nordost'];
 label.hidden=encoreLabel.hidden=bidLabel.hidden=true;
 abilities.append(label,encoreLabel,bidLabel);
 let cells=null,pivotDirection=0,bidDirection=null;
 bid.onchange=()=>{bidDirection=bid.value===''?null:Number(bid.value);onChange();};
 encore.onchange=()=>{pivotDirection=Number(encore.value);onChange();};
 select.onchange=()=>{cells=select.value?select.value.split('|'):null;onChange();};
 return {
  clear(){cells=null;pivotDirection=0;bidDirection=null;},
  set(action){cells=action.stepCells??null;pivotDirection=action.pivotDirection??0;bidDirection=action.bidDirection??null;},
  action(){return {stepCells:cells,pivotDirection,bidDirection};},
  update(game,card,plan,busy){
   encoreLabel.hidden=card?.ability!=='encore';
   encore.disabled=busy||!plan?.pivotTarget;
   encore.value=String(pivotDirection);
   bidLabel.hidden=card?.ability!=='bid';
   if(!bidLabel.hidden){
    const available=plan?.bidTargets??[];
    bid.replaceChildren(new Option(english?'Keep blockade move':'Blockadezug behalten',''),...available.map(dir=>new Option(directions[dir]+' · +1',String(dir))));
    bid.value=bidDirection===null?'':String(bidDirection);
    bid.disabled=busy||!available.length;
   }
   label.hidden=card?.ability!=='sidestep';
   if(label.hidden)return;
   const pairs=plan?.steps??[];
   select.replaceChildren(new Option(english?'Keep positions':'Positionen behalten',''),...pairs.map(([from,to])=>new Option(cardOf(game.board[from]).name+' · '+from+' → '+to,[from,to].join('|'))));
   select.value=cells?.join('|')??'';
   select.disabled=busy||!pairs.length;
  },
 };
}
