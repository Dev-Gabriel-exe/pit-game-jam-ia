# PIT Game Jam IA V5 — Biblioteca de Natureza e Talentos — 02/11/2026

**Branch:** feature/v5-arena-dos-criadores. Nenhum merge, deploy, dados reais, alunos, XP, aprovações ou mudanças na ordem das dez missões.

## Missão pedagógica incremental: disponibilizar recursos externos para os alunos
- Portal \`index.html#recursos\`, existente e acessado por \`aluno-v3.html\`, ganhou quatro pacotes gratuitos: **Quaternius Stylized Nature MegaKit** (site indica CC0 para essa edição, licença a conferir), **Kenney Particle Pack** (80 texturas CC0), **Foozle Pixel Magic Effects** (10 animações CC0) e **PVFX Foundry** (44 efeitos de combate CC0).
- Foram adicionados três modelos **GLB binários locais já existentes no projeto**: \`tree1.glb\`, \`tree3.glb\`, \`bush.glb\`. Eles podem ser visualizados e baixados sem abrir GitHub externo.
- Adicionada aba **Magias e talentos**, descrições e links por fonte com licença visível; cards sem fotografia oficial mostram ícone ilustrativo (não fingem ser prévia).
- Cada pacote ganhou tutorial expansível **Como usar no GDevelop**. Inclui formatos \`.glb\`, sprites animados, spritesheets via Piskel, partículas 2D/3D e áudio, além de guia introdutório com documentação oficial.
- Arquivos de UI: \`v3/library-open-assets.js\`, \`v3/library-open-assets.css\`, \`index.html\`. Guia: \`v3/GUIA-IMPORTACAO-ASSETS-GDEVELOP.md\`. QA: \`qa/library-cc0-browser.cjs\`, workflow \`.github/workflows/library-cc0-qa.yml\`.
- A lógica de jogo, os quatro personagens KayKit, os 120 talentos, balanceamento, câmera e Missão 5/M10 permanecem intocados. As texturas VFX foram catalogadas **sem integrar efeitos à arena V5**.

## Validação
CI de biblioteca preparado para executar na branch V5. **Não marcar aprovado até verificar conclusão do workflow de QA**. Testes em Chromium/CI não substituem a importação no editor do aluno ou G.2 nos computadores físicos da escola.

## Próxima etapa técnica
Confirmar CI e links/downloads dos três GLBs, revisar experiência em desktop/mobile. Posteriormente testar efeitos CC0 selecionados como sprites/billboards 3D para J08/P09/A07, sem inventar eventos de talento nem ultrapassar o orçamento de 18 VFX. G.2 e H.1/H.2 reais continuam bloqueados.
