import {createAccountDuel,beginAccountRound,advanceAccountDuel} from './engine50.mjs';
import {DECK_SIZE,getVariant} from '../../public/game/platform/catalog.mjs';
const ALLOWED=new Set(['https://www.memexduelverse.com','https://memexduelverse.com','http://127.0.0.1:4228','http://localhost:4228']);
export function createGameHandler({env,fetcher=fetch,randomSeed=()=>crypto.getRandomValues(new Uint32Array(1))[0]}){
 const url=env('SUPABASE_URL'),key=env('SUPABASE_SERVICE_ROLE_KEY');
 async function rest(path,options={}){const res=await fetcher(url+'/rest/v1/'+path,{...options,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',...options.headers}});const text=await res.text(),data=text?JSON.parse(text):null;if(!res.ok)throw Object.assign(Error(data?.message||'Game storage unavailable.'),{status:data?.code==='40001'?409:res.status>=500?503:400});return data;}
 return async function handle(req){
  const origin=req.headers.get('origin');const cors={'Content-Type':'application/json','Cache-Control':'no-store',Vary:'Origin',...(ALLOWED.has(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS'}:{})};
  const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
  if(origin&&!ALLOWED.has(origin))return reply({error:'Origin not allowed.'},403);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(req.method!=='POST')return reply({error:'POST required.'},405);
  try{
   const bearer=req.headers.get('authorization');if(!bearer?.startsWith('Bearer '))return reply({error:'Sign in to play for Pixels.'},401);
   const auth=await fetcher(url+'/auth/v1/user',{headers:{apikey:env('SUPABASE_ANON_KEY'),Authorization:bearer}});const user=await auth.json();if(!auth.ok||typeof user.id!=='string'||user.is_anonymous)return reply({error:'Sign in to play for Pixels.'},401);
   const text=await req.text();if(text.length>6000)return reply({error:'Request too large.'},413);const input=JSON.parse(text),uid=user.id;
   const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
   const wallet=async()=>{const rows=await rest('dv_wallets?user_id=eq.'+uid+'&select=earned,premium,echoes');if(!rows[0])throw Error('Initialize your player account first.');return {pixels:rows[0].earned,shards:rows[0].premium,echoes:rows[0].echoes};};
   if(input.op==='profile'){
    await rest('rpc/dv_initialize_account',{method:'POST',headers:{Authorization:bearer},body:'{}'});
    const decks=await rest('dv_decks?user_id=eq.'+uid+'&select=id,name,cards,active&order=created_at.asc');return reply({decks,wallet:await wallet()});
   }
   if(input.op==='start'){
    if(!uuid(input.id)||(input.deckId!=null&&!uuid(input.deckId)))throw Error('Invalid duel request.');
    const existing=await rest('dv_game_sessions50?id=eq.'+input.id+'&user_id=eq.'+uid+'&active=eq.true&select=id,state,version');if(existing[0])return reply({...existing[0],steps:[],award:0,wallet:await wallet()});
    const decks=await rest('dv_decks?user_id=eq.'+uid+'&select=id,name,cards,active&order=created_at.asc'),deck=input.deckId?decks.find(d=>d.id===input.deckId):decks.find(d=>d.active)??decks[0];
    if(!Array.isArray(deck?.cards)||deck.cards.length!==DECK_SIZE||deck.cards.some(id=>!getVariant(id)))throw Error('Saved deck is not playable.');
    // Ask for ownership of the saved deck's cards directly. A large collection
    // must not hide a required card behind the database's default 1,000-row cap.
    const params=new URLSearchParams({user_id:'eq.'+uid,select:'variant_id,quantity',variant_id:'in.('+[...new Set(deck.cards)].join(',')+')'});
    const rows=await rest('dv_inventory?'+params),inventory=Object.fromEntries(rows.map(r=>[r.variant_id,r.quantity]));
    const initial=createAccountDuel({deck,inventory,seed:randomSeed(),starter:input.starter,loadouts:input.loadouts});
    const result=beginAccountRound(initial);const saved=await rest('rpc/dv_game_start50',{method:'POST',body:JSON.stringify({p_user:uid,p_id:input.id,p_state:result.state})});return reply({...saved,steps:result.steps,award:0,wallet:await wallet()});
   }
   if(!uuid(input.id))throw Error('Invalid duel.');
   const rows=await rest('dv_game_sessions50?id=eq.'+input.id+'&user_id=eq.'+uid+'&active=eq.true&select=id,state,version,last_request,last_reply');const saved=rows[0];if(!saved)return reply({error:'Duel unavailable. Start a new duel.'},404);
   if(input.op==='resume')return reply({id:saved.id,state:saved.state,version:saved.version,steps:[],award:0,wallet:await wallet()});
   if(input.op!=='action'||!uuid(input.requestId)||!Number.isInteger(input.version))throw Error('Invalid game request.');
   if(saved.last_request===input.requestId)return reply({...saved.last_reply,wallet:await wallet()});
   if(saved.version!==input.version)return reply({error:'Duel changed in another tab. Restore your game.'},409);
   const result=advanceAccountDuel(saved.state,input.move??{});
   const answer=await rest('rpc/dv_game_commit50',{method:'POST',body:JSON.stringify({p_user:uid,p_id:input.id,p_version:input.version,p_request:input.requestId,p_state:result.state,p_steps:result.steps,p_award:result.award})});return reply(answer);
  }catch(e){const status=e.status??(e instanceof TypeError?503:400);return reply({error:e.message==='fetch failed'?'Game server unavailable. Retry your saved move.':e.message},status);}
 };
}
