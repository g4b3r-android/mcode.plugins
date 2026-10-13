/* MCode JSON Preview v1.0.0. Read-only, offline, no external dependencies. */
CodeEditorAPI.addPlugin({
  id: 'json-preview',
  name: 'Visualizador JSON',
  activate({ api }) {
    const list = document.getElementById('fileList');
    if (!list) throw new Error('Explorador de arquivos não encontrado.');
    const supported = /\.json$/i;
    let ownPreview = false;
    let currentName = '';
    function escapeHtml(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function coloredJson(text) {
      const token = /"(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|\b(?:true|false|null)\b|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
      let out = ''; let pos = 0; let m;
      while ((m = token.exec(text))) {
        out += escapeHtml(text.slice(pos, m.index));
        const raw = m[0];
        const kind = raw.startsWith('"') ? (text.slice(token.lastIndex).match(/^\s*:/) ? 'key' : 'string')
          : /^(?:true|false|null)$/.test(raw) ? 'literal' : 'number';
        out += `<span class="${kind}">${escapeHtml(raw)}</span>`;
        pos = token.lastIndex;
      }
      return out + escapeHtml(text.slice(pos));
    }
    function documentHtml(source) {
      const limit = 350000;
      let output, summary;
      if (source.length > limit) {
        output = escapeHtml('Prévia indisponível: JSON acima do limite de 350.000 caracteres.');
        summary = 'Arquivo grande';
      } else {
        try {
          const obj = JSON.parse(source);
          const kind = Array.isArray(obj) ? 'array' : obj === null ? 'null' : typeof obj;
          const count = typeof obj === 'object' && obj !== null ? Object.keys(obj).length : 0;
          summary = `${kind}${kind === 'array' || kind === 'object' ? ` · ${count} item(ns)` : ''} · JSON válido`;
          output = coloredJson(JSON.stringify(obj, null, 2));
        } catch (error) {
          summary = 'JSON inválido';
          output = `<span class="error">${escapeHtml(String(error.message || error))}</span>\n\n${escapeHtml(source.slice(0, limit))}`;
        }
      }
      return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;padding:16px;background:#161a20;color:#e5eaf0;font-family:system-ui,sans-serif}.summary{padding:8px 10px;border-radius:6px;background:#283241;margin-bottom:10px}pre{font:13px/1.5 ui-monospace,monospace;white-space:pre;overflow-x:auto;tab-size:2}.key{color:#9cccff}.string{color:#b8dd9d}.number{color:#eaca86}.literal{color:#d0adff}.error{color:#ff9696}</style></head><body><div class="summary">${escapeHtml(summary)}</div><pre>${output}</pre></body></html>`;
    }
    function onClick(e) {
      if (e.target?.closest('[data-delete]')) return;
      const item = e.target?.closest('[data-file]');
      if (!item) return;
      const name = item.getAttribute('data-file') || '';
      if (!supported.test(name)) {
        if (ownPreview) api.closePreview();
        return;
      }
      e.preventDefault(); e.stopImmediatePropagation();
      try {
        const file = api.getFile(name);
        if (!file) throw new Error('Arquivo não encontrado.');
        api.renderHtml({ title: name, html: documentHtml(String(file.content ?? '')) });
        currentName = name; ownPreview = true;
        document.getElementById('sidebar')?.classList.remove('open');
        document.getElementById('overlay')?.classList.remove('show');
      } catch (error) { window.Android?.showToast?.('Falha ao visualizar JSON: ' + String(error.message || error)); }
    }
    function onProjectLoading() { if (ownPreview) api.closePreview(); ownPreview = false; currentName = ''; }
    function onRendered(e) { if (e.detail?.title !== currentName) ownPreview = false; }
    function onClosed() { ownPreview = false; }
    list.addEventListener('click', onClick, true);
    window.addEventListener('android:project-loading', onProjectLoading);
    window.addEventListener('code-editor:html-rendered', onRendered);
    window.addEventListener('code-editor:preview-closed', onClosed);
    return () => {
      list.removeEventListener('click', onClick, true);
      window.removeEventListener('android:project-loading', onProjectLoading);
      window.removeEventListener('code-editor:html-rendered', onRendered);
      window.removeEventListener('code-editor:preview-closed', onClosed);
      if (ownPreview) api.closePreview();
    };
  }
});
