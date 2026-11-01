# H.3 / Missão 10 — gate WebGL de qualidade reduzida (01/11/2026)

**Status: CI pendente; NÃO homologado.** Branch exclusiva `feature/v5-arena-dos-criadores`; nenhuma alteração na main, banco, usuários, turmas, XP, aprovações, notas ou produção.

## Estado inicial

HEAD lido: `7d0b77e41aa81bd4d38dce4d89d7da88cd4b4e`. Consultados `ROADMAP-D-A-I.md`, `FASE-E-CHECKPOINT.md`, `FASE-F-CHECKPOINT.md`, `FASE-G-CHECKPOINT.md`, `FASE-H0-CONTRATO.md`, commits e workflows recentes. O gate anterior de duas seeds (run `41353182444`) passou em SwiftShader, mas não verificou o preset `low` nem a leitura humana dos cues no projetor.

## Incremento isolado desta rodada

- `qa/v5-m10-rare-equipped-browser.cjs` (commit `9c6fa98c7c93efcefa0a8781cd0130ba15741e65`): flag **somente de QA** `M10_RARE_LOW=1`, emula `navigator.deviceMemory=2` antes do carregamento, mantém `prefers-reduced-motion=no-preference` para isolar o preset gráfico e exige `data-v5-quality-mode=low`, atlas com **3 quadros**, sprites disponíveis, 30 KayKit, 10 talentos, proc raro renderizado para cada talento efetivamente acionado, 29 espectadores e retorno M5 com 5 talentos. Os testes anteriores sem a flag mantêm seu comportamento.
- `.github/workflows/v5-m10-rare-equipped-qa.yml` (commit `05258583f554d9e43b56f5facf5d8e4c27f15b44`): executa terceiro browser gate com `M10_RARE_LOW=1`, além das duas seeds normais; anexa relatório e capturas próprios `qa/v5-m10-rare-equipped-low*`.
- A qualidade reduzida é **emulada no navegador**, não representa a GPU, RAM ou o FPS dos computadores da escola. O gate prova apenas a configuração gráfica e eventos observáveis em Chromium/SwiftShader; capturas após eventos cumulativos não provam que cada efeito estava no campo de visão do projetor no instante exato.

## Verificações e pendências

CI específico: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-m10-rare-equipped-qa.yml — **aguardar conclusão e corrigir se falhar**. Não marcar aprovado antes do resultado.

Próximo passo na mesma Missão 10: conferir o resultado e os artefatos de qualidade reduzida; caso algum proc seja descartado, investigar limite visual sem mexer em dano, escolhas, XP ou M5. Inspeção humana de legibilidade e teste físico **G.2** ainda não realizados; H.1/H.2 reais e integração continuam bloqueados.
