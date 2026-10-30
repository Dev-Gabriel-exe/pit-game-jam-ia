> **DECISÃO DEFINITIVA DOS PERSONAGENS (29/10/2026):** Aplicados quatro GLBs animados diferentes do pacote oficial **KayKit Adventurers 1.0 CC0** — Guerreiro Bárbaro, Arcanista Mago, Caçador Ladino Encapuzado, Guardião Cavaleiro. Todos com 2,55 unidades visuais e 76 animações incorporadas por GLB; nenhum rig repetido nem equipamento sobreposto. Os documentos anteriores que falam em 40 avatares ou repetir Espadachim foram SUPERADOS. Consultar `v5/KAYKIT-QUATRO-PERSONAGENS.md` para commits e testes. 

> **REVISÃO DE PERSONAGENS (29/10/2026):** O usuário rejeitou os 40 personagens modulares devido à sobreposição visual e escolheu quatro modelos de uma única fonte CC0, Tactical Slash: espadachim para Guerreiro/Guardião, sacerdote para Arcanista e o arqueiro original para Caçador. A prévia do Arsenal dos quatro heróis substitui o catálogo de 40. Altura visual normalizada a 2,55 e sete animações por GLB, validadas em desktop e mobile. **A correção prevalece sobre os checkpoints anteriores de 40 opções.** A arena, talentos e mecânicas continuam preservados; F/G/H/I pendentes.

# PIT Game Jam IA V5 — Roadmap de conclusão: Coliseu → câmera → integração

**Status em 30/10/2026:** Fase D aprovada visualmente; Fase E recebeu HP2, sprites E.6 e correção E.7 (GPU/PC real será validado na G). **F.1/F.2/F.3 implementadas no laboratório**: diretor do professor, composição cinematográfica e câmera local do personagem vivo que muda para modo espectador após a eliminação, reutilizando o mesmo feed interno da partida. Teste real WebGL de F.3 com 4/30 GLBs aprovado no run 40992989976; regressão do gesto manual do professor teve correção adicional, em reteste. Fase G, integração H entre dispositivos e revisão I pendentes. Sem mudanças na `main`.
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
**G.3 (resiliência de GLB) aprovada no laboratório (30/10/2026):** ao injetar falhas reais no primeiro download dos GLBs Mage/Knight, o protótipo bloqueou a batalha incompleta e ofereceu retry seletivo sem alterar semente, atributos ou talentos; houve recuperação 30/30 GLBs e execução de combate. [Run 40997047088](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40997047088). **G.2 validação nos PCs físicos da escola permanece pendente.** Integração H e merge I não autorizados.


**G.1 implementada e verificada em laboratório (30/10/2026):** monitor passivo `v5/performance-monitor.js`, painel opt-in `?perf=1` e tratamento de `webglcontextlost/restored` com pausa e retomada explícita. Teste automatizado com 4/30 GLBs, reinício e estabilidade de recursos gráficos após aquecimento WebGL passou em [run 40995278890](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40995278890). O status da GPU após clicar em continuar foi novamente testado com a extensão real WEBGL_lose_context; todos os jobs do [run 40995524247](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40995524247) passaram, inclusive 4/30 GLBs, aquecimento de texturas, duas reinicializações e retomada manual após recuperação de GPU. **Não afirmar desempenho de hardware real com SwiftShader**; G.2 continua exigindo teste nos PCs da escola. Ver `v5/FASE-G-CHECKPOINT.md`.
- Testes de regressão no motor e no navegador: 4/30 personagens, mobile/desktop, GLB, câmera, pausa, reinício e arquibancadas.
- Testes de carga e desempenho GPU/CPU; degradação elegante de efeitos em dispositivos mais fracos; testar falhas de GLB/rede.
- Preparar demonstração de revisão do professor **antes** de conectar usuários reais.

### H — Integração pedagógica / segurança e progressão

**H.3 — experimento causal de spawn M10 (30/10/2026):** novo override de coordenadas **exclusivo de M10 no laboratório**, com a M5 inalterada. [CI 41021568535 aprovado](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41021568535): 70 partidas, 6 replays exatos, 30 comparações trocando apenas geometria e 30 mantendo geometria fixa enquanto mudam ordem/RNG. Em 30 equilibrados, trocar somente posições mudou o vencedor em 9/9; trocar ordem/RNG com posições fixas mudou em 5/9. **Geometria influencia o resultado, mas ordem e RNG ainda não estão separados; não houve ajuste de balanceamento.** Checkpoint `v5/FASE-H3-M10-CHECKPOINT.md`. Prévia 3D M10, G.2, H.1/H.2 e Fase I continuam pendentes.

**H.3 — cruzamento pareado de ordem/slot M10 (30/10/2026):** 272 partidas fictícias com rotações completas das mesmas builds e seeds, cada herói ocupando cada slot uma vez por bloco. [CI 41015450904 aprovado](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41015450904). Em 30 equilibrados, Guardião ganhou **58/120**, versus **28** esperadas por participação; com metade do elenco Guardião, **86/120**, versus **60** esperadas. Com quatro, slots 1+2 ganharam **25/32** mesmo com classes rotacionadas. **A causa não está isolada**: índice de entrada ainda vincula posição, ordem de atualização e RNG; próxima missão é separar essas variáveis sem mudar a M5. Checkpoint: `v5/FASE-H3-M10-CHECKPOINT.md`. **Sem alteração de balanceamento, interface M10, H.1/H.2, G.2, V3 ou `main`.**


**H.3 — matriz M10 concluída como diagnóstico, não como balanceamento homologado (30/10/2026):** 80 batalhas fictícias com 4/30 participantes, 8 seeds, 5 composições e 11 variantes por classe; 80/80 finalizaram. Em 30 personagens o **Guardião venceu 22/40**, versus ~9,87 esperadas proporcionalmente à participação; em quatro jogadores os slots 1/2 somaram 32/40 vitórias. Ambos exigem investigação pareada de spawn/classe antes de ajustar stats. [CI aprovado 41009533478](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41009533478), relatório e próxima missão em `v5/FASE-H3-M10-CHECKPOINT.md`. **Nenhum balanceamento foi modificado nesta rodada; G.2, UI M10, H.1/H.2 e merge continuam pendentes.**


**H.3/M10 primeiro incremento experimental (30/10/2026):** o motor `v5/phase2-combat.js` agora permite, **somente por opt-in explícito**, batalhas fictícias da Missão 10 com 10 talentos e 20 pontos por personagem; M5 continua padrão e limitada a 5 talentos/10 pontos. `m10ArenaAdapter` verifica as travas H.0 e `checkTransition` impede mutações após lock final. O primeiro [run 41004049659](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41004049659) passou com replays determinísticos de 4 e 30 participantes; veja `v5/FASE-H3-M10-CHECKPOINT.md` para detalhes, limitações e próxima missão. **Não confundir motor experimental com interface M10 integrada, balanceamento homologado, sincronização ou produção; G.2 e H.1/H.2 permanecem pendentes.**


**H.0 preparada, sem integração real (30/10/2026):** criada especificação executável `v5/progression-contract-h0.js` para 2 pontos e 1 talento por missão, bloqueio da primeira entrada M5 e da build final M10; cobre os 120 talentos e não permite execução fictícia da M10 no motor M5 atual. Testes aprovados no [run 40997697983](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40997697983). Contrato e requisitos do futuro backend documentados em `v5/FASE-H0-CONTRATO.md`. **Ainda falta G.2 (PCs reais), autorização explícita, persistência, verificação de permissões, sincronização e motor M10; H operacional NÃO foi iniciada.**

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

**F.3 implementada no laboratório (30/10/2026):** `v5/camera-viewer.js` fornece o modo professor/aluno fictício vivo/espectador, estado serializável e uma única identidade de feed local. `v5/arena-three.js` transita da visão pessoal em terceira pessoa para o diretor compartilhado ao morrer, e volta ao professor sem reiniciar a simulação. O navegador validou a transição após morte real com quatro e trinta personagens, incluindo bloqueio explícito de M10 (run [40992989976](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40992989976)). A `main` continua intacta. **Não há transmissão remota de câmera ou autenticação dos alunos — isso pertence à H.** Próximo gate G: desempenho PC/GPU, 30 jogadores, rede/GLB, reset e falhas de contexto WebGL. Regressão F.1 de arrasto manual em reteste.
