import './owned-cards-filter.css';

export default function OwnedCardsFilter({label,active,count,onChange}:{
 label:string;
 active:boolean;
 count?:number;
 onChange:(active:boolean)=>void;
}){
 return <div className="owned-cards-filter">
  <button type="button" aria-pressed={active} onClick={()=>onChange(!active)}>
   <span aria-hidden="true">{active?'✓':''}</span>{label}
  </button>
  {count!==undefined&&<span className="owned-cards-count" role="status">
   {count} {active?'owned ':''}{count===1?'variant':'variants'}
  </span>}
 </div>;
}
