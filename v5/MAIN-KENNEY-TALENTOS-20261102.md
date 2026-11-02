# PIT Game Jam IA V5 — Kenney: efeitos visuais na main — 02/11/2026

**Origem:** branch `feature/v5-kenney-talentos-20261102`; mudanças criadas a partir da `main` `6d2e75e30b87abdca6c41bc26ae7c80f141af013`. Publicação pontual da versão comprovada — sem mesclar os experimentos da branch anterior de M10.

## Implementado
- 10 PNGs reais do **Kenney Particle Pack 1.1**, CC0, armazenados em `v5/assets/talents/kenney-particles/` com licença e origem verificável.
- Camadas gráficas sobre os 13 estilos de sprite do sistema original, que cobrem os **120 talentos** do catálogo canônico. Oito quadros na qualidade padrão; qualidade baixa e movimento reduzido preservados.
- As mesmas 104 texturas da V5 padrão, sem objetos extras de combate. `?kenneyfx=0` desativa só o novo desenho para comparar; se arquivos falharem, o fallback procedural permanece.
- Limite existente preservado: até 18 habilidades visuais ativas (9 no modo baixo), sem alterar dano, recarga, XP, personagens, câmera, progressão ou notas.

## Evidências na branch antes de portar
- [GitHub Actions — Kenney CC0 120 talentos M5/M10](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41471416305) — **SUCCESS em ambos os jobs** (contrato e Chromium WebGL). Teste encontrou alterações nos pixels das 13 famílias; M5 6 e M10 2 eventos de talentos reais, sem erros nem vazamento visual.
- [PIT Game Jam QA](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41471416130) — SUCCESS.
- [PIT Game Jam — Browser QA](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41471416272) — SUCCESS.

## Verificação pós-port
Confirmar CI dos workflows em `main` e deployment Pages no SHA deste commit. A aprovação anterior da branch não substitui essa checagem.
**G.2 nos PCs físicos ainda não foi feito. H.1/H.2 de alunos reais continuam bloqueados até validação e autorização.** Os sprites não constituem validação humana de estética em projetor.
