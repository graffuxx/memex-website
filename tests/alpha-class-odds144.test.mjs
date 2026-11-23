import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {ALPHA_CLASS_ODDS,chanceOfClassInAlphaPack,validAlphaPack} from '../public/game/platform/alpha-booster36.mjs';
import {getVariant} from '../public/game/platform/catalog.mjs';
import {cardCategory131} from '../public/game/platform/set-manifest131.mjs';

const user='14414414-4144-4144-8144-144144144144';
const name='202611230010_alpha_class_odds144.sql';
const dir=new URL('../supabase/migrations/',import.meta.url);
const category=id=>cardCategory131(getVariant(id)?.definitionId);

test('Alpha class odds are shared by all new packs and independent of exhausted duplicate protection',async()=>{
 const db=new PGlite();
 try{
  await db.exec(`
   create role anon;create role authenticated;create role service_role bypassrls;
   create schema auth;
   create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text);
   create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
   grant usage on schema auth to anon,authenticated;
   grant execute on function auth.uid() to anon,authenticated;
   insert into auth.users(id,email_confirmed_at,email) values('${user}',now(),'alpha-odds@example.test');
   set request.jwt.claim.sub='${user}';
  `);
  for(const file of (await readdir(dir)).filter(file=>file.endsWith('.sql')&&file<name).sort()){
   await db.exec(await readFile(new URL(file,dir),'utf8'));
  }
  await db.exec(`select public.dv_initialize_account();update public.dv_wallets set earned=100,premium=150 where user_id='${user}';`);
  const history=async()=>(await db.query("select id,cards,revealed_slots from public.dv_booster_purchases36 where currency='starter' order by id")).rows;
  const saved=await history();
  assert.equal(saved.length,10);
  const migration=await readFile(new URL(name,dir),'utf8');
  await db.exec(migration);
  await db.exec(migration);
  assert.deepEqual(await history(),saved);

  await db.exec('set role anon');
  assert.deepEqual((await db.query('select public.dv_alpha_class_odds144() as odds')).rows[0].odds,ALPHA_CLASS_ODDS);
  await assert.rejects(db.query("select public.dv_allocate_alpha56(gen_random_uuid(),gen_random_uuid(),'quest',0)"),/permission denied/);
  await db.exec('reset role;set role authenticated');
  const paid=async currency=>{
   const {rows}=await db.query('select public.dv_buy_alpha_booster(gen_random_uuid(),$1) as id',[currency]);
   const result=await db.query('select cards,cost from public.dv_booster_purchases36 where id=$1',[rows[0].id]);
   return result.rows[0];
  };
  for(const [currency,price] of [['pixels',100],['shards',150]]){
   const pack=await paid(currency);
   assert.equal(pack.cost,price);
   assert.ok(validAlphaPack(pack.cards));
  }

  // A complete Regular pool must not boost the chance of either special class.
  await db.exec(`reset role;
   insert into public.dv_card_acquired36(user_id,variant_id,quantity)
   select '${user}',v.id,1 from public.dv_card_variants v
   join public.dv_card_definitions d on d.id=v.definition_id
   where d.card_class='regular' and v.edition='alpha'
   on conflict(user_id,variant_id) do nothing;
   select setseed(0.417);
   select public.dv_allocate_alpha56('${user}',gen_random_uuid(),'quest',0) from generate_series(1,240);
  `);
  const packs=(await db.query("select cards from public.dv_booster_purchases36 where currency='quest'")).rows;
  assert.equal(packs.length,240);
  const counts={regular:0,iconic:0,prime:0};
  for(const pack of packs){
   assert.ok(validAlphaPack(pack.cards));
   for(const card of pack.cards)counts[category(card)]++;
  }
  assert.ok(counts.prime>=3&&counts.prime<=28,JSON.stringify(counts));
  assert.ok(counts.iconic>=18&&counts.iconic<=64,JSON.stringify(counts));
  assert.equal((chanceOfClassInAlphaPack(ALPHA_CLASS_ODDS.prime)*100).toFixed(2),'4.90');
  assert.equal((chanceOfClassInAlphaPack(ALPHA_CLASS_ODDS.iconic)*100).toFixed(2),'14.13');

  // Exercise protection deterministically in the isolated database with an all-Regular draw.
  await db.exec(`
   create or replace function public.dv_alpha_class_odds144() returns jsonb language sql immutable set search_path='' as
   $$select '{"regular":10000,"iconic":0,"prime":0}'::jsonb$$;
   delete from public.dv_card_acquired36 where user_id='${user}' and variant_id='smudge:rare';
   select setseed(0.21);
  `);
  let protectedCard=false;
  for(let i=0;i<15&&!protectedCard;i++){
   const {rows:[{id}]}=await db.query("select public.dv_allocate_alpha56($1,gen_random_uuid(),'quest',0) as id",[user]);
   const {rows:[{cards}]}=await db.query('select cards from public.dv_booster_purchases36 where id=$1',[id]);
   assert.ok(cards.every(id=>category(id)==='regular'));
   if(cards.some(id=>id.endsWith(':rare'))){
    assert.ok(cards.includes('smudge:rare'));
    protectedCard=true;
   }
  }
  assert.ok(protectedCard);
  assert.deepEqual(await history(),saved);
 }finally{
  await db.close();
 }
});
