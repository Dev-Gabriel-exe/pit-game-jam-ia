# FUN-03 — PIN do professor e isolamento de permissões

Execução em 28/10/2026, sem dados reais e sem alterações no Vercel/Neon.

## Testes de handlers

`qa/v3-isolated-backend.cjs` executa os handlers reais `chat.js` e `classroom.js` com Postgres substituído por fixture descartável. Verifica PIN incorreto/curto (403), PIN de teste correto, estado de professor sem progresso individual embutido, roster restrito, liberação de etapa restrita, professor impedido de enviar progresso como aluno, aprovação impedida sem PIN, aprovação autorizada e persistida somente para o aluno fictício selecionado, chat de threads restrito e validação do ID do aluno.

## Teste de navegador

`qa/v3-teacher-browser.cjs` usa Chrome e API HTTP fictícia. Testa formulário de PIN inválido, bloqueio de workspace, armazenamento do PIN correto apenas em `sessionStorage` (não em `localStorage`), retorno à sessão após recarregar e visualização do roster fictício.

## Limitações de segurança

O PIN é transmitido ao backend em cabeçalho e mantido na sessão do navegador; isso **não** equivale a uma autenticação por cookie HttpOnly, MFA ou política de expiração administrada pelo servidor. A validação final deve considerar risco de XSS, revogação de PIN, rate limit de login e permissões no Postgres isolado. Nenhum PIN real foi usado; o PIN do teste é um valor fictício definido no próprio fixture.
