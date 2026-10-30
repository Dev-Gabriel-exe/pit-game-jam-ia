# Fase F — Diretor cinematográfico V5
## F.1 — câmera automática do professor (primeira entrega)

**Status:** implementação de laboratório, branch `feature/v5-arena-dos-criadores`; ainda não integrada à turma real e sem merge em `main`.

### Mudanças

- `v5/camera-director.js`: seletor determinístico de planos, **observador apenas**. Recebe o vetor de personagens e os eventos reais do motor M5, sem acesso de escrita às regras do combate. Decisão por estado: `overview`, `duel`, `highlight`, `climax`, `victory`.
- Cortes controlados: intervalo mínimo de 4,2 segundos de tempo lógico; plano máximo usual de 9,5 segundos antes de reconsiderar. Exceção imediata: vitória. Eventos de habilidade, preparação, dano, eliminação são classificados por prioridade, com penalização por aparições prévias para ampliar diversidade e evitar seguir somente classes fortes.
- Alvos mortos não são mantidos; últimos três sobreviventes acionam o clímax. O modo de vencedor usa apenas o personagem vivo. Transições de câmera são interpoladas a cada quadro (posição e alvo), com velocidade limitada para reduzir saltos.
- `v5/arena-three.js`: API `enableAutoCamera(true|false)`; toda mudança de plano é vinculada aos snapshots reais da simulação e registrada como `data-v5-camera-shot`, `data-v5-camera-cuts` e `data-v5-camera-director`. A câmera não muda propriedades de combate. A seleção manual de personagem, os botões de câmera e o arrasto de OrbitControls interrompem o diretor e o professor pode reativá-lo.
- `v5/arena-lab.html`, `v5/arena-lab.js`, `v5/arena-lab.css`: botão **Diretor automático**, status legível do plano atual e retomada manual. A configuração é opcional. Não altera XP ou aprovações.
- A câmera atual de um participante vivo continua disponível, mas a integração de câmeras professor/aluno e a transição de visão de falecido para a mesma câmera global ficam para fases posteriores.

### QA executado

- `qa/v5-camera-director.cjs`: verifica histerese, equidade da seleção, exclusão de eliminados, clímax, vitória prioritária, reset, 4 e 30 participantes. Mesmo seed, builds e parâmetros: resultado do motor com ou sem câmera **bit a bit idêntico**. Primeira execução: **PASS**, 5 planos com 4 heróis, 10 planos com 30; vencedores preservados.
- `qa/v5-camera-director-browser.cjs`: Playwright/WebGL com 4 e 30 GLBs reais; testa botão, status, cortes, prioridade de visão geral, arrasto manual, seguir aluno e volta ao automático. Workflow focal `.github/workflows/v5-camera-director-qa.yml`.
- Execução GitHub Actions de F.1: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40990012882. **Verificar status do job de browser antes de declarar homologação visual.**

### Etapas restantes de F

F.2 — melhorar enquadramento adaptativo de duelos, telegraphs e efeitos com visibilidade validada; controle da câmera de vencedor e opções de movimento reduzido. F.3 — visão individual de aluno vivo e, ao morrer, transição para uma câmera global compartilhada, sem dar outro diretor a cada espectador. **Integração real/autorização e sincronização ficam somente para H**. QA de desempenho PC/mobile e 30 participantes deve ocorrer em G.

### Exemplo de prévia isolada

`/v5/arena-lab.html?phase2=1&count=30&nav=steer&counterplay=1&balance=hp2&sprites=1`, clicar em **Diretor automático** e iniciar o combate. Para reproduzir o caso específico de E.7, acrescentar `&seed=4175863657`.

## F.2 — Composição cinematográfica, telegraph e obstáculos (30/10/2026)

**Implementada como camada somente visual, dentro do laboratório da V5, sem tocar em `main` nem na progressão dos alunos.**

- `v5/camera-framing.js`: compositor autoral e puro (não requer Three.js), recebe o plano de câmera selecionado, combatentes vivos, obstáculos físicos retornados pelo motor e proporção real da tela. Calcula centro, raio e distância necessários para enquadrar dois lutadores/área de impacto; testa **12 azimutes** e pontua candidatos por bloqueio real por pilares, deslocamento da câmera e tendência de ficar atrás das muralhas. Modela a altura da linha de visão — uma câmera elevada pode enxergar por cima de um obstáculo, não deve ser marcada como bloqueada erroneamente.
- `v5/camera-director.js`: eventos reais `prepare` e `talent-impact` podem carregar a posição `x,z` da habilidade na decisão de enquadramento. O centro é mostrado **somente** quando existe no evento do motor, sem inventar golpe. O clímax entra imediatamente ao reduzir para 3 vivos, enquanto planos ordinários respeitam a histerese. Corrigido loop em que a câmera poderia permanecer na visão geral indefinidamente: agora alterna geral/duelo em ausência de eventos.
- `v5/arena-three.js`: câmera resolve planos a cada 260ms (mais barato que a cada quadro), interpola posição e alvo sem teletransportes; expõe `data-v5-camera-obstructions`, `-framing-distance`, `-telegraph`, `-visible-subjects` para inspecionar a seleção. Clímax e final de vitória têm enquadramento próprio; o vencedor pode receber uma pequena órbita de até 0,2rad (~11,5°), **desativada para `prefers-reduced-motion`**. Manipulação manual, seleção explícita de um aluno e visão geral sempre prevalecem sobre o automático.
- `v5/arena-lab.html`: carrega o módulo de enquadramento antes do motor Three.js. A câmera é ativada no botão **Diretor automático**, como na F.1.

### QA / evidências

- `qa/v5-camera-framing.cjs`: testa bloqueio vs. linha elevada, composição para paisagem e retrato, inclusão do centro real da habilidade, retirada do alvo eliminado, movimento reduzido sem órbita, alternância ampla/duelo, clímax/último sobrevivente e imutabilidade do snapshot. Teste executado manualmente no runtime Node-equivalente, sem falhas.
- `qa/v5-camera-director.cjs`: regressão dos resultados exatos da simulação 4/30 com o diretor ativo ou desligado, sem alterar vencedor e danos.
- `qa/v5-camera-director-browser.cjs`: teste de WebGL real com 4 e 30 GLBs, controle manual, tela estreita e informações de enquadramento; gera screenshot `qa/v5-camera-director-f2-30.png`.
- `qa/v5-camera-victory-browser.cjs`: teste completo do seed exato da partida S24 (`4175863657`) com **30 personagens e diretor ativo**, aguardando vitória real, 29 espectadores, câmera apontada para o Guardião vencedor e botão manual preservado. Gera screenshot `qa/v5-camera-f2-victory-30.png`.
- Workflow: `.github/workflows/v5-camera-director-qa.yml`, run F2 https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40991606686. **Não declarar homologação browser ou fluidez de hardware até aprovação efetiva; no CI o WebGL é SwiftShader/software rendering.**

### Pendente em F

F.3 — visão do aluno vivo e ao morrer transição para a mesma câmera global do professor, **com replicação real autorizada exclusivamente em H**. Fases G/H/I continuam separadas: desempenho PC/GPU, integração e aprovação para `main`.

### Homologação automatizada da F.2 (30/10/2026)

**GitHub Actions run 40991606686 — todos os jobs concluídos com SUCESSO.**

- Node: F.1 preserva ganhadores em 4 e 30 atores; F.2 testa linha de visão, 12 candidatas angulares, foco da habilidade preparado em posição real, tela estreita, `prefers-reduced-motion` e alternância geral/duelo; replay de E.7 intacto.
- Playwright/WebGL: **PASS** com 4 e 30 GLBs carregados, câmera automática, redimensionamento para retrato, controle manual e reativação, enquadramento real e ausência de erro fatal.
- **30 modelos reais com câmera automática até o fim**, seed `4175863657`: `shot=victory`, vencedor Guardião, **29 espectadores na arquibancada**, `subjects=1`, **0 obstruções** calculadas, **11 planos** escolhidos ao longo do confronto, **130 draw calls** no momento capturado. Resultado da batalha preservado; o cronômetro ainda terminou após aproximadamente 63 segundos de tempo de simulação. Artefatos: `v5-camera-director-f2-30.png` e `v5-camera-f2-victory-30.png` em `v5-f2-camera-webgl-30` no run.
- Link: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40991606686
- **Limite:** testes de WebGL no CI usam SwiftShader renderizado por software. Não afirmar que FPS em PCs dos alunos/S24 foi homologado; isso é Fase G. Também não afirmar que todas as geometrias reais do cenário estão sempre desobstruídas; a checagem é contra os obstáculos do motor e foi aprovada na cena final deste seed.

**Próximo item F.3:** câmera local de participante vivo e, ao morrer, transição para a MESMA visão global professor + espectadores (servidor e autenticação reais exclusivamente em H); depois G/H/I.
