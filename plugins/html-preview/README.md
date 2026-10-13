# MCode HTML Preview

**Version:** 1.0.0  
**Package:** `mcode-html-preview.zip`  
**Requires:** MCode with `CodeEditorAPI` 1.1.0. **Does not require LunusDroid**.

## Install

In MCode, open **Plugins → Importar ZIP**, select `mcode-html-preview.zip` and approve the script. Open a project and tap a `.html`, `.htm` or `.xhtml` file in the project's file list. It opens in the existing **PREVIEW** panel, rather than in the code editor. Tapping another source file returns to the normal behavior.

## Behavior and limitations

- Uses MCode's built-in `CodeEditorAPI.renderHtml({ file })` and its sandboxed iframe.
- Embedded CSS and JavaScript run as supported by MCode's existing HTML preview. **JavaScript inside the preview can execute** within the iframe's sandbox. Preview only files you trust.
- Relative local assets such as `./styles.css`, `./script.js` and images are not automatically resolved to Android SAF project files. Inline CSS/JS, embedded data URLs and appropriate absolute web URLs may work under the app's WebView/network rules.
- MCode's `readProjectFile` only reads UTF-8 files up to **2 MiB**. Large/binary files cannot be previewed through this plugin.
- Reuses an existing panel; does not add a visual HTML editor or modify project files.

## Package

`plugins/html-preview.js` is the **only** executable plugin script in the ZIP. Other entries provide documentation and metadata. The installer requires an explicit trust approval.
