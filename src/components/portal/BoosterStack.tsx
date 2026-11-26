import AlphaBoosterPack from './AlphaBoosterPack';
import './booster-stack.css';

export default function BoosterStack({count,onOpen,disabled=false,product='alpha'}:{count:number;onOpen?:()=>void;disabled?:boolean;product?:'alpha'|'beta'|'all'}){
 const label=`${count.toLocaleString()} unopened ${product==='alpha'?'Alpha ':product==='beta'?'Beta ':''}${count===1?'booster':'boosters'}`;
 const content=<>
  <span className="booster-stack__art" aria-hidden="true">
   <AlphaBoosterPack compact beta={product==='beta'}/>
   <span className="booster-stack__count">×{count.toLocaleString()}</span>
  </span>
  <span className="booster-stack__copy">
   <strong>{product==='beta'?'Beta Preview Booster':product==='all'?'Your boosters':'Alpha Booster'}</strong>
   <span>{count>0?'Open a booster':'Get boosters'} <span aria-hidden="true">→</span></span>
  </span>
 </>;
 if(onOpen&&count>0)return <button className="booster-stack" type="button" onClick={onOpen} disabled={disabled} aria-label={`Open a booster · ${label}`} data-count={count}>{content}</button>;
 return <a className="booster-stack" href={count>0?'/boosters?open=next'+(product==='all'?'':'&edition='+product):'/shop'} aria-label={`${count>0?'Open a booster':'Get boosters'} · ${label}`} data-count={count}>{content}</a>;
}
