import test from 'node:test';
import assert from 'node:assert/strict';
import {syncTableCards} from '../public/game/src/table-card-pool25.mjs';

test('changing between match, demo and decks replaces stale models and retains correct owners',()=>{
 const cards=new Map(),disposed=[];
 const options={profileFor:s=>s.id,rarityFor:s=>s.rarity??'common',spawn:(uid,profile)=>({uid,profile,dispose(){disposed.push(uid);},setOwner(v){this.owner=v;},setRarity(v){this.rarity=v;},setRotation(v){this.rotation=v;}})};
 syncTableCards(cards,[{uid:'match-a',id:'doge',origin:0},{uid:'match-b',id:'pepe',origin:1}],options);
 syncTableCards(cards,[{uid:'demo-board',id:'pepe',controller:1,rotation:2},{uid:'demo-hand',id:'doge',origin:0}],options);
 assert.deepEqual([...cards.keys()],['demo-board','demo-hand']);assert.deepEqual(disposed,['match-a','match-b']);
 assert.equal(cards.get('demo-board').owner,1);assert.equal(cards.get('demo-board').rotation,2);
 const previous=cards.get('demo-hand');
 syncTableCards(cards,[{uid:'demo-hand',id:'roll-safe',origin:1,rarity:'mythic'}],options);
 assert.notEqual(cards.get('demo-hand'),previous);assert.equal(cards.get('demo-hand').profile,'roll-safe');assert.equal(cards.get('demo-hand').rarity,'mythic');assert.equal(cards.get('demo-hand').owner,1);
 const reused=cards.get('demo-hand');syncTableCards(cards,[{uid:'demo-hand',id:'roll-safe',controller:0,rotation:3}],options);
 assert.equal(cards.get('demo-hand'),reused);assert.equal(reused.owner,0);assert.equal(reused.rotation,3);assert.equal(reused.rarity,'common');
});
