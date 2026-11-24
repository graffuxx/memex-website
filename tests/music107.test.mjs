import test from 'node:test';
import assert from 'node:assert/strict';
import {createTableMusic107} from '../public/game/src/table-music107.mjs';

function rig(fetcher,duration=90,weatherUrl=null){
 const nodes=[];let loads=0;
 const gains=[];
 function createGain(){const gain={value:0,events:[],cancelScheduledValues(t){this.events.push(['cancel',t]);},setTargetAtTime(v,t){this.events.push(['target',v,t]);}};gains.push(gain);return gain;}
 const context={state:'running',currentTime:0,createGain(){return {gain:createGain(),connect(){},disconnect(){this.disconnected=true;}};},createBufferSource(){const n={connect(){},disconnect(){this.disconnected=true;},start(t,offset){this.at=t;this.offset=offset;},stop(){this.stopped=true;}};nodes.push(n);return n;},async decodeAudioData(){return {duration};}};
 const music=createTableMusic107({context,output:{},weatherUrl,fetcher:fetcher??(async()=>{loads++;return {ok:true,async arrayBuffer(){return new ArrayBuffer(1);}};})});
 return {music,context,nodes,gain:gains[0],weatherGain:gains[1],get loads(){return loads;}};
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
test('weather follows the actual soundtrack playhead across loop, muted pause, suspended context and resume',async()=>{
 const {VOID_MUSIC137,VOID_WEATHER_CUES137,voidMusicWeather137}=await import('../public/game/src/void-weather137.mjs');
 const {duration}=VOID_MUSIC137,at=VOID_WEATHER_CUES137[0].at;
 const r=rig(undefined,duration);
 const assertPosition=()=>{const playhead=r.music.getTimeline();assert.equal(playhead.duration,duration);assert.ok(Math.abs(playhead.position-at)<.0001);};
 assert.equal(r.music.getTimeline(),null);
 r.context.currentTime=100;await r.music.setActive(true);
 r.context.currentTime=100+at;
 assertPosition();
 assert.ok(voidMusicWeather137(r.music.getTimeline()).left>.95);
 r.context.currentTime=100+duration+at;
 assertPosition();
 await r.music.setActive(false);assert.equal(r.music.getTimeline(),null);
 r.context.currentTime=500;await r.music.setActive(true);
 assertPosition();
 r.context.state='suspended';assert.equal(r.music.getTimeline(),null);
 r.context.state='running';assert.ok(r.music.getTimeline());
 await r.music.setVolume(0);assert.equal(r.music.getTimeline(),null);
 await r.music.setVolume(.16);assertPosition();
 await r.music.setMasterVolume(0);assert.equal(r.music.getTimeline(),null);
 r.music.dispose();assert.equal(r.music.getTimeline(),null);
});
test('a late download cannot start music after mute/dispose; concurrent activation never doubles playback',async()=>{
 let resolve;const r=rig(()=>new Promise(r=>{resolve=r;}));
 const first=r.music.setActive(true),second=r.music.setActive(true);await r.music.setActive(false);
 resolve({ok:true,async arrayBuffer(){return new ArrayBuffer(1);}});await Promise.all([first,second]);assert.equal(r.nodes.length,0);
 await Promise.all([r.music.setActive(true),r.music.setActive(true)]);assert.equal(r.nodes.length,1);r.music.dispose();
 const p=rig(async()=>({ok:false}));assert.equal(await p.music.setActive(true),false);assert.equal(p.music.playing,false);
});

test('music and thunder keep identical offsets when paused, resumed and switched independently',async()=>{
 const r=rig(undefined,87.273,'weather');
 await r.music.setActive(true);
 assert.equal(r.loads,2);
 assert.equal(r.nodes.length,2);
 const [music,weather]=r.nodes;
 assert.equal(music.at,weather.at);
 assert.equal(music.loopEnd,weather.loopEnd);
 assert.equal(music.offset,weather.offset);
 assert.equal(r.weatherGain.events.at(-1)[1],0);

 r.music.setWeatherEnabled(true);
 assert.ok(r.weatherGain.events.at(-1)[1]>0);
 const defaultWeatherGain=r.weatherGain.events.at(-1)[1];
 await r.music.setVolume(.5);
 assert.ok(r.weatherGain.events.at(-1)[1]>defaultWeatherGain);
 assert.ok(r.weatherGain.events.at(-1)[1]<=.35*.36);
 r.music.duck(1.2);
 assert.equal(r.weatherGain.events.at(-1)[2],1.2);
 r.context.currentTime=music.at+13;
 await r.music.setActive(false);
 assert.ok(music.stopped&&weather.stopped);
 r.context.currentTime=30;await r.music.setActive(true);
 const [musicResumed,weatherResumed]=r.nodes.slice(2);
 assert.equal(musicResumed.at,weatherResumed.at);
 assert.equal(musicResumed.offset,13);
 assert.equal(weatherResumed.offset,13);
 r.music.dispose();
});
