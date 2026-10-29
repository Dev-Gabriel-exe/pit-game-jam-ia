# V5 — 30 talentos do Arcanista (planejamento)

**Situação:** especificação de design, **não implantada nem balanceada em combate**. Os 30 movimentos são *storyboards únicos*, ainda não são clipes ou efeitos 3D prontos.

## Progressão e escolhas cruzadas

- A cada missão aprovada: +100 XP pedagógicos, +2 pontos investíveis, +1 talento **distinto**. **Missão 5:** arena de TESTE, com 500 XP, até 10 pontos de atributo e cinco talentos; resultado é diagnóstico e **não bloqueia a build**. O estudante pode redistribuir livremente depois.
- **Missão 10:** arena FINAL, com 1.000 XP, 20 pontos de atributo e dez talentos; antes de entrar, confirmar composição final. **Apenas a primeira entrada na final trava definitivamente a build**, com registro no servidor. Visualizar habilidades e treinos não travam.
- Caminhos Elemental, Rúnico e Astral **não são subclasses nem pré-requisitos**. É permitido misturar livremente E01 + R01 + A02, por exemplo. Sem bônus oculto por completar caminho. Um talento ocupa uma das dez escolhas independentemente de sua trilha.
- Atributos: **Força, Destreza, Inteligência, Vitalidade, Defesa**, limite de 12 pontos investidos em cada um. Talentos dependem dos dois atributos exibidos; eficácia hipotética = min(1,20; 0,75 + 0,025×primário + 0,0125×secundário). Penaliza combinações ruins sem tornar talento inválido. **R01** já tem escala própria explicitada: não multiplicar duas vezes.
- Limites propostos: escudos somados até 30% da vida máxima; cura de talentos por janela limitada; debuffs do mesmo tipo usam o maior; reflexos não geram outros reflexos; teleporte só alcança espaço livre. Cooldowns e duração não escalam pelos atributos.

## Elemental — 10 talentos

| Talento | Tipo / atributos principal e secundário | Efeito inicial | Animação individual planejada | Sinergia / contrajogo |
|---|---|---|---|---|
| **E01 · Lança de Cinzas** | ativo · **Inteligência** / Destreza | 145% ataque mágico; CD 9 s, alcance 9 m | Gira cajado, lança brasa espiral, explosão de cinzas no alvo | E02 aplica pressão; escudos e esquiva de projéteis |
| **E02 · Combustão Residual** | passivo · **Inteligência** / Vitalidade | Ao acertar fogo aplica queimadura de 3% do ataque mágico/s por 3 s; uma por alvo, trava 10 s | Símbolo incandescente sob alvo libera três pulsos de fagulhas | E01 e E10; purificação e resistência |
| **E03 · Prisão de Gelo** | ativo · **Inteligência** / Defesa | 80% ataque mágico + lentidão 25% por 2 s; CD 17 s | Crava cajado, cristal azul envolve tornozelos e se parte | E04 ganha dano; mobilidade e redução de controle |
| **E04 · Estilhaço Polar** | ativo · **Inteligência** / Destreza | 125% ataque mágico + 15% contra alvo lento; CD 11 s | Abre a mão, cinco agulhas de gelo convergem no alvo | E03; escudos |
| **E05 · Pele Vulcânica** | reativo · **Vitalidade** / Inteligência | Ao receber golpe próximo: escudo de 10 por 2 s + resposta de 35% do ataque mágico; trava 18 s | Crosta de lava racha no manto e expele onda de calor | R07; atacantes à distância |
| **E06 · Tempestade Estática** | ativo · **Inteligência** / Destreza | 85% ataque mágico no alvo e 55% num segundo a até 4 m; apenas um salto; CD 21 s | Raio zigue-zague salta uma vez entre dois inimigos | A07; alvos isolados |
| **E07 · Olho da Tormenta** | passivo · **Destreza** / Inteligência | Após duas ativas, próxima ativa ofensiva ganha 8% dano; uma carga, trava 12 s | Anel elétrico orbita a cabeça e descarrega no cajado | E06 + A01; interrupções |
| **E08 · Névoa de Inverno** | reativo · **Defesa** / Inteligência | Ao sofrer lentidão reduz duração 50% e recua 1 m se houver espaço; trava 19 s | Corpo vira neve translúcida, reaparece com pegadas de gelo | E03; ataques de longo alcance |
| **E09 · Núcleo Incandescente** | passivo · **Vitalidade** / Inteligência | Primeira vez abaixo de 40% HP: próxima magia ofensiva +12% dano; uma vez por duelo | Coração de brasas acende no peito e migra ao cajado | E10; execução antes do disparo |
| **E10 · Cometa Carmesim** | ativo · **Inteligência** / Vitalidade | 155% ataque mágico em raio 2 m após aviso 0,7 s; CD 25 s | Aponta ao céu, marcador vermelho brilha e cometa cai com cauda de cinzas | E03; deslocamento após marcador |

## Rúnico — 10 talentos

| Talento | Tipo / atributos principal e secundário | Efeito inicial | Animação individual planejada | Sinergia / contrajogo |
|---|---|---|---|---|
| **R01 · Selo de Proteção** | ativo · **Defesa** / Inteligência | Escudo 18 + 1,4 por DEF + 0,6 por INT investidos, dura 4 s; CD 13 s | Duas mãos fecham losango de runas translúcidas ao redor do mago | R06; quebra de escudos |
| **R02 · Inscrição Dolorosa** | passivo · **Inteligência** / Defesa | Duas magias diferentes no mesmo alvo preparam +9% dano para próxima magia; trava 10 s | Três letras arcanas surgem sobre alvo e terceira explode | E01 + E04; troca frequente de alvos |
| **R03 · Runa da Repulsão** | ativo · **Inteligência** / Destreza | 65% ataque mágico num raio de 2,5 m e empurra 1,5 m; CD 18 s | Carimba runa no chão, círculos concêntricos empurram inimigos | A02; combatentes à distância |
| **R04 · Mente Blindada** | passivo · **Defesa** / Vitalidade | Após receber habilidade reduz 12% da próxima habilidade inimiga por até 4 s; trava 12 s | Glifos sobre a testa se unem em viseira luminosa | R01; ataques básicos contínuos |
| **R05 · Corte de Mana** | ativo · **Inteligência** / Força | Corte arcano até 4 m causa 100% ataque mágico e atrasa em 0,8 s próxima habilidade ofensiva inimiga; CD 15 s | Cajado vira lâmina luminosa, corta símbolo flutuante | R03; inimigos distantes |
| **R06 · Reflexo Prismático** | reativo · **Defesa** / Inteligência | Escudo absorve dano: devolve 35% ataque mágico a atacante até 7 m, nunca reflete reflexos; trava 20 s | Barreira refrata triângulo de luz que retorna ao agressor | R01; antiescudos |
| **R07 · Tecelagem de Runas** | passivo · **Inteligência** / Vitalidade | Ao criar escudo, regenera 1,5% do HP máximo por 5 s, sem acumular; trava 15 s | Fios dourados costuram a superfície da barreira | R01 e E05; dano explosivo |
| **R08 · Marca Desarmônica** | ativo · **Inteligência** / Defesa | 85% ataque mágico + -10% dano de habilidades inimigas por 3 s, não soma debuff; CD 22 s | Runa rachada gira ao contrário acima do alvo emitindo vibrações | R04; golpes básicos |
| **R09 · Última Equação** | reativo · **Vitalidade** / Defesa | Primeira vez abaixo de 30% HP cria escudo de 12% HP máximo por 3 s; uma vez por duelo | Círculo numérico fecha domo estrelado instantâneo | A09; dano antiescudo |
| **R10 · Grande Mandala** | ativo · **Inteligência** / Defesa | 90% ataque mágico em raio 3 m + escudo 8 por 4 s após aviso 0,5 s; CD 27 s | Desenha oito anéis de runa que se fecham numa coluna de luz | E03; mobilidade |

## Astral — 10 talentos

| Talento | Tipo / atributos principal e secundário | Efeito inicial | Animação individual planejada | Sinergia / contrajogo |
|---|---|---|---|---|
| **A01 · Pulso Estelar** | ativo · **Inteligência** / Destreza | 115% ataque mágico em projétil de alcance 10 m; CD 8 s | Cajado toca estrela flutuante que dispara raio pontilhado azul | E07; defesas contra projéteis |
| **A02 · Passagem Etérea** | ativo · **Destreza** / Inteligência | Teleporta 3 m para posição livre; próxima magia em 2 s ganha +7% dano; CD 19 s | Corpo vira partículas constelares e reaparece por dobra circular | E10; rastreamento à distância |
| **A03 · Órbita Protetora** | passivo · **Defesa** / Inteligência | Após mover 4 m no combate, próximo impacto recebido -10%; uma carga, trava 14 s | Dois satélites de luz orbitam ombro e colidem no golpe | A02; lentidão e perseguição |
| **A04 · Gravidade Menor** | ativo · **Inteligência** / Defesa | 50% ataque mágico em zona raio 2 m + lentidão 20% por 2 s; CD 17 s | Inclina cajado, campo violeta deforma solo como lente | E10; teleporte de fuga |
| **A05 · Eco Astral** | passivo · **Inteligência** / Destreza | Ao acertar ativa de alvo único, cópia causa 25% do dano efetivo; não gera eco, trava 13 s | Imagem astral do mago repete gesto com 0,3 s de atraso | A01; escudos e reduções |
| **A06 · Escudo de Fase** | reativo · **Destreza** / Defesa | Golpe que retiraria >=20% do HP máximo sofre redução de 20%; trava 21 s | Corpo fica translúcido e produz dois contornos defasados | A02; múltiplos golpes leves |
| **A07 · Foco Celeste** | passivo · **Inteligência** / Vitalidade | Após 4 s sem sofrer dano, próxima ofensiva recebe +10%; uma carga, trava 11 s | Constelação se alinha atrás do cajado antes do disparo | E06 e A01; pressão de curto alcance |
| **A08 · Arco de Horizonte** | ativo · **Inteligência** / Destreza | Feixe linear 130% ataque mágico até 8 m após preparo 0,45 s; CD 16 s | Traça horizonte no ar, abre faixa reta de luz com ondas | A04; movimentação lateral |
| **A09 · Véu de Retirada** | reativo · **Vitalidade** / Destreza | Primeira vez abaixo de 35% HP recua 2 m e ganha 12% velocidade por 3 s; uma vez por duelo | Manto se fragmenta em poeira cósmica e dois passos de estrela | R09; reaproximação rápida |
| **A10 · Supernova Silenciosa** | ativo · **Inteligência** / Vitalidade | Pulso 135% ataque mágico em raio 2,5 m e escudo 10 por 3 s, prepara 0,6 s; CD 30 s | Esfera emerge do peito e estoura em halo estrelado que se recompõe | A02; atacantes distantes |

## Exemplos de builds híbridas e contrajogo

- **Canhão elemental** E01 + E02 + E03 + E04 + E10: dano e controle, vulnerável à movimentação e ao anti-magia.
- **Mago de barreiras** R01 + R04 + R06 + R07 + R09: proteção com desgaste, vulnerável à destruição de escudos.
- **Astral evasivo** A01 + A02 + A03 + A05 + A07: mobilidade e cadência, vulnerável ao bloqueio de rotas.
- **Controlador misto** E03 + R03 + A02 + A04 + A08: troca dano bruto por posicionamento e tempo.

## Implementação visual e testes necessários

Os clipes atuais do modelo **KayKit Mage.glb** são animações-base, não 30 animações específicas já existentes. Criar trinta assinaturas funcionais únicas combinando gesto de conjuração, alteração de pose do esqueleto, tempo de preparação e VFX dedicado, com evento de impacto sincronizado com o simulador. Passivos têm visual exclusivo quando ativam; reativos representam uma resposta causal. Garantir modo reduzido de movimento e desempenho mobile.

Validar 1.000+ sementes por confronto de builds representativas e trocar ordem de iniciativa. Medir vitória, duração, frequência de cada efeito, dano, cura, escudos, combos invencíveis e habilidades nunca acionadas. **Ainda não foram realizados esses testes**. Integração exige migração coordenada de front, motor, API e persistência; não modificar main ou progressão da V3.
