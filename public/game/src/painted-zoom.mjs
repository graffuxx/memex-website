export function bindPaintedZoom(stage,onZoom){
 const controls=document.createElement('div');controls.className='arena-zoom';controls.setAttribute('role','group');controls.setAttribute('aria-label','Arena-Zoom');controls.hidden=true;
 const button=(label,text)=>{const el=document.createElement('button');el.type='button';el.setAttribute('aria-label',label);el.textContent=text;controls.append(el);return el;};
 const minus=button('Arena verkleinern','−'),reset=button('Arena auf Übersicht zurücksetzen','100%'),plus=button('Arena vergrößern','+'),hint=document.createElement('small');hint.textContent='68° fest · Mausrad: Zoom';controls.append(hint);stage.append(controls);
 let enabled=false,requested=1,minimum=.85,maximum=1.12;
 function request(value){requested=Math.max(minimum,Math.min(maximum,value));minus.disabled=requested<=minimum+.001;plus.disabled=requested>=maximum-.001;onZoom(requested);}
 minus.onclick=()=>request(requested/1.06);plus.onclick=()=>request(requested*1.06);reset.onclick=()=>request(1);
 function wheel(event){if(!enabled||event.ctrlKey||event.metaKey||event.target.closest('button,input,select,textarea'))return;const y=event.clientY-stage.getBoundingClientRect().top;if(y<70||y>stage.clientHeight-125)return;event.preventDefault();const pixels=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?stage.clientHeight:1);request(requested*Math.exp(-Math.max(-160,Math.min(160,pixels))*.00065));}
 stage.addEventListener('wheel',wheel,{passive:false});
 return {setVisible(value){enabled=value;controls.hidden=!value;},setState({value,min,max}){requested=value;minimum=min;maximum=max;stage.dataset.pannable='false';reset.textContent=Math.round(value*100)+'%';reset.title='Startansicht · feste 68°';minus.disabled=value<=min+.001;plus.disabled=value>=max-.001;},dispose(){stage.removeEventListener('wheel',wheel);controls.remove();}};
}
