// Original procedural Foley and tonal cues. No external samples or network requests.
export function createTableAudio({onState=()=>{}}={}){
 let ctx=null,master=null,compressor=null,enabled=false,volume=.35,ambient=false,ambientVoice=null,arena='grove';const voices=new Set(),timers=new Set();let noiseBuffer=null;
 function state(){onState({enabled,available:Boolean(window.AudioContext||window.webkitAudioContext),running:ctx?.state==='running'});}
 function register(source,nodes){const voice={source,nodes};voices.add(voice);source.onended=()=>{voices.delete(voice);for(const n of nodes)try{n.disconnect();}catch{}};if(voices.size>32){const old=voices.values().next().value;try{old.source.stop();}catch{}}return source;}
 function tone(frequency,end,duration,gain=.2,delay=0,type='sine'){
  const t=ctx.currentTime+delay,osc=ctx.createOscillator(),amp=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,t);osc.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);
  amp.gain.setValueAtTime(.0001,t);amp.gain.exponentialRampToValueAtTime(gain,t+.008);amp.gain.exponentialRampToValueAtTime(.0001,t+duration);osc.connect(amp).connect(master);register(osc,[osc,amp]);osc.start(t);osc.stop(t+duration+.02);
 }
 function noise(duration,gain=.25,frequency=800,delay=0){const t=ctx.currentTime+delay,source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),amp=ctx.createGain();source.buffer=noiseBuffer;filter.type='lowpass';filter.frequency.setValueAtTime(frequency,t);filter.frequency.exponentialRampToValueAtTime(100,t+duration);filter.Q.value=.65;amp.gain.setValueAtTime(.0001,t);amp.gain.exponentialRampToValueAtTime(gain,t+.006);amp.gain.exponentialRampToValueAtTime(.0001,t+duration);source.connect(filter).connect(amp).connect(master);register(source,[source,filter,amp]);source.start(t);source.stop(t+duration+.01);}
 function stopAmbient(){if(ambientVoice){try{ambientVoice.source.stop();}catch{}for(const n of ambientVoice.nodes)try{n.disconnect();}catch{}ambientVoice=null;}}
 function syncAmbient(){stopAmbient();if(!ambient||!enabled||ctx?.state!=='running')return;const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=noiseBuffer;source.loop=true;filter.type='lowpass';filter.frequency.value=arena==='grove'?420:160;gain.gain.value=.045;source.connect(filter).connect(gain).connect(master);source.start();ambientVoice={source,nodes:[source,filter,gain]};}
 async function setEnabled(value){
  enabled=Boolean(value);if(!enabled){cancel();stopAmbient();if(ctx)master.gain.setTargetAtTime(0,ctx.currentTime,.015);state();return false;}
  try{if(!ctx){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('Audio nicht verfügbar');ctx=new Audio({latencyHint:'interactive'});master=ctx.createGain();master.gain.value=0;compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-18;compressor.knee.value=15;compressor.ratio.value=5;compressor.attack.value=.004;compressor.release.value=.12;master.connect(compressor).connect(ctx.destination);noiseBuffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const data=noiseBuffer.getChannelData(0);let n=8673;for(let i=0;i<data.length;i++){n=(Math.imul(n,1664525)+1013904223)>>>0;data[i]=(n/4294967296*2-1)*.65;}}
   if(ctx.state!=='running')await ctx.resume();master.gain.setTargetAtTime(volume*.2,ctx.currentTime,.025);syncAmbient();state();return ctx.state==='running';
  }catch{enabled=false;state();return false;}
 }
 function play(kind,{side=0,count=1}={}){if(!enabled||ctx?.state!=='running'||document.hidden)return false;
  switch(kind){
   case 'select':noise(.035,.12,1600);tone(430,300,.055,.08);break;
   case 'rotate':tone(540,690,.055,.1);break;
   case 'cancel':noise(.07,.1,900);break;
   case 'draw':noise(.18,.19,2600);tone(310,400,.12,.06,.02);break;
   case 'place':noise(.09,.3,520);tone(125,65,.18,.28);tone(740,620,.1,.06,.025);break;
   case 'capture':for(let i=0;i<Math.min(4,count);i++){tone((side===0?440:330)*2**(i/6),(side===0?660:495)*2**(i/6),.18,.15,i*.065,'triangle');}noise(.07,.13,1800);break;
   case 'guard':tone(300,600,.22,.15,0,'triangle');tone(900,700,.22,.06,.05);break;
   case 'twist':noise(.12,.14,1200);tone(270,680,.19,.12,0,'triangle');break;
   case 'event':for(const [i,f]of [330,440,660].entries())tone(f,f,.35,.1,i*.09);break;
   case 'turn':tone(side===0?660:330,side===0?740:294,.13,.08);break;
   case 'shift':noise(.23,.29,380);tone(85,48,.22,.18);break;
   case 'win':for(const [i,f]of [523,659,784,1046].entries())tone(f,f,.38,.15,i*.11,'triangle');break;
   case 'loss':for(const [i,f]of [330,277,220].entries())tone(f,f*.99,.3,.12,i*.12);break;
   default:return false;
  }return true;
 }
 function cancel(){for(const timer of timers)clearTimeout(timer);timers.clear();for(const v of voices)try{v.source.stop();}catch{}voices.clear();}
 function test(){cancel();for(const [i,kind]of ['select','draw','place','guard','twist','capture','event'].entries()){const timer=setTimeout(()=>{timers.delete(timer);play(kind);},i*330);timers.add(timer);}}
 const visibility=()=>{if(document.hidden){cancel();stopAmbient();}else syncAmbient();};document.addEventListener('visibilitychange',visibility);
 return {setEnabled,play,test,cancel,setVolume(v){volume=Math.max(0,Math.min(1,Number(v)||0));if(ctx)master.gain.setTargetAtTime(enabled?volume*.2:0,ctx.currentTime,.025);},setAmbient(v){ambient=Boolean(v);syncAmbient();},setArena(v){arena=v;syncAmbient();},dispose(){cancel();stopAmbient();document.removeEventListener('visibilitychange',visibility);ctx?.close();}};
}
