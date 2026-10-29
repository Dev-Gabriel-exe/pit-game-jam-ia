# V5 — Auditoria ampliada de balanceamento (29/10/2026)

**Escopo:** arena 3D isolada, quatro classes Guerreiro / Arcanista / Caçador / Guardião, turma de aproximadamente 30 participantes. Sem integração com XP dos alunos, sem alterações na `main`. A simulação ainda é o motor V5 legado de especiais de classe, **não** os 120 talentos novos.

## Defeito reproduzido e mudança

Os 72 combates originais baseados em um único conjunto de atributos passavam, mas um novo benchmark com builds de ataque revelou desequilíbrios sérios:
- Antes da correção, 32 simulações ofensivas da missão 10 tiveram **24 vitórias do Caçador (75%)**, 6 do Arcanista, 1 do Guerreiro e 1 do Guardião.
- Num conjunto alternativo, o Arcanista chegou a 39/48 vitórias na missão 10. A conclusão é que balancear uma única build "padrão" mascara comportamentos dominantes quando alunos escolhem outros atributos.
- Um teste detectou ainda uma rara partida sem vencedor: todos morreram na tempestade no mesmo fim de rodada.

## Alterações mecânicas

1. **Caçador:** pontuação de Força acima da faixa moderada não garante ataque desproporcional; redução da conversão de Força em dano e compensação parcial por Agilidade. Arco requer intervalo de mira/comprometimento no movimento e rajadas atingem alvos distintos com dano reduzido.
2. **Arcanista:** escala por Espírito mais comedida (sem multiplicação duplicada), intervalo entre projéteis e pequena canalização na preparação do especial. Poder ofensivo ainda cresce com Espírito, mas precisa escolher entre dano, mobilidade e resistência.
3. **Guerreiro:** investida e escudo de aproximação, ataque corpo a corpo mais efetivo; Golpe Sísmico só é acionado dentro do alcance de seu dano em área, para não consumir a habilidade fora de alcance.
4. **Guardião:** Vitalidade passa a influenciar levemente o dano, além de vida/defesa. Fortaleza tem escudo limitado, dano em área e lentidão breve aos oponentes próximos.
5. **Todos:** projéteis colidem com pilares; movimentação tem inércia, deslocamento lateral e separação de corpos; ações em ordem rotativa e seed variada por partida; mesma seed continua reprodutível para testes.
6. **Empate técnico:** se todos forem eliminados na tempestade, vence o último combatente eliminado, com desempate por KOs e dano, nunca uma classe escolhida aleatoriamente.
7. **Leitura da arena:** anel da tempestade aparece no piso, ligado ao raio real do motor. Na demonstração com quatro heróis, a área segura converge mais cedo; com 30 heróis, preserva o campo gigante.

## Evidência de balanceamento (testes automatizados)

### Benchmark histórico de 72 partidas, 30 personagens

| Classe | Vitórias |
|---|---:|
| Guerreiro | 22 |
| Guardião | 21 |
| Caçador | 17 |
| Arcanista | 12 |

Todas as 4 classes venceram partidas. Nenhuma passou de 42% nessa bateria. Os números não devem ser tratados como probabilidades universais.

### Matriz adicional com diferentes builds e posições iniciais (30 heróis)

| Cenário | Missão | Guerreiro | Arcanista | Caçador | Guardião |
|---|---|---:|---:|---:|---:|
| Arquétipos ofensivos (32 sementes) | M5 | 10 | 8 | 11 | 3 |
| Arquétipos ofensivos (32 sementes) | M10 | 12 | 8 | 10 | 2 |
| Builds híbridas e rotação (48 sementes) | M5 | 15 | 15 | 9 | 9 |
| Builds híbridas e rotação (48 sementes) | M10 | 9 | 27 | 5 | 7 |
| Builds alternativas (32 sementes) | M5 | 7 | 7 | 11 | 7 |
| Builds alternativas (32 sementes) | M10 | 6 | 19 | 3 | 4 |

As 224 partidas adicionais testam cenários diferentes do benchmark de 72, inclusive 5 talentos legados no marco 10 e 2 no marco 5 quando validados pelo motor antigo. **Atenção:** M10 com builds híbridas ainda favorece o Arcanista (27/48 = 56,25%). Isso é um viés residual, não "equilíbrio perfeito". O gate automatizado bloqueia qualquer classe com mais de 60% de vitórias nos cenários de 30.

### Demonstração com 4 personagens (96 partidas, diagnóstica)

| Missão | Guerreiro | Arcanista | Caçador | Guardião |
|---|---:|---:|---:|---:|
| M5 (48) | 3 | 29 | 15 | 1 |
| M10 (48) | 4 | 32 | 11 | 1 |

**Limitação conhecida:** o modo opcional de quatro personagens ainda favorece Arcanista; não o considerar competitivo nem usar para inferir o equilíbrio do modo turma de 30. O teste permanece executado e produz *warning* específico. O gate de aprovação bloqueia desequilíbrios no modo que representa a turma real. Não reduzir artificialmente o poder de um herói em função da quantidade de colegas apenas para aumentar a igualdade do placar.

## Conjunto de regressão

- `qa/v5-arena-physics-fairness.cjs` — 72 partidas + determinismo de seed, integridade de eventos de dano e eliminação.
- `qa/v5-arena-balance-matrix.cjs` — 320 partidas adicionais entre M5/M10, 30/4 heróis, builds variadas, ordem de spawn alterada. Limite máximo de 60% no modo 30; alertas para o modo 4.
- `qa/v5-arena-lab-browser.cjs` — carregamento de GLBs e comportamento de UI em desktop e celular, arquibancada, animações, controles.

**Total por execução:** 392 partidas simuladas em Node.js, além dos testes de navegador.

## Decisões pendentes

- Integrar os 120 talentos realmente executáveis, com atributos e animações por habilidade; atualmente apenas atributos e talentos do motor anterior influenciam o resultado.
- Investigar melhor o modo 4: uma arena de batalha com composição de quatro classes funciona estrategicamente de maneira diferente do free-for-all de 30.
- Medir qualidade de animação, legibilidade e taxa de quadros em aparelhos reais, especialmente celulares.
- Reavaliar critérios com número variável de participantes, dados reais autorizados e distribuição de classes diferente. Não ajustar chances de vitória artificialmente por classe ou por nome de jogador.
