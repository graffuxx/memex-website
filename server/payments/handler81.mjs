import {SHARD_PACKS81,shardPack81,moneyCents81} from '../../public/game/platform/shard-packs81.mjs';
import {SUPPORTER_PACKS,supporterPack} from '../../public/game/platform/supporter-packs.mjs';
const PRODUCTION_DB='https://vnwvwwukqlbwzqroaqeu.supabase.co';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,PROVIDER_ID=/^[A-Z0-9]{10,40}$/;
class ShopError extends Error{constructor(status,message){super(message);this.status=status;}}
const fail=(status,message)=>{throw new ShopError(status,message);};
export function createPaymentHandler81({env,fetcher=fetch,product='shards'}){
 const support=product==='supporter';
 const mode=!support&&(env('DV_SHARD_PAYMENT_MODE')||env('PAYPAL_ENV'))==='live'?'live':'sandbox';
 const base=mode==='live'?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com';
 const supabase=support?env('DV_SUPPORTER_SANDBOX_DB_URL')?.replace(/\/$/,''):(env('SUPABASE_URL')||PRODUCTION_DB);
 const key=support?env('DV_SUPPORTER_SANDBOX_DB_KEY'):env('SUPABASE_SERVICE_ROLE_KEY');
 const testUser=env(support?'DV_SUPPORTER_SANDBOX_USER_ID':'DV_SHARD_SANDBOX_USER_ID');
 const ordersTable=support?'dv_supporter_orders':'dv_shard_orders81';
 const packs=support?SUPPORTER_PACKS:SHARD_PACKS81;
 const findPack=support?supporterPack:shardPack81;
 const calls=support
  ?{prepare:'dv_prepare_supporter_order',attach:'dv_attach_supporter_order',complete:'dv_complete_supporter_order'}
  :{prepare:'dv_prepare_shard_order81',attach:'dv_attach_paypal_order81',complete:'dv_complete_shard_order81'};
 const credential=name=>mode==='sandbox'?env('PAYPAL_SANDBOX_'+name):env('PAYPAL_'+name);
 const isolated=()=>{
  if(!support)return true;
  try{
   const db=new URL(supabase);
   return db.protocol==='https:'&&!db.username&&!db.password&&db.pathname==='/'&&!db.search&&!db.hash
    &&db.origin!==new URL(PRODUCTION_DB).origin;
  }catch{return false;}
 };
 const configured=()=>Boolean(key&&isolated()&&credential('CLIENT_ID')&&credential('CLIENT_SECRET')&&credential('MERCHANT_ID'));
 const enabled=()=>env(support?'DV_SUPPORTER_SANDBOX_ENABLED':'DV_SHARD_PAYMENTS_ENABLED')==='true'
  &&configured()&&(mode==='sandbox'?UUID.test(testUser||''):Boolean(credential('WEBHOOK_ID')));
 const headers={'Content-Type':'application/json','Cache-Control':'no-store'};
 const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
 async function json(res){try{return await res.json();}catch{return null;}}
 async function rest(path,options={}){const res=await fetcher(supabase+'/rest/v1/'+path,{...options,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',...options.headers},cache:'no-store'});const body=await json(res);if(!res.ok)fail(res.status===409?409:503,'Payment storage is temporarily unavailable. Your purchase request is saved; retry the same purchase.');return body;}
 const rpc=(name,data)=>rest('rpc/'+name,{method:'POST',body:JSON.stringify(data)});
 async function token(){const res=await fetcher(base+'/v1/oauth2/token',{method:'POST',headers:{Authorization:'Basic '+Buffer.from(credential('CLIENT_ID')+':'+credential('CLIENT_SECRET')).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials',cache:'no-store'});const data=await json(res);if(!res.ok||typeof data?.access_token!=='string')fail(503,'PayPal is temporarily unavailable. Please retry.');return data.access_token;}
 async function paypal(path,{method='GET',body,requestId}={}){const access=await token(),res=await fetcher(base+path,{method,headers:{Authorization:'Bearer '+access,'Content-Type':'application/json',Prefer:'return=representation',...(requestId?{'PayPal-Request-Id':requestId}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store'});return {ok:res.ok,status:res.status,data:await json(res)};}
 function checkOrigin(req){const origin=req.headers.get('origin'),url=new URL(req.url);if(origin&&origin!==url.origin)fail(403,'This payment request is not allowed.');}
 async function account(req){const bearer=req.headers.get('authorization');if(!bearer?.startsWith('Bearer ')||bearer.length>9000)fail(401,support?'Sign in before testing a supporter package.':'Sign in before buying Shards.');const res=await fetcher(supabase+'/auth/v1/user',{headers:{apikey:key,Authorization:bearer},cache:'no-store'}),user=await json(res);if(!res.ok||!UUID.test(user?.id)||user.is_anonymous||!user.email_confirmed_at)fail(401,support?'Sign in with a verified test account.':'Sign in with a verified email address before buying Shards.');return user.id;}
 async function input(req){const text=await req.text();if(text.length>5000)fail(413,'Payment request too large.');try{return JSON.parse(text);}catch{fail(400,'Invalid payment request.');}}
 async function load(id,uid){if(!UUID.test(id))fail(400,'Invalid purchase.');const rows=await rest(ordersTable+'?id=eq.'+id+(uid?'&user_id=eq.'+uid:'')+'&select=*');const order=rows?.[0];if(!order)fail(404,'Purchase not found for this account.');if(order.environment!==mode)fail(409,'This purchase belongs to a different payment environment.');return order;}
 function receipt(order,data){
  if(data?.id!==order.paypal_order_id||data?.intent!=='CAPTURE'||!Array.isArray(data.purchase_units)||data.purchase_units.length!==1)fail(409,'PayPal receipt does not match this purchase.');
  const unit=data.purchase_units[0];if(unit.reference_id!==order.id||unit.custom_id!==order.id||unit.invoice_id!=='DV-'+order.id||unit.amount?.currency_code!==order.currency||moneyCents81(unit.amount?.value)!==order.cents||unit.payee?.merchant_id!==credential('MERCHANT_ID'))fail(409,'PayPal amount, recipient or purchase reference did not match.');
  if(data.status!=='COMPLETED')return null;
  const captures=unit.payments?.captures;if(!Array.isArray(captures)||captures.length!==1)fail(409,'The payment receipt is incomplete. Please contact support.');const capture=captures[0];
  if(capture.status!=='COMPLETED'||capture.final_capture!==true||!PROVIDER_ID.test(capture.id)||capture.amount?.currency_code!==order.currency||moneyCents81(capture.amount?.value)!==order.cents)fail(409,'Payment is not completed for the full purchase amount.');return capture;
 }
 async function fulfill(order){const result=await paypal('/v2/checkout/orders/'+order.paypal_order_id);if(!result.ok)fail(503,'Payment verification is temporarily unavailable. Restore the purchase to retry without paying again.');const capture=receipt(order,result.data);if(!capture)fail(409,'PayPal has not completed this payment yet.');return rpc(calls.complete,{p_user:order.user_id,p_id:order.id,p_paypal:order.paypal_order_id,p_capture:capture.id,p_cents:order.cents,p_currency:order.currency,p_environment:mode});}
 async function webhook(req){
  if(!configured()||(support&&!enabled())||!credential('WEBHOOK_ID'))return reply({error:'Webhook not configured.'},503);
  const raw=await req.text();if(raw.length>100000)return reply({error:'Webhook too large.'},413);let event;try{event=JSON.parse(raw);}catch{return reply({error:'Invalid webhook.'},400);}
  const signature={auth_algo:req.headers.get('paypal-auth-algo'),cert_url:req.headers.get('paypal-cert-url'),transmission_id:req.headers.get('paypal-transmission-id'),transmission_sig:req.headers.get('paypal-transmission-sig'),transmission_time:req.headers.get('paypal-transmission-time'),webhook_id:credential('WEBHOOK_ID'),webhook_event:event};
  if(!Object.values(signature).every(Boolean)||typeof event?.id!=='string')return reply({error:'Missing webhook signature.'},400);
  // Verification is performed by PayPal. Never fetch an arbitrary certificate URL from a request.
  const verified=await paypal('/v1/notifications/verify-webhook-signature',{method:'POST',body:signature});if(!verified.ok||verified.data?.verification_status!=='SUCCESS')return reply({error:'Invalid webhook signature.'},400);
  const resource=event.resource??{};
  if(event.event_type==='PAYMENT.CAPTURE.COMPLETED'){
   const id=resource.supplementary_data?.related_ids?.order_id;if(!PROVIDER_ID.test(id))return reply({ignored:true});const rows=await rest(ordersTable+'?paypal_order_id=eq.'+id+'&environment=eq.'+mode+'&select=*');if(!rows?.[0]||(support&&rows[0].user_id!==testUser))return reply({ignored:true});await fulfill(rows[0]);
  }else if(!support&&['PAYMENT.CAPTURE.REFUNDED','PAYMENT.CAPTURE.REVERSED'].includes(event.event_type)){
   const refund=event.event_type==='PAYMENT.CAPTURE.REFUNDED';let capture=refund?resource.supplementary_data?.related_ids?.capture_id:resource.id;
   if(refund&&!capture)for(const link of resource.links??[]){if(link.rel!=='up'||typeof link.href!=='string')continue;try{const u=new URL(link.href);if(u.origin===base){const m=u.pathname.match(/^\/v2\/payments\/captures\/([A-Z0-9]{10,40})$/);if(m)capture=m[1];}}catch{}}
   if(!PROVIDER_ID.test(capture))return reply({ignored:true});const rows=await rest('dv_shard_orders81?capture_id=eq.'+capture+'&environment=eq.'+mode+'&select=*');if(!rows?.[0])return reply({ignored:true});const order=rows[0],cents=refund?moneyCents81(resource.amount?.value):order.cents;
   if(!cents||cents>order.cents||refund&&(resource.amount?.currency_code!=='EUR'||resource.status!=='COMPLETED'))fail(409,'Refund receipt mismatch.');
   await rpc('dv_adjust_shard_payment81',{p_capture:capture,p_event:refund?'refund:'+resource.id:'reversal:'+event.id,p_kind:refund?'refund':'reversal',p_cents:cents});
  }
  return reply({received:true});
 }
 return async function handle(req,operation){try{
  if(operation==='webhook'){if(req.method!=='POST')return reply({error:'POST required.'},405);return await webhook(req);}
  checkOrigin(req);
  if(operation==='config'){
   let available=enabled();
   if(available&&mode==='sandbox'){try{available=(await account(req))===testUser;}catch{available=false;}}
   return reply({enabled:available,environment:mode,clientId:available?credential('CLIENT_ID'):null,packs});
  }
  if(support&&!enabled())fail(503,'Supporter checkout is available only in the private sandbox.');
  if(!key)fail(503,'Payments are not available yet.');
  const uid=await account(req);
  if(support&&uid!==testUser)fail(403,'This payment test is private.');
  if(operation==='orders'){
   if(req.method!=='GET')fail(405,'GET required.');
   const rewards=support?'boosters,portrait_id,title_id,sticker_id':'shards';
   const orders=await rest(ordersTable+'?user_id=eq.'+uid+'&environment=eq.'+mode+
    '&select=id,request_id,product_id,cents,currency,status,environment,paypal_order_id,created_at,'+rewards+'&order=created_at.desc,id.desc&limit=20');
   return reply({orders});
  }
  if(req.method!=='POST')fail(405,'POST required.');
  if(!enabled())fail(503,'Shard payments are not available yet.');
  if(mode==='sandbox'&&uid!==testUser)fail(403,'This payment test is private.');
  const data=await input(req);
  if(operation==='create'){
   const pack=findPack(data?.productId);
   if(!pack||!UUID.test(data.requestId))fail(400,'Choose a valid package.');
   const order=await rpc(calls.prepare,{p_user:uid,p_request:data.requestId,p_product:pack.id,p_environment:mode});
   const rewardsMatch=support
    ?order.boosters===pack.boosters&&order.portrait_id===pack.portraitId&&order.title_id===pack.titleId&&order.sticker_id===pack.stickerId
    :order.shards===pack.shards;
   if(order.cents!==pack.cents||order.currency!==pack.currency||!rewardsMatch)fail(409,'This package changed. Please refresh the shop.');
   if(order.completed_at)return reply({id:order.id,orderId:order.paypal_order_id,completed:true});if(order.paypal_order_id)return reply({id:order.id,orderId:order.paypal_order_id});
   const item=support?pack.name+' Supporter Pack (Sandbox)':pack.shards+' Duelverse Shards';
   const amount={currency_code:pack.currency,value:(pack.cents/100).toFixed(2)};
   const result=await paypal('/v2/checkout/orders',{method:'POST',requestId:order.id,body:{
    intent:'CAPTURE',
    purchase_units:[{reference_id:order.id,custom_id:order.id,invoice_id:'DV-'+order.id,
     description:'MemeX Duelverse · '+item,
     amount:{...amount,breakdown:{item_total:amount}},
     items:[{name:item,quantity:'1',category:'DIGITAL_GOODS',unit_amount:amount}]}],
    payment_source:{paypal:{experience_context:{brand_name:'MemeX Duelverse',shipping_preference:'NO_SHIPPING',user_action:'PAY_NOW'}}}
   }});
   if(!result.ok||!PROVIDER_ID.test(result.data?.id))fail(503,'PayPal could not open the purchase. Retry the same request.');await rpc(calls.attach,{p_user:uid,p_id:order.id,p_paypal:result.data.id});return reply({id:order.id,orderId:result.data.id});
  }
  if(operation==='capture'){
   const order=await load(data.id,uid);if(!PROVIDER_ID.test(order.paypal_order_id)||data.orderId!==order.paypal_order_id)fail(409,'The payment does not belong to this purchase.');
   const current=await paypal('/v2/checkout/orders/'+order.paypal_order_id);if(!current.ok)fail(503,'Payment verification is unavailable. Please restore this purchase.');receipt(order,current.data);
   if(current.data.status==='APPROVED'){
    const captured=await paypal('/v2/checkout/orders/'+order.paypal_order_id+'/capture',{method:'POST',requestId:order.capture_request_id});
    if(captured.ok)receipt(order,captured.data); // Re-read after any response: a network retry may have already captured it.
   }else if(current.data.status!=='COMPLETED')fail(409,'Approve the payment with PayPal before confirming this purchase.');
   const result=await fulfill(order);return reply(result);
  }
  fail(404,'Unknown payment action.');
 }catch(error){return reply({error:error instanceof ShopError?error.message:'The payment could not be confirmed. Restore your purchase before trying a new one.'},error instanceof ShopError?error.status:503);}};
}
