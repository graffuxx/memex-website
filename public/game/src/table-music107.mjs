// One local, original soundtrack. Playback follows the game's audio gesture/mute.
export const MUSIC_URL107=new URL('../assets/audio/quiet-orbit-void-weather-v137.mp3',import.meta.url);
export function createTableMusic107({context,output,fetcher=fetch}){
 let active=false,disposed=false,volume=.16,master=.35,source=null,offset=0,started=0,buffer=null,pending=null,epoch=0;
 const gain=context.createGain();gain.gain.value=0;gain.connect(output);
 const target=()=>master*volume;
 function level(multiplier=1){gain.gain.cancelScheduledValues(context.currentTime);gain.gain.setTargetAtTime(active?target()*multiplier:0,context.currentTime,.12);}
 function stop(){if(!source)return;offset=(offset+Math.max(0,context.currentTime-started))%(buffer?.duration||1);try{source.stop();}catch{}source.disconnect();source=null;}
 async function sync(){
  if(disposed||!active||volume===0||master===0){stop();level();return false;}
  if(source){level();return true;}
  const token=epoch;
  try{
   if(!pending)pending=fetcher(MUSIC_URL107).then(r=>{if(!r.ok)throw Error('Music unavailable');return r.arrayBuffer();}).then(bytes=>context.decodeAudioData(bytes)).catch(()=>{pending=null;return null;});
   buffer=await pending;
   if(!buffer||disposed||!active||token!==epoch||volume===0||master===0||source||context.state!=='running')return Boolean(source);
   const next=context.createBufferSource();next.buffer=buffer;next.loop=true;next.loopStart=0;next.loopEnd=buffer.duration;next.connect(gain);started=context.currentTime;next.start(0,offset%buffer.duration);source=next;level();return true;
  }catch{return false;}
 }
 return {
  setActive(v){active=Boolean(v)&&!disposed;epoch++;return sync();},
  setVolume(v){volume=Math.max(0,Math.min(1,Number(v)||0));epoch++;return sync();},
  setMasterVolume(v){master=Math.max(0,Math.min(1,Number(v)||0));epoch++;return sync();},
  duck(seconds=0){if(disposed)return;level(seconds>0?.3:1);if(seconds>0&&active)gain.gain.setTargetAtTime(target(),context.currentTime+seconds,.35);},
  get playing(){return Boolean(source);},
  getTimeline(){return source&&active&&!disposed&&volume>0&&master>0&&context.state==='running'?{position:(offset+Math.max(0,context.currentTime-started))%buffer.duration,duration:buffer.duration}:null;},
  dispose(){if(disposed)return;disposed=true;active=false;epoch++;stop();gain.disconnect();}
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
