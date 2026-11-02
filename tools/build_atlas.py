"""Pack PMD sprite anims + portraits into one PNG atlas per Pokémon (and per shiny)."""
import xml.etree.ElementTree as ET, json, os, sys
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
BOSS = "0095 0059 0143 0214 0217 0208".split()
EVO = open(os.path.join(os.path.dirname(__file__), "evo_ids.txt")).read().split() if os.path.exists(os.path.join(os.path.dirname(__file__), "evo_ids.txt")) else []
POOL = ("0001 0004 0007 0025 0074 0058 0060 0019 0016 0066 0152 0155 0158 0179 0161 0163 0194 0167 0185 0133 0043 0175 0183 0209 "
        + open(os.path.join(os.path.dirname(__file__), "ids.txt")).read()).split()
NORMAL = sorted(set(POOL + BOSS + EVO)); SHINY = sorted(set(POOL + EVO))
WANT = ["Idle", "Walk", "Attack", "Hurt", "Shoot"]
EMOS = ["Normal", "Pain", "Happy"]

def anims_of(d):
    p = f"{d}/AnimData.xml"
    if not os.path.exists(p): return {}
    root = ET.parse(p).getroot()
    return {a.find("Name").text: a for a in root.find("Anims")}

def build(id_, shiny):
    sd = f"{src}/sprite/{id_}" + ("/0000/0001" if shiny else "")
    pd = f"{src}/portrait/{id_}" + ("/0000/0001" if shiny else "")
    nd, npd = f"{src}/sprite/{id_}", f"{src}/portrait/{id_}"
    A, NA = anims_of(sd), anims_of(nd)
    parts, meta = [], {"anims": {}}; own = 0
    for w in WANT:
        for base, table in ((sd, A), (nd, NA)):          # fall back to the normal sheet if the shiny lacks one
            a = table.get(w)
            if a is None: continue
            name = w
            while a.find("CopyOf") is not None:
                name = a.find("CopyOf").text; a = table[name]
            f = f"{base}/{name}-Anim.png"
            if not os.path.exists(f): continue
            im = Image.open(f).convert("RGBA")
            fw, fh = int(a.find("FrameWidth").text), int(a.find("FrameHeight").text)
            hf = a.find("HitFrame")
            parts.append((w, im)); own += (base == sd)
            meta["anims"][w] = dict(w=fw, h=fh, d=[int(x.text) for x in a.find("Durations")],
                                    hit=int(hf.text) if hf is not None else None)
            break
    if shiny and own == 0: return None, None, None
    ports = []
    for e in EMOS:
        for base in ((pd,) if shiny else (npd,)):
            f = f"{base}/{e}.png"
            if os.path.exists(f): ports.append((e, Image.open(f).convert("RGBA").resize((40, 40)))); break
        else:
            if ports: ports.append((e, ports[0][1]))
    W = max(im.width for _, im in parts)
    H = sum(im.height for _, im in parts)
    atlas = Image.new("RGBA", (W, H)); y = 0
    for w, im in parts:
        atlas.paste(im, (0, y)); meta["anims"][w]["y"] = y; y += im.height
    meta["W"], meta["H"] = W, H
    key = id_ + ("s" if shiny else "")
    atlas.save(f"{out}/{key}.png", optimize=True)
    return key, meta, ports

M, PORTS = {}, {}
allports = []
for i in NORMAL:
    k, m, p = build(i, False); M[k] = m; allports.append((k, p))
for i in SHINY:
    k, m, p = build(i, True)
    if k: M[k] = m
    if not k:  # no shiny map sprite: still keep shiny portraits if they exist
        sp = f"{src}/portrait/{i}/0000/0001"
        p = [(e, Image.open(f"{sp}/{e}.png").convert("RGBA").resize((40, 40))) for e in EMOS if os.path.exists(f"{sp}/{e}.png")]
        k = i + "s" if p else None
    if k and p: allports.append((k, p))
COLS = 24; n = sum(len(p) for _, p in allports)
sheet = Image.new("RGBA", (COLS * 40, ((n + COLS - 1) // COLS) * 40)); idx = 0
for k, p in allports:
    PORTS[k] = {}
    for e, im in p:
        x, y = (idx % COLS) * 40, (idx // COLS) * 40; sheet.paste(im, (x, y)); PORTS[k][e] = [x, y]; idx += 1
sheet.save(f"{out}/ports.png", optimize=True)
json.dump({"atlas": M, "ports": PORTS, "pw": sheet.width, "ph": sheet.height}, open(f"{out}/atlas.json", "w"), separators=(",", ":"))
print(len(M), "atlases", sum(os.path.getsize(f"{out}/{f}") for f in os.listdir(out)) // 1024, "KB")
print("shiny map sprites:", sum(1 for k in M if k.endswith("s")), "of", len(SHINY), "| ports sheet", sheet.size)
