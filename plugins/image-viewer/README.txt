MCode Image Viewer - plugin ZIP (v1.0.0)
========================================

OBJETIVO
Ao tocar em uma imagem na lista de arquivos do projeto aberto no MCode,
mostrar a imagem no painel Preview do editor, em vez de tentar abri-la como texto.
Nao adiciona galeria, edicao de imagens ou botoes extras.

INSTALACAO
1. Abra o MCode no Android.
2. Toque em Plugins > Importar ZIP (ou Arquivos > Adicionar plugin).
3. Escolha mcode-image-viewer.zip e aprove a instalacao.
4. Abra um projeto/pasta no MCode.
5. Toque num arquivo .png, .jpg, .jpeg, .gif, .webp ou .bmp no explorador.
6. Para fechar a visualizacao, toque no X do Preview ou escolha um arquivo de codigo.

REQUISITOS E LIMITACOES
- Precisa do LunusDroid Debian conectado e de python3 disponivel nesse ambiente.
- Funciona com projetos no armazenamento primario acessiveis por /sdcard no Debian.
- SAF com provedores de nuvem, cartoes SD externos e pastas nao montadas em /sdcard
  nao e suportado por esta versao apenas-plugin.
- Por seguranca e consumo de memoria, imagens de ate 2 MiB por arquivo.
- O plugin intercepta apenas a abertura pelo explorador; a API original
  readProjectFile nao suporta leitura de binarios sem mudanca no APK.
- A pre-visualizacao usa o painel HTML preexistente; nao edita a imagem.
- Nao concede ao plugin direitos adicionais; plugins MCode executam JavaScript
  com os privilegios do editor. Instale apenas arquivos de origem confiavel.

ARQUIVOS DO ZIP
plugins/image-viewer.js   Plugin instalavel via MCode.
README.txt                Estas instrucoes.

TESTES REALIZADOS
- Validacao da sintaxe JavaScript e do codigo Python incorporado.
- Simulacao de cliques na lista, preview, arquivos normais, exclusao e limpeza.
- Leitura real de uma imagem PNG atraves do comando Python em Linux.
- Ainda nao foi executado no APK Android real.