#!/usr/bin/env python3
"""Zgradi tri strani iz app.html + core.js:
  index.html          — javna stran za igralce (bere data.js; razpored + lestvica)
  uredi.html          — urejevalnik za organizatorja
  24ur-odbojke.html   — offline kopija urejevalnika
"""
import pathlib, sys

d = pathlib.Path(__file__).parent
core = (d / 'core.js').read_text(encoding='utf-8')
app = (d / 'app.html').read_text(encoding='utf-8')

share_base = sys.argv[1] if len(sys.argv) > 1 else ''
base = app.replace('/*__CORE__*/', core).replace('__SHARE_BASE__', share_base)

def page(mode):
    return ('<!doctype html>\n<html lang="sl">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '</head>\n<body class="m-' + mode + '">\n' + base.replace('__MODE__', mode) + '\n</body>\n</html>\n')

viewer = page('viewer')
editor = page('editor')
(d / 'index.html').write_text(viewer, encoding='utf-8')
(d / 'uredi.html').write_text(editor, encoding='utf-8')
(d / '24ur-odbojke.html').write_text(editor, encoding='utf-8')
print('OK: index.html (viewer, %d kB), uredi.html + 24ur-odbojke.html (editor), SHARE_BASE=%r'
      % (len(viewer) // 1024, share_base))
