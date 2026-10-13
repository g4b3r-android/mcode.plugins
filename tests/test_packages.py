"""Verify the deliverable ZIP archives match their audited JS source files."""
import sys
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SLUGS = ("html-preview", "markdown-preview", "json-preview", "csv-preview")


class PackageTest(unittest.TestCase):
    def test_archive_contents_match_sources(self):
        for slug in SLUGS:
            with self.subTest(slug=slug):
                base = ROOT / "plugins" / slug
                archive_path = base / f"mcode-{slug}.zip"
                with zipfile.ZipFile(archive_path) as archive:
                    self.assertIsNone(archive.testzip())
                    self.assertEqual(set(archive.namelist()), {
                        f"plugins/{slug}.js", "README.md", "plugins.json"})
                    for member in archive.infolist():
                        self.assertEqual(member.compress_type, zipfile.ZIP_STORED)
                    self.assertEqual(archive.read(f"plugins/{slug}.js"),
                                     (base / "plugins" / f"{slug}.js").read_bytes())
                    self.assertEqual(archive.read("plugins.json"),
                                     (base / "plugins.json").read_bytes())
                    self.assertEqual(archive.read("README.md"),
                                     (base / "README.md").read_bytes())


if __name__ == "__main__":
    unittest.main()
