'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { runInNewContext } = require('node:vm');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const js = readFileSync(resolve(__dirname, '../plugins/html-preview/plugins/html-preview.js'), 'utf8');

test('HTML opens the editable MCode tab, renders preview and refreshes after edits', async () => {
  const handlers = new Map();
  const listEvents = [];
  const inputEvents = [];
  const previews = [];
  let active = '';
  let content = '<h1>before</h1>';
  let closed = 0;
  let plugin;
  const list = {
    addEventListener(_event, fn) { listEvents.push(fn); },
    removeEventListener() {}
  };
  const codeInput = {
    addEventListener(_event, fn) { inputEvents.push(fn); },
    removeEventListener() {}
  };
  const window = {
    setTimeout, clearTimeout,
    addEventListener(name, fn) { handlers.set(name, fn); },
    removeEventListener(name) { handlers.delete(name); }
  };
  const api = {
    getActiveFile: () => active ? { name: active, content } : null,
    renderHtml: options => {
      previews.push({ ...options, source: content });
      handlers.get('code-editor:html-rendered')?.({ detail: { title: options.title } });
    },
    closePreview: () => { closed++; handlers.get('code-editor:preview-closed')?.({ detail: {} }); }
  };
  runInNewContext(js, {
    Promise, window,
    document: { getElementById(id) {
      return { fileList: list, codeInput, tabbar: null,
        previewPanel: { classList: { contains: () => false } } }[id] ?? null;
    } },
    CodeEditorAPI: { addPlugin(config, options) { plugin = { config, options }; } }
  });
  assert.equal(plugin.options.replace, true);
  const deactivate = plugin.config.activate({ api });
  const clicked = { prevented: false, stopped: false,
    target: { closest: selector => selector === '[data-file]'
      ? { getAttribute: () => 'index.html' } : null },
    preventDefault() { this.prevented = true; },
    stopImmediatePropagation() { this.stopped = true; }
  };
  // Plugin runs before MCode's native bubble listener.
  listEvents[0](clicked);
  assert.equal(clicked.prevented, false);
  assert.equal(clicked.stopped, false);
  active = 'index.html'; // Native MCode opens its editable source tab.
  await Promise.resolve();
  assert.equal(previews.length, 1);
  assert.equal(previews[0].source, '<h1>before</h1>');
  content = '<h1>after editing</h1>';
  inputEvents[0]();
  await new Promise(resolve => setTimeout(resolve, 730));
  assert.equal(previews.length, 2);
  assert.equal(previews[1].source, '<h1>after editing</h1>');
  deactivate();
  assert.equal(closed, 1);
});
