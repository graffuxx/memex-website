import {createTableMusic107,WEATHER_URL107} from './table-music107.mjs?v=venom-live';
const ANNOUNCEMENTS=['intro','rematch','victory','defeat','draw','flip-double','flip-triple','flip-quad'];
// Card Foley is edited from "Playing cards on a wooden table" by snuq (CC0).
// https://freesound.org/people/snuq/sounds/564128/
const CARD_RECORDINGS={
 place:new URL('../assets/audio/arena-card-place.wav',import.meta.url),
 draw:new URL('../assets/audio/arena-card-draw.wav',import.meta.url)
};
export function createTableAudio({onState=()=>{}}={}){
 let ctx=null,master=null,compressor=null,enabled=false,volume=.35,ambient=false,ambientVoice=null,arena='grove',speechEpoch=0,comboEpoch=0,comboUntil=0,comboPlayback=null,disposed=false,music=null,musicEnabled=true,musicVolume=.16;const voices=new Set(),timers=new Set(),recordings=new Map(),decoded=new Map(),cardSamples=new Map();let noiseBuffer=null;
 const effectsLevel=()=>volume*.29;
 function state(){onState({enabled,available:Boolean(window.AudioContext||window.webkitAudioContext),running:ctx?.state==='running'});}
 function register(source,nodes,tag='effect'){const voice={source,nodes,tag};voices.add(voice);source.onended=()=>{voices.delete(voice);for(const n of nodes)try{n.disconnect();}catch{}};if(voices.size>32){const old=voices.values().next().value;try{old.source.stop();}catch{}}return source;}
 function recording(kind){
  if(!ANNOUNCEMENTS.includes(kind))return null;
  if(!recordings.has(kind)){
   const url=new URL(`../assets/audio/announcer-v42/${kind}.wav`,import.meta.url);
   if(kind.startsWith('flip-'))url.searchParams.set('v','5');
   recordings.set(kind,fetch(url).then(response=>response.ok?response.arrayBuffer():null).catch(()=>null));
  }
  return recordings.get(kind);
 }
 function stopVoice(v){
  try{v.source.stop();}catch{}
  for(const n of v.nodes)try{n.disconnect();}catch{}
  voices.delete(v);
 }
 function stopSpeech(tag){for(const v of voices)if(v.tag===tag)stopVoice(v);}
 function cancelAnnouncements(){speechEpoch++;music?.duck();stopSpeech('speech');}
 function audible(){return !disposed&&enabled&&ctx?.state==='running'&&!document.hidden;}
 async function speechBuffer(kind,context){
  if(!decoded.has(kind)){
   decoded.set(kind,Promise.resolve(recording(kind))
    .then(bytes=>bytes?context.decodeAudioData(bytes.slice(0)):null).catch(()=>null));
  }
  return decoded.get(kind);
 }
 function speak(buffer,tag,at){
  const source=ctx.createBufferSource(),amp=ctx.createGain();
  source.buffer=buffer;
  amp.gain.value=2.5;
  source.connect(amp).connect(master);
  register(source,[source,amp],tag);
  music?.duck(at-ctx.currentTime+buffer.duration);
  source.start(at);
 }
 async function say(kind){
  if(!audible())return false;
  cancelAnnouncements();
  const token=speechEpoch,precedingCombo=comboPlayback;
  const buffer=await speechBuffer(kind,ctx);
  await precedingCombo;
  if(!buffer||token!==speechEpoch||!audible())return false;
  speak(buffer,'speech',Math.max(ctx.currentTime,comboUntil+.08));
  return true;
 }
 function sayCombo(tier){
  if(!audible())return Promise.resolve(false);
  const token=++comboEpoch;
  comboPlayback=speechBuffer('flip-'+tier,ctx).then(buffer=>{
   if(!buffer||token!==comboEpoch||!audible())return false;
   stopSpeech('combo');
   const at=ctx.currentTime;
   comboUntil=at+buffer.duration;
   speak(buffer,'combo',at);
   return true;
  });
  return comboPlayback;
 }
 function route(amp,pan,nodes){
  if(!pan||!ctx.createStereoPanner){amp.connect(master);return;}
  const stereo=ctx.createStereoPanner();stereo.pan.value=pan;amp.connect(stereo).connect(master);nodes.push(stereo);
 }
 function preloadCards(){
  for(const [kind,url] of Object.entries(CARD_RECORDINGS)){
   if(cardSamples.has(kind))continue;
   cardSamples.set(kind,null);
   const context=ctx;
   void fetch(url).then(response=>response.ok?response.arrayBuffer():null)
    .then(bytes=>bytes?context.decodeAudioData(bytes):null)
    .then(sample=>{if(sample&&!disposed)cardSamples.set(kind,sample);}).catch(()=>{});
  }
 }
 function foley(kind,gain,delay=0,rate=1,pan=0){
  const sample=cardSamples.get(kind);
  if(!sample)return false;
  const source=ctx.createBufferSource(),amp=ctx.createGain(),nodes=[source,amp];
  source.buffer=sample;source.playbackRate.value=rate;amp.gain.value=gain;
  source.connect(amp);route(amp,pan,nodes);register(source,nodes);source.start(ctx.currentTime+delay);return true;
 }
 function tone(frequency,end,duration,gain=.2,delay=0,type='sine',attack=.008,pan=0){
  const t=ctx.currentTime+delay,osc=ctx.createOscillator(),amp=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,t);osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);
  amp.gain.setValueAtTime(.0001,t);amp.gain.exponentialRampToValueAtTime(gain,t+attack);amp.gain.exponentialRampToValueAtTime(.0001,t+duration);const nodes=[osc,amp];osc.connect(amp);route(amp,pan,nodes);register(osc,nodes);osc.start(t);osc.stop(t+duration+.02);
 }
 function noise(duration,gain=.25,frequency=800,delay=0,filterType='lowpass',end=100,attack=.006,pan=0){const t=ctx.currentTime+delay,source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),amp=ctx.createGain();source.buffer=noiseBuffer;filter.type=filterType;filter.frequency.setValueAtTime(frequency,t);filter.frequency.exponentialRampToValueAtTime(end,t+duration);filter.Q.value=.65;amp.gain.setValueAtTime(.0001,t);amp.gain.exponentialRampToValueAtTime(gain,t+attack);amp.gain.exponentialRampToValueAtTime(.0001,t+duration);const nodes=[source,filter,amp];source.connect(filter).connect(amp);route(amp,pan,nodes);register(source,nodes);source.start(t);source.stop(t+duration+.01);}
 function mallet(frequency,at,gain,pan=0){
  tone(frequency,frequency*.996,.44,gain,at,'sine',.008,pan);
  tone(frequency*2.71,frequency*2.68,.17,gain*.25,at,'sine',.004,pan);
 }
 function chord(notes,at,duration,gain){
  for(const [i,note] of notes.entries())tone(note,note*.997,duration,gain,at+i*.022,i===0?'triangle':'sine',.035,(i-(notes.length-1)/2)*.28);
 }
 function stopAmbient(){if(ambientVoice){try{ambientVoice.source.stop();}catch{}for(const n of ambientVoice.nodes)try{n.disconnect();}catch{}ambientVoice=null;}}
 function syncAmbient(){stopAmbient();if(!ambient||!enabled||ctx?.state!=='running')return;const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=noiseBuffer;source.loop=true;filter.type='lowpass';filter.frequency.value=arena==='grove'?420:160;gain.gain.value=.045;source.connect(filter).connect(gain).connect(master);source.start();ambientVoice={source,nodes:[source,filter,gain]};}
 async function setEnabled(value){
  if(disposed)return false;
  enabled=Boolean(value);if(!enabled){cancel();stopAmbient();void music?.setActive(false);if(ctx)master.gain.setTargetAtTime(0,ctx.currentTime,.015);state();return false;}
  try{if(!ctx){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('Audio nicht verfügbar');ctx=new Audio({latencyHint:'interactive'});master=ctx.createGain();master.gain.value=0;compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-18;compressor.knee.value=15;compressor.ratio.value=5;compressor.attack.value=.004;compressor.release.value=.12;master.connect(compressor).connect(ctx.destination);noiseBuffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const data=noiseBuffer.getChannelData(0);let n=8673;for(let i=0;i<data.length;i++){n=(Math.imul(n,1664525)+1013904223)>>>0;data[i]=(n/4294967296*2-1)*.65;}}
   if(ctx.state!=='running')await ctx.resume();if(disposed||!enabled)return false;
   preloadCards();
   if(!music){
    music=createTableMusic107({context:ctx,output:compressor,weatherUrl:WEATHER_URL107});
    music.setWeatherEnabled(ambient&&arena==='voidforge');
    void music.setVolume(musicVolume);void music.setMasterVolume(volume);
   }
   master.gain.setTargetAtTime(effectsLevel(),ctx.currentTime,.025);syncAmbient();void music.setActive(musicEnabled&&!document.hidden);state();return ctx.state==='running';
  }catch{enabled=false;state();return false;}
 }
 function play(kind,{side=0,count=1}={}){if(disposed||!enabled||ctx?.state!=='running'||document.hidden)return false;
  switch(kind){
   case 'select':if(!foley('draw',.26,0,1.66))noise(.045,.12,3000,0,'bandpass',1200);break;
   case 'rotate':if(!foley('draw',.32,0,1.42))noise(.09,.13,2200,0,'bandpass',740);break;
   case 'cancel':noise(.075,.082,1350,0,'bandpass',550);break;
   case 'draw':if(!foley('draw',.72,0,1.05,.16))noise(.16,.2,3100,0,'bandpass',580);break;
   case 'place':
    if(!foley('place',1.08,0,.92))noise(.12,.28,1230,0,'lowpass',160);
    tone(119,42,.21,.32,0,'sine',.006);tone(208,92,.12,.12,.008,'triangle');
    break;
   case 'capture':{
    const pitches=side===0?[587.33,880,1174.66,1396.91]:[349.23,293.66,220,146.83];
    if(!foley('draw',.58,0,1.32,side===0?-.24:.24))noise(.19,.16,990,0,'bandpass',3900,.024);
    tone(132,49,.28,.26,.15);
    for(let i=0;i<Math.min(4,count);i++){
     const at=.145+i*.082,pan=(i%2?1:-1)*(.18+i*.09);
     mallet(pitches[i],at,count===1?.19:.10+i*.012,pan);
     if(i>0)foley('place',.46,at,1+i*.09,pan);
    }
    break;
   }
   case 'guard':noise(.13,.24,2300,0,'bandpass',5700);mallet(293.66,0,.15);mallet(698.46,.054,.12,.2);break;
   case 'twist':noise(.2,.19,980,0,'bandpass',4800,.035);tone(196,392,.22,.16,0,'triangle',.045,-.28);mallet(440,.18,.11,.27);break;
   case 'event':tone(87,43,.6,.23);chord([146.83,220,349.23],.1,.7,.10);mallet(587.33,.24,.09);break;
   case 'turn':if(side===0)mallet(440,0,.052);else noise(.08,.06,1200);break;
   case 'shift':noise(.28,.32,490,0,'lowpass',66,.03);tone(106,39,.28,.23);break;
   case 'round-start':
    tone(113,40,.46,.38);noise(.46,.14,590,.04,'bandpass',3000,.1);
    chord([146.83,220,349.23,440],.15,.78,.105);mallet(587.33,.31,.13,.22);break;
   case 'win':
    tone(146.83,49,.47,.32);chord([146.83,293.66,440,523.25],.07,.78,.13);
    mallet(587.33,.18,.16,-.24);mallet(880,.36,.16,.24);chord([220,440,587.33,698.46],.48,1.08,.1);break;
   case 'loss':
    tone(118,32,.62,.27,0,'sine',.026);chord([110,146.83,174.61],.17,.98,.106);
    tone(261.63,146.83,.62,.105,.31,'sine',.062,.2);break;
   default:return false;
  }return true;
 }
 function cancel(){cancelAnnouncements();comboEpoch++;comboUntil=0;comboPlayback=null;for(const timer of timers)clearTimeout(timer);timers.clear();for(const v of voices)stopVoice(v);}
 function test(){cancel();for(const [i,kind]of ['draw','place','capture','guard','round-start','win'].entries()){const timer=setTimeout(()=>{timers.delete(timer);play(kind,{count:kind==='capture'?3:1});},i*750);timers.add(timer);}}
 const visibility=()=>{if(document.hidden){cancel();stopAmbient();void music?.setActive(false);}else{syncAmbient();void music?.setActive(enabled&&musicEnabled);}};document.addEventListener('visibilitychange',visibility);
 return {setEnabled,play,say,sayCombo,cancelAnnouncements,preloadAnnouncements(){return Promise.all(ANNOUNCEMENTS.map(recording));},get running(){return enabled&&ctx?.state==='running';},get musicPlaying(){return Boolean(music?.playing);},getMusicTimeline(){return music?.getTimeline()??null;},test,cancel,setVolume(v){volume=Math.max(0,Math.min(1,Number(v)||0));if(ctx)master.gain.setTargetAtTime(enabled?effectsLevel():0,ctx.currentTime,.025);void music?.setMasterVolume(volume);},setMusicEnabled(v){musicEnabled=Boolean(v);void music?.setActive(enabled&&musicEnabled&&!document.hidden);},setMusicVolume(v){musicVolume=Math.max(0,Math.min(1,Number(v)||0));void music?.setVolume(musicVolume);},setAmbient(v){ambient=Boolean(v);music?.setWeatherEnabled(ambient&&arena==='voidforge');syncAmbient();},setArena(v){arena=v;music?.setWeatherEnabled(ambient&&arena==='voidforge');syncAmbient();},dispose(){if(disposed)return;disposed=true;cancel();stopAmbient();music?.dispose();cardSamples.clear();document.removeEventListener('visibilitychange',visibility);ctx?.close();}};
}
