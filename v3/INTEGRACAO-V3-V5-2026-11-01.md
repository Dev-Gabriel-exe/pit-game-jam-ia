# Integração V3 pedagógica + V5 arena — contrato de revisão (01/11/2026)

**PR de referência:** https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/pull/23 (rascunho, não mesclar automaticamente).

## Evidência da comparação GitHub

As branches `main` e `feature/pit-gamejam-v3-arcade` divergiram. A comparação realizada em 01/11 apontou **636 commits exclusivos da V3 e 90 exclusivos da main**. O PR #23 foi criado com `mergeable=false`; não se deve interpretar isso como autorização para sobrescrever arquivos.

### Arquivos compartilhados que precisam de reconciliação explícita

| Arquivo | O que preservar da V3 | O que preservar da main |
| --- | --- | --- |
| `aluno-v3.html` | Scripts e conteúdo das dez missões, recuperação de rascunhos e evidências | Botão `pitV5HubButton`, CSS e JS `v5-h1e-bridge` |
| `professor-v3.html` | `teacher-private-notes-guard.js`, notas recolhidas, conteúdos e validações M01–M10 | Botão de controle de duelos, bridge V5, deck/projetor e estilos cinematográficos |
| `chat-api/api/chat.js` | Correções de anexos, autenticação, isolamento de conversas e regressões V3 | Compatibilidade com o chat/ambiente atual |
| `chat-api/api/classroom.js` | Validação de evidências, estados, aprovação/revisão e controles de missão | Contrato da sala usado por XP/heróis e arenas |

**Importante:** `v3/v5-h1e-bridge.js` está referenciado na `main` e não deve ser adicionado isoladamente à branch V3 sem suas dependências V5. A incorporação exige revisão de assets, módulos, rotas e APIs.

## Contrato mínimo de homologação com dados fictícios

1. Aluno e professor entram em sessão de teste; PIN/token e conversas reais nunca aparecem em logs ou prints.
2. Missões 1–10: objetivo, ferramenta, execução, teste e evidência coerentes nos dois perfis; rascunhos antigos preservados.
3. Apresentação do professor: `details.pit-private-teacher-notes` fechado por padrão, ícone discreto `▤`, nenhum texto privado no slide; confirmar fechamento após `pageshow`, `DOMContentLoaded`, navegação e abertura do projetor.
4. Progressão: aprovação real de missão, XP derivado do servidor, distribuição de atributos/talentos e bloqueios coerentes.
5. Duelo: convite, aceite, recusa, notificação, janela da arena, encerramento e retorno sem conceder XP indevido.
6. Missão 5 e Missão 10: liberação coletiva exclusivamente pelo professor; acesso não liberado deve falhar.
7. Simulação de 30 alunos, desempenho e recuperação de erros em navegador desktop; testar Chrome e fluxo com PostgreSQL **descartável**.
8. Validar as migrações V5 antes de implantar API; não executar SQL sobre banco de alunos reais para testes.
9. Verificar CI de ambas as branches **no SHA exato**, sem confundir teste estático com browser/HDMI/GDevelop reais.

## Ação V3 nesta rodada

Endurecido `v3/teacher-private-notes-guard.js`: notas privadas que o navegador restaura abertas agora são recolhidas em `DOMContentLoaded` e `pageshow`, além das proteções existentes. Adicionadas regressões Node e Chrome para essas transições.

**Testes executados:** sintaxe Node e regressão determinística em ambiente local com o mesmo código do guard: PASS. **CI nativa e Chrome após este commit:** ainda precisam ser confirmadas. **HDMI físico, GDevelop GUI, teste humano e banco de produção:** NOT_RUN.

**Regra de coordenação:** o agente de arena deve preservar suas alterações na `main`/V5; o agente pedagógico continua exclusivamente na branch V3. Revisar este contrato e o PR #23 antes de integrar. Não mesclar nem publicar automaticamente.


## Achado de compatibilidade da sala e integridade das evidências (01/11, revisão seguinte)

**Falha de integridade corrigida somente na branch V3:** o backend V3 usava `cleanEvidence(...,750)` com `.slice(0,max)`. Uma resposta estruturada acima de 750 caracteres podia ser aceita com o último campo cortado, mesmo que a interface tivesse preservado o rascunho. A API V3 agora **rejeita com HTTP 400**, não grava e informa o limite; mantém as quebras de linha CRLF normalizadas para recuperar os campos. A regressão em `qa/v3-isolated-backend.cjs` usa turma fictícia e cobre 750/751 caracteres, não sobrescrita e CRLF. A CI nativa após estes commits deve ser verificada antes de homologar.

**Conflito funcional real a resolver no PR #23:** o endpoint `POST /api/classroom?action=stage` da V3 aceita `{stage,phase}` e atualiza `current_stage` e `phase`; o endpoint na `main` aceita apenas `stage`, avança sequencialmente e mantém `phase='practice'`. O app V3 chama o endpoint com `{stage,phase}` e calcula `canSubmit` a partir da fase atual; o backend da `main` usa liberação **por missão**, independente da fase projetada. Não substituir o backend da `main` pelo da V3: isso pode reintroduzir bloqueios e retrocesso de missão, com impacto em XP, heróis e arena. A integração deve preservar a regra de liberação por missão da `main`, adaptar o cliente pedagógico V3 e criar testes de aceitação com dados fictícios antes de qualquer merge.

**Conflito de evidência:** o backend da `main` ainda normaliza `evidence` com `clean(...,750)`, que remove quebras de linha e trunca. Antes de transportar o ajuste V3, conferir o formato dos campos e o contrato das migrações V5; não aplicar merge automático em `chat-api/api/classroom.js`.

## Reconciliação implementada na branch V3 — 01/11/2026, 12h (Fortaleza)

- `chat-api/api/classroom.js`: liberação agora é **por missão**, sequencial e monotônica (`GREATEST` com condição atômica `stage <= current_stage+1`); fases do projetor não bloqueiam submissão. Preservadas autenticação, evidência integral até 750 caracteres, revisão e aprovação.
- `v3/app.js`: os dez `canSubmit`, o formulário genérico e a prática de aluno seguem `current_stage`, independentemente de `state.phase`; o professor pode alternar telas localmente sem retroceder o desbloqueio. A API recebe apenas `{stage}` para liberar a próxima missão.
- `qa/v3-m04-regression.cjs`: expectativa antiga de bloqueio durante `briefing` substituída por casos de salto proibido, submissão liberada e retrocesso impossível.
- Teste executado: **17 verificações em V8**, incluindo handler real com PostgreSQL e crypto simulados, além de verificações estáticas dos dez contextos do cliente; **PASS**. Sintaxe JS avaliada em V8. Não equivale a PostgreSQL nativo, Browser QA ou GDevelop GUI.
- Commits: `2ce0578b951fbc25493aa5481ddaab36787768be`, `945cd8e90aa448f1f22934a1cb4375e270782b6a`, `27e87b1d34ec59d24c378c4dc4361d0b6f85c94c`, `6f6019b4b7ea00836e5b0039df75d6947de1b2a0`.
- **Pendente:** CI nativa e Browser QA no SHA final, simulação PostgreSQL descartável com 30 alunos, compatibilidade de API com a ponte V5 e homologação humana. Não mesclar PR #23 automaticamente; não alterar `main`.

## Verificação de estado da sala e CI descartável — 01/11/2026, rodada seguinte

- O backend V3 agora retorna **HTTP 503** quando a linha `pit_classroom_state` ainda não existe, tanto no envio do aluno quanto na liberação do professor. Antes, estes caminhos devolviam 500 ou 409 e confundiam falha de inicialização com erro pedagógico. O contrato de liberação sequencial e monotônica continua inalterado.
- A suíte `qa/v3-postgres-integration.cjs` ainda tentava liberar a M04 diretamente da M01, incompatível com a regra vigente. Agora exige M02 → M03 → M04, rejeita saltos, preserva desbloqueios ao revisitar telas e confere que uma evidência com 751 caracteres não é gravada parcialmente.
- Novo workflow **`.github/workflows/v3-postgres-integration.yml`**: PostgreSQL 16 descartável, três alunos fictícios, PIN de teste, regressão de handlers e fluxo de chat/evidência; escopo de push restrito à branch V3. **CI configurada, mas resultado ainda NÃO CONFIRMADO**. O workflow não se conecta ao Neon ou a alunos reais.
- Verificação local de código via V8: 8 casos executados com o handler real e SQL simulado, todos PASS; compilação sintática de três arquivos JS PASS. Isso **não equivale** à execução PostgreSQL 16, Chrome ou teste físico.
- **Para o agente V5:** não substituir a liberação sequencial da `main` por lógica antiga de fases; incorporar apenas a proteção 503 e o contrato de evidência após testes de regressão. PR #23 permanece rascunho, sem merge automático.
