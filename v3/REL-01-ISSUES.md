# REL-01 — Registro de problemas, regressões e critérios de bloqueio

**Branch de homologação:** `feature/pit-gamejam-v3-arcade`  
**Estado:** não pronto para publicação. `qa/v3-release-gate.cjs` enumera automaticamente os IDs pendentes e só passa em `--strict` com 59/59 `done`.

## Correções verificáveis desta rodada

| Classe | Problema | Correção | Evidência |
| --- | --- | --- | --- |
| P1 (integridade) | Era possível aprovar evidência em revisão sem novo envio | `chat-api/api/classroom.js` só permite revisão/aprovação em status `submitted`; UI não oferece aprovação durante `revision` | [Static QA 40636877700](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40636877700), [Browser QA 40637090312](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40637090312) |
| P2 (integridade do painel) | Heartbeat podia declarar missão ainda bloqueada | API agora valida `n <= current_stage` | [Static QA 40636760085](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40636760085) |
| P2 (teste) | Auditoria estática não reconhecia o helper de escape como arrow function | Expressão de detecção corrigida e Static QA verde | [Static QA 40637308970](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40637308970) |
| P1 (privacidade em dispositivo compartilhado) | O formulário genérico mantinha rascunho e checklist em chaves globais `pit_v2_draft_N` e `pit_v3_checks_N`; ao trocar de aluno no mesmo navegador, podia exibir registros de outra pessoa | `v3/app.js` agora usa chaves por `studentId` e separa prévia; teste Chrome `qa/v3-shared-device-browser.cjs` força fallback M05 e alterna dois alunos fictícios no mesmo perfil | [Correção 1cfb08c](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/commit/1cfb08c05eb6dd487c3259098d9a50382e189e95); [Static QA 40642505103](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40642505103) passou; Browser QA 40642505841 em execução no momento deste registro |

**Compatibilidade de dados:** as chaves antigas sem identificação não foram lidas, migradas nem apagadas, pois não há maneira segura de atribuir seu conteúdo ao aluno correto. O formulário genérico passa a criar novos rascunhos identificados; os módulos autorais das Missões 01–10 não foram alterados.

Para executar as verificações restantes sem falsificar resultados, usar o [protocolo de homologação manual](./REL-01-HOMOLOGACAO-MANUAL.md), que identifica casos, arquivos, versões e evidências obrigatórias.

## Impedimentos ainda abertos

- **M06-05 e FUN-08 (P1):** importar PNG/WAV/GLB e abrir/salvar starters no GDevelop real. A estrutura dos arquivos e downloads foi verificada em Node e Chrome, mas importação não.
- **M07-04 (P1):** o fluxo de backend fictício, aprovação e revisão agora possui cobertura automatizada; ainda falta Preview real de GDevelop 2D/3D.
- **M08-04 (P1):** a cobertura de navegador móvel, foco e movimento reduzido já passou em CI; falta comparação antes/depois dentro do Preview GDevelop.
- **M09-03 (P1):** o fluxo de revisão fictício passou em testes automatizados; falta observação real de teste por pares em ambiente isolado.
- **Banco isolado — verificação concluída:** [Postgres QA 40637833387](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40637833387) passou com Postgres 16 descartável, handlers reais, três alunos fictícios, aprovação, revisão, heartbeat e chat. Não representa o Neon/produção nem substitui ensaio de backup.
- **Segurança/licenças (P2):** ver `v3/SEGURANCA-ROLLBACK-FUN-10.md`, inclusive PIN, token local, auditoria de dependências e termos dos vídeos LTX experimentais.

Não foi confirmado P0 nos cenários cobertos pelos testes automatizados. Isso **não** equivale a ausência de P0 em produção.

## Regressões e release gate

Static QA executa sintaxe, conteúdos pedagógicos, assets, ZIP/GLB/WAV, handlers, segurança e gate; Browser QA executa navegação, filtros, responsividade, revisão, chat, simulações de falha e múltiplos estudantes fictícios. Evidências históricas: [Static QA 40637308970](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40637308970) e [Browser QA 40637186741](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40637186741).

Para confirmar a prontidão, executar `node qa/v3-release-gate.cjs --strict` após resolver os bloqueios. **Não** executar merge ou deploy sem autorização explícita, backup e validação final.
