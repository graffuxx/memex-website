import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createMatchHandler90} from '../server/game/match-handler90.mjs';
import {createPvp90,advancePvp90} from '../server/game/pvp90.mjs';
import {DEFINITIONS} from '../public/game/platform/catalog.mjs';
import {abilityBursts,abilityMarkers} from '../public/game/src/ability-effects.mjs';
import {boardPreviewFace146} from '../public/game/src/board-card-preview146.mjs';
import {abilityIconTextureSvg} from '../public/game/src/card-ability-icon.mjs';
import {releasedPrimeAbility,previewEffect,ABILITIES} from '../public/game/src/table-demo-rules.mjs';
import {legalCandidates} from '../public/game/src/tactics-ai.mjs';

const fixtures=JSON.parse(await readFile(new URL('./prime-duel-fixtures.json',import.meta.url),'utf8'));
const finalGuardFixtures=JSON.parse(await readFile(new URL('./final-guard-fixtures.json',import.meta.url),'utf8'));
const players=['90909090-9090-4090-8090-000000000001','90909090-9090-4090-8090-000000000002'];
const standard=(element,count)=>DEFINITIONS.filter(c=>!c.prime&&!c.iconic&&c.element===element).slice(0,count).map(c=>c.id+':common');
const regulars=[...standard('earth',3),...standard('water',3),...standard('air',2),...standard('storm',2),...standard('fire',2)];
const fixtureDecks=motif=>[
 ['awkward-penguin:common','yo-dawg:common',motif+':common',...regulars],
 ['philosoraptor:common','good-guy-greg:common','numa-numa:common',...regulars],
];
const matchOptions={elementalTrial:true,iconicAbilities:true,iconicAbilityWave:6,releasedPrimeTrio:true,releasedPrimePair:true};
const exclusive=['ernie','roundhouse','phalanx','pincer','relay','retry','gate','dash','blink','cling'];
const eventKey={ernie:'ward',roundhouse:'transforms',phalanx:'rally',pincer:'pincer',relay:'relay',retry:'selfTurn',
 gate:'blockadeLock',dash:'dash',chorus:'transforms',jam:'jam',sandwich:'sandwich',bailout:'bailout',fan:'reserve',blink:'blink',cling:'attachment'};

test('all 15 Prime badges and rules are assigned only in the new private snapshot',()=>{
 const primes=DEFINITIONS.filter(c=>c.prime);
 assert.equal(primes.length,15);
 assert.equal(fixtures.length,30);
 assert.equal(new Set(primes.map(p=>releasedPrimeAbility({id:p.ruleId},true,true))).size,15);
 for(const {id,ruleId} of primes){
  const deck=fixtureDecks(id).map(cards=>({cards}));
  const ability=releasedPrimeAbility({id:ruleId},true,true);
  assert.ok(fixtures.some(f=>f.motif===id&&f.ability===ability&&f.starter===0));
  assert.ok(fixtures.some(f=>f.motif===id&&f.ability===ability&&f.starter===1));
  assert.ok(ABILITIES[ability]?.description);
  assert.ok(abilityIconTextureSvg(ability));
  for(const flags of [{},{...matchOptions},{...matchOptions,allPrimes:true}]){
   let duel=createPvp90(deck,1489,0,flags);
   duel=advancePvp90({...duel,phase:'initiative',rpsWinner:0},0,{kind:'starter',side:0},1);
   const player=duel.game.players[0],card=[...player.hand,...player.deck].find(c=>c.id===ruleId);
   assert.equal(card.ability,flags.allPrimes||flags.elementalTrial&&!exclusive.includes(ability)?ability:undefined);
  }
 }
});

test('Concurrent opening choices, Prime abilities and Final Guard resolve through the real duel API',async()=>{
 const db=new PGlite();
 const close=()=>db.close();
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
   create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text,raw_user_meta_data jsonb default '{}');
   create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
   grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);
  const migrations=new URL('../supabase/migrations/',import.meta.url);
  for(const file of (await readdir(migrations)).filter(f=>f.endsWith('.sql')).sort())await db.exec(await readFile(new URL(file,migrations),'utf8'));
  const deckIds=[];
  for(const [side,uid] of players.entries()){
   await db.query('insert into auth.users(id,email_confirmed_at,email) values($1,now(),$2)',[uid,'test'+side+'@example.test']);
   await db.exec(`set request.jwt.claim.sub='${uid}';select public.dv_initialize_account();`);
   await db.query('update public.dv_profiles set display_name=$2 where user_id=$1',[uid,'Prime tester '+side]);
   deckIds[side]=(await db.query('select id from public.dv_decks where user_id=$1',[uid])).rows[0].id;
  }
  let seed=0;
  const now=Date.now();
  const handler=createMatchHandler90({seed:()=>seed,now:()=>now,env:k=>({SUPABASE_URL:'https://private-fixture.test',SUPABASE_SERVICE_ROLE_KEY:'local-fixture-only'})[k],fetcher:async(url,options)=>{
   if(url.endsWith('/auth/v1/user')){
    const uid=players[Number(options.headers.Authorization?.slice(7))];
    return uid?Response.json({id:uid,email_confirmed_at:'2026-11-24'}):Response.json({},{status:401});
   }
   const method=url.split('/').at(-1),pairs=Object.entries(JSON.parse(options.body));
   assert.match(method,/^dv_[a-z0-9_]+$/);
   assert.ok(pairs.every(([k])=>/^p_[a-z0-9_]+$/.test(k)));
   try{
    const sql='select public.'+method+'('+pairs.map(([k],i)=>k+'=> $'+(i+1)).join(',')+') data';
    const result=await db.query(sql,pairs.map(([,v])=>v&&typeof v==='object'?JSON.stringify(v):v));
    return Response.json(result.rows[0].data);
   }catch(error){return Response.json({message:error.message,code:error.code},{status:400});}
  }});
  async function request(side,data,status=200){
   const res=await handler(new Request('https://private-fixture.test/api/duel',{method:'POST',headers:{Authorization:'Bearer '+side},body:JSON.stringify(data)}));
   const body=await res.json();assert.equal(res.status,status,JSON.stringify({data,error:body.error}));return body;
  }
  await db.exec('set role service_role');
  for(const kind of ['private','random']){
   const host=await request(0,{op:'join',kind,deckId:deckIds[0]});
   const joined=await request(1,{op:'join',kind,deckId:deckIds[1],...(host.code?{code:host.code}:{})});
   const id=host.id,poll=side=>request(side,{op:'poll',id});
   assert.equal(joined.id,id);
   const opening=await poll(0);
   const choose=(version,attempt,value)=>({op:'move',id,version,requestId:crypto.randomUUID(),move:{kind:'gesture',value,...(attempt===undefined?{}:{attempt})}});
   const same=choose(opening.version,opening.attempt,'rock');
   await Promise.all([request(0,same),request(1,choose(opening.version,opening.attempt,'rock'))]);
   const tie=await poll(0);
   assert.equal(tie.attempt,2);
   assert.equal(tie.ownChoice,null);
   assert.equal(tie.opponentChosen,false);
   const replay=await request(0,same);
   assert.equal(replay.version,tie.version);
   assert.equal(replay.ownChoice,null);
   await request(0,choose(tie.version,opening.attempt,'paper'),409);
   await request(1,choose(opening.version,opening.attempt,'paper'),409);
   assert.equal((await poll(0)).ownChoice,null);
   const first=await request(1,choose(tie.version,undefined,'scissors'));
   assert.equal(first.ownChoice,'scissors');
   const second=await request(0,choose(tie.version,undefined,'rock'));
   assert.equal(second.phase,'initiative');
   assert.equal(second.rpsWinner,0);
   const started=await request(0,{op:'move',id,version:second.version,requestId:crypto.randomUUID(),move:{kind:'starter',side:1}});
   assert.equal(started.game.starter,1);
   await request(0,{op:'leave',id});
  }
  let blinkWithAttackBonus=false;
  for(const fixture of [...fixtures,...finalGuardFixtures.fixtures]){
   const closing=fixture.ability==='final-guard';
   await db.exec('reset role');
   for(const [side,cards] of (closing?[finalGuardFixtures.cards,finalGuardFixtures.cards]:fixtureDecks(fixture.motif)).entries()){
    await db.query('insert into public.dv_inventory(user_id,variant_id,quantity) select $1,id,1 from unnest($2::text[]) ids(id) on conflict do nothing',[players[side],cards]);
    await db.query('update public.dv_decks set cards=$2::text[] where id=$1',[deckIds[side],cards]);
   }
   await db.exec('set role service_role');
   seed=fixture.seed;
   const host=await request(0,{op:'join',kind:'private',deckId:deckIds[0]});
   assert.equal(host.phase,'waiting');
   const id=host.id;
   const joined=await request(1,{op:'join',kind:'private',deckId:deckIds[1],code:host.code});
   assert.equal(joined.id,id);
   const poll=side=>request(side,{op:'poll',id});
   const move=async(side,input,view=undefined)=>{
    const next=view??await poll(side);
    return request(side,{op:'move',id,version:next.version,requestId:crypto.randomUUID(),move:input});
   };
   await move(0,{kind:'gesture',value:'rock'});
   await move(1,{kind:'gesture',value:'scissors'});
   const started=await move(0,{kind:'starter',side:fixture.starter});
   assert.equal(started.game.starter,fixture.starter);
   assert.ok(started.game.allPrimes);
   assert.ok(started.game.finalGuard);
   let last;
   for(const {side,motif,action} of fixture.moves){
    const state=await poll(side),game=state.game,played=game.players[0].hand.find(c=>c.variantId===motif);
    assert.ok(played,fixture.motif+' '+motif);
    const local=previewEffect(game,{...action,uid:played.uid});
    last=await move(side,{kind:'place',action:{...action,uid:played.uid}},state);
    assert.deepEqual(last.game.last.flips,local.flips,fixture.motif);
    if(local.blink){
     const {source,cell}=local.blink;
     const preview=abilityMarkers(game,local,{blinkLabel:'BLINK'}).filter(marker=>marker.kind==='blink'&&marker.preview);
     assert.deepEqual(preview.map(marker=>[marker.cell,marker.label]),[[source,'BLINK'],[cell,'↻ 60°']]);
     assert.match(boardPreviewFace146(game,source).ability.description,/Blinzler bereit/);
     assert.match(boardPreviewFace146(last.game,source).ability.description,/Blinzler verbraucht/);
     assert.ok(abilityBursts(last.game,{blinkLabel:'BLINK'}).some(marker=>marker.cell===cell&&marker.label==='↻ 60°'));
    }
    if(local.blink&&local.card.ability==='storm'){
     const boosted=local.comparisons.find(({attack})=>attack.ability>0);
     if(boosted){
      const expected=[{dir:(boosted.dir+1)%6,total:boosted.attack.total}];
      assert.deepEqual(last.game.last.attackEdges,expected);
      assert.deepEqual((await poll(1-side)).game.last.attackEdges,expected);
      blinkWithAttackBonus=true;
     }
    }
   }
   const other=await poll(1-fixture.moves.at(-1).side);
   if(closing){
    assert.equal(last.game.placements,18);
    assert.equal(last.phase,'between');
    assert.equal(last.game.last.finalGuard.cell,fixture.saved);
    assert.deepEqual(last.game.last.finalGuard,other.game.last.finalGuard);
    assert.equal(last.game.board[fixture.saved].controller,1);
    assert.equal(other.game.board[fixture.saved].controller,0);
    for(const view of [last,other]){
     assert.ok(abilityMarkers(view.game,null).some(marker=>marker.kind==='final-guard'&&marker.cell===fixture.saved));
    }
    await move(0,{kind:'ready'});
    const next=await move(1,{kind:'ready'});
    assert.equal(next.round,2);
    assert.equal(next.game.starter,fixture.starter);
    assert.ok(next.game.finalGuard);
    assert.equal(next.game.last?.finalGuard,undefined);
    await request(0,{op:'leave',id});
    continue;
   }
   const key=eventKey[fixture.ability],effect=last.game.last[key];
   assert.ok(Array.isArray(effect)?effect.length:effect,fixture.motif+' starter '+fixture.starter);
   assert.deepEqual(other.game.last[key],effect);
   for(const state of [last,other]){
    assert.ok(state.game.players[1].hand.every(card=>card.hidden&&!card.ability));
    assert.ok(abilityBursts(state.game).some(mark=>mark.kind===fixture.ability),fixture.motif);
    assert.deepEqual(state.wallet,{pixels:0,shards:0,echoes:0});
   }
   for(const [cell,card] of Object.entries(last.game.board)){
    const identical=other.game.board[cell];
    assert.equal(identical.controller,1-card.controller);
    assert.equal(identical.rotation,card.rotation);
    if(card.ernieWard)assert.equal(identical.ernieWard.owner,1-card.ernieWard.owner);
    if(card.phalanxLink)assert.equal(identical.phalanxLink.owner,1-card.phalanxLink.owner);
    if(card.attachedLink)assert.deepEqual(identical.attachedLink,card.attachedLink);
   }
   if(last.game.blockadeLock)assert.equal(other.game.blockadeLock.owner,1-last.game.blockadeLock.owner);
   if(last.game.fanReserve)assert.equal(other.game.fanReserve.owner,1-last.game.fanReserve.owner);
   if(fixture.motif==='pablo-waiting'){
    // Continue to the break and confirm that the next round reloads the new rules for the alternate starter.
    let view=await poll(0);
    while(view.phase==='play'){
     const side=view.game.turn;
     const own=side?await poll(1):view;
     await move(side,{kind:'place',action:legalCandidates(own.game)[0].action},own);
     view=await poll(0);
    }
    assert.equal(view.phase,'between');
    await move(0,{kind:'ready'},view);
    const next=await move(1,{kind:'ready'});
    assert.equal(next.round,2);
    assert.equal(next.game.starter,fixture.starter);
    assert.ok(next.game.allPrimes);
   }
   await request(0,{op:'leave',id});
  }
  assert.ok(blinkWithAttackBonus,'the fixture tests Storm after Blinking Guy rotates the placed card');
 }finally{await close();}
});
