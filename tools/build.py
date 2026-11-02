# Inline atlas metadata into the page: python3 tools/build.py (run from repo root)
src = open('src/index.src.html').read()
atlas = open('atlas/atlas.json').read()
open('index.html', 'w').write(src.replace('/*ATLAS*/null', atlas))
