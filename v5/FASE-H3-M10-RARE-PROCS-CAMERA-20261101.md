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
