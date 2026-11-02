# Port visual e Biblioteca Arcana para main — 02/11/2026

**Solicitação explícita do usuário:** adicionar as alterações visuais da Quaternius e a expansão da biblioteca de recursos à `main`, preservando todas as demais alterações existentes. **Sem mesclar a branch experimental inteira.**

## Escopo alterado
- Cenário da Arena M5/M10: 3 GLBs reais de natureza Quaternius CC0 (2 árvores e 1 arbusto), instanciamento no anel externo e densidade reduzida em gráficos baixos. Houve apenas ajustes pontuais em `v5/arena-three.js` — o motor da `main`, incluindo `PIT_V5_TALENT_MOTION`, animações, efeitos, câmera e regras de gameplay, foi preservado.
- Biblioteca Arcana: quatro pacotes extras (Stylized Nature MegaKit, Kenney Particle Pack, Foozle Pixel Magic, PVFX Foundry), três downloads GLB locais, filtro **Magias e talentos**, cards e tutoriais para GDevelop, além de guia expandido e ajustes responsivos.
- `index.html` teve apenas os parâmetros de cache CSS/JS e o texto introdutório atualizados, para **não sobrescrever alterações pedagógicas recentes da main**.
- Adicionados testes da biblioteca, verificação de GLBs e teste de carregamento WebGL M5/M10; workflows estendidos para disparar em `main`.

## Exclusões intencionais
Não incluídos os experimentos de fila visual ou balanceamento da branch `feature/v5-arena-dos-criadores`. Nenhuma mudança em usuários, aprovações, XP, turmas, banco, G.2 ou integração real H.1/H.2.

## Homologação
Verificar resultados dos GitHub Actions **no commit desta migração** e registrar eventuais falhas. Não declarar aprovação antecipada. CI Chromium/SwiftShader não substitui ensaio de hardware G.2 nos PCs da escola. A publicação Pages da main pode ocorrer automaticamente via workflow já existente.
