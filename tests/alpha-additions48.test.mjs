import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {ALPHA_ADDITIONS} from '../public/game/platform/expansion48.mjs';
import {DEFINITIONS,VARIANTS,validateDeck,starterDeck} from '../public/game/platform/catalog.mjs';
import {fullTestDeckInventory,expansionTestDeck} from '../public/game/platform/booster-test.mjs';
import {protectedCandidates,validAlphaPack} from '../public/game/platform/alpha-booster36.mjs';

test('ten approved motifs have fifty unique rarity artworks, exact tested values and unlocked sandbox copies',async()=>{
 const approved=JSON.parse(await fs.readFile(new URL('./fixtures/alpha-values48.json',import.meta.url),'utf8'));
 assert.equal(ALPHA_ADDITIONS.length,10);assert.equal(DEFINITIONS.length,85);assert.equal(VARIANTS.filter(v=>v.edition==='alpha').length,425);
 const inventory=fullTestDeckInventory();
 for(const c of ALPHA_ADDITIONS){
  assert.deepEqual(c.values,approved.find(a=>a.id==='draft-'+c.id).values);assert.equal(c.ability,null);
  const variants=VARIANTS.filter(v=>v.definitionId===c.id&&v.id===`${c.id}:${v.rarity}`),hashes=[];assert.equal(variants.length,5);
  for(const v of variants){assert.equal(v.edition,'alpha');assert.equal(inventory[v.id],3);assert.ok(protectedCandidates(v.rarity).some(p=>p.id===v.id));const image=await fs.readFile(new URL('../public'+v.image,import.meta.url));assert.ok(image.length>10000);hashes.push(createHash('sha256').update(image).digest('hex'));}
  assert.equal(new Set(hashes).size,5,c.id+' needs five distinct artworks');
 }
 const deck=expansionTestDeck();assert.equal(deck.length,15);assert.equal(new Set(deck).size,15);assert.ok(ALPHA_ADDITIONS.every(c=>deck.includes(c.id+':common')));assert.ok(validateDeck(deck,inventory).valid);
 const varied=deck.map((id,i)=>id.split(':')[0]+':'+['common','rare','epic','legendary','mythic'][i%5]);assert.ok(validateDeck(varied,inventory).valid);
});

test('Alpha catalog migration preserves account data; server boosters and crafting accept the new motifs',async()=>{
 const db=new PGlite(),u='48484848-4848-4848-8848-484848484848';
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users values('${u}');`);
  for(const file of ['202611180001_duelverse_foundation.sql','202611190001_meme_expansion.sql','202611190002_deck_motif_limit.sql','202611190003_card_economy.sql','202611190004_three_resources.sql','202611190005_alpha_boosters.sql','202611190006_alpha_expansion.sql'])await db.exec(await fs.readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
  await db.exec(`set request.jwt.claim.sub='${u}';select public.dv_initialize_account();update public.dv_wallets set earned=2000,premium=150,echoes=20000 where user_id='${u}';`);
  const snapshot=async()=>JSON.stringify({decks:(await db.query('select * from public.dv_decks order by id')).rows,inventory:(await db.query('select * from public.dv_inventory order by variant_id')).rows,wallet:(await db.query('select earned,premium,echoes from public.dv_wallets')).rows,acquired:(await db.query('select * from public.dv_card_acquired36 order by variant_id')).rows});
  const before=await snapshot(),migration=await fs.readFile(new URL('../supabase/migrations/202611190007_alpha_additions.sql',import.meta.url),'utf8');await db.exec(migration);await db.exec(migration);assert.equal(await snapshot(),before);
  const server=(await db.query('select id,image,edition from public.dv_card_variants')).rows;assert.equal(server.length,175);
  const definitions=(await db.query('select id,edge_values from public.dv_card_definitions')).rows;assert.equal(definitions.length,35);
  for(const c of ALPHA_ADDITIONS){assert.deepEqual(definitions.find(d=>d.id===c.id).edge_values,c.values);for(const v of VARIANTS.filter(v=>v.definitionId===c.id&&v.id===`${c.id}:${v.rarity}`)){const row=server.find(r=>r.id===v.id);assert.equal(row.image,v.image);assert.equal(row.edition,'alpha');}}
  // Only this isolated test account saturates older variants, forcing the newly
  // added pool through the actual purchase RPC without changing its rarity odds.
  await db.exec(`insert into public.dv_card_acquired36(user_id,variant_id,quantity) select '${u}',id,3 from public.dv_card_variants where definition_id not in (${ALPHA_ADDITIONS.map(c=>"'"+c.id+"'").join(',')}) on conflict(user_id,variant_id) do update set quantity=3;set role authenticated;`);
  const bought=(await db.query("select public.dv_buy_alpha_booster('99999999-9999-4999-8999-999999994801','pixels') as id")).rows[0].id;
  const pack=(await db.query('select cards from public.dv_booster_purchases36 where id=$1',[bought])).rows[0].cards;
  assert.ok(validAlphaPack(pack));assert.ok(pack.every(id=>ALPHA_ADDITIONS.some(c=>id.startsWith(c.id+':'))));
  await db.query("select public.dv_trade_card('99999999-9999-4999-8999-999999994802','craft','crying-cat:epic')");
  await assert.rejects(db.query("select public.dv_trade_card('99999999-9999-4999-8999-999999994803','craft','crying-cat:mythic')"),/booster exclusive/);
  const deck=starterDeck().slice(1).concat('crying-cat:epic'),saved=(await db.query('select id from public.dv_decks limit 1')).rows[0].id;
  await db.query('select public.dv_save_deck($1,$2,$3)',[saved,'New Alpha deck',deck]);assert.deepEqual((await db.query('select cards from public.dv_decks where id=$1',[saved])).rows[0].cards,deck);
  await db.exec('reset role;set role anon');await assert.rejects(db.query("insert into public.dv_card_definitions(id,rule_id,name,element,edge_values) values('fake','fake','Fake','fire',array[7,7,7,7,7,7])"));
 }finally{await db.close();}
});
