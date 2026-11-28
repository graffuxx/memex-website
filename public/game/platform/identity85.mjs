import {COLLECTION_QUESTS129} from './collection-quests129.mjs';
import {FLIP_QUESTS} from './quests95.mjs';
import {ACHIEVEMENT_TITLES88,earnedTitle88} from './achievements88.mjs';
import {DEFINITIONS} from './catalog.mjs';
import {SHOP_PORTRAITS} from './cosmetic-shop.mjs';
import {SUPPORTER_PACKS} from './supporter-packs.mjs';
export const WIN_XP85=100;
const ids=['pepe','doge','roll-safe','harold','disaster-girl','grumpy-cat','smudge','confused','gigachad','this-is-fine','trollface','stonks','crying-cat','keyboard-cat','galaxy-brain','npc','copium','diamond-hands','hodl','rage-quit'];
const questCosmetics=[...COLLECTION_QUESTS129,...FLIP_QUESTS];
export const PORTRAITS85=Object.freeze([...ids.map(id=>{const c=DEFINITIONS.find(c=>c.id===id);return Object.freeze({id,kind:'portrait',name:c.name,image:c.image,minLevel:1,minWins:0,quest:null});}),...questCosmetics.flatMap(q=>q.portrait?[Object.freeze({id:q.portrait,kind:'portrait',name:q.portraitName,image:q.image,minLevel:1,minWins:0,quest:q.id})]:[]),...SHOP_PORTRAITS.map(p=>Object.freeze({...p,minLevel:1,minWins:0,quest:null,shop:true})),
 ...SUPPORTER_PACKS.map(p=>Object.freeze({id:p.portraitId,name:p.portraitName,kind:'portrait',image:p.image,rarity:p.rarity,motion:p.motion,minLevel:1,minWins:0,quest:null,shop:true}))
]);
export const FRAMES85=Object.freeze([
 {id:'starter',name:'Fresh Spawn',level:1,color:'#b9c7dc',accent:'#637da2',tier:0},
 {id:'pixel-50',name:'Pixel Grinder',level:50,color:'#78e9b4',accent:'#248b94',tier:1},
 {id:'meme-100',name:'Meme Overlord',level:100,color:'#ffd17b',accent:'#bf6c21',tier:2},
 {id:'diamond-150',name:'Diamond Mind',level:150,color:'#9feaff',accent:'#556de3',tier:3},
 {id:'void-200',name:'Void Touched',level:200,color:'#dca6ff',accent:'#7431ce',tier:4},
 {id:'cosmic-250',name:'Galaxy Brain',level:250,color:'#f4b1ef',accent:'#bd43bc',tier:5},
 {id:'legend-300',name:'Final Boss',level:300,color:'#ffe6ad',accent:'#ee765d',tier:6}
].map(f=>Object.freeze({...f,kind:'frame',minLevel:f.level,minWins:0})));
export const TITLES85=Object.freeze([{id:'rookie',name:'Fresh Spawn',kind:'title',minWins:0,minLevel:1,requirements:Object.freeze({}),quest:null},...ACHIEVEMENT_TITLES88.map(t=>({...t,quest:null})),...questCosmetics.flatMap(q=>q.title?[{id:q.title,name:q.titleName,kind:'title',minWins:0,minLevel:1,requirements:Object.freeze({}),quest:q.id}]:[]),
 ...SUPPORTER_PACKS.flatMap(p=>p.titleId?[{id:p.titleId,name:p.titleName,kind:'title',minWins:0,minLevel:1,requirements:Object.freeze({}),quest:null,shop:true}]:[])
]);
export function xpAtLevel85(level){const n=Math.max(0,Math.floor(Number(level)||1)-1);return 250*n+5*n*(n-1);}
export function progression85(value){const xp=Math.min(Number.MAX_SAFE_INTEGER,Math.max(0,Math.floor(Number(value)||0)));let n=Math.max(0,Math.floor((-245+Math.sqrt(60025+20*xp))/10));while(xpAtLevel85(n+2)<=xp)n++;while(xpAtLevel85(n+1)>xp)n--;const level=n+1,start=xpAtLevel85(level),next=xpAtLevel85(level+1);return {xp,level,current:xp-start,required:next-start,next,percent:(xp-start)/(next-start)*100};}
export function unlocked85(item,identity){if(!item)return false;if(item.quest||item.shop)return (identity?.owned??[]).includes(item.kind+':'+item.id);if(item.kind==='title'&&Object.keys(item.requirements??{}).length)return earnedTitle88(item,identity);return (identity?.owned??[]).includes(item.kind+':'+item.id)||item.minLevel<=progression85(identity?.xp).level&&item.minWins<=(identity?.wins??0);}
export function frame85(identity){const eligible=FRAMES85.filter(f=>unlocked85(f,identity));return eligible.find(f=>f.id===identity?.frameId)??eligible.at(-1)??FRAMES85[0];}
export function portrait85(id){return PORTRAITS85.find(p=>p.id===id)??PORTRAITS85[0];}
export function portraitMotion(id){return PORTRAITS85.find(p=>p.id===id)?.motion??undefined;}
export function title85(identity){return TITLES85.find(t=>t.id===identity?.titleId&&unlocked85(t,identity))?.name??'';}
export const DEFAULT_IDENTITY85=Object.freeze({displayName:'Player',nameClaimed:false,avatarId:'pepe',frameId:'auto',titleId:'rookie',xp:0,wins:0,skills:Object.freeze({}),owned:[]});
export function frameSvg85(frame,level){const f=frame??FRAMES85[0],tier=f.tier,c=f.color,a=f.accent;
 const gems=Array.from({length:tier>=3?8:4},(_,i)=>{const angle=i*Math.PI*2/(tier>=3?8:4),x=100+83*Math.sin(angle),y=100-83*Math.cos(angle);return `<path d="m${x} ${y-7} 5 7-5 7-5-7Z" fill="${c}" stroke="#182039" stroke-width="2"/>`;}).join('');
 const wings=tier?`<path d="M25 128 7 110 14 103 8 87 25 94M175 128l18-18-7-7 6-16-17 7" fill="${a}" stroke="${c}" stroke-width="2"/>`:'';
 const crown=tier>=2?`<path d="m71 28-6-18 21 10L100 3l14 17 21-10-6 18" fill="${a}" stroke="${c}" stroke-width="2"/><path d="m96 16 4-6 4 6-4 5Z" fill="${c}"/>`:'';
 const pixels=tier===1?'<path d="M31 38h10V28h10v10h10v10H51v10H41V48H31ZM147 38h6v6h6v6h-6v6h-6v-6h-6v-6h6Z" fill="#bcffe2"/>':'';
 const rays=tier>=4?Array.from({length:12},(_,i)=>`<path d="m100 10 4-9 4 11" transform="rotate(${i*30} 100 100)" fill="${a}" stroke="${c}" stroke-width=".8"/>`).join(''):'';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 206" aria-hidden="true">${rays}${wings}<circle cx="100" cy="100" r="83" fill="none" stroke="#08091a" stroke-width="15"/><circle cx="100" cy="100" r="82" fill="none" stroke="${a}" stroke-width="9"/><circle cx="100" cy="100" r="86" fill="none" stroke="${c}" stroke-width="2"/><circle cx="100" cy="100" r="76" fill="none" stroke="${c}" stroke-width="2"/><circle cx="100" cy="100" r="89" fill="none" stroke="${c}" stroke-opacity=".45" stroke-width="1" stroke-dasharray="${tier>=3?'3 5':'16 5'}"/>${gems}${crown}${pixels}<path d="m72 171 28-8 28 8-5 23-23 9-23-9Z" fill="#0d1024" stroke="${c}" stroke-width="2"/><text x="100" y="188" fill="${c}" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="700">${Math.max(1,Math.floor(Number(level)||1))}</text></svg>`;
}
