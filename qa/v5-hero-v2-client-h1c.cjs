'use strict';
const assert=require('node:assert/strict');
const {createClient}=require('../v5/hero-v2-client-h1c.js');
const TOKEN='e'.repeat(64),ENDPOINT='https://v5-staging.example.org/api/hero-v2-lab';
const profile={schemaVersion:2,revision:2,build:null,progress:{approvedMissions:3}};
const calls=[];
const transport=async(url,options)=>{
 calls.push({url,options});
 return {ok:true,status:200,json:async()=>({ok:true,profile})};
};
(async()=>{
 assert.throws(()=>createClient({endpoint:'http://evil.invalid/api/hero-v2-lab',
  tokenProvider:()=>TOKEN,transport}),/HTTPS/);
 assert.throws(()=>createClient({endpoint:ENDPOINT+'?token=secret',
  tokenProvider:()=>TOKEN,transport}),/sem parâmetros/);
 assert.throws(()=>createClient({endpoint:'https://staging.example.org/not-an-api',
  tokenProvider:()=>TOKEN,transport}),/endpoint/);
 const api=createClient({endpoint:ENDPOINT,tokenProvider:async()=>TOKEN,transport});
 assert.deepEqual(await api.profile(),profile);
 assert.match(calls[0].url,/\?action=profile$/);
 assert(!calls[0].url.includes(TOKEN)&&!calls[0].url.includes('token='));
 assert.equal(calls[0].options.method,'GET');
 assert.equal(calls[0].options.credentials,'omit');
 assert.equal(calls[0].options.headers['X-PIT-Student-Token'],TOKEN);
 assert.equal(calls[0].options.cache,'no-store');
 const draft={klass:'warrior',attributes:{FOR:2,DES:0,INT:0,VIT:0,DEF:0},talents:['B01']};
 assert.deepEqual(await api.save(draft,2),profile);
 assert.equal(calls[1].options.method,'POST');
 assert.equal(calls[1].options.headers['Content-Type'],'application/json');
 assert.deepEqual(JSON.parse(calls[1].options.body),{expectedRevision:2,build:draft});
 assert.equal(new URL(calls[1].url).searchParams.get('action'),'save');
 await api.enterM5(3);await api.lockM10(6);
 assert.equal(new URL(calls[2].url).searchParams.get('action'),'enter-m5');
 assert.equal(new URL(calls[3].url).searchParams.get('action'),'lock-m10');
 assert.deepEqual(JSON.parse(calls[3].options.body),{expectedRevision:6});
 assert.equal(calls.length,4);
 const invalid=createClient({endpoint:ENDPOINT,tokenProvider:()=>'',transport});
 await assert.rejects(()=>invalid.profile(),e=>e.status===401);
 assert.equal(calls.length,4,'Invalid token must never issue network request');
 const conflict=createClient({endpoint:ENDPOINT,tokenProvider:()=>TOKEN,
  transport:async()=>({ok:false,status:409,json:async()=>({ok:false,error:'Recarregue sua build.'})})});
 await assert.rejects(()=>conflict.save(draft,2),e=>e.status===409&&/Recarregue/.test(e.message));
 const unreachable=createClient({endpoint:ENDPOINT,tokenProvider:()=>TOKEN,
  transport:async()=>{throw Error('internal hostname secret')}});
 await assert.rejects(()=>unreachable.profile(),e=>e.status===503&&!e.message.includes('secret'));
 console.log('PASS V5 H1c browser client: private tokens in headers, API actions, no cookies, safe conflicts and disabled network on invalid token');
})().catch(err=>{console.error(err);process.exitCode=1});
