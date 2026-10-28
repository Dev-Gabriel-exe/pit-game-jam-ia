# AUD-04 — Ferramentas IA: acesso gratuito, exportação e licenças

Verificação em 2026-10-28, utilizando páginas oficiais dos cinco serviços. A disponibilidade depende da conta, região, idade e eventuais alterações dos planos.

| Ferramenta | Plano gratuito verificado | Direitos e atenção | Plano B |
|---|---|---|---|
| Gemini | Geração de imagens sem assinatura, login obrigatório e cotas variáveis; download até 1K sem plano AI | Revisar referências, direitos e restrições de conta escolar | Desenho próprio ou sprite com licença |
| Google Flow | 50 créditos por dia para não assinantes; geração pode ficar indisponível em horário de pico | Crédito por geração depende do modelo; vídeo é opcional | Abertura com telas estáticas no GDevelop |
| Suno | 50 créditos/dia e até 7 downloads de teste vitalícios no Free | Uso pessoal **não comercial**; não usar como trilha de produto monetizado | Trilha própria ou áudio com licença explícita |
| ElevenLabs | 10.000 créditos/mês no Free, compartilhados entre recursos | Uso não comercial com atribuição; não clonar voz alheia | Voz própria autorizada ou efeito local |
| Meshy | 100 créditos/mês e 10 downloads/mês de modelos Meshy 6 Lite **sem textura** | CC BY 4.0 com atribuição, inclusive uso comercial; outras versões/texturas podem exigir plano | Blender ou GLB licenciado |

## Alterações aplicadas

- Atualizado `v3/teacher-mission-six-matrix.js` com limites de download do Suno, resolução gratuita do Gemini e fonte oficial de preços do ElevenLabs.
- Preservada a exigência de um único asset importado no GDevelop e comprovado em Preview; nenhuma ferramenta externa é obrigatória.
- Confirmados cinco fluxos de importação e respectivos planos B em `v3/asset-forge-tutorial.js`.

## Fontes oficiais verificadas

- Gemini: https://support.google.com/gemini/answer/14286560
- Flow: https://support.google.com/flow/answer/16526234
- Suno downloads: https://help.suno.com/en/articles/13926209
- Suno direitos: https://help.suno.com/en/articles/9601601
- ElevenLabs preços: https://elevenlabs.io/pricing
- ElevenLabs direitos: https://elevenlabs.io/docs/overview/administration/billing
- Meshy Free: https://help.meshy.ai/en/articles/15696428-what-is-included-on-the-free-plan
- Meshy propriedade: https://help.meshy.ai/en/articles/10137554-what-is-the-ownership-of-the-generated-models

## Limites

Não foram criadas contas, realizadas gerações, downloads ou pagamentos para testar os planos; as informações são as regras públicas oficiais, não uma garantia de acesso em qualquer conta. O teste `node qa/v3-audit-tools.cjs` verifica consistência interna da matriz e do tutorial.
