import test from 'node:test';import assert from 'node:assert/strict';
import {DEFINITIONS,VARIANTS,starterDeck,starterInventory,validateDeck,expandGameDeck} from '../public/game/platform/catalog.mjs';
import {EXPANSION_CARDS} from '../public/game/platform/expansion27.mjs';
import {CARD_PROFILES} from '../public/game/src/card-profiles27.mjs';
import {CARD_ART} from '../public/game/src/card-art16.mjs';
import {DEMO_PROFILES,createTacticsMatch,demoAction} from '../public/game/src/table-demo-state.mjs';
import {newGame} from '../public/game/src/rules.mjs';
import {LOADOUTS,placeEffect} from '../public/game/src/table-demo-rules.mjs';
import {applyPortalDecks} from '../public/game/platform/deck-bridge.mjs';
import {testInventory,blankTestCollection,expansionTestDeck,drawTestPack} from '../public/game/platform/booster-test.mjs';
test('35 identities and 175 cosmetic variants have matching rule, portrait, short title and owner-independent profiles',()=>{
 assert.equal(DEFINITIONS.length,35);assert.equal(VARIANTS.length,175);assert.equal(EXPANSION_CARDS.length,32);
 for(const c of DEFINITIONS){assert.equal(DEMO_PROFILES[c.ruleId],c.id);assert.equal(CARD_PROFILES[c.id].ruleId,c.ruleId);assert.ok(CARD_PROFILES[c.id].name.length<=14);const art=Object.values(CARD_ART[c.id]);assert.equal(art.length,5);assert.equal(new Set(art).size,5);for(const v of VARIANTS.filter(v=>v.definitionId===c.id)){assert.equal(v.image.replace('/game/','../'),CARD_ART[c.id][v.rarity]);assert.equal(v.artOffsetY,c.artOffsetY??0);assert.equal(expandGameDeck([v.id],0)[0].id,c.ruleId);}}
 assert.equal(starterDeck().length,15);assert.equal(Object.values(starterInventory()).reduce((a,b)=>a+b,0),18);
 assert.equal(newGame().players[0].hand.length+newGame().players[0].deck.length,9);
});
test('new meme test deck stays separate from account starter inventory and all cards can be pulled',()=>{
 const inventory=testInventory(blankTestCollection()),deck=expansionTestDeck();assert.equal(deck.length,15);assert.ok(validateDeck(deck,inventory).valid);assert.equal(validateDeck(deck,starterInventory()).valid,false);
 assert.equal(new Set(deck.map(id=>id.split(':')[0])).size,15);
 for(let i=0;i<DEFINITIONS.length;i++){let n=0;const drawn=drawTestPack(()=>++n%2===1?.5:(i+.5)/DEFINITIONS.length);assert.ok(drawn.every(id=>id.startsWith(DEFINITIONS[i].id+':')));}
});
test('mixed expansion decks finish both rounds for either starting side with all five rarities and legal AI actions',()=>{
 const tiers=['common','rare','epic','legendary','mythic'],deck=expansionTestDeck().map((id,i)=>id.split(':')[0]+':'+tiers[i%5]);
 for(const starter of [0,1])for(const round of [1,2]){
  let game=applyPortalDecks(createTacticsMatch({seed:808+starter,starter}),deck,[LOADOUTS['hype-guard'],LOADOUTS['hype-twist']],{round});game.rotationLocked=true;
  const pool=[...game.players[0].hand,...game.players[0].deck];assert.equal(new Set(pool.map(c=>c.id)).size,15);
  for(let n=0;n<18&&!game.finished;n++){const action=demoAction(game);assert.ok(action);game=placeEffect(game,action);}
  assert.equal(game.finished,true);assert.equal(game.placements,18);for(const c of Object.values(game.board))assert.ok(DEMO_PROFILES[c.id]);
 }
});
