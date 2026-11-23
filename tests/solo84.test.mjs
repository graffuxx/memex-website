import test from 'node:test';import assert from 'node:assert/strict';
import {SOLO_LEVELS84,SOLO_OPPONENTS84,soloSettings84,soloOpponent84,prepareSolo84,localSolo84} from '../public/game/platform/solo84.mjs';
import {starterDeck,starterInventory,countCards,countMotifs,validateDeck,getVariant} from '../public/game/platform/catalog.mjs';
import {fullTestDeckInventory} from '../public/game/platform/booster-test.mjs';
import {readPlayDeck,PLAY_DECK_KEY,applyPortalDecks} from '../public/game/platform/deck-bridge.mjs';
import {createTacticsMatch} from '../public/game/src/table-demo-state.mjs';
import {LOADOUTS,placeEffect,previewEffect} from '../public/game/src/table-demo-rules.mjs';
import {scores} from '../public/game/src/rules.mjs';import {soloAction84} from '../public/game/src/solo-ai84.mjs';
import {connectAccountGame} from '../client/game-account50.mjs';
test('practice snapshots validate 15 cards, survive handoff and never alter saved inventory or activate rewarded sessions',async()=>{
 const inventory=starterInventory(),before=JSON.stringify(inventory),cards=starterDeck();
 for(const mode of ['training','deck-test']){
 const payload=prepareSolo84({cards,name:'Unsaved draft',source:'account',deckId:'local-draft'},inventory,{mode,difficulty:'tactical',opponent:'mirror',timed:false});
 const data=new Map([[PLAY_DECK_KEY,JSON.stringify(payload)],['duelverse.account-game.v50.user','untouched']]);const loaded=readPlayDeck({getItem:k=>data.get(k)});
 assert.equal(localSolo84(loaded),true);assert.equal(loaded.practice.mode,mode);assert.deepEqual(loaded.cards,cards);assert.equal(loaded.source,'account');
 assert.equal(await connectAccountGame({sandbox:localSolo84(loaded)}),null);assert.equal(data.get('duelverse.account-game.v50.user'),'untouched');
 payload.cards.pop();assert.equal(cards.length,15);assert.equal(JSON.stringify(inventory),before);
 }
 assert.throws(()=>prepareSolo84({cards:cards.slice(0,14)},inventory,{mode:'training'}),/exactly 15/);assert.throws(()=>prepareSolo84({cards}, {},{mode:'training'}),/Not enough/);
 assert.equal(soloSettings84({mode:'ranked'}),null);assert.equal(localSolo84({practice:null}),false);assert.deepEqual(soloSettings84({mode:'training',difficulty:'injected',opponent:'unknown',timed:'true'}),{mode:'training',difficulty:'standard',opponent:'balanced',timed:false});
});
test('all opponent styles use exactly 15 legal cards, respect singleton/one-Prime limits, reproduce seeds and keep mirror finishes/elements intact',()=>{
 const cards=starterDeck(),all=fullTestDeckInventory();
 for(const seed of [1,42,1234])for(const {id}of SOLO_OPPONENTS84){const deck=soloOpponent84(id,cards,seed);assert.equal(validateDeck(deck,all).valid,true);assert.ok(Object.values(countMotifs(deck)).every(n=>n<=1));assert.deepEqual(deck,soloOpponent84(id,cards,seed));if(id==='mirror')assert.deepEqual(deck,cards);else assert.equal(new Set(deck.map(id=>getVariant(id).element)).size,5);}
 assert.notDeepEqual(soloOpponent84('balanced',cards,1),soloOpponent84('balanced',cards,42));
 const fancy=cards.map(id=>id.replace(':common',':mythic'));assert.deepEqual(soloOpponent84('mirror',fancy,5),fancy);
});
test('every difficulty/opponent combination completes two legal rounds; hints are non-mutating and do not read hidden opposing hands',()=>{
 const cards=starterDeck();
 for(const {id:difficulty}of SOLO_LEVELS84)for(const {id:opponent}of SOLO_OPPONENTS84)for(const round of [1,2]){
 let game=applyPortalDecks(createTacticsMatch({seed:84,starter:round-1}),cards,[LOADOUTS['hype-guard'],LOADOUTS['hype-twist']],{round,opponentCards:soloOpponent84(opponent,cards,84)});game.rotationLocked=true;
 const deckBefore=game.players.map(p=>countCards([...p.hand,...p.deck].map(c=>c.variantId)));
 for(let moves=0;!game.finished&&moves<19;moves++){
  const before=JSON.stringify(game),a=soloAction84(game,difficulty);assert.ok(a);assert.equal(a.rotation,0);previewEffect(game,a);assert.equal(JSON.stringify(game),before);
  const hidden=structuredClone(game);hidden.players[1-game.turn].hand=[];hidden.players[1-game.turn].deck=[];assert.deepEqual(soloAction84(hidden,difficulty),a);
  game=placeEffect(game,a);
 }
 assert.equal(game.finished,true);assert.equal(game.placements,18);assert.equal(scores(game).reduce((a,b)=>a+b,0),18);
 const remaining=game.players.map(p=>countCards([...p.hand,...p.deck,...Object.values(game.board).filter(c=>c?.origin===game.players.indexOf(p))].map(c=>c.variantId)));
 assert.deepEqual(remaining,deckBefore);assert.equal(soloAction84(game,difficulty),null);
 }
});
