'use client';

import {useEffect,useId,useRef} from 'react';
import {DEFINITIONS,RARITIES,getVariant} from '../../../public/game/platform/catalog.mjs';
import {printedValue126} from '../../../public/game/platform/card-ranks126.mjs';
import {ELEMENTS} from '../../../public/game/platform/elements53.mjs';
import {edgeLabels} from '../../../public/game/src/direction-controls.mjs';
import {releasedPortalAbility} from './cardAbilities';
import {ABILITIES,abilityDescription} from '../../../public/game/src/table-demo-rules.mjs';
import GameCardFace from './GameCardFace';
import './card-details.css';

const directions=edgeLabels(true);

export default function CardDetailsDialog({variantId,onClose}:{variantId:string|null;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),abilityId=useId();
 const variant=variantId?getVariant(variantId):null;
 const card=variant?DEFINITIONS.find(c=>c.id===variant.definitionId):null;
 const rarity=variant?RARITIES.find(r=>r.id===variant.rarity):null;
 const show=Boolean(variant&&card&&rarity);
 const abilityKey=card&&variant?releasedPortalAbility(card.ruleId,variant.id):null;
 const ability=abilityKey?ABILITIES[abilityKey as keyof typeof ABILITIES]:null;
 const description=abilityDescription(null,abilityKey);

 useEffect(()=>{
  const element=dialog.current;
  if(show&&!element?.open)element?.showModal();
  if(!show&&element?.open)element.close();
 },[show]);

 return <dialog ref={dialog} className="deck-preview-dialog" aria-label="Card preview" aria-describedby={ability?abilityId:undefined}
   onClose={onClose} onClick={event=>{if(event.target===event.currentTarget)event.currentTarget.close();}}>
  {variant&&card&&rarity&&<>
   <button type="button" className="deck-preview-close" aria-label="Close card preview" onClick={()=>dialog.current?.close()}>×</button>
   <GameCardFace card={card} variant={variant} color={rarity.color}/>
   <h2>{card.name}</h2>
   <p>{rarity.name} · {ELEMENTS[variant.element].name}{card.prime?' · Prime':card.iconic?' · Iconic':''}</p>
   {ability&&<section id={abilityId} className="card-preview-ability" aria-label="Ability" lang="de">
    <strong>{ability.name}</strong>
    <p>{description}</p>
   </section>}
   <div className="deck-preview-values">{directions.map((direction,i)=>{
    const [arrow,...position]=direction.split(' ');
    const value=printedValue126(card.values[i]);
    return <span key={direction} role="img" aria-label={position.join(' ')+' '+value}>{arrow}<b>{value}</b></span>;
   })}</div>
   <p className="muted">{card.quote}</p>
  </>}
 </dialog>;
}
