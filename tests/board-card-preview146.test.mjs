import test from 'node:test';
import assert from 'node:assert/strict';
import {boardPreviewFace146} from '../public/game/src/board-card-preview146.mjs';
import {expandGameDeck} from '../public/game/platform/catalog.mjs';
import {sideValue} from '../public/game/src/rules.mjs';
import {createTacticsMatch} from '../public/game/src/table-demo-state.mjs';

test('board previews read only played cards and preserve their finish, owner and rotated edges',()=>{
 const game=createTacticsMatch({seed:146,starter:0});
 const card={...expandGameDeck(['evil-ernie:legendary'],1)[0],rotation:2,controller:0};
 game.board={'0,0':card};
 const before=structuredClone(game);
 const preview=boardPreviewFace146(game,'0,0');
 assert.equal(preview.variant.id,'evil-ernie:legendary');
 assert.equal(preview.card.controller,0);
 assert.equal(preview.definition.prime,true);
 assert.deepEqual(preview.values,Array.from({length:6},(_,direction)=>sideValue(card,direction)));
 assert.equal(boardPreviewFace146(game,'1,0'),null);
 assert.equal(boardPreviewFace146(null,'0,0'),null);
 assert.deepEqual(game,before);
});
