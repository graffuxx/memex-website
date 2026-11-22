import test from 'node:test';
import assert from 'node:assert/strict';
import {authErrorMessage108} from '../public/game/platform/auth-errors108.mjs';

test('signup timeouts and empty upstream errors never claim an account or delivered email',()=>{
 for(const error of [{status:504,code:'request_timeout',message:'context deadline exceeded'},{name:'AuthRetryableFetchError',message:'{}'},{message:'{}'},null]){
  const message=authErrorMessage108(error,'register');
  assert.match(message,/Registration could not be confirmed/);
  assert.match(message,/may not have been created/);
  assert.doesNotMatch(message,/check your inbox|email sent|successfully created/i);
 }
});
test('email outages and rate limits have different recovery instructions',()=>{
 assert.match(authErrorMessage108({status:500,message:'{}'},'reset'),/email request could not be completed/);
 assert.match(authErrorMessage108({status:429,message:'rate limit'},'resend'),/Too many attempts/);
 assert.match(authErrorMessage108({code:'over_email_send_rate_limit'},'register'),/wait a minute/);
});
test('unconfirmed email and invalid credentials do not misdiagnose each other',()=>{
 assert.match(authErrorMessage108({code:'email_not_confirmed'}),/Confirm your email/);
 assert.match(authErrorMessage108({code:'invalid_credentials'}),/may not have been created/);
 assert.doesNotMatch(authErrorMessage108({code:'invalid_credentials'}),/Confirm your email/);
 assert.equal(authErrorMessage108(new Error('Passwords do not match.'),'register'),'Passwords do not match.');
});
