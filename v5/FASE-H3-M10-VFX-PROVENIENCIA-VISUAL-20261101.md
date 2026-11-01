# PIT Game Jam IA V5 — H.3/M10: proveniência dos efeitos visuais por talento (01/11/2026)

**Missão atual:** arena final da Missão 10, ainda em validação. Incremento isolado para identificar efeitos de talentos realmente renderizados versus descartados por limite visual em um combate fictício de 30 KayKits.

## Estado lido no começo da rodada

- Branch exclusiva `feature/v5-arena-dos-criadores`, HEAD inicial `dc7fd4d222f58a2f1fe54714fa1bb45b9a8ef91d`.
- Consultados `v5/ROADMAP-D-A-I.md`, `v5/FASE-E-CHECKPOINT.md`, `v5/FASE-F-CHECKPOINT.md`, `v5/FASE-G-CHECKPOINT.md` e `v5/FASE-H0-CONTRATO.md`, mais os commits e workflows recentes.
- Os runs anteriores `41332871342` (procs) e `41332871347` (navegador) estão **SUCCESS**. A matriz de 22 batalhas comprovou procs de 36 passivos e 24 reativos no **motor**, não sua renderização efetiva.

## Incremento realizado

1. `v5/arena-three.js` — commit `51af497cab1dc297a436730abf52770f4cafac2e`: acrescenta dois conjuntos limitados de **IDs canônicos distintos** efetivamente desenhados e descartados pelo orçamento de VFX. Publica apenas `data-v5-talent-fx-rendered-keys` e `data-v5-talent-fx-dropped-keys` no palco do laboratório, com valores JSON ordenados. Atualiza a string apenas quando surge novo ID, sem serializar por quadro. Reinício da arena zera os conjuntos. `charge` de prontidão não é contado como sprite. Sem nomes, IDs reais, XP ou alteração de combate.
2. `qa/v5-m10-mixed-vfx-browser.cjs` — commit `94fb811217afaefbf2134ca214037de4b3906efc`: na simulação WebGL com 30 KayKits, verifica que cada ID desenhado/descartado pertence aos talentos **equipados** de uma das quatro classes e ao catálogo canônico, sem duplicação, com monotonicidade entre três capturas, sem mais IDs distintos que eventos, e com efeitos reais dos três tipos até o fim. Exige também que trocar para M5 zere a proveniência da M10.
3. Workflow existente `.github/workflows/v5-m10-mixed-vfx-qa.yml` já cobre ambos os caminhos alterados, executando Chromium + SwiftShader e salvando PNG/JSON. Nenhum novo workflow necessário.

## CI / evidência

- [Workflow específico — run 41337962462](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41337962462), disparado no commit `94fb8112`. **PENDENTE de resultado no momento deste checkpoint**. Não declarar teste WebGL aprovado antes de sucesso.
- [QA geral — run 41337962475](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41337962475), em execução na última consulta.
- [Browser QA geral — run 41337962532](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41337962532), em execução na última consulta.

## Próximo passo — continuar a MESMA Missão 10

Conferir os três runs; se o CI falhar, corrigir a falha observada. Examinar o artefato JSON de VFX por talento, especialmente `guardian:J08`, `hunter:P09`, `mage:A07`, e identificar quais foram efetivamente desenhados ou descartados em vez de inferir pelo evento do motor. Avaliar visibilidade humana na tela e nos PCs físicos G.2 posteriormente. Manter o motor M5 (5 talentos/10 pontos), M10 (10/20), as quatro classes e 120 talentos canônicos, câmera, arquibancadas e roteiros inalterados.

**Limites:** SwiftShader não é teste G.2 nos PCs reais; não há integração H.1/H.2, alteração em alunos, notas, aprovações, XP, banco, `main` ou deploy. Sem homologação visual humana.
