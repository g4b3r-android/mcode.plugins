"""MCode Import Checker: inspect Python imports without importing user modules."""
import ast
import base64
import importlib.machinery
import json
import os
from pathlib import Path
import sys

PREFIX = 'MCODE_IMPORT_CHECKER_JSON:'
SKIP_DIRS = {'.git', '.hg', '.svn', '.venv', 'venv', 'env', '__pycache__',
             'node_modules', 'dist', 'build', '.gradle', '.idea', '.mypy_cache',
             '.pytest_cache', 'site-packages', '.tox'}
MAX_DISK_FILES = 1200
MAX_DISK_BYTES = 8 * 1024 * 1024
MAX_SINGLE_FILE = 256 * 1024


def normalize(name):
    parts = str(name).replace('\\', '/').split('/')
    if any(part == '..' for part in parts):
        return None
    return '/'.join(part for part in parts if part not in ('', '.'))


def collect_disk_files():
    """Scan cwd with quotas, never read outside it via symlinks."""
    root = os.path.realpath(os.getcwd())
    result = {}
    used = 0
    skipped = 0
    for current, dirs, files in os.walk(root, followlinks=False):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS and not os.path.islink(os.path.join(current, d)))
        for filename in sorted(files):
            if not filename.lower().endswith('.py'):
                continue
            if len(result) >= MAX_DISK_FILES:
                skipped += 1
                continue
            absolute = os.path.join(current, filename)
            try:
                if os.path.islink(absolute):
                    skipped += 1
                    continue
                size = os.stat(absolute).st_size
                if size > MAX_SINGLE_FILE or used + size > MAX_DISK_BYTES:
                    skipped += 1
                    continue
                with open(absolute, 'r', encoding='utf-8-sig') as stream:
                    source = stream.read()
                name = normalize(os.path.relpath(absolute, root))
                if name:
                    result[name] = source
                    used += size
            except (OSError, UnicodeError):
                skipped += 1
    return result, skipped


def build_modules(names):
    """Build plausible project module names, accepting flat/src layouts."""
    modules = set()
    bases = []
    for name in names:
        name = normalize(name)
        if name and name.lower().endswith('.py'):
            parts = name.split('/')
            if parts[0] in ('src', 'lib') and len(parts) > 1:
                parts = parts[1:]
            base = parts[:-1]
            stem = parts[-1][:-3]
            if stem == '__init__':
                route = base
            else:
                route = base + [stem]
            if route and all(piece.isidentifier() for piece in route):
                bases.append(route)
    for route in bases:
        for idx in range(1, len(route) + 1):
            modules.add('.'.join(route[:idx]))
    return modules


def installed_root(name):
    if name in sys.builtin_module_names or name in getattr(sys, 'stdlib_module_names', ()):
        return 'standard'
    try:
        spec = importlib.machinery.PathFinder.find_spec(name, sys.path)
        if spec is not None:
            origin = getattr(spec, 'origin', None) or ''
            if origin in ('built-in', 'frozen'):
                return 'standard'
            return 'installed'
    except Exception:
        return 'unknown'
    try:
        spec = importlib.machinery.BuiltinImporter.find_spec(name)
        if spec is not None:
            return 'standard'
        spec = importlib.machinery.FrozenImporter.find_spec(name)
        if spec is not None:
            return 'standard'
    except Exception:
        return 'unknown'
    return 'missing'


def classify(module, modules):
    if not module:
        return 'unknown'
    if module in modules:
        return 'project'
    root = module.split('.')[0]
    if root in modules:
        return 'missing'  # submodule not found in project index
    first = installed_root(root)
    if first not in ('standard', 'installed') or '.' not in module:
        return first
    # Check explicit dotted imports without executing __init__.py.
    try:
        spec = importlib.machinery.PathFinder.find_spec(root, sys.path)
        if spec is None:
            return first if first == 'standard' else 'unknown'
        prefix = root
        for part in module.split('.')[1:]:
            search = getattr(spec, 'submodule_search_locations', None)
            if search is None:
                return 'missing'
            prefix += '.' + part
            spec = importlib.machinery.PathFinder.find_spec(prefix, list(search))
            if spec is None:
                return 'missing'
    except Exception:
        return 'unknown'
    return first


def resolve_relative(path, level, module):
    """Return a module identifier relative to the file package."""
    components = normalize(path).split('/')[:-1]
    if components and components[0] in ('src', 'lib'):
        components = components[1:]
    if level > len(components):
        return None
    parent = components[:len(components) - (level - 1)]
    if module:
        parent += module.split('.')
    return '.'.join(parent)


def inspect_file(name, source, modules):
    found = []
    try:
        tree = ast.parse(source, filename=name)
    except (SyntaxError, ValueError) as error:
        return [{'file': name, 'line': error.lineno or 1, 'column': error.offset or 1,
                 'name': '', 'status': 'syntax', 'message': 'Erro de sintaxe: ' + str(error.msg)}]
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                target = alias.name
                status = classify(target, modules)
                found.append({'file': name, 'line': node.lineno, 'column': node.col_offset + 1,
                              'name': target, 'status': status})
        elif isinstance(node, ast.ImportFrom):
            target = ('.' * node.level) + (node.module or '')
            if node.level:
                resolved = resolve_relative(name, node.level, node.module)
                status = classify(resolved, modules) if resolved else 'missing'
            else:
                status = classify(node.module, modules)
            found.append({'file': name, 'line': node.lineno, 'column': node.col_offset + 1,
                          'name': target or '.', 'status': status})
    return found


def main():
    payload = json.loads(base64.b64decode(sys.argv[1]).decode('utf-8')) if len(sys.argv) > 1 else {}
    snapshot = {}
    for name, value in payload.get('sources', []):
        path = normalize(name)
        if path and path.lower().endswith('.py') and isinstance(value, str):
            snapshot[path] = value
    listed_names = [n for n in (normalize(name) for name in payload.get('names', [])) if n]
    disk_skipped = 0
    disk = {}
    if payload.get('skipped', 0) or (not snapshot and listed_names):
        disk, disk_skipped = collect_disk_files()
        if listed_names:
            allowed = set(listed_names)
            disk = {name: source for name, source in disk.items() if name in allowed}
    # Unsaved editor content always overrides files on disk.
    disk.update(snapshot)
    modules = build_modules(set(disk) | set(listed_names))
    scope = payload.get('scope', 'project')
    if scope == 'file':
        active = normalize(payload.get('active', ''))
        disk = {active: disk[active]} if active in disk else {}
    problems = []
    results = []
    for filename in sorted(disk):
        for item in inspect_file(filename, disk[filename], modules):
            results.append(item)
            if item['status'] in ('missing', 'syntax'):
                problems.append(item)
    answer = {
        'cwd': os.getcwd(), 'python': sys.executable,
        'version': sys.version.split()[0], 'scope': scope,
        'filesChecked': len(disk), 'importsChecked': len(results),
        'missing': len(problems), 'skippedDisk': disk_skipped,
        'skippedSnapshot': payload.get('skipped', 0),
        'items': results[:5000], 'truncatedResults': max(0, len(results) - 5000)
    }
    print(PREFIX + json.dumps(answer, ensure_ascii=False, separators=(',', ':')))


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(PREFIX + json.dumps({'fatal': str(exc)}, ensure_ascii=False))