import {DEFINITIONS,getVariant} from '../platform/catalog.mjs';
import {ELEMENTS,elementSvg} from '../platform/elements53.mjs';
import {printedValue126} from '../platform/card-ranks126.mjs';
import {alphaNameplateMarkup} from '../platform/edition36.mjs';
import {cardOf,sideValue} from './rules.mjs?v=booster-classes-140';
import {ABILITIES,abilityDescription} from './table-demo-rules.mjs?v=alpha-primes';
import {cardAbilityIconMarkup} from './card-ability-icon.mjs?v=alpha-primes';
import {DEMO_PROFILES} from './table-demo-state.mjs?v=tie-break-63';
import {FRAME_LAYOUT} from './card-layout21.mjs';
import {materialFrameUrl,materialOf} from './card-materials22.mjs';
import {fieldFeedback129} from './field-feedback129.mjs?v=alpha-primes';

const definitions=new Map(DEFINITIONS.map(card=>[card.id,card]));
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hex=Array.from({length:6},(_,i)=>{
 const angle=(i*60-30)*Math.PI/180;
 return `${.96*Math.cos(angle)},${.96*Math.sin(angle)}`;
}).join(' ');
const fallbackFrame='/game/assets/cards/frame-v21/navy-gold-frame.webp';

export function boardPreviewFace146(game,cell){
 const card=game?.board[cell];
 if(!card)return null;
 const rules=cardOf(card),id=DEMO_PROFILES[card.id];
 const variant=getVariant(card.variantId)??getVariant(id+':'+(card.rarity??'common'))??getVariant(id+':common');
 if(!variant||!rules)return null;
 const definition=definitions.get(variant.definitionId),feedback=fieldFeedback129(game,card,cell);
 const ability=ABILITIES[card.ability];
 return {card,variant,rules,definition,feedback,ability:ability?{name:ability.name,description:abilityDescription(game,card.ability)+(card.objectionSpent?' · Einspruch verbraucht.':'')}:null,values:feedback.bonuses.map((bonus,side)=>sideValue(card,side)+bonus)};
}

export function bindBoardCardPreview146(stage,svg,{getGame,canInspect,onPinChange=()=>{}}){
 const panel=document.createElement('aside'),face=document.createElement('div'),title=document.createElement('strong'),details=document.createElement('small'),abilityPanel=document.createElement('div'),abilityName=document.createElement('b'),abilityText=document.createElement('p'),closeButton=document.createElement('button');
 panel.className='board-card-preview';
 panel.hidden=true;
 panel.setAttribute('aria-label','Kartenvorschau');
 face.className='board-card-preview__face';
 abilityPanel.className='board-card-preview__ability';
 abilityPanel.append(abilityName,abilityText);
 closeButton.className='board-card-preview__close';
 closeButton.type='button';
 closeButton.textContent='×';
 closeButton.setAttribute('aria-label','Kartenvorschau schließen');
 panel.append(face,title,details,abilityPanel,closeButton);
 stage.append(panel);
 let hovered=null,pinned=null,key='',revision=0;

 function sync(){
  const cell=pinned??hovered;
  const data=cell&&canInspect()?boardPreviewFace146(getGame(),cell):null;
  panel.hidden=!data;
  if(!data){
   if(!getGame()?.board[pinned])pinned=null;
   return;
  }
  const {card,variant,rules,definition,feedback,ability,values}=data,material=materialOf(variant.rarity);
  const node=svg.querySelector(`[data-cell="${CSS.escape(cell)}"]`);
  const rect=stage.getBoundingClientRect(),anchor=node?.getBoundingClientRect();
  panel.dataset.side=anchor&&anchor.left+anchor.width/2>rect.left+rect.width/2?'left':'right';
  panel.dataset.pinned=String(Boolean(pinned));
  panel.setAttribute('aria-hidden',String(!pinned));
  closeButton.hidden=!pinned;
  const next=JSON.stringify([variant.id,card.uid,card.controller,values,feedback,card.ability,ability]);
  if(next===key)return;
  key=next;
  const current=++revision;
  const crop=variant.artRegion,width=crop?1.92/crop.w:1.92,height=crop?1.92/crop.h:1.92;
  const label=(definition?.short??rules.name).toUpperCase();
  const element=elementSvg(rules.element)
   .replace('width="256" height="256"',`x="-.1225" y="${-FRAME_LAYOUT.elementY-.1225}" width=".245" height=".245"`)
   .replace('id="e"', 'id="board-preview-element"').replaceAll('url(#e)', 'url(#board-preview-element)');
  const category=definition?.prime?'PRIME':definition?.iconic?'ICONIC':'';
  face.innerHTML=`<svg viewBox="-1.048 -1.048 2.096 2.096" role="img" aria-label="${escape(rules.name)}">
   <defs><clipPath id="board-preview-art"><polygon points="${hex}"/></clipPath></defs>
   <image href="${escape(variant.image)}" x="${-.96-(crop?.x??0)*width}" y="${-.96-(crop?.y??0)*height+(variant.artOffsetY??0)}" width="${width}" height="${height}" preserveAspectRatio="${crop?'none':'xMidYMid slice'}" clip-path="url(#board-preview-art)"/>
   <image data-frame href="${fallbackFrame}" x="${-FRAME_LAYOUT.width/2}" y="${-FRAME_LAYOUT.height/2}" width="${FRAME_LAYOUT.width}" height="${FRAME_LAYOUT.height}" preserveAspectRatio="none"/>
   ${cardAbilityIconMarkup(card.ability)}
   ${category?`<text x="0" y="-.748" fill="#ffe1a0" font-size=".06">${category}</text>`:''}
   <g fill="#17150d" font-size=".1995">${FRAME_LAYOUT.values.map(([x,y],i)=>{
    const boosted=feedback.bonuses[i]>0,value=boosted?values[i]:printedValue126(values[i]);
    return `<text x="${x}" y="${-y+.0093}"${boosted?' fill="#823300"':''}>${value}</text>`;
   }).join('')}</g>
   <text x="0" y="${-FRAME_LAYOUT.titleY+.004}" fill="#17150d" font-size=".105"${label.length>10?' textLength=".66" lengthAdjust="spacingAndGlyphs"':''}>${escape(label)}</text>
   ${variant.edition==='alpha'||variant.edition==='recruiter'?alphaNameplateMarkup(FRAME_LAYOUT.titleY):''}
   ${element}
  </svg>`;
  panel.style.setProperty('--preview-finish',material.color);
  panel.dataset.owner=String(card.controller);
  title.textContent=rules.name;
  details.textContent=[material.name,ELEMENTS[rules.element]?.name,card.controller===0?'Deine Karte':'Gegnerische Karte'].filter(Boolean).join(' · ');
  abilityPanel.hidden=!ability;
  if(ability){
   abilityName.textContent=ability.name+(feedback.silenced?' · blockiert':'');
   abilityText.textContent=ability.description;
  }
  void materialFrameUrl(variant.rarity).then(url=>{
   if(revision===current)face.querySelector('[data-frame]')?.setAttribute('href',url);
  }).catch(()=>{});
 }

 function hover(event){
  if(event.type.startsWith('pointer')&&event.pointerType!=='mouse')return;
  const target=event.type.endsWith('out')?event.relatedTarget:event.target;
  const node=target instanceof Element?target.closest('[data-cell]'):null;
  const cell=node&&svg.contains(node)?node.dataset.cell:null;
  const next=cell&&getGame()?.board[cell]?cell:null;
  if(hovered!==next){hovered=next;sync();}
 }
 const close=()=>{
  if(!pinned)return false;
  pinned=hovered=null;
  sync();
  onPinChange();
  return true;
 };
 for(const type of ['pointerover','pointerout','focusin','focusout'])svg.addEventListener(type,hover);
 closeButton.addEventListener('click',close);
 return {
  sync,close,
  get pinnedCell(){return pinned;},
  clear(){pinned=hovered=null;sync();},
  toggle(cell){
   if(!canInspect()||!getGame()?.board[cell])return false;
   if(cell===pinned)close();
   else{pinned=cell;sync();onPinChange();}
   return true;
  }
 };
}
