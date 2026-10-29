# PIT Game Jam IA V5 — Plano mestre de 120 talentos, duas arenas e escolhas livres

**Estado: planejamento da Fase 2, sem publicação no jogo ou migração de alunos.** Branch: `feature/v5-arena-dos-criadores`, sem alterar `main`. Esta especificação prevalece sobre qualquer regra anterior de travar a build na primeira arena.

## Decisões aprovadas

**Quatro classes, 30 talentos cada, 120 no total.** Cada classe apresenta três caminhos organizacionais, com dez talentos cada; o aluno **pode escolher qualquer combinação de caminhos**. Não há especialização obrigatória nem bônus por escolher uma única trilha. Cada talento tem efeito, atributos principal/secundário, uma assinatura de animação única prevista e contrajogadas.

| Classe | Caminho 1 | Caminho 2 | Caminho 3 | Documento |
|---|---|---|---|---|
| Guerreiro | Brutalidade | Duelista | Bastião | [30 talentos do Guerreiro](FASE2-GUERREIRO-30-TALENTOS.md) |
| Arcanista | Elemental | Rúnico | Astral | [30 talentos do Arcanista](FASE2-ARCANISTA-30-TALENTOS.md) |
| Caçador | Pontaria | Emboscada e armadilhas | Sobrevivência | [30 talentos do Caçador](FASE2-CACADOR-30-TALENTOS.md) |
| Guardião (perfil paladino) | Égide | Luz sagrada | Julgamento | [30 talentos do Guardião](FASE2-GUARDIAO-30-TALENTOS.md) |

### Recompensas por missão **aprovada**
- **100 XP pedagógicos + 2 pontos investíveis + direito de escolher um talento por missão**, até dez missões, 1.000 XP, 20 pontos e dez talentos distintos. Pontos não gastos ficam disponíveis. Talentos não têm ranks adicionais, cada um ocupa exatamente uma escolha.
- XP bônus de avaliações, ranking, likes ou resultados da arena **não adiciona atributos ou talentos**. Nunca converter XP de 1.030 em 11 talentos. Recursos de RPG derivam do contador de missões aprovadas, validado no servidor.
- Cinco atributos: **Força, Destreza, Inteligência, Vitalidade, Defesa**. Cada classe tem atributos-base próprios, separados dos pontos investidos; limite de **12 pontos investidos em cada atributo**, evitando maximizar apenas um.

## A missão 5 e a missão 10 são dois momentos diferentes

| Momento | Missões aprovadas | Pontos de atributos | Talentos escolhidos | Tipo de arena | Pode redistribuir? |
|---|---:|---:|---:|---|---|
| Missão 5 | 5 | 10 | 5 | **Arena de teste** | **Sim**, antes e depois |
| Missão 10 | 10 | 20 | 10 | **Arena final** | **Sim, até confirmar a primeira entrada na final** |
| Depois de entrar na final | 10 | 20 | 10 | Build oficialmente fixada | **Não**, travada no servidor |

### Fluxo esperado, sem reescrever as missões pedagógicas existentes

1. **Missões 1–4**: professor aprova missão; aluno ganha 2 pontos + 1 talento por aprovação e monta build livremente. Pode trocar tudo sem custo.
2. **Missão 5**: recebe a quinta recompensa e escolhe até 5 talentos. Entra na arena de TESTE, luta contra colegas ou bots conforme disponibilidade, assiste aos 3D, lê relatório de dano, defesa, escudos, cura e talentos que nunca ativaram. A arena não dá XP, não altera nota e **não bloqueia a build**.
3. **Após o teste (entre missões 5 e 10)**: volta à Forja; troca atributos e talentos quantas vezes desejar. Os talentos podem vir de caminhos mistos. Pode refazer treinos para comparar, mas não altera o registro histórico do teste.
4. **Missões 6–9**: recebe +2 atributos e +1 talento por missão aprovada, com redistribuição ainda liberada. O histórico do teste permanece consultável, mostrando a build usada na missão 5.
5. **Missão 10**: recebe a décima recompensa e completa até 10 talentos/20 pontos. A tela apresenta a **Confirmação da Build Final**: atributos, talentos, efeitos esperados e aviso de que o bloqueio é irreversível para esta campanha. **Somente ao confirmar entrada na arena FINAL** a build é gravada e bloqueada atomicamente no servidor.
6. **Após confirmar a final**: configurações de aparência cosmética ainda podem ser permitidas, mas atributos/talentos não mudam. Professor pode reiniciar a campanha apenas mediante fluxo administrativo auditável, não como atalho de aluno.

**Importante:** essa especificação não altera as tarefas das dez missões já existentes nem as regras de aprovação. A arena de teste e a final são pontos de gamificação vinculados à progressão pedagógica.

## Regras de estratégia e diversidade

- Trilhas misturáveis sem pré-requisitos de árvore, sem exigir 3, 5 ou 10 talentos da mesma trilha. **Não há penalidade por mesclar caminhos.** A consequência vem da falta de sinergia com os atributos e da oportunidade de usar os efeitos, não de uma punição artificial.
- Eficácia-base proposta: `min(1.20, 0.75 + 0.025×investimentoPrimário + 0.0125×investimentoSecundário)`. Um talento mal alinhado vale no mínimo 75% do efeito, não zero. As fórmulas especiais de escudo já escaladas explicitamente **não** recebem multiplicador adicional.
- Ataque físico, mágico e sagrado precisam de normalização para comparabilidade. Força favorece físico, Inteligência favorece mágico/sagrado, Destreza favorece cadência/movimento, Vitalidade favorece HP e Defesa favorece redução/escudos; efeitos explícitos de dano usam a base da fonte específica, nunca somas ocultas.
- É uma arena **auto-battler**: ativos entram na fila de decisão contextual (ataque, fuga, defesa, curar). Um intervalo global de 0,7 s evita dez habilidades no mesmo frame; passivos e reativos entram por eventos específicos. Passivos não devem falsamente disparar animação ofensiva.
- Um aluno pode escolher dez ativos, dez passivos, ou mistura, desde que sejam distintos e caibam no orçamento. O engine resolve cada opção, sem vagas ocultas limitadas por trilha.
- No modo experimental, permitir comparação lado a lado de build da missão 5 × build da missão 10, com projeção de atributos, talentos e recursos, sem ranking que incentive forjar resultados.

## Limites de balanceamento propostos

- **Escudos acumulados:** até 30% do HP máximo.
- **Cura:** limite por janela de tempo (proposta de 10% do HP por 15 segundos para talentos de cura; talentos com autorrecuperação específicos também respeitam cap). O limite precisa ser reavaliado em testes e aplicado igualmente às classes, para impedir lutas infinitas.
- **Efeitos de lentidão, ataque reduzido e defesas do mesmo tipo:** aplica maior valor, sem multiplicação indefinida.
- **Dano refletido e ecos:** não acionam outra reação, reflexão, lifesteal ou eco; um impacto não cria loop.
- **Armadilhas:** existência física/temporal no mapa, colisão de proximidade, limite de duas ativas por Caçador, sem dano fora de alcance.
- **Seleção automática de alvos:** critérios determinísticos e auditáveis; trocar posição inicial e iniciativa em testes de balanceamento.
- **Critério de aceite, não teste já aprovado:** 1.000+ simulações por conjunto representativo de builds e matchup, taxas de vitória próximas de 50% para espelhos idênticos e sem build genérica dominando sistematicamente todos os adversários. Contadores de talentos nunca disparados, DPS, cura, tempo de luta e vitórias por timeout obrigatórios.

## Animações: 120 compromissos visuais, 0 promessas de clipes prontos

Cada talento tem ID de animação distinto e storyboard próprio nos arquivos JSON. **Os modelos KayKit e o arqueiro existente têm clipes de locomoção/combate de base, mas não 120 movimentos específicos prontos**. A Fase 3 deverá produzir composição original por talento, combinando gestos/keyframes personalizados, VFX autorais, sincronização com eventos de combate, efeitos sonoros opcionais e adaptação móvel. Não vale reaproveitar um único efeito com troca de cor como se fosse animação diferente.

## Especificação implementável e segurança

**Arquivos de dados de planejamento:** `fase2-progression-plan.json`, `talents-warrior-plan.json`, `talents-mage-plan.json`, `talents-hunter-plan.json`, `talents-guardian-plan.json`. São **catálogos versionados de planejamento**, não consumidos pelo jogo hoje.

O protótipo anterior usa 4 atributos, 6 talentos por classe com ranks, inicia com 6 pontos e calcula orçamento a partir do XP total. Para adotar a Fase 2: atualizar *junto* UI, core, servidor de arena e camada de persistência; versionar builds; ler orçamento apenas da quantidade de missões aprovadas; validar 10 IDs distintos e atributos investidos, fechar APIs de respec depois da primeira entrada FINAL.

Estrutura de dados sugerida do servidor: `hero_build_drafts`, `arena_trial_snapshot` (missão 5, sem lock) e `arena_final_lock` (missão 10, registro imutável). Criar operação transacional idempotente `enterFinalArena` que valida as dez missões, salva snapshot e marca lock juntos. Repetir operação não pode alterar build, contagem ou notas. **Nunca confiar apenas em botão disabled no navegador.**

## Critérios de pronto para disponibilizar aos alunos

- [ ] 120 talentos concretamente executados na arena; 120 assinaturas de animação únicas exibidas em 3D.
- [ ] Missão 5 permite cinco talentos e respec posterior; missão 10 permite dez até confirmação e depois impede respec pelo backend.
- [ ] Builds híbridas e especializadas usam mesma quantidade de pontos, sem penalidade artificial de trilha.
- [ ] Progressão por missão aprovada, não por XP bônus; sem efeito sobre notas ou aprovação pedagógica.
- [ ] Testes de equilíbrio, desempenho mobile, redução de movimento, segurança do servidor, validação de UI e regressão V3.
