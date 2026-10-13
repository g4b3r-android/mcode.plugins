# MCode Markdown Preview

**Version:** 1.0.0  
**Package:** `mcode-markdown-preview.zip`  
**Requires:** MCode with `CodeEditorAPI` 1.1.0. **Does not require LunusDroid**.

## Install

In MCode, open **Plugins → Importar ZIP**, select `mcode-markdown-preview.zip` and approve the script. Open a project and tap a `.md`, `.markdown` or `.mdown` file in the explorer. The document opens in the existing **PREVIEW** panel.

## Features

- Headings, paragraphs, bold/italic/strikethrough, inline code, fenced code blocks, quotes, horizontal rules.
- Bullet and numbered lists, task-list checkboxes, basic tables.
- Dark, mobile-friendly layout. Entirely self-contained; no CDN or parser dependency.
- Escapes raw HTML in Markdown and rejects potentially dangerous link schemes (for example `javascript:`, `file:` and `data:`).
- Offline by default: external image embeds are shown as safe text/link references instead of automatically loading remote resources. Project-local images are not embedded because MCode's current binary-file bridge is unavailable to this plugin.

## Limitations

- This is a **basic Markdown renderer**, not a complete CommonMark/GFM implementation. Nested lists, complex table cells, reference-style links and advanced extensions can display differently from GitHub.
- Preview is limited to the first **300,000 characters / 3,000 lines**, whichever is reached first. MCode's UTF-8 file reader has a **2 MiB** file limit.
- Read-only preview: edits still belong to the MCode source editor.

## Package

`plugins/markdown-preview.js` is the only executable plugin script in the ZIP.
