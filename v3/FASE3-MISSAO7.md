# Missão 07 — Dar Vida ao Universo — implementação incremental

**Duração prevista:** 50 minutos = 8 conceitos + 6 demonstração + 33 laboratório + 3 revisão. **Branch:** `feature/pit-gamejam-v3-arcade`.

## M07-01 — Professor: estados e conclusão — CONCLUÍDO

**Código:** `v3/teacher-mission-seven-foundations.js` e CSS, integrados em `professor-v3.html` e `v3/app.js` somente no briefing da Missão 07. Explica estados MENU/JOGANDO/VITÓRIA/DERROTA, transições condicionais, atualização contínua por frame, prevenção de vitória prematura e feedback de conclusão. Inclui exemplos RPG, plataforma, puzzle e terror/3D.

**Simulador:** iniciar → tentar porta sem chave (não vence) → coletar chave → abrir porta (vence); caminho alternativo de perder duas vidas (derrota). Ações fora de JOGANDO são ignoradas e reset retorna ao MENU. É uma máquina de estados didática, **não** uma execução do GDevelop.

**Verificações executadas:** 18/18 asserções V8 sobre transições, estados terminais, não mutação, exemplos, HTML, sintaxe do app, CSS responsivo e movimento reduzido. Teste repetível adicionado em `qa/v3-m07-foundations.cjs` (não executado no Node nesta rodada).

**Pendências:** teste no editor GDevelop e navegador real; tutorial 2D/3D será implementado na M07-02.

**Próxima meta:** M07-02 — tutorial progressivo no GDevelop: início → interação → resultado em 2D e 3D.

## M07-02 — Tutorial ilustrado de conclusão 2D/3D — CONCLUÍDO

**Código:** `v3/gdevelop-mission-seven-guide.js` e CSS, integrados ao `demo` do professor. Duas rotas com quatro passos: preservar cena jogável, criar cena Final, adicionar evento de conclusão e testar início/negativo/vitória. A rota 3D reutiliza Physics 3D e estado da Missão 05; não troca colisão física por condição 2D.

**Imagens:** três URLs de capturas publicadas pela documentação oficial do GDevelop foram abertas e conferidas em 27/10/2026. Elas mostram editor/cenas, evento e variável; são referências de interface, não capturas da execução do projeto da turma. Falha de imagem aciona diagrama autoral local identificado. Fontes: [interface](https://wiki.gdevelop.io/gdevelop5/interface/), [eventos](https://wiki.gdevelop.io/gdevelop5/interface/events-editor/), [troca de cena](https://wiki.gdevelop.io/gdevelop5/tutorials/geometry-monster/12-main-menu/), [física 3D](https://wiki.gdevelop.io/gdevelop5/behaviors/physics3d/) e [debugger](https://wiki.gdevelop.io/gdevelop5/interface/debugger/).

**Verificações executadas:** 16/16 V8, incluindo sintaxe, duas rotas, condições de vitória, navegação por etapas, mudança de rota em DOM simulado, links, integração e CSS responsivo. Teste repetível registrado em `qa/v3-m07-guide.cjs` (não executado no Node nesta rodada).

**Pendências:** não houve teste real de clique no GDevelop ou Preview 2D/3D; validar em homologação com projetos fictícios. **Próxima meta:** M07-03 — aluno cria condição autoral de conclusão, teste negativo e evidência.

## M07-03 — Caderno do aluno: conclusão autoral — CONCLUÍDO

**Código:** `v3/student-mission-seven.js` e CSS, integrados em `aluno-v3.html` e `v3/app.js`. O aluno continua o objetivo e a condição de vitória definidos nas Missões 01–02, preservando o controle, regra e asset anteriores. O tutorial M07-02 é compartilhado, com rota 3D pré-selecionada quando o projeto anterior usa física 3D, inclusive navegação por teclado.

**Evidência:** início, desafio, condição SE, resultado ENTÃO, tentativa de vitória prematura, repetição/reinício e projeto salvo; três declarações manuais de testes no Preview. Persistência isolada por sessão, hidratação de evidência enviada, limite 750 caracteres, bloqueio de envio incompleto e prévia sem backend.

**Verificações executadas:** 21/21 asserções V8 com alunos fictícios, validação, isolamento, hidratação, limite de evidência, roteamento 3D, integração e HTML/CSS. Teste repetível em `qa/v3-m07-student.cjs` (não executado no Node nesta rodada). Sem navegador/GDevelop/API real.

**Próxima meta:** M07-04 — professor/aluno, vitória prematura, estado final, rascunho e envio; testes de regressão.

## M07-04 — Integração professor/aluno — PARCIAL / BLOQUEADA POR E2E REAL

**Código entregue:** `v3/teacher-mission-seven-validation.js` e CSS integrados às fases `practice` e `review` do professor, espelhando os sete campos do aluno, teste negativo, reinício e condição de conclusão. Rubrica com seis critérios; não aprova automaticamente. Fallback permite mostrar texto final na própria cena, sem criar cena extra.

**Verificações executadas:** 20/20 V8 de sintaxe, fluxo da máquina de estados (vitória prematura, vitória legítima e derrota), validação do aluno, bloqueio de revisão enviada, alinhamento professor/aluno, integração estática e CSS. Teste repetível em `qa/v3-m07-integration.cjs` (não executado no Node nesta rodada).

**Impedimento para aceite integral:** não foi executado o ciclo real de login fictício, rascunho, envio, devolutiva e aprovação em backend isolado, nem o Preview do GDevelop. Portanto não afirmar que envio/revisão foram homologados. A meta fica `blocked` até existir ambiente de testes autorizado, sem tocar na turma real.

**Próxima ação segura:** M08-01 — fundamentos de UX e polimento, preservando este bloqueio para homologação.
