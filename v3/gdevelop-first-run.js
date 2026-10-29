/* GDevelop first-run — integrated illustrated guide for teacher and student.
   Genuine images are credited screenshots from GDevelop docs; static offline fallback
   is explicitly labeled as a diagram. Avoids dependence on external docs during class. */
(function(){
'use strict';
const steps=[
 {title:'Abrir o GDevelop',kind:'Captura oficial: estrutura do editor',src:'https://wiki.gdevelop.io/gdevelop5/interface/Project-Workspace.png',
  headline:'Esta é a área em que seu projeto será construído.',
  lead:'GDevelop pode ser usado no aplicativo para computador ou no editor web. As abas permitem alternar entre cena, eventos e demais ferramentas; o Preview executa o jogo.',
  actions:[['ABRIR','Acesse o aplicativo instalado ou o editor.gdevelop.io.'],['IDENTIFICAR','Observe as abas do projeto e o botão Preview, geralmente na barra superior.'],['CONFERIR','Se a página mostrar login, use a forma de acesso disponível; o curso não exige conta paga.']],
  expected:'Editor aberto. Ainda não é necessário programar ou publicar.',
  help:'Se o navegador não carregar, tente o aplicativo desktop previamente instalado. Confirme a conexão e as permissões da rede do laboratório.',
  alt:'Captura oficial do espaço de trabalho do GDevelop com cena e botão Preview'},
 {title:'Criar o projeto vazio',kind:'Captura oficial: tela Create',src:'https://wiki.gdevelop.io/gdevelop5/interface/Create-Dashboard-dark.png',
  headline:'Um projeto é o conjunto de cenas, objetos, eventos e recursos.',
  lead:'Na tela inicial, abra a área Create/Criar e escolha criar um novo projeto. Selecione o modelo vazio (Empty game/Blank game) para aprender a estrutura sem receber regras prontas.',
  actions:[['INICIAR','Na tela Create, clique em Create new game / Criar novo jogo (o nome pode variar).'],['ESCOLHER','Use Empty game / Projeto vazio. Evite selecionar um template já funcional.'],['IDENTIFICAR','Nomeie o projeto com o título do seu jogo. Se solicitado, escolha onde salvá-lo: local ou nuvem.']],
  expected:'Projeto vazio aberto, com acesso a cenas e ao gerenciador.',
  help:'Se um template pronto abrir por engano, volte e crie um projeto vazio. Os nomes dos botões podem variar conforme a versão.',
  alt:'Captura oficial da tela Create do GDevelop, com botão Create new game no canto superior direito'},
 {title:'Criar e nomear a cena',kind:'Captura oficial: gerenciador e cena',src:'https://wiki.gdevelop.io/gdevelop5/interface/scene-editor/Objects.png',
  headline:'Scene ≠ Project: a cena é uma tela do seu jogo.',
  lead:'Abra o gerenciador (Project manager) no alto da interface, procure Scenes/Cenas e crie uma cena. Se o projeto já apresentar uma cena, use essa e renomeie-a.',
  actions:[['CRIAR','Em Scenes, selecione Add a scene/Adicionar cena apenas se não houver uma cena útil.'],['RENOMEAR','No menu da cena, escolha Rename/Renomear. Exemplo: CenaInicial ou a área planejada na Missão 02.'],['ABRIR','Clique na cena para entrar no editor visual. Não são necessários múltiplos mapas agora.']],
  expected:'Uma cena inicial aberta com área de trabalho visível.',
  help:'Se a lista Scenes não aparecer, reabra o Project manager. Fechar a aba da cena não significa necessariamente fechar o projeto.',
  alt:'Captura oficial do editor de cenas com o painel de objetos e a interface do GDevelop'},
 {title:'Criar o primeiro objeto',kind:'Captura atual: janela Sprite e botão Adicionar imagem',src:'https://wiki.gdevelop.io/gdevelop5/objects/sprite/adding_an_image_to_the_animation.png',
  headline:'Object é o modelo; Instance é sua cópia na cena.',
  lead:'Na lateral direita, abra Objects / Objetos e pressione + para adicionar um objeto. O caminho mais simples é usar um Sprite da biblioteca (Asset Store), ou um Sprite criado com uma imagem disponível.',
  actions:[['OBJETO','Em Objects, clique em Add new object / +. Escolha um Sprite de Asset Store ou New object from scratch → Sprite.'],['CONFIGURAR','Se criar um Sprite vazio: defina o nome, clique Add an animation (Adicionar animação) e Add a sprite (Adicionar imagem), escolha o PNG e finalize em Apply (Aplicar).'],['ALTERNATIVA 3D','Para um projeto 3D, escolha 3D Box ou modelo 3D da biblioteca. A atividade continua sendo criar e posicionar um objeto visível.']],
  expected:'Um objeto nomeado aparece na lista Objects da cena.',
  help:'Sprite sem imagem não aparecerá na cena. Se Asset Store não carregar, use um arquivo de imagem local ou, para 3D, um objeto 3D Box simples.',
  alt:'Captura atual do editor Sprite do GDevelop: nome do objeto, animação, botão Add a sprite destacado e botão Apply'},
 {title:'Colocar a instância na cena',kind:'Captura oficial: cena com objetos',src:'https://wiki.gdevelop.io/gdevelop5/interface/scene-editor/Level.png',
  headline:'Criar o objeto não basta: ele precisa aparecer na cena.',
  lead:'Arraste o objeto da lista Objects para a área visual. Isso cria uma instância. Um único objeto pode ter várias instâncias, cada uma com posição e tamanho próprios.',
  actions:[['ARRASTAR','Localize o objeto em Objects e arraste para o centro visível da cena.'],['POSICIONAR','Selecione sua instância e ajuste a posição. Evite deixá-la fora da área visível da câmera.'],['CONFERIR','Se o objeto aparecer na lista mas não na cena, veja se você realmente criou a instância.']],
  expected:'O objeto fica visível na cena; pode ser selecionado e reposicionado.',
  help:'Se nada aparecer, verifique a imagem do Sprite, visibilidade, zoom, tamanho e a posição em relação à câmera.',
  alt:'Captura oficial de cena do GDevelop com um objeto visual já posicionado na área de jogo'},
 {title:'Executar Preview e salvar',kind:'Captura oficial: barra com Preview',src:'https://wiki.gdevelop.io/gdevelop5/interface/Project-Workspace.png',
  headline:'O primeiro teste não é movimento. É execução.',
  lead:'Preview executa a cena no motor de jogo. Nesta missão, uma imagem ou objeto parado já é um resultado correto. Controle, colisão e regras serão desenvolvidos nas Missões 04 e 05.',
  actions:[['PREVIEW','Na barra superior, clique em Preview / Prévia. Espere abrir uma nova janela ou aba.'],['OBSERVAR','Confirme que o objeto está visível. Registre se apareceu e se houve alguma falha.'],['SALVAR','Salve o projeto e confira seu destino: arquivo/pasta local ou projeto na nuvem. Guarde o nome e confirme que consegue reencontrá-lo.']],
  expected:'Preview aberto com objeto visível e projeto salvo em local identificado.',
  help:'Se Preview ficar vazio, verifique a cena de início, a posição da instância, se há imagem no Sprite e se o objeto está visível. Se a janela for bloqueada, libere pop-ups do editor.',
  alt:'Captura oficial do editor de cenas, incluindo a barra de ferramentas com Preview'}
];
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const localFallback='./v3/assets/guide/gdevelop-inicio-pt.svg';
function panel(index){
 const x=steps[index],n=index+1;
 return '<div class="gd3-panel" data-gd3-panel="'+index+'">'+
 '<div class="gd3-picture"><div class="gd3-picture-caption"><span>'+esc(x.kind)+'</span><strong>0'+n+' / 06</strong></div>'+
 '<img src="'+esc(x.src)+'" alt="'+esc(x.alt)+'" loading="lazy" decoding="async" data-gd3-image>'+
 '<div class="gd3-picture-credit">Captura: documentação oficial GDevelop, quando indicado. Diagrama de apoio: material autoral. A interface pode mudar.</div></div>'+
 '<div class="gd3-explain"><span class="gd3-kicker">ETAPA 0'+n+' · NA ENGINE</span><h4>'+esc(x.headline)+'</h4>'+
 '<p class="gd3-definition">'+esc(x.lead)+'</p>'+
 '<div class="gd3-steps">'+x.actions.map(([name,desc],j)=>'<div class="gd3-step"><b>'+(j+1)+'</b><p><strong>'+esc(name)+'</strong>'+esc(desc)+'</p></div>').join('')+'</div>'+
 '<div class="gd3-expected"><span>✓ RESULTADO ESPERADO</span><p>'+esc(x.expected)+'</p></div>'+
 '<details class="gd3-rescue"><summary>Se algo não funcionar</summary><p>'+esc(x.help)+'</p></details></div></div>'+
 '<div class="gd3-nav"><button type="button" data-gd3-prev '+(index===0?'disabled':'')+'>‹ ANTERIOR</button><span>ETAPA '+n+' DE 6</span><button type="button" data-gd3-next '+(index===5?'disabled':'')+'>PRÓXIMA ›</button></div>';
}
function render(role){
 const teacher=role==='teacher';
 return '<section class="gd3-root" data-gd3-role="'+(teacher?'teacher':'student')+'">'+
 '<div class="gd3-heading"><div><small>◈ GUIA VISUAL DO GDEVELOP · 6 ETAPAS</small>'+
 '<h3>'+(teacher?'Do primeiro clique ao Preview.':'O GDevelop, passo a passo.')+'</h3>'+
 '<p>As capturas mostram a interface de referência e cada comando é explicado em português, com resultado esperado e solução para erros frequentes. O editor é a ferramenta da prática; não é necessário sair desta aula para ler documentação.</p></div>'+
 '<a href="https://editor.gdevelop.io/" target="_blank" rel="noopener noreferrer">ABRIR O GDEVELOP ↗</a></div>'+
 '<div class="gd3-tabs" role="tablist" aria-label="Tutorial inicial GDevelop">'+steps.map((x,i)=>'<button type="button" role="tab" id="gd3Tab'+i+'" aria-controls="gd3Frame" aria-selected="'+(i===0?'true':'false')+'" tabindex="'+(i===0?'0':'-1')+'" data-gd3-tab="'+i+'">0'+(i+1)+' '+esc(x.title)+'</button>').join('')+'</div>'+
 '<div class="gd3-frame" role="tabpanel" id="gd3Frame" aria-labelledby="gd3Tab0">'+panel(0)+'</div>'+
 '<footer class="gd3-footer"><strong>DESKTOP OU NAVEGADOR · 2D OU 3D</strong><span>A interface pode mudar de lugar; os conceitos de projeto, cena, objeto, instância e Preview permanecem. Um objeto parado é suficiente nesta missão.</span></footer></section>';
}
function mount(scope){
 const el=scope||document.querySelector('.gd3-root');if(!el)return;
 const tabs=[...el.querySelectorAll('[data-gd3-tab]')],frame=el.querySelector('#gd3Frame');if(!frame)return;
 let index=0;
 function apply(i,focus){
  if(i<0||i>=steps.length)return;
  index=i;
  tabs.forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1});
  frame.setAttribute('aria-labelledby','gd3Tab'+i);
  frame.innerHTML=panel(i);
  const img=frame.querySelector('[data-gd3-image]');
  if(img){
   const showFallback=()=>{
    if(img.dataset.offline)return;img.dataset.offline='true';img.src=localFallback;
    img.alt='Diagrama didático do editor GDevelop em português; imagem oficial indisponível';
    const caption=frame.querySelector('.gd3-picture-caption span');if(caption)caption.textContent='DIAGRAMA DE APOIO · IMAGEM EXTERNA INDISPONÍVEL';
   };
   img.addEventListener('error',showFallback);
   if(img.complete&&img.naturalWidth===0)showFallback();
  }
  const navigate=next=>{
   apply(next,false);
   if(frame.scrollIntoView)frame.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  };
  frame.querySelector('[data-gd3-prev]')?.addEventListener('click',()=>navigate(index-1));
  frame.querySelector('[data-gd3-next]')?.addEventListener('click',()=>navigate(index+1));
  if(focus)tabs[i]?.focus();
 }
 tabs.forEach((b,i)=>{
  b.addEventListener('click',()=>apply(i,false));
  b.addEventListener('keydown',e=>{
   const next=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:e.key==='Home'?0:e.key==='End'?5:null;
   if(next===null)return;
   e.preventDefault();apply(Math.max(0,Math.min(5,next)),true);
  });
 });
 apply(0,false);
}
window.PIT_GDEVELOP_FIRST_RUN={render,mount,steps,localFallback,projectorPanel:panel};
})();