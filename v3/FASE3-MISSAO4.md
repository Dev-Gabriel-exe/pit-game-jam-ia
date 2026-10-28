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

## M04-04 — Auditoria professor/aluno, entrega e avaliação — IMPLEMENTADA E VERIFICADA COM SIMULAÇÃO

A Missão 04 passa a ter os **quatro momentos** do professor implementados com conteúdo próprio: conceitos (6 min), tutorial interativo (5 min), prática espelhada (36 min) e critérios de avaliação (3 min).

### Correspondência pedagógica explícita

| Caderno do aluno | Caderno do professor | Teste observável |
|---|---|---|
| Entrada usada | Fragmento 01, 12 min | Controle provoca mudança de estado no Preview |
| Limite/obstáculo | Fragmento 02, 15 min | Parede bloqueia; plataforma sustenta; clique fora não ativa; física 3D impede atravessar |
| Repetição + salvamento | Fragmento 03, 9 min | Teste negativo repetido e projeto editável recuperável |
| Evidência do aluno | Rubrica na etapa Resultados | Campo comando, resposta, limite, reteste, arquivo salvo e diagnóstico opcional |

As quatro alternativas (RPG, plataforma, puzzle/narrativa e 3D) mudam a implementação, sem acrescentar trabalho além dos 36 minutos. O professor tem no próprio material exemplos de falhas por rota, critério de aprovação e condição de revisão; **não há notas de fala**.

### Ajustes de segurança e experiência aplicados

- **API da turma:** `POST classroom/progress` usa um guard transacional no `ON CONFLICT ... WHERE` para não permitir que o aluno sobrescreva entregas **enviadas** ou **aprovadas**. Responde HTTP 409 em conflito. Depois de o professor solicitar revisão, o aluno pode corrigir e reenviar a mesma missão.
- **Avaliação do professor:** solicitações de revisão exigem devolutiva objetiva de pelo menos 8 caracteres, tanto na interface como na API (HTTP 400 sem explicação).
- **Privacidade de sala:** o `POST classroom/review` só atualiza estudantes da sala identificada pelo código `PITGAME26`, reforçando a validação por PIN.
- **Painel de acompanhamento:** evidências multilinha são exibidas em `<pre>` com escape de HTML, quebra de linha e `white-space: pre-wrap`, facilitando a leitura de campos `Comando`, `Resposta`, `Limite`, `Repetição` e `Salvo em`.
- **Sem falsa conquista:** XP/aprovação continuam dependentes da resposta do servidor, não da marcação das caixas de teste. O modo `?preview=1` impede qualquer envio real.

### Testes executados

1. **32/32 verificações técnicas de integração e apresentação**: JavaScript, CSS, professor e aluno, 12+15+9 minutos, rubrica de avaliação, quatro rotas de jogo, acessibilidade do seletor, formato da evidência, escopo do navegador e guardas da API.
2. **14/14 cenários de API com PostgreSQL simulado**: bloqueio de etapa, liberação, submissão, imutabilidade da entrega, necessidade de devolutiva, isolamento de sala, revisão, reenvio, aprovação e proteção de trabalhos aprovados.
3. **28/28 asserções do script de regressão persistente** `qa/v3-m04-regression.cjs` executadas em um ambiente JavaScript com módulos nativos simulados; os códigos JS reais foram carregados diretamente do GitHub. O script foi versionado e pode ser executado em uma cópia local com `node qa/v3-m04-regression.cjs` (não foi executado com Node diretamente nesta rodada).

### O que ainda não foi comprovado

Não houve teste em navegador real com captura visual, instância real do GDevelop, contas reais ou fictícias no banco Neon/Vercel, nem Playwright conectado ao front-end completo. O ambiente de execução local não conseguiu acessar o GitHub para clonar a branch, portanto os testes usaram arquivos obtidos pelo conector GitHub e um banco simulado. Esse trabalho permanece **pendente** para a etapa `FUN` da auditoria funcional, e não deve ser apresentado como E2E homologado.

**Condição de conclusão da meta M04-04:** os roteiros e estados foram integrados, as falhas de sobrescrita e devolutiva foram corrigidas e os testes disponíveis passaram. Isso não equivale à homologação da oficina inteira.
