# Auditoria V4 — Inventário inicial das 20 faces

**Data:** 28/10/2026 · **Estado:** INVENTÁRIO DE ARQUIVOS, **não** aprovação pedagógica. A avaliação qualitativa exige ler os fluxos e testar cada tela. O roadmap mestre é `ROADMAP-V4-PEDAGOGIA-E-EXPERIENCIA.md`.

| Missão | Arquivos-base professor | Arquivos-base aluno | Auditoria pedagógica |
|---|---|---|---|
| M01 | `teacher-content.js`, `teacher-mission-one.js`, `teacher-mission-one-pro.js` | `mission-one.js` | Correção pedagógica inicial implementada; QA e revisão integral pendentes |
| M02 | `teacher-mission-two.js` | `student-mission-two.js` | Orientações operacionais corrigidas; QA/homologação pendentes |
| M03 | `teacher-mission-three.js` | `student-mission-three.js` | Corrigidos tempo, abertura do editor e roteiro privado; QA de regressão em verificação |
| M04 | `teacher-mission-four-foundations.js`, `teacher-mission-four-validation.js` | `student-mission-four.js` | Auditoria de projeção e acesso ao editor corrigida; QA da alteração em execução, homologação humana pendente |
| M05 | `teacher-mission-five-foundations.js`, `teacher-mission-five-validation.js` | `student-mission-five.js` | Capítulo, roteiro reservado de avaliação e abertura explícita do GDevelop corrigidos; QA/CI em verificação, homologação humana pendente |
| M06 | `teacher-mission-six-foundations.js`, `teacher-mission-six-matrix.js`, `teacher-mission-six-validation.js` | `student-mission-six.js` | Corrigidos editor, ordem do tutorial, notas reservadas e fluxo de avaliação; QA de navegador e homologação humana pendentes |
| M07 | `teacher-mission-seven-foundations.js`, `teacher-mission-seven-validation.js` | `student-mission-seven.js` | Pendente |
| M08 | `teacher-mission-eight-foundations.js`, `teacher-mission-eight-validation.js` | `student-mission-eight.js` | Pendente |
| M09 | `teacher-mission-nine-foundations.js`, `teacher-mission-nine-validation.js` | `student-mission-nine.js` | Pendente |
| M10 | `teacher-mission-ten-foundations.js`, `teacher-mission-ten-validation.js` | `student-mission-ten.js` | Pendente |

**Atenção:** esta é a relação inicial de módulos de missão, não um inventário exaustivo de dependências. Há arquivos transversais (como `app.js`, `teacher-gdevelop-guide.js` e tutoriais GDevelop específicos) que precisam entrar na leitura e no teste de cada missão. A presença de arquivo não demonstra qualidade, funcionamento, clareza nem alinhamento entre professor e aluno.

## Critérios a preencher por face

| Campo | Pergunta |
|---|---|
| Conceito | É explicado na própria tela em linguagem simples, com analogia e exemplo? |
| Onde | Ferramenta, página, menu, botão e campo são localizáveis? |
| Como | O usuário consegue executar sem explicação oral nem preparo prévio? |
| Teste | Há resultado esperado e correção de erro comum? |
| Evidência | O aluno sabe exatamente o que enviar e como? |
| Sincronia | Professor e aluno veem o mesmo objetivo e critérios compatíveis? |
| Acessibilidade | Teclado, mobile, leitura e movimento são adequados? |

**Próximo passo executável:** abrir M01 nos dois perfis, inspecionar seus módulos e transversais, registrar falhas com arquivo/trecho e corrigir código com testes; repetir M02→M10 antes de priorizar estética.

## M01 — Primeira correção fundamentada

- **Aluno:** o formulário já tinha sete campos, prévia dinâmica, validação, rascunho local e envio. Faltava uma explicação operacional completa e concentrada: onde preencher, ordem dos campos, como conferir os três fragmentos e a distinção entre rascunho e entrega. Adicionado bloco de orientação diretamente à tela de construção em `mission-one.js` (commit `0496f8369e0983c8501fb3ec5e6d9fb4c0ce5865`).
- **Professor:** a versão universitária já continha conceitos de game design, exemplos, simulador e critérios. Faltava espelhar o percurso exato do aluno e os problemas típicos de envio. Adicionado guia operacional integrado à prática em `teacher-mission-one-pro.js` (commit `01df255b772877046dae22ca44902c2a2f0a0306`).
- **Ainda não concluído:** testar renderização das duas faces no navegador, conferir o fluxo real de envio/liberação e auditar os demais conteúdos da M01. Não marcar a missão como totalmente homologada.

## M02 — Correção operacional inicial

- Aluno: fluxo MVP com cena, mecânica, exatamente três elementos, teste Dado/Quando/Então e backlog opcional já existia, mas faltava roteiro concentrado com local, passos, conferência e envio. Acrescentado na prática (`student-mission-two.js`, `05ada5b8fd485fc9943096e1c73935d9d559cbc9`).
- Professor: conceitos de MVP, MoSCoW, vertical slice e simulador já existiam, mas a prática não espelhava explicitamente os botões e o procedimento do aluno. Incluído guia de execução, avaliação e recuperação de erros (`teacher-mission-two.js`, `3ed4026ab2813c6f0588424343827b7b4b1fa772`).
- Próximo: testar ambas as telas em navegador, submissão/liberação e avançar à M03. Não homologado manualmente.

## M03 — Auditoria das duas faces (28/10/2026)

- **Achado confirmado (tempo):** o professor reservava 4 + 8 + 6 = 18 min de prática; o aluno mostrava 4 + 7 + 5 = 16 min. Corrigido para 4 + 8 + 6 min no aluno (commit `cb1fd6ba56a7eaae822b032af79f06ba62bfbacc`).
- **Achado confirmado (ação enganosa):** o botão inicial dizia “ABRIR A MISSÃO NO GDEVELOP”, mas apenas mudava a fase dentro do caderno. Renomeado “VER TUTORIAL E COMEÇAR”; a prática agora contém link explícito para o editor gratuito em outra aba e fallback de aplicativo instalado, sem alegar integração automática (mesmo commit).
- **Achado confirmado (escopo):** a abertura da prática do professor sugeria que criar/importar recurso com IA era a meta obrigatória, embora 3D Box nativo seja suficiente. Reformulado o objetivo como criar objeto visível no Preview, sem obrigar IA (commit `6d02b2b607f8d8427eedace7c55cde1890759f13`).
- **Regra de projeção:** roteiro de acompanhamento da prática inserido como `<details class="pit-private-teacher-notes">`, fechado por padrão e acionado apenas por ícone discreto ▤. Deve ser aberto somente após desligar o espelhamento HDMI. Não é um mecanismo de autenticação; conteúdo projetado permanece explicação didática normal.
- **Teste de regressão:** `qa/v3-audit-alignment.cjs` atualizado para conferir tempo, link real do editor, não abertura automática e roteiros privados M01–M03 recolhidos (commit `75a9b5391cbeb6d8bc940763fca62e5405d790de`). O resultado da CI desse commit deve ser confirmado; testes manuais de GDevelop, mobile físico e alunos continuam NOT_RUN.
- **Próximo:** M04 — verificar as duas faces e corrigir instruções/avaliação sem expor notas privadas. M03 ainda não homologada em sala.

## M04 — Primeiro Jogável · auditoria das duas faces (28/10/2026)

- **Objetivo e tempo sincronizados:** 50 minutos totais (6 fundamentos, 5 demonstração, 36 oficina, 3 avaliação). Os 36 minutos de oficina são 12 entrada/controle + 15 limite/obstáculo + 9 Preview e salvamento em ambas as faces. Quatro rotas alternativas, sem exigir que cada aluno implemente todas.
- **Aluno (`student-mission-four.js`):** havia tutorial e ficha autoral com entrada, resposta, limite, reteste, salvamento e declaração manual de três testes, mas faltava um endereço explícito para abrir o editor. Adicionado link real para `https://editor.gdevelop.io/`, com nova aba segura, explicação de que o projeto não é importado automaticamente e alternativa do aplicativo local/offline (commit `8fc93f5eaa293c56d32ea74fdb51a4a8d8277017`). A ficha é declaratória e não prova execução por si só.
- **Professor (`teacher-mission-four-validation.js`):** prática já tinha notas recolhidas; na avaliação havia uma orientação operacional reservada, anteriormente movida para `<details>`, mas sem o estilo `.pit-private-teacher-notes-body`. Corrigido estilo e acessibilidade do ícone ▤ na avaliação (commit `953c89828decc838f72bd6a35bb8e205b9a3ace6`). Conceitos, critérios e exemplos continuam projetáveis; o roteiro privado permanece fechado por padrão e só deve ser aberto sem HDMI.
- **Regressão:** `qa/v3-audit-alignment.cjs` agora verifica as duas notas recolhidas, rótulos acessíveis, sincronização de 12/15/9 minutos e link/limitações do editor; `qa/v3-private-teacher-notes-browser.cjs` foi estendido para renderizar a prática e a avaliação da M04 em Chrome 390/1280 px, conferir ocultação inicial, tamanho do ícone e abertura/fechamento por Enter (commits `8ee2eba00eadb24efa6e97016b88352bb73b802c` e `24fbefbfb1c9ca5f5e80a043e5236faf2269ba48`). **CI desse último commit ainda não concluída na hora do registro**; testes não devem ser considerados aprovados antes da confirmação.
- **Pendências:** revisão visual humana, teste real no editor GUI GDevelop, importação/salvamento do projeto, aparelho físico, chat/API autenticados e observação de aluno seguem **NOT_RUN** nesta rodada. M04 não homologada.
- **Próxima missão após CI:** M05, com auditoria da lógica SE/ENTÃO, variáveis, teste negativo e espelhamento professor/aluno.

## M05 — Auditoria pedagógica das duas faces (28/10/2026)

- **Professor:** `teacher-mission-five-validation.js` exibia o numeral **IV** apesar de ser a Missão 05; corrigido para **V**. Na avaliação, o caminho operacional `Acompanhamento → aluno → Missão 05` era visível na projeção. Agora o caminho reservado, os passos de revisão e a recomendação de desligar o HDMI ficam no segundo `<details class="pit-private-teacher-notes">`, fechado por padrão e com `<summary>▤</summary>` acessível. A rubrica SE/ENTÃO, os testes positivo/negativo/repetição e os critérios permanecem projetáveis.
- **Aluno:** `student-mission-five.js` já continha sete passos, três testes declaratórios, campos de condição/ação/variável e envio; faltava o **acesso explícito ao editor**. Adicionado link para `https://editor.gdevelop.io/` em nova aba, aviso de que não abre/importa o projeto automaticamente e alternativa de aplicativo local/offline. O aluno continua o jogo da Missão 04.
- **Tutorial compartilhado:** `gdevelop-mission-five-guide.js` era carregado nos dois perfis, mas exibia o título **PROFESSOR · DEMONSTRAÇÃO** também para alunos. Alterado para **TUTORIAL DE EVENTOS · 5 MINUTOS**, sem remover os passos didáticos ou capturas; acrescentada regressão estática.
- **Sincronização:** os dois perfis usam 24 min de prática em 8 + 8 + 8, uma regra autoral e os mesmos critérios de prova. A ficha não comprova execução do GDevelop por si só. O projeto editável e o Preview real continuam essenciais para a aprovação.
- **Regressão:** `qa/v3-audit-alignment.cjs` ganhou verificações de numeral V, dois painéis privados, ausência de notas no aluno, link e fallback. `qa/v3-private-teacher-notes-browser.cjs` agora cobre prática e avaliação da M05 em Chrome 390/1280 px, inclusive abertura/fechamento por Enter. Os resultados dos workflows da alteração precisam ser conferidos no commit correspondente antes de declarar aprovação.
- **Ainda NOT_RUN nesta rodada:** teste humano de GDevelop GUI, celular físico, playtest observado e submissão real de turma. Próximo alvo: verificar CI e prosseguir com M06, sem antecipar a estética.

## M06 — Auditoria pedagógica professor/aluno (28/10/2026)

- **Aluno:** a prática já orientava escolha de um único asset, licença, importação, Preview, teste negativo e oito campos de evidência, mas não oferecia acesso direto ao editor. Adicionado link explícito ao GDevelop gratuito em nova aba, com aviso de que **não abre/importa automaticamente o projeto**; instrução de reabrir o jogo da Missão 05 pela nuvem ou arquivo local e fallback do aplicativo já instalado. Corrigida também a referência “tutorial acima”, pois o tutorial aparece depois do roteiro. O link recebeu foco visível e contraste próprio.
- **Professor — fundamentos:** o rodapé “PRÓXIMA ETAPA DO PROFESSOR” continha um roteiro operacional projetado. Substituído por objetivo didático visível e roteiro de acompanhamento dentro de `<details class="pit-private-teacher-notes">` com ícone ▤, fechado por padrão. Conceitos, analogias, formatos, diagnóstico e licenças permanecem visíveis.
- **Professor — avaliação:** a navegação interna “Acompanhamento → aluno → Missão 06” estava projetável. Transferida para o roteiro privado já existente; a rubrica e os critérios de aceitação continuam públicos para a turma.
- **Sincronia:** 32 min de produção no aluno = 5 escolha + 12 criação + 8 importação + 7 Preview/registro; o professor acompanha as mesmas etapas. Um único recurso, antes/depois, origem/licença, reteste da regra da M05 e projeto editável são os critérios compartilhados. Declarações da ficha não equivalem a execução real do GDevelop.
- **Regressão adicionada:** `qa/v3-audit-alignment.cjs` verifica link, fallback, notas privadas em fundamentos/avaliação, ausência de notas no aluno e tempos. `qa/v3-private-teacher-notes-browser.cjs` inclui fundamentos e avaliação M06 em Chrome 390/1280px, verificando ocultação inicial, ícone, foco e Enter. Testes físicos GDevelop, mobile e playtest continuam **NOT_RUN**.
- **CI:** QA estática do commit `f18bba6fac30` aprovada (run 40744441245); Browser QA do mesmo commit (40744441330) ainda em execução na conferência. A alteração CSS posterior ainda requer verificação do workflow próprio.

## M07 — Auditoria pedagógica professor/aluno (28/10/2026)

- **Falha de projeção identificada:** `teacher-mission-seven-validation.js` mostrava na revisão a instrução operacional para confrontar campos do aluno e usar o acompanhamento. A rubrica didática permanece projetável, mas a navegação/rotina interna foi transferida para `<details class="pit-private-teacher-notes">` com `<summary>▤</summary>` e corpo estilizado, fechado por padrão; a prática já possuía nota privada e foi mantida. O texto alerta para retirar HDMI antes de abrir e fechar antes de reprojetar. Recolhimento não é controle de acesso.
- **Falha de audiência:** `gdevelop-mission-seven-guide.js` é carregado por professor e aluno, mas seu cabeçalho dizia “PROFESSOR · DEMONSTRAÇÃO”. Substituído por título neutro “TUTORIAL DE CONCLUSÃO”; as rotas 2D/3D, capturas oficiais e instruções permanecem.
- **Falha operacional do aluno:** o caderno M07 não tinha link direto para o editor nem aviso sobre reabrir manualmente o projeto. Adicionado `https://editor.gdevelop.io/` com abertura em nova aba, sem alegar importação automática, e alternativa de aplicativo GDevelop já instalado/arquivo local. Link com contraste e foco acessível.
- **Inconsistência de tempo:** a introdução do professor marcava 8 + 6 + 33 + 3 = 50 min, enquanto a prática dos dois perfis tinha 36 min. Ajustada a sequência do professor para **7 min conceitos + 4 min demonstração + 36 min oficina + 3 min resultados = 50 min**; o tutorial compartilhado agora indica 4 min. A oficina preserva 10 min condição + 14 min resultado + 12 min testes, alinhados ao aluno.
- **Critérios de evidência sincronizados:** início funcional, condição SE, resultado ENTÃO, teste negativo, repetição e projeto editável salvo. O relatório e os três checkboxes do aluno são declarações; não comprovam automaticamente execução no GDevelop. A rubrica do professor explicita necessidade de Preview real.
- **Regressões adicionadas:** `qa/v3-audit-alignment.cjs` (link, tempo, privacidade e audiência), `qa/v3-m07-integration.cjs` (duas fases privadas, fluxo fictício), `qa/v3-private-teacher-notes-browser.cjs` (Chrome 390/1280px, prática e revisão M07), e etapa M07 em `.github/workflows/static-qa.yml`. QA estática do commit `ef3b99d01` aprovada na execução **40753287660**, incluindo os testes M07; a regressão Chrome mais recente e a verificação do último commit ainda devem ser conferidas antes de declarar sucesso final.
- **M06 CI anteriormente pendente:** execuções **40744441330** (Browser QA), **40744487399** (QA estática) e **40744487524** (Browser QA) confirmadas como **SUCCESS** no GitHub.
- **Não homologado manualmente:** GDevelop GUI, celular físico, playtest humano e envio real de turma seguem **NOT_RUN**. Nenhum dado real foi usado, nem houve merge na `main`. Próxima meta: confirmar Browser QA M07 e auditar M08 nos dois perfis.
