import {ELEMENT_IDS,attackWins} from '../platform/elements53.mjs?v=tie-break-63';
import {freeCells,neighbors,sideValue} from './rules.mjs?v=tie-break-63';
import * as currentRules from './table-demo-rules.mjs?v=no-escape-pair-release';
import {DEFINITIONS} from '../platform/catalog.mjs';
const ARCHETYPES=[...new Map(DEFINITIONS.map(c=>[c.values.join(','),c.ruleId])).values()];
export function legalCandidates(game,rules=currentRules){
 const result=[];
 for(const card of game.players[game.turn].hand)for(const cell of freeCells(game))for(const rotation of game.rotationLocked?[0]:[0,1,2,3,4,5]){
  const around=neighbors(cell),ability=rules.abilityAt(game,card,cell),relevant=ability==='hype'?around.filter(n=>game.board[n.id]&&game.board[n.id].controller!==game.turn).map(n=>n.dir):ability==='guard'&&rules.GUARD_ARC===6?[0]:(ability==='guard'||ability==='water')?around.filter(n=>n.id!==game.block&&!game.board[n.id]).map(n=>n.dir):[0],directions=relevant.length?relevant:[0];
  for(const action of rules.actionOptions(game,card,cell,rotation))if(directions.includes(action.abilityDirection)){const plan=rules.previewEffect(game,action);result.push({action,plan});}
 }return result;
}
export function positionalValue(game,{action,plan},rules=currentRules,weights={}){
 let safety=0,contacts=0;
 for(const n of neighbors(action.cell)){if(n.id===game.block)continue;const other=plan.board[n.id];if(!other){const defense=rules.effectStrength(game,plan.card,action.cell,n.dir,{id:'brain'});safety+=Math.min(7,defense.base+defense.field+defense.ability)-4.1;}else if(other.controller===game.turn||plan.flips.includes(n.id))contacts++;}
 let twistSafety=0;
 for(const transform of plan.transforms){
  if(transform.temporary)continue;
  const before=game.board[transform.cell],after=plan.board[transform.cell];
  const sign=before.controller===game.turn?1:-1;
  for(const {id,dir} of neighbors(transform.cell)){
   if(id===action.cell||id===game.block||game.board[id])continue;
   twistSafety+=sign*(sideValue(after,dir)-sideValue(before,dir))*.18;
  }
 }
 if(plan.relocation){
  const {from,to}=plan.relocation,card=plan.board[from];
  const coverAt=(cell,occupied)=>neighbors(cell).reduce((total,{id,dir})=>{
   if(id===action.cell||id===game.block||occupied(id))return total;
   return total+Math.min(7,sideValue(card,dir))-4.1;
  },0);
  twistSafety+=(coverAt(to,id=>id!==from&&Boolean(game.board[id]))-coverAt(from,id=>id===to||Boolean(game.board[id])))*.18;
 }
 if(plan.pivot){
  const rotated={...plan.card,rotation:plan.pivot.to};
  for(const {id,dir} of neighbors(action.cell)){
   if(id===game.block||plan.board[id])continue;
   twistSafety+=(Math.min(7,sideValue(rotated,dir))-Math.min(7,sideValue(plan.card,dir)))*.18;
  }
 }
 // At the end of the round, actual ownership matters more than a future safe edge.
 const closing=weights.capture===undefined?0:Math.max(0,(game.placements-12)/5);
 return plan.flips.length*((weights.capture??2)+closing)-(plan.bid!=null?.12:0)+safety*(weights.safety??.42)+contacts*(weights.contacts??.16)+twistSafety*(weights.twist??1)+(plan.coverWards?.length??0)*.12;
}
// A public-information one-reply threat check. It never reads the hidden enemy hand.
export function replyRisk(game,{action,plan},rules=currentRules){
 const board={...plan.board,[action.cell]:plan.card};for(const cell of plan.flips)board[cell]={...board[cell],controller:game.turn,guardOwner:undefined,guardUntil:undefined,coverWard:undefined,laughOwner:undefined,laughUntil:undefined};
 for(const t of plan.transforms)if(t.temporary)board[t.cell]={...board[t.cell],rotation:t.from};
 if(plan.relocation){
  const {from,to}=plan.relocation;
  board[to]=board[from];
  delete board[from];
 }
 if(plan.pivot)board[plan.pivot.cell]={...board[plan.pivot.cell],rotation:plan.pivot.to};
 for(const {cell,dir} of plan.coverWards??[])board[cell]={...board[cell],coverWard:{dir,owner:game.turn,until:game.placements+2}};
 const future={...game,board,placements:game.placements+1,turn:1-game.turn};
 if(future.placements>=18)return 0;
 // Let the authoritative field resolver advance before examining the next move.
 if(game.demoFields&&game.auditOrientation!==undefined){const copy={...future};delete copy.demoFields;future.demoFields=rules.eventFields(copy).map(f=>rotateField(f,game.auditOrientation));}
 let worst=0;
 for(const cell of freeCells(future)){const enemies=neighbors(cell).filter(n=>board[n.id]?.controller===game.turn);if(!enemies.length)continue;
  for(const id of ARCHETYPES)for(const element of game.elementRules===5?ELEMENT_IDS:[undefined])for(const rotation of game.rotationLocked?[0]:[0,1,2,3,4,5]){
   const card={id,element,rotation,controller:future.turn};if(future.elementalTrial)card.ability=rules.standardAbility?.(card);let flips=0;
   for(const n of enemies){const other=board[n.id],a=rules.effectStrength(future,card,cell,n.dir,other,{attacking:true}),d=rules.effectStrength(future,other,n.id,(n.dir+3)%6,card);if((rules.effectAttackWins??attackWins)(a,d,future.elementRules??3))flips++;}worst=Math.max(worst,flips);
  }
 }return worst;
}
function rotateField(f,steps){let [q,r]=f.cell.split(',').map(Number);for(let i=0;i<steps;i++)[q,r]=[-r,q+r];return {...f,cell:q+','+r,...(f.directions?{directions:f.directions.map(d=>(d+steps)%6)}:{})};}
export function chooseTactic(game,{rules=currentRules,policy='reply',random=()=>.5,personality=null}={}){
 const candidates=legalCandidates(game,rules);if(!candidates.length)return {chosen:null,candidates};
 let pool=candidates;
 // A personality may vary close decisions, but never throw away a better final score.
 if(policy==='position'&&personality&&game.placements===17){const captures=Math.max(...pool.map(item=>item.plan.flips.length));pool=pool.filter(item=>item.plan.flips.length===captures);}
 if(policy==='reply'){
  const groups=new Map();for(const item of candidates){item.position=positionalValue(game,item,rules);const n=item.plan.flips.length;if(!groups.has(n))groups.set(n,[]);groups.get(n).push(item);}
  pool=[...groups.values()].flatMap(group=>group.sort((a,b)=>b.position-a.position).slice(0,2));
 }
 let best=-Infinity,chosen=null,ties=0;
 for(const item of pool){const value=policy==='greedy'?item.plan.flips.length*6:policy==='reply'?item.plan.flips.length*2-replyRisk(game,item,rules)*1.65+(item.position??positionalValue(game,item,rules))*.12:positionalValue(game,item,rules,personality?.weights)+(personality?(random()-.5)*personality.variety:0);
  if(value>best+1e-8){best=value;chosen=item;ties=1;}else if(Math.abs(value-best)<1e-8&&random()<1/++ties)chosen=item;
 }return {chosen,candidates};
}
