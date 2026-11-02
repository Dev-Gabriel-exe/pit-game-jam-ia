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

## Rodada seguinte — integração opt-in no renderizador (02/11/2026)

**Tarefa em andamento:** observar o primeiro quadro WebGL de cues reais da Missão 10 sem alterar combate nem habilitar a integração com alunos.

**HEAD de implementação:** `5d5bff0e8f979db4f33c468ea8d5ad55dfc86b1b`. Commits exclusivos da branch:
- `1948139555ce3c57ca0290f1f69d2ed62313ecf2` — `v5/arena-three.js`: `?m10visualqueue=1` ativa uma fila de até 18 cues confirmados. Procs sutis são enfileirados com chave canônica e posição, sem dados de alunos. No loop, após atualização/expiração dos efeitos, apenas um cue é despachado antes do WebGL; no modo padrão, o comportamento anterior permanece. A fila é zerada no reset e não despacha na M5.
- `c85841c93cf3b5d2f6664b05571e8fef43dc39a8` — `v5/arena-lab.html`: carrega o escalonador isolado, desativado por padrão.
- `00abed4c9b587ce67cd4541df638ce9730eab41f` — `qa/v5-m10-rare-equipped-browser.cjs`: valida contadores da fila, 30 modelos, procs raros, primeiro quadro e reset M5 com flag explícita.
- `5d5bff0e8f979db4f33c468ea8d5ad55dfc86b1b` — `.github/workflows/v5-m10-visual-queue-qa.yml`: job `queue-first-frame-webgl` com Chromium/SwiftShader e artefatos.

**CI novo:** [run 41389498122](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41389498122) — **em fila na primeira consulta**, portanto **não aprovado**. [QA geral 41389498116](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41389498116) e [Browser QA 41389498097](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41389498097) também estavam em fila.

**Critérios de saída desta tarefa:** CI específico WebGL sem erros, eventos genuínos J08/P09/A07 efetivamente apresentados por pelo menos um frame quando aceitos, sem estouro da fila ou regressão M5. Mesmo passando, não confundir projeção no frustum com pixels visíveis nem homologação em projetor.

**Próximo passo:** conferir logs/artefatos do CI; corrigir se falhar e retestar **a mesma Missão 10**. Medir descartes por saturação da fila, comparar duas seeds e preservar a política de 18 efeitos simultâneos. G.2 nos PCs físicos e homologação humana não realizados. H.1/H.2, Fase I, `main`, XP, notas, alunos e produção continuam fora do escopo.


## Rodada — diagnóstico de saturação por chave canônica (02/11/2026)

**Missão 10 ainda aberta; nenhum efeito raro homologado.** Antes de alterar a política de prioridade, foi verificado o resultado do [CI 41389498122](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41389498122): `isolated-queue` PASS, mas `queue-first-frame-webgl` **FAIL** com `Real rare proc did not obtain the bounded M10 subtle visual lane: guardian:J08`. O job publicou três screenshots, mas não o JSON porque a asserção interrompia o teste antes da gravação. Capturas de câmera não provam pixels do talento visíveis.

**Incremento técnico desta rodada (sem mexer em combate, talentos, progressão, câmera ou orçamento de 18):**
- `837c428b83364ac4c85ab5b76f203d98ed0294f3`: `v5/m10-visual-queue.js` passa a contar aceites, rejeições e despachos **por chave canônica**, sem guardar dados pessoais, preservando o round-robin, o limite 18 e o despacho de um cue por quadro.
- `c7bbbc871081af9379a075feecdf6dba28d60f15`: `qa/v5-m10-visual-queue.cjs` testa os contadores por chave, reset e saturação de 1.000 eventos. O job `isolated-queue` foi confirmado **SUCCESS** no [run 41395297149](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41395297149), sem extrapolar para WebGL.
- `c840fb7dcb4e8e9b98ca05a79f2f5f4f314e9eb4`: `v5/arena-three.js` expõe `data-v5-m10-visual-queue-by-key` **somente no laboratório opt-in**.
- `e1271be293661b87361080e8af97cdab40c9b78c`: `qa/v5-m10-rare-equipped-browser.cjs` persiste `qa/v5-m10-queue-webgl.json` também no caso de falha, incluindo asserção, aceites/rejeições/despachos por talento e as chaves com cue registrado.

**CI da versão completa:** [run 41395317928](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41395317928) — jobs em fila na consulta; **não aprovado**. Runs intermediários podem falhar ou ser cancelados por concorrência e não substituem o gate do último SHA. Este incremento é observabilidade, **não correção da perda visual**.

**Próximo passo na mesma missão:** obter o JSON do run final, diferenciar rejeição da fila de descarte no orçamento WebGL, e somente então ajustar a política visual com teste de regressão para M5. Repetir WebGL com 30 KayKits, 10 talentos/20 pontos, câmera, 29 espectadores e três procs raros. G.2 nos PCs físicos, avaliação humana no projetor, H.1/H.2, Fase I e main seguem bloqueados.
