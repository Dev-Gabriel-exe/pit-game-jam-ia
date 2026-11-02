# PIT Game Jam IA V5 — Kenney CC0 para 120 talentos — 02/11/2026

**Escopo isolado inicialmente em** \`feature/v5-kenney-talentos-20261102\`, criado da \`main\` de 02/11/2026 para preservar as últimas correções pedagógicas e cinematográficas.
 
## Incremento
- Importados **10 arquivos PNG reais** do **Kenney Particle Pack 1.1**, licença CC0 (espelho GitHub do pacote com commit fixado). Ver \`v5/assets/talents/kenney-particles/README.md\`.
- \`v5/talent-sprites.js\`: correspondência visual de **13 estilos para 10 imagens** — todas as **120 habilidades reais** existentes continuam sendo tratadas pelo mapa \`talent-vfx.js\`; sprites animados originais permanecem e agora combinam com os traços de arte da Kenney.
- Pintura sobre os **mesmos CanvasTextures** existentes (104 normal/39 baixo/26 movimento reduzido). **Não cria novos objetos durante a batalha nem aumenta o teto de efeitos**; 18 habilidades, 9 em gráficos baixos.
- Carregamento assíncrono local com fallback procedural se falhar; \`?kenneyfx=0\` desativa somente a arte Kenney para comparação. Diagnósticos na raiz de palco: \`data-v5-talent-art\`, \`data-v5-talent-art-sources\`, \`data-v5-talent-art-styles\`.
- **Não modifica** Phase2, dano, vida, mobilidade, condições, cooldowns, XP, aprovações ou cadastro. Somente arte.
- Teste binário/licença/120 mapeamentos: \`qa/v5-kenney-vfx.cjs\`; teste WebGL M5/M10 e comparação de pixels com modo sem arte: \`qa/v5-kenney-vfx-browser.cjs\`; CI dedicado: \`.github/workflows/v5-kenney-talentos-qa.yml\`.

**CI:** pendente após o commit. Apenas concluir após verificação efetiva. G.2 nos PCs físicos e homologação humana não executados. H.1/H.2 continuam bloqueadas.

## Próximo passo
Executar testes e conferir falhas; se aprovados, transferir somente estes arquivos para a main, sem merge dos experimentos M10, e acompanhar CI/deploy. A observação humana em projetor e o teste físico G.2 seguem pendentes.
