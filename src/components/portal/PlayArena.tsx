'use client';
import {useEffect,useState} from 'react';
import BrandPage from './BrandPage';
import RewardedDuelLauncher from './RewardedDuelLauncher';
import Matchmaking90 from './Matchmaking90';
import usePlayerCollection from './usePlayerCollection';
import GameCardFace from './GameCardFace';
import {DEFINITIONS,RARITIES,getVariant,starterDeck,starterInventory,validateDeck} from '../../../public/game/platform/catalog.mjs';
import {fullTestDeckInventory} from '../../../public/game/platform/booster-test.mjs';
import {PLAY_DECK_KEY,readPlayDeck} from '../../../public/game/platform/deck-bridge.mjs';
import {SOLO_LEVELS84,SOLO_OPPONENTS84,prepareSolo84} from '../../../public/game/platform/solo84.mjs';
import './solo84.css';
type Mode='training'|'deck-test';
type Selection={cards:string[];name:string;source:string;deckId?:string|null};
export default function PlayArena(){
 const [route,setRoute]=useState<{mode:Mode|'duel'|'ai-duel';deck:string|null}|null>(null);
 useEffect(()=>{const p=new URLSearchParams(window.location.search),m=p.get('mode');setRoute({mode:m==='ai-duel'?'ai-duel':m==='deck-test'?'deck-test':m==='training'?'training':'duel',deck:p.get('deck')});},[]);
 if(!route)return <div className="solo-loading84" role="status">Preparing Duelverse…</div>;
 if(route.mode==='ai-duel')return <RewardedDuelLauncher/>;
 if(route.mode==='duel')return <BrandPage><Matchmaking90/></BrandPage>;
 return <BrandPage><SoloHub initialMode={route.mode} requestedDeck={route.deck}/></BrandPage>;
}
function SoloHub({initialMode,requestedDeck}:{initialMode:Mode;requestedDeck:string|null}){
 const {ready,userId,player,inventory,error:accountError}=usePlayerCollection();
 const [mode,setMode]=useState<Mode>(initialMode),[chosen,setChosen]=useState(''),[difficulty,setDifficulty]=useState('standard'),[opponent,setOpponent]=useState('balanced'),[timed,setTimed]=useState(false),[testDeck,setTestDeck]=useState<Selection|null>(null),[guestDeck,setGuestDeck]=useState<Selection>({cards:starterDeck(),name:'Starter deck',source:'guest'}),[error,setError]=useState(''),[launching,setLaunching]=useState(false);
 useEffect(()=>{try{const previous=readPlayDeck(localStorage);if(previous&&(previous.source==='sandbox'||previous.practice?.mode==='deck-test'))setTestDeck(previous);const draft=JSON.parse(localStorage.getItem('duelverse.guest-deck.v1')??'null');if(draft?.version===1&&validateDeck(draft.cards,starterInventory()).valid)setGuestDeck({cards:draft.cards,name:typeof draft.name==='string'?draft.name:'Guest deck',source:'guest'});}catch{}},[]);
 useEffect(()=>{if(!player)return;setChosen(old=>player.decks.some(d=>d.id===old)?old:player.decks.find(d=>d.id===requestedDeck)?.id??player.decks.find(d=>d.active)?.id??player.decks[0]?.id??'');},[player,requestedDeck]);
 const owned=player?.decks.find(d=>d.id===chosen),training:Selection|null=userId?(owned?{cards:owned.cards,name:owned.name,source:'account',deckId:owned.id}:null):guestDeck;
 const selected:Selection|null=mode==='deck-test'?testDeck??{cards:starterDeck(),name:'Starter test deck',source:'sandbox'}:training;
 const available=mode==='deck-test'?fullTestDeckInventory():userId?inventory:starterInventory();
 const valid=Boolean(selected&&validateDeck(selected.cards,available).valid),canStart=ready&&valid&&!launching&&(!userId||Boolean(player)||mode==='deck-test');
 function chooseMode(next:Mode){setMode(next);setError('');const url=new URL(window.location.href);url.searchParams.set('mode',next);window.history.replaceState(null,'',url.pathname+url.search);}
 function start(){if(!canStart||!selected)return;setError('');try{const data=prepareSolo84(selected,available,{mode,difficulty,opponent,timed});localStorage.setItem(PLAY_DECK_KEY,JSON.stringify(data));setLaunching(true);window.location.assign('/game/table-demo.html');}catch(e){setError(e instanceof Error?e.message:'Practice could not start. Please allow browser storage.');}}
 return <section className="portal-section top-space solo-hub84"><header className="solo-heading84"><span>YOUR DECK. YOUR PACE.</span><h1>Solo play</h1><p>Try a strategy. Learn the board.</p></header>
 <div className="solo-modes84" role="group" aria-label="Solo mode"><button type="button" aria-pressed={mode==='training'} onClick={()=>chooseMode('training')}><svg viewBox="0 0 40 40" aria-hidden="true"><path d="m20 5 13 7v16l-13 7-13-7V12Z M20 12v15m-6-11 12 9m0-9-12 9"/></svg><span><strong>AI Training</strong><small>Practice with your own deck.</small></span></button><button type="button" aria-pressed={mode==='deck-test'} onClick={()=>chooseMode('deck-test')}><svg viewBox="0 0 40 40" aria-hidden="true"><path d="m9 7 17-2 4 25-17 3Z M16 11l16 2-2 23-16-2 M21 19l5 2-1 5-5-1Z"/></svg><span><strong>Deck Test</strong><small>Try drafts and unlocked test cards.</small></span></button></div>
 {(accountError&&mode==='training'||error)&&<p className="solo-error84" role="alert">{error||accountError}</p>}
 <div className="solo-setup84"><div className="solo-options84"><h2>{mode==='training'?'Training setup':'Test your deck'}</h2>
 {mode==='training'&&userId?<label>Your saved deck<select aria-label="Training deck" value={chosen} disabled={!player||launching} onChange={e=>setChosen(e.target.value)}>{!player?.decks.length&&<option value="">{ready?'No saved deck':'Loading decks…'}</option>}{player?.decks.map(d=><option key={d.id} value={d.id}>{d.name} · {d.cards.length}/15</option>)}</select></label>:<div className="solo-chosen84"><span>{mode==='deck-test'?'Selected test deck':'Your deck'}</span><strong>{selected?.name??'Choose a deck'}</strong><a href={mode==='deck-test'?selected?.source==='account'&&selected.deckId?'/decks?deck='+encodeURIComponent(selected.deckId):'/decks?test=1':'/decks'}>{mode==='deck-test'?'Edit test deck':'Edit deck'}</a></div>}
 <div className="solo-settings-grid84"><label>AI level<select aria-label="AI level" value={difficulty} disabled={launching} onChange={e=>setDifficulty(e.target.value)}>{SOLO_LEVELS84.map(level=><option value={level.id} key={level.id}>{level.name}</option>)}</select></label><label>Opponent deck<select aria-label="Opponent deck" value={opponent} disabled={launching} onChange={e=>setOpponent(e.target.value)}>{SOLO_OPPONENTS84.map(deck=><option value={deck.id} key={deck.id}>{deck.name}</option>)}</select></label></div>
 <p className="solo-option-description84">{SOLO_LEVELS84.find(l=>l.id===difficulty)?.description} {SOLO_OPPONENTS84.find(o=>o.id===opponent)?.description}</p><label className="solo-timer84"><input type="checkbox" checked={timed} disabled={launching} onChange={e=>setTimed(e.target.checked)}/>90-second turn timer <span>{timed?'On':'Off · take your time'}</span></label>
 <div className="solo-actions84"><button className="button gold" disabled={!canStart} onClick={start}>{launching?'Starting…':!ready?'Loading your deck…':mode==='training'?'Start training':'Test this deck'}</button>{mode==='training'&&<a className="button glass" href={owned?'/decks?deck='+encodeURIComponent(owned.id):'/decks'}>Deck builder</a>}{mode==='deck-test'&&<a className="button glass" href="/decks?test=1">Build with all cards</a>}</div>
 {!valid&&ready&&<p className="solo-error84">Choose a valid 15-card deck before starting.</p>}
 </div><aside className="solo-deck84" aria-label="Selected deck preview"><div className="solo-deck-art84">{[...new Set(selected?.cards??[])].slice(0,3).map((id,i)=>{const v=getVariant(id)!,card=DEFINITIONS.find(c=>c.id===v.definitionId)!,rarity=RARITIES.find(r=>r.id===v.rarity)!;return <div key={i}><GameCardFace card={{...card,element:v.element}} variant={v} color={rarity.color} compact/></div>;})}</div><h3>{selected?.name??'Your next deck'}</h3><div className="solo-facts84"><span>15 cards</span><span>2 rounds</span><span>Free practice</span></div><p>Hints suggest a move without playing it. Random fields and reshuffled decks keep each duel different.</p><small>Training and deck tests award no Pixels and do not change your collection.</small></aside></div>
 {userId&&<div className="solo-reward-link84"><span>Ready for another player?</span><a href="/play">Find an online duel</a></div>}
 </section>;
}
