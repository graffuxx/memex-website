import {isSRank126,rankedStrength126} from '../platform/card-ranks126.mjs';
import {ELEMENT_IDS,ELEMENTS as FIVE_ELEMENTS,elementAdvantage,attackWins} from '../platform/elements53.mjs?v=tie-break-63';
import {preview as validatePlacement,cardOf,sideValue,neighbors,freeCells,scores,eventPhase,ELEMENTS,blockadeLocked} from './rules.mjs?v=alpha-complete';

export const TACTIC_BEATS=Object.freeze(Object.fromEntries(ELEMENT_IDS.map(id=>[id,FIVE_ELEMENTS[id].beats])));
export const GUARD_BONUS=2;
export const WATER_BONUS=2;
export const STORM_MAX_EDGE=3;
export const SWIPE_MAX_DEFENSE=2;
export const PIGEON_MAX_REDUCTION=2;
export const CHASE_PENALTY=2;
export const OBJECTION_MAX_MARGIN=2;
export const AWKWARD_PENALTY=2;
export const AMBUSH_BONUS=1;
export const NESTED_MAX_INCREASE=2;
export const PHALANX_BONUS=2;
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
 rage:{name:'Iconic · Rage Pivot',short:'◆',description:'Liegst du zurück, kannst du nach dem Ausspielen die Blockade bis zu zwei freie Felder weit verschieben. Das verbraucht deinen Blockadezug dieser Runde.'},
 buttons:{name:'Iconic · Zweite Wahl',short:'↗',description:'Wähle beim Nachziehen eine der obersten zwei Karten. Die andere bleibt oben im Deck. Die Auswahl ist privat.'},
 exchange:{name:'Iconic · Change My Mind',short:'⇄',description:'Tausche nach dem Ausspielen optional zwei benachbarte eigene Standardkarten. Eine der beiden muss an das gespielte Feld grenzen. Der Tausch löst keine Flips aus.'},
 luxury:{name:'Iconic · Luxusproblem',short:'⇄',description:'Tausche beim Ausspielen die 4 mit einer 2. Eine der beiden Kanten muss auf eine Gegnerkarte zeigen, die andere auf ein freies Feld. Die Werte bleiben danach getauscht.'},
 wander:{name:'Iconic · Falsche Richtung',short:'↶',description:'Wenn das Ausspielfeld keine Gegnerkarte berührt, kannst du diese Karte beim Legen um 60° nach links oder rechts drehen.'},
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
 awkward:{name:'Iconic · Peinliche Stille',short:'…',description:`Markiert beim ersten verbliebenen gegnerischen Nachbarn im Uhrzeigersinn ab Osten die offenen Zahlenkanten. Sie verlieren in deinem nächsten Zug bis zu ${AWKWARD_PENALTY} Verteidigung, maximal bis auf 1.`},
 ambush:{name:'Iconic · Hinterhalt',short:'⇥',description:`Steht direkt hinter der Karte oder seitlich dahinter ein Verbündeter, erhält eine Angriffskante +${AMBUSH_BONUS}, sofern dadurch ein Flip gelingt. Es zählt der erste solche Angriff im Uhrzeigersinn ab Osten.`},
 nested:{name:'Iconic · Karte in der Karte',short:'▣',description:`Nach einem Flip kopiert Yo Dawg den höchsten Zahlenwert der ersten eroberten Standardkarte auf seine schwächste offene Kante. Der Wert kann dauerhaft um bis zu ${NESTED_MAX_INCREASE} steigen.`},
 phalanx:{name:'Prime · Phalanx',short:'⇧',description:`Beim Legen bildet Sparta mit angrenzenden eigenen und gerade eroberten Karten eine Formation. In deinen nächsten zwei Zügen kann eine Karte neben einem Formationsmitglied einmal +${PHALANX_BONUS} auf die erste dadurch gewinnende Zahlenkante erhalten. Grenzt Sparta beim Legen an zwei bereits eigene Karten, kann Sparta den Bonus direkt nutzen. Der Bonus ist einmalig. Beim Verlust Spartas oder aller Partner endet die Formation.`},
 dash:{name:'Prime · Durchbruch',short:'»',description:'Berührt die unversiegelte Blockade eine eigene Karte, kann Sanic auf ihrem Feld landen. Dabei schiebt er die Blockade zuerst auf ein freies Nachbarfeld. Dein normaler Blockadezug bleibt verfügbar.'},
 bailout:{name:'Prime · Rettung in letzter Sekunde',short:'❖',description:`Jordan rettet einmal pro Runde eine benachbarte eigene Standardkarte vor einem direkten Zahlenflip mit höchstens ${JORDAN_MAX_MARGIN} Punkt Vorsprung. Wird Jordan im selben Zug geflippt, greift die Rettung nicht.`},
 fan:{name:'Prime · Leere Ränge',short:'⊠',description:'Reserviere beim Legen ein freies Feld, das an Fan und eine bereits eigene Standardkarte angrenzt. Im nächsten Zug des Gegners bleibt dieses Feld für Karten gesperrt. Andere Spielfelder bleiben bestehen.'},
 blink:{name:'Prime · Blinzler',short:'⟳',description:'Flippt der Gegner genau eine Karte direkt und trifft dabei Blinking Guy oder eine benachbarte eigene Standardkarte, dreht sich die ausgespielte Gegnerkarte nach dem Flip um 60° im Uhrzeigersinn. Einmal pro Runde.'},
 cling:{name:'Prime · Klammergriff',short:'∞',description:'Verbinde beim Legen eine angrenzende eigene Standardkarte mit Overly Attached. Beim ersten direkten Zahlenflip gegen eine der beiden Karten übernimmt der Gegner stattdessen die andere, sofern er sie in diesem Zug noch nicht übernimmt. Gegen S bleibt das ursprüngliche Ziel. Die Verbindung löst sich nach dem ersten Einsatz oder wenn ein Partner verloren geht.'},
 jam:{name:'Prime · Eingabestopp',short:'⌧',description:'Wähle beim Legen eine angrenzende Gegnerkarte. Ihre eigene Fähigkeit pausiert sofort bis zum Ende deines nächsten Zugs. Gedruckte Werte, Elemente und Schutz von anderen Karten bleiben wirksam.'},
 sandwich:{name:'Prime · Sandwich',short:'⟫',description:`Steht ein eigener Verbündeter direkt oder schräg hinter einer Gegnerkarte, kann sein Überschuss gegen deren Rückseite deinen Angriff um bis zu ${SANDWICH_MAX_SUPPORT} verstärken. Es zählt der erste dadurch mögliche Zahlenflip im Uhrzeigersinn. S-Kanten sind ausgenommen.`},
 chorus:{name:'Prime · Choreografie',short:'♫',description:`Drehe beim Legen eine eigene angrenzende Standardkarte um 60° und schütze ihre schwächste offene Kante mit +1. Singt eine zweite Standardkarte eines anderen Elements mit, darf sie an NUMA oder den ersten Partner angrenzen und dreht sich entgegengesetzt. Beide erhalten dann +${CHORUS_DUET_GUARD} Schutz bis zu deinem nächsten Zug. Die Drehung löst keine Flips aus.`},
 relay:{name:'Prime · Wachwechsel',short:'⇆',description:'Flippt Pablo beim Legen keine Karte, kann im nächsten eigenen Zug eine benachbarte Standardkarte nach ihren Flips mit ihm den Platz tauschen. Beide behalten ihre Ausrichtung. Der Tausch löst keine weiteren Flips aus.'},
 retry:{name:'Prime · Zweiter Versuch',short:'⤾',description:'Wenn die normale Ausrichtung keinen Flip bringt und eine eigene Karte angrenzt, darfst du diese Karte beim Legen um 60° drehen. Die Drehung ist nur möglich, wenn dadurch genau ein Flip mit einer Zahlenkante gelingt.'},
 pincer:{name:'Prime · Doppelansage',short:'⤢',description:'Nach genau einem direkten Flip kann eine bereits eigene Nachbarkarte einen zweiten Gegner angreifen, der beide Karten berührt. Die erste erfolgreiche Zahlenkante im Uhrzeigersinn ab Osten zählt. Der Verbündete löst seine eigene Fähigkeit dabei nicht erneut aus.'},
 roundhouse:{name:'Prime · Roundhouse',short:'⟳',description:'Drehe eine mit deiner S-Kante eroberte Karte optional um 60° nach links oder rechts. Die Drehung löst keine Flips aus.'},
 gate:{name:'Prime · Torwache',short:'⊣',description:'Spielst du diese Karte neben die Blockade, bleibt die Blockade für den nächsten gegnerischen Zug an ihrem Platz.'},
 ernie:{name:'Prime · Feuerpakt',short:'✦',description:'Erobert Ernie mit seiner S-Kante eine Karte, erhält deren gegenüberliegende Außenkante +1 Verteidigung bis zum nächsten eigenen Zug. Der Schutz stapelt sich nicht und verändert kein S.'}
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
const ABILITY_STEP_NAMES={chorus:'Choreografie',jam:'Eingabestopp',fan:'Leere Ränge',cling:'Klammergriff'};
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
 'iconic-rage-guy':[7,'rage'],
 'iconic-two-buttons':[7,'buttons'],
 'iconic-change-my-mind':[7,'exchange'],
 'iconic-first-world-problems':[7,'luxury'],
 'iconic-confused-travolta':[7,'wander'],
 'iconic-awkward-penguin':[7,'awkward'],
 'iconic-always-has-been':[7,'ambush'],
 'iconic-yo-dawg':[7,'nested'],
};
export function releasedIconicAbility(card,wave=1){
 const entry=RELEASED_ICONICS[cardOf(card)?.id];
 return entry&&wave>=entry[0]?entry[1]:null;
}
const PRIME_ABILITIES={
 'prime-evil-ernie':'ernie','prime-nuck-chorris':'roundhouse','prime-sparta-kick':'phalanx',
 'prime-emotional-damage':'pincer','prime-pablo-waiting':'relay','prime-here-we-go-again':'retry',
 'prime-one-does-not-simply':'gate','prime-sanic':'dash','prime-numa-numa':'chorus',
 'prime-keyboard-crusher':'jam','prime-idiot-sandwich':'sandwich','prime-crying-jordan':'bailout',
 'prime-disappointed-fan':'fan','prime-blinking-guy':'blink','prime-overly-attached':'cling',
};
export function releasedPrimeAbility(card,includePair=false,allPrimes=false){
 const id=cardOf(card)?.id;
 if(allPrimes)return PRIME_ABILITIES[id]??null;
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
function clingTargets(game,cell){
 return neighbors(cell).filter(({id})=>{
  const card=game.board[id];
  return card?.controller===game.turn&&Boolean(standardAbility(card));
 }).map(({id})=>[id]);
}
export function clingPartner(game,cell,card){
 const link=card.attachedLink;
 if(!link||!neighbors(cell).some(({id})=>id===link.cell))return null;
 const partner=game.board[link.cell];
 return partner?.uid===link.uid&&partner.controller===card.controller?link.cell:null;
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
export function rageTargets(game,cell){
 const own=scores(game);
 if(blockadeLocked(game)||!game.players[game.turn].shifts||own[game.turn]>=own[1-game.turn])return [];
 const open=new Set(freeCells(game));
 open.delete(cell);
 const first=neighbors(game.block).map(n=>n.id).filter(id=>open.has(id));
 return [...new Set([...first,...first.flatMap(id=>neighbors(id).map(n=>n.id).filter(target=>open.has(target)))])];
}
export function exchangeTargets(game,cell){
 const touching=new Set(neighbors(cell).map(n=>n.id));
 const ownedRegular=id=>{
  const card=game.board[id];
  return card?.controller===game.turn&&Boolean(standardAbility(card));
 };
 return [...touching].filter(ownedRegular).flatMap(first=>neighbors(first)
  .map(n=>n.id)
  .filter(second=>ownedRegular(second)&&(!touching.has(second)||first<second))
  .map(second=>[first,second]));
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
export function valueSwapTargets(game,card,cell,rotation=card.rotation??0){
 const adjacent=neighbors(cell);
 const four=adjacent.find(n=>sideValue(card,n.dir,rotation)===4);
 if(!four)return [];
 const enemy=n=>Boolean(game.board[n.id]&&game.board[n.id].controller!==game.turn);
 const open=n=>n.id!==game.block&&!game.board[n.id];
 return adjacent.filter(n=>sideValue(card,n.dir,rotation)===2&&(enemy(four)&&open(n)||open(four)&&enemy(n))).map(n=>[four.dir,n.dir]);
}
export function canTurnSelf(game,cell){
 return !neighbors(cell).some(n=>game.board[n.id]&&game.board[n.id].controller!==game.turn);
}
export function preferredDrawIndex(cards){
 const peak=card=>Math.max(...cardOf(card).values);
 return cards.length>1&&peak(cards[1])>peak(cards[0])?1:0;
}
export function resolveDraw(game,index){
 if(!game.pendingDraw||![0,1].includes(index))throw Error('Keine gültige Nachziehwahl.');
 const next=structuredClone(game),side=next.pendingDraw.side,player=next.players[side];
 player.hand.push(player.deck.splice(index,1)[0]);
 delete next.pendingDraw;
 next.turn=1-side;
 return next;
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
export function wardEdge(game,card,cell){
 if(eventFieldAt(game,cell)?.type==='silence')return null;
 const active=ward=>ward&&ward.owner===card.controller&&game.placements<ward.until;
 if(active(card.coverWard))return {dir:card.coverWard.dir,amount:card.coverWard.amount??1,kind:card.coverWard.kind??'cover'};
 return active(card.ernieWard)?{dir:card.ernieWard.dir,amount:1,kind:'ernie'}:null;
}
export function awkwardEdges(game,card,cell){
 const mark=card.awkwardMark;
 if(!mark||mark.owner!==card.controller||game.placements>=mark.until||eventFieldAt(game,cell)?.type==='silence')return null;
 return {dirs:(mark.localDirections??[mark.localDirection]).map(dir=>(dir+(card.rotation??0))%6),active:game.placements>=mark.from,amount:mark.amount??1};
}
export function dashTargets(game,card,cell){
 if(!game.allPrimes||game.finished||game.pendingDraw||card?.ability!=='dash'||cell!==game.block||blockadeLocked(game))return [];
 if(eventFields(game).some(field=>field.cell===cell&&field.type==='silence'))return [];
 const ring=neighbors(cell);
 if(!ring.some(({id})=>game.board[id]?.controller===game.turn))return [];
 return ring.filter(({id})=>!game.board[id]).map(n=>n.id);
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
export function pabloWaiting(game,card,cell){
 return !game.finished&&card.origin===card.controller&&game.placements<card.pabloUntil&&abilityAt(game,card,cell)==='relay';
}
function relayTarget(game,card,cell){
 if(!game.allPrimes||!standardAbility(card))return null;
 return neighbors(cell).find(({id})=>{
  const pablo=game.board[id];
  return pablo?.controller===game.turn&&pabloWaiting(game,pablo,id);
 })?.id??null;
}
function formationTiles(game,leader,allies){
 const tiles=new Set([leader,...allies].flatMap(cell=>neighbors(cell).map(n=>n.id)));
 return [...tiles].filter(cell=>cell!==leader&&cell!==game.block&&!game.board[cell]);
}
function phalanxAllies(game,leader,card,link){
 if(link.leader!==leader||card.controller!==link.owner)return [];
 return (link.allies??[{cell:link.cell,uid:link.uid}]).filter(({cell,uid})=>{
  const ally=game.board[cell];
  return ally?.uid===uid&&ally?.controller===link.owner;
 });
}
export function phalanxFormations(game){
 if(game.finished)return [];
 return Object.entries(game.board).flatMap(([leader,card])=>{
  const link=card.phalanxLink;
  if(!link||game.placements>=link.until||abilityAt(game,card,leader)!=='phalanx')return [];
  const allies=phalanxAllies(game,leader,card,link).map(ally=>ally.cell);
  if(!allies.length)return [];
  return [{leader,allies,tiles:formationTiles(game,leader,allies),owner:link.owner,ready:game.turn===link.owner&&game.placements>=link.from}];
 });
}
export function effectStrength(game,card,cell,dir,opponent,{attacking=false,abilityDirection=null}={}){
 const f=eventFieldAt(game,cell),base=sideValue(card,dir),field=f?.type==='resonance'&&f.element===cardOf(card).element?1:f?.type==='crossfire'&&f.directions.includes(dir)?1:0;
 const element=elementAdvantage(cardOf(card).element,cardOf(opponent).element,game.elementRules??3)?1:0;
 const bonus=abilityEdge(game,card,cell,{attacking,direction:abilityDirection});
 const ward=attacking?null:wardEdge(game,card,cell);
 const ability=Math.max(bonus?.dir===dir?bonus.amount:0,ward?.dir===dir?ward.amount:0);
 const mark=attacking?null:awkwardEdges(game,card,cell);
 const modifiers=field+ability+((game.elementRules??3)===3?element:0);
 const awkward=mark?.active&&mark.dirs.includes(dir)&&!isSRank126(base)?Math.min(mark.amount,Math.max(0,base+modifiers-1)):0;
 return {base,field,element,ability,...rankedStrength126(base,modifiers-awkward),...(awkward?{awkward}:{}),
  ...(!attacking&&laughActive(game,card,cell)?{holdsTie:true}:{})};

}
// All effects resolve on a copy. Merely aiming or cancelling can never alter the board.
export function previewEffect(game,action){
 const {uid,cell,rotation=0,abilityDirection=0,twistCell=null,blockadeCell=null,swapCells=null,stepCells=null,valueSwap=null,selfTurn=0,bidDirection=null,pivotCapture=false,pivotDirection=pivotCapture?1:0}=action;
 if(game.pendingDraw)throw Error('Wähle zuerst deine Nachziehkarte.');
 if(game.rotationLocked&&rotation!==0)throw Error('Handkarten haben eine feste Ausrichtung.');
 const held=game.players[game.turn].hand.find(c=>c.uid===uid);
 const dashChoices=dashTargets(game,held,cell);
 const dash=dashChoices.length?(blockadeCell??dashChoices[0]):null;
 if(dash&&!dashChoices.includes(dash))throw Error('Kein gültiges Ziel für Durchbruch.');
 const working={...game,board:{...game.board},block:dash??game.block};
 validatePlacement(working,{uid,cell,rotation});
 if(!Number.isInteger(abilityDirection)||abilityDirection<0||abilityDirection>5)throw Error('Ungültige Fähigkeitsrichtung.');
 for(const [cell,old] of Object.entries(working.board))if(old.guardOwner===game.turn){const c={...old};delete c.guardOwner;delete c.guardUntil;delete c.guardDirection;working.board[cell]=c;}
 const card={...held,rotation,controller:game.turn,flips:0},ability=abilityAt(working,card,cell),transforms=[];
 if(blockadeCell!==null&&!dash&&(ability!=='rage'||!rageTargets(working,cell).includes(blockadeCell)))throw Error('Kein gültiges Blockadeziel.');
 if(twistCell!==null){if(!turnsCards(ability)||!twistTargets(working,cell,ability).includes(twistCell))throw Error('Kein gültiges Drehziel.');const target={...working.board[twistCell]};working.board[twistCell]=target;transforms.push({cell:twistCell,uid:target.uid,from:target.rotation,to:(target.rotation+1)%6});target.rotation=(target.rotation+1)%6;}
 if(![-1,0,1].includes(selfTurn)||selfTurn&&(ability!=='retry'&&(ability!=='wander'||!canTurnSelf(working,cell))))throw Error('Diese Ausrichtung ist hier nicht möglich.');
 if(selfTurn&&ability==='wander')card.rotation=(rotation+selfTurn+6)%6;
 if(valueSwap!==null){
  const choices=ability==='luxury'?valueSwapTargets(working,card,cell):[];
  if(!Array.isArray(valueSwap)||valueSwap.length!==2||!choices.some(pair=>pair.every(dir=>valueSwap.includes(dir))))throw Error('Kein gültiger Wertetausch.');
  // Keep the swap in card-local directions so it follows rotations and card moves.
  card.edgeSwap=valueSwap.map(dir=>(dir-card.rotation+6)%6);
 }
 if(ability==='laugh'){card.laughOwner=game.turn;card.laughUntil=game.placements+2;}
 if(guardsEdge(ability)){card.guardDirection=abilityDirection;card.guardOwner=game.turn;card.guardUntil=game.placements+2;}
 const surrounding=neighbors(cell);
 const steps=ability==='sidestep'?sidestepTargets(working,cell):ability==='chorus'?chorusTargets(working,cell):ability==='jam'?jamTargets(working,cell):ability==='fan'?fanTargets(working,cell):ability==='cling'?clingTargets(working,cell):[];
 if(stepCells!==null&&(!Array.isArray(stepCells)||!steps.some(pair=>pair.length===stepCells.length&&pair.every((id,index)=>id===stepCells[index])))){
  const effect=ABILITY_STEP_NAMES[ability]??'Platz machen';
  throw Error('Kein gültiges Ziel für '+effect+'.');
 }
 const jam=ability==='jam'&&stepCells?stepCells[0]:null;
 const reserve=ability==='fan'&&stepCells?stepCells[0]:null;
 const link=ability==='cling'&&stepCells?stepCells[0]:null;
 if(link)card.attachedLink={cell:link,uid:working.board[link].uid};
 if(jam){
  working.board[jam]={...working.board[jam],jammedUntil:game.placements+JAM_PLACEMENTS};
 }
 const enemies=surrounding.filter(n=>working.board[n.id]&&working.board[n.id].controller!==game.turn);
 const compare=facing=>enemies.map(n=>{
  const other=working.board[n.id],attack=effectStrength(working,facing,cell,n.dir,other,{attacking:true,abilityDirection}),defend=effectStrength(working,other,n.id,(n.dir+3)%6,facing);
  const setup=n.id===twistCell,elementRules=game.elementRules??3;
  const tieProtected=!setup&&stopsElementTie(attack,defend)&&attackWins(attack,defend,elementRules);
  return {cell:n.id,dir:n.dir,attack,defend,setup,flip:!setup&&effectAttackWins(attack,defend,elementRules),name:cardOf(other).name,...(tieProtected?{tieProtected:true}:{})};
 });
 let comparisons=compare(card);
 const turnChoices=ability==='wander'&&canTurnSelf(working,cell)?[-1,1]:[];
 if(ability==='retry'&&enemies.length&&!comparisons.some(c=>c.flip)&&surrounding.some(n=>working.board[n.id]?.controller===game.turn)){
  for(const turn of [-1,1]){
   const facing={...card,rotation:(rotation+turn+6)%6};
   const attempt=compare(facing);
   const captures=attempt.filter(c=>c.flip);
   if(captures.length!==1||captures[0].attack.rank==='S')continue;
   turnChoices.push(turn);
   if(selfTurn===turn){
    card.rotation=facing.rotation;
    comparisons=attempt;
   }
  }
 }
 if(selfTurn&&ability==='retry'&&!turnChoices.includes(selfTurn))throw Error('Kein gültiger zweiter Versuch.');
 const formation=game.allPrimes&&comparisons.length&&phalanxFormations(working)
  .find(link=>link.owner===game.turn&&link.ready&&link.tiles.includes(cell));
 const immediate=ability==='phalanx'&&surrounding.filter(n=>working.board[n.id]?.controller===game.turn).length>=2;
 const phalanxHit=(formation||immediate)&&!(ability==='retry'&&selfTurn)&&comparisons.find(c=>!c.flip&&!c.setup&&c.attack.rank!=='S'
  &&effectAttackWins({...c.attack,total:c.attack.total+PHALANX_BONUS},c.defend,game.elementRules??3));
 if(phalanxHit){
  phalanxHit.attack={...phalanxHit.attack,total:phalanxHit.attack.total+PHALANX_BONUS,formation:PHALANX_BONUS};
  phalanxHit.flip=true;phalanxHit.tieProtected=false;phalanxHit.phalanx=true;
 }
 const directWins=comparisons.filter(c=>c.flip);
 const blocked=directWins.length>=2?directWins.find(c=>canObject(working,working.board[c.cell],c.cell,c.attack,c.defend)):null;
 const objection=blocked?{cell:blocked.cell,dir:(blocked.dir+3)%6}:null;
 if(blocked){blocked.flip=false;blocked.objection=true;}
 let ambush=null;
 if(ability==='ambush'){
  const support=new Map(neighbors(cell).map(({id,dir})=>[dir,working.board[id]]));
  const target=comparisons.find(c=>!c.flip&&!c.setup&&!c.objection&&c.attack.rank!=='S'
   &&[2,3,4].some(offset=>support.get((c.dir+offset)%6)?.controller===game.turn)
   &&effectAttackWins({...c.attack,total:c.attack.total+AMBUSH_BONUS},c.defend,game.elementRules??3));
  if(target){
   target.attack={...target.attack,total:target.attack.total+AMBUSH_BONUS,ability:target.attack.ability+AMBUSH_BONUS};
   target.flip=true;target.tieProtected=false;target.ambush=true;ambush=target.dir;
  }
 }
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
 let bailout=null;
 for(const attempt of comparisons){
  const {attack,defend,cell:target}=attempt;
  if(!attempt.flip||attack.rank==='S'||defend.rank==='S'||attack.total-defend.total>JORDAN_MAX_MARGIN)continue;
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
 let attachment=null;
 for(const hit of comparisons){
  if(!hit.flip||hit.attack.rank==='S')continue;
  const defender=working.board[hit.cell];
  const linkedPrime=[hit.cell,...neighbors(hit.cell).map(({id})=>id)].find(id=>{
   const prime=working.board[id];
   if(!prime||prime.controller!==defender.controller||abilityAt(working,prime,id)!=='cling')return false;
   const partner=clingPartner(working,id,prime);
   const substitute=id===hit.cell?partner:partner===hit.cell?id:null;
   return substitute&&!comparisons.some(c=>c.flip&&c.cell===substitute);
  });
  if(!linkedPrime)continue;
  const substitute=linkedPrime===hit.cell?working.board[linkedPrime].attachedLink.cell:linkedPrime;
  hit.redirect=substitute;
  attachment={source:linkedPrime,cell:substitute,target:hit.cell};
  break;
 }
 // Resolve reactions to direct hits before using a successful hit to trigger a follow-up.
 let rainbow=null;
 if(ability==='rainbow'){
  const initialFlips=comparisons.filter(c=>c.flip&&!c.redirect);
  if(initialFlips.length===1){
   const firstDir=initialFlips[0].dir;
   const tied=comparisons.filter(c=>!c.flip&&!c.setup&&!c.objection&&!c.bailout&&c.cell!==attachment?.cell&&!c.defend.holdsTie&&c.attack.rank!=='S'&&c.defend.rank!=='S'&&c.attack.total===c.defend.total)
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
   if(!primary.flip||primary.redirect)continue;
   const dir=primary.dir;
   const behind=neighbors(primary.cell).find(n=>n.dir===dir)?.id;
   const target=working.board[behind];
   if(!target||target.controller===game.turn||behind===attachment?.cell)continue;
   const base=effectStrength(working,card,cell,dir,target,{attacking:true,abilityDirection});
   const defend=effectStrength(working,target,behind,(dir+3)%6,card);
   const attack={...base,total:base.total-CHASE_PENALTY,distancePenalty:CHASE_PENALTY};
   if(base.rank==='S'||!effectAttackWins(attack,defend,game.elementRules??3))continue;
   comparisons.push({cell:behind,dir,attack,defend,setup:false,flip:true,name:cardOf(target).name,pursuit:true});
   pursuit={cell:behind,dir:(dir+3)%6,through:primary.cell};
   break;
  }
 }
 let pincer=null;
 if(ability==='pincer'&&comparisons.filter(c=>c.flip&&!c.redirect).length===1){
  const ring=neighbors(cell);
  for(const target of comparisons){
   if(target.flip||target.setup||target.objection||target.bailout||target.cell===attachment?.cell)continue;
   const enemy=working.board[target.cell];
   for(const {id:source} of ring){
    const ally=working.board[source];
    if(ally?.controller!==game.turn)continue;
    const toward=neighbors(source).find(n=>n.id===target.cell);
    if(!toward)continue;
    const attack=effectStrength(working,{...ally,ability:null},source,toward.dir,enemy,{attacking:true});
    if(attack.rank==='S')continue;
    const defend=effectStrength(working,enemy,target.cell,(toward.dir+3)%6,ally);
    if(!effectAttackWins(attack,defend,game.elementRules??3))continue;
    Object.assign(target,{attack,defend,flip:true,tieProtected:false,pincer:true});
    pincer={source,dir:toward.dir,cell:target.cell};
    break;
   }
   if(pincer)break;
  }
 }
 const resolvedHits=comparisons.filter(c=>c.flip);
 let blink=null;
 const [hit]=resolvedHits;
 if(resolvedHits.length===1&&!hit.pursuit&&!hit.pincer&&!hit.rainbow&&!hit.redirect){
  const target=working.board[hit.cell];
  const candidates=target.ability==='blink'?[hit.cell]:standardAbility(target)?neighbors(hit.cell).map(n=>n.id):[];
  const source=candidates.find(id=>{
   const defender=working.board[id];
   return defender?.controller===target.controller&&!defender.blinkSpent&&abilityAt(working,defender,id)==='blink';
  });
  if(source)blink={source,cell,uid:card.uid,from:card.rotation,to:(card.rotation+1)%6};
 }
 const sCapture=comparisons.find(c=>c.flip&&c.attack.rank==='S');
 const rally=phalanxHit?.flip?{dir:phalanxHit.dir,leader:formation?.leader??cell}:null;
 const captured=ability==='ernie'&&sCapture&&!isSRank126(sideValue(working.board[sCapture.cell],sCapture.dir))?sCapture:null;
 const flips=resolvedHits.map(c=>c.redirect??c.cell);
 const phalanxAlliedCells=ability==='phalanx'&&freeCells(working).length>2?
  neighbors(cell).filter(({id})=>working.board[id]?.controller===game.turn||flips.includes(id)).map(n=>n.id):[];
 const phalanx=phalanxAlliedCells.length&&rally?.leader!==cell?
  {leader:cell,allies:phalanxAlliedCells,tiles:formationTiles(working,cell,phalanxAlliedCells)}:null;
 const pivotTarget=ability==='roundhouse'?sCapture?.cell??null:ability==='encore'&&flips.length===1?cell:null;
 if(typeof pivotCapture!=='boolean'||![-1,0,1].includes(pivotDirection)||pivotDirection!==0&&!pivotTarget)throw Error('Keine Karte für die Drehung erobert.');
 const relay=relayTarget(working,card,cell);
 const swaps=relay?[[relay,cell]]:ability==='exchange'?exchangeTargets(game,cell):ability==='thought'?thoughtTargets(working,cell,flips):[];
 const waiting=ability==='relay'&&!flips.length&&freeCells(working).length>2
  &&surrounding.some(({id})=>id!==working.block&&!working.board[id]);
 if(swapCells!==null){
  const legal=Array.isArray(swapCells)&&swapCells.length===2&&swaps.some(pair=>pair.every(id=>swapCells.includes(id)));
  if(!legal)throw Error('Kein gültiger Kartentausch.');
 }
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
 let awkward=null;
 if(ability==='awkward'&&freeCells(working).length>2){
  for(const {cell:target,flip} of comparisons){
   if(flip)continue;
   const enemy=working.board[target];
   const dirs=neighbors(target).filter(({id,dir})=>{
    const value=sideValue(enemy,dir);
    return id!==cell&&id!==working.block&&!working.board[id]&&value>1&&!isSRank126(value);
   }).map(({dir})=>dir);
   if(dirs.length){awkward={cell:target,dirs};break;}
  }
 }
 let nested=null;
 if(ability==='nested'){
  const source=flips.map(id=>working.board[id]).find(standardAbility);
  const openEdges=neighbors(cell).filter(({id,dir})=>id!==working.block&&!working.board[id]&&!isSRank126(sideValue(card,dir)));
  const edge=source&&weakestEdge(card,openEdges);
  if(edge){
   const base=sideValue(card,edge.dir);
   const highest=Math.max(...cardOf(source).values.filter(value=>!isSRank126(value)));
   const value=Math.min(base+NESTED_MAX_INCREASE,highest);
   if(value>base){
    card.edgeCopy={dir:(edge.dir-card.rotation+6)%6,value};
    nested={dir:edge.dir,value};
   }
  }
 }
 const pivotCard=pivotTarget===cell?card:working.board[pivotTarget];
 const pivot=pivotDirection?{cell:pivotTarget,uid:pivotCard.uid,from:pivotCard.rotation,to:(pivotCard.rotation+pivotDirection+6)%6}:null;
 const blockadeLock=ability==='gate'&&neighbors(cell).some(n=>n.id===game.block)?{owner:game.turn,until:game.placements+2}:null;
 const ward=captured?{cell:captured.cell,dir:captured.dir}:null;
 const blockadeMove=dash||blockadeCell!==null?{from:game.block,to:dash??blockadeCell}:null;
 return {card,cell,ability,abilityDirection,suppressed:Boolean(card.ability&&!ability),transforms,comparisons,flips,board:working.board,ward,coverWards,blockadeMove,dash:Boolean(dash),blockadeLock,swapCells,swaps,pivotTarget,pivot,valueSwap,selfTurn,steps,relocation,rainbow,swipe,decoy,pursuit,objection,ambush,awkward,nested,phalanx,rally,pincer,relay,waiting,turnChoices,valueSwaps:ability==='luxury'?valueSwapTargets(working,held,cell,rotation):[],jam,sandwich,bailout,reserve,link,attachment,blink,bid:bid?.dir??null,bidTargets:bids.map(c=>c.dir)};
}
export function placeEffect(game,action,{chooseDraw=false}={}){
 const p=previewEffect(game,action),next=structuredClone(game),side=game.turn,player=next.players[side];next.board=structuredClone(p.board);
 player.hand=player.hand.filter(c=>c.uid!==action.uid);
 next.board[action.cell]={...p.card,flips:p.flips.length};
 if(p.objection)next.board[p.objection.cell].objectionSpent=true;
 if(p.bailout)next.board[p.bailout.protector].bailoutSpent=true;
 if(p.attachment)delete next.board[p.attachment.source].attachedLink;
 if(p.blink)next.board[p.blink.source].blinkSpent=true;
 if(p.reserve)next.fanReserve={cell:p.reserve,owner:side,until:game.placements+2};
 if(p.waiting)next.board[action.cell].pabloUntil=game.placements+3;
 for(const cell of p.flips){const c=next.board[cell];c.controller=side;delete c.guardOwner;delete c.guardUntil;delete c.guardDirection;delete c.ernieWard;delete c.coverWard;delete c.laughOwner;delete c.laughUntil;delete c.awkwardMark;delete c.phalanxLink;delete c.pabloUntil;delete c.jammedUntil;delete c.attachedLink;}
 if(p.rally)delete next.board[p.rally.leader].phalanxLink;
 if(p.phalanx?.tiles.length){
  const allies=p.phalanx.allies.map(cell=>({cell,uid:next.board[cell].uid}));
  next.board[action.cell].phalanxLink={leader:action.cell,allies,owner:side,from:game.placements+2,until:game.placements+5};
 }
 if(p.ward)next.board[p.ward.cell].ernieWard={dir:p.ward.dir,owner:side,until:game.placements+2};
 for(const {cell,dir,kind,amount} of p.coverWards)next.board[cell].coverWard={dir,owner:side,until:game.placements+2,...(kind?{kind,amount}:{})};
 if(p.awkward){
  const target=next.board[p.awkward.cell];
  target.awkwardMark={owner:target.controller,localDirections:p.awkward.dirs.map(dir=>(dir-(target.rotation??0)+6)%6),from:game.placements+2,until:game.placements+3,amount:AWKWARD_PENALTY};
 }
 if(p.pivot)next.board[p.pivot.cell].rotation=p.pivot.to;
 if(p.blink){
  const incoming=next.board[action.cell];
  const from=incoming.rotation;
  p.blink={...p.blink,from,to:(from+1)%6};
  incoming.rotation=p.blink.to;
 }
 if(p.swapCells){
  if(p.relay)delete next.board[p.relay].pabloUntil;
  const [first,second]=p.swapCells;
  [next.board[first],next.board[second]]=[next.board[second],next.board[first]];
 }
 if(p.relocation){
  const {from,to}=p.relocation;
  next.board[to]=next.board[from];
  delete next.board[from];
 }
 if(p.blockadeMove){next.block=p.blockadeMove.to;if(!p.dash)player.shifts--;}
 if(p.bid!==null)player.shifts--;
 if(p.blockadeLock)next.blockadeLock=p.blockadeLock;
 else if(next.blockadeLock&&next.blockadeLock.until<=game.placements+1)delete next.blockadeLock;
 player.flips+=p.flips.length;next.placements++;
 if(next.fanReserve?.until<=next.placements)delete next.fanReserve;
 for(const [leader,card] of Object.entries(next.board)){
  if(card.attachedLink&&!clingPartner(next,leader,card))delete card.attachedLink;
  const link=card.phalanxLink;
  if(!link)continue;
  const allies=phalanxAllies(next,leader,card,link);
  if(next.placements>=link.until||!allies.length)delete card.phalanxLink;
  else card.phalanxLink={...link,allies};
 }
 next.last={type:'place',side,cell:action.cell,uid:action.uid,name:cardOf(p.card).name,flips:p.flips,transforms:p.transforms,ability:p.ability,suppressed:p.suppressed,event:game.eventFieldsEnabled===false?null:eventPhase(next)!==eventPhase(game)?eventPhase(next):null};
 if(p.ward)next.last.ward=p.ward;
 if(p.coverWards.length)next.last.coverWards=p.coverWards;
 if(p.pivot)next.last.transforms.push(p.pivot);
 if(p.swapCells)next.last.swapCells=p.swapCells;
 if(p.waiting)next.last.waiting=true;
 if(p.relay&&p.swapCells)next.last.relay=p.relay;
 if(p.relocation)next.last.relocation=p.relocation;
 if(p.rainbow)next.last.rainbow=p.rainbow;
 if(p.swipe)next.last.swipe=p.swipe;
 if(p.bid!==null)next.last.bid=p.bid;
 if(p.decoy)next.last.decoy=p.decoy;
 if(p.pursuit)next.last.pursuit=p.pursuit;
 if(p.objection)next.last.objection=p.objection;
 if(p.awkward)next.last.awkward=p.awkward;
 if(p.ambush!==null)next.last.ambush=p.ambush;
 if(p.nested)next.last.nested=p.nested;
 if(p.phalanx?.tiles.length)next.last.phalanx=p.phalanx;
 if(p.rally)next.last.rally=p.rally;
 if(p.pincer)next.last.pincer=p.pincer;
 if(p.jam)next.last.jam=p.jam;
 if(p.sandwich)next.last.sandwich=p.sandwich;
 if(p.bailout)next.last.bailout=p.bailout;
 if(p.reserve)next.last.reserve=p.reserve;
 if(p.link)next.last.link=p.link;
 if(p.attachment)next.last.attachment=p.attachment;
 if(p.blink)next.last.blink=p.blink;
 const tieBlocks=p.comparisons.filter(c=>c.tieProtected).map(c=>({cell:c.cell,dir:(c.dir+3)%6}));
 if(tieBlocks.length)next.last.tieBlocks=tieBlocks;
 if(p.valueSwap)next.last.valueSwap=p.valueSwap;
 if(p.selfTurn)next.last.selfTurn=p.selfTurn;
 if(p.blockadeLock)next.last.blockadeLock=true;
 if(p.blockadeMove)next.last.blockadeMove=p.blockadeMove;
 if(p.dash)next.last.dash=true;
 if(game.abilityTrial&&p.ability){
  next.last.abilityDirection=p.abilityDirection;
  if(game.elementalTrial){
   const working={...game,board:p.board};
   const selected=p.bid??p.ambush;
   next.last.abilityEdge=selected!==null?{dir:selected,amount:p.ambush!==null?AMBUSH_BONUS:1}:abilityEdge(working,p.card,p.cell,{attacking:true,direction:p.abilityDirection})??abilityEdge(working,p.card,p.cell);
  }
 }
 next.history.push(next.last);
 if(freeCells(next).length===0){next.finished=true;const s=scores(next);next.winner=s[0]===s[1]?null:s[0]>s[1]?0:1;}
 if(!next.finished&&chooseDraw&&p.ability==='buttons'&&player.deck.length>=2){
  next.pendingDraw={side};
 }else{
  if(player.deck.length)player.hand.push(player.deck.shift());
  if(!next.finished)next.turn=1-side;
 }
 return next;
}
export function actionOptions(game,card,cell,rotation){
 const ability=abilityAt(game,card,cell),directions=aimsAbility(ability)?[0,1,2,3,4,5]:[0],targets=turnsCards(ability)?[null,...twistTargets(game,cell,ability)]:[null];
 if(ability==='luxury')return [null,...valueSwapTargets(game,card,cell,rotation)].map(valueSwap=>({uid:card.uid,cell,rotation,abilityDirection:0,valueSwap}));
 if(ability==='wander'&&canTurnSelf(game,cell))return [0,-1,1].map(selfTurn=>({uid:card.uid,cell,rotation,abilityDirection:0,selfTurn}));
 if(ability==='sidestep'||ability==='chorus'||ability==='jam'||ability==='fan'||ability==='cling'){
  const action={uid:card.uid,cell,rotation,abilityDirection:0};
  const steps=ability==='chorus'?chorusTargets(game,cell):ability==='jam'?jamTargets(game,cell):ability==='fan'?fanTargets(game,cell):ability==='cling'?clingTargets(game,cell):sidestepTargets(game,cell);
  return [action,...steps.map(stepCells=>({...action,stepCells}))];
 }
 if(ability==='bid'){
  const action={uid:card.uid,cell,rotation,abilityDirection:0};
  return [action,...previewEffect(game,action).bidTargets.map(bidDirection=>({...action,bidDirection}))];
 }
 if(ability==='exchange'||ability==='thought'||ability==='retry'){
  const action={uid:card.uid,cell,rotation,abilityDirection:0};
  const plan=previewEffect(game,action);
  if(ability==='retry')return [action,...plan.turnChoices.map(selfTurn=>({...action,selfTurn}))];
  return [action,...plan.swaps.map(swapCells=>({...action,swapCells}))];
 }
 if(ability==='roundhouse'||ability==='encore'){
  const action={uid:card.uid,cell,rotation,abilityDirection:0};
  return previewEffect(game,action).pivotTarget?[action,{...action,pivotDirection:-1},{...action,pivotDirection:1}]:[action];
 }
 if(ability==='dash'&&cell===game.block)return dashTargets(game,card,cell).map(blockadeCell=>({uid:card.uid,cell,rotation,abilityDirection:0,blockadeCell}));
 if(ability==='rage')return [null,...rageTargets(game,cell)].map(blockadeCell=>({uid:card.uid,cell,rotation,abilityDirection:0,twistCell:null,blockadeCell}));
 const swap=relayTarget(game,card,cell);
 return directions.flatMap(abilityDirection=>targets.flatMap(twistCell=>{
  const action={uid:card.uid,cell,rotation,abilityDirection,twistCell};
  return swap?[action,{...action,swapCells:[swap,cell]}]:[action];
 }));
}
