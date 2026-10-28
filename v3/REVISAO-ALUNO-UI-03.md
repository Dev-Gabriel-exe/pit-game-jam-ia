# UI-03 — Jornada e progresso do aluno

Data: 2026-10-28. Caderno `aluno-v3.html`, branch de desenvolvimento.

A jornada existente já contém carrossel de dez capítulos, HUD com nome/etapa, barra de progresso acessível, poster individual, bloqueio por etapa, botão de entrada, navegação por teclado e páginas de missão. A auditoria preservou esses componentes em vez de reconstruí-los.

## Mudança incremental

O texto de progresso aprovado (`#arcadeProgressLabel`) agora possui `aria-live="polite"` e `aria-atomic="true"`, para anunciar alterações de contagem a tecnologias assistivas. O cálculo continua exclusivamente a partir do status `approved` recebido da API; envio pendente não conta como conquista.

## Testes

O teste Playwright `qa/v3-e2e.cjs` percorre as 30 páginas aluno/fase com API fictícia e valida o carrossel, bloqueio de missão, submissão e aprovação. Foi acrescentada verificação da barra após aprovação da Missão 01: `aria-valuenow=1`, rótulo `1 de 10 missões aprovadas` e acesso à missão aprovada. O navegador não acessa turma real.

Limitações: ainda não houve teste de leitor de tela real, sincronização com produção nem avaliação humana de estética e fluidez.
