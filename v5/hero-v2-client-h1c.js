/* PIT Game Jam IA — H.1c browser-side API adapter (opt-in, not invoked
 * by the offline preview or the existing V3 page).
 * The caller must provide the student's authenticated token at request time.
 * Never stores, displays, logs, persists or puts a token in a URL.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_HERO_V2_CLIENT=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const actions=Object.freeze({profile:'GET',save:'POST','enter-m5':'POST','lock-m10':'POST'});
 function failure(message,status){const err=Error(message);err.status=status;return err}
 function createClient({endpoint,tokenProvider,transport=globalThis.fetch}={}){
  if(typeof endpoint!=='string'||!/^https:\/\/|^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\//.test(endpoint))
   throw Error('H1c: endpoint HTTPS ou localhost obrigatório');
  const url=new URL(endpoint);
  if(url.username||url.password||url.hash||url.search||!url.pathname.endsWith('/api/hero-v2-lab'))
   throw Error('H1c: endpoint /api/hero-v2-lab sem parâmetros obrigatório');
  if(typeof tokenProvider!=='function'||typeof transport!=='function')
   throw Error('H1c: transporte e sessão autenticada são obrigatórios');
  async function call(action,payload){
   if(!Object.prototype.hasOwnProperty.call(actions,action))
    throw Error('H1c: ação não permitida');
   const token=await tokenProvider();
   if(typeof token!=='string'||!/^[a-f0-9]{64}$/i.test(token))
    throw failure('Sessão do aluno não encontrada. Entre novamente na oficina.',401);
   const method=actions[action];
   if(method==='POST'&&(!payload||typeof payload!=='object'||Array.isArray(payload)))
    throw Error('H1c: payload inválido');
   const headers={'X-PIT-Student-Token':token};
   if(method==='POST')headers['Content-Type']='application/json';
   const target=new URL(url);
   target.searchParams.set('action',action);
   const options={method,headers,credentials:'omit',cache:'no-store',redirect:'error',
    referrerPolicy:'no-referrer'};
   if(method==='POST')options.body=JSON.stringify(payload);
   let response;
   try{response=await transport(target.toString(),options)}
   catch{throw failure('Não foi possível acessar o laboratório de heróis.',503)}
   const body=await response.json().catch(()=>null);
   if(!response.ok||!body?.ok){
    const message=typeof body?.error==='string'&&body.error.length<260?
     body.error:'Solicitação de personagem não concluída.';
    throw failure(message,response.status||500);
   }
   if(!body.profile||body.profile.schemaVersion!==2||!Number.isInteger(body.profile.revision))
    throw Error('H1c: resposta do servidor incompatível');
   return body.profile;
  }
  return Object.freeze({
   profile:()=>call('profile'),
   save:(build,expectedRevision)=>call('save',{expectedRevision,build}),
   enterM5:(expectedRevision)=>call('enter-m5',{expectedRevision}),
   lockM10:(expectedRevision)=>call('lock-m10',{expectedRevision})
  });
 }
 return Object.freeze({createClient});
});
