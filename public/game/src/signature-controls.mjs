import {canTurnSelf,DIRECTION_NAMES,valueSwapTargets} from './table-demo-rules.mjs?v=alpha-complete';
import {cardOf,ELEMENTS} from './rules.mjs?v=alpha-complete';

export function bindSignatureControls(abilities,{english=false,onChange,onDraw}){
 const exchangeLabel=document.createElement('label'),exchange=document.createElement('select'),exchangeText=document.createTextNode('');
 exchangeLabel.append(exchangeText,exchange);
 const pivotLabel=document.createElement('label'),pivot=document.createElement('select'),pivotText=document.createTextNode('');
 pivotLabel.append(pivotText,pivot);
 pivot.append(
  new Option(english?'Keep orientation':'Ausrichtung behalten','0'),
  new Option(english?'↶ 60° counterclockwise':'↶ 60° nach links','-1'),
  new Option(english?'↻ 60° clockwise':'↻ 60° nach rechts','1'),
 );
 const valueLabel=document.createElement('label'),values=document.createElement('select');
 valueLabel.append(english?'Swap edge values':'Kantenwerte tauschen',values);
 const facingLabel=document.createElement('label'),facing=document.createElement('select');
 facingLabel.append(english?'Choose orientation':'Ausrichtung wählen',facing);
 facing.append(
  new Option(english?'Keep orientation':'Ausrichtung behalten','0'),
  new Option(english?'↶ 60° counterclockwise':'↶ 60° nach links','-1'),
  new Option(english?'↻ 60° clockwise':'↻ 60° nach rechts','1'),
 );
 const stepLabel=document.createElement('label'),step=document.createElement('select');
 stepLabel.append(english?'Move an allied card':'Eigene Karte verschieben',step);
 const bidLabel=document.createElement('label'),bid=document.createElement('select');
 bidLabel.append(english?'Spend blockade move':'Blockadezug einsetzen',bid);
 const drawPanel=document.createElement('div'),drawTitle=document.createElement('strong'),drawChoices=document.createElement('div');
 drawPanel.hidden=exchangeLabel.hidden=pivotLabel.hidden=valueLabel.hidden=facingLabel.hidden=stepLabel.hidden=bidLabel.hidden=true;
 drawPanel.className='signature-draw';drawChoices.className='signature-draw__choices';
 drawPanel.append(drawTitle,drawChoices);
 abilities.append(exchangeLabel,pivotLabel,valueLabel,facingLabel,stepLabel,bidLabel);
 abilities.after(drawPanel);
 let swapCells=null,pivotDirection=0,valueSwap=null,selfTurn=0,stepCells=null,bidDirection=null;
 exchange.onchange=()=>{swapCells=exchange.value?exchange.value.split('|'):null;onChange();};
 pivot.onchange=()=>{pivotDirection=Number(pivot.value);onChange();};
 values.onchange=()=>{valueSwap=values.value?values.value.split('|').map(Number):null;onChange();};
 facing.onchange=()=>{selfTurn=Number(facing.value);onChange();};
 step.onchange=()=>{stepCells=step.value?step.value.split('|'):null;onChange();};
 bid.onchange=()=>{bidDirection=bid.value===''?null:Number(bid.value);onChange();};
 const directions=english?['E','SE','SW','W','NW','NE']:DIRECTION_NAMES;

 function update({game,card,target,plan,busy,options,waiting=false}){
  exchangeLabel.hidden=card?.ability!=='exchange'&&card?.ability!=='thought'&&!plan?.relay;
  if(!exchangeLabel.hidden){
   exchangeText.textContent=plan?.relay?(english?'Change of Guard':'Wachwechsel'):card.ability==='thought'?(english?'Swap enemy cards':'Gegnerkarten tauschen'):(english?'Swap allied cards':'Eigene Karten tauschen');
   const pairs=plan?.swaps??[];
   exchange.replaceChildren(new Option(english?'Keep positions':'Positionen behalten',''),...pairs.map(pair=>new Option(pair.map(id=>cardOf(id===target?card:game.board[id]).name+' · '+id).join(' ↔ '),pair.join('|'))));
   exchange.value=swapCells?.join('|')??'';
   exchange.disabled=busy||!pairs.length;
  }
  pivotLabel.hidden=card?.ability!=='roundhouse'&&card?.ability!=='encore';
  pivotText.textContent=card?.ability==='encore'?(english?'Rotate Epic Sax Guy':'Epic Sax Guy drehen'):(english?'Rotate captured card':'Eroberte Karte drehen');
  pivot.value=String(pivotDirection);
  pivot.disabled=busy||!plan?.pivotTarget;
  valueLabel.hidden=card?.ability!=='luxury';
  if(!valueLabel.hidden){
   const pairs=target?valueSwapTargets(game,card,target):[];
   values.replaceChildren(new Option(english?'Keep values':'Werte behalten',''),...pairs.map(pair=>new Option('4 '+directions[pair[0]]+' ↔ 2 '+directions[pair[1]],pair.join('|'))));
   values.value=valueSwap?.join('|')??'';
   values.disabled=busy||!pairs.length;
  }
  const retry=card?.ability==='retry';
  const turns=plan?.turnChoices??[];
  facingLabel.hidden=card?.ability!=='wander'&&!retry;
  facing.value=String(selfTurn);
  for(const option of facing.options)option.disabled=retry&&option.value!=='0'&&!turns.includes(Number(option.value));
  facing.disabled=busy||!target||(retry?!turns.length:!canTurnSelf(game,target));
  const chorus=card?.ability==='chorus',jam=card?.ability==='jam',fan=card?.ability==='fan',cling=card?.ability==='cling';
  stepLabel.hidden=card?.ability!=='sidestep'&&!chorus&&!jam&&!fan&&!cling;
  stepLabel.firstChild.textContent=chorus?(english?'Choose dance partners':'Tanzpartner wählen'):jam?(english?'Mute an enemy card':'Gegnerkarte stummschalten'):fan?(english?'Reserve a field':'Feld reservieren'):cling?(english?'Link a friendly Regular':'Eigene Standardkarte verknüpfen'):(english?'Move an allied card':'Eigene Karte verschieben');
  if(!stepLabel.hidden){
   const pairs=plan?.steps??[];
   const nameAt=cell=>cardOf(game.board[cell]).name;
   const unchanged=chorus?(english?'Keep orientation':'Ausrichtung behalten'):jam?(english?'No mute':'Fähigkeit aktiv lassen'):fan?(english?'Leave fields open':'Felder freilassen'):cling?(english?'Play without a link':'Ohne Verbindung spielen'):(english?'Keep positions':'Positionen behalten');
   const labelAt=cell=>nameAt(cell)+' · '+cell;
   const describe=([from,to])=>{
    if(fan)return from;
    if(jam||cling)return labelAt(from);
    if(!chorus)return labelAt(from)+' → '+to;
    if(to==='cw'||to==='ccw')return (to==='cw'?'↻ ':'↶ ')+labelAt(from);
    return '↻ '+labelAt(from)+' / ↶ '+labelAt(to);
   };
   step.replaceChildren(new Option(unchanged,''),...pairs.map(pair=>new Option(describe(pair),pair.join('|'))));
   step.value=stepCells?.join('|')??'';
   step.disabled=busy||!pairs.length;
  }
  bidLabel.hidden=card?.ability!=='bid';
  if(!bidLabel.hidden){
   const available=plan?.bidTargets??[];
   bid.replaceChildren(new Option(english?'Keep blockade move':'Blockadezug behalten',''),...available.map(dir=>new Option(directions[dir]+' · +1',String(dir))));
   bid.value=bidDirection===null?'':String(bidDirection);
   bid.disabled=busy||!available.length;
  }
  drawPanel.hidden=!options&&!waiting;
  if(drawPanel.hidden)return;
  drawTitle.textContent=waiting?(english?'Opponent is choosing a card':'Der Gegner wählt eine Karte'):(english?'Choose one card to draw':'Wähle eine Nachziehkarte');
  const key=JSON.stringify([options?.map(card=>card.uid),busy,waiting]);
  if(drawChoices.dataset.key===key)return;
  drawChoices.dataset.key=key;
  drawChoices.replaceChildren(...(options??[]).map((card,index)=>{
   const button=document.createElement('button');
   button.type='button';button.disabled=busy;
   const definition=cardOf(card);
   button.textContent=definition.name;
   const sides=document.createElement('small');
   sides.textContent=ELEMENTS[definition.element].name+' · '+definition.values.map(value=>value===10?'S':value).join(' · ');
   button.append(sides);
   button.onclick=()=>onDraw(index);
   return button;
  }));
 }
 function setAction(action={}){
  swapCells=action.swapCells??null;
  pivotDirection=action.pivotDirection??(action.pivotCapture===true?1:0);
  valueSwap=action.valueSwap??null;
  selfTurn=action.selfTurn??0;
  stepCells=action.stepCells??null;
  bidDirection=action.bidDirection??null;
 }
 return {update,setAction,clear:setAction,action(){return {swapCells,pivotDirection,valueSwap,selfTurn,stepCells,bidDirection};}};
}
