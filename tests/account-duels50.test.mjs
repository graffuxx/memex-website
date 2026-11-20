import test from 'node:test';import assert from 'node:assert/strict';import {PGlite} from '@electric-sql/pglite';import fs from 'node:fs/promises';
import {createAccountDuel,beginAccountRound,advanceAccountDuel} from '../server/game/engine50.mjs';
import {createGameHandler} from '../server/game/handler50.mjs';
import {starterDeck,starterInventory} from '../public/game/platform/catalog.mjs';import {chooseTactic} from '../public/game/src/tactics-ai.mjs';import {scores,moveTargets} from '../public/game/src/rules.mjs';
const a='00000000-0000-4000-8000-000000000001',b='00000000-0000-4000-8000-000000000002',id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
const fresh=(seed=42,starter=0)=>createAccountDuel({deck:{id:id(9),name:'Owned starter',cards:starterDeck()},inventory:starterInventory(),seed,starter});
function finish(state){let result;while(!state.game.finished){result=advanceAccountDuel(state,{kind:'place',action:chooseTactic(state.game).chosen.action});state=result.state;}return result;}
test('account duels use owned 15-card snapshots, fixed facing, the same field/ability rules and reward each round independently',()=>{
 assert.throws(()=>createAccountDuel({deck:{cards:starterDeck()},inventory:{},seed:1,starter:0}),/not playable/);
 for(const starter of [0,1]){const initial=fresh(42,starter);let {state}=beginAccountRound(initial);const old=structuredClone(state);assert.throws(()=>advanceAccountDuel(state,{kind:'place',action:{uid:'fake',cell:'0,0',rotation:0}}));assert.deepEqual(state,old);
  const shift=moveTargets(state.game)[0];if(shift){const next=advanceAccountDuel(state,{kind:'shift',cell:shift});assert.equal(next.state.game.placements,state.game.placements);assert.equal(next.award,0);state=next.state;assert.throws(()=>advanceAccountDuel(state,{kind:'shift',cell:shift}));}
  const r1=finish(state);assert.equal(r1.state.game.placements,18);assert.deepEqual(r1.state.results[0],scores(r1.state.game));assert.equal(r1.award,r1.state.game.winner===0?5:2);assert.equal(r1.state.awards[0],r1.award);assert.throws(()=>advanceAccountDuel(r1.state,{kind:'timeout'}));
  const back=advanceAccountDuel(r1.state,{kind:'next'});assert.equal(back.award,0);assert.equal(back.state.game.starter,1-starter);assert.equal(back.state.round,2);const r2=finish(back.state);assert.equal(r2.state.awards.length,2);assert.deepEqual(r2.state.awards,[r1.award,r2.award]);assert.throws(()=>advanceAccountDuel(r2.state,{kind:'next'}));
 }
});
test('service authentication rejects missing/invalid sessions, unknown origins and forged outcomes before touching a wallet',async()=>{
 let writes=0;const handle=createGameHandler({env:k=>({SUPABASE_URL:'https://example.test',SUPABASE_SERVICE_ROLE_KEY:'server-only',SUPABASE_ANON_KEY:'public'})[k],fetcher:async(url,opt)=>{if(url.endsWith('/auth/v1/user'))return Response.json({message:'Invalid token'},{status:401});writes++;throw Error('must not query');}});
 assert.equal((await handle(new Request('https://test',{method:'POST',body:'{}'}))).status,401);assert.equal((await handle(new Request('https://test',{method:'POST',headers:{Authorization:'Bearer bogus'},body:JSON.stringify({winner:0,reward:99999})}))).status,401);assert.equal((await handle(new Request('https://test',{method:'POST',headers:{Origin:'https://evil.test'},body:'{}'}))).status,403);assert.equal(writes,0);
});
test('only the trusted game service can persist results; duplicate/concurrent finalization, reload and round two cannot double credit',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users(id) values('${a}'),('${b}');`);
 for(const name of (await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).sort())await db.exec(await fs.readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8'));
 async function asUser(u){await db.exec(`reset role;set role authenticated;select set_config('request.jwt.claim.sub','${u}',false)`);await db.query('select public.dv_initialize_account()');}
 await asUser(a);await asUser(b);await asUser(a);const deck=(await db.query('select id,name,cards from public.dv_decks')).rows[0];const start=beginAccountRound(createAccountDuel({deck,inventory:starterInventory(),seed:3,starter:1})).state;
 const args=[a,id(101),JSON.stringify(start)];await assert.rejects(db.query('select public.dv_game_start50($1,$2,$3)',args),/permission denied/);await assert.rejects(db.query('select * from public.dv_game_sessions50'),/permission denied/);
 await db.exec('reset role;set role service_role');const started=(await db.query('select public.dv_game_start50($1,$2,$3) data',args)).rows[0].data;assert.equal(started.version,0);const same=(await db.query('select public.dv_game_start50($1,$2,$3) data',args)).rows[0].data;assert.equal(same.id,started.id);
 const r1=finish(start);assert.equal(r1.award,r1.state.game.winner===0?5:2);const commit=(n,version,state,award)=>db.query('select public.dv_game_commit50($1,$2,$3,$4,$5,$6,$7) data',[a,id(101),version,id(n),JSON.stringify(state),'[]',award]);
 const first=(await commit(110,0,r1.state,r1.award)).rows[0].data;assert.equal(first.wallet.pixels,r1.award);assert.deepEqual((await commit(110,0,r1.state,r1.award)).rows[0].data,first);await assert.rejects(commit(111,0,r1.state,r1.award),/Duel changed/);await assert.rejects(commit(112,1,r1.state,r1.award),/completed round/);
 const next=advanceAccountDuel(r1.state,{kind:'next'});await commit(120,1,next.state,0);const r2=finish(next.state);const second=(await commit(130,2,r2.state,r2.award)).rows[0].data;assert.equal(second.wallet.pixels,r1.award+r2.award);
 await db.exec('reset role');const rows=(await db.query("select amount,event_key from public.dv_reward_ledger where event_key like 'game50:%' order by event_key")).rows;assert.equal(rows.length,2);assert.equal(Number(rows[0].amount),r1.award);
 await asUser(b);await assert.rejects(commit(140,3,r2.state,5),/permission denied/);await assert.rejects(db.query('select * from public.dv_game_sessions50'),/permission denied/);
 await db.exec('reset role;set role service_role');await db.query('select public.dv_game_start50($1,$2,$3)',[a,id(102),JSON.stringify(start)]);await assert.rejects(commit(150,3,r2.state,0),/Duel unavailable/);
 }finally{await db.close();}
});

test('profile accepts an empty successful initialization response and loads only the authenticated account',async()=>{
 const seen=[];const handle=createGameHandler({env:k=>({SUPABASE_URL:'https://example.test',SUPABASE_SERVICE_ROLE_KEY:'server-only',SUPABASE_ANON_KEY:'public'})[k],fetcher:async(url,opt)=>{seen.push(url);if(url.endsWith('/auth/v1/user'))return Response.json({id:a});if(url.endsWith('rpc/dv_initialize_account')){assert.equal(opt.headers.Authorization,'Bearer user-session');return new Response(null,{status:204});}if(url.includes('dv_decks?'))return Response.json([{id:id(9),name:'Saved',cards:starterDeck(),active:true}]);if(url.includes('dv_wallets?'))return Response.json([{earned:7,premium:0,echoes:0}]);throw Error('Unexpected request');}});
 const res=await handle(new Request('https://test',{method:'POST',headers:{Authorization:'Bearer user-session'},body:JSON.stringify({op:'profile',userId:b})}));assert.equal(res.status,200);const data=await res.json();assert.equal(data.wallet.pixels,7);assert.equal(data.decks[0].name,'Saved');assert.ok(seen.filter(url=>url.includes('?')).every(url=>url.includes(a)));
});
