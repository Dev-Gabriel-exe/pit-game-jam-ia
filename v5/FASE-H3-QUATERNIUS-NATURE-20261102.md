# PIT Game Jam IA V5 — Quaternius Stylized Nature — 02/11/2026

**Exclusivamente branch** `feature/v5-arena-dos-criadores`. Nenhuma alteração em main, banco, XP ou estudantes reais.

## Incremento técnico
- Copiados **3 GLBs reais CC0** da Quaternius, convertidos para WebGL e armazenados localmente em `v5/assets/quaternius-nature/` (duas árvores, um arbusto), com origem/licença documentadas.
- O loader existente `loadMedievalArchitecture` em `v5/arena-three.js` agora adiciona **12+10+24=46 instâncias padrão**, **5+4+10=19 instâncias de baixa qualidade** ao anel externo, usando InstancedMesh e preservando a Cidadela do Eclipse caso o download falhe.
- Raios dos novos modelos 63, 67 e 74 vezes `stadiumScale` (maiores que 121 unidades para escala de arena 5), atrás da borda jogável (90 unidades); **nenhum colisor, física, habilidade, câmera, dano, personagem KayKit, conteúdo de aula ou progressão alterado**.
- Indicadores `data-v5-nature`, `data-v5-nature-parts` e `data-v5-nature-meshes` permitem verificar os modelos carregados.
- Adicionados QA binário/contrato e teste Chromium WebGL M5/M10, com GitHub Actions dedicado.

## Gates
**CI novo ainda não conferido no momento do commit; não declarar aprovação sem verificar execução e resultado.** O teste SwiftShader do CI não substitui G.2 nos PCs reais. H.1/H.2 com alunos reais continuam bloqueados.

## Próximo passo
Conferir o novo CI e a composição da cena/legibilidade no projetor. Após terminar a decoração, retomar visibilidade dos talentos J08/P09/A07 da Missão 10.
