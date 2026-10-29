# V5 — Balanceamento do torneio de 30 alunos (29/10/2026)

**Estado:** protótipo experimental V5; NÃO foi publicado em main e NÃO implementa os 120 talentos finais. Esta etapa prioriza deixar jogável e defensável o teste com aproximadamente 30 alunos das missões 5 e 10. Não confundir o equilíbrio do motor legado com validação das builds finais da Oficina.

## O que foi diagnosticado e corrigido
- **Dados anteriores:** o modo de 4 heróis frequentemente terminava com Arcanista vencedor; havia projéteis teleguiados (trajetória reajustada em todos os frames), acumuladores ilimitados de escudo mágico e um campo demasiado espaçado para quatro jogadores.
- **Projéteis:** tiro agora registra velocidade e direção no lançamento com pequena previsão de movimento. Segue trajetória constante, verifica interseção com pilar e proximidade com alvo. O adversário pode sair do caminho — movimento é defesa real, não só aparência.
- **Mago:** escudos do talento legado `ward` respeitam limite global de **30% da vida máxima**, evitando proteção cumulativa sem teto.
- **Corpo a corpo:** a tela de 4 heróis mantém o coliseu visual grande, mas os spawns iniciais ficam mais próximos para permitir confrontos. Sem alterar XP nem dar buffs invisíveis ao Guerreiro.
- **Tempestade:** na batalha de 4 heróis, a zona segura precisa continuar fechando até haver eliminação, em vez de congelar num círculo enorme e escolher vencedor por timeout sem combate.
- **Atributos extremados:** para este motor legado, atributos ofensivos acima de 12 pontos investidos possuem retornos decrescentes (45% do ganho marginal); Vitalidade conserva ganho normal para não inutilizar builds defensivas. A futura Forja V5 poderá aplicar diretamente o limite de 12 pontos por atributo previsto no plano.
- **Escudo do Guardião:** um bônus tentado para toda investida provocou domínio excessivo (31/72 vitórias); a tentativa foi **revertida**. Seu escudo permanece associado à habilidade Fortaleza.
- **Reprodutibilidade:** cada rodada da UI tem uma semente distinta exibida; os benchmarks de CI usam sementes fixas. Nenhuma regra força uma classe ou jogador a ganhar.

## Evidência: 72 partidas de 30 heróis

Resultado com trajetória fixa, teto de escudo, semente reproduzível e retornos decrescentes:
| Classe | Vitórias em 72 | Percentual |
|---|---:|---:|
| Guerreiro | 23 | 31,9% |
| Guardião | 23 | 31,9% |
| Caçador | 16 | 22,2% |
| Arcanista | 10 | 13,9% |

Os percentuais **não devem ser entendidos como taxas universais**: dependem de 30 bots fictícios, seleção das quatro classes, builds limitadas e sementes testadas. Não há tolerância de ±5% nem meta de 25% igual para cada estilo: counters e especializações são desejáveis.

## Matriz de estilos da missão 10 (30 pessoas)

| Cenário | Guerreiro | Arcanista | Caçador | Guardião | Total |
|---|---:|---:|---:|---:|---:|
| Builds ofensivas | 17 | 3 | 9 | 3 | 32 |
| Builds híbridas | 13 | 18 | 9 | 8 | 48 |
| Builds alternativas | 10 | 13 | 2 | 7 | 32 |

As três condições correspondentes da missão 5 também foram avaliadas. **Novo gate CI:** nenhuma classe com mais de 55% das vitórias em qualquer uma das seis matrizes de 30 e todas as quatro com pelo menos duas vitórias em cada matriz. Além disso, o teste de 72 partidas mantém limite estrito de dominância e exige vários vencedores diferentes.

## Limitações que NÃO devem ser ocultadas
- **Modo de quatro heróis ainda não equilibrado para disputa oficial.** Na última referência da M10, o Arcanista ganhou 30 das 48 partidas. O teste 4 heróis serve apenas para observar a câmera, colisões, ataques e movimentos em detalhe. O formato oficial de torneio deve ser testado com 30.
- Os **120 talentos individuais**, os cinco atributos finais, animações exclusivas, API de respec e bloqueio definitivo da missão 10 ainda não foram integrados. O combate exibido na demo usa habilidades de classe e talentos legados, não as 30 habilidades planejadas de cada classe.
- A física continua sendo determinística e própria; **não foi migrada para Rapier**. Não anunciar física profissional, balanceamento matematicamente comprovado ou competição pronta para alunos.
- Os resultados de 30 jogadores **não** certificam confronto 1×1 nem os 120 talentos futuros. O melhor plano é conectar motor dos talentos da M5, executar novamente matriz e avaliar com alunos em condição controlada antes da M10.

## Decisão operacional
O torneio de 30 pode avançar à próxima fase de desenvolvimento de talentos **na branch**. Não promover para main sem validação do professor e teste completo das escolhas reais dos alunos. Se a turma for disputar duelos 1×1 ou um mata-mata de 4 jogadores, primeiro balancear o metajogo específico, não copiar taxas da arena de 30.
