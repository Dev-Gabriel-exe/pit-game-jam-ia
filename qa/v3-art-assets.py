#!/usr/bin/env python3
"""ART-02: verify original local SVGs and their safe CSS integrations."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET

base = Path("v3/assets/art")
names = ["portal-arcano.svg", "mesa-do-mestre.svg", "biblioteca-arcana.svg", "conquista-dez-missoes.svg"]
css = Path("v3/design-system.css").read_text(encoding="utf-8")
for name in names:
    path = base / name
    raw = path.read_text(encoding="utf-8")
    root = ET.fromstring(raw)
    assert root.tag == "{http://www.w3.org/2000/svg}svg", name
    assert int(root.attrib["width"]) >= 900 and int(root.attrib["height"]) >= 400, name
    assert root.attrib.get("viewBox") and root.attrib.get("aria-label"), name
    assert not re.search(r"<script\b|<foreignObject\b|https?://(?!www\.w3\.org/2000/svg)", raw, re.I), name
    assert not re.search(r"(?:href|xlink:href)\s*=\s*['\"](?:https?:|data:)", raw, re.I), name
    assert raw.count("<path") + raw.count("<circle") + raw.count("<rect") >= 8, name
    assert f'url("./assets/art/{name}")' in css, "missing CSS reference: " + name
    print(f"PASS ART-02: {name}, {path.stat().st_size} bytes, parsed XML, safe local art")
for selector in ["#inicio.hero::before", 'body[data-role="teacher"]>.shell>.hero', "#recursos.resources", ".final-award.is-earned"]:
    assert selector in css, selector
assert css.count("background-image:linear-gradient(") >= 4, "missing gradient fallback"
for html in ["index.html", "aluno-v3.html", "professor-v3.html"]:
    assert "v3/design-system.css" in Path(html).read_text(encoding="utf-8"), html
print("PASS ART-02: 4 illustrations integrated without external dependencies")

for name, frames in [("estados-missao.svg", 5), ("tipos-recurso.svg", 4)]:
    raw = (base / name).read_text(encoding="utf-8")
    root = ET.fromstring(raw)
    assert root.tag == "{http://www.w3.org/2000/svg}svg"
    groups = [node for node in root if node.tag.endswith("g") and node.attrib.get("transform", "").startswith("translate(")]
    assert len(groups) == frames, (name, len(groups))
    assert not re.search(r'<script\b|<foreignObject\b|href=.*https?:', raw, re.I), name
    print(f"PASS ART-03: {name} XML, {frames} unique vector frames")
