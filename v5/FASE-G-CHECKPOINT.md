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
