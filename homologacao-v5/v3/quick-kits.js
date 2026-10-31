'use strict';
/* UI-06 — ZIPs originais de assets, sem dependências nem rede.
 * O projeto GDevelop editável é o starter oficial linkado, NÃO um .json fictício.
 * Cada ZIP contém arquivos binários reais, instruções e manifesto.
 */
(function(){
 const kits=[
  {id:'rpg',name:'Exploração 2D',file:'pit-kit-exploracao-2d.zip',starter:'https://gdevelop.io/game-example/free/starting-top-down',assets:['explorador','mapa-floresta','chave','porta','wav-coleta'],purpose:'Coletar uma chave e abrir a porta no mapa.'},
  {id:'plataforma',name:'Plataforma 2D',file:'pit-kit-plataforma-2d.zip',starter:'https://gdevelop.io/game-example/free/starting-platformer-pixel',assets:['heroina','mapa-plataforma','moeda','checkpoint','wav-vitoria'],purpose:'Mover, saltar e coletar uma moeda antes de concluir a fase.'},
  {id:'puzzle3d',name:'Puzzle 3D',file:'pit-kit-puzzle-3d.zip',starter:'https://gdevelop.io/game-example/free/starting-first-person',assets:['glb-portal','glb-cristal','glb-totem','chave','wav-portal'],purpose:'Encontrar a chave e ativar o portal em primeira pessoa.'},
  {id:'corrida3d',name:'Corrida 3D',file:'pit-kit-corrida-3d.zip',starter:'https://gdevelop.io/game-example/free/starting-3d-driving',assets:['mapa-corrida','piloto','glb-obstaculo','checkpoint','wav-dano'],purpose:'Usar a base de direção e criar um checkpoint com feedback.'}
 ];
 const encoder=new TextEncoder();
 function crc32(bytes){let crc=0xffffffff;for(const b of bytes){crc^=b;for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return(crc^0xffffffff)>>>0}
 function makeZip(entries){
  if(!Array.isArray(entries)||!entries.length||entries.length>1000)throw Error('Quantidade de arquivos inválida');
  const prepared=entries.map(({name,bytes})=>{
   if(typeof name!=='string'||!name||name.startsWith('/')||name.includes('..')||name.includes('\\'))throw Error('Caminho ZIP inseguro');
   if(!(bytes instanceof Uint8Array)||bytes.length>20*1024*1024)throw Error('Arquivo ZIP inválido');
   const nameBytes=encoder.encode(name);if(nameBytes.length>65535)throw Error('Nome ZIP muito longo');
   return{nameBytes,bytes,crc:crc32(bytes)};
  });
  const localSize=prepared.reduce((n,x)=>n+30+x.nameBytes.length+x.bytes.length,0);
  const centralSize=prepared.reduce((n,x)=>n+46+x.nameBytes.length,0);
  if(localSize+centralSize+22>40*1024*1024)throw Error('Kit excede o limite');
  const out=new Uint8Array(localSize+centralSize+22),view=new DataView(out.buffer);
  let p=0;
  const u16=(off,v)=>view.setUint16(off,v,true),u32=(off,v)=>view.setUint32(off,v>>>0,true);
  const offsets=[];
  for(const x of prepared){
   offsets.push(p);
   u32(p,0x04034b50);u16(p+4,20);u16(p+6,0x0800);u16(p+8,0);
   u16(p+10,0);u16(p+12,33);u32(p+14,x.crc);u32(p+18,x.bytes.length);u32(p+22,x.bytes.length);
   u16(p+26,x.nameBytes.length);u16(p+28,0);p+=30;
   out.set(x.nameBytes,p);p+=x.nameBytes.length;out.set(x.bytes,p);p+=x.bytes.length;
  }
  const centralOffset=p;
  for(let i=0;i<prepared.length;i++){
   const x=prepared[i];u32(p,0x02014b50);u16(p+4,20);u16(p+6,20);u16(p+8,0x0800);u16(p+10,0);
   u16(p+12,0);u16(p+14,33);u32(p+16,x.crc);u32(p+20,x.bytes.length);u32(p+24,x.bytes.length);
   u16(p+28,x.nameBytes.length);u16(p+30,0);u16(p+32,0);u16(p+34,0);u16(p+36,0);u32(p+38,0);
   u32(p+42,offsets[i]);p+=46;out.set(x.nameBytes,p);p+=x.nameBytes.length;
  }
  u32(p,0x06054b50);u16(p+4,0);u16(p+6,0);u16(p+8,prepared.length);u16(p+10,prepared.length);
  u32(p+12,p-centralOffset);u32(p+16,centralOffset);u16(p+20,0);
  return out;
 }
 function readme(kit,assets){return [
  'PIT GAME JAM IA V3 — '+kit.name.toUpperCase(),
  '',
  'Kit de assets procedurais originais. Não é um projeto GDevelop pronto.',
  'Starter editável oficial: '+kit.starter,
  'Desafio sugerido: '+kit.purpose,
  '',
  '1. Abra o starter oficial e use a opção de editar no GDevelop.',
  '2. Faça uma cópia do projeto antes de personalizar.',
  '3. PNG: crie Sprite e importe a imagem; cenários exigem colisores.',
  '4. GLB: crie 3D Model; geometria não cria física ou câmera automaticamente.',
  '5. WAV: em Events, adicione a ação de reproduzir som.',
  '6. Configure condições, ações, variáveis e feedback no seu próprio jogo.',
  '7. Execute Preview e verifique pelo menos um caso positivo e um negativo.',
  '8. Salve o projeto editável. A URL do starter pode exigir internet.',
  '',
  'ARQUIVOS:',
  ...assets.map(a=>'- '+a.file+' — '+a.name),
  '',
  'Origem: geradores locais do PIT Game Jam IA (sem mídia de terceiros).',
  'Uso didático; não confunda estes assets com criações de IA para a Missão 06.',
  'Não atribua a este ZIP controles, regras ou projeto editável que não possui.',
  ''
 ].join('\\n').replace(/\\n/g,'\n')}
 async function buildKit(id,api=window.PIT_LIBRARY_API){
  const kit=kits.find(x=>x.id===id);if(!kit)throw Error('Kit desconhecido');
  if(!api||!Array.isArray(api.assets)||typeof api.assetBlob!=='function')throw Error('Biblioteca não carregada');
  const assets=kit.assets.map(id=>{const a=api.assets.find(x=>x.id===id);if(!a)throw Error('Asset ausente: '+id);return a});
  const files=await Promise.all(assets.map(async a=>({name:a.file,bytes:new Uint8Array(await (await api.assetBlob(a)).arrayBuffer())})));
  const manifest={schema:'pit-kit-v1',id:kit.id,starter:kit.starter,description:kit.purpose,files:assets.map(a=>({id:a.id,name:a.file,category:a.cat}))};
  files.push({name:'LEIA-ME.txt',bytes:encoder.encode(readme(kit,assets))});
  files.push({name:'manifest.json',bytes:encoder.encode(JSON.stringify(manifest,null,2)+'\n')});
  return{file:kit.file,bytes:makeZip(files),files:files.map(x=>x.name)};
 }
 function mount(root=document.getElementById('quickKits')){
  if(!root)return;
  const status=root.querySelector('#quickKitStatus');
  for(const btn of root.querySelectorAll('[data-quick-kit]'))btn.addEventListener('click',async()=>{
   btn.disabled=true;const original=btn.textContent;btn.textContent='Montando ZIP…';
   if(status)status.textContent='Preparando '+original+'. Aguarde a geração local dos arquivos.';
   try{const kit=await buildKit(btn.dataset.quickKit);window.PIT_LIBRARY_API.downloadBlob(new Blob([kit.bytes],{type:'application/zip'}),kit.file);if(status)status.textContent=kit.file+' preparado com '+kit.files.length+' arquivos. Confira a pasta de downloads.'}
   catch(e){if(status)status.textContent='Falha ao preparar kit: '+e.message}
   finally{btn.disabled=false;btn.textContent=original}
  });
 }
 window.PIT_QUICK_KITS=Object.freeze({kits,crc32,makeZip,buildKit,mount});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount());else mount();
})();
