import test from 'node:test';
import assert from 'node:assert/strict';
import {createTableMusic107} from '../public/game/src/table-music107.mjs';

function rig(fetcher){
 const nodes=[];let loads=0;
 const gain={value:0,events:[],cancelScheduledValues(t){this.events.push(['cancel',t]);},setTargetAtTime(v,t){this.events.push(['target',v,t]);}};
 const context={state:'running',currentTime:0,createGain(){return {gain,connect(){},disconnect(){this.disconnected=true;}};},createBufferSource(){const n={connect(){},disconnect(){this.disconnected=true;},start(t,offset){this.offset=offset;},stop(){this.stopped=true;}};nodes.push(n);return n;},async decodeAudioData(){return {duration:90};}};
 const music=createTableMusic107({context,output:{},fetcher:fetcher??(async()=>{loads++;return {ok:true,async arrayBuffer(){return new ArrayBuffer(1);}};})});
 return {music,context,nodes,gain,get loads(){return loads;}};
}
test('music is lazy, quiet, loops once, and resumes the same position after mute or hidden tab',async()=>{
 const r=rig();assert.equal(r.loads,0);assert.equal(r.music.playing,false);
 await r.music.setActive(true);assert.equal(r.loads,1);assert.equal(r.nodes.length,1);assert.equal(r.nodes[0].loop,true);assert.equal(r.nodes[0].loopEnd,90);assert.equal(r.nodes[0].offset,0);
 assert.ok(r.gain.events.filter(e=>e[0]==='target').at(-1)[1]<=.057);
 r.context.currentTime=12.5;await r.music.setActive(false);assert.ok(r.nodes[0].stopped);assert.equal(r.music.playing,false);
 r.context.currentTime=60;await r.music.setActive(true);assert.equal(r.loads,1);assert.equal(r.nodes.length,2);assert.equal(r.nodes[1].offset,12.5);
 await r.music.setActive(true);assert.equal(r.nodes.length,2);
 await r.music.setVolume(0);assert.equal(r.music.playing,false);await r.music.setVolume(.2);assert.equal(r.nodes.length,3);
 r.music.duck(2);const scheduled=r.gain.events.filter(e=>e[0]==='target');assert.ok(scheduled.at(-2)[1]<scheduled.at(-1)[1]);assert.equal(scheduled.at(-1)[2],62);
 await r.music.setMasterVolume(0);assert.equal(r.music.playing,false);await r.music.setMasterVolume(.35);assert.equal(r.music.playing,true);
 r.music.dispose();r.music.dispose();assert.ok(r.nodes.every(n=>n.stopped&&n.disconnected));await r.music.setActive(true);assert.equal(r.music.playing,false);
});
test('a late download cannot start music after mute/dispose; concurrent activation never doubles playback',async()=>{
 let resolve;const r=rig(()=>new Promise(r=>{resolve=r;}));
 const first=r.music.setActive(true),second=r.music.setActive(true);await r.music.setActive(false);
 resolve({ok:true,async arrayBuffer(){return new ArrayBuffer(1);}});await Promise.all([first,second]);assert.equal(r.nodes.length,0);
 await Promise.all([r.music.setActive(true),r.music.setActive(true)]);assert.equal(r.nodes.length,1);r.music.dispose();
 const p=rig(async()=>({ok:false}));assert.equal(await p.music.setActive(true),false);assert.equal(p.music.playing,false);
});
