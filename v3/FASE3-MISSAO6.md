# Missão 06 — Forja de IA — implementação progressiva

**Projeto:** PIT Game Jam IA V3. **Branch:** `feature/pit-gamejam-v3-arcade`.  
**Tempo total previsto:** 45 min = 5 conceitos + 5 demonstração + 32 produção + 3 apresentação dos resultados.

## M06-01 — Professor: fluxo de assets — CONCLUÍDO

**Código:** `v3/teacher-mission-six-foundations.js` e `v3/teacher-mission-six-foundations.css`, integrados em `professor-v3.html` e `v3/app.js` apenas durante a etapa `briefing` da Missão 06. Missões anteriores não foram alteradas.

**Roteiro conceitual de 5 minutos:** necessidade do jogo → gerar ou reaproveitar → preparar formato/licença → importar no tipo correto do GDevelop → testar no Preview e registrar origem. O aluno escolhe **um único recurso principal**, não usa todas as IAs. A preparação e a avaliação seguem os objetos que o aluno já criou nas Missões 03–05.

### Arquivos e atenção à compatibilidade

- **Sprite/2D:** PNG com transparência, verificar dimensão e recorte; quadros separados para animações. GDevelop usa objetos Sprite.
- **Som:** WAV para efeitos curtos, AAC preferível para música longa; formatos/codec e desbloqueio de áudio podem variar por navegador. Evento real no GDevelop deve disparar o som após uma interação.
- **Vídeo (opcional):** MP4 com H.264/AAC, comprimido e curto, controle por objeto Video; navegador pode exigir interação antes de reproduzir.
- **3D:** GLB e low-poly, preservando o comportamento/física já existente. Visual do modelo e colisor 3D são responsabilidades diferentes.

### Autoria e responsabilidade

Foi incluído um checklist visual de licenças, proveniência do asset, privacidade das imagens/vozes de terceiros e alternativa sem créditos/conta paga. Gratuidade não equivale a permissão comercial, e nenhuma ferramenta específica é declarada gratuita nesta etapa.

### Interatividade e verificação

Quatro situações selecionáveis com botões de resposta, estados ARIA e explicações sobre qual formato importar. **27/27 verificações** JavaScript/CSS, conteúdo técnico, escopo temporal, módulos anteriores e controles simulados passaram.

**Limitação declarada:** ainda não houve teste visual real em Chrome/Android, demonstração de importação real no editor GDevelop nem teste com API. O guia foi fundamentado na documentação oficial, mas integrações reais serão verificadas em QA e metas subsequentes.

## Referências oficiais

- [Objetos e Sprites](https://wiki.gdevelop.io/gdevelop5/objects/)
- [Áudio e compatibilidade](https://wiki.gdevelop.io/gdevelop5/all-features/audio/)
- [Vídeo H.264/AAC](https://wiki.gdevelop.io/gdevelop5/objects/video/)
- [Modelo 3D em GLB](https://wiki.gdevelop.io/gdevelop5/objects/3d-model/)
- [Gerenciamento de recursos](https://wiki.gdevelop.io/gdevelop5/interface/project-manager/resources/)

**Próxima meta:** M06-02 — verificar as alternativas de IA para geração rápida de imagem, música, voz, vídeo e 3D, com condições atuais de uso gratuito/limites/licenças e fallback local sem custo.
