/* D1c — teacher-only switch, laboratory credentials injected in memory.
 * Never reuses a V3 PIN, student token, cookies or localStorage.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const local=['localhost','127.0.0.1'].includes(location.hostname);
 const settings=window.__PIT_V5_D1C_TEACHER_STAGING;
 let client=null,busy=false,ready=false,enabled=false,updates=0;
 const render=()=>{
  $('enableDuels').disabled=!ready||busy||enabled;
  $('pauseDuels').disabled=!ready||busy||!enabled;
  $('reloadState').disabled=!client||busy;
  $('teacherStatus').textContent=ready?(enabled?'LIBERADOS':'PAUSADOS'):'DESCONECTADO';
 };
 const message=(text,kind='info')=>{
  $('feedback').textContent=text;$('feedback').dataset.kind=kind;
 };
 Object.defineProperty(window,'PIT_V5_D1C_TEACHER',{
  value:Object.freeze({get snapshot(){return {ready,enabled,busy,updates}}}),
  configurable:false,writable:false
 });
 async function request(value){
  if(!client||busy)return;
  busy=true;render();
  try{
   const status=typeof value==='boolean'?
    await client.setEnabled(value):await client.state();
   ready=true;enabled=status.enabled;
   $('updatedAt').textContent=status.updatedAt?
    new Date(status.updatedAt).toLocaleString('pt-BR'):'—';
   updates++;
   message(enabled?'Duelos permitidos neste banco fictício.':
    'Novos convites e partidas pausados neste laboratório.','success');
  }catch(e){message('Controle docente: '+e.message,'error')}
  finally{busy=false;render()}
 }
 $('enableDuels').addEventListener('click',()=>void request(true));
 $('pauseDuels').addEventListener('click',()=>void request(false));
 $('reloadState').addEventListener('click',()=>void request());
 render();
 if(!local||settings?.enabled!==true||typeof settings.keyProvider!=='function'){
  message('Habilitação docente indisponível fora de homologação local.','info');
  return;
 }
 try{
  client=window.PIT_V5_D1C_CLIENT.createTeacherClient({
   teacherEndpoint:settings.teacherEndpoint,
   keyProvider:settings.keyProvider
  });
  void request();
 }catch(e){message('Configuração de teste inválida: '+e.message,'error')}
})();
