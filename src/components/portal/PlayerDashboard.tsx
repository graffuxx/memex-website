'use client';
import DuelRecord113 from './DuelRecord113';
import {ELEMENT_LIST} from '../../../public/game/platform/elements53.mjs';
import {useEffect,useState} from 'react';
import {countUnopenedBoosters,type PlayerState} from '@/lib/duelverse/account';
import usePlayerCollection from './usePlayerCollection';
import {PlayerAreaGate} from './PlayerArea';
import GameCardFace from './GameCardFace';
import BoosterStack from './BoosterStack';
import {DEFINITIONS,RARITIES,getVariant,validateDeck} from '../../../public/game/platform/catalog.mjs';
import {summarizeDeck} from '../../../public/game/platform/deck-library28.mjs';
import {PLAY_DECK_KEY} from '../../../public/game/platform/deck-bridge.mjs';
import {collectionSummary} from '../../../public/game/platform/player-area49.mjs';
import {QuestSummary95} from './PlayerQuests';
import PlayerPortrait85,{PlayerSignature85} from './PlayerPortrait85';
import {progression85} from '../../../public/game/platform/identity85.mjs';

export default function PlayerDashboard(){return <PlayerAreaGate><Dashboard/></PlayerAreaGate>;}
function Dashboard(){
 const {player,userId}=usePlayerCollection(),p=player as PlayerState;
 const [unopened,setUnopened]=useState<number|null>(null),[boosterError,setBoosterError]=useState(false),[reload,setReload]=useState(0),[launchError,setLaunchError]=useState(''),[launching,setLaunching]=useState(false);
 useEffect(()=>{
  let live=true;
  setUnopened(null);setBoosterError(false);
  countUnopenedBoosters().then(count=>{if(live)setUnopened(count);}).catch(()=>{if(live)setBoosterError(true);});
  return()=>{live=false;};
 },[userId,reload]);
 const summary=collectionSummary(p.inventory),active=p.decks.find(d=>d.active)??p.decks[0],valid=active&&validateDeck(active.cards,p.inventory).valid,deckSummary=active?summarizeDeck(active.cards):null;
 const art=active?[...new Set(active.cards)].map(id=>getVariant(id)).filter(Boolean).slice(0,3):[],progress=progression85(p.identity.xp);
 function play(){if(!active||!valid||launching)return;setLaunching(true);setLaunchError('');try{localStorage.setItem(PLAY_DECK_KEY,JSON.stringify({version:1,cards:active.cards,name:active.name,inventory:p.inventory,source:'account',deckId:active.id}));window.location.assign('/game/table-demo.html');}catch{setLaunching(false);setLaunchError('Allow browser storage to take your deck into the arena.');}}
 return <section className="portal-section player-dashboard">
  <header className="player-page-heading"><div><p>Welcome back, {p.displayName}.</p><h1>Your Duelverse.</h1></div><a className="player-quiet-link" href="/collection">{summary.motifs} / {summary.totalMotifs} memes collected</a></header>
  <div className="player-identity-card85"><a href="/account/private/profile" className="player-identity-link85"><PlayerPortrait85 identity={p.identity} size={95}/><PlayerSignature85 identity={p.identity}/></a><div className="identity-dashboard-progress85"><strong>Level {progress.level}</strong> · {progress.current} / {progress.required} XP<progress value={progress.current} max={progress.required} aria-label="Progress to next level"/><small>{p.identity.wins} verified round wins</small></div><a href="/account/private/profile" className="button glass">{p.identity.nameClaimed?'Customize profile':'Choose player name'}</a></div>
  <div className="player-stat-line"><span><b>{summary.copies}</b> cards owned</span><span><b>{summary.variants}</b> card variants</span><span><b>{p.decks.length}</b> saved {p.decks.length===1?'deck':'decks'}</span></div>
  <DuelRecord113 userId={userId}/><QuestSummary95/><div className="player-dashboard-grid">
   <section className="player-panel active-deck-panel" aria-labelledby="active-deck-title"><header><span className="player-caption">ACTIVE DECK</span><a href="/decks">Manage decks</a></header><div className="active-deck-body"><div><h2 id="active-deck-title">{active?.name??'Build your first deck'}</h2>{active?<><p>{active.cards.length} cards · {deckSummary?.uniqueMotifs} memes</p><div className="player-elements">{ELEMENT_LIST.map(({id:e,name})=><span key={e} data-element={e}>{name} <b>{deckSummary?.elements[e]}</b></span>)}</div></>:<p>Choose 15 cards from your collection.</p>}</div><div className="player-deck-art" aria-hidden="true">{art.map(v=>{const card=DEFINITIONS.find(c=>c.id===v!.definitionId)!,rarity=RARITIES.find(r=>r.id===v!.rarity)!;return <div key={v!.id}><GameCardFace card={card} variant={v!} color={rarity.color} compact/></div>;})}</div></div><div className="actions"><a className="button gold" href={active?'/play?deck='+encodeURIComponent(active.id):'/play'}>Play online</a><button className="button glass" disabled={!valid||launching} onClick={play}>{launching?'Starting…':'AI duel'}</button><a className="button glass" href={active?'/decks?deck='+encodeURIComponent(active.id):'/decks'}>{active?'Edit this deck':'Build a deck'}</a></div>{active&&!valid&&<p className="error">Check this deck’s 15 cards and owned copies before playing.</p>}{launchError&&<p className="error" role="alert">{launchError}</p>}<small className="player-muted">Random &amp; AI duels · +5 Pixels per win, +2 per loss or draw.</small></section>
   <section className="player-panel" aria-labelledby="player-boosters-title">
    <header><h2 id="player-boosters-title">Your boosters</h2><a href="/account/private/boosters">View history</a></header>
    {boosterError?<div><p className="error" role="alert">Your boosters could not be loaded.</p><button className="player-quiet-link" onClick={()=>setReload(n=>n+1)}>Try again</button></div>:unopened===null?<p role="status">Loading boosters…</p>:<BoosterStack count={unopened} product="all"/>}
   </section>
  </div>
  <div className="player-shortcuts"><a href="/account/private/quests"><strong>Quests & rewards</strong><span>Track milestones, earn boosters and invite new rivals.</span></a><a href="/collection"><strong>Your collection</strong><span>Explore, craft and recycle spare cards.</span></a><a href="/decks"><strong>Your decks</strong><span>Build, name and save your next strategy.</span></a></div>
 </section>;
}
