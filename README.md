# MCode Plugins

Plugins for the [MCode Android editor](https://github.com/g4b3r-android/mcode).

| Plugin | Features | Install ZIP |
| --- | --- | --- |
| [Image Viewer](plugins/image-viewer/README.txt) | Preview an image by tapping its file in the open project's file list. Requires LunusDroid, Python 3 and a project accessible through `/sdcard`. | [Download image viewer](plugins/image-viewer/mcode-image-viewer.zip) |
| [Python Import Checker](plugins/python-import-checker/README.md) | Check Python imports in project files against standard-library, local modules and installed packages. Requires LunusDroid and Python. | [Download import checker](plugins/python-import-checker/mcode-python-import-checker.zip) |

## Installation

Open **MCode → Plugins → Importar ZIP**, select the ZIP for the desired plugin, review the security prompt and approve installation.

Each ZIP includes the installable `plugins/*.js` file. The sources are also published in the plugin-specific folders for audit and development.

## Notes

- Plugins execute JavaScript in the MCode WebView with the editor's privileges. Install only trusted scripts.
- The image viewer works on image paths available to Debian/LunusDroid; it cannot directly decode binary files with the editor's text-only `readProjectFile` bridge.
- These plugins were checked in a development environment but have not been verified on a physical Android device.
