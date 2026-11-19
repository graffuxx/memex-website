// Approved v44 preview and independent 26,624-round holdout. E, SE, SW, W, NW, NE.
export const NEW_ALPHA_CARDS=Object.freeze([
 {
  "id": "gigachad",
  "name": "Gigachad",
  "short": "Gigachad",
  "element": "stone",
  "values": [
   6,
   3,
   2,
   3,
   4,
   6
  ],
  "artOffsetY": 0.25,
  "quote": "No panic. Just placement."
 },
 {
  "id": "this-is-fine",
  "name": "This Is Fine",
  "short": "This Is Fine",
  "element": "fire",
  "values": [
   2,
   4,
   5,
   5,
   3,
   3
  ],
  "artOffsetY": 0,
  "quote": "A perfectly normal turn."
 },
 {
  "id": "trollface",
  "name": "Trollface",
  "short": "Trollface",
  "element": "storm",
  "values": [
   5,
   3,
   2,
   4,
   4,
   4
  ],
  "artOffsetY": 0,
  "quote": "Problem? Your side, now."
 },
 {
  "id": "stonks",
  "name": "Stonks",
  "short": "Stonks",
  "element": "storm",
  "values": [
   3,
   3,
   3,
   6,
   4,
   2
  ],
  "artOffsetY": 0.29,
  "quote": "Line goes up. Cards flip."
 },
 {
  "id": "press-f",
  "name": "Press F",
  "short": "Press F",
  "element": "stone",
  "values": [
   4,
   6,
   4,
   2,
   5,
   3
  ],
  "artOffsetY": 0,
  "quote": "Respect the fallen cards."
 },
 {
  "id": "git-gud",
  "name": "Git Gud",
  "short": "Git Gud",
  "element": "fire",
  "values": [
   5,
   3,
   5,
   3,
   4,
   4
  ],
  "artOffsetY": 0.1,
  "quote": "Skill issue. Allegedly."
 },
 {
  "id": "rage-quit",
  "name": "Rage Quit",
  "short": "Rage Quit",
  "element": "fire",
  "values": [
   7,
   2,
   3,
   6,
   3,
   2
  ],
  "artOffsetY": 0.28,
  "quote": "The controller was innocent."
 },
 {
  "id": "lag-spike",
  "name": "Lag Spike",
  "short": "Lag Spike",
  "element": "storm",
  "values": [
   3,
   6,
   3,
   2,
   6,
   4
  ],
  "artOffsetY": 0.06,
  "quote": "My best move arrives later."
 },
 {
  "id": "hodl",
  "name": "HODL",
  "short": "HODL",
  "element": "stone",
  "values": [
   2,
   3,
   5,
   5,
   5,
   3
  ],
  "artOffsetY": 0.16,
  "quote": "Not flipping. Not leaving."
 },
 {
  "id": "diamond-hands",
  "name": "Diamond Hands",
  "short": "Diamond Hands",
  "element": "stone",
  "values": [
   4,
   2,
   5,
   3,
   4,
   6
  ],
  "artOffsetY": 0,
  "quote": "These hands hold the line."
 },
 {
  "id": "to-the-moon",
  "name": "To the Moon",
  "short": "To the Moon",
  "element": "storm",
  "values": [
   2,
   4,
   3,
   3,
   5,
   7
  ],
  "artOffsetY": 0.15,
  "quote": "Up is a valid strategy."
 },
 {
  "id": "rug-pull",
  "name": "Rug Pull",
  "short": "Rug Pull",
  "element": "fire",
  "values": [
   3,
   5,
   5,
   2,
   3,
   4
  ],
  "artOffsetY": 0,
  "quote": "The floor is optional."
 }
].map(c=>Object.freeze({...c,ruleId:c.id,ability:null,artDirectory:'memes-v45',values:Object.freeze(c.values),image:`/game/assets/cards/memes-v45/${c.id}-common.webp` })));
