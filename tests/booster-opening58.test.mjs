import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
import {ALL_PACK_SLOTS,unopenedPacks,prepareManualOpening,flipPackSlot} from '../public/game/platform/booster-opening58.mjs';
import {previewAlphaPack} from '../public/game/platform/alpha-booster36.mjs';
const id=n=>'58585858-5858-4585-8585-'+String(n).padStart(12,'0');
test('opening saves the whole pack but only reveals the cards the player clicks',async()=>{
 let release;const pending=new Promise(resolve=>{release=resolve;});
 const task=prepareManualOpening({cards:previewAlphaPack(),shown:[],save:()=>pending,active:()=>true});release();
 const prepared=await task;assert.deepEqual(prepared,{savedSlots:[0,1,2,3,4],visibleSlots:[]});
 let visible=flipPackSlot(prepared.visibleSlots,3);assert.deepEqual(visible,[3]);assert.deepEqual(prepared.visibleSlots,[]);assert.deepEqual(flipPackSlot(visible,3),[3]);
 for(const slot of [1,4,0,2])visible=flipPackSlot(visible,slot);assert.equal(visible.length,5);assert.equal(new Set(visible).size,5);
});
test('leaving/reloading has a complete saved pack; failed saves and account switches never enable unsaved reveals',async()=>{
 const base={cards:previewAlphaPack(),shown:[2],save:async()=>{},active:()=>true};
 const prepared=await prepareManualOpening(base);assert.deepEqual(prepared.visibleSlots,[2]);assert.deepEqual(prepared.savedSlots,[0,1,2,3,4]);
 await assert.rejects(prepareManualOpening({...base,save:async()=>{throw Error('offline');}}),/offline/);
 assert.equal(await prepareManualOpening({...base,active:()=>false}),null);
 for(const slot of [-1,5,1.5,null])assert.throws(()=>flipPackSlot([],slot),/Invalid card slot/);
});
test('next pack queue omits finished/current packs, resumes partials first and keeps older packs beyond recent history',()=>{
 const rows=Array.from({length:125},(_,i)=>({id:String(i).padStart(3,'0'),created_at:'2026-11-20T12:00:00Z',revealed_slots:[]}));rows[0].revealed_slots=[0,1,2,3,4];rows[124].revealed_slots=[2];
 const queue=unopenedPacks([...rows,rows[123]],'001');assert.equal(queue.length,123);assert.equal(queue[0].id,'124');assert.equal(queue[1].id,'002');assert.equal(queue.some(x=>['000','001'].includes(x.id)),false);
});
test('whole-pack opening is authenticated, own-account only and repeat-safe without cards, gifts or wallet changes',async()=>{
 const db=new PGlite();try{
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);
  for(const f of (await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort())await db.exec(await fs.readFile(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'));
  await db.query("insert into auth.users values($1,now(),false,'open-a@example.test'),($2,now(),false,'open-b@example.test')",[id(1),id(2)]);
  const asUser=async n=>db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${id(n)}';`);
  for(const n of [1,2]){await asUser(n);await db.query('select public.dv_initialize_account()');}
  await asUser(1);const packs=(await db.query('select * from public.dv_booster_purchases36 order by id')).rows,target=packs[0];
  await db.query('select public.dv_reveal_booster_card($1,2)',[target.id]);
  const inventory=JSON.stringify((await db.query('select variant_id,quantity from public.dv_inventory order by variant_id')).rows),wallet=JSON.stringify((await db.query('select earned,premium,echoes from public.dv_wallets')).rows);
  await Promise.all(Array.from({length:5},()=>db.query('select public.dv_open_alpha_booster58($1)',[target.id])));assert.deepEqual((await db.query('select cards,revealed_slots from public.dv_booster_purchases36 where id=$1',[target.id])).rows[0],{cards:target.cards,revealed_slots:[0,1,2,3,4]});
  assert.equal(JSON.stringify((await db.query('select variant_id,quantity from public.dv_inventory order by variant_id')).rows),inventory);assert.equal(JSON.stringify((await db.query('select earned,premium,echoes from public.dv_wallets')).rows),wallet);assert.equal((await db.query('select count(*)::int n from public.dv_booster_purchases36')).rows[0].n,10);
  await db.query('select public.dv_reveal_booster_card($1,0)',[target.id]);assert.deepEqual((await db.query('select revealed_slots from public.dv_booster_purchases36 where id=$1',[target.id])).rows[0].revealed_slots,[0,1,2,3,4]);
  await asUser(2);await assert.rejects(db.query('select public.dv_open_alpha_booster58($1)',[target.id]),/not found/);await assert.rejects(db.query('select public.dv_open_alpha_booster58($1)',[null]),/not found/);
  await db.exec('reset role;set role anon');await assert.rejects(db.query('select public.dv_open_alpha_booster58($1)',[target.id]),/permission denied/);
 }finally{await db.close();}
});
