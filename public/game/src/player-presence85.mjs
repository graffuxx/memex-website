import {DEFAULT_IDENTITY85,frame85,frameSvg85,portrait85,portraitMotion,progression85,title85} from '../platform/identity85.mjs';
import {readPlayerIdentity85} from '../platform/account-client50.mjs?v=identity-85';
function drawPortrait(node,identity){
 const frame=frame85(identity),portrait=portrait85(identity.avatarId),progress=progression85(identity.xp),wrap=document.createElement('span'),image=document.createElement('img'),ring=document.createElement('span');
 wrap.className='identity-portrait85';wrap.dataset.tier=frame.tier;const motion=portraitMotion(identity.avatarId);if(motion)wrap.dataset.portraitMotion=motion;wrap.style.setProperty('--portrait-size','62px');wrap.style.setProperty('--frame-color',frame.color);image.src=portrait.image;image.alt='';ring.className='identity-ring85';ring.innerHTML=frameSvg85(frame,progress.level);wrap.append(image,ring);node.replaceChildren(wrap);
}
export function mountPlayerPresence85(){
 const own=document.getElementById('ownPortrait85'),enemy=document.getElementById('enemyPortrait85'),name=document.getElementById('playerName85'),title=document.getElementById('playerTitle85');let ticket=0;
 const render=identity=>{drawPortrait(own,identity);name.textContent=identity.displayName;title.textContent=title85(identity);title.hidden=!title.textContent;own.title=identity.displayName+' · Level '+progression85(identity.xp).level;};
 render({...DEFAULT_IDENTITY85,displayName:'Guest',titleId:''});drawPortrait(enemy,{...DEFAULT_IDENTITY85,avatarId:'npc',titleId:''});
 return async function refresh(){const current=++ticket;try{const identity=await readPlayerIdentity85();if(current===ticket)render(identity??{...DEFAULT_IDENTITY85,displayName:'Guest',titleId:''});}catch{if(current===ticket)own.title='Player profile currently unavailable';}};
}
