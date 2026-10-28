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

## M04-03 — Caderno do aluno: prática autoral — CONCLUÍDO NO CÓDIGO

**Novos arquivos:** `v3/student-mission-four.js` e `v3/student-mission-four.css`. Integração em `aluno-v3.html` e no roteador/envio de `v3/app.js`. Tutorial compartilhado `v3/gdevelop-mission-four-guide.js` aceita agora a rota inicial e uma callback de troca; o professor mantém o comportamento original (rota RPG por padrão).

### O que o aluno faz

- Continua o projeto da Missão 03, recuperando seu **nome, cena, objeto e destino de salvamento**. Da Missão 02 vem a mecânica central; da Missão 01, nome, gênero e objetivo. O novo material não solicita a criação de outro jogo.
- Recebe uma **rota ilustrada sugerida conforme o gênero**: plataforma → Platformer; puzzle/narrativa → clique/toque; RPG/terror/corrida/exploração → movimento top-down; se na Missão 03 criou objeto 3D → rota 3D como sugestão. A escolha é alterável e permanece salva.
- Para 3D, há uma orientação específica: **adaptar o starter 3D oficial e incorporar os elementos/identidade do próprio jogo**. O starter pronto não substitui a autoria nem comprova sozinho a conclusão da oficina.
- Prática cronometrada dentro dos **36 minutos do professor**: 12 minutos controle/entrada, 15 minutos obstáculo/restrição e 9 minutos Preview/teste/salvamento. Não adiciona geradores de IA nesta missão.
- Executa os **três testes manuais**: comando produz resultado no Preview; limite impede ação inválida; teste é repetido e comparado com uma situação que não deveria funcionar.
- Descreve entrada, resposta, limite, repetição, salvamento e diagnóstico opcional. A ficha acompanha digitação; o rascunho é isolado por aluno, a entrega é montada automaticamente, e **nenhuma declaração de teste é inventada pelo sistema**.
- Evidência e rota 2D/3D seguem o `POST classroom/progress` já existente; botão de submissão obedece à liberação da turma. A prévia `?preview=1` nunca envia para a API.
- Distingue rascunho, envio, revisão solicitada e aprovação real; não atribui vitória ou XP por preenchimento.

### Verificações executadas

- **41 verificações estáticas e de lógica aprovadas**, incluindo código, CSS, três telas do aluno, personalização de gênero e objeto 3D, persistência, recuperação da evidência, modo prévia, proteção da API, continuidade do projeto e submissão.
- **18 testes interativos simulados aprovados:** selecionar rota no tutorial, persistência por aluno, atualização do guia e placeholders, nota de continuidade 3D, entrada de respostas, prévia em tempo real, contador de progresso, três testes reais declarados, validação e navegação.
- Um defeito de projeto foi detectado e corrigido na rodada: a primeira versão podia exceder os **750 caracteres** da API no pior caso. Limites dos campos e orçamento de cada linha foram alinhados; a evidência máxima medida agora é **723 caracteres**, sem cortar silenciosamente as respostas dentro dos limites apresentados ao aluno.

### Pendente para M04-04

Ainda faltam a auditoria professor/aluno lado a lado, a inspeção visual em Chrome/Android, o ensaio **real com API** de professor + aluno fictícios (liberação → envio → revisão → aprovação), verificação manual dos screenshots no laboratório e teste de execução do GDevelop. Os 59 testes citados são estáticos/funcionais em ambiente JavaScript simulado, **não testes E2E**.
