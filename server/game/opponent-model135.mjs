import {positionalValue} from '../../public/game/src/tactics-ai.mjs';
import {freeCells} from '../../public/game/src/rules.mjs';
import {actionOptions,dashTargets,previewEffect} from '../../public/game/src/table-demo-rules.mjs';
import {expandGameDeck,getVariant} from '../../public/game/platform/catalog.mjs';
import {BOT_STYLES134} from './bot-personality134.mjs';

export const OPPONENT_MODEL_VERSION135=1;
export const createOpponentModel135=()=>({version:OPPONENT_MODEL_VERSION135,observations:0,logEvidence:[0,0,0],last:null});
export function opponentBeliefs135(model){
 const evidence=model?.version===1&&model.logEvidence?.length===3?model.logEvidence:[0,0,0],max=Math.max(...evidence),raw=evidence.map(v=>Math.exp(v-max)),sum=raw.reduce((a,b)=>a+b,0);
 // Keep a prior floor: a handful of placements cannot establish someone's whole strategy.
 return raw.map(v=>.10+.70*v/sum);
}
export const placementKey135=a=>JSON.stringify([
 a.uid,a.cell,a.rotation??0,a.abilityDirection??0,a.twistCell??null,a.blockadeCell??null,
 a.swapCells??null,a.stepCells??null,a.valueSwap??null,a.selfTurn??0,a.bidDirection??null,
 a.pivotDirection??(a.pivotCapture?1:0)
]);
export function observeOpponent135(model,before,after,action,key){
 const old=model?.version===1?model:createOpponentModel135();
 if(old.last===key)return old;
 const revealed=Object.values(after.board).find(card=>card.uid===action.uid);
 if(!revealed||revealed.uid!==action.uid||revealed.origin!==before.turn)return old;
 // Infer placement preferences conditional on the card that was actually revealed.
 // Other hand cards and future draws are neither required nor inspected.
 const card=getVariant(revealed.variantId)
  ?{...expandGameDeck([revealed.variantId],before.turn)[0],uid:revealed.uid,ability:revealed.ability}
  :{id:revealed.id,uid:revealed.uid,origin:revealed.origin,element:revealed.element,rarity:revealed.rarity,ability:revealed.ability};
 const game={...before,players:before.players.map((p,side)=>({shifts:p.shifts,flips:p.flips,hand:side===before.turn?[card]:[],deck:[]}))};delete game.seed;
 const candidates=[],cells=freeCells(game);
 if(dashTargets(game,card,game.block).length)cells.push(game.block);
 for(const cell of cells)for(const rotation of game.rotationLocked?[0]:[0,1,2,3,4,5])for(const action of actionOptions(game,card,cell,rotation))candidates.push({action,plan:previewEffect(game,action)});
 const index=candidates.findIndex(c=>placementKey135(c.action)===placementKey135(action));
 if(index<0)return old;
 const likelihoods=BOT_STYLES134.map(style=>{
  const utilities=candidates.map(c=>positionalValue(game,c,undefined,style)),mean=utilities.reduce((a,b)=>a+b,0)/utilities.length;
  const deviation=Math.max(.35,Math.sqrt(utilities.reduce((sum,v)=>sum+(v-mean)**2,0)/utilities.length));
  const logits=utilities.map(v=>(v-mean)/deviation),max=Math.max(...logits),total=logits.reduce((sum,v)=>sum+Math.exp(v-max),0);
  return Math.max(1e-6,Math.exp(logits[index]-max)/total);
 });
 const next=likelihoods.map((v,i)=>(old.logEvidence[i]??0)*.97+Math.log(v)*.55),peak=Math.max(...next);
 return {version:1,observations:old.observations+1,logEvidence:next.map(v=>Math.max(-12,v-peak)),last:key};
}
export function sampleOpponentStyle135(model,random){
 const probabilities=opponentBeliefs135(model);let roll=random();
 for(let i=0;i<probabilities.length;i++){roll-=probabilities[i];if(roll<=0)return BOT_STYLES134[i];}
 return BOT_STYLES134.at(-1);
}
