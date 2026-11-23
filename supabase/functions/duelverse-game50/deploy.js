var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// public/game/platform/series113.mjs
var SERIES_TARGET113 = 2;
function series113(results = []) {
  const wins = [0, 0];
  let draws = 0;
  for (const score of results) {
    if (!Array.isArray(score) || score.length !== 2 || !score.every(Number.isFinite)) continue;
    if (score[0] === score[1]) draws++;
    else wins[score[0] > score[1] ? 0 : 1]++;
  }
  const winner = wins[0] >= SERIES_TARGET113 ? 0 : wins[1] >= SERIES_TARGET113 ? 1 : null;
  return { wins, draws, winner, finished: winner !== null, target: SERIES_TARGET113 };
}
function seriesStarter113(first, round) {
  return (round - 1) % 2 === 0 ? first : 1 - first;
}

// public/game/platform/card-ranks126.mjs
var S_RANK126 = 10;
var isSRank126 = (value) => value === S_RANK126 || value === "S";
function rankedStrength126(base, bonus = 0) {
  return isSRank126(base) ? { base: S_RANK126, rank: "S", total: S_RANK126 } : { base, total: base + bonus };
}

// public/game/platform/elements53.mjs?v=tie-break-63
var ELEMENT_IDS = Object.freeze(["fire", "water", "earth", "air", "storm"]);
var normalizeElement = (id) => id === "stone" ? "earth" : id;
var raw = {
  fire: { name: "Fire", symbol: "\u{1F525}", color: "#ff9d62", from: "#fff07a", to: "#ff8d12", path: "M128 16 C139 48 153 67 141 98 C156 91 172 76 177 59 C176 105 208 130 208 166 C208 211 174 241 128 241 C78 241 48 210 48 170 C48 135 72 111 78 85 C78 120 95 138 93 103 C91 75 113 44 128 16 Z M128 218 C136 220 145 218 153 214 C168 203 169 183 149 159 C151 171 147 182 137 190 C137 172 117 168 119 142 C116 157 99 168 96 184 C93 203 104 218 128 218 Z", beats: ["earth", "air"] },
  water: { name: "Water", symbol: "\u2248", color: "#65cfff", from: "#d4fbff", to: "#2284e4", path: "M128 18 C112 68 49 120 49 167 C49 266 207 266 207 167 C207 120 144 68 128 18 Z", beats: ["fire", "earth"] },
  earth: { name: "Earth", symbol: "\u25C6", color: "#d6bc78", from: "#f7e7ae", to: "#a9853a", path: "M128 26 L210 128 L128 230 L46 128 Z", beats: ["air", "storm"] },
  air: { name: "Air", symbol: "\u224B", color: "#a9eee1", from: "#edfff9", to: "#57bbaa", path: "M28 82 H157 C217 82 218 17 177 25 C156 28 153 47 168 56 M28 126 H207 C252 126 246 184 216 182 C197 180 191 165 201 154 M28 170 H119 C166 170 169 230 133 230 C113 230 105 215 117 203", beats: ["storm", "water"], stroke: true },
  storm: { name: "Storm", symbol: "\u03DF", color: "#bb99ff", from: "#fff3c2", to: "#a49aff", path: "M151 20 L59 138 L118 138 L92 236 L202 108 L136 108 Z", beats: ["water", "fire"] }
};
var ELEMENTS = Object.freeze(Object.fromEntries(ELEMENT_IDS.map((id) => [id, Object.freeze({ id, ...raw[id], beats: Object.freeze(raw[id].beats) })])));
var ELEMENT_LIST = Object.freeze(ELEMENT_IDS.map((id) => ELEMENTS[id]));
function elementAdvantage(attacker, defender, rules = 5) {
  const a = normalizeElement(attacker), b = normalizeElement(defender);
  if (rules === 3) return { fire: "earth", earth: "storm", storm: "fire" }[a] === b;
  return ELEMENTS[a]?.beats.includes(b) ?? false;
}
function attackWins(attack, defend, rules = 5) {
  if (attack.rank === "S" || defend.rank === "S") return attack.rank === "S" && (defend.rank !== "S" || attack.element > defend.element);
  return attack.total > defend.total || rules !== 3 && attack.total === defend.total && attack.element > defend.element;
}

// public/game/platform/set-manifest131.mjs
var ALPHA_REGULAR_IDS131 = Object.freeze(["pepe", "doge", "roll-safe", "harold", "disaster-girl", "distracted", "side-eye", "success-kid", "grumpy-cat", "aliens-guy", "smudge", "confused", "bad-luck-brian", "gigachad", "this-is-fine", "trollface", "stonks", "press-f", "git-gud", "rage-quit", "lag-spike", "hodl", "diamond-hands", "to-the-moon", "rug-pull", "crying-cat", "keyboard-cat", "coffin-dance", "galaxy-brain", "npc", "leeroy-jenkins", "touch-grass", "copium", "paper-hands", "buy-the-dip", "angry-wojak", "screaming-marmot", "table-flip", "triggered", "salt-bae", "floor-is-lava", "hot-take", "headshot", "rage-hamster", "burning-toast", "capybara-chill", "sad-keanu", "crying-wojak", "tears-of-joy", "duck-float", "seal-of-approval", "sink-or-swim", "stay-hydrated", "pool-noodle", "wet-cat", "bonk", "cheems", "walter", "absolute-unit", "couch-potato", "monke", "banana-for-scale", "turtle-stack", "stone-face", "rock-solid", "nyan-cat", "dramatic-chipmunk", "spinning-seal", "longcat", "ceiling-cat", "hover-cat", "bird-is-word", "flying-spaghetti", "airhorn", "yeet", "error-404", "blue-screen", "cat-jam", "shocked-monkey", "math-lady", "surprised-rat", "plot-twist", "big-brain-time", "rickroll", "uno-reverse"]);
var ALPHA_PRIME_IDS131 = Object.freeze(["evil-ernie", "nuck-chorris", "sparta-kick", "emotional-damage", "pablo-waiting", "here-we-go-again", "one-does-not-simply", "sanic", "numa-numa", "keyboard-crusher"]);
var ALPHA_SLOTS131 = Object.freeze([
  ...ALPHA_REGULAR_IDS131.map((id, i) => ({ number: i + 1, id, category: "regular" })),
  ...Array.from({ length: 15 }, (_, i) => ({ number: 86 + i, id: ALPHA_PRIME_IDS131[i] ?? null, category: "prime" })),
  ...Array.from({ length: 20 }, (_, i) => ({ number: 101 + i, id: null, category: "iconic" }))
].map((s) => Object.freeze(s)));
var SETS131 = Object.freeze([{ id: "alpha", name: "Alpha", mark: "\u03B1", size: 120, current: true, limits: Object.freeze({ regular: 85, prime: 15, iconic: 20 }), slots: ALPHA_SLOTS131 }].map((s) => Object.freeze(s)));
var ALPHA_IDS131 = Object.freeze(ALPHA_SLOTS131.filter((s) => s.id).map((s) => s.id));
var membership = new Map(SETS131.flatMap((set) => set.slots.filter((s) => s.id).map((slot) => [slot.id, { edition: set.id, ...slot }])));
var setSlot131 = (id) => membership.get(id) ?? null;
var cardCategory131 = (id) => setSlot131(id)?.category ?? null;
function assertSetCatalog131(cards) {
  const seen = /* @__PURE__ */ new Set();
  for (const c of cards) {
    const slot = setSlot131(c.id);
    if (!slot || seen.has(c.id) || Boolean(c.prime) !== (slot.category === "prime")) throw Error("Card requires a unique, matching edition slot: " + c.id);
    seen.add(c.id);
  }
  for (const s of SETS131) {
    if (s.slots.length !== s.size || new Set(s.slots.map((x) => x.number)).size !== s.size) throw Error("Invalid edition capacity");
    for (const [kind, size] of Object.entries(s.limits)) if (s.slots.filter((x) => x.category === kind).length !== size) throw Error("Invalid category capacity");
  }
  return true;
}

// public/game/platform/primes126.mjs
var PRIME_CARDS = Object.freeze([
  {
    "id": "evil-ernie",
    "name": "EVIL ERNIE",
    "short": "EVIL ERNIE",
    "ruleId": "prime-evil-ernie",
    "element": "fire",
    "values": [
      10,
      5,
      2,
      3,
      6,
      7
    ],
    "prime": true,
    "ability": null,
    "quote": "Not every angel comes from above.",
    "image": "/game/assets/cards/primes-v126/evil-ernie-common.webp",
    "artDirectory": "primes-v126",
    "artRegion": {
      "x": -0.125,
      "y": -0.23,
      "w": 1.25,
      "h": 1.25
    }
  },
  {
    "id": "nuck-chorris",
    "name": "Nuck Chorris",
    "short": "Nuck Chorris",
    "ruleId": "prime-nuck-chorris",
    "element": "storm",
    "values": [
      3,
      10,
      7,
      6,
      5,
      2
    ],
    "prime": true,
    "ability": null,
    "quote": "Business casual. Meme critical.",
    "image": "/game/assets/cards/primes-v126/nuck-chorris-common.webp",
    "artDirectory": "primes-v126",
    "artRegion": {
      "x": -0.025,
      "y": -0.025,
      "w": 1.05,
      "h": 1.05
    }
  },
  {
    "id": "sparta-kick",
    "name": "THIS IS SPARTA",
    "short": "THIS IS SPARTA",
    "ruleId": "prime-sparta-kick",
    "element": "fire",
    "values": [
      7,
      10,
      3,
      5,
      6,
      2
    ],
    "prime": true,
    "ability": null,
    "quote": "",
    "image": "/game/assets/cards/primes-v126/sparta-kick-common.webp",
    "artDirectory": "primes-v126",
    "artRegion": {
      "x": -0.1,
      "y": -0.16,
      "w": 1.2,
      "h": 1.2
    }
  },
  {
    "id": "emotional-damage",
    "name": "EMOTIONAL DAMAGE",
    "short": "EMOT. DAMAGE",
    "ruleId": "prime-emotional-damage",
    "element": "water",
    "values": [
      10,
      2,
      6,
      5,
      3,
      7
    ],
    "prime": true,
    "ability": null,
    "quote": "",
    "image": "/game/assets/cards/primes-v126/emotional-damage-common.webp",
    "artDirectory": "primes-v126",
    "artRegion": {
      "x": -0.1,
      "y": -0.16,
      "w": 1.2,
      "h": 1.2
    }
  },
  {
    "id": "pablo-waiting",
    "name": "PABLO WAITING",
    "short": "PABLO WAITING",
    "ruleId": "prime-pablo-waiting",
    "element": "water",
    "values": [
      5,
      3,
      7,
      2,
      10,
      6
    ],
    "prime": true,
    "ability": null,
    "quote": "Still waiting for your turn.",
    "image": "/game/assets/cards/primes-v126/pablo-waiting-common.webp",
    "artDirectory": "primes-v126",
    "artRegion": {
      "x": -0.1,
      "y": -0.16,
      "w": 1.2,
      "h": 1.2
    }
  },
  {
    "id": "here-we-go-again",
    "name": "HERE WE GO AGAIN",
    "short": "HERE WE GO",
    "ruleId": "prime-here-we-go-again",
    "element": "earth",
    "values": [
      2,
      7,
      6,
      10,
      3,
      5
    ],
    "prime": true,
    "ability": null,
    "quote": "",
    "image": "/game/assets/cards/primes-v126/here-we-go-again-common.webp",
    "artDirectory": "primes-v126",
    "artRegion": {
      "x": -0.1,
      "y": -0.16,
      "w": 1.2,
      "h": 1.2
    }
  },
  {
    "id": "one-does-not-simply",
    "name": "ONE DOES NOT SIMPLY",
    "short": "NOT SIMPLY",
    "ruleId": "prime-one-does-not-simply",
    "element": "earth",
    "values": [
      6,
      3,
      10,
      7,
      5,
      2
    ],
    "prime": true,
    "ability": null,
    "quote": "",
    "image": "/game/assets/cards/primes-v126/one-does-not-simply-common.webp",
    "artDirectory": "primes-v126",
    "artRegion": {
      "x": -0.1,
      "y": -0.16,
      "w": 1.2,
      "h": 1.2
    }
  },
  {
    "id": "sanic",
    "name": "SANIC",
    "short": "SANIC",
    "ruleId": "prime-sanic",
    "element": "air",
    "values": [
      3,
      5,
      2,
      6,
      7,
      10
    ],
    "prime": true,
    "ability": null,
    "quote": "",
    "image": "/game/assets/cards/primes-v126/sanic-common.webp",
    "artDirectory": "primes-v126",
    "artRegion": {
      "x": -0.1,
      "y": -0.16,
      "w": 1.2,
      "h": 1.2
    }
  },
  {
    "id": "numa-numa",
    "name": "NUMA NUMA",
    "short": "NUMA NUMA",
    "ruleId": "prime-numa-numa",
    "element": "air",
    "values": [
      7,
      2,
      5,
      10,
      6,
      3
    ],
    "prime": true,
    "ability": null,
    "quote": "",
    "image": "/game/assets/cards/primes-v126/numa-numa-common.webp",
    "artDirectory": "primes-v126",
    "artRegion": {
      "x": -0.1,
      "y": -0.16,
      "w": 1.2,
      "h": 1.2
    }
  },
  {
    "id": "keyboard-crusher",
    "name": "KEYBOARD CRUSHER",
    "short": "ANGRY KID",
    "ruleId": "prime-keyboard-crusher",
    "element": "storm",
    "values": [
      6,
      7,
      10,
      3,
      2,
      5
    ],
    "prime": true,
    "ability": null,
    "quote": "The keyboard had one job.",
    "image": "/game/assets/cards/primes-v126/keyboard-crusher-common.webp",
    "artDirectory": "primes-v126",
    "artRegion": {
      "x": -0.1,
      "y": -0.16,
      "w": 1.2,
      "h": 1.2
    }
  }
].map((c) => Object.freeze({ ...c, values: Object.freeze(c.values), artRegion: Object.freeze(c.artRegion) })));

// public/game/platform/art-atlases53.mjs
var ATLAS_REGIONS = {
  "angry-wojak": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "screaming-marmot": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "table-flip": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "triggered": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "salt-bae": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "floor-is-lava": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "hot-take": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "headshot": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "rage-hamster": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "burning-toast": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "capybara-chill": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "sad-keanu": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "crying-wojak": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "tears-of-joy": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "duck-float": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "seal-of-approval": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "sink-or-swim": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "stay-hydrated": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "pool-noodle": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "wet-cat": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "bonk": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "cheems": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "walter": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "absolute-unit": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "couch-potato": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "monke": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "banana-for-scale": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "turtle-stack": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "stone-face": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "rock-solid": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "nyan-cat": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "dramatic-chipmunk": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "spinning-seal": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "longcat": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "ceiling-cat": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "hover-cat": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "bird-is-word": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "flying-spaghetti": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "airhorn": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "yeet": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "error-404": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "blue-screen": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "cat-jam": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "shocked-monkey": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "math-lady": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "surprised-rat": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "plot-twist": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "big-brain-time": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "rickroll": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  },
  "uno-reverse": {
    "w": 0.2,
    "h": 0.6,
    "y": 0.10000000000000003
  }
};

// public/game/platform/elements53.mjs
var ELEMENT_IDS2 = Object.freeze(["fire", "water", "earth", "air", "storm"]);
var normalizeElement2 = (id) => id === "stone" ? "earth" : id;
var raw2 = {
  fire: { name: "Fire", symbol: "\u{1F525}", color: "#ff9d62", from: "#fff07a", to: "#ff8d12", path: "M128 16 C139 48 153 67 141 98 C156 91 172 76 177 59 C176 105 208 130 208 166 C208 211 174 241 128 241 C78 241 48 210 48 170 C48 135 72 111 78 85 C78 120 95 138 93 103 C91 75 113 44 128 16 Z M128 218 C136 220 145 218 153 214 C168 203 169 183 149 159 C151 171 147 182 137 190 C137 172 117 168 119 142 C116 157 99 168 96 184 C93 203 104 218 128 218 Z", beats: ["earth", "air"] },
  water: { name: "Water", symbol: "\u2248", color: "#65cfff", from: "#d4fbff", to: "#2284e4", path: "M128 18 C112 68 49 120 49 167 C49 266 207 266 207 167 C207 120 144 68 128 18 Z", beats: ["fire", "earth"] },
  earth: { name: "Earth", symbol: "\u25C6", color: "#d6bc78", from: "#f7e7ae", to: "#a9853a", path: "M128 26 L210 128 L128 230 L46 128 Z", beats: ["air", "storm"] },
  air: { name: "Air", symbol: "\u224B", color: "#a9eee1", from: "#edfff9", to: "#57bbaa", path: "M28 82 H157 C217 82 218 17 177 25 C156 28 153 47 168 56 M28 126 H207 C252 126 246 184 216 182 C197 180 191 165 201 154 M28 170 H119 C166 170 169 230 133 230 C113 230 105 215 117 203", beats: ["storm", "water"], stroke: true },
  storm: { name: "Storm", symbol: "\u03DF", color: "#bb99ff", from: "#fff3c2", to: "#a49aff", path: "M151 20 L59 138 L118 138 L92 236 L202 108 L136 108 Z", beats: ["water", "fire"] }
};
var ELEMENTS2 = Object.freeze(Object.fromEntries(ELEMENT_IDS2.map((id) => [id, Object.freeze({ id, ...raw2[id], beats: Object.freeze(raw2[id].beats) })])));
var ELEMENT_LIST2 = Object.freeze(ELEMENT_IDS2.map((id) => ELEMENTS2[id]));

// public/game/platform/expansion53.mjs
var ELEMENT_CARDS = Object.freeze([
  {
    "id": "angry-wojak",
    "name": "Angry Wojak",
    "short": "Angry Wojak",
    "element": "fire",
    "values": [
      6,
      3,
      4,
      2,
      5,
      4
    ],
    "ability": null,
    "quote": "Volume is not a win condition.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/angry-wojak.webp"
  },
  {
    "id": "screaming-marmot",
    "name": "Screaming Marmot",
    "short": "Scream Marmot",
    "element": "fire",
    "values": [
      5,
      5,
      2,
      4,
      3,
      5
    ],
    "ability": null,
    "quote": "The mountain has heard enough.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/screaming-marmot.webp"
  },
  {
    "id": "table-flip",
    "name": "Table Flip",
    "short": "Table Flip",
    "element": "fire",
    "values": [
      3,
      6,
      4,
      3,
      5,
      3
    ],
    "ability": null,
    "quote": "Your board has been politely rearranged.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/table-flip.webp"
  },
  {
    "id": "triggered",
    "name": "Triggered",
    "short": "Triggered",
    "element": "fire",
    "values": [
      4,
      3,
      5,
      5,
      2,
      5
    ],
    "ability": null,
    "quote": "It was definitely a personal attack.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/triggered.webp"
  },
  {
    "id": "salt-bae",
    "name": "Let Him Cook",
    "short": "Let Him Cook",
    "element": "fire",
    "values": [
      7,
      2,
      4,
      3,
      4,
      4
    ],
    "ability": null,
    "quote": "Trust the process. Ignore the smoke alarm.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/replacements-v129/let-him-cook.webp"
  },
  {
    "id": "floor-is-lava",
    "name": "Floor Is Lava",
    "short": "Floor Is Lava",
    "element": "fire",
    "values": [
      4,
      5,
      3,
      6,
      3,
      3
    ],
    "ability": null,
    "quote": "The floor failed its safety inspection.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/floor-is-lava.webp"
  },
  {
    "id": "hot-take",
    "name": "Hot Take",
    "short": "Hot Take",
    "element": "fire",
    "values": [
      5,
      3,
      4,
      4,
      5,
      3
    ],
    "ability": null,
    "quote": "Fresh from the comment section.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/hot-take.webp"
  },
  {
    "id": "headshot",
    "name": "Headshot",
    "short": "Headshot",
    "element": "fire",
    "values": [
      2,
      5,
      5,
      4,
      4,
      4
    ],
    "ability": null,
    "quote": "My aim was the friends we made.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/headshot.webp"
  },
  {
    "id": "rage-hamster",
    "name": "Rage Hamster",
    "short": "Rage Hamster",
    "element": "fire",
    "values": [
      4,
      4,
      6,
      2,
      3,
      5
    ],
    "ability": null,
    "quote": "Small body. Unreasonable fury.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/rage-hamster.webp"
  },
  {
    "id": "burning-toast",
    "name": "Burning Toast",
    "short": "Burning Toast",
    "element": "fire",
    "values": [
      3,
      4,
      3,
      5,
      6,
      3
    ],
    "ability": null,
    "quote": "Breakfast chose violence.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/burning-toast.webp"
  },
  {
    "id": "capybara-chill",
    "name": "Capybara Chill",
    "short": "Capybara Chill",
    "element": "water",
    "values": [
      3,
      4,
      2,
      5,
      4,
      6
    ],
    "ability": null,
    "quote": "No stress. Only excellent positioning.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/capybara-chill.webp"
  },
  {
    "id": "sad-keanu",
    "name": "Sad Keanu",
    "short": "Sad Keanu",
    "element": "water",
    "values": [
      5,
      2,
      4,
      3,
      5,
      5
    ],
    "ability": null,
    "quote": "A sandwich and a second chance.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/sad-keanu.webp"
  },
  {
    "id": "crying-wojak",
    "name": "Crying Wojak",
    "short": "Crying Wojak",
    "element": "water",
    "values": [
      6,
      4,
      3,
      5,
      3,
      3
    ],
    "ability": null,
    "quote": "Tears are a renewable resource.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/crying-wojak.webp"
  },
  {
    "id": "tears-of-joy",
    "name": "Tears of Joy",
    "short": "Tears of Joy",
    "element": "water",
    "values": [
      3,
      5,
      5,
      2,
      5,
      4
    ],
    "ability": null,
    "quote": "Laughing through the losing streak.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/tears-of-joy.webp"
  },
  {
    "id": "duck-float",
    "name": "Duck Float",
    "short": "Duck Float",
    "element": "water",
    "values": [
      2,
      4,
      3,
      4,
      4,
      7
    ],
    "ability": null,
    "quote": "Zero ducks given.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/duck-float.webp"
  },
  {
    "id": "seal-of-approval",
    "name": "Seal of Approval",
    "short": "Seal Approved",
    "element": "water",
    "values": [
      5,
      3,
      6,
      3,
      3,
      4
    ],
    "ability": null,
    "quote": "This move has been officially approved.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/seal-of-approval.webp"
  },
  {
    "id": "sink-or-swim",
    "name": "Sink or Swim",
    "short": "Sink or Swim",
    "element": "water",
    "values": [
      3,
      4,
      4,
      5,
      3,
      5
    ],
    "ability": null,
    "quote": "The exit strategy is inflatable.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/sink-or-swim.webp"
  },
  {
    "id": "stay-hydrated",
    "name": "Stay Hydrated",
    "short": "Stay Hydrated",
    "element": "water",
    "values": [
      5,
      5,
      4,
      4,
      4,
      2
    ],
    "ability": null,
    "quote": "Drink water. Reconsider your turn.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/stay-hydrated.webp"
  },
  {
    "id": "pool-noodle",
    "name": "Pool Noodle",
    "short": "Pool Noodle",
    "element": "water",
    "values": [
      4,
      6,
      2,
      3,
      5,
      4
    ],
    "ability": null,
    "quote": "A flexible approach to warfare.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/pool-noodle.webp"
  },
  {
    "id": "wet-cat",
    "name": "Wet Cat",
    "short": "Wet Cat",
    "element": "water",
    "values": [
      4,
      3,
      5,
      6,
      3,
      3
    ],
    "ability": null,
    "quote": "The bath was not in the patch notes.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/wet-cat.webp"
  },
  {
    "id": "bonk",
    "name": "Bonk",
    "short": "Bonk",
    "element": "earth",
    "values": [
      4,
      2,
      5,
      4,
      6,
      3
    ],
    "ability": null,
    "quote": "Your bad move has been noted.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/bonk.webp"
  },
  {
    "id": "cheems",
    "name": "Cheems",
    "short": "Cheems",
    "element": "earth",
    "values": [
      2,
      4,
      3,
      5,
      5,
      5
    ],
    "ability": null,
    "quote": "Tactically awkward. Emotionally available.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/cheems.webp"
  },
  {
    "id": "walter",
    "name": "Walter",
    "short": "Walter",
    "element": "earth",
    "values": [
      4,
      3,
      5,
      3,
      3,
      6
    ],
    "ability": null,
    "quote": "No thoughts. Excellent defense.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/walter.webp"
  },
  {
    "id": "absolute-unit",
    "name": "Absolute Unit",
    "short": "Absolute Unit",
    "element": "earth",
    "values": [
      5,
      5,
      2,
      5,
      4,
      3
    ],
    "ability": null,
    "quote": "Built different. Mostly wool.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/absolute-unit.webp"
  },
  {
    "id": "couch-potato",
    "name": "Couch Potato",
    "short": "Couch Potato",
    "element": "earth",
    "values": [
      4,
      3,
      4,
      4,
      7,
      2
    ],
    "ability": null,
    "quote": "Peak performance from the sofa.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/couch-potato.webp"
  },
  {
    "id": "monke",
    "name": "Monke",
    "short": "Monke",
    "element": "earth",
    "values": [
      3,
      6,
      3,
      3,
      4,
      5
    ],
    "ability": null,
    "quote": "Return to simple strategies.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/monke.webp"
  },
  {
    "id": "banana-for-scale",
    "name": "Banana for Scale",
    "short": "Banana Scale",
    "element": "earth",
    "values": [
      4,
      4,
      5,
      3,
      5,
      3
    ],
    "ability": null,
    "quote": "A universally accepted unit of victory.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/banana-for-scale.webp"
  },
  {
    "id": "turtle-stack",
    "name": "Turtle Stack",
    "short": "Turtle Stack",
    "element": "earth",
    "values": [
      5,
      4,
      4,
      4,
      2,
      5
    ],
    "ability": null,
    "quote": "It is turtles all the way down.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/turtle-stack.webp"
  },
  {
    "id": "stone-face",
    "name": "Stone Face",
    "short": "Stone Face",
    "element": "earth",
    "values": [
      6,
      2,
      3,
      5,
      4,
      4
    ],
    "ability": null,
    "quote": "An expression of absolute confidence.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/stone-face.webp"
  },
  {
    "id": "rock-solid",
    "name": "Rock Solid",
    "short": "Rock Solid",
    "element": "earth",
    "values": [
      3,
      5,
      6,
      3,
      3,
      4
    ],
    "ability": null,
    "quote": "Heavy is a valid personality.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/rock-solid.webp"
  },
  {
    "id": "nyan-cat",
    "name": "Nyan Cat",
    "short": "Nyan Cat",
    "element": "air",
    "values": [
      2,
      5,
      4,
      6,
      3,
      4
    ],
    "ability": null,
    "quote": "Rainbow propulsion. Questionable steering.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/nyan-cat.webp"
  },
  {
    "id": "dramatic-chipmunk",
    "name": "Dramatic Chipmunk",
    "short": "Dramatic Look",
    "element": "air",
    "values": [
      4,
      3,
      5,
      5,
      5,
      2
    ],
    "ability": null,
    "quote": "A perfectly timed dramatic pause.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/dramatic-chipmunk.webp"
  },
  {
    "id": "spinning-seal",
    "name": "Spinning Seal",
    "short": "Spinning Seal",
    "element": "air",
    "values": [
      3,
      5,
      3,
      3,
      6,
      4
    ],
    "ability": null,
    "quote": "Momentum is my entire plan.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/spinning-seal.webp"
  },
  {
    "id": "longcat",
    "name": "Longcat",
    "short": "Longcat",
    "element": "air",
    "values": [
      5,
      2,
      5,
      4,
      3,
      5
    ],
    "ability": null,
    "quote": "Long enough to cover every excuse.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/longcat.webp"
  },
  {
    "id": "ceiling-cat",
    "name": "Ceiling Cat",
    "short": "Ceiling Cat",
    "element": "air",
    "values": [
      3,
      4,
      4,
      7,
      2,
      4
    ],
    "ability": null,
    "quote": "I have seen your search history.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/ceiling-cat.webp"
  },
  {
    "id": "hover-cat",
    "name": "Hover Cat",
    "short": "Hover Cat",
    "element": "air",
    "values": [
      6,
      3,
      3,
      4,
      5,
      3
    ],
    "ability": null,
    "quote": "Gravity is merely a suggestion.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/hover-cat.webp"
  },
  {
    "id": "bird-is-word",
    "name": "Bird Is Word",
    "short": "Bird Is Word",
    "element": "air",
    "values": [
      4,
      5,
      3,
      5,
      3,
      4
    ],
    "ability": null,
    "quote": "The bird has filed a noise complaint.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/bird-is-word.webp"
  },
  {
    "id": "flying-spaghetti",
    "name": "Flying Spaghetti",
    "short": "Flying Pasta",
    "element": "air",
    "values": [
      4,
      4,
      4,
      2,
      5,
      5
    ],
    "ability": null,
    "quote": "A noodly solution to a rigid problem.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/flying-spaghetti.webp"
  },
  {
    "id": "airhorn",
    "name": "Airhorn",
    "short": "Airhorn",
    "element": "air",
    "values": [
      2,
      3,
      5,
      4,
      4,
      6
    ],
    "ability": null,
    "quote": "Subtlety has left the server.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/airhorn.webp"
  },
  {
    "id": "yeet",
    "name": "Yeet",
    "short": "Yeet",
    "element": "air",
    "values": [
      5,
      6,
      3,
      3,
      4,
      3
    ],
    "ability": null,
    "quote": "The destination is someone else\u2019s problem.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/yeet.webp"
  },
  {
    "id": "error-404",
    "name": "Error 404",
    "short": "Error 404",
    "element": "storm",
    "values": [
      5,
      4,
      6,
      3,
      4,
      2
    ],
    "ability": null,
    "quote": "Strategy not found. Please improvise.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/error-404.webp"
  },
  {
    "id": "blue-screen",
    "name": "Blue Screen",
    "short": "Blue Screen",
    "element": "storm",
    "values": [
      3,
      5,
      5,
      5,
      2,
      4
    ],
    "ability": null,
    "quote": "Your confidence has stopped responding.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/blue-screen.webp"
  },
  {
    "id": "cat-jam",
    "name": "Cat Jam",
    "short": "Cat Jam",
    "element": "storm",
    "values": [
      5,
      3,
      3,
      6,
      4,
      3
    ],
    "ability": null,
    "quote": "Your defeat has a very catchy beat.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/cat-jam.webp"
  },
  {
    "id": "shocked-monkey",
    "name": "Shocked Monkey",
    "short": "Shocked Monkey",
    "element": "storm",
    "values": [
      2,
      5,
      4,
      3,
      5,
      5
    ],
    "ability": null,
    "quote": "That was not in the tutorial.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/shocked-monkey.webp"
  },
  {
    "id": "math-lady",
    "name": "Math Lady",
    "short": "Math Lady",
    "element": "storm",
    "values": [
      4,
      4,
      7,
      2,
      4,
      3
    ],
    "ability": null,
    "quote": "The calculation was emotionally correct.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/math-lady.webp"
  },
  {
    "id": "surprised-rat",
    "name": "Surprised Rat",
    "short": "Surprised Rat",
    "element": "storm",
    "values": [
      3,
      3,
      4,
      5,
      3,
      6
    ],
    "ability": null,
    "quote": "I was told this cable was harmless.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/surprised-rat.webp"
  },
  {
    "id": "plot-twist",
    "name": "Plot Twist",
    "short": "Plot Twist",
    "element": "storm",
    "values": [
      5,
      3,
      5,
      3,
      4,
      4
    ],
    "ability": null,
    "quote": "Nobody expects the emergency fish.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/plot-twist.webp"
  },
  {
    "id": "big-brain-time",
    "name": "Big Brain Time",
    "short": "Big Brain Time",
    "element": "storm",
    "values": [
      4,
      4,
      2,
      5,
      5,
      4
    ],
    "ability": null,
    "quote": "The thought process needs more cooling.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/big-brain-time.webp"
  },
  {
    "id": "rickroll",
    "name": "Rickroll",
    "short": "Rickroll",
    "element": "storm",
    "values": [
      3,
      5,
      4,
      4,
      6,
      2
    ],
    "ability": null,
    "quote": "You knew this move was coming.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/rickroll.webp"
  },
  {
    "id": "uno-reverse",
    "name": "Uno Reverse",
    "short": "Uno Reverse",
    "element": "storm",
    "values": [
      6,
      3,
      3,
      4,
      3,
      5
    ],
    "ability": null,
    "quote": "An excellent point. Back to you.",
    "artAtlas": true,
    "artDirectory": "elements-v53",
    "image": "/game/assets/cards/elements-v53/uno-reverse.webp"
  }
].map((c) => Object.freeze({ ...c, ruleId: c.id, values: Object.freeze(c.values) })));

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
  ...ALPHA_ADDITIONS,
  ...ELEMENT_CARDS
].map((c) => Object.freeze({ ...c, ruleId: c.id, ability: null, artOffsetY: c.artOffsetY ?? 0, values: Object.freeze(c.values), image: c.image ?? `/game/assets/cards/memes-v27/${c.id}-common.webp` })));

// public/game/platform/edition36.mjs
var ALPHA_IDS = ALPHA_IDS131;
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

// public/game/platform/collection-quests129.mjs
var COLLECTION_QUESTS129 = Object.freeze([
  { id: "collected-25", family: "collected", goal: 50, packs: 0, card: null, portrait: "collector-gold", title: "meme-collector", portraitName: "Golden Collector", titleName: "Meme Collector", image: "/game/assets/cards/rarity-v16/doge-epic.webp" },
  { id: "collected-50", family: "collected", goal: 75, packs: 0, card: null, portrait: "collector-diamond", title: "gallery-curator", portraitName: "Diamond Curator", titleName: "Gallery Curator", image: "/game/assets/cards/memes-v48/galaxy-brain-legendary.webp" },
  { id: "collected-95", family: "collected", goal: 120, packs: 0, card: null, portrait: "collector-void", title: "archive-overlord", portraitName: "Void Archivist", titleName: "Archive Overlord", image: "/game/assets/cards/rarity-v16/pepe-mythic.webp" }
].map((q) => Object.freeze(q)));

// public/game/platform/quests95.mjs
var RECRUITER_VARIANTS95 = Object.freeze([
  Object.freeze({ id: "doge:legendary:fire:recruiter", definitionId: "doge", element: "fire", rarity: "legendary", edition: "recruiter", image: "/game/assets/cards/recruiter-v95/doge-diamond.webp", artOffsetY: 0, artRegion: null }),
  Object.freeze({ id: "pepe:mythic:storm:recruiter", definitionId: "pepe", element: "storm", rarity: "mythic", edition: "recruiter", image: "/game/assets/cards/recruiter-v95/pepe-void.webp", artOffsetY: 0, artRegion: null })
]);
var QUESTS95 = Object.freeze([
  ...[[5, 1], [25, 1], [100, 3], [250, 5]].map(([goal, packs]) => ({ id: `played-${goal}`, family: "played", goal, packs, card: null })),
  ...[[3, 1], [10, 1], [50, 3], [100, 5]].map(([goal, packs]) => ({ id: `won-${goal}`, family: "won", goal, packs, card: null })),
  ...[[1, 1, null], [3, 2, null], [5, 2, RECRUITER_VARIANTS95[0].id], [15, 5, RECRUITER_VARIANTS95[1].id]].map(([goal, packs, card]) => ({ id: `referrals-${goal}`, family: "referrals", goal, packs, card })),
  ...COLLECTION_QUESTS129
].map(Object.freeze));
var REFERRAL_RULES95 = Object.freeze({ rounds: 10, opponents: 2, days: 3 });

// public/game/platform/catalog.mjs
var DECK_SIZE = 15;
var MAX_MOTIF_COPIES = 1;
var CATALOG_VERSION = 11;
var RARITIES = Object.freeze(Object.entries(CARD_MATERIALS).map(([id, m]) => Object.freeze({ id, name: m.name, color: m.color })));
var DEFINITIONS = Object.freeze([
  { id: "pepe", name: "Pepe", short: "Pepe", ruleId: "oracle", element: "storm", values: [7, 6, 3, 2, 3, 3], ability: "guard", quote: "Feels good, man.", image: "/game/assets/cards/v03/overthinker-thinking-pepe.webp" },
  { id: "doge", name: "Doge", short: "Doge", ruleId: "brain", element: "fire", values: [5, 2, 5, 2, 5, 5], ability: "hype", quote: "Such strategy. Much wow.", image: "/game/assets/cards/frame-v21/swollen-doge.webp" },
  { id: "roll-safe", name: "Roll Safe", short: "Roll Safe", ruleId: "trust", element: "stone", values: [5, 5, 5, 3, 3, 3], ability: "twist", quote: "Can\u2019t lose if you think ahead.", image: "/game/assets/cards/v04/roll-safe.webp" },
  ...EXPANSION_CARDS,
  ...PRIME_CARDS
].map((c) => Object.freeze({ ...c, category: cardCategory131(c.id), prime: "prime" in c ? Boolean(c.prime) : false, element: normalizeElement2(c.element), edition: ALPHA_IDS.includes(c.id) ? "alpha" : null })));
assertSetCatalog131(DEFINITIONS);
var STARTER_IDS = Object.freeze(["pepe", "doge", "roll-safe", "harold", "disaster-girl", "confused", "side-eye", "success-kid", "grumpy-cat", "aliens-guy", "smudge", "bad-luck-brian", "gigachad", "stonks", "trollface"]);
var UNSORTED_VARIANTS = DEFINITIONS.flatMap((card) => ELEMENT_IDS2.flatMap((element) => RARITIES.map((rarity) => Object.freeze({
  id: `${card.id}:${rarity.id}${element === card.element ? "" : ":" + element}`,
  definitionId: card.id,
  element,
  rarity: rarity.id,
  edition: card.edition,
  image: card.prime ? `/game/assets/cards/primes-v126/${card.id}-${rarity.id}.webp` : card.artAtlas ? card.image + "?finish=" + rarity.id : rarity.id === "common" ? card.image : EXPANSION_CARDS.some((c) => c.id === card.id) ? `/game/assets/cards/${card.artDirectory ?? "memes-v27"}/${card.id}-${rarity.id}.webp` : `/game/assets/cards/rarity-v16/${card.id}-${rarity.id}.webp`,
  artOffsetY: card.artOffsetY ?? 0,
  artRegion: card.artRegion ?? (card.artAtlas ? Object.freeze({ x: RARITIES.findIndex((r) => r.id === rarity.id) / 5, ...ATLAS_REGIONS[card.id] }) : null)
}))));
var definitionOrder = new Map(DEFINITIONS.map((c, i) => [c.id, i]));
var nativeElement = new Map(DEFINITIONS.map((c) => [c.id, c.element]));
var rarityOrder = new Map(RARITIES.map((r, i) => [r.id, i]));
var VARIANTS = Object.freeze([...UNSORTED_VARIANTS.filter((v) => v.element === nativeElement.get(v.definitionId)), ...RECRUITER_VARIANTS95].sort((a, b) => rarityOrder.get(a.rarity) - rarityOrder.get(b.rarity) || Number(a.element !== nativeElement.get(a.definitionId)) - Number(b.element !== nativeElement.get(b.definitionId)) || definitionOrder.get(a.definitionId) - definitionOrder.get(b.definitionId) || ELEMENT_IDS2.indexOf(a.element) - ELEMENT_IDS2.indexOf(b.element)));
var VARIANT_INDEX = new Map([...UNSORTED_VARIANTS, ...RECRUITER_VARIANTS95].map((v) => [v.id, v]));
var ACTIVE_IDS116 = new Set(VARIANTS.map((v) => v.id));
function getVariant(id) {
  return VARIANT_INDEX.get(id);
}
function starterDeck() {
  return STARTER_IDS.map((id) => `${id}:common`);
}
var MAX_PRIMES = 1;
function countPrimes(cards) {
  return cards.filter((id) => DEFINITIONS.find((c) => c.id === getVariant(id)?.definitionId)?.prime).length;
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
  if (countPrimes(cards) > MAX_PRIMES) errors.push("Maximum 1 Prime per deck, across all finishes.");
  for (const [id, count] of Object.entries(countMotifs(cards))) if (count > MAX_MOTIF_COPIES) errors.push(`${DEFINITIONS.find((c) => c.id === id).name}: maximum ${MAX_MOTIF_COPIES} copies per motif, across all finishes.`);
  for (const [id, count] of Object.entries(countCards(cards))) {
    if (!getVariant(id)) errors.push("This deck contains an unknown card.");
    else if (!ACTIVE_IDS116.has(id)) errors.push("This element variant has retired. Reload to use the original card.");
    else if (!Number.isInteger(inventory[id]) || inventory[id] < count) errors.push(`Not enough copies of ${DEFINITIONS.find((c) => c.id === getVariant(id).definitionId).name} (${getVariant(id).rarity}).`);
  }
  return { valid: errors.length === 0, errors };
}
function expandGameDeck(cards, side) {
  return cards.map((variantId, i) => {
    const v = getVariant(variantId);
    if (!v) throw Error("Unknown card variant");
    const c = DEFINITIONS.find((c2) => c2.id === v.definitionId);
    return { id: c.ruleId, uid: `portal-${side}-${i}`, origin: side, rarity: v.rarity, element: v.element, variantId };
  });
}

// public/game/src/rules.mjs
var ELEMENTS3 = { ...ELEMENTS, stone: ELEMENTS.earth };
var DIRECTIONS = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
var CATALOG = Object.freeze(DEFINITIONS.map((c) => Object.freeze({ ...c, id: c.ruleId, face: { pepe: "hood", doge: "cat", "roll-safe": "frog" }[c.id] ?? "robot" })));
var CELLS = [];
for (let r = -2; r <= 2; r++) for (let q = -2; q <= 2; q++) if (Math.abs(q + r) <= 2) CELLS.push({ id: q + "," + r, q, r });
var CARD_INDEX = new Map(CATALOG.map((c) => [c.id, Object.freeze({ ...c, element: normalizeElement(c.element) })]));
var cellSet = new Set(CELLS.map((c) => c.id));
function neighbors(id) {
  const c = CELLS.find((c2) => c2.id === id);
  return c ? DIRECTIONS.map(([q, r], dir) => ({ id: c.q + q + "," + (c.r + r), dir })).filter((n) => cellSet.has(n.id)) : [];
}
var freeCells = (g) => CELLS.filter((c) => c.id !== g.block && !g.board[c.id]).map((c) => c.id);
var scores = (g) => [0, 1].map((p) => Object.values(g.board).filter((c) => c.controller === p).length);
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

// public/game/src/rules.mjs?v=tie-break-63
var VERSION = 1;
var ELEMENTS4 = { ...ELEMENTS, stone: ELEMENTS.earth };
var DIRECTIONS2 = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
var CATALOG2 = Object.freeze(DEFINITIONS.map((c) => Object.freeze({ ...c, id: c.ruleId, face: { pepe: "hood", doge: "cat", "roll-safe": "frog" }[c.id] ?? "robot" })));
var CELLS2 = [];
for (let r = -2; r <= 2; r++) for (let q = -2; q <= 2; q++) if (Math.abs(q + r) <= 2) CELLS2.push({ id: q + "," + r, q, r });
var LAYOUTS = [{ id: "core", name: "Kernbruch", block: "0,0" }, { id: "east", name: "Ostpass", block: "1,0" }, { id: "west", name: "Westpass", block: "-1,0" }];
var CARD_INDEX2 = new Map(CATALOG2.map((c) => [c.id, Object.freeze({ ...c, element: normalizeElement(c.element) })]));
var ELEMENT_CARD_INDEX = /* @__PURE__ */ new Map();
function cardOf(card) {
  const base = CARD_INDEX2.get(card.id);
  if (!base) return void 0;
  const variant = card.variantId ? getVariant(card.variantId) : null;
  if (card.variantId && (!variant || DEFINITIONS.find((c) => c.id === variant.definitionId)?.ruleId !== card.id)) return void 0;
  const element = variant?.element ?? normalizeElement(card.element ?? base.element);
  if (!Object.hasOwn(ELEMENTS, element)) return void 0;
  if (element === base.element) return base;
  const key = base.id + ":" + element;
  if (!ELEMENT_CARD_INDEX.has(key)) ELEMENT_CARD_INDEX.set(key, Object.freeze({ ...base, element }));
  return ELEMENT_CARD_INDEX.get(key);
}
var cellSet2 = new Set(CELLS2.map((c) => c.id));
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
  let primeCount = 0;
  const rng = random(seed), pool = shuffle([...DEFINITIONS.filter((c) => c.edition === "alpha")], rng).filter((c) => !c.prime || primeCount++ < 1).slice(0, 9), players = [0, 1].map((p) => {
    const cards = shuffle(pool.map((c) => ({ id: c.ruleId, variantId: `${c.id}:common`, rarity: "common", uid: p + ":" + c.id, origin: p })), rng);
    return { hand: cards.slice(0, 5), deck: cards.slice(5), shifts: 1, flips: 0 };
  });
  return { version: VERSION, elementRules: 5, seed, layout, starter, turn: starter, placements: 0, board: {}, block: LAYOUTS.find((l) => l.id === layout).block, players, events: [{ cell: "-1,1", element: "storm" }, { cell: "1,-1", element: "water" }], history: [], last: null, winner: null, finished: false };
}
function neighbors2(id) {
  const c = CELLS2.find((c2) => c2.id === id);
  return c ? DIRECTIONS2.map(([q, r], dir) => ({ id: c.q + q + "," + (c.r + r), dir })).filter((n) => cellSet2.has(n.id)) : [];
}
var freeCells2 = (g) => CELLS2.filter((c) => c.id !== g.block && !g.board[c.id]).map((c) => c.id);
var scores2 = (g) => [0, 1].map((p) => Object.values(g.board).filter((c) => c.controller === p).length);
var eventPhase = (g) => g.placements >= 12 ? 2 : g.placements >= 6 ? 1 : 0;
function fieldAt(g, cell) {
  if (g.eventFieldsEnabled === false) return null;
  const f = g.events.find((f2) => f2.cell === cell);
  if (!f) return null;
  const phase = eventPhase(g);
  return { element: phase === 2 ? { storm: "water", water: "storm" }[f.element] : f.element, bonus: phase === 1 ? 2 : 1 };
}
function sideValue(card, dir, rotation = card.rotation ?? 0) {
  return cardOf(card).values[((dir - rotation) % 6 + 6) % 6];
}
function strength(g, card, cell, dir, opponent) {
  const base = sideValue(card, dir), field = fieldAt(g, cell), fieldBonus = field?.element === cardOf(card).element ? field.bonus : 0, advantage = elementAdvantage(cardOf(card).element, cardOf(opponent).element, g.elementRules ?? 3) ? 1 : 0;
  return { base, field: fieldBonus, element: advantage, ...rankedStrength126(base, fieldBonus + ((g.elementRules ?? 3) === 3 ? advantage : 0)) };
}
function preview(g, { uid, cell, rotation = 0 }) {
  if (g.finished) throw Error("Die Runde ist beendet.");
  const card = g.players[g.turn].hand.find((c) => c.uid === uid);
  if (!card || !cellSet2.has(cell) || cell === g.block || g.board[cell] || !Number.isInteger(rotation) || rotation < 0 || rotation > 5) throw Error("Diese Platzierung ist nicht m\xF6glich.");
  const incoming = { ...card, rotation, controller: g.turn, flips: 0 };
  const comparisons = neighbors2(cell).filter((n) => g.board[n.id] && g.board[n.id].controller !== g.turn).map((n) => {
    const other = g.board[n.id], attack = strength(g, incoming, cell, n.dir, other), defend = strength(g, other, n.id, (n.dir + 3) % 6, incoming);
    return { cell: n.id, attack, defend, flip: attackWins(attack, defend, g.elementRules ?? 3), name: cardOf(other).name };
  });
  return { card: incoming, cell, comparisons, flips: comparisons.filter((c) => c.flip).map((c) => c.cell) };
}

// public/game/src/table-demo-rules.mjs?v=tie-break-63
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
var TACTIC_BEATS = Object.freeze(Object.fromEntries(ELEMENT_IDS.map((id) => [id, ELEMENTS[id].beats])));
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
  if (game.eventFieldsEnabled === false) return [];
  if (game.demoFields) return game.demoFields;
  const phase = eventPhase(game);
  return FIELD_PHASES[phase].map((template, index) => {
    const field = { ...template, cell: game.eventCells?.[index] ?? template.cell };
    if (field.type === "resonance") field.element = (game.elementRules === 5 ? ELEMENT_IDS : ["storm", "fire", "earth"])[(phase + (game.resonanceOffset ?? 0)) % (game.elementRules === 5 ? 5 : 3)];
    if (field.directions) field.directions = field.directions.map((d) => (d + (game.crossfireOffset ?? 0)) % 6);
    return field;
  });
}
function eventFieldAt(game, cell) {
  return cell === game.block ? null : eventFields(game).find((f) => f.cell === cell) ?? null;
}
function nextEvent(game) {
  if (game.eventFieldsEnabled === false) return null;
  const phase = eventPhase(game);
  return phase < 2 ? { remaining: [6, 12][phase] - game.placements, fields: eventFields({ ...game, placements: [6, 12][phase] }) } : null;
}
function fieldText(f) {
  if (!f) return "Normales Feld";
  return FIELD_TYPES[f.type].name + (f.type === "resonance" ? " \xB7 " + ELEMENTS4[f.element].name + " +1" : f.type === "crossfire" ? " \xB7 " + f.directions.map((d) => DIRECTION_NAMES[d]).join("/") + " +1" : " \xB7 F\xE4higkeiten aus");
}
function abilityAt(game, card, cell) {
  return card.ability && eventFieldAt(game, cell)?.type !== "silence" ? card.ability : null;
}
function guardActive(game, card, cell) {
  return abilityAt(game, card, cell) === "guard" && card.guardOwner === card.controller && game.placements < card.guardUntil;
}
function twistTargets(game, cell) {
  return neighbors2(cell).filter((n) => game.board[n.id] && game.board[n.id].controller !== game.turn).map((n) => n.id);
}
function effectStrength(game, card, cell, dir, opponent, { attacking = false, abilityDirection = null } = {}) {
  const f = eventFieldAt(game, cell), base = sideValue(card, dir), field = f?.type === "resonance" && f.element === cardOf(card).element ? 1 : f?.type === "crossfire" && f.directions.includes(dir) ? 1 : 0;
  const element = elementAdvantage(cardOf(card).element, cardOf(opponent).element, game.elementRules ?? 3) ? 1 : 0;
  const ability = attacking ? abilityAt(game, card, cell) === "hype" && dir === abilityDirection ? 1 : 0 : guardActive(game, card, cell) && dir === card.guardDirection ? GUARD_BONUS : 0;
  return { base, field, element, ability, ...rankedStrength126(base, field + ability + ((game.elementRules ?? 3) === 3 ? element : 0)) };
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
  const comparisons = neighbors2(cell).filter((n) => working.board[n.id] && working.board[n.id].controller !== game.turn).map((n) => {
    const other = working.board[n.id], attack = effectStrength(working, card, cell, n.dir, other, { attacking: true, abilityDirection }), defend = effectStrength(working, other, n.id, (n.dir + 3) % 6, card);
    return { cell: n.id, dir: n.dir, attack, defend, setup: n.id === twistCell, flip: n.id !== twistCell && attackWins(attack, defend, game.elementRules ?? 3), name: cardOf(other).name };
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
  next.last = { type: "place", side, cell: action.cell, uid: action.uid, name: cardOf(p.card).name, flips: p.flips, transforms: p.transforms, ability: p.ability, suppressed: p.suppressed, event: game.eventFieldsEnabled === false ? null : eventPhase(next) !== eventPhase(game) ? eventPhase(next) : null };
  next.history.push(next.last);
  if (freeCells2(next).length === 0) {
    next.finished = true;
    const s = scores2(next);
    next.winner = s[0] === s[1] ? null : s[0] > s[1] ? 0 : 1;
  } else next.turn = 1 - side;
  return next;
}
function actionOptions(game, card, cell, rotation) {
  const ability = abilityAt(game, card, cell), directions = ["hype", "guard"].includes(ability) ? [0, 1, 2, 3, 4, 5] : [0], targets = ability === "twist" ? [null, ...twistTargets(game, cell)] : [null];
  return directions.flatMap((abilityDirection) => targets.map((twistCell) => ({ uid: card.uid, cell, rotation, abilityDirection, twistCell })));
}

// public/game/src/tactics-ai.mjs?v=tie-break-63
var ARCHETYPES = [...new Map(DEFINITIONS.map((c) => [c.values.join(","), c.ruleId])).values()];

// public/game/src/table-demo-state.mjs
var DEMO_PROFILES = Object.fromEntries(DEFINITIONS.map((c) => [c.ruleId, c.id]));
function createTacticsMatch({ loadouts = ["hype-guard", "hype-twist"], seed = 20261117, starter = 0, swap = false, disableRole = null, eventFieldsEnabled = false } = {}) {
  if (loadouts.length !== 2 || loadouts.some((id) => !Object.hasOwn(LOADOUTS, id))) throw Error("Ung\xFCltige Deckauswahl.");
  const game = newGame({ seed, starter });
  game.eventFieldsEnabled = eventFieldsEnabled;
  Object.assign(game, createTacticsLayout(seed));
  game.events = [];
  game.resonanceOffset = (seed % 5 + 5) % 5;
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

// public/game/platform/ai-pool107.mjs
var AI_DEFINITIONS107 = Object.freeze(DEFINITIONS.filter((c) => c.edition === "alpha"));
var ids = new Set(AI_DEFINITIONS107.map((c) => c.id));
var AI_VARIANTS107 = Object.freeze(VARIANTS.filter((v) => v.edition === "alpha" && ids.has(v.definitionId)));

// public/game/platform/solo84.mjs
var SOLO_LEVELS84 = Object.freeze([
  { id: "easy", name: "Easy", description: "Focuses on immediate captures." },
  { id: "standard", name: "Standard", description: "Balances captures and board position." },
  { id: "tactical", name: "Tactical", description: "Also checks possible counterattacks." }
]);
var SOLO_OPPONENTS84 = Object.freeze([
  { id: "balanced", name: "Mixed elements", description: "A varied deck across all five elements." },
  { id: "pressure", name: "Pressure deck", description: "More exposed high-value attacking sides." },
  { id: "mirror", name: "Mirror my deck", description: "The AI uses the same 15 cards as you." }
]);

// public/game/platform/deck-bridge.mjs
function applyPortalDecks(game, cards, loadouts, { round = 1, opponentCards = null } = {}) {
  if (!Number.isSafeInteger(round) || round < 1) throw Error("Invalid round.");
  const next = structuredClone(game);
  next.players = next.players.map((p, side) => {
    let state = next.seed * 53 + side * 8017 + 111 >>> 0;
    const random2 = () => {
      state = Math.imul(state, 1664525) + 1013904223 >>> 0;
      return state / 4294967296;
    };
    const deck = expandGameDeck(side === 0 ? cards : opponentCards ?? starterDeck(), side);
    for (const ability of loadouts[side].abilities) {
      const candidates = deck.filter((c) => ({ oracle: "guard", brain: "hype", trust: "twist" })[c.id] === ability);
      if (candidates.length) candidates[Math.floor(random2() * candidates.length)].ability = ability;
    }
    if (round > 1) state = (state ^ Math.imul(round - 1, 2654435769)) >>> 0;
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
var TACTIC_BEATS2 = Object.freeze(Object.fromEntries(ELEMENT_IDS.map((id) => [id, ELEMENTS[id].beats])));
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
  if (game.eventFieldsEnabled === false) return [];
  if (game.demoFields) return game.demoFields;
  const phase = eventPhase(game);
  return FIELD_PHASES2[phase].map((template, index) => {
    const field = { ...template, cell: game.eventCells?.[index] ?? template.cell };
    if (field.type === "resonance") field.element = (game.elementRules === 5 ? ELEMENT_IDS : ["storm", "fire", "earth"])[(phase + (game.resonanceOffset ?? 0)) % (game.elementRules === 5 ? 5 : 3)];
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
  return neighbors2(cell).filter((n) => game.board[n.id] && game.board[n.id].controller !== game.turn).map((n) => n.id);
}
function effectStrength2(game, card, cell, dir, opponent, { attacking = false, abilityDirection = null } = {}) {
  const f = eventFieldAt2(game, cell), base = sideValue(card, dir), field = f?.type === "resonance" && f.element === cardOf(card).element ? 1 : f?.type === "crossfire" && f.directions.includes(dir) ? 1 : 0;
  const element = elementAdvantage(cardOf(card).element, cardOf(opponent).element, game.elementRules ?? 3) ? 1 : 0;
  const ability = attacking ? abilityAt2(game, card, cell) === "hype" && dir === abilityDirection ? 1 : 0 : guardActive2(game, card, cell) && dir === card.guardDirection ? GUARD_BONUS2 : 0;
  return { base, field, element, ability, ...rankedStrength126(base, field + ability + ((game.elementRules ?? 3) === 3 ? element : 0)) };
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
  const comparisons = neighbors2(cell).filter((n) => working.board[n.id] && working.board[n.id].controller !== game.turn).map((n) => {
    const other = working.board[n.id], attack = effectStrength2(working, card, cell, n.dir, other, { attacking: true, abilityDirection }), defend = effectStrength2(working, other, n.id, (n.dir + 3) % 6, card);
    return { cell: n.id, dir: n.dir, attack, defend, setup: n.id === twistCell, flip: n.id !== twistCell && attackWins(attack, defend, game.elementRules ?? 3), name: cardOf(other).name };
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
  next.last = { type: "place", side, cell: action.cell, uid: action.uid, name: cardOf(p.card).name, flips: p.flips, transforms: p.transforms, ability: p.ability, suppressed: p.suppressed, event: game.eventFieldsEnabled === false ? null : eventPhase(next) !== eventPhase(game) ? eventPhase(next) : null };
  next.history.push(next.last);
  if (freeCells2(next).length === 0) {
    next.finished = true;
    const s = scores2(next);
    next.winner = s[0] === s[1] ? null : s[0] > s[1] ? 0 : 1;
  } else next.turn = 1 - side;
  return next;
}

// public/game/src/tactics-ai.mjs
var ARCHETYPES2 = [...new Map(DEFINITIONS.map((c) => [c.values.join(","), c.ruleId])).values()];
function legalCandidates(game, rules = table_demo_rules_exports) {
  const result = [];
  for (const card of game.players[game.turn].hand) for (const cell of freeCells2(game)) for (const rotation of game.rotationLocked ? [0] : [0, 1, 2, 3, 4, 5]) {
    const around = neighbors2(cell), ability = rules.abilityAt(game, card, cell), relevant = ability === "hype" ? around.filter((n) => game.board[n.id] && game.board[n.id].controller !== game.turn).map((n) => n.dir) : ability === "guard" && rules.GUARD_ARC === 6 ? [0] : ability === "guard" ? around.filter((n) => n.id !== game.block && !game.board[n.id]).map((n) => n.dir) : [0], directions = relevant.length ? relevant : [0];
    for (const action of rules.actionOptions(game, card, cell, rotation)) if (directions.includes(action.abilityDirection)) {
      const plan = rules.previewEffect(game, action);
      result.push({ action, plan });
    }
  }
  return result;
}
function positionalValue(game, { action, plan }, rules = table_demo_rules_exports) {
  let safety = 0, contacts = 0;
  for (const n of neighbors2(action.cell)) {
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
    for (const n of neighbors2(t.cell)) if (!game.board[n.id] && n.id !== game.block) twistSafety += (sideValue(before, n.dir) - sideValue(after, n.dir)) * 0.18;
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
  for (const cell of freeCells2(future)) {
    const enemies = neighbors2(cell).filter((n) => board[n.id]?.controller === game.turn);
    if (!enemies.length) continue;
    for (const id of ARCHETYPES2) for (const element of game.elementRules === 5 ? ELEMENT_IDS : [void 0]) for (const rotation of game.rotationLocked ? [0] : [0, 1, 2, 3, 4, 5]) {
      const card = { id, element, rotation, controller: future.turn };
      let flips = 0;
      for (const n of enemies) {
        const other = board[n.id], a = rules.effectStrength(future, card, cell, n.dir, other, { attacking: true }), d = rules.effectStrength(future, other, n.id, (n.dir + 3) % 6, card);
        if (attackWins(a, d, future.elementRules ?? 3)) flips++;
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

// public/game/src/table-demo-rules.mjs?v=random-layout-1
var TACTIC_BEATS3 = Object.freeze(Object.fromEntries(ELEMENT_IDS.map((id) => [id, ELEMENTS[id].beats])));
var GUARD_BONUS3 = 2;
var FIELD_PHASES3 = [
  [{ cell: "-1,0", type: "resonance", element: "storm" }, { cell: "0,1", type: "crossfire", directions: [0, 3] }],
  [{ cell: "-1,0", type: "silence" }, { cell: "0,1", type: "resonance", element: "fire" }],
  [{ cell: "-1,0", type: "resonance", element: "stone" }, { cell: "0,1", type: "crossfire", directions: [1, 4] }]
];
function eventFields3(game) {
  if (game.eventFieldsEnabled === false) return [];
  if (game.demoFields) return game.demoFields;
  const phase = eventPhase(game);
  return FIELD_PHASES3[phase].map((template, index) => {
    const field = { ...template, cell: game.eventCells?.[index] ?? template.cell };
    if (field.type === "resonance") field.element = (game.elementRules === 5 ? ELEMENT_IDS : ["storm", "fire", "earth"])[(phase + (game.resonanceOffset ?? 0)) % (game.elementRules === 5 ? 5 : 3)];
    if (field.directions) field.directions = field.directions.map((d) => (d + (game.crossfireOffset ?? 0)) % 6);
    return field;
  });
}
function eventFieldAt3(game, cell) {
  return cell === game.block ? null : eventFields3(game).find((f) => f.cell === cell) ?? null;
}
function abilityAt3(game, card, cell) {
  return card.ability && eventFieldAt3(game, cell)?.type !== "silence" ? card.ability : null;
}
function guardActive3(game, card, cell) {
  return abilityAt3(game, card, cell) === "guard" && card.guardOwner === card.controller && game.placements < card.guardUntil;
}
function twistTargets3(game, cell) {
  return neighbors2(cell).filter((n) => game.board[n.id] && game.board[n.id].controller !== game.turn).map((n) => n.id);
}
function effectStrength3(game, card, cell, dir, opponent, { attacking = false, abilityDirection = null } = {}) {
  const f = eventFieldAt3(game, cell), base = sideValue(card, dir), field = f?.type === "resonance" && f.element === cardOf(card).element ? 1 : f?.type === "crossfire" && f.directions.includes(dir) ? 1 : 0;
  const element = elementAdvantage(cardOf(card).element, cardOf(opponent).element, game.elementRules ?? 3) ? 1 : 0;
  const ability = attacking ? abilityAt3(game, card, cell) === "hype" && dir === abilityDirection ? 1 : 0 : guardActive3(game, card, cell) && dir === card.guardDirection ? GUARD_BONUS3 : 0;
  return { base, field, element, ability, ...rankedStrength126(base, field + ability + ((game.elementRules ?? 3) === 3 ? element : 0)) };
}
function previewEffect3(game, action) {
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
  const card = { ...working.players[game.turn].hand.find((c) => c.uid === uid), rotation, controller: game.turn, flips: 0 }, ability = abilityAt3(working, card, cell), transforms = [];
  if (twistCell !== null) {
    if (ability !== "twist" || !twistTargets3(working, cell).includes(twistCell)) throw Error("Kein g\xFCltiges Drehziel.");
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
  const comparisons = neighbors2(cell).filter((n) => working.board[n.id] && working.board[n.id].controller !== game.turn).map((n) => {
    const other = working.board[n.id], attack = effectStrength3(working, card, cell, n.dir, other, { attacking: true, abilityDirection }), defend = effectStrength3(working, other, n.id, (n.dir + 3) % 6, card);
    return { cell: n.id, dir: n.dir, attack, defend, setup: n.id === twistCell, flip: n.id !== twistCell && attackWins(attack, defend, game.elementRules ?? 3), name: cardOf(other).name };
  });
  return { card, cell, ability, abilityDirection, suppressed: Boolean(card.ability && !ability), transforms, comparisons, flips: comparisons.filter((c) => c.flip).map((c) => c.cell), board: working.board };
}

// public/game/src/turn-clock.mjs
function timeoutAction(game) {
  if (game.finished) return null;
  for (const card of game.players[game.turn].hand) for (const cell of freeCells(game)) {
    const action = { uid: card.uid, cell, rotation: 0, abilityDirection: 0, twistCell: null };
    try {
      previewEffect3(game, action);
      return action;
    } catch {
    }
  }
  return null;
}

// server/game/balance-version94.mjs
var BALANCE_PATCH94 = "alpha-2026-11-23.2";
var BALANCE_RULES94 = Object.freeze({
  patch: BALANCE_PATCH94,
  revision: 2,
  catalog: CATALOG_VERSION,
  elements: ELEMENT_LIST2.map((e) => ({ id: e.id, beats: e.beats })),
  nativeElementsOnly: true,
  eventFieldsEnabled: false,
  afkAfter: 2,
  afkTurnMs: 3e3,
  automaticNextRound: true,
  elementTiesOnly: true,
  rotationLocked: true,
  turnMs: 9e4,
  handSize: 5,
  deckSize: 15,
  maxMotifCopies: 1,
  maxPrimes: 1,
  sRankElementOnly: true,
  abilities: { hype: 1, guard: 2, guardPlacements: 2, twistDegrees: 60 },
  cards: DEFINITIONS.map((c) => ({ id: c.id, element: c.element, values: c.values, ability: c.ability ?? null, prime: Boolean(c.prime) }))
});
var source = JSON.stringify(BALANCE_RULES94);
var hash = 0xcbf29ce484222325n;
for (const c of source) {
  hash ^= BigInt(c.charCodeAt(0));
  hash = BigInt.asUintN(64, hash * 0x100000001b3n);
}
var BALANCE_FINGERPRINT94 = hash.toString(16).padStart(16, "0");
var balanceVersion94 = (now = Date.now()) => ({ patch: BALANCE_PATCH94, fingerprint: BALANCE_FINGERPRINT94, rules: BALANCE_RULES94, roundStartedAt: now });

// server/game/engine50.mjs
var RULESET = "account-50";
function createAccountDuel({ deck, inventory, seed, starter, loadouts = ["hype-guard", "hype-twist"] }) {
  if (!deck || !validateDeck(deck.cards, inventory).valid) throw Error("Saved deck is not playable.");
  if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295 || ![0, 1].includes(starter) || !Array.isArray(loadouts) || loadouts.length !== 2 || loadouts.some((l) => !Object.hasOwn(LOADOUTS2, l))) throw Error("Invalid duel settings.");
  const state = { ruleset: RULESET, balance: balanceVersion94(), elementRules: 5, deck: { id: deck.id, name: deck.name, cards: [...deck.cards] }, seed, starter, loadouts: [...loadouts], round: 1, results: [], awards: [], game: null };
  state.game = roundGame(state);
  return state;
}
function roundGame(state) {
  const starter = seriesStarter113(state.starter, state.round);
  let game = createTacticsMatch({ seed: state.seed, starter, loadouts: state.loadouts });
  game = applyPortalDecks(game, state.deck.cards, state.loadouts.map((id) => LOADOUTS2[id]), { round: state.round });
  game.elementRules = state.elementRules ?? state.game?.elementRules ?? 3;
  game.resonanceOffset = (state.seed % (game.elementRules === 5 ? 5 : 3) + (game.elementRules === 5 ? 5 : 3)) % (game.elementRules === 5 ? 5 : 3);
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
  if (next.balance && next.balance.fingerprint !== BALANCE_FINGERPRINT94) {
    next.balance.mixed = true;
    next.balance.current = balanceVersion94();
  }
  if (input.kind === "next") {
    if (!next.game.finished || series113(next.results).finished) throw Error("Finish this round before continuing, or start a new duel after two round wins.");
    next.round++;
    if (next.balance) next.balance.roundStartedAt = Date.now();
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
    const text = await res.text(), data = text ? JSON.parse(text) : null;
    if (!res.ok) throw Object.assign(Error(data?.message || "Game storage unavailable."), { status: data?.code === "40001" ? 409 : res.status >= 500 ? 503 : 400 });
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
        const decks = (await rest("dv_decks?user_id=eq." + uid + "&select=id,name,cards,active,format&order=created_at.asc")).filter((d) => d.format !== "friendly");
        return reply({ decks, wallet: await wallet() });
      }
      if (input.op === "start") {
        if (!uuid(input.id) || input.deckId != null && !uuid(input.deckId)) throw Error("Invalid duel request.");
        const existing = await rest("dv_game_sessions50?id=eq." + input.id + "&user_id=eq." + uid + "&active=eq.true&select=id,state,version");
        if (existing[0]) return reply({ ...existing[0], steps: [], award: 0, wallet: await wallet() });
        const decks = (await rest("dv_decks?user_id=eq." + uid + "&select=id,name,cards,active,format&order=created_at.asc")).filter((d) => d.format !== "friendly"), deck = input.deckId ? decks.find((d) => d.id === input.deckId) : decks.find((d) => d.active) ?? decks[0];
        if (!Array.isArray(deck?.cards) || deck.cards.length !== DECK_SIZE || deck.cards.some((id) => !getVariant(id))) throw Error("Saved deck is not playable.");
        const params = new URLSearchParams({ user_id: "eq." + uid, select: "variant_id,quantity", variant_id: "in.(" + [...new Set(deck.cards)].join(",") + ")" });
        const rows2 = await rest("dv_inventory?" + params), inventory = Object.fromEntries(rows2.map((r) => [r.variant_id, r.quantity]));
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
