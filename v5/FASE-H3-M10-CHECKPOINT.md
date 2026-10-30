# V5 H.3 — Missão 10, motor experimental (checkpoint 30/10/2026)

**Estado:** primeiro incremento técnico da Missão 10 concluído e testado em Node/CI. **Não é a arena final visual, não está ligado à V3, a turmas reais, XP ou autenticação e não foi enviado à main.** A Fase G.2 nos PCs reais continua pendente. Manter o desenvolvimento isolado até validação e aprovação.

## Incremento entregue nesta rodada

- `v5/phase2-combat.js`: mesmo motor determinístico da M5 passa a aceitar **arenaMission:10** apenas por opção explícita. Sem esse parâmetro, a M5 continua limitada a cinco missões, cinco talentos e dez pontos de atributo. O modo final exige `approvedMissions:10` e `finalTrial:true` em cada entrada fictícia; não trata essa flag como autorização de servidor.
- `canonical(build,10,{experimentalFinal:true})`: aceita exatamente a capacidade máxima de **dez talentos distintos do catálogo da classe** e **vinte pontos de atributo**. A validação rejeita classes e talentos inválidos, duplicados e excesso de pontos; o modo padrão segue limitado a M5.
- `exampleBuild(klass,nome,10,variante,{experimentalFinal:true})`: monta exemplos com dez talentos e vinte pontos, **preservando as cinco escolhas iniciais e os dez pontos da build M5**. As onze variantes anteriores de M5 não mudam.
- `v5/progression-contract-h0.js`: `m10ArenaAdapter` verifica a sequência de dez aprovações, a primeira entrada M5 congelada e o lock M10 antes de criar entrada fictícia. `checkTransition` agora também rejeita alterar atributos ou talentos depois do lock final; no futuro o backend deverá garantir isso com persistência transacional e controle de versão.
- `qa/v5-m10-engine.cjs`: cobre as quatro classes, 120 talentos disponíveis, 11 variantes por classe, 4 e 30 personagens, builds de dez talentos e vinte pontos, guardas contra entrada irregular, encerramento, eventos reais e replays determinísticos; compara a batalha M5 padrão com `arenaMission:5` para detectar alteração.
- `qa/v5-progression-contract-h0.cjs`: adiciona rejeição de alterações de atributos/talentos após travamento da build final.
- `.github/workflows/v5-m10-engine-qa.yml`: testes Node no GitHub Actions, incluindo H.0 e regressão do final da M5.

## Evidências

- [Primeiro teste M10 aprovado, run 41004049659](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41004049659): **4 heróis** — Caçador venceu em 52,1s, 20 talentos distintos disparados, 635 eventos; **30 heróis** — Guerreiro venceu em 75,3s, 52 talentos distintos disparados, 3.825 eventos. Ambos os cenários repetiram exatamente o mesmo resultado com seed fixa. Os 120 talentos estão no catálogo, mas **não foram todos disparados nesse conjunto de partidas**. Testes H.0 e E.7 também passaram.
- [Reexecução após reforçar lock final, run 41004088844](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41004088844): **job m10-lab aprovado**; [run 41004088852](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41004088852): **job verify-contract aprovado** com as novas verificações de imutabilidade da build final.
- `main` não alterada. A UI `v5/arena-lab.js` mantém M10 em modo legado; **não existe prévia 3D da M10 com esse novo motor ainda**.

## Próxima missão técnica — ainda na H.3

1. Rodar **matriz de balanceamento M10** com várias seeds, 4/30 combatentes, 11 variantes e distribuições desiguais de classes; identificar dominância, sobrevivência, tempo e diversidade de talentos sem escolher vencedores artificialmente. Revisar os 120 talentos com casos focais (ativação passiva/reativa/ativa), não apenas presença no catálogo.
2. Criar **modo de visualização M10 opt-in** no laboratório, com as quatro classes KayKit, sprites de talentos, 30 combatentes, câmera automática e arquibancada, sem modificar a interface M5 existente ou V3.
3. Verificar câmera, FPS e estabilidade da M10 no Chromium real, incluindo morte, espectador, pausa, reinício e fim do torneio. G.2 exige ainda os PCs reais da escola.
4. Somente depois das validações e autorização do usuário, conectar H.1/H.2 com backend autenticado, progresso real e uma única partida autoritativa compartilhada. Não fazer merge na `main` antes da Fase I.

**Importante:** a M10 de laboratório ainda não está homologada visualmente nem estatisticamente. A aprovação de replays determinísticos prova a execução da mecânica, não o balanceamento universal ou desempenho físico.


## Rodada seguinte — matriz de balanceamento M10 (30/10/2026)

**Entrega verificável:** `qa/v5-m10-balance-matrix.cjs` e `.github/workflows/v5-m10-balance-qa.yml`, sem alterar vida, dano, IA, classes, personagens, missões ou o motor M5. A matriz executa **80 partidas determinísticas**, com 8 seeds, 5 composições de classes (equilibrada e 4 desequilibradas), 4/30 participantes, **1.360 participações**, 11 variantes por classe, snapshots M5 e builds M10 validados pelo contrato H.0. Dois cenários são repetidos integralmente para comparar eventos e resultados byte a byte. O workflow anexa um JSON anônimo por 14 dias.

**CI aprovado:** [run 41009533478](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41009533478), job `balance-matrix` concluído com sucesso. São **179.035 eventos**, dos quais **14.183 eventos do tipo talento**, 2 partidas encerradas pelo limite de tempo, média de **52,0 segundos** (34,1s com quatro; 69,8s com trinta). Os 30 talentos de cada classe apareceram nas escolhas das builds; somente **15 IDs de talento por classe** foram vistos em eventos do tipo `talent` — os passivos e reativos requerem cobertura específica, portanto **não afirmar execução de todos os 120**.

### Descobertas importantes (não homologação estatística)

| Classe | Vitórias com 4 (40 partidas) | Vitórias com 30 (40 partidas) | Esperadas com 30 por participação |
|---|---:|---:|---:|
| Guerreiro | 13 | 5 | 10,13 |
| Arcanista | 8 | 7 | 10,13 |
| Caçador | 11 | 6 | 9,87 |
| **Guardião** | **8** | **22** | **9,87** |

- **Alerta real de dominância em 30 participantes:** Guardião venceu **22/40** confrontos de 30 personagens, cerca de **2,23 vezes** a expectativa proporcional às suas 296 participações; em 4 personagens venceu apenas **8/40**. Isso **sugere interação de sobrevivência, habilidades defensivas, tempestade, posicionamento e/ou IA**, não prova que sua vida ou defesa estejam necessariamente altas. **Não ajustar atributos às cegas.**
- **Possível viés de posição em 4 participantes:** índices de spawn 1 e 2 somaram **32/40 vitórias** (15 + 17). A composição e a posição estão confundidas nesse conjunto; precisa de rotações controladas com a mesma seed/build antes de atribuir a causa ao mapa ou à IA.
- Os 80 confrontos terminaram, mas esta amostra pequena e sintética não valida equidade universal. Ainda não houve renderização 3D M10, câmera, arquibancadas nem medição nos PCs da escola.

### Próxima missão técnica da H.3

Criar **experimento pareado de balanceamento** com mesmas seeds/builds e posições de spawn permutadas para isolar viés de classe versus posição, com ênfase no Guardião em partidas de 30. Complementar com verificações direcionadas de talentos passivos e reativos. Somente depois decidir se são necessárias mudanças em estatísticas, tempestade ou IA; toda alteração deve manter regressões M5 e replays M10. Em seguida, prévia 3D opt-in da M10, mantendo H.1/H.2 bloqueadas até G.2 e autorização.

**Segurança:** nenhuma alteração na `main`, dados reais, XP, notas, turmas, aprovação de missão ou integração com V3.


## Rodada H.3 — cruzamento pareado de posições/ordem (30/10/2026)

**Entregue e testado:** `qa/v5-m10-paired-spawn.cjs` + `.github/workflows/v5-m10-paired-spawn-qa.yml`. Cada bloco mantém **os mesmos IDs fictícios, as mesmas builds M5→M10 validadas pelo contrato H.0, os mesmos 10 talentos/20 pontos e a mesma seed**; somente a ordem de entrada é rotacionada. Cada personagem passa exatamente uma vez por **cada posição/índice** da arena no bloco, com exposição de cada classe idêntica em cada índice. Não houve mudanças de dano, vida, IA, talentos, câmera, dados reais, V3, M5 ou `main`.

**CI aprovado:** [run 41015450904](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41015450904), job `paired-slot-order` verde após corrigir erro de índice no primeiro run [41015398365](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41015398365). **272 partidas concluídas** (32 de quatro, 120 de trinta equilibradas e 120 de trinta com 50% Guardiões), 16 blocos de rotação completa, 6 replays byte a byte idênticos, 1.086.575 eventos totais, 87.809 eventos `talent` e 14 partidas encerradas por limite de tempo. Relatório JSON anônimo anexado ao workflow por 14 dias.

| Composição M10 | Vitórias Guardião | Esperadas por participação | Razão observada/esperada |
|---|---:|---:|---:|
| 4 equilibrados (32 partidas) | 3 | 8 | 0,375 |
| 30 equilibrados (120 partidas) | **58** | 28 | **2,071** |
| 30 com 15 Guardiões (120 partidas) | **86** | 60 | **1,433** |

**Viés de slot/ordem com 4:** slots 1 e 2 venceram **25/32 partidas (78,1%)** mesmo após cada personagem de cada classe visitar todos os quatro slots com builds e seed fixas por bloco; vitórias por índice foram `[5,9,16,2]`. O cruzamento reduz o confundimento com a **classe fixa em um slot**, mas **não isola geometricamente o spawn**: no motor `phase2-combat.js`, índice da lista determina ao mesmo tempo posição angular, ordem de atualização e atribuição das chamadas ao RNG. Por isso a causa pode ser geometria, ordem, RNG ou interação entre eles. Não afirmar causa provada.

**Viés de classe em 30:** Guardião venceu 58/120 em cenário equilibrado, contra 28 esperadas proporcionalmente à exposição; e 86/120 quando ocupava metade do campo, contra 60 esperadas. Cada classe teve exposição idêntica por índice durante o cruzamento, portanto a vantagem observada não é explicada apenas por uma classe ficar presa aos mesmos slots. **Ainda não comprova desbalanceamento universal**: a amostra é sintética, com poucas seeds e builds específicas, e classes interagem com IA, sobrevivência, tempestade e composição.

**Próxima missão H.3:** preparar **experimento isolado de geometria versus ordem/RNG**, com opt-in apenas no laboratório e sem alterar a M5 padrão; comparar cenários controlados e testar talentos defensivos/passivos/reativos que podem favorecer Guardião. Não ajustar atributos sem diagnóstico. Depois preparar a prévia M10 3D opt-in e testar câmera/arquibancadas no Chromium. **G.2 nos PCs da escola, H.1/H.2 reais e Fase I continuam bloqueadas até validação/autorização.**


## Rodada H.3 — isolamento causal de geometria versus ordem/RNG (30/10/2026)

**Entregue e verificado:** o motor \`v5/phase2-combat.js\` aceita \`experimentalSpawnPositions\` **somente com \`arenaMission:10\`**, exigindo coordenadas \`x/z/face\` finitas, uma entrada por personagem e posições dentro da arena. A opção é \`null\` por padrão; a M5 rejeita qualquer override. O caminho padrão do motor, classes, dano, IA, talentos, câmera e progressão não foram alterados.

**Experimento:** \`qa/v5-m10-spawn-causal.cjs\` executa três grupos sintéticos (4 equilibrados; 30 equilibrados; 30 com 50% Guardiões). Dentro de cada bloco, as identidades, builds validadas M5→M10, talentos, atributos e seed são idênticos. A versão **geometria** preserva índice, ordem de atualização e sorteios iniciais por identidade, trocando apenas as coordenadas iniciais/face entre os heróis. A versão **ordem/RNG** mantém rigorosamente a mesma posição inicial de cada identidade e rotaciona a ordem de entrada, o que altera tanto ordem de atualização quanto atribuição dos sorteios do RNG; **essas duas causas não estão isoladas uma da outra**. O override com posições originais reproduz o baseline evento a evento.

**CI aprovado:** [run 41021568535](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41021568535), job \`causal-spawn\` concluído com sucesso. São **70 partidas** (10 baselines + 30 intervenções só de geometria + 30 intervenções de ordem/RNG), **6 replays exatos**, testes de validação das coordenadas, **M5 inalterada**, regressões do motor M10, E.7 e contrato H.0 aprovadas. Relatório JSON sintético arquivado por 14 dias.

| Cenário | Mudou vencedor ao trocar apenas geometria | Mudou vencedor com geometria fixa, trocando ordem/RNG |
|---|---:|---:|
| 4 equilibrados | 6/12 | 10/12 |
| 30 equilibrados | 9/9 | 5/9 |
| 30 com metade Guardiões | 9/9 | 3/9 |

- **Resultado causal limitado:** a localização inicial, independentemente da ordem inicial e dos sorteios iniciais, é suficiente para alterar o vencedor nos cenários amostrados. Em 30 personagens, todas as 18 rotações geométricas mudaram a identidade vencedora. Isso **não significa que a geometria explique sozinha a vantagem estatística do Guardião**; a alteração do encontro naturalmente altera sorteios subsequentes.
- **Resultado de ordem/RNG:** mesmo com posição individual idêntica, rotacionar a lista mudou vencedores em 18/30 intervenções (10+5+3). A causa específica **ordem de processamento versus consumo do RNG permanece confundida**. Os sorteios iniciais mudaram para 588 atribuições individuais nos testes de ordem/RNG.
- **Guardião:** no cenário de 30 equilibrados ganhou 4/9 intervenções de geometria e 4/9 de ordem/RNG; no cenário com metade Guardiões ganhou 6/9 e 8/9, respectivamente. Amostra pequena, com builds sintéticas, insuficiente para homologar balanceamento ou mexer em dano/defesa.
- **Limitações:** não foram testados passivos/reativos defensivos individualmente; nenhum FPS real ou interface M10 3D foi medido; sem autenticação, XP, turmas, V3, \`main\` ou deploy.

**Próxima missão técnica:** isolar **ordem de atualização versus RNG por identidade** em testes controlados (ou avaliar os passivos/reativos do Guardião com ablação em builds pareadas), preservando a M5. Somente depois propor ajuste mínimo com regressão de 4/30 personagens. A prévia 3D M10 opt-in, G.2 nos PCs físicos, H.1/H.2 e Fase I continuam pendentes.
