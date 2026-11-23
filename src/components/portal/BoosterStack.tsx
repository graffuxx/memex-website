import AlphaBoosterPack from './AlphaBoosterPack';
import './booster-stack.css';

export default function BoosterStack({count,onOpen,disabled=false}:{count:number;onOpen?:()=>void;disabled?:boolean}){
 const label=`${count.toLocaleString()} unopened Alpha ${count===1?'booster':'boosters'}`;
 const content=<>
  <span className="booster-stack__art" aria-hidden="true">
   <AlphaBoosterPack compact/>
   <span className="booster-stack__count">×{count.toLocaleString()}</span>
  </span>
  <span className="booster-stack__copy">
   <strong>Alpha Booster</strong>
   <span>{count>0?'Open a booster':'Get boosters'} <span aria-hidden="true">→</span></span>
  </span>
 </>;
 if(onOpen&&count>0)return <button className="booster-stack" type="button" onClick={onOpen} disabled={disabled} aria-label={`Open a booster · ${label}`} data-count={count}>{content}</button>;
 return <a className="booster-stack" href={count>0?'/boosters?open=next':'/shop'} aria-label={`${count>0?'Open a booster':'Get boosters'} · ${label}`} data-count={count}>{content}</a>;
}
