# Biblioteca experimental de vídeos — PIT Game Jam IA

Material de laboratório, **não publicar na `main` automaticamente**.

## Arquivo inicial preservado
- `v3/assets/missions/portal-hero-long-ltx.mp4` — vídeo gerado com LTX-Video Distilled (8,03 s; 736×416; H.264), estilo gótico dessaturado. **Não recomendado para hero em tela cheia**.
- `v3/assets/missions/portal-hero-long-ltx-poster.webp` — imagem extraída do próprio MP4.

## Novos clipes solicitados
Um workflow experimental gera, se a cota pública permitir, cenas distintas para:
- `biblioteca-arcana`: módulo de recursos da oficina, mesa medieval e partículas de poeira.
- `jornada-portal`: cartão de seleção de missões, portal de pedra e névoa.

Cada vídeo novo fica em `v3/assets/cinematics/` com poster WebP e metadados em `manifest-ltx-experimental.json`. Um erro de cota encerra o processo sem retries, contas paralelas, sessões falsas ou qualquer troca no site.

## Decisão visual
Abertura hero: somente usar material 1080p ou maior *com qualidade real de origem*, não upscale artificial de MP4 pequeno. Um vídeo 736×416 pode servir num card de aproximadamente 400–500 px, com poster, carregamento sob demanda e `prefers-reduced-motion`.

## Integração futura
1. Avaliar material visual e licenças dos repositórios que o proprietário localizar.
2. Selecionar vídeo principal em qualidade apropriada e comparar o movimento com os clips do LTX.
3. Fazer teste de contraste sobre texto, performance móvel e autoplay sem áudio.
4. Publicar somente depois de aprovação visual.
