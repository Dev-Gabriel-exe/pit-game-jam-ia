# Biblioteca da PIT Game Jam IA V3 — origem e uso

Atualizado em 28/10/2026. Escopo: catálogo do portal `index.html#recursos`, gerado pelo arquivo `biblioteca.js`.

## Origem verificável

Os 38 itens do catálogo são **procedurais**, construídos no navegador a partir de formas SVG, malhas GLB e ondas PCM WAV implementadas no próprio projeto. Não há download de mídia de terceiros nem chamadas a APIs de geração. As miniaturas 2D vêm do mesmo SVG que é convertido em PNG no botão Baixar; o preview 3D lê vértices e índices do GLB real; o player de áudio usa o WAV real. São **recursos de apoio** para a oficina, não exemplos de imagens geradas por IA e não substituem a produção autoral pedida na Missão 06.

### Expansões do catálogo

| Tipo | ID | Nome | Saída |
| --- | --- | --- | --- |
| Personagem | `feiticeira` | Feiticeira das runas | `feiticeira_runas.png` (160×160) |
| Personagem | `golem` | Guardião de pedra | `guardiao_pedra.png` (160×160) |
| Mapa | `mapa-ruinas` | Ruínas do santuário | `mapa_ruinas.png` (1024×576) |
| Mapa | `mapa-pantano` | Pântano das lanternas | `mapa_pantano.png` (1024×576) |
| Item | `lanterna` | Lanterna arcana | `lanterna_arcana.png` (160×160) |
| Item | `escudo` | Escudo de proteção | `escudo_protecao.png` (160×160) |
| Mapa | `mapa-necropole` | Necrópole das sombras | `mapa_necropole.png` (1024×576) |
| Mapa | `mapa-observatorio` | Observatório celeste | `mapa_observatorio.png` (1024×576) |
| Item | `espinhos` | Armadilha de espinhos | `armadilha_espinhos.png` (160×160) |
| Item | `pedestal` | Pedestal rúnico | `pedestal_runico.png` (160×160) |

Todos os PNGs preservam transparência onde o SVG é transparente; mapas são cenários estáticos, **sem colisão, física ou tiles interativos embutidos**. No GDevelop, importe sprites em **Objetos → Sprite**, mapas como fundo/camada ou sprite e crie separadamente as colisões e comportamentos necessários. Modelos GLB usam **3D Model**; efeitos WAV são reproduzidos em eventos de áudio.

## Licença e publicação

O repositório não apresenta arquivo de licença explícito nesta branch. Por isso, **não é correto afirmar que o catálogo seja CC0, MIT, domínio público ou livre para redistribuição comercial**. O projeto informa uso didático interno; antes de publicar os assets separadamente, redistribuí-los em kits públicos ou usá-los comercialmente, solicite a definição de licença ao responsável pelo projeto. Os nomes e visuais adicionados não foram copiados de franquias comerciais conhecidas.

## Verificação e limitações

- `node qa/v3-library-filters.cjs`: 38 IDs, categorias, gêneros, formatos, descrições e SVGs novos.
- `node qa/v3-library-preview-browser.cjs`: Chrome em 390px e 1280px, preview e decodificação PNG dos dez recursos das duas expansões, GLB, WAV e foco.
- `node qa/v3-quick-kits.cjs`: gera os 38 arquivos com assinaturas válidas, mas utiliza stub de PNG; decodificação PNG real é verificada no navegador.
- Testes automatizados **não** substituem importação e execução manual no editor GDevelop, teste físico de celular, auditoria artística ou licença formal.

Não alterar `main` nem declarar liberação para produção até a homologação humana.

## Expansão de cenários — 28/10/2026

Dois cenários top-down originais (necrópole com criptas e lápides; observatório com plataforma, telescópio e marcas celestes) e dois sprites de gameplay (espinhos e pedestal) são gerados em SVG e convertidos em PNG localmente. A prévia ampliada usa o mesmo SVG do download. Os arquivos são recursos visuais, sem física ou eventos embutidos. A licença de redistribuição comercial segue não definida; uso didático não significa CC0.
