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

## Estado

- [x] Branch `v6` criada a partir da `main` sem diferença inicial.
- [x] Auditoria de fluxos V5 isolada versus V3 integrada e identificação do mock enganoso de GLBs.
- [x] Teste de dois navegadores reais criado exclusivamente na `v6`.
- [x] Primeiro teste com modelos reais: dois navegadores por ~27s, sem travamentos em CI (não conclui homologação de PCs reais).
- [x] Reprodução do fechamento indevido do duelo durante o refresh V3; correção feita só na v6, pendente nova validação.
- [x] Queda de FPS no Coliseu integrado reproduzida em dois navegadores com modelos reais.
- [ ] Otimizar visualização no painel e repetir regressão sem aceitar menos de 5 FPS persistentes.
- [ ] Homologar GPU dos PCs reais e concorrência de até 30 alunos.
- [ ] Regressões de 30 combatentes e de múltiplos computadores.
- [ ] Homologação final antes de cogitar integração à `main`.

**Regra:** `main`, GitHub Pages principal, Vercel e Neon da aula não podem ser modificados por investigações da V6.
