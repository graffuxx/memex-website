import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createPaymentHandler81} from '../server/payments/handler81.mjs';
import {SUPPORTER_PACKS} from '../public/game/platform/supporter-packs.mjs';
import {DUEL_STICKERS,STARTER_STICKER_SLOTS,stickerSceneLayers,validStickerSlots} from '../public/game/platform/duel-stickers.mjs';
import {portrait85,portraitMotion,title85,unlocked85} from '../public/game/platform/identity85.mjs';
import {boosterCostLabel,validAlphaPack} from '../public/game/platform/alpha-booster36.mjs';

const user='96000001-0000-4000-a000-100000000001';
const other='96000001-0000-4000-a000-100000000002';
const sandbox='https://api-m.sandbox.paypal.com';
const defaultEnv={
 DV_SUPPORTER_SANDBOX_ENABLED:'true',
 DV_SUPPORTER_SANDBOX_USER_ID:user,
 DV_SUPPORTER_SANDBOX_DB_URL:'https://independent-database.test',
 DV_SUPPORTER_SANDBOX_DB_KEY:'test-service-role',
 PAYPAL_ENV:'live',
 PAYPAL_SANDBOX_CLIENT_ID:'sandbox-client',
 PAYPAL_SANDBOX_CLIENT_SECRET:'sandbox-secret',
 PAYPAL_SANDBOX_MERCHANT_ID:'TESTMERCHANT1',
 PAYPAL_SANDBOX_WEBHOOK_ID:'TESTWEBHOOK1'
};
const request=(handler,op,body,token='tester',headers={})=>handler(new Request('https://memex.test/api/support/checkout/'+op,{
 method:body?'POST':'GET',
 headers:{Authorization:'Bearer '+token,...headers},
 ...(body?{body:JSON.stringify(body)}:{})
}),op);

async function seed(){
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);
 for(const f of (await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort())
  await db.exec(await fs.readFile(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'));
 for(const id of [user,other]){
  await db.query('insert into auth.users(id,email_confirmed_at,email) values($1,now(),$2)',[id,id+'@test.invalid']);
  await db.exec(`set role authenticated;set request.jwt.claim.sub='${id}';select public.dv_initialize_account();reset role`);
 }
 return db;
}
const sqlRpc=async(db,name,args)=>Object.values((await db.query(
 `select public.${name}(${Object.keys(args).map((param,i)=>param+'=> $'+(i+1)).join(',')})`,Object.values(args)
)).rows[0])[0];

test('supporter sandbox: all four prices, verified grants, retry recovery and private entitlements',async()=>{
 const db=await seed();
 const orders=new Map(),providerRequests=new Set();let captures=0,verifiedReceiptReads=0;
 const list=(token)=>token==='Bearer tester'?user:other;
 const providerReceipt=entry=>({
  id:entry.id,intent:'CAPTURE',status:entry.status,
  purchase_units:[{...entry.unit,payee:{merchant_id:entry.merchantId},
    ...(entry.status==='COMPLETED'?{payments:{captures:[{id:entry.captureId,status:'COMPLETED',
     final_capture:true,amount:entry.unit.amount}]}}:{})}]
 });
 const fetcher=async(rawUrl,init={})=>{
  const url=new URL(rawUrl),method=init.method??'GET';
  if(url.pathname==='/auth/v1/user')return Response.json({id:list(init.headers.Authorization),email_confirmed_at:'2026-11-28',is_anonymous:false});
  if(url.pathname.startsWith('/rest/v1/rpc/'))return Response.json(await sqlRpc(db,url.pathname.split('/').at(-1),JSON.parse(init.body)));
  if(url.pathname==='/rest/v1/dv_supporter_orders'){
   const keys=['id','user_id','paypal_order_id','environment'];
   const where=[...url.searchParams].filter(([name,value])=>keys.includes(name)&&value.startsWith('eq.'));
   const res=await db.query(`select * from public.dv_supporter_orders where ${where.map(([name],i)=>name+'=$'+(i+1)).join(' and ')}`,where.map(([,value])=>value.slice(3)));
   return Response.json(res.rows);
  }
  assert.equal(url.origin,sandbox);
  if(url.pathname==='/v1/oauth2/token')return Response.json({access_token:'test-token'});
  if(url.pathname==='/v1/notifications/verify-webhook-signature')return Response.json({verification_status:'SUCCESS'});
  if(url.pathname==='/v2/checkout/orders'&&method==='POST'){
   const payload=JSON.parse(init.body),i=orders.size+1,id='SUPPORTORDER'+i;
   assert.equal(init.headers['PayPal-Request-Id'],payload.purchase_units[0].reference_id);
   providerRequests.add(init.headers['PayPal-Request-Id']);
   orders.set(id,{id,status:'CREATED',captureId:'SUPPORTCAPTURE'+i,unit:payload.purchase_units[0],merchantId:'TESTMERCHANT1'});
   return Response.json({id});
  }
  const [,id,capture]=/^\/v2\/checkout\/orders\/([^/]+)(\/capture)?$/.exec(url.pathname);
  const entry=orders.get(id);
  if(capture){assert.equal(entry.status,'APPROVED');assert.ok(init.headers['PayPal-Request-Id']);captures++;entry.status='COMPLETED';}
  else verifiedReceiptReads++;
  return Response.json(providerReceipt(entry));
 };
 const handler=createPaymentHandler81({env:name=>defaultEnv[name],fetcher,product:'supporter'});
 const grants=async (id=user)=>(await db.query("select count(*)::int n from public.dv_booster_purchases36 where user_id=$1 and currency='supporter'",[id])).rows[0].n;
 try{
  const expected=[[500,1,null,null],[2500,3,'Chaos Patron',null],[5000,5,'Rift Keeper',null],[10000,10,'Certified Cash Cow','sticker-make-it-rain']];
  const config=await (await request(handler,'config')).json();
  assert.deepEqual(config.packs.map(p=>[p.cents,p.boosters,p.titleName,p.stickerId]),expected);
  assert.equal(config.environment,'sandbox');
  assert.equal(config.enabled,true);
  assert.equal((await (await request(handler,'config',null,'foreign')).json()).enabled,false);
  assert.equal((await request(handler,'orders',null,'foreign')).status,403);
  assert.equal((await request(handler,'create',{requestId:crypto.randomUUID(),productId:SUPPORTER_PACKS[0].id},'foreign')).status,403);

  let total=0;
  for(const [index,pack] of SUPPORTER_PACKS.entries()){
   const payload={requestId:crypto.randomUUID(),productId:pack.id,boosters:500,cents:1,titleId:'final-boss'};
   const created=await request(handler,'create',payload);
   assert.equal(created.status,200);
   const ids=await created.json();
   assert.deepEqual(await (await request(handler,'create',payload)).json(),ids);
   const provider=orders.get(ids.orderId);
   assert.equal(provider.unit.amount.value,(expected[index][0]/100).toFixed(2));
   assert.equal(provider.unit.items[0].category,'DIGITAL_GOODS');
   assert.equal((await request(handler,'capture',ids)).status,409);
   assert.equal(await grants(),total);
   provider.status='APPROVED';
   provider.merchantId='WRONGMERCHANT';
   assert.equal((await request(handler,'capture',ids)).status,409);
   assert.equal(captures,index);
   provider.merchantId='TESTMERCHANT1';
   const payment=await request(handler,'capture',ids);
   assert.equal(payment.status,200);
   const result=await payment.json();
   assert.deepEqual([result.status,result.boosters,result.portraitId,result.titleId,result.stickerId],['completed',expected[index][1],pack.portraitId,pack.titleId,expected[index][3]]);
   assert.equal(result.packIds.length,expected[index][1]);
   total+=expected[index][1];
   assert.equal(await grants(),total);
   const replay=await (await request(handler,'capture',ids)).json();
   assert.equal(replay.replayed,true);
   assert.deepEqual(replay.packIds,result.packIds);
   const webhook=await request(handler,'webhook',{id:'TESTWEBHOOKEVENT'+index,event_type:'PAYMENT.CAPTURE.COMPLETED',
    resource:{supplementary_data:{related_ids:{order_id:ids.orderId}}}},'provider',{
    'paypal-auth-algo':'SHA256withRSA','paypal-cert-url':'https://cert.test/cert','paypal-transmission-id':'transmission',
    'paypal-transmission-sig':'signature','paypal-transmission-time':'2026-11-28T12:00:00Z'
   });
   assert.equal(webhook.status,200);
   assert.equal(await grants(),total);
   const {rows}=await db.query('select cards,revealed_slots,currency,user_id from public.dv_booster_purchases36 where id=any($1::uuid[])',[result.packIds]);
   for(const row of rows){
    assert.equal(row.user_id,user);
    assert.equal(validAlphaPack(row.cards),true);
    assert.deepEqual(row.revealed_slots,[]);
    assert.equal(boosterCostLabel(row),'Supporter reward');
   }
   await db.exec(`set role authenticated;set request.jwt.claim.sub='${user}'`);
   const identity=await sqlRpc(db,'dv_save_cosmetics87',{p_avatar:pack.portraitId,p_frame:'auto',p_title:pack.titleId??''});
   assert.equal(portrait85(identity.avatarId).name,pack.portraitName);
   assert.equal(portraitMotion(identity.avatarId),pack.motion??undefined);
   assert.equal(title85(identity),expected[index][2]??'');
   assert.equal(unlocked85(portrait85(identity.avatarId),identity),true);
   if(pack.stickerId){
    const sticker=DUEL_STICKERS[pack.stickerId];
    assert.equal(sticker.name,'Make It Rain');
    assert.equal(sticker.motion,'make-it-rain');
    assert.equal(stickerSceneLayers(sticker).filter(layer=>layer.part.startsWith('bill-')).length,6);
    await fs.access(new URL('../public'+sticker.image,import.meta.url));
    const slots=[pack.stickerId,...STARTER_STICKER_SLOTS.slice(1)];
    assert.equal(validStickerSlots(slots),true);
    assert.deepEqual(await sqlRpc(db,'dv_save_sticker_loadout',{p_slots:slots}),slots);
    assert.deepEqual(await sqlRpc(db,'dv_sticker_loadout',{}),slots);
    const listings=await sqlRpc(db,'dv_cosmetic_shop_items',{});
    assert.equal(listings.some(item=>item.id===pack.stickerId),false);
   }
   await db.exec(`set request.jwt.claim.sub='${other}'`);
   if(pack.stickerId)await assert.rejects(
    sqlRpc(db,'dv_save_sticker_loadout',{p_slots:[pack.stickerId,...STARTER_STICKER_SLOTS.slice(1)]}),/locked or unknown/);
   await assert.rejects(sqlRpc(db,'dv_save_cosmetics87',{p_avatar:pack.portraitId,p_frame:'auto',p_title:pack.titleId??''}),/locked or unknown/);
   await db.exec('reset role');
  }
  assert.equal(captures,4);
  assert.equal(providerRequests.size,4);
  assert.ok(verifiedReceiptReads>=16);
  assert.equal(await grants(),19);
  assert.equal(await grants(other),0);
  const {rows}=await db.query('select premium from public.dv_wallets order by user_id');
  assert.ok(rows.every(row=>Number(row.premium)===0));
  for(const role of ['anon','authenticated']){
   await db.exec('reset role;set role '+role);
   await assert.rejects(sqlRpc(db,'dv_prepare_supporter_order',{p_user:user,p_request:crypto.randomUUID(),p_product:'supporter-5',p_environment:'sandbox'}),/permission denied/);
  }
  await db.exec('reset role');
  await assert.rejects(sqlRpc(db,'dv_prepare_supporter_order',{p_user:user,p_request:crypto.randomUUID(),p_product:'supporter-5',p_environment:'live'}),/Invalid test purchase/);
 }finally{await db.close();}
});

test('supporter checkout fails closed without an independent sandbox and never accepts an arbitrary origin',async()=>{
 for(const patch of [{DV_SUPPORTER_SANDBOX_ENABLED:'false'},{DV_SUPPORTER_SANDBOX_DB_URL:'https://vnwvwwukqlbwzqroaqeu.supabase.co/'},{DV_SUPPORTER_SANDBOX_DB_KEY:undefined}]){
  const env={...defaultEnv,...patch};
  const handle=createPaymentHandler81({product:'supporter',env:name=>env[name],fetcher:()=>assert.fail('No external calls allowed')});
  const config=await (await request(handle,'config')).json();
  assert.deepEqual([config.enabled,config.clientId,config.environment],[false,null,'sandbox']);
  assert.equal((await request(handle,'create',{requestId:crypto.randomUUID(),productId:'supporter-5'})).status,503);
 }
 const handler=createPaymentHandler81({product:'supporter',env:n=>defaultEnv[n],fetcher:()=>assert.fail('No external calls allowed')});
 assert.equal((await request(handler,'capture',{id:user,orderId:'FALSEORDER123'},'tester',{Origin:'https://other.test'})).status,403);
});
