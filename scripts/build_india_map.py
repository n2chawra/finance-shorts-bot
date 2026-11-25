"""Build the India Maps channel's India layer (remotion/src/flat/data/india.json) from Natural Earth
(public domain, naturalearthdata.com, v5.1): the India's-point-of-view country outline
(ne_10m_admin_0_countries_ind) and the admin-1 states (ne_10m_admin_1_states_provinces).

India's official map: Natural Earth's states cover India as administered; the rest of India's
official outline is assigned as the Survey of India map shows it: the part Pakistan holds as
"Azad Kashmir" to Jammu and Kashmir, everything else (Gilgit-Baltistan, Siachen, Aksai Chin, the
Shaksgam valley) to Ladakh. Neighbours are drawn from the same India's-view file, so no claimed
land is shown inside another country.

Usage (venv with shapely + pyshp + Pillow): python scripts/build_india_map.py <naturalearth dir> [relief]
"""
import json, sys
from pathlib import Path

import shapefile
from shapely.geometry import MultiPolygon, Polygon, mapping, shape, box
from shapely.geometry.polygon import orient
from shapely.ops import unary_union

NE = Path(sys.argv[1] if len(sys.argv) > 1 else "E:/cache/naturalearth")
OUT = Path(__file__).resolve().parents[1] / "remotion/src/flat/data/india.json"
TOL = 0.012          # degrees (~1.3 km): smooth at a 1080-px-wide India, small file
TYPES_UT = {"Ladakh", "Jammu and Kashmir", "Delhi", "Chandigarh", "Puducherry", "Lakshadweep",
            "Andaman and Nicobar", "Dadra and Nagar Haveli and Daman and Diu"}
NEIGHBOURS = {"PAK": "पाकिस्तान", "CHN": "चीन", "NPL": "नेपाल", "BTN": "भूटान", "BGD": "बांग्लादेश",
              "MMR": "म्यांमार", "LKA": "श्रीलंका", "AFG": "अफ़ग़ानिस्तान", "MDV": "मालदीव"}
FRAME = box(60, 0, 105, 40)


def rnd(geom):
    """GeoJSON geometry with coordinates rounded to 3 decimals."""
    def r(x):
        return [round(v, 3) for v in x] if isinstance(x[0], (int, float)) else [r(y) for y in x]
    if geom.geom_type == "GeometryCollection":   # an intersection can leave slivers of lines and points
        geom = unary_union([p for p in geom.geoms if p.geom_type in ("Polygon", "MultiPolygon")])
    # d3-geo draws on the sphere: an outer ring must run clockwise (shapely's sign -1), else d3 reads the
    # polygon as the whole globe minus the shape (a framed state frames the world, a trace rings every coast)
    if geom.geom_type == "Polygon":
        geom = orient(geom, -1.0)
    elif geom.geom_type == "MultiPolygon":
        geom = MultiPolygon([orient(g, -1.0) for g in geom.geoms])
    m = mapping(geom)
    return {"type": m["type"], "coordinates": r(json.loads(json.dumps(m["coordinates"])))}


def main() -> None:
    a1 = shapefile.Reader(str(NE / "adm1/ne_10m_admin_1_states_provinces.shp"), encoding="utf-8")
    states, azad = {}, None
    for s in a1.iterShapeRecords():
        rec, g = s.record, shape(s.shape.__geo_interface__)
        if rec["adm0_a3"] == "IND":
            states[rec["name"]] = {"g": g.buffer(0), "hi": rec["name_hi"]}
        elif rec["name"] == "Azad Kashmir":
            azad = g.buffer(0)
    a0 = shapefile.Reader(str(NE / "ind/ne_10m_admin_0_countries_ind.shp"), encoding="utf-8")
    india, others = None, []
    for s in a0.iterShapeRecords():
        g = shape(s.shape.__geo_interface__).buffer(0)
        if s.record["ADM0_A3"] == "IND":
            india = g
        elif s.record["ADM0_A3"] in NEIGHBOURS:
            others.append((s.record["ADM0_A3"], s.record["NAME"], g))
    assert india is not None and azad is not None and len(states) == 36, len(states)

    gap = india.difference(unary_union([v["g"] for v in states.values()]))
    # only the real pieces of the official outline (PoK and Gilgit-Baltistan, Aksai Chin and Shaksgam: north of
    # 32 N, each over 0.5 sq deg); the hairline slivers along every other border and coast are dropped
    missing = unary_union([g for g in getattr(gap, "geoms", [gap]) if g.area > 0.5 and g.centroid.y > 32])
    states["Jammu and Kashmir"]["g"] = unary_union([states["Jammu and Kashmir"]["g"], missing.intersection(azad)])
    states["Ladakh"]["g"] = unary_union([states["Ladakh"]["g"], missing.difference(azad)])
    # every state clipped to India's official outline, so the union is exactly the outline
    feats = []
    for name, v in sorted(states.items()):
        g = v["g"].intersection(india).simplify(TOL, preserve_topology=True)
        feats.append({"type": "Feature", "properties": {"name": name, "hi": v["hi"], "kind": "ut" if name in TYPES_UT else "state"},
                      "geometry": rnd(g)})
    # which states touch (for colouring: two neighbours never share a colour)
    clipped = {n: v["g"].intersection(india) for n, v in states.items()}
    adj = {n: sorted(m for m, h in clipped.items() if m != n and g.buffer(0.02).intersects(h)) for n, g in clipped.items()}
    outline = india.simplify(TOL, preserve_topology=True)
    near = [{"type": "Feature", "properties": {"code": c, "name": n, "hi": NEIGHBOURS[c]},
             "geometry": rnd(g.intersection(FRAME).simplify(TOL * 2, preserve_topology=True))} for c, n, g in others]
    out = {"note": "Generated by scripts/build_india_map.py from Natural Earth 5.1 (public domain): India's-view outline and admin-1 states; "
                   "the rest of India's official outline assigned to J&K (Azad Kashmir part) and Ladakh (the rest), as the Survey of India map shows. Do not edit by hand.",
           "outline": {"type": "Feature", "properties": {"name": "India", "hi": "भारत"}, "geometry": rnd(outline)},
           "states": feats, "neighbours": near, "adjacent": adj}
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(OUT, OUT.stat().st_size // 1024, "KB;", len(feats), "states and UTs;", len(near), "neighbours;",
          "missing assigned:", round(missing.area, 2), "sq deg")


if __name__ == "__main__" and not (len(sys.argv) > 2 and sys.argv[2] == "relief"):
    main()


def relief(ne: Path) -> None:
    """The channel's relief base: Natural Earth's cross-blended hypsometric tints with shaded relief
    (HYP_50M_SR_W, public domain), lon 50-115 E, lat 15 S-54 N (equirectangular, 30 px a degree), upscaled
    2x and graded to the channel's palette: a deeper, cooler sea and slightly muted land, so the painted
    states sit on top. Written to remotion/public/maps/south-asia-relief.jpg."""
    from PIL import Image, ImageEnhance, ImageFilter
    import numpy as np
    Image.MAX_IMAGE_PIXELS = None
    im = Image.open(ne / "hyp/HYP_50M_SR_W.tif").convert("RGB")
    ppd = im.size[0] / 360
    c = im.crop((int(230 * ppd), int(36 * ppd), int(295 * ppd), int(105 * ppd)))   # 50-115 E, 15 S-54 N
    c = c.resize((c.size[0] * 2, c.size[1] * 2), Image.LANCZOS)
    a = np.asarray(c).astype(np.float32) / 255
    sea = (a[..., 2] > a[..., 0] + 0.08) & (a[..., 2] > a[..., 1])          # the blue water
    deep = np.array([0.11, 0.25, 0.38])
    a[sea] = a[sea] * 0.45 + deep * 0.55
    land = ~sea
    grey = a[land].mean(axis=1, keepdims=True)
    a[land] = (a[land] * 0.8 + grey * 0.2) * 0.92                            # muted, a little darker
    # the edges fade into the map's backdrop (#16354d), so a wide frame never shows the image's box
    hgt, wid = a.shape[:2]
    fx = np.clip(np.minimum(np.arange(wid), wid - 1 - np.arange(wid)) / (0.12 * wid), 0, 1)
    fy = np.clip(np.minimum(np.arange(hgt), hgt - 1 - np.arange(hgt)) / (0.12 * hgt), 0, 1)
    fade = (np.outer(fy, fx) ** 0.8)[..., None]
    a = a * fade + np.array([0x16, 0x35, 0x4d]) / 255 * (1 - fade)
    out = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
    dst = Path(__file__).resolve().parents[1] / "remotion/public/maps/south-asia-relief.jpg"
    dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(dst, quality=86)
    print(dst, out.size, dst.stat().st_size // 1024, "KB")


if __name__ == "__main__" and len(sys.argv) > 2 and sys.argv[2] == "relief":
    relief(NE)
