import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
test('database: idempotent starter, RLS isolation, ownership and atomic deck validation',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users values('${A}'),('${B}');`);
 await db.exec(await readFile(new URL('../supabase/migrations/202611180001_duelverse_foundation.sql',import.meta.url),'utf8'));
 const asUser=async(id)=>{await db.exec(`reset role;set role authenticated;set request.jwt.claim.sub='${id}';`);};
 await asUser(A);await db.query('select public.dv_initialize_account()');await db.query('select public.dv_initialize_account()');
 const inventory=await db.query('select * from public.dv_inventory');assert.equal(inventory.rows.length,3);assert.equal(inventory.rows.reduce((n,r)=>n+r.quantity,0),18);
 let decks=await db.query('select * from public.dv_decks');assert.equal(decks.rows.length,1);const deckA=decks.rows[0];assert.equal(deckA.cards.length,15);
 await assert.rejects(db.query('select public.dv_save_deck($1,$2,$3)',[deckA.id,'Too short',deckA.cards.slice(1)]));
 await assert.rejects(db.query('select public.dv_save_deck($1,$2,$3)',[deckA.id,'Unowned',Array(15).fill('pepe:mythic')]));
 await assert.rejects(db.query('select public.dv_save_deck($1,$2,$3)',[deckA.id,'Too many copies',Array(15).fill('pepe:common')]));
 await assert.rejects(db.query('update public.dv_wallets set earned=9000'));
 await assert.rejects(db.query('insert into public.dv_inventory values($1,$2,99)',[A,'pepe:mythic']));
 await asUser(B);await db.query('select public.dv_initialize_account()');
 assert.equal((await db.query('select * from public.dv_decks where user_id=$1',[A])).rows.length,0);
 await assert.rejects(db.query('select public.dv_save_deck($1,$2,$3)',[deckA.id,'Steal',deckA.cards]));
 await assert.rejects(db.query('delete from public.dv_inventory'));
 await asUser(A);await db.query('select public.dv_save_deck($1,$2,$3)',[deckA.id,'Saved deck',deckA.cards]);
 decks=await db.query('select * from public.dv_decks');assert.equal(decks.rows[0].name,'Saved deck');assert.equal(decks.rows[0].active,true);
 await assert.rejects(db.query('select public.dv_save_deck(null,$1,$2)',['Invalid after active deck',Array(15).fill('fake')]));
 assert.equal((await db.query('select count(*)::int as n from public.dv_decks where active')).rows[0].n,1);
 await db.exec('reset role;set role anon;');assert.equal((await db.query('select * from public.dv_card_variants')).rows.length,15);
 await assert.rejects(db.query('select public.dv_initialize_account()'));
 await assert.rejects(db.query('select * from public.dv_inventory'));
 }finally{await db.close();}
});
