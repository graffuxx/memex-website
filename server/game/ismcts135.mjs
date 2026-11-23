import {AI_DEFINITIONS107} from '../../public/game/platform/ai-pool107.mjs';
import {DEFINITIONS,expandGameDeck,getVariant} from '../../public/game/platform/catalog.mjs';
import {legalCandidates,positionalValue} from '../../public/game/src/tactics-ai.mjs';
import {placeEffect} from '../../public/game/src/table-demo-rules.mjs';
import {scores} from '../../public/game/src/rules.mjs';
import {sampleOpponentStyle135} from './opponent-model135.mjs';

export const ISMCTS_VERSION135='is-mcts-1';
// Independent of a future Tower UI: higher budgets can be calibrated against fixed agents.
export const SEARCH_LIMITS135=Object.freeze({casual:{iterations:48,maxMs:180},standard:{iterations:160,maxMs:550},tower:{iterations:640,maxMs:1600}});
const definitions=new Map(DEFINITIONS.map(c=>[c.id,c]));
const shuffle=(list,random)=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const definitionId=c=>getVariant(c.variantId)?.definitionId??DEFINITIONS.find(d=>d.ruleId===c.id)?.id;
const actionKey=(action,g)=>JSON.stringify([action.uid,g.players[g.turn].hand.find(c=>c.uid===action.uid)?.id,action.cell,action.rotation??0,action.abilityDirection??0,action.twistCell??null]);

export function observeGame135(game,observer){
 const g=structuredClone(game);delete g.seed;
 g.players=g.players.map((p,side)=>({...p,hand:p.hand.map(c=>side===observer?c:{uid:c.uid,hidden:true,origin:side}),deck:p.deck.map(c=>({uid:c.uid,hidden:true,origin:side}))}));
 return g;
}
function attachAbility(card,game,side){
 const allowed=game.loadouts?.[side]==='hype-twist'?['hype','twist']:game.loadouts?.[side]==='guard-twist'?['guard','twist']:['hype','guard'];
 const ability=definitions.get(definitionId(card))?.ability;
 if(allowed.includes(ability))card.ability=ability;
 return card;
}
export function determinize135(observation,{observer,ownDeck,random}){
 // Sanitize even if a caller accidentally supplies the authoritative state.
 const g=observeGame135(observation,observer);g.history=[];g.last=null;
 for(const side of[0,1]){
  const revealed=Object.values(g.board).filter(c=>c.origin===side),visible=side===observer?[...revealed,...g.players[side].hand]:revealed;
  const used=new Set(visible.map(definitionId)),alreadyPrime=visible.some(c=>definitions.get(definitionId(c))?.prime),alreadyIconic=visible.some(c=>definitions.get(definitionId(c))?.iconic);
  const slots=side===observer?g.players[side].deck:[...g.players[side].hand,...g.players[side].deck];let cards;
  if(side===observer){
   // The player knows their own saved deck's composition, never its shuffled order.
   if(!Array.isArray(ownDeck))throw Error('Own deck composition required.');
   const ids=[...ownDeck].sort();for(const c of visible){const index=ids.findIndex(id=>id===c.variantId||getVariant(id)?.definitionId===definitionId(c));if(index>=0)ids.splice(index,1);}
   if(ids.length!==slots.length)throw Error('Inconsistent own deck observation.');
   cards=shuffle(expandGameDeck(ids,side),random);
  }else{
   let prime=alreadyPrime,iconic=alreadyIconic;
   const pool=shuffle(AI_DEFINITIONS107.filter(c=>!used.has(c.id)),random).filter(c=>{if(c.prime){if(prime)return false;prime=true;}if(c.iconic){if(iconic)return false;iconic=true;}return true;});
   if(pool.length<slots.length)throw Error('Insufficient legal hidden cards.');
   cards=expandGameDeck(pool.slice(0,slots.length).map(c=>c.id+':common'),side);
  }
  cards=cards.map((c,i)=>attachAbility({...c,uid:slots[i].uid,origin:side},g,side));
  if(side===observer)g.players[side].deck=cards;
  else{const count=g.players[side].hand.length;g.players[side].hand=cards.slice(0,count);g.players[side].deck=cards.slice(count);}
 }
 return g;
}
function informationKey(g,observer){
 const card=c=>[c.uid,c.id,c.variantId,c.origin,c.controller,c.rotation??0,c.ability??null,c.guardOwner??null,c.guardUntil??null,c.guardDirection??null];
 return JSON.stringify([g.placements,g.block,g.players.map(p=>p.shifts),Object.entries(g.board).sort(([a],[b])=>a.localeCompare(b)).map(([cell,c])=>[cell,card(c)]),g.players[observer].hand.map(card).sort((a,b)=>a[0].localeCompare(b[0]))]);
}
function transition(g,action){const next=placeEffect(g,action);next.history=[];return next;}
function rankCandidates(g,personality,random,light=false){
 let input=g;
 // Bounded rollout policy: sample two available cards early, use the whole hand late.
 if(light&&g.placements<14&&g.players[g.turn].hand.length>2){input={...g,players:g.players.map((p,side)=>side===g.turn?{...p,hand:shuffle(p.hand,random).slice(0,2)}:p)};}
 const weights=personality?.weights??personality??{},candidates=legalCandidates(input);
 for(const c of candidates)c.prior=positionalValue(g,c,undefined,weights)+(random()-.5)*.06;
 candidates.sort((a,b)=>b.prior-a.prior);
 if(g.placements===17){const max=Math.max(...candidates.map(c=>c.plan.flips.length));return candidates.filter(c=>c.plan.flips.length===max);}
 return candidates;
}

/** Observer information-set MCTS with stochastic opponent-model transitions.
 * Each iteration samples a legal hidden world. Nodes contain only public state and
 * the observer's hand. Opponent moves use a sampled learned style, not secret cards
 * from the real match. UCB selection, expansion, terminal rollout and back-up share
 * statistics across determinizations. This is not a trained neural network.
 * Reference: Cowling, Powley & Whitehouse (2012), doi:10.1109/TCIAIG.2012.2200894.
 */
export function searchIsmcts135(game,{observer=game.turn,ownDeck,personality,opponentModel,random=Math.random,limits=SEARCH_LIMITS135.standard,now=()=>performance.now()}={}){
 const observation=observeGame135(game,observer);
 if(observation.finished||observation.turn!==observer)return {action:null,simulations:0,engine:ISMCTS_VERSION135};
 const started=now(),deadline=started+Math.max(0,limits.maxMs),rootCandidates=rankCandidates(observation,personality,random),root={visits:0,children:new Map()},nodes=new Map([[informationKey(observation,observer),root]]);
 const fallback=rootCandidates[0]?.action;if(!fallback)throw Error('No legal search move.');
 if(observation.placements===17)return {action:fallback,simulations:0,engine:ISMCTS_VERSION135,reason:'exact-final-move'};
 let simulations=0;
 for(let iteration=0;iteration<limits.iterations&&now()<deadline;iteration++){
  let g=determinize135(observation,{observer,ownDeck,random}),expanded=false,complete=true;const path=[],opponentStyle=sampleOpponentStyle135(opponentModel,random);
  while(!g.finished){
   if(now()>=deadline){complete=false;break;}
   let action;
   if(g.turn===observer&&!expanded){
    const key=informationKey(g,observer);let node=nodes.get(key);if(!node){node={visits:0,children:new Map()};nodes.set(key,node);}
    const candidates=node===root?rootCandidates:rankCandidates(g,personality,random);
    // Progressive widening prioritizes useful placements without fixing the tree to one root move.
    const width=Math.min(candidates.length,4+Math.floor(Math.sqrt(node.visits+1)*1.4)),available=candidates.slice(0,width);
    let selected,best=-Infinity;
    for(const c of available){const key=actionKey(c.action,g);let edge=node.children.get(key);if(!edge){edge={action:c.action,visits:0,total:0,available:0,prior:c.prior};node.children.set(key,edge);}edge.available++;
     const value=edge.visits===0?1e6+c.prior:edge.total/edge.visits+.42*Math.sqrt(Math.log(edge.available+1)/edge.visits)+.04*c.prior/(edge.visits+1);
     if(value>best){best=value;selected=edge;}
    }
    action=selected.action;expanded=selected.visits===0;path.push({node,edge:selected});
   }else{const ranked=rankCandidates(g,g.turn===observer?personality:opponentStyle,random,true);action=ranked[0].action;}
   g=transition(g,action);
  }
  if(!complete)break;
  const score=scores(g),result=score[observer]===score[1-observer] ? .5 : score[observer]>score[1-observer]?1:0,reward=result*.90+(score[observer]/18)*.10;
  for(const {node,edge}of path){node.visits++;edge.visits++;edge.total+=reward;}simulations++;
 }
 const choices=[...root.children.values()].filter(e=>e.visits>0).sort((a,b)=>b.visits-a.visits||b.total/b.visits-a.total/a.visits||b.prior-a.prior);
 return {action:choices[0]?.action??fallback,simulations,engine:ISMCTS_VERSION135,nodes:nodes.size,elapsedMs:now()-started,reason:choices.length?'search':'budget-fallback',choices:choices.map(e=>({action:e.action,visits:e.visits,value:e.total/e.visits}))};
}
