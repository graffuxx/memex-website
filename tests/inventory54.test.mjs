import test from 'node:test';import assert from 'node:assert/strict';
import {loadAllInventory,INVENTORY_PAGE_SIZE} from '../public/game/platform/inventory54.mjs';
import {VARIANTS,validateDeck} from '../public/game/platform/catalog.mjs';
import {createGameHandler} from '../server/game/handler50.mjs';
test('all 2125 owned element/rarity variants load through five keyset pages and validate a late-page deck',async()=>{
 const rows=VARIANTS.map(v=>({variant_id:v.id,quantity:3})).sort((a,b)=>a.variant_id<b.variant_id?-1:1),calls=[];
 const inventory=await loadAllInventory(async(cursor,size)=>{calls.push(cursor);assert.equal(size,INVENTORY_PAGE_SIZE);return rows.filter(r=>cursor===null||r.variant_id>cursor).slice(0,size);});
 assert.equal(calls.length,5);assert.equal(Object.keys(inventory).length,2125);assert.equal(Object.values(inventory).reduce((a,b)=>a+b),6375);
 const deck=[...new Map(rows.slice(1000).map(r=>[r.variant_id.split(':')[0],r.variant_id])).values()].slice(0,15);assert.equal(deck.length,15);assert.ok(validateDeck(deck,inventory).valid);
});
test('inventory loading never returns a silently partial result on later-page errors, duplicates or exact-page boundaries',async()=>{
 const first=Array.from({length:500},(_,i)=>({variant_id:'card-'+String(i).padStart(4,'0'),quantity:1}));let n=0;
 await assert.rejects(loadAllInventory(async()=>++n===1?first:Promise.reject(Error('Network unavailable'))),/Network unavailable/);
 await assert.rejects(loadAllInventory(async()=>first),/Invalid collection page/);
 n=0;assert.equal(Object.keys(await loadAllInventory(async()=>++n===1?first:[])).length,500);assert.equal(n,2);
 await assert.rejects(loadAllInventory(async()=>[{variant_id:'x',quantity:-1}]),/Invalid collection page/);
});
test('game start checks the saved deck directly, including variants beyond the default 1000 inventory rows',async()=>{
 const uid='54545454-5454-4545-8545-545454545454',match='54545454-0000-4000-8000-000000000001',deckId='54545454-0000-4000-8000-000000000002';
 const sorted=VARIANTS.map(v=>v.id).sort(),cards=[...new Map(sorted.slice(1000).map(id=>[id.split(':')[0],id])).values()].slice(0,15),seen=[];
 const handle=createGameHandler({env:key=>({SUPABASE_URL:'https://example.test',SUPABASE_SERVICE_ROLE_KEY:'server-only',SUPABASE_ANON_KEY:'public'})[key],randomSeed:()=>22,fetcher:async(url,options)=>{
  if(url.endsWith('/auth/v1/user'))return Response.json({id:uid});const address=new URL(url);seen.push(address);
  if(address.pathname.endsWith('/dv_game_sessions50'))return Response.json([]);
  if(address.pathname.endsWith('/dv_decks'))return Response.json([{id:deckId,name:'Late-page collection',cards,active:true}]);
  if(address.pathname.endsWith('/dv_inventory')){assert.equal(address.searchParams.get('user_id'),'eq.'+uid);assert.equal(address.searchParams.get('variant_id'),'in.('+cards.join(',')+')');return Response.json(cards.map(variant_id=>({variant_id,quantity:1})));}
  if(address.pathname.endsWith('/rpc/dv_game_start50')){const body=JSON.parse(options.body);return Response.json({id:match,state:body.p_state,version:0});}
  if(address.pathname.endsWith('/dv_wallets'))return Response.json([{earned:4,premium:0,echoes:0}]);throw Error('Unexpected request');
 }});
 const result=await handle(new Request('https://test',{method:'POST',headers:{Authorization:'Bearer valid-test-session'},body:JSON.stringify({op:'start',id:match,deckId,starter:0})}));assert.equal(result.status,200);const data=await result.json();assert.deepEqual(data.state.deck.cards,cards);assert.equal(data.state.game.elementRules,5);assert.equal(data.wallet.pixels,4);assert.equal(seen.filter(u=>u.pathname.endsWith('/dv_inventory')).length,1);
});
