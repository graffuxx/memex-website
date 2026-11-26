import {DEFINITIONS} from '../../../public/game/platform/catalog.mjs';
import {ELEMENT_IDS,ELEMENTS} from '../../../public/game/platform/elements53.mjs';
import {portalTrialAbility} from '../../../public/game/platform/deck-bridge.mjs';
import {
 ABILITIES, AMBUSH_BONUS, PENGUIN_DEFENSE_PENALTY, CHASE_PENALTY, CHORUS_DUET_GUARD,
 JORDAN_MAX_MARGIN, NESTED_MAX_INCREASE, OBJECTION_MAX_MARGIN, PHALANX_BONUS,
 PIGEON_MAX_REDUCTION, SANDWICH_MAX_SUPPORT, CURRENT_ICONIC_WAVE, PLOT_MAX_DEFICIT, PATIENCE_ATTACK, OVERLOAD_ATTACK, OVERLOAD_COST, STEVE_LOOT_WARD, WATER_BONUS
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
 {term:'Draw',alias:'Nachziehen',text:'After playing a card, you draw the top card if your deck still has cards.'},
];

const explanations = {
 fire:['Ember Strike','Play a Regular Fire card touching exactly one enemy.','Its edge facing that enemy gains +1 attack for this play.'],
 water:['Wave Shield','Select a Regular Water card, target a hex and choose the edge to protect. Confirm the play.',`That edge gains +${WATER_BONUS} defence until your next turn.`],
 earth:['Bulwark','A Regular Earth card touches an allied card or the blockade.','Its weakest open edge gains +1 defence. The protected edge updates as the board changes.'],
 air:['Tailwind','Place a Regular Air card, then tap a highlighted allied card if you want to turn it.','The arrow shows the turn. The card turns one step to the right and stays yours.'],
 storm:['Flanking Lightning','Play a Regular Storm card touching at least two enemies.','Its weakest numbered edge facing an enemy gains +1 attack for this move.'],
 rage:['Rage Pivot','Place Rage Guy while behind on the board with your blockade move unused. Choose an available destination.','Move the blockade up to two free hexes. This uses your blockade move for the round.'],
 buttons:['Two Buttons','Choose an attack or a shield when you play Two Buttons.','Red gives +2 attack when it earns an extra flip. Blue gives +2 defence on the weakest open edge until your next turn.'],
 exchange:['Change My Mind','When you play Change My Mind, you can tap one adjacent allied Regular to swap places.','Change My Mind attacks from the new position. The ally does not attack.'],
 handCycle:['Hand Swap','Play First World Problems with another card in your hand.','You may put another hand card under your deck and draw a replacement. Then draw as usual.'],
 boardRecall:['Back to Hand','Play Here We Go Again while you control a Regular from your own deck and still have another turn.','You may return that card to your hand. Its weakest side gets +2 and you still draw as usual. The round ends after 18 placements.'],
 handDisrupt:['Disrupt the Hand','Flip a card with NUMA NUMA while the opponent still has a turn and another card in their deck.','The opponent discards one random hand card and immediately draws a replacement.'],
 luxury:['First World Problem','Before playing, choose a 4 and a 2 on the card. One must face an enemy and the other a free hex.','The two edge values trade places and stay swapped.'],
 wander:['Wrong Turn','Choose an empty hex with no enemy next to it.','Use an arrow to turn Confused Travolta one step left or right when you play it.'],
 sidestep:['Make Room','When playing Greg, choose an allied Regular next to him and a free hex adjacent to both cards.','That ally moves one hex without changing its facing. A card captured in this play cannot be moved.'],
 laugh:['Last Laugh','Play KEKW to shield it from numeric ties for the opponent’s next turn.','4 vs 4 holds even against the stronger element. 5 vs 4 captures KEKW even with a weaker element. S beats a numbered edge.'],
 solitude:['All Alone','Keep Forever Alone without an adjacent allied card.','Its weakest open edge gains +1 defence while the condition holds.'],
 rainbow:['Second Rainbow','Flip exactly one enemy directly with Double Rainbow.','You can flip one more enemy when the touching numbers are equal and there is no tie shield. The preview highlights the extra flip.'],
 loot:['Protect the Loot','Flip a card with Scumbag Steve.',`One captured card gets +${STEVE_LOOT_WARD} defence on its weakest open numbered side until your next turn.`],
 encore:['Encore','Play Epic Sax Guy where he flips exactly one enemy.','Use an arrow to turn him one step left or right. Only later moves use his new sides.'],
 bid:['Sweeten the Deal','While behind, use an available blockade move if the offered +1 would win an attack.','Gain +1 attack on the chosen edge. It spends the blockade move but leaves the blockade in place.'],
 decoy:['Wrong Edge','Check the two numbers on either side of the enemy’s defending edge.',`If a lower number helps Pigeon capture it, reduce the defending edge’s base value by up to ${PIGEON_MAX_REDUCTION} for that attack. Shields and S still count.`],
 chase:['No Escape','Flip an enemy that has another enemy right behind it.',`The attack can carry on with ${CHASE_PENALTY} fewer points and flip that second card.`],
 cover:['Cover','Place Overly Manly Man beside Regulars you already control.','Up to two allies get +1 defence on their weakest open edge until your next turn. These bonuses do not stack.'],
 objection:['Objection','The opponent would directly capture this card and at least one other in the same play.',`Once per round, this card can hold if the attacking number is at most ${OBJECTION_MAX_MARGIN} higher. S attacks bypass it.`],
 thought:['Thought Experiment','If Philosoraptor would flip no cards, it looks for a close comparison between numbered edges.','It wins one comparison where the numbers are tied or its side is exactly one point lower. Tie shields still hold.'],
 awkward:['Awkward Silence','Play Socially Awkward Penguin within two hexes of an enemy. The preview shows which enemy it marks.',`The marked card has −${PENGUIN_DEFENSE_PENALTY} defence on all numbered sides until it is flipped.`],
 plotTwist:['Plot Twist','Choose one marked adjacent enemy that Always Has Been would otherwise leave behind.',`Your element must win and your numbered edge can be up to ${PLOT_MAX_DEFICIT} points lower. S ranks and the Final Guard keep their rules.`],
 ambush:['Ambush','Play Always Has Been between an ally and an enemy. The ally can be directly or diagonally across from the enemy.',`One attack gains +${AMBUSH_BONUS} if it earns an extra flip. The preview highlights the target.`],
 nested:['Card Within a Card','Capture a Regular with Yo Dawg while an open numbered edge can be improved.',`The first captured Regular’s highest number can raise Yo Dawg’s weakest open edge by up to ${NESTED_MAX_INCREASE} for the rest of the round.`],
 phalanx:['Phalanx','Play Sparta next to an ally or capture an adjacent enemy. With two existing allies, Sparta can use it immediately.',`A card played next to the formation can gain +${PHALANX_BONUS} on the first edge where it secures a capture. One use during your next two turns, or until Sparta or all partners are lost.`],
 dash:['Breakthrough','Target the unsealed blockade with Sanic. It must touch an allied card and have a free neighbouring hex.','Push the blockade into a free neighbour and play Sanic on its old hex. Your normal blockade move remains available.'],
 bailout:['Last-Second Save','The enemy would capture a Regular next to Crying Jordan with a numbered edge. Jordan must stay yours.',`Once per round, Jordan saves that ally if the attacker’s edge is at most ${JORDAN_MAX_MARGIN} higher.`],
 fan:['Empty Seats','Place Fan beside a Regular you control and choose a free hex touching them both.','The opponent cannot place a card on that hex on their next turn.'],
 blink:['Blink','The opponent flips only Blinking Guy or only a Regular next to him.','Once per round, the attacking card turns one step to the right after the flip. The flip still counts.'],
 cling:['Clingy Bond','When placing Overly Attached, choose an adjacent allied Regular to link.','The first direct numbered capture against either linked card is redirected to the partner if eligible. S is not redirected. The link ends when used or a partner is lost.'],
 overload:['Overload',`Choose one marked enemy for +${OVERLOAD_ATTACK} attack and an extra capture.`,`If the extra capture goes through, Keyboard Crusher loses ${OVERLOAD_COST} points from every numbered edge for the rest of the round. The minimum is 1. S keeps its rank.`],
 jam:['Input Lock','When placing Keyboard Crusher, select an adjacent enemy with an active ability.','The enemy’s own ability is muted immediately through the end of your next turn. Its values, element and protection from other cards still work.'],
 pincerSandwich:['Sandwich','Attack an enemy with one of your cards directly or diagonally behind it. The rear card compares the two edges that touch.', 'If the rear attack wins, it captures the enemy. Up to one extra capture from numbered edges.'],
 sandwich:['Sandwich','Attack an enemy with one of your cards directly or diagonally behind it. Your ally needs the higher number where the two cards touch.',`That difference adds up to +${SANDWICH_MAX_SUPPORT} attack if it earns an extra flip. The effect only uses numbered sides.`],
 chorus:['Choreography','Choose a Regular you own next to NUMA NUMA. For a duet, add a Regular of another element next to NUMA or the first partner.',`Turn the ally one step and shield its weakest open side by +1. For a duet, they turn one step in opposite directions and each gets +${CHORUS_DUET_GUARD} shield. The shields last until your next turn. Turning triggers no flips.`],
 patience:['Patience','Play Pablo Waiting without capturing a card.',`On your next turn, the card you play gets +${PATIENCE_ATTACK} on one attack that would otherwise miss. The bonus lasts for that move only.`],
 relay:['Change of Guard','Play Pablo Waiting without a capture. On your next turn, play a Regular next to him.','After the Regular’s captures resolve, you may swap it with Pablo. Their facing stays the same and the swap causes no captures.'],
 retry:['Second Attempt','Play next to an ally where the card would otherwise flip nothing.','Use a left or right arrow to turn the card one step. The game only offers turns that earn exactly one flip with a number.'],
 pincer:['Shockwave','Flip a card with Emotional Damage.','A card you just flipped can immediately flip an enemy next to it if its numbered edge wins. Up to one extra flip.'],
 roundhouse:['Roundhouse','Capture a card with Nuck Chorris’s S edge. You may then choose a direction.','Turn the captured card left or right. A numbered edge that now beats a new neighbour can flip one extra card.'],
 gate:['Gatekeeper','Play One Does Not Simply directly next to the blockade.','The blockade is sealed in place for the opponent’s next turn.'],
 'beta-cinema':['Final Cut','When playing Absolute Cinema, choose another card in your hand to put under your deck.','Choose up to two numbered edges facing enemies. Those attacks gain +2 for this play.'],
 'beta-hamster':['Take It Back','Attack a card the opponent flipped on their last play.','The attack gains +3 on the edge facing that card.'],
 'beta-tpose':['Body Block','An enemy is played next to T-Pose.','Each numbered attack by the new card loses 2 for that play.'],
 'beta-continued':['Cliffhanger','Flip an enemy with To Be Continued.','Jump to a free neighbouring hex if a numbered edge can flip another enemy from there.'],
 'beta-hackerman':['Override','Choose a numbered edge of a neighbour when you play Hackerman.','That edge becomes 4 until the end of the round.'],
 'beta-spicy':['Extra Spicy','Play Why Is It Spicy? next to exactly two enemies.','It gains +1 attack against each of those enemies.'],
 'beta-headout':['Head Out','The opponent flips Imma Head Out for the first time.','Its highest numbered edge that faces a free hex drops by 2.'],
 'beta-highground':['High Ground','Keep High Ground at the edge of the board.','Its numbered edges gain +2 defence while there.'],
 'beta-parkour':['Long Jump','Choose a jump over a free hex or an allied card.','Your numbered attack can flip the enemy beyond it with a −1 attack penalty.'],
 'beta-over9000':['Power Up','Play Over 9000 next to an ally and choose a numbered edge.','That edge gains +2 for the round, up to 8.'],
 ernie:['Fire Pact','Flip an enemy with Evil Ernie’s S.','The captured card gains +1 defence on the side facing away from Ernie until your next turn. S stays the same.'],
};

const releasedRules = {iconicAbilities:true,iconicAbilityWave:CURRENT_ICONIC_WAVE,allPrimes:true};
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
