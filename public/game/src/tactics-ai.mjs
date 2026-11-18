import {freeCells,neighbors,sideValue} from './rules.mjs';
import * as currentRules from './table-demo-rules.mjs?v=random-layout-1';
const ARCHETYPES=['oracle','brain','trust'];
export function legalCandidates(game,rules=currentRules){
 const result=[];
 for(const card of game.players[game.turn].hand)for(const cell of freeCells(game))for(const rotation of game.rotationLocked?[0]:[0,1,2,3,4,5]){
  const around=neighbors(cell),ability=rules.abilityAt(game,card,cell),relevant=ability==='hype'?around.filter(n=>game.board[n.id]&&game.board[n.id].controller!==game.turn).map(n=>n.dir):ability==='guard'&&rules.GUARD_ARC===6?[0]:ability==='guard'?around.filter(n=>n.id!==game.block&&!game.board[n.id]).map(n=>n.dir):[0],directions=relevant.length?relevant:[0];
  for(const action of rules.actionOptions(game,card,cell,rotation))if(directions.includes(action.abilityDirection)){const plan=rules.previewEffect(game,action);result.push({action,plan});}
 }return result;
}
export function positionalValue(game,{action,plan},rules=currentRules){
 let safety=0,contacts=0;
 for(const n of neighbors(action.cell)){if(n.id===game.block)continue;const other=plan.board[n.id];if(!other){const defense=rules.effectStrength(game,plan.card,action.cell,n.dir,{id:'brain'});safety+=Math.min(7,defense.base+defense.field+defense.ability)-4.1;}else if(other.controller===game.turn||plan.flips.includes(n.id))contacts++;}
 let twistSafety=0;for(const t of plan.transforms){if(t.temporary)continue;const before=game.board[t.cell],after=plan.board[t.cell];for(const n of neighbors(t.cell))if(!game.board[n.id]&&n.id!==game.block)twistSafety+=(sideValue(before,n.dir)-sideValue(after,n.dir))*.18;}
 return plan.flips.length*2+safety*.42+contacts*.16+twistSafety;
}
// A public-information one-reply threat check. It never reads the hidden enemy hand.
export function replyRisk(game,{action,plan},rules=currentRules){
 const board={...plan.board,[action.cell]:plan.card};for(const cell of plan.flips)board[cell]={...board[cell],controller:game.turn,guardOwner:undefined,guardUntil:undefined};
 for(const t of plan.transforms)if(t.temporary)board[t.cell]={...board[t.cell],rotation:t.from};
 const future={...game,board,placements:game.placements+1,turn:1-game.turn};
 if(future.placements>=18)return 0;
 // Let the authoritative field resolver advance before examining the next move.
 if(game.demoFields&&game.auditOrientation!==undefined){const copy={...future};delete copy.demoFields;future.demoFields=rules.eventFields(copy).map(f=>rotateField(f,game.auditOrientation));}
 let worst=0;
 for(const cell of freeCells(future)){const enemies=neighbors(cell).filter(n=>board[n.id]?.controller===game.turn);if(!enemies.length)continue;
  for(const id of ARCHETYPES)for(const rotation of game.rotationLocked?[0]:[0,1,2,3,4,5]){
   const card={id,rotation,controller:future.turn};let flips=0;
   for(const n of enemies){const other=board[n.id],a=rules.effectStrength(future,card,cell,n.dir,other,{attacking:true}),d=rules.effectStrength(future,other,n.id,(n.dir+3)%6,card);if(a.total>d.total)flips++;}worst=Math.max(worst,flips);
  }
 }return worst;
}
function rotateField(f,steps){let [q,r]=f.cell.split(',').map(Number);for(let i=0;i<steps;i++)[q,r]=[-r,q+r];return {...f,cell:q+','+r,...(f.directions?{directions:f.directions.map(d=>(d+steps)%6)}:{})};}
export function chooseTactic(game,{rules=currentRules,policy='reply',random=()=>.5}={}){
 const candidates=legalCandidates(game,rules);if(!candidates.length)return {chosen:null,candidates};
 let pool=candidates;
 if(policy==='reply'){
  const groups=new Map();for(const item of candidates){item.position=positionalValue(game,item,rules);const n=item.plan.flips.length;if(!groups.has(n))groups.set(n,[]);groups.get(n).push(item);}
  pool=[...groups.values()].flatMap(group=>group.sort((a,b)=>b.position-a.position).slice(0,2));
 }
 let best=-Infinity,chosen=null,ties=0;
 for(const item of pool){const value=policy==='greedy'?item.plan.flips.length*6:policy==='reply'?item.plan.flips.length*2-replyRisk(game,item,rules)*1.65+(item.position??positionalValue(game,item,rules))*.12:positionalValue(game,item,rules);
  if(value>best+1e-8){best=value;chosen=item;ties=1;}else if(Math.abs(value-best)<1e-8&&random()<1/++ties)chosen=item;
 }return {chosen,candidates};
}
