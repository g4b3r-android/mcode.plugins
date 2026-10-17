/* MCode HTML Preview v1.1.0: editable source and live preview in one workspace. */
CodeEditorAPI.addPlugin({
  id: 'html-preview',
  name: 'HTML: código e prévia',
  activate({ api }) {
    const fileList = document.getElementById('fileList');
    if (!fileList) throw new Error('Explorador de arquivos não encontrado.');
    const tabbar = document.getElementById('tabbar');
    const codeInput = document.getElementById('codeInput');
    const previewPanel = document.getElementById('previewPanel');
    const supported = /\.(?:html?|xhtml)$/i;
    const REFRESH_DELAY_MS = 650;
    let ownPreview = false;
    let currentName = '';
    let refreshTimer = null;
    let disposed = false;
    let navigationVersion = 0;

    function cancelRefresh() {
      if (refreshTimer != null) {
        window.clearTimeout(refreshTimer);
        refreshTimer = null;
      }
    }

    function closeOwnPreview() {
      cancelRefresh();
      if (ownPreview) api.closePreview();
      ownPreview = false;
      currentName = '';
    }

    function showHtml(name) {
      if (disposed || !supported.test(name)) return;
      // Do not render a stale click: MCode must have opened the same file as text.
      if (api.getActiveFile()?.name !== name) return;
      try {
        currentName = name;
        ownPreview = true;
        // Reads MCode's in-memory text, including unsaved edits. The preview iframe
        // stays separate from the source editor above it.
        api.renderHtml({ file: name, title: name });
      } catch (error) {
        ownPreview = false;
        currentName = '';
        window.Android?.showToast?.('Falha ao visualizar HTML: ' + String(error.message || error));
      }
    }

    function syncSelectedTab() {
      const name = api.getActiveFile()?.name || '';
      if (supported.test(name)) showHtml(name);
      else closeOwnPreview();
    }

    function onFileClick(event) {
      // Let MCode's native list handler open the source in an editable tab.
      // In particular, NEVER preventDefault() or stopImmediatePropagation().
      if (event.target?.closest('[data-delete]')) return;
      const item = event.target?.closest('[data-file]');
      if (!item) return;
      const name = item.getAttribute('data-file') || '';
      const requestedVersion = ++navigationVersion;
      cancelRefresh();
      if (!supported.test(name)) {
        closeOwnPreview();
        return;
      }
      // Plugins may be restored before MCode registers its normal click handler.
      // A microtask runs after both capture/bubble handlers have opened the file.
      Promise.resolve().then(() => {
        if (!disposed && requestedVersion === navigationVersion) showHtml(name);
      });
    }

    function onTabClick() {
      const requestedVersion = ++navigationVersion;
      cancelRefresh();
      Promise.resolve().then(() => {
        if (!disposed && requestedVersion === navigationVersion) syncSelectedTab();
      });
    }

    function onEditorInput() {
      if (!ownPreview || !currentName || disposed ||
          api.getActiveFile()?.name !== currentName) return;
      cancelRefresh();
      refreshTimer = window.setTimeout(() => {
        refreshTimer = null;
        if (disposed || !ownPreview ||
            previewPanel?.classList.contains('hidden')) return;
        showHtml(currentName);
      }, REFRESH_DELAY_MS);
    }

    function onHtmlRendered(event) {
      // Native Run/Executar also renders HTML. Track the currently edited source,
      // but don't overwrite previews belonging to another file or plugin.
      const active = api.getActiveFile()?.name || '';
      if (supported.test(active) && event.detail?.title === active) {
        currentName = active;
        ownPreview = true;
      } else {
        cancelRefresh();
        ownPreview = false;
        currentName = '';
      }
    }

    function onProjectLoading() { ++navigationVersion; closeOwnPreview(); }
    function onPreviewClosed() {
      cancelRefresh();
      ownPreview = false;
      currentName = '';
    }

    // Capture phase works with plugins restored before MCode installs its own
    // bubble-phase click listener; unlike v1.0, we never swallow the event.
    fileList.addEventListener('click', onFileClick, true);
    tabbar?.addEventListener('click', onTabClick);
    codeInput?.addEventListener('input', onEditorInput);
    window.addEventListener('android:project-loading', onProjectLoading);
    window.addEventListener('code-editor:html-rendered', onHtmlRendered);
    window.addEventListener('code-editor:preview-closed', onPreviewClosed);

    return () => {
      disposed = true;
      ++navigationVersion;
      cancelRefresh();
      fileList.removeEventListener('click', onFileClick, true);
      tabbar?.removeEventListener('click', onTabClick);
      codeInput?.removeEventListener('input', onEditorInput);
      window.removeEventListener('android:project-loading', onProjectLoading);
      window.removeEventListener('code-editor:html-rendered', onHtmlRendered);
      window.removeEventListener('code-editor:preview-closed', onPreviewClosed);
      closeOwnPreview();
    };
  }
}, { replace: true });
