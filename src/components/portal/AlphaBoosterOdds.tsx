'use client';

import {useState} from 'react';
import {supabase} from '@/lib/supabaseClient';
import {ALPHA_ODDS,chanceOfClassInAlphaPack} from '../../../public/game/platform/alpha-booster36.mjs';
import {RARITIES} from '../../../public/game/platform/catalog.mjs';

type ClassOdds={prime:number;iconic:number;regular:number};
const classes=[['prime','Prime'],['iconic','Iconic']] as const;
const percent=(value:number)=>`${(value*100).toFixed(2)}%`;

export default function AlphaBoosterOdds(){
 const [odds,setOdds]=useState<ClassOdds|null>(null);
 const [status,setStatus]=useState<'idle'|'loading'|'ready'|'legacy'|'error'>('idle');

 async function loadOdds(){
  if(status==='loading')return;
  setStatus('loading');
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  try{
   const {data,error}=await supabase.rpc('dv_alpha_class_odds144').abortSignal(controller.signal);
   if(error?.code==='PGRST202'){
    setStatus('legacy');
    return;
   }
   if(error||!data||![data.prime,data.iconic,data.regular].every(n=>Number.isInteger(n)&&n>=0)||
      data.prime+data.iconic+data.regular!==10000){
    setStatus('error');
    return;
   }
   setOdds(data);
   setStatus('ready');
  }catch{
   setStatus('error');
  }finally{
   clearTimeout(timer);
  }
 }

 return <details className="booster-odds alpha-booster-odds" onToggle={event=>{
  if(event.currentTarget.open)void loadOdds();
 }}>
  <summary>Contents &amp; drop rates</summary>
  <p>Four slots use the standard finish rates. One slot guarantees Silver or higher. The five slots are shuffled. All Alpha Boosters use the same rules, including welcome gifts and quest rewards.</p>
  <table><thead><tr><th>Finish</th><th>Each standard slot</th><th>Guarantee slot</th></tr></thead><tbody>
   {RARITIES.map(r=><tr key={r.id}><th>{r.name}</th><td>{percent(Number(ALPHA_ODDS.standard.find(([id])=>id===r.id)?.[1]??0)/10000)}</td><td>{percent(Number(ALPHA_ODDS.guaranteed.find(([id])=>id===r.id)?.[1]??0)/10000)}</td></tr>)}
  </tbody></table>
  {status==='loading'&&<p role="status">Checking current card class rates…</p>}
  {status==='error'&&<p role="status">Card class rates could not be loaded. <button type="button" onClick={()=>void loadOdds()}>Retry</button></p>}
  {status==='legacy'&&<p>Within the rolled finish, each unacquired variant has an equal chance. After that finish is collected, duplicates are possible.</p>}
  {status==='ready'&&odds&&<>
   <table><thead><tr><th>Card class</th><th>Per card</th><th>At least one per booster</th></tr></thead><tbody>
    {classes.map(([id,label])=><tr key={id}><th>{label}</th><td>{percent(odds[id]/10000)}</td><td>{percent(chanceOfClassInAlphaPack(odds[id]))}</td></tr>)}
   </tbody></table>
   <p>Card class and finish are rolled separately. Duplicate protection prioritizes unacquired cards of the rolled class and finish, then allows repeats within that pool. It uses your acquisition history, including cards you recycled.</p>
  </>}
  <p>All Prime and Iconic finishes are exclusive to boosters. Cards are assigned when a pack is granted or purchased.</p>
 </details>;
}
