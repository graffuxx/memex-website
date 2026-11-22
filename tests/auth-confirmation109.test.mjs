import test from 'node:test';
import assert from 'node:assert/strict';
import {signupRedirect109,confirmationLinkFailed109,bindSignupConfirmation109,verifiedConfirmation109} from '../public/game/platform/auth-confirmation109.mjs';
function fixture(){let callback;const queue=[];let stopped=false;return {auth:{onAuthStateChange(cb){callback=cb;return{data:{subscription:{unsubscribe(){stopped=true;}}}};}},event:(event,user)=>callback(event,{user}),queue,schedule:cb=>queue.push(cb),stopped:()=>stopped};}
const verified={id:'new-player',email:' New@Example.test ',email_confirmed_at:'2026-11-22T00:00:00Z',is_anonymous:false};
test('confirmation redirects stay on the website and expired links are recognized in both supported URL forms',()=>{
 assert.equal(signupRedirect109('https://www.memexduelverse.com'),'https://www.memexduelverse.com/account/confirmed');
 assert.equal(confirmationLinkFailed109('https://www.memexduelverse.com/account/confirmed#error=access_denied&error_code=otp_expired'),true);
 assert.equal(confirmationLinkFailed109('https://www.memexduelverse.com/account/confirmed?error_code=otp_expired'),true);
 assert.equal(confirmationLinkFailed109('https://www.memexduelverse.com/account/confirmed'),false);
});
test('a pending registration refreshes exactly once after the matching verified sign-in, outside the auth callback',()=>{
 const f=fixture();let moves=0;bindSignupConfirmation109(f.auth,{getEmail:()=>'new@example.test',onConfirmed:()=>moves++,schedule:f.schedule});
 f.event('SIGNED_IN',verified);f.event('TOKEN_REFRESHED',verified);assert.equal(moves,0);assert.equal(f.queue.length,1);f.queue.shift()();assert.equal(moves,1);f.event('SIGNED_IN',verified);assert.equal(f.queue.length,0);
});
test('unverified, anonymous, unrelated and absent registrations do not redirect; unmount cancels queued navigation',()=>{
 const f=fixture();let pending='',moves=0;const stop=bindSignupConfirmation109(f.auth,{getEmail:()=>pending,onConfirmed:()=>moves++,schedule:f.schedule});
 f.event('INITIAL_SESSION',verified);pending='new@example.test';f.event('SIGNED_IN',{...verified,email_confirmed_at:null});f.event('SIGNED_IN',{...verified,is_anonymous:true});f.event('SIGNED_IN',{...verified,email:'other@example.test'});assert.equal(f.queue.length,0);
 f.event('SIGNED_IN',verified);stop();f.queue.shift()();assert.equal(moves,0);assert.equal(f.stopped(),true);
});
test('confirmation feedback requires a server-verified user and settles on failure instead of hanging',async()=>{
 assert.deepEqual(await verifiedConfirmation109({getUser:async()=>({data:{user:verified},error:null})}),{id:'new-player',email:verified.email});
 for(const user of [null,{...verified,email_confirmed_at:null},{...verified,is_anonymous:true}])assert.equal(await verifiedConfirmation109({getUser:async()=>({data:{user},error:null})}),null);
 await assert.rejects(verifiedConfirmation109({getUser:async()=>({data:{user:null},error:new Error('Expired token')})}),/Expired token/);
 await assert.rejects(verifiedConfirmation109({getUser:()=>new Promise(()=>{})},{timeoutMs:10}),/timed out/);
});
