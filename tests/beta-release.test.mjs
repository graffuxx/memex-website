import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {BETA_BY_ID,BETA_CARDS} from '../public/game/platform/beta-cards.mjs';
import {editionOf131,editionProgress131,setSlot131} from '../public/game/platform/edition-catalog131.mjs';
import {VARIANTS,getVariant,starterDeck,expandGameDeck,validateDeck} from '../public/game/platform/catalog.mjs';
import {validAlphaPack,validBetaPack} from '../public/game/platform/alpha-booster36.mjs';
import {prepareManualOpening} from '../public/game/platform/booster-opening58.mjs';
import {cardAbilityIconMarkup} from '../public/game/src/card-ability-icon.mjs';
import {portalTrialAbility} from '../public/game/platform/deck-bridge.mjs';
import {createPvp90,advancePvp90,projectPvp90} from '../server/game/pvp90.mjs';

const migration='202611260001_beta_preview.sql';
const promotion='202611260002_promote_preview_cards_to_alpha.sql';
const dir=new URL('../supabase/migrations/',import.meta.url);

test('Ten promoted Alpha motifs keep their equal elements, ability icons and fifty playable finishes',async()=>{
 assert.equal(editionProgress131('alpha').released,130);
 assert.equal(VARIANTS.filter(v=>v.edition==='alpha').length,650);
 assert.equal(VARIANTS.filter(v=>v.edition==='beta').length,0);
 const promoted=VARIANTS.filter(v=>Object.hasOwn(BETA_BY_ID,v.definitionId));
 assert.equal(promoted.length,50);
 for(const [index,card] of BETA_CARDS.entries()){
  assert.equal(editionOf131(card.id),'alpha');
  assert.equal(setSlot131(card.id).number,121+index);
  assert.ok(promoted.filter(v=>v.definitionId===card.id).every(v=>v.image===card.image));
 }
 for(const group of ['prime','iconic'])for(const element of ['fire','water','earth','air','storm']){
  assert.equal(BETA_CARDS.filter(c=>c[group]&&c.element===element).length,1);
 }
 for(const c of BETA_CARDS){
  const variant=c.id+':mythic';
  const [card]=expandGameDeck([variant],0);
  assert.equal(portalTrialAbility({},card),c.ability);
  assert.match(cardAbilityIconMarkup(c.ability),new RegExp(c.ability));
  assert.ok((await stat(new URL('../public'+c.image,import.meta.url))).size>1000);
 }
 const legal=[...starterDeck().slice(0,12),'beta-cinema:common','beta-parkour:common','beta-over9000:common'];
 const owned=Object.fromEntries(legal.map(id=>[id,1]));
 assert.equal(validateDeck(legal,owned).valid,true);
 assert.equal(validateDeck([...legal.slice(0,-1),'beta-tpose:common'],{...owned,'beta-tpose:common':1}).valid,false);
});

for(const starter of [0,1]){
 test('New duels resolve the promoted card abilities with starter '+starter,()=>{
  const cards=[...starterDeck().slice(0,14),'beta-hackerman:common'];
  let s=createPvp90([{cards},{cards:starterDeck()}],42,1,{elementalTrial:true,allPrimes:true,abilityRework:true,finalGuard:true});
  s=advancePvp90(s,0,{kind:'gesture',value:'rock'},2);
  s=advancePvp90(s,1,{kind:'gesture',value:'scissors'},3);
  s=advancePvp90(s,0,{kind:'starter',side:starter},4);
  assert.equal(s.game.betaTrial,true);
  assert.equal(s.game.turn,starter);
  const beta=[...s.game.players[0].hand,...s.game.players[0].deck].find(c=>c.beta==='hackerman');
  s.game.turn=0;
  s.game.block='0,-2';
  const [target]=expandGameDeck(['doge:common'],1);
  s.game.board={'-1,0':{...target,controller:1,rotation:0,betaEdges:{0:6}}};
  s.game.players[0].hand=[beta];
  s.game.placements=2;
  const action={uid:beta.uid,cell:'0,0',rotation:0,betaChoice:{target:'-1,0',direction:0}};
  s=advancePvp90(s,0,{kind:'place',action},5);
  assert.equal(s.game.board['-1,0'].controller,0);
  assert.equal(s.game.board['-1,0'].betaEdges[0],4);
  const row={host_id:'host',guest_id:'guest',state:s,kind:'private',identities:[{},{}]};
  assert.equal(projectPvp90(row,'guest',6).game.board['-1,0'].betaEdges[0],4);
 });
}
test('The promotion preserves opening history and decks, retires Beta sales and adds the ten cards to Alpha packs',async()=>{
 const db=new PGlite(),user='26026026-4260-4260-8260-260260260260';
 try{
  await db.exec(`
   create role anon;create role authenticated;create role service_role bypassrls;
   create schema auth;
   create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text);
   create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
   grant usage on schema auth to anon,authenticated;
   grant execute on function auth.uid() to anon,authenticated;
   insert into auth.users values('${user}',now(),false,'beta-balance@example.test');
   set request.jwt.claim.sub='${user}';`);
  for(const file of (await readdir(dir)).filter(file=>file.endsWith('.sql')&&file<=migration).sort()){
   await db.exec(await readFile(new URL(file,dir),'utf8'));
  }
  await db.exec("select public.dv_initialize_account();update public.dv_wallets set earned=200,premium=150;");
  const original=(await db.query("select id,cards from public.dv_booster_purchases36 where currency='starter' order by id")).rows;
  await db.exec('set role authenticated');
  const request='26026026-4260-4260-8260-260260260261';
  const purchase=async()=> (await db.query('select public.dv_buy_beta_booster($1) id',[request])).rows[0].id;
  const id=await purchase();
  assert.equal(await purchase(),id);
  const pack=(await db.query('select cards,product_id,cost from public.dv_booster_purchases36 where id=$1',[id])).rows[0];
  assert.equal(pack.cost,100);
  assert.equal(pack.product_id,'beta');
  assert.equal(validBetaPack(pack.cards),true);
  assert.equal(pack.cards.filter(v=>Object.hasOwn(BETA_BY_ID,getVariant(v).definitionId)).length,1);
  assert.deepEqual((await db.query('select earned,premium from public.dv_wallets')).rows,[{earned:100,premium:150}]);
  const promoted=pack.cards.find(v=>Object.hasOwn(BETA_BY_ID,getVariant(v).definitionId));
  const protectedDeck=[...starterDeck().slice(0,14),promoted];
  const deckId=(await db.query("select public.dv_save_deck(null,'Preview card deck',$1) id",[protectedDeck])).rows[0].id;
  await db.exec('reset role');
  const snapshot=async()=>JSON.stringify({
   packs:(await db.query('select * from public.dv_booster_purchases36 order by id')).rows,
   inventory:(await db.query('select * from public.dv_inventory order by variant_id')).rows,
   acquired:(await db.query('select * from public.dv_card_acquired36 order by variant_id')).rows,
   decks:(await db.query('select * from public.dv_decks order by id')).rows,
   wallets:(await db.query('select * from public.dv_wallets order by user_id')).rows,
   ledger:(await db.query('select * from public.dv_reward_ledger order by event_key')).rows
  });
  const oldSlots=(await db.query("select id,set_number from public.dv_card_definitions where set_id='alpha' order by set_number")).rows;
  const retired=async()=> (await db.query("select id,edition,image from public.dv_card_variants where edition not in ('alpha','beta') order by id")).rows;
  const before=await snapshot(),otherVariants=await retired(),sql=await readFile(new URL(promotion,dir),'utf8');
  await db.exec(sql);await db.exec(sql);
  assert.equal(before,await snapshot());
  assert.deepEqual((await db.query("select id,set_number from public.dv_card_definitions where set_id='alpha' and set_number<=120 order by set_number")).rows,oldSlots);
  assert.deepEqual((await db.query("select id,set_number from public.dv_card_definitions where set_id='alpha' and set_number>120 order by set_number")).rows,
   BETA_CARDS.map((c,i)=>({id:c.id,set_number:121+i})));
  assert.deepEqual((await db.query("select edition,count(*)::int as total from public.dv_card_variants where edition in ('alpha','beta') group by edition order by edition")).rows,
   [{edition:'alpha',total:650}]);
  assert.deepEqual(await retired(),otherVariants);
  assert.deepEqual((await db.query("select id,cards from public.dv_booster_purchases36 where currency='starter' order by id")).rows,original);
  await db.exec('set role authenticated');
  assert.equal(await purchase(),id);
  await assert.rejects(db.query('select public.dv_buy_beta_booster(gen_random_uuid())'),/preview sales are closed/);
  assert.deepEqual((await db.query('select cards from public.dv_decks where id=$1',[deckId])).rows[0].cards,protectedDeck);
  assert.deepEqual((await db.query('select earned,premium from public.dv_wallets')).rows,[{earned:100,premium:150}]);
  let revealRuns=0;
  assert.equal((await prepareManualOpening({cards:pack.cards,product:'beta',active:()=>true,save:async()=>{
   revealRuns++;await db.query('select public.dv_open_alpha_booster58($1)',[id]);
  }})).savedSlots.length,5);
  assert.equal(revealRuns,1);
  assert.equal((await db.query('select revealed_slots from public.dv_booster_purchases36 where id=$1',[id])).rows[0].revealed_slots.length,5);
  await db.exec("reset role;update public.dv_wallets set earned=5000;select setseed(0.23)");
  await db.exec('set role authenticated');
  let drewPromoted=false;
  for(let i=0;i<50&&!drewPromoted;i++){
   const alpha=(await db.query("select public.dv_buy_alpha_booster(gen_random_uuid(),'pixels') id")).rows[0].id;
   const {cards}= (await db.query('select cards from public.dv_booster_purchases36 where id=$1',[alpha])).rows[0];
   assert.ok(validAlphaPack(cards));
   drewPromoted=cards.some(v=>Object.hasOwn(BETA_BY_ID,getVariant(v).definitionId));
  }
  assert.equal(drewPromoted,true);
 }finally{await db.close();}
});
