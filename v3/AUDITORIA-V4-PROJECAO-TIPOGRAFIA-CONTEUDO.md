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
