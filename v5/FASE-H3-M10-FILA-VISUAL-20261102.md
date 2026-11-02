# H.3 / M10 — checkpoint de fila visual isolada (02/11/2026)

## Escopo e estado
**Missão em andamento:** evitar que os procs canônicos J08, P09 e A07 sejam substituídos antes do primeiro quadro WebGL. O diagnóstico anterior comprovou descarte prematuro. As duas correções diretas anteriores falharam no CI e foram revertidas no SHA `7a77719e18bb90c960efbacfe822c551b911f6ef`. **Esta rodada não declara a falha visual corrigida.**

## Incremento desta rodada (sem alterar o renderer)
- `v5/m10-visual-queue.js` — escalonador visual **isolado, ainda não conectado** ao `arena-three.js`. Recebe somente chave canônica e posição fictícia, limita a fila a 18 eventos, não retém objetos do motor nem dados pessoais, distribui FIFO por chave com alternância entre chaves e libera no máximo uma entrada por índice crescente de quadro renderizado. Não produz golpes, dano, aprovação, XP ou efeitos 3D por conta própria.
- `qa/v5-m10-visual-queue.cjs` — contrato de capacidade 18, descarte controlado de excesso, justiça entre três talentos raros, proteção contra dois despachos no mesmo quadro, cópia imutável, reset, 1.000 eventos sintéticos e orçamentos M5 (5/10) e M10 (10/20).
- `.github/workflows/v5-m10-visual-queue-qa.yml` — CI Node isolado com regressões H.0 e M10. Nenhum login, banco, turma ou servidor é usado.

## Rastreabilidade
- Branch exclusiva: `feature/v5-arena-dos-criadores`.
- Commits desta rodada: `2966c2633ec46febb66cfeecdca4a7a318cbc920` (fila), `e1142f91fe0409ccfa8c1de8237b62a565fc8ff1` (teste), `647486e546f79a846fbdddfd6c050cfefee0fe6d` (workflow).
- Testes específicos: consultar [Actions — M10 Bounded Visual Queue Contract](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-m10-visual-queue-qa.yml). **Não marcar como aprovado até o run terminar.**
- Estado anterior: [QA geral aprovado no SHA de restauração](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41380123966); [diagnóstico de efeito prematuramente descartado](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41379388325). Há falhas de G.1 em runs anteriores que devem ser avaliadas separadamente.

## Próxima ação, ainda na mesma Missão 10
1. Conferir e corrigir qualquer falha do novo contrato no CI.
2. **Somente após aprovação**, integrar a fila ao `arena-three.js` de modo opt-in para M10, marcando efeitos como apresentados **após** `renderer.render`, sem alterar M5, limites de efeitos, câmera, sprites ou física. Não inferir visibilidade em pixels a partir de contadores.
3. Executar novamente o teste WebGL de `qa/v5-m10-rare-equipped-browser.cjs` com `M10_FX_PROBE=1`, verificar `evictedBeforeFrame`, amostras no frustum, 30 KayKits, 29 espectadores e regressão M5. Se falhar, manter a missão aberta.

**G.2 não executado nos PCs físicos.** H.1/H.2 com alunos reais, autenticação, persistência e Fase I bloqueadas até validação e autorização explícita. Sem `main`, merge, deploy ou dados reais.

## Resultado confirmado do CI nesta rodada

**PASS** — [GitHub Actions run 41384060519](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41384060519), SHA `647486e546f79a846fbdddfd6c050cfefee0fe6d`. Job `isolated-queue` concluído com sucesso: `Syntax and bounded queue contract` e `Preserve M5 and M10 pedagogical contract` ambos aprovados. Esta aprovação cobre **somente o contrato isolado da fila** e regressões Node, não a integração ao WebGL nem a visibilidade dos três talentos raros. Browser QA geral de commits recentes ainda deve ser consultado separadamente.
