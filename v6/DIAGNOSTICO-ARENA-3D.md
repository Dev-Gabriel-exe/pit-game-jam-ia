# V6 — investigação forense do Coliseu 3D

**Escopo e isolamento.** Criada em 03/11/2026 como cópia byte a byte da `main` no commit `789ed8bccc22db4410adffec654bb2aab20efc24`. Toda mudança posterior fica exclusivamente na branch `v6`. Não fazer PR/merge com `main`, não publicar no GitHub Pages principal, não alterar o Vercel `pit-game-jam-chat` nem o banco Neon de produção.

## Histórico técnico consolidado

- **29–31/10:** a V5 desenvolveu a Cidadela do Eclipse, as quatro classes (Guerreiro, Arcanista, Caçador, Guardião), 120 talentos, arena M5/M10, modelos KayKit e animações. Os testes isolados incluíam 2 GLBs verdadeiros e esperavam vitória da batalha em navegador.
- **31/10–02/11:** pontes experimentais de estudantes/professor, convites de duelo e autorização. A V5 isolada ainda não era o mesmo fluxo que a V3 + Neon + visualizador oficial usado pelos alunos.
- **03/11:** integração em `chat-api/api/coliseum.js` e `v3/v5-coliseum-live.js`. O aceite do duelo grava o combate, abre `<iframe src="./v5/coliseum-live.html">` e recebe um snapshot via `postMessage`. Foi relatado travamento aproximadamente 2–3 segundos depois em dois navegadores reais, inclusive ao rever o duelo.
- Tentativas emergenciais de reduzir geometria e trocar o renderizador por Canvas 2D não resolveram o relato de produção. A `main` voltou à arena 3D compacta para duelos, com os duelos desabilitados para aula.

## Diferença comprovada na metodologia de QA

**Teste antigo da arena V5:** `qa/v5-duel-3d-browser.cjs` exige `dataset.v5ModelsLoaded === '2'`; o ambiente real renderiza GLBs KayKit.

**Teste do Coliseu integrado:** `qa/v5-live-coliseum-browser.cjs` intercepta todos os requests de `https://raw.githubusercontent.com/**` e responde **HTTP 404**. `v5/character-assets.js` carrega precisamente dali os modelos `Barbarian.glb`, `Mage.glb`, `Rogue_Hooded.glb` e `Knight.glb` (~3,6 MB por classe). Como `arena-three.js` tolera erro de carregamento, o teste avança sem realmente renderizar modelos KayKit.

**Consequência:** um CI verde na integração não comprova que carregamento de modelos, download de animações retargeted e combate simultâneo em dois PCs funcionem. Isso **não determina sozinho** a causa do crash de produção.

## Hipóteses a testar, não conclusões

1. **Carga assíncrona de GLBs:** dezenas de MB de conteúdo e animações efetivamente chegando ~2–3 segundos após o duelo iniciar; GLTFLoader, skeleton cloning, mixagem e shader compilation acontecem em paralelo.
2. **GPU/render thread:** o Coliseu abre um contexto WebGL dentro de `iframe`, enquanto o painel V3 continua aberto. O teste de CI usou software rendering SwiftShader, que não replica os drivers dos computadores da escola.
3. **Memória/liberação de recursos:** fechamento/reabertura com `iframe`, meshes e texturas; verificar `dispose` e comportamento de context lost, sem inferir falha do Neon.
4. **Efeitos e talentos de builds reais:** o teste só tinha alguns dados fictícios; combate real pode disparar clips e eventos não testados.
5. **Rede/cache:** import map de Three.js via jsDelivr, modelos via raw.githubusercontent.com e animações locais; falhas intermitentes de download não podem ser ignoradas.

## Teste da V6 (sem infraestrutura de produção)

- Arquivo `qa/v6-duel-real-assets-browser.cjs`.
- Workflow `.github/workflows/v6-real-assets-duel.yml`, restrito à branch `v6` (sem deploy).
- Abre **dois navegadores** simultâneos com o mesmo snapshot de partida, carrega GLBs reais (não intercepta GitHub Raw), exige **2 modelos carregados em cada navegador** antes de iniciar, monitora ~26s de luta e registra FPS, draw calls, erros JavaScript, falhas de recursos, loaders e perda de WebGL.
- Antes de aprovar qualquer correção visual, executar teste com modelos reais e repetir com animações/efeitos desligados para isolar a origem do crash.
- Depois testar 30 modelos reais no mesmo navegador e, separadamente, múltiplos navegadores. 30 combatentes simulados no Node **não equivalem** a 30 clientes reais.
- Todos os testes usam alunos fictícios, sem PIN nem token de produção.

## Achado confirmado por regressão automatizada

**Erro confirmado:** a ponte `v3/v5-h1e-bridge.js` chama `allowedToDuel()` (definido apenas para staging localhost) dentro de `update()`, inclusive quando a origem é o GitHub Pages real. O fluxo `chooseTab('hero')` remove a visualização atual e desmonta o `iframe` 3D. O botão do duelo também fica desativado durante atualizações da V3.

**Prova:** `qa/v6-duel-bridge-regression.cjs` simula a origem `https://dev-gabriel-exe.github.io` sem usar contas reais, abre o duelo e chama `PIT_V5_H1E.update()`. Antes da correção, o GitHub Actions falhou com o resultado `'hero' !== 'duel'`, exatamente na verificação de persistência da aba aberta (run `41685355796`). A mudança na `v6` ignora esse bloqueio de homologação quando `productionLive()` é verdadeiro e deixa a autorização com o servidor Coliseu.

**Limitação:** isso comprova que a interface podia sumir ao atualizar o estado, mas **não comprova** que seja a única origem dos travamentos WebGL.

## Primeiro teste de asset real

Run `41684668123`: dois navegadores com `Mage.glb` e `Knight.glb` autênticos (ambos HTTP 200, ~3,59 e 3,66 MB), duas instâncias simultâneas de WebGL, aproximadamente **27 segundos** de luta cada. Sem exceções JavaScript, falhas de rede ou perdas de WebGL; FPS de **9 a 16** sob SwiftShader. Isso mostra que carregar GLBs não é, sozinho, condição suficiente para reproduzir o crash. O teste ainda não inclui o painel V3 completo nem a GPU da escola.

## Terceiro achado: queda de FPS dentro do painel V3

A regressão `qa/v6-duel-integrated-browser.cjs` reproduziu com dados **fictícios** o ciclo completo: V3 (em origem simulada do GitHub Pages) → Coliseu → convite aceito → snapshot → `iframe` WebGL com dois GLBs KayKit reais → atualização do estado do aluno. O teste intercepta chamadas à API e não se conecta à produção.

- **Run 41685991643 (CSS original):** carregamento dos dois GLBs HTTP 200, sem exceções nem perda de contexto; porém amostras no primeiro navegador de **2, 5, 3 e 4 FPS**. A aba não fechou depois do fix da ponte, mas o desempenho ficou insuficiente.
- **Run 41686321937 (sem blur de 14px):** FPS medidos de **4, 5, 7, 7** no primeiro e **6, 7, 3, 6** no segundo. O blur contribui, mas retirá-lo **não resolve** o desempenho de todos os navegadores.
- **Comparação com V6 sem painel V3 (run 41684668123):** dois tabs com GLBs e animações reais durante ~27s, FPS **9–16**, sem travamento.
- **QA antiga reforçada:** `qa/v5-live-coliseum-browser.cjs` não retorna mais HTTP 404 artificial aos GLBs, exige `v5ModelsLoaded===2` e passou em V6 no run `41686176269`.

**Conclusão técnica limitada:** há ao menos dois problemas separados — desmontagem da aba por regra de staging (reproduzida e corrigida) e degradação de FPS na incorporação WebGL dentro da interface V3 (reproduzida e **ainda não resolvida**). Não é correto atribuir toda a falha ao Neon, à classe do personagem ou apenas ao blur sem outro experimento.

## Experimento V6 de desempenho — resultado

**Run 41686813852 (V6, resolução interna controlada do WebGL apenas em duelos 1×1):** os dois navegadores atravessaram o fluxo completo V3 → convite já aceito → iframe Coliseu → carregamento real de `Barbarian.glb` + `Mage.glb` → atualização do estado V3 durante o combate. O painel permaneceu na aba **Duelos**, o iframe continuou conectado e ambos os navegadores mantiveram os dois modelos reais carregados.

Amostras de FPS no renderizador de software:

| Experimento | Navegador 1 | Navegador 2 | Resultado |
| --- | --- | --- | --- |
| V3 original com blur de 14px | 2, 5, 3, 4 | não coletado após o primeiro erro | Reprovação |
| Sem blur | 4, 5, 7, 7 | 6, 7, 3, 6 | Reprovação |
| Sem blur + `renderScale: 0.58` na arena 1×1 | **9, 8, 7, 6** | **8, 7, 8, 5** | Passou critério mínimo de 5 FPS |

Sem erros de JavaScript, GLB HTTP 200 e sem perda de contexto WebGL no último experimento. A resolução interna foi reduzida somente na variante de visualização de duelo dentro da V6; física, seed, atributos, talentos, arena de 30 participantes e motor de combate foram preservados. A aparência e nitidez deverão ser avaliadas antes de qualquer integração.

**Importante:** 5–9 FPS no renderizador de software ainda é desempenho modesto. Não representa garantia de fluidez nos computadores da escola, especialmente com 30 alunos simultâneos. Ainda será necessário testar uma visualização 3D fora de `iframe`/overlay para melhorar a fluidez sem perda de resolução.

## Segunda rodada — comparação direta e defeitos de ciclo de vida

### O que mudou ao integrar a V5

A prévia V5 executava o palco 3D isoladamente. A integração adicionou o painel V3, atualizações periódicas da sessão, carregamento assíncrono da ficha real e o visualizador oficial. Dois desses caminhos podiam remover a arena sem uma exceção no motor 3D:

1. **Atualização da ponte:** a autorização exclusiva de staging redirecionava o aluno para Meu Herói na origem de produção. A primeira rodada já reproduziu e corrigiu esse caminho.
2. **Resposta atrasada da Forja:** `syncFromNeon()` conservava uma referência ao contêiner compartilhado. Se o aluno mudasse de Meu Herói para Duelos/Arena antes da resposta HTTP, o callback chamava `mount(container, context)` e substituía o `iframe` do combate pela ficha. Salvar e copiar a ficha tinham o mesmo risco ao concluir suas operações assíncronas.

O segundo defeito foi reproduzido em `qa/v6-hero-late-response.cjs`: com o código anterior, o teste falhou porque uma resposta GET atrasada substituiu um duelo ativo por `.rhero-root`. Após a correção, GET, salvamento e clipboard atualizam somente a ficha correspondente ainda montada. A identidade do aluno e da turma continua sendo conferida; a resposta pode atualizar o modelo em memória sem pintar outra aba.

**Isso explica como a integração pode fazer o duelo desaparecer embora o mesmo palco 3D funcione na V5. Não é evidência de crash do processo do navegador ou de uma falha de driver.**

### Espera dos modelos, recuperada da V5

Outra regressão foi comprovada antes da alteração: o visualizador oficial habilitava Iniciar replay imediatamente após criar os objetos do palco, enquanto os GLBs ainda estavam chegando. A V5 isolada esperava os dois modelos reais.

`qa/v6-viewer-readiness.cjs` falhou com zero GLBs carregados e passou após a correção. A V6 agora exige todos os GLBs da lista antes de iniciar: 2 no duelo ou até 30 na arena. A mesma regra vale ao reiniciar uma partida concluída. Falhas de download mantêm o início bloqueado e apresentam orientação para reabrir. O encerramento descarta o palco e o monitor.

### Comparação com a branch V5, até o vencedor

Run [41689685294](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41689685294), commit de teste `e962378`: três cenários, dois contextos de navegador por cenário, GLBs KayKit autênticos e seed `4175863657`.

| Cenário | V5 de referência | V6 isolada | V6 incorporada na ponte V3 |
| --- | --- | --- | --- |
| Duelo, 2 heróis | Concluiu | Concluiu | Concluiu; aba preservada |
| Arena M5, 30 heróis | Concluiu | Concluiu | Concluiu; 30 GLBs carregados |
| Arena M10, 30 heróis | Concluiu | Concluiu | Concluiu; 30 GLBs carregados |

Foram **18 reproduções completas**, sem exceções JavaScript, crash de tab ou perda de WebGL. A referência foi obtida diretamente de `feature/v5-arena-dos-criadores`, SHA `16184fedfd3119efb7e60cd302b0bafee11dcf79`, sem modificá-la. A aparência original do duelo usa escala 2,6; o combate oficial usa escala 5. Essa diferença é registrada e o resultado de cada configuração é conferido com seu próprio motor; não se afirma que os dois duelos têm o mesmo tempo de encerramento.

**Desempenho:** as medianas sob SwiftShader foram 0–1 FPS nas arenas de 30 tanto na V5 de referência quanto na V6, com amostras arredondadas para inteiro. O duelo compacto da V6 teve aproximadamente 10 FPS incorporado e 14 isolado nessa rodada. As superfícies CSS foram igualadas, mas o duelo V6 ainda usa a redução de resolução experimental registrada na primeira rodada; portanto estes números não constituem uma comparação de qualidade visual equivalente.

O sucesso acima é **funcional**: carregamento real, continuidade do combate, preservação da tela e resultado. Não é aprovação de fluidez. Como a própria V5 de referência fica lenta no renderizador de software, esse experimento não permite concluir que o `iframe`, sozinho, causou a lentidão vista nos PCs.

### Concorrência real da API em PostgreSQL descartável

Run [41689944067](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41689944067), `qa/v6-30-clients-postgres.cjs`:

- 30 identidades fictícias autenticadas; cada uma vê os outros 29 rivais.
- 15 convites disjuntos e 15 aceites concorrentes; os dois alunos recebem a mesma partida.
- Arenas M5 e M10 com 30 builds, início docente concorrente sem duplicação e 30 leituras simultâneas do resultado.
- 187 chamadas ao handler verdadeiro: zero falhas, maior tempo observado 286 ms, p95 de 217 ms no ambiente de teste.
- Mesmas notas e aprovações antes/depois de cada confronto.

O teste rejeita bancos remotos e aceita somente PostgreSQL local em `/v6_coliseum_test`. **30 clientes da API não equivalem a 30 GPUs ou PCs homologados.**

### Página completa do aluno

Foi acrescentada a execução `app` em `qa/v6-render-matrix.cjs`, com `aluno-v3.html` e seus scripts verdadeiros, sessões fictícias e todas as chamadas ao Vercel interceptadas. Exercita abrir a Forja, trocar de aba antes da resposta da ficha, reproduzir até o resultado enquanto o polling normal da V3 trabalha, fechar, reabrir, iniciar e pausar novamente.

O duelo passou no run [41691171956](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41691171956): dois clientes, modelos reais, resultado oficial, nenhuma perda de WebGL, resposta da Forja liberada com o duelo aberto e reabertura/descarte confirmados. A M5 também passou no mesmo run; a M10 concluiu a primeira batalha, mas o controle de início não ficou disponível ao reabrir no primeiro cliente dentro de 150 s. A rodada com o tamanho responsivo original [41691767379](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41691767379) confirmou o duelo e a primeira batalha de ambas as arenas, mas reproduziu falhas de controle/reabertura sob a carga de software. Não se deve tratar a conclusão da primeira batalha como aprovação do replay repetido.

### Menos dados duplicados nas animações

A integração do pacote KayKit 1.1 acrescentou animações retargeted. Cada herói montava cópias próprias dos mesmos quadros, embora as ações do Three.js tenham seu próprio mixer e possam compartilhar clipes. O teste `qa/v6-motion-sharing.cjs` mostrou 30 clipes duplicados para 30 esqueletos iguais antes da correção, e um único clipe compartilhado depois. Esqueletos com nomes de ossos diferentes continuam usando clipes próprios; ações e tempo de cada herói permanecem independentes.

Com os cinco arquivos de animação reais lidos pelo GLTFLoader em Node, 30 esqueletos clonados e 495 ações, o volume dos quadros retargeted caiu de **6.531.096 para 458.488 bytes**. Isso mede somente a memória dos quadros de animação no ensaio, não toda a RAM/VRAM da arena. Nenhuma animação, efeito, talento, regra de combate ou resolução foi removida por essa mudança. A redução é um custo removido com evidência, não prova da origem da falha de reabertura.

### Reabertura da M10: download concluído, decodificação não concluída

O [log instrumentado](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41692594310/job/126114728011) confirmou um caso diferente do fechamento da aba: a M10 foi reaberta e o `iframe` permaneceu montado, com a arena e o contexto WebGL prontos. Os quatro arquivos de personagens retornaram HTTP 200, porém nenhum dos 30 heróis chegou a `loaded` antes de expirar o carregamento. O monitor registrou um intervalo de **66.314 ms** entre quadros enquanto a arena vazia já estava desenhando centenas de milhares de triângulos. O controle de iniciar ficou bloqueado corretamente; o problema era a preparação gráfica, não a autorização do duelo.

Em `70df721`, o replay compartilhado deixou de desenhar o palco pesado antes que os GLBs estejam decodificados. A montagem, o download e a contagem de modelos continuam acontecendo; quando todos estão prontos, a mesma cena começa a renderizar. As prévias isoladas da V5 não usam esta espera de desenho, e a geometria/qualidade da partida pronta permanece igual.

Um ensaio em Chromium 140/SwiftShader usou os bytes autênticos dos GLBs fixados no repositório e reteve apenas a entrega dos quatro arquivos de personagens. Antes da correção (`09b4407`), houve **1.988 chamadas WebGL de desenho** com zero personagens carregados. Após a correção, houve **zero** até liberar os arquivos; em seguida carregaram os **30** heróis e o relógio do combate avançou. Essa comparação verifica a remoção do trabalho gráfico durante a carga, não a fluidez posterior da arena.

Na validação completa, as duas batalhas ainda rodam simultaneamente. Para testar a reabertura no renderizador de software, fecha-se primeiro a cena dos dois clientes e reabre-se uma de cada vez; eles compartilham a GPU virtual da mesma VM. Os controles são acionados com Enter, que é suportado pelos botões reais, evitando o timeout do Playwright que aguarda quadros para declarar o clique estável sob FPS extremo.

### Resultado da rodada final

O [run final com o caderno completo](https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/41693826488), commit `70df721`, passou nos três cenários com o tamanho responsivo real. Em cada cenário, dois clientes abriram a Forja, trocaram de aba antes da resposta, completaram a batalha em paralelo, receberam o mesmo resultado e fecharam, reabriram, iniciaram e pausaram o replay. Os modelos eram autênticos; somente contas e API do navegador eram fictícias.

| Cenário | Personagens por cliente | Resultado nos dois clientes | WebGL e JavaScript |
| --- | ---: | --- | --- |
| Duelo 1×1 | 2 | Vencedor aos 17,8 s simulados e replay reaberto | Sem perda de contexto ou exceções |
| Arena M5 | 30 | Vencedor aos 73,9 s simulados e replay reaberto | Sem perda de contexto ou exceções |
| Arena M10 | 30 | Vencedor aos 82,5 s simulados e replay reaberto | Sem perda de contexto ou exceções |

O duelo teve medianas de 17 e 18 FPS nesse run de software. As duas arenas tiveram amostras de 0–1 FPS arredondados, assim como no teste da V5 de referência. A validação confirma ciclo de vida, carregamento e resultado; a fluidez de 30 heróis requer os PCs da escola. A `main` permaneceu em `789ed8bccc22db4410adffec654bb2aab20efc24` e não houve deploy nem acesso ao banco de produção nesta investigação.

## Estado

- [x] Branch `v6` criada a partir da `main` sem diferença inicial.
- [x] Auditoria de fluxos V5 isolada versus V3 integrada e identificação do mock enganoso de GLBs.
- [x] Teste de dois navegadores reais criado exclusivamente na `v6`.
- [x] Primeiro teste com modelos reais: dois navegadores por ~27s, sem travamentos em CI (não conclui homologação de PCs reais).
- [x] Reprodução do fechamento indevido do duelo durante o refresh V3; correção validada em navegador na V6.
- [x] Queda de FPS no Coliseu integrado reproduzida em dois navegadores com modelos reais.
- [x] Experimento de redução controlada do custo de pixels elevou as duas janelas integradas para 5–9 FPS em CI (critério técnico mínimo atendido, fluidez ainda insuficiente para homologação).
- [ ] Homologar GPU dos PCs reais e concorrência de até 30 alunos.
- [x] 30 combatentes reais, M5 e M10, em dois contextos de navegador, até o vencedor; sem homologar PCs físicos.
- [x] Concorrência de 30 clientes na API verdadeira com PostgreSQL local descartável.
- [x] Resposta assíncrona da Forja substituindo a arena reproduzida e corrigida só na V6.
- [x] Início e reinício bloqueados até todos os GLBs reais estarem carregados.
- [x] Clipes KayKit compatíveis reutilizados entre heróis sem compartilhar a reprodução.
- [x] Renderização da arena vazia antes dos GLBs isolada e removida da inicialização oficial.
- [x] Verificação final do fluxo completo de aluno em duelo, M5 e M10, com reabertura e pausa.
- [ ] Homologação final antes de cogitar integração à `main`.

**Regra:** `main`, GitHub Pages principal, Vercel e Neon da aula não podem ser modificados por investigações da V6.
