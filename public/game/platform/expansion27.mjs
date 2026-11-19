// Approved previews; clockwise edge order: E, SE, SW, W, NW, NE.
export const EXPANSION_CARDS=Object.freeze([
 {id:'harold',name:'Hide the Pain Harold',short:'Harold',element:'stone',values:[5,4,4,5,3,3],artOffsetY:-.045,quote:'Everything is fine. Probably.'},
 {id:'disaster-girl',name:'Disaster Girl',short:'Disaster Girl',element:'fire',values:[7,3,3,4,3,4],artOffsetY:-.22,quote:'A perfectly controlled situation.'},
 {id:'distracted',name:'Distracted Boyfriend',short:'Distracted',element:'storm',values:[3,5,4,3,4,4],quote:'A different strategy just walked by.'},
 {id:'side-eye',name:'Side Eye Chloe',short:'Side Eye',element:'stone',values:[6,4,2,5,4,3],artOffsetY:-.085,quote:'You call that a plan?'},
 {id:'success-kid',name:'Success Kid',short:'Success Kid',element:'fire',values:[6,5,4,2,3,4],artOffsetY:-.22,quote:'One small fist. One big flip.'},
 {id:'grumpy-cat',name:'Grumpy Cat',short:'Grumpy Cat',element:'stone',values:[3,4,5,5,4,3],quote:'I had fun once. Awful.'},
 {id:'aliens-guy',name:'Ancient Aliens Guy',short:'Aliens Guy',element:'storm',values:[3,5,4,3,6,3],artOffsetY:-.09,quote:'The explanation is obvious.'},
 {id:'smudge',name:'Smudge the Cat',short:'Smudge',element:'fire',values:[3,3,6,2,4,4],quote:'I specifically ordered no salad.'},
 {id:'confused',name:'Confused Nick Young',short:'Confused',element:'storm',values:[5,3,4,4,5,3],artOffsetY:-.04,quote:'Wait. That was your move?'},
 {id:'bad-luck-brian',name:'Bad Luck Brian',short:'Bad Luck Brian',element:'storm',values:[4,4,4,4,4,4],artOffsetY:-.045,quote:'Finally gets a good hand. Wrong table.'}
].map(c=>Object.freeze({...c,ruleId:c.id,ability:null,artOffsetY:c.artOffsetY??0,values:Object.freeze(c.values),image:`/game/assets/cards/memes-v27/${c.id}-common.webp`})));
