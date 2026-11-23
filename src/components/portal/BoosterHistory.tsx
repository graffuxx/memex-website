'use client';
import {useEffect,useRef,useState} from 'react';
import {countUnopenedAlphaBoosters,loadBoosterHistory,type BoosterPurchase} from '@/lib/duelverse/account';
import usePlayerCollection from './usePlayerCollection';
import {PlayerAreaGate} from './PlayerArea';
import BoosterStack from './BoosterStack';
import {boosterCostLabel} from '../../../public/game/platform/alpha-booster36.mjs';
import {boosterProgress,boosterLink,mergeBoosterHistory} from '../../../public/game/platform/player-area49.mjs';
const PAGE_SIZE=20;
export default function BoosterHistory(){return <PlayerAreaGate><History/></PlayerAreaGate>;}
function History(){
 const {userId}=usePlayerCollection();
 const [count,setCount]=useState<number|null>(null),[countError,setCountError]=useState(false),[reload,setReload]=useState(0);
 const [historyVisible,setHistoryVisible]=useState(false);
 useEffect(()=>{
  let live=true;
  setCount(null);setCountError(false);
  countUnopenedAlphaBoosters().then(total=>{if(live)setCount(total);}).catch(()=>{if(live)setCountError(true);});
  return()=>{live=false;};
 },[userId,reload]);
 return <section className="portal-section player-history">
  <header className="player-page-heading"><h1>Your boosters</h1></header>
  {countError?<div><p className="error" role="alert">Your boosters could not be loaded.</p><button className="button glass" onClick={()=>setReload(n=>n+1)}>Try again</button></div>:count===null?<p role="status">Loading boosters…</p>:<BoosterStack count={count}/>}
  <details className="booster-archive" onToggle={event=>setHistoryVisible(event.currentTarget.open)}>
   <summary>Opening history</summary>
   {historyVisible&&<OpenedPacks key={userId}/>}
  </details>
 </section>;
}
function OpenedPacks(){
 const [rows,setRows]=useState<BoosterPurchase[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[hasMore,setHasMore]=useState(false),generation=useRef(0),busy=useRef(false);
 useEffect(()=>{const ticket=++generation.current;busy.current=true;loadBoosterHistory({limit:PAGE_SIZE+1,openedOnly:true}).then(data=>{if(ticket===generation.current){setRows(data.slice(0,PAGE_SIZE));setHasMore(data.length>PAGE_SIZE);}}).catch(()=>{if(ticket===generation.current)setError('Your booster history could not be loaded. Please try again.');}).finally(()=>{if(ticket===generation.current){setLoading(false);busy.current=false;}});return()=>{generation.current++;};},[]);
 async function more(){if(busy.current)return;const ticket=generation.current;busy.current=true;setLoading(true);setError('');try{const last=rows.at(-1),data=await loadBoosterHistory({limit:PAGE_SIZE+1,openedOnly:true,before:last?{id:last.id,created_at:last.created_at}:null});if(ticket===generation.current){setRows(previous=>mergeBoosterHistory(previous,data.slice(0,PAGE_SIZE)) as BoosterPurchase[]);setHasMore(data.length>PAGE_SIZE);}}catch{if(ticket===generation.current)setError('Your booster history could not be loaded. Please try again.');}finally{if(ticket===generation.current){busy.current=false;setLoading(false);}}}
 return <>
  {rows.length>0&&<div className="player-history-list">{rows.map(pack=>{const progress=boosterProgress(pack);return <article key={pack.id} className="player-history-row"><img src="/game/assets/cards/frame-v21/memex-back.webp" alt=""/><div className="player-history-name"><h2>Alpha Booster</h2><time dateTime={pack.created_at}>{new Date(pack.created_at).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'})}</time></div><div className="player-pack-state" data-state={progress.state}><strong>{progress.label}</strong><span>{progress.revealed} / 5 revealed</span></div><span className="player-pack-cost">{boosterCostLabel(pack)}</span><a className="button glass" aria-label={`${progress.action} from ${new Date(pack.created_at).toLocaleString()}`} href={boosterLink(pack.id)}>{progress.action}</a></article>;})}</div>}
  {loading&&<p role="status">Loading boosters…</p>}{error&&<div className="player-history-error"><p className="error" role="alert">{error}</p><button className="button glass" disabled={loading} onClick={more}>Try again</button></div>}
  {!loading&&!error&&!rows.length&&<p className="player-muted">No opened boosters yet.</p>}
  {rows.length>0&&<footer className="player-history-footer"><span>{rows.length} opened boosters shown</span>{hasMore&&!error&&<button className="button glass" disabled={loading} onClick={more}>{loading?'Loading…':'Load older boosters'}</button>}</footer>}
 </>;
}
