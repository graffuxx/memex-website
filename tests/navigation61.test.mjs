import test from 'node:test';import assert from 'node:assert/strict';
import {canReturnWithinSite} from '../public/game/platform/navigation61.mjs';
const currentUrl='https://www.memexduelverse.com/decks';
test('back returns through real site history, including collection and sandbox variants',()=>{
 for(const referrer of ['https://www.memexduelverse.com/account/private','https://www.memexduelverse.com/collection','https://www.memexduelverse.com/decks?test=1'])assert.equal(canReturnWithinSite({historyLength:3,referrer,currentUrl}),true);
});
test('direct entry, external referrals, malformed URLs and same-page/hash history use the safe fallback',()=>{
 for(const data of [{historyLength:1,referrer:'https://www.memexduelverse.com/collection'},{historyLength:3,referrer:''},{historyLength:8,referrer:'https://search.example/results'},{historyLength:2,referrer:currentUrl+'#cards'},{historyLength:2,referrer:'bad-url'},{historyLength:2,referrer:'https://www.memexduelverse.com.evil.example/collection'}])assert.equal(canReturnWithinSite({...data,currentUrl}),false);
});
