# FUN-02 — Cadastro e sessão de aluno (ambiente isolado)

Execução de 28/10/2026, somente em `feature/pit-gamejam-v3-arcade`.

## O que foi executado

1. `qa/v3-isolated-backend.cjs` carregou os **handlers reais** `chat-api/api/chat.js` e `chat-api/api/classroom.js` em VM, substituindo exclusivamente o driver Postgres por um adaptador SQL em memória descartável. Foram exercitados: código de sala inválido, nome curto, cadastro de dois alunos fictícios, geração de tokens diferentes, armazenamento de hash, rejeição de token ausente/malformado/forjado, consulta de estado, rascunho, envio, bloqueio de sobrescrita e isolamento do progresso por aluno.
2. `qa/v3-session-browser.cjs` abriu o **caderno V3 real no Chrome** em dois contextos isolados, com API HTTP simulada, fez cadastro de A/B, confirmou tokens diferentes no `localStorage`, recarregou as páginas, comprovou que somente A recuperou o progresso de A e rejeitou sessão forjada.
3. `qa/v3-e2e.cjs` continuou testando a jornada existente de professor/aluno com API fictícia, sem alterar turma real.

**Evidências:** <https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40635407764> (QA estático, sucesso) e <https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40635407765> (Chrome, sucesso; inclui o novo teste FUN-02).

## Limitações

O adaptador SQL é um **mock em memória**, não uma instância Postgres/Neon. O teste Chrome usa backend HTTP fictício e não autentica no Vercel real. Portanto, estes testes comprovam lógica de handlers e interface, mas não comprovam migrações, concorrência, persistência após reinício do banco, rede real ou isolamento transacional no Neon. Isso deve ser homologado com banco de teste autorizado, jamais com dados de turma real. Nenhum token gerado no teste foi registrado no relatório ou enviado à produção.
