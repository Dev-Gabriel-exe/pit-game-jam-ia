# H.1b / H.2 — Preparação da integração, SEM CONECTAR ALUNOS REAIS

**31/10/2026 · branch `feature/v5-arena-dos-criadores` · laboratório isolado.**

## Resultado desta fase

1. **H.1b: `v5/build-lock-cas-h1b-lab.js`** — máquina de transações *pura* com revisão otimista, chaves de idempotência, snapshot da primeira entrada M5, aprovações sequenciais e trava final M10. O teste `qa/v5-build-lock-cas-h1b.cjs` executa replays, concorrência simulada, tentativas de alterar atributos/talentos congelados e rejeição de alterações após a M10.
2. **H.2: `v5/shared-arena-feed-h2-lab.js`** — um **único** motor experimental `phase2-combat.js`, um diretor de câmera `camera-director.js` e três receptores *somente de leitura*. Recebem quadros numerados, sem builds nem nomes reais, e compartilham sempre o mesmo vencedor, tempo lógico e plano de câmera. Os receptores nunca chamam `battle()`.
3. **Reconexão fictícia:** `since(cursor)` retorna os quadros faltantes se ainda estão disponíveis; se o histórico circular ficou para trás, sinaliza `resetRequired` e entrega um snapshot do mesmo emissor. Duplicatas idênticas são ignoradas, alterações para o mesmo número de sequência e quadros fora da turma/partida são rejeitados. Há validação contra retrocesso de tempo e de revisão da câmera.
4. **CI:** `.github/workflows/v5-build-lock-cas-h1b-qa.yml` e `.github/workflows/v5-shared-arena-feed-h2-qa.yml`, ambos com testes Node determinísticos.

**Isto NÃO é sincronização real via WebSocket ou SSE, nem conexão com o banco.** Os receptores são objetos em memória no mesmo processo; os atores `trial-student` e `trial-teacher` não autenticam ninguém. A lógica de proteção não substitui autorização no backend.

## Auditoria do backend existente (somente leitura)

- `chat-api/api/classroom.js` já identifica o aluno pelo `X-PIT-Student-Token` (hash SHA-256 consultado na tabela `pit_students`) e o professor por `X-PIT-Teacher-Pin`. O estado da turma fica em `pit_classroom_state`; evidências em `pit_student_stages` com `working/submitted/revision/approved`. Não há configuração multi-turma genérica: o código atual usa `ROOM='PITGAME26'`.
- `chat-api/api/arena.js` grava builds antigas em `pit_hero_builds` e calcula heróis com `chat-api/lib/v5-hero-core.js`: **schema legado incompatível**, com seis classes e outros atributos/talentos. NÃO reutilizar essa tabela como armazenamento das quatro classes canônicas da nova arena.
- `v5/progression-contract-h0.js` e `v5/student-bridge-h1.js` existem, mas são validadores puros. Eles recebem snapshots em formato `trial-*` e não conferem identidades, permissões ou transações SQL.

## Proposta de armazenamento V5 — somente para revisão, NÃO executar agora

A futura migração deve **criar novas tabelas**, sem alterar `pit_hero_builds`, `pit_students`, `pit_student_stages` ou as notas reais. Segue o desenho lógico, não uma migração aplicada:

| Nova tabela proposta | Conteúdo mínimo | Proteção indispensável |
|---|---|---|
| `pit_v5_hero_builds_v2` | `student_id` (FK), `room_code`, `schema_version`, `klass`, `attributes JSONB`, `talents JSONB`, `revision BIGINT`, `m5_entered`, `m5_frozen JSONB`, `m10_locked` | `UNIQUE(student_id,room_code)`, CHECK de classe/JSON, lock de linha e revisão CAS em toda escrita |
| `pit_v5_build_commands` | `student_id`, `command_key`, `request_digest`, `result_revision`, `created_at` | `UNIQUE(student_id,command_key)` para repetição idempotente na mesma transação |
| `pit_v5_arena_matches` | `id`, `room_code`, `mission`, `status`, `seed`, `leader_epoch`, `release_revision`, `entrants_snapshot JSONB`, `result JSONB` | Uma partida ativa por turma e missão; só professor autenticado libera/inicia/interrompe |
| `pit_v5_arena_frames` | `match_id`, `seq`, `logical_time`, `combat_snapshot JSONB`, `camera_snapshot JSONB` | `PRIMARY KEY(match_id,seq)`, append-only, acesso limitado a membros da mesma turma |

Regras que deverão ser implementadas no serviço real:

1. **Todas as decisões no servidor**, nunca por flags `teacherEnabled`, `approvedMissions`, `m5Frozen`, `duelOptIn` ou `ready` enviados pelo navegador. Ler aprovações do banco com filtros `student_id + room_code + status='approved'` em ordem; reconciliar dados de turma e status antes de conceder pontos.
2. **M5 atômica:** abrir transação; validar sessão; bloquear a linha da build com `SELECT … FOR UPDATE`; conferir `revision`, cinco aprovações e catálogo; gravar `m5_frozen` igual à build naquele instante e `m5_entered`; registrar chave idempotente; confirmar. Uma requisição duplicada com o mesmo digest devolve a revisão original; com payload diferente, erro.
3. **M10 atômica:** conferir dez aprovações, `m5_frozen` preservado, talentos de classe e vinte pontos máximos; travar `m10_locked` no mesmo commit de revisão. Depois disso rejeitar qualquer alteração de talento/atributo, incluindo reordenações não autorizadas.
4. **Partida autoritativa única:** criar `match_id` e snapshot imutável dos participantes; usar lock/lease com *fencing token* (`leader_epoch`) para evitar dois workers calculando o mesmo torneio. Somente o líder persiste frames sequenciais e vencedor. Os espectadores apenas reproduzem quadros, nunca executam `battle()`.
5. **SSE/WebSocket autenticado posteriormente:** verificar professor/aluno com o backend, conferir pertencimento à sala e à partida em toda inscrição; distribuir `matchId,seq,combat,camera` com cursor de reconexão. Proibir `student_id`, token, PIN e dados de evidência no payload público. Limitar histórico, taxa e tamanho de mensagens.
6. **Releases por etapas:** banco descartável primeiro; ensaio com duas sessões virtuais; depois computadores da oficina e aceite G.2; só então uma versão de homologação com contas reais **mediante autorização do usuário**. Nunca executar DDL, alterar `main` ou lançar serviço sem esse gate.

## Como testar o laboratório atual

- `node qa/v5-build-lock-cas-h1b.cjs`
- `node qa/v5-shared-arena-feed-h2.cjs`

Os testes não usam `DATABASE_URL`, não geram XP e não abrem porta de rede. A matriz H.2 cobre M5/M10 com três visualizadores passivos; também verifica um frame com 30 heróis, invalidação de pacotes forjados, perda de sequência, reconexão e replays idênticos.

## Limites restantes

- **G.2:** medição dos PCs físicos da oficina com 30 GLBs reais, FPS/P10, câmera e arquibancada — ainda não feito.
- **H.1b operacional:** migração SQL, autenticação, transação e versionamento reais — não feitos.
- **H.2 operacional:** serviço único, transmissão, autorização, lease e reconexão entre dispositivos — não feitos.
- **H.1/H.2/I final:** vincular o professor e os alunos ao fluxo V3 e publicar somente com teste e aprovação explícita.

Os arquivos do laboratório não têm permissão nem dependência para modificar alunos, XP, notas, turmas ou banco. Nenhum deploy/merge.


## Checkpoint M10/H.2 — fluxo integral de 30 participantes (31/10/2026)

**Missão técnica concluída como QA isolado:** cobrir a lacuna do teste H.2 anterior, que verificava somente um quadro da M10 com 30 personagens. Nenhuma mudança no motor, câmera, estatísticas, KayKit, progresso pedagógico ou backend.

- **Arquivos:** `qa/v5-m10-h2-fullstream.cjs` e `.github/workflows/v5-m10-h2-fullstream-qa.yml`.
- **Commit de implementação/CI:** `7a657ab33b4fd271bd8c64ef33cbed3b2921766c` (precedido pelo teste `af197fc` e correção do cursor `f33c47d`).
- **CI verde:** [GitHub Actions 41206733096](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41206733096). Os quatro comandos do job passaram: sintaxe, fluxo integral 30, regressão H.2 M5/M10 e regressão do motor M10.
- **Evidência do log:** M10 com 30 heróis fictícios, 10 talentos e 20 pontos por build, 4 classes KayKit/120 talentos disponíveis no catálogo, **339 quadros sequenciais**, 3 receptores passivos, 1 motor por partida, histórico limitado a 8 quadros, recuperação por backlog e por snapshot após perda prolongada, câmera `overview/duel/highlight/climax/victory`, vencedor e replay idênticos com a mesma seed. O teste não alega que os 120 talentos sejam ativados numa única partida.
- **Preservação:** testes existentes de M5 (5 talentos/10 pontos) e M10 passaram. Nenhuma chamada a rede, autenticação, banco, turmas, notas ou XP. Nenhum merge nem deploy.

**Próxima tarefa permitida:** endurecer o contrato do receptor H.2 contra quadros sintéticos semanticamente impossíveis (ex.: ressuscitar lutador, trocar classe ou vencedor), com testes negativos e compatibilidade com as transições reais do motor, ainda inteiramente fictício. Não ligar SSE/WebSocket, dados reais ou V3.

**Gates não concluídos:** G.2 (FPS/P10 nos PCs físicos da escola), autorização explícita para H.1/H.2 operacionais, homologação professor/alunos e merge final. CI no GitHub não equivale a teste em hardware físico.
