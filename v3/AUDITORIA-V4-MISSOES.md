# Auditoria V4 — Inventário inicial das 20 faces

**Data:** 28/10/2026 · **Estado:** INVENTÁRIO DE ARQUIVOS, **não** aprovação pedagógica. A avaliação qualitativa exige ler os fluxos e testar cada tela. O roadmap mestre é `ROADMAP-V4-PEDAGOGIA-E-EXPERIENCIA.md`.

| Missão | Arquivos-base professor | Arquivos-base aluno | Auditoria pedagógica |
|---|---|---|---|
| M01 | `teacher-content.js`, `teacher-mission-one.js`, `teacher-mission-one-pro.js` | `mission-one.js` | Pendente |
| M02 | `teacher-mission-two.js` | `student-mission-two.js` | Pendente |
| M03 | `teacher-mission-three.js` | `student-mission-three.js` | Pendente |
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
