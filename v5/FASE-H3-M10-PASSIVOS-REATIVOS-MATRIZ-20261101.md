# PIT Game Jam IA V5 — H.3/M10: matriz de procs passivos e reativos (01/11/2026)

**Missão em andamento:** validação isolada do motor da arena final da **Missão 10**; nenhuma alteração em regras, builds reais, conteúdo/ordem das dez missões, XP, aprovação, contas, turmas, banco, `main`, produção ou integração H.1/H.2.

## Escopo e alteração

- Branch exclusiva: `feature/v5-arena-dos-criadores`.
- Base consultada no início: `e73513ad680bbabca2711619e52dfd7946df4120`; roadmaps `ROADMAP-D-A-I`, checkpoints E/F/G, contrato H.0 e Actions recentes.
- Teste reforçado: `qa/v5-m10-passive-reactive-events.cjs`, commit **`31d2223f1fdd4e855d81c486e898f45d2dc817c4`**.
- Novo subteste: 11 variantes canônicas × 2 seeds, **22 batalhas fictícias de 30 personagens**. A matriz separa talentos **selecionados**, eventos `proc` efetivamente emitidos e eventos `charge` (prontidão, não animação). Para cada evento, verifica personagem, talento equipado, classe canônica, metadados de VFX/sprite/coreografia e ausência de atribuição incorreta D07. Cada build continua com **10 talentos e 20 pontos**; o caminho padrão M5 permanece com **5 talentos e 10 pontos**.
- O diagnóstico original de 4 seeds permanece no mesmo teste; relatório JSON `qa/v5-m10-passive-reactive-report.json` é gerado no CI como artefato, sem IDs de alunos reais.

## Evidência verificada no GitHub Actions

- **CI específico SUCCESS:** [run 41332871342](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41332871342), job `event-coverage`. Log: 22/22 partidas da nova matriz concluídas, **36/36 talentos passivos e 24/24 reativos selecionados e com pelo menos um `proc` observado**. Isso é cobertura de evento em amostra sintética, **não** comprovação de frequência, efeito visual na tela ou balanceamento.
- Diagnóstico original (4 seeds): 36 passivos e 24 reativos equipados; 34 passivos e 23 reativos com `proc` observável; três IDs sem trigger nessa amostra menor (`guardian:J08`, `hunter:P09`, `mage:A07`). Todos apareceram na matriz ampliada; ausência em poucas seeds não é defeito. O `J08` registrou 4 `charge` no diagnóstico original, que não foram contados como `proc`.
- **13 consumos D07** rastreados, **zero atribuições anômalas**, regressão M5 idêntica.
- **QA geral SUCCESS:** [run 41332871365](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41332871365).
- **QA navegador:** [run 41332871347](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41332871347), ainda em execução na última verificação; não afirmar aprovação até concluir.

## Pendências / próxima rodada da MESMA Missão 10

Conferir resultado do QA navegador no SHA desta rodada. Em seguida, escolher procs de baixa frequência e testar a **legibilidade visual efetiva** em WebGL (HUD, câmera, sprites e arquibancadas) em builds mistas de 30 personagens, sem alterar o catálogo, regras ou balanceamento por suposição. Validar G.2 **nos PCs físicos da escola** continua pendente; CI com SwiftShader não substitui hardware. H.1/H.2 com alunos reais, homologação humana, Fase I, merge e produção continuam bloqueados.
