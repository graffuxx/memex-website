import test from 'node:test';import assert from 'node:assert/strict';
import {ELEMENT_IDS,elementAdvantage,attackWins} from '../public/game/platform/elements53.mjs';
import {DEFINITIONS,VARIANTS,expandGameDeck,starterDeck,starterInventory} from '../public/game/platform/catalog.mjs';
import {DIRECTIONS,preview,loadGame} from '../public/game/src/rules.mjs';
import {createTacticsMatch} from '../public/game/src/table-demo-state.mjs';
import {previewEffect,placeEffect} from '../public/game/src/table-demo-rules.mjs';
import {createAccountDuel,advanceAccountDuel} from '../server/game/engine50.mjs';
function scenario(av,dv,ae,de,dir=0,rarity='common'){
 const game=createTacticsMatch({seed:11,starter:1});game.events=[];game.demoFields=[];game.block='-2,2';game.turn=0;game.placements=1;
 const make=(value,edge,element,side,uid)=>{const motif=DEFINITIONS.find(c=>c.values[edge]===value&&c.element===element);assert.ok(motif,`value ${value} on ${edge}`);const v=VARIANTS.find(v=>v.definitionId===motif.id&&v.element===element&&v.rarity===rarity);return {...expandGameDeck([v.id],side)[0],uid};};
 const a=make(av,dir,ae,0,game.players[0].hand[0].uid),oldDef=game.players[1].hand.shift(),b=make(dv,(dir+3)%6,de,1,oldDef.uid),cell=DIRECTIONS[dir].join(',');
 game.players[0].hand[0]=a;game.board={[cell]:{...b,controller:1,rotation:0,flips:0}};const action={uid:a.uid,cell:'0,0',rotation:0,abilityDirection:dir};
 return {game,action,cell};
}
test('elements only break equal numeric strengths, for all five elements and every value pair',()=>{
 for(const a of ELEMENT_IDS)for(const d of ELEMENT_IDS)for(let av=1;av<=9;av++)for(let dv=1;dv<=9;dv++){
  const attack={total:av,element:Number(elementAdvantage(a,d))},defend={total:dv,element:Number(elementAdvantage(d,a))};
  assert.equal(attackWins(attack,defend,5),av>dv||(av===dv&&elementAdvantage(a,d)),`${a} ${av} against ${d} ${dv}`);
 }
});
test('Fire 4 beats Water 3; only Water wins a 4:4 tie, on all six facing edges and all cosmetic finishes',()=>{
 for(const dir of [0,1,2,3,4,5])for(const rarity of ['common','rare','epic','legendary','mythic'])for(const [av,dv,ae,de,wins]of [[4,3,'fire','water',true],[4,4,'fire','water',false],[4,4,'water','fire',true],[3,4,'water','fire',false],[4,4,'water','water',false]]){
  const {game,action,cell}=scenario(av,dv,ae,de,dir,rarity);assert.doesNotThrow(()=>loadGame(JSON.stringify(game)));
  for(const plan of [preview(game,action),previewEffect(game,action)]){const c=plan.comparisons[0];assert.equal(c.attack.total,av);assert.equal(c.defend.total,dv);assert.equal(c.flip,wins);assert.deepEqual(plan.flips,wins?[cell]:[]);}
 }
});
test('field and ability bonuses are resolved before the elemental tiebreaker',()=>{
 let {game,action,cell}=scenario(3,4,'water','fire');game.demoFields=[{cell:'0,0',type:'resonance',element:'water'}];let plan=previewEffect(game,action);assert.equal(plan.comparisons[0].attack.total,4);assert.equal(plan.comparisons[0].flip,true);
 ({game,action,cell}=scenario(3,4,'fire','water'));game.players[0].hand[0].ability='hype';plan=previewEffect(game,action);assert.equal(plan.comparisons[0].attack.total,4);assert.equal(plan.comparisons[0].flip,false);
 ({game,action,cell}=scenario(4,4,'fire','water'));game.players[0].hand[0].ability='hype';plan=previewEffect(game,action);assert.equal(plan.comparisons[0].attack.total,5);assert.equal(plan.comparisons[0].flip,true);
 ({game,action,cell}=scenario(4,2,'water','fire'));Object.assign(game.board[cell],{ability:'guard',guardDirection:3,guardOwner:1,guardUntil:5});plan=previewEffect(game,action);assert.equal(plan.comparisons[0].defend.total,4);assert.equal(plan.comparisons[0].flip,true);
 ({game,action,cell}=scenario(4,3,'fire','water'));Object.assign(game.board[cell],{ability:'guard',guardDirection:3,guardOwner:1,guardUntil:5});plan=previewEffect(game,action);assert.equal(plan.comparisons[0].defend.total,5);assert.equal(plan.comparisons[0].flip,false);
});
test('the authoritative server resolves the same tiebreaks and captures as the browser preview',()=>{
 const base=createAccountDuel({deck:{id:'tie-test',name:'Starter',cards:starterDeck()},inventory:starterInventory(),seed:11,starter:1});
 for(const [av,dv,ae,de,wins]of [[4,3,'fire','water',true],[4,4,'water','fire',true],[4,4,'fire','water',false],[3,4,'water','fire',false]]){
  const {game,action,cell}=scenario(av,dv,ae,de),result=advanceAccountDuel({...base,game}, {kind:'place',action});
  assert.deepEqual(result.steps[0].after,placeEffect(game,action));assert.deepEqual(result.steps[0].after.last.flips,wins?[cell]:[]);
 }
});
