import assert from 'node:assert/strict';
import test from 'node:test';
import {BETA_BY_ID} from '../public/game/platform/beta-cards.mjs';
import {newGame,sideValue,scores} from '../public/game/src/rules.mjs';
import {previewEffect,placeEffect,effectStrength,CURRENT_ICONIC_WAVE} from '../public/game/src/table-demo-rules.mjs';

const flags={betaTrial:true,abilityTrial:true,elementalTrial:true,abilityRework:true,rotationLocked:true,
  elementRules:5,eventFieldsEnabled:false,earthSupport:true,finalGuard:true,allPrimes:true,iconicAbilityWave:CURRENT_ICONIC_WAVE};
const alpha=(id,side,extras={})=>({id,uid:id+'-'+side,origin:side,controller:side,rotation:0,...extras});
const beta=(key,side,extras={})=>{
  const id='beta-'+key;
  assert.ok(BETA_BY_ID[id]);
  return {...alpha(id,side,extras),beta:key};
};
const boardCard=(side,dir,value,extras={})=>alpha('brain',side,{betaEdges:{[dir]:value},...extras});
function match(starter,hand,board,block='0,-2',turn=0){
  const g=Object.assign(newGame({seed:3,starter}),flags,{block,board,placements:Object.keys(board).length,turn});
  g.players=g.players.map((p,side)=>({...p,hand:side===turn?hand:[],deck:[]}));
  return g;
}
const play=(card,cell='0,0',choice=null)=>({uid:card.uid,cell,betaChoice:choice});
for(const starter of [0,1]){
  const group=starter===0?'starts':'responds';
  test('Final Cut changes the capture and cycles exactly one hand card · '+group,()=>{
    const lead=beta('cinema',0),spare=alpha('trust',0),enemy=boardCard(1,3,8);
    const g=match(starter,[lead,spare],{'1,0':enemy});
    g.players[0].deck=[alpha('oracle',0)];
    assert.deepEqual(previewEffect(g,play(lead)).flips,[]);
    const activated=play(lead,'0,0',{discard:spare.uid,directions:[0]});
    assert.deepEqual(previewEffect(g,activated).flips,['1,0']);
    assert.equal(g.board['1,0'].controller,1);
    const next=placeEffect(g,activated);
    assert.deepEqual(next.players[0].hand.map(c=>c.id),['oracle']);
    assert.deepEqual(next.players[0].deck.map(c=>c.id),['trust']);
    assert.equal(next.board['0,0'].betaAttack,undefined);
    assert.throws(()=>previewEffect(g,play(lead,'0,0',{discard:lead.uid,directions:[0]})),/Final Cut/);
  });
  test('Sad Hamster hits a newly lost card, even after shifting the block · '+group,()=>{
    const lead=beta('hamster',0),g=match(starter,[lead],{'1,0':boardCard(1,3,6)});
    g.history=[{type:'place',side:1,flips:['1,0']}];g.last={type:'shift',side:0};
    assert.deepEqual(previewEffect(g,play(lead)).flips,['1,0']);
    g.history[0].flips=['1,-1'];
    assert.deepEqual(previewEffect(g,play(lead)).flips,[]);
  });
  test('T-Pose stops a numeric flip and leaves S intact · '+group,()=>{
    const lead=alpha('brain',0), wall=beta('tpose',1),enemy=boardCard(1,3,4);
    const g=match(starter,[lead],{'0,1':wall,'1,0':enemy});
    assert.equal(previewEffect(g,play(lead)).comparisons.find(h=>h.cell==='1,0').attack.total,3);
    assert.ok(!previewEffect(g,play(lead)).flips.includes('1,0'));
    wall.betaDisabled=true;assert.ok(previewEffect(g,play(lead)).flips.includes('1,0'));
    wall.betaDisabled=false;lead.betaEdges={0:10};
    assert.ok(previewEffect(g,play(lead)).flips.includes('1,0'));
  });
  test('Cliffhanger relocates and resolves one follow-up without duplicating a card · '+group,()=>{
    const lead=beta('continued',0),g=match(starter,[lead],{'1,0':boardCard(1,3,2),'0,2':boardCard(1,4,2,{uid:'far'})});
    const action=play(lead,'0,0',{landing:'0,1',target:'0,2'});
    assert.deepEqual(previewEffect(g,action).flips,['1,0','0,2']);
    const next=placeEffect(g,action);
    assert.equal(next.board['0,1'].uid,lead.uid);
    assert.ok(!next.board['0,0']);
    assert.deepEqual(scores(next),[3,0]);
    assert.throws(()=>previewEffect(g,play(lead,'0,0',{landing:g.block})),/Cliffhanger/);
  });
  test('Hackerman changes the correct printed edge but never overwrites S · '+group,()=>{
    const lead=beta('hackerman',0),enemy=boardCard(1,0,6);
    const g=match(starter,[lead],{'-1,0':enemy});
    const action=play(lead,'0,0',{target:'-1,0',direction:0});
    assert.deepEqual(previewEffect(g,play(lead)).flips,[]);
    assert.equal(sideValue(placeEffect(g,action).board['-1,0'],0),4);
    assert.deepEqual(previewEffect(g,action).flips,['-1,0']);
    enemy.betaEdges={0:10};
    assert.throws(()=>previewEffect(g,action),/Override/);
  });
  test('Spicy powers exactly two attacks · '+group,()=>{
    const lead=beta('spicy',0),east=boardCard(1,3,3),south=boardCard(1,4,6,{uid:'south'});
    const g=match(starter,[lead],{'1,0':east,'0,1':south});
    assert.deepEqual(previewEffect(g,play(lead)).flips,['1,0','0,1']);
    delete g.board['0,1'];assert.deepEqual(previewEffect(g,play(lead)).flips,[]);
  });
  test('Imma Head Out weakens its own highest number once and keeps printed S · '+group,()=>{
    const lead=alpha('brain',0), target=beta('headout',1,{betaEdges:{2:10}});
    const g=match(starter,[lead],{'1,0':target});
    const first=placeEffect(g,play(lead)).board['1,0'];
    assert.equal(first.headoutSpent,true);
    assert.equal(sideValue(first,0),5);
    assert.equal(sideValue(first,2),10);
    const again=match(starter,[lead],{'1,0':{...first,controller:1}});
    assert.equal(sideValue(placeEffect(again,play(lead)).board['1,0'],0),5);
  });
  test('High Ground only adds defense at the rim · '+group,()=>{
    const defender=beta('highground',1),attacker=alpha('trust',0),g=match(starter,[attacker],{'2,0':defender});
    assert.equal(effectStrength(g,defender,'2,0',3,attacker).total,7);
    assert.equal(effectStrength(g,defender,'1,0',3,attacker).total,5);
    assert.equal(effectStrength(g,defender,'2,0',3,attacker,{attacking:true}).total,5);
  });
  test('Parkour crosses a free cell, respects a blockage and cannot jump with S · '+group,()=>{
    const lead=beta('parkour',0),g=match(starter,[lead],{'2,0':boardCard(1,3,3)});
    const action=play(lead,'0,0',{direction:0});
    assert.deepEqual(previewEffect(g,action).flips,['2,0']);
    g.block='1,0';assert.throws(()=>previewEffect(g,action),/Weitsprung/);
    g.block='0,-2';
    g.board['1,0']=boardCard(0,0,4);
    assert.deepEqual(previewEffect(g,action).flips,['2,0']);
    g.board['1,0'].controller=1;
    assert.throws(()=>previewEffect(g,action),/Weitsprung/);
    delete g.board['1,0'];
    lead.betaEdges={0:10};
    assert.throws(()=>previewEffect(g,action),/Weitsprung/);
  });
  test('Over 9000 charges a chosen number only with an allied neighbor · '+group,()=>{
    const lead=beta('over9000',0), ally=alpha('oracle',0);
    const g=match(starter,[lead],{'-1,0':ally,'1,0':boardCard(1,3,7)});
    const action=play(lead,'0,0',{direction:0});
    assert.deepEqual(previewEffect(g,play(lead)).flips,[]);
    const charged=placeEffect(g,action);
    assert.deepEqual(charged.last.flips,['1,0']);
    assert.equal(sideValue(charged.board['0,0'],0),8);
    ally.controller=1;
    assert.throws(()=>previewEffect(g,action),/Aufladung/);
    ally.controller=0;lead.betaEdges={0:10};
    assert.throws(()=>previewEffect(g,action),/Aufladung/);
  });
}
