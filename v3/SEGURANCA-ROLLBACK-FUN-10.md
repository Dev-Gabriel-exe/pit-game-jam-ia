# FUN-10 — Auditoria de segurança, acessibilidade, desempenho e reversão

**Escopo:** `feature/pit-gamejam-v3-arcade`, sem merge ou publicação. Auditoria executada com dados fictícios, testes de código e Chrome local. Não é pentest, nem auditoria legal de licenças, nem validação do banco de produção.

## Evidências técnicas

- [Static QA 40637308970](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40637308970): **success**, incluindo `qa/v3-security-audit.cjs`, testes dos handlers, downloads e regressões.
- [Browser QA 40637186741](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40637186741): **success**, três estudantes fictícios, professor, revisões, celular e falha HTTP simulada.
- Testes UI-08 anteriores cobrem 12 viewports e movimento reduzido; o teste de navegação por teclado e estados de foco foi executado no Chrome em rodadas anteriores.
- Dez posters WebP locais entre ~63–92 KB cada; `loading=lazy`, fallback e `prefers-reduced-motion` são cobertos pelas verificações ART-04/ART-05.

## Controles verificados

Os handlers validam origem, usam PIN de professor vindo de variável de ambiente, comparação de PIN com `timingSafeEqual`, tokens de estudante armazenados como hash SHA-256 no banco, limites de tamanho, consultas SQL parametrizadas e cabeçalhos `no-store`/`nosniff`. Evidências aprovadas não podem ser sobrescritas. O heartbeat de missão futura é rejeitado; a revisão só pode ser aprovada após reenvio em `submitted`.

A interface escapa texto vindo de alunos antes de inserir em HTML; o PIN fica em `sessionStorage`, enquanto a sessão do aluno persiste em `localStorage`. Este último armazenamento não substitui mitigação de XSS.

## Riscos e pendências de publicação

| Prioridade | Item | Tratamento antes de publicar |
| --- | --- | --- |
| P1 | Importação de PNG/GLB/WAV e starters no editor GDevelop não homologada | Executar teste real e registrar versão/capturas (FUN-08) |
| Resolvido em homologação isolada | Transações com Postgres 16 descartável | [Postgres QA 40637833387](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40637833387) passou; Neon de produção permanece intocado |
| P1 | Direitos/termos de reutilização dos MP4 LTX experimentais ainda não auditados para distribuição | Verificar termos do serviço/modelo e manter a branch experimental fora da produção até liberação |
| P2 | PIN persistido na sessão e ausência de rate limit distribuído para tentativas de login de professor | Adotar proteção de borda/limite de tentativas e rotação de PIN |
| P2 | Token do aluno em `localStorage`; possível exposição se ocorrer XSS no mesmo domínio | Revisar CSP, dependências e sanitização antes do lançamento |
| P2 | `pg` fixado no `chat-api/package.json`, sem lockfile nem varredura de dependências executada nesta rodada | Gerar lockfile reprodutível e rodar auditoria de dependências em ambiente isolado |
| P2 | Simulação de erro 503 não demonstra comportamento em queda real do Vercel/Neon | Testar ambiente de homologação isolado com monitoramento e rollback |

## Procedimento de backup e rollback — **não executado**

1. Antes de qualquer publicação, identificar o SHA exato da branch de homologação e o SHA da versão atual em produção. Preservar ambos no relatório de release.
2. Criar snapshot/backup verificado do banco de homologação ou produção **antes de migrações**, seguindo os recursos disponíveis do provedor. Validar restauração em instância descartável, nunca sobre dados reais.
3. Gerar cópia dos parâmetros de configuração **sem expor valores**; confirmar que `DATABASE_URL` e `PIT_TEACHER_PIN` existem no destino, com CORS compatível.
4. Para rollback de front-end, restaurar o deployment anterior pela plataforma de hospedagem após aprovação. Se for necessário reverter um commit da branch de trabalho, usar `git revert <SHA>` em uma branch de correção e testar; não forçar push ou alterar `main` automaticamente.
5. Para rollback de schema, seguir plano de migração reversível validado e restaurar snapshot somente mediante autorização e janela de manutenção.
6. Reexecutar Static QA, Browser QA, verificações de downloads, login, chat, roster, revisão e liberação após qualquer rollback.

**Decisão técnica atual:** não publicar; há pendências P1 e testes editor/banco não executados. Esta auditoria registra riscos e critérios, não declara sistema homologado.
