export function bindDuelExit112({leave,rated=()=>false,navigate=url=>location.assign(url)}){
 const dialog=document.createElement('dialog');
 dialog.className='duel-exit112';
 dialog.setAttribute('aria-labelledby','exitTitle112');
 dialog.innerHTML='<h2 id="exitTitle112">Dieses Duell aufgeben?</h2><p id="exitDetail112"></p><p id="exitError112" role="alert" hidden></p><div><button id="exitYes112" type="button">Aufgeben</button><button id="exitNo112" type="button">Weiterspielen</button></div>';
 document.body.append(dialog);
 const yes=dialog.querySelector('#exitYes112'),no=dialog.querySelector('#exitNo112'),error=dialog.querySelector('#exitError112');
 let leaving=false;
 function open(){
  if(dialog.open)return;
  dialog.querySelector('#exitDetail112').textContent=rated()
   ?'Du kehrst zur Startseite zurück. Im Random-Duell zählt das Aufgeben als Niederlage.'
   :'Das Duell wird beendet und du kehrst zur Startseite zurück.';
  error.hidden=true;
  dialog.showModal();
 }
 for(const id of ['leaveDuel112','startLeave112'])document.getElementById(id).onclick=open;
 no.onclick=()=>{if(!leaving)dialog.close();};
 dialog.addEventListener('cancel',event=>{if(leaving)event.preventDefault();});
 yes.onclick=async()=>{
  if(leaving)return;
  leaving=true;yes.disabled=no.disabled=true;yes.textContent='Wird gespeichert…';error.hidden=true;
  try{await leave();navigate('/');}
  catch(reason){
   leaving=false;yes.disabled=no.disabled=false;yes.textContent='Aufgeben';
   error.textContent=reason.message;error.hidden=false;
  }
 };
}
