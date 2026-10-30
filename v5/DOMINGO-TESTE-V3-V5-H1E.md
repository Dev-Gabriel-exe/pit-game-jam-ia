# PIT Game Jam IA — Roteiro de teste de domingo (01/11/2026)

**Versão:** `feature/v5-h1e-v3-integracao-domingo`  
**Finalidade:** avaliar a integração **visual** V3 ↔ V5, com personagens e turma fictícios.  
**Não utilizar nomes reais, PIN docente nem tokens de alunos na prévia.**  
**Não há publicação em produção, migração no Neon, alteração de `main` ou vínculo real com o aluno.**

## Abrir as duas interfaces

Aluno, com simulação visual:  
`https://raw.githack.com/Dev-Gabriel-exe/pit-game-jam-ia/feature/v5-h1e-v3-integracao-domingo/aluno-v3.html?preview=1&v5lab=1`

Professor, com simulação visual:  
`https://raw.githack.com/Dev-Gabriel-exe/pit-game-jam-ia/feature/v5-h1e-v3-integracao-domingo/professor-v3.html?preview=1&v5lab=1`

Se a versão do branch for alterada durante os testes, obter um link fixado no SHA do commit final para evitar confusão com cache.

## O que testar com o perfil do aluno

1. Abra o caderno V3 e confira os **10 cards de missões** e a transição cinematográfica antes de entrar; confirme que o roteiro, os textos e o conteúdo não mudaram.
2. No menu superior, abra **⚔ Personagem & Duelos**. A experiência V5 deve aparecer **dentro da V3**, em um painel de fantasia sombria, com aba, fechar e retorno sem reiniciar o caderno.
3. **Meu Herói**: confira quatro classes distintas e uniformes. Altere atributos e talentos, salve na simulação e veja a trava de Missão 5 e Missão 10. Na prévia, os dados são **apagados ao recarregar** — o salvamento real em PostgreSQL só foi testado separadamente em homologação.
4. **Duelos**: selecione Ayla, desafie Breno, troque para Breno e aceite. Deve aparecer o convite recebido e a ação de aceitar/recusar; volte para Ayla e experimente recusa e expiração.
5. **Arena 3D**: alterne entre modo diretor e acompanhar personagem, confira escala, fluidez, talentos, HUD de vida, som espacial ao ativar e anúncio de vencedor. Na prévia a luta é fictícia; partidas entre dois navegadores de teste já foram verificadas separadamente, com banco descartável.
6. Feche o painel. O caderno, a seleção de missões, o chat e o botão de apresentação devem permanecer acessíveis.
7. Em tela menor, verifique que o painel não corta botões, textos e menus.

## O que testar com o perfil do professor

1. Abra a página V3 na prévia e verifique o conteúdo e apresentação das missões.
2. Clique em **⚔ Controle de Duelos**, depois em **Liberar** e **Pausar** na aba Controle. Essa alteração é **fictícia e local** — não modifica sala real nem controla o lobby fictício do outro navegador.
3. Abra a aba da arena e experimente as câmeras e os efeitos.
4. Feche o painel e confira se acompanhamento, chat e apresentações da V3 continuam disponíveis.

## Regras que não mudaram

- Professor é a autoridade de aprovação, liberação de missões e XP.
- Cada missão **aprovada** libera 2 atributos + 1 talento; missão apenas **entregue** não libera recursos.
- Duelos só devem ocorrer entre colegas da **mesma turma**, na **mesma missão liberada**, quando ambos concluíram/entregaram e aderiram à disponibilidade.
- Convite pendente dura 45 segundos, presença no servidor 60 segundos, sem múltiplos convites simultâneos.
- Duelo **não** altera XP, nota, atributos ou talentos. O confronto é calculado uma vez no servidor e reproduzido por ambos.
- Personagem congelado na entrada M5 e travado na M10.

## Estado de implantação e travas restantes

**Código integrado à V3** na branch, com UI e handoff opcional de sessão preparado. Em `localhost` e **somente** quando um servidor de homologação fictício fornece `window.__PIT_V5_H1E_STAGING`, há conexão para `/api/hero-v2-lab`, `/api/duel-v2-lab`, `/api/duel-match-v2-lab` e `/api/duel-teacher-v2-lab`. Nenhuma senha/PIN é copiada para URL ou storage.

**Ainda pendente antes de qualquer publicação para alunos reais:**

- **G.2:** GPU, rede, WebGL, GLB, áudio, câmera e desempenho em PCs da instituição.
- **H.1e operacional:** autenticação real entre V3 e V5 em homologação formal, migração de banco revisada com backup/rollback e controle docente autenticado apropriado. As APIs V5 estão desativadas em produção.
- **D.1c:** validação funcional real entre duas máquinas e carga com 30 máquinas físicas; testes de software 15 pares/30 alunos fictícios já ocorreram em PostgreSQL descartável.
- **I:** inspeção visual aprovada pelo professor, regressão pedagógica e de segurança, só então PR/merge/implantação na `main`.

**Se a prévia não representar o resultado esperado, registrar captura da tela, etapa e comportamento. Não habilitar produção como forma de testar.**

## Documentação técnica

- `v5/FASE-H1D-DOIS-NAVEGADORES.md`: dois estudantes fictícios e revisão da build
- `v5/FASE-D1A-DUELOS-CONVITES.md`: regras de convite
- `v5/FASE-D1B-DUELO-COMPARTILHADO.md`: motor e replay
- `v5/FASE-D1C-FLUXO-DUELOS.md`: 15 duelos simultâneos, professor e interface
- `qa/v5-h1e-v3-browser.cjs`: regressão visual V3 integrada
