import {originalCards116} from '../public/game/platform/catalog.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
const uid=n=>'57575757-5757-4575-8575-'+String(n).padStart(12,'0');
test('verified email cannot claim twice after account deletion, recreation, case changes or simultaneous accounts; existing gifts survive migration',async()=>{
 const db=new PGlite();try{
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);
  const files=(await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort();
  for(const f of files.filter(f=>f<'202611200005'))await db.exec(await fs.readFile(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'));
  const asUser=async n=>db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${uid(n)}';`);
  const account=async(n,email,confirmed=true)=>{await db.exec('reset role');await db.query('insert into auth.users(id,email,email_confirmed_at) values($1,$2,$3)',[uid(n),email,confirmed?'2026-11-20T00:00:00Z':null]);};
  const count=async()=>Number((await db.query('select count(*) n from public.dv_booster_purchases36')).rows[0].n);
  await account(1,'First@Example.test');await asUser(1);await db.query('select public.dv_initialize_account()');assert.equal(await count(),10);const before=(await db.query('select id,cards from public.dv_booster_purchases36 order by id')).rows;
  await db.exec('reset role');for(const f of files.filter(f=>f>='202611200005'))await db.exec(await fs.readFile(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'));
  await asUser(1);await db.query('select public.dv_initialize_account()');assert.deepEqual((await db.query('select id,cards from public.dv_booster_purchases36 order by id')).rows,before.map(p=>({...p,cards:originalCards116(p.cards)})));
  await db.exec('reset role');assert.equal((await db.query('select count(*)::int n from dv_private.welcome_emails57')).rows[0].n,1);await db.query('delete from auth.users where id=$1',[uid(1)]);
  await account(2,' first@EXAMPLE.TEST ');await asUser(2);await Promise.all(Array.from({length:5},()=>db.query('select public.dv_initialize_account()')));assert.equal(await count(),0);assert.equal((await db.query('select count(*)::int n from public.dv_welcome_grants56')).rows[0].n,0);assert.equal((await db.query('select sum(quantity)::int n from public.dv_inventory')).rows[0].n,18);
  for(const role of ['anon','authenticated','service_role']){await db.exec('reset role;set role '+role);await assert.rejects(db.query('select * from dv_private.welcome_emails57'),/permission denied/);await assert.rejects(db.query('select * from dv_private.welcome_key57'),/permission denied/);}
  // Changing an existing rewarded account's email must not create a second entitlement.
  await account(3,'second@example.test');await asUser(3);await db.query('select public.dv_initialize_account()');assert.equal(await count(),10);
  await db.exec('reset role');await db.query('update auth.users set email=$1 where id=$2',['third@example.test',uid(3)]);await asUser(3);await db.query('select public.dv_initialize_account()');assert.equal(await count(),10);
  await account(4,'second@example.test');await asUser(4);await db.query('select public.dv_initialize_account()');assert.equal(await count(),0);
  await account(5,'new@example.test',false);await asUser(5);await db.query('select public.dv_initialize_account()');assert.equal(await count(),0);await db.exec('reset role');await db.query('update auth.users set email_confirmed_at=now() where id=$1',[uid(5)]);await asUser(5);await db.query('select public.dv_initialize_account()');assert.equal(await count(),10);
  // Two account IDs racing for one normalized address can only consume one gift.
  await account(6,'race@example.test');await account(7,'RACE@example.test');for(const n of [6,7]){await asUser(n);await db.query('select public.dv_initialize_account()');}
  await db.exec('reset role');assert.equal((await db.query('select count(*)::int n from public.dv_booster_purchases36 where user_id in ($1,$2)',[uid(6),uid(7)])).rows[0].n,10);
 }finally{await db.close();}
});
