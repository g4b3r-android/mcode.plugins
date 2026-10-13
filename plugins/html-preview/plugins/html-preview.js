/* MCode HTML Preview v1.0.0. Preview .html/.htm from the open project's file list. */
CodeEditorAPI.addPlugin({
  id: 'html-preview',
  name: 'Visualizador HTML',
  activate({ api }) {
    const list = document.getElementById('fileList');
    if (!list) throw new Error('Explorador de arquivos não encontrado.');
    const supported = /\.(?:html?|xhtml)$/i;
    let ownPreview = false;
    let currentName = '';

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
      // Prevent MCode's built-in openFile() from opening an editor tab.
      event.preventDefault();
      event.stopImmediatePropagation();
      try {
        if (!api.getFiles().some(file => file.name === name)) throw new Error('Arquivo não encontrado no projeto.');
        api.renderHtml({ file: name, title: name });
        currentName = name;
        ownPreview = true;
        closeSidebar();
      } catch (error) {
        window.Android?.showToast?.(`Não foi possível visualizar HTML: ${String(error.message || error)}`);
      }
    }
    function onHtmlRendered(event) {
      // Other plugins can share the same preview panel.
      if (event.detail?.title !== currentName) ownPreview = false;
    }
    function onProjectLoading() {
      if (ownPreview) api.closePreview();
      ownPreview = false;
      currentName = '';
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
