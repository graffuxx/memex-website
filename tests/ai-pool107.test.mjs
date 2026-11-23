import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFINITIONS,getVariant,countCards,validateDeck,starterDeck} from '../public/game/platform/catalog.mjs';
import {AI_VARIANTS107} from '../public/game/platform/ai-pool107.mjs';
import {CATALOG,newGame,loadGame,cardOf} from '../public/game/src/rules.mjs';
import {createBot96} from '../server/game/bot96.mjs';
import {soloOpponent84} from '../public/game/platform/solo84.mjs';

test('all AI styles use the published player pool, canonical values and 15-card/singleton/one-Prime limits',()=>{
 const allowed=new Set(AI_VARIANTS107.map(v=>v.id)),player=starterDeck();
 for(let seed=0;seed<150;seed++){
  for(const cards of [createBot96(seed).deck.cards,...['balanced','pressure','mirror'].map(style=>soloOpponent84(style,player,seed))]){
   assert.equal(validateDeck(cards,countCards(cards)).valid,true);
   for(const id of cards){assert.ok(allowed.has(id),id);const v=getVariant(id),d=DEFINITIONS.find(d=>d.id===v.definitionId);const runtime=cardOf({id:d.ruleId,variantId:id});assert.equal(runtime.name,d.name);assert.deepEqual(runtime.values,d.values);}
  }
 }
 assert.throws(()=>soloOpponent84('mirror',['not-a-real-card'],1),/legal 15-card deck/);
});
test('the rule lab no longer creates prototype-only cards; forged variants cannot change card identity',()=>{
 assert.equal(CATALOG.length,DEFINITIONS.length);
 for(const c of CATALOG)assert.ok(DEFINITIONS.some(d=>d.ruleId===c.id));
 for(let seed=0;seed<30;seed++){
  const game=newGame({seed});assert.deepEqual(loadGame(JSON.stringify(game)),game);
  for(const p of game.players)for(const c of [...p.hand,...p.deck]){assert.ok(getVariant(c.variantId));assert.ok(cardOf(c));}
 }
 for(const id of ['rage','mage','moon','reset','grass','fine'])assert.equal(cardOf({id}),undefined);
 assert.equal(cardOf({id:'oracle',variantId:'doge:common'}),undefined);
 assert.equal(cardOf({id:'oracle',variantId:'unreleased:common'}),undefined);
});
