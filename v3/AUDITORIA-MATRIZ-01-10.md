# AUD-01 — Matriz pedagógica e cronograma de 360 minutos

Auditoria executada em 2026-10-28 na branch `feature/pit-gamejam-v3-arcade`. Fontes: `v2/missions.js` (metas, tempos e entregas) e `v3/teacher-mission-one-pro.js` (distribuição das fases).

| Missão | Objetivo técnico / entrega | Conceitos | Exemplo | Prática | Revisão | Total | Acumulado |
|---|---|---:|---:|---:|---:|---:|---|
| 01 · O Chamado | Conceito, gênero, ação, objetivo e vitória | 9 | 4 | 6 | 1 | 20 | 00:20 |
| 02 · MVP em Foco | Escopo mínimo e critério de pronto | 9 | 5 | 14 | 2 | 30 | 00:50 |
| 03 · Ligar o Motor | Projeto editável, cena e Preview | 7 | 5 | 16 | 2 | 30 | 01:20 |
| 04 · Primeiro Jogável | Controle e colisão no Preview | 6 | 5 | 36 | 3 | 50 | 02:10 |
| 05 · A Primeira Regra | Evento, variável, feedback e caso negativo | 8 | 5 | 24 | 3 | 40 | 02:50 |
| 06 · Forja de IA | Asset importado, origem e licença | 5 | 5 | 32 | 3 | 45 | 03:35 |
| 07 · Dar Vida ao Universo | Início, desafio e condição de conclusão | 5 | 6 | 36 | 3 | 50 | 04:25 |
| 08 · Polimento | Uma melhoria de UX com antes/depois | 5 | 4 | 28 | 3 | 40 | 05:05 |
| 09 · Playtest Cruzado | Observação real, reprodução e decisão | 3 | 3 | 16 | 3 | 25 | 05:30 |
| 10 · O Lançamento | Projeto editável, pitch e demonstração | 4 | 3 | 18 | 5 | 30 | 06:00 |
| **Total** | | **61** | **45** | **226** | **28** | **360** | **06:00** |

## Resultado

- As 10 missões seguem sequência cumulativa e a soma é exatamente **360 minutos**.
- O tempo de prática é **226 minutos (62,8%)**, adequado ao caráter de oficina universitária. Conceitos + exemplo ocupam 106 minutos, revisão 28 minutos.
- O eixo cumulativo é coerente: design → MVP → engine → movimento → evento → asset → vitória → UX → playtest → entrega.
- As dez metas possuem objetivo e três critérios no arquivo de missões; a distribuição por fase coincide com o plano do professor.
- O registro da Missão 09 deve utilizar **identificação anônima do colega**, nunca nome real obrigatório, preservando a intenção da entrega e a privacidade.

## Limites e próximos controles

Esta auditoria valida estrutura e tempos, não comprova execução de GDevelop nem alinhamento literal das páginas professor/aluno. AUD-02 comparará conteúdo renderizado por fase; AUD-03 verificará tutoriais e referências; AUD-05 executará fluxos reais em navegador e dados isolados. Metas bloqueadas por testes reais não são consideradas concluídas por este documento.

Teste reproduzível: `node qa/v3-audit-matrix.cjs`. Nenhuma turma real foi acessada.
