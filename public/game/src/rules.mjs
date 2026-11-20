import {ELEMENTS as FIVE_ELEMENTS,normalizeElement,elementAdvantage,attackWins} from '../platform/elements53.mjs?v=tie-break-63';
import {getVariant} from '../platform/catalog.mjs';
import {EXPANSION_CARDS} from '../platform/expansion27.mjs';
export const VERSION=1;
export const ELEMENTS={...FIVE_ELEMENTS,stone:FIVE_ELEMENTS.earth};
export const DIRECTIONS=[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];
export const CATALOG=[
 {id:'oracle',name:'Overthinker',element:'storm',values:[7,6,3,2,3,3],face:'hood',quote:'Ich habe 14 Züge vorausgedacht. Leider die falschen.'},
 {id:'rage',name:'Rage Quit',element:'fire',values:[7,2,2,7,3,3],face:'cat',quote:'Das war natürlich alles Lag.'},
 {id:'mage',name:'404 Mage',element:'water',values:[4,4,4,4,4,4],face:'robot',quote:'Zauber gefunden. Kompetenz nicht.'},
 {id:'moon',name:'Moonbound',element:'storm',values:[6,2,6,2,6,2],face:'astronaut',quote:'Zum Mond. Über den Umweg.'},
 {id:'trust',name:'Trust Me',element:'stone',values:[5,5,5,3,3,3],face:'frog',quote:'Quelle: Vertrau mir, Bruder.'},
 {id:'reset',name:'Hard Reset',element:'stone',values:[6,5,4,4,3,2],face:'robot',quote:'Schon mal aus- und wieder angezweifelt?'},
 {id:'grass',name:'Touch Grass',element:'water',values:[2,5,6,5,2,4],face:'frog',quote:'Die Außenwelt ist auch nur ein anderer Server.'},
 {id:'fine',name:'Fine. Actually.',element:'fire',values:[3,6,3,6,3,3],face:'hood',quote:'Alles unter Kontrolle. Ignoriere das Feuer.'},
 {id:'brain',name:'Last Braincell',element:'fire',values:[5,2,5,2,5,5],face:'cat',quote:'Heute bin ich allein im Dienst.'},
 ...EXPANSION_CARDS
];
const LEGACY_IDS=new Set(['oracle','rage','mage','moon','trust','reset','grass','fine','brain']);
export const CELLS=[];for(let r=-2;r<=2;r++)for(let q=-2;q<=2;q++)if(Math.abs(q+r)<=2)CELLS.push({id:q+','+r,q,r});
export const LAYOUTS=[{id:'core',name:'Kernbruch',block:'0,0'},{id:'east',name:'Ostpass',block:'1,0'},{id:'west',name:'Westpass',block:'-1,0'}];
const CARD_INDEX=new Map(CATALOG.map(c=>[c.id,Object.freeze({...c,element:normalizeElement(c.element)})]));
const ELEMENT_CARD_INDEX=new Map();
export function cardOf(card){
 const base=CARD_INDEX.get(card.id);if(!base)return undefined;
 const variant=card.variantId?getVariant(card.variantId):null;
 const element=variant?.element??normalizeElement(card.element??base.element);
 if(!Object.hasOwn(FIVE_ELEMENTS,element))return undefined;
 if(element===base.element)return base;
 const key=base.id+':'+element;if(!ELEMENT_CARD_INDEX.has(key))ELEMENT_CARD_INDEX.set(key,Object.freeze({...base,element}));
 return ELEMENT_CARD_INDEX.get(key);
}
const cellSet=new Set(CELLS.map(c=>c.id));
function random(seed){let n=seed>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function shuffle(a,rng){for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function newGame({seed=12345,layout='core',starter=0}={}){
 if(![0,1].includes(starter)||!LAYOUTS.some(l=>l.id===layout))throw Error('Ungültige Partieauswahl.');
 const rng=random(seed),players=[0,1].map(p=>{const cards=shuffle(CATALOG.filter(c=>LEGACY_IDS.has(c.id)).map(c=>({id:c.id,uid:p+':'+c.id,origin:p})),rng);return {hand:cards.slice(0,5),deck:cards.slice(5),shifts:1,flips:0};});
 return {version:VERSION,elementRules:5,seed,layout,starter,turn:starter,placements:0,board:{},block:LAYOUTS.find(l=>l.id===layout).block,players,events:[{cell:'-1,1',element:'storm'},{cell:'1,-1',element:'water'}],history:[],last:null,winner:null,finished:false};
}
export function neighbors(id){const c=CELLS.find(c=>c.id===id);return c?DIRECTIONS.map(([q,r],dir)=>({id:(c.q+q)+','+(c.r+r),dir})).filter(n=>cellSet.has(n.id)):[];}
export const freeCells=g=>CELLS.filter(c=>c.id!==g.block&&!g.board[c.id]).map(c=>c.id);
export const scores=g=>[0,1].map(p=>Object.values(g.board).filter(c=>c.controller===p).length);
export const eventPhase=g=>g.placements>=12?2:g.placements>=6?1:0;
export function fieldAt(g,cell){const f=g.events.find(f=>f.cell===cell);if(!f)return null;const phase=eventPhase(g);return {element:phase===2?({storm:'water',water:'storm'}[f.element]):f.element,bonus:phase===1?2:1};}
export function sideValue(card,dir,rotation=card.rotation??0){return cardOf(card).values[((dir-rotation)%6+6)%6];}
export function strength(g,card,cell,dir,opponent){const base=sideValue(card,dir),field=fieldAt(g,cell),fieldBonus=field?.element===cardOf(card).element?field.bonus:0,advantage=elementAdvantage(cardOf(card).element,cardOf(opponent).element,g.elementRules??3)?1:0;return {base,field:fieldBonus,element:advantage,total:base+fieldBonus+((g.elementRules??3)===3?advantage:0)};}
export function preview(g,{uid,cell,rotation=0}){
 if(g.finished)throw Error('Die Runde ist beendet.');
 const card=g.players[g.turn].hand.find(c=>c.uid===uid);
 if(!card||!cellSet.has(cell)||cell===g.block||g.board[cell]||!Number.isInteger(rotation)||rotation<0||rotation>5)throw Error('Diese Platzierung ist nicht möglich.');
 const incoming={...card,rotation,controller:g.turn,flips:0};
 const comparisons=neighbors(cell).filter(n=>g.board[n.id]&&g.board[n.id].controller!==g.turn).map(n=>{const other=g.board[n.id],attack=strength(g,incoming,cell,n.dir,other),defend=strength(g,other,n.id,(n.dir+3)%6,incoming);return {cell:n.id,attack,defend,flip:attackWins(attack,defend,g.elementRules??3),name:cardOf(other).name};});
 return {card:incoming,cell,comparisons,flips:comparisons.filter(c=>c.flip).map(c=>c.cell)};
}
export function moveTargets(g){return g.finished||!g.players[g.turn].shifts?[]:neighbors(g.block).map(n=>n.id).filter(id=>!g.board[id]);}
export function shiftBlock(g,target){
 if(!moveTargets(g).includes(target))throw Error('Die Blockade kann nur auf ein freies Nachbarfeld verschoben werden.');
 const next=structuredClone(g),from=next.block;next.block=target;next.players[g.turn].shifts--;next.last={type:'shift',side:g.turn,from,to:target};next.history.push(next.last);return next;
}
export function placeCard(g,action){
 const plan=preview(g,action),next=structuredClone(g),p=next.players[g.turn];
 p.hand=p.hand.filter(c=>c.uid!==action.uid);if(p.deck.length)p.hand.push(p.deck.shift());
 next.board[action.cell]={...plan.card,flips:plan.flips.length};
 for(const cell of plan.flips)next.board[cell].controller=g.turn;
 p.flips+=plan.flips.length;next.placements++;next.last={type:'place',side:g.turn,cell:action.cell,uid:action.uid,name:cardOf(plan.card).name,flips:plan.flips,event:eventPhase(next)!==eventPhase(g)?eventPhase(next):null};next.history.push(next.last);
 if(freeCells(next).length===0){next.finished=true;const s=scores(next);next.winner=s[0]===s[1]?null:s[0]>s[1]?0:1;}else next.turn=1-g.turn;
 return next;
}
export function loadGame(text){
 const g=JSON.parse(text);if(g.version!==VERSION||!cellSet.has(g.block)||!Array.isArray(g.players)||g.players.length!==2||![0,1].includes(g.turn)||!Number.isInteger(g.placements)||g.placements<0||g.placements>18)throw Error('Unbekannter Spielstand.');
 if(Object.keys(g.board).length!==g.placements||g.board[g.block])throw Error('Ungültiges Brett.');
 const ids=new Set();for(const p of [0,1]){const player=g.players[p];if(!Array.isArray(player.hand)||!Array.isArray(player.deck)||![0,1].includes(player.shifts))throw Error('Ungültiges Deck.');for(const c of [...player.hand,...player.deck]){if(!cardOf(c)||c.origin!==p||ids.has(c.uid))throw Error('Ungültige Karte.');ids.add(c.uid);}}
 for(const [cell,c]of Object.entries(g.board)){if(!cellSet.has(cell)||!cardOf(c)||![0,1].includes(c.controller)||![0,1].includes(c.origin)||!Number.isInteger(c.rotation)||c.rotation<0||c.rotation>5||ids.has(c.uid))throw Error('Ungültige Karte auf dem Brett.');ids.add(c.uid);}
 if(ids.size!==18||g.players.some((p,i)=>p.hand.length+p.deck.length+Object.values(g.board).filter(c=>c.origin===i).length!==9))throw Error('Unvollständige Partie.');return g;
}
