import {series113,seriesStarter113} from '../public/game/platform/series113.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
import {createPvp90,advancePvp90,expirePvp90,projectPvp90} from '../server/game/pvp90.mjs';
import {CURRENT_ICONIC_WAVE} from '../public/game/src/table-demo-rules.mjs';
import {abilityMarkers} from '../public/game/src/ability-effects.mjs';
import {createMatchHandler90} from '../server/game/match-handler90.mjs';
import {starterDeck} from '../public/game/platform/catalog.mjs';import {chooseTactic,legalCandidates} from '../public/game/src/tactics-ai.mjs';import {moveTargets,scores} from '../public/game/src/rules.mjs';
const uid=n=>'90909090-9090-4090-8090-'+String(n).padStart(12,'0'),a=uid(1),b=uid(2),c=uid(3),d=uid(4),deck={id:uid(9),name:'Owned deck',cards:starterDeck()};
async function db90(){const db=new PGlite();await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users(id,email_confirmed_at,email) values('${a}',now(),'a90@example.test'),('${b}',now(),'b90@example.test'),('${c}',now(),'c90@example.test'),('${d}',null,'d90@example.test');`);for(const f of (await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort())await db.exec(await fs.readFile(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'));for(const u of [a,b,c,d])await db.exec(`set request.jwt.claim.sub='${u}';select public.dv_initialize_account();`);return db;}
async function rpc(db,name,args){const params=Object.entries(args);return (await db.query('select public.'+name+'('+params.map(([k],i)=>k+'=> $'+(i+1)).join(',')+') data',params.map(([,v])=>v&&typeof v==='object'?JSON.stringify(v):v))).rows[0].data;}
const opening=s=>advancePvp90(advancePvp90(advancePvp90(s,0,{kind:'gesture',value:'rock'},1),1,{kind:'gesture',value:'scissors'},1),0,{kind:'starter',side:0},1);
test('two-player rules hide hands and future draws, enforce turns and preserve the timer on blockade moves',()=>{
 const initial=createPvp90([deck,deck],42,0),before=structuredClone(initial);assert.throws(()=>advancePvp90(initial,1,{kind:'starter',side:1},0));assert.deepEqual(initial,before);
 let s=advancePvp90(initial,0,{kind:'gesture',value:'rock'},1);let p=projectPvp90({id:uid(10),host_id:a,guest_id:b,state:s,identities:[{},{}],kind:'random',status:'matched',version:1},b,1);assert.equal(p.ownChoice,null);assert.equal(p.opponentChosen,true);assert.equal(p.lastRps,null);assert.equal(p.game,null);assert.ok(!JSON.stringify(p).includes('scissors'));assert.ok(!Object.hasOwn(p,'seed'));
 s=advancePvp90(s,1,{kind:'gesture',value:'scissors'},2);assert.throws(()=>advancePvp90(s,1,{kind:'starter',side:1},3));s=advancePvp90(s,0,{kind:'starter',side:0},3);
 const row={id:uid(10),host_id:a,guest_id:b,state:s,identities:[{},{}],kind:'random',status:'matched',version:3};for(const u of [a,b]){p=projectPvp90(row,u,3);assert.ok(p.game.players[1].hand.every(c=>c.hidden&&!c.variantId&&!c.ability));assert.ok(p.game.players.flatMap(p=>p.deck).every(c=>c.hidden&&!c.variantId));assert.ok(p.game.players[0].hand.every(c=>c.variantId));assert.equal(p.game.turn,u===a?0:1);assert.ok(!JSON.stringify(p).includes('"decks"'));}
 assert.throws(()=>advancePvp90(s,1,{kind:'place',action:chooseTactic(s.game).chosen.action},4),/not your turn/);
 const deadline=s.deadline,cell=moveTargets(s.game)[0];s=advancePvp90(s,0,{kind:'shift',cell},4);assert.equal(s.deadline,deadline);assert.equal(expirePvp90(s,deadline-1),null);const timed=expirePvp90(s,deadline);assert.equal(timed.game.placements,1);assert.equal(timed.game.turn,1);assert.equal(timed.deadline,deadline+90000);
});
test('random pairing, invitations, permissions, first-to-two rounds and idempotent rewards stay server-authoritative',async()=>{
 const db=await db90();try{
  const decks=Object.fromEntries((await db.query('select user_id,id from public.dv_decks')).rows.map(r=>[r.user_id,r.id]));
  await db.exec('set role authenticated');await assert.rejects(rpc(db,'dv_match_join90',{p_user:a,p_kind:'random',p_deck:decks[a]}),/permission denied/);for(const table of ['dv_pvp90','dv_pvp_seats90','dv_pvp_rounds90','dv_random_skills90'])await assert.rejects(db.query('select * from public.'+table),/permission denied/);
  await db.exec('reset role;set role service_role');await assert.rejects(rpc(db,'dv_match_join90',{p_user:d,p_kind:'random',p_deck:decks[d]}),/Verify/);await assert.rejects(rpc(db,'dv_match_join90',{p_user:a,p_kind:'ranked',p_deck:decks[a]}),/coming soon/);await assert.rejects(rpc(db,'dv_match_join90',{p_user:a,p_kind:'random',p_deck:decks[b]}),/saved/);
  const id=await rpc(db,'dv_match_join90',{p_user:a,p_kind:'random',p_deck:decks[a]});assert.equal(await rpc(db,'dv_match_join90',{p_user:a,p_kind:'random',p_deck:decks[a]}),id);assert.equal(await rpc(db,'dv_match_join90',{p_user:b,p_kind:'random',p_deck:decks[b]}),id);await assert.rejects(rpc(db,'dv_match_get90',{p_user:c,p_id:id}),/unavailable/);await assert.rejects(rpc(db,'dv_match_cancel90',{p_user:a,p_id:id}),/match was found/);
  let row=await rpc(db,'dv_match_get90',{p_user:a,p_id:id}),s=createPvp90([row.host_deck,row.guest_deck],3,0),version=0,n=100;
  async function commit(next,u=a,request=uid(n++),v=version){const out=await rpc(db,'dv_match_commit90',{p_user:u,p_id:id,p_version:v,p_request:request,p_state:next});version=out.version;s=out.state;return out;}
  await commit(s);
  await assert.rejects(commit(s,a,uid(n++),0),e=>e.code==='PT409');
  const patched=(await db.query("select count(*) n from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('dv_game_commit50','dv_game_commit_base113','dv_match_commit90','dv_match_commit_human96') and p.prosrc like '%PT409%'")).rows[0];assert.ok(Number(patched.n)>=3);
  await db.exec(await fs.readFile(new URL('../supabase/migrations/202611230008_conflict_codes139.sql',import.meta.url),'utf8'));
  await assert.rejects(commit(s,a,uid(n++),0),e=>e.code==='PT409');
  await commit(advancePvp90(s,0,{kind:'gesture',value:'rock'},1));await commit(advancePvp90(s,1,{kind:'gesture',value:'scissors'},1),b);await commit(advancePvp90(s,0,{kind:'starter',side:0},1));
  let expected=[0,0],completedRounds=0;for(let round=1;!series113(s.results).finished&&round<20;round++){
   while(!s.game.finished){const side=s.game.turn,next=advancePvp90(s,side,{kind:'place',action:chooseTactic(s.game).chosen.action},2);await commit(next,side===0?a:b);}
   completedRounds++;for(const side of [0,1])expected[side]+=s.game.winner===side?5:2;
   const request=uid(n-1),v=version-1,owner=s.game.last.side===0?a:b;
   const duplicate=await rpc(db,'dv_match_commit90',{p_user:owner,p_id:id,p_version:v,p_request:request,p_state:s});assert.equal(duplicate.version,version);
   if(!series113(s.results).finished){await commit(advancePvp90(s,0,{kind:'ready'},3));assert.equal(s.round,round);await commit(advancePvp90(s,1,{kind:'ready'},3),b);assert.equal(s.round,round+1);assert.equal(s.game.starter,seriesStarter113(s.starter,round+1));}
  }
  assert.equal(s.phase,'ended');await db.exec('reset role');const wallets=(await db.query('select user_id,earned from public.dv_wallets where user_id in ($1,$2) order by user_id',[a,b])).rows;assert.deepEqual(wallets.map(r=>Number(r.earned)),expected);assert.equal(Number((await db.query('select count(*) n from public.dv_pvp_rounds90')).rows[0].n),completedRounds*2);assert.equal(Number((await db.query('select count(*) n from public.dv_pvp_seats90')).rows[0].n),0);
  for(const u of [a,b]){await db.exec(`set request.jwt.claim.sub='${u}';set role authenticated`);const identity=await rpc(db,'dv_identity85',{});assert.ok(identity.skills.total_flips>0);await db.exec('reset role');}
  // Private invitation round: no currency, XP or feat events are ever inserted.
  await db.exec('set role service_role');const privateId=await rpc(db,'dv_match_join90',{p_user:a,p_kind:'private',p_deck:decks[a]});row=await rpc(db,'dv_match_get90',{p_user:a,p_id:privateId});assert.match(row.invite_code,/^[a-f0-9]{64}$/);assert.equal(await rpc(db,'dv_match_join90',{p_user:b,p_kind:'private',p_deck:decks[b],p_code:row.invite_code}),privateId);row=await rpc(db,'dv_match_get90',{p_user:a,p_id:privateId});let ps=createPvp90([row.host_deck,row.guest_deck],3,0),pv=0;async function savePrivate(next){const result=await rpc(db,'dv_match_commit90',{p_user:a,p_id:privateId,p_version:pv,p_request:uid(n++),p_state:next});pv=result.version;ps=result.state;}
  await savePrivate(ps);await savePrivate(opening(ps));while(!ps.game.finished)await savePrivate(advancePvp90(ps,ps.game.turn,{kind:'place',action:chooseTactic(ps.game).chosen.action},2));await db.exec('reset role');assert.equal(Number((await db.query('select count(*) n from public.dv_pvp_rounds90')).rows[0].n),completedRounds*2);assert.deepEqual((await db.query('select user_id,earned from public.dv_wallets where user_id in ($1,$2) order by user_id',[a,b])).rows.map(r=>Number(r.earned)),expected);
  await db.exec('set role service_role');await rpc(db,'dv_match_commit90',{p_user:a,p_id:privateId,p_version:pv,p_request:uid(n++),p_state:advancePvp90(ps,0,{kind:'resign'},4)});const wait=await rpc(db,'dv_match_join90',{p_user:c,p_kind:'random',p_deck:decks[c]});await rpc(db,'dv_match_cancel90',{p_user:c,p_id:wait});await db.exec('reset role');assert.equal(Number((await db.query('select count(*) n from public.dv_pvp_seats90')).rows[0].n),0);
 }finally{await db.close();}
});
test('HTTP service authenticates both clients, rejects forged results and reprojects the same saved board after reconnect',async()=>{
 const db=await db90();try{
  const decks=Object.fromEntries((await db.query('select user_id,id from public.dv_decks')).rows.map(r=>[r.user_id,r.id]));let sequence=1000,time=0;
  const handler=createMatchHandler90({env:k=>({SUPABASE_URL:'https://db90.test',SUPABASE_SERVICE_ROLE_KEY:'server-only'})[k],seed:()=>9,now:()=>time,requestId:()=>uid(sequence++),fetcher:async(url,opt)=>{
   if(url.endsWith('/auth/v1/user')){const id=({a,b,c})[opt.headers.Authorization?.replace('Bearer ','')];return id?Response.json({id,email_confirmed_at:'2026-11-20',is_anonymous:false}):Response.json({error:'bad'},{status:401});}
   const name=url.split('/').at(-1);try{await db.exec('reset role;set role service_role');return Response.json(await rpc(db,name,JSON.parse(opt.body)));}catch(e){return Response.json({message:e.message,code:e.code},{status:400});}
  }});
  const call=async(user,body)=>{const r=await handler(new Request('https://memex.test/api/duel',{method:'POST',headers:{Authorization:'Bearer '+user,'Content-Type':'application/json',Origin:'https://memex.test'},body:JSON.stringify(body)}));return {status:r.status,data:await r.json()};};
  assert.equal((await call('bad',{op:'join',kind:'random',deckId:decks[a]})).status,401);assert.equal((await call('a',{op:'join',kind:'ranked',deckId:decks[a]})).status,400);
  let x=(await call('a',{op:'join',kind:'random',deckId:decks[a]})).data;assert.equal(x.phase,'waiting');const id=x.id;assert.equal((await call('b',{op:'join',kind:'random',deckId:decks[b]})).data.id,id);assert.equal((await call('c',{op:'poll',id})).status,400);
  x=(await call('a',{op:'poll',id})).data;assert.equal(x.phase,'rps');const sign={op:'move',id,version:x.version,requestId:uid(sequence++),move:{kind:'gesture',value:'rock'}};x=(await call('a',sign)).data;const y=(await call('b',{op:'poll',id})).data;assert.equal(y.ownChoice,null);assert.equal(y.opponentChosen,true);assert.equal(y.lastRps,null);assert.equal((await call('a',sign)).data.version,x.version);
  assert.equal((await call('a',{...sign,requestId:uid(sequence++)})).status,409);assert.equal((await call('a',{op:'poll',id})).data.version,x.version);
  x=(await call('b',{op:'move',id,version:y.version,requestId:uid(sequence++),move:{kind:'gesture',value:'scissors'}})).data;x=(await call('a',{op:'move',id,version:x.version,requestId:uid(sequence++),move:{kind:'starter',side:0}})).data;assert.equal(x.phase,'play');assert.equal(x.game.turn,0);assert.equal((await call('b',{op:'move',id,version:x.version,requestId:uid(sequence++),move:{kind:'place',action:{uid:'fake',cell:'0,0',rotation:0}},award:9999})).status,400);
  const beforeVersion=x.version;time=90001;const timed=(await call('b',{op:'poll',id,version:beforeVersion})).data;assert.equal(timed.game.placements,1);assert.equal(timed.game.turn,0);const restored=(await call('a',{op:'poll',id})).data;assert.equal(restored.version,timed.version);assert.equal(restored.game.turn,1);assert.deepEqual(Object.keys(restored.game.board),Object.keys(timed.game.board));assert.equal((await call('a',{op:'poll',id,version:restored.version})).data.unchanged,true);
 }finally{await db.close();}
});

test('Private and Random store recalled-board scores and rewards from either first player',async t=>{
 const db=await db90();
 try{
  const decks=Object.fromEntries((await db.query('select user_id,id from public.dv_decks')).rows.map(r=>[r.user_id,r.id]));
  const entries=[[a,'here-we-go-again'],[b,'numa-numa']];
  for(const [user,prime] of entries){
   const cards=[prime+':common','first-world-problems:common',...starterDeck().slice(0,13)];
   await db.query('insert into public.dv_inventory(user_id,variant_id,quantity) select $1,id,1 from unnest($2::text[]) ids(id) on conflict do nothing',[user,cards]);
   await db.query('update public.dv_decks set cards=$2::text[] where id=$1',[decks[user],cards]);
  }
  const outcomes=[];
  let sequence=40000;
  for(const kind of ['private','random'])for(const starter of [0,1]){
   let match,phase,guardSeen=false;
   const effects=new Set(),time=Date.now();
   for(const seed of [189,48,84,109,133,345,522,789,1599,2173]){
    const handler=createMatchHandler90({
     env:key=>({SUPABASE_URL:'https://db90.test',SUPABASE_SERVICE_ROLE_KEY:'isolated'})[key],seed:()=>seed,now:()=>time,
     fetcher:async(url,opt)=>{
      if(url.endsWith('/auth/v1/user'))return Response.json({id:({a,b})[opt.headers.Authorization.slice(7)],email_confirmed_at:'2026-11-26'});
      try{await db.exec('reset role;set role service_role');return Response.json(await rpc(db,url.split('/').at(-1),JSON.parse(opt.body)));}
      catch(e){return Response.json({message:e.message,code:e.code},{status:400});}
     }
    });
    async function call(player,body){
     const res=await handler(new Request('https://memex.test/api/duel',{method:'POST',headers:{Authorization:'Bearer '+player},body:JSON.stringify(body)}));
     const output=await res.json();
     assert.equal(res.status,200,JSON.stringify(output));
     return output;
    }
    let x=await call('a',{op:'join',kind,deckId:decks[a]});
    match=x.id;
    assert.equal((await call('b',{op:'join',kind,deckId:decks[b],code:x.code??null})).id,match);
    const poll=player=>call(player,{op:'poll',id:match});
    const move=(player,move)=>call(player,{op:'move',id:match,version:x.version,requestId:uid(sequence++),move});
    x=await poll('a');
    x=await move('a',{kind:'gesture',value:'rock'});
    x=await move('b',{kind:'gesture',value:'scissors'});
    x=await move('a',{kind:'starter',side:starter});
    assert.equal(x.game.iconicAbilityWave,CURRENT_ICONIC_WAVE);
    for(let turn=0;turn<18;turn++){
     const client=x.game.turn===0?'a':'b';
     const view=client==='a'?x:await poll('b');
     const legal=legalCandidates(view.game);
     const option=legal.find(item=>item.action.recallCell)
      ??legal.find(item=>item.plan.handDisrupted)
      ??legal.find(item=>item.action.cycleUid)
      ??(turn===17?legal.find(item=>item.plan.finalGuard):undefined)
      ??chooseTactic(view.game,{policy:'position'}).chosen;
     assert.ok(option);
     x=await move(client,{kind:'place',action:option.action});
     if(client==='b')x=await poll('a');
     assert.equal(x.game.placements,turn+1);
     if(x.game.last.handCycled)effects.add('cycle');
     if(x.game.last.recalledCell)effects.add('recall');
     if(x.game.last.handDisrupted)effects.add('discard');
    }
    phase=x.phase;
    assert.equal(phase,'between');
    const recalled=x.game.history.some(move=>move.recalledCell);
    const score=scores(x.game);
    assert.equal(score[0]+score[1],recalled?17:18);
    assert.deepEqual(x.results[0],score);
    assert.deepEqual((await poll('b')).results[0],score.toReversed());
    guardSeen||=recalled&&abilityMarkers(x.game,null).some(marker=>marker.kind==='final-guard');
    await db.exec('reset role');
    const rewards=(await db.query('select award from public.dv_pvp_rounds90 where match_id=$1 order by user_id',[match])).rows;
    assert.deepEqual(rewards.map(row=>row.award),kind==='private'?[]:[0,1].map(side=>side===x.game.winner?5:2));
    assert.equal((await db.query('select completed from public.dv_balance_rounds94 where match_id=$1',[match])).rows[0].completed,true);
    await call('a',{op:'leave',id:match});
    if(effects.size===3&&guardSeen)break;
   }
   assert.deepEqual([...effects].sort(),['cycle','discard','recall']);
   assert.ok(guardSeen);
   outcomes.push({kind,starter,effects:[...effects],guardSeen});
  }
  t.diagnostic(JSON.stringify(outcomes));
 }finally{await db.close();}
});

test('Private rematch keeps both players, uses the edited deck, and never opens duplicate rooms',async()=>{
 const db=await db90();
 try{
  const decks=Object.fromEntries((await db.query('select user_id,id from public.dv_decks')).rows.map(r=>[r.user_id,r.id]));
  let now=Date.now();
  const handler=createMatchHandler90({
   env:key=>({SUPABASE_URL:'https://db90.test',SUPABASE_SERVICE_ROLE_KEY:'isolated'})[key],seed:()=>93,now:()=>now,
   fetcher:async(url,opt)=>{
    if(url.endsWith('/auth/v1/user'))return Response.json({id:({a,b,c})[opt.headers.Authorization.slice(7)],email_confirmed_at:'2026-11-26'});
    try{await db.exec('reset role;set role service_role');return Response.json(await rpc(db,url.split('/').at(-1),JSON.parse(opt.body)));}
    catch(e){return Response.json({message:e.message,code:e.code},{status:400});}
   }
  });
  async function call(player,body,status=200){
   const res=await handler(new Request('https://memex.test/api/duel',{method:'POST',headers:{Authorization:'Bearer '+player},body:JSON.stringify(body)}));
   const output=await res.json();
   assert.equal(res.status,status,JSON.stringify(output));
   return output;
  }
  const lobby=await call('a',{op:'join',kind:'private',deckId:decks[a]});
  const id=lobby.id;
  assert.equal((await call('b',{op:'join',kind:'private',deckId:decks[b],code:lobby.code})).id,id);
  let x=await call('a',{op:'poll',id});
  const move=(player,move,status=200)=>call(player,{op:'move',id,requestId:crypto.randomUUID(),version:x.version,move},status);
  await move('a',{kind:'rematch'},400);
  x=await move('a',{kind:'gesture',value:'rock'});
  x=await move('b',{kind:'gesture',value:'scissors'});
  x=await move('a',{kind:'starter',side:0});

  for(let turn=0;x.phase!=='ended'&&turn<180;turn++){
   if(x.phase==='between'){
    now+=8000;
    x=await call('a',{op:'poll',id});
    continue;
   }
   const client=x.game.turn===0?'a':'b';
   const view=client==='a'?x:await call('b',{op:'poll',id});
   x=await move(client,{kind:'place',action:chooseTactic(view.game,{policy:'position'}).chosen.action});
   if(client==='b')x=await call('a',{op:'poll',id});
  }
  assert.equal(x.phase,'ended');
  const results=x.results;
  assert.equal(x.rematch.ownReady,false);
  assert.equal(x.rematch.previousDeckId,decks[a]);
  assert.equal(await call('a',{op:'active'}),null);
  await move('c',{kind:'rematch'},400);
  await move('a',{kind:'rematch',deckId:decks[b]},400);
  await move('a',{kind:'rematch',deckId:{}},400);

  const cards=['here-we-go-again:common',...starterDeck().slice(0,14)];
  await db.exec(`reset role;set request.jwt.claim.sub='${a}';set role authenticated`);
  const editedDeck=(await db.query('select public.dv_save_friendly_deck131(null,$1,$2::text[]) as id',['Rematch strategy',cards])).rows[0].id;
  x=await move('a',{kind:'rematch',deckId:editedDeck});
  assert.equal(x.rematch.ownReady,true);
  assert.equal(x.rematch.opponentReady,false);
  assert.equal(x.rematch.nextMatchId,null);
  const watching=await call('b',{op:'poll',id,version:x.version});
  assert.equal(watching.rematch.opponentReady,true);
  assert.equal(watching.rematch.ownReady,false);
  assert.equal(await call('a',{op:'active'}),null);

  x=await move('a',{kind:'cancel-rematch'});
  assert.equal(x.rematch.ownReady,false);
  x=await move('a',{kind:'rematch',deckId:editedDeck});
  const [accepted,retry]=await Promise.all([move('b',{kind:'rematch'}),move('b',{kind:'rematch'})]);
  const next=accepted.rematch.nextMatchId;
  assert.ok(next&&next!==id);
  assert.equal(retry.rematch.nextMatchId,next);
  assert.equal((await call('a',{op:'poll',id,version:x.version})).rematch.nextMatchId,next);
  assert.deepEqual((await call('a',{op:'poll',id})).results,results);
  assert.equal((await call('b',{op:'active'})).id,next);
  const opening=await call('a',{op:'poll',id:next});
  assert.equal(opening.kind,'private');
  assert.equal(opening.phase,'rps');
  assert.deepEqual(opening.results,[]);
  await db.exec('reset role');
  const row=(await db.query('select host_id,guest_id,host_deck,guest_deck,invite_code from public.dv_pvp90 where id=$1',[next])).rows[0];
  assert.equal(row.host_id,a);
  assert.equal(row.guest_id,b);
  assert.equal(row.host_deck.id,editedDeck);
  assert.deepEqual(row.host_deck.cards,cards);
  assert.equal(row.guest_deck.id,decks[b]);
  assert.equal(row.invite_code,null);
  assert.equal((await db.query('select count(*)::int n from public.dv_private_rematches')).rows[0].n,1);

  assert.equal((await call('a',{op:'leave',id:next})).left,true);
  assert.equal(await call('a',{op:'active'}),null);
  assert.equal(await call('b',{op:'active'}),null);
  const conceded=await call('b',{op:'poll',id:next});
  assert.equal(conceded.forfeit,1);
  assert.equal(conceded.rematch,undefined);
 }finally{await db.close();}
});

test('private duel stickers relay to both seats without changing the turn, and saved slots are per account',async()=>{
 const db=await db90();
 try{
  const stickerIds=['kekw','rage-guy','dramatic-chipmunk','crying-cat'];
  const reordered=['crying-cat','rage-guy','dramatic-chipmunk','kekw'];
  const decks=Object.fromEntries((await db.query('select user_id,id from public.dv_decks')).rows.map(r=>[r.user_id,r.id]));
  const asUser=async user=>db.exec(`reset role;set request.jwt.claim.sub='${user}';set role authenticated`);
  await asUser(a);
  assert.deepEqual(await rpc(db,'dv_sticker_loadout',{}),stickerIds);
  await assert.rejects(db.query("select public.dv_save_sticker_loadout(array['kekw','kekw','rage-guy','crying-cat'])"),/four different/);
  await assert.rejects(db.query("select public.dv_save_sticker_loadout(array['boom','kekw','rage-guy','crying-cat'])"),/locked or unknown/);
  assert.deepEqual((await db.query('select public.dv_save_sticker_loadout($1::text[]) data',[reordered])).rows[0].data,reordered);
  await assert.rejects(rpc(db,'dv_duel_stickers',{p_user:a,p_match:uid(777),p_slot:1}),/permission denied/);
  const cashSlots=['sticker-make-it-rain',...reordered.slice(1)];
  await assert.rejects(db.query('select public.dv_save_sticker_loadout($1::text[]) data',[cashSlots]),/locked or unknown/);
  await db.exec('reset role;set role service_role');
  const order=await rpc(db,'dv_prepare_supporter_order',{p_user:a,p_request:uid(761),p_product:'supporter-100',p_environment:'sandbox'});
  await rpc(db,'dv_attach_supporter_order',{p_user:a,p_id:order.id,p_paypal:'CASHORDERMATCH001'});
  await rpc(db,'dv_complete_supporter_order',{p_user:a,p_id:order.id,p_paypal:'CASHORDERMATCH001',
   p_capture:'CASHCAPTUREMATCH01',p_cents:10000,p_currency:'EUR',p_environment:'sandbox'});
  await asUser(a);
  assert.deepEqual((await db.query('select public.dv_save_sticker_loadout($1::text[]) data',[cashSlots])).rows[0].data,cashSlots);
  await asUser(b);
  assert.deepEqual(await rpc(db,'dv_sticker_loadout',{}),stickerIds);

  const handler=createMatchHandler90({env:k=>({SUPABASE_URL:'https://db90.test',SUPABASE_SERVICE_ROLE_KEY:'test-only'})[k],seed:()=>31,now:()=>10,fetcher:async(url,opt)=>{
   if(url.endsWith('/auth/v1/user')){
    const id=({a,b,c})[opt.headers.Authorization.replace('Bearer ','')];
    return id?Response.json({id,email_confirmed_at:'2026-11-28'}):Response.json({}, {status:401});
   }
   await db.exec('reset role;set role service_role');
   try{return Response.json(await rpc(db,url.split('/').at(-1),JSON.parse(opt.body)));}
   catch(e){return Response.json({message:e.message,code:e.code},{status:400});}
  }});
  async function call(user,body){
   const response=await handler(new Request('https://memex.test/api/duel',{method:'POST',headers:{Authorization:'Bearer '+user},body:JSON.stringify(body)}));
   return {status:response.status,data:await response.json()};
  }

  const host=(await call('a',{op:'join',kind:'private',deckId:decks[a]})).data;
  const id=host.id;
  await call('b',{op:'join',kind:'private',deckId:decks[b],code:host.code});
  assert.equal((await call('a',{op:'sticker',id,slot:1})).status,400);
  let duel=(await call('a',{op:'poll',id})).data;
  let sequence=800;
  for(const [who,move] of [['a',{kind:'gesture',value:'rock'}],['b',{kind:'gesture',value:'scissors'}],['a',{kind:'starter',side:0}]]){
   const result=await call(who,{op:'move',id,version:duel.version,requestId:uid(sequence++),move});
   assert.equal(result.status,200);
   duel=result.data;
  }
  const [beforeA,beforeB]=[(await call('a',{op:'poll',id,stickers:true})).data,(await call('b',{op:'poll',id,stickers:true})).data];
  assert.equal(beforeA.phase,'play');
  assert.equal(beforeB.game.turn,1);
  assert.deepEqual(beforeA.stickers.slots,cashSlots);
  assert.deepEqual(beforeB.stickers.slots,stickerIds);
  assert.equal((await call('c',{op:'sticker',id,slot:1})).status,400);
  assert.equal((await call('a',{op:'sticker',id,slot:5})).status,400);
  const first=(await call('a',{op:'sticker',id,slot:1})).data.stickers.events[0];
  assert.equal(first.sticker,'sticker-make-it-rain');
  assert.equal(first.own,true);
  assert.equal((await call('a',{op:'sticker',id,slot:2})).status,429);
  const fromGuest=(await call('b',{op:'sticker',id,slot:2})).data.stickers.events;
  assert.deepEqual(fromGuest.find(e=>e.id===first.id),{...first,own:false});
  assert.equal(fromGuest.find(e=>e.own).sticker,'rage-guy');

  const update=(await call('a',{op:'poll',id,version:beforeA.version,stickers:true})).data;
  assert.equal(update.unchanged,true);
  assert.equal(update.remainingMs,beforeA.remainingMs);
  assert.equal(update.stickers.events.find(e=>!e.own).sticker,'rage-guy');
  assert.equal((await call('a',{op:'poll',id,version:beforeA.version})).data.stickers,undefined);
  await db.exec("reset role;update public.dv_duel_sticker_events set sent_at=now()-interval '5 seconds'");
  assert.deepEqual((await call('b',{op:'poll',id,version:beforeB.version,stickers:true})).data.stickers.events,[]);
  await call('a',{op:'leave',id});
  assert.equal((await call('b',{op:'sticker',id,slot:1})).status,400);
 }finally{await db.close();}
});

test('cosmetic purchases debit Shards once, and only owners can equip the items',async()=>{
 const db=await db90();
 try{
  const {SHOP_PORTRAITS}=await import('../public/game/platform/cosmetic-shop.mjs');
  const {DUEL_STICKERS,STARTER_STICKER_SLOTS}=await import('../public/game/platform/duel-stickers.mjs');
  const asUser=async user=>db.exec(`reset role;set request.jwt.claim.sub='${user}';set role authenticated`);
  const buy=(id,price)=>rpc(db,'dv_buy_cosmetic',{p_id:id,p_price:price});
  const outfit=avatar=>rpc(db,'dv_save_cosmetics87',{p_avatar:avatar,p_frame:'auto',p_title:'rookie'});
  const equip=slots=>db.query('select public.dv_save_sticker_loadout($1::text[]) data',[slots]);
  const paidSticker='sticker-loot-goblin',portrait='portrait-void-pepe';
  const animatedPortrait='portrait-void-pepe-animated';
  const slots=[paidSticker,...STARTER_STICKER_SLOTS.slice(1)];
  await db.exec('reset role;set role anon');
  const catalog=await rpc(db,'dv_cosmetic_shop_items',{});
  assert.equal(catalog.length,12);
  for(const item of catalog){
   const art=item.kind==='portrait'?SHOP_PORTRAITS.find(p=>p.id===item.id):DUEL_STICKERS[item.id];
   assert.ok(art,item.id);
   assert.equal(item.price,{Standard:100,Gold:150,Void:250}[art.rarity],item.id);
  }
  assert.deepEqual(catalog.filter(item=>item.kind==='portrait').map(item=>item.id).sort(),SHOP_PORTRAITS.map(item=>item.id).sort());
  const stickerOffers=catalog.filter(item=>item.kind==='sticker');
  assert.equal(new Set(stickerOffers.map(item=>DUEL_STICKERS[item.id].name)).size,7);
  assert.equal(new Set(stickerOffers.map(item=>DUEL_STICKERS[item.id].image)).size,7);
  assert.equal(stickerOffers.filter(item=>Boolean(DUEL_STICKERS[item.id].motion)).length,5);
  for(const id of [paidSticker,'sticker-panic-button']){
   const sticker=DUEL_STICKERS[id];
   assert.equal(stickerOffers.find(item=>item.id===id)?.price,250);
   assert.equal(sticker.rarity,'Void');
   assert.ok(sticker.motion && sticker.prop && sticker.parts.length);
  }
  assert.ok(!stickerOffers.some(item=>item.id==='sticker-boom'));
  assert.equal(DUEL_STICKERS['sticker-boom'].name,'Boom');
  await assert.rejects(buy(paidSticker,250),/permission denied/);
  await asUser(a);
  await assert.rejects(equip(slots),/locked or unknown/);
  await assert.rejects(outfit(portrait),/locked or unknown/);
  await assert.rejects(buy(paidSticker,250),/Not enough Shards/);
  await db.exec('reset role');
  await db.query('update public.dv_wallets set premium=700,earned=25,echoes=7 where user_id=$1',[a]);
  await asUser(a);
  await assert.rejects(buy('kekw',100),/unavailable/);
  await assert.rejects(buy(paidSticker,200),/price changed/);
  assert.deepEqual(await buy(paidSticker,250),{id:paidSticker,kind:'sticker',shards:450,alreadyOwned:false});
  assert.equal((await buy(paidSticker,250)).alreadyOwned,true);
  assert.deepEqual((await equip(slots)).rows[0].data,slots);
  assert.deepEqual(await rpc(db,'dv_sticker_loadout',{}),slots);
  assert.deepEqual(await buy('sticker-grass-dlc',100),{id:'sticker-grass-dlc',kind:'sticker',shards:350,alreadyOwned:false});
  assert.deepEqual(await buy(portrait,100),{id:portrait,kind:'portrait',shards:250,alreadyOwned:false});
  assert.equal((await outfit(portrait)).avatarId,portrait);
  await assert.rejects(outfit(animatedPortrait),/locked or unknown/);
  assert.equal((await buy(animatedPortrait,250)).shards,0);
  assert.equal((await outfit(animatedPortrait)).avatarId,animatedPortrait);
  const identity=await rpc(db,'dv_identity85',{});
  assert.ok(identity.owned.includes('portrait:'+portrait));
  assert.ok(identity.owned.includes('sticker:'+paidSticker));
  const [wallet]=(await db.query('select earned,premium,echoes from public.dv_wallets where user_id=$1',[a])).rows;
  assert.deepEqual([wallet.earned,wallet.premium,wallet.echoes].map(Number),[25,0,7]);
  await asUser(b);
  await assert.rejects(equip(slots),/locked or unknown/);
  await assert.rejects(outfit(portrait),/locked or unknown/);
  await db.exec("reset role;update public.dv_cosmetic_shop set listed=false where id='sticker-loot-goblin'");
  await asUser(b);
  assert.ok(!(await rpc(db,'dv_cosmetic_shop_items',{})).some(item=>item.id===paidSticker));
  await assert.rejects(buy(paidSticker,250),/unavailable/);
  await asUser(a);
  assert.deepEqual((await equip(slots)).rows[0].data,slots);
  const charged=(await db.query("select amount from public.dv_reward_ledger where event_key like 'cosmetic-shop:%' order by amount")).rows;
  assert.deepEqual(charged.map(row=>Number(row.amount)),[-250,-250,-100,-100]);
 }finally{await db.close();}
});
