import test from 'node:test';import assert from 'node:assert/strict';
import {bindPasswordRecovery106} from '../public/game/platform/auth-recovery106.mjs';
import {chooseOnlineDeck106} from '../public/game/platform/deck-selection106.mjs';
function fixture(){let notify;const data=new Map();return {auth:{onAuthStateChange(cb){notify=cb;return {data:{subscription:{unsubscribe(){}}}};}},storage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},event:(event,userId)=>notify(event,userId?{user:{id:userId}}:null)};}
test('a recovery link received before the form mounts remains usable after INITIAL_SESSION and a same-tab reload',()=>{
 const f=fixture(),flow=bindPasswordRecovery106(f.auth,{storage:f.storage,now:()=>1000});f.event('PASSWORD_RECOVERY','alice');f.event('INITIAL_SESSION','alice');assert.equal(flow.isFor('alice'),true);assert.equal(flow.isFor('bob'),false);
 const reloaded=bindPasswordRecovery106(f.auth,{storage:f.storage,now:()=>2000});f.event('INITIAL_SESSION','alice');assert.equal(reloaded.isFor('alice'),true);reloaded.clear();assert.equal(reloaded.isFor('alice'),false);
});
test('normal login, logout and expiry never enable the recovery form; blocked storage uses only this page memory',()=>{
 for(const event of ['SIGNED_IN','SIGNED_OUT']){const f=fixture(),flow=bindPasswordRecovery106(f.auth,{storage:f.storage});f.event('PASSWORD_RECOVERY','alice');f.event(event,'alice');assert.equal(flow.isFor('alice'),false);}
 let now=0;const f=fixture(),flow=bindPasswordRecovery106(f.auth,{storage:f.storage,now:()=>now});f.event('PASSWORD_RECOVERY','alice');now=900001;assert.equal(flow.isFor('alice'),false);
 const g=fixture(),memory=bindPasswordRecovery106(g.auth,{storage:{getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}}});g.event('PASSWORD_RECOVERY','alice');assert.equal(memory.isFor('alice'),true);memory.clear();assert.equal(memory.isFor('alice'),false);
});
test('an owned deck link is honored; foreign/missing IDs fall back safely and a manual choice survives refresh',()=>{
 const decks=[{id:'active',active:true},{id:'other',active:false}];assert.equal(chooseOnlineDeck106(decks,'','other'),'other');assert.equal(chooseOnlineDeck106(decks,'other','active'),'other');assert.equal(chooseOnlineDeck106(decks,'','foreign'),'active');assert.equal(chooseOnlineDeck106([],'','foreign'),'');
});
