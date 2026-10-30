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

**Entregue e verificado:** o motor `v5/phase2-combat.js` aceita `experimentalSpawnPositions` **somente com `arenaMission:10`**, exigindo coordenadas `x/z/face` finitas, uma entrada por personagem e posições dentro da arena. A opção é `null` por padrão; a M5 rejeita qualquer override. O caminho padrão do motor, classes, dano, IA, talentos, câmera e progressão não foram alterados.

**Experimento:** `qa/v5-m10-spawn-causal.cjs` executa três grupos sintéticos (4 equilibrados; 30 equilibrados; 30 com 50% Guardiões). Dentro de cada bloco, as identidades, builds validadas M5→M10, talentos, atributos e seed são idênticos. A versão **geometria** preserva índice, ordem de atualização e sorteios iniciais por identidade, trocando apenas as coordenadas iniciais/face entre os heróis. A versão **ordem/RNG** mantém rigorosamente a mesma posição inicial de cada identidade e rotaciona a ordem de entrada, o que altera tanto ordem de atualização quanto atribuição dos sorteios do RNG; **essas duas causas não estão isoladas uma da outra**. O override com posições originais reproduz o baseline evento a evento.

**CI aprovado:** [run 41021568535](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41021568535), job `causal-spawn` concluído com sucesso. São **70 partidas** (10 baselines + 30 intervenções só de geometria + 30 intervenções de ordem/RNG), **6 replays exatos**, testes de validação das coordenadas, **M5 inalterada**, regressões do motor M10, E.7 e contrato H.0 aprovadas. Relatório JSON sintético arquivado por 14 dias.

| Cenário | Mudou vencedor ao trocar apenas geometria | Mudou vencedor com geometria fixa, trocando ordem/RNG |
|---|---:|---:|
| 4 equilibrados | 6/12 | 10/12 |
| 30 equilibrados | 9/9 | 5/9 |
| 30 com metade Guardiões | 9/9 | 3/9 |

- **Resultado causal limitado:** a localização inicial, independentemente da ordem inicial e dos sorteios iniciais, é suficiente para alterar o vencedor nos cenários amostrados. Em 30 personagens, todas as 18 rotações geométricas mudaram a identidade vencedora. Isso **não significa que a geometria explique sozinha a vantagem estatística do Guardião**; a alteração do encontro naturalmente altera sorteios subsequentes.
- **Resultado de ordem/RNG:** mesmo com posição individual idêntica, rotacionar a lista mudou vencedores em 18/30 intervenções (10+5+3). A causa específica **ordem de processamento versus consumo do RNG permanece confundida**. Os sorteios iniciais mudaram para 588 atribuições individuais nos testes de ordem/RNG.
- **Guardião:** no cenário de 30 equilibrados ganhou 4/9 intervenções de geometria e 4/9 de ordem/RNG; no cenário com metade Guardiões ganhou 6/9 e 8/9, respectivamente. Amostra pequena, com builds sintéticas, insuficiente para homologar balanceamento ou mexer em dano/defesa.
- **Limitações:** não foram testados passivos/reativos defensivos individualmente; nenhum FPS real ou interface M10 3D foi medido; sem autenticação, XP, turmas, V3, `main` ou deploy.

**Próxima missão técnica:** isolar **ordem de atualização versus RNG por identidade** em testes controlados (ou avaliar os passivos/reativos do Guardião com ablação em builds pareadas), preservando a M5. Somente depois propor ajuste mínimo com regressão de 4/30 personagens. A prévia 3D M10 opt-in, G.2 nos PCs físicos, H.1/H.2 e Fase I continuam pendentes.

## Rodada H.3 — ordem de atualização versus RNG de críticos por herói (30/10/2026)

**Missão concluída como diagnóstico causal limitado:** no `v5/phase2-combat.js` foram adicionadas duas opções independentes e **exclusivas da M10 de laboratório**, desativadas por padrão: `experimentalTurnOrder` (lista de IDs pseudônimos que altera somente o loop principal de atualização dos lutadores) e `experimentalCritSeed` (semente de fluxos RNG de acerto crítico independentes por identidade, com hash determinístico). A ordem do array original, as posições de nascimento, os sorteios iniciais de posição e ataque básico, os atributos, o catálogo de talentos e as rotinas de projéteis/armadilhas permanecem inalterados. A M5 rejeita ambas as opções.

**Experimento:** `qa/v5-m10-order-rng-causal.cjs` executou **70 batalhas sintéticas** em três cenários (4 equilibrados; 30 equilibrados; 30 com metade Guardiões), 10 blocos com seeds e builds fixas, 30 intervenções somente na ordem de processamento e 30 somente na semente de RNG crítico. Todas as intervenções preservaram snapshots iniciais idênticos por herói; identidade da ordem reproduziu o baseline evento a evento; **6 replays exatos**, 4/30 combatentes e M5 preservada. CI específico: [run 41027655782](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41027655782), job `causal-order-rng` **aprovado**, incluindo testes M10, E.7 e H.0. Relatório JSON sintético arquivado por 14 dias.

| Cenário | Trocar somente ordem mudou vencedor | Trocar somente RNG crítico mudou vencedor |
|---|---:|---:|
| 4 equilibrados | 5/12 | 2/12 |
| 30 equilibrados | 5/9 | 7/9 |
| 30 com metade Guardiões | 7/9 | 7/9 |
| **Total** | **17/30** | **16/30** |

**Interpretação rigorosa:** ordem do loop de atores e sorteios de crítico **podem mudar independentemente a identidade do vencedor** nos cenários amostrados, mesmo mantendo os mesmos heróis, builds, posições e condições iniciais. Os fluxos de crítico são independentes por herói; como a intervenção pode mudar quais ataques acontecem, não é possível alegar que toda sequência futura de consumo aleatório seja idêntica entre batalhas. As demais rotinas (projéteis, colisão e áreas) continuam na ordem original e não foram isoladas; não há demonstração de que apenas essas duas causas expliquem a dominância do Guardião. **Nenhum ajuste de dano, defesa, vida, IA ou RNG do modo padrão foi feito.**

**Próxima missão:** ablação controlada de talentos defensivos/reativos do Guardião, com exposição igual por posição e métricas de escudo, cura, dano absorvido, duração e vitórias, sem modificar stats canônicos. Depois, prévia visual M10 opt-in no laboratório e QA WebGL 4/30 com câmera e arquibancada. G.2 em PCs reais, H.1/H.2 autenticadas e merge na `main` continuam bloqueados.

## Rodada H.3 — ablação pareada de defesa do Guardião (30/10/2026)

**Entregue e verificado no laboratório:** `v5/phase2-combat.js` recebeu `experimentalGuardianAblation` (somente M10 opt-in, com grupos `shields`, `healing`, `reactions`, `mitigation`, `all`). A opção é **nula por padrão** e M5 a rejeita. Ela suprime efeitos de talentos selecionados do Guardião, sem alterar a build canônica, os 20 pontos, os 10 talentos escolhidos, a classe, o HP inicial, as posições ou a seed. **Não é ajuste de balanceamento, nem configuração liberada para alunos.** Talentos mistos têm efeitos ofensivos e defensivos; desligá-los integralmente não mede exclusivamente a redução de escudo.

**Experimento:** `qa/v5-m10-guardian-ablation.cjs` + `.github/workflows/v5-m10-guardian-ablation-qa.yml`. **108 partidas** em 18 blocos pareados, cada um com baseline e cinco ablações, em 4 personagens equilibrados, 30 equilibrados e 30 com metade Guardiões; 3 seeds × 2 rotações por cenário. **90 comparações pareadas, 6 replays byte a byte, M5 sem alteração**, contrato H.0 e motor M10 regressados. Foram mantidos os mesmos personagens, atributos, talentos, posições iniciais e RNG crítico por identidade em cada bloco. **CI aprovado** no [run 41035173280](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41035173280), após corrigir o primeiro teste que lia `klass` na raiz do adaptador em vez de `build.klass` ([run 41035096662](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41035096662)). Relatório sintético JSON anexado por 14 dias.

| Grupo de talentos desativado | Mudanças de vencedor vs baseline (18 pares) | Vitórias do Guardião (18 partidas) |
|---|---:|---:|
| Nenhum (baseline) | — | 11 |
| Escudos (`shields`) | 13 | 2 |
| Cura (`healing`) | 9 | 9 |
| Reações (`reactions`) | 7 | 10 |
| Mitigação (`mitigation`) | 7 | 12 |
| Todos os grupos (`all`) | 15 | 1 |

**Sinal observável:** nas builds fictícias intencionalmente defensivas, desligar talentos que fornecem escudo diminuiu as vitórias do Guardião de 11/18 para 2/18, enquanto desligar os quatro grupos diminuiu para 1/18. Em seis partidas equilibradas com 30 heróis, escudo absorvido nos Guardiões passou de **6.583,7** a **0**; cura efetiva caiu de **1.523,96** para **925,06**, e a média de sobrevivência do Guardião caiu de **56,34s** para **31,15s**. As diferenças de vencedor também aparecem por interação com dano e sobrevivência. As ablações **não são aditivas**. Na turma de 4, o único Guardião não possui talentos do grupo `mitigation`, portanto esse braço é um controle nulo, não uma evidência de irrelevância desse grupo.

**Limite:** são 18 blocos com apenas quatro conjuntos sintéticos de talentos defensivos do Guardião; isso mede a contribuição conjunta dessas habilidades nas builds escolhidas, **não** prova que escudos isoladamente causam a dominância na matriz de 80 partidas nem justifica nerf. Não se mexeu em dano, vida, cooldown, alcance, IA, conteúdo pedagógico, XP, estudantes, `main` ou deploy.

**Próxima missão técnica:** medir, ainda em M10 isolada, quais escudos específicos e condições de uso mais contribuem (por exemplo `G01`, `G10`, `G05`, `J09`), com ablação por talento e duração/capacidade efetiva; comparar builds mistas e balanceamento por participação antes de qualquer proposta de ajuste. Depois, criar a prévia 3D opt-in M10 com câmera e arquibancada, mantendo M5 intacta. **G.2 (PCs reais), H.1/H.2 (alunos e servidor) e Fase I seguem pendentes.**

## Rodada H.3 — Primeira prévia M10 3D opt-in (30/10/2026)

**Experimento isolado, sem alunos reais, XP, servidor, turmas, progressão gravada ou merge em `main`.** O novo modo deve ser aberto explicitamente em `v5/arena-lab.html?m10preview=1&count=30&nav=steer&counterplay=1&balance=hp2&sprites=1`; o modo comum e a M5 continuam com seus motores anteriores.

- `v5/m10-visual-roster.js`: gera personagens fictícios para 4/30 participantes com IDs `trial-m10-...` pseudônimos. Para cada personagem cria uma build M5 de 5 talentos/10 pontos, congela-a **somente em memória**, acrescenta outros 5 talentos/10 pontos e valida tudo pelo contrato H.0, com `m10Locked` experimental. Em seguida converte para a build canônica M10 do motor experimental, sem nomes nem aprovações de estudantes.
- `v5/build-identity.js`: aceita identidade visual canônica de 10 talentos somente quando `approvedMissions===10`; M5 permanece no caminho original, evitando erro na criação das marcas das builds M10.
- `v5/arena-three.js`: `fighters(...,{arenaMission:10})` aceita somente builds `finalTrial` com 10 missões aprovadas *ficticiamente*, executa `PHASE2.battle` e expõe `data-v5-combat-engine="phase2-m10"`, `data-v5-approved-talent-slots="10"`. Se o input não é explicitamente de M10 experimental, rejeita e **não cai silenciosamente no motor legado**. Câmera, modo espectador, arquibancadas, talentos e efeitos do Coliseu reutilizam a mesma base da M5.
- `v5/arena-lab.js/html`: link para abrir prévia da final; título e informações pedagógicas deixam explícito que são 10 talentos e 20 pontos por personagem, **sem XP real**. Seleção de 4/30, onze variações fictícias, modo aluno simulador, câmera manual/automática e retorno à M5 continuam no laboratório. `?m10preview=1` é obrigatório e não ativa o sistema de produção.
- `qa/v5-m10-visual-roster.cjs`: testes de M10 com 4/30 heróis, 11 variações representadas, identidades e builds canônicas, 10 talentos/20 pontos, mesmas seeds em replays determinísticos e regressão M5. **PASS** no CI `final-roster`: M10 com quatro personagens terminou ~65,65s e com 30 ~105,95s na seed 4175863657, com 52 e 326 usos de talentos respectivamente.
- `qa/v5-m10-visual-browser.cjs`: validação real de Chromium/WebGL ainda em andamento: 4 e 30 GLBs, 10 talentos por personagem, diretor automático, transição para 29 espectadores, vitória e retorno à M5. A primeira tentativa parou numa corrida de leitura do botão `Iniciar` antes do HUD completar seu refresh; o teste agora espera o botão ser habilitado.
- Workflow `.github/workflows/v5-m10-visual-qa.yml`: links para a execução em andamento: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41037680943. **Não declarar o WebGL M10 aprovado até o job `final-webgl` concluir com sucesso.**

**Ainda pendentes:** análise individual de talentos do Guardião (agente horário), verificação visual humana da cena M10, validação G.2 nos PCs da escola, integração H.1/H.2 de identidades/rede e aprovação final da I. A `main` não foi alterada.

### H.3 — Homologação automatizada da prévia 3D M10 (30/10/2026)

**APROVADA em laboratório — ambos os jobs do [CI 41037680943](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41037680943) concluíram com sucesso após correção de sincronização da checagem do botão Iniciar**. A primeira execução CI 41037540738 interrompeu o teste por conferir `disabled` antes do refresh assíncrono do HUD, mesmo com 4/4 GLBs carregados; `qa/v5-m10-visual-browser.cjs` agora aguarda o botão habilitar antes de iniciar.

- **4 personagens:** KayKit GLBs reais, 10 talentos/20 pontos por build, lançamentos de talentos, partida concluída e 3 espectadores;
- **30 personagens:** 30 KayKit GLBs reais, 10 talentos/20 pontos por build, dezenas de lançamentos de talentos, vencedor com 29 espectadores, diretor cinematográfico seleciona plano de vitória;
- **Reversão limpa para M5:** trocar a missão após a final volta a `phase2-m5`, 5 talentos/10 pontos e elenco normal. A câmera e os modelos continuam funcionais;
- **Regressões do motor:** seis variações de elenco (4/30 e variantes 0/3/10), replays exatos da M10, validador H.0 e replay de E.7 da M5 passaram;
- **Evidência visual:** artefato `m10-webgl-final-30`, screenshot `qa/v5-m10-visual-30.png` no [CI 41037680943](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41037680943/artifacts/12968383289).

**O que NÃO está homologado:** estética validada por humano, FPS nos PCs reais (G.2), balanceamento final da M10, contas e turmas, progressão salva, transmissão de batalha entre dispositivos e merge. O agente de balanceamento deve continuar os testes individuais do Guardião; não mudar os valores oficiais sem evidência e aprovação. **A `main` não foi alterada.**

## Rodada H.3 — diagnóstico individual G01/G10/G05/J09 (30/10/2026)

**Incremento implementado, CI específico em validação.** A prévia WebGL M10 já foi aprovada separadamente no run [41037680943](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41037680943); esta rodada **não** modifica o modo 3D, o balanceamento oficial, a M5, o XP ou o servidor.

- `v5/phase2-combat.js`: opção nova `experimentalGuardianTalentAblation` **somente M10**, desligada por padrão, aceita exclusivamente `G01`, `G10`, `G05`, `J09`. Rejeita valores desconhecidos, uso na M5 e combinação com ablação por grupo. A seleção canônica de dez talentos e os vinte pontos permanecem na build; apenas o efeito completo do talento indicado é suprimido na simulação fictícia.
- `qa/v5-m10-guardian-individual.cjs`: matriz de **120 partidas planejadas**, 24 blocos (2 builds do Guardião: defensiva e mista × 3 cenários: 4 equilibrados, 30 equilibrados e 30 com metade Guardiões × 2 seeds × 2 rotações). Cada bloco compara baseline com as quatro ablações isoladas, produzindo **96 pares**, 12 replays determinísticos e verificações de snapshot inicial, seleção, ausência de ativação do talento suprimido, cobertura dos quatro talentos, regressão M5 e rejeição de entradas inválidas.
- Métricas por braço: vitórias, escudo emitido nominalmente, escudo absorvido, cura, dano recebido, dano causado, sobrevivência média, ativações dos quatro talentos e mudança do vencedor. **Limitação:** ablação do efeito inteiro, não só do escudo; o escudo nominal não mede capacidade efetivamente usada; desvio de combate e consumo posterior de RNG não são controlados.
- Workflow `.github/workflows/v5-m10-guardian-individual-qa.yml`: [CI focal 41042722247](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41042722247), relatório JSON sintético como artefato por 14 dias, mais regressões H.0, M5/E.7, M10 e prévia M10. **Não marcar aprovado até conclusão de todos os testes.**

**Próximo passo:** interpretar resultados e cobertura dos quatro talentos; só propor ajuste mínimo com evidência comparativa, nunca alterar atributos canônicos automaticamente. G.2 em PCs reais, inspeção humana do visual, H.1/H.2 autenticadas e integração `main` seguem bloqueadas.

### H.3 — Resultado validado da ablação individual (30/10/2026)

**CI específico [41042722247](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41042722247) APROVADO** (job `individual-guardian`), com sintaxe, matriz pareada, regressões de grupo, motor M10, roster visual M10, contrato H.0 e replay da M5/E.7. Artefato `v5-m10-guardian-individual-report` arquivado por 14 dias. Commit de implementação `a24c0927af`, teste `e4033711bb`, workflow `ec2f83c8b8`.

| Talento suprimido (efeito inteiro) | Vencedor mudou (24 pares) | Vitórias Guardião (24; baseline 17) | Escudo efetivamente absorvido pelos Guardiões, soma dos 24 blocos |
|---|---:|---:|---:|
| Nenhum (baseline) | — | 17 | 33.295,32 |
| G01 — Escudo da Alvorada | 13 | 14 | 14.213,30 (−57,3%) |
| G10 — Bastião Solar | 12 | 13 | 21.333,15 (−35,9%) |
| G05 — Aço Resiliente | 7 | 19 | 31.990,34 (−3,9%) |
| J09 — Fé Inflexível | 6 | 19 | 30.710,46 (−7,8%) |

**Cobertura real no baseline:** G01 897 ativações, G10 471, G05 207, J09 166. **120/120 partidas, 96 pares e 12 replays exatos**. M5 sem alterações, seeds e builds iniciais preservadas. A soma do escudo absorvido inclui 4 e 30 jogadores e não é normalizada por número de Guardiões; serve somente para comparar o mesmo elenco dentro de cada braço. A supressão de G05/J09 ocasionalmente **aumentou** vitórias do Guardião, o que confirma interações não lineares e reforça que não se deve alterar stats por uma única comparação. Não foi feito nerf.

**Próximo diagnóstico proposto:** isolar **somente o valor de escudo de G01/G10** preservando casts, prioridade e cooldown (experimento parametrizado M10-only), comparar absorção efetiva por elenco, e então validar um ajuste mínimo em builds diversificadas, sem modificar valores canônicos. Ficam pendentes G.2 nos PCs físicos, inspeção visual humana, H.1/H.2 autenticadas e Fase I com autorização explícita.


## Etapa 1 — experimento de escudos graduais (30/10/2026)
- Em andamento; **NÃO homologado**. Commit do motor `f7e97aee08192b71df673a477f819645a79060c4`; teste `8426d6aaf8845e4723804456670b73aa40f2bcf6`.
- `experimentalGuardianShieldScale` é parâmetro opcional M10-only, aceita apenas G01/G10 em [0,1], incompatível com ablações. Modifica somente a quantidade de escudo criada; preserva cast, cooldown e efeitos solares. Default mantém o motor canônico.
- `qa/v5-m10-guardian-shield-scale.cjs` verifica replay neutro idêntico e rejeição de parâmetros inválidos. **CI e execução deste novo teste ainda não comprovados nesta rodada.**
- Próximo: executar teste no CI, corrigir falhas, realizar matriz pareada com escalas graduais, inspecionar screenshots e efeitos no navegador. Só então avaliar balanceamento. **G.2 em PCs físicos e revisão humana ainda pendentes; etapa 1 não encerrada.**
