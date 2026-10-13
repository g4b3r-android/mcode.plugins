/* MCode CSV/TSV Preview v1.0.0. Read-only table; HTML-escapes cell values. */
CodeEditorAPI.addPlugin({
  id: 'csv-preview',
  name: 'Visualizador CSV/TSV',
  activate({ api }) {
    const list = document.getElementById('fileList');
    if (!list) throw new Error('Explorador de arquivos não encontrado.');
    const supported = /\.(?:csv|tsv)$/i;
    const MAX_CHARS = 300000, MAX_ROWS = 251, MAX_COLS = 50;
    let ownPreview = false, currentName = '';
    function escapeHtml(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function parseCsv(source, delimiter) {
      const rows = []; let row = [], cell = '', inside = false, rowLimit = false;
      for (let i = 0; i < source.length; i++) {
        const ch = source[i];
        if (inside) {
          if (ch === '"' && source[i+1] === '"') { cell += '"'; i++; }
          else if (ch === '"') inside = false;
          else cell += ch;
        } else if (ch === '"' && cell === '') {
          inside = true;
        } else if (ch === delimiter) {
          if (row.length < MAX_COLS) row.push(cell);
          cell = '';
        } else if (ch === '\n' || ch === '\r') {
          if (ch === '\r' && source[i + 1] === '\n') i++;
          if (row.length < MAX_COLS) row.push(cell);
          rows.push(row); row = []; cell = '';
          if (rows.length >= MAX_ROWS) { rowLimit = i < source.length - 1; break; }
        } else cell += ch;
      }
      if (!rowLimit && (cell !== '' || row.length)) {
        if (row.length < MAX_COLS) row.push(cell);
        rows.push(row);
      }
      return { rows, rowLimit, unterminatedQuote: inside };
    }
    function detectDelimiter(source) {
      // First logical row only; quoted separators do not count.
      let quoted = false, commas = 0, semicolons = 0;
      for (let i = 0; i < source.length && i < 8192; i++) {
        const ch = source[i];
        if (ch === '"') {
          if (quoted && source[i + 1] === '"') i++;
          else quoted = !quoted;
        } else if (!quoted && (ch === '\r' || ch === '\n')) break;
        else if (!quoted && ch === ',') commas++;
        else if (!quoted && ch === ';') semicolons++;
      }
      return semicolons > commas ? ';' : ',';
    }
    function renderCsv(name, source) {
      const truncatedChars = source.length > MAX_CHARS;
      const partial = source.slice(0, MAX_CHARS);
      const delimiter = /\.tsv$/i.test(name) ? '\t' : detectDelimiter(partial);
      const result = parseCsv(partial, delimiter);
      const rows = result.rows;
      const headers = (rows.shift() || []).slice(0, MAX_COLS);
      const headerHtml = headers.map(v => `<th>${escapeHtml(v)}</th>`).join('');
      const bodyHtml = rows.map(row => `<tr>${headers.map((_, i) => `<td>${escapeHtml(row[i] ?? '')}</td>`).join('')}</tr>`).join('');
      const notice = result.rowLimit || truncatedChars ? '<div class="notice">Prévia parcial: limite de 250 linhas ou 300.000 caracteres.</div>' : '';
      const quoteWarning = result.unterminatedQuote && !truncatedChars && !result.rowLimit ? '<div class="notice">Aspas não fechadas no arquivo.</div>' : '';
      return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;padding:12px;background:#171b21;color:#e5e9f0;font:14px/1.5 system-ui,sans-serif}.notice{background:#493e23;padding:10px;border-radius:6px;margin-bottom:10px}.table-wrap{overflow:auto;max-width:100%;max-height:85vh}table{border-collapse:collapse;white-space:pre}th,td{border:1px solid #454b55;padding:6px 10px;max-width:400px;overflow:hidden;text-overflow:ellipsis}th{position:sticky;top:0;background:#303948;text-align:left}tr:nth-child(even){background:#222832}.info{margin-bottom:8px;color:#adb8c6}</style></head><body><div class="info">${rows.length} linha(s) exibidas · ${headers.length} coluna(s) · leitura somente</div>${notice}${quoteWarning}<div class="table-wrap"><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div></body></html>`;
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
        api.renderHtml({ title: name, html: renderCsv(name, String(file.content ?? '')) });
        currentName = name; ownPreview = true;
        document.getElementById('sidebar')?.classList.remove('open');
        document.getElementById('overlay')?.classList.remove('show');
      } catch (error) { window.Android?.showToast?.('Falha ao visualizar CSV: ' + String(error.message || error)); }
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
