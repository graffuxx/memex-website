import {createPvp90,advancePvp90,expirePvp90,projectPvp90,refreshPvpRules129} from './pvp90.mjs';
import {BOT_WAIT_MS96,createBot96,armBot96,stepBot96} from './bot96.mjs';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function createMatchHandler90({env,fetcher=fetch,now=()=>Date.now(),seed=()=>crypto.getRandomValues(new Uint32Array(1))[0],requestId=()=>crypto.randomUUID()}){
 const base=env('SUPABASE_URL')||'https://vnwvwwukqlbwzqroaqeu.supabase.co',key=env('SUPABASE_SERVICE_ROLE_KEY');
 const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
 async function rpc(name,input){const r=await fetcher(base+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(input),cache:'no-store'});let data;try{data=await r.json();}catch{fail('Match storage unavailable. Retry your saved duel.',503);}if(!r.ok)fail(data?.message||'Match storage unavailable.',['40001','PT409'].includes(data?.code)?409:r.status>=500?503:400);return data;}
 return async req=>{try{
  if(req.method!=='POST')return reply({error:'POST required.'},405);
  const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)fail('Request not allowed.',403);
  if(!key)fail('Online matchmaking is not available yet.',503);
  const bearer=req.headers.get('authorization');if(!bearer?.startsWith('Bearer ')||bearer.length>9000)fail('Sign in to play online.',401);
  const auth=await fetcher(base+'/auth/v1/user',{headers:{apikey:key,Authorization:bearer},cache:'no-store'}),u=await auth.json();
  if(!auth.ok||!UUID.test(u?.id)||u.is_anonymous||!u.email_confirmed_at)fail('Sign in with a verified email address to play online.',401);
  const raw=await req.text();if(raw.length>3000)fail('Request too large.',413);let input;try{input=JSON.parse(raw);}catch{fail('Invalid match request.');}if(!input||Array.isArray(input))fail('Invalid match request.');
  const uid=u.id;
  if(input.op==='active')return reply(await rpc('dv_match_active112',{p_user:uid}));
  if(input.op==='join'){
   if(!UUID.test(input.deckId)||!['random','private'].includes(input.kind)||input.code!=null&&!/^[a-f0-9]{64}$/.test(input.code))fail('Choose Random or Private with a saved deck. Ranked is coming soon.');
   const id=await rpc('dv_match_join90',{p_user:uid,p_kind:input.kind,p_deck:input.deckId,p_code:input.code??null});const row=await rpc('dv_match_get90',{p_user:uid,p_id:id});return reply(projectPvp90(row,uid,now()));
  }
  if(!UUID.test(input.id))fail('Invalid duel.');
  if(input.op==='leave')return reply(await rpc('dv_match_leave112',{p_user:uid,p_id:input.id}));
  if(input.op==='move'&&input.move?.kind==='resign'){await rpc('dv_match_leave112',{p_user:uid,p_id:input.id});return reply(projectPvp90(await rpc('dv_match_get90',{p_user:uid,p_id:input.id}),uid,now()));}
  if(input.op==='cancel'){await rpc('dv_match_cancel90',{p_user:uid,p_id:input.id});return reply({cancelled:true});}
  let row=await rpc('dv_match_get90',{p_user:uid,p_id:input.id});
  const commit=(state,version=row.version,rid=requestId())=>rpc('dv_match_commit90',{p_user:uid,p_id:row.id,p_version:version,p_request:rid,p_state:state});
  if(input.op==='poll'){
   try{
    if(row.status==='waiting'&&row.kind==='random'&&now()-Date.parse(row.created_at)>=BOT_WAIT_MS96){
     const bot=createBot96(seed());row=await rpc('dv_match_fill_ai96',{p_user:uid,p_id:row.id,p_deck:bot.deck,p_identity:bot.identity});
    }
    if(row.status==='matched'&&!row.state){let initial=createPvp90([row.host_deck,row.guest_deck],seed(),now(),{elementalTrial:row.kind==='private'});if(row.ai_opponent96){initial.bot96={seed:seed(),nextAt:null};initial=armBot96(initial,now());}row=await commit(initial);}
    else if(row.status==='matched'){const upgraded=refreshPvpRules129(row.state,now()),current=upgraded??row.state,expired=expirePvp90(current,now());const next=expired?armBot96(expired,now()):stepBot96(current,now())??upgraded;if(next)row=await commit(next);}
   }catch(e){if(e.status!==409)throw e;row=await rpc('dv_match_get90',{p_user:uid,p_id:input.id});}
   if(Number.isInteger(input.version)&&input.version===row.version&&row.state)return reply({unchanged:true,remainingMs:row.state.deadline?Math.max(0,row.state.deadline-now()):null,wallet:row.wallet});
   return reply(projectPvp90(row,uid,now()));
  }
  if(input.op!=='move'||!Number.isInteger(input.version)||!UUID.test(input.requestId)||!row.state)fail('Invalid turn request.');
  if(input.version!==row.version){row=await commit(row.state,input.version,input.requestId);return reply(projectPvp90(row,uid,now()));}
  const expired=expirePvp90(row.state,now());if(expired){await commit(armBot96(expired,now()));fail('Turn time expired. Restore the current board.',409);}
  const side=row.host_id===uid?0:1,move={...input.move};
  // The browser uses its own side as 0; only the server maps it to the shared board.
  if(move.kind==='starter'){if(![0,1].includes(move.side))fail('Invalid starter.');move.side=side===1?1-move.side:move.side;}
  const next=armBot96(advancePvp90(row.state,side,move,now()),now());row=await commit(next,input.version,input.requestId);return reply(projectPvp90(row,uid,now()));
 }catch(e){return reply({error:e.message||'Online duel unavailable.'},e.status??400);}};
}
