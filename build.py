#!/usr/bin/env python3
"""Zgradi index.html (za GitHub Pages) in 24ur-odbojke.html (offline kopija)."""
import pathlib, sys

d = pathlib.Path(__file__).parent
core = (d / 'core.js').read_text()
app = (d / 'app.html').read_text()

share_base = sys.argv[1] if len(sys.argv) > 1 else ''
content = app.replace('/*__CORE__*/', core).replace('__SHARE_BASE__', share_base)

page = ('<!doctype html>\n<html lang="sl">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '</head>\n<body>\n' + content + '\n</body>\n</html>\n')
(d / 'index.html').write_text(page)
(d / '24ur-odbojke.html').write_text(page)
print('OK: index.html + 24ur-odbojke.html (%d kB), SHARE_BASE=%r'
      % (len(page) // 1024, share_base))
