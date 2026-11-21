import test from 'node:test';
import assert from 'node:assert/strict';
import {duelControl105,bindDuelControl105} from '../public/game/src/duel-control105.mjs';
import {scores} from '../public/game/src/rules.mjs';
import {createTableDemo} from '../public/game/src/table-demo-state.mjs';

test('ribbon weights follow current ownership and remain identical to the board score after captures',()=>{
 const game=createTableDemo(),before=duelControl105(game.board);
 assert.deepEqual(before.counts,scores(game));assert.equal(before.shares[0]+before.shares[1],1);
 const cell=Object.keys(game.board).find(cell=>game.board[cell].controller===1);
 game.board[cell].controller=0;
 const after=duelControl105(game.board);
 assert.deepEqual(after.counts,scores(game));assert.equal(after.total,before.total);
 assert.equal(after.counts[0],before.counts[0]+1);assert.equal(after.counts[1],before.counts[1]-1);
 assert.ok(after.shares[0]>before.shares[0]);assert.ok(after.shares[1]<before.shares[1]);
});
test('empty board starts balanced; a full takeover fills one ribbon and empties the other, irrespective of rarity',()=>{
 assert.deepEqual(duelControl105({}).shares,[.5,.5]);
 const board={'0,0':{controller:0,rarity:'common'},'1,0':{controller:0,rarity:'mythic'},'0,1':{origin:1}};
 assert.deepEqual(duelControl105(board),{counts:[2,0],total:2,shares:[1,0]});
 board['1,0'].controller=1;
 assert.deepEqual(duelControl105(board).shares,[.5,.5]);
});
function element(){return {children:[],attrs:{},props:{},style:{setProperty(k,v){this[k]=v;}},setAttribute(k,v){this.attrs[k]=v;},append(child){this.children.push(child);},querySelector(){return this.children.find(c=>c.className==='duel-meter105')??null;}};}
test('live fills and accessible values recover on reconnect, flip, and a new empty round; missing workshop HUD is harmless',()=>{
 const teams=[element(),element()],doc={querySelector:s=>teams[s.endsWith('.cobalt')?0:1],createElement:element},update=bindDuelControl105(doc);
 const game={board:{a:{controller:0},b:{controller:1},c:{controller:1}}};update(game);
 assert.equal(teams[0].style['--control-share'],'0.3333333333333333');assert.equal(teams[1].children[0].attrs['aria-valuenow'],'67');
 game.board.b.controller=0;update(game);assert.equal(teams[0].children[0].attrs['aria-valuenow'],'67');assert.equal(teams[1].children[0].attrs['aria-valuetext'],'1 von 3 ausgespielten Karten');
 update({board:{}});assert.equal(teams[0].style['--control-share'],'0.5');assert.equal(teams[0].children.length,1);
 assert.doesNotThrow(()=>bindDuelControl105({querySelector:()=>null})({board:{}}));
});
