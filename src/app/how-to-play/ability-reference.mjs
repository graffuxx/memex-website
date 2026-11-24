import {DEFINITIONS} from '../../../public/game/platform/catalog.mjs';
import {ELEMENT_IDS,ELEMENTS} from '../../../public/game/platform/elements53.mjs';
import {portalTrialAbility} from '../../../public/game/platform/deck-bridge.mjs';
import {
 ABILITIES, AMBUSH_BONUS, AWKWARD_PENALTY, CHASE_PENALTY, CHORUS_DUET_GUARD,
 JORDAN_MAX_MARGIN, NESTED_MAX_INCREASE, OBJECTION_MAX_MARGIN, PHALANX_BONUS,
 PIGEON_MAX_REDUCTION, SANDWICH_MAX_SUPPORT, STORM_MAX_EDGE, SWIPE_MAX_DEFENSE, WATER_BONUS
} from '../../../public/game/src/table-demo-rules.mjs';

export const glossary = [
 {term:'Blockade',text:'The face-down card marks a blocked hex. It starts on a different hex each round and starts inside the board in the second round. Before playing a card, you can move the blockade to a free neighbouring hex once per round. It does not use up your card play.'},
 {term:'Shield',alias:'Schild',text:'A shield raises defence on a specific edge or prevents a capture if its conditions are met. Check the card’s ability for the amount and duration. Water’s Wave Shield gives one edge +2 through the opponent’s next move.'},
 {term:'Phase',text:'A stage of the older event-field system. Random event fields and their changing bonuses are currently disabled in Random, Private Duels and Deck Test. There is no Phase action to activate.'},
 {term:'Edge and base value',alias:'Kante und Grundwert',text:'An edge is one of the six numbered sides. The base value is the number printed on it. The value used in a capture can change through ability bonuses or penalties.'},
 {term:'Element',text:'The bottom symbol shows the card’s permanent element. It decides an attack when the two compared values tie and the attacking element has the advantage.'},
 {term:'Ability',alias:'Fähigkeit',text:'The top symbol identifies the card’s ability. In a duel, select a card and a target hex to see any available choices. Automatic effects resolve when their conditions are met.'},
 {term:'Flip and direct flip',text:'A flip changes a card’s owner. A direct flip comes from the card you played attacking a touching enemy edge. Some abilities can add a follow-up flip. A double or triple flip means two or three captures with one play.'},
 {term:'Adjacent, ally and Regular',text:'Adjacent cards share an edge. An ally is a card you currently control. A Regular is a card in the standard class, including its Silver, Gold, Diamond and Void finishes.'},
 {term:'S edge',alias:'S-Kante',text:'An S edge beats any numbered edge. To capture an S, you need an attacking S with the stronger element.'},
 {term:'Final Guard',alias:'Schlussschutz',text:'On the last play of a round, the starting player is protected from the first successful direct capture against them made with a numbered edge. An S attack can still capture.'},
 {term:'Reserve a hex',alias:'Feld reservieren',text:'A reserved empty hex cannot be used for a card placement by the affected player for the stated turn. Disappointed Fan can reserve one for your opponent’s next turn.'},
 {term:'Mute an ability',alias:'Fähigkeit stummschalten',text:'The target temporarily loses its own ability. Its printed edges, element and protection supplied by other cards still apply.'},
 {term:'Draw',alias:'Nachziehen',text:'After playing a card, you draw one if your deck still has cards. Two Buttons lets you choose which of the top two you draw.'},
];

const explanations = {
 fire:['Ember Strike','Play a Regular Fire card touching exactly one enemy.','Its edge facing that enemy gains +1 attack for this play.'],
 water:['Wave Shield','Select a Regular Water card, target a hex and choose the edge to protect. Confirm the play.',`That edge gains +${WATER_BONUS} defence until your next turn.`],
 earth:['Bulwark','A Regular Earth card touches an allied card or the blockade.','Its weakest open edge gains +1 defence. The protected edge updates as the board changes.'],
 air:['Tailwind','Place a Regular Air card, then tap a highlighted allied card if you want to turn it.','The arrow shows the turn. The card turns one step to the right and stays yours.'],
 storm:['Flanking Lightning','Play a Regular Storm card touching at least two enemies.',`Its weakest enemy-facing edge gains +1 attack if its base value is ${STORM_MAX_EDGE} or less.`],
 rage:['Rage Pivot','Place Rage Guy while behind on the board with your blockade move unused. Choose an available destination.','Move the blockade up to two free hexes. This uses your blockade move for the round.'],
 buttons:['Second Choice','Play Two Buttons with at least two cards remaining in your deck and another turn left in the round.','Privately choose which of the top two you draw. The other stays on top. If the timer expires, the game chooses.'],
 exchange:['Change My Mind','When playing the card, choose two adjacent allied Regulars. One must touch your placement.','Swap those two cards without triggering captures.'],
 luxury:['First World Problem','Before playing, choose a 4 and a 2 on the card. One must face an enemy and the other a free hex.','The two edge values trade places and stay swapped.'],
 wander:['Wrong Turn','Choose an empty hex that touches no enemy. Before playing, you may choose a direction.','Confused Travolta rotates 60° left or right as it is played.'],
 sidestep:['Make Room','When playing Greg, choose an allied Regular next to him and a free hex adjacent to both cards.','That ally moves one hex without changing its facing. A card captured in this play cannot be moved.'],
 laugh:['Last Laugh','Play KEKW to shield it from numeric ties for the opponent’s next turn.','4 vs 4 holds even against the stronger element. 5 vs 4 captures KEKW even with a weaker element. S beats a numbered edge.'],
 solitude:['All Alone','Keep Forever Alone without an adjacent allied card.','Its weakest open edge gains +1 defence while the condition holds.'],
 rainbow:['Second Rainbow','Score exactly one direct flip with Double Rainbow and have an eligible equal-value enemy edge.','It can capture one more card, taking the first unprotected numeric tie clockwise from the first capture.'],
 swipe:['Shield Swipe','Attack an enemy with a defence bonus that Steve can overcome by ignoring part of it.',`Steve ignores up to ${SWIPE_MAX_DEFENSE} points of ability defence on one edge if that earns a flip. S edges are exempt.`],
 encore:['Encore','Score exactly one flip with Epic Sax Guy. You may then choose a direction.','Turn Sax Guy 60° left or right for later plays. The turn triggers no extra captures.'],
 bid:['Sweeten the Deal','While behind, use an available blockade move if the offered +1 would win an attack.','Gain +1 attack on the chosen edge. It spends the blockade move but leaves the blockade in place.'],
 decoy:['Wrong Edge','Play Pigeon next to an opponent it could capture by attacking a weaker neighbouring edge on that card.',`For that attack it lowers the target’s base defence by up to ${PIGEON_MAX_REDUCTION}. Existing shields and S still count.`],
 chase:['No Escape','Score a direct flip with Why Are You Running? with another enemy directly behind the target.',`The attack can continue in the same direction at −${CHASE_PENALTY} strength and capture at most one more card.`],
 cover:['Cover','Place Overly Manly Man beside Regulars you already control.','Up to two allies get +1 defence on their weakest open edge until your next turn. These bonuses do not stack.'],
 objection:['Objection','The opponent would directly capture this card and at least one other in the same play.',`Once per round, this card can hold if the attacking number is at most ${OBJECTION_MAX_MARGIN} higher. S attacks bypass it.`],
 thought:['Thought Experiment','When playing Philosoraptor, choose two enemy Regulars that stay enemy this turn. One must touch Philosoraptor and the other must touch either of them.','Swap the two enemies without causing any captures.'],
 awkward:['Awkward Silence','Place Socially Awkward Penguin. It marks open numbered edges on the first eligible enemy still adjacent, clockwise from east.',`The marked edges lose up to ${AWKWARD_PENALTY} defence on your next turn, down to a minimum of 1.`],
 ambush:['Ambush','Place Always Has Been with an ally directly or diagonally behind it and an edge where the bonus would win.',`The first eligible attack clockwise from east gains +${AMBUSH_BONUS} and captures its target.`],
 nested:['Card Within a Card','Capture a Regular with Yo Dawg while an open numbered edge can be improved.',`The first captured Regular’s highest number can raise Yo Dawg’s weakest open edge by up to ${NESTED_MAX_INCREASE} for the rest of the round.`],
 phalanx:['Phalanx','Play Sparta next to an ally or capture an adjacent enemy. With two existing allies, Sparta can use it immediately.',`A card played next to the formation can gain +${PHALANX_BONUS} on the first edge where it secures a capture. One use during your next two turns, or until Sparta or all partners are lost.`],
 dash:['Breakthrough','Target the unsealed blockade with Sanic. It must touch an allied card and have a free neighbouring hex.','Push the blockade into a free neighbour and play Sanic on its old hex. Your normal blockade move remains available.'],
 bailout:['Last-Second Save','The enemy would capture a Regular next to Crying Jordan with a numbered edge. Jordan must stay yours.',`Once per round, Jordan saves that ally if the attacker’s edge is at most ${JORDAN_MAX_MARGIN} higher.`],
 fan:['Empty Seats','Place Fan beside a Regular you control and choose a free hex touching them both.','The opponent cannot place a card on that hex on their next turn.'],
 blink:['Blink','An enemy play directly captures exactly one card, either Blinking Guy or an adjacent allied Regular.','Once per round, the attacking card rotates 60° clockwise after the capture. The capture still counts. The rotated edges apply on later turns.'],
 cling:['Clingy Bond','When placing Overly Attached, choose an adjacent allied Regular to link.','The first direct numbered capture against either linked card is redirected to the partner if eligible. S is not redirected. The link ends when used or a partner is lost.'],
 jam:['Input Lock','When placing Keyboard Crusher, select an adjacent enemy with an active ability.','The enemy’s own ability is muted immediately through the end of your next turn. Its values, element and protection from other cards still work.'],
 sandwich:['Sandwich','Attack an enemy with an ally on its far side. The ally’s touching value must exceed the target’s opposing edge.',`Add up to ${SANDWICH_MAX_SUPPORT} attack on the first numbered edge that wins with the support. S edges are excluded.`],
 chorus:['Choreography','When placing NUMA NUMA, choose an adjacent allied Regular. You can add a Regular of another element touching NUMA or the first ally.',`Rotate the ally and give its weakest open edge +1 defence. In a duet they turn in opposite directions and each gets +${CHORUS_DUET_GUARD} until your next turn.`],
 relay:['Change of Guard','Play Pablo Waiting without a capture. On your next turn, play a Regular next to him.','After the Regular’s captures resolve, you may swap it with Pablo. Their facing stays the same and the swap causes no captures.'],
 retry:['Second Attempt','Next to an ally, choose a 60° turn if the normal facing has no capture and the rotation yields exactly one numbered capture.','The card is played in the chosen facing.'],
 pincer:['Double Trouble','Score exactly one direct flip with Emotional Damage. An adjacent ally must be able to attack a second enemy that touches both.','The ally makes one follow-up numbered attack, using the first winning edge clockwise from east. Its own ability does not fire again.'],
 roundhouse:['Roundhouse','Capture a card with Nuck Chorris’s S edge. You may then choose a direction.','Rotate the captured card 60° left or right without triggering another capture.'],
 gate:['Gatekeeper','Play One Does Not Simply directly next to the blockade.','The blockade is sealed in place for the opponent’s next turn.'],
 ernie:['Fire Pact','Capture an enemy with Evil Ernie’s S edge.','The captured card gains +1 defence on the edge opposite the capture until your next turn. The bonus does not stack or modify an S.'],
};

const releasedRules = {iconicAbilities:true,iconicAbilityWave:7,allPrimes:true};
function entry(id,name,category){
 const [title,trigger,effect]=explanations[id];
 const gameLabel=ABILITIES[id].name.split(' · ').at(-1);
 return {id,name,category,title,gameLabel,trigger,effect};
}

export const guideAbilities=[
 ...ELEMENT_IDS.map(id=>entry(id,ELEMENTS[id].name,'regular')),
 ...DEFINITIONS.filter(card=>card.iconic||card.prime).map(card=>{
  const id=portalTrialAbility(releasedRules,{id:card.ruleId});
  return entry(id,card.name,card.category);
 }),
];

const normalize=value=>value.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
export function findGuideAbilities(query,category){
 const words=normalize(query.trim()).split(/\s+/).filter(Boolean);
 return guideAbilities.filter(card=>{
  if(category!=='all'&&card.category!==category)return false;
  const haystack=normalize([card.name,card.title,card.gameLabel,card.trigger,card.effect,ABILITIES[card.id].description].join(' '));
  return words.every(word=>haystack.includes(word));
 });
}
