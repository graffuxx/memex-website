import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
import {createBot96,armBot96,stepBot96} from '../server/game/bot96.mjs';
import {createPvp90,advancePvp90,projectPvp90} from '../server/game/pvp90.mjs';
import {createMatchHandler90} from '../server/game/match-handler90.mjs';
import {getVariant,countCards,validateDeck,starterDeck} from '../public/game/platform/catalog.mjs';import {chooseTactic} from '../public/game/src/tactics-ai.mjs';
const uid=n=>'96969696-9696-4696-8696-'+String(n).padStart(12,'0'),a=uid(1),b=uid(2),c=uid(3);
const deck={name:'Human deck',cards:starterDeck()};
test('AI identities and balanced 15-card decks vary, stay legal and never contain Recruiter rewards',()=>{
 const names=new Set(),decks=new Set();for(let seed=1;seed<=100;seed++){
  const bot=createBot96(seed);assert.deepEqual(bot,createBot96(seed));assert.ok(bot.identity.isAi);assert.ok(bot.identity.displayName.length<=24);assert.ok(validateDeck(bot.deck.cards,countCards(bot.deck.cards)).valid);
  const elements={};for(const id of bot.deck.cards){const v=getVariant(id);assert.equal(v.edition,'alpha');elements[v.element]=(elements[v.element]??0)+1;}assert.deepEqual(Object.values(elements),[3,3,3,3,3]);names.add(bot.identity.displayName);decks.add(bot.deck.cards.join(','));
 }assert.ok(names.size>80);assert.equal(decks.size,100);
});
test('AI uses its own hand and public board, never reacts to hidden RPS or opponent cards',()=>{
 let state=createPvp90([deck,createBot96(7).deck],123,0);state.bot96={seed:42,nextAt:0};
 const choices=['rock','paper','scissors'].map(value=>{const s=structuredClone(state);s.choices[0]=value;const n=stepBot96(s,0);return n.lastRps.choices[1];});assert.equal(new Set(choices).size,1);
 state=advancePvp90(advancePvp90(state,0,{kind:'gesture',value:'rock'},0),1,{kind:'gesture',value:'scissors'},0);state=advancePvp90(state,0,{kind:'starter',side:1},0);state=armBot96(state,0);assert.equal(stepBot96(state,state.bot96.nextAt-1),null);
 const first=stepBot96(state,state.bot96.nextAt),other=structuredClone(state);other.game.players[0].hand=other.game.players[0].hand.map(c=>({...c,id:'brain',element:'fire'}));other.game.players[0].deck.reverse();assert.deepEqual(stepBot96(other,state.bot96.nextAt).step.action,first.step.action);assert.equal(first.game.placements,1);assert.equal(first.game.turn,0);assert.equal(first.bot96.nextAt,null);
 const view=projectPvp90({id:uid(9),host_id:a,guest_id:null,identities:[{},createBot96(7).identity],ai_opponent96:{isAi:true},state:first,kind:'random',status:'matched',version:3},a);assert.equal(view.opponentType,'ai');assert.ok(!JSON.stringify(view).includes('bot96'));assert.ok(view.game.players[1].hand.every(c=>c.hidden&&!c.variantId));assert.ok(view.game.players.flatMap(p=>p.deck).every(c=>c.hidden));
});
async function setup(){const db=new PGlite();await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users(id,email_confirmed_at,email) values('${a}',now(),'a96@example.test'),('${b}',now(),'b96@example.test'),('${c}',now(),'c96@example.test');`);
for(const f of (await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort())await db.exec(await fs.readFile(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'));for(const u of [a,b,c])await db.exec(`set request.jwt.claim.sub='${u}';select public.dv_initialize_account();`);return db;}
async function rpc(db,name,args){const p=Object.entries(args);return (await db.query('select public.'+name+'('+p.map(([k],i)=>k+'=> $'+(i+1)).join(',')+') data',p.map(([,v])=>v&&typeof v==='object'?JSON.stringify(v):v))).rows[0].data;}
test('empty queue fallback, human priority, cancel, reconnect, two AI rounds and isolated rewards are authoritative',async()=>{
 const db=await setup();try{
  const decks=Object.fromEntries((await db.query('select user_id,id from public.dv_decks')).rows.map(r=>[r.user_id,r.id]));const bot=createBot96(321);let n=100,time=Date.now();
  const handler=createMatchHandler90({env:k=>({SUPABASE_URL:'https://bot96.test',SUPABASE_SERVICE_ROLE_KEY:'isolated-test'})[k],now:()=>time,seed:()=>321,requestId:()=>uid(n++),fetcher:async(url,opt)=>{if(url.endsWith('/auth/v1/user')){const id=({a,b,c})[opt.headers.Authorization?.replace('Bearer ','')];return id?Response.json({id,email_confirmed_at:'2026-11-21'}):Response.json({},{status:401});}try{await db.exec('reset role;set role service_role');return Response.json(await rpc(db,url.split('/').at(-1),JSON.parse(opt.body)));}catch(e){return Response.json({message:e.message,code:e.code},{status:400});}}});
  async function call(who,body){const r=await handler(new Request('https://memex.test/api/duel',{method:'POST',headers:{Authorization:'Bearer '+who,'Content-Type':'application/json'},body:JSON.stringify(body)}));const v=await r.json();assert.equal(r.status,200,JSON.stringify(v));return v;}
  let x=await call('a',{op:'join',kind:'random',deckId:decks[a]});const cancelled=x.id;assert.equal((await call('a',{op:'poll',id:x.id})).status,'waiting');await call('a',{op:'cancel',id:x.id});assert.equal((await call('a',{op:'poll',id:cancelled})).status,'cancelled');
  // Even an overdue host is paired with a human when they join before fallback acquires the lock.
  x=await call('a',{op:'join',kind:'random',deckId:decks[a]});await db.exec(`reset role;update public.dv_pvp90 set created_at=now()-interval '16 seconds' where id='${x.id}'`);
  const human=await call('b',{op:'join',kind:'random',deckId:decks[b]});assert.equal(human.id,x.id);await db.exec('set role service_role');const stillHuman=await rpc(db,'dv_match_fill_ai96',{p_user:a,p_id:x.id,p_deck:bot.deck,p_identity:bot.identity});assert.equal(stillHuman.ai_opponent96,null);x=await call('a',{op:'poll',id:x.id});assert.equal(x.opponentType,'human');await call('a',{op:'move',id:x.id,version:x.version,requestId:uid(n++),move:{kind:'resign'}});
  const privateRoom=await call('b',{op:'join',kind:'private',deckId:decks[b]});await db.exec(`reset role;update public.dv_pvp90 set created_at=now()-interval '16 seconds' where id='${privateRoom.id}'`);assert.equal((await call('b',{op:'poll',id:privateRoom.id})).status,'waiting');await call('b',{op:'cancel',id:privateRoom.id});
  x=await call('a',{op:'join',kind:'random',deckId:decks[a]});const id=x.id;await db.exec(`reset role;update public.dv_pvp90 set created_at=now()-interval '16 seconds' where id='${id}'`);x=await call('a',{op:'poll',id});assert.equal(x.opponentType,'ai');assert.equal(x.players[1].isAi,true);assert.equal(x.players[1].displayName,bot.identity.displayName);assert.ok(!JSON.stringify(x).includes('"seed"'));
  await db.exec('reset role;set role authenticated');await assert.rejects(rpc(db,'dv_match_fill_ai96',{p_user:a,p_id:id,p_deck:bot.deck,p_identity:bot.identity}),/permission denied/);await assert.rejects(rpc(db,'dv_match_commit_human96',{p_user:a,p_id:id,p_version:0,p_request:uid(n++),p_state:{}}),/permission denied/);await assert.rejects(db.query('select * from public.dv_pvp90'),/permission denied/);
  let expected=0,lastRequest,lastVersion,lastMove;const restored=await call('a',{op:'poll',id});assert.deepEqual(restored.players,x.players);
  for(let guard=0;x.phase!=='ended'&&guard<150;guard++){
   time+=3000;
   if(x.phase==='rps'&&!x.ownChoice){lastMove={kind:'gesture',value:'rock'};}
   else if(x.phase==='initiative'&&x.rpsWinner===0)lastMove={kind:'starter',side:0};
   else if(x.phase==='play'&&x.game.turn===0)lastMove={kind:'place',action:chooseTactic(x.game,{policy:'position'}).chosen.action};
   else if(x.phase==='between'&&!x.ready[0])lastMove={kind:'ready'};
   else lastMove=null;
   const previous=x;
   if(lastMove){lastRequest=uid(n++);lastVersion=x.version;x=await call('a',{op:'move',id,version:x.version,requestId:lastRequest,move:lastMove});const duplicate=await call('a',{op:'move',id,version:lastVersion,requestId:lastRequest,move:lastMove});assert.equal(duplicate.version,x.version);}
   else x=await call('a',{op:'poll',id});
   if(x.game?.finished&&(!previous.game?.finished||previous.round!==x.round))expected+=x.game.winner===0?5:2;
   if(x.game&&!x.game.finished){const reconnect=await call('a',{op:'poll',id,version:x.version});if(!reconnect.unchanged)x=reconnect;}
  }
  assert.equal(x.phase,'ended');assert.equal(x.round,2);await db.exec('reset role');assert.equal(Number((await db.query('select earned from public.dv_wallets where user_id=$1',[a])).rows[0].earned),expected);assert.equal(Number((await db.query('select count(*) n from public.dv_pvp_rounds90')).rows[0].n),0);assert.equal(Number((await db.query('select count(*) n from public.dv_quest_activity95')).rows[0].n),0);assert.equal(Number((await db.query('select count(*) n from public.dv_xp_events85')).rows[0].n),0);assert.equal(Number((await db.query('select count(*) n from public.dv_random_skills90')).rows[0].n),0);assert.equal(Number((await db.query("select count(*) n from public.dv_balance_rounds94 where match_id=$1 and mode='ai'",[id])).rows[0].n),2);assert.equal(Number((await db.query('select count(*) n from public.dv_pvp_seats90')).rows[0].n),0);
 }finally{await db.close();}
});
