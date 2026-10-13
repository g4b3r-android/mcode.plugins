# MCode Plugins

Plugins for the [MCode Android editor](https://github.com/g4b3r-android/mcode).

| Plugin | Features | Install ZIP |
| --- | --- | --- |
| [Image Viewer](plugins/image-viewer/README.txt) | Preview an image by tapping its file in the open project's file list. Requires LunusDroid, Python 3 and a project accessible through `/sdcard`. | [Download image viewer](plugins/image-viewer/mcode-image-viewer.zip) |
| [Python Import Checker](plugins/python-import-checker/README.md) | Check Python imports in project files against standard-library, local modules and installed packages. Requires LunusDroid and Python. | [Download import checker](plugins/python-import-checker/mcode-python-import-checker.zip) |
| [HTML Preview](plugins/html-preview/README.md) | Open `.html`, `.htm` and `.xhtml` files in MCode's built-in sandboxed preview. | [Download HTML Preview](plugins/html-preview/mcode-html-preview.zip) |
| [Markdown Preview](plugins/markdown-preview/README.md) | Preview `.md`, `.markdown` and `.mdown` with basic offline Markdown rendering. | [Download Markdown Preview](plugins/markdown-preview/mcode-markdown-preview.zip) |
| [JSON Viewer](plugins/json-preview/README.md) | Read-only `.json` inspection with highlighting and syntax errors. | [Download JSON Viewer](plugins/json-preview/mcode-json-preview.zip) |
| [CSV/TSV Viewer](plugins/csv-preview/README.md) | Read-only `.csv` and `.tsv` tables; comma, semicolon and tab separators. | [Download CSV Viewer](plugins/csv-preview/mcode-csv-preview.zip) |

## Installation / Instalação

Open **MCode → Plugins → Importar ZIP**, select the ZIP for the desired plugin, review the security prompt and approve installation. **Toque em um arquivo da lista do projeto** para visualizar o formato correspondente.

Each ZIP includes a self-contained installable `plugins/*.js` script. Source code, the package manifest and documentation are published beside the ZIP for audits and development. The new HTML, Markdown, JSON and CSV plugins do **not** require LunusDroid or an APK update, but require a MCode version with `CodeEditorAPI` 1.1.0.

The HTML plugin uses the existing HTML iframe preview. Relative project assets may not resolve under Android SAF, and JavaScript embedded in HTML is executed inside the existing preview sandbox. Markdown raw HTML is escaped, and remote image embeds are not automatically downloaded. Full CommonMark/GFM compatibility is **not** provided.

## Tests and packaging

```bash
node --test tests/plugins.test.cjs
python3 -m unittest discover -s tests -p 'test_*.py'
python3 scripts/package_plugins.py
```

The packaging script currently builds the four new lightweight preview plugins with reproducible ZIP_STORED archives supported by MCode's ZIP reader. Continuous integration runs the tests on changes to plugins and tests.

## Notes

- Plugins execute JavaScript in the MCode WebView with the editor's privileges. Install only trusted scripts.
- The existing image viewer works on image paths available to Debian/LunusDroid; it cannot directly decode binary files with the editor's text-only `readProjectFile` bridge.
- The new text-based preview plugins use MCode's existing `getFile` / `renderHtml` API and are read-only; images inside Markdown may be shown as references instead of embedded project images.
- These plugins were checked in automated tests but have not been verified on a physical Android device.

## Other plugin ideas

Potential next improvements: YAML validator, side-by-side text diff, project-wide search, Git status/diff integration, and optional syntax-aware formatters. These require additional design and are **not included** here.
