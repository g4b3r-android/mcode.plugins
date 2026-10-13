# Python Import Checker — plugin para MCode

**Versão:** 1.0.0  
**Compatibilidade:** `CodeEditorAPI` do MCode 1.1.0; requer o serviço Debian/LunusDroid conectado e um interpretador Python disponível.

## Instalação no Android

1. Abra o **MCode** e toque no ícone **Plugins** (quebra-cabeça).
2. Selecione **Importar ZIP** e escolha o arquivo `mcode-python-import-checker.zip`.
3. Revise a solicitação de permissão e aceite a instalação se confiar neste pacote.
4. Abra um projeto contendo arquivos `.py`.
5. Na barra superior, toque no ícone **🐍**, depois em **Verificar projeto**.

O ZIP contém `plugins/python-import-checker.js`, que é o **único script executado** pelo instalador. Não precisa descompactar nem copiar o analisador Python manualmente; ele está embutido no plugin JS. `src/checker_core.py` é incluído somente para facilitar a auditoria e manutenção.

## Comandos

| Item do menu 🐍 | Descrição |
|---|---|
| **Verificar projeto** | Analisa imports nos arquivos `.py` listados pelo MCode, consulta as bibliotecas Python disponíveis e tenta complementar a análise com arquivos acessíveis na pasta atual do terminal. |
| **Verificar arquivo atual** | Analisa somente o arquivo `.py` selecionado (usando os demais arquivos do projeto para resolver módulos locais). |
| **Escolher interpretador / venv** | Configure `python3` ou um caminho absoluto de executável, por exemplo `/sdcard/projeto/.venv/bin/python`. |
| **Ver último relatório** | Exibe o último relatório para copiar. |

O relatório informa quais imports pertencem ao **projeto**, à **biblioteca padrão**, aos **pacotes disponíveis no interpretador selecionado**, ou estão **ausentes**. Arquivos que não puderem ser analisados são contabilizados; o relatório avisa quando é parcial.

## Exemplo

```python
import os
from pathlib import Path
import numpy
import biblioteca_que_nao_existe
from . import utils
```

O status de `numpy` depende do interpretador configurado: o módulo pode existir no Python global e estar ausente no venv (ou vice-versa).

## Limites e segurança

- Este é um **verificador estático**, não substitui o Pyright/Pylance. Ele usa `ast` e `PathFinder.find_spec` sem executar o código dos arquivos Python do projeto e sem importar diretamente os pacotes analisados.
- Para evitar falsos positivos, `from pacote import atributo` verifica principalmente o pacote base, pois `atributo` pode ser uma variável, classe, função ou submódulo.
- **Imports dinâmicos**, condições específicas de execução, compilação de extensões e ambientes que alteram `sys.path` em tempo de execução podem exigir inspeção manual.
- Para complementar imports em disco, utiliza o diretório de trabalho da sessão Debian; o relatório mostra **Diretório** para facilitar a conferência. Em projetos selecionados via SAF que não têm espelho nesse diretório, o plugin utiliza os textos de arquivos fornecidos pela API do editor.
- O envio de conteúdo pelo Android tem limites para proteger o terminal: até **350 arquivos fonte**, **57 KB de código** no snapshot, e uma lista de nomes com orçamento de **18 KB**. O scanner Python também tem limites de 1.200 arquivos, 8 MiB de leitura total e 256 KiB por arquivo. Um projeto maior gera **aviso de análise parcial**; não trate um resultado parcial sem erros como garantia de que todos os imports existem.
- A verificação é iniciada **manualmente** pelo menu. Diagnósticos dos imports ausentes são acrescentados ao painel de problemas do arquivo atualmente aberto após cada verificação; ao editar o conteúdo, os resultados dessa análise anterior podem ficar desatualizados, sendo necessário verificar novamente.
- O plugin utiliza o mesmo acesso ao terminal e aos arquivos que outros plugins autorizados do MCode. **Revise plugins antes de instalá-los.**
- O script invocado no terminal só usa a biblioteca padrão Python; não baixa dependências ou altera arquivos do projeto.

## Código-fonte

- `plugins/python-import-checker.js`: plugin MCode autossuficiente, incluindo o analisador Python codificado em base64 para envio ao interpretador.
- `src/checker_core.py`: versão legível do analisador integrado no plugin.

O Python é chamado usando argumentos com aspas seguras para shell POSIX e em modo somente leitura dos fontes do projeto.