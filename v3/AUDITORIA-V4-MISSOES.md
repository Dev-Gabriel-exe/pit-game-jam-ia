# Auditoria V4 — Inventário inicial das 20 faces

**Data:** 28/10/2026 · **Estado:** INVENTÁRIO DE ARQUIVOS, **não** aprovação pedagógica. A avaliação qualitativa exige ler os fluxos e testar cada tela. O roadmap mestre é `ROADMAP-V4-PEDAGOGIA-E-EXPERIENCIA.md`.

| Missão | Arquivos-base professor | Arquivos-base aluno | Auditoria pedagógica |
|---|---|---|---|
| M01 | `teacher-content.js`, `teacher-mission-one.js`, `teacher-mission-one-pro.js` | `mission-one.js` | Correção pedagógica inicial implementada; QA e revisão integral pendentes |
| M02 | `teacher-mission-two.js` | `student-mission-two.js` | Orientações operacionais corrigidas; QA/homologação pendentes |
| M03 | `teacher-mission-three.js` | `student-mission-three.js` | Corrigidos tempo, abertura do editor e roteiro privado; QA de regressão em verificação |
| M04 | `teacher-mission-four-foundations.js`, `teacher-mission-four-validation.js` | `student-mission-four.js` | Pendente |
| M05 | `teacher-mission-five-foundations.js`, `teacher-mission-five-validation.js` | `student-mission-five.js` | Pendente |
| M06 | `teacher-mission-six-foundations.js`, `teacher-mission-six-matrix.js`, `teacher-mission-six-validation.js` | `student-mission-six.js` | Pendente |
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
