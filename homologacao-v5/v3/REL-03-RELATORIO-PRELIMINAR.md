# REL-03 — Relatório preliminar de auditoria (NÃO FINAL)

**Data da verificação:** 28/10/2026  
**Branch pedagógica:** `feature/pit-gamejam-v3-arcade`  
**Branch de vídeo:** `experiment/ltx-missions-01-10`  
**Decisão:** **NÃO PUBLICAR / NÃO FAZER MERGE**. Este documento será convertido em relatório final apenas quando os 59 critérios forem realmente concluídos.

## Resultado atual e rastreabilidade

O checkpoint `v3/AGENTE-V3-ESTADO.json` registra **52 de 59 metas como `done`** após REL-02. Os IDs bloqueados são M06-05, M07-04, M08-04, M09-03, FUN-08, REL-01 e REL-03. O relatório permanece preliminar. O gate `qa/v3-release-gate.cjs --strict` **deve falhar** enquanto houver qualquer tarefa pendente; a execução diagnóstica sem `--strict` lista as pendências.

### Funcionalidades verificadas em ambiente isolado

| Recurso | Evidência | Limite |
| --- | --- | --- |
| Cadastro/sessão | [Static QA FUN-02](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40635407764) e [Browser QA](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40635407765) | SQL em memória e API HTTP falsa |
| PIN e permissões | [Static QA FUN-03](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40635705516) | PIN fictício, sem Postgres real |
| Liberação de missões | [Browser QA FUN-04](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40635953139) | Atualização testada por recarga, não em turma real |
| Evidências 01–10 | [Static QA FUN-05](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40636673696) | Handler real com SQL descartável, não editor GDevelop |
| Roster e heartbeat | [Static QA FUN-06](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40636760085) e [Browser QA](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40636789133) | Três alunos fictícios |
| Chat bidirecional | [Static QA FUN-07](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40636877700) | Falha de rede simulada |
| Downloads e GLB | [Static QA FUN-08](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40636997100); [Khronos GLB QA 40649579075](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40649579075) | 28 MIME/assinaturas e 5 GLBs validados semanticamente (0 erros, 0 avisos); importação no GDevelop não executada |
| E2E três alunos | [Browser QA FUN-09](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40637186741) | 2D/3D via fixture HTTP, não jogos reais |
| Postgres 16 descartável | [Postgres QA 40637833387](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40637833387) | Handlers reais e transações com 3 alunos fictícios; não Neon/produção |
| Segurança/regressão | [Static QA FUN-10](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40637308970) | Auditoria estática; não é pentest |

### Prova adicional no GDevelop nativo (28/10/2026)

A [execução isolada 40657474661](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40657474661) usou **GDevelop Linux 5.6.285**, projeto oficial GDevelop-examples fixado no commit `0648e82703e81f12f33b65ef4777e1fd02d7666b`, e dois projetos descartáveis gerados por `qa/v3-gdevelop-native-fixture.cjs`. O motor executou **8/8 testes de jogabilidade**, incluindo carregamento de PNG original do PIT no 2D, GLB original no 3D e **condição de vitória negativa/positiva/persistente em eventos reais do GDevelop** em ambos os projetos. A condição também dispara uma ação nativa `PlaySound` usando o WAV do PIT; o log não registrou erro de áudio, mas não houve escuta nem medição de saída sonora. O validador `qa/v3-gdevelop-native-results.cjs` confirmou resultados e screenshots reais; as duas imagens foram inspecionadas visualmente nesta auditoria, com o sprite 2D e o cristal 3D aparecendo na cena. A [Browser QA 40656562279](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40656562279) confirmou decodificação efetiva de **5 WAV** (Web Audio) e **4 PNG** (Image/canvas) no Chrome.

O [manifesto de evidências SHA-256](../qa/evidence/native-gdevelop-2026-10-28.json) preserva os hashes dos arquivos e capturas da execução 40657474661.

**Limites:** a inserção nos projetos foi programática, não por interface de importação do editor; WAV foi acionado por evento GDevelop, mas sem teste de audibilidade; não houve salvar/reabrir projeto manual, dispositivo físico ou playtest humano. Esses critérios continuam bloqueados. Os screenshots e JUnit estão no artifact da execução, com retenção temporária.

### Hospedagem e URLs

- [Portal GitHub Pages](https://dev-gabriel-exe.github.io/pit-game-jam-ia/): GET HTTP 200 em probe somente leitura [40635164103](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40635164103). O Pages publica a branch `main`; não representa esta V3 em desenvolvimento.
- [Prévia estática do aluno V3](https://raw.githack.com/Dev-Gabriel-exe/pit-game-jam-ia/feature/pit-gamejam-v3-arcade/aluno-v3.html?preview=1): sem autenticação ou API real; não é produção.
- [Prévia experimental do carrossel com LTX](https://raw.githack.com/Dev-Gabriel-exe/pit-game-jam-ia/experiment/ltx-missions-01-10/aluno-v3.html?preview=1): apenas demonstração, branch separada.
- API `https://pit-game-jam-chat.vercel.app/api/`: testes públicos **somente leitura** de health e OPTIONS CORS em [40635164103](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40635164103); nenhum cadastro, envio ou aprovação real foi feito.

### Vídeos LTX experimentais

Em `experiment/ltx-missions-01-10`, o status `ops/ltx-status.json` e `v3/motion-manifest.js` registram `ready=[1,2,3,4,5,6,7,8,9,10]`. A API de arquivos do GitHub confirmou a presença dos dez MP4s `v3/assets/missions/missao-XX-motion.mp4` (135.406 a 460.277 bytes), sem necessidade de novo disparo. **Não houve inspeção visual manual individual, verificação de direitos para uso comercial ou merge desses vídeos na branch pedagógica.**

## Correções importantes

- Revisão não pode ser aprovada sem novo envio: `chat-api/api/classroom.js` e UI do professor ajustados, com testes.
- Heartbeat de missão futura rejeitado (403) para não falsear o painel.
- Testes de MIME/GLB/WAV/ZIP, três sessões fictícias e falha HTTP simulada adicionados.
- Guia operacional do professor incluído como página estática com atalho no painel.
- Corrigida a exposição cruzada de rascunhos/checklists do formulário genérico quando dois alunos fictícios compartilham um navegador; agora as chaves são isoladas por identificador. Acrescentada ação de sair/trocar na navegação de aluno/professor e rolagem contida em 768px. [Static QA 40643089008](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40643089008) e [Browser QA 40643089001](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40643089001) passaram. Chaves legadas sem proprietário continuam armazenadas, mas não são exibidas nem migradas automaticamente.

### Teste isolado de editor e robustez do chat (28/10/2026)

O teste `qa/v3-gdevelop-editor-smoke.cjs` tentou abrir os starters oficiais 2D e 3D no editor web real, sem criar conta. A [execução 40649114129](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40649114129) recebeu HTTP 200, porém mostrou a página de entrada (“Log in”, “Sign up”, “Start for free”), sem disponibilizar o botão Preview; portanto **o Preview e a importação continuam NÃO EXECUTADOS**. Capturas e diagnóstico foram preservados no artifact do workflow. Nenhum cadastro foi criado e nenhum serviço pago foi utilizado.

A consulta do histórico do chat do professor passou a usar o helper autenticado compartilhado, com timeout, proteção de prévia e tratamento uniforme de erros; o E2E verifica `studentId` da conversa. [Browser QA 40649326459](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40649326459) e [Static QA 40649326394](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40649326394) passaram.

## Bloqueios e próxima decisão

Ver `v3/REL-01-ISSUES.md`, `v3/REL-01-HOMOLOGACAO-MANUAL.md` e `v3/SEGURANCA-ROLLBACK-FUN-10.md`. Antes de homologar, é necessário executar importação e Preview no GDevelop, observação de revisão por pares, avaliação dos direitos dos MP4s e ensaio de backup/rollback. O professor pode avaliar o material em prévia, mas a aprovação para publicação deve ser explícita e posterior a esses critérios.

**Estado final de homologação ainda NÃO alcançado.** Não alterar `status` para `READY_FOR_FINAL_REVIEW` ou `READY_FOR_FINAL` enquanto o gate estrito não passar.
