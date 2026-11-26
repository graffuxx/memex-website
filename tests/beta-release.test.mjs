import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {BETA_CARDS} from '../public/game/platform/beta-cards.mjs';
import {editionProgress131} from '../public/game/platform/edition-catalog131.mjs';
import {VARIANTS,getVariant,starterDeck,expandGameDeck,validateDeck} from '../public/game/platform/catalog.mjs';
import {validAlphaPack,validBetaPack} from '../public/game/platform/alpha-booster36.mjs';
import {prepareManualOpening} from '../public/game/platform/booster-opening58.mjs';
import {cardAbilityIconMarkup} from '../public/game/src/card-ability-icon.mjs';
import {portalTrialAbility} from '../public/game/platform/deck-bridge.mjs';
import {createPvp90,advancePvp90,projectPvp90} from '../server/game/pvp90.mjs';

const migration='202611260001_beta_preview.sql';
const dir=new URL('../supabase/migrations/',import.meta.url);

test('Beta has ten motifs, equal elements, visible ability icons and fifty playable finishes',async()=>{
 assert.equal(editionProgress131('alpha').released,120);
 assert.equal(editionProgress131('beta').released,10);
 assert.equal(VARIANTS.filter(v=>v.edition==='alpha').length,600);
 const beta=VARIANTS.filter(v=>v.edition==='beta');
 assert.equal(beta.length,50);
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
 test('New duels resolve real Beta actions with starter '+starter,()=>{
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
test('Earned-Pixels pack saves one Beta card, four Alpha Regulars, and charges only once',async()=>{
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
  assert.ok(pack.cards.filter(v=>getVariant(v).edition==='alpha').every(v=>!getVariant(v).definitionId.startsWith('beta-')));
  assert.deepEqual((await db.query('select earned,premium from public.dv_wallets')).rows,[{earned:100,premium:150}]);
  let revealRuns=0;
  assert.equal((await prepareManualOpening({cards:pack.cards,product:'beta',active:()=>true,save:async()=>{
   revealRuns++;await db.query('select public.dv_open_alpha_booster58($1)',[id]);
  }})).savedSlots.length,5);
  assert.equal(revealRuns,1);
  assert.equal((await db.query('select revealed_slots from public.dv_booster_purchases36 where id=$1',[id])).rows[0].revealed_slots.length,5);
  const alpha=(await db.query("select public.dv_buy_alpha_booster(gen_random_uuid(),'pixels') id")).rows[0].id;
  assert.ok(validAlphaPack((await db.query('select cards from public.dv_booster_purchases36 where id=$1',[alpha])).rows[0].cards));
  await assert.rejects(db.query('select public.dv_buy_beta_booster(gen_random_uuid())'),/Not enough Pixels/);
  await db.exec('reset role');
  await db.exec(await readFile(new URL(migration,dir),'utf8'));
  assert.deepEqual((await db.query("select id,cards from public.dv_booster_purchases36 where currency='starter' order by id")).rows,original);
  assert.equal((await db.query("select count(*)::int as n from public.dv_booster_purchases36 where product_id='beta'")).rows[0].n,1);
 }finally{await db.close();}
});
