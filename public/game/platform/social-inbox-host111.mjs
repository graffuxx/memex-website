// A separate browsing context shares the account session without adding another
// authentication client or input handlers to the game's rendering loop.
if(window.top===window.self){
 const frame=document.createElement('iframe');frame.src='/game/social-inbox111.html?v=friend-signals';frame.title='Friends and duel invitations';frame.setAttribute('aria-label',frame.title);
 Object.assign(frame.style,{position:'fixed',right:'0',bottom:'0',width:'0',height:'0',maxWidth:'100vw',maxHeight:'100dvh',border:'0',zIndex:'1500',background:'transparent'});
 document.body.append(frame);
 for(const opener of document.querySelectorAll('[data-friends-inbox]')){
  opener.addEventListener('click',event=>{
   if(!Number.parseFloat(frame.style.width)||frame.hidden||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   event.preventDefault();
   frame.contentWindow?.postMessage({type:'duelverse-social111-open'},location.origin);
  });
 }
 window.addEventListener('pointerdown',event=>{
  if(event.target instanceof Element&&event.target.closest('[data-friends-inbox]'))return;
  frame.contentWindow?.postMessage({type:'duelverse-social111-close'},location.origin);
 });
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
  const data=event.data;
  if(data?.type==='duelverse-social111-size'&&Number.isFinite(data.width)&&Number.isFinite(data.height)){
   frame.style.width=Math.max(0,Math.min(390,data.width))+'px';frame.style.height=Math.max(0,Math.min(window.innerHeight,data.height))+'px';frame.hidden=!data.width;
  }
  if(data?.type==='duelverse-social115-lobby'&&typeof data.id==='string'&&/^[0-9a-f-]{36}$/i.test(data.id)&&typeof data.friendName==='string'&&data.friendName.length<=24)location.assign('/play?friend='+encodeURIComponent(data.friendName));
  if(data?.type==='duelverse-social111-join'&&typeof data.id==='string'&&/^[0-9a-f-]{36}$/i.test(data.id))location.assign('/game/online.html?match='+encodeURIComponent(data.id));
 });
}
