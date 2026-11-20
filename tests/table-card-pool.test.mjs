import test from 'node:test';
import assert from 'node:assert/strict';
import {syncTableCards} from '../public/game/src/table-card-pool25.mjs';

test('cards have controller markers only on the board, including captures, hand returns and model reuse',()=>{
 const cards=new Map(),disposed=[];
 const options={boardUids:new Set(),profileFor:s=>s.id,rarityFor:s=>s.rarity??'common',spawn:(uid,profile,owner)=>({uid,profile,initialOwner:owner,dispose(){disposed.push(uid);},setOwner(v){this.owner=v;},setRarity(v){this.rarity=v;},setRotation(v){this.rotation=v;}})};
 syncTableCards(cards,[{uid:'match-a',id:'doge',origin:0},{uid:'match-b',id:'pepe',origin:1}],options);
 for(const c of cards.values()){assert.equal(c.owner,null);assert.equal(c.initialOwner,null);}
 options.boardUids=new Set(['demo-board']);
 syncTableCards(cards,[{uid:'demo-board',id:'pepe',controller:1,rotation:2},{uid:'demo-hand',id:'doge',origin:0}],options);
 assert.deepEqual([...cards.keys()],['demo-board','demo-hand']);assert.deepEqual(disposed,['match-a','match-b']);
 assert.equal(cards.get('demo-board').owner,1);assert.equal(cards.get('demo-board').initialOwner,1);assert.equal(cards.get('demo-board').rotation,2);assert.equal(cards.get('demo-hand').owner,null);
 const previous=cards.get('demo-hand');
 syncTableCards(cards,[{uid:'demo-hand',id:'roll-safe',origin:1,rarity:'mythic'}],options);
 assert.notEqual(cards.get('demo-hand'),previous);assert.equal(cards.get('demo-hand').profile,'roll-safe');assert.equal(cards.get('demo-hand').rarity,'mythic');assert.equal(cards.get('demo-hand').owner,null);
 const reused=cards.get('demo-hand');options.boardUids=new Set(['demo-hand']);
 syncTableCards(cards,[{uid:'demo-hand',id:'roll-safe',controller:0,rotation:3,rarity:'mythic'}],options);
 assert.equal(cards.get('demo-hand'),reused);assert.equal(reused.owner,0);assert.equal(reused.rotation,3);assert.equal(reused.rarity,'mythic');
 syncTableCards(cards,[{uid:'demo-hand',id:'roll-safe',controller:1,rarity:'mythic'}],options);assert.equal(reused.owner,1);assert.equal(reused.rarity,'mythic');
 options.boardUids.clear();syncTableCards(cards,[{uid:'demo-hand',id:'roll-safe',controller:1,rarity:'mythic'}],options);assert.equal(reused.owner,null);assert.equal(reused.rarity,'mythic');
});
