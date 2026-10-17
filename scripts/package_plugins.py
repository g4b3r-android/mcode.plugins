#!/usr/bin/env python3
"""Build reproducible ZIP_STORED install packages for the four new preview plugins."""
from __future__ import annotations

import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SLUGS = ("html-preview", "markdown-preview", "json-preview", "csv-preview")
TIMESTAMP = (2026, 10, 12, 0, 0, 0)


def build(slug: str) -> Path:
    location = ROOT / "plugins" / slug
    js_name = f"{slug}.js"
    source = (location / "plugins" / js_name).read_bytes()
    readme = (location / "README.md").read_bytes()
    # Read each plugin's own version rather than resetting it to 1.0.0.
    manifest_data = json.loads((location / "plugins.json").read_text(encoding="utf-8"))
    manifest = json.dumps(manifest_data, ensure_ascii=False, indent=2).encode("utf-8") + b"\n"
    entries = {
        f"plugins/{js_name}": source,
        "README.md": readme,
        "plugins.json": manifest,
    }
    (location / "plugins.json").write_bytes(manifest)
    dest = location / f"mcode-{slug}.zip"
    with zipfile.ZipFile(dest, mode="w") as archive:
        for name, data in sorted(entries.items()):
            info = zipfile.ZipInfo(name, TIMESTAMP)
            info.compress_type = zipfile.ZIP_STORED  # Android WebView can read without DecompressionStream.
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data)
    print(f"{dest.relative_to(ROOT)} ({dest.stat().st_size} bytes)")
    return dest


if __name__ == "__main__":
    for slug in SLUGS:
        build(slug)
