# FUN-08 — Integridade dos downloads e importação no GDevelop

## Executado

- `qa/v3-quick-kits.cjs` percorre os **28 assets** da biblioteca, valida MIME de PNG (`image/png`), GLB (`model/gltf-binary`) e WAV (`audio/wav`), verifica assinaturas, tamanho, GLB v2 com JSON/mesh/buffer, RIFF/PCM/22.050 Hz e os quatro ZIPs com CRC e manifestos.
- O PNG de `qa/v3-quick-kits.cjs` é **stub 1×1** usado exclusivamente na simulação Node; não é declarado como arte gerada real.
- `qa/v3-e2e.cjs` verifica PNG **real de canvas** no Chrome, GLB/WAV, ZIPs baixados e nomes; agora também consulta `Blob.type` diretamente no navegador.
- CI Static QA [40636997100](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40636997100): **success**.

## Impedimento de conclusão

**Não foi executada importação efetiva no editor GDevelop**. Validar assinatura, estrutura e MIME não demonstra que o editor aceita o arquivo, que o Sprite/modelo/som renderiza ou que um projeto starter abre e salva. Sem um GDevelop acessível e testável nesta rodada, esta meta permanece `blocked`, não `done`.

A homologação posterior precisa abrir um starter 2D e outro 3D no GDevelop, importar um PNG, GLB e WAV de um kit, executar Preview, salvar e reabrir os projetos. Registrar versões, capturas e resultado de cada importação. Nenhuma turma real, serviço pago ou produção deve ser usado.
