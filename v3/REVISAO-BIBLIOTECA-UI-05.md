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
