import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
import {PORTRAITS85,FRAMES85,TITLES85,progression85,xpAtLevel85,frame85,unlocked85,frameSvg85} from '../public/game/platform/identity85.mjs';
import {starterDeck,starterInventory} from '../public/game/platform/catalog.mjs';
import {createAccountDuel,beginAccountRound,advanceAccountDuel} from '../server/game/engine50.mjs';
import {chooseTactic} from '../public/game/src/tactics-ai.mjs';
const a='85858585-8585-4585-8585-858585858585',b='86868686-8686-4686-8686-868686868686',uuid=n=>'85858585-8585-4585-8585-'+String(n).padStart(12,'0');
test('twenty real starter portraits and earned frame tiers resolve consistently; milestones cannot be equipped early',async()=>{
 assert.equal(PORTRAITS85.filter(p=>!p.quest).length,20);assert.equal(new Set(PORTRAITS85.map(p=>p.id)).size,24);
 for(const p of PORTRAITS85)await fs.access(new URL('../public'+p.image,import.meta.url));
 for(let level=1;level<=1000;level++){assert.equal(progression85(xpAtLevel85(level)).level,level);if(level>1)assert.equal(progression85(xpAtLevel85(level)-1).level,level-1);}
 const identity={xp:0,wins:0,frameId:'auto',owned:[]};assert.equal(frame85(identity).id,'starter');assert.equal(unlocked85(FRAMES85[1],identity),false);
 for(const f of FRAMES85){const state={...identity,xp:xpAtLevel85(f.level)};assert.equal(frame85(state).id,f.id);assert.ok(!frameSvg85(f,f.level).includes('NaN'));}
 assert.equal(frame85({...identity,frameId:'void-200'}).id,'starter');assert.equal(unlocked85(TITLES85[1],identity),false);assert.equal(unlocked85(TITLES85[1],{...identity,wins:1}),false);assert.equal(unlocked85(TITLES85[1],{...identity,skills:{double_flips:50}}),true);
});
test('the identity foundation preserves historic grants, catalog rules and account isolation before the permanent-name rollout',async()=>{
 const db=new PGlite();try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users(id) values('${a}'),('${b}');`);
  const files=(await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort();
  for(const f of files.filter(f=>f<'202611200008_player_identity85.sql'))await db.exec(await fs.readFile(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'));
  for(const u of [a,b])await db.exec(`set request.jwt.claim.sub='${u}';select public.dv_initialize_account();`);
  await db.query("insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values($1,$2,'earned',5)",[a,`game50:${uuid(1)}:1`]);
  await db.exec(await fs.readFile(new URL('../supabase/migrations/202611200008_player_identity85.sql',import.meta.url),'utf8'));
  await db.exec(`set role authenticated;set request.jwt.claim.sub='${a}';`);
  const identity=async()=> (await db.query('select public.dv_identity85() data')).rows[0].data;
  assert.equal((await identity()).xp,100);assert.equal((await identity()).wins,1);
  await assert.rejects(db.query('update public.dv_profile_progress85 set xp=999999'),/permission denied/);
  await assert.rejects(db.query('update public.dv_profiles set display_name=\'Hacked\''),/permission denied/);
  await assert.rejects(db.query("insert into public.dv_cosmetic_ownership(user_id,cosmetic_id,kind) values($1,'void-200','frame')",[a]),/permission denied/);
  const save=(name='Meme Captain',avatar='doge',frame='auto',title='first-flip')=>db.query('select public.dv_save_identity85($1,$2,$3,$4) data',[name,avatar,frame,title]);
  await assert.rejects(save('A','pepe','void-200'),/locked or unknown/);await assert.rejects(save('A','https://evil.test/img'),/locked or unknown/);await assert.rejects(save('A','pepe','auto','final-boss'),/locked or unknown/);await assert.rejects(save(' '.repeat(3)),/visible characters/);await assert.rejects(save('A\nB'),/visible characters/);await assert.rejects(save('A'.repeat(25)),/visible characters/);
  const saved=(await save()).rows[0].data;assert.equal(saved.displayName,'Meme Captain');assert.equal(saved.avatarId,'doge');assert.equal(saved.titleId,'first-flip');assert.equal(saved.xp,100);
  await db.exec(`set request.jwt.claim.sub='${b}';`);assert.equal((await identity()).displayName,'Player');assert.equal((await identity()).xp,0);await assert.rejects(save(),/locked or unknown/);
  await db.exec('reset role');for(const [level,win] of [[1,0],[50,10],[100,100],[150,200],[200,300],[250,400],[300,500]]){await db.query('insert into public.dv_profile_progress85(user_id,xp,wins) values($1,$2,$3) on conflict(user_id) do update set xp=excluded.xp,wins=excluded.wins',[b,xpAtLevel85(level),win]);await db.exec(`set role authenticated;set request.jwt.claim.sub='${b}';`);assert.equal((await identity()).level,level);await save('Milestone','pepe',FRAMES85.find(f=>f.level===level).id,'rookie');await db.exec('reset role');}
  const catalog=(await db.query('select kind,id,min_level,min_wins from public.dv_identity_catalog85')).rows;for(const c of [...PORTRAITS85.filter(p=>!p.quest),...FRAMES85]){const row=catalog.find(r=>r.kind===c.kind&&r.id===c.id);assert.equal(row.min_level,c.minLevel);assert.equal(Number(row.min_wins),c.minWins);}
  await db.exec('set role anon');await assert.rejects(db.query('select public.dv_identity85()'),/permission denied/);await assert.rejects(save(),/permission denied/);
 }finally{await db.close();}
});
test('only finalized, unique verified wins earn XP; return rounds, retry, loss, draw and ordinary currency events cannot multiply it',async()=>{
 const db=new PGlite();try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users(id) values('${a}');`);
  for(const f of (await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort())await db.exec(await fs.readFile(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'));
  await db.exec(`set request.jwt.claim.sub='${a}';select public.dv_initialize_account();`);const deck=(await db.query('select id,name,cards from public.dv_decks')).rows[0];let state=beginAccountRound(createAccountDuel({deck,inventory:starterInventory(),seed:42,starter:0})).state;
  await db.exec('set role service_role');await db.query('select public.dv_game_start50($1,$2,$3)',[a,uuid(20),JSON.stringify(state)]);
  let version=0,request=30,wins=0;for(let round=1;round<=2;round++){
   let result;while(!state.game.finished){result=advanceAccountDuel(state,{kind:'place',action:chooseTactic(state.game).chosen.action});state=result.state;}
   if(result.award===5)wins++;
   const args=[a,uuid(20),version,uuid(request++),JSON.stringify(state),'[]',result.award];await db.query('select public.dv_game_commit50($1,$2,$3,$4,$5,$6,$7)',args);await db.query('select public.dv_game_commit50($1,$2,$3,$4,$5,$6,$7)',args);version++;
   if(round===1){state=advanceAccountDuel(state,{kind:'next'}).state;await db.query('select public.dv_game_commit50($1,$2,$3,$4,$5,$6,$7)',[a,uuid(20),version,uuid(request++),JSON.stringify(state),'[]',0]);version++;}
  }
  await db.exec('reset role');let progress=(await db.query('select xp,wins from public.dv_profile_progress85 where user_id=$1',[a])).rows[0];assert.equal(Number(progress?.xp??0),wins*100);assert.equal(Number(progress?.wins??0),wins);
  await db.query("insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values($1,'refund:5','earned',5),($1,$2,'earned',2),($1,$3,'earned',5) on conflict do nothing",[a,`game50:${uuid(90)}:1`,`game50:${uuid(91)}:1`]);
  // A new trusted win adds exactly one grant; a replay adds none.
  await db.query("insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values($1,$2,'earned',5) on conflict do nothing",[a,`game50:${uuid(91)}:1`]);
  progress=(await db.query('select xp,wins from public.dv_profile_progress85 where user_id=$1',[a])).rows[0];assert.equal(Number(progress.xp),(wins+1)*100);assert.equal(Number(progress.wins),wins+1);
  await db.exec(`set role authenticated;set request.jwt.claim.sub='${a}';`);await assert.rejects(db.query("insert into public.dv_reward_ledger(user_id,event_key,currency,amount) values($1,$2,'earned',5)",[a,`game50:${uuid(92)}:1`]),/permission denied/);
 }finally{await db.close();}
});
