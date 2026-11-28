import {DUEL_STICKERS,stickerSceneLayers,validStickerSlots} from '../platform/duel-stickers.mjs?v=premium-pair';
import {cosmeticTierLabel} from '../platform/cosmetic-shop.mjs';

export function bindDuelStickers(root,{send}) {
  const trigger = root.querySelector('.duel-sticker-toggle');
  const tray = root.querySelector('.duel-sticker-tray');
  const status = root.querySelector('[role=status]');
  const reactions = [root.querySelector('.duel-sticker-own'),root.querySelector('.duel-sticker-enemy')];
  const last = [null,null];
  let slots = [];
  let activeRound = null;
  let sending = false;
  let readyAt = 0;
  let statusTimer;

  function setTray(open) {
    tray.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
  }
  function announce(message) {
    clearTimeout(statusTimer);
    status.textContent = message;
    status.classList.toggle('duel-sticker-error',Boolean(message));
    if(message)statusTimer=setTimeout(()=>announce(''),3200);
  }

  function paintSlots(next) {
    if(!validStickerSlots(next) || (slots.length===next.length && slots.every((id,i)=>id===next[i])))return;
    slots=next;
    tray.replaceChildren(...next.map((id,index)=>{
      const {name,image,rarity} = DUEL_STICKERS[id];
      const button=document.createElement('button');
      button.type='button';
      button.dataset.slot=String(index+1);
      button.setAttribute('aria-label',rarity==='Standard'?name:name+' · '+cosmeticTierLabel(rarity));
      button.setAttribute('aria-keyshortcuts',button.dataset.slot);
      const icon=new Image();
      icon.src=image;
      icon.alt='';
      const key=document.createElement('kbd');
      key.textContent=button.dataset.slot;
      key.setAttribute('aria-hidden','true');
      button.append(icon,key);
      return button;
    }));
  }

  function stickerArt(sticker) {
    if(!('motion' in sticker)){
      const icon=new Image();
      icon.src=sticker.image;
      icon.alt=sticker.name;
      return icon;
    }
    const scene=document.createElement('span');
    scene.className='sticker-scene';
    scene.dataset.motion=sticker.motion;
    scene.setAttribute('data-play','');
    for(const {part,image} of stickerSceneLayers(sticker)){
      const layer=image?new Image():document.createElement('span');
      layer.className='sticker-'+part;
      if(image){
        layer.src=image;
        layer.alt=part==='character'?sticker.name:'';
      }
      if(part==='character'&&sticker.motion==='loot-goblin'){
        const pocket=document.createElement('span');
        pocket.className='sticker-pocket';
        pocket.append(layer);
        scene.append(pocket);
      }else{
        scene.append(layer);
      }
    }
    return scene;
  }

  function receive(snapshot) {
    if(!snapshot || activeRound===null)return;
    paintSlots(snapshot.slots);
    for(const event of snapshot.events??[]){
      if(!Object.hasOwn(DUEL_STICKERS,event.sticker))continue;
      const side=event.own?0:1;
      const previous=last[side];
      if(previous && (event.id===previous.id || event.at<=previous.at))continue;
      const target=reactions[side];
      clearTimeout(previous?.timeout);
      const sticker=DUEL_STICKERS[event.sticker];
      const presentation={id:event.id,at:event.at,timeout:undefined};
      last[side]=presentation;
      target.hidden=true;
      const art=stickerArt(sticker);
      const show=()=>{
        if(last[side]!==presentation)return;
        target.dataset.rarity=sticker.rarity??'Standard';
        target.replaceChildren(art);
        void target.offsetWidth;
        target.hidden=false;
        presentation.timeout=setTimeout(()=>{target.hidden=true;},'parts' in sticker?2300:2100);
      };
      if('parts' in sticker){
        // Start the animation only once each sprite is ready, including for the receiving player on a cold cache.
        void Promise.allSettled(Array.from(art.querySelectorAll('img'),image=>image.decode())).then(show);
      }else{
        show();
      }
    }
  }

  async function play(slot) {
    if(root.hidden||sending||slot<1||slot>slots.length)return;
    if(Date.now()<readyAt){announce('Wait before sending another sticker.');return;}
    const round = activeRound;
    sending=true;
    try {
      const result=await send(slot);
      readyAt=Date.now()+3000;
      if(activeRound===round){announce('');receive(result.stickers);}
    } catch(error) {
      if(activeRound===round)announce(error?.status===429?'Wait before sending another sticker.':'Sticker could not be sent. Try again.');
    } finally { sending=false; }
  }

  trigger.addEventListener('click',()=>setTray(tray.hidden));
  tray.addEventListener('click',event=>{
    const button=event.target.closest('button[data-slot]');
    if(button)void play(Number(button.dataset.slot));
  });
  document.addEventListener('keydown',event=>{
    if(root.hidden || !root.checkVisibility() || event.defaultPrevented || event.repeat || event.ctrlKey || event.altKey || event.metaKey ||
       event.target.closest?.('input, textarea, select, [contenteditable], dialog[open]') ||
       document.querySelector('dialog[open]'))return;
    const key=event.key.toLowerCase();
    if(key==='e'){event.preventDefault();setTray(tray.hidden);}
    if(/^[1-4]$/.test(key)){event.preventDefault();void play(Number(key));}
    if(key==='escape'&&!tray.hidden&&root.contains(document.activeElement)){
      event.preventDefault();event.stopImmediatePropagation();setTray(false);trigger.focus();
    }
  },{capture:true});

  return {
    sync(round,snapshot) {
      if(round!==activeRound){
        activeRound=round;
        setTray(false);
        for(const [side,target] of reactions.entries()){
          clearTimeout(last[side]?.timeout);
          last[side]=null;
          target.hidden=true;
        }
        announce('');
      }
      receive(snapshot);
      root.hidden=round===null||!slots.length;
    }
  };
}
