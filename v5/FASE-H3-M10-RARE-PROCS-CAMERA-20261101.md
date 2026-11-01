# PIT Game Jam IA V5 — H.3/M10: J08, P09 e A07, procs raros e proveniência visual (01/11/2026)

**Escopo:** somente arena final M10 em laboratório fictício. Branch exclusiva `feature/v5-arena-dos-criadores`; sem merge, deploy, usuários, XP, notas, aprovações, banco ou turmas reais.

## Estado consultado antes da rodada

HEAD anterior: `e29ead07bfb6c6b86ee5b2eb9d3117129e609976`. Lidos `v5/ROADMAP-D-A-I.md`, `v5/FASE-E-CHECKPOINT.md`, `v5/FASE-F-CHECKPOINT.md`, `v5/FASE-G-CHECKPOINT.md` e `v5/FASE-H0-CONTRATO.md`, os 12 commits mais recentes e o status do GitHub Actions. Runs anteriores no HEAD: QA geral `41338269537`, quatro heróis `41338269552`, navegador `41338269604` todos **SUCCESS**. CI de VFX `41337962462` também **SUCCESS**. Não houve homologação humana.

## Incremento isolado nesta rodada

- `qa/v5-m10-rare-procs.cjs` — commit `3390663f5c47ce6e3d2e21d8fe9fe574b9a08359`: teste de 11 variantes x 2 seeds = 22 batalhas sintéticas de 30 heróis; busca `guardian:J08` (passivo), `hunter:P09` (reativo) e `mage:A07` (passivo). Verifica seleção legítima, `proc` real do motor, atribuição ao dono e descriptor canônico de sprite/coreografia. Distingue `charge` de `proc`. Valida orçamento M10 de 10 talentos/20 pontos e regressão M5 idêntica com 5 talentos/10 pontos.
- `qa/v5-m10-mixed-vfx-browser.cjs` — commit `11bb8e7a26ecea974cd0af1ba827f17b29b99766`: acrescenta ao relatório WebGL `rareVisual` por chave: selecionado, cue renderizado, cue descartado por orçamento, e quais das três capturas já continham o ID. Não inventa visibilidade no enquadramento: cue instanciado pode estar fora da câmera.
- `.github/workflows/v5-m10-mixed-vfx-qa.yml` — commit `12d1e70096850d9a5a55276fc4dd26e88509b544`: passa a executar teste de procs no job específico e anexar relatório JSON de procs junto aos três PNGs e JSON de WebGL.

## Evidências e limites

Workflow específico: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-m10-mixed-vfx-qa.yml

**Estado inicial do novo CI: PENDENTE.** Confirmar execução no SHA `12d1e700` e corrigir se falhar. Não declarar sucesso antes do CI verde. A matriz Node é evento do motor; o WebGL fornece IDs de cues, **não** comprova que o efeito é perceptível por alunos ou visível na câmera em todo momento.

## Próximo passo na MESMA Missão 10

Inspecionar o JSON/PNG produzido, comparar os três IDs raros com as variantes selecionadas e verificar se são renderizados ou descartados por orçamento. Se não estiverem equipados na variante padrão do navegador, preparar variante de laboratório explícita e isolada para exercitá-los em câmera, sem mudar as regras de combate. Avaliar legibilidade humana e G.2 em PCs físicos separadamente. H.1/H.2 reais seguem bloqueadas.

## Fechamento da rodada — CI verde e lacuna visual identificada

- **SUCCESS**: [CI específico 41343079296](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41343079296), SHA `dce39ea59ab27b55057a8baa3c0e27eecb49ff56`; contrato, 22 batalhas fictícias, WebGL com 30 GLBs, três capturas e regressão M5 aprovados.
- **SUCCESS**: [QA geral 41343079287](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41343079287) e [Browser QA geral 41343079303](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41343079303), no mesmo SHA.
- **Procs reais no motor, 22 partidas:** `guardian:J08` selecionado em 14 batalhas, 17 procs em 11 batalhas; `hunter:P09` selecionado em 18, 10 procs em 6; `mage:A07` selecionado em 16, 11 procs em 5. Todos os três possuem sprite e coreografia canônicos. Isso é evidência de evento do motor, **não de pixels visíveis**.
- **Auditoria WebGL da variante padrão:** `guardian:J08` **não equipado**, `mage:A07` **não equipado**; `hunter:P09` **equipado, porém sem cue renderizado nem descartado detectado nesta partida**. Isso não prova defeito: o proc pode não ter ocorrido nessa seed. O navegador não verificou a linha de visão humana para nenhum desses três.
- Artefatos: 3 PNGs, JSON de WebGL e JSON de procs, no [run específico](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41343079296). Commit adicional `dce39ea5` imprime o resumo raro no log do CI para auditoria sem download do ZIP.

**Próximo incremento na mesma Missão 10:** criar variante sintética explicitamente selecionável no laboratório WebGL (sem tocar em alunos) para equipar os três raros; encontrar seed com proc real de cada um e verificar, no palco, renderização ou descarte por limite, além de registrar câmera no instante do evento. Não declarar legibilidade humana nem G.2 até validação física.
