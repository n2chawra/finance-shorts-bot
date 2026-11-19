"""Fetch → cache → licence record; and the gates a script passes before a render (check, credits, stage)."""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

from . import STOCK_CHANNELS, licence
from .providers import get as provider
from .providers.edgar import Edgar, page_with, split_pages
from .store import (ROOT, MediaError, cache_root, download, licence_snapshot, load_log, now, probe, record, sha256,
                    stage_root)

PREFIXES = ("media:", "clip:", "doc:")
ID = re.compile(r"[^a-z0-9]+")
MAX_MB = 400


def asset_id(source: str, kind: str, ident: str) -> str:
    """A stable, file-safe id: pexels-video-856172, commons-photo-enron-complex-houston-1a2b3c4d, edgar-1024401-0001024401-01-500010."""
    import hashlib
    slug = ID.sub("-", ident.lower().removeprefix("file:")).strip("-")
    if source == "commons":
        slug = re.sub(r"-(jpe?g|png|webm|ogv|ogg|svg|tiff?|gif)$", "", slug)[:48].strip("-") + "-" + hashlib.sha1(ident.encode()).hexdigest()[:8]
        return f"commons-{kind}-{slug}"
    if source == "edgar":
        return f"edgar-{slug}"
    return f"{source}-{kind}-{slug}"


def allowed(slug: str, source: str) -> None:
    if source != "commons" and slug not in STOCK_CHANNELS:
        raise MediaError(f"{source}: only {', '.join(sorted(STOCK_CHANNELS))} may use sources beyond Wikimedia Commons "
                         f"(the owner's rule for every other channel: Commons only)")


def parse_ref(ref: str) -> tuple[str, str, str]:
    """`<source>:<kind>:<id>` (kind defaults to video for stock, photo for Commons; Commons ids are File: titles)."""
    source, _, rest = ref.partition(":")
    if not rest:
        raise MediaError(f"{ref!r}: use <source>:<kind>:<id>, e.g. pexels:video:856172 or commons:photo:File:Enron.jpg")
    kind, _, ident = rest.partition(":")
    if kind not in ("video", "photo", "document"):
        kind, ident = ("photo" if source == "commons" else "document" if source == "edgar" else "video"), rest
    return source, kind, ident


def search(slug: str, source: str, query: str, kind: str, n: int = 10, orientation: str | None = None,
           category: str | None = None) -> list[dict]:
    """`category` narrows a source that has them: a Commons category tree, an archive.org collection, a loc.gov
    collection slug, a NASA centre."""
    allowed(slug, source)
    p = provider(source)
    p.slug = slug
    out = []
    for c in p.search(query, kind, n, orientation, **({"category": category} if category else {})):
        verdict, reason = licence.classify(c["source"], c["licence"], c.get("flags"))
        out.append({**c, "verdict": verdict, "reason": reason})
    return out


def _build(slug: str, c: dict, path: Path, extra: dict | None = None) -> dict:
    verdict, reason = licence.classify(c["source"], c["licence"], c.get("flags"))
    required, credit = licence.attribution(c["source"], c["licence"], c["author"], c["title"], c["page"], c["kind"])
    restrictions = licence.restrictions(c["source"], " | ".join(c.get("flags") or []))
    hdr = provider(c["source"]).headers() if c["source"] in ("edgar", "commons", "archive", "loc", "nasa") else {"User-Agent": "Mozilla/5.0 (licence snapshot)"}
    lic_url = c.get("licenceUrl") or licence.LICENCE_URLS.get(c["source"], "")
    rec = {
        "id": asset_id(c["source"], c["kind"], c["id"]), "ref": c["ref"], "source": c["source"], "sourceId": c["id"],
        "kind": c["kind"], "title": c["title"], "sourceUrl": c["page"], "downloadUrl": c["url"],
        "author": c["author"], "authorUrl": c.get("authorUrl", ""),
        "licence": {"name": c["licence"], "id": licence.normalise(c["source"], c["licence"]), "url": lic_url,
                    "asOf": now()[:10], "snapshotSha256": licence_snapshot(lic_url, hdr) if lic_url.startswith("http") else None,
                    "verdict": verdict, "reason": reason},
        "attribution": {"required": required, "text": credit},
        "restrictions": restrictions, "sourceFlags": list(c.get("flags") or []),
        "sha256": sha256(path), "path": path.relative_to(cache_root(slug)).as_posix(), "fetchedAt": now(),
        **probe(path, c["kind"]),
    }
    if c.get("durationSec") and not rec.get("durationSec"):
        rec["durationSec"] = c["durationSec"]
    return {**rec, **(extra or {})}


def fetch(slug: str, ref: str, max_mb: int = MAX_MB, root: Path = ROOT) -> dict:
    """Download one asset into the cache and log its licence; a refused licence is never downloaded."""
    source, kind, ident = parse_ref(ref)
    allowed(slug, source)
    if source == "edgar":
        return fetch_filing(slug, ident, root=root)
    p = provider(source)
    p.slug = slug
    p.max_mb = max_mb
    c = p.resolve(kind, ident)
    verdict, reason = licence.classify(c["source"], c["licence"], c.get("flags"))
    if verdict == licence.NO:
        raise MediaError(f"{c['ref']}: refused: {reason}")
    if not c.get("url"):
        raise MediaError(f"{c['ref']}: no downloadable file")
    aid = asset_id(source, c["kind"], c["id"])
    dest = cache_root(slug) / source / f"{aid}.{c['ext']}"
    headers = p.headers() if source != "pexels" else {"User-Agent": p.headers()["User-Agent"]}   # never send the key to the CDN
    download(c["url"], dest, headers, source + "-files", getattr(p, "file_interval", p.interval), max_mb << 20)
    return record(slug, _build(slug, c, dest), root)


# ---- EDGAR ---------------------------------------------------------------------------------------------

def browser() -> str | None:
    import glob
    import os
    # the cloud routine image has no Chrome on PATH, only Playwright's headless shell (the one Remotion renders with)
    shells = sorted(glob.glob("/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell")
                    + glob.glob("/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell"))
    for cand in (os.environ.get("BROWSER_PATH"), os.environ.get("REMOTION_BROWSER_EXECUTABLE"),
                 r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                 r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
                 shutil.which("chromium"), shutil.which("google-chrome"), shutil.which("chrome"), shutil.which("msedge"), *shells):
        if cand and Path(cand).is_file():
            return cand
    return None


PAGE_CSS = ("<style>html,body{background:#fff;margin:0}body{width:1100px;padding:60px 80px;box-sizing:border-box;"
            "font-family:'Times New Roman',serif;font-size:17px;color:#111}pre{white-space:pre-wrap;font-size:15px}"
            "table{max-width:100%}</style>")


def render_page(fragment: str, out: Path, base_url: str, plain: bool = False) -> Path:
    """One filing page as a PNG (headless Chrome/Edge), trimmed to the text with a margin."""
    exe = browser()
    if not exe:
        raise MediaError("rendering a filing page needs Chrome or Edge (or set BROWSER_PATH); the HTML is saved either way")
    import html as _html
    body = f"<pre>{_html.escape(re.sub(r'<[^>]+>', '', fragment))}</pre>" if plain else fragment
    with tempfile.TemporaryDirectory() as tmp:
        f = Path(tmp) / "page.html"
        f.write_text(f"<!doctype html><html><head><meta charset='utf-8'><base href='{base_url}/'>{PAGE_CSS}</head>"
                     f"<body>{body}</body></html>", encoding="utf-8")
        shot = Path(tmp) / "shot.png"
        # a headless shell is headless already and runs as root in the cloud (needs --no-sandbox)
        flags = ["--no-sandbox"] if "headless" in Path(exe).name else ["--headless=new"]
        subprocess.run([exe, *flags, "--disable-gpu", "--hide-scrollbars", f"--user-data-dir={Path(tmp) / 'profile'}",
                        "--window-size=1100,2400", "--force-device-scale-factor=2", "--virtual-time-budget=4000", f"--screenshot={shot}", f.as_uri()],
                       capture_output=True, timeout=120)
        if not shot.is_file():
            raise MediaError("the browser did not write a screenshot of the filing page")
        from PIL import Image, ImageChops
        im = Image.open(shot).convert("RGB")
        box = ImageChops.difference(im, Image.new("RGB", im.size, (255, 255, 255))).getbbox()
        if box:
            m = 80
            im = im.crop((max(0, box[0] - m), max(0, box[1] - m), min(im.width, box[2] + m), min(im.height, box[3] + m)))
        out.parent.mkdir(parents=True, exist_ok=True)
        im.save(out, optimize=True)
    return out


def edgar_find(slug: str, company: str, form: str = "10-K", year: int | None = None) -> list[dict]:
    allowed(slug, "edgar")
    e = Edgar()
    e.slug = slug
    cik, _ = e.cik(company)
    return e.filings(cik, form, year)


def fetch_filing(slug: str, ident: str, find: str | None = None, page: int | None = None, render: bool = True,
                 root: Path = ROOT, nth: int = 1) -> dict:
    """Save a filing's main document (HTML/TXT) and, with `find` or `page`, that page as a PNG document prop.
    Returns the page's record when one was rendered, else the document's."""
    allowed(slug, "edgar")
    e = Edgar()
    e.slug = slug
    c = e.resolve("document", ident)
    aid = asset_id("edgar", "document", c["id"])
    dest = cache_root(slug) / "edgar" / f"{aid}.{c['ext']}"
    if not dest.is_file():
        download(c["url"], dest, e.headers(), "edgar", e.interval, MAX_MB << 20)
    meta = {"form": c["form"], "filed": c["filed"], "period": c["period"], "cik": c["cik"], "accession": c["accession"],
            "company": c["company"], "citation": f"Source: SEC EDGAR, Form {c['form']}, filed {c['filed']}"}
    doc = record(slug, _build(slug, c, dest, meta), root)
    if find is None and page is None:
        return doc
    text = dest.read_text(encoding="utf-8", errors="replace")
    pages = split_pages(text)
    i = page - 1 if page else page_with(pages, find or "", nth)
    if not 0 <= i < len(pages):
        raise MediaError(f"{c['title']}: " + (f"no page contains {find!r}" if find else f"has {len(pages)} pages") +
                         f" (the document is saved: {dest})")
    png = cache_root(slug) / "edgar" / f"{aid}-p{i + 1:03d}.png"
    if render:
        render_page(pages[i], png, c["url"].rsplit("/", 1)[0], plain=c["ext"] == "txt")
    pc = {**c, "id": f"{c['id']}-p{i + 1:03d}", "ref": f"{c['ref']}#p{i + 1}", "title": f"{c['title']}, page {i + 1} of {len(pages)}"}
    return record(slug, _build(slug, pc, png, {**meta, "page": i + 1, "pages": len(pages), "find": find, "of": doc["id"]}), root)


# ---- what a script uses ----------------------------------------------------------------------------------

def used(node) -> set[str]:
    """Every `media:<id>` (or `clip:` / `doc:`) a script, timeline or code file names."""
    out: set[str] = set()
    if isinstance(node, str):
        for p in PREFIXES:
            if node.startswith(p):
                out.add(node[len(p):].strip())
    elif isinstance(node, dict):
        for v in node.values():
            out |= used(v)
    elif isinstance(node, list):
        for v in node:
            out |= used(v)
    return out


# a staged file a doc beat names directly: media/<slug>/<asset id>.<ext> (what `stage` writes)
SRC = re.compile(r"^media/([a-z0-9][a-z0-9-]*)/([a-z0-9][a-z0-9-]*)\.(?:mp4|webm|mov|jpe?g|png|webp)$")


def src_paths(node) -> set[tuple[str, str]]:
    """Every (channel slug, asset id) a script names as a staged path under media/ (a doc layer's `src`)."""
    out: set[tuple[str, str]] = set()
    if isinstance(node, str):
        if m := SRC.match(node):
            out.add((m.group(1), m.group(2)))
    elif isinstance(node, dict):
        for v in node.values():
            out |= src_paths(v)
    elif isinstance(node, list):
        for v in node:
            out |= src_paths(v)
    return out


def own_code_media(vid: str, root: Path = ROOT) -> set[str]:
    d = root / "remotion" / "src" / "videos" / vid
    names: set[str] = set()
    for f in d.glob("*.tsx") if d.is_dir() else []:
        names |= set(re.findall(r"""["'](?:media|clip|doc):([a-z0-9][a-z0-9-]*)["']""", f.read_text(encoding="utf-8")))
    return names


def script_assets(script: dict, vid: str | None = None, root: Path = ROOT) -> set[str]:
    return used(script) | {aid for _, aid in src_paths(script)} | (own_code_media(vid, root) if vid else set())


def check(slug: str, script: dict, vid: str | None = None, root: Path = ROOT, files: bool = True) -> list[str]:
    """Problems that stop a render: an asset not in the licence log, a licence the channel can't use,
    an unreviewed asset, or a file missing from the cache."""
    log = load_log(slug, root)
    out = [f"media/{other}/{aid}: staged for the channel {other}, not {slug} (use media/{slug}/<asset id>.<ext>)"
           for other, aid in sorted(src_paths(script)) if other != slug]
    for aid in sorted(script_assets(script, vid, root)):
        r = log.get(aid)
        if not r:
            out.append(f"media:{aid} is not in channels/{slug}/media/licences.json: fetch it with python -m generator.media fetch "
                       f"--channel {slug} <source>:<kind>:<id> (or search first)")
            continue
        lic = r.get("licence") or {}
        verdict, reason = licence.classify(r.get("source", ""), lic.get("name", ""), r.get("sourceFlags"))
        if verdict == licence.NO:
            out.append(f"media:{aid}: {reason}")
        elif verdict == licence.REVIEW and not r.get("ownerOk"):
            out.append(f"media:{aid}: needs the owner's OK ({reason}); record it as \"ownerOk\" on the asset")
        elif r.get("source") != "commons" and slug not in STOCK_CHANNELS:
            out.append(f"media:{aid}: {r.get('source')} is not allowed on this channel (Commons only)")
        elif files and not (cache_root(slug) / r.get("path", "")).is_file():
            out.append(f"media:{aid}: {cache_root(slug) / r.get('path', '')} is missing; fetch it again ({r.get('ref')})")
    return out


def credit_lines(slug: str, script: dict, vid: str | None = None, root: Path = ROOT) -> list[str]:
    """The description's credits for the assets a script uses (required and courtesy), plus each source's own line."""
    log = load_log(slug, root)
    recs = [log[a] for a in sorted(script_assets(script, vid, root)) if a in log]
    lines = []
    for r in recs:
        if r.get("of") and r["of"] in {x["id"] for x in recs}:
            continue
        t = (r.get("attribution") or {}).get("text")
        if r.get("source") == "edgar" and r.get("of"):
            t = re.sub(r", page \d+ of \d+", "", t or "")
        if t and t not in lines:
            lines.append(t)
    sources = {r.get("source") for r in recs}
    if "pexels" in sources:
        lines.append("Stock footage and photos provided by Pexels (https://www.pexels.com)")
    if "pixabay" in sources:
        lines.append("Stock footage and photos from Pixabay (https://pixabay.com)")
    return lines


def with_credits(slug: str, description: str, script: dict, vid: str | None = None, root: Path = ROOT) -> str:
    lines = [ln for ln in credit_lines(slug, script, vid, root) if ln not in description]
    return description.rstrip() + ("\n\n" + "\n".join(lines) if lines else "")


def stage(slug: str, script: dict, vid: str | None = None, root: Path = ROOT) -> list[Path]:
    """Copy the script's assets into remotion/public/media/<slug>/<id>.<ext> for a render (after `check` passes)."""
    probs = check(slug, script, vid, root)
    if probs:
        raise MediaError("\n".join(probs))
    log = load_log(slug, root)
    dest = stage_root(slug, root)
    dest.mkdir(parents=True, exist_ok=True)
    out = []
    for aid in sorted(script_assets(script, vid, root)):
        src = cache_root(slug) / log[aid]["path"]
        to = dest / f"{aid}{src.suffix}"
        if not to.is_file() or to.stat().st_size != src.stat().st_size:
            shutil.copy2(src, to)
        out.append(to)
    return out


def read_script(slug: str, target: str, root: Path = ROOT) -> tuple[dict, str | None]:
    """A script from a path, or a video id in the channel's videos folder."""
    p = Path(target)
    if p.suffix == ".json" and p.is_file():
        return json.loads(p.read_text(encoding="utf-8")), (p.parent.name if p.name == "script.json" else None)
    from ..channels import cpath
    s = cpath(root, "videos", slug) / target / "script.json"
    if not s.is_file():
        raise MediaError(f"{target}: no such script ({s})")
    return json.loads(s.read_text(encoding="utf-8")), target
