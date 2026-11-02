# PIT Game Jam IA — Auditoria de integração segura e congelamento de aula

**Data:** 02/11/2026, antes da oficina das 19h (America/Fortaleza).
**Escopo desta auditoria:** somente leitura da `main` e das 32 outras branches listadas pelo GitHub; documentação escrita **exclusivamente** em `feature/pit-gamejam-v3-arcade`.
**Estado:** REVISÃO TÉCNICA, NÃO É APROVAÇÃO DE MERGE/DEPLOY. Não atualizar banco de produção nem turma real.

## Política de proteção do trabalho de outros agentes

1. A `main` é a referência operacional atual. **Não** executar `merge` da V3/V5, `reset --hard`, `push --force`, `git checkout <branch> -- aluno-v3.html professor-v3.html v3/app.js index.html`, reverter commits de outros agentes ou copiar arquivos inteiros.
2. As branches experimentais **não** são prova de publicação, nem de conexão aluno/professor em tempo real. Não mover funcionalidades de laboratório para produção por dedução.
3. Uma integração de última hora deve ser **patch mínimo em branch de homologação, nunca diretamente na main**; preservar os scripts/hubs/estilos da main e aplicar apenas as linhas necessárias, com diffs revisados e testes por SHA. Se um item ficar duvidoso, mantê-lo isolado em vez de comprometer a oficina.
4. Sem credenciais, estudantes reais, dados de chat, XP de produção ou migrações para testar. Manter rollback simples em caso de erro. **Congelar integrações antes das 19h.**
5. O PR #23 (V3→main) permanece rascunho e não deve ser mesclado automaticamente.

## Inventário GitHub realizado (02/11; números voláteis)

O GitHub retornou **33 branches no total**, incluindo `main`. As comparações abaixo são do GitHub `main...branch`, não medem funcionalidades prontas; contagem de commits diverge com novas ações dos agentes.

| Origem | Exclusivos da branch | Exclusivos da main | Leitura de risco |
| --- | ---: | ---: | --- |
| `feature/pit-gamejam-v3-arcade` | 773 | 90 | Material professor/aluno e backend pedagógico; telas divergentes da main; jamais merge completo |
| `feature/v5-arena-dos-criadores` | 1063 | 21 | Motor/visual e experimento de fila VFX M10, sem homologação com turma real |
| `feature/v5-homologacao-20261031` | 862 | 21 | APIs e experimentos de duelos/forja, testes fictícios; difere da linha de arena |
| `feature/v5-h1e-v3-integracao-domingo` | 764 | 21 | Ponte de integração experimental, requer alinhamento com main |
| `feature/v5-duelos-d1c` | 749 | 21 | Duelos; ancestral de H1E (H1E tem 15 commits adicionais sobre D1C) |
| `feature/v5-duelos-d1b` / `feature/v5-duelos-d1a` | 727 / 700 | 21 | Etapas históricas de D1, não substituir a integração mais recente |
| `feature/v5-h1b-integration-safe` | 686 | 21 | Armazenamento/contratos de laboratório, não base de deploy |
| `feature/pit-gamejam-v5-arena-rpg` / `feature/pit-gamejam-v5-arena` | 31 / 17 | 21 | Protótipos anteriores, alto risco de retroceder visual e mecânica |
| `feature/pit-gamejam-v5-classes-3d-real` | 46 | 21 | Variante histórica de personagens 3D; não substituir os quatro KayKits padronizados |
| `feature/v5-talentos-cinematograficos-20261031` | 0 | 0 | Idêntica à main no instante da comparação; nada a transportar |
| `feature/m01-projecao-continua-20261028` | 141 | 90 | Outra linha de projetor, não sobrepor apresentação recente da main |

**Demais 19 branches verificadas (não detalhadas na tabela):**
`experiment/ltx-missions-01-10`,
`experiment/missao-01-cinematic-footage`,
`experiment/missao-01-gothic-motion`,
`experiment/missao-01-hyperframes`,
`experiment/missao-01-ltx-anon`,
`feature/apresentacao-oficina-aluno-alinhada-20261028`,
`feature/biblioteca-cc0-real-20261028`,
`feature/cinematics-ltx-library-20261028`,
`feature/comparativo-hero-3-videos-20261028`,
`feature/gothic-typography-v3-20261028`,
`feature/liberacao-missoes-motion-20261028`,
`feature/ltx-cinematic-slides-v3-20261028`,
`feature/m01-oficina-7-telas-20261028`,
`feature/oficina-projetada-10-missoes-20261028`,
`feature/portal-hero-cinematico-parallax-20261028`,
`feature/portal-ltx-longer-muted-20261028`,
`feature/portal-planeswalker-video-20261028`,
`feature/projetor-continuo-m02-m10-20261028`,
`fix/biblioteca-principal-3d-visivel-20261028`.
As linhas LTX/motion e de portal são históricas/experimentais e algumas estão centenas de commits atrás da main; não integrar por árvore inteira. O inventário total é de 33 branches (main + 13 origens na tabela, contando as duas linhas agrupadas por branch, + 19 outras).

## Diferenças críticas verificadas em código, não só em documentação

### P0 — Identidade de classes e talentos incompatível

Na main, `chat-api/lib/v5-hero-core.js` define **seis** classes: `warrior,mage,hunter,guardian,rogue,necromancer`, com catálogo legado. A arena nova `v5/phase2-combat.js` define **quatro**: `warrior,mage,hunter,guardian`, com 30 talentos por classe (120 no total) e atributos `FOR/DES/INT/VIT/DEF`.

**Não conectar diretamente a API `/api/arena` legada a builds KayKit/Phase2** nem aplicar migração V5 sem adaptador explícito, tradução de schema, validação servidor e teste do fluxo real.

### P0 — Liberação professor, XP e duelos

`main/chat-api/api/duel-v2-lab.js` desabilita o endpoint **em produção** mesmo se a flag for ativada. `main/v5/teacher-arena-release-lab.js` declara literalmente `FICTIONAL LAB ONLY`; sua liberação é local e não autentica professor real. `main/v3/v5-h1e-bridge.js` usa iframes de prévia/laboratório e não expõe credenciais de alunos ao frame.

**Logo:** Chrome, Node, replay, 30 modelos simulados e testes de API fictícia não provam notificação SIM/NÃO real, duelo compartilhado, XP persistido ou botão M5/M10 realmente liberado para uma turma. NÃO anunciar como integração operacional pronta.

### P0 — Risco de sobrescrever funcionalidades do portal/professor

As páginas atuais da **main** contêm recursos ausentes dos HTML da V3:

- `aluno-v3.html`: `pitV5HubButton`, `fantasy-unified.css`, `gothic-typography-v3.css`, `v5-h1e-bridge.css/js`.
- `professor-v3.html`: hub V5 e várias camadas de apresentação/projetor já integradas (`teacher-projector-universal-workshop`, `teacher-projector-m01-workshop`, `teacher-cinematic-stage`, etc.).
- `index.html`: `portal-cinematic.css/js` e `library-open-assets.css/js`.

**Não substituir esses três HTML da main por versões V3.** Transportar melhorias pedagógicas por módulos/linhas, preservando a ordem de carregamento de CSS/JS, elementos de UI, acessibilidade e compatibilidade.

### P1 — Evidências: truncamento silencioso ainda presente na main

`main/chat-api/api/classroom.js` usa `clean(req.body?.evidence,750)`, que remove quebras de linha e corta conteúdo. Na V3, `cleanEvidence()` preserva LF, rejeita explicitamente acima de 750 e protege a recuperação das evidências estruturadas. A API na main já usa liberação **monotônica por missão** (`GREATEST`, avanço +1); **não portar novamente todo o handler V3**. Um patch pontual futuro da evidência precisa de regressão contra o contrato atual de progresso/XP, após checagem de compatibilidade.

A V3 também protege caminho `state === null` de sala não inicializada em `progress` e `stage` com HTTP 503. A main ainda pode responder 500 ou 409 nesses pontos. Isolar esses três pequenos diffs antes de considerar integração; jamais mexer no banco ao testar.

### P1 — QA do último SHA

V3: checkpoint `v3/AGENTE-V3-ESTADO.json` verificado em 02/11 às 14h19 UTC: 54/59, auditoria M10 de URLs, 15/15 verificações V8 registradas; CI Node e Browser no último commit ainda **não confirmadas**.
V5: relatório de fila VFX M10 registra um teste WebGL que falhou sob saturação (47 cues aceitos / 335 rejeitados antes de uma nova tentativa experimental); a correção posterior não pode ser presumida verde sem novo run.
Main: status combinado legado não devolveu checks; isso **não significa** CI aprovado ou reprovado. Conferir Actions no SHA exato.

### P1 — Projeto no GDevelop e projeção

Não afirmar testes humanos feitos: HDMI físico, 30 PCs reais, GDevelop GUI, tokens/contas reais e ensaio end-to-end V3+V5 não executados nesta auditoria. Preservar notas privadas fechadas por padrão em `details.pit-private-teacher-notes` com ícone `▤`, mas a segurança exige também tirar o HDMI antes de abrir. Os scripts de proteção existem em main e V3; não apagar.

## Ordem de integração recomendada (somente após autorização e em branch de homologação, com agentes coordenados)

1. **Congelar SHA da main e confirmar que não há pushes concorrentes.** Anotar quais entregas já estão na main para não repetir trabalho.
2. **Salvaguardar páginas e arquivos de entrada da main:** `index.html`, `aluno-v3.html`, `professor-v3.html`, `v3/app.js`, `chat-api/api/{classroom,arena,chat}.js`, `v5/phase2-combat.js` e `v5/arena-three.js`; comparar `git diff` antes/depois.
3. **Selecionar apenas melhorias pedagógicas independentes** (módulos `v3/student-mission-*.js`, `v3/teacher-mission-*.js`, QA), sem sobrescrever pontos de entrada ou contratos de API. Conferir dependências e ordem das importações.
4. **Reconciliar backend pontualmente**: integridade de evidências/503, preservando liberação por missão, revisões, autenticação, CORS e queries. Rodar PostgreSQL 16 descartável e teste de compatibilidade com mocks V5.
5. **Não habilitar novos duelos/arena real** sem backend autoritativo coerente com 4 classes/120 talentos, autorização docente M5/M10, migrações revistas, opt-in controlado e teste multi-navegador. As ferramentas de laboratório podem continuar isoladas.
6. **Gates:** Node/static QA, Chrome browser QA, PostgreSQL descartável, 3 alunos fictícios (duas janelas + professor), mensagens e imagens, missão liberada→rascunho→evidência→revisão→aprovação→XP, M5/M10 acessos bloqueados se não liberados, 30 jogadores em hardware real se usado.
7. Se algum teste falhar, **não publicar**. Se aprovado, apresentar PR pequeno para revisão com lista exata de arquivos. Fazer a liberação **antes das 19h** somente após confirmação do responsável e com tempo para rollback; caso contrário, usar a main atual e deixar experimentos para depois.

## Relatório operacional

- 33 branches inventariadas; pares críticos comparados com a API GitHub; arquivo por arquivo verificados: HTML aluno/professor/portal, `v3/app.js`, `chat-api/api/classroom.js`, `chat-api/lib/v5-hero-core.js`, `v5/phase2-combat.js`, `v5/teacher-arena-release-lab.js`, `v3/v5-h1e-bridge.js`, `v5/arena-three.js`.
- **Teste realmente feito nesta rodada:** comparação de repositório, inspeção estática e identificação de incompatibilidades. Nenhum Node/Chrome/WebGL/PostgreSQL foi executado nesta auditoria; CI citadas são históricos documentados e não validação do SHA de hoje.
- **Modificações desta rodada:** somente este relatório no branch V3; `main`, infraestrutura V5, deploy e dados preservados.
- Este relatório não substitui o contrato anterior `v3/INTEGRACAO-V3-V5-2026-11-01.md`.
