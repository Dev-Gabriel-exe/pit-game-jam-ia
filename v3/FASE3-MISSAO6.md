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

## M06-02 — Matriz de ferramentas e direitos — CONCLUÍDO

**Código:** `v3/teacher-mission-six-matrix.js` e `v3/teacher-mission-six-matrix.css`; integrado à etapa `demo` do professor em `v3/app.js` e `professor-v3.html`. Cinco rotas opcionais: Gemini/imagem, Flow/vídeo, Suno/música, ElevenLabs/voz e Meshy/3D. O seletor filtra cartões e mostra plano B sem créditos. Não há chamada externa automática nem coleta de dados.

**Condições verificadas em páginas oficiais em 27/10/2026:**
- Gemini: imagem disponível em contas elegíveis; limites variam e o download depende da interface; verificar privacidade e direitos de referência.
- Google Flow: 50 créditos/dia sem assinatura, custo por geração variável e restrições em horário de pico. Vídeo é opcional.
- Suno: 50 créditos diários no gratuito, mas licença não comercial; downloads de teste limitados e não garantidos a contas novas.
- ElevenLabs: TTS gratuito anuncia 10 mil créditos/mês; uso gratuito não comercial com atribuição.
- Meshy: 100 créditos/mês; 10 downloads/mês somente Meshy 6 Lite sem textura; CC BY 4.0 exige atribuição.

**Fontes primárias:** [Gemini](https://support.google.com/gemini/answer/14286560), [Flow](https://support.google.com/flow/answer/16526234), [Suno downloads](https://help.suno.com/en/articles/13926209), [Suno direitos](https://help.suno.com/en/articles/9601601), [ElevenLabs TTS](https://elevenlabs.io/text-to-speech), [ElevenLabs direitos](https://elevenlabs.io/docs/overview/administration/billing), [Meshy gratuito](https://help.meshy.ai/pt-BR/articles/15696428-what-is-included-on-the-free-plan).

**Verificações executadas:** 13/13 testes de compilação JavaScript via V8, contratos, fontes, renderização, integração estática, filtragem e reset em DOM simulado. Teste reproduzível adicionado em `qa/v3-m06-matrix.cjs` (ainda não executado pelo Node nesta rodada). **Pendências:** visual em navegador real, contas/limites individuais e importação real no GDevelop. Não substituir esses testes por simulações.

**Próxima meta:** M06-03 — tutoriais por necessidade com prompts personalizados e fallback de exportação.

## M06-03 — Tutoriais por necessidade e prompts autorais — CONCLUÍDO

**Código:** `v3/asset-forge-tutorial.js` e `v3/asset-forge-tutorial.css`, com integração à fase `practice` do professor em `v3/app.js` e `professor-v3.html`. Módulo reutilizável preparado para a prática do aluno na M06-04.

**Interação real:** o usuário informa título, gênero, personagem/objeto e necessidade do jogo. O módulo constrói localmente um prompt editável por modalidade (imagem, vídeo, música, voz, 3D), oferece botão de cópia com fallback de seleção manual, passos de uso da ferramenta, exportação/importação no GDevelop, teste no Preview e alternativa sem créditos. Não cria mídia, não chama APIs e não afirma que um asset foi produzido.

**Verificações executadas:** 15/15 verificações V8 de sintaxe, prompts personalizados, limpeza de entradas, escape de HTML, integração, renderização, troca de rota e edição de campos em DOM simulado. Teste repetível registrado em `qa/v3-m06-tutorial.cjs` (não executado no Node nesta rodada). **Pendências:** validar botões e instruções em navegador real e executar importação no editor GDevelop; nomes dos menus variam por versão.

**Próxima meta:** M06-04 — aluno escolhe uma trilha, importa e testa apenas um asset, registra procedência e evidência sem resultado fictício.

## M06-04 — Caderno do aluno: um asset testado — CONCLUÍDO

**Código:** `v3/student-mission-six.js` e `v3/student-mission-six.css`, integrados em `aluno-v3.html` e `v3/app.js`. O aluno recebe o tutorial reutilizável M06-03, escolhe **uma** modalidade, registra necessidade, arquivo/formato, origem, licença, antes/depois, teste negativo e projeto salvo. Rascunhos são isolados por identificador de sessão e não enviados até confirmação. Prévia não chama backend.

**Critérios:** oito campos obrigatórios com limites, três declarações manuais de testes no Preview e resumo legível para o professor. Envio bloqueado quando incompleto, quando já submetido/aprovado ou quando a etapa não foi liberada. `hydrate` recupera evidência estruturada do servidor sem sobrescrever rascunho local preenchido. O texto tem até 750 caracteres (máximo verificado: 732). O aluno não recebe pontos ou aprovação automática por marcar caixas.

**Verificações executadas:** 20/20 testes V8 de sintaxe, isolamento de sessões fictícias, validação, bloqueios, renderização, integração, hidratação e tamanho da evidência. Teste repetível criado em `qa/v3-m06-student.cjs` (ainda não executado no Node nesta rodada).

**Pendências:** teste real no navegador, no GDevelop e com backend autorizado; professor precisa revisar a evidência e confirmar a importação. A M06-05 fará auditoria de integração e regressão.

**Próxima meta:** M06-05 — alinhamento professor/aluno, contingência offline, importação e verificações responsivas.
