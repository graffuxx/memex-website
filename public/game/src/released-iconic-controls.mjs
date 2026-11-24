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
 const thoughtLabel=document.createElement('label'),thought=document.createElement('select');
 thoughtLabel.append(english?'Swap enemy cards':'Gegnerkarten tauschen',thought);
 label.hidden=encoreLabel.hidden=bidLabel.hidden=thoughtLabel.hidden=true;
 abilities.append(label,encoreLabel,bidLabel,thoughtLabel);
 let cells=null,pivotDirection=0,bidDirection=null,swapCells=null;
 thought.onchange=()=>{swapCells=thought.value?thought.value.split('|'):null;onChange();};
 bid.onchange=()=>{bidDirection=bid.value===''?null:Number(bid.value);onChange();};
 encore.onchange=()=>{pivotDirection=Number(encore.value);onChange();};
 select.onchange=()=>{cells=select.value?select.value.split('|'):null;onChange();};
 return {
  clear(){cells=null;pivotDirection=0;bidDirection=null;swapCells=null;},
  set(action){cells=action.stepCells??null;pivotDirection=action.pivotDirection??0;bidDirection=action.bidDirection??null;swapCells=action.swapCells??null;},
  action(){return {stepCells:cells,pivotDirection,bidDirection,swapCells};},
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
   thoughtLabel.hidden=card?.ability!=='thought';
   if(!thoughtLabel.hidden){
    const pairs=plan?.swaps??[];
    thought.replaceChildren(new Option(english?'Keep positions':'Positionen behalten',''),...pairs.map(pair=>new Option(pair.map(id=>cardOf(game.board[id]).name+' · '+id).join(' ↔ '),pair.join('|'))));
    thought.value=swapCells?.join('|')??'';
    thought.disabled=busy||!pairs.length;
   }
   const chorus=card?.ability==='chorus',jam=card?.ability==='jam';
   label.hidden=card?.ability!=='sidestep'&&!chorus&&!jam;
   if(label.hidden)return;
   label.firstChild.textContent=chorus?(english?'Choose dance partners':'Tanzpartner wählen'):jam?(english?'Mute an enemy card':'Gegnerkarte stummschalten'):(english?'Move an allied card':'Eigene Karte verschieben');
   const pairs=plan?.steps??[];
   const unchanged=chorus?(english?'Keep orientation':'Ausrichtung behalten'):jam?(english?'No mute':'Fähigkeit aktiv lassen'):(english?'Keep positions':'Positionen behalten');
   const labelAt=cell=>cardOf(game.board[cell]).name+' · '+cell;
   const describe=([from,to])=>{
    if(jam)return labelAt(from);
    if(!chorus)return labelAt(from)+' → '+to;
    if(to==='cw'||to==='ccw')return (to==='cw'?'↻ ':'↶ ')+labelAt(from);
    return '↻ '+labelAt(from)+' / ↶ '+labelAt(to);
   };
   select.replaceChildren(new Option(unchanged,''),...pairs.map(pair=>new Option(describe(pair),pair.join('|'))));
   select.value=cells?.join('|')??'';
   select.disabled=busy||!pairs.length;
  },
 };
}
