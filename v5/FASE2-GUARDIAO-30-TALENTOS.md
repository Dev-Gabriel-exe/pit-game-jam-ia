# V5 — 30 talentos do Guardião (Paladino) (planejamento)

**Situação: planejamento, sem implementação no motor e sem animações customizadas finalizadas.** É a quarta classe aprovada, com modelo de cavaleiro 3D real; não adiciona uma quinta classe chamada Paladino.

## Regras de progressão, cross-path e travamento

- A cada missão aprovada: 100 XP, **+2 pontos de atributo e +1 talento distinto**. Na **missão 5**, entra na arena de teste com 500 XP, 10 pontos e até cinco talentos, e **pode redistribuir tudo depois**. Na **missão 10**, 1.000 XP, 20 pontos e dez talentos; a primeira entrada na arena final **confirma e trava** a build no servidor. Treinos anteriores não travam.
- Cada aluno escolhe quaisquer dez talentos dentre os trinta, **mesclando Égide, Luz Sagrada e Julgamento**. Caminhos são categorias de estilo, nunca trilhas fechadas. Sem pré-requisitos, conjuntos obrigatórios ou bônus escondidos. Ex.: G01 + L01 + J03 + J07.
- Cinco atributos: Força, Destreza, Inteligência, Vitalidade, Defesa. Limite 12 pontos investidos num atributo. Eficácia hipotética de talento = `min(1.20,0.75 + 0.025×primário + 0.0125×secundário)`; a base da classe não conta como ponto investido. Cooldown e duração constantes. Escudos G01 e G10 já têm fórmula própria e **não recebem multiplicador duplicado**.
- Mesmo sozinho numa arena todos os talentos funcionam: Luz Sagrada trata o próprio Guardião; futura arena de equipes poderá estender efeitos a aliados sem alterar cálculo atual.
- Global: escudo total no máximo 30% HP; curas de talentos no máximo 10% HP por janela de 15 s; efeitos refletidos não provocam novos reflexos; redução da mesma categoria usa maior valor; buffs de movimento e enfraquecimentos não se acumulam infinitamente.

## Égide — 10 talentos

| Talento | Tipo / atributos principal e secundário | Efeito inicial | Animação individual planejada | Sinergia / contrajogo |
|---|---|---|---|---|
| **G01 · Escudo da Alvorada** | ativo · **Defesa** / Vitalidade | Escudo absorve 20 + 1,5 por DEF + 0,5 por VIT investidos por 4 s; CD 14 s | Ergue espada diante do rosto, painel octogonal azul-dourado se fecha | G03 e L03; talento antiescudo |
| **G02 · Armadura Consagrada** | passivo · **Defesa** / Vitalidade | Após 4 s recebendo dano sem cair, reduz próximo impacto em 12%; trava 12 s | Placas da armadura brilham em sequência do peito ao ombro | G04 prolonga resistência; explosão inicial |
| **G03 · Retorno da Égide** | reativo · **Defesa** / Força | Após escudo próprio absorver dano, rebate 35% ataque físico em até 3 m; trava 18 s; reflexo não reflete | Painel protetor se dobra num bumerangue dourado curto | G01 e G10; atacantes distantes |
| **G04 · Postura da Cidadela** | ativo · **Defesa** / Vitalidade | Por 4 s, +18% mitigação defensiva e -15% velocidade de movimento; CD 20 s | Finco da espada no chão, pedras formam quatro contrafortes | G09 assegura sobrevivência; kite e artilharia |
| **G05 · Aço Resiliente** | passivo · **Vitalidade** / Defesa | Ao perder mais de 15% do HP em 3 s, recebe escudo de 7 por 3 s; trava 16 s | Costuras metálicas se unem sobre a placa rachada do torso | G02; ataques espaçados |
| **G06 · Rota de Guarda** | ativo · **Defesa** / Destreza | Avança até 2 m na direção de inimigo próximo e recebe -12% de dano do próximo golpe por 3 s; CD 17 s | Passada com ombro à frente e faixa quadrada de luz como escudo | J04 aproxima; atacante que recua |
| **G07 · Reflexo da Sentinela** | reativo · **Destreza** / Defesa | Quando inimigo começa golpe corpo a corpo, bloqueia 20% do primeiro impacto; trava 15 s | Guarda repentina com espada em diagonal, faísca branca na lâmina | G03; magias instantâneas |
| **G08 · Peso da Armadura** | passivo · **Defesa** / Força | Após 3 ataques básicos completos ganha +8% mitigação por 3 s, sem acumular; trava 10 s | Cada passo carimba runa pesada no solo e terceira acende ombreiras | J03 mantém ataque; armadilha de lentidão |
| **G09 · Vigília de Pedra** | ativo · **Vitalidade** / Defesa | Regenera 4% HP máximo ao longo de 4 s enquanto reduz velocidade de movimento em 12%; CD 24 s | Ajoelha com espada sobre o joelho, raízes de pedra restauram armadura | G04; interrupção e dano explosivo |
| **G10 · Bastião Solar** | ativo · **Defesa** / Inteligência | Escudo absorve 35 + 1,7 por DEF + 0,6 por INT por 4 s; enquanto durar -12% dano causado; CD 28 s | Abre disco dourado de seis painéis com sol no centro e coroa giratória | G03 + L05; quebra de escudo |

## Luz sagrada — 10 talentos

| Talento | Tipo / atributos principal e secundário | Efeito inicial | Animação individual planejada | Sinergia / contrajogo |
|---|---|---|---|---|
| **L01 · Bênção da Aurora** | ativo · **Inteligência** / Vitalidade | Restaura 6% HP máximo ao longo de 3 s; CD 19 s; sujeita a teto global de cura | Aponta espada ao coração, feixe dourado percorre braços e fecha feridas | L04 estende janela segura; burst anticurativo |
| **L02 · Luz Persistente** | passivo · **Inteligência** / Vitalidade | Após receber cura de talento, próximo ataque básico ganha +9% dano; uma carga e trava 12 s | Pequena auréola transfere luz do peito para o gume | L01; anti-cura e pressão |
| **L03 · Fagulha Reparadora** | passivo · **Vitalidade** / Inteligência | Após o próprio escudo bloquear impacto, cura 1,5% HP máximo; trava 15 s e teto global | Faíscas azuis da barreira voltam ao corpo como vaga-lumes | G01 e G10; destruição de escudos |
| **L04 · Clarão Purificador** | ativo · **Inteligência** / Defesa | Causa 70% ataque sagrado e reduz duração de lentidão própria em 50%; CD 16 s | Lâmina aponta para cima, coluna de luz dissolve correntes ao redor das botas | L01 e G04; ataque à distância |
| **L05 · Voto da Luz** | ativo · **Inteligência** / Defesa | Causa 90% ataque sagrado e gera escudo de 8 por 3 s; CD 15 s | Desenha cruz luminosa com espada, lança traço vertical ao inimigo | G10 e G03; anti-escudo |
| **L06 · Resplendor de Esperança** | reativo · **Vitalidade** / Inteligência | Primeira vez abaixo de 35% HP restaura 5% HP máximo ao longo de 3 s; uma vez por duelo | Aurora surge atrás do personagem, pétalas douradas caem em espiral | L01; dano imediato |
| **L07 · Sopro da Graça** | passivo · **Inteligência** / Destreza | Após ficar 4 s sem sofrer dano, próxima cura ou escudo recebe +10% ao seu valor, uma carga e trava 13 s | Quatro velas de luz giram ao redor da espada e convergem na guarda | L01 e G01; contato constante |
| **L08 · Julgamento Luminoso** | ativo · **Inteligência** / Força | Feixe de 120% ataque sagrado até 7 m com preparo de 0,45 s; CD 18 s | Estende espada horizontal, símbolo solar abre e feixe reto atravessa o ar | J01 aumenta pressão; movimento lateral |
| **L09 · Orvalho de Misericórdia** | reativo · **Inteligência** / Vitalidade | Ao receber queimadura ou veneno, reduz sua duração em 50% e cura 2% HP máximo ao longo de 3 s; trava 22 s | Gotas verdes-douradas extinguem faíscas e limpam aura tóxica | L01; dano físico sem DOT |
| **L10 · Círculo de Santuário** | ativo · **Inteligência** / Defesa | Cria zona por 4 s; enquanto dentro, recebe -12% dano mágico, sem acumular com igual categoria; CD 26 s | Ergue espada, vitral de luz surge no piso com quatro colunas transparentes | G04 contra magia; afastar o guardião da zona |

## Julgamento — 10 talentos

| Talento | Tipo / atributos principal e secundário | Efeito inicial | Animação individual planejada | Sinergia / contrajogo |
|---|---|---|---|---|
| **J01 · Golpe do Veredito** | ativo · **Força** / Inteligência | Corte de 140% ataque físico contra alvo em alcance; CD 11 s | Espada traça V de fogo dourado e selo do veredito fica sobre o chão | L08 complementa ataque; esquiva |
| **J02 · Vontade do Justo** | passivo · **Força** / Vitalidade | Após 2 ataques básicos próprios, próximo ataque básico recebe +10% dano; uma carga, trava 10 s | Duas marcas solares surgem no peito e a terceira corre à espada | J03 mantém pressão; kiting |
| **J03 · Investida do Tribunal** | ativo · **Força** / Destreza | Avança até 3 m em linha livre e atinge por 105% ataque físico; CD 18 s | Cavaleiro baixa ombro e espada, avança com rastro de bandeira dourada | J02; armadilha em rota |
| **J04 · Marca do Veredito** | ativo · **Inteligência** / Força | 85% ataque sagrado e aplica marca de 4 s: seu próximo básico recebe +12% dano, consumindo marca; CD 15 s | Carimba glifo hexagonal acima do inimigo com arco brilhante | J01; purificação de marca |
| **J05 · Coração Corajoso** | passivo · **Vitalidade** / Força | Enquanto acima de 70% HP, +7% dano dos ataques básicos; não afeta habilidades | Halo firme ilumina coroa do elmo e se apaga ao perder vida | G01 preserva condição; desgaste contínuo |
| **J06 · Resposta Implacável** | reativo · **Defesa** / Força | Ao sofrer dano de habilidade, devolve 55% ataque físico se inimigo em 3 m; trava 18 s | Absorve golpe com manopla e executa estocada curta | G04; conjuradores distantes |
| **J07 · Justiça Cintilante** | ativo · **Inteligência** / Destreza | Causa 100% ataque sagrado em cone de 2,5 m e lentidão 15% por 1,5 s; CD 20 s | Desenha arco amplo com espada e três lascas de vitral acompanham o corte | J03 pressiona ao aproximar; redução de controle |
| **J08 · Inspiração da Lâmina** | passivo · **Força** / Inteligência | Após bloquear 2 ataques, próximo ataque especial causa +10% dano; uma carga, trava 14 s | Inscrições percorrem a lâmina da base à ponta em dois pulsos | G07; inimigos que evitam melee |
| **J09 · Fé Inflexível** | reativo · **Vitalidade** / Defesa | Na primeira vez abaixo de 30% HP recebe escudo de 10% HP máximo por 3 s; uma vez por duelo | Anjo geométrico de luz se abre como asas atrás do cavaleiro | L06 aumenta sobrevivência; anti-escudo |
| **J10 · Martelo do Amanhecer** | ativo · **Força** / Inteligência | 155% ataque físico em raio 2 m após preparo de 0,55 s; CD 27 s | Salta com espada alçada, desce com coluna dourada e onda circular de pedra | J07 mantém alvo próximo; movimentação após aviso |

## Builds que misturam caminhos

- **Guardião clássico** G01 + G02 + G03 + G04 + G10: defesa e retaliação; vulnerável à destruição de escudos e ataques de longa distância.
- **Paladino curandeiro** G01 + L01 + L03 + L04 + L10: cura limitada e resistência mágica; vulnerável à pressão contínua e dano antiescudo.
- **Cavaleiro agressivo** J01 + J02 + J03 + J04 + J10: força, pressão e mobilidade; não aproveita a melhor defesa da classe.
- **Híbrido justo** G01 + L01 + J03 + J07 + J08: combina defesa, cura e avanço; menos dano explosivo que um especializado.

## Animações e equilíbrio — requisitos futuros

O KayKit `Knight.glb` contém clipes-base, **não trinta talentos animados individualmente**. Cada um dos 30 storyboards exige pose/gesto específico, VFX autoral, sincronização do dano e escudos, além de uma assinatura diferenciável no 3D. Passivos e reativos exibem encenação visual no instante de disparo; se o modelo não possuir escudo físico, gerar equipamento próprio preso ao rig, sem trocar a silhueta em cubos.

Testar 1.000+ sementes pareadas de builds contra todas as quatro classes e contra outros Guardiões; alternar posição/iniciativa. Medir tempo do confronto, dano por segundo, cura por janela, escudos, frequência de contragolpes, talentos nunca ativados, vitórias por expiração e loops. Nenhum número de equilíbrio foi validado nesta etapa. Construção exige atualização coordenada da API, persistência, UI e combate antes de liberar aos alunos; preservar a main e a V3.
