// Slow, separated cloud-light pulses. No rapid flashes or full-screen brightness changes.
export const VOID_STORM_TIMING79=Object.freeze({period:18.2,duration:1.65,left:3,right:11.6});
export function voidStormState79(seconds,animated=true){
 if(!animated||!Number.isFinite(seconds))return {left:0,right:0};
 const t=Math.max(0,seconds),pulse=offset=>{const age=((t-offset)%VOID_STORM_TIMING79.period+VOID_STORM_TIMING79.period)%VOID_STORM_TIMING79.period;return age<VOID_STORM_TIMING79.duration?Math.sin(age/VOID_STORM_TIMING79.duration*Math.PI)**2:0;};
 return {left:pulse(VOID_STORM_TIMING79.left),right:pulse(VOID_STORM_TIMING79.right)};
}
