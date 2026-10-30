# Fase H.0 — Contrato pedagógico de integração (isolado)

**Status:** implementado e testado apenas como especificação executável / validador puro na branch `feature/v5-arena-dos-criadores`. **NÃO conectado a turmas, contas, API, XP, banco, V3 nem à `main`.** A homologação da G.2 nos computadores reais da escola continua obrigatória antes da H operacional.

## Escopo implementado agora

Arquivo `v5/progression-contract-h0.js` (sem dependência de browser/servidor; recebe catálogo de 30 talentos por classe do `v5/phase2-combat.js`):

- Aprovações em ordem da missão 1 à 10, sem lacunas. Missões aprovadas fornecem **2 pontos de atributo + 1 talento** cada. Para a M5: orçamento máximo 10 pontos/5 talentos; para a M10: máximo 20 pontos/10 talentos.
- Cinco atributos da V5: `FOR`, `DES`, `INT`, `VIT`, `DEF`. Cada classe usa **somente** os 30 talentos de seu próprio catálogo. Rejeita duplicações, talentos de outra classe, pontos excedentes ou progresso não aprovado.
- **Antes da primeira entrada na M5:** o aluno pode reorganizar a build em um sistema autorizado. Ao entrar pela primeira vez, o sistema do servidor terá de registrar atomicamente o snapshot `m5Frozen`. O validador compara snapshots e impede, na transição, congelar uma build diferente da anterior. Para construir a entrada da M5, o protótipo exige que `m5Entered` e `m5Frozen` já estejam estabelecidos.
- **Depois da M5:** os pontos e talentos travados na primeira entrada não podem ser retirados ou redistribuídos. Novos pontos/talentos de missões 6–10 são adicionais, nunca removem os compromissos existentes. O lock M5 não pode ser apagado.
- **Na final M10:** exige as 10 missões aprovadas e uma marca de lock final `m10Locked`. Lock final é irreversível na comparação entre snapshots. O validador preserva a classe, a chave pseudônima do jogador e a sequência de aprovações.
- Somente chaves de laboratório `trial-...` são admitidas nesse H.0; o módulo não conhece nomes, e-mails, PINs, turmas ou dados de estudantes. Retorna **cópias congeladas** de resultados, sem mutar builds recebidas.
- Adaptador `m5ArenaAdapter` gera formato compatível com o **motor experimental atual da M5**. Não existe adaptador M10: `v5/phase2-combat.js` ainda rejeita mais de 5 missões; a missão 10 não poderá ser conectada ao motor legado por engano.

## Segurança e autorização — obrigatórias quando a H for liberada

**O validador não autentica nem transforma um objeto do navegador em dado confiável.** É um contrato puro para simulações e futuros testes. Para conectar estudantes reais, um backend autenticado e autoritativo terá de:

1. Verificar identidade, turma e permissão do aluno/professor. Somente o servidor decide quantas missões estão aprovadas e qual XP foi realmente creditado (100 XP-base por missão; não confundir com bônus de revisão).
2. Persistir as aprovações, escolhas e a primeira entrada da M5 **numa transação atômica**, com revisão/versão para evitar duplicação e corrida de pedidos. Um replay do botão não cria talento nem pontos adicionais.
3. Aplicar mudanças de build com validação contra a versão anterior e contra o lock M5/M10 no servidor, não confiando em chaves, flags, contagens de XP nem `m5Entered` enviados pelo navegador.
4. Ter **uma simulação autoritativa do torneio**, com difusão de estados/câmera de professor e espectadores; espectadores não criam replays ou sistemas de dano individuais. Garantir sincronização temporal e recuperação em reconexão.
5. Integrar a interface da V3 e as dez missões **somente após** aceite visual, testes com PCs reais e aprovação explícita para a integração. Evitar qualquer merge para `main` por enquanto.

## Testes

- `qa/v5-progression-contract-h0.cjs`: testa as **120 habilidades de catálogo (30 por classe)**, limites de atributo e talento por missão, bloqueio contra classe cruzada, progressão em sequência, snapshot M5 imutável, pontos antigos não redistribuíveis, lock final M10 e proibição de executar a M10 no motor atual.
- `.github/workflows/v5-progression-contract-qa.yml`: CI só de políticas, mais regressões do motor e da câmera. A H.0 não chama contas, API ou banco.
- Primeiro run: https://github.com/Dev-Gabriel-exe/pit-game-jam-ia/actions/runs/40997697983 — **aprovado**.

## Gates seguintes

**G.2** aceitação dos PCs reais ainda pendente. **H.1**, após autorização para a integração, inspecionar o armazenamento e autenticação reais da V3; especificar e implementar transação de entrada M5, versionamento, revisão docente e isolamento por turma. **H.2** propagar estados/câmeras do jogo em tempo real com autorização. **H.3** definir motor M10 que executa os 10 talentos, sem regressar para o motor legado. **I** homologação professor/aluno e merge com autorização.
