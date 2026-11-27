import {createPresence114,sortFriends114,hideSocial114} from '../public/game/platform/presence114.mjs';
import {createInbox111} from '../public/game/platform/social-inbox111.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
const uuid=n=>'92929292-9292-4292-8292-'+String(n).padStart(12,'0'),a=uuid(1),b=uuid(2),c=uuid(3),d=uuid(4);
async function setup(){const db=new PGlite();await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users(id,email_confirmed_at,email) values('${a}',now(),'a92@example.test'),('${b}',now(),'b92@example.test'),('${c}',now(),'c92@example.test'),('${d}',null,'d92@example.test');`);for(const f of (await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort())await db.exec(await fs.readFile(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'));for(const [u,name]of [[a,'Alpha92'],[b,'Beta92'],[c,'Gamma92']]){await user(db,u);await rpc(db,'dv_initialize_account');await rpc(db,'dv_claim_player_name87',{p_name:name});}await user(db,d);await rpc(db,'dv_initialize_account');return db;}
async function user(db,id,role='authenticated'){await db.exec(`reset role;set request.jwt.claim.sub='${id??''}';set role ${role};`);}
async function rpc(db,name,args={}){const p=Object.entries(args);return (await db.query('select public.'+name+'('+p.map(([k],i)=>k+'=> $'+(i+1)).join(',')+') data',p.map(([,v])=>v))).rows[0].data;}
const act=(db,other,action)=>rpc(db,'dv_social_action92',{p_other:other,p_action:action});
async function friendPair(db){await user(db,a);await act(db,b,'request');await user(db,b);await act(db,a,'accept');}
async function decks(db){await db.exec('reset role');return Object.fromEntries((await db.query('select user_id,id from public.dv_decks')).rows.map(r=>[r.user_id,r.id]));}

test('only accepted, unblocked friends see live presence; background, expiry, multiple tabs and logout are accurate',async()=>{const db=await setup();try{
 await friendPair(db);const tab1=uuid(101),tab2=uuid(102);
 await user(db,b);await rpc(db,'dv_presence_ping114',{p_client:tab1,p_visible:true});
 await user(db,a);let list=await rpc(db,'dv_social_list114');assert.equal(list.people[0].presence,'online');
 await assert.rejects(db.query('select * from public.dv_presence114'),/permission denied/);
 await user(db,c);assert.equal((await rpc(db,'dv_social_list114')).people.length,0);const search=await rpc(db,'dv_social_search92',{p_name:'Beta92'});assert.ok(!Object.hasOwn(search,'presence'));await act(db,b,'request');assert.ok((await rpc(db,'dv_social_list114')).people.every(p=>!Object.hasOwn(p,'presence')));
 await user(db,b);await rpc(db,'dv_presence_ping114',{p_client:tab1,p_visible:false});await user(db,a);assert.equal((await rpc(db,'dv_social_list114')).people[0].presence,'away');
 await user(db,b);await rpc(db,'dv_presence_ping114',{p_client:tab2,p_visible:true});await rpc(db,'dv_presence_leave114',{p_client:tab1});await user(db,a);assert.equal((await rpc(db,'dv_social_list114')).people[0].presence,'online');
 // A cannot hide B by presenting B's client ID to its own leave call.
 await rpc(db,'dv_presence_leave114',{p_client:tab2});assert.equal((await rpc(db,'dv_social_list114')).people[0].presence,'online');
 await db.exec('reset role');await db.query("update public.dv_presence114 set seen_at=now()-interval '91 seconds' where user_id=$1",[b]);await user(db,a);assert.equal((await rpc(db,'dv_social_list114')).people[0].presence,'offline');
 await user(db,b);await rpc(db,'dv_presence_ping114',{p_client:tab2,p_visible:true});await rpc(db,'dv_presence_leave114',{p_client:tab2});await user(db,a);assert.equal((await rpc(db,'dv_social_list114')).people[0].presence,'offline');
 await act(db,b,'block');assert.equal((await rpc(db,'dv_social_list114')).people.length,0);
 await user(db,d);await assert.rejects(rpc(db,'dv_presence_ping114',{p_client:tab1,p_visible:true}),/verified/);await user(db,null,'anon');await assert.rejects(rpc(db,'dv_social_list114'),/permission denied/);
 }finally{await db.close();}});
test('presence writes bind to the caller, use server time and cap active clients',async()=>{const db=await setup();try{await user(db,a);const tab=uuid(200);await rpc(db,'dv_presence_ping114',{p_client:tab,p_visible:true});await db.exec('reset role');const first=(await db.query('select seen_at from public.dv_presence114 where user_id=$1',[a])).rows[0].seen_at;await user(db,a);await rpc(db,'dv_presence_ping114',{p_client:tab,p_visible:true});await db.exec('reset role');assert.deepEqual((await db.query('select seen_at from public.dv_presence114 where user_id=$1',[a])).rows[0].seen_at,first);await user(db,a);for(let n=201;n<224;n++)assert.equal(await rpc(db,'dv_presence_ping114',{p_client:uuid(n),p_visible:true}),true);assert.equal(await rpc(db,'dv_presence_ping114',{p_client:uuid(224),p_visible:true}),false);await db.exec('reset role');assert.equal(Number((await db.query('select count(*) n from public.dv_presence114 where user_id=$1',[a])).rows[0].n),24);await db.query("update public.dv_presence114 set seen_at=now()-interval '3 minutes' where user_id=$1",[a]);await user(db,a);assert.equal(await rpc(db,'dv_presence_ping114',{p_client:uuid(224),p_visible:true}),true);}finally{await db.close();}});
test('client presence rotates account leases and preserves a visibility change during an in-flight heartbeat',async()=>{let n=0;const calls=[],pending=[],left=[];const p=createPresence114({makeId:()=>String(++n),send:(id,visible)=>{calls.push([id,visible]);return new Promise(resolve=>pending.push(resolve));},leave:async id=>left.push(id)});p.setUser('a');const first=p.ping(true);await p.ping(false);pending.shift()();await first;assert.deepEqual(calls,[['1',true],['1',false]]);p.setUser('b');pending.shift()();const second=p.ping(true);await p.close();pending.shift()();await second;assert.deepEqual(left,['2']);assert.equal(p.current.owner,null);assert.equal(p.current.client,null);});
test('friend list sorting, network failures and builder suppression preserve privacy and request badges',async()=>{const identity=name=>({displayName:name});let fail=false;const data={people:[{id:'b',identity:identity('Beta'),relationship:'friend',presence:'offline'},{id:'a',identity:identity('Alpha'),relationship:'friend',presence:'online'},{id:'c',identity:identity('Gamma'),relationship:'incoming',presence:'online'}],invites:[]};const inbox=createInbox111({load:async()=>{if(fail)throw Error('offline');return data;}});inbox.setUser('owner');await inbox.refresh();assert.deepEqual(inbox.getSnapshot().friends.map(f=>f.id),['a','b']);assert.equal(inbox.getSnapshot().items.length,1);fail=true;await inbox.refresh();assert.ok(inbox.getSnapshot().friends.every(f=>f.presence==='unknown'));inbox.setUser(null);assert.deepEqual(inbox.getSnapshot().friends,[]);for(const path of['/decks','/decks?test=1','/decks/saved'])assert.equal(hideSocial114(path),true);for(const path of['/','/play','/account/private','/shop'])assert.equal(hideSocial114(path),false);assert.equal(sortFriends114(data.people).length,2);});

test('preset signals stay between accepted friends, rate limits block repeats and old or blocked signals stay hidden',async()=>{
 const db=await setup();
 try{
  const send=(friend,signal)=>rpc(db,'dv_send_friend_signal',{p_friend:friend,p_signal:signal});
  await user(db,a);
  await assert.rejects(send(b,'wave'),/between friends/);
  await friendPair(db);
  await user(db,a);
  await assert.rejects(send(b,'custom message'),/valid friend signal/);
  await send(b,'wave');
  await assert.rejects(send(b,'play'),/Wait before/);
  assert.deepEqual((await rpc(db,'dv_social_list114')).signals,[]);
  await assert.rejects(db.query('select * from public.dv_friend_signals'),/permission denied/);
  await user(db,c);
  assert.deepEqual((await rpc(db,'dv_social_list114')).signals,[]);
  await user(db,b);
  const first=(await rpc(db,'dv_social_list114')).signals[0];
  assert.equal(first.signal,'wave');
  assert.equal(first.identity.displayName,'Alpha92');
  await db.exec("reset role;update public.dv_friend_signals set sent_at=now()-interval '31 seconds'");
  await user(db,a);await send(b,'play');
  await user(db,b);
  const updated=(await rpc(db,'dv_social_list114')).signals;
  assert.equal(updated.length,1);
  assert.notEqual(updated[0].id,first.id);
  assert.equal(updated[0].signal,'play');
  await db.exec("reset role;update public.dv_friend_signals set sent_at=now()-interval '25 hours'");
  await user(db,b);assert.deepEqual((await rpc(db,'dv_social_list114')).signals,[]);
  await user(db,a);await send(b,'gg');
  await user(db,b);await act(db,a,'block');
  assert.deepEqual((await rpc(db,'dv_social_list114')).signals,[]);
  await user(db,a);await assert.rejects(send(b,'wave'),/between friends/);
  await user(db,null,'anon');await assert.rejects(send(b,'wave'),/permission denied/);
 }finally{await db.close();}
});
