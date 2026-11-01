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

## Rodada seguinte — legibilidade do projetor em qualidade reduzida (01/11/2026)

**Estado anterior verificado:** o gate de três execuções WebGL (duas seeds normais e uma emulação de 2 GB/`low`) concluiu **SUCCESS** no [run 41358337429](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41358337429), SHA `05258583f554d9e43b56f5facf5d8e4c27f15b44`. Isso fecha apenas o gate anterior de eventos raros em modo reduzido; não valida leitura no telão.

**Nova missão técnica isolada:** reaproveitar a auditoria já existente de HUD, contraste e navegação em modo imersivo para avaliar o mesmo Coliseu de 30 personagens também com `navigator.deviceMemory=2` e `sprites=1`, nas resoluções **1920×1080** e **1366×768**. O teste exige o preset `low`, atlas de 3 quadros e texturas de talentos, além das verificações existentes de largura/altura, sobreposição de nomes, controles, amostras de contraste, foco e acessibilidade. A comparação preserva o teste original em `auto` e cria relatórios/capturas separados para `low`. Capturas e amostras CSS não são prova de legibilidade humana ou de FPS real.

**Arquivos alterados exclusivamente na branch:** `qa/v5-m10-legibility-browser.cjs` no commit [`744a743`](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/commit/744a743ad3dbd84132032d34064d3996f1e612a0) e `.github/workflows/v5-m10-visual-qa.yml` no commit [`6a08933`](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/commit/6a08933fd9d8c5658c317f59d48005e58d316355), com novo job independente `projector-legibility-low-webgl`. Nenhum arquivo do motor, XP, aulas, classe, catálogo, regras ou banco foi modificado.

**CI novo:** [run 41363113278](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41363113278), SHA `6a08933fd9d8c5658c317f59d48005e58d316355`, **em andamento na consulta**. QA geral do commit de teste `744a743` passou no run `41363101520`; não extrapolar esse resultado para o novo job WebGL. Caso o job `projector-legibility-low-webgl` falhe, examinar logs, corrigir e retestar na mesma Missão 10.

**Próximo passo:** conferir todos os jobs e os dois screenshots de modo reduzido; corrigir sobreposições ou perda de legibilidade apenas se houver evidência. **G.2 nos PCs físicos não executado**; leitura humana no projetor, balanceamento definitivo, H.1/H.2, Fase I e `main` continuam bloqueados.

### Resultado confirmado do novo gate de projetor `low`

O job **`projector-legibility-low-webgl` concluiu SUCCESS** no [run 41363113278](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41363113278), SHA `6a08933fd9d8c5658c317f59d48005e58d316355`. O log comprova `node --check`, 30 KayKits, 10 talentos/20 pontos, contrato M5 e auditoria de geometria/contraste/navegação no Chromium/SwiftShader. **1920×1080:** palco 1900×885, fonte do destaque 16px, nome do talento 12px, 9 nicknames visíveis, sem truncamento. **1366×768:** palco 1346×573, fontes 16px/12px, 4 nicknames visíveis, sem truncamento. O relatório/capturas estão no artefato `m10-projector-legibility-low` do mesmo run. A verificação de `quality=low`, 3 quadros de sprite e texturas foi executada pelo teste, sem falhas. O job `final-roster` também concluiu SUCCESS; **os demais jobs WebGL do workflow ainda estavam em andamento na consulta**, portanto o workflow inteiro não está homologado. QA geral do SHA `6a08933` concluiu SUCCESS no [run 41363113291](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41363113291).

**Limite:** número de nomes visíveis é amostra de câmera pausada, não medida de leitura por pessoas; `deviceMemory=2` não limita fisicamente RAM/GPU. **G.2 e homologação humana continuam pendentes.** Próximo passo: acompanhar os jobs restantes e inspecionar as capturas do artefato; não alterar balanceamento sem evidência.

### Fechamento do CI desta rodada

O [workflow WebGL completo 41363113278](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41363113278) concluiu **SUCCESS — 5/5 jobs** no SHA `6a08933fd9d8c5658c317f59d48005e58d316355`: `final-roster`, `final-webgl`, `spectator-camera-webgl`, `projector-legibility-webgl` (auto) e `projector-legibility-low-webgl` (emulação 2 GB). [QA geral 41363113291](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41363113291) e [Browser QA 41363113264](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41363113264) também concluíram **SUCCESS** no mesmo SHA. O incremento técnico de legibilidade `low` está encerrado **apenas em CI/SwiftShader**. Não representa aprovação humana nem validação G.2. A próxima rodada da Missão 10 deverá inspecionar as capturas do artefato e investigar legibilidade de efeitos em quadros concretos, mantendo as regras intactas.
