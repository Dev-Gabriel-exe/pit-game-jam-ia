# Fase G — Qualidade, estabilidade e desempenho da Arena V5

**Estado:** G.1 — instrumentação e recuperação de WebGL implementadas na branch experimental. A Fase G inteira ainda não está homologada. **Nenhuma alteração na `main`, nas quatro aparências KayKit, no dano, nos talentos ou na regra de vitória.**

## G.1 — Medidas reais, sem redução automática de qualidade

- `v5/performance-monitor.js`: módulo local passivo, janelas de amostragem limitadas, FPS atual, percentil inferior P10, maior intervalo entre quadros, draw calls, triângulos, geometrias, texturas, modelos GLB carregados e participantes vivos. Sem modificar renderer, física ou classe. O FPS obtido em Chromium + SwiftShader no CI **não é FPS de hardware**.
- `v5/arena-three.js`: coleta métricas do `THREE.WebGLRenderer.info` uma vez por segundo, sem leituras de alto custo por quadro; publica atributos `data-v5-perf-*` e um evento `v5-perf-sample`. Além disso, escuta eventos nativos `webglcontextlost` e `webglcontextrestored`. Em perda de GPU **pausa a física**; ao restaurar, recalibra cronômetros e permite que o usuário retome a batalha. Não tenta continuar num canvas inválido.
- `v5/arena-lab.html/js/css`: painel opcional ao acrescentar **`&perf=1`** à URL de laboratório; informa medições de CPU/GPU e permite copiar diagnóstico **sem nomes, cadastros, notas, XP ou dados de alunos**. O painel fica oculto por padrão. Em WebGL perdido, a UI explicita "GPU REINICIANDO"; na restauração, "GPU RESTAURADA — TOQUE EM CONTINUAR".
- A qualidade continua em `auto` em computadores/telefones capazes; nenhuma decisão unilateral de diminuir gráficos no Samsung S24. O usuário informou que a demonstração real será nos PCs dos alunos.

## Evidências

- `qa/v5-performance-monitor.cjs`: regras do monitor de FPS, P10, valores não finitos, contagem de janelas longas e serialização não identificável. Validado com sucesso no job `metrics-and-rules`.
- `qa/v5-performance-browser.cjs`: Chrome WebGL com **4 e 30 modelos GLB carregados**, screenshots/telemetria, reinício da arena com 30 personagens duas vezes e verificação de crescimento não controlado de recursos. Exercita `WEBGL_lose_context` quando a extensão existe e verifica pausa explícita, restauração, retomada e ausência de erros JS. Sem extensão, informa que o teste de driver real ficou sem cobertura (não finge que executou).
- GitHub Actions: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40995099539. Verificar o job do navegador antes de declarar G.1 integralmente aprovada.

## Gate G.2 (próximo)

Validar FPS **nos computadores reais da escola**, uso de memória após várias partidas, 30 jogadores e modelos reais, tempo de carregamento via rede, falhas de GLB e reconexão do WebGL. O painel `?perf=1` existe para colher esses números sem depender de um teste artificial SwiftShader. É preciso comparar máquinas da escola e registrar dados reais antes de afirmar FPS aceitável.

## Fases ainda pendentes

G.2 homologação de hardware, G.3 falhas/rede/resiliência, H integração professor/alunos com autorização e uma partida compartilhada entre dispositivos, I aprovação e merge controlado na main.

## Resultado G.1 — teste automatizado aprovado

**GitHub Actions [40995524247](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40995524247): ambos os jobs `metrics-and-rules` e `real-browser` passaram.**

- WebGL no Chromium: quatro e trinta GLBs carregados, `quality=auto`, quadro real do Coliseu e telemetria válida. Na amostra antes do confronto, ~222 chamadas de desenho com quatro heróis e ~864 com 30. Esses números mudam conforme a câmera e as elimiminações.
- Recarregamento da arena com **30 modelos**, duas vezes: geometrias **216 → 216 → 216**; texturas **211 (ainda frio) → 385 → 385**. Não houve crescimento adicional após o primeiro aquecimento de GPU. É uma amostra curta; **não prova ausência de vazamentos em partidas longas ou outros drivers**.
- O Chromium forneceu `WEBGL_lose_context` e a extensão foi **realmente acionada**. O teste passou: evento de contexto perdido, física pausada, aviso de GPU, contexto restaurado, botão continuar e status final `graphicsContext=ready`.
- Não comparar FPS do GitHub Actions com hardware real: **renderização por software** e grandes oscilações de FPS no próprio runner. Uma máquina de laboratório pode renderizar muito melhor, mas só o teste G.2 em PCs reais poderá comprovar.
- `v5/G2-VALIDACAO-PC.md` contém roteiro de uso do painel `&perf=1`, reinícios, 30 GLBs, câmera e relatório. **Fase G não está encerrada**.

**Próxima meta G.2:** rodar a prévia com `perf=1` nos PCs da oficina, observar FPS P10 real e qualquer falha de GPU/rede; G.3 cobre falha de GLB/reconexão; H sincronização do torneio com alunos reais; I revisão e merge autorizados.

## G.3 — Robustez de rede/GLB (em validação)

- Diagnóstico prévio: um erro de download em `Mage.glb` ou `Knight.glb` deixava todos os combatentes da classe com um personagem procedural e a interface permanentemente bloqueada em `MODELO 3D INDISPONÍVEL`, sem botão para recuperação. Quando um GLB demorava indefinidamente, também não havia limite de espera.
- `v5/arena-three.js`: timeout por URL oficial de 30 segundos; rejeições não ficam guardadas no cache compartilhado. Cada herói possui estado `loading/ready/failed`; ao falhar, mantém a silhueta procedural apenas como indicação do erro, **sem fingir que é o KayKit oficial**. `retryFailedModels()` tenta só os personagens ausentes, deduplicados por URL em cache, sem alterar semente, atributos, talentos ou uma batalha já iniciada.
- `v5/arena-lab.html/js/css`: botão visível **somente quando ocorrer falha real**, com contagem de modelos ausentes; iniciar confronto permanece bloqueado até todos os GLBs corretos carregarem. A partir de nova tentativa, o botão desaparece enquanto o carregamento prossegue. Reiniciar a partida continua opção separada.
- `qa/v5-glb-recovery-browser.cjs`: Chromium real recebe falhas propositalmente injetadas no primeiro download de Mage e Knight, confirma bloqueio, depois permite os downloads, verifica recuperações mínimas, personagens corretos e mesma seed/build, executa primeiro talento e expande para 30 KayKits. Workflow: [G.3 — Falhas de GLB](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-glb-recovery-qa.yml). **Resultado final ainda pendente de consulta**.
- G.2 continua pendente de teste em computadores reais da oficina, ainda que G.3 seja homologada em navegador automatizado. Não publicar na main antes de I.
