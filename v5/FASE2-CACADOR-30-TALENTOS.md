# V5 — 30 talentos do Caçador (planejamento)

**Status: documentação, não há integração ao motor nem animações próprias prontas.** Todos os talentos têm IDs, atributos, efeitos numéricos e uma encenação visual distinta para implementação posterior.

## Progressão, livre combinação e duas arenas

- **Missão 5**: +500 XP acumulado (5 missões), dez pontos de atributos, **cinco talentos distintos** escolhidos livremente entre as 30 opções. Arena de teste **não trava as escolhas**; o aluno pode experimentar e reconfigurar depois.
- **Missão 10**: +1.000 XP acumulado, 20 pontos, **dez talentos distintos**. A primeira entrada na arena FINAL exige confirmação e bloqueia a build no servidor. Treinos, a missão 5 e prévias 3D nunca bloqueiam.
- **Misturar caminhos é regra central**: Pontaria + Emboscada + Sobrevivência podem coexistir, sem pré-requisitos obrigatórios ou bônus de conjunto. Exemplo: P05 + E01 + S01.
- Atributos: **Força, Destreza, Inteligência, Vitalidade e Defesa**. Primário/segundário aparecem nos cards. Limite de 12 pontos investidos por atributo. Eficácia inicial do efeito = `min(1.20, 0.75 + 0.025×primário + 0.0125×secundário)`, sobre pontos investidos. Durações e recargas não escalam. Sem zeros absolutos: build incoerente é fraca, não inválida.
- **Armadilhas em combate automático** precisam de posição real, disparo por aproximação e colisão; colocar até duas armadilhas do mesmo jogador simultaneamente, com tempo de vida mostrado. Um inimigo não sofre duas vezes o mesmo campo. DOTs do mesmo caçador não acumulam, lentidões usam apenas a maior. Não fabricar acertos instantâneos fora de alcance.

## Pontaria — 10 talentos

| Talento | Tipo / atributos principal e secundário | Efeito inicial | Animação individual planejada | Sinergia / contrajogo |
|---|---|---|---|---|
| **P01 · Flecha Perfurante** | ativo · **Destreza** / Força | Disparo de 140% do ataque físico e ignora 10% da mitigação defensiva; CD 10 s | Arqueiro ajoelha, estica o arco em ângulo baixo e libera flecha com trilha dourada perfurante | P05; escudos continuam absorvendo |
| **P02 · Mira Firme** | passivo · **Destreza** / Inteligência | Após 3 s sem deslocamento, próximo tiro recebe +12% de dano; uma carga, trava 10 s | Olho direito brilha, círculo de mira fecha sobre a corda antes do disparo | P01; perseguição força a andar |
| **P03 · Tiro Duplo** | ativo · **Destreza** / Força | Duas flechas de 58% ataque cada contra um alvo; 116% total, CD 8 s | Puxa duas flechas entre dedos e dispara em ângulos divergentes que se encontram no alvo | P07 acumula impactos; bloqueio de projéteis |
| **P04 · Olhar Predador** | passivo · **Destreza** / Inteligência | Ao atacar o mesmo alvo duas vezes, próximo tiro recebe +8% dano; trava 12 s, uma carga | Visão de águia delineia o inimigo por dois pulsos âmbar | P03; troca de alvo frequente |
| **P05 · Flecha Marcadora** | ativo · **Destreza** / Inteligência | 100% ataque, marca alvo por 4 s; próximo golpe seu contra ele +12% de dano; CD 15 s | Ponta da flecha abre selo circular vermelho no peito do alvo | P01 e P10; remoção de marca |
| **P06 · Disparo de Ruptura** | ativo · **Força** / Destreza | 125% ataque; dano extra de 60% apenas contra escudos, não contra vida; CD 19 s | Flecha de ponta tripla quebra em fragmentos ao tocar barreira | P01 não ignora escudos, complementando ruptura; builds sem escudo |
| **P07 · Pulsação da Corda** | passivo · **Destreza** / Força | Após 3 impactos com flechas próprias, próximo básico ganha +10% velocidade de execução; trava 10 s | Corda do arco vibra e emite três ondas finas circulares | P03 dispara múltiplos impactos; investida de melee |
| **P08 · Olho do Caçador** | reativo · **Destreza** / Defesa | Ao ser atacado de mais de 6 m, reduz 15% do impacto e ganha +8% de alcance no próximo tiro; trava 18 s | Visor dourado desce diante dos olhos e arco ergue instantaneamente | P10 contra arqueiros; corpo a corpo |
| **P09 · Tiro de Interrupção** | reativo · **Destreza** / Inteligência | Se inimigo começa conjuração de preparo maior que 0,4 s em até 8 m, atira por 55% ataque e atrasa em 0,5 s a execução; trava 21 s | Flecha curta azul é disparada de quadril durante o gesto adversário | P10; habilidades instantâneas |
| **P10 · Chuva de Setas** | ativo · **Destreza** / Vitalidade | Três impactos de 48% do ataque em raio 2 m após aviso 0,7 s; CD 25 s | Levanta arco ao céu, três setas luminosas caem em triângulo no solo | P05 marca antes; alvos móveis |

## Emboscada e armadilhas — 10 talentos

| Talento | Tipo / atributos principal e secundário | Efeito inicial | Animação individual planejada | Sinergia / contrajogo |
|---|---|---|---|---|
| **E01 · Armadilha de Espinhos** | ativo · **Inteligência** / Destreza | Instala armadilha por até 8 s; primeiro inimigo em raio 1,5 m sofre 90% ataque e lentidão 20% por 2 s; CD 17 s | Caçador finca estaca e espinhos metálicos saltam do chão ao ativar | E04 força passagem; evitar a zona |
| **E02 · Passo de Sombra** | ativo · **Destreza** / Vitalidade | Desloca 3 m lateralmente até espaço livre e ganha 10% velocidade por 2 s; CD 18 s | Giro ágil para trás de fumaça cinza, reaparece com folhas escuras | E07 ativa mobilidade; tiros de longo alcance |
| **E03 · Venenos de Caça** | passivo · **Inteligência** / Destreza | Após habilidade de armadilha acertar, adiciona dano de 2,5% ataque/s por 3 s; uma aplicação própria, trava 12 s | Líquido verde percorre a flecha até formar gotas no solo | E01 e E10; purificação de veneno |
| **E04 · Isca do Deserto** | ativo · **Inteligência** / Vitalidade | Coloca isca até 7 s; inimigos que se aproximarem a 2 m têm velocidade -12% por 2 s, sem controlar sua vontade; CD 20 s | Lança placa de madeira com brilho laranja e miragem de pegadas | E01 facilita acertar; alvos à distância |
| **E05 · Corda de Aprisionamento** | ativo · **Destreza** / Inteligência | Causa 75% ataque e desacelera 25% por 1,5 s a alvo até 7 m; CD 15 s | Arqueiro lança corda em laço que enrola os tornozelos e se desfaz | E10 mantém alvo na área; resistência a controle |
| **E06 · Camuflagem das Folhas** | reativo · **Destreza** / Defesa | Ao receber ataque corpo a corpo, reduz 25% deste golpe e move 1 m para trás; trava 19 s | Manto espalha folhas e deixa réplica translucida da silhueta | E02 compõe evasão; golpes em área |
| **E07 · Predador Invisível** | passivo · **Destreza** / Inteligência | Depois de se reposicionar 3 m sem receber dano, próximo ataque ganha +10% dano; trava 14 s | Pegadas apagam, capuz adquire brilho esverdeado e arco brilha só no disparo | E02; perseguição constante |
| **E08 · Armadilha Reflexa** | reativo · **Defesa** / Inteligência | Ao ficar abaixo de 40% HP, solta uma armadilha de 70% ataque no próprio chão; uma vez por duelo, sem imobilização | Rola pequena esfera com gancho que se abre ao toque do inimigo | E03; disparos à distância |
| **E09 · Rede Preparada** | passivo · **Inteligência** / Defesa | Primeira armadilha acionada no duelo aumenta em 12% o dano da próxima habilidade ofensiva; uma carga | Rede de fios dourados surge brevemente sob as armadilhas antes de retrair | E01 e E10; ignorar armadilhas |
| **E10 · Mina de Estilhaços** | ativo · **Inteligência** / Força | Coloca mina até 8 s; primeiro inimigo em raio 1,5 m recebe 115% ataque em área raio 2 m; CD 25 s | Lança disco metálico no solo, luz vermelha pisca e explode em lascas geométricas | E05 segura na zona; desviar de armadilhas |

## Sobrevivência — 10 talentos

| Talento | Tipo / atributos principal e secundário | Efeito inicial | Animação individual planejada | Sinergia / contrajogo |
|---|---|---|---|---|
| **S01 · Rolamento Tático** | ativo · **Destreza** / Vitalidade | Rola 2,5 m para espaço livre e reduz 18% dano recebido por 1,5 s; CD 16 s | Rolamento de ombro com capa levantando poeira em espiral | P02 ganha distância depois; controle de rota |
| **S02 · Respiração do Bosque** | passivo · **Vitalidade** / Defesa | Após 5 s sem sofrer dano, regenera 2% HP máximo em 4 s; trava 15 s; não acumula | Herói respira fundo, folhas translúcidas sobem em volta do peito | S01; danos periódicos interrompem |
| **S03 · Flecha de Retirada** | ativo · **Destreza** / Força | Disparo de 90% ataque e recuo de 1,5 m até espaço livre; CD 12 s | Atira de lado enquanto salta para trás, poeira marca novo posicionamento | P05 mantém pressão; perseguidor veloz |
| **S04 · Vigilância da Floresta** | passivo · **Defesa** / Inteligência | Após receber ataque especial, próximo ataque especial recebido nos 4 s seguintes causa -10% de dano; trava 14 s | Símbolo de casca de árvore se fecha sobre os ombros | S05; básicos não sofrem redução |
| **S05 · Tiro Enfraquecedor** | ativo · **Destreza** / Inteligência | 95% ataque, reduz 10% do ataque inimigo por 3 s; CD 18 s | Flecha cinza atinge punho do inimigo com dispersão de névoa | S04 sobrevive a rajadas; escudos não prejudicados |
| **S06 · Garra do Sobrevivente** | reativo · **Vitalidade** / Defesa | Ao cair abaixo de 30% HP recebe escudo de 10% HP máximo por 3 s; uma vez por duelo | Arqueiro fixa joelho no chão e ergue bracelete de couro luminoso | S02 ganha tempo; anti-escudo |
| **S07 · Instinto de Fuga** | passivo · **Destreza** / Vitalidade | Abaixo de 50% HP ganha +10% velocidade de movimento, sem aceleração de ataques | Orelhas da capa se levantam, pés deixam faíscas verdes curtas | S01 sustenta distanciamento; lentidão |
| **S08 · Salto da Corça** | ativo · **Destreza** / Defesa | Salta até 3 m para espaço livre e produz um tiro de 65% ataque na direção do perseguidor; CD 20 s | Salto alto lateral com giro do arco e flecha em pleno ar | S03; inimigo distante demais |
| **S09 · Guarda de Último Fôlego** | reativo · **Defesa** / Vitalidade | Ao sofrer golpe que removeria 20%+ HP máximo, reduz esse golpe em 18%; trava 22 s | Arco cruza peito em guarda, anel verde absorve parte do golpe | S06; muitos danos baixos |
| **S10 · Trilha de Armadilhas** | ativo · **Inteligência** / Defesa | Deixa 2 marcas por 5 s em posições recentes; cada inimigo recebe no máximo 1 impacto de 55% ataque e lentidão 12% por 1 s; CD 28 s | Dois glifos de folha se acendem atrás do arqueiro durante corrida | S01 e E05; inimigo pode contornar marcas |

## Combinações e vulnerabilidades

- **Atirador** P01 + P02 + P03 + P05 + P10: dano à distância, vulnerável a adversários que pressionam movimento.
- **Armadilheiro** E01 + E03 + E04 + E05 + E10: negação de espaço, vulnerável a inimigos que evitam as zonas.
- **Sobrevivente móvel** S01 + S02 + S03 + S06 + S07: evasão e resistência, menor capacidade de finalizar combate rápido.
- **Híbrido pontaria/armadilhas** P01 + P05 + E01 + E10 + S01: marca e pune perseguição, mas depende de posicionamento.

## Animações e balanceamento

O modelo real `player_archer.glb` da branch tem **somente sete clipes gerais**. **Não existem ainda as 30 animações únicas**; cada habilidade requer combinação própria de gestos, rig/keyframes novos quando necessário, VFX, flechas, minas e eventos sincronizados com dano real. Os passivos exibem efeitos de ativação exclusivos. Validar arco, flecha e gizmos como objetos separados, com colisões e efeito visível em mobile.

Bateria de aceitação: 1.000+ sementes emparelhadas para Pontaria/Armadilhas/Sobrevivência/híbridos contra os quatro arquétipos, com troca de posições; medir taxa de vitória, dano, armadilhas acionadas, capacidade de fugir, campeões em stalemate e talentos inúteis. Limites de cura/escudo, antirreflexão e controle cumulativo serão comuns às quatro classes. **Nenhuma taxa de vitória foi medida neste planejamento.**
