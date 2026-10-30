> **DECISÃO DEFINITIVA DOS PERSONAGENS (29/10/2026):** Aplicados quatro GLBs animados diferentes do pacote oficial **KayKit Adventurers 1.0 CC0** — Guerreiro Bárbaro, Arcanista Mago, Caçador Ladino Encapuzado, Guardião Cavaleiro. Todos com 2,55 unidades visuais e 76 animações incorporadas por GLB; nenhum rig repetido nem equipamento sobreposto. Os documentos anteriores que falam em 40 avatares ou repetir Espadachim foram SUPERADOS. Consultar `v5/KAYKIT-QUATRO-PERSONAGENS.md` para commits e testes. 

> **REVISÃO DE PERSONAGENS (29/10/2026):** O usuário rejeitou os 40 personagens modulares devido à sobreposição visual e escolheu quatro modelos de uma única fonte CC0, Tactical Slash: espadachim para Guerreiro/Guardião, sacerdote para Arcanista e o arqueiro original para Caçador. A prévia do Arsenal dos quatro heróis substitui o catálogo de 40. Altura visual normalizada a 2,55 e sete animações por GLB, validadas em desktop e mobile. **A correção prevalece sobre os checkpoints anteriores de 40 opções.** A arena, talentos e mecânicas continuam preservados; F/G/H/I pendentes.

# PIT Game Jam IA V5 — Roadmap de conclusão: Coliseu → câmera → integração

**Status em 30/10/2026:** Fase D aprovada visualmente; Fase E recebeu balanceamento HP2, sprites E.6 e correção E.7 de fim de partida (validação física de GPU/PC continua na G). **F.1 implementada e testada**: diretor automático opt-in de professor no laboratório, planos de duelo/geral/clímax/vencedor e retomada manual. F.2/F.3, G, H e I pendentes. Sem alterações na `main`.
**Branch de trabalho:** `feature/v5-arena-dos-criadores`. **Não fazer merge na `main`** antes da aprovação final.
**Contexto pronto:** motor experimental de 120 talentos (B.6), efeitos (C.1), coreografias (C.2), identidade visual das builds (C.3).

## Ordem aprovada

### D — Coliseu: estética, escala e legibilidade
- Arquitetura gótica acabada, arena grande para 30 participantes, arquibancadas e setores de plateia para os eliminados.
- Cenários/GLBs CC0 com acabamento consistente; materiais, iluminação, atmosfera, efeitos, interface e indicadores de alcance, dano, vida e cooldown.
- Prioridade à compreensão do combate no telão: silhuetas, nomes, efeitos e cores distintos, sem poluição visual.
- Testar desktop e mobile, inclusive WebGL de qualidade reduzida.
- **Critério de saída:** espetáculo visual coeso, 30 personagens e espectadores legíveis, sem quedas graves de desempenho.

**Direção adicional aprovada em 29/10/2026 — Fase D:**
- A aparência anterior foi rejeitada: simples, excessivamente geométrica e com pouco senso de escala. Priorizar arcos góticos GLB licenciados, pórticos, ruínas, arquibancadas e materiais elaborados, não apenas ampliar um plano.
- Aumentar o campo de teste ao máximo já suportado pelo motor (escala 5) antes de mexer nos limites de física. O campo atual é quadrado, visualmente com largura aproximada de 190 unidades (99 × 5 / 2,6), e deve ser avaliado como um Coliseu de grande escala.
- Marcar visualmente zonas amplas de duelo distribuídas; são **referências artísticas**, não colisores nem chaves obrigatórias.
- **Não afirmar que um piso maior garante duelos 1×1.** Essa proteção dependerá de spawn, aggro, seleção de alvo e algoritmo de confronto na Fase E.
- Manter até 30 simultâneos na arena principal; não reduzir o formato sem aprovação.
- Primeiro incremento implementado: `arena-citadel.js` (cortes visuais de duelo e nova versão do mapa), `arena-three.js` (KayKit Dungeon CC0 + Tactical Slash), `arena-lab.js` (escala 5), `qa/v5-coliseum-scale.cjs`. Os resultados visuais e a estabilidade permanecem sujeitos ao QA do navegador e à aprovação do usuário.

### E — Mecânicas, física, IA e balanceamento
- Testar e corrigir colisões, obstáculos, zonas seguras, movimento, esquiva, projéteis, alcance e sincronia entre efeitos e danos reais.
- Simulações reproduzíveis com várias seeds, classes, talentos e builds mistas; identificar combinações dominantes sem enfraquecer arbitrariamente uma classe.
- Rever prioridades de IA, contra-ataques, tempo de combate, cancelamento de habilidades e clareza de resultados.
- Testar distribuição espacial de 30 personagens e **confrontos preferencialmente 1×1**: pares de proximidade com bloqueios temporários de aggro, reação quando há terceiro atacante, recuo/esquiva e cooldown para reacquisição. Evitar forçar exclusividade total (habilidades de área e encontros casuais continuam fazendo parte do RPG). Não escolher vencedor por regra artificial.
- Combate maior deve ter **tempo para movimentação, perseguição e tática**. Rever abertura do círculo, ritmo da tempestade e tempo limite somente após simulações. A arena grande não pode virar corrida sem contato nem ser comprimida cedo demais.
- **Critério de saída:** partidas justas, previsíveis sob a mesma seed, compreensíveis e estáveis em 4 e 30 personagens. Não alterar resultados de combates para melhorar a filmagem.

**Checkpoint inicial E — ver `v5/FASE-E-CHECKPOINT.md`:** 
- Com 50% de dano e tempestade mais branda, mediu-se média de **71,4s e 175 eventos de talento** em 30 jogadores (6 seeds) contra **48,6s e 112 eventos** no padrão (amostra pequena).
- A seleção opt-in `spaced` reduziu quadros com 3+ pessoas visando o mesmo herói de **15,8% para 3,0%** em 30 participantes (10 seeds), mas não corrigiu a ausência de vitórias de Guerreiro e Guardião.
- Manter o motor livre intacto por padrão. Continuar medindo classes, builds e tempo de aproximação; não declarar equilíbrio com métricas parciais.

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

**F.1 e F.2 implementadas e testadas (30/10/2026):** `v5/camera-director.js` define os planos de câmera a partir de eventos reais do motor, com histerese, cobertura equitativa, visão geral, duelos, clímax e vencedor. `v5/arena-three.js` interpola os planos sem alterar a simulação; o professor pode arrastar/manipular manualmente ou retomar o automático pelo botão. Testes Node (4/30, mesmos vencedores) e Playwright com 4/30 GLBs aprovados no [run 40990012882](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40990012882). **Não declarar a F concluída**: faltam enquadramento/visibilidade e câmera compartilhada professor/aluno; ver `v5/FASE-F-CHECKPOINT.md`.

**Critério de saída da F:** teste real com 30 combatentes, replays sob seeds fixas, múltiplos destaques sem favorecimento, clímax e controles manuais. Câmera não pode alterar os resultados da simulação.

**Complemento aprovado — câmeras por participante (após D/E):**
- Professor: diretor cinematográfico global e controle manual opcionais.
- Aluno enquanto vivo: câmera local de terceira pessoa acompanha somente seu personagem; o combate é uma única simulação autoritativa.
- Ao morrer: personagem vai para arquibancada, a visão local faz transição para a **mesma câmera global** compartilhada pelo professor e demais eliminados; não são diretores independentes.
- Testar a troca no laboratório antes de integrar turmas reais; replicação autenticada/tempo lógico ficam na Fase H.

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


### Complemento visual aprovado para a V5 (subfase D de personagens)
- Após pedido do usuário, criados **40 personagens 3D modulares grátis**: dez visuais por classe, quatro malhas de roupas CC0 Quaternius como base, armas/capacetes/armaduras 3D diferentes. Detalhes em `v5/PERSONAGENS-GRATUITOS-40-PLANO.md`.
- Demo isolada de escolha exclusiva: `v5/personagens-lab.html`; modo opcional `?avatars=1&count=4` no Coliseu. **Ainda não é seleção persistida entre dispositivos nem sincronização de alunos reais.**
- Não confundir **40 aparências** com **40 rigs originalmente esculpidos** ou 40 animações exclusivas.
- **Fase E** balanceamento segue não homologada; **F** direção de câmera automática, **G** FPS/QA mobile 30 pessoas, **H** integração real e reservas atômicas, **I** merge para `main` mediante autorização continuam pendentes.


**F.2 homologada no laboratório:** compositor `v5/camera-framing.js` escolhe 12 ângulos, considera pilares reais e projeta área de ataque real (`prepare`/`talent-impact`), enquadra tela estreita, suaviza transições e faz órbita sutil na vitória; movimento reduzido suprime a órbita. Full browser com 4/30 GLBs, 30 personagens até vencedor e controles manuais **PASS** no [GitHub Actions 40991606686](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40991606686). F.3, G/H/I ainda pendentes; nenhum merge em `main`.
