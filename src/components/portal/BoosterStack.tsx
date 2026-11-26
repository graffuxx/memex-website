import AlphaBoosterPack from './AlphaBoosterPack';
import './booster-stack.css';

export default function BoosterStack({count,onOpen,disabled=false,product='alpha'}:{count:number;onOpen?:()=>void;disabled?:boolean;product?:'alpha'|'beta'|'all'}){
 const label=`${count.toLocaleString()} unopened ${product==='alpha'?'Alpha ':product==='beta'?'Beta ':''}${count===1?'booster':'boosters'}`;
 const action=count>0?'Open a booster':product==='beta'?'View preview':'Get boosters';
 const content=<>
  <span className="booster-stack__art" aria-hidden="true">
   <AlphaBoosterPack compact beta={product==='beta'}/>
   <span className="booster-stack__count">×{count.toLocaleString()}</span>
  </span>
  <span className="booster-stack__copy">
   <strong>{product==='beta'?'Beta Preview Booster':product==='all'?'Your boosters':'Alpha Booster'}</strong>
   <span>{action} <span aria-hidden="true">→</span></span>
  </span>
 </>;
 if(onOpen&&count>0)return <button className="booster-stack" type="button" onClick={onOpen} disabled={disabled} aria-label={`Open a booster · ${label}`} data-count={count}>{content}</button>;
 const href=count>0?'/boosters?open=next'+(product==='all'?'':'&edition='+product):product==='beta'?'/shop#beta-booster-title':'/shop';
 return <a className="booster-stack" href={href} aria-label={`${action} · ${label}`} data-count={count}>{content}</a>;
}
