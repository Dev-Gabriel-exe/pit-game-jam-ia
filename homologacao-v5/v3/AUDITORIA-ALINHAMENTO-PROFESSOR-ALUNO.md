# AUD-02 — Alinhamento professor/aluno por missão

Revisão de código em 2026-10-28, branch `feature/pit-gamejam-v3-arcade`.

## Matriz de sincronização

| Missão | Caderno do professor | Caderno do aluno | Controle |
|---|---|---|---|
| 01 | Fundamentos, simulador e ficha | Ideia autoral | Preservado |
| 02 | MVP e critério de pronto | Escopo mínimo | Preservado |
| 03 | GDevelop, cena, objeto e Preview | Projeto salvo e Preview | Apenas tempo interno ajustado: 4+7+5=16 min |
| 04 | Movimento, guia e rubrica | Controle, obstáculo e evidência | 36 min de prática |
| 05 | Eventos, guia e validação | Regra, feedback e testes | 24 min de prática |
| 06 | IA, matriz de ferramentas e rubrica | Asset, origem, licença e importação | 32 min de prática |
| 07 | Estados, tutorial e rubrica | Vitória, caso negativo e projeto | **Corrigido:** 10+14+12=36 min |
| 08 | UX, tutorial e rubrica | Antes/depois, negativo e projeto | **Corrigido:** 5+15+8=28 min |
| 09 | Hipóteses, triagem e rubrica | Playtest real, reprodução e backlog | **Corrigido:** demonstração própria no professor, sem notas de fala |
| 10 | Distribuição, tutorial e critérios | Pitch, projeto editável e acesso | 18 min de prática |

## Correções efetivas

- M03: corrigido apenas o cronograma exibido no caderno do aluno, preservando conteúdo e exercícios aprovados.
- M07: cadernos professor e aluno agora indicam 36 minutos de prática, alinhados ao cronograma de 50 minutos.
- M08: cadernos professor e aluno agora indicam 28 minutos de prática, alinhados ao cronograma de 40 minutos.
- M09: a fase de exemplo do professor passa a mostrar triagem interativa de defeitos, não o texto genérico legado de condução.

## Pendências para auditorias posteriores

Este teste compara rotas, tempos e contratos de atividade, mas não substitui inspeção visual de cada tela. A conferência de cliques, acessibilidade, links, assets, evidências e aprovação real continua em AUD-03/AUD-05 e na homologação. Nenhuma turma real foi utilizada.

Teste reproduzível: `node qa/v3-audit-alignment.cjs`.
