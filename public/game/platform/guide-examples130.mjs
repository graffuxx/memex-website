// These examples use the published catalog and the same capture resolver as a duel.
import {DEFINITIONS,getVariant,expandGameDeck} from './catalog.mjs';
import {newGame,DIRECTIONS} from '../src/rules.mjs';
import {previewEffect,placeEffect} from '../src/table-demo-rules.mjs';
const specs=[
 {id:'stronger',tab:'Stronger edge',title:'4 beats 3. Even against Water.',text:'Compare only the two touching edges. A higher number wins before elements are considered.',attacker:'triggered',defenders:['pool-noodle'],dirs:[0]},
 {id:'tie-win',tab:'Element wins a tie',title:'4 against 4? Water wins this tie.',text:'Pool Noodle has Water. Disaster Girl has Fire. At equal facing values, the attacking Water card captures Fire.',attacker:'pool-noodle',defenders:['disaster-girl'],dirs:[0]},
 {id:'tie-hold',tab:'Equal is not enough',title:'Fire 4 cannot flip Water 4.',text:'The numbers tie, but Fire has no advantage against Water. The defender keeps its owner. Elements never add an extra point.',attacker:'triggered',defenders:['duck-float'],dirs:[0]},
 {id:'double',tab:'Double flip',title:'One placement. Two captures.',text:'Every adjacent enemy is checked separately. Line up two winning edges to flip two cards with one move.',attacker:'success-kid',defenders:['pool-noodle','disaster-girl'],dirs:[0,1]},
 {id:'iconic',tab:'Iconic power',title:'A strong edge. A weak back.',text:'Rage Guy has an 8 on the right, but three 3s elsewhere. Iconic is a separate card class: up to two Iconics and one Prime may share your 15-card deck.',attacker:'rage-guy',defenders:['doge'],dirs:[0]},
 {id:'iconic-s',tab:'Iconic vs S',title:'Even an 8 cannot capture an S.',text:'Iconics have numeric edges, never S. Rage Guy cannot capture this Prime S, even with Fire’s elemental advantage over Earth. Attack another side instead.',attacker:'rage-guy',defenders:['here-we-go-again'],dirs:[0]},
 {id:'prime',tab:'Prime S',title:'An S needs another, stronger-element S.',text:'EVIL ERNIE’s Fire S captures the Earth S of Here We Go Again. A numeric edge cannot capture an S, whatever its number.',attacker:'evil-ernie',defenders:['here-we-go-again'],dirs:[0]}
];
export function guideExample130(id){
 const spec=specs.find(s=>s.id===id);if(!spec)throw Error('Unknown guide example');
 const card=id=>{const definition=DEFINITIONS.find(c=>c.id===id),variant=getVariant(id+':common');if(!definition||!variant)throw Error('Guide card missing from released catalog');return {definition,variant};};
 const game=newGame({seed:130,starter:0});Object.assign(game,{board:{},block:'-2,2',events:[],demoFields:[],eventFieldsEnabled:false,rotationLocked:true});
 const attack=expandGameDeck([spec.attacker+':common'],0)[0],defend=expandGameDeck(spec.defenders.map(id=>id+':common'),1);
 game.players[0].hand=[attack];game.players[0].deck=[];game.players[1].hand=[];game.players[1].deck=[];
 defend.forEach((c,i)=>{const cell=DIRECTIONS[spec.dirs[i]].join(',');game.board[cell]={...c,rotation:0,controller:1,flips:0};});
 const action={uid:attack.uid,cell:'0,0',rotation:0},plan=previewEffect(game,action),after=placeEffect(game,action);
 return {id:spec.id,tab:spec.tab,title:spec.title,text:spec.text,attacker:card(spec.attacker),defenders:spec.defenders.map(card),directions:spec.dirs,comparisons:plan.comparisons,flips:plan.flips,before:game,after};
}
export const GUIDE_EXAMPLES130=Object.freeze(specs.map(s=>guideExample130(s.id)));
