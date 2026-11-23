import test from 'node:test';import assert from 'node:assert/strict';
import {bindStartDuelDialog} from '../public/game/src/start-duel-dialog18.mjs';
import {createStartDuel} from '../public/game/src/start-duel18.mjs';
import {bindPortraitIntro86} from '../public/game/src/portrait-intro86.mjs';
function fixture(options={}){
 const nodes=new Map(),node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,textContent:'',dataset:{},disabled:false,setAttribute(){},focus(){},querySelector:()=>node(id+'art')});return nodes.get(id);};
 const gestures=['rock','scissors','paper'].map(key=>({...node(key),dataset:{gesture:key}})),starters=[0,1].map(side=>({...node('side'+side),dataset:{starter:String(side)}}));
 const dialog={open:false,dataset:{},closeCount:0,querySelector:q=>q.startsWith('#')?node(q.slice(1)):q==='[data-gesture]'?gestures[0]:starters[0],querySelectorAll:q=>q==='[data-gesture]'?gestures:starters,addEventListener(){},showModal(){this.open=true;},close(){this.open=false;this.closeCount++;}};
 globalThis.document={activeElement:{focus(){}}};
 const control=bindStartDuelDialog(dialog,{createDuel:()=>createStartDuel({pick:()=>'rock'}),...options});
 return {control,dialog,node,play:key=>gestures.find(g=>g.dataset.gesture===key).onclick(),start:side=>starters[side].onclick()};
}
test('start portraits are measured while the dialog is visible; play waits for docking and repeated clicks cannot start twice',async()=>{
 let finishFlight,settled=false,transitions=0;const f=fixture({onBeforeClose:()=>{assert.equal(f.dialog.open,true);transitions++;return new Promise(r=>{finishFlight=r;});}});
 const started=f.control.open().then(side=>{settled=true;return side;});f.play('paper');f.start(0);
 assert.equal(f.dialog.open,false);assert.equal(settled,false);assert.equal(transitions,1);f.start(0);assert.equal(transitions,1);
 finishFlight();assert.equal(await started,0);assert.equal(f.dialog.closeCount,1);
});
test('a new duel cancels an unfinished portrait flight; its stale completion cannot close or start the replacement duel',async()=>{
 let finishFlight,cancelled=0;const f=fixture({onBeforeClose:()=>new Promise(r=>{finishFlight=r;}),onCancel:()=>cancelled++});
 const old=f.control.open();f.play('paper');f.start(1);f.control.cancel();assert.equal(await old,null);
 let replacementStarted=false;const replacement=f.control.open().then(v=>{replacementStarted=true;return v;});finishFlight();await Promise.resolve();await Promise.resolve();
 assert.equal(f.dialog.open,true);assert.equal(replacementStarted,false);assert.ok(cancelled>=3);f.control.cancel();assert.equal(await replacement,null);
});
test('an unavailable or rejected visual transition never blocks either start-right outcome',async()=>{
 for(const reject of [false,true]){const f=fixture({onBeforeClose:()=>{if(reject)return Promise.reject(Error('animation unavailable'));throw Error('animation unavailable');}});const started=f.control.open();f.play('scissors');await f.node('startContinue').onclick();assert.equal(await started,1);assert.equal(f.dialog.open,false);}
});
test('older cached HTML can still start a duel when the new portrait slots are missing',async()=>{
 const controller=bindPortraitIntro86(null,{doc:{getElementById:()=>null},win:{}});controller.open();await controller.fly();controller.cancel();
});
test('a failed decorative opening hook cannot prevent rock paper scissors or leave a pending start unresolved',async()=>{
 const f=fixture({onOpen(){throw Error('Portrait target missing');}});
 const started=f.control.open();assert.equal(f.dialog.open,true);
 f.play('paper');f.start(0);assert.equal(await started,0);
});
test('portrait observation skips missing targets and works when MutationObserver is unavailable',()=>{
 const original=globalThis.MutationObserver;
 const nodes=new Map(),observed=[];
 const node=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'Player',hidden:false,querySelector:()=>null,closest:()=>null});return nodes.get(id);};
 for(const id of ['ownPortrait85','enemyPortrait85','startOwnPortrait86','startEnemyPortrait86','startOwnName86','startOwnTitle86'])node(id);
 const doc={getElementById:id=>nodes.get(id)??null,body:{dataset:{}},addEventListener(){}};
 const win={addEventListener(){}};
 try{
  globalThis.MutationObserver=class{observe(target){assert.ok(target);observed.push(target);}disconnect(){}};
  const intro=bindPortraitIntro86({}, {doc,win});intro.open();assert.equal(observed.length,2);intro.cancel();
  globalThis.MutationObserver=undefined;
  const unavailable=bindPortraitIntro86({}, {doc,win});unavailable.open();unavailable.cancel();
 }finally{globalThis.MutationObserver=original;}
});
