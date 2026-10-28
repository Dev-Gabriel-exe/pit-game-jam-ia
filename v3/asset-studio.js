/* Asset Studio: AI-guided optional resources with real export/import steps,
   customized to student idea, not a substitute for their creative choices. */
(function(){
'use strict';
const tabs=[
 {id:'image',icon:'✧',label:'PERSONAGEM 2D',title:'Um personagem ou objeto pronto para o Sprite',
  urls:[['Gemini · imagens','https://gemini.google.com/app'],['GDevelop · Asset Store','https://gdevelop.io/asset-store'],['Kenney · CC0','https://kenney.nl/assets']],
  detail:'Peça um personagem ou objeto isolado, com contorno nítido e fundo uniforme/transparente quando disponível. Salve como PNG; remova o fundo manualmente se necessário. Em Objects → + → Sprite → Add a sprite, escolha o PNG e coloque a instância na cena.',
  format:'PNG (ou imagem aceita pelo editor) → Sprite → Instance → Preview',
  purpose:'Asset recomendado para cumprir a Missão 03 em 2D.',
  license:'Gemini tem termos próprios. Kenney fornece pacotes CC0; confira a licença do recurso específico.'},
 {id:'scene',icon:'▣',label:'CENÁRIO / FUNDO',title:'Uma única área visual para começar',
  urls:[['Gemini · imagens','https://gemini.google.com/app'],['GDevelop · Asset Store','https://gdevelop.io/asset-store'],['Kenney · cenários','https://kenney.nl/assets']],
  detail:'Gere uma única imagem de fundo 16:9, com espaço livre onde o personagem aparecerá. Baixe a imagem e importe como Sprite de fundo; coloque a instância atrás dos personagens, em camada/ordem correta.',
  format:'PNG/JPG → Sprite de fundo → instância na cena',
  purpose:'Opcional na Missão 03. Não substitui o objeto interativo, que é o requisito mínimo.',
  license:'Não reproduza imagens de jogos conhecidos sem permissão; prefira uma criação original.'},
 {id:'video',icon:'▶',label:'CENA ANIMADA',title:'Cena cinematográfica curta para introdução ou vitória',
  urls:[['Google Flow','https://labs.google/fx/tools/flow'],['Gemini · imagens','https://gemini.google.com/app']],
  detail:'No Flow, tente criar uma cena de poucos segundos em 16:9 com movimento de câmera simples, sem texto. Para usar como cutscene no GDevelop, exporte MP4, crie objeto Video e selecione Video resource. A reprodução pode precisar de clique do jogador; evite vídeos pesados. Uma imagem estática é o plano B.',
  format:'Vídeo MP4 H.264/AAC → objeto Video → interação para iniciar → Preview',
  purpose:'Extra opcional; não é necessário para concluir a Missão 03.',
  license:'No modo gratuito há créditos e limites de geração, que podem se esgotar ou variar durante a aula.'},
 {id:'music',icon:'♫',label:'TRILHA SONORA',title:'Uma identidade musical para o seu mundo',
  urls:[['Suno · música','https://suno.com/'],['GDevelop · recursos','https://gdevelop.io/asset-store']],
  detail:'No Suno, descreva atmosfera, instrumentos, duração e peça trilha instrumental sem voz. Para uso no GDevelop é necessário obter um arquivo de áudio permitido pelo seu plano, importá-lo como recurso e usar um evento Play a music file. Se não puder baixar a música, use uma faixa permitida do Asset Store.',
  format:'Áudio permitido (AAC/MP3, conforme suporte) → recurso → evento Play a music',
  purpose:'Opcional: a música não precisa estar implementada na Missão 03.',
  license:'No Suno Free, o uso é pessoal/não comercial e downloads podem ser limitados. Não trate isso como licença para lançar um jogo comercial.'},
 {id:'voice',icon:'◉',label:'VOZES / EFEITOS',title:'Uma fala curta ou efeito de interação',
  urls:[['ElevenLabs · vozes e sons','https://elevenlabs.io/'],['GDevelop · sons','https://gdevelop.io/asset-store']],
  detail:'Use ElevenLabs Text to Speech para uma frase curta original ou Sound Effects para um som de ação. Baixe somente se o plano permitir. Importe como recurso e use Play a sound em um evento. O áudio normalmente exige interação anterior no navegador para tocar.',
  format:'WAV/AAC/arquivo compatível → recursos → evento Play a sound',
  purpose:'Extra para Missões 05–08; nesta missão basta conhecer a possibilidade.',
  license:'Plano gratuito do ElevenLabs não inclui licença comercial; conteúdo publicado exige a atribuição definida nos termos.'},
 {id:'3d',icon:'⬡',label:'OBJETO 3D',title:'Um item tridimensional em vez de um Sprite',
  urls:[['Meshy · modelagem 3D','https://www.meshy.ai/'],['GDevelop · modelos','https://gdevelop.io/asset-store']],
  detail:'No Meshy, use Text to 3D, modelo gratuito elegível a download, e exporte GLB quando disponível. No GDevelop, Objects → 3D Model → escolha GLB e posicione uma instância. Se a geração demorar ou impedir download, use um 3D Box (caixa) nativo — ele cumpre a missão sem custo.',
  format:'GLB → objeto 3D Model → cena/instância → Preview. Plano B: 3D Box',
  purpose:'Rota alternativa para alunos que escolheram desenvolver em 3D.',
  license:'Meshy Free tem limites de créditos e downloads; modelos do plano gratuito exigem atribuição CC BY 4.0.'}
];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function context(meta={}){
 const name=String(meta.title||'meu primeiro jogo').slice(0,95);
 const genre=String(meta.genre||'aventura').slice(0,40);
 const role=String(meta.hero||'personagem original').slice(0,100);
 const scene=String(meta.scene||'um cenário simples').slice(0,95);
 const objective=String(meta.objective||'atingir um objetivo').slice(0,95);
 return {name,genre,role,scene,objective};
}
function prompt(index,meta){
 const c=context(meta);
 const lead='Crie um recurso ORIGINAL para um jogo independente do gênero '+c.genre+', intitulado "'+c.name+'". Ambiente: '+c.scene+'. Objetivo do jogador: '+c.objective+'. ';
 switch(tabs[index]?.id){
 case 'image':return lead+'Preciso da arte de '+c.role+' ou de um objeto essencial. Estilo visual coerente, 2D, personagem de corpo inteiro, silhueta reconhecível, posição neutra, iluminação uniforme, centralizado, fundo transparente se disponível, sem letras, sem marca d’água, sem cenário. Proporção quadrada. Não imite personagens existentes.';
 case 'scene':return lead+'Gere uma imagem original de cenário 2D em 16:9, sem personagens, sem letras, com área livre para jogabilidade e espaços claros para colocar objetos; composição em camadas simples, cores coerentes com o gênero e boa leitura visual.';
 case 'video':return lead+'Crie um clipe cinematográfico de 5 a 8 segundos para uma cena de introdução. Movimento lento da câmera revelando '+c.scene+', atmosfera de '+c.genre+', continuidade visual estável, sem diálogo, sem legendas, sem logotipos. 16:9. O clipe será uma cutscene, não o personagem controlável.';
 case 'music':return 'Trilha instrumental original para um jogo de '+c.genre+' chamado "'+c.name+'". Ambiente: '+c.scene+'. Crie um loop musical curto, atmosfera imersiva sem voz nem letra, intensidade baixa a moderada, sem citar artistas ou músicas existentes.';
 case 'voice':return lead+'Gere um efeito sonoro original curto (1 a 3 segundos) para a interação principal ou uma voz em português brasileiro dizendo: "Você conseguiu!". Sem música de fundo, sem nomes de pessoas reais, com áudio limpo e duração curta.';
 case '3d':return lead+'Crie um modelo 3D original e simples de '+c.role+' ou de um objeto do cenário, em estilo low-poly, textura limpa, sem acessórios minúsculos, poucos polígonos, ideal para engine de jogo. Preparar para exportação GLB.';
 default:return lead+'Gere um recurso original compatível com um jogo.';
 }
}
function view(index,meta){
 const d=tabs[index],text=prompt(index,meta);
 return '<section class="ast3-panel"><div class="ast3-panel-head"><span>RECURSO '+String(index+1).padStart(2,'0')+' / 06</span><h4>'+esc(d.title)+'</h4><p>'+esc(d.purpose)+'</p></div>'+
 '<div class="ast3-tools"><span>FERRAMENTAS E ALTERNATIVAS</span><div>'+d.urls.map(([label,url])=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+' ↗</a>').join('')+'</div></div>'+
 '<div class="ast3-prompt"><div class="ast3-prompt-head"><strong>COMANDO PERSONALIZADO PARA COPIAR</strong><button type="button" data-ast3-copy>⧉ COPIAR PROMPT</button></div>'+
 '<p data-ast3-prompt>'+esc(text)+'</p></div>'+
 '<div class="ast3-import"><span>DA FERRAMENTA AO GDEVELOP</span><p>'+esc(d.detail)+'</p><code>'+esc(d.format)+'</code></div>'+
 '<div class="ast3-license"><strong>LIMITES E USO</strong><p>'+esc(d.license)+'</p></div></section>';
}
function render(meta,role='student'){
 const starter=meta?.genre==='3D'?'3d':'image';
 return '<section class="ast3-root" data-ast3-role="'+(role==='teacher'?'teacher':'student')+'" aria-label="Ateliê de assets com inteligência artificial">'+
 '<div class="ast3-heading"><div><span>◈ ATELIÊ DE IA · CRIAÇÃO RÁPIDA</span><h3>Crie o que seu jogo precisa.</h3>'+
 '<p>Escolha um tipo de recurso, copie o prompt adaptado ao seu jogo e utilize uma das ferramentas. <b>Na Missão 03, um único asset visual importado já é suficiente.</b> Música, narração e vídeo podem ser adicionados nas próximas missões.</p></div><span class="ast3-starter">COMECE PELO PERSONAGEM OU OBJETO</span></div>'+
 '<div class="ast3-tabs" role="tablist" aria-label="Tipos de assets">'+tabs.map((t,i)=>'<button type="button" role="tab" id="ast3Tab'+i+'" aria-controls="ast3Panel" aria-selected="'+(i===0?'true':'false')+'" tabindex="'+(i===0?'0':'-1')+'" data-ast3-tab="'+i+'"><span>'+t.icon+'</span> '+t.label+'</button>').join('')+'</div>'+
 '<div id="ast3Panel" role="tabpanel" aria-labelledby="ast3Tab0">'+view(0,meta)+'</div>'+
 '<div class="ast3-fallback"><strong>SE A IA DEMORAR OU ESGOTAR OS CRÉDITOS</strong><p>Use imediatamente um asset do próprio GDevelop ou de uma biblioteca gratuita licenciada, como Kenney. O objetivo da aula não é conseguir um resultado perfeito de IA; é colocar um recurso visível no jogo e executá-lo no Preview. Guarde o nome da ferramenta, a licença e o arquivo utilizado.</p></div></section>';
}
function mount(root,meta={}){
 const container=root||document.querySelector('.ast3-root');if(!container)return;
 const tabsUI=[...container.querySelectorAll('[data-ast3-tab]')],panel=container.querySelector('#ast3Panel');if(!panel)return;
 let current=0;
 function select(i,focus){
  if(i<0||i>=tabs.length)return;
  current=i;panel.setAttribute('aria-labelledby','ast3Tab'+i);
  tabsUI.forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1});
  panel.innerHTML=view(i,meta);
  const copy=panel.querySelector('[data-ast3-copy]');
  if(copy)copy.addEventListener('click',()=>{
   const str=prompt(current,meta);
   if(navigator.clipboard?.writeText)navigator.clipboard.writeText(str).then(()=>{copy.textContent='✓ PROMPT COPIADO';}).catch(()=>{copy.textContent='SELECIONE O TEXTO PARA COPIAR';});
   else copy.textContent='SELECIONE O TEXTO PARA COPIAR';
  });
  if(focus)tabsUI[i].focus();
 }
 tabsUI.forEach((b,i)=>{
  b.addEventListener('click',()=>select(i,false));
  b.addEventListener('keydown',e=>{
   let n=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:e.key==='Home'?0:e.key==='End'?tabs.length-1:null;
   if(n==null)return;e.preventDefault();select(Math.min(tabs.length-1,Math.max(0,n)),true);
  });
 });
 select(0,false);
}
window.PIT_ASSET_STUDIO={render,mount,prompt,tabs};
})();