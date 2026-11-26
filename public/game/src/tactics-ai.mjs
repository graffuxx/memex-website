import {ELEMENT_IDS,attackWins} from '../platform/elements53.mjs?v=tie-break-63';
import {freeCells,neighbors,sideValue} from './rules.mjs?v=hand-effects-46';
import * as currentRules from './table-demo-rules.mjs?v=hand-effects-46';
import {DEFINITIONS} from '../platform/catalog.mjs';
const ARCHETYPES=[...new Map(DEFINITIONS.map(c=>[c.values.join(','),c.ruleId])).values()];
export function legalCandidates(game,rules=currentRules){
 const result=[];
 if(game.pendingDraw)return result;
 for(const card of game.players[game.turn].hand)for(const cell of [...freeCells(game),...(rules.dashTargets?.(game,card,game.block).length?[game.block]:[])])for(const rotation of game.rotationLocked?[0]:[0,1,2,3,4,5]){
  const around=neighbors(cell),ability=rules.abilityAt(game,card,cell),relevant=ability==='hype'?around.filter(n=>game.board[n.id]&&game.board[n.id].controller!==game.turn).map(n=>n.dir):ability==='guard'&&rules.GUARD_ARC===6?[0]:ability==='guard'||ability==='water'?around.filter(n=>n.id!==game.block&&!game.board[n.id]).map(n=>n.dir):[0],directions=relevant.length?relevant:[0];
  for(const action of rules.actionOptions(game,card,cell,rotation))if(directions.includes(action.abilityDirection)){const plan=rules.previewEffect(game,action);result.push({action,plan});}
 }return result;
}
export function positionalValue(game,{action,plan},rules=currentRules,weights={}){
 let safety=0,contacts=0;
 const attackBlock=plan.dash?plan.blockadeMove.to:game.block;
 for(const n of neighbors(action.cell)){if(n.id===attackBlock)continue;const other=plan.board[n.id];if(!other){const defense=rules.effectStrength(plan.dash?{...game,block:attackBlock}:game,plan.card,action.cell,n.dir,{id:'brain'});safety+=Math.min(7,defense.base+defense.field+defense.ability)-4.1;}else if(other.controller===game.turn||plan.flips.includes(n.id))contacts++;}
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
 const edgeChange=(cell,from,to)=>neighbors(cell).reduce((value,{id,dir})=>{
  if(id===action.cell||id===game.block||game.board[id])return value;
  return value+(Math.min(7,sideValue(to,dir))-Math.min(7,sideValue(from,dir)))*.18;
 },0);
 if(plan.blink)twistSafety+=edgeChange(action.cell,plan.card,{...plan.card,rotation:plan.blink.to});
 if(plan.pivot){
  const {cell,to}=plan.pivot,card=cell===action.cell?plan.card:plan.board[cell];
  twistSafety+=edgeChange(cell,card,{...card,rotation:to});
 }
 if(plan.swapCells){
  const [first,second]=plan.swapCells;
  const left=first===action.cell?plan.card:plan.board[first];
  const right=second===action.cell?plan.card:plan.board[second];
  const side=left.controller===game.turn?1:-1;
  twistSafety+=side*(edgeChange(first,left,right)+edgeChange(second,right,left));
 }
 if(plan.relocation){
  const {from,to}=plan.relocation,card=plan.board[from];
  const coverAt=(cell,occupied)=>neighbors(cell).reduce((total,{id,dir})=>{
   if(id===action.cell||id===game.block||occupied(id))return total;
   return total+Math.min(7,sideValue(card,dir))-4.1;
  },0);
  twistSafety+=(coverAt(to,id=>id!==from&&Boolean(game.board[id]))-coverAt(from,id=>id===to||Boolean(game.board[id])))*.18;
 }
 let blockadeValue=plan.blockadeLock&&game.players[1-game.turn].shifts ? .12 : 0;
 if(plan.blockadeMove){
  const cover=cell=>neighbors(cell).reduce((value,{id,dir})=>{
   const card=id===action.cell?plan.card:plan.board[id];
   if(!card)return value;
   const belongs=card.controller===game.turn||plan.flips.includes(id);
   return value+(belongs?1:-1)*Math.max(0,6-sideValue(card,(dir+3)%6))*.16;
  },0);
  blockadeValue=cover(plan.blockadeMove.to)-cover(plan.blockadeMove.from)-(plan.dash?0:.12);
 }
 const reserveValue=plan.reserve?neighbors(plan.reserve).reduce((value,{id,dir})=>{
  const ally=id===action.cell?plan.card:plan.board[id];
  if(!ally||ally.controller!==game.turn&&!plan.flips.includes(id))return value;
  return value+Math.max(0,7-sideValue(ally,(dir+3)%6))*.12;
 },0):0;
 // Cycling a weak hand card uses only what is visible to the acting player.
 const cycled=plan.cycleUid?game.players[game.turn].hand.find(card=>card.uid===plan.cycleUid):null;
 const drawValue=cycled?Math.max(0,6-Math.max(...Array.from({length:6},(_,dir)=>sideValue(cycled,dir))))*.18:0;
 const recall=plan.recallCell?game.board[plan.recallCell]:null;
 const handValue=recall?recallValue(game,plan.recallCell,recall,rules):0;
 // At the end of the round, actual ownership matters more than a future safe edge.
 const closing=weights.capture===undefined?0:Math.max(0,(game.placements-12)/5);
 if(plan.bid!=null)blockadeValue-=.12;
 return plan.flips.length*((weights.capture??2)+closing)+safety*(weights.safety??.42)+contacts*(weights.contacts??.16)+twistSafety*(weights.twist??1)+blockadeValue+reserveValue+drawValue+handValue+(plan.link ? .14 : 0)+(plan.coverWards??[]).reduce((total,ward)=>total+(ward.amount??1)*.12,0)+(plan.awkward?.cell? .12 : 0)+(plan.phalanx?.tiles.length? .36 : 0);
}
function recallValue(game,cell,card,rules){
 let exposed=0,replay=0;
 const recalled={...rules.recalledCard(card),rotation:0,controller:game.turn};
 for(const {id,dir} of neighbors(cell)){
  if(!game.board[id]&&id!==game.block)exposed=Math.max(exposed,(6-sideValue(card,dir))*.27);
 }
 for(const field of freeCells(game))for(const {id,dir} of neighbors(field)){
  const target=game.board[id];
  if(target&&target.controller!==game.turn){
   const attack=rules.effectStrength(game,recalled,field,dir,target,{attacking:true});
   const defend=rules.effectStrength(game,target,id,(dir+3)%6,card);
   if((rules.effectAttackWins??attackWins)(attack,defend,game.elementRules??3))replay++;
  }
 }
 return exposed+Math.min(3,replay)*.25-.26;
}
// A public-information one-reply threat check. It never reads the hidden enemy hand.
export function replyRisk(game,{action,plan},rules=currentRules){
 const board={...plan.board,[action.cell]:plan.card};for(const cell of plan.flips)board[cell]={...board[cell],controller:game.turn,guardOwner:undefined,guardUntil:undefined,ernieWard:undefined,coverWard:undefined,awkwardMark:undefined,phalanxLink:undefined,pabloUntil:undefined,jammedUntil:undefined,attachedLink:undefined,laughOwner:undefined,laughUntil:undefined};
 if(plan.ward)board[plan.ward.cell].ernieWard={dir:plan.ward.dir,owner:game.turn,until:game.placements+2};
 for(const {cell,dir,kind,amount} of plan.coverWards??[])board[cell]={...board[cell],coverWard:{dir,owner:game.turn,until:game.placements+2,...(kind?{kind,amount}:{})}};
 for(const t of plan.transforms)if(t.temporary)board[t.cell]={...board[t.cell],rotation:t.from};
 if(plan.pivot)board[plan.pivot.cell]={...board[plan.pivot.cell],rotation:plan.pivot.to};
 if(plan.swapCells){
  const [first,second]=plan.swapCells;
  [board[first],board[second]]=[board[second],board[first]];
 }
 if(plan.relocation){
  const {from,to}=plan.relocation;
  board[to]=board[from];
  delete board[from];
 }
 if(plan.objection)board[plan.objection.cell]={...board[plan.objection.cell],objectionSpent:true};
 if(plan.attachment)board[plan.attachment.source]={...board[plan.attachment.source],attachedLink:undefined};
 if(plan.blink){
  board[plan.blink.source]={...board[plan.blink.source],blinkSpent:true};
  const attacker=board[action.cell];
  board[action.cell]={...attacker,rotation:(attacker.rotation+1)%6};
 }
 if(plan.bailout)board[plan.bailout.protector]={...board[plan.bailout.protector],bailoutSpent:true};
 if(plan.recallCell)delete board[plan.recallCell];
 const future={...game,board,block:plan.blockadeMove?.to??game.block,placements:game.placements+1,turn:1-game.turn};
 if(plan.reserve)future.fanReserve={cell:plan.reserve,owner:game.turn,until:game.placements+2};
 if(future.placements>=18)return 0;
 // Let the authoritative field resolver advance before examining the next move.
 if(game.demoFields&&game.auditOrientation!==undefined){const copy={...future};delete copy.demoFields;future.demoFields=rules.eventFields(copy).map(f=>rotateField(f,game.auditOrientation));}
 let worst=0;
 for(const cell of freeCells(future)){const enemies=neighbors(cell).filter(n=>board[n.id]?.controller===game.turn);if(!enemies.length)continue;
  for(const id of ARCHETYPES)for(const element of game.elementRules===5?ELEMENT_IDS:[undefined])for(const rotation of game.rotationLocked?[0]:[0,1,2,3,4,5]){
   const card={id,element,rotation,controller:future.turn};if(future.elementalTrial)card.ability=rules.standardAbility?.(card);
   let flips=0,objection=false;
   for(const n of enemies){
    const other=board[n.id],a=rules.effectStrength(future,card,cell,n.dir,other,{attacking:true}),d=rules.effectStrength(future,other,n.id,(n.dir+3)%6,card);
    if(!(rules.effectAttackWins??attackWins)(a,d,future.elementRules??3))continue;
    flips++;
    objection||=Boolean(rules.canObject?.(future,other,n.id,a,d));
   }
   worst=Math.max(worst,flips>1&&objection?flips-1:flips);
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
