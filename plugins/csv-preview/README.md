# MCode CSV/TSV Viewer

**Version:** 1.0.0  
**Package:** `mcode-csv-preview.zip`  
**Requires:** MCode with `CodeEditorAPI` 1.1.0. **Does not require LunusDroid**.

Install through **Plugins → Importar ZIP**, then tap a `.csv` or `.tsv` file from the project's file list. It opens as a scrollable, read-only table. Supports CSV comma or semicolon separator auto-detection (first row) and TSV tabs; handles quoted fields, double quotes and line breaks inside quotes. Displays strings without interpreting spreadsheet formulas or HTML.

Safety/performance limits: **250 data rows**, **50 columns** and **300,000 characters** per preview; MCode's text reader supports UTF-8 files up to 2 MiB. The first row is treated as the header. Files with exotic encodings or complex spreadsheet-specific behavior may require conversion first.

`plugins/csv-preview.js` is the only executable plugin script in the ZIP.
