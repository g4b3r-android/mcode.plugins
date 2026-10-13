/*
 * MCode Image Viewer 1.0.0
 * Installation: Plugins > Importar ZIP. No Android code changes required.
 * Click PNG/JPG/GIF/WebP/BMP image files in the currently opened project's file list.
 * Binary data is read through the connected LunusDroid Debian terminal (not readProjectFile).
 */
CodeEditorAPI.addPlugin({
  id: 'image-viewer',
  name: 'Visualizador de imagens',
  activate({ api, isTerminalAvailable }) {
    const list = document.getElementById('fileList');
    if (!list) throw new Error('A lista de arquivos do MCode não está disponível.');

    const SUPPORTED = /\.(?:png|jpe?g|gif|webp|bmp)$/i;
    const RESPONSE_PREFIX = '__MCODE_IMAGE_VIEWER_V1__';
    // A Base64 round-trip through WebView can use considerable RAM. Limit file size.
    const MAX_BYTES = 2 * 1024 * 1024;
    const PYTHON = [
      'import os,sys,json,base64',
      'PREFIX="__MCODE_IMAGE_VIEWER_V1__"',
      'LIMIT=2*1024*1024',
      'def respond(value):',
      ' print(PREFIX+json.dumps(value,separators=(",",":"),ensure_ascii=True))',
      'def main():',
      ' root_arg, rel = sys.argv[1:3]',
      ' if not root_arg.startswith("/sdcard") or (len(root_arg)>7 and root_arg[7]!="/"):',
      '  return respond({"ok":False,"error":"Projeto fora da pasta /sdcard acessível pelo Debian."})',
      ' if not rel or rel.startswith("/") or "\\\\" in rel or any(part in ("", ".", "..") for part in rel.split("/")):',
      '  return respond({"ok":False,"error":"Caminho de arquivo inválido."})',
      ' root=os.path.realpath(root_arg)',
      ' path=os.path.realpath(os.path.join(root,rel))',
      ' if os.path.commonpath((root,path)) != root:',
      '  return respond({"ok":False,"error":"O arquivo está fora da pasta do projeto."})',
      ' if not os.path.isfile(path):',
      '  return respond({"ok":False,"error":"Imagem não encontrada pelo Debian. Verifique o acesso a /sdcard."})',
      ' size=os.path.getsize(path)',
      ' if size>LIMIT:',
      '  return respond({"ok":False,"error":"Imagem maior que 2 MiB. Este plugin limita o tamanho para evitar excesso de memória."})',
      ' with open(path,"rb") as stream: data=stream.read(LIMIT+1)',
      ' if len(data)>LIMIT:',
      '  return respond({"ok":False,"error":"Imagem maior que 2 MiB."})',
      ' low=rel.lower()',
      ' mime=None',
      ' if low.endswith(".png") and data.startswith(bytes.fromhex("89504e470d0a1a0a")): mime="image/png"',
      ' elif low.endswith((".jpg",".jpeg")) and data.startswith(bytes.fromhex("ffd8ff")): mime="image/jpeg"',
      ' elif low.endswith(".gif") and data[:6] in (b"GIF87a",b"GIF89a"): mime="image/gif"',
      ' elif low.endswith(".webp") and data[:4]==b"RIFF" and data[8:12]==b"WEBP": mime="image/webp"',
      ' elif low.endswith(".bmp") and data.startswith(b"BM"): mime="image/bmp"',
      ' if not mime:',
      '  return respond({"ok":False,"error":"Formato de imagem não reconhecido ou arquivo danificado."})',
      ' return respond({"ok":True,"mime":mime,"data":base64.b64encode(data).decode("ascii")})',
      'try:',
      ' main()',
      'except Exception as error:',
      ' respond({"ok":False,"error":"Falha ao ler a imagem: "+str(error)})'
    ].join('\n');

    let currentProjectUri = null;
    let projectDirectory = null;
    let activePreview = false;
    let generation = 0;
    let removed = false;
    const outstanding = new Set();
    let terminalQueue = Promise.resolve();

    function escapeHtml(value) {
      return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function shellArg(value) {
      return "'" + String(value).replace(/'/g, "'\"'\"'") + "'";
    }
    function treeDirectory(uri) {
      // SAF primary: tree folder corresponds to /sdcard in LunusDroid.
      // Do not guess for cloud providers or secondary volumes.
      try {
        const match = String(uri || '').match(/\/tree\/([^/?#]+)/);
        if (!match) return null;
        const id = decodeURIComponent(match[1]);
        if (/^primary:/i.test(id)) {
          const relative = id.slice(id.indexOf(':') + 1).replace(/^\/+|\/+$/g, '');
          if (relative && (/[\\\x00-\x1f\x7f]/.test(relative) || relative.split('/').some(part => part === '.' || part === '..' || part === ''))) return null;
          return relative ? '/sdcard/' + relative : '/sdcard';
        }
        if (/^raw:\/storage\/emulated\/0(?:\/|$)/i.test(id)) {
          const relative = id.substring('raw:/storage/emulated/0'.length).replace(/^\/+|\/+$/g, '');
          if (relative && (/[\\\x00-\x1f\x7f]/.test(relative) || relative.split('/').some(part => part === '.' || part === '..' || part === ''))) return null;
          return relative ? '/sdcard/' + relative : '/sdcard';
        }
      } catch (_error) { /* unsupported root */ }
      return null;
    }
    function validName(name) {
      return Boolean(name && name.length <= 1024 && !name.startsWith('/') &&
        !/[\\\x00-\x1f\x7f]/.test(name) &&
        name.split('/').every(part => part !== '' && part !== '.' && part !== '..'));
    }
    function documentHtml(dataUri, message) {
      if (!dataUri) {
        return '<!doctype html><html lang="pt-BR"><meta charset="utf-8">' +
          '<meta name="viewport" content="width=device-width,initial-scale=1">' +
          '<style>html,body{height:100%;margin:0;background:#1b1b1b;color:#ddd;' +
          'font:14px system-ui,sans-serif}body{display:flex;align-items:center;' +
          'justify-content:center;padding:20px;box-sizing:border-box;text-align:center}</style>' +
          '<body><p>' + escapeHtml(message) + '</p></body></html>';
      }
      // Data URL is constructed from MIME values chosen by Python and verified Base64 only.
      return '<!doctype html><html lang="pt-BR"><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<style>html,body{height:100%;margin:0;overflow:hidden;background:#202020}' +
        'body{display:flex;align-items:center;justify-content:center}' +
        'img{display:block;max-width:100%;max-height:100%;object-fit:contain}</style>' +
        '<body><img alt="Visualização da imagem" src="' + dataUri + '"></body></html>';
    }
    function show(name, dataUri, message) {
      api.renderHtml({ title: name, html: documentHtml(dataUri, message) });
      activePreview = true;
      // MCode leaves the sidebar open when its default openFile handler is bypassed.
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('overlay')?.classList.remove('show');
    }
    function cancelOutstanding() {
      for (const cancel of outstanding) cancel();
      outstanding.clear();
    }
    function readThroughDebian(name, root) {
      return new Promise((resolve, reject) => {
        const bridge = window.Android;
        if (!bridge || typeof bridge.runTerminalCommandAsync !== 'function') {
          reject(new Error('Versão do MCode sem execução assíncrona no terminal. Atualize o aplicativo.'));
          return;
        }
        let requestId = null;
        let timeout = null;
        let finished = false;
        function cleanup() {
          window.removeEventListener('android:terminal-result', onResult);
          if (timeout !== null) window.clearTimeout(timeout);
          outstanding.delete(cancel);
        }
        function end(action, value) {
          if (finished) return;
          finished = true;
          cleanup();
          action(value);
        }
        function cancel() { end(reject, new Error('Visualização cancelada.')); }
        function onResult(event) {
          const payload = event.detail;
          if (!payload || String(payload.requestId) !== requestId) return;
          end(resolve, payload);
        }
        window.addEventListener('android:terminal-result', onResult);
        outstanding.add(cancel);
        timeout = window.setTimeout(() => end(reject, new Error('Tempo limite de 30 segundos para ler a imagem.')), 30000);
        try {
          const cmd = 'python3 -c ' + shellArg(PYTHON) + ' ' + shellArg(root) + ' ' + shellArg(name);
          const answer = JSON.parse(bridge.runTerminalCommandAsync(cmd, root));
          if (!answer.accepted || !answer.requestId) throw new Error(answer.error || 'Terminal não aceitou o comando.');
          requestId = String(answer.requestId);
        } catch (error) {
          end(reject, error);
        }
      });
    }
    function decodeResult(payload) {
      if (!payload.success) {
        throw new Error(payload.error || payload.output || 'Falha na sessão do Debian.');
      }
      const output = String(payload.output || '');
      const at = output.lastIndexOf(RESPONSE_PREFIX);
      if (at < 0) throw new Error('A leitura falhou. Verifique se python3 está instalado no LunusDroid.');
      const resultLine = output.slice(at + RESPONSE_PREFIX.length).split(/\r?\n/)[0].trim();
      const data = JSON.parse(resultLine);
      if (!data.ok) throw new Error(data.error || 'Não foi possível abrir a imagem.');
      if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp'].includes(data.mime) ||
          typeof data.data !== 'string' || data.data.length > Math.ceil(MAX_BYTES / 3) * 4 + 8 ||
          !/^[A-Za-z0-9+/]*={0,2}$/.test(data.data)) {
        throw new Error('Dados de imagem inválidos.');
      }
      return 'data:' + data.mime + ';base64,' + data.data;
    }
    async function openImage(name) {
      const version = ++generation;
      show(name, null, 'Carregando imagem...');
      try {
        if (!validName(name)) throw new Error('Caminho de arquivo inválido.');
        const file = api.getFiles().find(item => item.name === name);
        if (!file || !file.projectRoot) throw new Error('Abra uma pasta de projeto Android para visualizar imagens.');
        if (currentProjectUri && currentProjectUri !== file.projectRoot) {
          throw new Error('O projeto foi alterado. Selecione novamente o arquivo.');
        }
        const mappedRoot = treeDirectory(file.projectRoot);
        const root = mappedRoot && (!projectDirectory || projectDirectory === mappedRoot) ? mappedRoot : null;
        if (!root || !/^\/sdcard(?:\/|$)/.test(root)) {
          throw new Error('A pasta do projeto não está acessível via /sdcard no LunusDroid.');
        }
        if (!isTerminalAvailable()) throw new Error('Conecte o LunusDroid para visualizar imagens.');
        // Android uses one continuous terminal session. Queue reads instead of
        // starting overlapping commands (which the bridge would reject).
        const read = terminalQueue.catch(() => {}).then(() => {
          if (removed || version !== generation || !activePreview) {
            throw new Error("Visualização substituída.");
          }
          return readThroughDebian(name, root);
        });
        terminalQueue = read.catch(() => {});
        const response = await read;
        if (removed || version !== generation || !activePreview) return;
        const dataUri = decodeResult(response);
        show(name, dataUri, '');
      } catch (error) {
        if (removed || version !== generation || !activePreview) return;
        show(name, null, String(error?.message || error));
      }
    }
    function onFileClick(event) {
      const target = event.target instanceof Element ? event.target : event.target?.parentElement;
      const item = target?.closest('.file-item[data-file]');
      if (!item || !list.contains(item)) return;
      if (target.closest('[data-delete]')) return; // Preserve MCode delete behavior.
      const name = item.getAttribute('data-file') || '';
      if (!SUPPORTED.test(name)) {
        ++generation;
        if (activePreview) api.closePreview();
        return; // Normal source files still go through MCode's native click handler.
      }
      // Prevent MCode from trying to read the binary as text.
      event.preventDefault();
      event.stopImmediatePropagation();
      void openImage(name);
    }
    function onProjectLoading() {
      ++generation;
      currentProjectUri = null;
      projectDirectory = null;
      if (activePreview) api.closePreview();
    }
    function onProjectOpened(event) {
      ++generation;
      currentProjectUri = event.detail?.rootUri || null;
      projectDirectory = event.detail?.terminalDirectory || treeDirectory(currentProjectUri);
      if (activePreview) api.closePreview();
    }
    function onPreviewClosed() {
      activePreview = false;
      ++generation;
    }

    // Capture phase is required: MCode's regular click handler tries to decode
    // the same binary as UTF-8. Do not intercept non-image files or delete buttons.
    list.addEventListener('click', onFileClick, true);
    window.addEventListener('android:project-loading', onProjectLoading);
    window.addEventListener('android:project-opened', onProjectOpened);
    window.addEventListener('code-editor:preview-closed', onPreviewClosed);

    return function deactivateImageViewer() {
      removed = true;
      ++generation;
      cancelOutstanding();
      list.removeEventListener('click', onFileClick, true);
      window.removeEventListener('android:project-loading', onProjectLoading);
      window.removeEventListener('android:project-opened', onProjectOpened);
      window.removeEventListener('code-editor:preview-closed', onPreviewClosed);
      if (activePreview) api.closePreview();
    };
  }
});