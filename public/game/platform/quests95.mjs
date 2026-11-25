import {COLLECTION_QUESTS129} from './collection-quests129.mjs';
export const RECRUITER_VARIANTS95=Object.freeze([
 Object.freeze({id:'doge:legendary:fire:recruiter',definitionId:'doge',element:'fire',rarity:'legendary',edition:'recruiter',image:'/game/assets/cards/recruiter-v95/doge-diamond.webp',artOffsetY:0,artRegion:null}),
 Object.freeze({id:'pepe:mythic:storm:recruiter',definitionId:'pepe',element:'storm',rarity:'mythic',edition:'recruiter',image:'/game/assets/cards/recruiter-v95/pepe-void.webp',artOffsetY:0,artRegion:null})
]);
export const FLIP_QUESTS=Object.freeze([
 {id:'double-flips-10',family:'double_flips',goal:10,packs:1,card:null},
 {id:'double-flips-50',family:'double_flips',goal:50,packs:3,card:null},
 {id:'triple-flips-10',family:'triple_flips',goal:10,packs:3,card:null,title:'quest-goldfinger',titleName:'Goldfinger'},
 {id:'quad-flips-1',family:'quad_flips',goal:1,packs:5,card:null,title:'quest-diamond-hands',titleName:'Diamond Hands',portrait:'quest-diamond-hands-portrait',portraitName:'Diamond Hands Champion',image:'/game/assets/cards/memes-v45/diamond-hands-legendary.webp'},
].map(q=>Object.freeze(q)));
export const QUESTS95=Object.freeze([
 ...[[5,1],[25,1],[100,3],[250,5]].map(([goal,packs])=>({id:`played-${goal}`,family:'played',goal,packs,card:null})),
 ...[[3,1],[10,1],[50,3],[100,5]].map(([goal,packs])=>({id:`won-${goal}`,family:'won',goal,packs,card:null})),
 ...[[1,1,null],[3,2,null],[5,2,RECRUITER_VARIANTS95[0].id],[15,5,RECRUITER_VARIANTS95[1].id]].map(([goal,packs,card])=>({id:`referrals-${goal}`,family:'referrals',goal,packs,card})),
 ...COLLECTION_QUESTS129,
 ...FLIP_QUESTS
].map(Object.freeze));
export const REFERRAL_RULES95=Object.freeze({rounds:10,opponents:2,days:3});
export function referralCode95(search){const code=new URLSearchParams(search).get('ref');return /^[a-f0-9]{32}$/.test(code??'')?code:null;}
export function referralLink95(origin,code){if(!/^[a-f0-9]{32}$/.test(code))throw Error('Invalid invitation code');return new URL('/account/register?ref='+code,origin).href;}
export function questProgress95(quest,counts,claimed=[]){const current=Number(counts[quest.family]??0),done=claimed.includes(quest.id);return {current,progress:Math.min(current,quest.goal),percent:Math.min(100,current/quest.goal*100),claimed:done,ready:!done&&current>=quest.goal};}
