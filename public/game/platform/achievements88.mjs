export const SKILL_METRICS88=Object.freeze({double_flips:'Double flips',triple_flips:'Triple flips',quad_flips:'Quad flips',total_flips:'Cards flipped',comeback_wins:'Comeback wins',dominant_wins:'Dominant wins',duel_sweeps:'2–0 double duels'});
export const SKILL_RULES88=Object.freeze({double_flips:'Flip at least 2 enemy cards in one turn.',triple_flips:'Flip at least 3 enemy cards in one turn.',quad_flips:'Flip at least 4 enemy cards in one turn.',total_flips:'Total enemy cards captured.',comeback_wins:'Win a round after trailing by at least 4 cards.',dominant_wins:'Win a round controlling at least 14 of the 18 cards.',duel_sweeps:'Win both rounds of a double duel.'});
export const ACHIEVEMENT_TITLES88=Object.freeze([
 {id:'first-flip',name:'Double Trouble',requirements:{double_flips:50}},
 {id:'getting-gud',name:'Triple Threat',requirements:{triple_flips:10}},
 {id:'no-touch-grass',name:'Four of a Kind',requirements:{quad_flips:3}},
 {id:'certified-menace',name:'Flip Happens',requirements:{total_flips:1000}},
 {id:'pixel-veteran',name:'Uno Reverse',requirements:{comeback_wins:20}},
 {id:'big-brain',name:'Board Dominator',requirements:{dominant_wins:10}},
 {id:'void-witness',name:'Two for the Show',requirements:{duel_sweeps:20}},
 {id:'final-boss',name:'Your Final Boss',requirements:{quad_flips:10,duel_sweeps:50}}
].map(t=>Object.freeze({...t,kind:'title',minWins:0,minLevel:1,requirements:Object.freeze(t.requirements)})));
export function titleProgress88(title,identity){return Object.entries(title.requirements??{}).map(([metric,goal])=>{const current=Math.max(0,Math.floor(Number(identity?.skills?.[metric])||0));return {metric,label:SKILL_METRICS88[metric],goal,current,complete:current>=goal,percent:Math.min(100,current/goal*100)};});}
export const earnedTitle88=(title,identity)=>titleProgress88(title,identity).every(r=>r.complete);
// Reference calculator for verified round snapshots and regression tests. It never grants rewards.
export function skillRound88(state){
 const result=Object.fromEntries(Object.keys(SKILL_METRICS88).map(k=>[k,0])),history=state?.game?.history;
 if(state?.ruleset!=='account-50'||!state.game.finished||state.game.placements!==18||![1,2].includes(state.round)||!Array.isArray(history))return null;
 const turns=history.filter(e=>e.type==='place');if(turns.length!==18||turns.filter(e=>e.side===0).length!==9)return null;
 const board=new Map();let deficit=0;
 for(const e of turns){if(![0,1].includes(e.side)||typeof e.cell!=='string'||!Array.isArray(e.flips))return null;board.set(e.cell,e.side);for(const cell of e.flips)board.set(cell,e.side);const own=[...board.values()].filter(s=>s===0).length;deficit=Math.max(deficit,board.size-2*own);if(e.side===0){result.total_flips+=e.flips.length;for(const [key,n] of [['double_flips',2],['triple_flips',3],['quad_flips',4]])if(e.flips.length>=n)result[key]++;}}
 if(board.size!==18)return null;
 const own=[...board.values()].filter(s=>s===0).length;
 if(state.game.winner===0){if(deficit>=4)result.comeback_wins=1;if(own>=14)result.dominant_wins=1;}
 if(state.round===2&&state.results?.length===2&&state.results.every(s=>s[0]>s[1]))result.duel_sweeps=1;
 return result;
}
