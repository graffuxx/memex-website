import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {ELEMENT_IDS,ELEMENTS,elementAdvantage} from '../public/game/platform/elements53.mjs';
import {ELEMENT_CARDS} from '../public/game/platform/expansion53.mjs';
import {DEFINITIONS,VARIANTS,getVariant,starterDeck,starterInventory,expandGameDeck,validateDeck} from '../public/game/platform/catalog.mjs';
import {summarizeDeck,addDeckCard} from '../public/game/platform/deck-library28.mjs';
import {cardOf,scores} from '../public/game/src/rules.mjs';
import {createTacticsMatch,demoAction} from '../public/game/src/table-demo-state.mjs';
import {placeEffect,effectStrength,eventFields,LOADOUTS} from '../public/game/src/table-demo-rules.mjs';
import {applyPortalDecks} from '../public/game/platform/deck-bridge.mjs';
import {createAccountDuel,advanceAccountDuel} from '../server/game/engine50.mjs';
test('five elements: exactly two wins/two losses, no mutual advantages; bonuses compare values, not automatic wins',()=>{
 assert.equal(ELEMENT_IDS.length,5);
 for(const a of ELEMENT_IDS){assert.equal(ELEMENTS[a].beats.length,2);assert.equal(ELEMENT_IDS.filter(b=>elementAdvantage(b,a)).length,2);assert.equal(elementAdvantage(a,a),false);for(const b of ELEMENT_IDS)if(a!==b)assert.notEqual(elementAdvantage(a,b),elementAdvantage(b,a));}
 for(const a of ELEMENT_IDS)for(const b of ELEMENT_IDS){const game=createTacticsMatch({seed:11});game.demoFields=[];const card=expandGameDeck([VARIANTS.find(v=>v.rarity==='common'&&v.element===a).id],0)[0],other=expandGameDeck([VARIANTS.find(v=>v.rarity==='common'&&v.element===b).id],1)[0];assert.equal(cardOf(card).element,a);assert.equal(effectStrength(game,card,'0,0',0,other).element,Number(elementAdvantage(a,b)));}
});
test('50 new motifs, ten native per element, every motif keeps its native element and five finishes; cap is shared',()=>{
 assert.equal(ELEMENT_CARDS.length,50);assert.equal(DEFINITIONS.length,120);assert.equal(VARIANTS.filter(v=>v.edition==='alpha').length,600);assert.equal(new Set(VARIANTS.map(v=>v.id)).size,VARIANTS.length);
 for(const e of ELEMENT_IDS)assert.equal(ELEMENT_CARDS.filter(c=>c.element===e).length,10);
 for(const c of DEFINITIONS){const variants=VARIANTS.filter(v=>v.definitionId===c.id&&v.edition==='alpha');assert.equal(variants.length,5);assert.ok(variants.every(v=>v.element===c.element));assert.ok(getVariant(c.id+':common'));}
 assert.ok(validateDeck(starterDeck(),starterInventory()).valid);
 const variants=['doge:common','doge:rare','doge:epic'],inventory=Object.fromEntries(VARIANTS.map(v=>[v.id,3]));assert.throws(()=>addDeckCard(variants,'doge:mythic',inventory),/Maximum 1/);
 assert.deepEqual(summarizeDeck(variants).elements,{fire:3,water:0,earth:0,air:0,storm:0});
 for(const c of ELEMENT_CARDS){assert.equal(c.values.reduce((a,b)=>a+b,0),24);assert.ok(c.values.every(n=>Number.isInteger(n)&&n>=2&&n<=7));}
});
test('resonance can reach all five elements; mixed-element rounds finish legally and server resolves the same action',()=>{
 assert.deepEqual(new Set(Array.from({length:30},(_,seed)=>eventFields(createTacticsMatch({seed,eventFieldsEnabled:true})).filter(f=>f.type==='resonance').map(f=>f.element)).flat()),new Set(ELEMENT_IDS));
 const deck=ELEMENT_IDS.flatMap(e=>ELEMENT_CARDS.filter(c=>c.element===e).slice(0,3)).map(c=>c.id+':common'),inventory=Object.fromEntries(deck.map(id=>[id,1]));
 for(const starter of [0,1]){let game=applyPortalDecks(createTacticsMatch({seed:91,starter}),deck,[LOADOUTS['hype-guard'],LOADOUTS['hype-twist']]);game.rotationLocked=true;
  for(let i=0;i<18;i++){const action=demoAction(game);assert.ok(action);game=placeEffect(game,action);}assert.ok(game.finished);assert.equal(scores(game).reduce((a,b)=>a+b),18);
 }
 const state=createAccountDuel({deck:{id:'x',name:'Elements',cards:deck},inventory,seed:12,starter:0});assert.equal(state.game.elementRules,5);const action=demoAction(state.game);const direct=placeEffect(state.game,action),server=advanceAccountDuel(state,{kind:'place',action});assert.deepEqual(server.steps[0].after,direct);
 const old={...state,elementRules:undefined,game:{...state.game,elementRules:undefined}};assert.doesNotThrow(()=>advanceAccountDuel(old,{kind:'place',action}));
});
test('additive database upgrade preserves accounts and matches all 2125 variants; boosters/crafting/deck cap accept elements',async()=>{
 const db=new PGlite(),u='53535353-5353-4535-8535-535353535353';
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users values('${u}');`);
  for(const file of (await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).filter(n=>n.endsWith('.sql')&&n<'202611200002'))await db.exec(await fs.readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
  await db.exec(`set request.jwt.claim.sub='${u}';select public.dv_initialize_account();update public.dv_wallets set earned=2000,echoes=20000 where user_id='${u}';`);
  const snapshot=async()=>JSON.stringify({decks:(await db.query('select * from public.dv_decks order by id')).rows,inventory:(await db.query('select * from public.dv_inventory order by variant_id')).rows,wallet:(await db.query('select * from public.dv_wallets')).rows});const before=await snapshot();
  const sql=await fs.readFile(new URL('../supabase/migrations/202611200002_five_elements.sql',import.meta.url),'utf8');await db.exec(sql);await db.exec(sql);assert.equal(await snapshot(),before);
  const rows=(await db.query('select id,element,image from public.dv_card_variants')).rows;assert.equal(rows.length,2125);for(const v of VARIANTS.filter(v=>v.edition==='alpha'&&DEFINITIONS.find(d=>d.id===v.definitionId).category==='regular')){const row=rows.find(r=>r.id===v.id);assert.equal(row.element,v.element,v.id);if(v.definitionId!=='salt-bae')assert.equal(row.image,v.image,v.id);}
  await db.exec(`set role authenticated;select public.dv_trade_card('53535353-0000-4000-8000-000000000001','craft','capybara-chill:epic:air');`);
  await assert.rejects(db.query(`select public.dv_trade_card('53535353-0000-4000-8000-000000000002','craft','capybara-chill:mythic:air')`),/booster exclusive/);
  await db.exec('reset role');
  // Leave a Water variant available in every finish: the rarity roll itself is intentionally random.
  const targets=['common','rare','epic','legendary','mythic'].map(r=>'nyan-cat:'+r+':water');await db.exec(`insert into public.dv_card_acquired36(user_id,variant_id,quantity) select '${u}',id,3 from public.dv_card_variants where id<>all(array[${targets.map(id=>"'"+id+"'").join(',')}]) on conflict(user_id,variant_id) do update set quantity=3;set role authenticated;`);
  const id=(await db.query(`select public.dv_buy_alpha_booster('53535353-0000-4000-8000-000000000003','pixels') id`)).rows[0].id;const pack=(await db.query('select cards from public.dv_booster_purchases36 where id=$1',[id])).rows[0].cards;assert.ok(pack.some(id=>targets.includes(id)));assert.equal(pack.length,5);
  await db.exec('reset role');await db.exec(`insert into public.dv_inventory(user_id,variant_id,quantity) select '${u}',id,3 from public.dv_card_variants on conflict(user_id,variant_id) do update set quantity=3;set role authenticated;`);
  const illegal=starterDeck().slice(0,11).concat(['doge:rare:water','doge:epic:air','doge:rare:earth','doge:rare:storm']);await assert.rejects(db.query('select public.dv_save_deck(null,$1,$2)',['Four elements same meme',illegal]),/Maximum 3/);
 }finally{await db.close();}
});

test('90 actions from the previously published three-element engine retain identical comparisons and outcomes',async()=>{
 const {previewEffect}=await import('../public/game/src/table-demo-rules.mjs');const fixture=JSON.parse(await fs.readFile(new URL('./fixtures/legacy-three-elements53.json',import.meta.url),'utf8'));
 for(const item of fixture.cases){let game=structuredClone(item.initial);for(const step of item.steps){const plan=previewEffect(game,step.action);assert.deepEqual(plan.comparisons.map(c=>({cell:c.cell,attack:c.attack,defend:c.defend,flip:c.flip})),step.comparisons);assert.deepEqual(plan.flips,step.flips);game=placeEffect(game,step.action);}assert.deepEqual(game.board,item.finalBoard);assert.equal(game.winner,item.winner);}
});
