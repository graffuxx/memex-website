import test from 'node:test';
import assert from 'node:assert/strict';
import {createTableAudio} from '../public/game/src/table-audio.mjs';

function fixture(){
 const sources=[];let created=0,decodes=0,release;
 const param=()=>({value:0,setTargetAtTime(){},cancelScheduledValues(){}}),node=()=>({gain:param(),threshold:param(),knee:param(),ratio:param(),attack:param(),release:param(),connect(n){return n;},disconnect(){this.disconnected=true;}});
 class Context{constructor(){created++;this.state='suspended';this.sampleRate=8000;this.currentTime=0;this.destination=node();}createGain(){return node();}createDynamicsCompressor(){return node();}createBuffer(c,n){return {getChannelData:()=>new Float32Array(n)};}resume(){this.state='running';return Promise.resolve();}close(){this.state='closed';}decodeAudioData(){decodes++;return Promise.resolve({duration:2});}createBufferSource(){const n={...node(),start(at){this.started=true;this.startTime=at;},stop(){this.stopped=true;}};sources.push(n);return n;}}
 globalThis.window={AudioContext:Context};globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
 globalThis.fetch=()=>new Promise(r=>release=()=>r({ok:true,arrayBuffer:async()=>new ArrayBuffer(4)}));
 const audio=createTableAudio();return {audio,sources,release:()=>release(),get created(){return created;},get decodes(){return decodes;}};
}
test('announcer remains silent before input; mute prevents delayed network audio and cancels active voice',async()=>{
 const f=fixture();assert.equal(f.created,0);assert.equal(await f.audio.say('intro'),false);await f.audio.setEnabled(true);assert.equal(f.created,1);
 const pending=f.audio.say('intro');f.audio.setEnabled(false);f.release();assert.equal(await pending,false);assert.equal(f.sources.length,0);
 await f.audio.setEnabled(true);assert.equal(await f.audio.say('intro'),true);assert.equal(f.decodes,1);assert.equal(f.sources.at(-1).started,true);
 f.audio.cancelAnnouncements();assert.equal(f.sources.at(-1).stopped,true);assert.equal(f.sources.at(-1).disconnected,true);
 assert.equal(await f.audio.say('intro'),true);assert.equal(f.decodes,1);f.audio.dispose();assert.equal(await f.audio.say('intro'),false);
});
test('reset/dispose invalidates pending announcer requests even after a new round starts',async()=>{
 const f=fixture();await f.audio.setEnabled(true);const pending=f.audio.say('victory');f.audio.cancel();f.release();assert.equal(await pending,false);assert.equal(f.sources.length,0);
 const pendingDraw=f.audio.say('draw');f.audio.dispose();f.release();assert.equal(await pendingDraw,false);assert.equal(f.sources.length,0);
});

test('the result waits for the combo to finish and mute cancels pending combo audio',async()=>{
 const f=fixture();await f.audio.setEnabled(true);
 const combo=f.audio.sayCombo('quad');f.release();assert.equal(await combo,true);
 const result=f.audio.say('victory');f.release();assert.equal(await result,true);
 assert.deepEqual(f.sources.map(source=>source.startTime),[0,2.08]);
 const pending=f.audio.sayCombo('triple');await f.audio.setEnabled(false);f.release();
 assert.equal(await pending,false);assert.equal(f.sources.length,2);
 assert.ok(f.sources.every(source=>source.stopped));
 f.audio.dispose();
});
