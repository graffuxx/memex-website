import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('embedded invitations open the top-level lobby only from the same-origin social frame',async()=>{
 const listeners={},navigations=[],frame={contentWindow:{},style:{},setAttribute(){}},location={origin:'https://duelverse.example',assign:url=>navigations.push(url)};
 const window={innerHeight:900,addEventListener:(type,fn)=>{listeners[type]=fn;}};window.top=window;window.self=window;
 vm.runInNewContext(await fs.readFile(new URL('../public/game/platform/social-inbox-host111.mjs',import.meta.url),'utf8'),{window,location,document:{createElement:()=>frame,body:{append(){}}},Object,Number});
 const data={type:'duelverse-social115-lobby',id:'92929292-9292-4292-8292-000000000001',friendName:'A & B'};
 const send=overrides=>listeners.message({origin:location.origin,source:frame.contentWindow,data,...overrides});
 send({origin:'https://untrusted.example'});send({source:{}});send({data:{...data,id:'not-a-match'}});send({data:{...data,friendName:'x'.repeat(25)}});
 assert.deepEqual(navigations,[]);
 send();assert.deepEqual(navigations,['/play?friend=A%20%26%20B']);
 send({data:{type:'duelverse-social111-join',id:data.id}});
 assert.equal(navigations[1],'/game/online.html?match='+data.id);
});
