import test from 'node:test';import assert from 'node:assert/strict';import {PGlite} from '@electric-sql/pglite';import {readFile} from 'node:fs/promises';
import {VARIANTS,DEFINITIONS} from '../public/game/platform/catalog.mjs';
import {ALPHA_BOOSTER,ALPHA_ODDS,protectedCandidates,validAlphaPack,revealedSlots} from '../public/game/platform/alpha-booster36.mjs';
import {ALPHA_MARK,UNIVERSAL_CARD_BACK,alphaNameplateMarkup} from '../public/game/platform/edition36.mjs';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',C='33333333-3333-4333-8333-333333333333';
const request=n=>`99999999-9999-4999-8999-${String(n).padStart(12,'0')}`;
test('Alpha pack rules: five cards, Silver minimum, three-copy lifetime protection and universal X back',()=>{
 assert.equal(ALPHA_BOOSTER.cards,5);assert.deepEqual(ALPHA_BOOSTER.prices,{pixels:100,shards:150});
 assert.equal(VARIANTS.length,65);assert.ok(VARIANTS.every(v=>v.edition==='alpha'));assert.ok(DEFINITIONS.every(c=>c.edition==='alpha'));
 for(const odds of Object.values(ALPHA_ODDS))assert.equal(odds.reduce((n,[,weight])=>n+weight,0),10000);
 const acquired=Object.fromEntries(VARIANTS.map(v=>[v.id,3]));acquired['smudge:rare']=2;
 assert.deepEqual(protectedCandidates('rare',acquired).map(v=>v.id),['smudge:rare']);acquired['smudge:rare']=3;assert.equal(protectedCandidates('rare',acquired).length,13);
 assert.equal(validAlphaPack(['pepe:common','doge:common','smudge:common','confused:common','harold:rare']),true);
 assert.equal(validAlphaPack(Array(5).fill('pepe:common')),false);assert.equal(validAlphaPack(['fake']),false);
 assert.deepEqual(revealedSlots([4,2,2,0,9,-1,'1']),[0,2,4]);
 assert.equal(UNIVERSAL_CARD_BACK,'/game/assets/cards/frame-v21/memex-back.webp');assert.equal(ALPHA_MARK.x,.405);assert.equal(ALPHA_MARK.glyphY,-.009);
});
test('account boosters: atomic price, persistent five-card results/reveals, ownership, and lifetime duplicates after crafting and dismantling',async()=>{
 const db=new PGlite();try{
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users values('${A}'),('${B}'),('${C}');`);
  const migrations=['202611180001_duelverse_foundation.sql','202611190001_meme_expansion.sql','202611190002_deck_motif_limit.sql','202611190003_card_economy.sql','202611190004_three_resources.sql'];
  for(const m of migrations)await db.exec(await readFile(new URL('../supabase/migrations/'+m,import.meta.url),'utf8'));
  const asUser=async u=>db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${u}';`);
  await asUser(C);await db.exec('select public.dv_initialize_account()');
  await db.exec(`reset role;insert into public.dv_inventory values('${C}','smudge:mythic',1);`);await asUser(C);
  await db.query('select public.dv_trade_card($1,$2,$3)',[request(500),'dismantle','smudge:mythic']);
  await db.exec('reset role');await db.exec(await readFile(new URL('../supabase/migrations/202611190005_alpha_boosters.sql',import.meta.url),'utf8'));
  await asUser(C);assert.equal(Number((await db.query("select quantity from public.dv_card_acquired36 where variant_id='smudge:mythic'")).rows[0].quantity),1);
  for(const u of [A,B]){await asUser(u);await db.exec('select public.dv_initialize_account()');}
  const sum=async table=>Number((await db.query('select coalesce(sum(quantity),0) as n from public.'+table)).rows[0].n);
  const wallet=async()=>{const r=(await db.query('select earned,premium,echoes from public.dv_wallets')).rows[0];return Object.fromEntries(Object.entries(r).map(([k,v])=>[k,Number(v)]));};
  const buy=async(n,currency='pixels')=>(await db.query('select public.dv_buy_alpha_booster($1,$2) as id',[request(n),currency])).rows[0].id;
  await asUser(B);assert.equal(await sum('dv_card_acquired36'),18);await assert.rejects(buy(1),/Not enough Pixels/);assert.equal(await sum('dv_inventory'),18);assert.equal((await db.query('select * from public.dv_booster_purchases36')).rows.length,0);
  await assert.rejects(buy(2,'echoes'),/Invalid booster/);
  await db.exec(`reset role;update public.dv_wallets set earned=1000,premium=150,echoes=987 where user_id='${A}';`);await asUser(A);
  const first=await buy(1);assert.deepEqual(await wallet(),{earned:900,premium:150,echoes:987});assert.equal(await sum('dv_inventory'),23);assert.equal(await sum('dv_card_acquired36'),23);
  let pack=(await db.query('select * from public.dv_booster_purchases36 where id=$1',[first])).rows[0];assert.equal(validAlphaPack(pack.cards),true);assert.deepEqual(pack.revealed_slots,[]);
  assert.equal(await buy(1),first);assert.equal(await sum('dv_inventory'),23);assert.deepEqual(await wallet(),{earned:900,premium:150,echoes:987});
  await assert.rejects(buy(1,'shards'),/another currency/);
  const reveal=(id,slot)=>db.query('select public.dv_reveal_booster_card($1,$2)',[id,slot]);
  await reveal(first,2);await reveal(first,2);assert.deepEqual((await db.query('select revealed_slots from public.dv_booster_purchases36 where id=$1',[first])).rows[0].revealed_slots,[2]);
  for(const slot of [0,1,3,4])await reveal(first,slot);
  assert.equal((await db.query('select revealed_slots from public.dv_booster_purchases36 where id=$1',[first])).rows[0].revealed_slots.length,5);
  await assert.rejects(reveal(first,5),/Invalid reveal/);assert.equal(await sum('dv_inventory'),23);
  const second=await buy(2,'shards');assert.deepEqual(await wallet(),{earned:900,premium:0,echoes:987});assert.equal(await sum('dv_inventory'),28);assert.equal(validAlphaPack((await db.query('select cards from public.dv_booster_purchases36 where id=$1',[second])).rows[0].cards),true);
  await assert.rejects(buy(3,'shards'),/Not enough Shards/);
  // Crafting increases lifetime acquisition; dismantling never reduces it.
  const acquiredBefore=Number((await db.query("select coalesce((select quantity from public.dv_card_acquired36 where variant_id='smudge:common'),0) as n")).rows[0].n);
  await db.query('select public.dv_trade_card($1,$2,$3)',[request(510),'craft','smudge:common']);
  await db.query('select public.dv_trade_card($1,$2,$3)',[request(511),'dismantle','smudge:common']);
  assert.equal(Number((await db.query("select quantity from public.dv_card_acquired36 where variant_id='smudge:common'")).rows[0].quantity),acquiredBefore+1);
  await asUser(B);assert.equal((await db.query('select * from public.dv_booster_purchases36 where id=$1',[first])).rows.length,0);await assert.rejects(reveal(first,0),/Booster not found/);
  for(const table of ['dv_booster_purchases36','dv_card_acquired36'])await assert.rejects(db.exec('delete from public.'+table));
  await assert.rejects(db.exec('update public.dv_card_acquired36 set quantity=0'));await assert.rejects(db.exec("update public.dv_booster_purchases36 set cards=array['fake','fake','fake','fake','fake']"));
  // Finish-level protection: if one variant is below three, that variant must appear
  // the first time that finish is drawn, even if additional slots then use the full pool.
  await db.exec(`reset role;update public.dv_wallets set earned=100000 where user_id='${A}';insert into public.dv_card_acquired36(user_id,variant_id,quantity) select '${A}',id,case when definition_id='bad-luck-brian' then 2 else 3 end from public.dv_card_variants on conflict(user_id,variant_id) do update set quantity=excluded.quantity;`);await asUser(A);
  const protectedPack=(await db.query('select cards from public.dv_booster_purchases36 where id=$1',[await buy(20)])).rows[0].cards;
  for(const finish of new Set(protectedPack.map(c=>c.split(':')[1])))assert.ok(protectedPack.includes('bad-luck-brian:'+finish));
  const ownedBefore=await sum('dv_inventory'),balanceBefore=await wallet();
  for(let n=30;n<60;n++){const id=await buy(n);assert.ok(validAlphaPack((await db.query('select cards from public.dv_booster_purchases36 where id=$1',[id])).rows[0].cards));}
  assert.equal(await sum('dv_inventory'),ownedBefore+150);assert.equal((await wallet()).earned,balanceBefore.earned-3000);assert.equal((await wallet()).echoes,balanceBefore.echoes);
  // An unavailable catalog rolls back inventory, history, ledger and payment together.
  await db.exec("reset role;update public.dv_card_variants set edition='future';");await asUser(A);const beforeFail=await wallet(),inventoryBeforeFail=await sum('dv_inventory'),historyBeforeFail=await sum('dv_card_acquired36');
  await assert.rejects(buy(90),/catalog unavailable/);assert.deepEqual(await wallet(),beforeFail);assert.equal(await sum('dv_inventory'),inventoryBeforeFail);assert.equal(await sum('dv_card_acquired36'),historyBeforeFail);
  await db.exec('reset role;set role anon');await assert.rejects(buy(100),/permission denied/);await assert.rejects(db.query('select * from public.dv_booster_purchases36'));
 }finally{await db.close();}
});
