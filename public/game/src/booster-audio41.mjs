// Original procedural pack Foley and rarity stingers: no external samples or requests.
const tone=(at,f,to,d,g=.1,type='sine',attack=.008,pan=0,mod=0)=>({at,f,to,d,g,type,attack,pan,mod});
const noise=(at,d,g,hz,end=hz,attack=.008,type='bandpass',pan=0)=>({at,d,g,hz,end,attack,type,pan});
export function boosterCue(kind){
 if(kind==='tear')return {duration:1.55,echo:false,tones:[tone(.68,155,72,.32,.14,'triangle')],noises:[...Array.from({length:7},(_,i)=>noise(i*.045,.055+(i%3)*.018,.20+(i%2)*.10,2800+i*330,1800,.004,'highpass',i%2?.15:-.15)),noise(.20,.53,.30,4100,1300,.035),noise(.74,.45,.16,3200,700,.02)]};
 if(!['common','rare','epic','legendary','mythic'].includes(kind))return null;
 const base={duration:.32,echo:false,tones:[tone(.065,610,320,.09,.075,'sine')],noises:[noise(0,.12,.17,2700,1100)]};
 if(kind==='common')return base;
 if(kind==='rare')return {...base,duration:.8,tones:[...base.tones,tone(.34,880,875,.35,.06),tone(.42,1320,1315,.26,.035)]};
 if(kind==='epic')return {...base,duration:1.9,echo:true,tones:[...base.tones,tone(.34,146.83,220,.38,.10,'triangle',.04),...[440,554.37,659.25].flatMap((f,i)=>[tone(.38+i*.065,f,f*.998,1.05,.10,'sine',.012,(i-1)*.22),tone(.38+i*.065,f*2.76,f*2.75,.62,.025,'sine',.008)])],noises:[...base.noises,noise(.18,.55,.12,1400,4200,.24,'bandpass')]};
 if(kind==='legendary')return {...base,duration:2.6,echo:true,tones:[...base.tones,...[1174.66,1567.98,1975.53,2349.32,1567.98,3135.96,2349.32].flatMap((f,i)=>[tone(.38+i*.095,f,f*.999,1.2,.065,'sine',.005,(i%3-1)*.52),tone(.38+i*.095,f*1.501,f*1.50,.65,.018,'sine',.004)])],noises:[...base.noises,noise(.22,.8,.07,5200,3100,.24,'highpass')]};
 return {...base,duration:5.25,echo:true,tones:[...base.tones,tone(.20,72,43,1.0,.17,'sine',.34),tone(.78,80,31,.82,.28,'sine',.008),tone(.80,155,63,.75,.095,'triangle',.015),...[[73.42,.10],[110,.075],[155.56,.055]].map(([f,g],i)=>tone(.84+i*.045,f,f*.986,3.45,g,'triangle',.3,(i-1)*.34,i===1?5:0)),tone(.74,680,125,1.8,.06,'sine',.035,-.3),tone(1.05,392,196,2.1,.045,'sine',.07,.4)],noises:[...base.noises,noise(.08,1.1,.25,3400,180,.57,'lowpass'),noise(.78,.52,.36,310,75,.012,'lowpass'),noise(1.0,3.6,.095,900,140,.2,'bandpass')]};
}
/** @param {{contextFactory?:()=>AudioContext,onState?:(state:{enabled:boolean,available:boolean,running:boolean,lastCue:string,playCount:number})=>void,setTimer?:typeof setTimeout,clearTimer?:typeof clearTimeout}} [options] */
export function createBoosterAudio({contextFactory,onState=()=>{},setTimer=setTimeout,clearTimer=clearTimeout}={}){
 let ctx=null,master=null,compressor=null,buffer=null,enabled=true,disposed=false,lastCue='',playCount=0;
 const voices=new Set();
 const available=()=>Boolean(contextFactory||globalThis.AudioContext||globalThis.webkitAudioContext);
 const notify=()=>onState({enabled,available:available(),running:ctx?.state==='running',lastCue,playCount});
 function ensure(){if(ctx)return;const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;ctx=contextFactory?contextFactory():new Audio({latencyHint:'interactive'});master=ctx.createGain();master.gain.value=.24;compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-14;compressor.knee.value=10;compressor.ratio.value=8;compressor.attack.value=.003;compressor.release.value=.16;master.connect(compressor).connect(ctx.destination);
  buffer=ctx.createBuffer(2,Math.ceil(ctx.sampleRate*1.2),ctx.sampleRate);for(let c=0;c<2;c++){const data=buffer.getChannelData(c);let seed=8641+c*193;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=(seed/4294967296*2-1)*.65;}}
 }
 function unlock(){if(disposed||!enabled||!available())return false;try{ensure();if(ctx.state!=='running')Promise.resolve(ctx.resume()).then(()=>{if(!disposed)notify();}).catch(()=>{});notify();return true;}catch{notify();return false;}}
 function remove(voice){if(voice.removed)return;voice.removed=true;clearTimer(voice.timer);for(const node of voice.nodes){try{node.stop?.();}catch{}try{node.disconnect();}catch{}}voices.delete(voice);}
 function stop(){if(!ctx)return;for(const voice of [...voices]){try{voice.bus.gain.cancelScheduledValues(ctx.currentTime);voice.bus.gain.setTargetAtTime(0,ctx.currentTime,.008);for(const source of voice.sources)source.stop(ctx.currentTime+.025);}catch{}clearTimer(voice.timer);voice.timer=setTimer(()=>remove(voice),55);}}
 function setEnabled(value){enabled=Boolean(value);if(!enabled)stop();if(master){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(enabled?.24:0,ctx.currentTime,.012);}notify();}
 function play(kind){const cue=boosterCue(kind);if(disposed||!enabled||!ctx||ctx.state==='closed'||globalThis.document?.hidden||!cue)return false;let voice;try{
  // A rare pull must not become a wall of overlapping stingers.
  if(kind==='mythic')stop();if(voices.size>=4)remove(voices.values().next().value);
  const bus=ctx.createGain();bus.gain.value=1;bus.connect(master);voice={bus,nodes:[bus],sources:[],timer:null,removed:false};voices.add(voice);
  const add=node=>(voice.nodes.push(node),node),source=node=>(voice.sources.push(node),add(node));const now=ctx.currentTime+.008;
  if(cue.echo){const delay=add(ctx.createDelay(.5)),feedback=add(ctx.createGain()),wet=add(ctx.createGain());delay.delayTime.value=kind==='mythic'?.225:.145;feedback.gain.value=kind==='mythic'?.22:.15;wet.gain.value=.16;bus.connect(delay);delay.connect(feedback).connect(delay);delay.connect(wet).connect(master);}
  function envelope(amp,p){const t=now+p.at;const attack=Math.min(p.attack,p.d*.8);amp.gain.setValueAtTime(.0001,t);amp.gain.exponentialRampToValueAtTime(p.g,t+attack);amp.gain.exponentialRampToValueAtTime(.0001,t+p.d);}
  function pan(input,value){if(!ctx.createStereoPanner){input.connect(bus);return;}const p=add(ctx.createStereoPanner());p.pan.value=value;input.connect(p).connect(bus);}
  for(const p of cue.tones){const t=now+p.at,osc=source(ctx.createOscillator()),amp=add(ctx.createGain());osc.type=p.type;osc.frequency.setValueAtTime(p.f,t);osc.frequency.exponentialRampToValueAtTime(p.to,t+p.d);envelope(amp,p);osc.connect(amp);pan(amp,p.pan);osc.start(t);osc.stop(t+p.d+.02);
   if(p.mod){const mod=source(ctx.createOscillator()),depth=add(ctx.createGain());mod.frequency.setValueAtTime(p.mod,t);mod.frequency.exponentialRampToValueAtTime(.7,t+p.d);depth.gain.value=3.5;mod.connect(depth).connect(osc.frequency);mod.start(t);mod.stop(t+p.d+.02);}
  }
  for(const p of cue.noises){const t=now+p.at,n=source(ctx.createBufferSource()),filter=add(ctx.createBiquadFilter()),amp=add(ctx.createGain());n.buffer=buffer;n.loop=true;filter.type=p.type;filter.Q.value=.8;filter.frequency.setValueAtTime(p.hz,t);filter.frequency.exponentialRampToValueAtTime(Math.max(35,p.end),t+p.d);envelope(amp,p);n.connect(filter).connect(amp);pan(amp,p.pan);n.start(t,p.at%.5);n.stop(t+p.d+.02);}
  voice.timer=setTimer(()=>remove(voice),(cue.duration+.15)*1000);lastCue=kind;playCount++;notify();return true;}catch{if(voice)remove(voice);return false;}
 }
 function suspend(){stop();if(ctx&&ctx.state!=='closed')Promise.resolve(ctx.suspend()).catch(()=>{});}
 function dispose(){if(disposed)return;disposed=true;for(const voice of [...voices])remove(voice);try{master?.disconnect();compressor?.disconnect();if(ctx?.state!=='closed')Promise.resolve(ctx?.close()).catch(()=>{});}catch{}buffer=null;}
 return {unlock,play,stop,setEnabled,suspend,dispose,get available(){return available();}};
}
