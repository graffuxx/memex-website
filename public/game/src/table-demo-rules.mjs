import {rankedStrength126} from '../platform/card-ranks126.mjs';
import {ELEMENT_IDS,ELEMENTS as FIVE_ELEMENTS,elementAdvantage,attackWins} from '../platform/elements53.mjs?v=tie-break-63';
import {preview as validatePlacement,cardOf,sideValue,neighbors,freeCells,scores,eventPhase,ELEMENTS} from './rules.mjs?v=tie-break-63';

export const TACTIC_BEATS=Object.freeze(Object.fromEntries(ELEMENT_IDS.map(id=>[id,FIVE_ELEMENTS[id].beats])));
export const GUARD_BONUS=2;
export const ABILITIES={
 hype:{name:'Much Hype',short:'H',description:'Beim Ausspielen +1 auf eine gewählte Angriffsseite.'},
 guard:{name:'Feels Bad',short:'S',description:'Eine Seite erhält +2 Verteidigung bis zum nächsten eigenen Karten-Zug.'},
 twist:{name:'Think Again',short:'↻',description:'Einen gegnerischen Nachbarn 60° drehen. Dieses Ziel kann im selben Zug nicht übernommen werden. Optional.'}
};
export const LOADOUTS={
 'hype-guard':{name:'Doge + Pepe',abilities:['hype','guard']},
 'hype-twist':{name:'Doge + Roll Safe',abilities:['hype','twist']},
 'guard-twist':{name:'Pepe + Roll Safe',abilities:['guard','twist']}
};
export const ABILITY_FOR={brain:'hype',oracle:'guard',trust:'twist'};
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
export function nextEvent(game){const phase=eventPhase(game);return phase<2?{remaining:[6,12][phase]-game.placements,fields:eventFields({...game,placements:[6,12][phase]})}:null;}
export function fieldText(f){if(!f)return 'Normales Feld';return FIELD_TYPES[f.type].name+(f.type==='resonance'?' · '+ELEMENTS[f.element].name+' +1':f.type==='crossfire'?' · '+f.directions.map(d=>DIRECTION_NAMES[d]).join('/')+' +1':' · Fähigkeiten aus');}
export function abilityAt(game,card,cell){return card.ability&&eventFieldAt(game,cell)?.type!=='silence'?card.ability:null;}
export function guardActive(game,card,cell){return abilityAt(game,card,cell)==='guard'&&card.guardOwner===card.controller&&game.placements<card.guardUntil;}
export function twistTargets(game,cell){return neighbors(cell).filter(n=>game.board[n.id]&&game.board[n.id].controller!==game.turn).map(n=>n.id);}
export function effectStrength(game,card,cell,dir,opponent,{attacking=false,abilityDirection=null}={}){
 const f=eventFieldAt(game,cell),base=sideValue(card,dir),field=f?.type==='resonance'&&f.element===cardOf(card).element?1:f?.type==='crossfire'&&f.directions.includes(dir)?1:0;
 const element=elementAdvantage(cardOf(card).element,cardOf(opponent).element,game.elementRules??3)?1:0;
 const ability=attacking?(abilityAt(game,card,cell)==='hype'&&dir===abilityDirection?1:0):(guardActive(game,card,cell)&&dir===card.guardDirection?GUARD_BONUS:0);
 return {base,field,element,ability,...rankedStrength126(base,field+ability+((game.elementRules??3)===3?element:0))};
}
// All effects resolve on a copy. Merely aiming or cancelling can never alter the board.
export function previewEffect(game,action){
 const {uid,cell,rotation=0,abilityDirection=0,twistCell=null}=action;
 if(game.rotationLocked&&rotation!==0)throw Error('Handkarten haben eine feste Ausrichtung.');
 validatePlacement(game,{uid,cell,rotation});
 if(!Number.isInteger(abilityDirection)||abilityDirection<0||abilityDirection>5)throw Error('Ungültige Fähigkeitsrichtung.');
 const working={...game,board:{...game.board}};
 for(const [cell,old] of Object.entries(working.board))if(old.guardOwner===game.turn){const c={...old};delete c.guardOwner;delete c.guardUntil;delete c.guardDirection;working.board[cell]=c;}
 const card={...working.players[game.turn].hand.find(c=>c.uid===uid),rotation,controller:game.turn,flips:0},ability=abilityAt(working,card,cell),transforms=[];
 if(twistCell!==null){if(ability!=='twist'||!twistTargets(working,cell).includes(twistCell))throw Error('Kein gültiges Drehziel.');const target={...working.board[twistCell]};working.board[twistCell]=target;transforms.push({cell:twistCell,uid:target.uid,from:target.rotation,to:(target.rotation+1)%6});target.rotation=(target.rotation+1)%6;}
 if(ability==='guard'){card.guardDirection=abilityDirection;card.guardOwner=game.turn;card.guardUntil=game.placements+2;}
 const comparisons=neighbors(cell).filter(n=>working.board[n.id]&&working.board[n.id].controller!==game.turn).map(n=>{
  const other=working.board[n.id],attack=effectStrength(working,card,cell,n.dir,other,{attacking:true,abilityDirection}),defend=effectStrength(working,other,n.id,(n.dir+3)%6,card);
  return {cell:n.id,dir:n.dir,attack,defend,setup:n.id===twistCell,flip:n.id!==twistCell&&attackWins(attack,defend,game.elementRules??3),name:cardOf(other).name};
 });
 return {card,cell,ability,abilityDirection,suppressed:Boolean(card.ability&&!ability),transforms,comparisons,flips:comparisons.filter(c=>c.flip).map(c=>c.cell),board:working.board};
}
export function placeEffect(game,action){
 const p=previewEffect(game,action),next=structuredClone(game),side=game.turn,player=next.players[side];next.board=structuredClone(p.board);
 player.hand=player.hand.filter(c=>c.uid!==action.uid);if(player.deck.length)player.hand.push(player.deck.shift());
 next.board[action.cell]={...p.card,flips:p.flips.length};
 for(const cell of p.flips){const c=next.board[cell];c.controller=side;delete c.guardOwner;delete c.guardUntil;delete c.guardDirection;}
 player.flips+=p.flips.length;next.placements++;
 next.last={type:'place',side,cell:action.cell,uid:action.uid,name:cardOf(p.card).name,flips:p.flips,transforms:p.transforms,ability:p.ability,suppressed:p.suppressed,event:eventPhase(next)!==eventPhase(game)?eventPhase(next):null};next.history.push(next.last);
 if(freeCells(next).length===0){next.finished=true;const s=scores(next);next.winner=s[0]===s[1]?null:s[0]>s[1]?0:1;}else next.turn=1-side;
 return next;
}
export function actionOptions(game,card,cell,rotation){
 const ability=abilityAt(game,card,cell),directions=['hype','guard'].includes(ability)?[0,1,2,3,4,5]:[0],targets=ability==='twist'?[null,...twistTargets(game,cell)]:[null];
 return directions.flatMap(abilityDirection=>targets.map(twistCell=>({uid:card.uid,cell,rotation,abilityDirection,twistCell})));
}
