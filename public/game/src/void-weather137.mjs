// Cue positions from the approved Quiet Orbit / Void Weather v2 master.
// Visuals read the actual audio playhead, not accumulated render-frame time.
export const VOID_MUSIC137=Object.freeze({duration:192,title:'Quiet Orbit · Void Weather'});
export const VOID_WEATHER_CUES137=Object.freeze([
 [4,-.35],[26,.38],[49,-.18],[70.5,.3],[96,.12],
 [119,-.38],[143.5,.34],[168,-.1],[187,-.28]
].map(([at,pan])=>Object.freeze({at,pan})));
const duration=2.7,peakAt=Math.atan(2*Math.PI/duration)*duration/Math.PI;
const peak=Math.sin(Math.PI*peakAt/duration)**2*Math.exp(-peakAt);
export function voidMusicWeather137(timeline,animated=true){
 if(!animated||!Number.isFinite(timeline?.position)||!Number.isFinite(timeline?.duration)||timeline.duration<=0)return {left:0,right:0};
 const time=((timeline.position/timeline.duration*VOID_MUSIC137.duration)%VOID_MUSIC137.duration+VOID_MUSIC137.duration)%VOID_MUSIC137.duration;
 let left=0,right=0;
 for(const {at,pan}of VOID_WEATHER_CUES137){
  const age=(time-(at-.9)+VOID_MUSIC137.duration)%VOID_MUSIC137.duration;
  if(age>=duration)continue;
  const pulse=Math.min(1,Math.sin(Math.PI*age/duration)**2*Math.exp(-age)/peak);
  if(pan<0)left=Math.max(left,pulse);else right=Math.max(right,pulse);
 }
 return {left,right};
}
