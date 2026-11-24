import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';
import {random96} from '../server/game/bot96.mjs';
import {starterDeck} from '../public/game/platform/catalog.mjs';
import {createMatchHandler90} from '../server/game/match-handler90.mjs';
import {chooseTactic,legalCandidates} from '../public/game/src/tactics-ai.mjs';
const uid=n=>'96969696-9696-4696-8696-'+String(n).padStart(12,'0'),a=uid(1),b=uid(2),c=uid(3);
import {abilityMarkers} from '../public/game/src/ability-effects.mjs';
import {placeEffect,preferredDrawIndex} from '../public/game/src/table-demo-rules.mjs';
import {scores} from '../public/game/src/rules.mjs';
async function setup(skip98=false){const db=new PGlite();await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz,is_anonymous boolean default false,email text,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users(id,email_confirmed_at,email) values('${a}',now(),'a96@example.test'),('${b}',now(),'b96@example.test'),('${c}',now(),'c96@example.test');`);
for(const f of (await fs.readdir(new URL('../supabase/migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')&&(!skip98||f<'202611210005_random_progress98.sql')).sort())await db.exec(await fs.readFile(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'));for(const u of [a,b,c])await db.exec(`set request.jwt.claim.sub='${u}';select public.dv_initialize_account();`);return db;}
async function rpc(db,name,args){const p=Object.entries(args);return (await db.query('select public.'+name+'('+p.map(([k],i)=>k+'=> $'+(i+1)).join(',')+') data',p.map(([,v])=>v&&typeof v==='object'?JSON.stringify(v):v))).rows[0].data;}
test('Full Random abilities persist through queue, IS-MCTS, private draws and rewards from both starters',async t=>{
 const db=await setup();
 try {
  const report=[];
  let nextId=3000;
  for(const [who,user,starter,seed] of [['a',a,0,93],['b',b,1,505],['c',c,1,878]]){
   const deckId=(await db.query('select id from public.dv_decks where user_id=$1',[user])).rows[0].id;
   {
    const cards=['two-buttons:common','is-this-a-pigeon:common','sparta-kick:common',...starterDeck().slice(0,12)];
    await db.query('insert into public.dv_inventory(user_id,variant_id,quantity) select $1,id,1 from unnest($2::text[]) ids(id) on conflict do nothing',[user,cards]);
    await db.query('update public.dv_decks set cards=$2::text[] where id=$1',[deckId,cards]);
   }
   let time=Date.now();
   const handler=createMatchHandler90({
    env:key=>({SUPABASE_URL:'https://random.test',SUPABASE_SERVICE_ROLE_KEY:'isolated-test'})[key],
    now:()=>time,seed:()=>seed,requestId:()=>uid(nextId++),
    fetcher:async(url,opt)=>{
     if(url.endsWith('/auth/v1/user'))return Response.json({id:user,email_confirmed_at:'2026-11-21'});
     try{
      await db.exec('reset role;set role service_role');
      return Response.json(await rpc(db,url.split('/').at(-1),JSON.parse(opt.body)));
     }catch(e){return Response.json({message:e.message,code:e.code},{status:400});}
    }
   });
   async function call(body){
    const r=await handler(new Request('https://memex.test/api/duel',{method:'POST',headers:{Authorization:'Bearer '+who,'Content-Type':'application/json'},body:JSON.stringify(body)}));
    const payload=await r.json();
    assert.equal(r.status,200,JSON.stringify(payload));
    return payload;
   }
   let x=await call({op:'join',kind:'random',deckId});
   const {id}=x;
   async function saved(){
    await db.exec('reset role');
    return (await db.query('select state from public.dv_pvp90 where id=$1',[id])).rows[0].state;
   }
   async function poll(){return call({op:'poll',id});}
   async function move(move){
    const req={op:'move',id,version:x.version,requestId:uid(nextId++),move};
    const response=await call(req);
    assert.equal((await call(req)).version,response.version);
    return response;
   }
   assert.equal(x.phase,'waiting');
   await db.exec('reset role');
   await db.query("update public.dv_pvp90 set created_at=now()-interval '34 seconds' where id=$1",[id]);
   assert.equal((await poll()).phase,'waiting');
   await db.exec('reset role');
   await db.query("update public.dv_pvp90 set created_at=now()-interval '36 seconds' where id=$1",[id]);
   x=await poll();
   assert.equal(x.opponentType,'ai');assert.equal(x.opponentEngine.name,'IS-MCTS');assert.equal(x.rated,true);
   let authoritative=await saved();
   time=authoritative.bot96.nextAt;
   x=await poll();
   assert.equal(x.opponentChosen,true);
   const botGesture=Math.floor(random96(seed^Math.imul(37+101,2654435761))()*3);
   x=await move({kind:'gesture',value:['paper','scissors','rock'][botGesture]});
   assert.equal(x.rpsWinner,0);
   x=await move({kind:'starter',side:starter});
   const rounds=[];
   let botMoves=0;
   const draws=[0,0],abilities=[new Set(),new Set()];
   for(let steps=0;x.phase!=='ended'&&steps<260;steps++){
    const prev=x;
    authoritative=await saved();
    if(x.phase==='between'){
     // Use the actual round-break timeout to exercise automatic continuation.
     time=authoritative.deadline;
     x=await poll();
     assert.equal(x.phase,'play');
     assert.equal(x.round,prev.round+1);
     assert.equal(x.game.starter,1-prev.game.starter);
     assert.equal(x.game.last,null);
    }else{
     assert.equal(x.phase,'play');
     assert.equal(x.game.finalGuard,true);
     assert.equal(x.game.abilityTrial,true);
     assert.equal(x.game.iconicAbilityWave,7);
     assert.equal(x.game.allPrimes,true);
     assert.equal(x.game.eventFieldsEnabled,false);
     if(x.game.pendingDraw){
      const side=x.game.pendingDraw.side;
      if(side===0){
       assert.equal(x.game.pendingDraw.options.length,2);
       time+=1000;
       x=await move({kind:'draw',index:1});
      }else{
       assert.equal(x.game.pendingDraw.options,undefined);
       const opts=authoritative.game.players[1].deck.slice(0,2);
       time=authoritative.bot96.nextAt;
       assert.ok(time<authoritative.deadline);
       x=await poll();
       const afterDraw=await saved();
       assert.equal(afterDraw.game.players[1].hand.at(-1).uid,opts[preferredDrawIndex(opts)].uid);
      }
      assert.equal(x.game.placements,prev.game.placements);
      assert.equal(x.game.turn,1-side);
      assert.equal(x.game.pendingDraw,undefined);
      assert.deepEqual(x.game.board,prev.game.board);
      draws[side]++;
      continue;
     }
     if(x.game.turn===0){
      time+=1000;
      const available=legalCandidates(x.game);
      const played=chooseTactic(x.game,{policy:'position'}).chosen;
      let choice=available.find(c=>!draws[0]&&c.plan.ability==='buttons')
       ?? available.find(c=>c.plan.phalanx||c.plan.decoy)
       ?? played;
      if(x.game.placements===17){
       // When a guarded move is as strong as our first choice, exercise that visible preview.
       choice=legalCandidates(x.game).find(c=>c.plan.finalGuard&&c.plan.flips.length>=choice.plan.flips.length)??choice;
       if(choice.plan.finalGuard)assert.equal(abilityMarkers(x.game,choice.plan).find(m=>m.kind==='final-guard')?.preview,true);
      }
      x=await move({kind:'place',action:choice.action});
     }else{
      time=authoritative.bot96.nextAt;
      x=await poll();
      const searched=await saved();
      assert.notEqual(searched.bot96.search135.reason,'invalid-belief-fallback');
      if(prev.game.placements===17){
       assert.equal(searched.bot96.search135.reason,'exact-final-move');
       const legal=legalCandidates(authoritative.game);
       assert.equal(x.game.last.flips.length,Math.max(...legal.map(c=>c.plan.flips.length)));
      }
      botMoves++;
     }
     assert.equal(x.game.placements,prev.game.placements+1);
     if(x.game.last?.ability)abilities[prev.game.turn].add(x.game.last.ability);
    }
    if(!x.game.finished)assert.equal(x.game.last?.finalGuard,undefined);
    if(x.game.finished&&!prev.game.finished){
     assert.equal(x.game.placements,18);
     const score=scores(x.game);
     assert.equal(score[0]+score[1],18);
     assert.deepEqual(x.results.at(-1),score);
     const marker=abilityMarkers(x.game,null,{finalGuardLabel:'FINAL GUARD'}).find(m=>m.kind==='final-guard');
     if(x.game.last.finalGuard){
      const {cell}=x.game.last.finalGuard;
      assert.equal(x.game.board[cell].controller,x.game.starter);
      assert.deepEqual(marker,{cell,kind:'final-guard',label:'FINAL GUARD'});
      const closed=await saved();
      const unguarded=placeEffect({...closed.step.before,finalGuard:false},closed.step.action);
      assert.equal(unguarded.board[cell].controller,1-x.game.starter);
      const restored=await poll();
      assert.deepEqual(abilityMarkers(restored.game,null),abilityMarkers(x.game,null));
     }else assert.equal(marker,undefined);
     rounds.push({starter:x.game.starter,score,guard:Boolean(marker),winner:x.game.winner});
    }
   }
   assert.equal(x.phase,'ended');assert.equal(Math.max(...x.series.wins),2);
   assert.equal(rounds[0].starter,starter);
   assert.ok(rounds.some(r=>r.starter!==starter));
   const stable=await poll();assert.deepEqual(stable.results,x.results);
   const final=await saved();
   assert.equal(final.bot96.search135.engine,'is-mcts-1');
   const expectedWins=rounds.filter(r=>r.winner===0).length;
   const expectedPixels=rounds.reduce((sum,r)=>sum+(r.winner===0?5:2),0);
   const {earned}=(await db.query('select earned from public.dv_wallets where user_id=$1',[user])).rows[0];
   assert.equal(Number(earned),expectedPixels);
   const {xp}=(await db.query('select coalesce(sum(xp),0) xp from public.dv_profile_progress85 where user_id=$1',[user])).rows[0];
   assert.equal(Number(xp),expectedWins*100);
   const balance=(await db.query('select patch,mode,starter,winner from public.dv_balance_rounds94 where match_id=$1 order by round_no',[id])).rows;
   assert.equal(balance.length,rounds.length);
   assert.ok(balance.every(row=>row.patch.endsWith('-random-full-abilities')&&row.mode==='ai'));
   assert.deepEqual(balance.map(row=>row.starter),rounds.map(round=>round.starter));
   report.push({starter,rounds,botMoves,pixels:expectedPixels,xp:Number(xp),draws,abilities:abilities.map(set=>[...set].sort())});
  }
  assert.ok(report.some(x=>x.starter===0&&x.draws[0]>0));
  assert.ok(report.some(x=>x.starter===1&&x.draws[0]>0));
  t.diagnostic(JSON.stringify(report));
 }finally{await db.close();}
});
