// Approved v47 preview: 12,288 full bot rounds; cosmetic rarity only. E, SE, SW, W, NW, NE.
export const ALPHA_ADDITIONS=Object.freeze([
 {
  "id": "crying-cat",
  "name": "Crying Cat",
  "short": "Crying Cat",
  "element": "stone",
  "values": [
   3,
   5,
   4,
   4,
   4,
   4
  ],
  "artOffsetY": 0,
  "quote": "Sad face. Serious placement."
 },
 {
  "id": "keyboard-cat",
  "name": "Keyboard Cat",
  "short": "Keyboard Cat",
  "element": "storm",
  "values": [
   6,
   2,
   4,
   4,
   3,
   4
  ],
  "artOffsetY": 0.22,
  "quote": "Playing your farewell song."
 },
 {
  "id": "coffin-dance",
  "name": "Coffin Dance",
  "short": "Coffin Dance",
  "element": "stone",
  "values": [
   4,
   3,
   5,
   5,
   3,
   3
  ],
  "artOffsetY": 0.22,
  "quote": "Your cards have a ride home."
 },
 {
  "id": "galaxy-brain",
  "name": "Galaxy Brain",
  "short": "Galaxy Brain",
  "element": "storm",
  "values": [
   3,
   4,
   2,
   4,
   3,
   5
  ],
  "artOffsetY": 0,
  "quote": "Thinking six edges ahead."
 },
 {
  "id": "npc",
  "name": "NPC",
  "short": "NPC",
  "element": "stone",
  "values": [
   4,
   4,
   4,
   4,
   4,
   3
  ],
  "artOffsetY": 0,
  "quote": "Same quest. Different opponent."
 },
 {
  "id": "leeroy-jenkins",
  "name": "Leeroy Jenkins",
  "short": "Leeroy Jenkins",
  "element": "fire",
  "values": [
   6,
   4,
   3,
   3,
   5,
   3
  ],
  "artOffsetY": 0.26,
  "quote": "At least I have chicken."
 },
 {
  "id": "touch-grass",
  "name": "Touch Grass",
  "short": "Touch Grass",
  "element": "stone",
  "values": [
   4,
   3,
   5,
   3,
   5,
   3
  ],
  "artOffsetY": 0,
  "quote": "Outside is a new biome."
 },
 {
  "id": "copium",
  "name": "Copium",
  "short": "Copium",
  "element": "storm",
  "values": [
   2,
   5,
   4,
   3,
   6,
   4
  ],
  "artOffsetY": 0.24,
  "quote": "The next turn fixes everything."
 },
 {
  "id": "paper-hands",
  "name": "Paper Hands",
  "short": "Paper Hands",
  "element": "fire",
  "values": [
   5,
   4,
   3,
   5,
   3,
   3
  ],
  "artOffsetY": 0.2,
  "quote": "Sold before the first flip."
 },
 {
  "id": "buy-the-dip",
  "name": "Buy the Dip",
  "short": "Buy the Dip",
  "element": "fire",
  "values": [
   3,
   6,
   4,
   3,
   2,
   5
  ],
  "artOffsetY": 0.16,
  "quote": "Discounts all the way down."
 }
].map(c=>Object.freeze({...c,ruleId:c.id,ability:null,artDirectory:'memes-v48',values:Object.freeze(c.values),image:`/game/assets/cards/memes-v48/${c.id}-common.webp`})));
