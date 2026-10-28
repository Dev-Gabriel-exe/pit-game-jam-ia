# REL-01 — Registro de problemas, regressões e critérios de bloqueio

**Branch de homologação:** `feature/pit-gamejam-v3-arcade`  
**Estado:** não pronto para publicação. `qa/v3-release-gate.cjs` enumera automaticamente os IDs pendentes e só passa em `--strict` com 59/59 `done`.

## Correções verificáveis desta rodada

| Classe | Problema | Correção | Evidência |
| --- | --- | --- | --- |
| P1 (integridade) | Era possível aprovar evidência em revisão sem novo envio | `chat-api/api/classroom.js` só permite revisão/aprovação em status `submitted`; UI não oferece aprovação durante `revision` | [Static QA 40636877700](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40636877700), [Browser QA 40637090312](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40637090312) |
| P2 (integridade do painel) | Heartbeat podia declarar missão ainda bloqueada | API agora valida `n <= current_stage` | [Static QA 40636760085](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40636760085) |
| P2 (teste) | Auditoria estática não reconhecia o helper de escape como arrow function | Expressão de detecção corrigida e Static QA verde | [Static QA 40637308970](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40637308970) |

## Impedimentos ainda abertos

- **M06-05 e FUN-08 (P1):** importar PNG/WAV/GLB e abrir/salvar starters no GDevelop real. A estrutura dos arquivos e downloads foi verificada em Node e Chrome, mas importação não.
- **M07-04 (P1):** o fluxo de backend fictício, aprovação e revisão agora possui cobertura automatizada; ainda falta Preview real de GDevelop 2D/3D.
- **M08-04 (P1):** a cobertura de navegador móvel, foco e movimento reduzido já passou em CI; falta comparação antes/depois dentro do Preview GDevelop.
- **M09-03 (P1):** o fluxo de revisão fictício passou em testes automatizados; falta observação real de teste por pares em ambiente isolado.
- **Ambiente de banco (P1):** SQL em memória não é Postgres; testar transações em banco descartável, sem turma real, antes da homologação.
- **Segurança/licenças (P2):** ver `v3/SEGURANCA-ROLLBACK-FUN-10.md`, inclusive PIN, token local, auditoria de dependências e termos dos vídeos LTX experimentais.

Não foi confirmado P0 nos cenários cobertos pelos testes automatizados. Isso **não** equivale a ausência de P0 em produção.

## Regressões e release gate

Static QA executa sintaxe, conteúdos pedagógicos, assets, ZIP/GLB/WAV, handlers, segurança e gate; Browser QA executa navegação, filtros, responsividade, revisão, chat, simulações de falha e múltiplos estudantes fictícios. Evidências históricas: [Static QA 40637308970](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40637308970) e [Browser QA 40637186741](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40637186741).

Para confirmar a prontidão, executar `node qa/v3-release-gate.cjs --strict` após resolver os bloqueios. **Não** executar merge ou deploy sem autorização explícita, backup e validação final.
