# AUD-05 — Verificação de páginas e fluxos das dez missões

Data: 2026-10-28. Branch: `feature/pit-gamejam-v3-arcade`.

## Evidência executada

GitHub Actions **Browser QA**: [run 40628604617](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40628604617), conclusão **success**, commit `043d938a826e1af9ce9de73e89b9b0ee39f352b2`.

O teste `qa/v3-e2e.cjs` abriu Chrome real (Playwright) com backend fictício interceptado e percorreu:
- 10 missões × 4 fases do professor = **40 páginas**;
- 10 missões × 3 fases do aluno = **30 páginas**;
- Total **70 combinações missão/papel/fase**, verificando conteúdo visível e rótulos;
- Fluxos adicionais de autenticação simulada, liberação de fase, bloqueio de etapas, preenchimento e envio M01, revisão/aprovação pelo professor, chat, carrossel e viewport móvel 390 px;
- Zero erros JavaScript reportados pelos eventos `pageerror` no teste concluído.

## Correções de QA necessárias

1. O teste inicial deixou o chat aberto e o cabeçalho interceptava os cliques: corrigido fechando-o antes da auditoria.
2. O seletor genérico `data-phase` capturava botões internos: restringido ao `#phasebar`.
3. Na Missão 01 do aluno, `#phasebar` é oculto intencionalmente: a auditoria usa a navegação própria `data-q-tab`.

Essas foram correções **do teste**, não prova de defeitos no aplicativo. A execução final passou integralmente.

## Limitações explícitas

O teste usa uma *fixture* isolada, não a API real de uma turma. Não valida execução de projetos no GDevelop, arquivos importados, playtest entre pessoas reais, licenças externas nem todas as condições de acessibilidade. Metas M06-05, M07-04, M08-04 e M09-03 permanecem bloqueadas para aceitação integral. A auditoria não implica aprovação pedagógica ou publicação.
