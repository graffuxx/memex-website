var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// public/game/platform/expansion48.mjs
var ALPHA_ADDITIONS = Object.freeze([
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
].map((c) => Object.freeze({ ...c, ruleId: c.id, ability: null, artDirectory: "memes-v48", values: Object.freeze(c.values), image: `/game/assets/cards/memes-v48/${c.id}-common.webp` })));

// public/game/platform/expansion45.mjs
var NEW_ALPHA_CARDS = Object.freeze([
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
].map((c) => Object.freeze({ ...c, ruleId: c.id, ability: null, artDirectory: "memes-v45", values: Object.freeze(c.values), image: `/game/assets/cards/memes-v45/${c.id}-common.webp` })));

// public/game/platform/expansion27.mjs
var EXPANSION_CARDS = Object.freeze([
  { id: "harold", name: "Hide the Pain Harold", short: "Harold", element: "stone", values: [5, 4, 4, 5, 3, 3], artOffsetY: -0.045, quote: "Everything is fine. Probably." },
  { id: "disaster-girl", name: "Disaster Girl", short: "Disaster Girl", element: "fire", values: [7, 3, 3, 4, 3, 4], artOffsetY: -0.22, quote: "A perfectly controlled situation." },
  { id: "distracted", name: "Distracted Boyfriend", short: "Distracted", element: "storm", values: [3, 5, 4, 3, 4, 4], quote: "A different strategy just walked by." },
  { id: "side-eye", name: "Side Eye Chloe", short: "Side Eye", element: "stone", values: [6, 4, 2, 5, 4, 3], artOffsetY: -0.085, quote: "You call that a plan?" },
  { id: "success-kid", name: "Success Kid", short: "Success Kid", element: "fire", values: [6, 5, 4, 2, 3, 4], artOffsetY: -0.22, quote: "One small fist. One big flip." },
  { id: "grumpy-cat", name: "Grumpy Cat", short: "Grumpy Cat", element: "stone", values: [3, 4, 5, 5, 4, 3], quote: "I had fun once. Awful." },
  { id: "aliens-guy", name: "Ancient Aliens Guy", short: "Aliens Guy", element: "storm", values: [3, 5, 4, 3, 6, 3], artOffsetY: -0.09, quote: "The explanation is obvious." },
  { id: "smudge", name: "Smudge the Cat", short: "Smudge", element: "fire", values: [3, 3, 6, 2, 4, 4], quote: "I specifically ordered no salad." },
  { id: "confused", name: "Confused Nick Young", short: "Confused", element: "storm", values: [5, 3, 4, 4, 5, 3], artOffsetY: -0.04, quote: "Wait. That was your move?" },
  { id: "bad-luck-brian", name: "Bad Luck Brian", short: "Bad Luck Brian", element: "storm", values: [4, 4, 4, 4, 4, 4], artOffsetY: -0.045, quote: "Finally gets a good hand. Wrong table." },
  ...NEW_ALPHA_CARDS,
  ...ALPHA_ADDITIONS
].map((c) => Object.freeze({ ...c, ruleId: c.id, ability: null, artOffsetY: c.artOffsetY ?? 0, values: Object.freeze(c.values), image: c.image ?? `/game/assets/cards/memes-v27/${c.id}-common.webp` })));

// public/game/src/rules.mjs
var VERSION = 1;
var ELEMENTS = { fire: { name: "Glut", symbol: "\u2726", color: "#fa8966", beats: "stone" }, stone: { name: "Stein", symbol: "\u25C6", color: "#d7bb7c", beats: "storm" }, storm: { name: "Sturm", symbol: "\u03DF", color: "#bb99ff", beats: "water" }, water: { name: "Flut", symbol: "\u2248", color: "#72d8e6", beats: "fire" } };
var DIRECTIONS = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
var CATALOG = [
  { id: "oracle", name: "Overthinker", element: "storm", values: [7, 6, 3, 2, 3, 3], face: "hood", quote: "Ich habe 14 Z\xFCge vorausgedacht. Leider die falschen." },
  { id: "rage", name: "Rage Quit", element: "fire", values: [7, 2, 2, 7, 3, 3], face: "cat", quote: "Das war nat\xFCrlich alles Lag." },
  { id: "mage", name: "404 Mage", element: "water", values: [4, 4, 4, 4, 4, 4], face: "robot", quote: "Zauber gefunden. Kompetenz nicht." },
  { id: "moon", name: "Moonbound", element: "storm", values: [6, 2, 6, 2, 6, 2], face: "astronaut", quote: "Zum Mond. \xDCber den Umweg." },
  { id: "trust", name: "Trust Me", element: "stone", values: [5, 5, 5, 3, 3, 3], face: "frog", quote: "Quelle: Vertrau mir, Bruder." },
  { id: "reset", name: "Hard Reset", element: "stone", values: [6, 5, 4, 4, 3, 2], face: "robot", quote: "Schon mal aus- und wieder angezweifelt?" },
  { id: "grass", name: "Touch Grass", element: "water", values: [2, 5, 6, 5, 2, 4], face: "frog", quote: "Die Au\xDFenwelt ist auch nur ein anderer Server." },
  { id: "fine", name: "Fine. Actually.", element: "fire", values: [3, 6, 3, 6, 3, 3], face: "hood", quote: "Alles unter Kontrolle. Ignoriere das Feuer." },
  { id: "brain", name: "Last Braincell", element: "fire", values: [5, 2, 5, 2, 5, 5], face: "cat", quote: "Heute bin ich allein im Dienst." },
  ...EXPANSION_CARDS
];
var LEGACY_IDS = /* @__PURE__ */ new Set(["oracle", "rage", "mage", "moon", "trust", "reset", "grass", "fine", "brain"]);
var CELLS = [];
for (let r = -2; r <= 2; r++) for (let q = -2; q <= 2; q++) if (Math.abs(q + r) <= 2) CELLS.push({ id: q + "," + r, q, r });
var LAYOUTS = [{ id: "core", name: "Kernbruch", block: "0,0" }, { id: "east", name: "Ostpass", block: "1,0" }, { id: "west", name: "Westpass", block: "-1,0" }];
var cardOf = (card) => CATALOG.find((c) => c.id === card.id);
var cellSet = new Set(CELLS.map((c) => c.id));
function random(seed) {
  let n = seed >>> 0;
  return () => {
    n = Math.imul(n, 1664525) + 1013904223 >>> 0;
    return n / 4294967296;
  };
}
function shuffle(a, rng) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function newGame({ seed = 12345, layout = "core", starter = 0 } = {}) {
  if (![0, 1].includes(starter) || !LAYOUTS.some((l) => l.id === layout)) throw Error("Ung\xFCltige Partieauswahl.");
  const rng = random(seed), players = [0, 1].map((p) => {
    const cards = shuffle(CATALOG.filter((c) => LEGACY_IDS.has(c.id)).map((c) => ({ id: c.id, uid: p + ":" + c.id, origin: p })), rng);
    return { hand: cards.slice(0, 5), deck: cards.slice(5), shifts: 1, flips: 0 };
  });
  return { version: VERSION, seed, layout, starter, turn: starter, placements: 0, board: {}, block: LAYOUTS.find((l) => l.id === layout).block, players, events: [{ cell: "-1,1", element: "storm" }, { cell: "1,-1", element: "water" }], history: [], last: null, winner: null, finished: false };
}
function neighbors(id) {
  const c = CELLS.find((c2) => c2.id === id);
  return c ? DIRECTIONS.map(([q, r], dir) => ({ id: c.q + q + "," + (c.r + r), dir })).filter((n) => cellSet.has(n.id)) : [];
}
var freeCells = (g) => CELLS.filter((c) => c.id !== g.block && !g.board[c.id]).map((c) => c.id);
var scores = (g) => [0, 1].map((p) => Object.values(g.board).filter((c) => c.controller === p).length);
var eventPhase = (g) => g.placements >= 12 ? 2 : g.placements >= 6 ? 1 : 0;
function fieldAt(g, cell) {
  const f = g.events.find((f2) => f2.cell === cell);
  if (!f) return null;
  const phase = eventPhase(g);
  return { element: phase === 2 ? { storm: "water", water: "storm" }[f.element] : f.element, bonus: phase === 1 ? 2 : 1 };
}
function sideValue(card, dir, rotation = card.rotation ?? 0) {
  return cardOf(card).values[((dir - rotation) % 6 + 6) % 6];
}
function strength(g, card, cell, dir, opponent) {
  const base = sideValue(card, dir), field = fieldAt(g, cell), fieldBonus = field?.element === cardOf(card).element ? field.bonus : 0, advantage = ELEMENTS[cardOf(card).element].beats === cardOf(opponent).element ? 1 : 0;
  return { base, field: fieldBonus, element: advantage, total: base + fieldBonus + advantage };
}
function preview(g, { uid, cell, rotation = 0 }) {
  if (g.finished) throw Error("Die Runde ist beendet.");
  const card = g.players[g.turn].hand.find((c) => c.uid === uid);
  if (!card || !cellSet.has(cell) || cell === g.block || g.board[cell] || !Number.isInteger(rotation) || rotation < 0 || rotation > 5) throw Error("Diese Platzierung ist nicht m\xF6glich.");
  const incoming = { ...card, rotation, controller: g.turn, flips: 0 };
  const comparisons = neighbors(cell).filter((n) => g.board[n.id] && g.board[n.id].controller !== g.turn).map((n) => {
    const other = g.board[n.id], attack = strength(g, incoming, cell, n.dir, other), defend = strength(g, other, n.id, (n.dir + 3) % 6, incoming);
    return { cell: n.id, attack, defend, flip: attack.total > defend.total, name: cardOf(other).name };
  });
  return { card: incoming, cell, comparisons, flips: comparisons.filter((c) => c.flip).map((c) => c.cell) };
}
function moveTargets(g) {
  return g.finished || !g.players[g.turn].shifts ? [] : neighbors(g.block).map((n) => n.id).filter((id) => !g.board[id]);
}
function shiftBlock(g, target) {
  if (!moveTargets(g).includes(target)) throw Error("Die Blockade kann nur auf ein freies Nachbarfeld verschoben werden.");
  const next = structuredClone(g), from = next.block;
  next.block = target;
  next.players[g.turn].shifts--;
  next.last = { type: "shift", side: g.turn, from, to: target };
  next.history.push(next.last);
  return next;
}

// public/game/src/tactics-layout.mjs?v=random-layout-1
function createTacticsLayout(seed) {
  let state = (seed >>> 0 ^ 2654435769) >>> 0;
  const random2 = () => {
    state = Math.imul(state, 1664525) + 1013904223 >>> 0;
    return state / 4294967296;
  };
  const cells = CELLS.map((c) => c.id);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(random2() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return { block: cells[0], eventCells: cells.slice(1, 3), crossfireOffset: Math.floor(random2() * 3) };
}

// public/game/src/table-demo-rules.mjs?v=random-layout-1
var table_demo_rules_exports = {};
__export(table_demo_rules_exports, {
  ABILITIES: () => ABILITIES,
  ABILITY_FOR: () => ABILITY_FOR,
  DIRECTION_NAMES: () => DIRECTION_NAMES,
  FIELD_TYPES: () => FIELD_TYPES,
  GUARD_BONUS: () => GUARD_BONUS,
  LOADOUTS: () => LOADOUTS,
  TACTIC_BEATS: () => TACTIC_BEATS,
  abilityAt: () => abilityAt,
  actionOptions: () => actionOptions,
  effectStrength: () => effectStrength,
  eventFieldAt: () => eventFieldAt,
  eventFields: () => eventFields,
  fieldText: () => fieldText,
  guardActive: () => guardActive,
  nextEvent: () => nextEvent,
  placeEffect: () => placeEffect,
  previewEffect: () => previewEffect,
  twistTargets: () => twistTargets
});
var TACTIC_BEATS = { fire: "stone", stone: "storm", storm: "fire" };
var GUARD_BONUS = 2;
var ABILITIES = {
  hype: { name: "Much Hype", short: "H", description: "Beim Ausspielen +1 auf eine gew\xE4hlte Angriffsseite." },
  guard: { name: "Feels Bad", short: "S", description: "Eine Seite erh\xE4lt +2 Verteidigung bis zum n\xE4chsten eigenen Karten-Zug." },
  twist: { name: "Think Again", short: "\u21BB", description: "Einen gegnerischen Nachbarn 60\xB0 drehen. Dieses Ziel kann im selben Zug nicht \xFCbernommen werden. Optional." }
};
var LOADOUTS = {
  "hype-guard": { name: "Doge + Pepe", abilities: ["hype", "guard"] },
  "hype-twist": { name: "Doge + Roll Safe", abilities: ["hype", "twist"] },
  "guard-twist": { name: "Pepe + Roll Safe", abilities: ["guard", "twist"] }
};
var ABILITY_FOR = { brain: "hype", oracle: "guard", trust: "twist" };
var DIRECTION_NAMES = ["Ost", "S\xFCdost", "S\xFCdwest", "West", "Nordwest", "Nordost"];
var FIELD_TYPES = {
  resonance: { name: "Resonanz", color: "#ba93ff", symbol: "\u03DF", description: "Passendes Element: +1 auf alle sechs Seiten." },
  crossfire: { name: "Kreuzfeuer", color: "#ffbe62", symbol: "\u2194", description: "+1 auf die beiden markierten gegen\xFCberliegenden Seiten." },
  silence: { name: "Funkloch", color: "#e1a6d5", symbol: "\xD7", description: "Die F\xE4higkeit einer Karte auf diesem Feld ist deaktiviert." }
};
var FIELD_PHASES = [
  [{ cell: "-1,0", type: "resonance", element: "storm" }, { cell: "0,1", type: "crossfire", directions: [0, 3] }],
  [{ cell: "-1,0", type: "silence" }, { cell: "0,1", type: "resonance", element: "fire" }],
  [{ cell: "-1,0", type: "resonance", element: "stone" }, { cell: "0,1", type: "crossfire", directions: [1, 4] }]
];
function eventFields(game) {
  if (game.demoFields) return game.demoFields;
  const phase = eventPhase(game);
  return FIELD_PHASES[phase].map((template, index) => {
    const field = { ...template, cell: game.eventCells?.[index] ?? template.cell };
    if (field.type === "resonance") field.element = ["storm", "fire", "stone"][(phase + (game.resonanceOffset ?? 0)) % 3];
    if (field.directions) field.directions = field.directions.map((d) => (d + (game.crossfireOffset ?? 0)) % 6);
    return field;
  });
}
function eventFieldAt(game, cell) {
  return cell === game.block ? null : eventFields(game).find((f) => f.cell === cell) ?? null;
}
function nextEvent(game) {
  const phase = eventPhase(game);
  return phase < 2 ? { remaining: [6, 12][phase] - game.placements, fields: eventFields({ ...game, placements: [6, 12][phase] }) } : null;
}
function fieldText(f) {
  if (!f) return "Normales Feld";
  return FIELD_TYPES[f.type].name + (f.type === "resonance" ? " \xB7 " + ELEMENTS[f.element].name + " +1" : f.type === "crossfire" ? " \xB7 " + f.directions.map((d) => DIRECTION_NAMES[d]).join("/") + " +1" : " \xB7 F\xE4higkeiten aus");
}
function abilityAt(game, card, cell) {
  return card.ability && eventFieldAt(game, cell)?.type !== "silence" ? card.ability : null;
}
function guardActive(game, card, cell) {
  return abilityAt(game, card, cell) === "guard" && card.guardOwner === card.controller && game.placements < card.guardUntil;
}
function twistTargets(game, cell) {
  return neighbors(cell).filter((n) => game.board[n.id] && game.board[n.id].controller !== game.turn).map((n) => n.id);
}
function effectStrength(game, card, cell, dir, opponent, { attacking = false, abilityDirection = null } = {}) {
  const f = eventFieldAt(game, cell), base = sideValue(card, dir), field = f?.type === "resonance" && f.element === cardOf(card).element ? 1 : f?.type === "crossfire" && f.directions.includes(dir) ? 1 : 0;
  const element = TACTIC_BEATS[cardOf(card).element] === cardOf(opponent).element ? 1 : 0;
  const ability = attacking ? abilityAt(game, card, cell) === "hype" && dir === abilityDirection ? 1 : 0 : guardActive(game, card, cell) && dir === card.guardDirection ? GUARD_BONUS : 0;
  return { base, field, element, ability, total: base + field + element + ability };
}
function previewEffect(game, action) {
  const { uid, cell, rotation = 0, abilityDirection = 0, twistCell = null } = action;
  if (game.rotationLocked && rotation !== 0) throw Error("Handkarten haben eine feste Ausrichtung.");
  preview(game, { uid, cell, rotation });
  if (!Number.isInteger(abilityDirection) || abilityDirection < 0 || abilityDirection > 5) throw Error("Ung\xFCltige F\xE4higkeitsrichtung.");
  const working = { ...game, board: { ...game.board } };
  for (const [cell2, old] of Object.entries(working.board)) if (old.guardOwner === game.turn) {
    const c = { ...old };
    delete c.guardOwner;
    delete c.guardUntil;
    delete c.guardDirection;
    working.board[cell2] = c;
  }
  const card = { ...working.players[game.turn].hand.find((c) => c.uid === uid), rotation, controller: game.turn, flips: 0 }, ability = abilityAt(working, card, cell), transforms = [];
  if (twistCell !== null) {
    if (ability !== "twist" || !twistTargets(working, cell).includes(twistCell)) throw Error("Kein g\xFCltiges Drehziel.");
    const target = { ...working.board[twistCell] };
    working.board[twistCell] = target;
    transforms.push({ cell: twistCell, uid: target.uid, from: target.rotation, to: (target.rotation + 1) % 6 });
    target.rotation = (target.rotation + 1) % 6;
  }
  if (ability === "guard") {
    card.guardDirection = abilityDirection;
    card.guardOwner = game.turn;
    card.guardUntil = game.placements + 2;
  }
  const comparisons = neighbors(cell).filter((n) => working.board[n.id] && working.board[n.id].controller !== game.turn).map((n) => {
    const other = working.board[n.id], attack = effectStrength(working, card, cell, n.dir, other, { attacking: true, abilityDirection }), defend = effectStrength(working, other, n.id, (n.dir + 3) % 6, card);
    return { cell: n.id, dir: n.dir, attack, defend, setup: n.id === twistCell, flip: n.id !== twistCell && attack.total > defend.total, name: cardOf(other).name };
  });
  return { card, cell, ability, abilityDirection, suppressed: Boolean(card.ability && !ability), transforms, comparisons, flips: comparisons.filter((c) => c.flip).map((c) => c.cell), board: working.board };
}
function placeEffect(game, action) {
  const p = previewEffect(game, action), next = structuredClone(game), side = game.turn, player = next.players[side];
  next.board = structuredClone(p.board);
  player.hand = player.hand.filter((c) => c.uid !== action.uid);
  if (player.deck.length) player.hand.push(player.deck.shift());
  next.board[action.cell] = { ...p.card, flips: p.flips.length };
  for (const cell of p.flips) {
    const c = next.board[cell];
    c.controller = side;
    delete c.guardOwner;
    delete c.guardUntil;
    delete c.guardDirection;
  }
  player.flips += p.flips.length;
  next.placements++;
  next.last = { type: "place", side, cell: action.cell, uid: action.uid, name: cardOf(p.card).name, flips: p.flips, transforms: p.transforms, ability: p.ability, suppressed: p.suppressed, event: eventPhase(next) !== eventPhase(game) ? eventPhase(next) : null };
  next.history.push(next.last);
  if (freeCells(next).length === 0) {
    next.finished = true;
    const s = scores(next);
    next.winner = s[0] === s[1] ? null : s[0] > s[1] ? 0 : 1;
  } else next.turn = 1 - side;
  return next;
}
function actionOptions(game, card, cell, rotation) {
  const ability = abilityAt(game, card, cell), directions = ["hype", "guard"].includes(ability) ? [0, 1, 2, 3, 4, 5] : [0], targets = ability === "twist" ? [null, ...twistTargets(game, cell)] : [null];
  return directions.flatMap((abilityDirection) => targets.map((twistCell) => ({ uid: card.uid, cell, rotation, abilityDirection, twistCell })));
}

// public/game/platform/edition36.mjs
var ALPHA_IDS = Object.freeze(["pepe", "doge", "roll-safe", ...EXPANSION_CARDS.map((c) => c.id)]);
var ALPHA_MARK = Object.freeze({ x: 0.405, titleOffset: 4e-3, glyphY: -9e-3 });
var symbol = `<path d="M0 -.058L.05 -.029V.029L0 .058L-.05 .029V-.029Z" fill="#e0b754" stroke="#70501f" stroke-width=".006"/><text x="0" y="${ALPHA_MARK.glyphY}" font-family="Georgia,serif" font-style="italic" font-size=".088" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#35230e">\u03B1</text>`;

// public/game/src/card-materials22.mjs
var CARD_MATERIALS = Object.freeze({
  common: Object.freeze({ name: "Normal", de: "Normal", color: "#7396bd", metal: "#18314d", finish: "Dunkler Standardrahmen", motion: "Ruhiges blaues Metall", palette: null }),
  rare: Object.freeze({ name: "Silver", de: "Silber", color: "#dce7f4", metal: "#a5b3c5", finish: "Geb\xFCrstetes Silber", motion: "Silberreflexe und k\xFChler Schimmer", palette: ["#283748", "#a7b7c9", "#f7fcff"] }),
  epic: Object.freeze({ name: "Gold", de: "Gold", color: "#ffd16a", metal: "#c99336", finish: "Poliertes Gold", motion: "Sanfter Goldschimmer und feiner Lichtstaub", palette: ["#41240b", "#c59435", "#fff1b0"] }),
  legendary: Object.freeze({ name: "Diamond", de: "Diamant", color: "#b8efff", metal: "#b4d7ee", finish: "Facettierter Diamant", motion: "Kristallines Funkeln auf den Facetten", palette: ["#243e5a", "#aecfe8", "#fffaff"] }),
  mythic: Object.freeze({ name: "Void", de: "Void", color: "#cd8aff", metal: "#4b2470", finish: "Void-Obsidian", motion: "Wandernder Void-Nebel mit Energieadern und Schattenfunken", palette: ["#080612", "#371747", "#be7ef5"] })
});

// public/game/platform/catalog.mjs
var DECK_SIZE = 15;
var MAX_MOTIF_COPIES = 3;
var RARITIES = Object.freeze(Object.entries(CARD_MATERIALS).map(([id, m]) => Object.freeze({ id, name: m.name, color: m.color })));
var DEFINITIONS = Object.freeze([
  { id: "pepe", name: "Pepe", short: "Pepe", ruleId: "oracle", element: "storm", values: [7, 6, 3, 2, 3, 3], ability: "guard", quote: "Feels good, man.", image: "/game/assets/cards/v03/overthinker-thinking-pepe.webp" },
  { id: "doge", name: "Doge", short: "Doge", ruleId: "brain", element: "fire", values: [5, 2, 5, 2, 5, 5], ability: "hype", quote: "Such strategy. Much wow.", image: "/game/assets/cards/frame-v21/swollen-doge.webp" },
  { id: "roll-safe", name: "Roll Safe", short: "Roll Safe", ruleId: "trust", element: "stone", values: [5, 5, 5, 3, 3, 3], ability: "twist", quote: "Can\u2019t lose if you think ahead.", image: "/game/assets/cards/v04/roll-safe.webp" },
  ...EXPANSION_CARDS
].map((c) => Object.freeze({ ...c, edition: ALPHA_IDS.includes(c.id) ? "alpha" : null })));
var STARTER_IDS = Object.freeze(["pepe", "doge", "roll-safe", "harold", "disaster-girl", "confused"]);
var VARIANTS = Object.freeze(DEFINITIONS.flatMap((card) => RARITIES.map((rarity) => Object.freeze({
  id: `${card.id}:${rarity.id}`,
  definitionId: card.id,
  rarity: rarity.id,
  edition: card.edition,
  image: rarity.id === "common" ? card.image : EXPANSION_CARDS.some((c) => c.id === card.id) ? `/game/assets/cards/${card.artDirectory ?? "memes-v27"}/${card.id}-${rarity.id}.webp` : `/game/assets/cards/rarity-v16/${card.id}-${rarity.id}.webp`,
  artOffsetY: card.artOffsetY ?? 0
}))));
function getVariant(id) {
  return VARIANTS.find((v) => v.id === id);
}
function starterDeck() {
  return STARTER_IDS.flatMap((id, i) => Array(i < 3 ? 3 : 2).fill(`${id}:common`));
}
function countCards(cards) {
  const counts = {};
  for (const id of cards) counts[id] = (counts[id] ?? 0) + 1;
  return counts;
}
function countMotifs(cards) {
  const counts = {};
  for (const id of cards) {
    const v = getVariant(id);
    if (v) counts[v.definitionId] = (counts[v.definitionId] ?? 0) + 1;
  }
  return counts;
}
function validateDeck(cards, inventory) {
  const errors = [];
  if (!Array.isArray(cards) || cards.length !== DECK_SIZE) errors.push(`Your deck needs exactly ${DECK_SIZE} cards.`);
  if (!Array.isArray(cards)) return { valid: false, errors };
  for (const [id, count] of Object.entries(countMotifs(cards))) if (count > MAX_MOTIF_COPIES) errors.push(`${DEFINITIONS.find((c) => c.id === id).name}: maximum ${MAX_MOTIF_COPIES} copies per motif, including all finishes.`);
  for (const [id, count] of Object.entries(countCards(cards))) {
    if (!getVariant(id)) errors.push("This deck contains an unknown card.");
    else if (!Number.isInteger(inventory[id]) || inventory[id] < count) errors.push(`Not enough copies of ${DEFINITIONS.find((c) => c.id === getVariant(id).definitionId).name} (${getVariant(id).rarity}).`);
  }
  return { valid: errors.length === 0, errors };
}
function expandGameDeck(cards, side) {
  return cards.map((variantId, i) => {
    const v = getVariant(variantId);
    if (!v) throw Error("Unknown card variant");
    const c = DEFINITIONS.find((c2) => c2.id === v.definitionId);
    return { id: c.ruleId, uid: `portal-${side}-${i}`, origin: side, rarity: v.rarity, variantId };
  });
}

// public/game/src/tactics-ai.mjs?v=random-layout-1
var ARCHETYPES = DEFINITIONS.map((c) => c.ruleId);

// public/game/src/table-demo-state.mjs
var DEMO_PROFILES = Object.fromEntries(DEFINITIONS.map((c) => [c.ruleId, c.id]));
function createTacticsMatch({ loadouts = ["hype-guard", "hype-twist"], seed = 20261117, starter = 0, swap = false, disableRole = null } = {}) {
  if (loadouts.length !== 2 || loadouts.some((id) => !Object.hasOwn(LOADOUTS, id))) throw Error("Ung\xFCltige Deckauswahl.");
  const game = newGame({ seed, starter });
  Object.assign(game, createTacticsLayout(seed));
  game.events = [];
  game.resonanceOffset = (seed % 3 + 3) % 3;
  game.mode = "match";
  game.loadouts = swap ? [...loadouts].reverse() : [...loadouts];
  game.players = loadouts.map((loadout, role) => {
    let state = seed * 53 + role * 8017 + 111 >>> 0;
    const random2 = () => {
      state = Math.imul(state, 1664525) + 1013904223 >>> 0;
      return state / 4294967296;
    }, side = swap ? 1 - role : role;
    const cards = Array.from({ length: 9 }, (_, i) => ({ id: ["oracle", "brain", "trust"][i % 3], uid: `demo-${side}-${i}`, origin: side }));
    for (const ability of LOADOUTS[loadout].abilities) {
      const list = cards.filter((c) => ABILITY_FOR[c.id] === ability);
      list[Math.floor(random2() * list.length)].ability = ability;
    }
    if (disableRole === role) for (const card of cards) delete card.ability;
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(random2() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return { hand: cards.slice(0, 5), deck: cards.slice(5), shifts: 1, flips: 0 };
  });
  if (swap) game.players.reverse();
  return game;
}

// public/game/platform/deck-bridge.mjs
function applyPortalDecks(game, cards, loadouts, { round = 1 } = {}) {
  if (![1, 2].includes(round)) throw Error("Invalid round.");
  const next = structuredClone(game);
  next.players = next.players.map((p, side) => {
    let state = next.seed * 53 + side * 8017 + 111 >>> 0;
    const random2 = () => {
      state = Math.imul(state, 1664525) + 1013904223 >>> 0;
      return state / 4294967296;
    };
    const deck = expandGameDeck(side === 0 ? cards : starterDeck(), side);
    for (const ability of loadouts[side].abilities) {
      const candidates = deck.filter((c) => ({ oracle: "guard", brain: "hype", trust: "twist" })[c.id] === ability);
      if (candidates.length) candidates[Math.floor(random2() * candidates.length)].ability = ability;
    }
    if (round === 2) state = (state ^ 2654435769) >>> 0;
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(random2() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return { ...p, hand: deck.slice(0, 5), deck: deck.slice(5) };
  });
  next.portalDeck = true;
  return next;
}

// public/game/src/table-demo-rules.mjs
var TACTIC_BEATS2 = { fire: "stone", stone: "storm", storm: "fire" };
var GUARD_BONUS2 = 2;
var LOADOUTS2 = {
  "hype-guard": { name: "Doge + Pepe", abilities: ["hype", "guard"] },
  "hype-twist": { name: "Doge + Roll Safe", abilities: ["hype", "twist"] },
  "guard-twist": { name: "Pepe + Roll Safe", abilities: ["guard", "twist"] }
};
var FIELD_PHASES2 = [
  [{ cell: "-1,0", type: "resonance", element: "storm" }, { cell: "0,1", type: "crossfire", directions: [0, 3] }],
  [{ cell: "-1,0", type: "silence" }, { cell: "0,1", type: "resonance", element: "fire" }],
  [{ cell: "-1,0", type: "resonance", element: "stone" }, { cell: "0,1", type: "crossfire", directions: [1, 4] }]
];
function eventFields2(game) {
  if (game.demoFields) return game.demoFields;
  const phase = eventPhase(game);
  return FIELD_PHASES2[phase].map((template, index) => {
    const field = { ...template, cell: game.eventCells?.[index] ?? template.cell };
    if (field.type === "resonance") field.element = ["storm", "fire", "stone"][(phase + (game.resonanceOffset ?? 0)) % 3];
    if (field.directions) field.directions = field.directions.map((d) => (d + (game.crossfireOffset ?? 0)) % 6);
    return field;
  });
}
function eventFieldAt2(game, cell) {
  return cell === game.block ? null : eventFields2(game).find((f) => f.cell === cell) ?? null;
}
function abilityAt2(game, card, cell) {
  return card.ability && eventFieldAt2(game, cell)?.type !== "silence" ? card.ability : null;
}
function guardActive2(game, card, cell) {
  return abilityAt2(game, card, cell) === "guard" && card.guardOwner === card.controller && game.placements < card.guardUntil;
}
function twistTargets2(game, cell) {
  return neighbors(cell).filter((n) => game.board[n.id] && game.board[n.id].controller !== game.turn).map((n) => n.id);
}
function effectStrength2(game, card, cell, dir, opponent, { attacking = false, abilityDirection = null } = {}) {
  const f = eventFieldAt2(game, cell), base = sideValue(card, dir), field = f?.type === "resonance" && f.element === cardOf(card).element ? 1 : f?.type === "crossfire" && f.directions.includes(dir) ? 1 : 0;
  const element = TACTIC_BEATS2[cardOf(card).element] === cardOf(opponent).element ? 1 : 0;
  const ability = attacking ? abilityAt2(game, card, cell) === "hype" && dir === abilityDirection ? 1 : 0 : guardActive2(game, card, cell) && dir === card.guardDirection ? GUARD_BONUS2 : 0;
  return { base, field, element, ability, total: base + field + element + ability };
}
function previewEffect2(game, action) {
  const { uid, cell, rotation = 0, abilityDirection = 0, twistCell = null } = action;
  if (game.rotationLocked && rotation !== 0) throw Error("Handkarten haben eine feste Ausrichtung.");
  preview(game, { uid, cell, rotation });
  if (!Number.isInteger(abilityDirection) || abilityDirection < 0 || abilityDirection > 5) throw Error("Ung\xFCltige F\xE4higkeitsrichtung.");
  const working = { ...game, board: { ...game.board } };
  for (const [cell2, old] of Object.entries(working.board)) if (old.guardOwner === game.turn) {
    const c = { ...old };
    delete c.guardOwner;
    delete c.guardUntil;
    delete c.guardDirection;
    working.board[cell2] = c;
  }
  const card = { ...working.players[game.turn].hand.find((c) => c.uid === uid), rotation, controller: game.turn, flips: 0 }, ability = abilityAt2(working, card, cell), transforms = [];
  if (twistCell !== null) {
    if (ability !== "twist" || !twistTargets2(working, cell).includes(twistCell)) throw Error("Kein g\xFCltiges Drehziel.");
    const target = { ...working.board[twistCell] };
    working.board[twistCell] = target;
    transforms.push({ cell: twistCell, uid: target.uid, from: target.rotation, to: (target.rotation + 1) % 6 });
    target.rotation = (target.rotation + 1) % 6;
  }
  if (ability === "guard") {
    card.guardDirection = abilityDirection;
    card.guardOwner = game.turn;
    card.guardUntil = game.placements + 2;
  }
  const comparisons = neighbors(cell).filter((n) => working.board[n.id] && working.board[n.id].controller !== game.turn).map((n) => {
    const other = working.board[n.id], attack = effectStrength2(working, card, cell, n.dir, other, { attacking: true, abilityDirection }), defend = effectStrength2(working, other, n.id, (n.dir + 3) % 6, card);
    return { cell: n.id, dir: n.dir, attack, defend, setup: n.id === twistCell, flip: n.id !== twistCell && attack.total > defend.total, name: cardOf(other).name };
  });
  return { card, cell, ability, abilityDirection, suppressed: Boolean(card.ability && !ability), transforms, comparisons, flips: comparisons.filter((c) => c.flip).map((c) => c.cell), board: working.board };
}
function placeEffect2(game, action) {
  const p = previewEffect2(game, action), next = structuredClone(game), side = game.turn, player = next.players[side];
  next.board = structuredClone(p.board);
  player.hand = player.hand.filter((c) => c.uid !== action.uid);
  if (player.deck.length) player.hand.push(player.deck.shift());
  next.board[action.cell] = { ...p.card, flips: p.flips.length };
  for (const cell of p.flips) {
    const c = next.board[cell];
    c.controller = side;
    delete c.guardOwner;
    delete c.guardUntil;
    delete c.guardDirection;
  }
  player.flips += p.flips.length;
  next.placements++;
  next.last = { type: "place", side, cell: action.cell, uid: action.uid, name: cardOf(p.card).name, flips: p.flips, transforms: p.transforms, ability: p.ability, suppressed: p.suppressed, event: eventPhase(next) !== eventPhase(game) ? eventPhase(next) : null };
  next.history.push(next.last);
  if (freeCells(next).length === 0) {
    next.finished = true;
    const s = scores(next);
    next.winner = s[0] === s[1] ? null : s[0] > s[1] ? 0 : 1;
  } else next.turn = 1 - side;
  return next;
}

// public/game/src/tactics-ai.mjs
var ARCHETYPES2 = DEFINITIONS.map((c) => c.ruleId);
function legalCandidates(game, rules = table_demo_rules_exports) {
  const result = [];
  for (const card of game.players[game.turn].hand) for (const cell of freeCells(game)) for (const rotation of game.rotationLocked ? [0] : [0, 1, 2, 3, 4, 5]) {
    const around = neighbors(cell), ability = rules.abilityAt(game, card, cell), relevant = ability === "hype" ? around.filter((n) => game.board[n.id] && game.board[n.id].controller !== game.turn).map((n) => n.dir) : ability === "guard" && rules.GUARD_ARC === 6 ? [0] : ability === "guard" ? around.filter((n) => n.id !== game.block && !game.board[n.id]).map((n) => n.dir) : [0], directions = relevant.length ? relevant : [0];
    for (const action of rules.actionOptions(game, card, cell, rotation)) if (directions.includes(action.abilityDirection)) {
      const plan = rules.previewEffect(game, action);
      result.push({ action, plan });
    }
  }
  return result;
}
function positionalValue(game, { action, plan }, rules = table_demo_rules_exports) {
  let safety = 0, contacts = 0;
  for (const n of neighbors(action.cell)) {
    if (n.id === game.block) continue;
    const other = plan.board[n.id];
    if (!other) {
      const defense = rules.effectStrength(game, plan.card, action.cell, n.dir, { id: "brain" });
      safety += Math.min(7, defense.base + defense.field + defense.ability) - 4.1;
    } else if (other.controller === game.turn || plan.flips.includes(n.id)) contacts++;
  }
  let twistSafety = 0;
  for (const t of plan.transforms) {
    if (t.temporary) continue;
    const before = game.board[t.cell], after = plan.board[t.cell];
    for (const n of neighbors(t.cell)) if (!game.board[n.id] && n.id !== game.block) twistSafety += (sideValue(before, n.dir) - sideValue(after, n.dir)) * 0.18;
  }
  return plan.flips.length * 2 + safety * 0.42 + contacts * 0.16 + twistSafety;
}
function replyRisk(game, { action, plan }, rules = table_demo_rules_exports) {
  const board = { ...plan.board, [action.cell]: plan.card };
  for (const cell of plan.flips) board[cell] = { ...board[cell], controller: game.turn, guardOwner: void 0, guardUntil: void 0 };
  for (const t of plan.transforms) if (t.temporary) board[t.cell] = { ...board[t.cell], rotation: t.from };
  const future = { ...game, board, placements: game.placements + 1, turn: 1 - game.turn };
  if (future.placements >= 18) return 0;
  if (game.demoFields && game.auditOrientation !== void 0) {
    const copy = { ...future };
    delete copy.demoFields;
    future.demoFields = rules.eventFields(copy).map((f) => rotateField(f, game.auditOrientation));
  }
  let worst = 0;
  for (const cell of freeCells(future)) {
    const enemies = neighbors(cell).filter((n) => board[n.id]?.controller === game.turn);
    if (!enemies.length) continue;
    for (const id of ARCHETYPES2) for (const rotation of game.rotationLocked ? [0] : [0, 1, 2, 3, 4, 5]) {
      const card = { id, rotation, controller: future.turn };
      let flips = 0;
      for (const n of enemies) {
        const other = board[n.id], a = rules.effectStrength(future, card, cell, n.dir, other, { attacking: true }), d = rules.effectStrength(future, other, n.id, (n.dir + 3) % 6, card);
        if (a.total > d.total) flips++;
      }
      worst = Math.max(worst, flips);
    }
  }
  return worst;
}
function rotateField(f, steps) {
  let [q, r] = f.cell.split(",").map(Number);
  for (let i = 0; i < steps; i++) [q, r] = [-r, q + r];
  return { ...f, cell: q + "," + r, ...f.directions ? { directions: f.directions.map((d) => (d + steps) % 6) } : {} };
}
function chooseTactic2(game, { rules = table_demo_rules_exports, policy = "reply", random: random2 = () => 0.5 } = {}) {
  const candidates = legalCandidates(game, rules);
  if (!candidates.length) return { chosen: null, candidates };
  let pool = candidates;
  if (policy === "reply") {
    const groups = /* @__PURE__ */ new Map();
    for (const item of candidates) {
      item.position = positionalValue(game, item, rules);
      const n = item.plan.flips.length;
      if (!groups.has(n)) groups.set(n, []);
      groups.get(n).push(item);
    }
    pool = [...groups.values()].flatMap((group) => group.sort((a, b) => b.position - a.position).slice(0, 2));
  }
  let best = -Infinity, chosen = null, ties = 0;
  for (const item of pool) {
    const value = policy === "greedy" ? item.plan.flips.length * 6 : policy === "reply" ? item.plan.flips.length * 2 - replyRisk(game, item, rules) * 1.65 + (item.position ?? positionalValue(game, item, rules)) * 0.12 : positionalValue(game, item, rules);
    if (value > best + 1e-8) {
      best = value;
      chosen = item;
      ties = 1;
    } else if (Math.abs(value - best) < 1e-8 && random2() < 1 / ++ties) chosen = item;
  }
  return { chosen, candidates };
}

// public/game/src/turn-clock.mjs
function timeoutAction(game) {
  if (game.finished) return null;
  for (const card of game.players[game.turn].hand) for (const cell of freeCells(game)) {
    const action = { uid: card.uid, cell, rotation: 0, abilityDirection: 0, twistCell: null };
    try {
      previewEffect(game, action);
      return action;
    } catch {
    }
  }
  return null;
}

// server/game/engine50.mjs
var RULESET = "account-50";
function createAccountDuel({ deck, inventory, seed, starter, loadouts = ["hype-guard", "hype-twist"] }) {
  if (!deck || !validateDeck(deck.cards, inventory).valid) throw Error("Saved deck is not playable.");
  if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295 || ![0, 1].includes(starter) || !Array.isArray(loadouts) || loadouts.length !== 2 || loadouts.some((l) => !Object.hasOwn(LOADOUTS2, l))) throw Error("Invalid duel settings.");
  const state = { ruleset: RULESET, deck: { id: deck.id, name: deck.name, cards: [...deck.cards] }, seed, starter, loadouts: [...loadouts], round: 1, results: [], awards: [], game: null };
  state.game = roundGame(state);
  return state;
}
function roundGame(state) {
  const starter = state.round === 1 ? state.starter : 1 - state.starter;
  let game = createTacticsMatch({ seed: state.seed, starter, loadouts: state.loadouts });
  game = applyPortalDecks(game, state.deck.cards, state.loadouts.map((id) => LOADOUTS2[id]), { round: state.round });
  game.rotationLocked = true;
  return game;
}
function ai(game) {
  let seed = (game.seed ^ Math.imul(game.placements + 1, 2654435761)) >>> 0;
  return chooseTactic2(game, { random: () => {
    seed = Math.imul(seed, 1664525) + 1013904223 >>> 0;
    return seed / 4294967296;
  } }).chosen?.action;
}
function place(state, action, steps) {
  const before = state.game;
  state.game = placeEffect2(before, action);
  steps.push({ before: structuredClone(before), action, after: structuredClone(state.game) });
  if (state.game.finished) {
    state.results[state.round - 1] = scores(state.game);
    state.awards[state.round - 1] = state.game.winner === 0 ? 5 : 2;
  }
}
function beginAccountRound(state) {
  const next = structuredClone(state), steps = [];
  if (next.game.turn === 1 && !next.game.finished) place(next, ai(next.game), steps);
  return { state: next, steps, award: 0 };
}
function advanceAccountDuel(state, input) {
  if (state.ruleset !== RULESET) throw Error("This duel uses an older ruleset. Start a new duel.");
  const next = structuredClone(state), steps = [];
  if (input.kind === "next") {
    if (!next.game.finished || next.round !== 1) throw Error("Finish round one before the return round.");
    next.round = 2;
    next.game = roundGame(next);
    return beginAccountRound(next);
  }
  if (next.game.finished || next.game.turn !== 0) throw Error("It is not your turn.");
  if (input.kind === "shift") next.game = shiftBlock(next.game, input.cell);
  else if (input.kind === "place" || input.kind === "timeout") {
    const action = input.kind === "timeout" ? timeoutAction(next.game) : input.action;
    if (!action || typeof action.uid !== "string" || typeof action.cell !== "string" || action.rotation !== 0) throw Error("Invalid card action.");
    place(next, action, steps);
    if (!next.game.finished && next.game.turn === 1) place(next, ai(next.game), steps);
  } else throw Error("Unknown game action.");
  return { state: next, steps, award: next.game.finished && !state.game.finished ? next.awards[next.round - 1] : 0 };
}

// server/game/handler50.mjs
var ALLOWED = /* @__PURE__ */ new Set(["https://www.memexduelverse.com", "https://memexduelverse.com", "http://127.0.0.1:4228", "http://localhost:4228"]);
function createGameHandler({ env, fetcher = fetch, randomSeed = () => crypto.getRandomValues(new Uint32Array(1))[0] }) {
  const url = env("SUPABASE_URL"), key = env("SUPABASE_SERVICE_ROLE_KEY");
  async function rest(path, options = {}) {
    const res = await fetcher(url + "/rest/v1/" + path, { ...options, headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json", ...options.headers } });
    const data = await res.json();
    if (!res.ok) throw Object.assign(Error(data.message || "Game storage unavailable."), { status: data.code === "40001" ? 409 : res.status >= 500 ? 503 : 400 });
    return data;
  }
  return async function handle(req) {
    const origin = req.headers.get("origin");
    const cors = { "Content-Type": "application/json", "Cache-Control": "no-store", Vary: "Origin", ...ALLOWED.has(origin) ? { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info", "Access-Control-Allow-Methods": "POST,OPTIONS" } : {} };
    const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });
    if (origin && !ALLOWED.has(origin)) return reply({ error: "Origin not allowed." }, 403);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (req.method !== "POST") return reply({ error: "POST required." }, 405);
    try {
      const bearer = req.headers.get("authorization");
      if (!bearer?.startsWith("Bearer ")) return reply({ error: "Sign in to play for Pixels." }, 401);
      const auth = await fetcher(url + "/auth/v1/user", { headers: { apikey: env("SUPABASE_ANON_KEY"), Authorization: bearer } });
      const user = await auth.json();
      if (!auth.ok || typeof user.id !== "string" || user.is_anonymous) return reply({ error: "Sign in to play for Pixels." }, 401);
      const text = await req.text();
      if (text.length > 6e3) return reply({ error: "Request too large." }, 413);
      const input = JSON.parse(text), uid = user.id;
      const uuid = (v) => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
      const wallet = async () => {
        const rows2 = await rest("dv_wallets?user_id=eq." + uid + "&select=earned,premium,echoes");
        if (!rows2[0]) throw Error("Initialize your player account first.");
        return { pixels: rows2[0].earned, shards: rows2[0].premium, echoes: rows2[0].echoes };
      };
      if (input.op === "profile") {
        await rest("rpc/dv_initialize_account", { method: "POST", headers: { Authorization: bearer }, body: "{}" });
        const decks = await rest("dv_decks?user_id=eq." + uid + "&select=id,name,cards,active&order=created_at.asc");
        return reply({ decks, wallet: await wallet() });
      }
      if (input.op === "start") {
        if (!uuid(input.id) || input.deckId != null && !uuid(input.deckId)) throw Error("Invalid duel request.");
        const existing = await rest("dv_game_sessions50?id=eq." + input.id + "&user_id=eq." + uid + "&active=eq.true&select=id,state,version");
        if (existing[0]) return reply({ ...existing[0], steps: [], award: 0, wallet: await wallet() });
        const decks = await rest("dv_decks?user_id=eq." + uid + "&select=id,name,cards,active&order=created_at.asc"), deck = input.deckId ? decks.find((d) => d.id === input.deckId) : decks.find((d) => d.active) ?? decks[0];
        const rows2 = await rest("dv_inventory?user_id=eq." + uid + "&select=variant_id,quantity"), inventory = Object.fromEntries(rows2.map((r) => [r.variant_id, r.quantity]));
        const initial = createAccountDuel({ deck, inventory, seed: randomSeed(), starter: input.starter, loadouts: input.loadouts });
        const result2 = beginAccountRound(initial);
        const saved2 = await rest("rpc/dv_game_start50", { method: "POST", body: JSON.stringify({ p_user: uid, p_id: input.id, p_state: result2.state }) });
        return reply({ ...saved2, steps: result2.steps, award: 0, wallet: await wallet() });
      }
      if (!uuid(input.id)) throw Error("Invalid duel.");
      const rows = await rest("dv_game_sessions50?id=eq." + input.id + "&user_id=eq." + uid + "&active=eq.true&select=id,state,version,last_request,last_reply");
      const saved = rows[0];
      if (!saved) return reply({ error: "Duel unavailable. Start a new duel." }, 404);
      if (input.op === "resume") return reply({ id: saved.id, state: saved.state, version: saved.version, steps: [], award: 0, wallet: await wallet() });
      if (input.op !== "action" || !uuid(input.requestId) || !Number.isInteger(input.version)) throw Error("Invalid game request.");
      if (saved.last_request === input.requestId) return reply({ ...saved.last_reply, wallet: await wallet() });
      if (saved.version !== input.version) return reply({ error: "Duel changed in another tab. Restore your game." }, 409);
      const result = advanceAccountDuel(saved.state, input.move ?? {});
      const answer = await rest("rpc/dv_game_commit50", { method: "POST", body: JSON.stringify({ p_user: uid, p_id: input.id, p_version: input.version, p_request: input.requestId, p_state: result.state, p_steps: result.steps, p_award: result.award }) });
      return reply(answer);
    } catch (e) {
      const status = e.status ?? (e instanceof TypeError ? 503 : 400);
      return reply({ error: e.message === "fetch failed" ? "Game server unavailable. Retry your saved move." : e.message }, status);
    }
  };
}

// supabase/functions/duelverse-game50/index.mjs
Deno.serve(createGameHandler({ env: (name) => Deno.env.get(name) }));
