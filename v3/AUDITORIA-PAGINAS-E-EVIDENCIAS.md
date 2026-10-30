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

## 30/10/2026 — Evidências históricas achatadas (M01–M10)

**Falha observada:** versões anteriores da API convertiam quebras de linha em espaços antes de armazenar evidências estruturadas. A correção atual da API preserva LF nos novos envios, mas registros antigos não recuperam automaticamente seus limites de campo. Não é seguro separar por nomes de campo porque respostas livres podem conter esses mesmos rótulos.

**Correção de interface na branch:** `v3/app.js` detecta, por missão, o cabeçalho estruturado `MISSÃO 01–03` ou `M04–M10` sem nenhuma quebra de linha e apresenta ao aluno um aviso de **recuperação parcial**. O texto histórico original fica disponível num `<details>` recolhido, com caracteres HTML escapados. A interface não reescreve evidência no servidor, não inventa preenchimento dos campos e não marca verificações manuais. Não há aviso no material projetado do professor nem na prévia visual.

**Regressão:** `qa/v3-legacy-evidence.cjs` cobre dez missões, segurança de HTML, ausência de mutação, perfis professor/prévia e ausência de falso aviso em registros com LF/CRLF. Integrado à QA estática. Os testes locais isolados V8 do helper passaram antes do commit; execução Node/CI depende do resultado do GitHub Actions no commit exato.

**Limite explícito:** isto preserva a consulta ao texto antigo, não restaura automaticamente campos individuais e não garante recuperação integral. Se uma entrega antiga foi truncada pelo limite de 750 caracteres, o trecho perdido não pode ser reconstruído. Validação humana e eventual reenvio dependem de revisão do professor; dados reais não foram acessados ou alterados.
