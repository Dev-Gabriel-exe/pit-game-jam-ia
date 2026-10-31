# PIT Game Jam IA V5 — Simulação completa de XP, atributos e talentos

**31 de outubro de 2026 — Testes automatizados aprovados, com personagens fictícios.**
**Escopo:** quatro classes (Guerreiro, Arcanista, Caçador, Guardião), dez missões, 30 talentos catalogados por classe.

## Regra do workshop

| Missão aprovada | XP-base acumulado | Pontos de atributo disponíveis | Talentos selecionáveis |
|---|---:|---:|---:|
| 0 | 0 | 0 | 0 |
| 1 | 100 | 2 | 1 |
| 2 | 200 | 4 | 2 |
| 3 | 300 | 6 | 3 |
| 4 | 400 | 8 | 4 |
| 5 | 500 | 10 | 5 |
| 6 | 600 | 12 | 6 |
| 7 | 700 | 14 | 7 |
| 8 | 800 | 16 | 8 |
| 9 | 900 | 18 | 9 |
| 10 | 1.000 | 20 | 10 |

Cada aprovação dá **100 XP-base**, libera mais **2 pontos de atributo** e permite selecionar mais **1 talento**. O aluno escolhe os talentos dentre 30 de sua classe, sem duplicar talentos. O saldo não depende do dano, vitória em duelo ou posição na arena.

## O que os testes realmente fazem

- `qa/v5-progressao-completa-10-missoes.cjs`: passa sequencialmente pelas dez missões em **cada uma das quatro classes**, com 40 eventos de aprovação no total. A cada etapa testa status `working`, `submitted` e `revision` antes de `approved`. Os três primeiros **não** aumentam XP nem permitem pontos ou talentos adicionais. Verifica os 120 IDs do catálogo, 20 pontos e dez talentos na missão 10, entrada M5 com dez pontos e cinco talentos e travamento final M10. Releitura da mesma aprovação não duplica o saldo.
- `qa/v5-progression-contract-h0.cjs`: verifica limites, cinco atributos, talentos desconhecidos/de outra classe, integridade e travas das arenas M5/M10; agora testa corretamente o motor opt-in da M10.
- `qa/v5-builds-v2-h1b.cjs`: valida o contrato do servidor e simula PostgreSQL transacional, autorização por turma, versão CAS, entrada M5 e M10 idempotente, bloqueio de classe e de talentos/atributos já congelados.
- `qa/v5-hero-h1d-two-browser.cjs`: **ensaio anterior** em PostgreSQL 16 descartável com dois navegadores usando a mesma identidade fictícia e outro navegador de personagem distinto. Verifica edição concorrente, gravação e persistência por recarga, orçamento liberado após aprovações no banco, locks M5/M10.
- `qa/v5-teacher-arena-release-lab.cjs`: o motor executa 30 personagens em M5/M10 (sem teste de desempenho 3D de 30 PCs).

## A distinção crítica entre XP-base e XP realmente registrado

O sistema de sala V3 hoje salva o status `approved` em `pit_student_stages` no banco do professor. Tanto o V3 quanto o contrato V5 **calculam** `XP-base = 100 × número de missões consecutivas aprovadas`. Portanto, aprovar novamente a mesma missão **não** soma mais XP (não há uma transação de crédito repetida).

**Não existe um livro-caixa `XP transactions` com créditos e resgates**, porque a regra atual não exige XP adicional por duelos ou medalhas. Isso é distinto de um saldo de XP gravado em tabela própria; a origem de verdade é a lista de aprovações do professor.

**A integração de interface V5 no site público NÃO ativa automaticamente o endpoint real da Forja**: `chat-api/api/hero-v2-lab.js` recusa ambiente `production`, a migração `pit_hero_builds_v2` não foi aplicada no banco real e o botão da Forja H1c usa dados fictícios em memória. Não comunicar aos alunos que suas escolhas da Forja já são persistentes.

## O que falta para a oficina ter a experiência REAL entre professor e alunos

1. Aplicar e verificar **migração aditiva** para `pit_hero_builds_v2` com backup e rollback, sem interferir em `pit_hero_builds` legado.
2. Disponibilizar uma API autenticada que use as aprovações existentes do V3 para abrir orçamento, salvar as builds, congelar M5 e travar M10 em transações reais. Hoje o endpoint H1c é **desativado na produção**.
3. Conectar o hub V5 do aluno à API habilitada, substituir o XP demonstrativo pelos dados reais de aprovação e mostrar erro de concorrência/reconexão.
4. Conectar professor/aluno para convites reais, autorização do professor, mesma partida entre dispositivos, reconexão e retorno à missão. Hoje os convites avançados e o H.2 de batalha compartilhada são **ensaios isolados**.
5. Validar **G.2 nos PCs da oficina**: carregamento de até trinta GLBs, FPS, câmera, efeitos, latência, rede e acessibilidade. Os testes automatizados de 30 foram no motor Node, não substituem teste físico de 30 modelos no WebGL.
6. Testar a oficina ponta a ponta com **cadastro fictício e dois navegadores/computadores distintos**; depois liberar o uso com contas reais quando as etapas anteriores forem concluídas.

**Estado de liberação:** a versão estática publicada pode servir para revisão visual e ensino/testes de demonstração. A experiência operacional V5 com dados reais permanece desabilitada até a conclusão dos itens acima. Nenhum dado real de alunos foi utilizado nesta simulação.
