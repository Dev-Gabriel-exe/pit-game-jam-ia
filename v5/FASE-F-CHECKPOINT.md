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
