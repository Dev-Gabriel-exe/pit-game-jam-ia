/* PIT V5 D1c — small, opt-in authenticated browser adapter.
 * Never reads/writes localStorage, cookies, usernames or URLs for tokens.
 * No import from legacy V3. Test staging config is injected on localhost only.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PIT_V5_D1C_CLIENT=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 const endpointNames={
  duel:'duel-v2-lab',match:'duel-match-v2-lab',teacher:'duel-teacher-v2-lab'
 };
 function endpoint(value,suffix){
  if(typeof value!=='string')throw Error('Endpoint de laboratório ausente');
  const url=new URL(value);
  if(!['https:','http:'].includes(url.protocol)||
   (url.protocol==='http:'&&!['localhost','127.0.0.1'].includes(url.hostname))||
   url.username||url.password||url.hash||url.search||url.pathname!=='/api/'+suffix)
   throw Error('Endpoint seguro de homologação inválido');
  return url;
 }
 function failure(message,status){
  const e=Error(message);e.status=status;return e;
 }
 function createClient({duelEndpoint,matchEndpoint,tokenProvider,
   transport=globalThis.fetch}={}){
  const duel=endpoint(duelEndpoint,endpointNames.duel);
  const match=endpoint(matchEndpoint,endpointNames.match);
  if(duel.origin!==match.origin)
   throw Error('Convites e partidas precisam do mesmo servidor de homologação');
  if(typeof tokenProvider!=='function'||typeof transport!=='function')
   throw Error('Sessão autenticada de teste obrigatória');
  let sent=0;
  async function send(base,action,payload=null){
   const token=await tokenProvider();
   if(typeof token!=='string'||!/^[0-9a-f]{64}$/i.test(token))
    throw failure('Sessão de teste inválida.',401);
   const url=new URL(base.toString());
   url.searchParams.set('action',action);
   const method=payload===null?'GET':'POST';
   if(method==='GET'&&action==='replay'&&typeof arguments[3]==='string')
    url.searchParams.set('inviteId',arguments[3]);
   const opts={method,credentials:'omit',redirect:'error',cache:'no-store',
    referrerPolicy:'no-referrer',
    headers:{'X-PIT-Student-Token':token,
     ...(method==='POST'?{'Content-Type':'application/json'}:{})},
    ...(method==='POST'?{body:JSON.stringify(payload)}:{})
   };
   sent++;
   let res;
   try{res=await transport(url.toString(),opts)}
   catch{throw failure('Servidor de homologação indisponível.',503)}
   const body=await res.json().catch(()=>null);
   if(!res.ok||body?.ok!==true)
    throw failure(typeof body?.error==='string'&&body.error.length<250?
     body.error:'Operação não concluída.',res.status||500);
   return body.result??body.match;
  }
  return Object.freeze({
   state:()=>send(duel,'state'),
   available:value=>send(duel,'available',{available:value}),
   invite:id=>send(duel,'invite',{targetId:id}),
   accept:id=>send(duel,'accept',{inviteId:id}),
   decline:id=>send(duel,'decline',{inviteId:id}),
   cancel:id=>send(duel,'cancel',{inviteId:id}),
   matchStart:id=>send(match,'start',{inviteId:id}),
   get sent(){return sent}
  });
 }
 function createTeacherClient({teacherEndpoint,keyProvider,transport=globalThis.fetch}={}){
  const teacher=endpoint(teacherEndpoint,endpointNames.teacher);
  if(typeof keyProvider!=='function'||typeof transport!=='function')
   throw Error('Chave de professor e transporte obrigatórios');
  async function request(value){
   const key=await keyProvider();
   if(typeof key!=='string'||!/^[a-f0-9]{64}$/i.test(key))
    throw failure('Credencial de laboratório inválida.',401);
   const isPost=typeof value==='boolean';
   let response;
   try{
    response=await transport(teacher.toString(),{
     method:isPost?'POST':'GET',
     headers:{'X-PIT-V5-Teacher-Lab-Key':key,
      ...(isPost?{'Content-Type':'application/json'}:{})},
     ...(isPost?{body:JSON.stringify({enabled:value})}:{}),
     credentials:'omit',redirect:'error',cache:'no-store',referrerPolicy:'no-referrer'
    });
   }catch{throw failure('Servidor docente indisponível.',503)}
   const data=await response.json().catch(()=>null);
   if(!response.ok||data?.ok!==true)
    throw failure(data?.error||'Controle não disponível.',response.status||500);
   return data.state;
  }
  return Object.freeze({state:()=>request(),setEnabled:value=>request(value)});
 }
 return Object.freeze({createClient,createTeacherClient});
});
