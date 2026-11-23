'use client';
import EditionSelector131 from './EditionSelector131';
import {editionContains131} from '../../../public/game/platform/edition-catalog131.mjs';
import {ELEMENT_LIST} from '../../../public/game/platform/elements53.mjs';
import {useState,useEffect,type CSSProperties} from 'react';
import {supabase} from '@/lib/supabaseClient';
import GameCardFace from './GameCardFace';
import DeckBuilder from './DeckBuilder';
import {CardTradeButtons,CardTradeDialog,type CardAction} from './CardEconomy';
import usePlayerCollection from './usePlayerCollection';
import {DEFINITIONS,VARIANTS,RARITIES} from '../../../public/game/platform/catalog.mjs';
type Props={mode:'collection'|'decks'};
export default function PlayerPortal({mode}:Props){return mode==='decks'?<DeckBuilder/>:<CollectionPortal/>;}
function CollectionPortal(){
 const {ready,userId,player,error,testMode,inventory,refresh}=usePlayerCollection();const [cardAction,setCardAction]=useState<CardAction|null>(null),[trading,setTrading]=useState(false);const [rarity,setRarity]=useState('all'),[search,setSearch]=useState(''),[availableOnly,setAvailableOnly]=useState(false);
 const [edition,setEdition]=useState('alpha'),[element,setElement]=useState('all'),[limit,setLimit]=useState(60);
 useEffect(()=>setLimit(60),[rarity,search,availableOnly,element,edition]);
 const visible=VARIANTS.filter(v=>editionContains131(edition,v)&&(element==='all'||v.element===element)&&(!availableOnly||(inventory[v.id]??0)>0)&&(rarity==='all'||v.rarity===rarity)&&DEFINITIONS.filter(c=>c.id===v.definitionId).some(c=>(c.name+(c.prime?' prime':'')).toLowerCase().includes(search.toLowerCase())));
 return <section className="portal-section top-space"><span className="eyebrow">CLASSIC MEMES. DIFFERENT ENERGY.</span><h1>{testMode?'The test collection.':'The collection.'}</h1><p className="intro">Rarity changes the artwork and finish, not the edge values. Same meme. Same rules.</p>
 <div className="player-note" role="status">{!ready?'Loading collection…':error?error:testMode?<>Browser-only card-draw preview · collected test copies, a fixed starter set and individual collected copies. No account rewards or currency. <a href="/boosters">Try an Alpha Booster preview.</a></>:userId?'Craft up to Gold; recycle spare cards. Starter cards and saved decks stay protected.':<>Guest preview · a fixed starter collection. Drafts stay on this browser. <a href="/account">Sign in for your own collection.</a></>}</div>
 {userId&&!player&&ready?<div className="actions"><a href="/account/private" className="button glass">Back to account</a><button className="button glass" onClick={async()=>{await supabase.auth.signOut();}}>Use guest preview</button></div>:<>

 <EditionSelector131 value={edition} onChange={setEdition} inventory={inventory}/>
 <div className="collection-summary"><span>{Object.values(inventory).reduce((sum,n)=>sum+n,0)} {testMode?'test cards':'available copies'}</span><span>{VARIANTS.filter(v=>(inventory[v.id]??0)>0).length} / {VARIANTS.length} variants</span><a href={testMode?'/collection':'/boosters'}>{testMode?'Back to account collection':'Open Alpha Boosters'}</a></div>
 <div className="filter-row"><input className="portal-input" aria-label="Search cards" placeholder="Find a meme…" value={search} onChange={e=>setSearch(e.target.value)}/><label>Element<select aria-label="Element" value={element} onChange={e=>setElement(e.target.value)}><option value="all">All elements</option>{ELEMENT_LIST.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label><label>Rarity<select value={rarity} onChange={e=>setRarity(e.target.value)}><option value="all">All finishes</option>{RARITIES.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label><label><input type="checkbox" checked={availableOnly} onChange={e=>setAvailableOnly(e.target.checked)}/>Available cards only</label><a className="button glass" href={testMode?'/decks?test=1':'/decks'}>Open deck builder</a><details className="player-preview-tools"><summary>Preview tools</summary><a href="/decks?test=1">Test all cards</a><a href="/game/card-finishes.html?effects=1">Animated finishes</a><a href="/shop">Crafting rates</a></details></div>
 <div className="collection-grid">{visible.slice(0,limit).map(v=>{const c=DEFINITIONS.find(c=>c.id===v.definitionId)!,r=RARITIES.find(r=>r.id===v.rarity)!,owned=inventory[v.id]??0;return <article key={v.id} className={'collection-card'+(!owned?' locked':'')} style={{'--rarity':r.color} as CSSProperties}><GameCardFace card={c} variant={v} color={r.color}/><div className="card-meta"><h2>{c.name}</h2><small>{r.name} · {v.element}{v.edition==='recruiter'?' · Recruiter':''}</small></div><p className="card-copy">{owned?`${owned} ${testMode?'test copies':userId?'owned':'starter preview'}`:'Not collected'} · {c.quote}</p>{userId&&player&&!testMode&&<CardTradeButtons variantId={v.id} player={player} busy={trading||!!cardAction} onChoose={setCardAction}/>}</article>;})}</div>{visible.length>limit&&<button className="button glass" onClick={()=>setLimit(n=>n+60)}>Show 60 more cards ({Math.min(limit,visible.length)} / {visible.length})</button>}{visible.length===0&&<p>No cards match your search.</p>}</>}
 {userId&&player&&!testMode&&<CardTradeDialog action={cardAction} player={player} onClose={()=>setCardAction(null)} onChanged={refresh} onPending={setTrading}/>}
 </section>;
}
