# Missão 03 — Ligar o Motor: piloto professor/aluno

## Status
**Implementação pedagógica e funcional publicada na branch V3 (27/10/2026).** A Missão 03 ainda precisa de inspeção em navegador real e teste integrado com uma turma fictícia antes de ser homologada para sala.

### Critério principal
Ao término, o aluno terá **um projeto vazio salvo**, **uma cena nomeada**, **um objeto e uma instância visíveis no Preview** e **a origem do recurso registrada**. O personagem não precisa se mover, não precisa haver gameplay completo e a tarefa não exige música, vídeo, vozes, IA 3D ou publicação do jogo.

### Por que 30 minutos são suficientes apenas com este recorte

| Etapa | Min | Professor / aluno |
|---|---:|---|
| Fundamentos de projeto, cena, objeto, instância, Preview e persistência | 5 | Conceitos técnicos explicados na própria aula |
| Tour visual do editor em 6 telas | 5 | Capturas verificadas da documentação oficial, com tradução e resultado esperado |
| Criar projeto e primeira cena | 4 | Uma cena, um projeto vazio |
| Produzir/obter e importar um único asset | 8 | Gemini opcional por até ~2 min **ou Asset Store do GDevelop**; para 3D, 3D Box |
| Executar Preview e salvar | 6 | Confirmar objeto em execução e localização do projeto |
| Registrar resultados | 2 | Nome do objeto, cena, tipo, origem, observação real e local de salvamento |
| **TOTAL** | **30** | |

## Ferramentas delimitadas na Missão 03
**Obrigatória:** GDevelop (web editor ou aplicativo).  
**Opcional para imagem 2D:** Gemini (geração de uma imagem original).  
**Alternativa sem trocar de aplicativo:** Asset Store no próprio GDevelop; para 3D, 3D Box nativo.

**Limite operacional:** se o Gemini não gerar e permitir obter a imagem em aproximadamente 2 minutos, utilizar o Asset Store ou o 3D Box. A geração com IA é opção de aprendizado, não dependência de avaliação. A situação da conexão e as regras gratuitas podem variar.

## Ferramentas explicitamente adiadas para a Missão 06 (Forja de IA)
- **Google Flow**: vídeos/cutscenes somente quando houver um projeto que já possa recebê-los.
- **Suno**: trilhas musicais com cuidado quanto aos limites de crédito, downloads e licença do plano gratuito.
- **ElevenLabs**: vozes/efeitos, também sujeitos às condições do plano gratuito e permissões de uso.
- **Meshy** ou alternativas 3D: modelos customizados quando houver tempo e necessidade.
- Nenhum aluno será obrigado a experimentar todas essas ferramentas; a atividade da Missão 06 poderá oferecer trilhas alternativas de produção e uma única entrega de asset integrado.

## Materiais implementados
- `v3/teacher-mission-three.js`: conteúdo universitário com projeto/cena/objeto/instância, papéis do editor e do Preview, exemplos técnicos, três fragmentos de laboratório e critérios de avaliação. Cards com animação de entrada, sem notas de fala.
- `v3/student-mission-three.js`: roteiro prático com editor, ateliê mínimo, rascunho individual, alternativas 2D/3D, registro da origem do asset e evidência real de execução. Preenche a ideia/cena a partir das missões 01 e 02. Não cria evidência falsa nem atribui aprovação automática.
- `v3/gdevelop-first-run.js`: seis etapas de tutorial com capturas reais de documentação GDevelop verificada e explicação em português na própria tela; imagens com fallback local.
- `v3/assets/guide/gdevelop-inicio-pt.svg`: diagrama autoral em português, **não** apresentado como screenshot literal.
- `v3/asset-studio.js` + `v3/asset-studio.css`: só **duas rotas** — IA no Gemini ou recurso integrado do GDevelop. Prompt adaptado ao jogo criado pelo aluno, exportação/importação e botão de cópia.
- `v3/mission-three.css`: layout do professor/aluno e tutorial integrado; suporte ao modo de movimento reduzido.
- `v3/app.js`, `aluno-v3.html` e `professor-v3.html`: integração no fluxo de fases e envio real usando as APIs existentes; simulação offline `?preview=1`.

## Diagnóstico pedagógico
- Não use o primeiro momento com a engine para aprender seis geradores de IA diferentes. Isso desloca o objetivo: sair com um projeto que abre.
- A IA deve acelerar um componente, não substituir a autoria. O aluno pode escolher conteúdo, aparência e gênero do seu projeto.
- A primeira aula de engine deve testar **instância visível no Preview**. Mecânica com controles vem na Missão 04 e regras/eventos na Missão 05.
- O **professor leigo** tem, na própria tela, glossário técnico, comandos, capturas, diagnóstico e resultado esperado. Nenhuma passagem depende de abrir páginas de documentação em inglês para explicar conceitos.

## Testes e limites
Foram executadas verificações automatizadas de sintaxe, renderização das fases, validação do registro de asset, limites de 750 caracteres, restauração de evidências, rotas 2D/3D, importação dos módulos, ilustrações com URL oficial e proteção da API em modo de prévia. Uma falha de concatenação de cards do professor foi detectada e corrigida durante a integração.  
**Ainda pendente:** testar layout em mobile/desktop real, checar disponibilidade das capturas nos computadores do laboratório, ingressar em uma turma fictícia, enviar uma entrega e aprovar ou solicitar revisão de forma ponta a ponta.

### Documentação oficial consultada (última verificação 27/10/2026)
- [GDevelop Getting Started](https://wiki.gdevelop.io/gdevelop5/getting_started/)
- [GDevelop Scene Editor](https://wiki.gdevelop.io/gdevelop5/interface/scene-editor/)
- [GDevelop Objects](https://wiki.gdevelop.io/gdevelop5/objects/)
- [GDevelop Sprite](https://wiki.gdevelop.io/gdevelop5/objects/sprite/)
- [GDevelop Preview](https://wiki.gdevelop.io/gdevelop5/interface/preview/)
- [Gemini imagem](https://gemini.google/br/overview/image-generation/?hl=pt-BR)

### Regressões após redução de escopo
- Foram realizados **24 testes automatizados funcionais**, aprovados, cobrindo navegação Próxima/Anterior (inclusive retorno ao topo para celular), troca entre Gemini e Asset Store, prompt personalizado, fallback de screenshot, contador de sete critérios, hidratação da evidência, tamanho máximo seguro de 742 caracteres, renderização do professor, tempos, CSS, roteamento e isolamento da prévia. Esse total não inclui a confirmação manual do editor em sala ou teste no navegador real.
