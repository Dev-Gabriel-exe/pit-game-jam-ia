# PIT Game Jam V3 — Homologação presencial dos cinco critérios pendentes

**Ambiente:** branch `feature/pit-gamejam-v3-arcade`; turma fictícia/isolada; não utilizar dados pessoais de estudantes. **Não publicar nem alterar `main`.**

## Preparação — 5 minutos
1. Abra o portal do professor e do aluno em duas sessões separadas, em modo de teste autorizado.
2. Use um projeto GDevelop editável de teste e os arquivos originais da Biblioteca PIT (PNG, GLB e WAV). Salve uma cópia antes de começar.
3. Separe computador com alto-falante e telefone físico, se disponíveis. Se indisponíveis, marque **NÃO EXECUTADO**, jamais APROVADO.
4. Registre data, versão do GDevelop, navegador, modelo do dispositivo e nome fictício do projeto. Não registre tokens, nomes de alunos ou informações privadas.

## M06-05 / FUN-08 — importação real
- [ ] Abra o editor GDevelop; importe um PNG pela interface, crie objeto e confirme visualmente no Preview.
- [ ] Abra a rota 3D; importe GLB pela interface, crie objeto e confirme no Preview.
- [ ] Importe WAV pelo editor, vincule evento PlaySound, execute, **ouça** e anote se o som foi audível.
- [ ] Salve o projeto, feche o editor, reabra o arquivo salvo e execute novamente o Preview. Não confundir JSON roundtrip programático com esse teste.
- [ ] Desconecte a internet após preparar recursos e teste abertura/execução local; anote recursos que exigem conexão.
- [ ] Abra a interface no telefone físico, percorra tutorial, biblioteca, download e envio simulado. Registre sobreposição/cortes e controles.

## M08-04 — polimento real
- [ ] No GDevelop Preview, capture **ANTES** com o mesmo percurso/comando.
- [ ] Faça melhoria autoral (HUD, feedback textual, contraste ou controle), capture **DEPOIS** e registre diferença observável.
- [ ] Teste com teclado, navegação por foco, contraste e mensagem não dependente apenas de cor.
- [ ] No telefone físico, registre legibilidade, resposta ao toque, cortes e estabilidade. Se possível, meça FPS com ferramenta disponível; não invente números.
- [ ] Verifique que a condição de vitória da Missão 07 não foi quebrada.

## M09-03 — playtest cruzado real
- [ ] Um segundo participante testa o projeto sem ajuda; use apenas identificação anônima (Colega A).
- [ ] Registre hipótese, tarefa, esperado, observado, passos de reprodução e impacto.
- [ ] Corrija o defeito e reteste **ou** justifique backlog. O professor verifica o resultado e registra revisão/aprovação real.
- [ ] Se não houver segundo participante, marque **NÃO EXECUTADO**; um bot ou fixture não substitui essa observação.

## Registro de execução (uma linha por item)
| ID | Resultado (PASSOU/FALHOU/NÃO EXECUTADO) | Evidência (arquivo/captura) | Defeito / observação | Responsável | Data |
|---|---|---|---|---|---|
| M06-05 | NÃO EXECUTADO | — | — | — | — |
| M08-04 | NÃO EXECUTADO | — | — | — | — |
| M09-03 | NÃO EXECUTADO | — | — | — | — |

**Regra de encerramento:** só marcar as metas como `done` após a execução dos itens obrigatórios e evidências. REL-01 exige regressão final e decisão explícita sobre bugs P0/P1; REL-03 consolida URLs, commits, resultados, riscos e decisão de publicação. Aprovação de CI não é aprovação pedagógica.

## Protocolo reproduzível de evidências — biblioteca e UI-08

Para cada teste, registre **versão/commit da branch**, ambiente, recurso selecionado, ação realizada, resultado esperado, resultado observado e arquivo de evidência. A mera abertura do modal não comprova importação no GDevelop.

| Caso | Passos verificáveis | Aceite | Evidência mínima |
|---|---|---|---|
| LIB-PNG | Abrir biblioteca, filtrar mapa e personagem, ampliar duas miniaturas, baixar PNG, importar como Sprite/Tiled Sprite no GDevelop e abrir Preview | Miniatura e arquivo correspondem; transparência e dimensões corretas; objeto renderiza | Captura da biblioteca + Preview e nome do PNG |
| LIB-GLB | Filtrar 3D, abrir prévia rotacionável, baixar GLB, importar como objeto 3D no editor e iniciar Preview | Malha visível, orientação e escala ajustáveis, sem erro de importação | Captura do editor e do Preview + nome do GLB |
| LIB-WAV | Filtrar áudio, ouvir prévia na biblioteca, baixar WAV, importar no editor, ligar evento PlaySound e executar | Som audível em ambos os contextos; anotar volume e dispositivo | Nome do WAV, captura do evento e confirmação humana de audição |
| LIB-MAP | Selecionar dois mapas distintos, abrir prévia ampliada, baixar e usar como fundo de cena | Imagem baixada coincide com prévia e não é placeholder; fundo renderiza sem distorção inesperada | Duas capturas de prévia e uma do jogo |
| UI08-KEY | Navegar por Tab/Shift+Tab até biblioteca e carrossel, abrir/fechar modal com teclado, retornar ao acionador | Foco visível, sem aprisionamento ou perda de foco; controles operáveis | Vídeo curto ou sequência de capturas com foco |
| UI08-MOTION | Ativar redução de movimento no sistema, recarregar, percorrer cards das dez missões | Conteúdo permanece acessível; movimento não essencial é reduzido | Configuração do sistema + vídeo/captura |
| UI08-MOBILE | Em telefone físico, abrir portal, dez missões, biblioteca e chat de teste; usar toque e rolagem | Sem cortes impeditivos, controles alcançáveis, sem vazamento de dados | Modelo, navegador, orientação e capturas de falhas/êxito |

**Regra de contagem:** não transformar o número de recursos exibidos em garantia de importação; cada formato exige pelo menos um arquivo real testado no editor. Recursos individuais não testados permanecem com resultado **NÃO EXECUTADO**. Se houver erro, registre caso, passos e gravidade P0/P1/P2; P0/P1 impedem homologação final até correção e reteste.
