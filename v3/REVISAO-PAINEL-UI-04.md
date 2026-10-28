# UI-04 — Painel do professor: filtros, acompanhamento e revisão

Data: 2026-10-28, branch de desenvolvimento.

O painel existente reúne inscritos, atividade recente, entregas pendentes, dúvidas, histórico por missão e botões de revisão/aprovação. A lógica de liberação continua no backend; não foi alterada nesta revisão.

## Ajustes reais

- `v3/app.js`: os quatro filtros (Todos, Aguardando validação, Ativos, Com dúvida) agora recebem `aria-pressed` coerente com o filtro efetivamente aplicado.
- `professor-v3.html`: o resumo do acompanhamento recebeu `role="status"` e `aria-live="polite"`.
- `v3/professor-gothic.css`: estado selecionado e foco do teclado destacados com contraste.
- `qa/v3-e2e.cjs`: no Chrome, uma entrega fictícia deve aparecer no filtro pendente, desaparecer no filtro sem dúvidas e voltar em Todos, sem interferir na aprovação.

## Limites

Testes usam somente dados fictícios interceptados. Não há confirmação de operação em turma real, concorrência de professores, leitores de tela físicos ou desempenho sob carga. Revisão de regras de autorização e persistência real permanece para testes funcionais posteriores.
