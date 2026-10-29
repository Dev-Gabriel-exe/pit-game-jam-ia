# AUD-02 — Alinhamento professor/aluno por missão

Revisão de código em 2026-10-28, branch `feature/pit-gamejam-v3-arcade`.

## Matriz de sincronização

| Missão | Caderno do professor | Caderno do aluno | Controle |
|---|---|---|---|
| 01 | Fundamentos, simulador e ficha | Ideia autoral | Preservado |
| 02 | MVP e critério de pronto | Escopo mínimo | Preservado |
| 03 | GDevelop, cena, objeto e Preview | Projeto salvo e Preview | **Corrigido:** 4+8+6=18 min (total M03: 30 min) |
| 04 | Movimento, guia e rubrica | Controle, obstáculo e evidência | 36 min de prática |
| 05 | Eventos, guia e validação | Regra, feedback e testes | 24 min de prática |
| 06 | IA, matriz de ferramentas e rubrica | Asset, origem, licença e importação | 32 min de prática |
| 07 | Estados, tutorial e rubrica | Vitória, caso negativo e projeto | **Corrigido:** 10+14+12=36 min |
| 08 | UX, tutorial e rubrica | Antes/depois, negativo e projeto | **Corrigido:** 5+15+8=28 min |
| 09 | Hipóteses, triagem e rubrica | Playtest real, reprodução, correção/backlog/sem alteração | **Corrigido:** demonstração própria e três resultados compatíveis, sem notas de fala |
| 10 | Distribuição, tutorial e critérios | Pitch, projeto editável e acesso | 18 min de prática |

## Correções efetivas

- M03: corrigido apenas o cronograma exibido no caderno do aluno, preservando conteúdo e exercícios aprovados.
- M07: cadernos professor e aluno agora indicam 36 minutos de prática, alinhados ao cronograma de 50 minutos.
- M08: cadernos professor e aluno agora indicam 28 minutos de prática, alinhados ao cronograma de 40 minutos.
- M09: a fase de exemplo do professor passa a mostrar triagem interativa de defeitos, não o texto genérico legado de condução.

## Pendências para auditorias posteriores

Este teste compara rotas, tempos e contratos de atividade, mas não substitui inspeção visual de cada tela. A conferência de cliques, acessibilidade, links, assets, evidências e aprovação real continua em AUD-03/AUD-05 e na homologação. Nenhuma turma real foi utilizada.

Teste reproduzível: `node qa/v3-audit-alignment.cjs`.

## Revisão transversal M09 — 28/10/2026, 22h (Fortaleza)

A validação do aluno em `student-mission-nine.js` permite três decisões reais: `fixed` (correção com reteste), `backlog` (falha registrada para depois) e `nochange` (teste sem falha, sem mudança necessária). O cabeçalho projetado de `teacher-mission-nine-validation.js` e o protocolo/saída de `teacher-mission-nine-foundations.js` ainda falavam apenas em correção ou backlog, sugerindo reprovação indevida de um playtest que não encontrou defeito. Ambos foram alinhados às três opções, inclusive o critério reservado do professor. Cinco asserções de regressão foram acrescentadas em `qa/v3-audit-alignment.cjs`. Este ajuste **não comprova** playtest real nem autoriza aprovação automática; o registro do aluno continua declaratório. Testes GDevelop GUI, HDMI físico e playtest humano: `NOT_RUN`.

Também foi corrigido nesta matriz um registro documental desatualizado: a prática da M03 é **4+8+6=18 minutos**, não 16; o plano e as telas já haviam sido corrigidos em commits anteriores.
