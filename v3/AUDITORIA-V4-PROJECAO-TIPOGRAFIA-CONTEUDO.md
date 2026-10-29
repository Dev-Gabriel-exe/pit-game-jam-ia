# PIT Game Jam IA — Auditoria de tipografia e suficiência pedagógica no Modo Apresentação

**Data:** 28/10/2026 · **Escopo:** professor, missões 01–10, quatro etapas por missão · **Método:** Chrome real 1280×720, 1600×900 e 1920×1080, modo prévia sem credenciais/turma real, `qa/v3-projector-content-audit.cjs` (runs 40747065265 e 40747674275). **Não é homologação visual humana nem execução do editor GDevelop.**

## Resumo mensurado

- **40/40** combinações missão × fase projetaram ao menos um slide, sem erros JavaScript observados na auditoria.
- **196 slides** no conjunto, incluindo teoria, exemplos, prática e revisão.
- **21/40 fases** contêm algum texto abaixo de **18 px** (muitas etiquetas e textos secundários).
- **720p:** 12/40 fases e 18 slides com rolagem vertical; **900p:** 11/40 fases e 15 slides; **1080p:** 10/40 fases e 14 slides.
- **0** fases com transbordamento horizontal detectado no contêiner de apresentação nas três resoluções.
- **9/40 fases** projetaram menos de 40% dos caracteres da tela original. A métrica inclui conteúdo auxiliar e pode subestimar cobertura útil; é um sinal de investigação, não prova de perda proporcional.
- **22/40 fases** têm controles na tela-fonte; em apenas **2/40** restaram controles nos slides gerados. Como o projetor usa `outerHTML`, eventos JS ligados aos nós originais não são transferidos; um botão desenhado no slide não comprova que o simulador funcione.

## Cobertura aproximada por fase (slide/razão de caracteres)

| Missão | Entender | Demonstrar | Criar | Comprovar | Leitura pedagógica |
|---|---|---|---|---|---|
| 01 · O Chamado | 6 / 58% | 2 / **14%** | 2 / **9%** | 5 / 44% | Teoria forte; exemplos operacionais e construção precisam reaparecer |
| 02 · MVP em Foco | 8 / 80% | 3 / 40% | 6 / 53% | 6 / 71% | Melhor equilíbrio; aumentar textos pequenos |
| 03 · Ligar o Motor | 8 / 82% | 1 / **13%** | 5 / **34%** | 7 / 77% | Crítico: tutorial de GDevelop condensado/omitido |
| 04 · Primeiro Jogável | 5 / 54% | 1 / 47% | 7 / 40% | 4 / **25%** | Demonstrar controle/colisão por passos, revisão completa |
| 05 · A Primeira Regra | 4 / 47% | 1 / 44% | 7 / 45% | 4 / **24%** | Separar lógica, teste e tratamento de repetição |
| 06 · Forja de IA | 12 / 65% | 5 / 76% | 5 / 81% | 8 / 41% | Mais completo, mas cards grandes exigem rolagem |
| 07 · Dar Vida ao Universo | 8 / 50% | 1 / 46% | 3 / 42% | 8 / 74% | Teoria de estados boa; demonstração está comprimida |
| 08 · Polimento | 6 / **39%** | 1 / 42% | 3 / 40% | 8 / 75% | O simulador antes/depois não fica íntegro na projeção |
| 09 · Playtest Cruzado | 6 / 61% | 1 / 54% | 3 / **38%** | 7 / 73% | Bom raciocínio de teste, falta fluxo visual contínuo na prática |
| 10 · Lançamento | 6 / 52% | 1 / 50% | 6 / **39%** | 6 / 64% | Critérios úteis, demonstração/salvamento precisam ser operacionais |

## Tipografia

**Pontos positivos:** título geral de slides `clamp(26px,3vw,52px)`, títulos internos `clamp(30px,3vw,52px)`, corpo de texto `clamp(19px,1.75vw,29px)`; bom contraste básico da paleta de fundo escuro/tons claros; sem transbordamento horizontal a 1600 px; suporte a `prefers-reduced-motion`.

**Problemas verificáveis:**
1. Estilos de componentes internos herdados do painel do professor ainda definem `font-size` de 9–17 px e `font: ...` (que pode vencer fontes do projetor). Isso afeta etiquetas, pequenas legendas, passos de tutoriais, exemplos e termos técnicos.
2. Corpo mínimo a 1280 px seria ~22,4 px devido ao `1.75vw`, insuficiente para algumas salas/projetores. Para projeção adotar referências: título 40–56 px; corpo 26–32 px; legenda/etiqueta >=20 px, exceto controles discretos.
3. Georgia/serif funciona como tipografia ornamental nos títulos; para explicações longas recomenda-se Segoe UI/Arial ou família UI acessível, preservando fantasia nos títulos.
4. Animações de entrada têm três camadas (card, título, parágrafo); manter breves e sincronizadas, sem apagar conteúdo por atraso, e respeitar movimento reduzido.

## Critério de suficiência da aula

As missões têm progressão conceitual válida: ideia → MVP → motor → movimento → regra → recurso → vitória → UX → playtest → entrega. Os tempos-alvo somam **360 minutos**. O material de origem contém conceitos técnicos, exemplos e critérios de avaliação em praticamente todas. Porém, **a versão projetada ainda não satisfaz integralmente o padrão de professor substituto sem preparo**, porque:
- muitos tutoriais GDevelop de demonstração viram um slide rolável (M03/04/05/07/08/10);
- material do card e prática guiada pode ficar fora do slide; 
- simuladores são copiados como HTML sem os event handlers originais;
- alguns conceitos densos ficam em um card longo, impossibilitando leitura a distância;
- critérios de entrega/revisão podem não aparecer na sequência projetada apesar de estarem no arquivo-fonte.

## Recomendações em ordem de prioridade

1. **P0 — Integridade do conteúdo:** mapear seletores sem perda e exigir em testes que cada bloco pedagógico essencial apareça na sequência (especialmente M01 e M03). Um slide por card, mas dividir card grande em passos legíveis.
2. **P0 — Tutoriais:** demonstrações GDevelop como slides numerados com **onde clicar → o que fazer → resultado esperado → erro comum → verificação**, não um iframe/card longo em uma tela.
3. **P0 — Interação:** preservar nós originais do simulador ou oferecer um modo interativo dedicado com handlers conectados; teste de execução, não só existência de botões. Não tocar no estado real da turma.
4. **P1 — Tipografia:** escala de projeção usando fontes 26–32px no corpo, 40–56px nos títulos, etiquetas >=20px; visual ornamental nos títulos, sans-serif no corpo; controlar contraste de estados e warnings.
5. **P1 — Composição:** slides com 1 objetivo, idealmente 40–90 palavras e 1 exemplo principal; quando o card exceder o viewport, separar em micro-slides e nunca depender de rolagem invisível.
6. **P1 — Roteiro instrucional:** antes de cada bloco de prática, um slide curto "o que fazer / onde / como saber que deu certo / o que entregar".
7. **P1 — Homologação:** repetir Chrome em 1280×720, 1366×768 e 1920×1080, testar teclas e simuladores e conferir no projetor HDMI real. Notas privadas do professor nunca devem ser projetadas.

## Limitações e próximos passos

Esse exame mede DOM e CSS em Chrome headless, não legibilidade percebida por alunos no fundo da sala. As razões de caracteres não são porcentagens de aprendizagem/cobertura semântica. **Não houve alterações na `main` nesta auditoria**. Ajustes devem ser implementados na branch de testes e publicados após validação.

## Correção incremental M01/M03 — demonstrações projetadas (29/10/2026)

**Falha concreta anterior:** o gerador universal de slides extraía apenas os cards identificados por seletores genéricos. Na demonstração da M01, deixava de fora o simulador de transições e apresentava somente parte do tutorial em abas; na M03, copiava apenas a primeira das seis etapas do guia GDevelop. Clonar HTML com `outerHTML` não transporta listeners de cliques, portanto botões de um simulador clonado eram visualmente presentes sem funcionamento demonstrado.

**Alteração aplicada exclusivamente na branch V3:** `v3/teacher-projector-m01.js` agora cria sequências pedagógicas específicas nas fases **M01/Demonstrar** e **M03/Demonstrar**. M01 inclui introdução, simulador com handlers próprios para coleta/porta/reinício, modelo de transição, casos de teste, explicação do motor e **cinco painéis completos** do tutorial de eventos. M03 inclui introdução e **seis painéis completos** do primeiro contato com o GDevelop (abrir editor, projeto, cena, objeto, instância, Preview/salvar). Os painéis são derivados dos mesmos dados de `v3/teacher-gdevelop-guide.js` e `v3/gdevelop-first-run.js`, sem duplicar as explicações e sem expor notas privadas. Imagens externas possuem fallback local rotulado como diagrama, sem se passar por captura real. `v3/teacher-projector-m01.css` define tipografia e grade de projeção para esses painéis.

**Teste de regressão incorporado:** `qa/v3-projector-content-audit.cjs` (Chrome, 1280×720 / 1600×900 / 1920×1080) exige cinco etapas distintas na M01, seis na M03, interação funcional no simulador da M01 (coleta 1/3, porta bloqueada e vitória após 3/3) e retenção de texto maior que 40% em ambas as demonstrações. As verificações são feitas com DOM e dados simulados; não demonstram execução do GDevelop. **Sintaxe JavaScript dos arquivos editados foi validada em V8 pelo executor.** GitHub Actions da correção final: projector audit run **40865003839**, static QA **40865003847**, Browser QA **40865003827** — todos **QUEUED** na primeira consulta, sem conclusão presumida. Conferir os resultados no SHA `af0ca4c2199456cf18f1d097eb80398ad5d05ecd` antes de considerar a regressão aprovada.

**Permanecem pendentes:** medir a nova cobertura efetiva após execução da auditoria Chrome; verificar eventual rolagem dos painéis em 720p; examinar os simuladores e tutoriais das demais missões; GDevelop GUI real, projeção HDMI física, celular físico e playtest humano continuam **NOT_RUN**. A `main` não foi modificada.


## Correção incremental M04 — demonstração completa de movimento/limites (29/10/2026)

**Defeito observado no código:** o projetor universal clonava apenas o primeiro `.g4-step` da aba ativa, embora o tutorial de GDevelop contenha quatro etapas por rota. As ações de navegação da aba original não são transferidas ao HTML clonado. Assim, a sequência operacional para movimento, obstáculo e Preview não ficava integralmente disponível no modo de apresentação.

**Mudança:** `v3/gdevelop-mission-four-guide.js` disponibiliza `projectorPanel(routeIndex,stepIndex)` reutilizando a mesma função de renderização de passos da aula, sem duplicar o conteúdo. `v3/teacher-projector-m01.js` identifica a rota atualmente selecionada no tutorial original (RPG/exploração, plataforma, puzzle/narrativa ou 3D) e projeta seus quatro passos em slides separados. Inclui onde clicar, o que fazer, resultado esperado, diagnóstico visível, fonte e fallback rotulado para imagem externa indisponível. As outras rotas permanecem alternativas, não tarefas cumulativas. `v3/teacher-projector-m01.css` ajusta a leitura e a composição. Nenhuma nota privada é clonada.

**Regressão:** `qa/v3-projector-content-audit.cjs` agora exige quatro marcadores M04:0–M04:3 em ordem, duas instruções por passo, resultado, recuperação, fonte e ausência de notas privadas, nos três tamanhos de projeção (1280×720, 1600×900 e 1920×1080). A sintaxe JavaScript foi compilada em V8; a CI estática do código foi aprovada na execução 40871942378. A matriz Chrome 40871942307 e Browser QA 40871942332 ainda estavam em execução no momento deste registro — **não marcar como aprovadas antes de confirmar**.

**Pendências:** conferir as duas CIs do commit de código, revisar possíveis slides com rolagem vertical e avançar para os tutoriais M05 e M07. HDMI real, interface gráfica do GDevelop, celular físico e observação de alunos permanecem **NOT_RUN**. Nenhum merge na `main`.


**Atualização de QA (29/10/2026, após a primeira execução):** a auditoria Chrome do código M04 passou em **1280×720, 1600×900 e 1920×1080** na execução [40871942307](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40871942307), incluindo as sete asserções de M01/M03/M04, sem erros JavaScript nem transbordamento horizontal. Na M04/Demonstrar foram **7 slides**; **4 slides exigiram rolagem em 720p** e **2 em 1080p**, portanto a leitura integral em sala ainda precisa de melhoria. A razão de caracteres maior que 100% resulta da expansão dos passos antes ocultos em abas e **não mede aprendizagem**. Para não testar apenas a rota 2D padrão, acrescentei à auditoria Chrome a navegação pelas rotas plataforma, puzzle e 3D (commit `08c37b7`); a execução [40872128258](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40872128258) foi iniciada, mas seu resultado ainda não estava confirmado neste registro. Browser QA do mesmo commit também pendente.

## Correção incremental M05 — cinco etapas projetadas por rota (29/10/2026)

**Falha verificada em código:** o tutorial `#m5Guide` possui cinco etapas e três rotas alternativas (RPG/plataforma, puzzle/narrativa e 3D). O gerador universal de slides copiava somente o primeiro painel, e os handlers da navegação por abas não acompanham o clone. Assim, condição, variável, feedback e teste final não eram apresentados integralmente.

**Alteração:** `v3/gdevelop-mission-five-guide.js` expõe `projectorPanel`, reutilizando o renderizador didático existente. `v3/teacher-projector-m01.js` lê a rota selecionada e cria cinco slides numerados, com contexto e fontes. Cada passo contém onde clicar, o que configurar, resultado esperado e diagnóstico de falha **visível**, sem expor notas privadas. A captura externa recebe fallback local identificado como diagrama autoral. `v3/teacher-projector-m01.css` melhora a composição dos passos.

**Teste:** `qa/v3-projector-content-audit.cjs` agora exige M05:0–M05:4 em ordem, todas as quatro seções didáticas, fonte, ausência de notas privadas e a projeção completa das três rotas em Chrome nas resoluções 1280×720, 1600×900 e 1920×1080. Os três arquivos JavaScript/CJS editados passaram em **análise sintática V8**, que não é teste de navegador. O commit de código é [11237086](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/commit/11237086ce6b5cf310341bd3ddd989a882236b55); a [QA estática 40880579845](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40880579845) terminou **SUCCESS**; [auditoria Chrome 40880580062](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40880580062) e [Browser QA 40880579891](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40880579891) estavam **IN_PROGRESS** na última consulta, sem aprovação presumida.

**Próximo foco:** confirmar as duas CIs, medir rolagem em 720p e recuperar as etapas da demonstração M07. GDevelop GUI, HDMI físico, celular físico e playtest humano continuam **NOT_RUN**. `main` não alterada.

**Resultado posterior da auditoria Chrome M05:** [40880580062](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40880580062) terminou **SUCCESS nas três resoluções**. As 11 asserções do projetor passaram, incluindo as cinco etapas nas três rotas. No log de **1280×720**, M05/Demonstrar teve **9 slides, cinco com rolagem vertical, zero com transbordamento horizontal**. A cobertura textual aparente passou a 2,85× porque as etapas ocultas no original foram expandidas; isso não significa melhoria pedagógica proporcional. Persistem seis combinações abaixo de 40% (M01/criar, M03/criar, M04/comprovar, M05/comprovar, M08/entender, M09/criar). Browser QA geral 40880579891 permanecia em execução na consulta. Próximo passo: reduzir rolagem e recuperar M07/Demonstrar sem omitir instruções.

## Correção incremental — leitura integral de slides longos em 720p (29/10/2026)

**Falha concreta de navegação:** a apresentação usa um contêiner verticalmente rolável, mas o atalho `PageDown` avançava imediatamente para o próximo slide. Assim, o fim dos tutoriais longos de M04/M05/M07 podia ser pulado sem leitura. Além disso, o contêiner flex centralizava conteúdo alto sem alinhamento seguro e a mudança de slide não zerava explicitamente a rolagem.

**Correção na branch de trabalho:** `v3/teacher-projector-m01.js` faz `PageDown` percorrer o conteúdo atual antes de avançar, e `PageUp` voltar ao topo antes de retornar ao slide anterior. As setas esquerda/direita continuam navegando diretamente entre slides. Cada slide novo inicia no topo, e um aviso discreto no rodapé informa se ainda há conteúdo abaixo. `v3/teacher-projector-m01.css` adota alinhamento flex `safe center` para impedir corte do início do texto, reduz apenas margens do cabeçalho/rodapé em 720p (não diminui a fonte dos tutoriais) e estiliza o aviso. O conteúdo didático, os dez módulos e as notas privadas fechadas permanecem inalterados.

**Regressão de navegador:** `qa/v3-projector-content-audit.cjs` acrescenta teste da M04 com área de leitura temporariamente reduzida a 180px, independentemente da resolução: verifica que o começo do card está visível, que existe aviso de continuação, que `PageDown` rola sem trocar slide, que seta direita abre o próximo slide no topo, que `PageDown` no final avança, e que não aparecem notas privadas. A simulação usa DOM de prévia em Chrome; **não é teste HDMI físico nem teste humano**.

**Critério pendente:** comparar o número de slides com rolagem em 1280×720 antes/depois, confirmar a CI do SHA final e, em rodada futura, repartir cards excessivamente longos em slides menores. A rolagem acessível é uma correção de perda de leitura, **não** equivale a eliminar toda rolagem nem a certificar legibilidade no projetor real.

**Resultado verificado da CI Chrome (29/10, SHA `6fbbbb7`):** [execução 40900326757](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40900326757) **SUCCESS nos três jobs** 1280×720, 1600×900 e 1920×1080; **15/15 regressões de projeção passaram**, incluindo a nova navegação por teclado, a visibilidade do início do card, o aviso e ausência de notas privadas. O log de 720p confirma **M04: 7 slides / 4 com rolagem; M05: 9 / 5 com rolagem; M07: 7 / 0 com rolagem**. Portanto, o número de slides longos de M04/M05 **não diminuiu**; a mudança tornou seu conteúdo acessível por teclado e protegeu a leitura do começo. Ainda há seis combinações de missão/fase com cobertura textual inferior a 40% (M01/criar, M03/criar, M04/comprovar, M05/comprovar, M08/entender e M09/criar), exigindo auditoria semântica.


## Correção incremental M01 — ficha autoral projetada integralmente (29/10/2026)

**Falha concreta de cobertura:** na fase **Criar** da Missão 01, o extrator genérico de cards da apresentação priorizava `article` e não capturava os sete campos `.tm1-field` da ficha de game design. Assim, a apresentação não mostrava integralmente os exemplos de gênero, título, protagonista, ação, objetivo, conclusão e feedback, apesar de eles existirem no material principal do professor.

**Alteração de código:** `v3/teacher-projector-m01.js` agora monta uma sequência específica para M01/Criar, reutilizando o HTML da fonte, sem duplicar o conteúdo: introdução, ficha preenchida, sete campos em quatro slides de até dois campos, três fragmentos conceituais e transição para a M02. `v3/teacher-projector-m01.css` organiza os campos em duas colunas no desktop, mantendo tamanho de texto legível e uma coluna em telas estreitas. As notas privadas continuam excluídas de cada cópia.

**Regressão:** `qa/v3-projector-content-audit.cjs` verifica a presença dos sete campos distintos e retenção de pelo menos 65% dos caracteres da fase original. Os dois arquivos JS/CJS modificados foram analisados sintaticamente com o parser V8 antes do commit; a execução Chrome da nova asserção ainda depende do resultado do GitHub Actions no SHA correto. **Não afirmar diminuição de rolagem em 720p sem medi-la**.

**CI anterior confirmada:** Browser QA `40900326551` e Static QA `40900326543` no SHA `6fbbbb7` encerraram com sucesso (consultadas em 29/10). A auditoria Chrome `40900326757` passou em três resoluções. A nova regressão M01 e o novo CSS ainda precisam de CI no commit atualizado. **Pendências:** M03/Criar, M04/Comprovar, M05/Comprovar, M08/Entender e M09/Criar continuam com cobertura textual inferior a 40% na medição anterior; M04/M05 possuem slides longos. HDMI físico, GUI GDevelop, celular físico e playtest humano permanecem **NOT_RUN**. Nenhuma publicação na `main`.


**Retificação da implementação M01 (29/10):** a primeira versão acima tratava `.tm1-field` da edição antiga, mas o perfil professor em uso renderiza `teacher-mission-one-pro.js`, com os sete campos `.tm-pro-spec-row`. A auditoria Chrome `40910382601` revelou o erro: M01/Criar continuou em 2 slides, retenção de apenas **0,09**, e a nova regressão falhou nas três resoluções. Esse teste **não passou**. A correção subsequente `b6dc463` acrescentou projeção específica da edição universitária (oito slides: introdução, projeto de referência, quatro grupos de campos, critério de aceitação e casos de teste); `2e37bdc` ajustou CSS, e `dd6dcf3` passou a verificar os campos da edição ativa. O limite mínimo de caracteres do teste foi ajustado para 50%, pois o denominador inclui notas privadas deliberadamente excluídas. Sintaxe JS/CJS passou no parser V8; **aguardar Chrome e Browser QA do SHA `dd6dcf3` para validar a correção**, sem presumir aprovação. A `main` permanece intocada.


**Resultado confirmado da correção ativa M01:** a auditoria Chrome [40910615911](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40910615911) terminou **SUCCESS nos três tamanhos** (1280×720, 1600×900, 1920×1080), com **16/16 verificações de regressão aprovadas**. No 720p, M01/Criar passou de **2 slides / 9% de retenção** para **8 slides / 62% de retenção**, com sete campos presentes, **1 slide ainda rolável** e zero transbordamento horizontal. A medição de caracteres não mede aprendizagem; o denominador inclui notas privadas excluídas de propósito. A [QA estática 40910616007](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40910616007) também terminou **SUCCESS**. Browser QA geral [40910615906](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40910615906) ainda estava **IN_PROGRESS** nesta consulta; não atribuir aprovação antes da conclusão. A correção não altera as notas privadas, o aluno ou a `main`.
