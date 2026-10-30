# PIT Game Jam IA V5 — H.1b: armazenamento versionado de heróis (laboratório)

**Data:** 30/10/2026  
**Branch:** `feature/v5-h1b-integration-safe`  
**Estado:** código da camada de persistência preparado, **sem API pública conectada, sem acesso ao Neon da turma, sem migração aplicada e sem mudanças na `main`**.

## Por que separar o banco?

A `chat-api/api/arena.js` existente usa o motor antigo de seis classes e quatro atributos (campos `power/agility/spirit/vitality`). O Coliseu aprovado usa **quatro classes**, cinco atributos (`FOR/DES/INT/VIT/DEF`), **30 talentos por classe** e snapshots irrevogáveis nas arenas M5/M10. Misturar as duas representações na tabela `pit_hero_builds` corromperia ou descartaria escolhas.

A solução H.1b cria **`pit_hero_builds_v2`**, mantendo integralmente `pit_hero_builds` e `pit_peer_reviews`. Não tenta migração automática das builds antigas, porque não existe tradução equivalente entre os talentos.

## Implementação

- `chat-api/lib/v5-phase2-talent-ids.json`: catálogo v2 dos **120 IDs de talentos** espelhado a partir de `v5/phase2-combat.js`; CI compara todos os IDs e rejeita divergência.
- `chat-api/lib/v5-build-v2-contract.js`: regras de domínio puras, progressão sequencial validada, 2 pontos e 1 talento por missão aprovada, proteção contra payload legado e extra, congelamento da M5 e lock da M10.
- `chat-api/lib/v5-builds-v2-repository.js`: adaptador PostgreSQL **ainda não invocado pela API**. Só aceita identidade **pré-autenticada pelo servidor**; confirma associação `student_id`/turma; lê aprovação/estado do professor no servidor; usa transação e bloqueio por aluno, bloqueio de linhas de missão e `revision` (compare-and-swap) para impedir salvamentos concorrentes. Respostas não incluem nome, token, PIN ou ID de aluno.
- `v5/migration-h1b-builds-v2.sql`: migração **aditiva**, com `schema_version=2`, classe permitida, JSON de talentos/atributos, snapshots M5/M10, integridade de locks, turma, revisão e FK do aluno.
- `qa/v5-builds-v2-h1b.cjs`: casos de borda do contrato e da persistência com driver PostgreSQL simulado.
- `qa/v5-builds-v2-sql-smoke.sh`: cria tabelas fictícias em PostgreSQL 16 descartável, aplica a migração duas vezes e testa restrições.
- `.github/workflows/v5-builds-v2-h1b-qa.yml`: CI Node + PostgreSQL 16 descartável, sem credenciais da instituição.

## Regras preservadas

1. Somente registros **`approved` do servidor**, consecutivos, liberam o orçamento; `submitted` não gera XP ou talentos, apenas pode permitir elegibilidade para duelo em espera.
2. Classe escolhida fica fixa após a criação do registro v2; a build pode ser redistribuída antes da primeira entrada M5. A M5 exige cinco aprovações, **5 talentos e 10 pontos distribuídos**, e grava snapshot em transação.
3. Após M5, a atualização deve preservar todas as escolhas congeladas. M10 requer dez aprovações, **10 talentos e 20 pontos**, e grava lock final irreversível.
4. Cliente manda apenas build ou pedido de lock e a revisão esperada; **nenhum nome, XP, turma, PIN ou contagem de aprovações enviado pelo navegador é autoridade**.
5. Revisão divergente devolve conflito para a interface pedir atualização; repetição de lock já confirmado é idempotente.
6. O professor continua sendo a única autoridade de liberação e aprovação. Nenhuma lógica de notas, conteúdo ou ordem das dez missões foi alterada.

## O que ainda NÃO foi feito

- Nenhum endpoint V2 autenticado foi implantado; V3, API legada e alunos reais permanecem **sem ligação** com essa camada.
- Nenhum `ALTER TABLE`, `CREATE TABLE` ou `INSERT` foi executado no Neon real.
- Ainda não há convites 1×1, presença entre dispositivos, pareamento, transmissão de batalha ou resultados sincronizados.
- Não houve teste nos PCs físicos da instituição (G.2), nem integração entre duas máquinas reais.

## Gatilhos para a próxima fase

**H.1c** (somente após validar G.2 e obter autorização explícita de integração operacional): criar endpoint V2 autenticado isolado, adaptar interface do aluno/professor ao novo esquema e testar em banco de homologação. Separar `pit_hero_builds_v2` do endpoint antigo e exigir `revision` em toda escrita.

**Duelos D.1:** definir estados `available → invited → accepted/declined/expired → fighting → finished`, checar mesma turma e espera em ambas as pontas, permitir opt-in e controle docente; impedir múltiplos convites concorrentes e sincronizar **uma simulação autoritativa**. Duelo não dá XP nem altera a build.

**Final:** homologar 30 PCs e operação em duas máquinas, depois ensaio completo e aprovação para merge/deploy. Manter rollback em produção.
