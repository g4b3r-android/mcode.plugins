# MCode JSON Viewer

**Version:** 1.0.0  
**Package:** `mcode-json-preview.zip`  
**Requires:** MCode with `CodeEditorAPI` 1.1.0. **Does not require LunusDroid**.

Install through **Plugins → Importar ZIP**, then tap a `.json` file from the project's file list. The plugin previews JSON with indentation, basic syntax coloring, top-level type/count and syntax errors. It displays values as text; it **never evaluates** JSON values or scripts.

Read-only. Uses MCode's HTML preview and UTF-8 reader (up to 2 MiB). To avoid high memory use, JSON larger than **350,000 characters** displays a size warning instead of full content. JSONC, comments and trailing commas are not supported.

`plugins/json-preview.js` is the only executable plugin script in the ZIP.
