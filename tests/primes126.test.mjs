import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {existsSync} from 'node:fs';import {PGlite} from '@electric-sql/pglite';
import {PRIME_CARDS} from '../public/game/platform/primes126.mjs';
import {DEFINITIONS,VARIANTS,starterDeck,starterInventory,validateDeck,countPrimes,expandGameDeck} from '../public/game/platform/catalog.mjs';
import {addDeckCard,rebuildLegalDeck} from '../public/game/platform/deck-library28.mjs';
import {ELEMENT_IDS,elementAdvantage,attackWins} from '../public/game/platform/elements53.mjs';
import {rankedStrength126,printedValue126} from '../public/game/platform/card-ranks126.mjs';
import {protectedCandidates} from '../public/game/platform/alpha-booster36.mjs';
import {createBot96} from '../server/game/bot96.mjs';
import {createTacticsMatch} from '../public/game/src/table-demo-state.mjs';import {previewEffect} from '../public/game/src/table-demo-rules.mjs';
test('fifteen Primes retain their approved sides, three per element and five distinct released artworks each',()=>{
 assert.equal(PRIME_CARDS.length,15);for(const e of ELEMENT_IDS)assert.equal(PRIME_CARDS.filter(c=>c.element===e).length,3);
 for(const c of PRIME_CARDS){assert.equal(c.values.filter(v=>v===10).length,1);assert.equal(c.values.filter(v=>v!==10).reduce((a,b)=>a+b,0),23);const variants=VARIANTS.filter(v=>v.definitionId===c.id);assert.equal(variants.length,5);assert.equal(new Set(variants.map(v=>v.image)).size,5);for(const v of variants){assert.equal(v.element,c.element);assert.equal(v.edition,'alpha');assert.ok(existsSync(new URL('../public'+v.image,import.meta.url)));}}
 assert.deepEqual(PRIME_CARDS.find(c=>c.id==='nuck-chorris').values,[3,10,7,6,5,2]);assert.deepEqual(PRIME_CARDS.find(c=>c.id==='evil-ernie').values,[10,5,2,3,6,7]);assert.equal(printedValue126(10),'S');
});
test('fifteen unique motifs, at most one Prime across every finish, and explicit legal repair',()=>{
 const all=Object.fromEntries(VARIANTS.map(v=>[v.id,5])),starter=starterDeck();assert.equal(new Set(starter).size,15);assert.ok(validateDeck(starter,starterInventory()).valid);
 const one=['evil-ernie:common',...starter.slice(1)];assert.ok(validateDeck(one,all).valid);
 for(const second of ['evil-ernie:rare','nuck-chorris:mythic']){const bad=[...one.slice(0,14),second];assert.equal(validateDeck(bad,all).valid,false);assert.throws(()=>addDeckCard(one.slice(0,14),second,all),/Maximum 1/);}
 assert.throws(()=>addDeckCard(['pepe:common'],'pepe:mythic',all),/Maximum 1 copy/);
 const old=['evil-ernie:common','nuck-chorris:rare',...Array(13).fill('pepe:common')],before={...all},fixed=rebuildLegalDeck(old,all);assert.ok(validateDeck(fixed,all).valid);assert.equal(countPrimes(fixed),1);assert.deepEqual(all,before);assert.equal(old.length,15);
});
test('S is immune to all numeric bonuses; only a stronger-element S captures an S',()=>{
 for(const a of ELEMENT_IDS)for(const d of ELEMENT_IDS){const e=Number(elementAdvantage(a,d)),de=Number(elementAdvantage(d,a));for(const base of [1,7,9])for(const bonus of [0,1,2,20]){const number={...rankedStrength126(base,bonus),element:e},s={...rankedStrength126(10,bonus),element:de};assert.equal(attackWins(number,s,5),false);assert.equal(attackWins(s,number,5),true);}
  assert.equal(attackWins({...rankedStrength126(10,10),element:e},{...rankedStrength126(10,0),element:de},5),elementAdvantage(a,d));}
 const game=createTacticsMatch({seed:5,starter:0});game.turn=0;game.block='-2,2';game.demoFields=[];game.events=[];game.placements=1;
 const ernie=expandGameDeck(['evil-ernie:common'],0)[0],nuck=expandGameDeck(['nuck-chorris:common'],1)[0];game.players[0].hand[0]=ernie;game.board={'1,0':{...nuck,rotation:2,controller:1}};
 const p=previewEffect(game,{uid:ernie.uid,cell:'0,0',rotation:0});assert.equal(p.comparisons[0].attack.rank,'S');assert.equal(p.comparisons[0].defend.rank,'S');assert.equal(p.comparisons[0].flip,false);
 game.players[0].hand[0]=nuck;game.board={'0,1':{...ernie,rotation:4,controller:1}};const strong=previewEffect(game,{uid:nuck.uid,cell:'0,0',rotation:0});assert.equal(strong.comparisons[0].flip,true);
});
test('booster history protects one per finish; bots use legal singleton decks and at most one Prime',()=>{
 const acquired=Object.fromEntries(VARIANTS.map(v=>[v.id,1]));acquired['evil-ernie:mythic']=0;assert.deepEqual(protectedCandidates('mythic',acquired).map(v=>v.id),['evil-ernie:mythic']);acquired['evil-ernie:mythic']=1;assert.equal(protectedCandidates('mythic',acquired).length,120);
 for(let seed=0;seed<100;seed++){const b=createBot96(seed),inventory=Object.fromEntries(b.deck.cards.map(id=>[id,1]));assert.ok(validateDeck(b.deck.cards,inventory).valid,`seed ${seed}`);assert.ok(countPrimes(b.deck.cards)<=1);}
});
test('live-schema migration preserves ownership and decks, enforces server limits, grants legal starters and changes duplicate protection atomically',async()=>{
 const db=new PGlite(),a='12612612-6126-4126-8126-126126126126',b='12612612-6126-4126-8126-126126126127';try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users(id,email_confirmed_at,email) values('${a}',null,'old126@example.test'),('${b}',now(),'new126@example.test');`);
 const dir=new URL('../supabase/migrations/',import.meta.url);for(const f of (await fs.readdir(dir)).filter(f=>f.endsWith('.sql')&&f<'202611230001').sort())await db.exec(await fs.readFile(new URL(f,dir),'utf8'));
 await db.exec(`set request.jwt.claim.sub='${a}';select public.dv_initialize_account();`);const oldDeck=(await db.query('select * from public.dv_decks where user_id=$1',[a])).rows[0],oldInventory=(await db.query('select * from public.dv_inventory where user_id=$1',[a])).rows;
 const migration=await fs.readFile(new URL('202611230001_primes_singleton126.sql',dir),'utf8');await db.exec(migration);
 assert.equal((await db.query('select count(*)::int n from public.dv_card_definitions where is_prime')).rows[0].n,10);assert.deepEqual((await db.query('select cards from public.dv_decks where id=$1',[oldDeck.id])).rows[0].cards,oldDeck.cards);
 for(const row of oldInventory)assert.ok((await db.query('select quantity from public.dv_inventory where user_id=$1 and variant_id=$2',[a,row.variant_id])).rows[0].quantity>=row.quantity);
 const snapshot=async()=>JSON.stringify((await db.query('select * from public.dv_inventory order by user_id,variant_id')).rows);const once=await snapshot();await db.exec(migration);assert.equal(await snapshot(),once);
 const asUser=async id=>db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${id}';`);await asUser(a);await assert.rejects(db.query('select public.dv_save_deck($1,$2,$3)',[oldDeck.id,'Old triples',oldDeck.cards]),/Maximum 1/);await db.query('select public.dv_save_deck($1,$2,$3)',[oldDeck.id,'Singles',starterDeck()]);
 for(let i=0;i<2;i++)await db.query("select public.dv_trade_card($1,'dismantle','pepe:common')",[`12612612-6126-4126-8126-${String(i).padStart(12,'0')}`]);await assert.rejects(db.query("select public.dv_trade_card(gen_random_uuid(),'dismantle','pepe:common')"),/protected/);
 await asUser(b);await db.query('select public.dv_initialize_account()');await db.query('select public.dv_initialize_account()');const fresh=(await db.query('select * from public.dv_decks')).rows[0];assert.deepEqual(fresh.cards,starterDeck());assert.equal((await db.query("select count(*)::int n from public.dv_booster_purchases36 where currency='starter'")).rows[0].n,10);
 await db.exec(`reset role;insert into public.dv_inventory(user_id,variant_id,quantity) values('${b}','evil-ernie:common',1),('${b}','nuck-chorris:common',1) on conflict(user_id,variant_id) do update set quantity=greatest(public.dv_inventory.quantity,1);`);await asUser(b);
 const legal=['evil-ernie:common',...starterDeck().slice(1)];await db.query('select public.dv_save_deck($1,$2,$3)',[fresh.id,'One Prime',legal]);await assert.rejects(db.query('select public.dv_save_deck($1,$2,$3)',[fresh.id,'Two Primes',['evil-ernie:common','nuck-chorris:common',...starterDeck().slice(2)]]),/Maximum 1 Prime/);
 await db.exec('reset role');assert.deepEqual((await db.query('select public.dv_match_deck90($1,$2) d',[b,fresh.id])).rows[0].d.cards,legal);
 const allocator=(await db.query("select pg_get_functiondef('public.dv_allocate_alpha56(uuid,uuid,text,integer)'::regprocedure) body")).rows[0].body;assert.match(allocator,/coalesce\(a.quantity,0\)<1/);
 await db.exec(`update public.dv_wallets set earned=10000 where user_id='${b}';insert into public.dv_card_acquired36(user_id,variant_id,quantity) select '${b}',id,1 from public.dv_card_variants where edition='alpha' and rarity='rare' on conflict(user_id,variant_id) do update set quantity=greatest(public.dv_card_acquired36.quantity,1);delete from public.dv_card_acquired36 where user_id='${b}' and variant_id='nuck-chorris:rare';`);await asUser(b);
 const pack=(await db.query("select public.dv_buy_alpha_booster(gen_random_uuid(),'pixels') id")).rows[0].id,contents=(await db.query('select cards from public.dv_booster_purchases36 where id=$1',[pack])).rows[0].cards;assert.ok(contents.some(id=>!id.endsWith(':common')));if(contents.some(id=>id.endsWith(':rare')))assert.ok(contents.includes('nuck-chorris:rare'));
 await assert.rejects(db.exec('update public.dv_card_definitions set is_prime=true'));await assert.rejects(db.query('select public.dv_match_deck90($1,$2)',[a,oldDeck.id]),/permission denied/);
 }finally{await db.close();}
});
