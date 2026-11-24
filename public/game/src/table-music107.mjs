// Arena music and weather share a clock, with separate volume and gain nodes.
export const MUSIC_URL107=new URL('../assets/audio/venom-arena-loop.mp3',import.meta.url);
export const WEATHER_URL107=new URL('../assets/audio/venom-weather-stem.mp3',import.meta.url);

export function createTableMusic107({context,output,weatherUrl=null,fetcher=fetch}){
 let active=false,disposed=false,volume=.16,master=.35,weatherEnabled=false;
 let source=null,storm=null,offset=0,started=0,duration=0,pending=null,epoch=0;
 const gain=context.createGain();
 const weatherGain=weatherUrl?context.createGain():null;
 for(const node of [gain,weatherGain]){
  if(!node)continue;
  node.gain.value=0;
  node.connect(output);
 }

 const target=()=>master*volume;
 const weatherTarget=()=>weatherEnabled?master*Math.min(.36,.18+volume*.38):0;

 function level(multiplier=1,seconds=0){
  const at=context.currentTime;
  for(const [node,value]of [[gain,target()],[weatherGain,weatherTarget()]]){
   if(!node)continue;
   node.gain.cancelScheduledValues(at);
   node.gain.setTargetAtTime(active?value*multiplier:0,at,.12);
   if(seconds>0&&active&&value>0)node.gain.setTargetAtTime(value,at+seconds,.35);
  }
 }

 function stop(){
  if(!source)return;
  offset=(offset+Math.max(0,context.currentTime-started))%duration;
  for(const node of [source,storm]){
   if(!node)continue;
   try{node.stop();}catch{}
   node.disconnect();
  }
  source=storm=null;
 }

 async function load(url){
  try{
   const response=await fetcher(url);
   if(response.ok)return await context.decodeAudioData(await response.arrayBuffer());
  }catch{}
  return null;
 }

 function loopingSource(buffer, destination){
  const node=context.createBufferSource();
  node.buffer=buffer;
  node.loop=true;
  node.loopStart=0;
  node.loopEnd=duration;
  node.connect(destination);
  node.start(started,offset%duration);
  return node;
 }

 async function sync(){
  if(disposed||!active||volume===0||master===0){stop();level();return false;}
  if(source){level();return true;}
  const token=epoch;
  if(!pending){
   pending=Promise.all([load(MUSIC_URL107),weatherUrl?load(weatherUrl):null]).then(result=>{
    if(!result[0])pending=null;
    return result;
   });
  }
  const [buffer,weather]=await pending;
  if(!buffer||disposed||!active||token!==epoch||volume===0||master===0||source||context.state!=='running')return Boolean(source);
  const aligned=weather&&Math.abs(weather.duration-buffer.duration)<=1/(context.sampleRate||48000);
  duration=aligned?Math.min(buffer.duration,weather.duration):buffer.duration;
  started=context.currentTime+(aligned ? .018 : 0);
  try{
   source=loopingSource(buffer,gain);
   if(aligned)storm=loopingSource(weather,weatherGain);
   level();
   return true;
  }catch{stop();return false;}
 }

 return {
  setActive(v){active=Boolean(v)&&!disposed;epoch++;return sync();},
  setVolume(v){volume=Math.max(0,Math.min(1,Number(v)||0));epoch++;return sync();},
  setMasterVolume(v){master=Math.max(0,Math.min(1,Number(v)||0));epoch++;return sync();},
  setWeatherEnabled(value){weatherEnabled=Boolean(value);if(!disposed)level();},
  duck(seconds=0){if(!disposed)level(seconds>0?.3:1,seconds);},
  get playing(){return Boolean(source);},
  getTimeline(){return source&&active&&!disposed&&volume>0&&master>0&&context.state==='running'?{position:(offset+Math.max(0,context.currentTime-started))%duration,duration}:null;},
  dispose(){if(disposed)return;disposed=true;active=false;epoch++;stop();gain.disconnect();weatherGain?.disconnect();}
 };
}
export function bindTableMusic107(audio,root=document,storage=globalThis.localStorage){
 let enabled=true,volume=.16;
 try{const saved=JSON.parse(storage.getItem('duelverse.music.v107'));if(saved){enabled=saved.enabled!==false;if(Number.isFinite(saved.volume))volume=Math.max(0,Math.min(.5,saved.volume));}}catch{}
 const toggle=root.getElementById('musicEnabled'),slider=root.getElementById('musicVolume');
 if(!toggle||!slider)return;
 const apply=()=>{audio.setMusicVolume(volume);audio.setMusicEnabled(enabled);toggle.checked=enabled;slider.value=String(Math.round(volume*100));slider.disabled=!enabled;};
 const save=()=>{try{storage.setItem('duelverse.music.v107',JSON.stringify({enabled,volume}));}catch{}};
 toggle.onchange=()=>{enabled=toggle.checked;apply();save();};slider.oninput=()=>{volume=Number(slider.value)/100;audio.setMusicVolume(volume);save();};apply();
}
