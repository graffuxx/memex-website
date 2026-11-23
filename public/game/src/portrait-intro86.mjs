// Presentation only: start-right rules, saved profiles and game state stay separate.
export function bindPortraitIntro86(dialog,{motion=()=>true,doc=document,win=window}={}){
 const find=id=>doc.getElementById(id),pairs=[['ownPortrait85','startOwnPortrait86'],['enemyPortrait85','startEnemyPortrait86']];
 if(!dialog||!pairs.every(pair=>pair.every(id=>find(id)))||!find('startOwnName86')||!find('startOwnTitle86'))return {open(){},fly(){return Promise.resolve();},cancel(){}};
 let observer=null,flight=null,run=0;
 function sync(){
  for(const [source,target] of pairs){const node=find(source)?.querySelector('.identity-portrait85');if(!node)continue;const copy=node.cloneNode(true);copy.style.setProperty('--portrait-size','var(--start-portrait-size86)');find(target)?.replaceChildren(copy);}
  const name=find('startOwnName86'),title=find('playerTitle85'),targetTitle=find('startOwnTitle86');
  if(name)name.textContent=find('playerName85')?.textContent??'';
  if(targetTitle){targetTitle.textContent=title?.textContent??'';targetTitle.hidden=!title||title.hidden||!title.textContent;}
 }
 function settle(){if(!flight)return;const current=flight;flight=null;win.clearTimeout(current.timer);for(const a of current.animations)try{a.cancel();}catch{}current.layer.remove();doc.body.dataset.portraitStage86='docked';current.resolve();}
 function stopWatching(){observer?.disconnect();observer=null;}
 const interrupt=()=>settle();
 win.addEventListener('resize',interrupt);doc.addEventListener('visibilitychange',()=>{if(doc.hidden)settle();});
 doc.addEventListener('keydown',event=>{if(event.code==='Escape'&&flight)settle();});
 return {
  open(){run++;settle();stopWatching();find('ownPortrait85')?.closest('.scorebar')?.scrollIntoView({block:'nearest',behavior:'instant'});sync();doc.body.dataset.portraitStage86='opening';if(typeof MutationObserver==='function'){observer=new MutationObserver(sync);for(const id of ['ownPortrait85','enemyPortrait85','playerName85','playerTitle85']){const node=find(id);if(node)observer.observe(node,{childList:true,characterData:true,subtree:true});}}},
  fly(){
   stopWatching();sync();const token=++run;
   if(!motion()||win.matchMedia('(prefers-reduced-motion: reduce)').matches||doc.hidden){doc.body.dataset.portraitStage86='docked';return Promise.resolve();}
   const layer=doc.createElement('div');layer.className='portrait-flight-layer86';layer.setAttribute('aria-hidden','true');
   const moves=[];
   for(const [target,source] of pairs){
    const from=find(source)?.querySelector('.identity-portrait85'),to=find(target)?.querySelector('.identity-portrait85');if(!from||!to)continue;
    const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();if(!a.width||!a.height||!b.width||!b.height)continue;
    const copy=from.cloneNode(true);copy.classList.add('portrait-flight86');copy.style.setProperty('--portrait-size',a.width+'px');Object.assign(copy.style,{left:a.left+'px',top:a.top+'px',width:a.width+'px',height:a.height+'px'});layer.append(copy);
    moves.push({copy,dx:b.left-a.left,dy:b.top-a.top,scale:b.width/a.width});
   }
   if(moves.length!==2){doc.body.dataset.portraitStage86='docked';return Promise.resolve();}
   doc.body.append(layer);doc.body.dataset.portraitStage86='flying';
   return new Promise(resolve=>{
    flight={layer,animations:[],resolve,timer:null};
    try{
     for(const {copy,dx,dy,scale} of moves)flight.animations.push(copy.animate([
      {transform:'translate3d(0,0,0) scale(1)',offset:0},
      {transform:`translate3d(${dx*.48}px,${dy*.46-35}px,0) scale(${1+(scale-1)*.5})`,offset:.52},
      {transform:`translate3d(${dx}px,${dy}px,0) scale(${scale})`,offset:1}
     ],{duration:1050,easing:'cubic-bezier(.25,.1,.18,1)',fill:'forwards'}));
     Promise.all(flight.animations.map(a=>a.finished)).then(()=>{if(token===run)settle();}).catch(()=>{if(token===run)settle();});
     // Backgrounding, resizing, cancellation and unsupported animations cannot stall a turn.
     flight.timer=win.setTimeout(()=>{if(token===run)settle();},1500);
    }catch{settle();}
   });
  },
  cancel(){run++;stopWatching();settle();delete doc.body.dataset.portraitStage86;}
 };
}
