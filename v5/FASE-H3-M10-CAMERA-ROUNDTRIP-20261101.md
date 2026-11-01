# H.3 / Missão 10 — regressão de troca M10 → M5 → M10 (01/11/2026)

**Escopo:** teste isolado de laboratório, sem alunos, autenticação, turmas, banco, XP ou alterações em regras pedagógicas. Branch exclusiva `feature/v5-arena-dos-criadores`. **Não houve merge nem deploy.**

## Missão técnica desta rodada

Verificar no navegador Chromium/WebGL que uma partida fictícia com **30 personagens KayKit** e dez talentos por personagem pode:
1. Executar a arena M10 até um KO, migrar o aluno fictício da câmera individual para a câmera compartilhada do professor e terminar a batalha.
2. Reiniciar e voltar para M5 sem herdar espectadores na arquibancada, câmera de aluno, vencedor anterior ou dez talentos. A M5 deve expor **cinco talentos**.
3. Retornar à M10 na mesma aba, recarregar 30 GLBs e recuperar **exatamente as dez escolhas de talentos de cada um dos 30 personagens**, a seed explícita, câmera docente e arquibancadas vazias, com partida pronta para reiniciar.

**Arquivos alterados:** `qa/v5-m10-spectator-browser.cjs`; workflow existente `.github/workflows/v5-m10-visual-qa.yml` executa esse teste no job `spectator-camera-webgl`.

**Commits do incremento:** `4e2a1c3f6c17bdc4e12dd9b4ef955863b36f05a1` (regressão) e `0ad3eeb2c07eaafbae044845fe9e5579a1418e5c` (espera de carregamento). **CI do segundo SHA verificado e aprovado**: os quatro jobs do workflow M10, inclusive `spectator-camera-webgl`, concluíram `success` no run [41317571869](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41317571869). Os workflows gerais [QA 41317571811](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41317571811) e [Browser QA 41317571820](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41317571820) também concluíram `success`.

## Evidências e limites

- Workflow: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-m10-visual-qa.yml
- Teste específico: `qa/v5-m10-spectator-browser.cjs`; usa Playwright Chromium com SwiftShader e modelos KayKit de verdade.
- O teste de hardware **G.2 nos PCs físicos não foi realizado**; FPS de CI não valida hardware.
- H.1/H.2 com alunos reais permanecem bloqueadas até G.2 e autorização explícita.
- Ainda pendem homologação visual humana, balanceamento definitivo e teste físico de 30 personagens.
- **Incremento concluído no laboratório automatizado**, não homologação final. **Próximo passo:** ampliar ensaios com variações de builds/atributos e observar legibilidade da arquibancada/câmera em PC real quando G.2 for autorizado e executado. Continuar na Missão 10.
