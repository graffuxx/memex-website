import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {NEW_ALPHA_CARDS} from '../public/game/platform/expansion45.mjs';
import {DEFINITIONS,VARIANTS,validateDeck,starterDeck} from '../public/game/platform/catalog.mjs';
import {protectedCandidates} from '../public/game/platform/alpha-booster36.mjs';

test('all 12 approved value sets have five distinct artworks, cosmetic-only stats and Alpha membership',async()=>{
 const approved=JSON.parse(await fs.readFile(new URL('./fixtures/alpha-values45.json',import.meta.url),'utf8'));
 assert.equal(NEW_ALPHA_CARDS.length,12);assert.equal(DEFINITIONS.length,85);assert.equal(VARIANTS.length,2125);
 for(const c of NEW_ALPHA_CARDS){
  assert.deepEqual(c.values,approved.find(a=>a.id==='draft-'+c.id).values);assert.equal(c.ability,null);
  const variants=VARIANTS.filter(v=>v.definitionId===c.id&&v.id===`${c.id}:${v.rarity}`),hashes=[];assert.equal(variants.length,5);
  for(const v of variants){assert.equal(v.edition,'alpha');assert.ok(protectedCandidates(v.rarity).some(p=>p.id===v.id));const image=await fs.readFile(new URL('../public'+v.image,import.meta.url));assert.ok(image.length>10000);hashes.push(createHash('sha256').update(image).digest('hex'));}
  assert.equal(new Set(hashes).size,5,c.id+' needs distinct artwork per rarity');
 }
 const varied=NEW_ALPHA_CARDS.map((c,i)=>`${c.id}:${['common','rare','epic','legendary','mythic'][i%5]}`).concat(['pepe:common','doge:common','roll-safe:common']);
 assert.equal(validateDeck(varied,Object.fromEntries(varied.map(id=>[id,1]))).valid,true);
 const four=starterDeck().slice(4).concat(['hodl:common','hodl:rare','hodl:epic','hodl:mythic']);
 assert.equal(validateDeck(four,Object.fromEntries(four.map(id=>[id,3]))).valid,false);
});

test('catalog expansion preserves accounts and old decks; server boosters and crafting use all 60 new variants',async()=>{
 const db=new PGlite(),u='44444444-4444-4444-8444-444444444444';
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users values('${u}');`);
  for(const file of ['202611180001_duelverse_foundation.sql','202611190001_meme_expansion.sql','202611190002_deck_motif_limit.sql','202611190003_card_economy.sql','202611190004_three_resources.sql','202611190005_alpha_boosters.sql'])await db.exec(await fs.readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
  await db.exec(`set request.jwt.claim.sub='${u}';select public.dv_initialize_account();update public.dv_wallets set earned=2000,premium=150,echoes=20000 where user_id='${u}';`);
  const before=JSON.stringify((await db.query('select cards from public.dv_decks')).rows),inventory=JSON.stringify((await db.query('select * from public.dv_inventory order by variant_id')).rows),wallet=JSON.stringify((await db.query('select earned,premium,echoes from public.dv_wallets')).rows);
  const migration=await fs.readFile(new URL('../supabase/migrations/202611190006_alpha_expansion.sql',import.meta.url),'utf8');await db.exec(migration);await db.exec(migration);
  assert.equal(JSON.stringify((await db.query('select cards from public.dv_decks')).rows),before);assert.equal(JSON.stringify((await db.query('select * from public.dv_inventory order by variant_id')).rows),inventory);assert.equal(JSON.stringify((await db.query('select earned,premium,echoes from public.dv_wallets')).rows),wallet);
  const server=(await db.query('select id,definition_id,rarity,image,edition from public.dv_card_variants')).rows;assert.equal(server.length,125);
  for(const v of VARIANTS.filter(v=>NEW_ALPHA_CARDS.some(c=>c.id===v.definitionId)&&v.id===`${v.definitionId}:${v.rarity}`)){const row=server.find(r=>r.id===v.id);assert.ok(row);assert.equal(row.image,v.image);assert.equal(row.edition,'alpha');}
  const serverDefs=(await db.query('select id,edge_values from public.dv_card_definitions')).rows;for(const c of NEW_ALPHA_CARDS)assert.deepEqual(serverDefs.find(d=>d.id===c.id).edge_values,c.values);
  // Saturate only the old pool in this isolated database. Every real purchase must
  // now draw from the newly inserted set without changing the rarity rolls.
  await db.exec(`insert into public.dv_card_acquired36(user_id,variant_id,quantity) select '${u}',id,3 from public.dv_card_variants where definition_id not in (${NEW_ALPHA_CARDS.map(c=>"'"+c.id+"'").join(',')}) on conflict(user_id,variant_id) do update set quantity=3;set role authenticated;`);
  const bought=(await db.query("select public.dv_buy_alpha_booster('99999999-9999-4999-8999-999999994501','pixels') as id")).rows[0].id;
  const pack=(await db.query('select cards from public.dv_booster_purchases36 where id=$1',[bought])).rows[0].cards;
  assert.equal(pack.length,5);assert.ok(pack.some(id=>!id.endsWith(':common')));assert.ok(pack.every(id=>NEW_ALPHA_CARDS.some(c=>id.startsWith(c.id+':'))));
  await db.query("select public.dv_trade_card('99999999-9999-4999-8999-999999994502','craft','hodl:epic')");
  assert.ok(Number((await db.query("select quantity from public.dv_inventory where variant_id='hodl:epic'")).rows[0].quantity)>=1);
  await assert.rejects(db.query("select public.dv_trade_card('99999999-9999-4999-8999-999999994503','craft','hodl:mythic')"),/booster exclusive/);
  const deck=starterDeck().slice(1).concat('hodl:epic');const saved=(await db.query('select id from public.dv_decks limit 1')).rows[0].id;
  await db.query('select public.dv_save_deck($1,$2,$3)',[saved,'Alpha expansion deck',deck]);assert.deepEqual((await db.query('select cards from public.dv_decks where id=$1',[saved])).rows[0].cards,deck);
  await db.exec('reset role;set role anon');await assert.rejects(db.query("insert into public.dv_card_definitions(id,rule_id,name,element,edge_values) values('fake','fake','Fake','fire',array[7,7,7,7,7,7])"));
 }finally{await db.close();}
});
