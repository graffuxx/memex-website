import {isSRank126,rankedStrength126} from '../platform/card-ranks126.mjs';
import {ELEMENT_IDS,ELEMENTS as FIVE_ELEMENTS,elementAdvantage,attackWins} from '../platform/elements53.mjs?v=tie-break-63';
import {preview as validatePlacement,cardOf,sideValue,neighbors,freeCells,scores,eventPhase,ELEMENTS} from './rules.mjs?v=jordan-fan-release';

export const TACTIC_BEATS=Object.freeze(Object.fromEntries(ELEMENT_IDS.map(id=>[id,FIVE_ELEMENTS[id].beats])));
export const GUARD_BONUS=2;
export const WATER_BONUS=2;
export const STORM_MAX_EDGE=3;
export const SWIPE_MAX_DEFENSE=2;
export const PIGEON_MAX_REDUCTION=2;
export const CHASE_PENALTY=2;
export const OBJECTION_MAX_MARGIN=2;
export const CHORUS_DUET_GUARD=2;
export const JAM_PLACEMENTS=3;
export const SANDWICH_MAX_SUPPORT=3;
export const JORDAN_MAX_MARGIN=1;
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
 sidestep:{name:'Iconic · Platz machen',short:'↝',description:'Beim Legen darfst du eine benachbarte eigene Standardkarte um ein Feld ziehen. Das Ziel muss frei sein und an Greg grenzen. Die Karte behält ihre Ausrichtung. Eben geflippte Karten bleiben liegen.'},
 laugh:{name:'Iconic · Letztes Lachen',short:'◉',description:'Im nächsten gegnerischen Zug hält KEKW numerische Gleichstände auch gegen das stärkere Element. Höhere Werte und S-Kanten greifen nach den normalen Regeln an.'},
 solitude:{name:'Iconic · Allein auf weiter Flur',short:'◇',description:'Solange keine eigene Karte angrenzt, erhält die schwächste offene Kante +1 Verteidigung.'},
 rainbow:{name:'Iconic · Zweiter Bogen',short:'⌒',description:'Bei genau einem regulären Flip übernimmt Double Rainbow höchstens eine zweite Karte bei einem numerischen Gleichstand. Es zählt der erste ungeschützte Gleichstand im Uhrzeigersinn ab dem ersten Flip.'},
 swipe:{name:'Iconic · Schildklau',short:'−',description:`Beim Angriff ignoriert Steve bis zu ${SWIPE_MAX_DEFENSE} Punkte Fähigkeits-Verteidigung, wenn er dadurch eine Karte flippt. Er nimmt höchstens einen Schild mit, beginnend im Osten im Uhrzeigersinn. Ereignisfelder und S-Kanten bleiben wirksam.`},
 encore:{name:'Iconic · Zugabe',short:'♫',description:'Nach genau einem Flip darfst du Epic Sax Guy um 60° nach links oder rechts drehen. Die Drehung ändert nur die Ausrichtung für folgende Züge.'},
 bid:{name:'Iconic · Nachschlag',short:'+1',description:'Wenn du zurückliegst, kannst du deinen ungenutzten Blockadezug für +1 Angriff auf einer Kante ausgeben. Die Option erscheint, wenn dadurch eine Karte flippt. Die Blockade bleibt stehen.'},
 decoy:{name:'Iconic · Falsche Kante',short:'◇',description:`Pigeon verwechselt eine gegnerische Kante mit ihrer schwächeren Nachbarkante. Das senkt den Grundwert für diesen Angriff um höchstens ${PIGEON_MAX_REDUCTION}. Der erste dadurch gewinnbare Angriff ab Osten im Uhrzeigersinn zählt. Schutzboni und S-Kanten gelten weiterhin.`},
 chase:{name:'Iconic · Kein Entkommen',short:'»',description:`Nach einem direkten Flip kann der Angriff in derselben Richtung die gegnerische Karte dahinter treffen. Der Folgeangriff verliert ${CHASE_PENALTY} Angriffspunkte. Höchstens ein Zusatzflip, beginnend im Osten im Uhrzeigersinn.`},
 cover:{name:'Iconic · Rückendeckung',short:'◈',description:'Beim Legen erhalten bis zu zwei bereits eigene Standard-Nachbarn +1 Verteidigung an ihrer jeweils schwächsten offenen Kante bis zum nächsten eigenen Zug. Schutzboni stapeln sich nicht.'},
 objection:{name:'Iconic · Einspruch',short:'!',description:`Würde ein Zug mindestens zwei Karten direkt flippen, kann diese Karte ihren eigenen Flip einmal pro Runde abwehren. Der gegnerische Zahlenwert darf höchstens ${OBJECTION_MAX_MARGIN} Punkte höher sein. Gegen S greift der Einspruch nicht.`},
 thought:{name:'Iconic · Gedankenexperiment',short:'⇄',description:'Beim Legen darfst du zwei gegnerische Standardkarten tauschen, die in diesem Zug ihre Seite behalten. Eine grenzt an Philosoraptor. Die zweite grenzt an ihn oder an das erste Tauschziel. Der Tausch löst keine Flips aus.'},
 bailout:{name:'Prime · Rettung in letzter Sekunde',short:'❖',description:`Jordan rettet einmal pro Runde eine benachbarte eigene Standardkarte vor einem direkten Zahlenflip mit höchstens ${JORDAN_MAX_MARGIN} Punkt Vorsprung. Wird Jordan im selben Zug geflippt, greift die Rettung nicht.`},
 fan:{name:'Prime · Leere Ränge',short:'⊠',description:'Reserviere beim Legen ein freies Feld, das an Fan und eine bereits eigene Standardkarte angrenzt. Im nächsten Zug des Gegners bleibt dieses Feld für Karten gesperrt. Andere Spielfelder bleiben bestehen.'},
 jam:{name:'Prime · Eingabestopp',short:'⌧',description:'Wähle beim Legen eine angrenzende Gegnerkarte. Ihre eigene Fähigkeit pausiert sofort bis zum Ende deines nächsten Zugs. Gedruckte Werte, Elemente und Schutz von anderen Karten bleiben wirksam.'},
 sandwich:{name:'Prime · Sandwich',short:'⟫',description:`Steht ein eigener Verbündeter direkt oder schräg hinter einer Gegnerkarte, kann sein Überschuss gegen deren Rückseite deinen Angriff um bis zu ${SANDWICH_MAX_SUPPORT} verstärken. Es zählt der erste dadurch mögliche Zahlenflip im Uhrzeigersinn. S-Kanten sind ausgenommen.`},
 chorus:{name:'Prime · Choreografie',short:'♫',description:`Drehe beim Legen eine eigene angrenzende Standardkarte um 60° und schütze ihre schwächste offene Kante mit +1. Singt eine zweite Standardkarte eines anderen Elements mit, darf sie an NUMA oder den ersten Partner angrenzen und dreht sich entgegengesetzt. Beide erhalten dann +${CHORUS_DUET_GUARD} Schutz bis zu deinem nächsten Zug. Die Drehung löst keine Flips aus.`},
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
const RELEASED_ICONICS={
 'iconic-good-guy-greg':[1,'sidestep'],
 'iconic-kekw':[1,'laugh'],
 'iconic-forever-alone':[2,'solitude'],
 'iconic-double-rainbow':[2,'rainbow'],
 'iconic-scumbag-steve':[3,'swipe'],
 'iconic-epic-sax-guy':[3,'encore'],
 'iconic-take-my-money':[4,'bid'],
 'iconic-is-this-a-pigeon':[4,'decoy'],
 'iconic-why-are-you-running':[5,'chase'],
 'iconic-overly-manly-man':[5,'cover'],
 'iconic-no-god-please-no':[6,'objection'],
 'iconic-philosoraptor':[6,'thought'],
};
export function releasedIconicAbility(card,wave=1){
 const entry=RELEASED_ICONICS[cardOf(card)?.id];
 return entry&&wave>=entry[0]?entry[1]:null;
}
export function releasedPrimeAbility(card,includePair=false){
 const id=cardOf(card)?.id;
 if(id==='prime-numa-numa')return 'chorus';
 if(id==='prime-keyboard-crusher')return 'jam';
 if(id==='prime-idiot-sandwich')return 'sandwich';
 if(includePair&&id==='prime-crying-jordan')return 'bailout';
 if(includePair&&id==='prime-disappointed-fan')return 'fan';
 return null;
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
export const jamActive=(game,card)=>game.placements<card.jammedUntil;
export function abilityAt(game,card,cell){return card.ability&&!jamActive(game,card)&&eventFieldAt(game,cell)?.type!=='silence'?card.ability:null;}
export function fanTargets(game,cell){
 if(freeCells(game).length<=2)return [];
 const allies=neighbors(cell).filter(({id})=>{
  const card=game.board[id];
  return card?.controller===game.turn&&Boolean(standardAbility(card));
 });
 const shared=new Set(allies.flatMap(({id})=>neighbors(id).map(n=>n.id)));
 return neighbors(cell).filter(({id})=>id!==game.block&&!game.board[id]&&shared.has(id)).map(({id})=>[id]);
}
function jamTargets(game,cell){
 return neighbors(cell).filter(({id})=>{
  const card=game.board[id];
  return card&&card.controller!==game.turn&&abilityAt(game,card,id);
 }).map(({id})=>[id]);
}
export function guardActive(game,card,cell){return guardsEdge(abilityAt(game,card,cell))&&card.guardOwner===card.controller&&game.placements<card.guardUntil;}
export function twistTargets(game,cell,ability='twist'){
 return neighbors(cell).filter(n=>game.board[n.id]&&((game.board[n.id].controller===game.turn)===(ability==='air'))).map(n=>n.id);
}
function thoughtTargets(game,cell,flips){
 const eligible=id=>{
  const card=game.board[id];
  return card&&card.controller!==game.turn&&standardAbility(card)&&!flips.includes(id);
 };
 const touching=neighbors(cell).map(n=>n.id).filter(eligible),pairs=new Map();
 for(const first of touching){
  const candidates=new Set([...touching,...neighbors(first).map(n=>n.id)]);
  for(const second of candidates){
   if(first===second||!eligible(second))continue;
   const pair=[first,second].sort();
   pairs.set(pair.join('|'),pair);
  }
 }
 return [...pairs.values()];
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
export function canObject(game,card,cell,attack,defend){
 return abilityAt(game,card,cell)==='objection'&&!card.objectionSpent
  &&attack.rank!=='S'&&defend.rank!=='S'&&attack.total-defend.total<=OBJECTION_MAX_MARGIN;
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
 if(ability==='solitude'){
  const adjacent=neighbors(cell);
  if(adjacent.some(n=>game.board[n.id]?.controller===card.controller))return null;
  const edge=weakestEdge(card,adjacent.filter(n=>n.id!==game.block&&!game.board[n.id]));
  if(edge)return {dir:edge.dir,amount:1};
 }
 if(ability==='earth'){
  const adjacent=neighbors(cell);
  if(adjacent.some(n=>n.id===game.block)){
   const edge=weakestEdge(card,adjacent.filter(n=>n.id!==game.block));
   if(edge)return {dir:edge.dir,amount:1};
  }
 }
 return null;
}
export function chorusTargets(game,cell){
 const element=id=>{
  const card=game.board[id];
  return card?.controller===game.turn?standardAbility(card):null;
 };
 const ring=neighbors(cell).map(n=>n.id);
 return ring.filter(element).flatMap(first=>{
  const elementOfFirst=element(first);
  const neighborsOfFirst=neighbors(first).map(n=>n.id);
  const partners=[...new Set([...ring,...neighborsOfFirst])].filter(id=>element(id)&&element(id)!==elementOfFirst);
  return [[first,'cw'],[first,'ccw'],...partners.map(second=>[first,second])];
 });
}
export function coverEdge(game,card,cell){
 const ward=card.coverWard;
 return ward&&ward.owner===card.controller&&game.placements<ward.until&&eventFieldAt(game,cell)?.type!=='silence'
  ?{dir:ward.dir,amount:ward.amount??1,kind:ward.kind??'cover'}:null;
}
export function effectStrength(game,card,cell,dir,opponent,{attacking=false,abilityDirection=null}={}){
 const f=eventFieldAt(game,cell),base=sideValue(card,dir),field=f?.type==='resonance'&&f.element===cardOf(card).element?1:f?.type==='crossfire'&&f.directions.includes(dir)?1:0;
 const element=elementAdvantage(cardOf(card).element,cardOf(opponent).element,game.elementRules??3)?1:0;
 const bonus=abilityEdge(game,card,cell,{attacking,direction:abilityDirection});
 const cover=attacking?null:coverEdge(game,card,cell);
 const ability=Math.max(bonus?.dir===dir?bonus.amount:0,cover?.dir===dir?cover.amount:0);
 return {base,field,element,ability,...rankedStrength126(base,field+ability+((game.elementRules??3)===3?element:0)),
  ...(!attacking&&laughActive(game,card,cell)?{holdsTie:true}:{})};
}
// All effects resolve on a copy. Merely aiming or cancelling can never alter the board.
export function previewEffect(game,action){
 const {uid,cell,rotation=0,abilityDirection=0,twistCell=null,stepCells=null,pivotDirection=0,bidDirection=null,swapCells=null}=action;
 if(game.rotationLocked&&rotation!==0)throw Error('Handkarten haben eine feste Ausrichtung.');
 validatePlacement(game,{uid,cell,rotation});
 if(!Number.isInteger(abilityDirection)||abilityDirection<0||abilityDirection>5)throw Error('Ungültige Fähigkeitsrichtung.');
 const working={...game,board:{...game.board}};
 for(const [cell,old] of Object.entries(working.board))if(old.guardOwner===game.turn){const c={...old};delete c.guardOwner;delete c.guardUntil;delete c.guardDirection;working.board[cell]=c;}
 const card={...working.players[game.turn].hand.find(c=>c.uid===uid),rotation,controller:game.turn,flips:0},ability=abilityAt(working,card,cell),transforms=[];
 if(twistCell!==null){if(!turnsCards(ability)||!twistTargets(working,cell,ability).includes(twistCell))throw Error('Kein gültiges Drehziel.');const target={...working.board[twistCell]};working.board[twistCell]=target;transforms.push({cell:twistCell,uid:target.uid,from:target.rotation,to:(target.rotation+1)%6});target.rotation=(target.rotation+1)%6;}
 if(ability==='laugh'){card.laughOwner=game.turn;card.laughUntil=game.placements+2;}
 if(guardsEdge(ability)){card.guardDirection=abilityDirection;card.guardOwner=game.turn;card.guardUntil=game.placements+2;}
 const surrounding=neighbors(cell);
 const steps=ability==='sidestep'?sidestepTargets(working,cell):ability==='chorus'?chorusTargets(working,cell):ability==='jam'?jamTargets(working,cell):ability==='fan'?fanTargets(working,cell):[];
 if(stepCells!==null&&(!Array.isArray(stepCells)||!steps.some(pair=>pair.length===stepCells.length&&pair.every((id,index)=>id===stepCells[index])))){
  const name=ability==='chorus'?'Choreografie':ability==='jam'?'Eingabestopp':ability==='fan'?'Leere Ränge':'Platz machen';
  throw Error('Kein gültiges Ziel für '+name+'.');
 }
 const jam=ability==='jam'&&stepCells?stepCells[0]:null;
 const reserve=ability==='fan'&&stepCells?stepCells[0]:null;
 if(jam)working.board[jam]={...working.board[jam],jammedUntil:game.placements+JAM_PLACEMENTS};
 const comparisons=surrounding.filter(n=>working.board[n.id]&&working.board[n.id].controller!==game.turn).map(n=>{
  const other=working.board[n.id],attack=effectStrength(working,card,cell,n.dir,other,{attacking:true,abilityDirection}),defend=effectStrength(working,other,n.id,(n.dir+3)%6,card);
  const setup=n.id===twistCell,elementRules=game.elementRules??3;
  const tieProtected=!setup&&stopsElementTie(attack,defend)&&attackWins(attack,defend,elementRules);
  return {cell:n.id,dir:n.dir,attack,defend,setup,flip:!setup&&effectAttackWins(attack,defend,elementRules),name:cardOf(other).name,...(tieProtected?{tieProtected:true}:{})};
 });
 const directWins=comparisons.filter(c=>c.flip);
 const blocked=directWins.length>=2?directWins.find(c=>canObject(working,working.board[c.cell],c.cell,c.attack,c.defend)):null;
 const objection=blocked?{cell:blocked.cell,dir:(blocked.dir+3)%6}:null;
 if(blocked){blocked.flip=false;blocked.objection=true;}
 let sandwich=null;
 if(ability==='sandwich'){
  for(const target of comparisons){
   if(target.flip||target.setup||target.objection||target.attack.rank==='S'||target.defend.rank==='S')continue;
   const enemy=working.board[target.cell];
   const rear=neighbors(target.cell).filter(({dir})=>[target.dir,(target.dir+1)%6,(target.dir+5)%6].includes(dir));
   const support=rear.reduce((best,{id,dir})=>{
    const ally=working.board[id];
    if(ally?.controller!==game.turn)return best;
    const reverse=(dir+3)%6;
    const attack=effectStrength(working,{...ally,ability:null},id,reverse,enemy,{attacking:true});
    const defend=effectStrength(working,enemy,target.cell,dir,ally);
    if(attack.rank==='S'||defend.rank==='S')return best;
    const surplus=Math.min(SANDWICH_MAX_SUPPORT,attack.total-defend.total);
    return surplus>(best?.amount??0)?{source:id,sourceDir:reverse,amount:surplus}:best;
   },null);
   if(!support)continue;
   const attack={...target.attack,total:target.attack.total+support.amount,sandwich:support.amount};
   if(!effectAttackWins(attack,target.defend,game.elementRules??3))continue;
   Object.assign(target,{attack,flip:true,tieProtected:false,sandwich:true});
   sandwich={cell:target.cell,dir:target.dir,...support};
   break;
  }
 }
 const currentScores=ability==='bid'?scores(game):null;
 const bids=currentScores&&currentScores[game.turn]<currentScores[1-game.turn]&&game.players[game.turn].shifts>0
  ?comparisons.filter(c=>!c.flip&&!c.setup&&!c.objection&&c.attack.rank!=='S'&&effectAttackWins({...c.attack,total:c.attack.total+1},c.defend,game.elementRules??3))
  :[];
 const bid=bidDirection===null?null:bids.find(c=>c.dir===bidDirection);
 if(bidDirection!==null&&!bid)throw Error('Kein gültiger Nachschlag.');
 if(bid){bid.attack={...bid.attack,total:bid.attack.total+1,ability:bid.attack.ability+1};bid.flip=true;bid.tieProtected=false;bid.bid=true;}
 let decoy=null;
 if(ability==='decoy'){
  for(const comparison of comparisons){
   const {attack,defend,dir,cell:enemyCell}=comparison;
   if(comparison.flip||comparison.setup||comparison.objection||defend.rank==='S')continue;
   const target=working.board[enemyCell];
   const edge=(dir+3)%6;
   const adjacent=[(edge+1)%6,(edge+5)%6];
   const read=adjacent.map(dir=>sideValue(target,dir)).filter(value=>!isSRank126(value));
   const amount=Math.min(PIGEON_MAX_REDUCTION,defend.base-Math.min(defend.base,...read));
   if(!amount)continue;
   const mistaken={...defend,total:defend.total-amount,misread:amount};
   if(!effectAttackWins(attack,mistaken,game.elementRules??3))continue;
   comparison.defend=mistaken;
   comparison.flip=true;
   comparison.tieProtected=false;
   comparison.decoy=true;
   decoy={cell:enemyCell,dir:edge,amount};
   break;
  }
 }
 let swipe=null;
 if(ability==='swipe'){
  for(const comparison of comparisons){
   const {attack,defend}=comparison;
   if(comparison.flip||comparison.setup||comparison.objection||defend.ability<1||defend.rank==='S')continue;
   const amount=Math.min(defend.ability,SWIPE_MAX_DEFENSE);
   const weaker={...defend,total:defend.total-amount,ability:defend.ability-amount};
   if(!effectAttackWins(attack,weaker,game.elementRules??3))continue;
   comparison.defend=weaker;
   comparison.flip=true;
   comparison.swipe=true;
   swipe={cell:comparison.cell,dir:comparison.dir,amount};
   break;
  }
 }
 let rainbow=null;
 if(ability==='rainbow'){
  const initialFlips=comparisons.filter(c=>c.flip);
  if(initialFlips.length===1){
   const firstDir=initialFlips[0].dir;
   const tied=comparisons.filter(c=>!c.flip&&!c.setup&&!c.objection&&!c.defend.holdsTie&&c.attack.rank!=='S'&&c.defend.rank!=='S'&&c.attack.total===c.defend.total)
    .sort((a,b)=>(a.dir-firstDir+6)%6-(b.dir-firstDir+6)%6)[0];
   if(tied){
    tied.flip=true;
    tied.rainbow=true;
    rainbow={cell:tied.cell,dir:tied.dir};
   }
  }
 }
 let pursuit=null;
 if(ability==='chase'){
  for(const primary of comparisons){
   if(!primary.flip)continue;
   const dir=primary.dir;
   const behind=neighbors(primary.cell).find(n=>n.dir===dir)?.id;
   const target=working.board[behind];
   if(!target||target.controller===game.turn)continue;
   const base=effectStrength(working,card,cell,dir,target,{attacking:true,abilityDirection});
   const defend=effectStrength(working,target,behind,(dir+3)%6,card);
   const attack={...base,total:base.total-CHASE_PENALTY,distancePenalty:CHASE_PENALTY};
   if(base.rank==='S'||!effectAttackWins(attack,defend,game.elementRules??3))continue;
   comparisons.push({cell:behind,dir,attack,defend,setup:false,flip:true,name:cardOf(target).name,pursuit:true});
   pursuit={cell:behind,dir:(dir+3)%6,through:primary.cell};
   break;
  }
 }
 let bailout=null;
 for(const attempt of comparisons){
  const {attack,defend,cell:target}=attempt;
  if(!attempt.flip||attempt.pursuit||attempt.pincer||attack.rank==='S'||defend.rank==='S'||attack.total-defend.total>JORDAN_MAX_MARGIN)continue;
  const rescued=working.board[target];
  if(!standardAbility(rescued))continue;
  const protector=neighbors(target).find(({id})=>{
   const defender=working.board[id];
   return defender?.controller===rescued.controller&&!defender.bailoutSpent&&abilityAt(working,defender,id)==='bailout'
    &&!comparisons.some(hit=>hit.flip&&hit.cell===id);
  });
  if(!protector)continue;
  attempt.flip=false;attempt.bailout=true;
  bailout={cell:target,protector:protector.id,dir:(attempt.dir+3)%6};
  break;
 }
 const flips=comparisons.filter(c=>c.flip).map(c=>c.cell);
 const pivotTarget=ability==='encore'&&flips.length===1?cell:null;
 if(![-1,0,1].includes(pivotDirection)||pivotDirection!==0&&!pivotTarget)throw Error('Keine Karte für die Drehung erobert.');
 const pivot=pivotDirection?{cell,uid,from:rotation,to:(rotation+pivotDirection+6)%6}:null;
 const swaps=ability==='thought'?thoughtTargets(working,cell,flips):[];
 if(swapCells!==null&&(!Array.isArray(swapCells)||swapCells.length!==2||!swaps.some(pair=>pair.every(id=>swapCells.includes(id)))))throw Error('Kein gültiger Kartentausch.');
 const relocation=ability==='sidestep'&&stepCells?{from:stepCells[0],to:stepCells[1],uid:working.board[stepCells[0]].uid}:null;
 const duet=ability==='chorus'&&Boolean(stepCells&&working.board[stepCells[1]]);
 const chorusPartners=ability==='chorus'&&stepCells?(duet?stepCells:stepCells.slice(0,1)):[];
 for(const [index,cell] of chorusPartners.entries()){
  const ally=working.board[cell];
  const direction=index||stepCells[1]==='ccw'?-1:1;
  const to=(ally.rotation+direction+6)%6;
  working.board[cell]={...ally,rotation:to};
  transforms.push({cell,uid:ally.uid,from:ally.rotation,to});
 }
 const wardTargets=ability==='cover'?surrounding.map(n=>n.id):chorusPartners;
 const coverWards=wardTargets.flatMap(id=>{
  const ally=working.board[id];
  if(ally?.controller!==game.turn||!standardAbility(ally))return [];
  const edge=weakestEdge(ally,neighbors(id).filter(n=>n.id!==cell&&n.id!==working.block&&!working.board[n.id]));
  return edge?[{cell:id,dir:edge.dir,...(ability==='chorus'?{kind:'chorus',amount:duet?CHORUS_DUET_GUARD:1}:{})}]:[];
 }).slice(0,2);

 return {card,cell,ability,abilityDirection,suppressed:Boolean(card.ability&&!ability),transforms,comparisons,flips,board:working.board,steps,relocation,rainbow,swipe,pivotTarget,pivot,decoy,pursuit,coverWards,objection,swapCells,swaps,jam,sandwich,bailout,reserve,bid:bid?.dir??null,bidTargets:bids.map(c=>c.dir)};
}
export function placeEffect(game,action){
 const p=previewEffect(game,action),next=structuredClone(game),side=game.turn,player=next.players[side];next.board=structuredClone(p.board);
 player.hand=player.hand.filter(c=>c.uid!==action.uid);if(player.deck.length)player.hand.push(player.deck.shift());
 next.board[action.cell]={...p.card,flips:p.flips.length};
 if(p.objection)next.board[p.objection.cell].objectionSpent=true;
 if(p.bailout)next.board[p.bailout.protector].bailoutSpent=true;
 if(p.reserve)next.fanReserve={cell:p.reserve,owner:side,until:game.placements+2};
 for(const cell of p.flips){const c=next.board[cell];c.controller=side;delete c.guardOwner;delete c.guardUntil;delete c.guardDirection;delete c.laughOwner;delete c.laughUntil;delete c.coverWard;delete c.jammedUntil;}
 for(const {cell,dir,kind,amount} of p.coverWards)next.board[cell].coverWard={dir,owner:side,until:game.placements+2,...(kind?{kind,amount}:{})};
 if(p.swapCells){
  const [first,second]=p.swapCells;
  [next.board[first],next.board[second]]=[next.board[second],next.board[first]];
 }
 if(p.relocation){
  const {from,to}=p.relocation;
  next.board[to]=next.board[from];
  delete next.board[from];
 }
 if(p.bid!==null)player.shifts--;
 player.flips+=p.flips.length;next.placements++;
 if(next.fanReserve?.until<=next.placements)delete next.fanReserve;
 next.last={type:'place',side,cell:action.cell,uid:action.uid,name:cardOf(p.card).name,flips:p.flips,transforms:p.transforms,ability:p.ability,suppressed:p.suppressed,event:game.eventFieldsEnabled===false?null:eventPhase(next)!==eventPhase(game)?eventPhase(next):null};
 if(p.relocation)next.last.relocation=p.relocation;
 if(p.rainbow)next.last.rainbow=p.rainbow;
 if(p.swipe)next.last.swipe=p.swipe;
 if(p.bid!==null)next.last.bid=p.bid;
 if(p.decoy)next.last.decoy=p.decoy;
 if(p.pursuit)next.last.pursuit=p.pursuit;
 if(p.objection)next.last.objection=p.objection;
 if(p.jam)next.last.jam=p.jam;
 if(p.sandwich)next.last.sandwich=p.sandwich;
 if(p.bailout)next.last.bailout=p.bailout;
 if(p.reserve)next.last.reserve=p.reserve;
 if(p.swapCells)next.last.swapCells=p.swapCells;
 if(p.coverWards.length)next.last.coverWards=p.coverWards;
 if(p.pivot){
  next.board[action.cell].rotation=p.pivot.to;
  next.last.transforms.push(p.pivot);
 }
 const tieBlocks=p.comparisons.filter(c=>c.tieProtected).map(c=>({cell:c.cell,dir:(c.dir+3)%6}));
 if(tieBlocks.length)next.last.tieBlocks=tieBlocks;
 if(game.abilityTrial&&p.ability){
  next.last.abilityDirection=p.abilityDirection;
  if(game.elementalTrial){
   const working={...game,board:p.board};
   next.last.abilityEdge=p.bid!==null?{dir:p.bid,amount:1}:abilityEdge(working,p.card,p.cell,{attacking:true,direction:p.abilityDirection})??abilityEdge(working,p.card,p.cell);
  }
 }
 next.history.push(next.last);
 if(freeCells(next).length===0){next.finished=true;const s=scores(next);next.winner=s[0]===s[1]?null:s[0]>s[1]?0:1;}else next.turn=1-side;
 return next;
}
export function actionOptions(game,card,cell,rotation){
 const ability=abilityAt(game,card,cell),directions=aimsAbility(ability)?[0,1,2,3,4,5]:[0],targets=turnsCards(ability)?[null,...twistTargets(game,cell,ability)]:[null];
 if(ability==='encore'){
  const action={uid:card.uid,cell,rotation,abilityDirection:0};
  return previewEffect(game,action).pivotTarget?[action,{...action,pivotDirection:-1},{...action,pivotDirection:1}]:[action];
 }
 if(ability==='sidestep'||ability==='chorus'||ability==='jam'||ability==='fan'){
  const action={uid:card.uid,cell,rotation,abilityDirection:0};
  const steps=ability==='chorus'?chorusTargets(game,cell):ability==='jam'?jamTargets(game,cell):ability==='fan'?fanTargets(game,cell):sidestepTargets(game,cell);
  return [action,...steps.map(stepCells=>({...action,stepCells}))];
 }
 if(ability==='bid'){
  const action={uid:card.uid,cell,rotation,abilityDirection:0};
  return [action,...previewEffect(game,action).bidTargets.map(bidDirection=>({...action,bidDirection}))];
 }
 if(ability==='thought'){
  const action={uid:card.uid,cell,rotation,abilityDirection:0};
  return [action,...previewEffect(game,action).swaps.map(swapCells=>({...action,swapCells}))];
 }
 return directions.flatMap(abilityDirection=>targets.map(twistCell=>({uid:card.uid,cell,rotation,abilityDirection,twistCell})));
}
