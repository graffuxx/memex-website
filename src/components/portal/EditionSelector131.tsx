'use client';
import {SETS131,editionProgress131} from '../../../public/game/platform/edition-catalog131.mjs';
import './editions131.css';
export default function EditionSelector131({value,onChange,inventory,compact=false}:{value:string;onChange:(id:string)=>void;inventory:Record<string,number>;compact?:boolean}){
 const selected=SETS131.find(s=>s.id===value)??SETS131[0],s=editionProgress131(selected.id,inventory);
 return <section className={'edition131'+(compact?' edition131--compact':'')} aria-label="Card editions"><div className="edition131-heading"><nav aria-label="Filter by edition">{SETS131.length>1&&<button aria-pressed={value==='all'} onClick={()=>onChange('all')}>All editions</button>}{SETS131.map(set=><button key={set.id} aria-pressed={value===set.id} onClick={()=>onChange(set.id)}><i>{set.mark}</i>{set.name}</button>)}</nav><span><b>{s.collected} / {s.size}</b> motifs collected</span></div><div className="edition131-progress"><progress value={s.collected} max={s.size} aria-label={`${s.name} collection progress`}/><span>{s.released} playable · {s.pending} in development</span></div><div className="edition131-categories">{Object.entries(s.categories).map(([kind,count])=><span key={kind}><b>{kind==='regular'?'Regular':kind==='prime'?'Prime':'Iconic'}</b> {count.released}/{count.size}</span>)}</div></section>;
}
