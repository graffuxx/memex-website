// One element model for the account, card faces, boosters and authoritative game.
export const ELEMENT_IDS=Object.freeze(['fire','water','earth','air','storm']);
export const normalizeElement=id=>id==='stone'?'earth':id;
/** @type {Record<string,{name:string,symbol:string,color:string,from:string,to:string,path:string,beats:string[],stroke?:boolean}>} */
const raw={
 fire:{name:'Fire',symbol:'🔥',color:'#ff9d62',from:'#fff07a',to:'#ff8d12',path:'M128 16 C139 48 153 67 141 98 C156 91 172 76 177 59 C176 105 208 130 208 166 C208 211 174 241 128 241 C78 241 48 210 48 170 C48 135 72 111 78 85 C78 120 95 138 93 103 C91 75 113 44 128 16 Z M128 218 C136 220 145 218 153 214 C168 203 169 183 149 159 C151 171 147 182 137 190 C137 172 117 168 119 142 C116 157 99 168 96 184 C93 203 104 218 128 218 Z',beats:['earth','air']},
 water:{name:'Water',symbol:'≈',color:'#65cfff',from:'#d4fbff',to:'#2284e4',path:'M128 18 C112 68 49 120 49 167 C49 266 207 266 207 167 C207 120 144 68 128 18 Z',beats:['fire','earth']},
 earth:{name:'Earth',symbol:'◆',color:'#d6bc78',from:'#f7e7ae',to:'#a9853a',path:'M128 26 L210 128 L128 230 L46 128 Z',beats:['air','storm']},
 air:{name:'Air',symbol:'≋',color:'#a9eee1',from:'#edfff9',to:'#57bbaa',path:'M28 82 H157 C217 82 218 17 177 25 C156 28 153 47 168 56 M28 126 H207 C252 126 246 184 216 182 C197 180 191 165 201 154 M28 170 H119 C166 170 169 230 133 230 C113 230 105 215 117 203',beats:['storm','water'],stroke:true},
 storm:{name:'Storm',symbol:'ϟ',color:'#bb99ff',from:'#fff3c2',to:'#a49aff',path:'M151 20 L59 138 L118 138 L92 236 L202 108 L136 108 Z',beats:['water','fire']}
};
export const ELEMENTS=Object.freeze(Object.fromEntries(ELEMENT_IDS.map(id=>[id,Object.freeze({id,...raw[id],beats:Object.freeze(raw[id].beats)})])));
export const ELEMENT_LIST=Object.freeze(ELEMENT_IDS.map(id=>ELEMENTS[id]));
export function elementAdvantage(attacker,defender,rules=5){
 const a=normalizeElement(attacker),b=normalizeElement(defender);
 if(rules===3)return ({fire:'earth',earth:'storm',storm:'fire'})[a]===b;
 return ELEMENTS[a]?.beats.includes(b)??false;
}
// Five-element games compare numeric edge strength first. Elements only break a tie.
// Historical three-element saves retain their already-recorded additive totals.
export function attackWins(attack,defend,rules=5){
 return attack.total>defend.total||(rules!==3&&attack.total===defend.total&&attack.element>defend.element);
}
export function elementSvg(id){const e=ELEMENTS[normalizeElement(id)];if(!e)throw Error('Unknown element');return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><defs><linearGradient id="e" x2="0" y2="1"><stop stop-color="${e.from}"/><stop offset="1" stop-color="${e.to}"/></linearGradient></defs><path d="${e.path}" fill="${e.stroke?'none':'url(#e)'}" stroke="${e.stroke?'url(#e)':'#ffd876'}" stroke-width="${e.stroke?16:5}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;}
