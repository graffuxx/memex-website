import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {createHash} from 'node:crypto';import {PGlite} from '@electric-sql/pglite';
import {ICONIC_CARDS136} from '../public/game/platform/iconics136.mjs';
import {DEFINITIONS,VARIANTS,RARITIES,getVariant,validateDeck,starterDeck,countPrimes,countIconics,deckAddError126} from '../public/game/platform/catalog.mjs';
import {ALPHA_SLOTS131} from '../public/game/platform/set-manifest131.mjs';
import {fullTestDeckInventory} from '../public/game/platform/booster-test.mjs';
import {addDeckCard,rebuildLegalDeck} from '../public/game/platform/deck-library28.mjs';
import {protectedCandidates} from '../public/game/platform/alpha-booster36.mjs';
import {createBot96,random96} from '../server/game/bot96.mjs';
import {soloOpponent84} from '../public/game/platform/solo84.mjs';
import {createPvp90,advancePvp90} from '../server/game/pvp90.mjs';
import {chooseTactic} from '../public/game/src/tactics-ai.mjs';
import {determinize135,searchIsmcts135} from '../server/game/ismcts135.mjs';
import {placeEffect} from '../public/game/src/table-demo-rules.mjs';
const all=fullTestDeckInventory(),regular=starterDeck();
const deck=(iconic='rage-guy',prime='evil-ernie')=>[iconic+':common',prime+':common',...regular.slice(0,13)];
const open=(cards,seed=1)=>{let s=createPvp90(cards.map(cards=>({cards})),seed,0);for(const [side,move]of [[0,{kind:'gesture',value:'rock'}],[1,{kind:'gesture',value:'scissors'}],[0,{kind:'starter',side:0}]])s=advancePvp90(s,side,move,0);return s;};
test('Alpha completes 120 stable motifs with 20 approved tradeoff profiles and 100 distinct usable Iconic artworks',async()=>{
 assert.equal(DEFINITIONS.length,120);assert.equal(ICONIC_CARDS136.length,20);const hashes=new Set();
 for(const [i,c]of ICONIC_CARDS136.entries()){
  assert.equal(ALPHA_SLOTS131[100+i].id,c.id);assert.equal(c.values.reduce((s,n)=>s+n),28);assert.ok(c.values.every(n=>n>=2&&n<=8));assert.ok(c.values.some(n=>n<=3));assert.equal(c.prime,false);assert.equal(c.ability,null);
  const def=DEFINITIONS.find(d=>d.id===c.id);assert.equal(def.category,'iconic');assert.equal(def.iconic,true);assert.equal(def.edition,'alpha');assert.equal(getVariant(c.id+':common').element,c.element);assert.equal(VARIANTS.filter(v=>v.definitionId===c.id).length,5);
  for(const r of RARITIES){const v=getVariant(c.id+':'+r.id);assert.equal(v.element,c.element);assert.equal(all[v.id],1);assert(protectedCandidates(r.id).some(x=>x.id===v.id));const b=await fs.readFile(new URL('../public'+v.image,import.meta.url));assert.ok(b.length>15000);hashes.add(createHash('sha256').update(b).digest('hex'));}
 }
 assert.equal(hashes.size,100);for(const e of ['fire','water','earth','air','storm'])assert.equal(ICONIC_CARDS136.filter(c=>c.element===e).length,4);
});
test('one Iconic and one Prime are independent optional slots, across all finishes, including explicit editor repair',()=>{
 assert(validateDeck(regular,all).valid);assert(validateDeck(deck(),all).valid);
 for(const c of ICONIC_CARDS136)for(const r of RARITIES)assert(validateDeck([c.id+':'+r.id,...regular.slice(0,14)],all).valid);
 const two=['rage-guy:common','kekw:mythic',...regular.slice(0,13)];assert(!validateDeck(two,all).valid);assert.match(validateDeck(two,all).errors.join(' '),/Maximum 1 Iconic/);
 assert.match(deckAddError126(['rage-guy:rare'],'kekw:epic'),/Maximum 1 Iconic/);assert.throws(()=>addDeckCard(['rage-guy:rare'],'kekw:epic',all),/Maximum 1 Iconic/);
 assert.match(deckAddError126(['rage-guy:rare'],'rage-guy:mythic'),/Maximum 1 copy/);
 const fixed=rebuildLegalDeck([...two.slice(0,2),'evil-ernie:epic','sanic:common',...regular.slice(0,11)],all);assert(validateDeck(fixed,all).valid);assert.equal(countIconics(fixed),1);assert.equal(countPrimes(fixed),1);
});
test('random and training opponents use every Iconic through legal separate class slots; hidden worlds honor already revealed Iconics',()=>{
 const seen=new Set();for(let seed=0;seed<500;seed++)for(const cards of [createBot96(seed).deck.cards,soloOpponent84('pressure',regular,seed),soloOpponent84('balanced',regular,seed)]){
  assert(validateDeck(cards,all).valid,`seed ${seed}`);assert(countIconics(cards)<=1);assert(countPrimes(cards)<=1);for(const id of cards)if(DEFINITIONS.find(c=>c.id===getVariant(id).definitionId).iconic)seen.add(getVariant(id).definitionId);
 }assert.equal(seen.size,20);
 let s=open([deck(),deck('kekw','sanic')],16);while(!s.game.finished&&!Object.values(s.game.board).some(c=>getVariant(c.variantId).definitionId==='rage-guy'))s=advancePvp90(s,s.game.turn,{kind:'place',action:chooseTactic(s.game,{policy:'position'}).chosen.action},1);
 for(let seed=1;seed<=40;seed++){const g=determinize135(s.game,{observer:1,ownDeck:s.decks[1].cards,random:random96(seed)});for(const side of [0,1]){const ids=[...g.players[side].hand,...g.players[side].deck,...Object.values(g.board).filter(c=>c.origin===side)].map(c=>c.variantId);assert.equal(ids.length,15);assert.equal(new Set(ids.map(id=>getVariant(id).definitionId)).size,15);assert(countIconics(ids)<=1);assert(countPrimes(ids)<=1);}}
});
test('real IS-MCTS completes a round using Iconics, identical rules and no unknown-card fallback',()=>{
 let s=open([deck(),deck('kekw','sanic')],19),searches=0;
 while(!s.game.finished){const side=s.game.turn;let action;if([0,4,8,12,16].includes(s.game.placements)){const result=searchIsmcts135(s.game,{observer:side,ownDeck:s.decks[side].cards,random:random96(136+s.game.placements),limits:{iterations:8,maxMs:1000},now:()=>0});assert.equal(result.reason,'search');assert.equal(result.simulations,8);action=result.action;searches++;}else action=chooseTactic(s.game,{policy:'position'}).chosen.action;placeEffect(s.game,action);s=advancePvp90(s,side,{kind:'place',action},1);}
 assert.equal(s.game.placements,18);assert.equal(searches,5);
});
test('server release preserves accounts, enforces both class limits at save/start/AI fill, and lifetime booster protection includes Iconics',async()=>{
 const db=new PGlite(),u='13613613-6136-4136-8136-000000000001';try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users(id,email_confirmed_at,email) values('${u}',now(),'iconic136@example.test');`);
  const dir=new URL('../supabase/migrations/',import.meta.url),migration='202611230007_iconic_alpha136.sql';for(const f of (await fs.readdir(dir)).filter(f=>f.endsWith('.sql')&&f<migration).sort())await db.exec(await fs.readFile(new URL(f,dir),'utf8'));await db.exec(`set request.jwt.claim.sub='${u}';select public.dv_initialize_account();`);
  const snapshot=async()=>JSON.stringify({inventory:(await db.query('select * from public.dv_inventory order by variant_id')).rows,wallet:(await db.query('select * from public.dv_wallets')).rows,decks:(await db.query('select * from public.dv_decks order by id')).rows,packs:(await db.query('select * from public.dv_booster_purchases36 order by id')).rows});const before=await snapshot(),sql=await fs.readFile(new URL(migration,dir),'utf8');await db.exec(sql);await db.exec(sql);assert.equal(await snapshot(),before);
  assert.equal((await db.query("select count(*)::int n from public.dv_card_definitions where card_class='iconic'")).rows[0].n,20);assert.equal((await db.query("select count(*)::int n from public.dv_card_variants v join public.dv_card_definitions d on d.id=v.definition_id where v.edition='alpha' and v.element=d.element")).rows[0].n,600);
  await db.exec(`insert into public.dv_inventory(user_id,variant_id,quantity) select '${u}',id,1 from public.dv_card_variants where id in ('rage-guy:common','kekw:mythic','evil-ernie:common') on conflict(user_id,variant_id) do update set quantity=1;set role authenticated;`);
  const legal=deck(),illegal=['rage-guy:common','kekw:mythic',...regular.slice(0,13)];const save=cards=>db.query('select public.dv_save_deck(null,$1,$2) id',['Iconic deck',cards]);const id=(await save(legal)).rows[0].id;
  await assert.rejects(save(illegal),/Maximum 1 Iconic/);await assert.rejects(db.query('select public.dv_save_friendly_deck131(null,$1,$2)',['Two Iconics',illegal]),/Maximum 1 Iconic/);
  await db.exec('reset role');assert.equal((await db.query('select public.dv_match_deck90($1,$2) d',[u,id])).rows[0].d.cards.length,15);await db.query('update public.dv_decks set cards=$1 where id=$2',[illegal,id]);await assert.rejects(db.query('select public.dv_match_deck90($1,$2)',[u,id]),/Maximum 1 Iconic/);await db.query('update public.dv_decks set cards=$1 where id=$2',[legal,id]);
  const match=(await db.query("select public.dv_match_join90($1,'random',$2,null) id",[u,id])).rows[0].id;await db.query("update public.dv_pvp90 set created_at=now()-interval '1 minute' where id=$1",[match]);await assert.rejects(db.query('select public.dv_match_fill_ai96($1,$2,$3,$4)',[u,match,JSON.stringify({cards:illegal}),JSON.stringify({isAi:true,displayName:'TestBot'})]),/Maximum 1 Iconic/);
  await db.exec(`update public.dv_wallets set earned=100 where user_id='${u}';insert into public.dv_card_acquired36(user_id,variant_id,quantity) select '${u}',v.id,1 from public.dv_card_variants v join public.dv_card_definitions d on d.id=v.definition_id where v.edition='alpha' and v.element=d.element and v.definition_id<>'two-buttons' on conflict(user_id,variant_id) do update set quantity=1;delete from public.dv_card_acquired36 where user_id='${u}' and variant_id like 'two-buttons:%';set role authenticated;`);
  const pack=(await db.query("select public.dv_buy_alpha_booster(gen_random_uuid(),'pixels') id")).rows[0].id,contents=(await db.query('select cards from public.dv_booster_purchases36 where id=$1',[pack])).rows[0].cards;assert.equal(contents.length,5);assert(contents.some(id=>id.startsWith('two-buttons:')));assert(contents.every(id=>getVariant(id)?.edition==='alpha'));
  await db.exec('reset role;set role anon');await assert.rejects(db.query('select public.dv_validate_cards131($1)',[legal]),/permission denied/);await assert.rejects(db.query("update public.dv_card_definitions set card_class='regular' where id='rage-guy'"),/permission denied/);
 }finally{await db.close();}
});
