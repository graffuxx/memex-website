// The separate thunder stem and the arena shader use these same score positions.
const bpm=110,barSeconds=4*60/bpm;
export const VOID_MUSIC137=Object.freeze({duration:40*barSeconds,bpm,title:'Venom'});
export const VOID_WEATHER_CUES137=Object.freeze([
 [2,-.44,.24],[7,.46,.27],[12,-.22,.19],[18,.34,.20],
 [23,-.41,.25],[29,.44,.29],[34,-.25,.22],[38,.29,.25]
].map(([bar,pan,thunderDelay])=>Object.freeze({at:bar*barSeconds,pan,thunderDelay})));
const duration=2.7,peakAt=Math.atan(2*Math.PI/duration)*duration/Math.PI;
const peak=Math.sin(Math.PI*peakAt/duration)**2*Math.exp(-peakAt);
export function voidMusicWeather137(timeline,animated=true){
 if(!animated||!Number.isFinite(timeline?.position)||!Number.isFinite(timeline?.duration)||timeline.duration<=0)return {left:0,right:0};
 const time=((timeline.position/timeline.duration*VOID_MUSIC137.duration)%VOID_MUSIC137.duration+VOID_MUSIC137.duration)%VOID_MUSIC137.duration;
 let left=0,right=0;
 for(const {at,pan}of VOID_WEATHER_CUES137){
  const age=(time-(at-peakAt)+VOID_MUSIC137.duration)%VOID_MUSIC137.duration;
  if(age>=duration)continue;
  const pulse=Math.min(1,Math.sin(Math.PI*age/duration)**2*Math.exp(-age)/peak);
  if(pan<0)left=Math.max(left,pulse);else right=Math.max(right,pulse);
 }
 return {left,right};
}
