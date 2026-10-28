/* PIT GAME JAM IA · M06-01 · Fundamentos do professor
   Formatos conferidos com documentação oficial: wiki.gdevelop.io/gdevelop5/
   Ferramentas de geração/limites gratuitos serão auditados em M06-02.
*/
(function(){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const assets=[
 {id:'sprite',name:'SPRITE / CENÁRIO 2D',icon:'▧',format:'PNG com transparência',size:'1–2 arquivos pequenos',where:'Object → Sprite → Animation frames → Add image',prepare:'Solicite personagem ou item com fundo transparente. Revise bordas, escala, orientação e enquadramento; para animar, exporte quadros separados com dimensões consistentes.',success:'O Sprite aparece em Preview na cena original, sem fundo branco indesejado.',risk:'Uma imagem panorâmica não se transforma automaticamente em animação nem em Sprite transparente.',docs:'https://wiki.gdevelop.io/gdevelop5/objects/sprite/'},
 {id:'audio',name:'EFEITO / ÁUDIO',icon:'♪',format:'WAV curto ou AAC para música',size:'1 efeito curto; música opcional',where:'Events → Add action → Play a sound / Play a music file',prepare:'Para SFX breves, um WAV pequeno é simples. Para trilhas longas prefira AAC por compatibilidade e memória. O primeiro clique/toque desbloqueia áudio em navegadores.',success:'Um evento real da Missão 05 dispara o som na hora correta, após interação do jogador.',risk:'Arquivo pesado ou som antes do primeiro gesto pode falhar silenciosamente no navegador.',docs:'https://wiki.gdevelop.io/gdevelop5/all-features/audio/'},
 {id:'video',name:'CUTSCENE / VÍDEO',icon:'▣',format:'MP4 H.264 + AAC',size:'Apenas se houver tempo',where:'Object → Video → Video resource; Events → Play',prepare:'Use um trecho curto; teste a reprodução no navegador da turma. Antes do Play, peça uma interação (clique/toque). Vídeo é complemento, não requisito do MVP.',success:'O vídeo inicia depois da interação e, ao terminar, a cena volta ao jogo.',risk:'MP4 sem codec compatível, vídeo excessivamente longo ou autoplay antes de interação pode não funcionar.',docs:'https://wiki.gdevelop.io/gdevelop5/objects/video/'},
 {id:'model',name:'PERSONAGEM / OBJETO 3D',icon:'⬡',format:'GLB compactado',size:'1 prop low-poly',where:'Object → 3D Model → selecionar arquivo .glb',prepare:'GLB inclui malha, materiais e animações. Outros formatos como OBJ/GLTF não são equivalentes para importação direta do objeto 3D. Prefira modelos low-poly e avalie colisão separadamente.',success:'O modelo renderiza na cena 3D e não destrói o movimento/Physics 3D configurado na Missão 04.',risk:'Uma malha visual de 3D não cria física automaticamente; trocar todo o personagem pode quebrar o starter.',docs:'https://wiki.gdevelop.io/gdevelop5/objects/3d-model/'}
];
const steps=[
 ['01','DEFINIR FUNÇÃO','A escolha começa por uma necessidade do jogo. Qual evento, personagem ou objeto realmente precisa de um recurso novo?'],
 ['02','GERAR OU REAPROVEITAR','Criar apenas o recurso necessário. Se a IA exigir conta paga, usar Asset Store/arquivo próprio, sem bloquear a oficina.'],
 ['03','PREPARAR / VERIFICAR','Checar extensão, transparência, dimensões, duração, volume, peso e licença antes de importar.'],
 ['04','IMPORTAR','Importar o arquivo no tipo de objeto correto e manter o restante do projeto já funcional.'],
 ['05','TESTAR + CREDITAR','Executar Preview, observar antes/depois da importação, salvar projeto e anotar ferramenta, recurso e permissão de uso.']
];
const quiz=[
 {text:'Um personagem de plataforma precisa aparecer sem retângulo branco ao redor.',correct:'sprite',reason:'Use Sprite com PNG transparente; revise o recorte e os quadros de animação.'},
 {text:'Uma porta deve tocar um som curto quando a chave funciona.',correct:'audio',reason:'Conecte WAV curto ao evento da porta. Use o gesto inicial para liberar áudio no navegador.'},
 {text:'Uma cena de abertura de poucos segundos aparece antes de jogar.',correct:'video',reason:'Use objeto Video com MP4 H.264/AAC e peça interação antes da reprodução.'},
 {text:'Um cenário em primeira pessoa precisa de um novo modelo tridimensional.',correct:'model',reason:'Use GLB low-poly e mantenha colisão Physics 3D separada da geometria visual.'}
];
function assetCard(a,i){return '<article class="f6-card"><div class="f6-cardhead"><span>'+a.icon+'</span><div><small>FONTE DE RECURSO 0'+(i+1)+'</small><h4>'+esc(a.name)+'</h4></div></div>'+
 '<div class="f6-format"><b>'+esc(a.format)+'</b><small>'+esc(a.size)+'</small></div>'+
 '<p>'+esc(a.prepare)+'</p><div class="f6-tag"><b>NO GDEVELOP</b><span>'+esc(a.where)+'</span></div>'+
 '<div class="f6-outcome"><b>✓ TESTE VERIFICÁVEL</b><p>'+esc(a.success)+'</p></div>'+
 '<div class="f6-risk"><b>ATENÇÃO</b><p>'+esc(a.risk)+'</p></div>'+
 '<a href="'+esc(a.docs)+'" target="_blank" rel="noopener noreferrer">Documentação oficial ↗</a></article>';}
function render(){
 return '<section id="f6Foundations" class="f6-root"><header class="f6-head"><span>✦ PIT GAME JAM IA · PROFESSOR · CAPÍTULO VI</span>'+
 '<div class="f6-banner"><div class="f6-seal">VI</div><div><small>MISSÃO 06 / 10 · FORJA DE IA · 45 MINUTOS</small>'+
 '<h2>Da ideia ao recurso jogável.</h2><p>Formatos, importação, autorização e teste — sem transformar a aula em um catálogo de IAs.</p></div></div>'+
 '<div class="f6-time">'+[5,5,32,3].map((n,i)=>'<span class="'+(!i?'current':'')+'"><b>'+n+' min</b> '+['PIPELINE','DEMONSTRAÇÃO','PRODUÇÃO','RESULTADOS'][i]+'</span>').join('')+'</div></header>'+
 '<div class="f6-body"><div class="f6-lead"><small>FUNDAMENTOS · 5 MINUTOS</small><h3>Um recurso bonito que não entra no jogo não é um asset pronto.</h3>'+
 '<p>As Missões 03–05 já produziram um protótipo com controle e regra. Nesta etapa, a IA entra <strong>para substituir ou enriquecer no máximo um recurso funcional</strong> — sem refazer personagem, código ou fase inteira. O arquivo precisa ser importável, ter autoria rastreável e funcionar no Preview.</p></div>'+
 '<div class="f6-pipeline">'+steps.map(([n,title,desc])=>'<article><span>'+n+'</span><div><strong>'+title+'</strong><p>'+desc+'</p></div></article>').join('')+'</div>'+
 '<div class="f6-scope"><strong>REGRA DE ESCOPO · PARA CONCLUIR EM 45 MIN</strong>'+
 '<p>Escolher <b>uma entrega principal</b>: imagem 2D, som curto ou prop 3D. Vídeo de cena é opcional e só entra se a integração do jogo já estiver concluída. Não é obrigatório usar todas as ferramentas.</p></div>'+
 '<div class="f6-catalog-title"><small>TIPOS DE ARQUIVO · DECISÃO TÉCNICA</small><h3>Quatro formatos. Quatro formas de integrar.</h3>'+
 '<p>Os cartões são referências consultáveis. Na oficina, cada estudante segue somente o formato de que seu projeto precisa.</p></div>'+
 '<div class="f6-cards">'+assets.map(assetCard).join('')+'</div>'+
 '<div class="f6-decision"><div><small>SIMULADOR DE DECISÃO · 60 SEGUNDOS</small>'+
 '<h3>Qual arquivo resolve este problema?</h3><p>Selecione a situação e escolha o formato mais adequado. Esta é uma simulação de decisão; não importa arquivos nem usa serviços de IA.</p></div>'+
 '<div class="f6-choice"><label for="f6Situation">Necessidade do jogo</label>'+
 '<select id="f6Situation">'+quiz.map((q,i)=>'<option value="'+i+'">'+esc(q.text)+'</option>').join('')+'</select>'+
 '<div class="f6-buttons">'+assets.map(a=>'<button type="button" data-f6-answer="'+a.id+'">'+esc(a.format)+'</button>').join('')+'</div>'+
 '<div id="f6Answer" class="f6-answer" aria-live="polite">Escolha um formato para conferir a recomendação e seu motivo.</div></div></div>'+
 '<div class="f6-ethics"><strong>QUATRO VERIFICAÇÕES DE USO RESPONSÁVEL</strong>'+
 '<div>'+[
 ['AUTORIA','Registrar a origem e o prompt/alterações autorais. IA não substitui decisão artística.'],
 ['LICENÇA','Conferir condições da ferramenta e do asset; gratuito não significa automaticamente licença comercial.'],
 ['PRIVACIDADE','Não enviar rostos, vozes ou dados pessoais de terceiros sem autorização.'],
 ['DEPENDÊNCIA','Manter alternativa local/Asset Store quando acabar o crédito gratuito ou a rede falhar.']
 ].map(([h,p])=>'<article><b>'+h+'</b><p>'+p+'</p></article>').join('')+'</div></div>'+
 '<footer class="f6-end"><strong>PRÓXIMA ETAPA DO PROFESSOR</strong><p>Na demonstração de 5 minutos: importar um arquivo real e executar Preview. Na prática de 32 minutos: cada aluno escolhe uma modalidade, gera ou encontra um recurso, importa, testa e identifica a origem. Na avaliação de 3 minutos: comprovar que a regra anterior segue funcionando.</p>'+
 '<p>Os serviços de IA, seus limites gratuitos e alternativas serão verificados especificamente na M06-02, pois preços e cotas mudam.</p></footer></div></section>';
}
function mount(){
 const root=document.querySelector('#f6Foundations');if(!root)return;
 const select=root.querySelector('#f6Situation'),out=root.querySelector('#f6Answer'),buttons=[...root.querySelectorAll('[data-f6-answer]')];if(!select||!out)return;
 const update=answer=>{
  const index=Math.max(0,Math.min(quiz.length-1,Number(select.value)||0)),q=quiz[index];
  const correct=answer===q.correct;
  out.textContent=(correct?'✓ COMPATÍVEL · ':'REVISE O FORMATO · ')+q.reason;
  out.dataset.result=correct?'correct':'retry';
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.f6Answer===answer)));
 };
 select.addEventListener('change',()=>{out.textContent='Escolha um formato adequado para esta situação.';out.dataset.result='';buttons.forEach(b=>b.setAttribute('aria-pressed','false'))});
 buttons.forEach(b=>b.addEventListener('click',()=>update(b.dataset.f6Answer)));
}
window.PIT_TEACHER_MISSION_SIX_FOUNDATIONS={render,mount,assets,steps,quiz};
})();