# Fase 3 — Missão 02: MVP em Foco
PIT Game Jam IA · Caderno do Professor + Caderno do Aluno · Branch `feature/pit-gamejam-v3-arcade`

## Status
**Implementação didática e lógica concluída; homologação em navegador e API real pendente.**
A Missão 01 está aprovada editorialmente pelo responsável, mas o projeto completo ainda requer ensaio com uma turma de teste antes da oficina.

## Objetivo da Missão 02 (30 minutos)

Transformar a ideia concebida na Missão 01 em um documento mínimo de projeto **viável em seis horas**, com recorte de funcionalidades, dependências e critério de aceitação. O aluno não precisa abrir o GDevelop nesta etapa. O protótipo começa a ser criado na Missão 03.

| Etapa do professor | Minutos | Conteúdo |
|---|---:|---|
| Conceitos | 9 | MVP didático, protótipo × vertical slice, dependências, prioridades Must/Should/Could, requisitos funcionais, arquitetura de eventos |
| Exemplo em ação | 5 | Laboratório interativo de corte de escopo, comparação de pontos de complexidade relativa (não tempo real) e exemplos RPG/Corrida/Puzzle |
| Oficina liberada | 14 | Quatro decisões de MVP + backlog opcional, exemplo completo de planejamento, explicação das correspondências com a engine |
| Resultados | 2 | Cena, ação central, elementos indispensáveis e aceitação testável; ponte para a Missão 03 |
| **Total** | **30** | |

## Caderno do Professor

Arquivo `v3/teacher-mission-two.js`, identidade de fantasia gótica em `v3/mission-two.css`.

- Material completo e projetável, com explicações técnicas na tela; **nenhuma nota de fala**.
- Seis conceitos desenvolvidos: MVP didático, protótipo versus vertical slice, dependências, método de prioridade adaptado a Must/Should/Could, cenários de teste e equivalência com objetos/eventos do GDevelop.
- Exemplo de um RPG com 20 mapas reduzido para uma sala, um personagem, uma interação e uma condição de vitória. Outras duas interpretações para corrida e puzzle.
- Simulador de escopo interativo com 4 requisitos obrigatórios e 4 características opcionais. Cada recurso tem **pontos de complexidade relativa**, explicitamente apresentados como simulação didática (não estimativa de tempo ou custo real).
- Animações de entrada dos cards com `IntersectionObserver`, hover e respeito a `prefers-reduced-motion`.
- Não depende de navegar para uma página externa para dar a aula: conceitos e exemplos estão incorporados; a documentação oficial aparece apenas como referência optativa.

## Caderno do Aluno

Arquivo `v3/student-mission-two.js`, estilos compartilhados em `v3/mission-two.css`.

- Herda da Missão 01 o **nome**, **gênero**, **ação principal**, **protagonista** e **objetivo**, inclusive quando a ficha estiver recuperada de evidência enviada ao servidor.
- A atividade exige somente quatro **decisões novas**:
  1. Uma cena ou percurso curto;
  2. A mecânica central;
  3. Exatamente três elementos indispensáveis, separados por vírgula;
  4. Um resultado/critério observável para saber se o MVP funciona.
- Uma quinta pergunta (recursos a deixar para depois) é opcional.
- Os placeholders adaptam-se ao gênero escolhido na Missão 01: RPG, terror, plataforma, corrida, puzzle, narrativa interativa, exploração, aventura e outro.
- Ficha gótica com prévia **em tempo real**, barra de 4 decisões essenciais, edição do plano e revisão da entrega.
- Rascunho local isolado por aluno, evidência estruturada de até **750 caracteres** e restauração de submissão aprovada/enviada via API existente.
- Estados de rascunho, revisão, envio e aprovação reais, sem atribuição fictícia de XP ou medalha.
- A prévia `?preview=1` libera a exploração das dez missões visualmente **sem enviar nada para a turma**.
- A Missão 01 (dois papéis) e as missões 03–10 anteriores permanecem disponíveis.

### Formato de evidência para o professor

```text
MISSÃO 02 — MVP EM FOCO
Jogo: [título da Missão 01]
Gênero: [gênero da Missão 01]
Cena: [escolha do aluno]
Mecânica: [escolha do aluno]
Elementos: [três elementos separados por vírgula]
Teste: [condição de aceitação]
Depois: [itens opcionais ou Não informado]
```

Não há migração ou mudança no banco. A entrega usa `POST /api/classroom?action=progress` com `stage:2`, `status:submitted`, `route:2d` e `evidence` gerada pelo aluno. O campo `route` não representa decisão de formato nesta missão: a escolha 2D/3D continua no ponto previsto posteriormente.

## Testes executados

- 32 verificações estáticas/funcionais iniciais, com **1 falha detectada** na barra de progresso: o sistema contabilizava apenas 3 dos 4 critérios.
- **Correção implementada e revalidada**: progresso agora calcula quatro critérios separadamente.
- Mais 19 testes interativos passaram: digitação e preview, progresso 4/4, validação de três elementos, navegação e evidência, isolamento por aluno, hidratação da entrega, simulador de complexidade, mudança de gênero e reinício.
- Sintaxe JS de todos os módulos, balanço de chaves CSS, carregamento dos dois HTMLs, encapsulamento do conteúdo do professor e proibição de API real no modo prévia conferidos.

## Limitações e próximos passos

- Ainda sem inspeção visual em Chrome desktop/Android/iOS.
- Sem teste de autenticação, envio, aprovação ou pedido de revisão com API real em uma turma fictícia.
- A aplicação usa estilos locais e imagens já existentes em `v3/assets/missions/missao-02.webp`. Os resultados de tempo, pontos de complexidade e conteúdo são parte da simulação didática, não previsões de conclusão reais.
- Planejado para a Missão 03: capturas reais do GDevelop, tutorial em português, projeto criado, primeiro objeto e Preview comprovável.
- Depois, sincronizar a Missão 04 (controle/colisão) e Missão 05 (eventos/variáveis) nos dois cadernos.

## Referências de verificação
- GDevelop: https://wiki.gdevelop.io/gdevelop5/tutorials/basic-game-making-concepts/
- GDevelop: https://wiki.gdevelop.io/gdevelop5/interface/

## Revisão de qualidade final — alinhamento professor/aluno (27/10/2026)

A Missão 02 foi aprovada pelo usuário quanto a aparência e conteúdo. Revisão localizada, **sem alterar a carga de 30 minutos ou criar novas atividades**:

1. **Separadores consistentes:** o exemplo do professor usa `Guardiã · Cristais · Portal`, enquanto o aluno originalmente precisava digitar uma lista separada por vírgulas para conseguir avançar. O formulário agora aceita **vírgula, ponto e vírgula, ponto médio (·), bullet (•) ou quebra de linha**. Continua exigindo exatamente três elementos distintos na lista (não existe verificação automática semântica de relevância).
2. **Progresso fiel à validação:** o contador visual de 4 decisões e o estado destacado da ficha usam as mesmas verificações do botão de revisão. O preenchimento de apenas dois ou quatro elementos não ganha falsa indicação de conclusão.
3. **Orientação didática curta:** o campo de elementos apresenta contagem imediata (0–3, ou excedente) e sinalização acessível. O critério de aceite inclui a estrutura **DADO → QUANDO → ENTÃO** com exemplos adaptados ao gênero — sem transformar o formulário em uma sequência maior de questões.
4. **Preservação:** módulos do professor, tema gótico, identidade autoral dos alunos, respostas armazenadas, evidência oficial e os critérios obrigatórios permanecem inalterados.

Verificações complementares: **20/20 aprovadas**, incluindo quatro tipos de separador, duas/quatro entradas inválidas, nove exemplos de teste adaptados, geração de evidência, sintaxe, CSS, renderização e carregamento por perfil.

**Não homologado:** interação e estética em navegador real, integração com API e avaliação de uma turma fictícia. Esta revisão não representa teste E2E.
