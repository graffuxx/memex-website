import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
import {createPvp90,advancePvp90,projectPvp90} from '../server/game/pvp90.mjs';
import {createAccountDuel,advanceAccountDuel} from '../server/game/engine50.mjs';
import {starterDeck,starterInventory,DEFINITIONS} from '../public/game/platform/catalog.mjs';
import {chooseTactic} from '../public/game/src/tactics-ai.mjs';
import {summarizeBalance94,wilson94,patchKey94} from '../public/game/platform/balance94.mjs';
import {BALANCE_PATCH94,BALANCE_FINGERPRINT94} from '../server/game/balance-version94.mjs';
const a='94949494-9494-4494-8494-949494949401',b='94949494-9494-4494-8494-949494949402',id=n=>'94949494-9494-4494-8494-'+String(n).padStart(12,'0');
const deck={id:id(3),name:'Test',cards:starterDeck()};
const open=s=>advancePvp90(advancePvp90(advancePvp90(s,0,{kind:'gesture',value:'rock'},1),1,{kind:'gesture',value:'scissors'},2),0,{kind:'starter',side:0},3);
function finish(s){while(!s.game.finished)s=advancePvp90(s,s.game.turn,{kind:'place',action:chooseTactic(s.game).chosen.action},4);return s;}
async function database(){const db=new PGlite();await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users(id,email_confirmed_at,email) values('${a}',now(),'owner@example.test'),('${b}',now(),'player@example.test');`);
 for(const f of (await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort())await db.exec(await fs.readFile(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'));
 for(const u of [a,b])await db.exec(`set request.jwt.claim.sub='${u}';select public.dv_initialize_account();`);return db;}
test('version snapshots persist across return rounds and mixed versions cannot masquerade as a clean patch',()=>{
 let s=open(createPvp90([deck,deck],3,0));assert.equal(s.balance.patch,BALANCE_PATCH94);assert.equal(s.balance.fingerprint,BALANCE_FINGERPRINT94);assert.equal(s.balance.roundStartedAt,3);
 const raw=JSON.stringify(s.balance);const client=projectPvp90({id:id(9),host_id:a,guest_id:b,identities:[{},{}],kind:'random',state:s},a);assert.ok(!JSON.stringify(client).includes(raw));assert.ok(!('balance' in client));
 s.balance.fingerprint='old-patch';s=advancePvp90(s,0,{kind:'shift',cell:(awaitableCell(s))},5);assert.equal(s.balance.mixed,true);assert.equal(s.balance.current.fingerprint,BALANCE_FINGERPRINT94);
 const solo=createAccountDuel({deck,inventory:starterInventory(),seed:1,starter:0});solo.balance.fingerprint='old';assert.equal(advanceAccountDuel(solo,{kind:'place',action:chooseTactic(solo.game).chosen.action}).state.balance.mixed,true);
});
function awaitableCell(s){const [q,r]=s.game.block.split(',').map(Number);return [[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]].map(([x,y])=>`${q+x},${r+y}`).find(k=>s.game.board[k]===undefined&&Math.max(...k.split(',').map(Number).map(Math.abs),Math.abs(k.split(',').map(Number).reduce((a,b)=>a+b)))<=2);}
test('round capture survives reshuffle, is idempotent, separates modes, and denies every nonoperator',async()=>{
 const db=await database();try{
  let s=finish(open(createPvp90([deck,deck],3,Date.now())));const first=structuredClone(s),match=id(10);
  await db.query("insert into public.dv_pvp90(id,kind,status,host_id,guest_id,host_deck,guest_deck,state) values($1,'random','matched',$2,$3,$4,$4,$5)",[match,a,b,JSON.stringify(deck),JSON.stringify(s)]);
  await db.query('update public.dv_pvp90 set state=$2 where id=$1',[match,JSON.stringify(s)]);assert.equal((await db.query('select count(*) n from public.dv_balance_rounds94')).rows[0].n,1);
  s=advancePvp90(advancePvp90(s,0,{kind:'ready'},5),1,{kind:'ready'},6);assert.equal(s.round,2);await db.query('update public.dv_pvp90 set state=$2 where id=$1',[match,JSON.stringify(s)]);s=finish(s);await db.query('update public.dv_pvp90 set state=$2 where id=$1',[match,JSON.stringify(s)]);
  const stored=(await db.query('select * from public.dv_balance_rounds94 order by round_no')).rows;assert.equal(stored.length,2);assert.deepEqual(stored[0].snapshot.game.history,first.game.history);assert.equal(stored[0].facts.length,2);assert.equal(stored[0].facts[0].cards.length,15);assert.equal(stored[0].facts.flatMap(s=>s.cards).filter(c=>c.played).length,18);assert.equal(stored[0].patch,BALANCE_PATCH94);
  for(const side of [0,1])assert.equal(stored[0].facts[side].cards.reduce((n,c)=>n+c.flips,0),first.game.history.filter(e=>e.type==='place'&&e.side===side).reduce((n,e)=>n+e.flips.length,0));
  const privateState=finish(open(createPvp90([deck,deck],4,Date.now())));await db.query("insert into public.dv_pvp90(id,kind,status,host_id,guest_id,host_deck,guest_deck,state) values($1,'private','matched',$2,$3,$4,$4,$5)",[id(11),a,b,JSON.stringify(deck),JSON.stringify(privateState)]);
  const abandoned=advancePvp90(open(createPvp90([deck,deck],5,Date.now())),0,{kind:'resign'},4);await db.query("insert into public.dv_pvp90(id,kind,status,host_id,guest_id,host_deck,guest_deck,state) values($1,'random','finished',$2,$3,$4,$4,$5)",[id(12),a,b,JSON.stringify(deck),JSON.stringify(abandoned)]);
  for(const role of ['anon','authenticated','service_role']){await db.exec('set role '+role);for(const table of ['dv_balance_rounds94','dv_balance_admins94'])await assert.rejects(db.query('select * from public.'+table),/permission denied/);await assert.rejects(db.query(`insert into public.dv_balance_admins94(user_id) values('${b}')`),/permission denied/);await db.exec('reset role');}
  await db.exec(`set role authenticated;set request.jwt.claim.sub='${b}'`);await assert.rejects(db.query('select public.dv_balance_dashboard94()'),/Operator access/);await assert.rejects(db.query("select public.dv_balance_archive94('pvp',$1,$2,'random',array[$3::uuid,$4::uuid],now())",[id(99),JSON.stringify(s),a,b]),/permission denied/);await db.exec('reset role');
  await db.query('insert into public.dv_balance_admins94(user_id) values($1)',[a]);await db.exec(`set role authenticated;set request.jwt.claim.sub='${a}'`);
  const report=(await db.query('select public.dv_balance_dashboard94(30,\'random\') data')).rows[0].data;assert.equal(report.total,3);assert.equal(report.rows.filter(r=>r.complete).length,2);assert.ok(!JSON.stringify(report).includes(a));assert.ok(!JSON.stringify(report).includes(b));assert.ok(!JSON.stringify(report).includes('snapshot'));assert.ok(!JSON.stringify(report).includes('invite_code'));
  const summary=summarizeBalance94(report.rows,DEFINITIONS);assert.equal(summary.rounds,2);assert.equal(summary.aborted,1);assert.equal(summary.players,2);assert.equal(summary.matches,1);assert.ok(summary.cards.every(c=>c.signal==='sample'));assert.equal((await db.query("select public.dv_balance_dashboard94(30,'private') data")).rows[0].data.total,1);
  await assert.rejects(db.query("select public.dv_balance_dashboard94(400,'all')"),/Invalid report/);await db.exec('reset role');await db.query('update public.dv_balance_admins94 set enabled=false where user_id=$1',[a]);await db.exec('set role authenticated');await assert.rejects(db.query('select public.dv_balance_dashboard94()'),/Operator access/);
 }finally{await db.close();}
});
test('analytics keeps draws separate and treats cosmetic variants as the same deck without overstating repeated users',()=>{
 const rows=Array.from({length:120},(_,i)=>({id:`pvp:match-${i}:1`,patch:'one',fingerprint:'a',complete:true,winner:i<90?0:1,starter:0,duration:60000,players:['same-human','same-opponent'],seats:[{deck:['doge:epic','pepe:rare:water'],cards:[{id:'doge:epic',drawn:true,played:true,flips:2,recaptured:1,retained:true}]},{deck:['doge:common','pepe:common:water'],cards:[]}]}));
 const s=summarizeBalance94(rows,DEFINITIONS);assert.equal(s.decks.length,1);assert.equal(s.decks[0].winRate,.5);assert.equal(s.cards.find(c=>c.motif==='doge').signal,'sample');assert.equal(s.players,2);assert.equal(s.firstWinRate,.75);assert.ok(wilson94(75,100)[0]>.5);assert.equal(wilson94(0,0),null);
 const draw={...rows[0],winner:null};const d=summarizeBalance94([draw],DEFINITIONS);assert.equal(d.draws,1);assert.equal(d.firstWinRate,null);assert.ok(d.cards.every(c=>c.winRate===null));assert.notEqual(patchKey94(rows[0]),patchKey94({...rows[0],fingerprint:'b'}));
});
