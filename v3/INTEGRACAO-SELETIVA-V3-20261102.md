# PIT Game Jam IA — Integração seletiva V3 pré-aula, 02/11/2026

## Diagnóstico após inspeção de 33 branches

A \`main\` já recebeu, pelo [PR #24](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/pull/24), correções pedagógicas das 10 missões sem substituir a integração V5. **Não copiar a árvore inteira de** \`feature/pit-gamejam-v3-arcade\`: existem ~88 arquivos divergentes, incluindo \`v3/app.js\`, \`aluno-v3.html\`, \`professor-v3.html\`, \`index.html\`, APIs e QA. Essas divergências incluem avanços próprios da main. A V3 não está integralmente concluída em seu roadmap (54/59 etapas declaradas), portanto não são "todas alterações aprovadas".

### Alterações pontuais escolhidas
- **M05, professor:** corrigir o algarismo de capítulo IV → V; deixar critérios de aprovação visíveis e mover o passo a passo individual do painel de Acompanhamento para nota privada fechada, preservando \`mount(rootOverride)\` do painel principal.
- **M06, professor:** acrescentar três diagnósticos GDevelop (arquivo, objeto na cena, Preview) e colocar orientação reservada de acompanhamento em \`<details>\` fechado; preservar todos os formatos, horários e \`mount(rootOverride)\` da main.
- **M08, professor:** usar legibilidade na **resolução-alvo do jogo**, em vez de exigir celular de projetos somente para PC; conferir o projeto editável reaberto; inserir procedimentos privados de avaliação fechados.
- **M10, professor e aluno:** atualizar o guia de entrega já compartilhado com as três rotas existentes, exigir que o projeto **salvo seja reaberto antes de testar** e relacionar a decisão real da M09; trocar cabeçalho confuso "PROFESSOR" por "TUTORIAL DE ENTREGA". Preservar editor, tabulação e os três caminhos.
- Novo teste independente \`qa/v3-preaula-pedagogia.cjs\`, executado também em \`.github/workflows/static-qa.yml\`.

### Exclusões e limites verificáveis
- **Nenhuma alteração** nos scripts de missão dos estudantes, cadastro/login, dados de turmas, chat, avaliação ou XP, nem nas APIs; não tocar nas 4 classes KayKit, arena, VFX ou V5.
- **Não** integrar o projetor experimental V3 M01 nem sobrescrever cabeçalhos HTML: a main tem novas camadas e hubs V5 (liberação, fantasia, apresentação, 7 slides e biblioteca ampliada).
- **Não** tratar \`feature/v5-arena-dos-criadores\` como integralmente integrada: há experimentos e gates não homologados. A main já tem Quaternius + Kenney, mas G.2 em PCs físicos e os contratos reais de integração H.1/H.2 ainda não foram homologados.
- Os testes automatizados demonstram apenas comportamento do código, não testes humanos GDevelop, HDMI/telão, 30 PCs, duelos reais, sessão autenticada ou validação de turma real.
- Os processos automáticos de outras branches podem continuar criando commits; este checkpoint não congela essas branches. A main deve ser a referência para o teste presencial, com SHA e workflow específicos.

## CI e publicação

Executar primeiro na branch \`integration/v3-ajustes-pedagogicos-preaula-20261102\`, conferir GitHub Actions Node e Chrome, depois transferir **somente os arquivos testados** para \`main\`, se não houver regressão. Verificar CI e Pages novamente no SHA de main. **Não afirmar conclusão antes dos resultados.**

## Checklist presencial das 19h
1. Na \`main\` publicada, abrir \`index.html\`, perfil professor e perfil aluno em navegadores diferentes; verificar dez cards, ordem, conteúdo projetado e que roteiros privados estejam fechados.
2. Professor: M05 (capítulo, critérios), M06 (diagnóstico de importação), M08 (resolução-alvo), M10 (guia de salvar/reabrir e caminhos de entrega). Conferir que nenhum formulário altera o jogo automaticamente.
3. Aluno: M01, M03, M05 e M10; testar recursos, chat texto+imagem, arquivo de projeto salvo e evidência. Testar **somente contas autorizadas** para integração real.
4. V5: quatro KayKits, simulações M5/M10, Kenney/Quaternius; sem afirmar liberação real, XP, notificações ou desempenho G.2 antes de verificação física.

Este arquivo documenta limites; não substitui autorização docente, gate humano nem rollback.
