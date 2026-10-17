'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const ROOT = join(__dirname, '..', 'plugins');

function harness(fileContents) {
  const handlers = new Map();
  const captureListeners = [];
  const notifications = [];
  const files = new Map(Object.entries(fileContents));
  const elements = {};
  for (const id of ['sidebar', 'overlay']) {
    elements[id] = { classList: { remove: () => undefined } };
  }
  const list = {
    addEventListener(type, callback, capture) { assert.equal(type, 'click'); assert.equal(capture, true); captureListeners.push(callback); },
    removeEventListener(type, callback) {
      const idx = captureListeners.indexOf(callback);
      if (idx >= 0) captureListeners.splice(idx, 1);
    }
  };
  elements.fileList = list;
  const previews = []; let closes = 0;
  let activeName = '';
  const broadcast = (type, detail = {}) => { for (const f of handlers.get(type) || []) f({ detail }); };
  const api = {
    getFiles: () => [...files.keys()].map(name => ({ name })),
    getFile: name => files.has(name) ? ({ name, content: files.get(name) }) : null,
    getActiveFile: () => activeName ? ({ name: activeName, content: files.get(activeName) }) : null,
    renderHtml: preview => { previews.push(preview); broadcast('code-editor:html-rendered', { title: preview.title, html: preview.html }); return preview; },
    closePreview: () => { closes++; broadcast('code-editor:preview-closed'); }
  };
  let registered;
  const context = {
    CodeEditorAPI: { addPlugin: spec => { registered = spec; } },
    window: {
      Android: { showToast: message => notifications.push(message) },
      addEventListener: (type, cb) => { const xs = handlers.get(type) || []; xs.push(cb); handlers.set(type, xs); },
      removeEventListener: (type, cb) => { handlers.set(type, (handlers.get(type) || []).filter(x => x !== cb)); }
    },
    document: { getElementById: id => elements[id] || null }
  };
  function install(pluginName) {
    registered = undefined;
    const source = readFileSync(join(ROOT, pluginName, 'plugins', pluginName + '.js'), 'utf8');
    runInNewContext(source, context, { filename: pluginName + '.js' });
    assert.equal(registered.id, pluginName);
    const deactivate = registered.activate({ api });
    assert.equal(typeof deactivate, 'function');
    return deactivate;
  }
  function click(name, options = {}) {
    let prevented = false, stopped = false;
    const item = { getAttribute: key => key === 'data-file' ? name : null };
    const event = {
      target: {
        closest: selector => selector === '[data-delete]' ? (options.delete ? {} : null) : (selector === '[data-file]' ? item : null)
      },
      preventDefault: () => { prevented = true; },
      stopImmediatePropagation: () => { stopped = true; }
    };
    for (const cb of [...captureListeners]) { if (!stopped) cb(event); }
    if (!stopped && !options.delete && files.has(name)) activeName = name;
    return { prevented, stopped };
  }
  return { install, click, api, files, previews, notifications, broadcast, listenerCount: () => captureListeners.length, closed: () => closes };
}

test('HTML: click .html keeps an editable source tab and shows preview', async () => {
  const h = harness({ 'web/index.html': '<h1>Olá!</h1>', 'README.md': '# hi' });
  const remove = h.install('html-preview');
  assert.deepEqual(h.click('web/index.html'), { prevented: false, stopped: false });
  await Promise.resolve();
  assert.equal(h.api.getActiveFile().name, 'web/index.html');
  assert.equal(h.previews[0].file, 'web/index.html');
  assert.equal(h.previews[0].title, 'web/index.html');
  assert.deepEqual(h.click('README.md'), { prevented: false, stopped: false });
  assert.equal(h.closed(), 1);
  assert.deepEqual(h.click('web/index.html', { delete: true }), { prevented: false, stopped: false });
  remove();
  assert.equal(h.listenerCount(), 0);
});

test('Markdown: headings, code, lists, tables, tasks, links and markup escaping', () => {
  const md = [
    '# Capítulo <script>alert(1)</script>',
    'Texto **forte**, *itálico*, ~~riscado~~ e `a<b`.',
    '',
    '- [x] concluído', '- [ ] pendente',
    '', '```python', 'print("ok")', '```',
    '| Coluna | Valor |', '| --- | --- |', '| X | <img src=x onerror=1> |',
    '', '[malicioso](javascript:alert(1))',
    '[seguro](https://example.org/path?x=1&y=2)',
    '![](file:///etc/passwd)'
  ].join('\n');
  const h = harness({ 'notes/README.md': md });
  const remove = h.install('markdown-preview');
  assert.equal(h.click('notes/README.md').stopped, true);
  const out = h.previews[0].html;
  assert.match(out, /<h1>Capítulo &lt;script&gt;alert\(1\)&lt;\/script&gt;<\/h1>/);
  assert.match(out, /<strong>forte<\/strong>/);
  assert.match(out, /<em>itálico<\/em>/);
  assert.match(out, /<del>riscado<\/del>/);
  assert.match(out, /<code>a&lt;b<\/code>/);
  assert.match(out, /<pre><code data-language="python">/);
  assert.match(out, /<table>/);
  assert.match(out, /&lt;img src=x onerror=1&gt;/);
  assert.match(out, /type="checkbox" disabled checked/);
  assert.match(out, /href="https:\/\/example.org\/path\?x=1&amp;y=2"/);
  assert.doesNotMatch(out, /href="javascript:/i);
  assert.doesNotMatch(out, /<script>alert\(1\)<\/script>/);
  assert.doesNotMatch(out, /href="file:/);
  remove();
  assert.equal(h.listenerCount(), 0);
});

test('Markdown: long files are bounded and do not embed arbitrary HTML', () => {
  const h = harness({ 'big.md': `<img src=x onerror="evil()">\n${'word '.repeat(80000)}` });
  h.install('markdown-preview');
  h.click('big.md');
  const out = h.previews[0].html;
  assert.match(out, /Prévia parcial/);
  assert.match(out, /&lt;img src=x onerror=&quot;evil\(\)&quot;&gt;/);
  assert.doesNotMatch(out, /<img src=x/);
});

test('JSON: syntax coloring, error handling, and safe escaping', () => {
  const h = harness({ 'config.json': '{"x":"<script>bad</script>","items":[1,true,null]}', 'broken.json': '{invalid' });
  h.install('json-preview');
  assert.equal(h.click('config.json').stopped, true);
  assert.match(h.previews[0].html, /JSON válido/);
  assert.match(h.previews[0].html, /&lt;script&gt;bad&lt;\/script&gt;/);
  assert.doesNotMatch(h.previews[0].html, /<script>bad/);
  h.click('broken.json');
  assert.match(h.previews[1].html, /JSON inválido/);
});

test('CSV and TSV: quote/embedded delimiters, safety, max rows and no cell evaluation', () => {
  const h = harness({
    'sheet.csv': 'Name,Note\r\nAlice,"Hello, world"\r\nBob,"<svg onload=evil()>"\r\nCarol,"a\nb"',
    'sheet.tsv': 'A\tB\nhello\t=SUM(1+1)',
    'pt.csv': 'nome;valor\nMaria;1,5'
  });
  h.install('csv-preview');
  h.click('sheet.csv');
  const html = h.previews[0].html;
  assert.match(html, /Hello, world/);
  assert.match(html, /&lt;svg onload=evil\(\)&gt;/);
  assert.doesNotMatch(html, /<svg onload/);
  assert.match(html, /a\nb/);
  h.click('sheet.tsv');
  assert.match(h.previews[1].html, /=SUM\(1\+1\)/);
  assert.doesNotMatch(h.previews[1].html, /<script/);
  h.click('pt.csv');
  assert.match(h.previews[2].html, /<th>nome<\/th><th>valor<\/th>/);
});

test('All four plugins coexist and only intercept matching extensions', async () => {
  const h = harness({ 'index.html': '<p>A</p>', 'readme.md': 'hello', 'config.json': '{}', 'a.csv': 'x\ny', 'main.py': 'print(1)' });
  const stops = ['html-preview','markdown-preview','json-preview','csv-preview'].map(x => h.install(x));
  assert.equal(h.click('index.html').stopped, false, 'HTML must remain editable');
  await Promise.resolve();
  for (const name of ['readme.md','config.json','a.csv']) assert.equal(h.click(name).stopped, true, name);
  assert.equal(h.previews.length, 4);
  assert.equal(h.click('main.py').stopped, false);
  h.broadcast('android:project-loading');
  for (const stop of stops) stop();
  assert.equal(h.listenerCount(), 0);
});
