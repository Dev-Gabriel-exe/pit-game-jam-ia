# UI-06 — Kits rápidos verificáveis

Data: 2026-10-28. Branch: `feature/pit-gamejam-v3-arcade`.

## O que foi entregue

- Quatro kits ZIP para exploração 2D, plataforma 2D, puzzle 3D e corrida 3D.
- Cada kit contém cinco arquivos binários gerados localmente, `LEIA-ME.txt` e `manifest.json`, com origem declarada, instruções de importação e link para starter oficial editável do GDevelop.
- Os PNG, GLB e WAV são gerados pelas mesmas funções da biblioteca individual, agora expostas como `PIT_LIBRARY_API.assetBlob` sem disparar download durante a montagem.
- ZIP é implementado em JavaScript nativo com entradas armazenadas (sem compressão), CRC32 e diretório central; não há API paga, CDN de bibliotecas ou servidor.
- A página deixa claro que **o ZIP não contém um projeto GDevelop completo**: os exemplos editáveis são os starters oficiais linkados, que podem depender de conexão.
- O usuário pode baixar o ZIP por gênero ou baixar os arquivos individuais na biblioteca.

## Testes executados

- GitHub Actions static QA **40631408937**: concluído com sucesso, incluindo `qa/v3-quick-kits.cjs`. O teste usa PNG simulado de 1×1 pixel no Node, mas usa os geradores reais GLB/WAV, confere assinatura, comprimento, manifesto, diretório central e CRC32 dos quatro ZIPs.
- GitHub Actions Browser QA **40631343255**: concluído com sucesso no Chrome. O teste usa os geradores reais de PNG no Canvas e faz download dos quatro ZIPs; verifica nomes, assinaturas PNG/GLB/WAV e dimensão mínima do PNG, além das demais verificações do fluxo.
- Teste de sintaxe `node --check v3/quick-kits.js` no static QA.

## Limitações honestas

- Nenhuma importação foi executada no editor GDevelop nesta meta; compatibilidade final dos starters e dos assets no editor permanece na auditoria funcional.
- O PNG simulado no teste Node **não** substitui o teste de PNG real no Chrome.
- Os recursos procedurais não cumprem, por si só, a exigência de criação de um asset de IA da Missão 06.
- Os links oficiais de starters podem mudar; validar disponibilidade e licenciamento na homologação.
- Nenhum merge, deploy, alteração de turma real ou serviço pago.
