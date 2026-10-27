# PIT Game Jam IA — V3 / Fase 1

**Branch:** `feature/pit-gamejam-v3-arcade`  
**Escopo:** experiência de telas e seleção das 10 missões; sem reformular os conteúdos didáticos nesta fase.

## Fluxo de navegação

1. `index.html`: portal e acesso ao caderno do aluno ou do professor.
2. `aluno-v3.html`: identificação/código de turma existentes.
3. Após autenticação e sincronização, a tela do **carrossel** abre automaticamente.
4. O aluno navega pelos 10 cards ilustrados. Os cards mostram disponibilidade/bloqueio, andamento, revisão, validação ou conclusão conforme os dados reais da turma.
5. Ao entrar na missão liberada, uma transição cinematográfica em CSS apresenta o capítulo e conduz ao caderno da missão escolhida.
6. Dentro do caderno, o botão "Escolher missão" reabre o carrossel.
7. O caderno do professor e os serviços de API/banco de dados permanecem no fluxo existente.

## Arquivos envolvidos

- `index.html`: entrada da V3 e resumo das 10 missões;
- `aluno-v3.html`: estrutura da tela separada de seleção;
- `v3/arcade-gallery.css`: cards, carrossel, transições e responsividade;
- `v3/arcade-gallery.js`: artes originais SVG, navegação e estado visual;
- `v3/app.js`: integração com liberação, progresso e abertura real da missão;
- `v2/missions.js`: fonte original das 10 missões, preservada;
- `fase1.html`: protótipo independente anterior (não é o carrossel real da sala).

## Requisitos e limites

- Navegação por botões, números 01–10, teclado e gesto horizontal.
- Cards de missões futuras devem ser visíveis como prévia, mas não acessíveis antes da liberação docente.
- Um aluno pode retornar às missões já liberadas.
- Conquistas só são mostradas como concluídas após aprovação real da entrega.
- `prefers-reduced-motion` simplifica as animações.
- O filtro de disponibilidade é apresentado na interface; a proteção real da entrega permanece sob responsabilidade da API existente.
- A transição cinematográfica usa CSS/animação original, **sem depender de vídeo externo**. Um vídeo opcional poderá ser inserido depois.
- Não inventar pontuação ou alterar automaticamente XP, status, evidências, cadastro ou chat.

## Homologação necessária antes de considerar Fase 1 concluída

- [ ] Conferir a interface em navegador real desktop e celular.
- [ ] Abrir a V3 a partir do portal e autenticar com aluno de teste.
- [ ] Confirmar a abertura automática do carrossel.
- [ ] Navegar por todas as dez missões com setas, teclado e swipe.
- [ ] Confirmar bloqueios com professor na missão 1 e aluno tentando a 2.
- [ ] Liberar a missão 2 pelo professor e verificar o estado atualizado.
- [ ] Abrir missão permitida e verificar transição → conteúdo correto.
- [ ] Voltar ao carrossel sem perder edição de trabalho/evidência.
- [ ] Validar que aprovações reais aparecem como conclusão.
- [ ] Conferir contraste, foco, leitores de tela e modo reduzir animações.
- [ ] Conferir professor, acompanhamento e chat sem regressões.

**Critério de encerramento:** todos os testes em navegador real aprovados e visual do carrossel validado pelo responsável. Somente então começar a fase pedagógica seguinte.
