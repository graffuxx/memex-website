export function edgeLabels(english=false){
 return english
  ?['→ Right','↘ Bottom right','↙ Bottom left','← Left','↖ Top left','↗ Top right']
  :['→ Rechts','↘ Unten rechts','↙ Unten links','← Links','↖ Oben links','↗ Oben rechts'];
}

export function twistLabels(ability,ready,hasTargets,english=false){
 const enemy=ability==='twist';
 if(english)return {
  title:enemy?'Turn an enemy card':'Turn an allied card',
  hint:!ready?'Choose where to play first.':hasTargets?'Tap a highlighted card to turn it one step right.':'No matching card next to this field.',
  skip:'Leave as is',
 };
 return {
  title:enemy?'Gegnerkarte drehen':'Eigene Karte drehen',
  hint:!ready?'Wähle zuerst ein freies Feld.':hasTargets?'Tippe auf eine markierte Karte. Sie dreht sich einen Schritt nach rechts.':'Hier liegt keine passende Nachbarkarte.',
  skip:'So lassen',
 };
}

export function updateTwistControl({wrapper,title,hint,select,ability,ready,targets,selected,busy,name,english=false}){
 wrapper.hidden=!ability;
 if(!ability)return;
 const labels=twistLabels(ability,ready,targets.length>0,english);
 title.textContent=labels.title;
 hint.textContent=labels.hint;
 const options=[new Option(labels.skip,''),...targets.map(cell=>new Option('↻ '+name(cell),cell))];
 const optionsKey=JSON.stringify(options.map(option=>[option.value,option.text]));
 if(select.dataset.options!==optionsKey){
  select.replaceChildren(...options);
  select.dataset.options=optionsKey;
 }
 select.value=selected??'';
 select.disabled=busy||!targets.length;
}

export function createTurnButtons(english,onChange){
 const group=document.createElement('div'),title=document.createElement('strong'),row=document.createElement('div');
 group.className='turn-choice';
 group.setAttribute('role','group');
 row.className='turn-choice__buttons';
 const choices=english?[[-1,'↶','Left'],[0,'','Keep'],[1,'↻','Right']]:[[-1,'↶','Links'],[0,'','So lassen'],[1,'↻','Rechts']];
 const buttons=choices.map(([turn,arrow,label])=>{
  const button=document.createElement('button');
  button.type='button';
  if(arrow){
   const icon=document.createElement('span');
   icon.textContent=arrow;
   icon.setAttribute('aria-hidden','true');
   button.append(icon,' ');
  }
  button.append(label);
  button.addEventListener('click',()=>onChange(turn));
  return {turn,button};
 });
 row.append(...buttons.map(({button})=>button));
 group.append(title,row);
 return {group,update({show,label,value,disabled,allowed}){
  group.hidden=!show;
  if(!show)return;
  title.textContent=label;
  group.setAttribute('aria-label',label);
  for(const {turn,button} of buttons){
   button.setAttribute('aria-pressed',String(turn===value));
   button.disabled=disabled||(turn!==0&&allowed&&!allowed.includes(turn));
  }
 }};
}
