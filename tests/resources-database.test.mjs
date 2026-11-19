import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',C='33333333-3333-4333-8333-333333333333';
const id=n=>`99999999-9999-4999-8999-${String(n).padStart(12,'0')}`;
test('three resources preserve legacy balances and isolate Pixel rewards, Shards and Echoes crafting',async()=>{
 const db=new PGlite();try{
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users values('${A}'),('${B}'),('${C}');`);
  for(const file of ['202611180001_duelverse_foundation.sql','202611190001_meme_expansion.sql','202611190002_deck_motif_limit.sql','202611190003_card_economy.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
  const asUser=async u=>db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${u}';`);
  await asUser(A);await db.exec('select public.dv_initialize_account()');await asUser(B);await db.exec('select public.dv_initialize_account()');
  await db.exec(`reset role;update public.dv_inventory set quantity=4 where user_id='${A}' and variant_id='pepe:common';update public.dv_wallets set premium=500 where user_id='${A}';`);await asUser(A);
  await db.query('select public.dv_trade_card($1,$2,$3)',[id(1),'dismantle','pepe:common']);
  await db.exec('reset role;set role service_role');await db.query('select public.dv_settle_verified_round($1,$2,$3,$4)',[id(101),A,B,A]);
  await db.exec('reset role');await db.exec(await readFile(new URL('../supabase/migrations/202611190004_three_resources.sql',import.meta.url),'utf8'));
  const wallet=async()=>{const w=(await db.query('select earned,premium,echoes from public.dv_wallets')).rows[0];return Object.fromEntries(Object.entries(w).map(([k,v])=>[k,Number(v)]));};
  const trade=(n,kind,variant)=>db.query('select public.dv_trade_card($1,$2,$3) as result',[id(n),kind,variant]);
  await asUser(A);assert.deepEqual(await wallet(),{earned:5,premium:500,echoes:10});
  await db.exec('select public.dv_initialize_account();select public.dv_initialize_account();');assert.deepEqual(await wallet(),{earned:5,premium:500,echoes:10});
  await trade(1,'dismantle','pepe:common');assert.deepEqual(await wallet(),{earned:5,premium:500,echoes:10}); // Old request stays idempotent across migration.
  await assert.rejects(trade(2,'craft','smudge:common'),/Not enough Echoes/);assert.deepEqual(await wallet(),{earned:5,premium:500,echoes:10});
  await db.exec(`reset role;insert into public.dv_inventory values('${A}','smudge:mythic',1);`);await asUser(A);
  await trade(3,'dismantle','smudge:mythic');assert.deepEqual(await wallet(),{earned:5,premium:500,echoes:410});
  await trade(4,'craft','doge:rare');assert.deepEqual(await wallet(),{earned:5,premium:500,echoes:10});
  await trade(4,'craft','doge:rare');assert.deepEqual(await wallet(),{earned:5,premium:500,echoes:10});
  await assert.rejects(trade(4,'craft','doge:common'),/different action/);
  await assert.rejects(trade(5,'craft','doge:epic'),/Not enough Echoes/);
  await assert.rejects(trade(6,'craft','doge:legendary'),/booster exclusive/);await assert.rejects(trade(7,'craft','doge:mythic'),/booster exclusive/);
  await assert.rejects(trade(8,'dismantle','pepe:common'),/protected/);
  assert.equal(Number((await db.query("select sum(amount) amount from public.dv_reward_ledger where currency='echoes'")).rows[0].amount),10);
  await assert.rejects(db.exec('update public.dv_wallets set echoes=9999'));await assert.rejects(db.exec('update public.dv_wallets set earned=9999'));await assert.rejects(db.exec('update public.dv_wallets set premium=9999'));
  await assert.rejects(db.query('select public.dv_settle_verified_round($1,$2,$3,$4)',[id(102),A,B,B]),/permission denied/);
  await db.exec('reset role;set role service_role');await db.query('select public.dv_settle_verified_round($1,$2,$3,$4)',[id(102),A,B,B]);await asUser(A);assert.deepEqual(await wallet(),{earned:7,premium:500,echoes:10});
  await asUser(B);assert.deepEqual(await wallet(),{earned:7,premium:0,echoes:0});assert.equal((await db.query('select * from public.dv_card_transactions30')).rows.length,0);
  await asUser(C);await db.exec('select public.dv_initialize_account()');assert.deepEqual(await wallet(),{earned:0,premium:0,echoes:0});
  await db.exec('reset role;set role anon');await assert.rejects(db.query('select * from public.dv_wallets'));await assert.rejects(trade(90,'craft','doge:common'),/permission denied/);
 }finally{await db.close();}
});
