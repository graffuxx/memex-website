import {series113} from '../public/game/platform/series113.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
import {createBot96,armBot96,stepBot96,BOT_DIFFICULTY97,BOT_POLICY97} from '../server/game/bot96.mjs';
import {createPvp90,advancePvp90,projectPvp90} from '../server/game/pvp90.mjs';
import {createMatchHandler90} from '../server/game/match-handler90.mjs';
import {getVariant,countCards,validateDeck,starterDeck} from '../public/game/platform/catalog.mjs';import {chooseTactic} from '../public/game/src/tactics-ai.mjs';
const uid=n=>'96969696-9696-4696-8696-'+String(n).padStart(12,'0'),a=uid(1),b=uid(2),c=uid(3);
const deck={name:'Human deck',cards:starterDeck()};
test('AI identities and balanced 15-card decks vary, stay legal and never contain Recruiter rewards',()=>{
 assert.equal(BOT_DIFFICULTY97,'standard');assert.equal(BOT_POLICY97,'is-mcts');
 const names=new Set(),decks=new Set();for(let seed=1;seed<=100;seed++){
  const bot=createBot96(seed);assert.deepEqual(bot,createBot96(seed));assert.ok(bot.identity.isAi);assert.ok(bot.identity.displayName.length<=24);assert.ok(validateDeck(bot.deck.cards,countCards(bot.deck.cards)).valid);
  const elements={};for(const id of bot.deck.cards){const v=getVariant(id);assert.equal(v.edition,'alpha');elements[v.element]=(elements[v.element]??0)+1;}assert.deepEqual(Object.values(elements),[3,3,3,3,3]);names.add(bot.identity.displayName);decks.add(bot.deck.cards.join(','));
 }assert.ok(names.size>80);assert.equal(decks.size,100);
});
test('AI uses its own hand and public board, never reacts to hidden RPS or opponent cards',()=>{
 let state=createPvp90([deck,createBot96(7).deck],123,0);state.bot96={seed:42,nextAt:0};
 const choices=['rock','paper','scissors'].map(value=>{const s=structuredClone(state);s.choices[0]=value;const n=stepBot96(s,0);return n.lastRps.choices[1];});assert.equal(new Set(choices).size,1);
 state=advancePvp90(advancePvp90(state,0,{kind:'gesture',value:'rock'},0),1,{kind:'gesture',value:'scissors'},0);state=advancePvp90(state,0,{kind:'starter',side:1},0);state=armBot96(state,0);assert.equal(stepBot96(state,state.bot96.nextAt-1),null);
 const budget={limits:{iterations:12,maxMs:1000},now:()=>0},first=stepBot96(state,state.bot96.nextAt,budget),other=structuredClone(state);other.game.players[0].hand=other.game.players[0].hand.map(c=>({...c,id:'brain',element:'fire'}));other.game.players[0].deck.reverse();assert.deepEqual(stepBot96(other,state.bot96.nextAt,budget).step.action,first.step.action);assert.equal(first.game.placements,1);assert.equal(first.game.turn,0);assert.equal(first.bot96.nextAt,null);
 const view=projectPvp90({id:uid(9),host_id:a,guest_id:null,identities:[{},createBot96(7).identity],ai_opponent96:{isAi:true},state:first,kind:'random',status:'matched',version:3},a);assert.equal(view.opponentType,'ai');assert.ok(!JSON.stringify(view).includes('bot96'));assert.ok(view.game.players[1].hand.every(c=>c.hidden&&!c.variantId));assert.ok(view.game.players.flatMap(p=>p.deck).every(c=>c.hidden));
});
async function setup(skip98=false){const db=new PGlite();await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users(id,email_confirmed_at,email) values('${a}',now(),'a96@example.test'),('${b}',now(),'b96@example.test'),('${c}',now(),'c96@example.test');`);
for(const f of (await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')&&(!skip98||f<'202611210005_random_progress98.sql')).sort())await db.exec(await fs.readFile(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'));for(const u of [a,b,c])await db.exec(`set request.jwt.claim.sub='${u}';select public.dv_initialize_account();`);return db;}
async function rpc(db,name,args){const p=Object.entries(args);return (await db.query('select public.'+name+'('+p.map(([k],i)=>k+'=> $'+(i+1)).join(',')+') data',p.map(([,v])=>v&&typeof v==='object'?JSON.stringify(v):v))).rows[0].data;}
test('empty queue fallback, human priority, cancel, reconnect, first-to-two AI rounds and isolated rewards are authoritative',async()=>{
 const db=await setup();try{
  const decks=Object.fromEntries((await db.query('select user_id,id from public.dv_decks')).rows.map(r=>[r.user_id,r.id]));const bot=createBot96(321);let n=100,time=Date.now();
  const handler=createMatchHandler90({env:k=>({SUPABASE_URL:'https://bot96.test',SUPABASE_SERVICE_ROLE_KEY:'isolated-test'})[k],now:()=>time,seed:()=>321,requestId:()=>uid(n++),fetcher:async(url,opt)=>{if(url.endsWith('/auth/v1/user')){const id=({a,b,c})[opt.headers.Authorization?.replace('Bearer ','')];return id?Response.json({id,email_confirmed_at:'2026-11-21'}):Response.json({},{status:401});}try{await db.exec('reset role;set role service_role');return Response.json(await rpc(db,url.split('/').at(-1),JSON.parse(opt.body)));}catch(e){return Response.json({message:e.message,code:e.code},{status:400});}}});
  async function call(who,body){const r=await handler(new Request('https://memex.test/api/duel',{method:'POST',headers:{Authorization:'Bearer '+who,'Content-Type':'application/json'},body:JSON.stringify(body)}));const v=await r.json();assert.equal(r.status,200,JSON.stringify(v));return v;}
  let x=await call('a',{op:'join',kind:'random',deckId:decks[a]});const cancelled=x.id;assert.equal((await call('a',{op:'poll',id:x.id})).status,'waiting');await call('a',{op:'cancel',id:x.id});assert.equal((await call('a',{op:'poll',id:cancelled})).status,'cancelled');
  // Even an overdue host is paired with a human when they join before fallback acquires the lock.
  x=await call('a',{op:'join',kind:'random',deckId:decks[a]});await db.exec(`reset role;update public.dv_pvp90 set created_at=now()-interval '36 seconds' where id='${x.id}'`);
  const human=await call('b',{op:'join',kind:'random',deckId:decks[b]});assert.equal(human.id,x.id);await db.exec('set role service_role');const stillHuman=await rpc(db,'dv_match_fill_ai96',{p_user:a,p_id:x.id,p_deck:bot.deck,p_identity:bot.identity});assert.equal(stillHuman.ai_opponent96,null);x=await call('a',{op:'poll',id:x.id});assert.equal(x.opponentType,'human');await call('a',{op:'move',id:x.id,version:x.version,requestId:uid(n++),move:{kind:'resign'}});
  const privateRoom=await call('b',{op:'join',kind:'private',deckId:decks[b]});await db.exec(`reset role;update public.dv_pvp90 set created_at=now()-interval '36 seconds' where id='${privateRoom.id}'`);assert.equal((await call('b',{op:'poll',id:privateRoom.id})).status,'waiting');await call('b',{op:'cancel',id:privateRoom.id});
  x=await call('a',{op:'join',kind:'random',deckId:decks[a]});const id=x.id;await db.exec(`reset role;update public.dv_pvp90 set created_at=now()-interval '34 seconds' where id='${id}';set role service_role`);assert.equal((await rpc(db,'dv_match_fill_ai96',{p_user:a,p_id:id,p_deck:bot.deck,p_identity:bot.identity})).status,'waiting');assert.equal((await call('a',{op:'poll',id})).status,'waiting');await db.exec(`reset role;update public.dv_pvp90 set created_at=now()-interval '36 seconds' where id='${id}'`);x=await call('a',{op:'poll',id});assert.equal(x.opponentType,'ai');assert.equal(x.players[1].isAi,true);assert.equal(x.players[1].displayName,bot.identity.displayName);assert.ok(!JSON.stringify(x).includes('"seed"'));
  await db.exec('reset role;set role authenticated');await assert.rejects(rpc(db,'dv_match_fill_ai96',{p_user:a,p_id:id,p_deck:bot.deck,p_identity:bot.identity}),/permission denied/);await assert.rejects(rpc(db,'dv_match_commit_human96',{p_user:a,p_id:id,p_version:0,p_request:uid(n++),p_state:{}}),/permission denied/);await assert.rejects(db.query('select * from public.dv_pvp90'),/permission denied/);
  await db.exec('reset role');
  const randomRules=(await db.query('select state from public.dv_pvp90 where id=$1',[id])).rows[0].state;
  assert.equal(randomRules.finalGuard,true);
  assert.equal(randomRules.elementalTrial,false);
  assert.ok(randomRules.balance.patch.endsWith('-random-final-guard'));
  let expected=0,expectedWins=0,manualMoves=0,lastRequest,lastVersion,lastMove;const restored=await call('a',{op:'poll',id});assert.deepEqual(restored.players,x.players);
  for(let guard=0;x.phase!=='ended'&&guard<150;guard++){
   time+=3000;
   if(x.phase==='rps'&&!x.ownChoice){lastMove={kind:'gesture',value:'rock'};}
   else if(x.phase==='initiative'&&x.rpsWinner===0)lastMove={kind:'starter',side:0};
   else if(x.phase==='play'&&x.game.turn===0)lastMove={kind:'place',action:chooseTactic(x.game,{policy:'position'}).chosen.action};
   // Round 1 must resume without a ready click; later rounds exercise Continue sooner.
   else if(x.phase==='between'&&x.round>1&&!x.ready[0])lastMove={kind:'ready'};
   else lastMove=null;
   const previous=x;
   if(lastMove){if(lastMove.kind==='place')manualMoves++;lastRequest=uid(n++);lastVersion=x.version;x=await call('a',{op:'move',id,version:x.version,requestId:lastRequest,move:lastMove});const duplicate=await call('a',{op:'move',id,version:lastVersion,requestId:lastRequest,move:lastMove});assert.equal(duplicate.version,x.version);}
   else x=await call('a',{op:'poll',id});
   if(x.game?.finished&&(!previous.game?.finished||previous.round!==x.round)){expected+=x.game.winner===0?5:2;if(x.game.winner===0)expectedWins++;}
   if(x.game)assert.equal(x.game.finalGuard,true);
   if(x.game&&!x.game.finished){const reconnect=await call('a',{op:'poll',id,version:x.version});if(!reconnect.unchanged)x=reconnect;}
  }
  assert.equal(x.phase,'ended');await db.exec('reset role');const saved=(await db.query('select state from public.dv_pvp90 where id=$1',[id])).rows[0].state;assert.equal(saved.bot96.opponent135.observations,manualMoves);assert.equal(saved.bot96.search135.engine,'is-mcts-1');assert.notEqual(saved.bot96.search135.reason,'invalid-belief-fallback');assert.ok(x.round>=2);assert.equal(Math.max(...x.series.wins),2);await db.exec('reset role');assert.equal(Number((await db.query('select earned from public.dv_wallets where user_id=$1',[a])).rows[0].earned),expected);assert.equal(Number((await db.query('select count(*) n from public.dv_pvp_rounds90')).rows[0].n),0);assert.equal(Number((await db.query('select count(*) n from public.dv_quest_activity95')).rows[0].n),0);assert.equal(Number((await db.query('select count(*) n from public.dv_xp_events85')).rows[0].n),expectedWins);assert.equal(Number((await db.query('select coalesce(sum(xp),0) n from public.dv_profile_progress85 where user_id=$1',[a])).rows[0].n),expectedWins*100);assert.equal(Number((await db.query('select count(*) n from public.dv_random_ai_rounds98')).rows[0].n),x.round);await db.exec("set request.jwt.claim.sub='"+a+"';set role authenticated");const questCounts=(await db.query('select public.dv_quest_status95() data')).rows[0].data.counts;assert.deepEqual({played:questCounts.played,won:questCounts.won,referrals:questCounts.referrals},{played:x.round,won:expectedWins,referrals:0});assert.ok(questCounts.collected>=15&&questCounts.collected<=65);await db.exec('reset role');assert.equal(Number((await db.query('select count(*) n from public.dv_random_skills90')).rows[0].n),0);assert.equal(Number((await db.query("select count(*) n from public.dv_balance_rounds94 where match_id=$1 and mode='ai'",[id])).rows[0].n),x.round);assert.equal(Number((await db.query('select count(*) n from public.dv_pvp_seats90')).rows[0].n),0);
 }finally{await db.close();}
});
test('a proved historic Random AI win gets quest credit and 100 XP once, never referral or skill-title credit',async()=>{
 const db=await setup(true);try{
  const did=(await db.query('select id from public.dv_decks where user_id=$1',[a])).rows[0].id,bot={...createBot96(0),deck:{name:'Historic AI fixture',cards:["headshot:common","spinning-seal:epic","screaming-marmot:rare","capybara-chill:common","to-the-moon:rare","success-kid:common","npc:epic","side-eye:common","grumpy-cat:common","blue-screen:common","duck-float:epic","math-lady:common","nyan-cat:epic","crying-wojak:common","flying-spaghetti:rare"]}};await db.exec('set role service_role');const id=await rpc(db,'dv_match_join90',{p_user:a,p_kind:'random',p_deck:did});await db.exec(`reset role;update public.dv_pvp90 set created_at=now()-interval '36 seconds' where id='${id}';set role service_role`);
  const row=await rpc(db,'dv_match_fill_ai96',{p_user:a,p_id:id,p_deck:bot.deck,p_identity:bot.identity});let path;
  for(let seed=1;seed<=120&&!path;seed++){
   let s=createPvp90([row.host_deck,row.guest_deck],seed,0);s.bot96={seed:22,nextAt:0};const steps=[s];for(const [side,move]of [[0,{kind:'gesture',value:'rock'}],[1,{kind:'gesture',value:'scissors'}],[0,{kind:'starter',side:0}]]){s=advancePvp90(s,side,move,0);steps.push(s);}
   while(!s.game.finished){s=advancePvp90(s,s.game.turn,{kind:'place',action:chooseTactic(s.game,{policy:s.game.turn===0?'reply':'position'}).chosen.action},1);steps.push(s);}if(s.game.winner===0)path=steps;
  }
  assert.ok(path,'fixture must contain a legally played human-side win');let version=0,n=2000;
  for(const state of path){const saved=await rpc(db,'dv_match_commit90',{p_user:a,p_id:id,p_version:version,p_request:uid(n++),p_state:state});version=saved.version;}
  await db.exec('reset role');assert.equal(Number((await db.query('select count(*) n from public.dv_xp_events85')).rows[0].n),0);const pixels=Number((await db.query('select earned from public.dv_wallets where user_id=$1',[a])).rows[0].earned);assert.equal(pixels,5);
  await db.exec(await fs.readFile(new URL('../supabase/migrations/202611210005_random_progress98.sql',import.meta.url),'utf8'));
  await db.exec(`set request.jwt.claim.sub='${a}';set role authenticated`);assert.deepEqual((await db.query('select public.dv_quest_status95() data')).rows[0].data.counts,{played:1,won:1,referrals:0});await assert.rejects(db.query('select * from public.dv_random_ai_rounds98'),/permission denied/);await assert.rejects(db.query('select public.dv_capture_random_ai98()'),/permission denied/);
  await db.exec('reset role;set role service_role');await rpc(db,'dv_match_commit90',{p_user:a,p_id:id,p_version:version,p_request:uid(n++),p_state:path.at(-1)});await db.exec('reset role');
  assert.equal(Number((await db.query('select count(*) n from public.dv_random_ai_rounds98')).rows[0].n),1);assert.equal(Number((await db.query('select count(*) n from public.dv_xp_events85')).rows[0].n),1);assert.deepEqual((await db.query('select xp,wins from public.dv_profile_progress85 where user_id=$1',[a])).rows.map(r=>[Number(r.xp),Number(r.wins)]),[[100,1]]);assert.equal(Number((await db.query('select earned from public.dv_wallets where user_id=$1',[a])).rows[0].earned),pixels);assert.equal(Number((await db.query('select count(*) n from public.dv_pvp_rounds90')).rows[0].n),0);assert.equal(Number((await db.query('select count(*) n from public.dv_quest_activity95')).rows[0].n),0);assert.equal(Number((await db.query('select count(*) n from public.dv_random_skills90')).rows[0].n),0);
 }finally{await db.close();}
});
