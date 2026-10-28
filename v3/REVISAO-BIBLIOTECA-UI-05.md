# UI-05 — Biblioteca de assets por gênero e formato

Data: 2026-10-28, branch `feature/pit-gamejam-v3-arcade`.

## Alterações implementadas

- O portal passou a permitir filtrar os 28 recursos procedurais por **gênero sugerido** (RPG/aventura, plataforma, puzzle/terror e corrida) e **formato real** (2D PNG, 3D GLB, áudio WAV), além de busca e categoria existentes.
- A combinação de filtros usa uma função pura `assetMatches` em `biblioteca.js`, com identificadores explícitos e sem classificações fictícias de formato.
- Cada card declara sua origem como gerado localmente para uso didático. Isso não equivale a conceder licença sobre arquivos de terceiros.
- As instruções de importação GDevelop e avisos sobre props sem física e música de terceiros permanecem no portal.

## Validação

- `qa/v3-library-filters.cjs` valida 28 IDs únicos, quatro gêneros, três formatos, interseções, busca com acentos e ausência de IDs inválidos, integrado ao GitHub Actions estático.
- `qa/v3-e2e.cjs` abre o portal em Chrome, filtra 3D/corrida/áudio e baixa um arquivo de cada formato PNG/GLB/WAV, verificando nome, bytes e assinatura. O resultado desse teste deve ser confirmado no GitHub Actions antes de considerar UI-05 concluída.

**Limites:** a compatibilidade final no editor GDevelop, a qualidade visual dos recursos geométricos e a licença de ferramentas externas não foram comprovadas pelo download. Não houve serviços pagos nem turma real.

## Atualização de regressão — 28/10/2026

A contagem de **28** recursos e a referência a `28 IDs` acima são históricas (primeira implementação UI-05), **não** representam o catálogo atual. O checkpoint de 28/10 registra **38 recursos procedurais** (PNG/GLB/WAV). O histórico de expansão e o catálogo fonte estão em `biblioteca.js`; novas verificações devem derivar a contagem do catálogo, nunca fixá-la em 28, 34 ou 38.

**Provas automatizadas consultadas:** GitHub Actions `40671063508` (QA estática, SUCCESS) e `40671063511` (Browser QA, SUCCESS) no commit `0bf207fb`. Esses resultados confirmam a execução das suítes, não aprovação manual de todos os arquivos no editor GDevelop.

**Aceite ainda pendente:** executar a matriz `LIB-PNG`, `LIB-GLB`, `LIB-WAV`, `LIB-MAP` e `UI08-*` descrita em `v3/HOMOLOGACAO-PRESENCIAL.md`, registrar artefatos reais e manter `NÃO EXECUTADO` até haver evidência. A expansão do catálogo não altera a contagem de tarefas concluídas do roadmap.
