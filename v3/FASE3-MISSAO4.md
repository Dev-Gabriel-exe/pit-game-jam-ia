# PIT Game Jam IA V3 — Missão 04, execução do agente

**Branch:** `feature/pit-gamejam-v3-arcade`  
**Escopo da missão:** Primeiro Jogável — 50 minutos (6 min conceitos, 5 min demonstração, 36 min oficina, 3 min resultados)  
**Última execução manual:** 27/10/2026, Meta M04-02

## M04-01 — Fundamentos do professor — CONCLUÍDO

Módulo `v3/teacher-mission-four-foundations.js` e `v3/teacher-mission-four-foundations.css`, já integrado no briefing da Missão 04. Explica inputs, behaviors, delta time, resposta à colisão e câmera em linguagem técnica universitária. Oferece comparação interativa por RPG/exploração, plataforma, puzzle/narrativa e FPS/3D. Sem notas de fala. Testes automatizados registrados no estado do agente.

## M04-02 — Tutorial ilustrado de GDevelop — CONCLUÍDO NO CÓDIGO

**Novos arquivos:** `v3/gdevelop-mission-four-guide.js`, `v3/gdevelop-mission-four-guide.css`, `v3/assets/guide/gdevelop-m04-movimento-limites-pt.svg`. Integrado à fase `demo` do professor (apenas Missão 04) em `professor-v3.html` e `v3/app.js`. Nenhuma alteração nos materiais aprovados das Missões 01–03 e nenhuma mudança no backend.

### Interface do tutorial

- Quatro rotas mutuamente exclusivas, escolhidas por botões acessíveis (mouse, teclado e estados ARIA).
- Cada rota possui **quatro passos**, com foto oficial do GDevelop/representação do exemplo, botão Próximo/Anterior, instrução completa em português, resultado verificável, diagnóstico de falha e fonte oficial opcional.
- As imagens externas foram identificadas nos documentos oficiais do GDevelop; imagens de gameplay em 3D estão explicitamente identificadas como **imagem de jogo**, não captura de interface.
- Se o screenshot não carregar, o navegador substitui pelo SVG **autoral**, marcado `NÃO É PRINT DO EDITOR`, com alternativa textual.
- UI responsiva mobile/tablet, animações discretas e `prefers-reduced-motion`. Ao mudar de passo, a página retorna ao início do tutorial.

### Regras técnicas realmente ensinadas

- **Top-down:** Sprite → Behaviors → Top-down movement, Default controls, evento `Collision` com `Separate objects` aplicado ao personagem e parede; testar setas e parede no Preview.
- **Plataforma:** comportamento `Platformer character` no jogador, `Platform` no chão; controles padrão, salto, gravidade e pouso. Não ensina usar a separação manual para o chão que o comportamento gerencia.
- **Puzzle/narrativa:** alvo de interação com `Cursor/Touch is on object`, input por clique/toque e mudança visual observável; limite = área de interação válida, sem obrigar movimento de avatar.
- **3D:** começar por um starter gratuito funcional, preservar os mappers que o próprio starter utiliza, verificar Physics 3D e colisões volumétricas, sem confundir `Collision` 2D com física 3D. Starter oficial `3D FPS with Gun` (licença MIT): https://gdevelop.io/game-example/free/starting-first-person-shooter

### Verificação

**37 de 37 verificações automatizadas aprovadas**: sintaxe JavaScript, CSS, estrutura SVG, 4 rotas × 4 passos, integridade semântica das instruções, isolamento da integração (somente professor, Missão 04 demo), preservação das outras fases, navegação próxima/anterior, troca de rota, teclado Home/End/Arrow, ARIA, scroll mobile e fallback de imagem com rótulo honesto.

**Não validado ainda:** screenshot renderizado no navegador real, funcionamento dos cliques no GDevelop em laboratório, teste E2E com login/autenticação, envio e avaliação. O trabalho confirmou as **URLs declaradas nas páginas oficiais**; a inspeção de cada imagem em navegador ainda está pendente. Os controles e nomenclaturas podem variar por versão. Não marcar toda a Missão 04 como pronta: M04-03 e M04-04 continuam na fila.

## Próximas metas

- **M04-03:** aluno continua exatamente o projeto da Missão 03, escolhe uma das rotas, implementa entrada + limite, segue tutorial, testa três casos observáveis, salva e registra o resultado real sem copiar resposta pronta.
- **M04-04:** validação e sincronização professor/aluno, avaliação pelo backend, evidência honesta, rascunhos, testes de regressão e apresentação.

## Referências oficiais verificadas

- https://wiki.gdevelop.io/gdevelop5/behaviors/
- https://wiki.gdevelop.io/gdevelop5/behaviors/topdown/
- https://wiki.gdevelop.io/gdevelop5/behaviors/platformer/
- https://wiki.gdevelop.io/gdevelop5/all-features/collisions/
- https://wiki.gdevelop.io/gdevelop5/behaviors/physics3d/
- https://wiki.gdevelop.io/gdevelop5/interface/events-editor/
- https://gdevelop.io/game-example/free/starting-first-person-shooter
