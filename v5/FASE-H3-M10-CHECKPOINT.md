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
