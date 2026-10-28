/* M03 — one essential visual asset, two practical routes.
   The later AI multimedia workshop (Flow, Suno, ElevenLabs, Meshy) belongs to M06.
   The limited class time requires a reliable built-in fallback. */
(function(){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tabs=[
 {id:'ai',label:'01 · IMAGEM COM IA',title:'Gemini: criar um único recurso visual',
  url:'https://gemini.google.com/app',
  steps:[
   ['DESCREVER','Use o comando personalizado abaixo para pedir um personagem ou objeto isolado.'],
   ['LIMITAR','Faça uma tentativa rápida. Se demorar ou exigir créditos indisponíveis, passe à rota 02.'],
   ['EXPORTAR','Baixe a imagem, preferencialmente PNG. Fundo transparente ajuda, mas não é obrigatório.'],
   ['IMPORTAR','No GDevelop: Objects → + → Sprite → adicionar animação → Add a Sprite → selecionar arquivo; arraste uma instância para a cena.']],
  caution:'A imagem precisa estar legível. Não gaste a aula inteira tentando corrigir um detalhe de arte.'},
 {id:'built',label:'02 · PLANO B IMEDIATO',title:'GDevelop Asset Store: recurso pronto',
  url:'https://editor.gdevelop.io/',
  steps:[
   ['ESCOLHER','No GDevelop: Objects → + → Asset Store. Procure um personagem ou objeto relacionado ao seu jogo.'],
   ['CONFIRMAR','Selecione um recurso que possa ser utilizado no projeto e confira a licença aplicável.'],
   ['POSICIONAR','Adicione o objeto à cena e arraste uma instância para a área visível.'],
   ['EXECUTAR','Abra o Preview. A presença do objeto na execução é o critério de conclusão.']],
  caution:'Para uma rota 3D, use um 3D Box nativo se não houver modelo pronto. Nesta missão, não é necessário gerar modelos no Meshy.'}
];
function prompt(meta={}){
 const title=String(meta.title||'meu primeiro jogo').slice(0,70);
 const genre=String(meta.genre||'aventura').slice(0,40);
 const hero=String(meta.hero||'personagem original').slice(0,85);
 const scene=String(meta.scene||'um cenário simples').slice(0,90);
 return 'Crie a arte ORIGINAL de '+hero+' para um jogo '+genre+' chamado "'+title+'". Ambiente do jogo: '+scene+'. Um único personagem ou objeto 2D, centralizado, vista clara, contorno nítido, estilo visual consistente, sem texto, sem logotipo, sem outras pessoas, fundo transparente se possível, proporção quadrada. Preciso importar a imagem como Sprite no GDevelop. Não copie personagens famosos.';
}
function panel(i,meta){
 const data=tabs[i];
 return '<div class="ast3-min-panel"><div class="ast3-min-head"><small>ROTA '+(i+1)+' / 2</small><h4>'+data.title+'</h4></div>'+
 '<ol>'+data.steps.map(([label,body])=>'<li><strong>'+label+'</strong><p>'+body+'</p></li>').join('')+'</ol>'+
 (i===0?'<div class="ast3-min-prompt"><div><b>PROMPT ADAPTADO AO SEU JOGO</b><button type="button" data-ast3-copy>⧉ COPIAR</button></div><p data-ast3-prompt>'+esc(prompt(meta))+'</p></div>':'')+
 '<div class="ast3-min-caution">'+data.caution+'</div>'+
 '<a class="ast3-min-link" href="'+data.url+'" target="_blank" rel="noopener noreferrer">'+(i===0?'ABRIR GEMINI ↗':'ABRIR GDEVELOP ↗')+'</a></div>';
}
function render(meta={},role='student'){
 return '<section class="ast3-min-root ast3-root" data-ast3-role="'+(role==='teacher'?'teacher':'student')+'">'+
 '<div class="ast3-min-title"><span>✦ ATELIÊ DE IA · APENAS UM ASSET</span><h3>Um recurso visual. Um primeiro Preview.</h3>'+
 '<p><b>Ferramentas desta missão: GDevelop e, opcionalmente, Gemini.</b> O Asset Store já está dentro do GDevelop e funciona como alternativa imediata. Não é necessário usar Flow, Suno, ElevenLabs, geradores de música ou modelos 3D nesta etapa.</p></div>'+
 '<div class="ast3-min-tabs" role="tablist" aria-label="Rotas para obter um recurso"><button type="button" role="tab" id="ast3Tab0" aria-controls="ast3Panel" data-ast3-tab="0" aria-selected="true">✧ IMAGEM COM IA</button>'+
 '<button type="button" role="tab" id="ast3Tab1" aria-controls="ast3Panel" data-ast3-tab="1" aria-selected="false">▣ ASSET STORE / 3D BOX</button></div>'+
 '<div id="ast3Panel" role="tabpanel" aria-labelledby="ast3Tab0">'+panel(0,meta)+'</div>'+
 '<footer class="ast3-min-bottom"><b>DECISÃO DE TEMPO</b><span>Se a imagem não estiver pronta em aproximadamente 2 minutos, use o plano B. <strong>Meta obrigatória:</strong> objeto visível no Preview e projeto salvo.</span></footer></section>';
}
function mount(root,meta={}){
 const el=root||document.querySelector('.ast3-root');if(!el)return;
 const controls=[...el.querySelectorAll('[data-ast3-tab]')],panelEl=el.querySelector('#ast3Panel');if(!panelEl)return;
 function select(i,focus){
  const n=i===1?1:0;
  controls.forEach((b,j)=>{b.setAttribute('aria-selected',String(n===j));b.tabIndex=n===j?0:-1});
  panelEl.setAttribute('aria-labelledby','ast3Tab'+n);
  panelEl.innerHTML=panel(n,meta);
  panelEl.querySelector('[data-ast3-copy]')?.addEventListener('click',()=>{
   const b=panelEl.querySelector('[data-ast3-copy]');
   if(navigator.clipboard?.writeText)navigator.clipboard.writeText(prompt(meta)).then(()=>{b.textContent='✓ COPIADO'}).catch(()=>{b.textContent='SELECIONE O TEXTO'});else b.textContent='SELECIONE O TEXTO';
  });
  if(focus)controls[n].focus();
 }
 controls.forEach((b,i)=>{
  b.addEventListener('click',()=>select(i,false));
  b.addEventListener('keydown',e=>{
   const n=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:e.key==='Home'?0:e.key==='End'?1:null;
   if(n===null)return;e.preventDefault();select(Math.max(0,Math.min(1,n)),true);
  });
 });
 select(0,false);
}
window.PIT_ASSET_STUDIO={render,mount,prompt,tabs};
})();