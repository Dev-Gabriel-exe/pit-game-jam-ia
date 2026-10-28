# Missão 07 — Dar Vida ao Universo — implementação incremental

**Duração prevista:** 50 minutos = 8 conceitos + 6 demonstração + 33 laboratório + 3 revisão. **Branch:** `feature/pit-gamejam-v3-arcade`.

## M07-01 — Professor: estados e conclusão — CONCLUÍDO

**Código:** `v3/teacher-mission-seven-foundations.js` e CSS, integrados em `professor-v3.html` e `v3/app.js` somente no briefing da Missão 07. Explica estados MENU/JOGANDO/VITÓRIA/DERROTA, transições condicionais, atualização contínua por frame, prevenção de vitória prematura e feedback de conclusão. Inclui exemplos RPG, plataforma, puzzle e terror/3D.

**Simulador:** iniciar → tentar porta sem chave (não vence) → coletar chave → abrir porta (vence); caminho alternativo de perder duas vidas (derrota). Ações fora de JOGANDO são ignoradas e reset retorna ao MENU. É uma máquina de estados didática, **não** uma execução do GDevelop.

**Verificações executadas:** 18/18 asserções V8 sobre transições, estados terminais, não mutação, exemplos, HTML, sintaxe do app, CSS responsivo e movimento reduzido. Teste repetível adicionado em `qa/v3-m07-foundations.cjs` (não executado no Node nesta rodada).

**Pendências:** teste no editor GDevelop e navegador real; tutorial 2D/3D será implementado na M07-02.

**Próxima meta:** M07-02 — tutorial progressivo no GDevelop: início → interação → resultado em 2D e 3D.
