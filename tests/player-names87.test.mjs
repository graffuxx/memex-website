import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
import {normalizePlayerName87,validPlayerName87} from '../public/game/platform/player-name87.mjs';
const id=n=>'87878787-8787-4787-8787-'+String(n).padStart(12,'0'),migration='202611200009_permanent_names87.sql';
async function database(beforeMigration){const db=new PGlite();await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);for(const f of (await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort()){if(f===migration&&beforeMigration)await beforeMigration(db);await db.exec(await fs.readFile(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'));}return db;}
async function addUser(db,n,{verified=true}={}){await db.exec('reset role');await db.query('insert into auth.users(id,email_confirmed_at,email) values($1,$2,$3)',[id(n),verified?'2026-11-20T00:00:00Z':null,`player${n}@example.test`]);await asUser(db,n);await db.query('select public.dv_initialize_account()');}
async function asUser(db,n){await db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${id(n)}'`);}
const claim=(db,name)=>db.query('select public.dv_claim_player_name87($1) data',[name]);
test('name input normalizes spaces consistently and rejects invisible, markup and overlong names',()=>{assert.equal(normalizePlayerName87('  Meme   Captain  '),'Meme Captain');for(const s of ['Jan_Ritter','Meme Captain','Doge-01'])assert.equal(validPlayerName87(s),true);for(const s of ['ab',' ','<script>','bad\nname','-name','x'.repeat(25)])assert.equal(validPlayerName87(s),false);});
test('a verified player claims one unique name; retries, case changes, old endpoints and direct writes cannot rename it',async()=>{
 const db=await database();try{
  await addUser(db,1);assert.equal((await db.query('select public.dv_identity85() data')).rows[0].data.nameClaimed,false);
  for(const name of ['', 'ab', 'bad\nname','<script>', 'x'.repeat(25)])await assert.rejects(claim(db,name),/3 to 24/);
  for(const name of ['Player','ADMIN','meme bot'])await assert.rejects(claim(db,name),/already taken/);
  const first=(await claim(db,'  Meme   Captain ')).rows[0].data;assert.equal(first.displayName,'Meme Captain');assert.equal(first.nameClaimed,true);
  assert.equal((await claim(db,'meme captain')).rows[0].data.displayName,'Meme Captain');await assert.rejects(claim(db,'Another Name'),/permanent/);
  await assert.rejects(db.query("select public.dv_save_identity85('Another Name','pepe','auto','rookie')"),/one-time name claim/);await assert.rejects(db.query("update public.dv_profiles set display_name='Another Name'"),/permission denied/);
  const cosmetic=(await db.query("select public.dv_save_cosmetics87('doge','starter','') data")).rows[0].data;assert.equal(cosmetic.avatarId,'doge');assert.equal(cosmetic.titleId,'');assert.equal(cosmetic.displayName,'Meme Captain');assert.equal(cosmetic.nameClaimed,true);assert.equal(cosmetic.xp,0);
  await addUser(db,2);await assert.rejects(claim(db,'MEME CAPTAIN'),/already taken/);await assert.rejects(claim(db,'meme   captain'),/already taken/);const other=(await claim(db,'Other Player')).rows[0].data;assert.equal(other.displayName,'Other Player');
  await db.exec('reset role');await assert.rejects(db.query("update public.dv_profiles set display_name='Oops' where user_id=$1",[id(1)]),/permanent/);assert.equal((await db.query('select display_name from public.dv_profiles where user_id=$1',[id(1)])).rows[0].display_name,'Meme Captain');
  await db.exec('set role anon');await assert.rejects(claim(db,'Anonymous'),/permission denied/);await assert.rejects(db.query('select * from public.dv_player_names87'),/permission denied/);
 }finally{await db.close();}
});
test('reserved names survive account deletion; new accounts and unverified email cannot reclaim them',async()=>{
 const db=await database();try{
  await addUser(db,1);await claim(db,'Keep Forever');await db.exec('reset role');await db.query('delete from auth.users where id=$1',[id(1)]);const reservation=(await db.query("select user_id from public.dv_player_names87 where name_key='keep forever'")).rows[0];assert.equal(reservation.user_id,null);
  await addUser(db,2);await assert.rejects(claim(db,'KEEP FOREVER'),/already taken/);await addUser(db,3,{verified:false});await assert.rejects(claim(db,'Unverified User'),/Verify your email/);
  assert.equal((await db.query('select public.dv_identity85() data')).rows[0].data.nameClaimed,false);
 }finally{await db.close();}
});
test('old custom names are preserved, placeholders stay unclaimed, and the oldest duplicate owns the reservation',async()=>{
 const db=await database(async db=>{for(const n of [1,2,3])await addUser(db,n);await db.exec('reset role');await db.query("update public.dv_profiles set display_name='Old Hero',created_at='2026-11-18T00:00:00Z' where user_id=$1",[id(1)]);await db.query("update public.dv_profiles set display_name='old  hero',created_at='2026-11-19T00:00:00Z' where user_id=$1",[id(2)]);});try{
  await asUser(db,1);let p=(await db.query('select public.dv_identity85() data')).rows[0].data;assert.equal(p.displayName,'Old Hero');assert.equal(p.nameClaimed,true);await assert.rejects(claim(db,'New Hero'),/permanent/);
  await asUser(db,2);p=(await db.query('select public.dv_identity85() data')).rows[0].data;assert.equal(p.nameClaimed,false);await assert.rejects(claim(db,'Old Hero'),/already taken/);await claim(db,'Second Hero');await asUser(db,3);assert.equal((await db.query('select public.dv_identity85() data')).rows[0].data.nameClaimed,false);
 }finally{await db.close();}
});
test('competing first claims leave exactly one reservation and one account winner',async()=>{
 const db=await database();try{for(const n of [1,2])await addUser(db,n);await db.exec('reset role');
  // Isolated helper supplies each request's auth context within one SQL statement.
  await db.exec(`create function public.test_name_request87(u uuid,n text) returns jsonb language plpgsql as $$begin perform set_config('request.jwt.claim.sub',u::text,true);return public.dv_claim_player_name87(n);end;$$;`);
  const results=await Promise.allSettled([db.query('select public.test_name_request87($1,$2)',[id(1),'Contested Name']),db.query('select public.test_name_request87($1,$2)',[id(2),'contested name'])]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected').length,1);const rows=(await db.query("select user_id from public.dv_player_names87 where name_key='contested name'")).rows;assert.equal(rows.length,1);assert.ok([id(1),id(2)].includes(rows[0].user_id));
 }finally{await db.close();}
});
