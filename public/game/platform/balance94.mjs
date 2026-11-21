// Pure reporting helpers. No database credentials, operator identities or raw states.
export const patchKey94=r=>r.patch+' / '+r.fingerprint;
export function variantKey94(id){const [motif,rarity,element]=id.split(':');return {motif,rarity,element};}
export function wilson94(wins,n){if(!n)return null;const z=1.96,p=wins/n,d=1+z*z/n,m=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return [Math.max(0,m-h),Math.min(1,m+h)];}
export function summarizeBalance94(rows,definitions){
 const defs=new Map(definitions.map(c=>[c.id,c])),cards=new Map(),decks=new Map(),people=new Set(),matches=new Set();
 const completed=rows.filter(r=>r.complete);let firstWins=0,firstDecisive=0,draws=0,duration=0;
 const get=(map,id,extra={})=>{if(!map.has(id))map.set(id,{id,games:0,wins:0,losses:0,draws:0,playedGames:0,drawn:0,played:0,flips:0,recaptured:0,retained:0,people:new Set(),...extra});return map.get(id);};
 for(const r of completed){matches.add(r.id.split(':').slice(0,2).join(':'));duration+=r.duration??0;if(r.winner===null)draws++;else if([0,1].includes(r.starter)){firstDecisive++;if(r.winner===r.starter)firstWins++;}
  for(const side of [0,1]){const seat=r.seats[side],person=r.players[side];if(person&&person!=='ai')people.add(person);
   const resolve=id=>{const v=variantKey94(id);return {...v,element:v.element??defs.get(v.motif)?.element??'unknown'};};
   // Cosmetics are deliberately ignored for deck strength; copies/elements remain.
   const normalized=seat.deck.map(id=>{const v=resolve(id);return v.motif+':'+v.element;}).sort();
   const deck=get(decks,normalized.join('|'),{list:normalized});
   const outcome=row=>{row.games++;row.people.add(person);if(r.winner===null)row.draws++;else if(r.winner===side)row.wins++;else row.losses++;};
   // AI decks stay in the AI-only report, but no bot counts as a unique human.
   outcome(deck);
   const present=new Set(seat.deck.map(id=>{const v=resolve(id);return v.motif+':'+v.element;})),played=new Set();
   for(const id of present){const [motif,element]=id.split(':');outcome(get(cards,id,{motif,element,name:defs.get(motif)?.name??motif}));}
   for(const c of seat.cards){const v=resolve(c.id);v.element=c.element??v.element;const id=v.motif+':'+v.element,row=get(cards,id,{motif:v.motif,element:v.element,name:defs.get(v.motif)?.name??v.motif});
    if(c.drawn)row.drawn++;if(c.played){row.played++;played.add(id);row.flips+=c.flips??0;row.recaptured+=c.recaptured??0;if(c.retained)row.retained++;}}
   for(const id of played)cards.get(id).playedGames++;
  }
 }
 const finalize=map=>[...map.values()].map(r=>{const decisive=r.wins+r.losses,n=r.people.size-(r.people.has('ai')?1:0),interval=wilson94(r.wins,decisive);return {...r,people:n,decisive,winRate:decisive?r.wins/decisive:null,interval,
  // A review cue, never an automatic nerf. Repeated games by a few people aren't evidence.
  signal:decisive>=100&&n>=20&&interval?(interval[0]>.5?'above':interval[1]<.5?'below':'neutral'):'sample'};}).sort((a,b)=>b.games-a.games||a.id.localeCompare(b.id));
 return {rounds:completed.length,matches:matches.size,players:people.size,aborted:rows.length-completed.length,draws,averageMs:completed.length?duration/completed.length:null,
  firstWinRate:firstDecisive?firstWins/firstDecisive:null,firstDecisive,cards:finalize(cards),decks:finalize(decks)};
}
