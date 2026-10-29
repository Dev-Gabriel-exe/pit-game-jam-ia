# PIT Game Jam IA V5 — Roadmap de conclusão: Coliseu → câmera → integração

**Status:** planejamento validado; nenhuma fase abaixo é considerada concluída por estar descrita aqui.
**Branch de trabalho:** `feature/v5-arena-dos-criadores`. **Não fazer merge na `main`** antes da aprovação final.
**Contexto pronto:** motor experimental de 120 talentos (B.6), efeitos (C.1), coreografias (C.2), identidade visual das builds (C.3).

## Ordem aprovada

### D — Coliseu: estética, escala e legibilidade
- Arquitetura gótica acabada, arena grande para 30 participantes, arquibancadas e setores de plateia para os eliminados.
- Cenários/GLBs CC0 com acabamento consistente; materiais, iluminação, atmosfera, efeitos, interface e indicadores de alcance, dano, vida e cooldown.
- Prioridade à compreensão do combate no telão: silhuetas, nomes, efeitos e cores distintos, sem poluição visual.
- Testar desktop e mobile, inclusive WebGL de qualidade reduzida.
- **Critério de saída:** espetáculo visual coeso, 30 personagens e espectadores legíveis, sem quedas graves de desempenho.

### E — Mecânicas, física, IA e balanceamento
- Testar e corrigir colisões, obstáculos, zonas seguras, movimento, esquiva, projéteis, alcance e sincronia entre efeitos e danos reais.
- Simulações reproduzíveis com várias seeds, classes, talentos e builds mistas; identificar combinações dominantes sem enfraquecer arbitrariamente uma classe.
- Rever prioridades de IA, contra-ataques, tempo de combate, cancelamento de habilidades e clareza de resultados.
- **Critério de saída:** partidas justas, previsíveis sob a mesma seed, compreensíveis e estáveis em 4 e 30 personagens. Não alterar resultados de combates para melhorar a filmagem.

### F — Direção de câmera cinematográfica automática (NOVA FASE)
**Objetivo:** permitir ao professor apresentar o torneio sem precisar manipular a câmera por gestos.

**Modos**
1. **Diretor automático (opcional):** segue confrontos relevantes sozinho usando os eventos *já calculados* pelo motor; sem modificar posição, colisão, alvo, dano, cooldowns ou vencedor.
2. **Visão geral:** enquadra todos os sobreviventes e preserva a escala do Coliseu.
3. **Duelo:** enquadra dois lutadores, com espaço à frente para projetar ataques e suas áreas de efeito.
4. **Destaques:** enquadra ultimates/ataques preparados, momentos de quase eliminação, evasões marcantes e eliminações reais; só mostra um destaque se houver visibilidade.
5. **Clímax:** quando restarem poucos combatentes, muda gradualmente para planos próximos; no vencedor, faz encerramento cinematográfico breve.
6. **Manual e retornar ao automático:** OrbitControls e seleção explícita de jogador sempre têm prioridade. A câmera automática não deve roubar o controle até o professor reativá-la.

**Critérios do diretor**
- **Histerese:** impedir cortes excessivos; manter um plano por duração mínima e aplicar transições suaves (movimento, altura, zoom, alvo) com amortecimento, sem teletransporte.
- **Justiça de tempo de tela:** histórico por participante e redução de prioridade dos já exibidos. Nunca selecionar apenas o maior dano ou sempre a mesma classe. Incluir alvos, evasores, atacantes, estreantes e participantes pouco exibidos.
- **Ordem de prioridade contextual:** eliminação/últimos jogadores > habilidade especial visível > duelo relevante > diversidade de cobertura > visão geral periódica. Não focar em mortos, salvo transição curta explícita até a arquibancada.
- **Segurança visual:** respeitar `prefers-reduced-motion`, limitar velocidade/aceleração, evitar atravessar paredes ou ficar atrás de colunas, cuidar da tela pequena e do telão.
- **Controle do professor:** indicador claro **Automática / Geral / Manual**, botão de retorno ao automático, pausa do diretor sem pausar o combate, opção de seguir um aluno específico.
- **Estado inicial:** por padrão, a abertura do combate pode usar visão geral e avançar automaticamente conforme a opção do professor; manter configuração demonstrativa isolada de turmas reais.

**Situação atual (antes da F):** `v5/arena-lab.js` já possui um botão experimental "Câmera de combate", que segue periodicamente um personagem em destaque (`spotlight`, intervalo aproximado de 7 s), e `v5/arena-three.js` permite `focusFighter` / `overview`. **Isso ainda não é o diretor cinematográfico descrito acima.** Não declarar a F concluída por causa dessas rotinas existentes.

**Critério de saída da F:** teste real com 30 combatentes, replays sob seeds fixas, múltiplos destaques sem favorecimento, clímax e controles manuais. Câmera não pode alterar os resultados da simulação.

### G — QA final e aprovação da arena
- Testes de regressão no motor e no navegador: 4/30 personagens, mobile/desktop, GLB, câmera, pausa, reinício e arquibancadas.
- Testes de carga e desempenho GPU/CPU; degradação elegante de efeitos em dispositivos mais fracos; testar falhas de GLB/rede.
- Preparar demonstração de revisão do professor **antes** de conectar usuários reais.

### H — Integração pedagógica / segurança e progressão
- Somente depois da arena, mecânica e câmera aprovadas, conectar aluno/professor e progresso real.
- Cada missão aprovada disponibiliza **1 talento + 2 pontos de atributo** para o personagem; a escolha permanece livre entre as árvores da própria classe.
- Redistribuição permitida **até a primeira entrada na arena da missão 5**. Reavaliar a progressão depois e travar a build definitivamente antes da arena da missão 10, conforme regras pedagógicas já acordadas.
- Uma só base técnica de combate para missões **5 e 10**, com snapshots/limites diferentes; validar que M10 **não** use o motor legado sem autorização.
- Persistência e locks no servidor, autorização docente e validação de integridade. XP e aprovações nunca são confiados ao navegador.
- Não mexer no conteúdo, na ordem ou no XP das dez missões da V3 até concluir testes de integração.

### I — Revisão, homologação e merge para `main`
- QA ponta a ponta professor/aluno, aprovação explícita da versão final e merge controlado.
- Rollback e monitoramento planejados; nenhuma publicação em produção automática antes dessa fase.

## Organização
A ordem de trabalho é **D → E → F → G → H → I**. Se for detectado problema de física durante a F, corrigir na E e validar de novo; se houver falha visual, retornar à D. Não antecipar integração para contornar problemas de arena.

## Referências atuais
- Motor: `v5/phase2-combat.js`.
- Arena/Three.js: `v5/arena-three.js`, `v5/arena-citadel.js`.
- Protótipo da câmera existente: `v5/arena-lab.js`, `focusFighter`, `overview`.
- Talentos e identidades: `v5/talent-vfx.js`, `v5/talent-choreography.js`, `v5/build-identity.js`.
