# PIT Game Jam IA V5 — Fase 2: os 30 talentos do Guerreiro

**Status: planejamento de design; NÃO implementado no jogo.** Documentação na branch feature/v5-arena-dos-criadores; a main permanece intocada. Talentos, animações e efeitos abaixo são requisitos de implementação, não recursos prontos.

## Contrato aprovado para progressão
- 10 missões aprovadas x 100 XP = 1.000 XP pedagógicos; a cada missão: **2 pontos de atributo** e **1 talento selecionado dentre 30 opções**. Total: **20 pontos investidos + 10 talentos distintos**. Pontos não usados podem ser guardados, sem perda.
- **Redistribuição livre** de atributos e talentos até a PRIMEIRA entrada na **arena competitiva**. Testes de animação, treinos contra bots e prévias não bloqueiam. Ao ingressar: confirmar em modal, persistir bloqueio no servidor, nunca apenas no navegador. Acesso competitivo preferencialmente após as dez missões aprovadas.
- Atributos propostos: **Força (FOR)**, **Destreza (DES)**, **Inteligência (INT)**, **Vitalidade (VIT)**, **Defesa (DEF)**. São pontos investidos além dos valores-base de cada classe. Limite de 12 investidos em um atributo, obrigando escolhas secundárias.
- 30 talentos do Guerreiro em 3 caminhos de 10: Brutalidade, Duelista e Bastião. Caminhos não são subclasses obrigatórias. **Sem pré-requisitos rígidos**, para permitir híbridos e não tornar uma escolha de missão inútil.
- Há 15 ativos, 9 passivos e 6 reativos; os dez selecionados entram na lógica de combate. Ativos são acionados automaticamente segundo prioridade de contexto, com trava global de 0,7 s entre lançamentos; passivos e reativos disparam ao cumprir condição.

## Escalonamento e equilíbrio — hipótese a validar em simulações
Eficácia de talento genérico: **clamp(0,75 + 0,025 × pontos no atributo primário + 0,0125 × pontos no secundário; 0,75; 1,20)**.
Valores abaixo são valores-base ANTES da eficácia. Exemplos: 0 FOR + 0 DES = 75% da força original; 10 FOR + 6 DES = 107,5% da força original; 12 FOR + 8 DES = 115%. O aluno visualiza a projeção antes de confirmar a build.
Cooldowns, durações e condições de disparo não escalam. Os escudos T01 e T10 já usam a fórmula de atributos explícita; não aplicar novamente multiplicador genérico (evita escalonamento duplo). Valores são de protótipo, não certificações de equilíbrio.

### Árvore I — Brutalidade (B01–B10)
| ID | Talento / tipo | Atributos (principal / secundário) | Efeito-base e recarga | Animação individual planejada |
|---|---|---|---|---|
| B01 | **Golpe do Carrasco** / ativo | FOR / DES | Golpe de 155% do ataque; CD 8 s | Ergue o machado com as duas mãos, golpe vertical, brasas no impacto. |
| B02 | **Sangue Quente** / passivo | FOR / VIT | Após 2 golpes acertados, próximo ataque básico +12%; trava 10 s | Veias vermelhas acendem no cabo do machado e descarregam no terceiro golpe. |
| B03 | **Fenda Sísmica** / ativo | FOR / DEF | 120% do ataque em cone de 3 m + lentidão de 20% por 1,2 s; CD 14 s | Machado rompe o chão, fenda abre em leque com poeira e lascas. |
| B04 | **Ímpeto Predador** / passivo | DES / FOR | Após se deslocar rumo ao alvo por 2 s, próximo golpe +16%; trava 12 s | Rastro rubro nos pés e projeção do corpo para frente. |
| B05 | **Rugido da Ruína** / ativo | VIT / FOR | 75% do ataque em raio 2,5 m e -10% dano do alvo por 3 s; CD 18 s | Grito com onda circular de runas vermelhas. |
| B06 | **Sede de Batalha** / reativo | VIT / FOR | Cura 6% do dano efetivamente causado; teto 4% da vida máxima a cada 5 s | Filamentos carmesins conectam inimigo e peito ao curar. |
| B07 | **Golpe de Exaustão** / ativo | FOR / DES | 115% do ataque e posterga em 1 s próxima habilidade ofensiva inimiga; CD 12 s; não acumula | Corte diagonal com faísca na arma inimiga e recuo de ombro. |
| B08 | **Ira Contida** / passivo | VIT / INT | Ao cair abaixo de 45% da vida pela primeira vez, +10% dano por 6 s; uma vez por duelo | Armadura pulsa como brasa, com fumaça quente nos ombros. |
| B09 | **Ruptura Brutal** / ativo | FOR / DEF | 140% ataque; +75% de dano adicional apenas contra escudos, não contra vida; CD 20 s | Corte horizontal com estilhaços luminosos de barreira. |
| B10 | **Última Investida** / reativo | FOR / VIT | Uma vez por duelo, ao cair abaixo de 25% da vida, avança até 3 m e causa 120% ataque; nunca ressuscita | Salto curto cinematográfico, arco rubro e aterrissagem com tremor. |

### Árvore II — Duelista (D01–D10)
| ID | Talento / tipo | Atributos (principal / secundário) | Efeito-base e recarga | Animação individual planejada |
|---|---|---|---|---|
| D01 | **Corte Relâmpago** / ativo | DES / FOR | 2 golpes de 48% cada, total 96%; CD 6 s | Dois cortes em X com dois rastros prateados independentes. |
| D02 | **Passo Lateral** / reativo | DES / DEF | Reduz 30% de um ataque direcionado e desloca 1 m ao lado; trava 14 s | Esquiva lateral com silhueta residual azul. |
| D03 | **Lâmina Reversa** / ativo | DES / INT | Golpe 75%; se atingido nos 2 s seguintes, devolve 65% uma vez; CD 9 s | Guarda invertida, giro do punho e resposta ascendente. |
| D04 | **Cadência da Guerra** / passivo | DES / FOR | Após 3 impactos próprios, próximo ataque básico 15% mais rápido; trava 8 s | Três fagulhas no gume marcando ritmo, seguidas de aceleração. |
| D05 | **Ponta Precisa** / ativo | DES / FOR | 125% ataque ignorando 12% da mitigação defensiva; CD 12 s | Estocada reta com foco branco na ponta do aço. |
| D06 | **Reflexo Treinado** / passivo | DES / DEF | Após bloquear ou reduzir golpe, -8% de dano recebido por 3 s; trava 11 s | Braçadeiras emitem círculos azuis sobrepostos. |
| D07 | **Finta do Escorpião** / ativo | DES / INT | 85% ataque; enfraquece em 12% próximo ataque inimigo em 3 s; CD 16 s | Falsa estocada, mudança de base e corte na direção oposta. |
| D08 | **Jogo de Pés** / passivo | DES / VIT | Acima de 60% da vida, +8% velocidade de movimento; não acelera ataques | Passadas circulares e pegadas azuis no solo. |
| D09 | **Contra-Medida** / reativo | DES / DEF | Ao sofrer golpe pesado (130%+ do ataque básico inimigo), resposta de 70% em alcance; trava 15 s | Parada curta, faísca em meia-lua e contracorte direto. |
| D10 | **Dança das Lâminas** / ativo | DES / FOR | 3 golpes de 55% cada, total 165%; sequência interrompível ao sair do alcance; CD 23 s | Três giros com trilhas concêntricas, cada impacto sincronizado. |

### Árvore III — Bastião (T01–T10)
| ID | Talento / tipo | Atributos (principal / secundário) | Efeito-base e recarga | Animação individual planejada |
|---|---|---|---|---|
| T01 | **Guarda Alta** / ativo | DEF / VIT | Escudo absorve 20 + 1,5 por DEF + 0,6 por VIT, dura até 4 s; CD 12 s | Machado se cruza em guarda e forma placa de luz âmbar. |
| T02 | **Pele de Ferro** / passivo | DEF / VIT | Após 5 s sem sofrer dano, próximo impacto é reduzido 18%; reinicia ao sofrer dano | Metal escurece e emite lampejo frio no bloqueio. |
| T03 | **Rebote de Aço** / reativo | DEF / FOR | Quando escudo de talento absorve dano, devolve 45% do ataque se em alcance; CD 14 s | Fragmentos dourados projetados do escudo ao agressor. |
| T04 | **Postura de Muralha** / ativo | DEF / VIT | +15% mitigação por 5 s, mas -10% movimento; CD 18 s | Pés fincados, joelho flexionado e placas pétreas giratórias. |
| T05 | **Brado Protetor** / ativo | VIT / INT | 75% ataque em raio 2 m, -10% dano do alvo por 3 s; CD 20 s | Batida da mão no peito e onda luminosa dourada. |
| T06 | **Vontade Inabalável** / reativo | VIT / DEF | Ao sofrer lentidão, reduz duração em 60% e ganha escudo de 6 por 2 s; CD 15 s | Quebra correntes luminosas, pulsação verde-dourada. |
| T07 | **Arma Blindada** / passivo | DEF / FOR | A cada 3 ataques básicos completados, ganha escudo de 6 por 3 s; trava 10 s; máximo 1 deste tipo | Três runas se acendem no punho do machado. |
| T08 | **Retaliação Precisa** / ativo | DEF / DES | Se sofreu ataque nos últimos 3 s, 135% ataque; caso contrário 90%; CD 13 s | Guarda recolhida, avanço curto e corte refletido em luz branca. |
| T09 | **Sangue Frio** / passivo | INT / VIT | Ao receber escudo de talento, regenera 2% da vida máxima por 6 s; não acumula; CD 15 s | Vapor azul-frio rodeia torso e elmo. |
| T10 | **Juramento de Ferro** / ativo | DEF / VIT | Escudo absorve 38 + 2 por DEF + 0,8 por VIT durante 4 s; -15% dano ofensivo enquanto ativo; CD 28 s | Ajoelha, ergue arma e invoca cúpula de placas com runa central. |

## Sinergias concretas e counters
- **Berserker de risco:** B01 + B03 + B08 + B10; FOR/VIT, grande explosão em vida baixa, vulnerável a kiting e redução de ataque.
- **Duelista de esquiva:** D01 + D02 + D04 + D06 + D09; DES/DEF, inicia ciclos e devolve golpes, vulnerável a dano sustentado em área.
- **Bastião de escudo:** T01 + T03 + T04 + T07 + T10; DEF/VIT, resposta defensiva, vulnerável a B09 e ao recuo móvel.
- **Guerreiro híbrido:** B03 + D10 + T08 + T01; FOR/DES/DEF, controla espaço e pune perseguição; sacrifica teto ofensivo e resistência pura.
- **Antiescudo:** B09 neutraliza escudos sem causar dano extra à vida; T10 deve sobreviver ao impacto por timing; D05 ignora parte da mitigação, mas NÃO ignora escudo.
- **Debuffs** B05 e T05 são da mesma categoria: aplica-se o maior, sem soma. B06 tem teto de cura por intervalo. T01/T07/T10 partilham teto de escudo total igual a 30% do HP máximo.
- **Anticiclo:** efeitos reativos não desencadeiam reativos; reflexão não reflete; nenhuma cadeia infinita de curas/escudos.

## Pipeline das 30 animações
- Modelo atual: KayKit Barbarian.glb. Os clipes originais NÃO garantem 30 golpes diferentes. Cada talento terá uma assinatura singular: clip base + gesto/pose/keyframe próprio quando necessário + VFX original + sincronia de dano + som opcional.
- Ativos devem sincronizar evento de impacto com clipe e áudio; reativos mostram reação após evento de defesa; passivos apresentam emissão e reforço no HUD sem interromper ataque atual.
- Critério de aceite: 30 IDs de animação distintos (war_B01 ... war_T10), 30 demonstrações verificadas em navegador, legibilidade mobile e alternativa de movimento reduzido. Reutilizar um mesmo clip base apenas se a composição final resultar em animação efetivamente distinguível.

## Critérios de balanceamento (ainda NÃO simulados)
- Simular 1.000+ seeds por par de builds representativas, trocando ordem e posição de início. Um espelho idêntico deve aproximar-se de 50/50. Nenhuma build genérica pode dominar mais de 60% dos adversários da bateria de referência; counters específicos podem existir.
- Medir taxa de vitória, tempo de duelo, dano efetivo, cura, escudo, frequência de procs, talentos pouco escolhidos e talentos que nunca disparam. Testar cap de DEF 12, VIT 12, cura + escudos, velocidade, anti-escudo, reacções encadeadas e os 10 talentos simultâneos.
- Vitórias não mudam notas nem XP; XP é definido por missões aprovadas no servidor. Bônus de avaliação não concedem pontos de atributos/talentos.

## Compatibilidade com a V5 existente (lacunas reais)
- O protótipo legado em v5/hero-core.js usa **4 atributos** (power/agility/spirit/vitality), inicia com 6 pontos, tem **6 talentos por classe com ranks** e libera talentos em intervalo diferente. O front-end atual permite reset sem bloqueio e mostra seis classes experimentais; a API de arena precisa ser auditada para a regra de travamento.
- Implementar a especificação requer migração coordenada entre core, interface, servidor, persistência e testes, não somente trocar a lista de talentos. Não realizar migração de contas reais ou promover main sem autorização.
- Este arquivo é uma especificação aprovada para planejamento e revisão. Não confundir com funcionalidade implantada.

**Próximo passo técnico:** transformar as 30 definições em dados versionados, criar simulador de duelo e testes de balanceamento, implementar prévia de 30 animações e então validar a integração ao sistema pedagógico.
