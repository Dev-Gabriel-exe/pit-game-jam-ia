# Fase H.1a — Ponte de leitura das missões V3 para heróis V5 (30/10/2026)

**Status:** implementada como contrato isolado, testada em dados fictícios. **Não foi conectada à API de produção, contas reais, turmas nem à V3; não foi feito merge na main.** Os testes de hardware G.2 e a autorização de integração H.1b/H.2 ainda são gates.

## Arquivos
- `v5/student-bridge-h1.js`: lê um **snapshot previamente verificado pelo servidor** com missões `{stage,status}`, liberação `teacherCurrentStage`, build V5, alias pseudônimo `trial-...` e locks M5/M10. Reutiliza `progression-contract-h0.js` e devolve visão **sem nomes, tokens, PIN, ID de aluno, XP do cliente ou dados de turma**.
- `qa/v5-student-bridge-h1.cjs`: regressão das 4 classes, entregue/pendente versus aprovado, progresso fora de ordem, duplicações, limites, não vazamento de dados, M5 congelada e M10 travada.
- `.github/workflows/v5-student-bridge-h1-qa.yml`: CI sem banco ou credenciais.

## Decisões pedagógicas
1. Uma entrega em `submitted` torna o aluno **candidato a disponível para duelo** quando a turma está naquela missão, mas **não libera pontos, talentos ou XP**. Somente `approved` concede os 2 pontos, 1 talento e 100 XP-base da missão.
2. Para aparecer como elegível ao duelo, o aluno deve optar por isso (`duelOptIn`), ter entregue ou ter missão aprovada e estar na missão liberada da turma; o servidor ainda precisará comprovar presença, mesma turma, ausência de duelo/convite ativo e que o professor habilitou os duelos.
3. A ponte só sinaliza `duel.eligible`. Ela **não implementa convites, aceite, recusas, expiração, pareamento, WebSocket, batalha 1×1 ou interface dos alunos**. Essas partes são a próxima etapa de arquitetura de duelos.
4. M5 requer 5 aprovações e snapshot da primeira entrada; M10 exige 10 aprovações, M5 congelada e lock final. A ponte não cria locks. Deve ser o backend quem os grava atomicamente.

## Atenção: duas versões incompatíveis do herói coexistem
- API V5 **legada** `chat-api/api/arena.js` ainda usa `chat-api/lib/v5-hero-core.js`, com 6 classes, atributos `power/agility/spirit/vitality` e catálogo de talentos antigo.
- O coliseu V5 **novo** usa 4 classes (`warrior,mage,hunter,guardian`), atributos `FOR,DES,INT,VIT,DEF` e **30 talentos por classe**.
- Portanto, **não conectar diretamente a tabela `pit_hero_builds` ou o `action=build` legado ao motor novo**. Isso causaria builds inválidas ou perda de escolhas. H.1b precisa definir uma versão de schema e uma migração explícita, sem reescrever alunos reais antes de testes e autorização.
- `chat-api/api/classroom.js` já expõe progressos por missão, com status `working`, `submitted`, `revision`, `approved`; a integração futura terá de consultar esse estado apenas no backend autenticado e garantir sequência, versões e isolamento de turma.

## Próximas etapas (sem mudança de conteúdo das dez missões)
- **G.2:** validação em PCs reais da instituição antes da liberação operacional.
- **H.1b:** planejar esquema V5 versionado, credenciais/permissões reais, transações atômicas de build/lock M5 e M10, vínculos por turma e read-model de personagem; testes com banco descartável.
- **H.2:** feed de batalha e câmera sincronizados entre professor e alunos, com reconexão sem recalcular vencedores em cada cliente.
- **D.1 — Duelos:** política de convite 1×1: dois alunos da mesma turma, ambos aguardando e opt-in; um convite ativo; aceitar/negar/expirar/cancelar; sem XP, nota nem alteração das dez missões. Sincronizar uma única simulação autoritativa com ambas as telas. Disponível só quando o professor habilitar.
- **I:** ensaio completo, aprovação final e merge/publikação mediante autorização.

## CI
- Workflow: `https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/workflows/v5-student-bridge-h1-qa.yml`.
