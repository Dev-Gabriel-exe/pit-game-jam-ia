# H.3 / M10 — variante explícita para J08, P09 e A07 (01/11/2026)

**Status: validação CI pendente; não homologado.** Trabalho exclusivamente na branch `feature/v5-arena-dos-criadores`. Nenhum merge, deploy, autenticação, XP, banco, nota, aprovação, usuário ou turma real.

## Estado verificado no início

HEAD anterior `3def089d6b87f0e4c755c4d50752a461f5a9c196`. Lidos os cinco documentos obrigatórios (`ROADMAP-D-A-I`, `FASE-E`, `FASE-F`, `FASE-G`, `FASE-H0`), 12 commits recentes e CI: `41343380013`, `41343380090` e `41343380024` aprovados no HEAD anterior. A rodada anterior demonstrou procs sintéticos de J08/P09/A07, mas J08 e A07 não estavam equipados no WebGL padrão.

## Incremento técnico único — mesma Missão 10

1. `v5/arena-lab.js` — commit `74adc24924d53f0f09d0f89b53cf049fb1cdd53f`: aceita `m10variant=0..10` **somente** com `m10preview=1`. O valor 9 monta 30 personagens fictícios com os três talentos raros equipados; a seleção de talentos e o motor canônico permanecem intactos.
2. `qa/v5-m10-rare-equipped-seed.cjs` — commit `4b2dd577e324805e56c0ae73b458bfd8c5a7d9ac`: busca determinística de até 80 seeds com a variante 9, registra procs reais e valida regressão da Missão 5.
3. `qa/v5-m10-rare-equipped-browser.cjs` — commit `d7b08e5188e21d01a74995b411ba9a7985f0de8d`: Chromium/SwiftShader, 30 GLBs, câmera automática, sprites, telemetria cumulativa por ID, screenshots no primeiro reconhecimento do cue e regressão M5. Um cue instanciado **não garante** que esteja no campo de visão no instante do screenshot.
4. `.github/workflows/v5-m10-rare-equipped-qa.yml` — commit `25d983f6ab8c19d9cc3da6643d9edcea1d2e1dd3`: gates Node + WebGL e artefatos JSON/PNG.

## Limitações e próximo passo

Verificar [CI específico](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-m10-rare-equipped-qa.yml), corrigir qualquer falha, inspecionar contagem real de cues renderizados/descartados para cada talento e as capturas de câmera. Se algum proc do motor não gerar cue, investigar atribuição/limite visual sem alterar combate. Não afirmar visibilidade humana, equilíbrio definitivo ou G.2. Hardware G.2 em PCs reais e integração H.1/H.2 com alunos continuam bloqueados.

## Resultado da primeira execução e correção visual delimitada

- [CI 41347887721](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41347887721): **SUCCESS** com 30 GLBs, câmera automática, arquibancada 29/30 e regressão M5. Seed reproduzível `20261101`: `guardian:J08` teve 1 proc, `hunter:P09` 1 proc e `mage:A07` 4 procs. Os três estavam realmente equipados.
- **Falha de legibilidade descoberta (não erro de motor):** todos os três cues foram descartados pelo orçamento visual do WebGL, nenhum renderizado; a câmera observada foi `duel` e `victory`. Screenshots e relatório anexados ao run. O CI passou porque a auditoria inicial exigia apenas classificação honesta, não pixels.
- `v5/arena-three.js` commit `4d270359f893081d93feeaf95f147a5e8d072642`: ajuste **somente M10**, com uma única vaga rotativa para proc passivo/reativo além do orçamento de casts ativos. Ao chegar outro proc, a vaga é reutilizada. Mantém o teto de efeitos, prioriza casts ativos e preserva modo de movimento reduzido; não modifica dano, resultados, talentos ou M5.
- `qa/v5-m10-rare-equipped-browser.cjs` commit `509d9a6d41d444b65f3ba832ca7dadcf8d005f48`: novo gate exige cue **renderizado** para cada talento raro que tenha proc genuíno; somente o descarte não basta.
- Workflow atualizado em `5b87351251ab647c1a918d4fc5545c114235d31b` para reagir também a alterações no renderizador. **CI novo pendente nesta anotação**; não declarar correção validada antes do verde.

Próximo passo: verificar o CI estrito, conferir se J08/P09/A07 passaram de descartados para renderizados, e analisar as capturas sem confundir cue instanciado com visibilidade humana. G.2 em PCs físicos permanece pendente.

## Fechamento do incremento — CI estrito aprovado, com ressalvas

- **SUCCESS:** [V5 H3 — M10 Rare Equipped WebGL, run 41348463224](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41348463224), commit `d370742c334074873664fdc7277fe1085b7c1c67`. Node H.0 e regressão M5, Chromium/SwiftShader com 30 GLBs, câmera `duel → climax → victory`, 29 espectadores e três capturas individuais passaram.
- Seed determinística `20261101`: `guardian:J08` 1 proc, `hunter:P09` 1 proc, `mage:A07` 4 procs. **Todos os três cues passaram a constar como renderizados e não descartados**, preservando a seleção de 10 talentos/20 pontos e retorno M5 de 5 talentos. O screenshot é amostra após detecção cumulativa, não prova enquadramento ou legibilidade humana.
- Diagnóstico da primeira correção: [runs 41348178662](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41348178662) e [41348182230](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41348182230) **FAIL**, porque a vaga adicional de proc ainda competia com até 18 anéis de aviso. A correção final `d370742c` reutiliza um aviso antigo antes de inserir um único proc, respeitando o teto existente de 18 efeitos simultâneos; não altera física nem o motor.
- **QA geral de regras:** [41348463250](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41348463250) aprovado. **G.1 navegador:** [41348463227](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41348463227) falhou em contagem de texturas após reinício (211→385→559), sem ligação causal demonstrada com a mudança M10; foi solicitada repetição do job antes de classificar como regressão. Outros jobs de navegador estavam em execução na última consulta. Não declarar suite inteira verde.

**Próxima rodada da mesma Missão 10:** verificar os demais workflows e o reteste G.1, avaliar capturas de J08/P09/A07 em tela/projetor e confirmar que a vaga rotativa mantém legibilidade em seeds/qualidades variadas. G.2 nos PCs físicos e H.1/H.2 reais seguem bloqueados.

## Reteste de regressão G.1 e QA cruzado

- [G.1 run 41348463227](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41348463227): **SUCCESS na segunda tentativa**, ambos os jobs verdes. A primeira tentativa acusou contagem de texturas 211→385→559 em reinícios de GPU no SwiftShader; o reteste passou sem alteração adicional de código. Isso indica intermitência de medição/aquecimento, **não prova** ausência de vazamento em hardware físico.
- [QA geral 41348463250](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41348463250), [Browser QA 41348463216](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41348463216), [M10 WebGL 41348463256](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41348463256), [VFX mistos 41348463170](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41348463170) e [F3 câmera 41348463283](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41348463283): **SUCCESS** no SHA `d370742c`.
- O job `V5 Arena Lab — GLBs reais e teste M5/M10` ainda estava em execução na última consulta; não declarar a matriz inteira finalizada.

**Status da missão:** incremento de renderização de J08/P09/A07 concluído e verificado em WebGL fictício. A Missão 10 como um todo permanece aberta para inspeção humana, diversidade de seeds, legibilidade no projetor e G.2 físico.
