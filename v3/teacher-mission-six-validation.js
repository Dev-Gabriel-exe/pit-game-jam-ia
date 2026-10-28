/* PIT GAME JAM IA V3 — M06-05: espelho professor/aluno e revisão.
 * Não aprova nem reprova automaticamente: painel real executa decisão.
 */
(function(){'use strict';
const checks=[
{tag:'NECESSIDADE',question:'O recurso é necessário à mecânica ou ao feedback?',proof:'Necessidade declarada e relação com o jogo das Missões 03–05; não é uma nova ideia desconectada.'},
{tag:'ARQUIVO IMPORTÁVEL',question:'Qual arquivo foi importado e onde?',proof:'Nome, formato, tipo de objeto/recurso no GDevelop; o arquivo precisa abrir sem conversão paga.'},
{tag:'PROCEDÊNCIA',question:'Qual a origem e a licença?',proof:'Ferramenta ou criação própria, permissão de uso, atribuição exigida; Suno/ElevenLabs grátis não permitem uso comercial.'},
{tag:'ANTES E DEPOIS',question:'O que mudou no Preview?',proof:'Mesmo projeto e mesma cena, comparação concreta antes/depois; uma imagem no chat não é importação.'},
{tag:'TESTE NEGATIVO',question:'O que acontece sem o recurso ou em falha?',proof:'Repetir regra da Missão 05, verificar ausência de travamento, som bloqueado, fundo incorreto ou colisão 3D.'},
{tag:'CONTINUIDADE',question:'O projeto editável continua salvo?',proof:'Nome ou localização recuperável, sem sobrescrever a versão jogável; projeto abre na próxima missão.'}
];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){return '<section class="t6v-root" id="t6vRoot"><header><small>MISSÃO VI · PROFESSOR · RESULTADOS · 3 MINUTOS</small><h2>Não avalie o prompt. Avalie o asset no jogo.</h2><p>O aluno preenche oito campos e confirma três testes manuais. A aprovação exige verificar o recurso importado e a continuidade do protótipo; nenhuma caixa gera nota automaticamente.</p></header><div class="t6v-rubric">'+checks.map((x,i)=>'<article><span>0'+(i+1)+'</span><div><small>'+esc(x.tag)+'</small><h3>'+esc(x.question)+'</h3><p>'+esc(x.proof)+'</p></div></article>').join('')+'</div>'+
'<div class="t6v-decisions"><article><h3>✓ APROVAR</h3><p>O aluno demonstra no Preview um único asset importado, identifica a origem/licença, mostra antes/depois e conserva a regra da Missão 05.</p></article><article><h3>↺ SOLICITAR REVISÃO</h3><p>O arquivo não abre, a licença não permite uso, não há teste observável, o recurso quebra a jogabilidade ou o projeto não foi salvo. Registrar o problema específico no acompanhamento.</p></article></div>'+
'<div class="t6v-offline"><h3>Contingência sem créditos, conta ou internet</h3><p>Imagem: desenho PNG local. Som/voz: gravação própria consentida. Vídeo: telas estáticas. 3D: objeto low-poly no Blender ou GLB com licença comprovada. O mesmo critério de teste vale para IA e para criação manual.</p><p>Em <b>Acompanhamento → aluno → Missão 06</b>, confronte as linhas Necessidade, Asset, Origem, Licença, Antes, Depois, Teste negativo e Projeto salvo. A decisão de aprovar ou devolver pertence ao professor e ao backend.</p></div>'+
'<footer>**IMPORTANTE:** o painel desta página é orientação de critérios, não resultado de teste. A validação de importação em GDevelop, navegação mobile e API real continua pendente.</footer></section>'}
function mount(){return !!document.querySelector('#t6vRoot')}
window.PIT_TEACHER_MISSION_SIX_VALIDATION={render,mount,checks};
})();