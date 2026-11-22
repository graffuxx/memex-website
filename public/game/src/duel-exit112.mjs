export function bindDuelExit112({leave,navigate=url=>location.assign(url)}){
 const dialog=document.createElement('dialog');dialog.className='duel-exit112';dialog.setAttribute('aria-labelledby','exitTitle112');
 dialog.innerHTML='<h2 id="exitTitle112">Leave this duel?</h2><p>Leaving a Random duel counts as a defeat. Private and solo exits are unranked. Unfinished rounds give no rewards.</p><p id="exitError112" role="alert" hidden></p><div><button id="exitYes112" type="button">Leave now</button><button id="exitNo112" type="button">Keep playing</button></div><a href="/play">Open match lobby</a>';document.body.append(dialog);
 const yes=dialog.querySelector('#exitYes112'),no=dialog.querySelector('#exitNo112'),error=dialog.querySelector('#exitError112');let leaving=false;
 const ask=()=>{if(!dialog.open)dialog.showModal();};
 for(const id of['leaveDuel112','startLeave112','resign90']){const button=document.getElementById(id);if(button)button.onclick=ask;}
 no.onclick=()=>{if(!leaving)dialog.close();};dialog.addEventListener('cancel',e=>{if(leaving)e.preventDefault();});
 yes.onclick=async()=>{if(leaving)return;leaving=true;yes.disabled=no.disabled=true;yes.textContent='Leaving…';error.hidden=true;try{await leave();navigate('/play');}catch(e){leaving=false;error.hidden=false;error.textContent=e.message;yes.disabled=no.disabled=false;yes.textContent='Leave now';}};
 return {open:ask};
}
