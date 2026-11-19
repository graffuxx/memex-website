'use client';
import {useEffect,useState} from 'react';
import {loadBoosterHistory,type BoosterPurchase,type PlayerState} from '@/lib/duelverse/account';
import usePlayerCollection from './usePlayerCollection';
import {PlayerAreaGate,PlayerAccountActions} from './PlayerArea';
import GameCardFace from './GameCardFace';
import {DEFINITIONS,RARITIES,getVariant,validateDeck} from '../../../public/game/platform/catalog.mjs';
import {summarizeDeck} from '../../../public/game/platform/deck-library28.mjs';
import {PLAY_DECK_KEY} from '../../../public/game/platform/deck-bridge.mjs';
import {boosterProgress,boosterLink,collectionSummary} from '../../../public/game/platform/player-area49.mjs';

export default function PlayerDashboard(){return <PlayerAreaGate><Dashboard/></PlayerAreaGate>;}
function Dashboard(){
 const {player,userId}=usePlayerCollection(),p=player as PlayerState;
 const [recent,setRecent]=useState<BoosterPurchase[]>([]),[historyError,setHistoryError]=useState(''),[loading,setLoading]=useState(true),[reload,setReload]=useState(0),[launchError,setLaunchError]=useState(''),[launching,setLaunching]=useState(false);
 useEffect(()=>{let live=true;setRecent([]);setLoading(true);setHistoryError('');loadBoosterHistory({limit:3}).then(rows=>{if(live)setRecent(rows);}).catch(()=>{if(live)setHistoryError('Recent boosters could not be loaded.');}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[userId,reload]);
 const summary=collectionSummary(p.inventory),active=p.decks.find(d=>d.active)??p.decks[0],valid=active&&validateDeck(active.cards,p.inventory).valid,deckSummary=active?summarizeDeck(active.cards):null;
 const art=active?[...new Set(active.cards)].map(id=>getVariant(id)).filter(Boolean).slice(0,3):[];
 function play(){if(!active||!valid||launching)return;setLaunching(true);setLaunchError('');try{localStorage.setItem(PLAY_DECK_KEY,JSON.stringify({version:1,cards:active.cards,name:active.name,inventory:p.inventory,source:'account'}));window.location.assign('/game/table-demo.html');}catch{setLaunching(false);setLaunchError('Allow browser storage to take your deck into the arena.');}}
 return <section className="portal-section player-dashboard">
  <header className="player-page-heading"><div><p>Welcome back, {p.displayName}.</p><h1>Your Duelverse.</h1></div><a className="player-quiet-link" href="/collection">{summary.motifs} / {summary.totalMotifs} memes collected</a></header>
  <div className="player-stat-line"><span><b>{summary.copies}</b> cards owned</span><span><b>{summary.variants}</b> artwork variants</span><span><b>{p.decks.length}</b> saved decks</span></div>
  <div className="player-dashboard-grid">
   <section className="player-panel active-deck-panel" aria-labelledby="active-deck-title"><header><span className="player-caption">ACTIVE DECK</span><a href="/decks">Manage decks</a></header><div className="active-deck-body"><div><h2 id="active-deck-title">{active?.name??'Build your first deck'}</h2>{active?<><p>{active.cards.length} cards · {deckSummary?.uniqueMotifs} memes</p><div className="player-elements">{(['fire','stone','storm'] as const).map(e=><span key={e} data-element={e}>{e==='fire'?'Fire':e==='stone'?'Stone':'Storm'} <b>{deckSummary?.elements[e]}</b></span>)}</div></>:<p>Choose 15 cards from your collection.</p>}</div><div className="player-deck-art" aria-hidden="true">{art.map(v=>{const card=DEFINITIONS.find(c=>c.id===v!.definitionId)!,rarity=RARITIES.find(r=>r.id===v!.rarity)!;return <div key={v!.id}><GameCardFace card={card} variant={v!} color={rarity.color} compact/></div>;})}</div></div><div className="actions"><button className="button gold" disabled={!valid||launching} onClick={play}>{launching?'Starting…':'Play deck'}</button><a className="button glass" href={active?'/decks?deck='+encodeURIComponent(active.id):'/decks'}>{active?'Edit this deck':'Build a deck'}</a></div>{active&&!valid&&<p className="error">Check this deck’s 15 cards and owned copies before playing.</p>}{launchError&&<p className="error" role="alert">{launchError}</p>}<small className="player-muted">Local alpha match against the demo opponent.</small></section>
   <section className="player-panel recent-booster-panel" aria-labelledby="recent-booster-title"><header><h2 id="recent-booster-title">Recent boosters</h2><a href="/account/private/boosters">View history</a></header>{loading?<p role="status">Loading saved boosters…</p>:historyError?<div><p className="error" role="alert">{historyError}</p><button className="player-quiet-link" onClick={()=>setReload(n=>n+1)}>Try again</button></div>:recent.length?<div className="player-recent-list">{recent.map(pack=>{const progress=boosterProgress(pack);return <a key={pack.id} href={boosterLink(pack.id)} className="player-recent-pack"><img src="/game/assets/cards/frame-v21/memex-back.webp" alt=""/><span><strong>Alpha Booster</strong><small>{progress.label} · {progress.revealed}/5 revealed</small></span><em>{progress.action}</em></a>;})}</div>:<div className="player-empty-boosters"><img src="/game/assets/cards/frame-v21/memex-back.webp" alt=""/><p>No boosters yet.</p><span>Your next five cards are waiting.</span></div>}<a className="button glass" href="/boosters">Explore Alpha Boosters</a></section>
  </div>
  <div className="player-shortcuts"><a href="/collection"><strong>Your collection</strong><span>Explore, craft and recycle spare cards.</span></a><a href="/decks"><strong>Your decks</strong><span>Build, name and save your next strategy.</span></a></div>
  <PlayerAccountActions/>
 </section>;
}
