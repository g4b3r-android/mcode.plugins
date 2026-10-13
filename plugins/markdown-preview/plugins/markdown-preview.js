/* MCode Markdown Preview v1.0.0. Self-contained, offline, HTML-escaping renderer. */
CodeEditorAPI.addPlugin({
  id: 'markdown-preview',
  name: 'Visualizador Markdown',
  activate({ api }) {
    const list = document.getElementById('fileList');
    if (!list) throw new Error('Explorador de arquivos não encontrado.');
    const supported = /\.(?:md|markdown|mdown)$/i;
    const MAX_CHARS = 300000;
    const MAX_LINES = 3000;
    let ownPreview = false;
    let currentName = '';

    function escapeHtml(input) {
      return String(input).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function safeLink(raw) {
      const cleaned = String(raw).trim().replace(/\s+"[^"]*"$/, '');
      // Never allow javascript:, data:, file:, blob:, protocol-relative or local paths.
      return /^(?:https?:\/\/|mailto:)/i.test(cleaned) && !/[\u0000-\u001f\u007f]/.test(cleaned) ? cleaned : '';
    }
    function renderInline(input, depth = 0) {
      const text = String(input);
      if (depth > 5) return escapeHtml(text);
      const token = /(`+)([\s\S]*?)\1|!\[([^\]\n]*)\]\(([^)\n]*)\)|\[([^\]\n]+)\]\(([^)\n]*)\)|(\*\*|__)(?=\S)([\s\S]*?\S)\7|(~~)(?=\S)([\s\S]*?\S)\9|(\*|_)(?=\S)([\s\S]*?\S)\11/g;
      let result = '';
      let cursor = 0;
      let match;
      while ((match = token.exec(text))) {
        if (match.index < cursor) continue;
        result += escapeHtml(text.slice(cursor, match.index));
        if (match[1]) {
          result += `<code>${escapeHtml(match[2])}</code>`;
        } else if (match[3] !== undefined) {
          const url = safeLink(match[4]);
          const alt = escapeHtml(match[3]);
          result += url ? `<span class="image-note">[imagem: <a href="${escapeHtml(url)}" rel="noreferrer">${alt}</a>]</span>`
            : `<span class="image-note">[imagem: ${alt}]</span>`;
        } else if (match[5] !== undefined) {
          const url = safeLink(match[6]);
          result += url ? `<a href="${escapeHtml(url)}" rel="noreferrer">${escapeHtml(match[5])}</a>` : escapeHtml(match[5]);
        } else if (match[7]) {
          result += `<strong>${renderInline(match[8], depth + 1)}</strong>`;
        } else if (match[9]) {
          result += `<del>${renderInline(match[10], depth + 1)}</del>`;
        } else {
          result += `<em>${renderInline(match[12], depth + 1)}</em>`;
        }
        cursor = token.lastIndex;
      }
      return result + escapeHtml(text.slice(cursor));
    }
    function tableCells(line) {
      let s = String(line).trim();
      if (s.startsWith('|')) s = s.slice(1);
      if (s.endsWith('|')) s = s.slice(0, -1);
      return s.replace(/\\\|/g, '\u0001').split('|').map(x => x.replace(/\u0001/g, '|').trim());
    }
    function tableSeparator(line) {
      const parts = tableCells(line);
      return parts.length > 0 && parts.every(x => /^:?-{3,}:?$/.test(x));
    }
    function renderBlocks(source, nested = 0) {
      if (nested > 3) return `<p>${escapeHtml(source)}</p>`;
      const lines = String(source).replace(/\r\n?/g, '\n').split('\n');
      const blocks = [];
      const isBlockStart = (s) => /^(?: {0,3}(?:#{1,6}\s|>|[-*+]\s|\d+[.)]\s|`{3,}|~{3,})|\s*(?:-{3,}|\*{3,}|_{3,})\s*$)/.test(s);
      for (let i = 0; i < lines.length;) {
        const line = lines[i];
        if (!line.trim()) { i++; continue; }
        const fence = line.match(/^\s{0,3}(`{3,}|~{3,})\s*([^\n]*)$/);
        if (fence) {
          const mark = fence[1][0]; const size = fence[1].length;
          const lang = fence[2].trim().split(/\s+/)[0].slice(0, 32);
          const code = []; i++;
          while (i < lines.length && !new RegExp('^\\s{0,3}' + (mark === '`' ? '`' : '~') + '{' + size + ',}\\s*$').test(lines[i])) code.push(lines[i++]);
          if (i < lines.length) i++;
          blocks.push(`<pre><code${lang ? ` data-language="${escapeHtml(lang)}"` : ''}>${escapeHtml(code.join('\n'))}</code></pre>`);
          continue;
        }
        const header = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
        if (header) { blocks.push(`<h${header[1].length}>${renderInline(header[2])}</h${header[1].length}>`); i++; continue; }
        if (/^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { blocks.push('<hr>'); i++; continue; }
        if (/^\s{0,3}>/.test(line)) {
          const quote = [];
          while (i < lines.length && /^\s{0,3}>/.test(lines[i])) quote.push(lines[i++].replace(/^\s{0,3}>\s?/, ''));
          blocks.push(`<blockquote>${renderBlocks(quote.join('\n'), nested + 1)}</blockquote>`); continue;
        }
        if (i + 1 < lines.length && line.includes('|') && tableSeparator(lines[i + 1])) {
          const headers = tableCells(line).slice(0, 30); i += 2;
          const rows = [];
          while (i < lines.length && lines[i].trim() && lines[i].includes('|') && rows.length < 200) {
            rows.push(tableCells(lines[i++]).slice(0, 30));
          }
          blocks.push(`<div class="table-wrap"><table><thead><tr>${headers.map(v => `<th>${renderInline(v)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${headers.map((_, j) => `<td>${renderInline(row[j] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
          continue;
        }
        const listMatch = line.match(/^\s{0,3}([-*+]|\d+[.)])\s+(.+)$/);
        if (listMatch) {
          const ordered = /^\d/.test(listMatch[1]); const items = [];
          while (i < lines.length) {
            const m = lines[i].match(/^\s{0,3}([-*+]|\d+[.)])\s+(.+)$/);
            if (!m || /^\d/.test(m[1]) !== ordered) break;
            const task = m[2].match(/^\[([ xX])\]\s+(.*)$/);
            items.push(task ? `<li class="task"><input type="checkbox" disabled${/x/i.test(task[1]) ? ' checked' : ''}> ${renderInline(task[2])}</li>` : `<li>${renderInline(m[2])}</li>`);
            i++;
          }
          blocks.push(ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`);
          continue;
        }
        if (i + 1 < lines.length && /^\s{0,3}(?:=+|-+)\s*$/.test(lines[i + 1]) && line.trim()) {
          const h = lines[i + 1].trim()[0] === '=' ? 1 : 2;
          blocks.push(`<h${h}>${renderInline(line.trim())}</h${h}>`); i += 2; continue;
        }
        const para = [line.trim()]; i++;
        while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i]) && !(
          i + 1 < lines.length && /^\s{0,3}(?:=+|-+)\s*$/.test(lines[i+1]))) para.push(lines[i++].trim());
        blocks.push(`<p>${para.map(x => renderInline(x)).join('<br>')}</p>`);
      }
      return blocks.join('\n');
    }
    function renderDocument(markdown) {
      const original = String(markdown ?? '');
      const source = original.slice(0, MAX_CHARS).split('\n').slice(0, MAX_LINES).join('\n');
      const truncated = source.length < original.length;
      const body = renderBlocks(source);
      return `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:;"><style>
        :root{color-scheme:dark}*{box-sizing:border-box}body{font:16px/1.65 system-ui,-apple-system,sans-serif;margin:0 auto;padding:20px;max-width:900px;background:#181b20;color:#e5e8ee;overflow-wrap:anywhere}h1,h2,h3{line-height:1.3;margin:1.3em 0 .5em}h1,h2{border-bottom:1px solid #41444a;padding-bottom:.25em}p{margin:.8em 0}a{color:#8ec8ff}pre,code{background:#272b32;border-radius:5px}code{padding:.12em .3em}pre{padding:14px;overflow-x:auto;white-space:pre}pre code{padding:0}blockquote{border-left:4px solid #606f84;margin:1em 0;padding:.1em 1em;color:#c3c9d1;background:#20252c}hr{border:0;border-top:1px solid #41444a;margin:1.5em 0}li{margin:.24em 0}.task{list-style:none}.task input{accent-color:#79a9ff}table{border-collapse:collapse;min-width:100%}th,td{border:1px solid #555b64;padding:7px 10px;text-align:left}th{background:#292f39}.table-wrap{overflow-x:auto}.image-note{color:#adb6c3}.notice{padding:10px;background:#443b22;border-radius:6px;margin-bottom:15px}
      </style></head><body>${truncated ? '<div class="notice">Prévia parcial: arquivo grande demais para renderização completa.</div>' : ''}${body || '<p><em>Arquivo Markdown vazio.</em></p>'}</body></html>`;
    }
    function closeSidebar() {
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('overlay')?.classList.remove('show');
    }
    function onClick(event) {
      if (event.target?.closest('[data-delete]')) return;
      const item = event.target?.closest('[data-file]');
      if (!item) return;
      const name = item.getAttribute('data-file') || '';
      if (!supported.test(name)) {
        if (ownPreview) api.closePreview();
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        const file = api.getFile(name);
        if (!file) throw new Error('Arquivo não encontrado no projeto.');
        api.renderHtml({ title: name, html: renderDocument(file.content) });
        currentName = name;
        ownPreview = true;
        closeSidebar();
      } catch (error) {
        window.Android?.showToast?.(`Não foi possível visualizar Markdown: ${String(error.message || error)}`);
      }
    }
    function onHtmlRendered(event) { if (event.detail?.title !== currentName) ownPreview = false; }
    function onProjectLoading() {
      if (ownPreview) api.closePreview();
      ownPreview = false; currentName = '';
    }
    function onPreviewClosed() { ownPreview = false; }
    list.addEventListener('click', onClick, true);
    window.addEventListener('android:project-loading', onProjectLoading);
    window.addEventListener('code-editor:html-rendered', onHtmlRendered);
    window.addEventListener('code-editor:preview-closed', onPreviewClosed);
    return () => {
      list.removeEventListener('click', onClick, true);
      window.removeEventListener('android:project-loading', onProjectLoading);
      window.removeEventListener('code-editor:html-rendered', onHtmlRendered);
      window.removeEventListener('code-editor:preview-closed', onPreviewClosed);
      if (ownPreview) api.closePreview();
    };
  }
});
