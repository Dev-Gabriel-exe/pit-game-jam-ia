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


## Rodada H.3 — bateria de 100 partidas com variação de talentos e atributos (30/10/2026, 08h)

**Missão em andamento: validar balanceamento M10; NÃO homologada.** A pedido do usuário, executadas 100 batalhas sintéticas (25 com quatro e 75 com trinta participantes) usando o motor atual, 10 talentos e 20 pontos por personagem, com escolhas aleatorizadas e seeds fixas. Resultado comprovado por execução V8 isolada dos arquivos recuperados do GitHub (aprox. 36,6 s), **não por CI**: 37 vitórias Guerreiro, 28 Arcanista, 19 Caçador e 16 Guardião; no formato de 30 foram 30/18/15/12 respectivamente. Nenhuma das 100 terminou pelo limite de tempo; média 56,137 s. Cobertura de seleção 30/30 talentos por classe, **não** cobertura de ativação.

**Arquivos/commits:** `qa/v5-balance-100-m10.cjs` reforçado com verificação de orçamento, contagem por tamanho, exposição, expectativa proporcional e cobertura de escolhas, commit `d7302d7cee9382a3a69280fdd64607f1817ad461`. Relatório com tabela e gráfico em `v5/FASE-H3-BALANCE-100-20261030.md`, commit `83ac1a26c3dcb87bb879104a2dfa144b360481bd`. Motor testado: blob `8c5422baa9cde3260f1a5250fae4d29b1533b2c5`, sem mudança de estatísticas nesta rodada.

**Limitação:** consultas de checks e workflow runs do commit do teste retornaram vazias; não afirmar que o CI passou. Esta bateria aleatória diverge das matrizes de builds defensivas que favoreceram Guardião; portanto o balanceamento permanece dependente de builds/cenário e **não está aprovado**. Próximo: comparar builds controladas ofensivas/defensivas/aleatórias com mesmos spawns e seeds, investigar dominância e validar CI. G.2 PCs físicos não realizado. H.1/H.2 e merge na `main` bloqueados.


## Rodada H.3/M10 — recuperação de renderização e mixagem espacial (30/10/2026)

**Missão técnica:** eliminar a regressão em que mudanças no WebAudio podiam impedir a renderização da arena e substituir a mixagem global excessivamente ruidosa por efeitos vinculados à posição da câmera/personagem. Somente laboratório, sem alterações de M5/M10 em talentos, atributos, física, resultados, progressão ou dados reais.

**Implementação na branch experimental:**
- `v5/arena-audio.js`: sons de hit, shield, talent e knockout atenuados pela distância, panorâmica estéreo quando disponível, no máximo três vozes de combate simultâneas, cooldown por tipo e vitória global. Fontes sem posição não disparam sons globais. Erros do dispositivo de áudio retornam `false` e não propagam para o WebGL.
- `v5/arena-three.js`: posição da fonte extraída do herói/alvo real do evento; ouvinte é o personagem seguido ou a câmera do diretor. Tratamento de exceções no bloco de áudio impede falha do loop gráfico. Eventos e resultados do motor permanecem somente leitura.
- `qa/v5-arena-audio.cjs`: testa desbloqueio, volume distante, panorâmica, limite de vozes, cooldown e falha forçada de WebAudio.
- `qa/v5-arena-audio-browser.cjs`: Chromium/SwiftShader com **30 GLBs KayKit reais na M10**, 10 slots de talento, conclusão do combate e 29 espectadores; depois fecha o WebGL da M10 e testa **4 GLBs na M5 com AudioContext propositalmente negado**, canvas pronto, contexto `ready` e relógio de combate avançando. Fechar a primeira página antes do segundo cenário evita manter duas cenas WebGL pesadas simultaneamente; falhas anteriores de carregamento no segundo cenário foram documentadas no CI.

**CI APROVADO:** [run 41059481133](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41059481133), job `audio`: testes Node PASS; M10 30 GLBs PASS, 10 talentos disponíveis, vencedor Caçador e 29 espectadores; M5 com áudio bloqueado PASS, canvas renderizado, 4 GLBs, motor ativo. Último commit funcional/testes: `8f3436e994d6ab99db4e82db795847b346679d1f`; correções de áudio e motor em `9e92e737a78286c8d1751df7917312daef04482c` e `0c8c24b4e5532ab7379ace241f1eddd1c5d7353c`.

**Limites e próximo passo:** os testes verificam geração e roteamento de sinais, **não qualidade subjetiva do som em alto-falantes reais**, nem desempenho em PCs da escola. Ouvir no S24/PC e avaliar se a câmera geral realmente mantém os sons discretos; ajustar curvas/vozes apenas com evidência. A G.2 física continua pendente; H.1/H.2, `main` e produção permanecem bloqueadas.


## Rodada H.3 — sensibilidade de escudo G01/G10 com pareamento (30/10/2026, 10h)

**Missão única:** continuar a investigação de balanceamento da arena final M10. Nenhuma mudança de vida, dano, estatísticas, talentos canônicos, câmera, GLBs, XP, V3, banco ou `main`.

**Incremento verificável:** `qa/v5-m10-guardian-shield-matrix.cjs` adiciona 24 blocos pareados (4 e 30 participantes, composições balanceada e com metade Guardiões, builds defensiva/mista, seeds e rotações), comparando baseline com escala de G01 75%, G10 75%, ambos 75% e ambos 0%. O parâmetro `experimentalGuardianShieldScale` já existia, somente na M10. O teste compara os mesmos atributos, 10 talentos, 20 pontos, posições e seed entre braços, checa neutralidade de escala 100%, replays determinísticos e regressão M5 sem mudança. Produz relatório JSON com vitórias, mudanças de vencedor, escudo nominal/absorvido e ativações de G01/G10; não supõe monotonicidade nem atribui todo escudo absorvido aos dois talentos.

**Commits:** matriz `c74fc802add77fab31aa2947a1fd4ef2fe0809b6`; CI `12ecf1ff8c5570e2b7d75a8225369d5ad86d1fa1`. Workflow [V5 M10 Guardian Shield Scale QA](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41065140442) criado e acionado. **Status de CI: pendente de resultado no momento desta anotação; não declarar PASS antes de conferir o job.**

**Próximo passo:** validar resultado do CI e métricas por composição, corrigir qualquer falha, comparar efeitos em amostras maiores se necessário; só então propor ajuste mínimo (ainda experimental) e revisão humana. **G.2 nos PCs físicos não foi feito; H.1/H.2 reais e merge/deploy continuam bloqueados.**


### Resultado comprovado da matriz G01/G10 (CI 41065406336)

**GitHub Actions [41065406336](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41065406336) APROVADO.** O primeiro run [41065140442](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41065140442) falhou porque o teste unitário antigo não passava `approvedMissions:10` e `finalTrial:true` ao motor M10. Corrigido em `75d5a201664808c239a14331395cf9332abd547e`; o novo run passou com guardas de entrada, H.0, motor M10, replay M5 e matriz de escudos. O artefato `m10-guardian-shield-sensitivity-report` contém o JSON detalhado por cenário.

**Amostra controlada:** 120 batalhas fictícias, 96 comparações pareadas, 24 blocos e 6 replays exatos; todas terminaram, sem alteração da M5. Os Guardiões ativaram G01 **916** vezes e G10 **480** vezes no baseline.

| Braço experimental M10 | Vitórias do Guardião / 24 | Mudanças de vencedor individual vs. baseline | Escudo nominal emitido | Escudo absorvido |
|---|---:|---:|---:|---:|
| Baseline canônico | 18 | — | 64.746,59 | 33.757,13 |
| Apenas G01 em 75% | 18 | 4 | 56.884,42 | 32.173,78 |
| Apenas G10 em 75% | 18 | 6 | 59.027,10 | 33.454,82 |
| G01 + G10 em 75% | 18 | 8 | 49.570,10 | 31.127,35 |
| G01 + G10 em 0% | 12 | 12 | 5.793,92 | 5.099,38 |

**Leitura cautelosa:** reduzir ambos os escudos a 75% baixou o escudo nominal em aproximadamente 23,4% e o absorvido em 7,8%, **sem mudar o total de vitórias da classe nesta amostra**, mas trocando oito vencedores individuais. Remover integralmente ambos os escudos mudou 12 vencedores e reduziu vitórias de Guardião de 18 para 12. Os números não homologam balanceamento: composições defensivas foram escolhidas deliberadamente, amostra pequena, casts e RNG posteriores divergem. Não foi feito nerf.

**Próximo passo da mesma missão H.3:** examinar por cenário a sensibilidade das builds e comparar com a matriz de 100 builds aleatórias; testar candidatos com amostra maior e seeds independentes antes de qualquer alteração canônica. A G.2 nos PCs físicos e inspeção humana seguem pendentes; integração real H.1/H.2, `main` e produção continuam bloqueadas.


## Rodada H.3/M10 — sensibilidade de escudos por arquétipo (30/10/2026, 11h)

**Missão única desta execução:** continuar a investigação de balanceamento M10 com builds **ofensivas, defensivas e pseudoaleatórias**, sem aplicar nerf ou mudar o motor. Foram lidos os roadmaps D–I, checkpoints E/F/G e contrato H.0 antes do trabalho. Último HEAD anterior da branch: `461e7271769b4776f6ae2e297f4b83f74244c3d7`.

### Entrega técnica

- `qa/v5-m10-archetype-shield-pairs.cjs`: gera três arquétipos com as **cinco escolhas de talento da M5 congeladas** e mais cinco da M10; distribui dez pontos adicionais de atributos por arquétipo, totalizando **10 talentos/20 pontos**. Usa H.0 `m10ArenaAdapter` para validar aprovação fictícia sequencial e lock M10. As quatro classes KayKit usam o mesmo motor, sem alterar catálogo canônico.
- Em cada arquétipo, testa **4 balanceados**, **30 balanceados** e **30 com metade Guardiões**; quatro seeds independentes das usadas na matriz anterior, com duas rotações do elenco. Cada bloco tem uma partida canônica (100% G01/G10) e outra com ambos os escudos a 75%, preservando identidade, build, spawn, seed e ordem.
- G01 e G10 são intencionalmente escolhidos para todos os Guardiões deste teste, inclusive ofensivos/aleatórios, a fim de garantir exposição do mecanismo sob análise. Isso **não** representa amostragem aleatória irrestrita de talentos.
- `.github/workflows/v5-m10-archetype-shield-qa.yml`: CI com H.0, motor M10, replay M5/E.7, 144 partidas, 72 pares, 9 replays exatos, 9 checks neutros e relatório JSON arquivado por 14 dias.
- Commits de implementação: `2b5161ac2b56e13b446d4aca7e245efac406605c`, correção de geração do roster `779c9bd03c94b274c08f5561f2d10593389fb1d2`, workflow `6e28475c8889f64bb3dbd9f79f2777a37ebd18cb`.

### Evidência de execução

**GitHub Actions [41072955547](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41072955547) — job `m10-archetypes` concluído com SUCCESS.** Logs registram `PASS M10 archetype sensitivity: 144 games, 72 pairs, 9 exact replays, 9 neutral checks, M5 unchanged.` Os guardas H.0, motor M10 e replay E.7 também passaram. Artefato: `m10-archetype-shield-pairs`.

| Arquétipo | Vitórias Guardião canônico (24) | Vitórias com G01/G10 a 75% (24) | Pares que mudaram vencedor (24) |
|---|---:|---:|---:|
| Ofensivo | 12 | 9 | 4 |
| Defensivo | 18 | 15 | 10 |
| Pseudoaleatório | 12 | 13 | 11 |
| **Total (72 pares)** | **42** | **37** | **25** |

**Atenção à interpretação:** na composição com quatro personagens, Guardião defensivo venceu **7/8** no canônico (referência proporcional: 2/8), enquanto ofensivo venceu **1/8** e pseudoaleatório **5/8**. O resultado é **sensível à seleção de build**. No grupo pseudoaleatório, a escala de 75% chegou a **aumentar** as vitórias de Guardião (12→13), demonstrando que não há efeito monotônico simples sobre vencedores. Nas nove células, as duas habilidades foram efetivamente ativadas. Esses números não autorizam alteração de stats, pois a amostra é pequena, a seleção forçou G01/G10, a ordem/spawn ainda podem favorecer slots e alterações no escudo mudam decisões e RNG subsequentes.

### Próximo incremento na MESMA missão H.3

Separar efeito de **build versus slot/posição/ordem** com rotações completas dos quatro jogadores e grupos de 30, mais seeds independentes e intervalos de incerteza. Comparar as builds com a matriz de 100 escolhas aleatórias (que não é pareada diretamente por seeds) e avaliar se o viés do Guardião persiste sem forçar G01/G10. **Não alterar valores canônicos antes de evidência robusta e revisão humana.** G.2 nos PCs físicos continua não realizado; H.1/H.2 reais, V3, `main`, produção, XP, usuários, notas e turmas permanecem intocados/bloqueados.


## Rodada H.3/M10 — cruzamento completo de slots por arquétipo (30/10/2026, 12h)

**Missão única em andamento:** distinguir a sensibilidade às builds ofensiva, defensiva e pseudoaleatória da sensibilidade conjunta a slot/spawn/ordem de atualização, sem alterar balanceamento canônico. O HEAD antes da execução era `dd7a5b0ac189624bbf48090798ce0773ceea56f8`. Os roadmaps D–I, checkpoints E/F/G, contrato H.0 e CI anterior [41072955547](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41072955547) foram revisados.

**Implementação:** `qa/v5-m10-full-slot-crossover.cjs` (commit `faa226a20c2c4fc7695454db98538306b2261103`) e `.github/workflows/v5-m10-full-slot-crossover-qa.yml` (commit `88fb7a207d2a93fef3d0c1c6fb54cbe24883117f`). Planeja **396 partidas sintéticas**: 3 arquétipos × [4 personagens × 4 rotações × 3 seeds; 30 equilibrados × 30 rotações × 2 seeds; 30 com 15 Guardiões × 30 rotações × 2 seeds]. Cada identidade atravessa **todos os slots** exatamente uma vez por seed, com a mesma build M5 congelada e cinco escolhas/dez pontos adicionais por arquétipo. Dentro de cada rotação, todos os arquétipos usam as mesmas identidades, slots, seed e geometria. O teste exige 9 replays exatos, 264 comparações pareadas de arquétipos, regressão M5 e snapshots iniciais de posição idênticos entre arquétipos.

**Importante:** o cruzamento não isola causalmente spawn da ordem de atualização ou consumo de RNG não crítico; a rotação muda o pacote de três fatores. As rotações de uma mesma seed são dependentes: intervalos Wilson calculados são apenas descritivos, NÃO prova de equilíbrio. G01/G10 não são forçados nas builds desta rodada, diferentemente da matriz anterior.

**CI disparado, ainda sem aprovação confirmada nesta anotação:** [V5 M10 Full Slot Crossover QA — run 41083051138](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41083051138). Conferir logs, corrigir eventuais falhas e registrar números observados antes de encerrar a missão. Artefato previsto `m10-full-slot-crossover` (JSON, 14 dias).

**Próximo passo:** validar conclusão do CI, analisar diferenças por arquétipo/slot e dependência entre rotações; não alterar HP/escudos sem amostra independente e revisão humana. **G.2 PCs físicos não realizado. H.1/H.2 reais, V3, main, produção, XP, notas e turmas bloqueados.**


### Resultado confirmado do cruzamento de slots — CI 41083051138

**CI aprovado:** [run 41083051138](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41083051138), job `m10-full-slot` SUCCESS. O log confirmou **396/396 batalhas**, **264 comparações entre arquétipos com a mesma seed/slot**, **9 replays idênticos**, verificações de posições e regressões H.0/M10/E.7/M5. Artefato JSON [m10-full-slot-crossover](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41083051138/artifacts/12989488545).

| Composição | Guardião ofensivo | Guardião defensivo | Guardião pseudoaleatório | Participação Guardião |
|---|---:|---:|---:|---:|
| 4 equilibrados (12 por arquétipo) | 0/12 | 8/12 | 2/12 | 25% |
| 30 equilibrados (60 por arquétipo) | 16/60 | 30/60 | 27/60 | 23,3% |
| 30 com 15 Guardiões (60 por arquétipo) | 33/60 | 37/60 | 32/60 | 50% |

**Leitura:** o Guardião defensivo venceu mais que o ofensivo em todas as composições; com 30 equilibrados foram 50% versus 26,7%, apesar de todas as identidades passarem por todos os 30 slots. A sensibilidade às escolhas da build persiste depois do cruzamento, mas **não há prova de que o efeito seja exclusivamente da defesa**. Comparadas às builds ofensivas, as defensivas mudaram o vencedor individual em 9/12, 52/60 e 51/60 partidas respectivamente; pseudoaleatórias em 3/12, 50/60 e 54/60. G01 apareceu em todas as builds do Guardião porque já fazia parte das cinco escolhas M5; G10 **não foi forçado** (0 nas ofensivas/defensivas, 3/7 nas pseudoaleatórias de 30 equilibrados e 4/15 nas de metade Guardião).

**Limites:** 2 seeds por composição de 30 e rotações correlacionadas, não independentes; não interpretar Wilson como intervalo inferencial válido. A geometria de spawn, o índice do loop e consumo de RNG comum ainda variam conjuntamente. **Balanceamento não homologado; nenhum nerf aplicado.**

**Próximo incremento H.3:** aumentar seeds independentes e realizar cruzamento controlado mantendo coordenadas por identidade fixas ao permutar ordem, para separar o efeito conjunto de slot do efeito de build; manter M5 e H.0 protegidos. G.2 físico, H.1/H.2 reais, integração V3, merge e produção permanecem bloqueados.


## H.3/M10 — fatorial de geometria × ordem, com seeds independentes (30/10/2026)

**Estado: experimento em execução; CI focal ainda não confirmado neste checkpoint.** Mantida a mesma missão de balanceamento da arena final; não foi realizado nerf, alteração do motor canônico ou integração real.

- Teste novo: `qa/v5-m10-factorial-seed-crossover.cjs` (commit `cbe88e6`), workflow `.github/workflows/v5-m10-factorial-seed-crossover-qa.yml` (commit `ac07e44`).
- Intervenção 2×2 no motor M10 existente: **baseline**, somente geometria de spawn, somente ordem de processamento dos atores e combinação de ambas. As entradas, builds, estados iniciais e RNG de críticos por identidade ficam fixos no bloco; a geometria é permutada via `experimentalSpawnPositions` e o loop via `experimentalTurnOrder`, ambos M10-only e opt-in.
- Planejados 8 seeds independentes em cada composição de 30 (equilibrada e metade Guardiões), 4 seeds com quatro heróis, três arquétipos e 1–2 rotações por seed: **384 batalhas executadas (432 observações de braços, pois o baseline é reutilizado em dois cruzamentos) e 324 comparações pareadas**, além de 18 replays e regressões M5/H.0/E.7/M10. Não tratar as rotações como amostras independentes.
- Run focal: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41092263259. **Não declarar aprovado até conclusão e leitura dos resultados.**
- **Próximo passo:** conferir resultado do CI e artefato JSON, corrigir qualquer falha, registrar taxas de vitória por braço e variabilidade entre seeds, sem inferir causalidade exclusiva de um efeito ou aplicar nerf. G.2 nos PCs físicos, H.1/H.2 com alunos, V3, produção e `main` continuam bloqueados.

**Correção de contagem:** o primeiro CI focal (run 41092263259) passou em todas as verificações, mas o relatório inicial chamou incorretamente de 432 *batalhas* as 432 observações pareadas (baseline contado duas vezes por seed). O código foi corrigido em `8952cda`, e o workflow em `00ff729`; conferir o novo CI antes de aceitar a contagem de 384 batalhas distintas. Não há alteração nos resultados de combate.


### H.3 — fatorial M10: CI final confirmado (30/10/2026)

**Aprovado apenas como experimento sintético, não como balanceamento homologado.** [Run 41092435984](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41092435984), SHA testado `00ff729facd359850e3f3d8aef7389ef97e7ac1d`, job `m10-factorial` SUCCESS: **384 batalhas distintas**, 432 observações dos quatro braços (o baseline é reutilizado para os dois deslocamentos), 324 comparações pareadas, 18 replays exatos; H.0/M10/E.7/M5 e sintaxe aprovados. Artefato [m10-factorial-seed-crossover](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41092435984/artifacts/12995090103), hash `4a638770dd158a990c39`. O erro de rotulagem do primeiro relatório foi corrigido e retestado.

**Com 30 personagens equilibrados, 8 seeds independentes por arquétipo e duas permutações correlacionadas (16 observações por braço):**

| Build | Guardião baseline | Só geometria | Só ordem | Ambos |
|---|---:|---:|---:|---:|
| Ofensiva | 6/16 | 6/16 | 6/16 | 7/16 |
| Defensiva | 8/16 | 9/16 | 6/16 | 7/16 |
| Pseudoaleatória | 6/16 | 7/16 | 9/16 | 8/16 |

Em 30 equilibrados, a mudança **somente de geometria** alterou a identidade vencedora em 13–16 dos 16 pares conforme o arquétipo; mudar **somente a ordem** alterou 8–12/16. A maior sensibilidade individual a spawn não implica uma direção uniforme para a taxa de vitórias do Guardião. As observações de duas rotações do mesmo seed não são independentes, e oito seeds ainda são insuficientes para homologar justiça entre classes.

**Checkpoint final desta rodada:** commit de código `8952cda`, workflow `00ff729`, documentação anterior `3c44fb5`; resultados acima validados no CI. Próximo incremento: analisar variância entre seeds e efeitos de interação geometria×ordem por arquétipo; ampliar seeds sem confundir pares correlacionados com amostras independentes. Sem nerf nem alteração do motor M5/M10 canônico. G.2 físico pendente, H.1/H.2 reais e integração/merge não autorizados.

**CI amplo (observação separada):** no SHA `00ff729`, o workflow geral de navegador [run 41092436100](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41092436100) falhou inicialmente em um teste V3 de aprovação **fictícia** (`qa/v3-e2e.cjs:185`, estado `submitted` em vez de `approved`); o reprocessamento **do mesmo job, sem alteração de código**, concluiu com SUCCESS, inclusive o teste que falhara. Isso sugere intermitência, mas não comprova a causa; não modificar fluxo real de aprovações fora do escopo da M10. O CI focal M10 passou de primeira no SHA corrigido. O último commit deste checkpoint é apenas documentação, não foi incluído no SHA do run focal.


## H.3/M10 — análise por seed e interação geometria × ordem (30/10/2026, 14h)

**Missão única desta rodada:** transformar a matriz fatorial M10 já aprovada em diagnóstico de variabilidade por **seed independente**, sem aumentar artificialmente a amostra contando rotações como partidas independentes. Foram revisados os roadmaps D–I, checkpoints E/F/G, contrato H.0 e o CI fatorial anterior [41092435984](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41092435984).

- Novo arquivo `qa/v5-m10-factorial-seed-analysis.cjs` (commit `fb515308`): consome o JSON do experimento anterior, valida schema/384 partidas/324 pares/estado M5, agrupa rotações por seed, calcula diferenças condicionais de vitória do Guardião (somente geometria, somente ordem e interação fatorial `combinado - geometria - ordem + baseline`) e mudanças de vencedor individual. Acrescenta diferença **pareada por seed** entre builds defensivas e ofensivas, mantendo sementes correspondentes. Inclui fixtures de regressão do sinal da interação e determinismo do bootstrap.
- Workflow `.github/workflows/v5-m10-factorial-seed-crossover-qa.yml` atualizado no commit `cf6e493`: executa regressões M5/H.0/M10/E.7, 384 batalhas existentes e o novo analisador; publica os dois JSONs. Os intervalos percentis de 95% são exploratórios, obtidos por **2.000 reamostragens de seeds inteiras**, nunca de rotações isoladas. Não são prova de equilíbrio com apenas quatro ou oito seeds.
- **Run novo:** [41100661953](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41100661953), inicialmente observado em estado `queued`. **Não declarar PASS nem números do novo relatório antes de consultar conclusão, logs e artefatos.**
- **Próximo passo da MESMA missão:** verificar o CI, corrigir falhas se houver, registrar estimativas e dispersão entre seeds; só depois planejar novas seeds independentes e combinações de builds. Nenhuma alteração de dano/escudo/HP, motor canônico, XP, aprovações, alunos, turmas, V3, `main` ou produção. G.2 nos PCs físicos não realizado; H.1/H.2 com alunos reais permanecem bloqueados.


## H.3/M10 — influência de uma seed independente (30/10/2026, rodada seguinte)

**Missão única em andamento:** auditar se as estimativas de vitória do Guardião e a interação geometria × ordem são dominadas por uma das poucas seeds, antes de propor ajustes canônicos. No início da rodada foram relidos os documentos D–I, checkpoints E/F/G, contrato H.0, commits recentes e CI. O CI focal anterior [41100661953](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41100661953) concluiu **SUCCESS** no SHA `cf6e493`, confirmando o analisador por clusters que antes constava como pendente. O CI geral QA e Browser do mesmo SHA também passou. O workflow V5 Fase 1 em SHA `85f1d314` falhou no job `source-and-syntax`, passo `node --check v5/fase1-catalog.js`, enquanto o job de navegador passou; essa falha separada **não foi corrigida nesta rodada**, por estar fora do escopo de balanceamento M10.

**Incremento técnico:** `qa/v5-m10-factorial-seed-analysis.cjs` passou a registrar, por arquétipo e cenário, a análise *leave-one-seed-out* (retira uma seed inteira, preservando todas as rotações correlacionadas daquela seed). Reporta estimativa com todas as seeds, mínimo/máximo sem uma seed, deslocamento máximo absoluto e a influência de cada seed para: vitórias baseline do Guardião, efeito de geometria, efeito de ordem, interação fatorial e mudança de vencedor por geometria. Também audita a diferença defensiva − ofensiva com seeds pareadas. Adicionadas fixtures determinísticas para quatro seeds com deslocamento máximo esperado de 0,25. Não há novas batalhas, modificação de motor, talentos, HP ou nerf.

**Código:** commit [82e2dbc](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/commit/82e2dbcfa6bca355ce7030f93c4ddbfeba80c264). **CI focal confirmado:** [41108159229](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41108159229) — **SUCCESS** no SHA `82e2dbc`, job `m10-factorial` SUCCESS. O workflow executou regressões M5/H.0/M10, a matriz de 384 batalhas e o analisador com os novos campos. Artefato [m10-factorial-seed-crossover](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41108159229/artifacts/13003396300), 9.535 bytes compactados, contém os dois JSONs. O QA geral no mesmo SHA [41108159231](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41108159231) também concluiu SUCCESS. Os valores numéricos leave-one-out estão no JSON do artefato; não foram transcritos sem leitura direta.

**Próximo passo da MESMA missão:** confirmar CI e artefato, registrar sensibilidade máxima observada por composição/arquétipo e ampliar seeds independentes se a incerteza permanecer alta. Não interpretar leave-one-out nem bootstrap como homologação de equilíbrio com n=4/8. **G.2 nos PCs físicos não foi executado**; H.1/H.2 reais, V3, `main`, produção, XP, aprovações, notas, usuários e turmas continuam bloqueados.


## H.3/M10 — ampliação de seeds distintas, experimento fatorial (30/10/2026)

**Uma missão em execução:** ampliar a amostra sintética de seeds antes de considerar qualquer ajuste de HP, escudo, talento ou dano. Releitura dos roadmaps D–I, checkpoints E/F/G, H.0 e último CI M10 [41108159229](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41108159229) (SUCCESS para a amostra anterior).

**Incremento:** o fatorial 2×2 geometria × ordem passa de **4 para 8 seeds distintas** na composição de quatro heróis e de **8 para 16 seeds distintas** em cada composição de 30. As primeiras seeds mantêm a fórmula anterior, permitindo comparar os resultados sem trocar builds ou configurações. Totais esperados: **768 batalhas distintas, 864 observações de braços (baseline reutilizado entre rotações), 648 comparações pareadas, 18 replays idênticos, 9 verificações neutras e 648 verificações geométricas**. Os arquétipos ofensivo/defensivo/pseudoaleatório e as rotações compartilham seeds; não contam como amostras independentes. Análise bootstrap e leave-one-seed-out continua agrupando por seed.

**Arquivos:** `qa/v5-m10-factorial-seed-crossover.cjs`, `qa/v5-m10-factorial-seed-analysis.cjs` e `.github/workflows/v5-m10-factorial-seed-crossover-qa.yml`. Commits: `91ca4032`, `f8db4fc0`, `13c241e9`.

**Estado deste checkpoint:** código e workflow enviados para a branch experimental; **CI da nova amostra ainda precisa de confirmação**. Não interpretar os totais planejados como batalhas executadas até conferir o job e o artefato. Próximo passo da MESMA missão: conferir o CI do último SHA, corrigir falhas, extrair diferenças de vitórias e influência leave-one-seed-out; não homologar fairness com n=8/16.

**Gates preservados:** M5 (5 talentos/10 pontos), M10 (10 talentos/20 pontos), quatro classes KayKit, 120 talentos, câmera, arquibancadas, XP, aprovação, usuários e turmas sem alterações. G.2 em PCs físicos pendente; H.1/H.2 reais, `main`, merge e produção bloqueados.


### H.3/M10 — CI e resultados confirmados da ampliação (30/10/2026, 16h43 BRT)

**CI focal aprovado:** [run 41117388742](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41117388742), job `m10-factorial` SUCCESS, SHA de código/workflow `13c241e9529b5410599ad8614562f42673dc855c`. Verificados pelo log: **768 batalhas**, **864 observações dos braços** (baseline repetido nas rotações), **648 comparações pareadas**, **18 replays idênticos** e regressões H.0/M5/M10. Relatórios publicados no [artefato 13006347928](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41117388742/artifacts/13006347928), hash fatorial `cbfd6d7211b85d48824b`, hash do diagnóstico `c7265fc289c73ef3ebcf`.

**Guardião, composição equilibrada de 30 (16 seeds distintas × 2 rotações correlacionadas = 32 observações por arquétipo):** vitórias baseline ofensiva **12/32**, defensiva **12/32**, pseudoaleatória **14/32**. Somente mudança de geometria: **13/32**, **20/32**, **12/32**, respectivamente. A identidade vencedora mudou em **31/32**, **32/32**, **28/32** pares ao mudar só geometria, e em **23/32**, **22/32**, **19/32** ao mudar só ordem. A diferença defensiva menos ofensiva no baseline foi **0,00**, intervalo exploratório por reamostragem de seeds **[-0,25; +0,25]**; influência leave-one-seed-out máxima **0,0667**.

**Guardião, composição com 15 de 30 Guardiões:** baseline ofensiva **18/32**, defensiva **14/32**, pseudoaleatória **22/32**; diferença defensiva menos ofensiva **-0,125**, intervalo exploratório **[-0,375; +0,125]**. Isso demonstra dependência de composição e não autoriza nerf ou buff. A amostra usa seeds determinísticas distintas, mas builds e rotações compartilham seeds e são dependentes. O intervalo bootstrap com n=16 é exploratório, não certifica equilíbrio.

**Próximo incremento da MESMA missão:** investigar por que a geometria altera tão frequentemente o vencedor individual (pontos de spawn, proximidade, alvos, RNG) e conferir legibilidade/justiça visual em replay, sem alterar motor canônico ou escolher vencedor artificialmente. A M5, os 120 talentos e quatro KayKits permanecem preservados. **G.2 nos PCs físicos pendente; H.1/H.2 reais, `main`, deploy e dados de alunos continuam bloqueados.**

## H.3/M10 — diagnóstico de proximidade e primeiro alvo, sem alterar motor (30/10/2026)

**Missão única em andamento:** investigar o efeito do spawn na primeira seleção de alvo antes de qualquer ajuste canônico. Foram relidos ROADMAP-D-A-I, checkpoints E/F/G, H.0, commits e Actions recentes. O último fatorial de 768 batalhas foi aprovado no [run 41117388742](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41117388742); o QA geral e o browser passaram no SHA `be723d82`, mas o workflow legado de catálogo Fase 1 apresentou falha separada em `source-and-syntax`, que **não** é homologação geral.

**Incremento experimental:** novo `qa/v5-m10-first-contact.cjs` observa distância euclidiana ao vizinho mais próximo no spawn e o primeiro alvo escolhido após 0,05 s, mantendo as regras reais de `spaced`/navegação. Para cada seed compara posições originais contra rotações de slots +1 e +15, preservando identidade, classe, builds, atributos, HP inicial, ordem de processamento e seed de críticos. Registra mudanças de vizinho, primeiro alvo e vencedor, além de distância média inicial Guardião vs demais. São **16 seeds independentes** e três variantes de builds correlacionadas, total planejado de **144 batalhas e 96 comparações pareadas**; não contar rotações ou variantes como seeds novas. Os replays idênticos e a regressão M5 fazem parte do script. Observação não implica causalidade exclusiva: obstáculos, aggro e RNG de encontros também podem mediar o resultado.

**Commits:** [6a29d943](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/commit/6a29d943c52b33c395ddc137d8dd2c95adf7f8d0) (teste), [a9bc4c0b](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/commit/a9bc4c0b29e935aca0723b39372f5e3f95d64baf) (corrige comparação de HP inicial), [2267f00e](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/commit/2267f00e9654ec3202bc0f8fc303ee404d941f4b) (CI). **CI em execução, NÃO aprovado ainda:** [run 41125453708](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41125453708). O job passou na etapa de sintaxe e regressão M5/M10, mas a matriz fatorial e o novo diagnóstico ainda não tinham concluído na última consulta. Nenhum total planejado é declarado executado sem CI.

**Próximo passo da MESMA missão:** aguardar resultado do CI, corrigir eventual falha, ler os números do artefato JSON, distinguir mudança do primeiro alvo de mudança de vencedor e documentar limites. **G.2 em PCs físicos continua pendente; H.1/H.2 com alunos reais, `main`, merge, produção, XP, usuários, turmas e notas bloqueados.**

### H.3/M10 — verificação do primeiro contato no CI (30/10/2026)

**CI focal concluído SUCCESS:** [run 41125453708](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41125453708), SHA de código/workflow `2267f00e9654ec3202bc0f8fc303ee404d941f4b`. Etapas aprovadas: sintaxe, regressões H.0/M5/M10, matriz anterior de 768 batalhas, análise de seeds e **novo diagnóstico de 144 batalhas, 96 pares de spawn e 6 replays idênticos**. Hash do novo relatório `b0992cfa97e25aa95a1d`; relatório JSON incluído no artefato `m10-factorial-seed-crossover` do run.

**Observações de log, não estimativas independentes:** com 30 heróis, 16 seeds × 2 rotações × 3 variantes de builds, trocar somente a atribuição dos slots mudou o vizinho inicial de **748/960** personagens e o primeiro alvo escolhido após 0,05 s de **764/960** personagens, por variante. A identidade do vencedor mudou em **26/32** pares (variante 0), **30/32** (variante 5) e **31/32** (variante 9). Distância média ao vizinho inicial na geometria rotacionada: Guardião **14,2476**, outras classes **14,3212** unidades (mesmas posições em todas as variantes). As variantes e rotações compartilham seeds; estes 96 pares **não** são 96 amostras independentes. A pequena diferença descritiva entre distâncias não demonstra vantagem de classe.

**Interpretação restrita:** a alteração de geometria coincide com forte mudança do primeiro alvo, compatível com a hipótese de que o grafo inicial de confrontos medeia parte da variabilidade de vencedores. O teste **não separa** linha de visão, obstáculos, penalidade de aggro, encontros posteriores ou RNG dependente de confronto; não permite buff/nerf ou homologação de fairness. Nenhuma regra de seleção de alvo, stats ou talento foi alterada.

**Próxima execução da MESMA missão:** instrumentar separadamente linha de visão/obstáculos e aggro do primeiro tick com fixtures fictícias, depois comparar com replays para determinar se há problema de spawn a corrigir sem impor vencedor. G.2 em PCs físicos não foi realizado. H.1/H.2, `main`, merge, produção, XP, alunos e turmas continuam bloqueados.


## H.3/M10 — obstáculos, aggro e primeiro tick (30/10/2026)

**Missão em andamento:** explicar a influência da geometria na seleção inicial de adversários, sem alterar combate ou progressão. Foram relidos os roadmaps D–I e checkpoints E/F/G/H.0, verificados HEAD da branch e Actions anteriores. A M5 continua 5 talentos/10 pontos; o teste fictício M10 usa 10 talentos/20 pontos, quatro classes KayKit e os 120 talentos canônicos.

**Incremento verificado:** `qa/v5-m10-obstacle-aggro.cjs` examina o primeiro tick de 0,05 s em 4 e 30 personagens, 8 seeds por tamanho, dois modos de aggro (`free`/`spaced`), duas atribuições geométricas e duas navegações (`direct`/`steer`). São **128 ticks**, **64 pares de navegação** e **8 replays idênticos**; as 64 combinações diretas geram 1.088 observações de alvo. Não são 128 seeds independentes: cada seed é reutilizada entre configurações. O teste mede interseção de segmentos com os cinco obstáculos físicos, faixa de segurança da navegação (+0,74), primeiro alvo escolhido, vizinho mais próximo e existência de alternativa geometricamente livre. Verifica também, por inspeção do bloco de seleção do motor, que o score atual considera distância, reservas de aggro, reciprocidade e continuidade, **sem termo explícito de obstáculo/linha de visão**. Interseção geométrica não é prova de que um projétil seja bloqueado.

**Evidência CI focal:** [run 41133224214](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41133224214), **SUCCESS**, SHA `32c13e7b8f76fc6372481593a5408beb2e520fb7`. Passaram sintaxe, contrato H.0, regressões M5/M10, matriz de 768 batalhas, análise de seeds, diagnóstico de primeiro contato de 144 batalhas e o novo teste. Artefato `m10-factorial-seed-crossover` inclui `m10-obstacle-aggro.json`, hash `9b10d001a2f00e43b715`.

**Resultados observados no primeiro tick:** em 30 personagens, alvos cujos segmentos cruzam obstáculos: `free` **32/480** e `spaced` **36/480** (contando duas geometrias e 8 seeds; amostras correlacionadas). No `spaced`, o primeiro alvo difere do vizinho mais próximo em **57/480** observações; no `free`, em **0/480**. O primeiro ator escolheu o mesmo alvo em navegação `direct` e `steer` nos 64 pares; nenhum par teve mudança de qualquer alvo no primeiro tick nesta amostra. Com 4 personagens, o `spaced` teve 4 segmentos obstruídos em 64 observações; `free`, nenhum. Isso descreve uma lacuna potencial de legibilidade, **não demonstra dano atravessando parede nem necessidade de buff/nerf**.

**Correção de regressão KayKit encontrada ao consultar CI:** o workflow legado `V5 Fase 1` falhava em assertions obsoletas: `v5/fase1-catalog.js` ainda esperava `player_archer.glb` em vez de `Rogue_Hooded.glb`, e `qa/v5-classes.cjs` exigia seis GLBs mesmo após a decisão de quatro KayKits. Ajustados metadados do catálogo e QA para quatro modelos aprovados, **sem remover classes do core legado**. Commits `dc812969` e `a1097991`; o CI desse segundo ajuste precisa ser verificado antes de declarar regressão resolvida.

**Próximo passo da MESMA missão:** verificar o CI geral/Fase 1 após o ajuste e, depois, avaliar em laboratório se o aggro deveria considerar visibilidade/obstáculos e se isso melhora a compreensão sem enviesar vencedores. Nenhum ajuste de IA, dano ou colisão foi aplicado. **G.2 nos PCs físicos não realizado; H.1/H.2 reais, `main`, merge, deploy, XP, aprovações, notas, usuários e turmas continuam bloqueados.**

## H.3/M10 — candidato de alvo com corredor livre, sem alterar o motor (30/10/2026)

**Missão única em andamento:** avaliar, de forma contrafactual, se um filtro geométrico limitado de obstáculos poderia reduzir a seleção inicial de adversários ocultos por pilares. Foram relidos o roadmap D–I, checkpoints E/F/G/H.0, o HEAD e os Actions. O QA geral, browser e catálogo KayKit estavam verdes no HEAD anterior `b66c0f33`. Nenhum dado de aluno, API, XP ou progressão real foi acessado.

**Entrega:** `qa/v5-m10-los-candidate.cjs` e `.github/workflows/v5-m10-los-candidate-qa.yml`. Para cada alvo do primeiro tick, o teste propõe, **somente no relatório**, a alternativa com segmento livre até o alvo e distância adicional de no máximo `min(8, 0.5 × distância original)`; se não houver alternativa, conserva o alvo original. O candidato **não é injetado na IA**, não muda o motor, o vencedor, a câmera, as 4 classes KayKit nem os 120 talentos. A interseção com círculo de obstáculo é apenas aproximação geométrica, não teste real de visibilidade/projétil.

**CI focal SUCCESS:** [run 41139475999](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41139475999), SHA de correção `741a7c26af241d3eca7ada16a028038f05f83b4b`. Sintaxe, H.0, M5/M10 e replay E.7 passaram. O primeiro run [41139428161](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41139428161) falhou porque a permutação experimental omitira `face` (obrigatório no spawn); corrigido no SHA acima. O QA geral [41139475919](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41139475919) passou; o QA de navegador [41139475878](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41139475878) ainda estava em andamento na última consulta.

**Medição sintética:** 128 ticks (64 pares direct/steer), 1.088 observações de alvo, 8 replays idênticos, 8 seeds por tamanho de elenco (seeds reutilizadas entre braços). **72/1.088** escolhas iniciais tinham segmento geométrico obstruído; **60/72** tinham alternativa próxima livre sob o limite adotado; **12/72** permaneceriam obstruídas. Esses números **não** são melhora observada de gameplay nem de taxa de vitória; são apenas cobertura hipotética do filtro. Hash JSON `2cb9d8ecf3535351a9c0`.

**Próximo passo da MESMA missão:** definir e testar um protótipo opt-in que calcule visibilidade real/colisão de projéteis e reavalie reservas de aggro após retargeting, com comparação pareada de vencedores, tempo e justiça entre classes antes de qualquer alteração canônica. A integração V3/V5 continua em ramo separado, sem autorização de uso com alunos reais. **G.2 em PCs físicos não realizado; H.1/H.2 reais, main, merge, produção, XP, aprovações, turmas e notas bloqueados.**


## H.3/M10 — alvo visível opt-in, combate pareado (30/10/2026)

**Missão única em andamento:** comparar o candidato geométrico de primeiro contato com o motor de combate real, exclusivamente em partidas fictícias. Revisados ROADMAP-D-A-I, checkpoints E/F/G/H.0, HEAD e Actions. **Sem alteração canônica** de vida, dano, 120 talentos, quatro KayKits, M5, XP ou aprovações.

**Incremento implementado:** `v5/phase2-combat.js` ganhou `experimentalVisibilityAwareTargets:true` estritamente para `arenaMission:10`, desligado por padrão. Se o alvo atual tem segmento geométrico cruzando um pilar (raio físico de projétil `r+.2`), tenta um adversário com segmento livre dentro de `distância original + min(8, 50% da distância)`; mantém penalidade de aggro e reciprocidade quando `spaced` e registra a reserva **depois** do alvo final. Sem alternativa próxima, conserva o alvo original. **Não** altera a colisão real de projéteis, telemetria canônica, câmera, M5 nem regras pedagógicas. Não é LOS completo: projéteis se movem e podem atingir terceiros, e algumas habilidades não usam projétil.

**Teste e CI:** `qa/v5-m10-los-combat-trial.cjs` usa contrato H.0, fixture com três heróis e obstáculo, valida M5/default M10, roda 24 pares (48 batalhas planejadas) em 4/30 personagens, modos `free`/`spaced`, seis seeds por grupo, compara primeiros alvos, vencedores, duração, eventos de talento, projéteis bloqueados e replay idêntico. `.github/workflows/v5-m10-los-combat-trial-qa.yml` gera relatório JSON fictício por 14 dias. **CI focal ainda NÃO aprovado no momento deste checkpoint:** [run 41146367137](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41146367137), commit de correção `e9a8cfe52e923b57eee7a1115ae61013c1df6ec8`. Primeiro run falhou por chave pseudônima com maiúsculas (corrigido); segundo falhou por comparar posições **antes** do tick com a seleção realizada depois de movimentos anteriores (corrigido: divergência passa a ser métrica, e fixture estática verifica garantia causal). Não contar 48 partidas como executadas até obter PASS.

**Próximo passo da MESMA missão:** verificar resultado focal, corrigir qualquer falha, ler números do relatório JSON e comparar classe vencedora/tempo/colisões. Não ativar o filtro por padrão nem homologar fairness com amostra pequena. Preparar depois visualização M10 3D opt-in e testes de câmera/arquibancada. **G.2 nos PCs físicos pendente; H.1/H.2 reais, main, merge, deploy, XP, notas, alunos e turmas bloqueados.**


### H.3/M10 — resultado verificado do alvo visível opt-in (30/10/2026)

**CI focal SUCCESS:** [run 41146429871](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41146429871), SHA de código/QA `26620fa295afb3d4a6bb6cbcebc4f43b19da045b`. Sintaxe, H.0, M5, motor M10, replay E.7 e novo experimento passaram. [Relatório JSON](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41146429871/artifacts/13020807355), hash de grupos `d1e4f046817d6f887691`. Os dois runs iniciais falharam por fixtures/medição de posições e foram corrigidos; não confundir com aprovação antes das correções.

**Amostra executada:** 24 pares de batalhas (48 batalhas completas), seis seeds por cada um dos quatro grupos (4/30 personagens × aggro livre/espaçado), oito replays idênticos. A primeira escolha de alvo mudou em **28 observações**, com segmentos geométricos obstruídos no snapshot pré-tick caindo de **38 para 15**. O vencedor mudou em **12 dos 24 pares**. Na configuração de 30 personagens com `spaced`, houve **13 primeiras escolhas diferentes** e **4/6 vencedores diferentes**. São observações sintéticas correlacionadas, **não** evidência de maior justiça: o novo filtro altera a dinâmica de combate e pode favorecer outras classes. Cinco mudanças de alvo foram classificadas como inicialmente livres no snapshot **anterior** ao tick porque atores processados antes podem se mover; não são falhas comprovadas do seletor no instante exato da escolha.

**Segurança/regressão:** M5 padrão e M10 com opção desligada passaram com resultados idênticos; não foi ativado filtro em nenhuma interface. A escolha de alvo continua sujeita a aggro, obstáculos, linha de visão incompleta, ordem e RNG. O teste **não** comprova que habilidades não atravessem pilares nem que projéteis fiquem menos bloqueados: em alguns grupos os bloqueios aumentaram. Sem alterações em dano, atributos, talentos, câmera, turmas ou usuários.

**Próxima execução, ainda na M10:** ampliar seeds e builds, medir seleção em tempo de escolha (em vez de snapshot pré-tick), segmentar por classe e validar comportamento visual/legibilidade no Chromium antes de considerar qualquer configuração padrão. A prévia 3D M10 e G.2 nos PCs físicos continuam pendentes. H.1/H.2 reais, `main`, merge, deploy, XP, aprovações e dados reais seguem bloqueados.


## H.3/M10 — amostra estratificada do seletor LOS opt-in (30/10/2026, rodada seguinte)

**Missão em andamento:** ampliar a evidência do protótipo de alvo geometricamente livre em confrontos fictícios, antes de qualquer ativação padrão. Foram revisados ROADMAP-D-A-I, checkpoints E/F/G/H.0, HEAD, commits e Actions. O run anterior de 48 batalhas foi aprovado, mas mudou vencedores em 12/24 pares; isso exige amostragem adicional, não alteração precipitada de balanceamento.

**Incremento implementado no commit `574dc21149e2689654c208444af73979524dff6d`:** atualizado `qa/v5-m10-los-combat-trial.cjs` (schema v2) para cruzar **três variantes de build (0/3/5)**, **oito seeds por estrato**, **quatro e trinta lutadores** e modos de aggro `free`/`spaced`. O experimento passa a planejar **12 estratos, 96 pares (192 batalhas)**, 24 replays exatos e métricas de primeiro alvo separadas por classe. As seeds são compartilhadas entre braços/variantes e não constituem 96 observações independentes. Cada build M10 é validada com 10 talentos/20 pontos e snapshot M5 de 5 talentos/10 pontos pelo contrato H.0. Não houve mudança no motor, IA padrão, câmera, quatro KayKits, 120 talentos ou progressão real.

**CI focal em execução na escrita deste checkpoint:** [run 41151028293](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41151028293), SHA de teste `574dc21149e2689654c208444af73979524dff6d`. O passo de sintaxe/contrato/regressões passou; a matriz estratificada ainda estava em andamento. **Não declarar 192 batalhas concluídas nem balanceamento aprovado sem resultado final e relatório.** QA geral e browser do mesmo SHA também foram iniciados.

**Próximo passo da MESMA missão:** verificar conclusão do CI, ler os totais por classe/variante e possíveis regressões, corrigir falhas e atualizar evidência. Depois, medir seleção no instante exato do aggro e comportamento visual no Chromium, antes de cogitar qualquer alteração padrão. **G.2 nos PCs físicos ainda não realizado; H.1/H.2 com alunos reais, `main`, merge, deploy, XP, aprovações, usuários, notas e turmas continuam bloqueados.**


### H.3/M10 — resultado do cruzamento LOS por build e classe (30/10/2026)

**CI focal SUCCESS:** [run 41151028293](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41151028293), SHA do código `574dc21149e2689654c208444af73979524dff6d`. Passaram sintaxe, contrato H.0, regressões M5/M10, replay e teste estratificado. Artefato `m10-los-combat-trial-report` [ID 13023385653](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41151028293/artifacts/13023385653), hash `47a27d953d99d0f49990`, retenção 14 dias. QA geral do SHA também **SUCCESS** no [run 41151028263](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41151028263). Browser QA do SHA ainda estava em execução na consulta; não declarar browser aprovado.

**192 batalhas realmente concluídas:** 96 pares, 12 estratos (builds 0/3/5 × 4/30 personagens × aggro livre/espaçado), oito seeds por estrato, **24 replays exatos**. Primeiro alvo mudou 90 vezes; segmentos inicialmente obstruídos no snapshot pré-tick caíram de **128 para 53**. O vencedor mudou em **44/96 pares**. Não há violações detectadas do limite de distância inicial da alternativa escolhida. As 96 comparações compartilham seeds e configurações: não são 96 experimentos independentes.

| Tamanho | Pares | Vencedor mudou | Segmentos obstruídos antes → depois | Vitórias Guardião antes → depois | Vitórias Caçador antes → depois |
|---|---:|---:|---:|---:|---:|
| 4 | 48 | 16 | 21 → 0 | 19 → 7 | 12 → 18 |
| 30 | 48 | 28 | 107 → 53 | 29 → 25 | 6 → 13 |

**Segmentação por classe no primeiro tick:** em 30 personagens, as 69 mudanças de primeiro alvo se concentraram em Guerreiro (12), Mago (30) e Caçador (27); nenhuma mudança de primeiro alvo do Guardião foi observada nas posições/builds amostradas. Isso **não** significa que a política ignore o Guardião ou que não mude seu combate posteriormente. Em 4 personagens, 21 mudanças de alvo ocorreram todas com o Mago. Os segmentos são avaliados no snapshot anterior ao tick, não no exato instante da escolha; em 15 mudanças, o alvo parecia inicialmente livre no snapshot. Não interpretar isso como erro comprovado de LOS.

**Interpretação e pendências:** o protótipo pode melhorar a escolha geométrica inicial, mas alterou vencedores em 45,8% dos pares e não comprovou melhora real de colisão/projéteis ou equidade de classes. **Manter `experimentalVisibilityAwareTargets` desligado por padrão.** Próxima missão H.3: instrumentar o alvo no instante de escolha, incluir métricas de projétil/aggro e executar QA visual M10 3D Chromium antes de qualquer proposta de ativação. G.2 em PCs físicos, H.1/H.2 reais, `main`, merge, deploy e dados reais permanecem bloqueados.

## H.3/M10 — telemetria exata no instante da escolha do alvo (30/10/2026)

**Uma missão técnica executada:** separar o erro de aproximação geométrica do snapshot pré-tick da seleção real de alvo. Após reler ROADMAP-D-A-I, checkpoints E/F/G/H.0, commits recentes e GitHub Actions, foi instrumentado `v5/phase2-combat.js` com `experimentalTargetTrace:true`, **somente na M10 fictícia**, desligado por padrão. A telemetria captura no próprio loop de decisão o ator, posição, alvo antes/depois do filtro opt-in, coordenadas do alvo, distância, obstrução geométrica de pilar (raio físico `r + .2`) e reservas de aggro anteriores. Os registros são congelados, disponibilizados em cópias, limitados ao primeiro tick de 0,05 s; não emitem eventos de combate, não consomem RNG e não alteram a seleção. Não se trata de LOS completo para habilidades ou unidades móveis.

**Commits de implementação:** `87fb24c4a88a666b66e3490fcdd8292c18a09985` (motor/trace), `a388188f758d419a25f509c5fd00c7693e26b79a` (QA), `acbdfa5edb39871347294abe67069850f42930af` (workflow). Arquivos: `v5/phase2-combat.js`, `qa/v5-m10-selection-time-los.cjs`, `.github/workflows/v5-m10-selection-time-los-qa.yml`. A nova matriz usa contrato H.0 para 10 talentos/20 pontos M10 e preserva o snapshot M5 5 talentos/10 pontos.

**CI específico comprovado SUCCESS:** [run 41156307775](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41156307775), SHA `acbdfa5edb39871347294abe67069850f42930af`. Sintaxe, H.0, M5/M10, replay e novo QA passaram. [Artefato JSON](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41156307775/artifacts/13025156065), hash `3ab678310a3633bef80d`, retenção 14 dias. QA geral do mesmo SHA também SUCCESS no [run 41156307470](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41156307470). **Browser QA do SHA ainda estava em execução** no [run 41156307780](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41156307780) na última consulta; não declarar homologação visual.

**Medições do relatório sintético:** 48 pares de primeiros ticks (96 ticks instrumentados), **1.632 escolhas de alvo observadas** nos braços padrão/LOS opt-in, três variantes de build, quatro seeds por estrato, 4/30 personagens e aggro `free`/`spaced`. **12 escolhas foram redirecionadas**; obstruções no exato instante de seleção passaram de **60 para 48** ao somar os dois braços da comparação (a diferença de 12 corresponde aos redirecionamentos; não confundir os 60 e 48 com totais exclusivos de um braço). **Zero** redirecionamentos com alvo originalmente livre, zero redirecionamentos para alvo bloqueado e zero violações do limite de distância. **Quatro divergências** entre a obstrução no snapshot pré-tick e no instante da seleção confirmam que o proxy anterior não é equivalente à geometria no instante real. Quatro batalhas completas tiveram resultados idênticos com/sem trace; M5 também permaneceu idêntica. Seeds reutilizadas entre braços e variantes: resultados correlacionados, não amostras independentes.

**Interpretação:** a telemetria valida a lógica de seleção em seu instante real e corrige a interpretação dos snapshots, mas não comprova melhora de colisões, projéteis, justiça entre classes ou desempenho gráfico. `experimentalVisibilityAwareTargets` e `experimentalTargetTrace` seguem desligados por padrão. **Próximo incremento da MESMA missão:** testar no Chromium a prévia 3D M10 opt-in (quatro KayKits, 30 personagens, câmera/arquibancadas, legibilidade e retomada), usando somente builds fictícias; não integrar a V3 real. **G.2 em PCs físicos ainda NÃO realizado; H.1/H.2 com alunos reais, `main`, merge, deploy, XP, aprovações, usuários, notas e turmas continuam bloqueados.**


## H.3/M10 — câmera de espectador e retorno à M5 no Chromium (30/10/2026, incremento em validação)

**Missão única:** complementar a prévia M10 com regressão de navegador para passagem da câmera do aluno fictício vivo à arquibancada após eliminação real, preservando uma única simulação e o diretor global. Roadmap D–I, checkpoints E/F/G/H.0, commits recentes e GitHub Actions consultados antes da implementação. O HEAD anterior era 11419733389e16b9967d750128f5f4b457f0c545; QA geral, browser e KayKit desse HEAD estavam **SUCCESS** (runs 41156382632, 41156382754, 41156382715).

**Implementação isolada:** qa/v5-m10-spectator-browser.cjs (commit 396674f90934644c55444f3ce242fd66392d4d4e) executa roster fictício de 30 KayKits, M10 10 talentos/20 pontos, seed fixa, escolha de personagem que será eliminado a partir do replay determinístico de referência, câmera pessoal em vida, pausa/retomada, transição após KO para o feed compartilhado, retorno ao professor, vitória, 29 espectadores, reset sem resíduos e retorno à M5 5 talentos. Usa Chromium WebGL com renderização por software e preferência de movimento reduzido; captura screenshot de evidência. Nenhum usuário real, XP, turma, aprovação, nota ou armazenamento é acessado.

**CI:** .github/workflows/v5-m10-visual-qa.yml atualizado (commit 8a63d17b4b53e5758b1a4191f3395a6eb783edd7) com job independente spectator-camera-webgl e artefato m10-spectator-camera-30. [Run 41160753433](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41160753433) estava **EM EXECUÇÃO** neste registro; apenas final-roster havia passado, enquanto final-webgl e o novo job estavam em progresso. **Não marcar validação visual concluída antes de verificar o resultado do CI e corrigir eventuais falhas.**

**Próximo passo da MESMA missão:** verificar o run e os artefatos, corrigir o novo teste ou comportamento observado se necessário; registrar SHA final e evidência. O seletor experimental de alvos permanece desligado por padrão; nenhuma regra de M5/M10, balanceamento, talentos, câmera canônica ou V3 foi modificada. **G.2 nos PCs físicos da escola ainda não realizado. H.1/H.2 com alunos reais, main, merge e deploy bloqueados.**


### H.3/M10 — validação concluída do novo teste de câmera/espectador (30/10/2026)

**Correção e evidência:** o primeiro CI [41160753433](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41160753433) falhou somente no novo teste porque ele comparava o feed do aluno vivo com um objeto global ainda nulo; o feed global nasce ao morrer. Corrigida a comparação para o ID do feed já registrado no viewer em qa/v5-m10-spectator-browser.cjs (commit cd6b7c9afcfcfde4b20a3f0f05329417002217a9).

**CI focal SUCCESS em [run 41160883373](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41160883373), SHA cd6b7c9afcfcfde4b20a3f0f05329417002217a9:** os três jobs final-roster, final-webgl e spectator-camera-webgl passaram. O novo teste confirmou 30 GLBs KayKit, M10 10 talentos/20 pontos, transição da câmera do fictício trial-m10-17-mage para o diretor compartilhado após KO real, retorno ao professor sem trocar feed, pausa/retomada, mesmo vencedor determinístico trial-m10-22-hunter, 29 eliminados, reset e regressão M5 com cinco talentos. Preferência reduced-motion ativada no Chromium. Screenshot coletada no [artefato m10-spectator-camera-30 (ID 13026679100)](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41160883373/artifacts/13026679100). Isso é **QA automatizado em SwiftShader**, não avaliação humana da legibilidade ou aprovação de FPS nos computadores da escola.

**Próximo incremento da MESMA M10:** inspecionar enquadramento e legibilidade dos screenshots em desktop/telão, depois testar desempenho nos PCs físicos (G.2) com autorização; antes de integrar V3/alunos reais, resolver a falha conhecida de sobreposição do carrossel V3 ao botão Personagem & Duelos. Não ativar seletor LOS por padrão. H.1/H.2 reais, main, merge, deploy e dados reais continuam bloqueados.


## H.3/M10 — auditoria automatizada de legibilidade desktop/telão (31/10/2026)

**Missão única em andamento:** medir a apresentação da arena M10 fictícia com 30 personagens KayKit em resoluções de projeção e desktop, após a regressão de câmera/espectador. Antes da alteração foram relidos roadmap D–I, checkpoints E/F/G/H.0, commits e Actions da branch. O HEAD inicial era d043e9fec19734212bc6c0ce36096c5a8ddd59e0, com QA geral, browser e catálogo KayKit aprovados (runs 41161106896, 41161106834, 41161106806).

**Incremento entregue para CI:** novo qa/v5-m10-legibility-browser.cjs (commit e7383506d69fb6114c03564d4645e55c03ac81db) e novo job projector-legibility-webgl em .github/workflows/v5-m10-visual-qa.yml (commit bd4e7a6c26982643dfc7ecd238e3c8fd1ba86c40). O teste inicia uma M10 fictícia com 30 GLBs KayKit, espera eventos reais de talentos, pausa o motor, entra no modo imersivo e mede no Chromium as resoluções **1920×1080** e **1366×768**. Verifica tamanho útil da arena, canvas, overlays de destaque/legenda/talento contidos no palco, título/contadores/status visíveis, tipografia mínima do destaque e telemetria, ausência de rolagem horizontal e 30 personagens no roster. Produz screenshots por resolução e relatório JSON incluindo quantidade de nicks visíveis e truncamento de talento. O teste usa SwiftShader, não mede legibilidade subjetiva ou FPS dos PCs físicos.

**CI focal:** [run 41165290149](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41165290149) iniciado no SHA bd4e7a6c; na última consulta os jobs WebGL ainda estavam **em andamento** e final-roster estava **SUCCESS**. QA geral do mesmo SHA **SUCCESS** no [run 41165290204](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41165290204). **Não marcar auditoria visual aprovada sem o job novo concluir e sem examinar as medições**; se falhar, corrigir na próxima execução da mesma missão. Capturas e relatório estarão no artefato m10-projector-legibility se o job gerar arquivos.

**Próximo passo:** verificar conclusão do CI, examinar métricas/screenshots 1920/1366 e corrigir clipping, excesso de HUD ou texto insuficiente sem mudar a simulação; só depois solicitar homologação visual humana. Não alterados M5 (5 talentos/10 pontos), M10 (10/20), 120 talentos, quatro classes KayKit, balanceamento, câmera canônica ou progressão. O seletor LOS continua desligado por padrão. **G.2 nos PCs físicos NÃO realizado; H.1/H.2 com alunos reais, main, merge, deploy, XP, aprovações, notas, usuários e turmas bloqueados.**


### H.3/M10 — resultado do QA de legibilidade em Chromium (31/10/2026)

**Falha corrigida:** o primeiro job de projeção no [run 41165290149](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41165290149) falhou por timeout da captura Playwright de um canvas WebGL em movimento, **não por uma violação de tamanho/overlays**. O teste foi corrigido no commit 62587700d5b5b7948ef9ce9eb5e0130c26eb0ed7 para capturar diretamente pelo protocolo CDP, sem aguardar estabilização de animações; relatório JSON passa a ser salvo incrementalmente.

**Job projector-legibility-webgl SUCCESS:** [run 41165418298](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41165418298), SHA 62587700d5b5b7948ef9ce9eb5e0130c26eb0ed7. Medidas em modo imersivo após 5+ eventos de talento reais, motor M10 pausado: em **1920×1080**, canvas/palco 1900×702 px, destaque 16 px, talento 12 px, 9 nicks visíveis; em **1366×768**, palco 1346×342 px, destaque 16 px, talento 12 px, 1 nick visível. Os dois cenários passaram limites de palco, overlays, controles, ausência de overflow horizontal e 30 registros fictícios de combatentes. **O teste não exige nem comprova 30 nicks simultaneamente legíveis**: a câmera acompanha apenas parte do combate. Em 1366×768, os 342 px úteis indicam que vale reduzir o espaço consumido por controles em modo imersivo antes de homologar projeção em telas menores.

**Artefato:** [m10-projector-legibility, ID 13029470754](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41165418298/artifacts/13029470754), com screenshots 1920/1366 e JSON. As capturas foram geradas pelo Chromium e anexadas; não foram homologadas por observação humana. QA geral do SHA SUCCESS no [run 41165418346](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41165418346). O job spectator-camera-webgl também SUCCESS; final-webgl e browser QA geral ainda estavam em andamento na consulta, portanto não afirmar aprovação total do workflow antes do encerramento.

**Próximo passo da MESMA M10:** revisar as capturas e experimentar layout compacto dos controles no modo imersivo em 1366×768, medindo ganho real de área do palco sem ocultar comandos de professor nem mudar a câmera/combate. Depois, validação G.2 nos PCs físicos com aceite humano. O seletor LOS segue desligado por padrão; M5, M10, classes, 120 talentos, XP, notas, turmas, dados reais, V3, main, merge e produção não foram alterados.


## H.3/M10 — controles imersivos compactos e ganho medido de palco (31/10/2026)

**Missão técnica da rodada:** ampliar a área de combate visível no modo imersivo de 1366×768, sem ocultar controles do professor, do espectador ou alterar regras de combate. Foram consultados roadmap D–I, checkpoints E/F/G/H.0, histórico de commits e GitHub Actions. HEAD inicial: `fc4f5971c7f3677c18816a8c8b4d64e85b2d8ff9`.

**Implementação isolada:** `v5/arena-lab.css` define grade compacta de seis colunas para comandos imersivos desktop (>700px), preserva título/contadores, retira somente o bloco informativo redundante dos modelos durante a ampliação e compacta a faixa F.3 de aluno/professor sem esconder seleção, câmera ou status. `v5/arena-lab.html` move o bloco F.3 para o final dos comandos, alinhando ordem visual e ordem de tabulação. `qa/v5-m10-legibility-browser.cjs` agora exige altura mínima do palco (500px em 1366; 800px em 1920), toolbar até 150px, todos os 11 botões + status do diretor visíveis, F.3 acessível, canvas e overlays contidos, sem overflow horizontal. O modo normal não recebe essa compactação.

**Falhas de QA e correções:** no run [41169183782](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41169183782), a primeira tentativa não atingiu 800px de palco no projetor (765px), porque a faixa F.3 ainda ocupava muitas linhas. No run [41169311090](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41169311090), o palco cresceu para 847px, mas a toolbar media 175px, porque os últimos dois botões vinham depois da faixa F.3 e geravam uma quarta linha. O HTML foi reordenado mantendo todos os comandos, e o teste focal passou no [run 41169455267](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41169455267), SHA `2a10e66fef1f31e54716370917269ed78e225ba8`.

**Medições reais do Chromium/SwiftShader, com 30 KayKits fictícios e talentos disparados:**

| Viewport | Antes | Depois | Ganho de palco | Destaque/talento |
| --- | ---: | ---: | ---: | --- |
| 1920×1080 | 1900×702 | **1900×885** | **+183px (+26,1%)** | 16px / 12px |
| 1366×768 | 1346×342 | **1346×573** | **+231px (+67,5%)** | 16px / 12px |

O teste de projeção, o contrato do roster e o teste F.3 de espectador passaram; o job `final-webgl` ainda estava em execução no instante deste registro. Relatório JSON e capturas: [artefato m10-projector-legibility, ID 13030387343](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41169455267/artifacts/13030387343). QA geral passou no [run 41169455212](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41169455212). **A captura automatizada não substitui avaliação visual humana nem teste G.2 em PCs físicos.**

**Próximo passo da MESMA M10:** verificar conclusão de todos os jobs do SHA final, inspecionar visualmente as capturas em telão e desktop, testar foco/tabulação em modo imersivo e registrar aceite humano. G.2 em hardware real permanece pendente; seletor LOS continua opt-in e desligado por padrão. Não alterar M5 (5 talentos/10 pontos), M10 (10/20), quatro classes KayKit, 120 talentos, XP, dados reais, V3, main, merge ou deploy. H.1/H.2 reais continuam bloqueadas.


**Atualização de CI após o checkpoint (31/10):** os **quatro jobs** do workflow M10 [41169455267](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41169455267) terminaram **SUCCESS** no SHA `2a10e66f`. Browser QA geral [41169455256](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41169455256), câmera F.1/F.3, GLB recovery G.3, catálogo KayKit, freeze de endgame e QA geral também passaram nesse SHA. O workflow G.1 [41169455252](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41169455252) falhou inicialmente no job `real-browser` por crescimento de texturas durante aquecimento de GPU em SwiftShader (211→385→559), mas **passou ao reexecutar somente o job** sem mudar código. Tratar como **instabilidade intermitente a investigar**, não como prova de ausência de vazamento. O workflow Arena Lab M5/M10 ainda estava em execução nesta consulta. **G.2 físico não realizado**.


**Correção adicional de regressão observada (31/10):** o workflow Arena Lab [41169455296](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41169455296) revelou um teste C.3 desatualizado: `qa/v5-build-identity.cjs:30` exigia que toda build com `approvedMissions:10` fosse rejeitada, embora o motor experimental H.3 já aceite explicitamente builds M10 de 10 talentos/20 pontos. Corrigido **somente o teste**, no commit `1ec07167ec04ff22d54390ea292dff7c94bff8c8`, para exigir identidade visual válida de M10 canônica, 10 talentos, 20 pontos, identidade distinta de M5 e rejeição de talentos/pontos excedentes. Nenhum talento ou regra de produção mudou. O job `rules` do novo [run 41169819316](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41169819316) terminou **SUCCESS**; o job `browser` estava em andamento na última consulta. Não declarar o workflow inteiro aprovado até finalizar o navegador.


## H.3/M10 — contenção de foco e teclado no modo imersivo (31/10/2026)

**Missão em andamento, exclusivamente experimental:** após consultar ROADMAP D–I, checkpoints E/F/G/H.0, HEAD e Actions, o ponto de partida era `494d5553a1c1c8cefbdf236178f623e2d1187919` (QA geral, browser, KayKit e M5/M10 já aprovados nesse SHA). O próximo gate era impedir que Tab/Shift+Tab saísse do Coliseu ampliado para elementos invisíveis do restante da página.

**Incremento real:** `v5/arena-lab.js` (commit `97957830`) dá semântica de diálogo modal somente ao modo imersivo, mantém foco nos controles visíveis/habilitados da arena, cicla Tab/Shift+Tab nas extremidades, permite Escape e restaura foco ao botão de ampliar/fechar. Não muda layout, simulação, câmera, dano, classes ou progressão. `qa/v5-m10-legibility-browser.cjs` (commits `7b2ca025`, `c9a9abbe`) acrescenta asserções de foco, abertura por Enter, fechamento por Escape e remoção da semântica modal, reutilizando o Chromium de 30 KayKits M10. O relatório JSON passa a incluir `keyboard`. A primeira revisão do teste corrigiu somente a codificação de newline no JSON.

**CI ainda sem conclusão neste checkpoint:** [run M10 41173168691](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41173168691) no SHA `c9a9abbe88e6a2654606eecb35070e8a74e86f9f`, inicialmente em fila; QA geral [41173168776](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41173168776) e browser geral [41173168805](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41173168805) também pendentes. **Não declarar teste aprovado antes do resultado.** Se o novo teste falhar, corrigir e retestar na mesma missão.

**Próximo passo:** confirmar o job `projector-legibility-webgl` e demais regressões, revisar foco no Chromium e somente então marcar o incremento como validado. G.2 nos PCs físicos continua NÃO realizado; seletor LOS opt-in desligado; H.1/H.2 reais, V3, main, merge, deploy, XP, aprovações, notas, usuários e turmas não tocados.


### Fechamento do incremento de teclado — CI confirmado (31/10/2026)

**Evidência verificada:** o workflow [M10 WebGL 41173168691](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41173168691), no SHA `c9a9abbe88e6a2654606eecb35070e8a74e86f9f`, terminou **SUCCESS em todos os quatro jobs**: `final-roster`, `final-webgl`, `projector-legibility-webgl` (inclui Tab, Shift+Tab, Escape, Enter, foco restaurado, 30 GLBs e métricas de 1366/1920) e `spectator-camera-webgl`. Artefato de projeção `m10-projector-legibility` ID **13031811900**. QA estático [41173168776](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41173168776) e Browser QA geral [41173168805](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41173168805) também **SUCCESS**. Este fechamento documenta a execução comprovada; não é homologação visual humana.

**Próxima missão H.3:** verificar visualmente as capturas desktop/telão, revisar acessibilidade de leitores de tela e navegação quando a arena sofre reinicialização/alteração de foco. **G.2 físico não aprovado/não realizado; H.1/H.2 reais e main bloqueadas.** Nenhum ajuste de M5/M10, talentos, XP, usuários ou dados reais.


## H.3/M10 — acessibilidade de anúncios e foco após reinício (31/10/2026)

**Missão técnica desta rodada, ainda sob validação de CI:** auditar a experiência de leitor de tela no laboratório da M10 com 30 KayKits fictícios, mantendo os dez talentos, vinte pontos e a simulação inalterados. HEAD de partida: `35c60d71d561857d9f5ccf05563aef3a5948c7c4`. Foram relidos roadmap D–I, checkpoints E/F/G/H.0 e H.3, commits recentes e GitHub Actions; os jobs QA geral, Browser QA e KayKit do HEAD inicial estavam SUCCESS. O teste G.2 em computadores físicos **não foi realizado**.

**Incremento implementado:** `v5/arena-lab.html` cria uma região dedicada `#battleAnnouncement` com `role=status`, `aria-live=polite` e `aria-atomic=true` dentro do Coliseu. `v5/arena-lab.css` a mantém visualmente oculta, mas acessível. `v5/arena-lab.js` anuncia somente preparação/reinício, início, pausa, retomada, resultado e perda/restauração da GPU. O log detalhado de golpes e o status de planos de câmera passam a `aria-live=off` para evitar dezenas de anúncios automáticos por segundo; permanecem legíveis sob consulta. Não foi adicionada voz sintetizada nem modificada a lógica de combate.

**Regressão estendida:** `qa/v5-m10-spectator-browser.cjs` exige a região semântica, log silencioso, transições anunciadas, vencedor anunciado, reinício com foco preservado no botão Reiniciar e retorno à M5. O teste usa Chromium/SwiftShader com 30 modelos e uma partida fictícia completa; **não simula nem comprova o comportamento de leitores de tela reais**. Commits de código: `aa3c2abe`, `898b5336`, `28c65efb`; teste: `c3c04587`.

**CI:** workflow [M10 WebGL](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-m10-visual-qa.yml) disparado para os commits de código; os jobs do último SHA ainda precisam ser confirmados antes de considerar o incremento aprovado. O checkpoint registra entrega, **não sucesso presumido**.

**Próximo passo da MESMA M10:** verificar `spectator-camera-webgl`, `final-webgl`, `projector-legibility-webgl` e regressões no SHA final; corrigir falhas e, depois, validar com leitor de tela real (NVDA/VoiceOver) e inspecionar capturas com o usuário. G.2 nos PCs da escola e H.1/H.2 com estudantes reais continuam bloqueados. Nenhum merge, deploy, mudança de XP, turmas, notas, contas, 120 talentos, M5 ou `main`.

**Referências exatas desta rodada:** HEAD de checkpoint `8060c6251448b6f1f5a4f671d79ead57b16c988b`; última alteração funcional/teste `c3c04587e1fcb2bbb594e5f5bdc427a93aae5cfc`. Workflow [M10 WebGL run 41177787049](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41177787049) e [QA geral run 41177786994](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41177786994) estavam **QUEUED** na consulta de 31/10/2026 03:44 (America/Fortaleza); nenhuma aprovação do novo teste foi observada. Próxima execução deve verificar esse SHA antes de adicionar novos incrementos.


## H.3/M10 — isolamento semântico da arena imersiva (31/10/2026)

**Uma missão técnica nesta rodada:** após reler ROADMAP D–I, checkpoints E/F/G/H.0/H.3, HEAD `8605d0a5989faa120f96ae4b07a52b3875382966`, commits e Actions, os testes de anúncios de leitor de tela anteriores foram confirmados **SUCCESS** no [M10 41177787049](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41177787049), [QA geral 41177786994](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41177786994) e [Browser QA 41177787110](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41177787110). Não houve teste NVDA/VoiceOver real.

**Falha de acessibilidade detectada por inspeção:** o modo imersivo já tinha `role=dialog`, `aria-modal=true` e contenção de Tab, mas o restante da página permanecia na árvore de acessibilidade e potencialmente navegável por comandos virtuais do leitor de tela. A contenção de teclado não é suficiente para criar um diálogo modal acessível.

**Incremento:** commit `67c2006cd0a35b508b1271dc8e46f945b82722b3` altera apenas `v5/arena-lab.js`: aplica `inert` aos irmãos de cada ancestral do diálogo (cabeçalho, introdução, navegação, sidebar e rodapé) quando ampliado, restaurando somente elementos que o próprio diálogo alterou ao fechar; preserva estados `inert` preexistentes. Nenhum motor, talento, classe, M5/M10, câmera ou dados reais modificados. Commit `9abd598817cc47c2870617b38c0ce2cee3bba881` amplia `qa/v5-m10-legibility-browser.cjs` com verificações de isolamento de fundo, foco programático, restauração, Escape, Enter e reabertura na mesma partida WebGL de 30 KayKits.

**CI desta rodada:** [M10 WebGL 41181391178](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41181391178), [QA geral 41181391172](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41181391172) e [Browser QA 41181391154](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41181391154) disparados para SHA `9abd5988`. Na primeira consulta, `final-roster` estava SUCCESS, e os jobs WebGL permaneciam IN_PROGRESS. **Não declarar validação do novo incremento sem concluir o CI.**

**Próximo passo da MESMA missão M10:** conferir `projector-legibility-webgl` (novo gate `inert`) e demais jobs; corrigir regressões se necessário. Depois revisar árvore de acessibilidade real e teste NVDA/VoiceOver humano, com G.2 nos PCs físicos ainda NÃO realizado. H.1/H.2, XP, aprovações, usuários, notas, turmas, V3, main, merge e deploy continuam bloqueados.


### Fechamento H.3/M10 — modal imersivo acessível e captura WebGL estável (31/10/2026)

**CI concluído no SHA funcional `01c6fc3b59b0bffc3989be760d14db159f626293`:** [M10 WebGL 41181560447](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41181560447) **SUCCESS nos 4 jobs** (`final-roster`, `final-webgl`, `projector-legibility-webgl`, `spectator-camera-webgl`). [QA geral 41181560437](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41181560437) e [Browser QA 41181560438](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41181560438) também **SUCCESS**. O novo teste de modal confirmou fundo `inert`, bloqueio de foco programático no cabeçalho, restauração de navegação ao fechar, reabertura, Tab/Shift+Tab/Escape/Enter e arena 30 KayKits no Chromium.

**Falha intermediária corrigida, sem esconder o histórico:** [run M10 41181391178](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41181391178) teve 3/4 jobs aprovados; `spectator-camera-webgl` falhou em `page.screenshot` após timeout de 25s esperando captura de canvas WebGL animado. O log mostra a falha em `qa/v5-m10-spectator-browser.cjs:86`, **não** uma falha de câmera/KO ou de talentos. Commit `01c6fc3b` substituiu apenas a captura Playwright por `Page.captureScreenshot` via CDP, já usado pelo teste de legibilidade. A reexecução no novo SHA passou e produziu evidência. Não foi alterado o motor.

**Resultado limitado:** modal acessível em Chromium e QA WebGL verificados; **não** significa certificação de leitor de tela NVDA/VoiceOver, legibilidade humana ou G.2 em PCs físicos. A mesma Missão 10 continua aguardando essas homologações e revisão de balanceamento. H.1/H.2, V3, main, merge, deploy, XP, notas, turmas, contas e aprovações reais seguem intocados.


## H.3/M10 — auditoria de papéis acessíveis no Chromium (31/10/2026)

**Uma missão técnica, ainda em validação:** após reler ROADMAP D–I, E/F/G/H.0/H.3 e consultar commits/Actions da branch, foi confirmado que [M10 WebGL 41181560447](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41181560447), QA geral 41181560437 e Browser QA 41181560438 passaram no SHA funcional anterior `01c6fc3b`. HEAD inicial da rodada: `225ad4324e6f5b26f9966e000a24dfb542607095`.

**Incremento entregue:** commit `336cac17c4325a68618a42d8f818dffc238eb705` altera exclusivamente `qa/v5-m10-legibility-browser.cjs` para verificar a superfície acessível da M10 em Chromium (papel/nome do diálogo imersivo, botão de fechamento, exclusão da navegação e do link de fundo, status de pausa anunciado e restauração dos papéis ao fechar). Os resultados são registrados em `report.accessibility` no JSON do artefato existente. O teste anterior verificava `inert` no DOM e foco; este novo gate verifica também a descoberta por papéis acessíveis. **Não equivale a teste com NVDA/VoiceOver real.**

**CI novo:** [run M10 WebGL 41185584927](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41185584927) disparado pelo commit; na primeira consulta, `final-roster` estava SUCCESS e os três jobs WebGL ainda IN_PROGRESS. **Não declarar aprovação antes de conferir `projector-legibility-webgl` e demais jobs.** Se houver falha, corrigir nesta mesma missão.

**Próximo passo:** conferir o resultado e artefato JSON do CI; corrigir eventual falha na descoberta de papéis, depois continuar o teste de acessibilidade humana e a revisão do balanceamento M10. G.2 nos PCs físicos **não realizado**; H.1/H.2 reais, V3, main, merge, deploy, XP, notas, usuários, aprovações e turmas permanecem bloqueados. M5 5/10, M10 10/20, quatro classes KayKit e 120 talentos canônicos intocados.


**Falha observada e correção do método de teste:** o [run 41185584927](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41185584927) falhou em `projector-legibility-webgl`: `getByRole` do Playwright encontrou a navegação/link do fundo apesar de o DOM ter `inert=true`. Esse resultado **não prova** que o Chromium expôs tais nós na árvore de acessibilidade; o seletor de papéis do Playwright pode considerar elementos DOM inert. Commit `b6b5b5fb27299937d97b55d2ce9c9dd2bad1eeac` substitui a medição por `Accessibility.getFullAXTree` via CDP, filtrando nós `ignored`, para medir a árvore real do Chromium. Novo [run 41185714600](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41185714600) em fila na primeira consulta. **A auditoria ainda não está aprovada; aguardar resultado e corrigir se necessário.** Nenhum comportamento da aplicação foi modificado.


### Fechamento do gate de árvore acessível M10 (31/10/2026)

**CI comprovado no SHA funcional `b6b5b5fb27299937d97b55d2ce9c9dd2bad1eeac`:** [run 41185714600](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41185714600) **SUCCESS em 4/4 jobs** (`final-roster`, `final-webgl`, `spectator-camera-webgl`, `projector-legibility-webgl`). O teste de projeção validou a árvore de acessibilidade real do Chromium via CDP: diálogo e controle de fechar expostos; navegação e link de fundo excluídos enquanto imersivo; região de status de pausa exposta; navegação de fundo restaurada ao fechar. O teste roda com 30 KayKits fictícios e produz o JSON `m10-projector-legibility`.

**Limite:** a primeira tentativa com `getByRole` falhou no [run 41185584927](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41185584927) porque esse seletor considerou elementos `inert`; o teste foi corrigido para consultar a árvore de acessibilidade do Chromium. Não houve mudança na interface/motor nem evidência de falha real de NVDA/VoiceOver. **G.2 em PCs físicos e validação humana com leitores de tela ainda pendentes**; M5, M10, KayKit, 120 talentos e dados reais preservados. Próxima rodada: seguir revisão de balanceamento e homologação visual/acessível da M10 sem integração H.1/H.2, merge ou deploy.


## H.3/M10 — auditoria AA de contraste dos controles imersivos (31/10/2026)

**Missão única desta rodada:** acrescentar uma verificação automatizada de contraste textual no laboratório da M10 para desktop 1366×768 e telão 1920×1080, sem alterar regras, arte, XP, personagens, câmera, M5 ou dados de estudantes. Foram consultados ROADMAP D–I, checkpoints E/F/G/H.0/H.3, testes e commits anteriores. O gate anterior de árvore acessível foi aprovado no [run 41185714600](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41185714600).

**Incremento:** `qa/v5-m10-legibility-browser.cjs` mede, via `getComputedStyle` no Chromium, contraste WCAG AA mínimo de **4,5:1** entre texto e fundo sólido opaco dos botões habilitados e do status do diretor no modo imersivo; registra os valores por controle em `qa/v5-m10-legibility.json` nos dois tamanhos de tela. Exige ao menos cinco controles auditáveis e falha se qualquer um ficar abaixo de 4,5:1. Exclui deliberadamente gradientes, elementos desabilitados e texto translúcido sobre canvas WebGL animado: **não é certificação completa de contraste da arena nem validação humana**.

**Commits:** `2a9b078eb5e1e734156b1896b03f0db0b09f79d4` (teste) e `5b94724e9d70b7554c6ca6111df15de065eeb74d` (correção da expressão de parsing RGB). Um teste local isolado da fórmula, com três pares representativos de cores CSS, calculou razões 10,409; 11,150 e 10,978. **Isso não comprova o teste completo no Chromium.** O workflow [M10 WebGL run 41189393286](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41189393286), no SHA `5b94724e`, estava **QUEUED** na consulta; não declarar PASS antes do resultado dos quatro jobs. Run anterior `41189385389` do primeiro commit ainda IN_PROGRESS na consulta.

**Próximo passo da MESMA M10:** verificar o CI e o JSON dos dois viewports, corrigir eventuais falhas de contraste, inspecionar textos sobre canvas/gradientes com avaliação visual humana e prosseguir na revisão de balanceamento sem mudar stats canônicos. G.2 nos PCs físicos e NVDA/VoiceOver reais **não realizados**; H.1/H.2 com alunos, `main`, merge, deploy, XP, notas, aprovações, usuários e turmas seguem bloqueados.


### Fechamento da auditoria AA de contraste — CI confirmado (31/10/2026)

No SHA funcional `5b94724e9d70b7554c6ca6111df15de065eeb74d`, o [run M10 WebGL 41189393286](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41189393286) terminou **SUCCESS em 4/4 jobs**: `final-roster`, `final-webgl`, `spectator-camera-webgl` e `projector-legibility-webgl`. O gate de contraste AA para controles com fundo CSS sólido/opaco foi executado junto da auditoria da árvore acessível, teclado, arena de 30 KayKits e dimensões 1366×768/1920×1080. Artefato `m10-projector-legibility` ID **13037892917**, com JSON de razões por controle e capturas dos dois viewports. O resultado prova **apenas o escopo auditado**: não mede textos sobre gradientes/WebGL nem valida legibilidade humana, NVDA/VoiceOver ou GPU dos PCs da escola.

**Checkpoint de encerramento desta rodada:** commit funcional `5b94724e`, CI `41189393286` aprovado; o próximo incremento deve inspecionar contraste/oclusão dos textos sobre o palco animado e rever balanceamento da M10 sem mexer em valores oficiais. G.2 físico continua pendente; H.1/H.2, `main`, merge, deploy e dados reais seguem bloqueados.


## H.3/M10 — contraste de HUD sobre cenário WebGL animado (31/10/2026)

**Missão técnica em validação:** verificar contraste de textos informativos desenhados por HTML sobre o canvas WebGL na M10 experimental, sem modificar o motor ou o CSS. HEAD de partida `03aa43153daaa4d3a9e5bee6ba912ca8e07232e4`; consultados ROADMAP D–I, E/F/G/H.0/H.3 e CI anterior [41189393286](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41189393286), 4/4 jobs SUCCESS.

**Incremento real:** commit funcional `eb8e1dbf72725cda17967dc2bf570cb5d7873916` em `qa/v5-m10-legibility-browser.cjs`. Acrescenta **11 sondas** de texto sobre fundos semitransparentes do palco (destaque, legenda, telemetria de talentos e estilo de nickname), em **1366×768 e 1920×1080**, durante a mesma partida M10 de 30 KayKits com eventos reais de talentos. Usa estilos computados do Chromium e calcula a menor razão de contraste WCAG para fundos pretos, cinzas e brancos, incluindo extremos e interpolação de gradientes. Exige 4,5:1 e grava `hudSceneContrast` no JSON de evidência por viewport. **Não é leitura de pixels reais do canvas**, não cobre textos flutuantes sem painel, sombras, gradientes complexos, oclusão de nicks, nem certifica percepção humana. O estilo de nickname é auditado mesmo se a câmera não o mostrar naquele frame.

**Verificação já feita:** o arquivo atualizado foi relido na branch e passou na análise sintática do JavaScript no ambiente de execução. O workflow M10 [run 41193670814](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41193670814) disparou para o commit funcional: `final-roster` SUCCESS, os três jobs WebGL ainda IN_PROGRESS na consulta. **Não declarar contraste aprovado até `projector-legibility-webgl` e demais jobs concluírem.** Corrigir falhas na mesma M10.

**Próximo passo:** verificar o relatório JSON do CI, identificar qualquer sonda abaixo de 4,5:1 e corrigir o contraste apenas no laboratório se necessário; depois solicitar revisão visual humana das capturas e testar G.2 nos PCs físicos. M5 (5 talentos/10 pontos), M10 (10/20), 4 KayKits, 120 talentos, câmera, arquibancadas e balanceamento não foram alterados. G.2 NÃO realizado; H.1/H.2 com alunos reais, XP, notas, aprovações, usuários, turmas, `main`, merge e deploy continuam bloqueados.


### Fechamento do gate de contraste do HUD sobre WebGL — CI e artefatos verificados (31/10/2026)

**CI do commit funcional `eb8e1dbf72725cda17967dc2bf570cb5d7873916`:** [run 41193670814](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41193670814) **SUCCESS nos quatro jobs** (`final-roster`, `final-webgl`, `projector-legibility-webgl`, `spectator-camera-webgl`). A análise sintática do novo arquivo JS também passou. Artefato [m10-projector-legibility 13039383223](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41193670814/artifacts/13039383223) baixado e inspecionado: `v5-m10-legibility.json` contém **11 sondas em cada viewport (22 avaliações)**, todas acima de 4,5:1 nos fundos sintéticos preto/cinza/branco. **Menor razão amostrada: 5,833:1**, no detalhe do destaque, em ambos os viewports. Palco medido: **1346×573 px** (1366×768) e **1900×885 px** (1920×1080). Capturas Chromium/SwiftShader geradas nos dois tamanhos. O campo `physicalPCsValidated` do relatório permanece `false`.

**Escopo exato do PASS:** teste de estilos computados e amostragem conservadora dos fundos sob HUD semitransparente durante batalha M10 fictícia de 30 KayKits. Não valida contraste de cada pixel da cena, leitura humana em telão, colisão visual dos nomes, textos flutuantes sem painel, NVDA/VoiceOver ou G.2 nos computadores físicos. Não foi necessário alterar CSS, talentos, HP, câmera ou lógica. A Missão 10 continua **em homologação**, não concluída para uso real.

**Próxima rodada:** revisar oclusão e posicionamento de nicks/overlays sobre a arena animada e, depois, balanceamento M10 com builds mistas; sem alterar regras canônicas antes de evidência. G.2 e H.1/H.2 reais seguem bloqueados; não fazer merge, deploy ou modificar XP, usuários, turmas e notas.


## H.3/M10 — endurecimento do feed fictício de 30 participantes (31/10/2026)

**Missão única executada:** validar estados impossíveis nos quadros do feed H.2, exclusivamente em simulação da M10, com regressão M5. O trabalho começou após leitura de ROADMAP D–I, checkpoints E/F/G/H.0/H.3 e inspeção de testes e commits; nenhuma integração operacional H.1/H.2 foi iniciada.

**Arquivos e SHAs:** `v5/shared-arena-feed-h2-lab.js` (`b2905eb`) agora rejeita HP zero com `alive=true`, HP positivo com `alive=false`, quadro inicial marcado como `running`, mudança de classe/HP máximo entre quadros e ressurreição de personagem eliminado. `qa/v5-shared-arena-feed-h2.cjs` (`8140920`, corrigido em `853b46f`) injeta quadros falsos e garante que o cursor do receptor não avance após rejeição. `.github/workflows/v5-m10-h2-fullstream-qa.yml` (`ee517e02cb5cb82c34a007453e46157c9c3f69e8`) passa a reagir também às alterações do QA adversarial.

**Evidência CI:** [run 41211429486](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41211429486) **SUCCESS**, job `m10-fullstream-fictional` e suas quatro etapas: sintaxe, M10 com 30 participantes e três espectadores passivos, ataques adversariais M5/M10 e regressão do motor M10. A primeira execução intermediária [41211383681](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41211383681) falhou por expectativa antiga no QA (esperava `replay divergente`, mas o novo validador corretamente rejeitava o estado inicial); a expectativa foi corrigida e o CI completo passou. Sem ocultar essa falha histórica.

**Próximo passo:** revisar invariantes de vencedor/finalização e casos de snapshot malicioso com testes de replay, mantendo o feed como contrato fictício. Em paralelo ao planejamento, a homologação visual de nicks/overlays e balanceamento M10 permanece aberta. **G.2 nos PCs físicos não foi realizada; NVDA/VoiceOver humano e H.1/H.2 com alunos reais seguem bloqueados.** M5 5 talentos/10 pontos, M10 10/20, quatro KayKit, 120 talentos, câmera, arquibancadas, XP, notas, turmas, aprovações, V3, `main`, merge e deploy preservados.


## H.3/M10 — invariantes de encerramento e snapshots adversariais H.2 (31/10/2026)

**Missão única:** endurecer o contrato de recepção fictícia de quadros M10 sem autenticação, alunos, servidor ou alterações no combate. Branch exclusiva `feature/v5-arena-dos-criadores`; HEAD funcional `a291a7de00a3be7c5ab1a1b4d99736dc41605dfd`. Antes do incremento foram lidos ROADMAP D–I, checkpoints E/F/G/H.0/H.3, commits recentes e execuções GitHub Actions; nenhum merge ou deploy.

**Mudanças:**
- `v5/shared-arena-feed-h2-lab.js` — commit `0464947e895bb759699d5c96534f562352613fa4`: rejeita snapshot `ready` com eliminado, `running` sem sobrevivente e `finished` cujo vencedor não corresponde ao único sobrevivente ou está morto enquanto outros sobrevivem. Permite legitimamente final por limite de tempo com múltiplos vivos e empate por eliminação simultânea sem sobreviventes, conforme motor existente. Não tenta provar resultado criptograficamente: snapshots continuam **fictícios e não autenticados**.
- `qa/v5-shared-arena-feed-h2.cjs` — commit `a291a7de00a3be7c5ab1a1b4d99736dc41605dfd`: injeta cinco snapshots inválidos (incluindo encerramento forjado) em M5 e M10, confirma que cursor/estado não avançam e cobre final sem sobreviventes como caso admitido pelo contrato.

**CI no SHA funcional `a291a7de`:**
- [H2 Shared Feed run 41215781053](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41215781053): **SUCCESS**, incluindo sintaxe, testes adversariais M5/M10 e liberação docente fictícia.
- [M10 Fullstream run 41215780988](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41215780988): **SUCCESS**, 30 personagens fictícios, três receptores, reconexão/replay, motor M10 e regressão adversarial.
- QA geral e browser disparados no mesmo SHA: [41215780981](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41215780981) e [41215780985](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41215780985); **ainda IN_PROGRESS na consulta**, não marcar aprovados sem confirmar.

**Próximo passo na MESMA M10:** conferir os jobs gerais/browser, depois ampliar testes adversariais de reconexão e consistência de câmera/replay, revisar legibilidade de nicks e balanceamento com builds mistas. A validação G.2 nos PCs físicos **não foi realizada**; integração H.1/H.2 com alunos reais, autenticação, XP, aprovações, notas, usuários, turmas, V3, `main`, merge e deploy continuam bloqueados. Preservados M5 5 talentos/10 atributos, M10 10 talentos/20 atributos, quatro KayKit, 120 talentos, câmera e arquibancadas.


## H.3/M10 — revisão da câmera imutável no feed e reconexão (31/10/2026)

**Missão única nesta rodada:** impedir que um receptor fictício H.2 aceite troca silenciosa de plano cinematográfico com a mesma revisão, tanto em quadros consecutivos quanto após restaurar um snapshot de reconexão. O trabalho foi feito somente na branch `feature/v5-arena-dos-criadores`, sem tocar na `main`, integração real, XP, notas, usuários, turmas, aprovações ou deploy.

**Commits funcionais:**
- `27bf4f3677c99a77840ccf350f9b755ee2c4bee3` — `v5/shared-arena-feed-h2-lab.js`: revisão igual exige modo e IDs de câmera iguais; revisão maior permite um novo plano; revisão menor continua rejeitada. Sem alterar motor de combate ou diretor.
- `2c050b4d0f12dc6ab8579ad0caf6efc597e0c875` — `qa/v5-shared-arena-feed-h2.cjs`: ataques adversariais em M5 e M10 (mudança de modo/IDs sem revisão, snapshot adulterado, rollback de revisão), preservação do cursor e estado após rejeição, e aceitação de corte com revisão nova.

**CI no SHA funcional `2c050b4d`:**
- [H.2 feed e ataques M5/M10 — run 41220669054](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41220669054): **SUCCESS**.
- [M10 30 participantes e replay — run 41220668970](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41220668970): **SUCCESS**.
- [QA geral — run 41220668955](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41220668955): **SUCCESS**.
- [QA navegador — run 41220669041](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41220669041): **IN_PROGRESS** na consulta, não homologado neste checkpoint.

**Próximo passo da mesma M10:** confirmar o QA browser e, depois, reforçar invariantes de reconexão/ordenação temporal da câmera e revisar legibilidade visual de nicks e builds mistas. **G.2 em PCs físicos não foi executado**; H.1/H.2 operacionais com alunos reais seguem bloqueadas até hardware validado e autorização explícita. M5 5 talentos/10 pontos, M10 10 talentos/20 pontos, quatro KayKit, 120 talentos, balanceamento, arquibancadas e câmera original preservados.

**Fechamento do QA browser do incremento de câmera:** [run 41220669041](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41220669041) terminou **SUCCESS** no SHA funcional `2c050b4d0f12dc6ab8579ad0caf6efc597e0c875` (31/10/2026). Com isso, os quatro fluxos verificados no SHA funcional (H.2, M10 fullstream, QA geral e browser) terminaram aprovados. É validação de CI, **não** teste de FPS em hardware G.2, nem autorização para H operacional, `main` ou produção.


## H.3/M10 — invariantes de tempo lógico e ordenação do feed fictício (31/10/2026)

**Tarefa desta rodada:** impedir que espectadores aceitem pacotes com sequência maior, mas relógio lógico congelado, ou uma reordenação silenciosa dos lutadores durante o combate/reconexão. Trabalho restrito ao laboratório H.2/M10, com regressão M5; não é transporte autenticado nem integração com estudantes.

**Commits funcionais:** `4ff6be226d597a98e349505069f066cb4ca6506d` adiciona guardas no receptor passivo `v5/shared-arena-feed-h2-lab.js` (tempo estritamente crescente para seq maior, mantendo replays idempotentes no mesmo cursor; ordem dos IDs preservada em frames e snapshots). `be72c6cfe107b5cb9b651a289a7b3267d6ca70cb` adiciona ataques adversariais M5/M10 em `qa/v5-shared-arena-feed-h2.cjs`, conferindo que rejeições não alteram cursor/snapshot. `360d70d39ab75164f44f368552eccb492b7acf4e` preserva prioridade de rejeição de partida já encerrada, observada pela regressão fullstream.

**Falha e correção transparentes:** CI M10 [41225531862](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41225531862) e [41225544317](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41225544317) falharam porque o novo guarda temporal interceptou antes da mensagem canônica de partida terminada. Corrigida a ordem das validações no commit `360d70d`. No SHA funcional corrigido: [H.2 41225561171](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41225561171) **SUCCESS**; [M10 fullstream 41225561244](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41225561244) **SUCCESS**; [QA geral 41225561160](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41225561160) **SUCCESS**. [QA navegador 41225561282](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41225561282) ainda **IN_PROGRESS** na consulta; não marcar como aprovado antes de verificar. Os testes executam simulações fictícias, não validam transporte de rede, autenticação ou GPU física.

**Próxima tarefa da mesma M10:** confirmar browser CI, investigar oclusão de nicks/overlays na arena com 30 KayKits e builds mistas, e continuar diagnóstico de balanceamento sem modificar valores canônicos. **G.2 em PCs reais não foi executado**; H.1/H.2 reais, dados/XP, turmas, usuários, notas, aprovações, V3, `main`, merge e deploy seguem bloqueados. M5 (5 talentos/10 pontos), M10 (10 talentos/20 pontos), 120 talentos, quatro classes, câmera e arquibancadas preservados.

## H.3/M10 — entrega fora de ordem do feed fictício (31/10/2026)

**Missão em andamento:** robustez da recepção passiva do torneio M10, preservando a regressão M5. Problema identificado: `accept()` verificava relógio/câmera contra o estado atual **antes** de descartar um pacote antigo (`seq < cursor`), portanto uma entrega legítima fora de ordem era confundida com adulteração e lançava erro. Isso também podia ocorrer depois de uma vitória.

**Incremento:** commit `1a89eb13a7eb7d60a9f67ceb1635ba6a7f2eb378` em `v5/shared-arena-feed-h2-lab.js`: valida formato e escopo de todo pacote, ignora sem mutação pacotes válidos de sequência anterior e só compara invariantes temporais/câmera para sequências novas. Replays no mesmo cursor continuam exigindo igualdade exata; snapshots explícitos obsoletos continuam proibidos. Sem alterar simulação, classes, talentos, atributos, resultado, XP ou dados reais.

**Testes:** commit `256b3e7d57d58d129c130a7a8c08edf69d14c757` em `qa/v5-shared-arena-feed-h2.cjs` cobre M5 e M10: pacote antigo válido é ignorado; estado/cursor não recuam; pacotes antigos de outra sala ou malformados ainda são rejeitados. Commit `fa2d86773d349b332d97bb764b9b10b0c840dd17` amplia a regressão para pacote anterior chegando após a vitória, sem reviver eliminados ou mudar vencedor.

**Evidência CI parcial (SHA `256b3e7d5`, anterior à última asserção pós-vitória):** [H.2 41230680449](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41230680449), [M10 fullstream 41230680462](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41230680462) e [QA geral 41230680657](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41230680657) **SUCCESS**. Browser [41230680448](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41230680448) estava **IN_PROGRESS** na consulta. **Aguardar CI do SHA final `fa2d86773` e deste checkpoint antes de declarar o conjunto aprovado.**

**Próximo passo:** confirmar H.2/M10 e browser no SHA final, corrigir qualquer falha; depois investigar legibilidade de nicks/overlays com 30 KayKits e builds mistas, sem mudar a pedagogia nem o balanceamento canônico. **G.2 em PCs físicos continua NÃO EXECUTADO.** H.1/H.2 operacionais com alunos reais bloqueadas até G.2 e autorização explícita. Nenhum merge, deploy, `main`, V3, dados, XP, aprovações, turmas ou notas tocados.


**Atualização de CI após a última asserção pós-vitória (`fa2d86773`):** [H.2 41230706800](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41230706800) **SUCCESS**; [M10 fullstream 41230706799](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41230706799) **SUCCESS**; [QA geral 41230707002](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41230707002) **SUCCESS**. [Browser 41230706878](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41230706878) **IN_PROGRESS** na verificação. O commit de documentação `b6253d9395b5de66ecd934765b9ae8cde8cf0e11` é posterior ao código/testes; não confundir com SHA funcional. Não homologar navegador/G.2 antes de evidência.


## H.3/M10 — legibilidade de nicks e proteção dos HUDs (31/10/2026)

**Missão em andamento:** legibilidade visual da arena fictícia com 30 KayKits, sem modificar motor, classe, talento, atributos, balanceamento, câmera, XP ou progresso.

**Estado inicial verificado:** branch `4318b0478a7905f557b74458db221a97a20a3e28`; o QA navegador anterior, antes pendente, terminou com **SUCCESS** no [run 41230746254](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41230746254). Também passaram [QA geral 41230746185](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41230746185) e [browser no SHA funcional fa2d867 41230706878](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41230706878).

**Incremento técnico implementado:** `v5/nickname-layout.mjs` seleciona até 4/6/9 rótulos conforme largura, com envelopes de tamanho conservadores, prioridade ao personagem acompanhado e exclusão de regiões ocupadas por HUD, além de impedir colisões entre nicks. `v5/arena-three.js` projeta os nomes reais dos personagens e mede caixas do destaque, telemetria, legenda e rodapé a cada 15 quadros de renderização ou mudança de tamanho, evitando leitura de layout por personagem. `qa/v5-nickname-layout.cjs` testa 30 candidatos fictícios, HUD, mobile, prioridade e ausência de mutação. `qa/v5-m10-legibility-browser.cjs` verifica em WebGL que nicks exibidos não encobrem HUDs nem outros nomes no projetor 1920×1080 e desktop 1366×768. Workflow `.github/workflows/v5-m10-visual-qa.yml` inclui teste puro e teste de navegador.

**Commits desta tarefa:** `b39204966b1632948fbf286214e25ae318983118` (layout puro), `744fdfcf13877e115edce24a78b6093400f8fa42` (integração), `58553c44835e394283ba3ea0bbfca223887188cf` (teste puro), `3a1f95c794975b2f44507ba3bc69c0031eea11d1` (auditoria WebGL), `18059fbd9f2cfd4c43f28e0479a500a418d84d74` (workflow).

**CI aguardando conclusão no SHA `18059fbd9f`:** [M10 visual/WebGL 41235100049](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41235100049), [QA geral 41235100017](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41235100017), [Browser QA 41235100014](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41235100014). **Não declarar aprovado até os jobs concluírem**; investigar e corrigir qualquer falha, inclusive se houver nomes ocultos em enquadramento cinematográfico.

**Próximo passo:** verificar CI específico, registrar quantos nicks permanecem legíveis em cada viewport, revisar screenshots sem alegar homologação humana e manter a mesma Missão 10 até validação. **G.2 nos PCs físicos NÃO EXECUTADO**; H.1/H.2 reais e `main`/merge/deploy seguem bloqueados, sem alterar alunos, notas, turmas, aprovações ou XP.


### Fechamento do incremento de legibilidade M10 — 31/10/2026

**Falha detectada e corrigida:** o primeiro [CI visual 41235100049](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41235100049) **FALHOU** na auditoria de viewport: após reduzir 1920→1366, um rótulo ainda usava coordenadas projetadas para a largura antiga enquanto o SwiftShader não havia desenhado o novo quadro. O diagnóstico veio dos logs do job `projector-legibility-webgl`, não foi ignorado. Em `fdab43ea04a19b2ac34a22420177d3ae4ffabdde`, o `resize()` oculta imediatamente nicks com coordenadas antigas e invalida o cache de HUD. Em `4b9e0fdee0c45932caee8db72c0a80ab9fcbc247`, o teste espera explicitamente a nova projeção, identificada por `data-v5-nick-layout-width`, antes de medir caixas DOM. Nenhum ajuste foi feito em resultados, simulação ou progressão.

**Evidência do SHA funcional final `4b9e0fdee0c45932caee8db72c0a80ab9fcbc247`:**
- [M10 WebGL / legibilidade 41235389299](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41235389299): **SUCCESS**, quatro jobs (roster + layout puro, M10 visual real, espectador/câmera, legibilidade 30 KayKits).
- [QA geral 41235389184](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41235389184): **SUCCESS**.
- [QA navegador 41235389260](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41235389260): **SUCCESS**.
- Artefato [m10-projector-legibility](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41235389299/artifacts/13055356043) contém JSON e screenshots. Em partida M10 fictícia pausada, **5 nicks legíveis simultaneamente no projetor 1920×1080** (palco 1900×885) e **4 no desktop 1366×768** (palco 1346×573), com nenhum conflito de caixas entre nicks, HUD ou limites do palco nos dois tamanhos. Os demais personagens continuam no roster, e os eliminados permanecem nas arquibancadas. A contagem é a de rótulos visíveis em um enquadramento específico, não um compromisso de mostrar 30 nomes simultaneamente.
- Inspeção visual do screenshot desktop confirmou os rótulos sobre personagens, sem invadir os painéis de talentos/destaques. **Não confundir inspeção do artefato CI com homologação humana de telão ou teste de GPU física.**

**Estado:** incremento técnico de legibilidade M10 **concluído no laboratório automatizado**; a Missão 10 completa permanece **em validação**. **Próxima tarefa:** auditoria visual de builds mistas/efeitos em outros instantes da partida, sem reequilibrar classes com base em uma única seed; depois G.2 nos PCs físicos e homologação humana. **G.2 NÃO EXECUTADO**, H.1/H.2 operacionais com alunos reais continuam bloqueados até G.2 e autorização explícita. M5 (5 talentos/10 pontos), M10 (10 talentos/20 pontos), quatro KayKits, 120 talentos, câmera, arquibancadas, XP e as dez missões pedagógicas não foram alterados. Nenhum merge, deploy, `main`, V3, turma, usuário, aprovação ou nota tocados.

## H.3/M10 — auditoria temporal de efeitos em builds mistas (31/10/2026)

**Tarefa atual:** testar a prévia M10 opt-in com 30 KayKits fictícios, builds variadas das quatro classes, 10 talentos/20 pontos por personagem, sprites reais disparados por eventos de combate, câmera e nomes ao longo de três instantes da partida. Não alterar a M5, os 120 talentos, balanceamento, progressão, XP ou conteúdo pedagógico.

**Incremento de QA criado:** `qa/v5-m10-mixed-vfx-browser.cjs` (3 capturas WebGL durante combate com sprites habilitados; checagem de rótulos/HUD, classes e builds mistas, efeitos reais, vitória com 29 espectadores e retorno a M5) e `.github/workflows/v5-m10-mixed-vfx-qa.yml` (CI isolado, artefatos JSON/PNG). Commits `9118195f1bb791904b67def8d24d08a88f53976a`, `adf463a12cf92b4e57ba8aefe428daa494ba1dca`, `febbbdfbb145aa145739d067734de5c801a693ca`.

**CI inicial:** [M10 VFX temporal 41239727134](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41239727134) **EM EXECUÇÃO** na criação deste checkpoint; [QA geral 41239727031](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41239727031) **SUCCESS** no SHA `febbbdfb`; [QA navegador 41239727042](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41239727042) **EM EXECUÇÃO**. Não declarar auditoria visual aprovada antes do job específico e dos artefatos.

**Próximo passo:** conferir CI e relatório dos três instantes; corrigir qualquer falha observada, preservar a mesma missão até aprovação. O SwiftShader não valida FPS de PCs físicos nem legibilidade humana. **G.2 NÃO EXECUTADO; H.1/H.2 reais, `main`, merge e deploy continuam bloqueados.**

### Fechamento do incremento de efeitos M10 — CI comprovado (31/10/2026)

O primeiro [run 41239727134](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41239727134) **FALHOU** exclusivamente na etapa de regressão M5: o teste tentava clicar no seletor de missão atrás do modal imersivo, e o Chromium corretamente bloqueou o clique. O motor M10, as três capturas e a vitória já tinham sido executados; não se ignorou a falha. Corrigido em `dc5625092de6d1cd0d7dd0085d7a8dddc603cb13` fechando o modo imersivo via Escape antes de voltar à M5.

**Evidência verde no SHA funcional `dc5625092de6d1cd0d7dd0085d7a8dddc603cb13`:** [M10 VFX timeline 41240041100](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41240041100) **SUCCESS**: 30 GLBs reais KayKit, quatro classes, builds fictícias variadas com 10 talentos/20 pontos, três amostras de efeitos de talentos/sprites durante a partida, nicks sem colisões com HUD em cada amostra, 29 espectadores na vitória e retorno à M5 de 5 talentos. O job incluiu contratos H.0 e replay/roster. [Artefatos PNG/JSON 13056733817](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41240041100/artifacts/13056733817). [QA geral 41240040957](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41240040957) **SUCCESS**; [QA navegador 41240040933](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41240040933) **SUCCESS**.

**Conclusão restrita:** auditoria temporal automatizada de VFX com builds mistas **aprovada no Chromium SwiftShader**. Não é homologação humana dos efeitos, desempenho de hardware real nem comprovação de ativação visual dos 120 talentos em uma partida. **Próximo trabalho:** avaliar as capturas e padrões de efeitos raros/passivos em amostras direcionadas, sem mexer em balanceamento sem evidência; depois G.2 presencial. H.1/H.2 reais, `main`, merge, deploy, XP, notas e turmas continuam intocados/bloqueados.


## H.3/M10 — auditoria dirigida de passivos e reativos (31/10/2026)

**Tarefa:** cobrir eventos reais `talent`, `proc` e `charge` do motor final fictício com builds mistas de 10 talentos/20 pontos, preservando M5. Esta rodada **não** altera física, dano, talentos canônicos, progressão, câmera ou dados reais.

**Branch e base consultadas:** `feature/v5-arena-dos-criadores`, SHA inicial `0b27c8f3736250eff14854f3963b001aafe68e70`; roadmaps D–I, E/F/G/H.0, checkpoint H.3, últimos commits e GitHub Actions consultados antes do incremento.

**Arquivos:** `qa/v5-m10-passive-reactive-events.cjs` (novo teste determinístico e relatório JSON), `.github/workflows/v5-m10-passive-reactive-qa.yml` (novo CI). Commits `a029b028cc2c67a541c0431c1cfc6a90f0f2b079`, `55cb2fa51a19c58388a323c97bec09a279e42054` e correção `8a489b689ef9ef9782520e93bd3ad02e65ec266d`.

**CI específico:** [run 41244801958](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41244801958) **SUCCESS** no SHA `8a489b689`. Quatro seeds, 30 personagens fictícios, quatro classes, 10 talentos/20 pontos por personagem, M5 com resultado idêntico; testes dos 120 descritores VFX, sprites, coreografias e contrato H.0 também passaram. O relatório [m10-passive-reactive-events](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41244801958/artifacts/13058419478) registrou **55 ativos, 36 passivos e 24 reativos distintos selecionados**; foram observados **55 ativos, 34 passivos e 23 reativos distintos** em eventos de `talent`/`proc`, além de 761 eventos `talent`, 1.451 `proc` e 469 `charge` válidos classificados. As contagens são por talentos distintos ao longo de quatro seeds, **não** comprovam que todos os 120 tenham sido ativados nem que cada sprite seja legível no telão.

**Falha detectada:** o [primeiro run 41244764193](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41244764193) **FAILURE** identificou um `proc` D07 de Guerreiro atribuído ao **alvo enfraquecido** de outra classe. A auditoria foi corrigida para classificar explicitamente `D07/kind=weakened` como consumo de debuff, não como ativação de talento do alvo; **13 ocorrências** foram isoladas e registradas como anomalia. Isso é um problema de **atribuição da telemetria do motor**, não evidência de falha no cálculo de dano; o código do motor não foi alterado nesta rodada para preservar M5 e resultados. Não mascarar outros talentos inválidos: continuam causando falha do teste.

**Próximo passo na MESMA Missão 10:** tratar a atribuição de `D07` no fluxo de eventos sem alterar resultado de combate ou regressão M5, depois testar visualmente passivos/reativos pouco frequentes (incluindo os não observados) em Chromium/WebGL e builds direcionadas. Verificar QA geral e navegador do SHA final antes de declarar conjunto de regressões fechado. **G.2 em PCs físicos NÃO EXECUTADO; homologação humana, H.1/H.2 reais, `main`, merge e deploy bloqueados.** Nenhum aluno, XP, aprovação, nota ou turma alterado.


## H.3/M10 — correção isolada da telemetria D07 (31/10/2026)

**Tarefa:** corrigir a atribuição da consumação do enfraquecimento D07 na M10 fictícia, sem alterar dano, seleção de alvos, atributos, cooldowns, XP, alunos ou eventos da M5.

**Implementação:** `v5/phase2-combat.js` guarda somente em M10 a identidade do Guerreiro que aplicou D07. Quando o alvo consome o enfraquecimento no próximo golpe, o evento passa a ser `debuff` / `next-hit-weaken-consumed`, com `hero` do Guerreiro de origem e `target` do personagem afetado. Não se emite uma falsa ativação `proc` de D07 pelo alvo. A M5 continua no caminho legado. `qa/v5-m10-passive-reactive-events.cjs` verifica origem, alvo, talento selecionado, consumo real em quatro seeds e ausência da anomalia; continua cobrindo 10 talentos/20 pontos, contratos H.0 e regressão M5.

**Commits funcionais:** `f2fb8616b012bee857275bb39c9332dd7a829cdd` (motor) e `66a6f22dbe04ebb3fcff7b269918029098b491a1` (teste). **CI:** aguardando execução e verificação; não declarar aprovado antes de consultar GitHub Actions. **Próximo passo:** conferir o workflow `V5 H3 — M10 Passive and Reactive Event Audit`, QA geral e navegador; corrigir qualquer falha antes de avançar à inspeção WebGL de passivos/reativos raros. **G.2 em PCs físicos NÃO EXECUTADO.** H.1/H.2 com alunos reais, `main`, merge, deploy e dados reais permanecem bloqueados.


### Evidência de CI da correção D07 — 31/10/2026

**Aprovado:** [H.3 passive/reactive 41248883811](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41248883811), SHA do teste `66a6f22dbe04ebb3fcff7b269918029098b491a1`: quatro seeds fictícias, 30 personagens, **13 consumos D07 atribuídos ao Guerreiro de origem e ao alvo correto, zero anomalias**, 761 eventos `talent`, 1.451 `proc` válidos e 469 `charge`; M5 padrão e M5 explícita com resultado idêntico. [QA geral 41248883656](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41248883656) **SUCCESS**. [QA navegador 41248883676](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41248883676) **IN_PROGRESS** na consulta; não afirmar sucesso do navegador antes da conclusão. **Próximo passo:** confirmar browser e testar em WebGL os passivos/reativos menos frequentes. G.2 nos PCs físicos não realizado; nenhuma integração real autorizada.


## H.3/M10 — telemetria visual de passivos e reativos (31/10/2026)

**Missão em andamento:** distinguir cues de talento **realmente renderizados** de eventos apenas emitidos pelo motor, e separar os que foram descartados por orçamento gráfico, em Chromium/WebGL com 30 KayKits fictícios. Não altera regras de combate, 120 talentos, M5, M10, câmera, XP, turmas ou contas.

**Base consultada:** branch `feature/v5-arena-dos-criadores`, SHA inicial `348794de930c9ef028a299b49ee02ad6d516d47f`; roadmaps D–I, E/F/G/H.0, checkpoint H.3, commits e Actions recentes. O browser QA do checkpoint anterior terminou **SUCCESS** em [41248977582](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41248977582), assim como QA geral [41248977559](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41248977559).

**Alterações:** `v5/arena-three.js` (commit `edf5ab12e352dc3028edf146f89f2183577329c3`) instrumenta contadores de sprites/cues **renderizados** e **descartados** por tipo canônico `ativo/passivo/reativo`, reiniciados a cada combate, sem tocar no motor ou criar eventos falsos. `qa/v5-m10-mixed-vfx-browser.cjs` (commit `7a5bd6579982fa78d6fa5cdca0085c5cee063f26`) compara somas com o contador de efeitos, exige cues de passivos e reativos realmente renderizados até a vitória, registra as contagens e preserva as três capturas, os 29 espectadores e a regressão M5.

**CI:** [workflow de VFX temporal](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-m10-mixed-vfx-qa.yml) disparado; **não declarar sucesso até verificar execução no SHA final**. A primeira execução de `arena-three.js` foi [41253563449](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41253563449), ainda em andamento na consulta. Se o teste revelar ausência de passivos/reativos visíveis, corrigir instrumentação ou construir caso focal isolado antes de aprovar a missão.

**Próximo passo:** verificar CI e relatório com renderizados/descartados por tipo, corrigir falhas observadas, depois investigar casos raros não cobertos e balanceamento sem ajuste arbitrário. **G.2 PCs físicos NÃO EXECUTADO; H.1/H.2 reais, homologação humana, merge e deploy continuam bloqueados.**


### Verificação do incremento de cues passivos/reativos (31/10/2026)

**CI específico aprovado:** [run 41253574189](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41253574189), SHA funcional `7a5bd6579982fa78d6fa5cdca0085c5cee063f26`. O job instalou Chromium, executou a prévia WebGL M10 fictícia com 30 KayKits, três capturas temporais e verificou **cues realmente renderizados dos três tipos** (ativo, passivo e reativo), somas de renderização/descarte, 29 espectadores e retorno à M5. Artefato de capturas/JSON: [13062022377](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41253574189/artifacts/13062022377). A aprovação é dos asserts do teste, **não** prova legibilidade humana nem que os 120 talentos tenham aparecido.

**QA do checkpoint `44c9f6d9ce9fa257793f2da622b02fb08811a777`:** [geral 41253587440](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41253587440) **SUCCESS**; [navegador 41253587466](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41253587466) **SUCCESS**. A branch continua isolada; nenhum merge, deploy, dados reais, XP ou progressão alterados.

**Próxima tarefa da mesma M10:** examinar distribuição de cues descartados e focalizar talentos passivos/reativos raros que não surgem nas quatro seeds anteriores; depois retomar balanceamento e G.2 presencial. **G.2 não executado; H.1/H.2 reais e homologação humana bloqueadas.**


## H.3/M10 — cobertura focal de talentos raros (31/10/2026)

**Missão em andamento:** investigar quais talentos passivos/reativos foram selecionados mas não emitiram eventos reais nas quatro seeds sintéticas, sem confundir `charge` (prontidão) com `talent/proc` (ativação). A auditoria continua isolada e não altera estatísticas, câmera, XP, progressão, alunos ou M5.

**Incremento:** `qa/v5-m10-passive-reactive-events.cjs` (commit `9b61137cab74c93917593bdbb4c8a1cd53274d9e`) registra uma linha por cada um dos **120 IDs canônicos qualificados por classe**, contagens separadas de `talent`, `proc` e `charge`, totais por tipo, talentos selecionados sem disparo, ativações raras (até duas) e prontidões sem ativação. As somas são conferidas contra os eventos do motor; o relatório JSON anônimo já existente ganha `coverage`. A regressão M5 e a verificação D07 continuam obrigatórias.

**CI:** aguardando execução e confirmação do workflow [V5 H3 — M10 Passive and Reactive Event Audit](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-m10-passive-reactive-qa.yml) no SHA funcional. **Não marcar aprovado antes do resultado**. Os últimos CI anteriores no SHA `40d9dcd9754cd3676363937fbf646d086a00daf2` (QA geral [41253773117](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41253773117) e navegador [41253773074](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41253773074)) estavam verdes; não substituem o novo teste.

**Próximo passo:** verificar o CI e inspecionar a lista de passivos/reativos sem disparo; criar casos focais pareados para os menos cobertos antes de ajustar qualquer regra de combate. A cobertura de eventos não equivale à legibilidade WebGL. **G.2 nos PCs físicos não realizado; H.1/H.2 reais, merge, deploy e homologação humana permanecem bloqueados.**


### Resultado inicial do diagnóstico canônico (31/10/2026)

**CI específico aprovado no SHA `9b61137cab74c93917593bdbb4c8a1cd53274d9e`:** [run 41257936079](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41257936079); QA geral [41257936122](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41257936122) também verde. Quatro seeds fictícias, 30 participantes, 120 IDs canônicos: 55 ativos selecionados/55 observados; 36 passivos selecionados/34 observados; 24 reativos selecionados/23 observados. **Três talentos selecionados não dispararam** (dois passivos e um reativo), sendo um com apenas `charge`; isso é uma lacuna de amostragem, não prova defeito. Contagens reconciliadas: 761 `talent`, 1.451 `proc`, 469 `charge`, 13 consumos D07 corretos e zero anomalias; M5 idêntica.

**Refinamento:** commit `a510b423621efc2c8afcf0462303b053a9842479` passa a exibir no log os IDs canônicos dos três não disparados e os casos de prontidão sem ativação. [Workflow de cobertura](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-m10-passive-reactive-qa.yml) ainda precisa ser verificado nesse SHA. **Próxima rodada:** casos focais para os IDs identificados, sem modificar estatísticas sem diagnóstico. G.2 físico e homologação humana seguem pendentes; integração real proibida.


### Identificação dos três talentos sem disparo no conjunto sintético (31/10/2026)

**CI focal aprovado:** [run 41257967041](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41257967041), commit `a510b423621efc2c8afcf0462303b053a9842479`; QA geral do mesmo SHA [41257967003](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41257967003) **SUCCESS**. IDs canônicos selecionados sem evento `talent/proc` nas quatro seeds: **`guardian:J08` Inspiração da Lâmina (passivo)**, com quatro `charge` mas nenhum disparo; **`hunter:P09` Tiro de Interrupção (reativo)**; **`mage:A07` Foco Celeste (passivo)**. Todos os demais 112 talentos selecionados tiveram pelo menos um disparo; cinco ativos canônicos não foram selecionados pelo fixture e não devem ser chamados de cobertos. Contagens totais de eventos e regressão M5 seguem iguais às do primeiro CI.

**Diagnóstico, não bug confirmado:** falta de disparo pode ser condição não satisfeita, duração/seed ou efeito incorretamente instrumentado. **Próximo incremento técnico H.3/M10:** construir casos focais pareados para J08/P09/A07, com condições de ativação e observação explícitas, antes de alterar talentos. QA de navegador deste SHA estava em execução na última consulta; não declarar homologação gráfica ou G.2. Nenhuma integração real, merge ou deploy.


### H.3/M10 — caso focal A07 reproduzido (31/10/2026)

**Uma missão técnica desta rodada:** reproduzir o passivo `mage:A07` (Foco Celeste), que havia ficado sem disparo nas quatro seeds do fixture de 30. Foi criado o teste isolado `qa/v5-m10-a07-focused.cjs` (commit `ffae13cb565f3e369f96c0302bf246af6086a564`) e o workflow `.github/workflows/v5-m10-a07-focused-qa.yml` (commit `d6207f7fda5f380ee9700691375e3e1445408311`). Builds são fictícias, passam pelo contrato H.0 e contêm dez talentos/20 pontos, com M5 congelada apenas em memória. O teste aproxima a condição de A07 (quatro segundos sem receber dano e lançamento de magia), compara a ordem temporal `charge` → `proc`, executa quatro seeds e confere regressão M5 sem parâmetros experimentais.

**Evidência comprovada:** [CI focal 41261833708](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41261833708) **SUCCESS** no SHA `d6207f7f`. Em cada uma das quatro seeds ocorreu 1 `charge` aos 28,35 s e 1 `proc` aos 28,9 s, com origem no mago fictício. O teste do motor M10 (4/30 personagens), H.0 e regressão M5 passaram no mesmo job. [QA geral 41261833683](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41261833683) também **SUCCESS**; [QA navegador 41261833740](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41261833740) ainda estava em execução na consulta. Isto demonstra **ativação do A07 no motor sob condições focais**, não legibilidade gráfica ou cobertura universal.

**Próxima tarefa ainda na Missão 10:** reproduzir separadamente `hunter:P09` (exige conjuração telegráfica próxima) e `guardian:J08` (exige duas absorções de escudo e ataque especial posterior); só depois decidir se há defeito ou necessidade de balanceamento. G.2 nos PCs físicos não realizado; H.1/H.2 com alunos reais, XP, notas, turmas, `main`, merge e deploy seguem proibidos.


### H.3/M10 — caso focal P09 reproduzido com controle negativo (31/10/2026)

**Missão técnica desta rodada:** testar exclusivamente `hunter:P09` (Tiro de Interrupção), que não havia disparado na auditoria de quatro seeds/30 personagens. O teste `qa/v5-m10-p09-focused.cjs` cria um Caçador e um Arcanista fictícios com contrato H.0, 10 talentos e 20 pontos, M5 congelada somente em memória. O Arcanista usa `A10` (Supernova Silenciosa) como conjuração telegráfica a curta distância; o teste exige evento `prepare` anterior ao `proc` P09, origem e alvo corretos, um projétil `launch` por reação e cooldown de 21 segundos entre reações. Um controle pareado remove P09 da build, preserva posição e seed e exige ausência de `proc/launch/interrupt` P09. Quatro seeds verificam replay determinístico, encerramento, contrato e regressão M5.

**Commits:** `376370b6ee5b9f086ec2076178d93c8760a275bb` (teste) e `a42e7cf5c5d85e5ec885f93d6634167b5a11cf0a` (workflow `.github/workflows/v5-m10-p09-focused-qa.yml`). **CI focal SUCCESS** [run 41265863496](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41265863496); **QA geral SUCCESS** [run 41265863374](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41265863374). A aprovação do CI comprova que as asserções focais passaram; não demonstra legibilidade visual nem balanceamento estatístico. Nenhuma regra do motor foi alterada nesta rodada.

**Próxima tarefa na MESMA Missão 10:** reproduzir `guardian:J08` com duas absorções de escudo seguidas de dano especial, incluindo controle negativo e regressão M5; depois investigar balanceamento final. **G.2 nos PCs físicos ainda não realizado; H.1/H.2 reais, XP, usuários, notas, turmas, `main`, merge e deploy permanecem bloqueados.**


### H.3/M10 — caso focal J08 reproduzido com controle negativo (01/11/2026)

**Missão técnica desta rodada:** reproduzir exclusivamente `guardian:J08` (Inspiração da Lâmina), último dos três talentos não disparados no conjunto sintético anterior. O teste `qa/v5-m10-j08-focused.cjs` cria Guardião e Caçador fictícios, com adaptador H.0, 10 talentos e 20 pontos por build e snapshot M5 congelado apenas em memória. O Guardião seleciona J08, G01/G10 e golpes especiais; o Caçador pressiona o escudo. Para cada `charge` J08, o teste exige escudo real anterior, **dois eventos distintos de dano absorvido desde a criação do escudo**, incluindo o impacto que provoca a prontidão, e depois `proc` J08 seguido de um golpe especial real no adversário. A emissão do `charge` ocorre dentro de `applyHit`, antes da emissão do evento `hit` correspondente (sequência imediatamente seguinte); o teste considera essa ordem de telemetria sem inventar absorções. Verifica cooldown mínimo de 14s entre ativações, replay determinístico, controle negativo com J08 não selecionado e regressão M5 idêntica.

**Commits:** `64053ddd925ee7827cf5c5b67f4979ff101f28c8` (teste) e `cf3fc15a72b269c1c9aedbe3ededd4d56cc4a601` (workflow `.github/workflows/v5-m10-j08-focused-qa.yml`). **CI focal SUCCESS:** [run 41270295722](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41270295722), SHA `cf3fc15a`; **QA geral SUCCESS:** [run 41270295710](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41270295710). Quatro seeds fictícias: **7 prontidões e 6 ativações J08** ao todo, **0 eventos J08 nos quatro controles negativos**, escudos e absorções confirmados, replays determinísticos, motor M10 (4/30) e contrato H.0 aprovados. Relatório anônimo: `qa/v5-m10-j08-focused-report.json` gerado pelo CI. O QA de navegador do SHA funcional [41270295698](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41270295698) ainda estava em execução na consulta; **não declarar aprovação do navegador** antes da conclusão. Uma falha anterior do navegador no SHA `d786a4c` ([41265906915](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41265906915)) ocorreu em `qa/v3-e2e.cjs` (estado de aprovação fictícia `submitted` em vez de `approved`), fora do escopo de J08; verificar regressão do navegador sem alterar fluxos reais de aprovação.

**Conclusão limitada:** A07, P09 e J08 já possuem reproduções focais em motor Node com condições reais de ativação; isso não demonstra legibilidade visual de cada talento, equilíbrio estatístico das classes nem FPS em PCs físicos. **Próximo passo na MESMA M10:** retomar diagnóstico de balanceamento com sementes/builds/posições pareadas, verificando a vantagem do Guardião sem nerf arbitrário; acompanhar QA navegador e corrigir falhas atribuíveis à M10. **G.2 em PCs físicos NÃO EXECUTADO; homologação humana e H.1/H.2 com alunos reais permanecem bloqueadas.** Nenhuma alteração em motor, XP, alunos, notas, turmas, `main`, merge ou deploy.

## H.3/M10 — diagnóstico pareado do J08 em elencos 4/30 (01/11/2026)

**Missão técnica em andamento:** investigar se o passivo `guardian:J08` (Inspiração da Lâmina), cuja ativação focal já foi comprovada, altera resultados de confrontos fictícios de 4/30 personagens em diferentes composições. Não ajustar estatísticas oficiais antes de observar a matriz. Base de leitura: SHA `63daac15a44447558ce13142a2b98de05fbffb97`, roadmaps D–I e E/F/G/H.0, commits recentes e Actions; QA geral e navegador da base [41270327609](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41270327609) e [41270327606](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41270327606) terminaram **SUCCESS**.

**Incremento enviado (sem homologação até concluir CI):** `v5/phase2-combat.js` passa a permitir `J08` na lista estrita de `experimentalGuardianTalentAblation`, **somente M10 e somente laboratório**, desativado por padrão (commit `b04fd710f2ee25b0c76c4a69488f788002987695`). O teste `qa/v5-m10-j08-paired-balance.cjs` (commit `d51c3133491cd7cc5573f6f8719fba14b4379175`) compara o mesmo elenco, talentos, atributos, posições, seed e RNG crítico em cada par, alterando apenas a execução do efeito J08. Planejados **36 pares/72 partidas** em três composições (4 equilibrados, 30 equilibrados e 30 com metade Guardiões), dois arquétipos de build e três seeds com duas rotações. Mede prontidão/ativação J08, vitórias, absorção de escudo, dano e duração, além de regressão M5, contrato H.0 e replay. `experimentalGuardianTalentAblation` suprime o **talento inteiro** e não permite atribuir qualquer diferença exclusivamente ao bônus de dano ou concluir causalidade universal.

**Workflow:** `.github/workflows/v5-m10-j08-paired-balance-qa.yml` (commit `09242c5370bb7aa46f9a3f5f0bbb8b8cba9dc37f`), [run 41273727036](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41273727036) **EM EXECUÇÃO na abertura do checkpoint**. Não declarar 72 partidas aprovadas nem balanceamento homologado sem resultado verde e relatório. O novo teste exige invariância dos snapshots e do motor M5; não modifica build, HP, dano, cooldown, XP, alunos, notas, turmas, servidor, V3, `main` ou produção.

**Próximo passo:** verificar o job e seu relatório, corrigir falhas se houver, registrar resultados pareados e limites de inferência; só então escolher próximo diagnóstico de balanceamento. **G.2 PCs físicos NÃO EXECUTADO; H.1/H.2 com alunos reais, homologação humana, merge e deploy continuam bloqueados.**

### Resultado confirmado do experimento pareado J08 (01/11/2026)

**CI específico SUCCESS:** [run 41273727036](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41273727036), SHA funcional `09242c5370bb7aa46f9a3f5f0bbb8b8cba9dc37f`, job `j08-paired-balance` verde. Foram **72 partidas fictícias em 36 pares**, **18 verificações de replay/controle nulo**, **827 prontidões J08 e 785 ativações reais** na linha de base. Suprimir J08 modificou a **identidade vencedora em 9/36 pares**, mas as vitórias do Guardião no conjunto passaram de **28/36 com J08 para 29/36 sem J08**. O número agregado não é um efeito causal populacional: os pares reutilizam seeds, há builds e elencos selecionados e mudanças posteriores na dinâmica do combate. Na composição de 4 jogadores, nenhum dos 12 pares mudou de vencedor; com 30 equilibrados foram 2/12 e com 15 Guardiões foram 7/12. A ablação preservou snapshots iniciais, talentos selecionados e 20 pontos; nenhum evento J08 apareceu nos braços suprimidos.

**Regressões no mesmo job:** teste focal J08 com controle negativo, ablação individual anterior, motor M10 (4/30), contrato H.0 e M5 idêntica passaram. Relatório sintético arquivado como [artefato 13069429695](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41273727036/artifacts/13069429695). **QA geral do checkpoint `f1c807805b5d5e06254b4a61268a1038b7b4cd1b`: SUCCESS** [run 41273752079](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41273752079); **QA navegador ainda em execução** [run 41273752090](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41273752090) na consulta.

**Interpretação:** J08 é funcional e pode alterar vencedores individuais, porém esta amostra **não sustenta** que seja o principal causador da vantagem de vitórias do Guardião; não foi aplicado nerf. **Próximo diagnóstico H.3/M10:** investigar o peso de escudos G01/G10 em composições e builds mistas independentes, evitando reexecutar matrizes já documentadas; acompanhar QA navegador e corrigir regressões verificadas. **G.2 em PCs físicos não realizado; H.1/H.2 reais, homologação humana, XP, turmas, merge, `main` e deploy bloqueados.**

## H.3/M10 — sensibilidade pareada G01/G10 por quantidade de escudo (01/11/2026)

**Missão técnica em andamento:** distinguir o impacto das quantidades de escudo de `guardian:G01` e `guardian:G10`, sem desligar talentos inteiros nem modificar o balanceamento padrão. Esta rodada continua a Missão 10 e usa somente entradas fictícias com contrato H.0, dez talentos, vinte pontos, quatro classes KayKit e M5 congelada em memória.

**Implementação real:** `qa/v5-m10-g01-g10-paired-shield.cjs` no commit `4bbc3b0d9350aef0f657972e490929ef5cd5d671`, workflow `.github/workflows/v5-m10-g01-g10-paired-shield-qa.yml` no commit `4c4ae1e7c9bb035d19659f66a074c1b10ceb68cd`. O teste reutiliza a opção existente `experimentalGuardianShieldScale` (apenas M10, opt-in, desligada por padrão), sem editar `phase2-combat.js`. São **36 blocos pareados/144 partidas planejadas** em 4 equilibrados, 30 equilibrados e 30 com metade Guardiões, dois arquétipos e três seeds com duas rotações; braços baseline, G01 a 80%, G10 a 80% e ambos a 80%. Mede vitórias, absorção efetiva, casts reais, duração, replays determinísticos e invariância do estado inicial. Escala neutra (1,1) deve reproduzir baseline byte a byte. Regressões M5, H.0 e motor M10 são exigidas pelo workflow.

**CI desta rodada:** [run 41277888175](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41277888175), iniciado no SHA `4c4ae1e7c9bb035d19659f66a074c1b10ceb68cd`; **em execução na primeira consulta**. Não declarar que as 144 partidas passaram até verificar conclusão e logs. O QA navegador do checkpoint anterior foi consultado e está **SUCCESS** em [41273752090](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41273752090); o QA geral anterior também está **SUCCESS** em [41273752079](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41273752079).

**Limites e próximo passo:** ler relatório sintético do CI, corrigir eventuais falhas e comparar efeitos individuais G01/G10 e interação conjunta. O braço a 80% é diagnóstico, não proposta de nerf; não extrapolar para equilíbrio universal. **G.2 nos PCs físicos NÃO EXECUTADO. H.1/H.2 com alunos reais, XP, notas, turmas, merge, `main`, produção e homologação humana seguem bloqueados.**

### Resultado comprovado da sensibilidade G01/G10 (01/11/2026)

**CI específico SUCCESS:** [run 41277888175](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41277888175), SHA funcional `4c4ae1e7c9bb035d19659f66a074c1b10ceb68cd`, job `g01-g10-paired-shields` verde. **144 partidas em 36 blocos**, **24 replays determinísticos**, escala neutra byte a byte igual ao baseline, **1.331 casts reais G01 e 695 G10** nos baselines. Regressões M5, motor M10, H.0, teste de escala/validação de entrada e J08 focal passaram. [Relatório JSON sintético, artefato 13071648301](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41277888175/artifacts/13071648301).

| Braço | Vitórias Guardião (36) | Vencedor individual mudou vs baseline | Absorção do Guardião mudou |
|---|---:|---:|---:|
| Baseline | 29 | — | — |
| Apenas G01 a 80% | 24 | 14/36 | 36/36 |
| Apenas G10 a 80% | 26 | 11/36 | 34/36 |
| G01 e G10 a 80% | 25 | 16/36 | 36/36 |

**Interpretação limitada:** nesta matriz sintética G01 apresentou maior sensibilidade agregada de vitórias do que G10, mas o braço combinado não é aditivo e, em composições com 15 Guardiões, a classe continuou vencendo quase sempre. Mudanças de escudo também alteram alvos e sorteios posteriores; não concluir que 80% seja um ajuste correto nem aplicar nerf. A amostra usa seeds e arquétipos repetidos, sem inferência estatística universal. **QA estático do checkpoint `225ccdd51b55017a5071812c412a87137e8a86ba` consultado e SUCCESS; QA navegador do mesmo SHA ainda estava em execução** na última consulta. A CI específica já está verde.

**Próximo incremento na MESMA Missão 10:** ampliar composições e seeds independentes, testar uma grade de escala mais fina e analisar o equilíbrio por participação, não só contagem absoluta de vencedores. Nenhum balanceamento padrão foi modificado. **G.2 PCs físicos não executado; H.1/H.2 reais, homologação humana, XP, `main`, merge e produção bloqueados.**

## H.3/M10 — grade fina de escudos G01/G10, novas seeds e composições (01/11/2026)

**Missão técnica desta rodada:** ampliar o diagnóstico causal limitado da quantidade de escudo do Guardião sem alterar qualquer estatística, talento canônico, RNG padrão, IA, câmera, conteúdo das dez missões ou XP. Base consultada: `3fbdd5bae93026d2aa39dcb4c4f400b197fd6c96`, roadmaps D–I, checkpoints E/F/G, contrato H.0, commits e GitHub Actions recentes. O QA geral e navegador dessa base estavam **SUCCESS** ([QA geral 41277966806](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41277966806), [navegador 41277966778](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41277966778)).

**Entregas reais na branch exclusiva:** `qa/v5-m10-g01-g10-fine-grid.cjs` (commit `4ee3fe26a907e611fea43a521cb0d8712dc62f3f`) e `.github/workflows/v5-m10-g01-g10-fine-grid-qa.yml` (commit `4d1d9f3eb5fc222b7aca027033e0fe9b40c95884`). São **600 partidas fictícias, 100 blocos pareados, 60 replays determinísticos**, cinco seeds (três anteriores e duas adicionais), cinco composições (4 equilibrados; 30 equilibrados; 30 com 15 Guardiões; 30 com apenas 2 Guardiões; 30 com 15 Caçadores), dois arquétipos por composição. Os seis braços são baseline, G01 a 90%/80%, G10 a 90%/80% e ambos a 90%. A grade reutiliza a opção de escala exclusivamente M10, opt-in e desligada por padrão. O mesmo elenco, atributos, dez talentos, vinte pontos, posições e seed é preservado em cada bloco; escalas neutras reproduzem o baseline. **Nenhum arquivo do motor foi alterado nesta rodada.**

**CI específico SUCCESS:** [run 41281647584](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41281647584), SHA `4d1d9f3e`; verificações de sintaxe, matriz, regressões M5, motor M10, H.0 e replay passaram. [Relatório JSON anônimo — artefato 13073810641](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41281647584/artifacts/13073810641). O QA geral do commit funcional também foi **SUCCESS** ([run 41281634778](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41281634778)); QA navegador do mesmo commit [41281634641](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41281634641) ainda estava **EM EXECUÇÃO** na consulta e não deve ser declarado aprovado antecipadamente.

| Escala experimental | Vitórias Guardião em 100 | Vencedor individual diferente do baseline | Razão observado/esperado por participação |
|---|---:|---:|---:|
| Baseline | 77 | — | 3,164 |
| Apenas G01 a 90% | 73 | 27/100 | 3,000 |
| Apenas G01 a 80% | 67 | 37/100 | 2,753 |
| Apenas G10 a 90% | 73 | 19/100 | 3,000 |
| Apenas G10 a 80% | 71 | 26/100 | 2,918 |
| G01 e G10 a 90% | 70 | 33/100 | 2,877 |

**Evidências adicionais:** 2.745 ativações G01 e 1.434 G10 nos 100 baselines. A expectativa total proporcional à exposição das classes é de **24,33 vitórias do Guardião**; ocorreram 77. No cenário com **apenas 2 Guardiões entre 30**, a classe venceu **16 de 20** baselines (expectativa proporcional 1,33); em 30 com metade Guardiões, venceu 18 de 20. Esse contraste reforça o alerta de dominância do Guardião nas builds sintéticas, não uma estimativa de probabilidade para a população de alunos. O efeito agregado da redução de G01 foi maior que o de G10, mas não foi monotônico em todas as composições, e os braços combinados não demonstram aditividade. Seeds, arquétipos e rotações reutilizados criam dependência entre observações; o resultado não prova que a causa exclusiva seja escudo, nem recomenda um nerf de 10% ou 20%.

**Próxima missão H.3:** investigar por que o Guardião domina mesmo quando ocupa só 2 de 30 posições, comparando sobrevivência/HP inicial, tempestade, dano absorvido, posicionamento e eliminação em elencos pareados; preservar M5 e não alterar estatísticas oficiais antes de isolar a causa. **G.2 em PCs físicos NÃO EXECUTADO; H.1/H.2 com alunos reais, autenticação, XP, notas, turmas, homologação humana, `main`, merge e deploy continuam bloqueados.**


## H.3/M10 — sobrevivência e posicionamento do Guardião com 2/30 (01/11/2026)

**Incremento verificado da MESMA Missão 10.** Após consultar os roadmaps D–I, E/F/G, contrato H.0, checkpoint H.3, branch e GitHub Actions, foi criado o diagnóstico de sobrevivência sem alterar `phase2-combat.js`, o catálogo de 120 talentos, a câmera, a M5 ou qualquer dado real. Base anterior `a37e334bb218b402b89330cd49c378bd23796a07`.

**Arquivos e SHA:** `qa/v5-m10-guardian-scarce-survival.cjs` no commit `99f4a86201ba8d111fe0e391de643d5951250aa0`; workflow `.github/workflows/v5-m10-guardian-scarce-survival-qa.yml` no commit `b3cc499cf236cab970902be0c8f4dfba7a7faeab`. A CI específica [run 41285432409](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41285432409) **SUCCESS**, incluindo 48 batalhas fictícias, 24 pares, 8 replays determinísticos, contrato M10, regressões M5/H.0 e endgame. [QA geral 41285432453](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41285432453) **SUCCESS** no SHA funcional; [QA navegador 41285432414](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41285432414) ainda **em execução** na consulta, não aprovado antecipadamente.

**Experimento:** composição fixa de 10 Guerreiros, 10 Arcanistas, 8 Caçadores e **2 Guardiões**, seis seeds novas, duas rotações e dois arquétipos de talentos, todos com 10 talentos/20 pontos e contrato H.0. Cada par preserva IDs, builds, atributos, HP inicial, RNG inicial e posições de todos os outros heróis, mas **troca as posições iniciais dos dois Guardiões com dois Caçadores distantes**. Compara sobrevivência por personagem, tempo até contato, HP inicial, impacto de dano no HP, escudo absorvido, curas, tempo amostrado fora do anel, mortes atribuídas à tempestade e vitórias. O relatório anônimo JSON foi anexado ao run como artefato `v5-m10-guardian-scarce-survival`.

| Arquétipo (12 pares cada) | Vitórias Guardião original / troca | Vencedor individual mudou | Sobrevivência total dos Guardiões (s), original / troca | Escudo absorvido, original / troca | Mortes por tempestade, original / troca |
| --- | ---: | ---: | ---: | ---: | ---: |
| Defensivo | 4 / 4 | 11/12 | 935,75 / 952,95 | 3.595,82 / 3.860,24 | 0 / 2 |
| Misto | 4 / 4 | 9/12 | 1.131,60 / 1.072,05 | 3.987,28 / 4.148,32 | 2 / 0 |

**Leitura limitada:** a identidade do vencedor mudou em **20/24 pares** quando as posições iniciais foram trocadas, porém o total de vitórias do Guardião permaneceu **8/24 em cada braço**. Assim, o posicionamento importa para os confrontos individuais, mas nesta amostra não explica sozinho a taxa agregada de vitórias da classe. Os Guardiões começaram com o **mesmo HP inicial em ambos os braços** (5.112 HP somados por arquétipo/12 partidas). Houve quatro mortes por tempestade nos 48 confrontos, distribuídas entre braços; tempo amostrado fora do anel **não** mede dano exato da tempestade. Impactos de HP são eventos arredondados, não perdas capadas no golpe letal. Alterar posições pode alterar alvos, ordem de dano e consumo posterior de RNG; não há prova causal exclusiva nem justificativa para nerf.

**Próximo passo dentro da Missão 10:** separar vantagem defensiva de **dano recebido, curas e eliminação de rivais**, com análise por personagem/tempo e builds independentes, mantendo a instrumentação somente nos testes; confirmar QA navegador do SHA atual. **G.2 nos PCs físicos NÃO EXECUTADO**; H.1/H.2 com alunos reais, autorização, homologação humana, `main`, merge e produção continuam bloqueados.

## H.3/M10 — atribuição de dano, cura e eliminações com 2 Guardiões em 30 (01/11/2026)

**Missão técnica desta rodada:** continuar o diagnóstico da mesma Missão 10, sem alterar regras de combate, classes, 120 talentos, builds M5/M10, câmera, arquibancadas, XP ou conteúdo pedagógico. Base `a77829d8ea8e430626450f4b75ba70137842754b`, roadmaps D–I, E/F/G, contrato H.0, commits e Actions consultados; QA navegador da base anterior confirmado **SUCCESS** ([41285524870](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41285524870)).

**Arquivos reais na branch exclusiva:** `qa/v5-m10-guardian-scarce-offense-defense.cjs` (commit `f2c256eecd81e042f35795c196f9388cfc0a477c`, correção `893accf097518e0820fa5d517465fd92f029f63a`) e `.github/workflows/v5-m10-guardian-scarce-offense-defense-qa.yml` (commit `e11bf9f884d387c57401de900a446803a5b9a144`). A instrumentação agrega por classe eventos reais de acerto em HP, escudo absorvido/pressionado, curas e knockouts, com verificação de que o número de knockouts corresponde ao contador de kills do motor. Preserva os **24 pares/48 partidas fictícias**, seis seeds, dois arquétipos, 2 Guardiões entre 30, swaps de posição Guardião/Caçador, 8 replays determinísticos e contrato de 10 talentos/20 pontos. **Nenhum arquivo do motor foi alterado.**

**CI específico:** [41289625654](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41289625654) **SUCCESS** no SHA `893accf`; [QA geral 41289625653](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41289625653) **SUCCESS**; [QA navegador 41289625648](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41289625648) ainda **em execução na última consulta**. O primeiro CI específico [41289602619](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41289602619) falhou por variável de ambiente de saída inconsistente; corrigido e retestado no run verde. [Artefato JSON anônimo 13076338786](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41289625654/artifacts/13076338786).

**Resultados observados, somente braço baseline (24 partidas; 48 participações de Guardião, 240 Guerreiro, 240 Arcanista, 192 Caçador):**

| Classe | Acertos em HP (soma de eventos) | Absorção de escudo | Curas | Knockouts |
| --- | ---: | ---: | ---: | ---: |
| Guerreiro | 38.225,64 | 4.150,38 | 1.363,95 | 287 |
| Arcanista | 30.369,93 | 3.311,79 | 41,64 | 204 |
| Caçador | 20.491,31 | 215,81 | 18,34 | 129 |
| **Guardião** | **7.875,51** | **7.583,10** | **804,27** | **70** |

Por **participação**, Guardião absorveu aproximadamente **158** unidades de escudo, contra **17,3** do Guerreiro, **13,8** do Arcanista e **1,1** do Caçador. O Guardião causou cerca de **164** unidades de dano de acerto em HP e obteve **1,46 knockouts** por participação, comparado a ~**159** e **1,20** do Guerreiro. Isso sugere vantagem defensiva relevante **sem indicar incapacidade ofensiva**, mas não identifica uma causa exclusiva. As somas de eventos arredondados de acerto não são dano líquido capado no golpe letal, kills creditam o golpe final (não assistências), e as builds/posições/seeds são correlacionadas e sintéticas. Nenhum nerf autorizado ou aplicado.

**Próximo incremento da mesma Missão 10:** comparar distribuições de sobrevivência/tempo de KO e dano por janela temporal para distinguir acúmulo de escudo de vantagem em final de partida, e ampliar diversidade de builds antes de qualquer recomendação de balanceamento. **G.2 nos PCs físicos NÃO EXECUTADO**; homologação humana, H.1/H.2 reais, XP, alunos, notas, turmas, `main`, merge e produção permanecem bloqueados.

## H.3/M10 — janelas temporais, sobrevivência e eliminação (01/11/2026)

**Missão técnica desta rodada:** separar os efeitos de escudo/ataque/KO por fase da batalha (0–35s, 35–65s, 65s em diante) e comparar sobrevivência por classe no mesmo experimento sintético de **2 Guardiões entre 30**, sem alterar motor, regras, balanceamento, câmera, personagens, progressão, XP ou as dez missões. Revisados roadmaps D–I, checkpoints E/F/G, contrato H.0, branch e Actions anteriores. O QA navegador do checkpoint anterior `e129b404` foi confirmado **SUCCESS** ([41289685800](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41289685800)).

**Arquivos novos exclusivamente na branch:** `qa/v5-m10-guardian-temporal-survival.cjs` (commit `9290ff2215e32fc8b6b5c5c2b5e61df8fa1cdd17`) e `.github/workflows/v5-m10-guardian-temporal-survival-qa.yml` (commit `3e8c3229cfff00d32bc885688fd5310d337523c4`). A auditoria acompanha eventos reais `hit`, `heal`, `knockout` e `storm`, agrupa por janelas lógicas, calcula distribuições de sobrevivência, sobreviventes observáveis aos 35s/65s, quantis, e valida conservação de eventos/KO por classe. Reutiliza 24 pares, 48 partidas, 8 replays e regressão M5. Não houve alteração de código de produção ou do motor.

**CI específico SUCCESS:** [41293881948](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41293881948), no SHA `3e8c3229`. **QA geral SUCCESS:** [41293881988](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41293881988). **QA navegador:** [41293881868](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41293881868) ainda em execução na consulta; não afirmar aprovação. Artefato JSON anônimo disponível no run específico por 14 dias. Hash resumido das simulações: `335b69c0f00300aa930d`.

**Resultados apenas do braço baseline (24 partidas; participações: Guardião 48, Guerreiro 240, Arcanista 240, Caçador 192):**

| Classe | Sobreviveram aos 35s | Sobrevivência média | Escudo absorvido 0–35s | Escudo absorvido 35–65s |
|---|---:|---:|---:|---:|
| Guerreiro | 26/240 (10,8%) | 20,46s | 3.992,96 | 157,42 |
| Arcanista | 20/240 (8,3%) | 14,25s | 3.205,18 | 106,61 |
| Caçador | 16/192 (8,3%) | 13,85s | 202,16 | 13,65 |
| **Guardião** | **32/48 (66,7%)** | **43,07s** | **6.837,57** | **660,00** |

Os Guardiões absorveram **~90,2%** do escudo total do baseline nos primeiros 35s (6.837,57 de 7.583,10). Portanto, o mecanismo defensivo já apresenta forte contribuição **no início da luta**, antes do final, enquanto a classe mantém ofensiva relevante conforme o diagnóstico anterior. Não se conclui que G01/G10 sejam a única causa; a taxa de sobrevivência resulta de composições, builds, RNG e IA sintéticos. Vitórias do Guardião permaneceram 8/24 nos dois braços; 20/24 vencedores individuais mudaram com o swap de posições.

**Limitações:** as janelas medem tempo lógico, não FPS; somas de eventos de acerto não são dano efetivo capado; saídas por limite de tempo são censuradas; `storm` é telemetria de evento e não dano líquido; sementes/arquétipos são correlacionados. A M10 ainda não está homologada estatisticamente nem em PCs reais.

**Próximo incremento da MESMA Missão 10:** ampliar arquétipos e distribuições de atributos para testar se a sobrevivência precoce se mantém fora das builds repetidas; então avaliar intervenções de escudo apenas em laboratório e prévia visual M10. **G.2 nos PCs físicos NÃO EXECUTADO**; H.1/H.2 com alunos reais, Fase I, `main`, merge e produção continuam bloqueados.


## H.3/M10 — diversidade de talentos e atributos do Guardião (01/11/2026)

**Missão técnica:** verificar se a sobrevivência precoce do Guardião observada no diagnóstico temporal anterior persiste com escolhas distintas de talentos e distribuição dos dez pontos adicionais da M10. Foram consultados roadmaps D–I, E/F/G, contrato H.0, checkpoint H.3, commits e Actions recentes. Não foram alterados o motor, o balanceamento padrão, os 120 talentos, as dez missões pedagógicas, a M5, a câmera, XP ou dados reais.

**Entregas na branch exclusiva:** `qa/v5-m10-guardian-build-diversity.cjs` (SHA `291d59b824e99a4394f89097660a4c6751093d72`) e `.github/workflows/v5-m10-guardian-build-diversity-qa.yml` (SHA `7789609635710e02fe260ed3413fda67a4619ef0`). Matriz sintética de **72 partidas com 30 personagens, sendo dois Guardiões**, em 3 arquétipos de talentos (defensivo, misto e ofensivo), 3 extensões legais de atributos M5→M10 (equilibrada, VIT/DEF e ofensiva), 4 seeds e 2 rotações. Foram verificadas **108 builds distintas**, todas com 10 talentos, 20 pontos e snapshot M5 preservado; 9 replays determinísticos. O arquétipo ofensivo não possui G01/G10 por construção; as outras escolhas variam, não representam alunos reais.

**CI específico SUCCESS:** [run 41298544579](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41298544579), job `guardian-build-diversity` concluído com sucesso, inclusive sintaxe, 72 batalhas, replays, motor M10, contrato H.0 e regressão M5. Hash sintético `fc4744ff66e9681a1657`. Relatório JSON anônimo anexado ao workflow (14 dias). A execução **não equivale à homologação visual/PC real**. QA geral e QA navegador deste SHA não foram confirmados nesta consulta.

| Arquétipo | Vitórias Guardião (24 partidas) | Guardiões vivos aos 35s / observados | Absorção de escudo dos Guardiões |
| --- | ---: | ---: | ---: |
| Defensivo | 9/24 | 28/48 (58,3%) | 6.748,92 |
| Misto | 9/24 | 28/46 (60,9%) | 6.635,65 |
| Ofensivo, sem G01/G10 | 2/24 | 9/44 (20,5%) | 0 |

No perfil misto com +5 VIT/+5 DEF, **14/16** Guardiões estavam vivos aos 35s e a classe venceu **5/8** partidas. No arquétipo ofensivo com essa mesma extensão, **2/16** estavam vivos aos 35s e a classe venceu **0/8**. Ao todo, o Guardião venceu **20/72**, contra 4,8 vitórias proporcionais à participação de dois em trinta, **mas essa expectativa não controla builds, IA ou interações**. A ausência de escudo no arquétipo ofensivo está confundida com a troca de todos os talentos; não é ablação isolada de G01/G10. Há partidas que terminaram antes de 35s, portanto denominadores de sobrevivência são somente observados. Não aplicar nerf nem declarar equilíbrio.

**Próximo incremento da MESMA Missão 10:** comparar builds pareadas mantendo os cinco talentos da M5, atributos e composição constantes, variando somente escolhas adicionais M10 ou ablações de escudo já opt-in; depois testar prévia visual M10 3D, câmera e arquibancadas no Chromium. **G.2 em PCs físicos NÃO EXECUTADO. H.1/H.2 com alunos reais, homologação humana, Fase I, `main`, merge e produção permanecem bloqueados.**


## H.3/M10 — comparação pareada com M5 congelada e somente talentos adicionais M10 variáveis (01/11/2026)

**Escopo de uma missão técnica:** testar a influência das cinco escolhas adicionais da M10 mantendo, em cada bloco, exatamente os mesmos cinco talentos M5, atributos finais (20 pontos), quatro classes, composição, posições iniciais, seed e fluxo de críticos por identidade. Roadmaps D–I, E/F/G, contrato H.0, checkpoint H.3, branch e Actions consultados antes da mudança. Não foram modificados motor, regras canônicas, XP, dez missões, câmera, arquibancadas, dados reais ou `main`.

**Arquivos/SHAs da branch exclusiva:** `qa/v5-m10-guardian-m5-fixed-extras-paired.cjs` — commit `a01753ce8cb12813f93c97e71bf9a7f059fb56b2`; `.github/workflows/v5-m10-guardian-m5-fixed-extras-qa.yml` — commit `ab4695c1c28796bd77392c7817cc4bae02a5008c`. Teste de 2 composições (4 equilibrados; 30 com 2 Guardiões), 2 extensões legais de atributos (equilibrada ou +5 VIT/+5 DEF), 4 seeds, 2 rotações e 3 braços. Cada braço conserva G01–G05 congelados na M5 e troca **somente as cinco escolhas adicionais M10**: bastion=G06–G10; support=L01–L05; verdict=J01–J05. Todas as outras classes e seus talentos permanecem idênticos dentro do bloco.

**CI específico SUCCESS:** [run 41302904651](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41302904651), job `guardian-fixed-m5-extras` finalizado com conclusão `success`, todas as etapas verdes. Logs comprovaram **96 partidas fictícias**, **32 blocos**, **64 comparações pareadas**, **6 replays exatos**, invariância de HP/stats/spawn inicial, 10 talentos/20 pontos, regressão M5, motor M10, contrato H.0 e replay E.7 aprovados. Hash sintético `28c1f0a4b0cd9602017d`. Relatório JSON anônimo anexado por 14 dias. QA geral do commit `ab4695c` apareceu concluído com sucesso no painel Actions; QA navegador ainda estava em execução na primeira consulta e deve ser verificado separadamente.

| Composição / 16 partidas por braço | Bastion G06–G10 | Support L01–L05 | Verdict J01–J05 |
| --- | ---: | ---: | ---: |
| 4 equilibrados — vitórias do Guardião | 9 | 9 | 6 |
| 30, dois Guardiões — vitórias do Guardião | 4 | 3 | 1 |
| 30, dois Guardiões — vivos aos 35s (32 exposições) | 25 | 23 | 16 |
| 30, dois Guardiões — escudo absorvido | 5.567,69 | 3.983,82 | 2.829,83 |

**Interpretação limitada:** as cinco escolhas adicionais alteraram sobrevivência e resultados em partidas pareadas, sem trocar atributos ou escolhas M5. Entretanto, a intervenção troca **cinco talentos simultaneamente**; não é estimativa causal de G10 isolado, nem justificativa suficiente para nerf. No cenário de 30, 9/16 vencedores individuais mudaram no braço support e 12/16 no verdict em relação ao bastion. Os agregados de escudo vêm de eventos e não são perda efetiva de HP capada. Não há extrapolação estatística para turmas reais.

**Próximo incremento da mesma Missão 10:** executar comparação focal de **um único talento M10 adicional** (por exemplo, substituir apenas G10 por J08, preservando os outros quatro adicionais, atributos e M5) e medir cooldown/escudo/vitórias com as mesmas seeds; depois ampliar QA 3D de câmera/arquibancadas. **G.2 nos PCs físicos NÃO EXECUTADO; H.1/H.2 reais, homologação humana, Fase I, merge e produção permanecem bloqueados.**

## H.3/M10 — ablação pareada de uma escolha G10 vs J08 (01/11/2026)

**Missão técnica executada na branch experimental:** comparar **somente a décima escolha do Guardião**, mantendo M5 congelada (G01–G05), quatro talentos adicionais M10 (G06–G09), 20 pontos de atributos, IDs fictícios, composição, posições, seeds e RNG crítico por identidade iguais entre braços. G10 é ativo (Bastião Solar); J08 é passivo (Inspiração da Lâmina). Nenhuma regra de combate, talentos canônicos, progressão real, XP, câmera, arquibancada, V3, `main` ou produção foi alterada.

**Arquivos e commits:** `qa/v5-m10-guardian-g10-vs-j08-paired.cjs` em `8b0667e3a1b28bfcab5ea0510bf9b78855ba01fa`; `.github/workflows/v5-m10-guardian-g10-vs-j08-qa.yml` em `e1d1b777353e07c4cdbc1384376a236e94583f8f`.

**CI específico SUCCESS:** [41307864574](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41307864574), job `guardian-single-talent` aprovado: 64 partidas fictícias, 32 blocos/pares, 4 replays exatos, preservação M5, contratos H.0, motor M10 e regressão E.7. Hash determinístico do relatório: `cab78be9c8d1498e8b4c`. **QA geral SUCCESS:** [41307864641](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41307864641). **QA navegador:** [41307864672](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41307864672) ainda `in_progress` na última consulta; não declarar aprovado antes da conclusão.

| Cenário (16 pares por cenário) | G10 ativo | J08 passivo |
| --- | ---: | ---: |
| 4 participantes, vitórias Guardião | 9/16 | 4/16 |
| 4 participantes, escudo absorvido Guardião | 2.807,51 | 1.578,34 |
| 30 participantes (2 Guardiões), vitórias Guardião | 4/16 | 2/16 |
| 30 participantes, Guardiões vivos aos 35s | 25/32 | 17/32 |
| 30 participantes, escudo absorvido Guardião | 5.567,69 | 3.224,13 |
| 30 participantes, eliminações por Guardiões | 34 | 23 |

**Interpretação:** com G10 o Guardião sobreviveu e absorveu mais escudo neste conjunto controlado; em 30 personagens, trocar apenas G10 por J08 mudou a identidade do vencedor em 7/16 pares, mas a classe vencedora Guardião caiu somente de 4 para 2. **Não concluir causalidade de um coeficiente isolado nem aplicar nerf**: um ativo e um passivo alteram também decisões, cooldown e consumo posterior de RNG. Valores de eventos de escudo não equivalem a HP efetivamente perdido; seeds e builds são sintéticas e limitadas.

**Próxima etapa da mesma Missão 10:** ampliar seeds e trocar G10 por outros talentos ativos da mesma família, ou executar ablação do efeito de escudo de G10 com o talento ainda equipado, mantendo comportamento comparável. Depois confirmar a prévia 3D M10 com câmera e arquibancadas. **G.2 nos PCs físicos NÃO EXECUTADO. H.1/H.2 reais, homologação humana, Fase I, merge, `main` e produção permanecem bloqueados.**
