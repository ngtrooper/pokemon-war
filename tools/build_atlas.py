"""Pack PMD sprite anims + portraits into one PNG atlas per Pokémon (and per shiny)."""
import xml.etree.ElementTree as ET, json, os, sys
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
NORMAL = ("0001 0004 0007 0025 0074 0058 0060 0019 0016 0066 0152 0155 0158 0179 0161 0163 0194 0167 0185 "
          "0133 0043 0095 0059 0143 0175 0183 0209 0214 0217 0208").split()
SHINY = "0001 0004 0007 0025 0133 0058 0060 0074 0066 0016 0019 0043 0152 0155 0158 0179 0175 0161 0163 0194 0167 0185 0183 0209".split()
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
    parts, meta = [], {"anims": {}, "port": {}}
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
            parts.append((w, im))
            meta["anims"][w] = dict(w=fw, h=fh, d=[int(x.text) for x in a.find("Durations")],
                                    hit=int(hf.text) if hf is not None else None)
            break
    ports = []
    for e in EMOS:
        for base in (pd, npd):
            f = f"{base}/{e}.png"
            if os.path.exists(f): ports.append((e, Image.open(f).convert("RGBA").resize((40, 40)))); break
        else:
            if ports: ports.append((e, ports[0][1]))
    W = max([im.width for _, im in parts] + [40 * len(ports)])
    H = sum(im.height for _, im in parts) + 40
    atlas = Image.new("RGBA", (W, H)); y = 0
    for w, im in parts:
        atlas.paste(im, (0, y)); meta["anims"][w]["y"] = y; y += im.height
    for i, (e, im) in enumerate(ports):
        atlas.paste(im, (i * 40, y)); meta["port"][e] = [i * 40, y]
    key = id_ + ("s" if shiny else "")
    atlas.save(f"{out}/{key}.png", optimize=True)
    return key, meta

M = {}
for i in NORMAL: k, m = build(i, False); M[k] = m
for i in SHINY:  k, m = build(i, True);  M[k] = m
json.dump(M, open(f"{out}/atlas.json", "w"), separators=(",", ":"))
print(len(M), "atlases", sum(os.path.getsize(f"{out}/{f}") for f in os.listdir(out)) // 1024, "KB")
print({k: list(v["anims"]) for k, v in M.items() if len(v["anims"]) < 5 or len(v["port"]) < 3})
