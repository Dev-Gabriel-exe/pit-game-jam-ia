# Auditoria de arte e motion — ART-01 a ART-05

Atualizado em 28/10/2026. Escopo: somente `feature/pit-gamejam-v3-arcade`. Nenhuma alteração em `main`, produção, alunos reais ou serviços pagos.

## Inventário de imagens originais

- `v3/assets/art/portal-arcano.svg` — arco, ruínas e portal original; camada decorativa do portal.
- `v3/assets/art/mesa-do-mestre.svg` — astrolábio/diagrama original; cabeçalho do professor.
- `v3/assets/art/biblioteca-arcana.svg` — estantes e artefatos originais; biblioteca.
- `v3/assets/art/conquista-dez-missoes.svg` — medalhão e louros originais; somente estado de conquista validada.
- `v3/assets/art/estados-missao.svg` — cinco ícones para bloqueada, ativa, enviada, revisão e aprovada.
- `v3/assets/art/tipos-recurso.svg` — quatro ícones para PNG, GLB, WAV e ZIP.
- `v3/assets/art/poster-fallback.svg` — alternativa local leve se um pôster WebP falhar.

São ilustrações SVG autorais, sem dependências externas e sem imitação de personagens ou marcas. Não são capturas do GDevelop nem provas de funcionamento da engine.

## Otimização e fallback

Os dez pôsteres existentes `v3/assets/missions/missao-01.webp` a `missao-10.webp` somam **771.120 bytes** no repositório (maior: 91.348 bytes). A integração usa `loading="lazy"` e `decoding="async"`. A galeria cinematográfica já possui ilustração SVG alternativa; sidebar e cards menores agora utilizam `v3/media-fallback.js`, que tenta **uma** alternativa local e oculta a imagem após segunda falha, preservando títulos e estado textual. Não foi criado AVIF nesta rodada: WebP é o formato raster otimizado realmente presente.

## Estados e integridade

`data-mission-state` é derivado do progresso recebido pelo aplicativo; `data-asset-format` é derivado do tipo real do recurso. A conquista final usa dez IDs aprovados e nunca é concedida em `?preview=1`. Não inferir aprovação a partir de vídeo, clique ou efeito. A arte do selo aparece somente quando `data-award-state="earned"`.

## Movimento e acessibilidade

Tokens de motion estão em `v3/design-system.css`. A galeria considera `prefers-reduced-motion` e `navigator.connection.saveData`, evitando parallax, pop e animações decorativas; o tempo de entrada reduz para 130ms. O selo validado recebe uma única animação curta de 650ms apenas se o usuário **não** pediu movimento reduzido. Contraste de cores opacas é verificado em `qa/v3-design-tokens.cjs`; contraste sobre imagens e leitor de tela ainda requerem revisão específica.

## Provas automatizadas e limites

- `qa/v3-design-tokens.cjs`: tokens, inclusão nas quatro rotas, seis pares de contraste.
- `qa/v3-art-assets.py`: parse XML, dimensões, origem local, fallback e ícones.
- `qa/v3-art-variants.cjs`: cinco estados e quatro formatos com texto de apoio.
- `qa/v3-media-fallback.cjs`: cabeçalho WebP real, orçamento, fallback sem loop.
- `qa/v3-art-motion.cjs`: dez aprovações, preview sem conquista, redução de estímulo e orçamento dos pôsteres.
- `qa/v3-visual-audit.cjs`: Chrome em quatro rotas × três larguras, foco, geometria, redução de movimento e fallback provocado; gera capturas diagnósticas, não revisão humana.

Pendências: conferência humana das composições e contraste sobre fotos/gradientes; leitor de tela; testes reais no GDevelop; backend isolado com perfis fictícios. A presença de um arquivo ou um teste estático não prova que todos os usuários o enxergam corretamente.
