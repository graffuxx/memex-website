import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
import {CRAFT_COST,DISMANTLE_VALUE} from '../public/game/platform/economy30.mjs';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
const request=n=>`99999999-9999-4999-8999-${String(n).padStart(12,'0')}`;
test('account economy: atomic trades, protected decks, retry safety, RLS and service-only 5/2 round settlement',async()=>{
 const db=new PGlite();try{
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users values('${A}'),('${B}');`);
  for(const file of ['202611180001_duelverse_foundation.sql','202611190001_meme_expansion.sql','202611190002_deck_motif_limit.sql','202611190003_card_economy.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
  const asUser=async id=>db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${id}';`);
  await asUser(A);await db.exec('select public.dv_initialize_account()');await asUser(B);await db.exec('select public.dv_initialize_account()');
  const balance=async()=>Number((await db.query('select earned from public.dv_wallets')).rows[0].earned);
  const quantity=async id=>Number((await db.query('select coalesce((select quantity from public.dv_inventory where variant_id=$1),0) as n',[id])).rows[0].n);
  const trade=(n,kind,id)=>db.query('select public.dv_trade_card($1,$2,$3)',[request(n),kind,id]);
  await asUser(A);
  await assert.rejects(trade(1,'craft','smudge:common'),/Not enough Tokens/);
  assert.equal(await quantity('smudge:common'),0);assert.equal(await balance(),0);
  await assert.rejects(trade(2,'dismantle','pepe:common'),/protected/);
  await assert.rejects(trade(3,'craft','pepe:legendary'),/booster exclusive/);await assert.rejects(trade(4,'craft','pepe:mythic'),/booster exclusive/);
  await assert.rejects(trade(5,'craft','unknown'),/Unknown card/);await assert.rejects(trade(6,'give','pepe:common'),/Invalid card action/);
  await assert.rejects(db.query('select public.dv_settle_verified_round($1,$2,$3,$4)',[request(900),A,B,A]),/permission denied/);
  await assert.rejects(db.query('update public.dv_wallets set earned=9000'));
  await assert.rejects(db.query('insert into public.dv_card_transactions30(user_id,request_id,kind,variant_id,token_delta) values($1,$2,$3,$4,$5)',[A,request(1),'dismantle','pepe:common',999]));
  await db.exec(`reset role;update public.dv_wallets set earned=10000 where user_id='${A}';`);await asUser(A);
  let index=10;
  for(const [rarity,cost] of Object.entries(CRAFT_COST)){
   const id='smudge:'+rarity,before=await balance();await trade(index,'craft',id);assert.equal(await balance(),before-cost);assert.equal(await quantity(id),1);
   await trade(index,'craft',id);assert.equal(await balance(),before-cost);assert.equal(await quantity(id),1);
   await assert.rejects(trade(index,'craft','pepe:common'),/different action/);
   index++;await trade(index,'dismantle',id);assert.equal(await balance(),before-cost+DISMANTLE_VALUE[rarity]);assert.equal(await quantity(id),0);
   await trade(index,'dismantle',id);assert.equal(await balance(),before-cost+DISMANTLE_VALUE[rarity]);index++;
  }
  // Highest use in any deck, not the sum: one physical collection serves several decks.
  for(let n=30;n<33;n++)await trade(n,'craft','smudge:common');
  const legal=['smudge:common','smudge:common',...Array(3).fill('doge:common'),...Array(3).fill('roll-safe:common'),...Array(3).fill('harold:common'),...Array(2).fill('disaster-girl:common'),...Array(2).fill('confused:common')];
  await db.query('select public.dv_save_deck(null,$1,$2)',['Reserve two',legal]);await db.query('select public.dv_save_deck(null,$1,$2)',['Same two in second deck',legal]);
  await trade(33,'dismantle','smudge:common');assert.equal(await quantity('smudge:common'),2);
  const safeBalance=await balance();await assert.rejects(trade(34,'dismantle','smudge:common'),/protected/);assert.equal(await quantity('smudge:common'),2);assert.equal(await balance(),safeBalance);
  await trade(35,'craft','pepe:common');await trade(36,'dismantle','pepe:common');assert.equal(await quantity('pepe:common'),3);await assert.rejects(trade(37,'dismantle','pepe:common'),/protected/);
  await db.exec(`reset role;insert into public.dv_inventory values('${A}','pepe:legendary',1),('${A}','pepe:mythic',1);`);await asUser(A);
  for(const [n,id,value] of [[40,'pepe:legendary',150],[41,'pepe:mythic',400]]){const before=await balance();await trade(n,'dismantle',id);assert.equal(await balance(),before+value);}
  const beforeRound=await balance();await db.exec('reset role;set role service_role');
  const settle=(n,winner)=>db.query('select public.dv_settle_verified_round($1,$2,$3,$4)',[request(n),A,B,winner]);
  await settle(900,A);await settle(900,A);await assert.rejects(settle(900,B),/different result/);
  await settle(901,B);await settle(902,null);
  await assert.rejects(db.query('select public.dv_settle_verified_round($1,$2,$3,$4)',[request(903),A,A,A]),/Invalid round/);
  await asUser(A);assert.equal(await balance(),beforeRound+5+2+2);assert.equal((await db.query('select * from public.dv_verified_rounds30')).rows.length,3);
  const rounds=(await db.query("select amount from public.dv_reward_ledger where event_key like 'round30:%' order by amount")).rows;assert.deepEqual(rounds.map(r=>Number(r.amount)),[2,2,5]);
  await asUser(B);assert.equal(await balance(),2+5+2);assert.equal((await db.query('select * from public.dv_card_transactions30')).rows.length,0);
  await db.exec('reset role;set role anon');await assert.rejects(trade(80,'craft','pepe:common'),/permission denied/);await assert.rejects(settle(904,A),/permission denied/);
 }finally{await db.close();}
});
