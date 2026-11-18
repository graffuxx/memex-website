// Painted depth layers share the page background without another game renderer.
export function createVoidAtmosphere(){
 const root=document.createElement('div');root.className='void-atmosphere';root.setAttribute('aria-hidden','true');root.inert=true;
 for(const name of ['matte','mist','rocks-left','rocks-right']){const layer=document.createElement('div');layer.className='void-painted-'+name;root.append(layer);}
 let seed=20261117;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<30;i++){
  const star=document.createElement('i');star.className='void-spark'+(i%7===0?' bright':'');
  const values={'--x':(random()*100).toFixed(2)+'%','--y':(random()*100).toFixed(2)+'%','--size':(i%7===0?2:1+random()*.6).toFixed(2)+'px','--duration':(20+random()*30).toFixed(2)+'s','--delay':(-random()*50).toFixed(2)+'s','--drift':(-10+random()*20).toFixed(2)+'px'};
  for(const [key,value]of Object.entries(values))star.style.setProperty(key,value);root.append(star);
 }
 document.body.prepend(root);let enabled=true;const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const sync=()=>{root.dataset.motion=enabled&&!document.hidden&&!preference.matches?'on':'off';};
 document.addEventListener('visibilitychange',sync);preference.addEventListener('change',sync);sync();
 return {setMotion(value){enabled=Boolean(value);sync();},dispose(){document.removeEventListener('visibilitychange',sync);preference.removeEventListener('change',sync);root.remove();}};
}
