# MCode HTML Preview

**Versão:** 1.1.0  
**Arquivo de instalação:** `mcode-html-preview.zip`  
**Compatibilidade:** MCode `CodeEditorAPI` 1.1.0 ou superior. **Não exige LunusDroid.**

## O que mudou na versão 1.1.0

- Corrigido o problema em que tocar em um `.html`, `.htm` ou `.xhtml` abria apenas a WebView.
- Agora o arquivo abre **como texto editável no editor MCode**, em sua aba normal, **e também** no painel de pré-visualização abaixo do código.
- Alterações de texto atualizam a prévia automaticamente após aproximadamente **650 ms** sem digitação. A atualização não salva o arquivo; use o botão **Salvar** do MCode.
- Ao trocar de aba HTML, o preview acompanha o arquivo ativo. Selecionar outro tipo de arquivo fecha a prévia do plugin.
- Não interfere nos cliques de excluir arquivo nem na abertura de outros formatos.
- A instalação da nova versão substitui o plugin de mesmo ID já ativo; basta importar o novo ZIP e aprovar a atualização.

## Instalação

1. No MCode: **Plugins → Importar ZIP**.
2. Selecione `mcode-html-preview.zip` e aprove o código do plugin.
3. Abra um projeto e toque em um arquivo HTML na lista de arquivos.
4. **Edite o HTML** na área de código, confira o resultado na área **PREVIEW** e **salve** pelo botão do aplicativo quando desejar.
5. O botão **Executar** também continua disponível para atualizar a prévia nativa.

## Limitações e segurança

- A prévia utiliza o **iframe sandboxed** existente no MCode. O JavaScript presente no HTML pode executar nesse iframe; visualize somente HTML confiável.
- Recursos locais relativos, como `./style.css` e `./image.png`, podem não ser carregados quando o projeto utiliza o acesso Android SAF.
- O editor Android aceita arquivos de texto UTF-8 com até **2 MiB**.
- A prévia não é um editor visual de arrastar e soltar. A edição acontece na aba de código MCode, e o preview é separado.
- Se o HTML não puder ser carregado como texto, o editor original apresenta o erro e o plugin não força a abertura.
- Testes de simulação automatizados foram executados; funcionamento em dispositivo Android real ainda depende de validação no aplicativo.

## Conteúdo do ZIP

- `plugins/html-preview.js`: plugin instalável (único arquivo JS executado pelo importador)
- `plugins.json`: manifesto descritivo
- `README.md`: documentação
