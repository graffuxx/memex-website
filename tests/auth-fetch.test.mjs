import test from 'node:test';
import assert from 'node:assert/strict';
import {withAuthDeadline} from '../public/game/platform/auth-fetch.mjs';

const origin='https://account.example.test';
function waitForAbort(_input,{signal}){
 return new Promise((_,reject)=>{
  if(signal.aborted){reject(signal.reason);return;}
  signal.addEventListener('abort',()=>reject(signal.reason),{once:true});
 });
}

test('a hung signup is aborted without a second email request',async()=>{
 let calls=0;
 const fetch=withAuthDeadline((...args)=>{calls++;return waitForAbort(...args);},origin,{timeoutMs:10});
 await assert.rejects(fetch(origin+'/auth/v1/signup',{method:'POST'}),/timed out/);
 assert.equal(calls,1);
});

test('auth deadlines preserve caller cancellation and leave unrelated requests alone',async()=>{
 const fetch=withAuthDeadline(waitForAbort,origin);
 const controller=new AbortController();
 const request=new Request(origin+'/auth/v1/user',{signal:controller.signal});
 const pending=fetch(request);
 controller.abort(new Error('Cancelled by caller'));
 await assert.rejects(pending,/Cancelled by caller/);

 const init={method:'POST'};
 const nonAuth=withAuthDeadline(async (_url,options)=>{assert.equal(options,init);return new Response('ok');},origin);
 assert.equal(await (await nonAuth(origin+'/rest/v1/decks',init)).text(),'ok');
 assert.equal(await (await nonAuth('https://other.example.test/auth/v1/user',init)).text(),'ok');
});
