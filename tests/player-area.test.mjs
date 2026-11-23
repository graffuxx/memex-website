import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
import {collectionSummary,boosterProgress,boosterLink,requestedBooster,boosterHistoryFilter,mergeBoosterHistory,playerAreaRoute} from '../public/game/platform/player-area49.mjs';
import {readDeckLibrary,libraryKey,persistDeckLibrary} from '../public/game/platform/deck-library28.mjs';
import {starterDeck} from '../public/game/platform/catalog.mjs';

test('player summaries count known owned copies and cosmetics without inventing progress',()=>{
 assert.deepEqual(collectionSummary({'pepe:common':3,'pepe:epic':1,'doge:common':2,'fake:mythic':999,'roll-safe:common':-1,'harold:common':1.5}),{copies:6,variants:3,motifs:2,totalMotifs:95});
 assert.equal(playerAreaRoute('/account/private'),'/account/private');assert.equal(playerAreaRoute('/account/private/boosters'),'/account/private/boosters');assert.equal(playerAreaRoute('/account'),null);
 assert.deepEqual(boosterProgress({revealed_slots:[0,0,2,9,-1]}),{revealed:2,state:'partial',label:'In progress',action:'Continue opening'});
 assert.equal(boosterProgress({revealed_slots:[]}).action,'Open booster');assert.equal(boosterProgress({revealed_slots:[4,3,2,1,0]}).action,'View cards');
 const id='49494949-4949-4949-8949-494949494949';assert.equal(requestedBooster(boosterLink(id).split('?')[1]),id);assert.equal(requestedBooster('?booster=https://evil.example'),null);assert.equal(requestedBooster('?booster=bad'),null);
 assert.throws(()=>boosterLink('bad'));assert.throws(()=>boosterHistoryFilter({id,created_at:'2026-11-20T00:00:00Z),id.neq.x'}));assert.throws(()=>boosterHistoryFilter({id:'bad',created_at:'2026-11-20T00:00:00Z'}));
 const merged=mergeBoosterHistory([{id:'one',revealed_slots:[]}],[{id:'one',revealed_slots:[1]},{id:'two',revealed_slots:[]}]);assert.equal(merged.length,2);assert.deepEqual(merged[0].revealed_slots,[1]);
});

test('dashboard deck links select only an owned saved deck and preserve other drafts',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},key=libraryKey('account','player-a');
 const server=[{id:'one',name:'Active',cards:starterDeck(),active:true},{id:'two',name:'Other strategy',cards:starterDeck(),active:false}];
 let lib=readDeckLibrary(storage,key,{serverDecks:server});lib.decks[0].name='Unfinished rename';persistDeckLibrary(storage,key,lib);
 const selected=readDeckLibrary(storage,key,{serverDecks:server,requestedId:'two'});assert.equal(selected.selectedId,'two');assert.equal(selected.decks[0].name,'Unfinished rename');
 assert.equal(readDeckLibrary(storage,key,{serverDecks:server,requestedId:'foreign-deck'}).selectedId,'one');assert.equal(data.has(libraryKey('sandbox')),false);
});

test('older booster openings survive pagination and reload without a charge; another account cannot read or reveal them',async()=>{
 const db=new PGlite(),a='49494949-4949-4949-8949-494949494949',b='50505050-5050-4050-8050-505050505050';
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users(id) values('${a}'),('${b}');`);
  for(const file of (await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort())await db.exec(await fs.readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
  for(const id of [a,b])await db.exec(`set request.jwt.claim.sub='${id}';select public.dv_initialize_account();`);
  await db.exec(`update public.dv_wallets set earned=4000 where user_id='${a}';set role authenticated;set request.jwt.claim.sub='${a}';`);
  const ids=[];for(let i=0;i<25;i++){const request='99999999-9999-4999-8999-'+String(4900+i).padStart(12,'0');ids.push((await db.query('select public.dv_buy_alpha_booster($1,$2) as id',[request,'pixels'])).rows[0].id);}
  const oldest=ids[0];await db.exec('reset role');await db.query("update public.dv_booster_purchases36 set created_at='2026-11-20T12:00:00Z'");await db.query("update public.dv_booster_purchases36 set created_at='2026-11-19T12:00:00Z' where id=$1",[oldest]);await db.exec('set role authenticated');
  const first=(await db.query('select id,created_at from public.dv_booster_purchases36 order by created_at desc,id desc limit 20')).rows;
  const cursor={id:first.at(-1).id,created_at:first.at(-1).created_at.toISOString()};assert.match(boosterHistoryFilter(cursor),/^created_at.lt./);
  const second=(await db.query('select id,created_at from public.dv_booster_purchases36 where created_at<$1 or(created_at=$1 and id<$2) order by created_at desc,id desc limit 20',[cursor.created_at,cursor.id])).rows;
  assert.equal(first.length,20);assert.equal(second.length,5);assert.equal(new Set([...first,...second].map(p=>p.id)).size,25);assert.equal(second.at(-1).id,oldest);
  const wallet=JSON.stringify((await db.query('select earned,premium,echoes from public.dv_wallets')).rows),owned=JSON.stringify((await db.query('select variant_id,quantity from public.dv_inventory order by variant_id')).rows);
  await db.query('select public.dv_reveal_booster_card($1,2)',[oldest]);await db.query('select public.dv_reveal_booster_card($1,2)',[oldest]);
  const restored=(await db.query('select id,cards,revealed_slots from public.dv_booster_purchases36 where id=$1',[oldest])).rows[0];assert.equal(restored.cards.length,5);assert.equal(boosterProgress(restored).revealed,1);assert.equal(requestedBooster(new URL(boosterLink(oldest),'https://example.test').search),oldest);
  assert.equal(JSON.stringify((await db.query('select earned,premium,echoes from public.dv_wallets')).rows),wallet);assert.equal(JSON.stringify((await db.query('select variant_id,quantity from public.dv_inventory order by variant_id')).rows),owned);
  await db.exec(`set request.jwt.claim.sub='${b}';`);assert.equal((await db.query('select id from public.dv_booster_purchases36 where id=$1',[oldest])).rows.length,0);await assert.rejects(db.query('select public.dv_reveal_booster_card($1,3)',[oldest]),/not found/);
  await db.exec('reset role;set role anon');await assert.rejects(db.query('select id from public.dv_booster_purchases36'));
 }finally{await db.close();}
});
