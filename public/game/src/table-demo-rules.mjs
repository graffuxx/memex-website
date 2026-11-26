import {isSRank126,rankedStrength126} from '../platform/card-ranks126.mjs';
import {ELEMENT_IDS,ELEMENTS as FIVE_ELEMENTS,elementAdvantage,attackWins} from '../platform/elements53.mjs?v=tie-break-63';
import {preview as validatePlacement,cardOf,sideValue,neighbors,freeCells,scores,eventPhase,ELEMENTS,blockadeLocked} from './rules.mjs?v=hand-effects-46';

import {BETA_CARDS} from '../platform/beta-cards.mjs';
import {betaAdjustment,stageBetaChoice,betaParkour,betaCliffhanger,finishBetaMove,betaOptions} from './beta-rules.mjs';

export const TACTIC_BEATS=Object.freeze(Object.fromEntries(ELEMENT_IDS.map(id=>[id,FIVE_ELEMENTS[id].beats])));
export const GUARD_BONUS=2;
export const WATER_BONUS=2;
export const STORM_MAX_EDGE=3;
export const TWO_BUTTONS_BONUS=2;
export const SWIPE_MAX_DEFENSE=2;
export const STEVE_LOOT_WARD=2;
const STEVE_REWORK_WAVE=9;
export const TACTICAL_REWORK_WAVE=10;
export const HAND_EFFECTS_WAVE=11;
export const CURRENT_ICONIC_WAVE=HAND_EFFECTS_WAVE;
export const ROUND_PLACEMENTS=18;
export const RECALL_EDGE_BONUS=2;
export const PIGEON_MAX_REDUCTION=2;
export const CHASE_PENALTY=2;
export const OBJECTION_MAX_MARGIN=2;
export const AWKWARD_PENALTY=2;
export const PENGUIN_REWORK_WAVE=8;
export const PENGUIN_DEFENSE_PENALTY=1;
export const AMBUSH_BONUS=1;
export const NESTED_MAX_INCREASE=2;
export const PHALANX_BONUS=2;
export const CHORUS_DUET_GUARD=2;
export const JAM_PLACEMENTS=3;
export const SANDWICH_MAX_SUPPORT=3;
export const PLOT_MAX_DEFICIT=3;
export const PATIENCE_ATTACK=2;
export const OVERLOAD_ATTACK=2;
export const OVERLOAD_COST=2;
export const JORDAN_MAX_MARGIN=1;
export const guardBonus=game=>game.abilityTrial?1:GUARD_BONUS;
export const ABILITIES={
 ...Object.fromEntries(BETA_CARDS.map(c=>[c.ability,{name:c.effect,short:'✦',description:c.description}])),
 hype:{name:'Much Hype',short:'H',description:'Beim Ausspielen +1 auf eine gewählte Angriffsseite.'},
 guard:{name:'Feels Bad',short:'S',description:'Eine Seite erhält +2 Verteidigung bis zum nächsten eigenen Karten-Zug.'},
 twist:{name:'Think Again',short:'↻',description:'Du kannst eine benachbarte Gegnerkarte einen Schritt nach rechts drehen. Sie bleibt in diesem Zug beim Gegner.'},
 fire:{name:'Fire · Glutstoß',short:'↑',description:'Berührt die Karte genau einen Gegner, erhält die Angriffskante gegen ihn +1.'},
 water:{name:'Water · Wellenschild',short:'◈',description:`Eine gewählte Kante erhält +${WATER_BONUS} Verteidigung bis zum nächsten eigenen Zug.`},
 earth:{name:'Earth · Bollwerk',short:'◆',description:'Grenzt diese Karte an eine eigene Karte oder die Blockade, erhält ihre schwächste offene Kante +1 Verteidigung. Der Bonus wandert mit der schwächsten offenen Kante.'},
 air:{name:'Air · Rückenwind',short:'↻',description:'Du kannst eine eigene Nachbarkarte einen Schritt nach rechts drehen. Die Drehung flippt keine Karten.'},
 storm:{name:'Storm · Flankenblitz',short:'ϟ',description:'Grenzt die Karte an mindestens zwei Gegner, bekommt ihre schwächste Zahlenkante gegen diese Gegner +1 Angriff.'},
 rage:{name:'Iconic · Rage Pivot',short:'◆',description:'Liegst du zurück, kannst du nach dem Ausspielen die Blockade bis zu zwei freie Felder weit verschieben. Das verbraucht deinen Blockadezug dieser Runde.'},
 buttons:{name:'Iconic · Zwei Knöpfe',short:'↗',description:'Rot: +2 Angriff für einen Zusatzflip. Blau: +2 Schutz auf der schwächsten freien Seite bis zu deinem nächsten Zug.'},
 exchange:{name:'Iconic · Change My Mind',short:'⇄',description:'Tausche beim Ausspielen den Platz mit einer benachbarten eigenen Standardkarte. Change My Mind greift vom neuen Platz aus an.'},
 handCycle:{name:'Iconic · Hand wechseln',short:'⇆',description:'Beim Ausspielen darfst du eine andere Handkarte unters Deck legen und eine neue ziehen. Danach ziehst du wie gewohnt für deinen Zug.'},
 boardRecall:{name:'Prime · Zurück auf die Hand',short:'↥',description:`Beim Ausspielen darfst du eine Standardkarte aus deinem Deck auf die Hand zurücknehmen, wenn sie dir auf dem Feld gehört. Ihre schwächste Seite erhält +${RECALL_EDGE_BONUS}. Danach ziehst du normal.`},
 handDisrupt:{name:'Prime · Hand stören',short:'✦',description:'Wenn NUMA NUMA eine Karte flippt, wirft der Gegner eine zufällige Handkarte ab und zieht sofort Ersatz. Das gilt, solange der Gegner noch einen Zug und Karten im Stapel hat.'},
 luxury:{name:'Iconic · Luxusproblem',short:'⇄',description:'Tausche beim Ausspielen die 4 mit einer 2. Eine der beiden Kanten muss auf eine Gegnerkarte zeigen, die andere auf ein freies Feld. Die Werte bleiben danach getauscht.'},
 wander:{name:'Iconic · Falsche Richtung',short:'↶',description:'Wenn das Ausspielfeld keine Gegnerkarte berührt, kannst du diese Karte beim Legen einen Schritt nach links oder rechts drehen.'},
 sidestep:{name:'Iconic · Platz machen',short:'↝',description:'Beim Legen darfst du eine benachbarte eigene Standardkarte um ein Feld ziehen. Das Ziel muss frei sein und an Greg grenzen. Die Karte behält ihre Ausrichtung. Eben geflippte Karten bleiben liegen.'},
 laugh:{name:'Iconic · Letztes Lachen',short:'◉',description:'Im nächsten gegnerischen Zug schützt Letztes Lachen nur bei gleichen Zahlenwerten. 4 gegen 4 hält auch gegen das stärkere Element. 5 gegen 4 flippt KEKW auch mit schwächerem Element. S schlägt Zahlenwerte.'},
 solitude:{name:'Iconic · Allein auf weiter Flur',short:'◇',description:'Solange keine eigene Karte angrenzt, erhält die schwächste offene Kante +1 Verteidigung.'},
 rainbow:{name:'Iconic · Zweiter Bogen',short:'⌒',description:'Nach genau einem direkten Flip kann Double Rainbow noch eine Gegnerkarte mit gleicher Zahl übernehmen. Ein Schutz bei Gleichstand hält. Die Vorschau markiert den Zusatzflip.'},
 swipe:{name:'Iconic · Schildklau',short:'−',description:`Steve ignoriert bis zu ${SWIPE_MAX_DEFENSE} Schutzpunkte einer Gegnerkarte, wenn er sie dadurch übernimmt. Das gilt für einen Angriff. Andere Boni und S bleiben wirksam.`},
 loot:{name:'Iconic · Beute sichern',short:'✦',description:`Flippt Steve eine Karte, erhält die eroberte Karte +${STEVE_LOOT_WARD} Verteidigung auf ihrer schwächsten freien Zahlenseite. Der Schutz hält bis zu deinem nächsten Zug und gilt für höchstens eine Karte.`},
 encore:{name:'Iconic · Zugabe',short:'♫',description:'Nach genau einem Flip darfst du Epic Sax Guy einen Schritt nach links oder rechts drehen. Die Drehung ändert nur die Ausrichtung für folgende Züge.'},
 bid:{name:'Iconic · Nachschlag',short:'+1',description:'Wenn du zurückliegst, kannst du deinen ungenutzten Blockadezug für +1 Angriff auf einer Kante ausgeben. Die Option erscheint, wenn dadurch eine Karte flippt. Die Blockade bleibt stehen.'},
 decoy:{name:'Iconic · Falsche Kante',short:'◇',description:`Steht neben der verteidigenden Seite eine niedrigere Zahl, kann Pigeon den Grundwert der verteidigenden Seite um bis zu ${PIGEON_MAX_REDUCTION} senken. Das gilt für höchstens einen Angriff, den Pigeon dadurch gewinnt. Schilde und S bleiben wirksam.`},
 chase:{name:'Iconic · Kein Entkommen',short:'»',description:`Nach einem direkten Flip kann der Angriff mit ${CHASE_PENALTY} Punkten weniger weitergehen. So kann die Karte einen zweiten Gegner flippen, der direkt hinter der ersten geflippten Karte liegt.`},
 cover:{name:'Iconic · Rückendeckung',short:'◈',description:'Beim Legen erhalten bis zu zwei bereits eigene Standard-Nachbarn +1 Verteidigung an ihrer jeweils schwächsten offenen Kante bis zum nächsten eigenen Zug. Schutzboni stapeln sich nicht.'},
 objection:{name:'Iconic · Einspruch',short:'!',description:`Würde ein Zug mindestens zwei Karten direkt flippen, kann diese Karte ihren eigenen Flip einmal pro Runde abwehren. Der gegnerische Zahlenwert darf höchstens ${OBJECTION_MAX_MARGIN} Punkte höher sein. Gegen S greift der Einspruch nicht.`},
 thought:{name:'Iconic · Gedankenexperiment',short:'?',description:'Würde Philosoraptor keine Karte flippen, kann er einen knappen Vergleich gewinnen. Seine Zahlenkante darf gleich stark oder einen Punkt schwächer sein. Patt-Schutz gilt weiter.'},
 awkward:{name:'Iconic · Peinliche Stille',short:'…',description:`Beim Ausspielen markiert der Pinguin eine Gegnerkarte in bis zu zwei Feldern Entfernung. Sie hat −${PENGUIN_DEFENSE_PENALTY} Verteidigung auf allen Zahlenseiten, bis sie geflippt wird. Die Vorschau zeigt das Ziel.`},
 ambush:{name:'Iconic · Hinterhalt',short:'⇥',description:`Lege Always Has Been zwischen eine eigene Karte und einen Gegner. Die eigene Karte darf dem Gegner direkt oder schräg gegenüberliegen. Ist damit ein Zusatzflip möglich, bekommt der Angriff +${AMBUSH_BONUS}. Die Vorschau markiert das Ziel.`},
 plotTwist:{name:'Iconic · Plot Twist',short:'⇥',description:'Wähle eine Nachbarkarte für einen Zusatzflip. Dein Element muss stärker sein und deine Zahl darf bis zu 3 Punkte niedriger sein.'},
 patience:{name:'Prime · Geduld',short:'⌛',description:'Flippt Pablo beim Legen nichts, bekommt deine nächste Karte +2 auf einen Angriff, wenn sie dadurch eine Karte flippt.'},
 overload:{name:'Prime · Überlastung',short:'⌧',description:'Optional: +2 Angriff für einen Zusatzflip. Dafür verliert Crusher für diese Runde 2 Punkte auf jeder Zahlenseite (mindestens 1).'},
 pincerSandwich:{name:'Prime · Sandwich',short:'⟫',description:'Liegt eine eigene Karte hinter einem Gegner, greift sie ihn von hinten an. Gewinnt ihr Angriff, flippt der Gegner. Höchstens ein Zusatzflip.'},
 nested:{name:'Iconic · Karte in der Karte',short:'▣',description:`Nach einem Flip kopiert Yo Dawg den höchsten Zahlenwert der ersten eroberten Standardkarte auf seine schwächste offene Kante. Der Wert kann dauerhaft um bis zu ${NESTED_MAX_INCREASE} steigen.`},
 phalanx:{name:'Prime · Phalanx',short:'⇧',description:`Beim Legen bildet Sparta mit angrenzenden eigenen und gerade eroberten Karten eine Formation. In deinen nächsten zwei Zügen kann eine Karte neben einem Formationsmitglied einmal +${PHALANX_BONUS} auf die erste dadurch gewinnende Zahlenkante erhalten. Grenzt Sparta beim Legen an zwei bereits eigene Karten, kann Sparta den Bonus direkt nutzen. Der Bonus ist einmalig. Beim Verlust Spartas oder aller Partner endet die Formation.`},
 dash:{name:'Prime · Durchbruch',short:'»',description:'Berührt die unversiegelte Blockade eine eigene Karte, kann Sanic auf ihrem Feld landen. Dabei schiebt er die Blockade zuerst auf ein freies Nachbarfeld. Dein normaler Blockadezug bleibt verfügbar.'},
 bailout:{name:'Prime · Rettung in letzter Sekunde',short:'❖',description:`Jordan rettet einmal pro Runde eine benachbarte eigene Standardkarte vor einem direkten Zahlenflip mit höchstens ${JORDAN_MAX_MARGIN} Punkt Vorsprung. Wird Jordan im selben Zug geflippt, greift die Rettung nicht.`},
 fan:{name:'Prime · Leere Ränge',short:'⊠',description:'Reserviere beim Legen ein freies Feld, das an Fan und eine bereits eigene Standardkarte angrenzt. Im nächsten Zug des Gegners bleibt dieses Feld für Karten gesperrt. Andere Spielfelder bleiben bestehen.'},
 blink:{name:'Prime · Blinzler',short:'⟳',description:'Flippt der Gegner nur Blinking Guy oder nur eine eigene Standardkarte neben ihm, dreht sich die angreifende Karte einen Schritt nach rechts. Der Flip zählt. Einmal pro Runde.'},
 cling:{name:'Prime · Klammergriff',short:'∞',description:'Verbinde beim Legen eine angrenzende eigene Standardkarte mit Overly Attached. Beim ersten direkten Zahlenflip gegen eine der beiden Karten übernimmt der Gegner stattdessen die andere, sofern er sie in diesem Zug noch nicht übernimmt. Gegen S bleibt das ursprüngliche Ziel. Die Verbindung löst sich nach dem ersten Einsatz oder wenn ein Partner verloren geht.'},
 jam:{name:'Prime · Eingabestopp',short:'⌧',description:'Wähle beim Legen eine angrenzende Gegnerkarte. Ihre eigene Fähigkeit pausiert sofort bis zum Ende deines nächsten Zugs. Gedruckte Werte, Elemente und Schutz von anderen Karten bleiben wirksam.'},
 sandwich:{name:'Prime · Sandwich',short:'⟫',description:`Greife einen Gegner an, hinter dem eine eigene Karte liegt. Sie darf auch schräg dahinter liegen. Schlägt ihre Zahl die Seite des Gegners, die sie berührt, liefert die Differenz bis zu +${SANDWICH_MAX_SUPPORT} für einen Zusatzflip. Der Effekt nutzt nur Zahlen.`},
 chorus:{name:'Prime · Choreografie',short:'♫',description:`Drehe eine eigene Standardkarte neben NUMA einen Schritt und gib ihrer schwächsten offenen Seite +1 Schutz. Wähle für ein Duett zusätzlich eine eigene Standardkarte mit anderem Element neben NUMA oder neben dem ersten Partner. Beide drehen sich in entgegengesetzte Richtungen und erhalten +${CHORUS_DUET_GUARD} Schutz. Der Schutz hält bis zu deinem nächsten Zug. Die Drehung flippt keine Karten.`},
 relay:{name:'Prime · Wachwechsel',short:'⇆',description:'Flippt Pablo beim Legen keine Karte, kann im nächsten eigenen Zug eine benachbarte Standardkarte nach ihren Flips mit ihm den Platz tauschen. Beide behalten ihre Ausrichtung. Der Tausch löst keine weiteren Flips aus.'},
 retry:{name:'Prime · Zweiter Versuch',short:'⤾',description:'Liegt eine eigene Karte daneben und würdest du sonst nichts flippen, kannst du diese Karte beim Legen einen Schritt nach links oder rechts drehen. Die Pfeile zeigen, welche Drehung genau einen Flip mit einer Zahl bringt.'},
 pincer:{name:'Prime · Schockwelle',short:'⤢',description:'Wenn Emotional Damage eine Karte flippt, kann diese sofort einen ihrer Nachbarn flippen. Dafür muss ihre Zahlenkante gewinnen. Höchstens ein Zusatzflip.'},
 roundhouse:{name:'Prime · Roundhouse',short:'⟳',description:'Drehe eine mit S eroberte Karte nach links oder rechts. Schlägt sie dadurch mit einer Zahlenkante einen neuen Nachbarn, flippt sie ihn. Ein Zusatzflip pro Zug.'},
 gate:{name:'Prime · Torwache',short:'⊣',description:'Spielst du diese Karte neben die Blockade, bleibt die Blockade für den nächsten gegnerischen Zug an ihrem Platz.'},
 ernie:{name:'Prime · Feuerpakt',short:'✦',description:'Flippt Ernie eine Karte mit S, bekommt die eroberte Karte +1 Verteidigung auf der Seite, die von Ernie wegzeigt. Das hält bis zu deinem nächsten Zug. S bleibt unverändert.'}
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
 if(!entry||wave<entry[0])return null;
 if(entry[1]==='luxury'&&wave>=HAND_EFFECTS_WAVE)return 'handCycle';
 if(entry[1]==='ambush'&&wave>=TACTICAL_REWORK_WAVE)return 'plotTwist';
 return entry[1]==='swipe'&&wave>=STEVE_REWORK_WAVE?'loot':entry[1];
}
const PRIME_ABILITIES={
 'prime-evil-ernie':'ernie','prime-nuck-chorris':'roundhouse','prime-sparta-kick':'phalanx',
 'prime-emotional-damage':'pincer','prime-pablo-waiting':'relay','prime-here-we-go-again':'retry',
 'prime-one-does-not-simply':'gate','prime-sanic':'dash','prime-numa-numa':'chorus',
 'prime-keyboard-crusher':'jam','prime-idiot-sandwich':'sandwich','prime-crying-jordan':'bailout',
 'prime-disappointed-fan':'fan','prime-blinking-guy':'blink','prime-overly-attached':'cling',
};
const TACTICAL_PRIME_ABILITIES={
 'prime-pablo-waiting':'patience','prime-keyboard-crusher':'overload','prime-idiot-sandwich':'pincerSandwich',
};
export function releasedPrimeAbility(card,includePair=false,allPrimes=false,wave=0){
 const id=cardOf(card)?.id;
 if(allPrimes&&wave>=HAND_EFFECTS_WAVE){
  if(id==='prime-here-we-go-again')return 'boardRecall';
  if(id==='prime-numa-numa')return 'handDisrupt';
 }
 if(allPrimes&&wave>=TACTICAL_REWORK_WAVE&&TACTICAL_PRIME_ABILITIES[id])return TACTICAL_PRIME_ABILITIES[id];
 if(allPrimes)return PRIME_ABILITIES[id]??null;
 if(id==='prime-numa-numa')return 'chorus';
 if(id==='prime-keyboard-crusher')return 'jam';
 if(id==='prime-idiot-sandwich')return 'sandwich';
 if(includePair&&id==='prime-crying-jordan')return 'bailout';
 if(includePair&&id==='prime-disappointed-fan')return 'fan';
 return null;
}
export function abilityDescription(game,ability){
 if(ability==='earth'&&game&&!game.earthSupport)return 'Neben der Blockade erhält die schwächste erreichbare Kante +1 Verteidigung, solange die Blockade dort bleibt.';
 if(ability==='guard')return `Eine Seite erhält +${guardBonus(game)} Verteidigung bis zum nächsten eigenen Karten-Zug.`;
 if(ability==='awkward'&&game&&(game.iconicAbilityWave??0)<PENGUIN_REWORK_WAVE)return `Markiert einen Gegner neben dem Pinguin. In deinem nächsten Zug verteidigen seine markierten offenen Zahlenseiten mit bis zu ${AWKWARD_PENALTY} Punkten weniger, mindestens mit 1.`;
 if(game&&!game.abilityRework){
  if(ability==='buttons')return 'Beim Nachziehen wählst du eine der obersten zwei Karten. Die andere bleibt oben im Deck.';
  if(ability==='storm')return `Gegen mindestens zwei Nachbarn erhält die schwächste Angriffskante +1, wenn ihr Grundwert höchstens ${STORM_MAX_EDGE} beträgt.`;
  if(ability==='exchange')return 'Tausche zwei benachbarte eigene Standardkarten. Eine muss an das ausgespielte Feld grenzen.';
  if(ability==='thought')return 'Tausche zwei gegnerische Standardkarten, die in diesem Zug ihre Seite behalten. Eine muss an Philosoraptor grenzen.';
  if(ability==='roundhouse')return 'Drehe eine mit S eroberte Karte nach links oder rechts. Die Drehung löst keine Flips aus.';
  if(ability==='pincer')return 'Nach genau einem direkten Flip kann eine bereits eigene Nachbarkarte einen zweiten Gegner angreifen, der beide Karten berührt.';
 }
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
export function abilityAt(game,card,cell){
 return card.ability&&!jamActive(game,card)&&eventFieldAt(game,cell)?.type!=='silence'?card.ability:null;
}
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
 if(game.abilityRework)return [...touching].filter(ownedRegular).map(ally=>[cell,ally]);
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

function roundhouseFollowUp(game,source,direction,comparisons){
 const captured=game.board[source],before={...captured,controller:game.turn,ability:null};
 const turned={...before,rotation:(before.rotation+direction+6)%6};
 for(const {id,dir} of neighbors(source)){
  const enemy=game.board[id];
  if(!enemy||enemy.controller===game.turn||comparisons.some(hit=>hit.flip&&hit.cell===id))continue;
  const defend=effectStrength(game,enemy,id,(dir+3)%6,turned);
  const attack=effectStrength(game,turned,source,dir,enemy,{attacking:true});
  const previous=effectStrength(game,before,source,dir,enemy,{attacking:true});
  if(attack.rank==='S'||effectAttackWins(previous,defend,game.elementRules??3)||!effectAttackWins(attack,defend,game.elementRules??3))continue;
  return {cell:id,source,dir,attack,defend,setup:false,flip:true,roundhouse:true,name:cardOf(enemy).name};
 }
 return null;
}

function shockwaveFollowUp(game,card,cell,comparisons){
 const captured=comparisons.filter(hit=>hit.flip).map(hit=>hit.redirect??hit.cell);
 if(!captured.length)return null;
 const board={...game.board,[cell]:card};
 for(const id of captured)board[id]={...board[id],controller:game.turn,ability:null};
 const working={...game,board};
 const protectedCells=new Set(comparisons.filter(hit=>hit.objection||hit.bailout||hit.finalGuard||hit.redirect).map(hit=>hit.cell));
 for(const source of captured)for(const {id,dir} of neighbors(source)){
  const target=board[id];
  if(!target||target.controller===game.turn||protectedCells.has(id))continue;
  const attacker=board[source];
  const attack=effectStrength(working,attacker,source,dir,target,{attacking:true});
  const defend=effectStrength(working,target,id,(dir+3)%6,attacker);
  if(attack.rank==='S'||!effectAttackWins(attack,defend,game.elementRules??3))continue;
  return {cell:id,source,dir,attack,defend,setup:false,flip:true,pincer:true,name:cardOf(target).name};
 }
 return null;
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
   const edge=weakestEdge(card,game.abilityRework?enemies.filter(({dir})=>!isSRank126(sideValue(card,dir))):enemies);
   if(edge&&(game.abilityRework||sideValue(card,edge.dir)<=STORM_MAX_EDGE))return {dir:edge.dir,amount:1};
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
  const supported=adjacent.some(({id})=>id===game.block||game.earthSupport&&game.board[id]?.controller===card.controller);
  if(supported){
   const edge=weakestEdge(card,adjacent.filter(({id})=>id!==game.block&&(!game.earthSupport||!game.board[id])));
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
 if(!mark||mark.owner!==card.controller||(mark.until!=null&&game.placements>=mark.until)||eventFieldAt(game,cell)?.type==='silence')return null;
 if(mark.persistent){
  const dirs=Array.from({length:6},(_,dir)=>dir).filter(dir=>!isSRank126(sideValue(card,dir)));
  return {dirs,active:true,amount:mark.amount,persistent:true};
 }
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
 const ability=Math.max(bonus?.dir===dir?bonus.amount:0,ward?.dir===dir?ward.amount:0)+betaAdjustment(game,card,cell,dir,base,attacking);
 const mark=attacking?null:awkwardEdges(game,card,cell);
 const modifiers=field+ability+((game.elementRules??3)===3?element:0);
 const awkward=mark?.active&&mark.dirs.includes(dir)&&!isSRank126(base)?Math.min(mark.amount,Math.max(0,base+modifiers-1)):0;
 return {base,field,element,ability,...rankedStrength126(base,game.betaTrial?Math.max(1-base,modifiers-awkward):modifiers-awkward),...(awkward?{awkward}:{}),
  ...(!attacking&&laughActive(game,card,cell)?{holdsTie:true}:{})};

}
// All effects resolve on a copy. Merely aiming or cancelling can never alter the board.
export function previewEffect(game,action){
 const choice=action.buttonChoice??null;
 if(choice!==null&&choice!=='attack'&&choice!=='defense')throw Error('Ungültige Wahl für Two Buttons.');
 const plan=resolvePlacement(game,action);
 if(!game.abilityRework||plan.ability!=='buttons'){
  if(choice!==null)throw Error('Two Buttons ist hier nicht verfügbar.');
  return plan;
 }

 const open=neighbors(plan.cell).filter(({id,dir})=>id!==game.block&&!plan.board[id]&&!isSRank126(sideValue(plan.card,dir)));
 const defense=weakestEdge(plan.card,open)?.dir??null;
 let attack=null,attackPlan=null;
 for(const hit of plan.comparisons){
  if(hit.flip||hit.setup||hit.objection||hit.bailout||hit.finalGuard||hit.attack.rank==='S')continue;
  if(!effectAttackWins({...hit.attack,total:hit.attack.total+TWO_BUTTONS_BONUS},hit.defend,game.elementRules??3))continue;
  const candidate=resolvePlacement(game,action,hit.dir);
  const additional=candidate.flips.find(cell=>!plan.flips.includes(cell));
  if(!additional||candidate.flips.length<=plan.flips.length)continue;
  attack={dir:hit.dir,cell:additional};attackPlan=candidate;
  break;
 }
 if((choice==='attack'&&!attack)||(choice==='defense'&&defense===null))throw Error('Diese Wahl ist hier nicht verfügbar.');
 if(choice==='defense')plan.card.coverWard={dir:defense,owner:game.turn,until:game.placements+2,amount:TWO_BUTTONS_BONUS,kind:'buttons'};
 return {...(choice==='attack'?attackPlan:plan),buttonChoice:choice,buttonAttack:attack,buttonDefense:defense};
}

function handCycleTargets(game,uid){
 const {hand,deck}=game.players[game.turn];
 return game.placements<ROUND_PLACEMENTS-2&&deck.length>=2?hand.filter(card=>card.uid!==uid).map(card=>card.uid):[];
}
function boardRecallTargets(game){
 if(game.placements>=ROUND_PLACEMENTS-2)return [];
 return Object.entries(game.board).filter(([,card])=>card.origin===game.turn&&card.controller===game.turn&&Boolean(standardAbility(card))).map(([cell])=>cell);
}
function disruptionIndex(game,uid,length){
 // The server holds the shuffle seed. Stable across retries, independent of the opponent's card identities.
 let hash=(game.seed??0)^Math.imul(game.placements+1,0x9e3779b9);
 for(const char of uid)hash=Math.imul(hash^char.charCodeAt(0),0x01000193);
 return (hash>>>0)%length;
}
export function recalledCard(card){
 const held={};
 for(const key of ['id','uid','origin','variantId','element','rarity','ability','beta'])if(card[key]!==undefined)held[key]=card[key];
 const values=cardOf(card).values;
 const weakest=Math.min(...values.filter(value=>!isSRank126(value)));
 held.edgeCopy={dir:values.indexOf(weakest),value:weakest+RECALL_EDGE_BONUS};
 return held;
}

function resolvePlacement(game,action,buttonAttackDir=null){
 const {uid,cell,rotation=0,abilityDirection=0,twistCell=null,blockadeCell=null,swapCells=null,stepCells=null,valueSwap=null,selfTurn=0,bidDirection=null,pivotCapture=false,pivotDirection=pivotCapture?1:0}=action;
 const plotTarget=action.plotTarget??null;
 const overloadTarget=action.overloadTarget??null;
 if(game.pendingDraw)throw Error('Wähle zuerst deine Nachziehkarte.');
 if(game.rotationLocked&&rotation!==0)throw Error('Handkarten haben eine feste Ausrichtung.');
 const held=game.players[game.turn].hand.find(c=>c.uid===uid);
 const dashChoices=dashTargets(game,held,cell);
 const dash=dashChoices.length?(blockadeCell??dashChoices[0]):null;
 if(dash&&!dashChoices.includes(dash))throw Error('Kein gültiges Ziel für Durchbruch.');
 const working={...game,board:{...game.board},block:dash??game.block};
 validatePlacement(working,{uid,cell,rotation});
 if(game.abilityRework&&swapCells!==null&&abilityAt(working,held,cell)==='exchange'){
  const swaps=exchangeTargets(working,cell);
  const pair=Array.isArray(swapCells)&&swapCells.length===2&&swaps.find(ids=>ids.every(id=>swapCells.includes(id)));
  if(!pair)throw Error('Kein gültiger Kartentausch.');
  const [,ally]=pair;
  const swapped={...working,board:{...working.board,[cell]:working.board[ally]}};
  delete swapped.board[ally];
  const plan=resolvePlacement(swapped,{...action,cell:ally,swapCells:null});
  // The action still records the placement field. The saved move applies the swap once.
  plan.board[ally]=plan.board[cell];
  delete plan.board[cell];
  return {...plan,cell,attackCell:ally,swapCells:pair,swaps};
 }
 if(!Number.isInteger(abilityDirection)||abilityDirection<0||abilityDirection>5)throw Error('Ungültige Fähigkeitsrichtung.');
 for(const [cell,old] of Object.entries(working.board))if(old.guardOwner===game.turn){const c={...old};delete c.guardOwner;delete c.guardUntil;delete c.guardDirection;working.board[cell]=c;}
 const card={...held,rotation,controller:game.turn,flips:0},ability=abilityAt(working,card,cell),transforms=[];
 const cycleUid=action.cycleUid??null,recallCell=action.recallCell??null;
 const cycleTargets=ability==='handCycle'?handCycleTargets(game,uid):[];
 const recallTargets=ability==='boardRecall'?boardRecallTargets(game):[];
 if(cycleUid!==null&&!cycleTargets.includes(cycleUid))throw Error('Diese Handkarte kann nicht gewechselt werden.');
 if(recallCell!==null&&!recallTargets.includes(recallCell))throw Error('Diese Brettkarte kann nicht zurück auf die Hand.');

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
 if(game.betaTrial)stageBetaChoice(working,card,action);
 else if(action.betaChoice!=null)throw Error('Beta choice unavailable.');
 const enemies=surrounding.filter(n=>working.board[n.id]&&working.board[n.id].controller!==game.turn);
 const compare=facing=>enemies.map(n=>{
  const other=working.board[n.id],attack=effectStrength(working,facing,cell,n.dir,other,{attacking:true,abilityDirection}),defend=effectStrength(working,other,n.id,(n.dir+3)%6,facing);
  if(n.dir===buttonAttackDir){attack.total+=TWO_BUTTONS_BONUS;attack.ability+=TWO_BUTTONS_BONUS;}
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
 const closeEnough=({setup,attack,defend})=>!setup&&attack.rank!=='S'&&defend.rank!=='S'
  &&(defend.total===attack.total&&!defend.holdsTie||defend.total===attack.total+1);
 const thought=game.abilityRework&&ability==='thought'&&!comparisons.some(c=>c.flip)
  ?comparisons.find(c=>c.attack.total===c.defend.total&&closeEnough(c))??comparisons.find(closeEnough):null;
 if(thought){thought.flip=true;thought.thought=true;}
 const swept=game.abilityRework&&ability==='roundhouse'&&[-1,1].includes(pivotDirection)
  ?comparisons.find(c=>c.flip&&c.attack.rank==='S'):null;
 const followUp=swept?roundhouseFollowUp(working,swept.cell,pivotDirection,comparisons):null;
 if(followUp)comparisons.push(followUp);
 const extraAttack=(hit,bonus)=>effectAttackWins({...hit.attack,total:hit.attack.total+bonus},hit.defend,game.elementRules??3);
 const numericTarget=hit=>!hit.flip&&!hit.setup&&!hit.objection&&hit.attack.rank!=='S'&&hit.defend.rank!=='S';
 const patienceState=game.players[game.turn].patienceUntil===game.placements;
 const patienceBonus=game.patienceBonus??PATIENCE_ATTACK;
 const patientHit=patienceState?comparisons.find(hit=>numericTarget(hit)&&extraAttack(hit,patienceBonus)):null;
 if(patientHit){
  patientHit.attack.total+=patienceBonus;
  patientHit.attack.ability+=patienceBonus;
  patientHit.flip=true;
  patientHit.tieProtected=false;
 }
 if(game.betaTrial)betaParkour(working,card,action,comparisons,effectStrength,effectAttackWins);
 const directWins=comparisons.filter(c=>c.flip);
 const blocked=directWins.length>=2?directWins.find(c=>canObject(working,working.board[c.cell],c.cell,c.attack,c.defend)):null;
 const objection=blocked?{cell:blocked.cell,dir:(blocked.dir+3)%6}:null;
 if(blocked){blocked.flip=false;blocked.objection=true;}
 const plotTargets=ability==='plotTwist'?comparisons.filter(hit=>!hit.flip&&!hit.setup&&!hit.objection
  &&hit.attack.rank!=='S'&&hit.defend.rank!=='S'&&hit.attack.element&&!stopsElementTie(hit.attack,hit.defend)
  &&hit.defend.total-hit.attack.total<=(game.plotMarginLimit??PLOT_MAX_DEFICIT)):[];
 const plot=plotTargets.find(hit=>hit.cell===plotTarget);
 if(plotTarget!==null&&!plot)throw Error('Kein gültiges Ziel für Plot Twist.');
 if(plot)plot.flip=true;
 const overloadBonus=game.overloadBonus??OVERLOAD_ATTACK;
 const overloadTargets=ability==='overload'?comparisons.filter(hit=>numericTarget(hit)&&extraAttack(hit,overloadBonus)):[];
 const overloadHit=overloadTargets.find(hit=>hit.cell===overloadTarget);
 if(overloadTarget!==null&&!overloadHit)throw Error('Kein gültiges Ziel für Überlastung.');
 if(overloadHit){
  overloadHit.attack.total+=overloadBonus;
  overloadHit.attack.ability+=overloadBonus;
  overloadHit.flip=true;
  overloadHit.tieProtected=false;
 }
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
 if(ability==='sandwich'||ability==='pincerSandwich'){
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
    if(ability==='pincerSandwich'){
     if(!effectAttackWins(attack,defend,game.elementRules??3))return best;
     return !best||attack.total-defend.total>best.attack.total-best.defend.total?{source:id,sourceDir:reverse,attack,defend}:best;
    }
    const surplus=Math.min(SANDWICH_MAX_SUPPORT,attack.total-defend.total);
    return surplus>(best?.amount??0)?{source:id,sourceDir:reverse,amount:surplus}:best;
   },null);
   if(!support)continue;
   if(ability==='pincerSandwich'){
    Object.assign(target,{attack:support.attack,defend:support.defend,source:support.source,flip:true,tieProtected:false,sandwich:true});
    sandwich={cell:target.cell,dir:target.dir,source:support.source,sourceDir:support.sourceDir,rearAttack:true};
    break;
   }
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
 const guardedHit=game.finalGuard===true&&game.placements===17&&game.turn!==game.starter
  ?comparisons.find(c=>c.flip&&c.attack.rank!=='S'&&working.board[c.cell].controller===game.starter):null;
 let finalGuard=guardedHit?{cell:guardedHit.cell,uid:working.board[guardedHit.cell].uid}:null;
 if(guardedHit){guardedHit.flip=false;guardedHit.finalGuard=true;}
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
   const tied=comparisons.filter(c=>!c.flip&&!c.setup&&!c.objection&&!c.bailout&&!c.finalGuard&&c.cell!==attachment?.cell&&!c.defend.holdsTie&&c.attack.rank!=='S'&&c.defend.rank!=='S'&&c.attack.total===c.defend.total)
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
 if(ability==='pincer'&&game.abilityRework){
  const follow=shockwaveFollowUp(working,card,cell,comparisons);
  if(follow){
   if(!finalGuard&&game.finalGuard===true&&game.placements===17&&game.turn!==game.starter&&working.board[follow.cell].controller===game.starter){
    finalGuard={cell:follow.cell,uid:working.board[follow.cell].uid};
    follow.flip=false;follow.finalGuard=true;
   }else pincer={source:follow.source,cell:follow.cell,dir:follow.dir,shockwave:true};
   comparisons.push(follow);
  }
 }else if(ability==='pincer'&&comparisons.filter(c=>c.flip&&!c.redirect).length===1){
  const ring=neighbors(cell);
  for(const target of comparisons){
   if(target.flip||target.setup||target.objection||target.bailout||target.finalGuard||target.cell===attachment?.cell)continue;
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
 const betaLanding=game.betaTrial?betaCliffhanger(working,card,action,comparisons,effectStrength,effectAttackWins):null;
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
 if(sandwich?.rearAttack&&!resolvedHits.some(hit=>hit.sandwich))sandwich=null;
 const flips=resolvedHits.map(c=>c.redirect??c.cell);
 const patienceArmed=ability==='patience'&&!flips.length&&freeCells(working).length>2;
 if(overloadHit?.flip)card.edgeWear=OVERLOAD_COST;
 const phalanxAlliedCells=ability==='phalanx'&&freeCells(working).length>2?
  neighbors(cell).filter(({id})=>working.board[id]?.controller===game.turn||flips.includes(id)).map(n=>n.id):[];
 const phalanx=phalanxAlliedCells.length&&rally?.leader!==cell?
  {leader:cell,allies:phalanxAlliedCells,tiles:formationTiles(working,cell,phalanxAlliedCells)}:null;
 const pivotTarget=ability==='roundhouse'?sCapture?.cell??null:ability==='encore'&&flips.length===1?cell:null;
 if(typeof pivotCapture!=='boolean'||![-1,0,1].includes(pivotDirection)||pivotDirection!==0&&!pivotTarget)throw Error('Keine Karte für die Drehung erobert.');
 const relay=relayTarget(working,card,cell);
 const swaps=relay?[[relay,cell]]:ability==='exchange'?exchangeTargets(game,cell):ability==='thought'&&!game.abilityRework?thoughtTargets(working,cell,flips):[];
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
 const securingLoot=ability==='loot';
 const wardTargets=securingLoot?flips:ability==='cover'?surrounding.map(n=>n.id):chorusPartners;
 const coverWards=wardTargets.flatMap(id=>{
  const ally=working.board[id];
  if(!securingLoot&&(ally?.controller!==game.turn||!standardAbility(ally)))return [];
  const edge=weakestEdge(ally,neighbors(id).filter(n=>n.id!==cell&&n.id!==working.block&&!working.board[n.id]
   &&(!securingLoot||!isSRank126(sideValue(ally,n.dir)))));
  if(securingLoot)return edge?[{cell:id,dir:edge.dir,kind:'loot',amount:STEVE_LOOT_WARD}]:[];
  return edge?[{cell:id,dir:edge.dir,...(ability==='chorus'?{kind:'chorus',amount:duet?CHORUS_DUET_GUARD:1}:{})}]:[];
 }).slice(0,securingLoot?1:2);
 let awkward=null;
 if(ability==='awkward'&&(game.iconicAbilityWave??0)>=PENGUIN_REWORK_WAVE){
  const nearby=new Set(surrounding.map(({id})=>id));
  for(const {id} of surrounding)for(const neighbor of neighbors(id))nearby.add(neighbor.id);
  let openSides=0;
  for(const target of nearby){
   const enemy=working.board[target];
   if(!enemy||enemy.controller===game.turn||flips.includes(target))continue;
   const count=neighbors(target).filter(({id,dir})=>
    id!==cell&&id!==working.block&&!working.board[id]&&sideValue(enemy,dir)>1&&!isSRank126(sideValue(enemy,dir))
   ).length;
   if(count<=openSides)continue;
   openSides=count;
   awkward={cell:target,amount:PENGUIN_DEFENSE_PENALTY,persistent:true};
  }
 }else if(ability==='awkward'&&freeCells(working).length>2){
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
 const roundhouse=followUp?.flip?{source:followUp.source,cell:followUp.redirect??followUp.cell,dir:followUp.dir}:null;
 const opponent=game.players[1-game.turn];
 const handDisrupted=ability==='handDisrupt'&&flips.length>0&&game.placements<ROUND_PLACEMENTS-1
  &&opponent.hand.length>0&&opponent.deck.length>0;

 return {card,cell,ability,abilityDirection,betaLanding,suppressed:Boolean(card.ability&&!ability),transforms,comparisons,flips,board:working.board,ward,coverWards,blockadeMove,dash:Boolean(dash),blockadeLock,swapCells,swaps,pivotTarget,pivot,valueSwap,selfTurn,steps,relocation,rainbow,swipe,decoy,pursuit,objection,ambush,awkward,nested,phalanx,rally,pincer,relay,waiting,turnChoices,valueSwaps:ability==='luxury'?valueSwapTargets(working,held,cell,rotation):[],jam,sandwich,bailout,finalGuard,reserve,link,attachment,blink,bid:bid?.dir??null,bidTargets:bids.map(c=>c.dir),roundhouse,thought:thought?.flip?thought.redirect??thought.cell:null,
  plotTargets:plotTargets.map(hit=>hit.cell),plotTarget,plot:plot?.flip?{cell:plot.redirect??plot.cell,margin:plot.defend.total-plot.attack.total}:null,
  overloadTargets:overloadTargets.map(hit=>hit.cell),overloadTarget,overload:overloadHit?.flip?{cell:overloadHit.redirect??overloadHit.cell,amount:overloadBonus,cost:OVERLOAD_COST}:null,
  cycleTargets,cycleUid,recallTargets,recallCell,handDisrupted,
  patienceArmed,patience:patientHit?.flip?{cell:patientHit.redirect??patientHit.cell,amount:patienceBonus}:null};
}

function claim(card,side){
 card.controller=side;
 for(const key of ['guardOwner','guardUntil','guardDirection','ernieWard','coverWard','laughOwner','laughUntil','awkwardMark','phalanxLink','pabloUntil','jammedUntil','attachedLink'])delete card[key];
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
 if(p.patienceArmed)player.patienceUntil=game.placements+2;
 else if(player.patienceUntil<=game.placements)delete player.patienceUntil;
 for(const cell of p.flips)claim(next.board[cell],side);
 if(p.rally)delete next.board[p.rally.leader].phalanxLink;
 if(p.phalanx?.tiles.length){
  const allies=p.phalanx.allies.map(cell=>({cell,uid:next.board[cell].uid}));
  next.board[action.cell].phalanxLink={leader:action.cell,allies,owner:side,from:game.placements+2,until:game.placements+5};
 }
 if(p.ward)next.board[p.ward.cell].ernieWard={dir:p.ward.dir,owner:side,until:game.placements+2};
 for(const {cell,dir,kind,amount} of p.coverWards)next.board[cell].coverWard={dir,owner:side,until:game.placements+2,...(kind?{kind,amount}:{})};
 if(p.awkward){
  const target=next.board[p.awkward.cell];
  target.awkwardMark=p.awkward.persistent
   ?{owner:target.controller,amount:p.awkward.amount,persistent:true}
   :{owner:target.controller,localDirections:p.awkward.dirs.map(dir=>(dir-(target.rotation??0)+6)%6),from:game.placements+2,until:game.placements+3,amount:AWKWARD_PENALTY};
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
 if(p.cycleUid!==null){
  const [cycled]=player.hand.splice(player.hand.findIndex(card=>card.uid===p.cycleUid),1);
  player.hand.push(player.deck.shift());
  player.deck.push(cycled);
 }
 if(p.recallCell!==null){
  player.hand.push(recalledCard(next.board[p.recallCell]));
  delete next.board[p.recallCell];
 }
 if(p.handDisrupted){
  const opponent=next.players[1-side];
  const index=disruptionIndex(game,action.uid,opponent.hand.length);
  const [discarded]=opponent.hand.splice(index,1,opponent.deck.shift());
  (opponent.discard??=[]).push(discarded);
 }
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
 if(p.roundhouse)next.last.roundhouse=p.roundhouse;
 if(p.plot)next.last.plot=p.plot;
 if(p.patienceArmed)next.last.patienceArmed=true;
 if(p.patience)next.last.patience=p.patience;
 if(p.overload)next.last.overload=p.overload;
 if(p.thought)next.last.thought=p.thought;
 if(p.buttonChoice)next.last.buttonChoice=p.buttonChoice;
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
 if(p.finalGuard){
  const protectedCell=Object.keys(next.board).find(cell=>next.board[cell].uid===p.finalGuard.uid);
  next.last.finalGuard={cell:protectedCell??p.finalGuard.cell,uid:p.finalGuard.uid};
 }
 if(p.bailout)next.last.bailout=p.bailout;
 if(p.reserve)next.last.reserve=p.reserve;
 if(p.link)next.last.link=p.link;
 if(p.attachment)next.last.attachment=p.attachment;
 if(p.blink)next.last.blink=p.blink;
 const tieBlocks=p.comparisons.filter(c=>c.tieProtected).map(c=>({cell:c.cell,dir:(c.dir+3)%6}));
 if(tieBlocks.length)next.last.tieBlocks=tieBlocks;
 if(p.cycleUid!==null)next.last.handCycled=true;
 if(p.recallCell!==null)next.last.recalledCell=p.recallCell;
 if(p.handDisrupted)next.last.handDisrupted=true;
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
 if(game.elementalTrial){
  const placed=Object.values(next.board).find(card=>card.uid===p.card.uid);
  const turnOffset=(placed.rotation-p.card.rotation+6)%6;
  const attackEdges=p.comparisons
   .filter(({attack,pursuit,pincer})=>!pursuit&&!pincer&&attack.rank!=='S'&&(attack.ability||attack.formation||attack.sandwich))
   .map(({dir,attack})=>({dir:(dir+turnOffset)%6,total:attack.total}));
  if(attackEdges.length)next.last.attackEdges=attackEdges;
 }
 finishBetaMove(game,next,action,p);
 if(p.betaLanding){next.last.betaLanding=p.betaLanding;next.last.relocation={uid:p.card.uid,from:action.cell,to:p.betaLanding};}
 next.history.push(next.last);
 if(next.placements>=ROUND_PLACEMENTS||freeCells(next).length===0){next.finished=true;const s=scores(next);next.winner=s[0]===s[1]?null:s[0]>s[1]?0:1;}
 if(!next.finished&&chooseDraw&&p.ability==='buttons'&&!game.abilityRework&&player.deck.length>=2){
  next.pendingDraw={side};
 }else{
  if(player.deck.length)player.hand.push(player.deck.shift());
  if(!next.finished)next.turn=1-side;
 }
 return next;
}
export function actionOptions(game,card,cell,rotation){
 if(game.betaTrial&&card.beta)return betaOptions(game,card,{uid:card.uid,cell,rotation,abilityDirection:0},previewEffect);
 const ability=abilityAt(game,card,cell),directions=aimsAbility(ability)?[0,1,2,3,4,5]:[0],targets=turnsCards(ability)?[null,...twistTargets(game,cell,ability)]:[null];
 if(ability==='plotTwist'||ability==='overload'){
  const action={uid:card.uid,cell,rotation,abilityDirection:0};
  const plan=previewEffect(game,action);
  const targets=ability==='plotTwist'?plan.plotTargets:plan.overloadTargets;
  const choice=ability==='plotTwist'?'plotTarget':'overloadTarget';
  return [action,...targets.map(target=>({...action,[choice]:target}))];
 }
 if(ability==='buttons'&&game.abilityRework){
  const action={uid:card.uid,cell,rotation,abilityDirection:0};
  const plan=previewEffect(game,action);
  return [action,...(plan.buttonAttack?[{...action,buttonChoice:'attack'}]:[]),...(plan.buttonDefense!==null?[{...action,buttonChoice:'defense'}]:[])];
 }
 if(ability==='handCycle'||ability==='boardRecall'){
  const action={uid:card.uid,cell,rotation,abilityDirection:0};
  const targets=ability==='handCycle'?handCycleTargets(game,card.uid):boardRecallTargets(game);
  const key=ability==='handCycle'?'cycleUid':'recallCell';
  return [action,...targets.map(target=>({...action,[key]:target}))];
 }
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
