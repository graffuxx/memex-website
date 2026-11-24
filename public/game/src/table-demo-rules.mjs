import {rankedStrength126} from '../platform/card-ranks126.mjs';
import {ELEMENT_IDS,ELEMENTS as FIVE_ELEMENTS,elementAdvantage,attackWins} from '../platform/elements53.mjs?v=tie-break-63';
import {preview as validatePlacement,cardOf,sideValue,neighbors,freeCells,scores,eventPhase,ELEMENTS} from './rules.mjs?v=greg-kekw-release';

export const TACTIC_BEATS=Object.freeze(Object.fromEntries(ELEMENT_IDS.map(id=>[id,FIVE_ELEMENTS[id].beats])));
export const GUARD_BONUS=2;
export const WATER_BONUS=2;
export const STORM_MAX_EDGE=3;
export const guardBonus=game=>game.abilityTrial?1:GUARD_BONUS;
export const ABILITIES={
 hype:{name:'Much Hype',short:'H',description:'Beim Ausspielen +1 auf eine gewählte Angriffsseite.'},
 guard:{name:'Feels Bad',short:'S',description:'Eine Seite erhält +2 Verteidigung bis zum nächsten eigenen Karten-Zug.'},
 twist:{name:'Think Again',short:'↻',description:'Einen gegnerischen Nachbarn 60° drehen. Dieses Ziel kann im selben Zug nicht übernommen werden. Optional.'},
 fire:{name:'Fire · Glutstoß',short:'↑',description:'Berührt die Karte genau einen Gegner, erhält die Angriffskante gegen ihn +1.'},
 water:{name:'Water · Wellenschild',short:'◈',description:`Eine gewählte Kante erhält +${WATER_BONUS} Verteidigung bis zum nächsten eigenen Zug.`},
 earth:{name:'Earth · Bollwerk',short:'◆',description:'Neben der Blockade erhält die schwächste erreichbare Kante +1 Verteidigung. Der Bonus endet, sobald die Blockade wegzieht.'},
 air:{name:'Air · Rückenwind',short:'↻',description:'Drehe optional eine eigene benachbarte Karte um 60 Grad. Die gedrehte Karte löst keine Übernahmen aus.'},
 storm:{name:'Storm · Flankenblitz',short:'ϟ',description:`Berührt die Karte mindestens zwei Gegner, erhält die schwächste Angriffskante gegen sie +1, wenn ihr Grundwert höchstens ${STORM_MAX_EDGE} beträgt.`},
 sidestep:{name:'Iconic · Platz machen',short:'↝',description:'Beim Legen darfst du eine benachbarte eigene Standardkarte um ein Feld ziehen. Das Ziel muss frei sein und an Greg grenzen. Die Karte behält ihre Ausrichtung. Eben geflippte Karten können erst in späteren Zügen verschoben werden.'},
 laugh:{name:'Iconic · Letztes Lachen',short:'◉',description:'Im nächsten gegnerischen Zug hält KEKW numerische Gleichstände auch gegen das stärkere Element. Höhere Werte und S-Kanten greifen nach den normalen Regeln an.'},
};
export const LOADOUTS={
 'hype-guard':{name:'Doge + Pepe',abilities:['hype','guard']},
 'hype-twist':{name:'Doge + Roll Safe',abilities:['hype','twist']},
 'guard-twist':{name:'Pepe + Roll Safe',abilities:['guard','twist']}
};
export const ABILITY_FOR={brain:'hype',oracle:'guard',trust:'twist'};
export const aimsAbility=ability=>['hype','guard','water'].includes(ability);
export const turnsCards=ability=>ability==='twist'||ability==='air';
const guardsEdge=ability=>ability==='guard'||ability==='water';
export function standardAbility(card){
 const definition=cardOf(card);
 return definition&&!definition.prime&&!definition.iconic?definition.element:null;
}
export function releasedIconicAbility(card){
 const id=cardOf(card)?.id;
 return id==='iconic-good-guy-greg'?'sidestep':id==='iconic-kekw'?'laugh':null;
}
export function abilityDescription(game,ability){
 if(ability==='guard')return `Eine Seite erhält +${guardBonus(game)} Verteidigung bis zum nächsten eigenen Karten-Zug.`;
 return ABILITIES[ability]?.description??'';
}
export const DIRECTION_NAMES=['Ost','Südost','Südwest','West','Nordwest','Nordost'];
export const FIELD_TYPES={
 resonance:{name:'Resonanz',color:'#ba93ff',symbol:'ϟ',description:'Passendes Element: +1 auf alle sechs Seiten.'},
 crossfire:{name:'Kreuzfeuer',color:'#ffbe62',symbol:'↔',description:'+1 auf die beiden markierten gegenüberliegenden Seiten.'},
 silence:{name:'Funkloch',color:'#e1a6d5',symbol:'×',description:'Die Fähigkeit einer Karte auf diesem Feld ist deaktiviert.'}
};
const FIELD_PHASES=[
 [{cell:'-1,0',type:'resonance',element:'storm'},{cell:'0,1',type:'crossfire',directions:[0,3]}],
 [{cell:'-1,0',type:'silence'},{cell:'0,1',type:'resonance',element:'fire'}],
 [{cell:'-1,0',type:'resonance',element:'stone'},{cell:'0,1',type:'crossfire',directions:[1,4]}]
];
export function eventFields(game){
 if(game.eventFieldsEnabled===false)return [];
 if(game.demoFields)return game.demoFields;
 const phase=eventPhase(game);
 return FIELD_PHASES[phase].map((template,index)=>{
  const field={...template,cell:game.eventCells?.[index]??template.cell};
  if(field.type==='resonance')field.element=(game.elementRules===5?ELEMENT_IDS:['storm','fire','earth'])[(phase+(game.resonanceOffset??0))%(game.elementRules===5?5:3)];
  if(field.directions)field.directions=field.directions.map(d=>(d+(game.crossfireOffset??0))%6);
  return field;
 });
}
export function eventFieldAt(game,cell){return cell===game.block?null:eventFields(game).find(f=>f.cell===cell)??null;}
export function nextEvent(game){if(game.eventFieldsEnabled===false)return null;const phase=eventPhase(game);return phase<2?{remaining:[6,12][phase]-game.placements,fields:eventFields({...game,placements:[6,12][phase]})}:null;}
export function fieldText(f){if(!f)return 'Normales Feld';return FIELD_TYPES[f.type].name+(f.type==='resonance'?' · '+ELEMENTS[f.element].name+' +1':f.type==='crossfire'?' · '+f.directions.map(d=>DIRECTION_NAMES[d]).join('/')+' +1':' · Fähigkeiten aus');}
export function abilityAt(game,card,cell){return card.ability&&eventFieldAt(game,cell)?.type!=='silence'?card.ability:null;}
export function guardActive(game,card,cell){return guardsEdge(abilityAt(game,card,cell))&&card.guardOwner===card.controller&&game.placements<card.guardUntil;}
export function twistTargets(game,cell,ability='twist'){
 return neighbors(cell).filter(n=>game.board[n.id]&&((game.board[n.id].controller===game.turn)===(ability==='air'))).map(n=>n.id);
}
export function sidestepTargets(game,cell){
 const ring=neighbors(cell).map(n=>n.id),empty=new Set(ring.filter(id=>id!==game.block&&!game.board[id]));
 return ring.filter(id=>{
  const card=game.board[id];
  return card?.controller===game.turn&&Boolean(standardAbility(card));
 }).flatMap(from=>neighbors(from).filter(n=>empty.has(n.id)).map(n=>[from,n.id]));
}
export function laughActive(game,card,cell){
 return abilityAt(game,card,cell)==='laugh'&&card.laughOwner===card.controller&&game.turn!==card.controller&&game.placements<card.laughUntil;
}
export function stopsElementTie(attack,defend){
 return Boolean(defend.holdsTie&&attack.rank!=='S'&&defend.rank!=='S'&&attack.total===defend.total);
}
export function effectAttackWins(attack,defend,elementRules){
 return !stopsElementTie(attack,defend)&&attackWins(attack,defend,elementRules);
}
function weakestEdge(card,edges){
 return edges.reduce((weakest,edge)=>!weakest||sideValue(card,edge.dir)<sideValue(card,weakest.dir)?edge:weakest,null);
}
export function abilityEdge(game,card,cell,{attacking=false,direction=null}={}){
 const ability=abilityAt(game,card,cell);
 if(attacking){
  if(ability==='hype'&&Number.isInteger(direction))return {dir:direction,amount:1};
  if(ability!=='fire'&&ability!=='storm')return null;
  const enemies=neighbors(cell).filter(n=>game.board[n.id]&&game.board[n.id].controller!==card.controller);
  if(ability==='fire'&&enemies.length===1)return {dir:enemies[0].dir,amount:1};
  if(ability==='storm'&&enemies.length>=2){
   const edge=weakestEdge(card,enemies);
   if(sideValue(card,edge.dir)<=STORM_MAX_EDGE)return {dir:edge.dir,amount:1};
  }
  return null;
 }
 if(guardActive(game,card,cell))return {dir:card.guardDirection,amount:ability==='water'?WATER_BONUS:guardBonus(game)};
 if(ability==='earth'){
  const adjacent=neighbors(cell);
  if(adjacent.some(n=>n.id===game.block)){
   const edge=weakestEdge(card,adjacent.filter(n=>n.id!==game.block));
   if(edge)return {dir:edge.dir,amount:1};
  }
 }
 return null;
}
export function effectStrength(game,card,cell,dir,opponent,{attacking=false,abilityDirection=null}={}){
 const f=eventFieldAt(game,cell),base=sideValue(card,dir),field=f?.type==='resonance'&&f.element===cardOf(card).element?1:f?.type==='crossfire'&&f.directions.includes(dir)?1:0;
 const element=elementAdvantage(cardOf(card).element,cardOf(opponent).element,game.elementRules??3)?1:0;
 const bonus=abilityEdge(game,card,cell,{attacking,direction:abilityDirection});
 const ability=bonus?.dir===dir?bonus.amount:0;
 return {base,field,element,ability,...rankedStrength126(base,field+ability+((game.elementRules??3)===3?element:0)),
  ...(!attacking&&laughActive(game,card,cell)?{holdsTie:true}:{})};
}
// All effects resolve on a copy. Merely aiming or cancelling can never alter the board.
export function previewEffect(game,action){
 const {uid,cell,rotation=0,abilityDirection=0,twistCell=null,stepCells=null}=action;
 if(game.rotationLocked&&rotation!==0)throw Error('Handkarten haben eine feste Ausrichtung.');
 validatePlacement(game,{uid,cell,rotation});
 if(!Number.isInteger(abilityDirection)||abilityDirection<0||abilityDirection>5)throw Error('Ungültige Fähigkeitsrichtung.');
 const working={...game,board:{...game.board}};
 for(const [cell,old] of Object.entries(working.board))if(old.guardOwner===game.turn){const c={...old};delete c.guardOwner;delete c.guardUntil;delete c.guardDirection;working.board[cell]=c;}
 const card={...working.players[game.turn].hand.find(c=>c.uid===uid),rotation,controller:game.turn,flips:0},ability=abilityAt(working,card,cell),transforms=[];
 if(twistCell!==null){if(!turnsCards(ability)||!twistTargets(working,cell,ability).includes(twistCell))throw Error('Kein gültiges Drehziel.');const target={...working.board[twistCell]};working.board[twistCell]=target;transforms.push({cell:twistCell,uid:target.uid,from:target.rotation,to:(target.rotation+1)%6});target.rotation=(target.rotation+1)%6;}
 if(ability==='laugh'){card.laughOwner=game.turn;card.laughUntil=game.placements+2;}
 if(guardsEdge(ability)){card.guardDirection=abilityDirection;card.guardOwner=game.turn;card.guardUntil=game.placements+2;}
 const comparisons=neighbors(cell).filter(n=>working.board[n.id]&&working.board[n.id].controller!==game.turn).map(n=>{
  const other=working.board[n.id],attack=effectStrength(working,card,cell,n.dir,other,{attacking:true,abilityDirection}),defend=effectStrength(working,other,n.id,(n.dir+3)%6,card);
  const setup=n.id===twistCell,elementRules=game.elementRules??3;
  const tieProtected=!setup&&stopsElementTie(attack,defend)&&attackWins(attack,defend,elementRules);
  return {cell:n.id,dir:n.dir,attack,defend,setup,flip:!setup&&effectAttackWins(attack,defend,elementRules),name:cardOf(other).name,...(tieProtected?{tieProtected:true}:{})};
 });
 const flips=comparisons.filter(c=>c.flip).map(c=>c.cell);
 const steps=ability==='sidestep'?sidestepTargets(working,cell):[];
 if(stepCells!==null&&(!Array.isArray(stepCells)||stepCells.length!==2||!steps.some(([from,to])=>from===stepCells[0]&&to===stepCells[1])))throw Error('Kein gültiges Ziel für Platz machen.');
 const relocation=stepCells===null?null:{from:stepCells[0],to:stepCells[1],uid:working.board[stepCells[0]].uid};
 return {card,cell,ability,abilityDirection,suppressed:Boolean(card.ability&&!ability),transforms,comparisons,flips,board:working.board,steps,relocation};
}
export function placeEffect(game,action){
 const p=previewEffect(game,action),next=structuredClone(game),side=game.turn,player=next.players[side];next.board=structuredClone(p.board);
 player.hand=player.hand.filter(c=>c.uid!==action.uid);if(player.deck.length)player.hand.push(player.deck.shift());
 next.board[action.cell]={...p.card,flips:p.flips.length};
 for(const cell of p.flips){const c=next.board[cell];c.controller=side;delete c.guardOwner;delete c.guardUntil;delete c.guardDirection;delete c.laughOwner;delete c.laughUntil;}
 if(p.relocation){
  const {from,to}=p.relocation;
  next.board[to]=next.board[from];
  delete next.board[from];
 }
 player.flips+=p.flips.length;next.placements++;
 next.last={type:'place',side,cell:action.cell,uid:action.uid,name:cardOf(p.card).name,flips:p.flips,transforms:p.transforms,ability:p.ability,suppressed:p.suppressed,event:game.eventFieldsEnabled===false?null:eventPhase(next)!==eventPhase(game)?eventPhase(next):null};
 if(p.relocation)next.last.relocation=p.relocation;
 const tieBlocks=p.comparisons.filter(c=>c.tieProtected).map(c=>({cell:c.cell,dir:(c.dir+3)%6}));
 if(tieBlocks.length)next.last.tieBlocks=tieBlocks;
 if(game.abilityTrial&&p.ability){
  next.last.abilityDirection=p.abilityDirection;
  if(game.elementalTrial){
   const working={...game,board:p.board};
   next.last.abilityEdge=abilityEdge(working,p.card,p.cell,{attacking:true,direction:p.abilityDirection})??abilityEdge(working,p.card,p.cell);
  }
 }
 next.history.push(next.last);
 if(freeCells(next).length===0){next.finished=true;const s=scores(next);next.winner=s[0]===s[1]?null:s[0]>s[1]?0:1;}else next.turn=1-side;
 return next;
}
export function actionOptions(game,card,cell,rotation){
 const ability=abilityAt(game,card,cell),directions=aimsAbility(ability)?[0,1,2,3,4,5]:[0],targets=turnsCards(ability)?[null,...twistTargets(game,cell,ability)]:[null];
 if(ability==='sidestep'){
  const action={uid:card.uid,cell,rotation,abilityDirection:0};
  return [action,...previewEffect(game,action).steps.map(stepCells=>({...action,stepCells}))];
 }
 return directions.flatMap(abilityDirection=>targets.map(twistCell=>({uid:card.uid,cell,rotation,abilityDirection,twistCell})));
}
