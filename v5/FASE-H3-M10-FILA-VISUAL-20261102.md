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


## Rodada — admissão justa sob saturação (02/11/2026, após CI 41395317928)

**Missão 10 em andamento; correção visual ainda NÃO homologada.** O run [41395317928](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41395317928) terminou com `isolated-queue` PASS e `queue-first-frame-webgl` **FAIL**. O JSON publicado no [artefato 13119307229](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41395317928/artifacts/13119307229) comprovou a causa: **47** cues aceitos, **335** rejeitados e **47** despachados. As rejeições incluem `guardian:J08=1`, `hunter:P09=1` e `mage:A07=4`; nenhum dos três foi aceito/despachado. O motor registrou 1/1/4 procs genuínos e a arena terminou com 29 espectadores. Logo, o problema observado é **saturação da fila na admissão**, antes de qualquer análise de frustum/pixels.

**Incremento realizado somente no laboratório opt-in:**
- `bbe28090c92c1b175b0641a65133b6f0f2bf3592` — `v5/m10-visual-queue.js`: em fila cheia, um talento canônico ainda não despachado pode ocupar o lugar de **um cue redundante** de uma chave super-representada. Preserva 18 entradas, alternância por chave, limite de um despacho por quadro e proteção de chaves únicas; registra `evicted` e `evictedByKey` no snapshot. Não altera combate, câmera, stats, dano, RNG, talentos, XP ou dados reais.
- `2f333a2d1181b04f9632bda9b25fbafe7f2d4753` — `qa/v5-m10-visual-queue.cjs`: adicionados cenários de admissão de J08 com 18 slots ocupados, preservação de 18 cues únicos e contadores de evicção. A reprodução isolada local do algoritmo passou, mas **não substitui** os testes integrais do repositório.

**CI no SHA de testes:** [run 41401591801](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41401591801). `isolated-queue` PASS na primeira consulta; `queue-first-frame-webgl` ainda em execução, portanto sem aprovação visual. [QA geral 41401591837](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41401591837) PASS. Outros jobs WebGL/Browser QA em andamento.

**Próximo passo obrigatório:** consultar o novo artefato WebGL e confirmar que J08/P09/A07 foram **aceitos e despachados**. Se algum continuar rejeitado, ajustar a admissão sem extrapolar o teto de 18 e retestar. Mesmo com aceitação, conferir `renderedOnce`, projeção, screenshots e regressão M5; não confundir contadores com pixels legíveis. G.2 em PCs físicos não realizado; H.1/H.2 e homologação humana seguem bloqueados. Sem `main`, merge ou produção.


### Resultado verificado após CI (mesma rodada)

**PASS técnico limitado** — [run 41401591801](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41401591801), SHA `2f333a2d1181b04f9632bda9b25fbafe7f2d4753`: `isolated-queue` e `queue-first-frame-webgl` concluídos com sucesso. [Artefato 13121806027](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41401591801/artifacts/13121806027) contém JSON e screenshots. Também passaram [QA geral 41401591837](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41401591837), [Browser QA 41401591857](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41401591857) e os cinco jobs de [M10 WebGL 41401591762](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41401591762).

Na seed `20261101`, 30 KayKits, 10 talentos por personagem, 29 espectadores e regressão M5 para 5 talentos:
- `guardian:J08`: 1 proc genuíno, 1 cue criado, **1 quadro renderizado**, 0 descartes antes do primeiro quadro; centro da malha **fora do frustum** na amostra.
- `hunter:P09`: 1 proc, 1 cue criado, **1 quadro renderizado**, 0 descartes antes do primeiro quadro; centro **fora do frustum**.
- `mage:A07`: 4 procs, 1 cue criado, **1 quadro renderizado**, 0 descartes antes do primeiro quadro; 1 amostra **dentro do frustum**, sem captura sincronizada de pixels.
- Fila: 224 aceites, 158 rejeições, 53 despachos, 0 pendentes ao fim. A diferença **171** entre aceites e despachos indica substituições de cues pendentes e deve ser monitorada; não declarar perda visual resolvida em toda a carga.

**Conclusão precisa:** foi resolvido neste cenário o bloqueio absoluto dos três talentos antes do primeiro quadro; **não** foi demonstrada legibilidade real de J08/P09 no enquadramento, nem contraste/oclusão de A07 no telão. A Missão 10 permanece aberta. Próxima rodada: reduzir churn da fila e medir se os três procs aparecem em planos úteis com captura no quadro exato; repetir outras seeds e qualidade baixa. G.2 físico, homologação humana, H.1/H.2 e Fase I continuam pendentes.


## Rodada — proteção de cues únicos após saturação (02/11/2026)

**Missão em andamento:** H.3 / Missão 10, redução de churn visual **sem alterar o combate**. HEAD anterior `861081a02a2ddcb527a53694b9a88cb165221c86`. A evidência anterior ([CI 41401591801](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41401591801)) comprovou J08/P09/A07 renderizados uma vez, mas J08/P09 fora da câmera, com 158 rejeições e 171 substituições de fila. Isso não é homologação visual.

**Defeito concreto corrigido:** a seleção de vítima usava o histórico `seenByKey` para considerar redundante uma chave que já teve vários eventos, **mesmo quando restava somente um cue pendente dessa chave**. Uma nova chave inédita podia substituir esse único cue. A política agora só permite substituir cues quando a chave da vítima tem **mais de um evento efetivamente pendente**, priorizando a fila mais redundante. O limite de 18, despacho máximo de um por frame, justiça por chave, telemetria canônica e isolamento M5/M10 continuam intactos. Não há prioridade artificial para as três classes raras, nem novos efeitos, danos ou RNG.

**Commits desta rodada (somente branch experimental):**
- `45904c3d7631d3f275bedf5b87b17ffdd1d01f32` — `v5/m10-visual-queue.js`: proteção de singleton pendente e retirada da heurística de histórico.
- `d8b2a6b831316d0b2d000587db5ba1cbc665b581` — `qa/v5-m10-visual-queue.cjs`: regressão reproduzível de 3 slots (chave já despachada antes não pode perder o último cue) e ordem de despacho.

**Verificação:** [QA geral do SHA d8b2a6b8](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41408739821) **PASS**. [CI específico da fila](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41408739751), [CI M10 WebGL](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41408739755) e [Browser QA](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41408739754) estavam **em execução** na última consulta. Não declarar a política ou a projeção aprovada até concluir esses jobs.

**Próximo passo na mesma Missão 10:** conferir o resultado e o JSON do CI específico; comparar rejeições/substituições com o baseline 158/171, verificar se J08/P09/A07 continuam chegando ao primeiro frame e testar projeção em múltiplas seeds e enquadramentos. Se a nova regra impedir um talento raro de aparecer, corrigir e retestar. Um frame renderizado fora da câmera **não** é legibilidade homologada.

**G.2 em PCs físicos NÃO executado.** H.1/H.2 com alunos reais, homologação no projetor, merge/main, deploy e alterações de dados/XP/turmas permanecem proibidos.


### Reteste e correção após falha do WebGL (mesma Missão 10, 02/11/2026)

O experimento de **proibir toda evicção de singleton pendente** foi rejeitado: o [run 41408739751](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41408739751) concluiu `isolated-queue=PASS`, mas `queue-first-frame-webgl=FAIL`: `guardian:J08` não foi admitido no orçamento de 18. Portanto a proteção rígida NÃO foi mantida, e a conclusão do checkpoint anterior foi superada por este resultado.

**Incremento seguro efetivamente mantido:** restaurar a política de admissão que havia passado no [run 41401591801](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41401591801), mas **instrumentar quantos cues únicos pendentes ela substitui**. O objetivo agora é medir a perda antes de redesenhar a prioridade: `evictedSingleton` e `evictedSingletonByKey` ficam restritos à telemetria sintética do laboratório opt-in. O JSON do navegador passa a reconciliar `accepted = dispatched + remaining + evicted` e registrar evicções de singleton também em falhas.

**Commits após a falha:**
- `b1e994e8541330181461ae72ca33b00c92d52a2a` — `v5/m10-visual-queue.js`: restauração do algoritmo aprovado + contadores diagnósticos.
- `67b933d629ed39e971d3b5f62777472d84e7aa85` — `qa/v5-m10-visual-queue.cjs`: teste sintético reproduzível da evicção de singleton e reset.
- `9cfcaf5bc38d0cb7064128decd919eb53ede4f62` — `v5/arena-three.js`: expõe somente contadores por chave canônica no opt-in.
- `d64c54c4251ac16eb5ba95e41eeca65f9b79f6ac` — `qa/v5-m10-rare-equipped-browser.cjs`: grava métricas e reconciliação em JSON.

**Verificação:** [QA geral no SHA 67b933d6](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41408971387) PASS; `isolated-queue` no [run 41408971430](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41408971430) PASS. **CI completo do SHA d64c54c4**: [fila e WebGL 41409030122](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41409030122), [rare equipped 41409030199](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41409030199), [QA geral 41409030117](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41409030117) — **ainda em fila** na consulta. Não declarar aprovação final sem resultado desses jobs. Falha de um SHA intermediário não pode ser ignorada como sucesso.

**Próximo passo:** obter JSON da execução d64c54c4 e quantificar `evictedSingleton` / `evictedSingletonByKey` com os procs J08/P09/A07; só então propor política de prioridade que não prejudique a entrada dos raros. Verificar enquadramento, múltiplas seeds, M5 e qualidade baixa. G.2 físico e homologação humana continuam pendentes. H.1/H.2 e `main` permanecem bloqueadas.


## Rodada — recuperar cue raro após saturação do orçamento de efeitos (02/11/2026)

**Missão:** H.3 / Missão 10, laboratório opt-in `?m10visualqueue=1`. **SHA da implementação:** `e490e19feb1e5032bb659a60c8342d605cb52ab7`. A leitura inicial desta rodada confirmou HEAD `993815d5633b565a0c3c7b15e8eedd805671a845`, roadmaps D/E/F/G/H.0 e o CI anterior. O [run 41409030122](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41409030122) falhou no job WebGL: `mage:A07` tinha proc genuíno, mas não obteve efeito visual. Seu artefato JSON `13125056096` registrou `accepted=210`, `rejected=172`, `dispatched=34`, `evicted=176`, `evictedSingleton=165`; o Arcanista teve cue despachado mas nenhum quadro renderizado na amostra. Isso demonstra que o problema **não era apenas admissão da fila**, mas também a saturação do orçamento de efeitos já ativos no renderizador.

**Incremento realizado:** commit `e490e19`, arquivo `v5/arena-three.js`. No laboratório M10 com fila ativa, se os 18 slots de efeitos estiverem ocupados, um proc genuíno pode recuperar **um único cast antigo que já chegou ao WebGL ao menos uma vez**; nunca remove um cast ainda não renderizado. A marca `v5RenderedOnce` é atribuída somente após `renderer.render`, com contexto válido e malha visível. O teto continua em 18; não altera física, dano, RNG, ordem dos eventos, atributos, talentos, câmera, M5 nem dados reais. A nova regra não atua no modo padrão nem na M5.

**Verificação da implementação:** [CI fila 41416283860](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41416283860) **SUCCESS** em `isolated-queue` e `queue-first-frame-webgl`; [QA geral 41416283782](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41416283782) **SUCCESS**, [Browser QA 41416283879](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41416283879) **SUCCESS**, [M10 WebGL 41416284085](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41416284085) **SUCCESS**. Artefato da fila `13128325875`: 30 KayKits, seed `20261101`, 29 espectadores, regressão M5 para cinco talentos e reset da fila; `J08`, `P09`, `A07` alcançaram **1 quadro WebGL cada** (nenhum descartado antes do primeiro quadro). A07 ainda teve descartes adicionais de proc; métricas de fila **antes do reset M5**: 233 aceites, 149 rejeições, 48 despachos, 185 evicções, 167 de singleton. O campo `queueAtExit` do JSON é zerado pelo teste M5 e **não** representa a carga M10; usar `visualQueue` para comparação.

**Limites:** nenhum dos três efeitos teve amostra projetada dentro do frustum nessa execução; as screenshots são posteriores à detecção acumulada e não provam pixels visíveis no momento do talento. A regra melhora a admissão no orçamento WebGL, mas **não homologa legibilidade, equilíbrio ou fluidez**. O CI raro adicional [41416283922](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41416283922) ainda estava em andamento na consulta do checkpoint. Não declarar sua aprovação antecipadamente.

**Próximo passo na MESMA Missão 10:** validar o CI raro adicional, repetir com outras seeds/câmeras e capturar o quadro exato do proc visível (não apenas contador acumulado); comparar perdas e legibilidade de casts ativos, sobretudo no modo de baixa qualidade. **G.2 PCs físicos não realizado**; homologação humana, H.1/H.2 com alunos, Fase I, merge/main, produção, XP, notas e turmas continuam bloqueados.


## Rodada — matriz de enquadramento por plano da câmera (02/11/2026)

**Tarefa H.3 / Missão 10 ainda aberta.** HEAD inicial verificado: `cb805f46aade309a465140a6111272d2e938321e`. Revisados os roadmaps D–I, E, F, G e contrato H.0, commits recentes e CI. O [CI de talentos raros 41416283922](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41416283922) terminou **SUCCESS** na versão anterior, mas as três projeções raras estavam fora do enquadramento nas amostras. Isso não comprova pixels legíveis.

**Incremento experimental, somente telemetria opt-in `?m10fxprobe=1`:**
- `d9fb8e91bbbd8c1606466ce44d198e41c91833aa` — `v5/arena-three.js`: contagens de projeção dentro/fora do frustum por plano real do diretor (manual/overview/duel/highlight/climax/victory), além do primeiro frame projetado por talento com coordenadas NDC arredondadas. Observa **após** o desenho WebGL; não orienta câmera, física, RNG, combate ou talentos. Limpa os dados no reset/M5.
- `1210e5ea27c03d66a7272d999c0c41cd7d9529ef` — `qa/v5-m10-rare-equipped-browser.cjs`: exige reconciliação entre matriz por plano e totais de projeção, verifica primeira amostra visível e seu plano/posição, registra diagnóstico por J08/P09/A07 no JSON e exige limpeza na volta à M5. Não impõe que um talento fora da câmera seja falsamente declarado visível.

**Validação:** novo CI disparado pelos arquivos já incluídos no workflow [fila WebGL](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-m10-visual-queue-qa.yml) e [talentos raros](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-m10-rare-equipped-qa.yml). **Status do SHA novo: a confirmar; não declarar PASS até consultar o run final.** O CI do commit intermediário `d9fb8e91` iniciou em 02/11/2026 09:39 UTC; a implementação completa está no commit `1210e5ea`. Os testes devem provar que a matriz bate com os contadores e que a regressão M5 permanece íntegra; **a matriz não é screenshot no quadro exato nem prova de contraste/oclusão**.

**Próximo passo da mesma M10:** conferir o run do SHA `1210e5ea` e artefato JSON, comparar em qual plano J08/P09/A07 aparecem dentro/fora da câmera e repetir com seed independente e qualidade baixa antes de modificar composição de câmera. Preservar os 18 efeitos, 30 KayKits, 10 talentos/20 pontos e M5 5/10. G.2 em PCs físicos NÃO executado. H.1/H.2, homologação humana, merge, main, produção e dados reais bloqueados.


### Correção do reteste WebGL — limpeza M5 (02/11/2026)

O [run 41422487837](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41422487837) **FALHOU**, apesar de reconciliar a matriz por plano: na volta à M5, os novos atributos `data-v5-fx-probe-by-shot` e `data-v5-fx-probe-first-visible` continuavam com dados antigos, embora os mapas em memória fossem limpos. A regressão de M5 encontrou precisamente essa falha; não foi erro de talentos, dano ou progressão. O [run raro 41422487806](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41422487806) falhou pela mesma asserção de reset.

**Correção:** commit `9789574cd5fa386d794f8f7cd841898c04c6d039` em `v5/arena-three.js` limpa explicitamente ambos os atributos DOM no reset. Nenhuma regra pedagógica, de combate, câmera ou limite gráfico mudou. No teste anterior, a matriz registrou `guardian:J08` fora do frustum no plano `highlight`, `hunter:P09` fora em `duel` e `mage:A07` dentro em `highlight` (amostra de uma seed; não comprova contraste nem pixels).

**Reteste do SHA corrigido:** [fila 41422994442](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41422994442), [raros 41422994400](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41422994400), [QA geral 41422994492](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41422994492) — QA geral **PASS**, WebGL específico **em execução/aguardando** na consulta. O Browser QA do SHA anterior teve falha intermitente em `qa/v3-e2e.cjs` (aprovação fictícia não refletida a tempo); foi solicitada reexecução do job, **sem modificar aprovações, alunos ou dados**. Outros testes G.1/G.3 no runner anterior falharam por textura/timeout, sem evidência de defeito causal neste diagnóstico; permanecem abertos até reexecução.

**Próximo passo:** somente considerar a telemetria de enquadramento aprovada se os dois WebGL do SHA `9789574c` passarem. Depois repetir seed independente/low e inspecionar efeitos nos planos da câmera. G.2 físico, avaliação no projetor e H.1/H.2 reais seguem bloqueados.
