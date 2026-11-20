"""python -m generator.media <search|fetch|edgar|cutout|credits|check|stage|list> --channel <slug> ..."""
from __future__ import annotations

import argparse
import json
import sys
import urllib.error

from . import __doc__ as DOC, library
from ..channels import use as channel
from .store import MediaError, cache_root, load_log, log_path


SEARCHABLE = ("pexels", "pixabay", "commons", "archive", "loc", "nasa")


def _print_cands(cands: list[dict]) -> None:
    for c in cands:
        size = f"{c.get('width') or '?'}x{c.get('height') or '?'}" + (f" {c['durationSec']}s" if c.get("durationSec") else "")
        print(f"{c['verdict'].upper():6} {c['ref']}  [{c['licence'] or '?'}]  {size}  {c['author'][:40]}  {c['title'][:60]}")


def main(argv: list[str] | None = None) -> int:
    for s in (sys.stdout, sys.stderr):   # a Windows console is cp1252; authors and titles are not
        if hasattr(s, "reconfigure"):
            s.reconfigure(errors="replace")
    ap = argparse.ArgumentParser(prog="generator.media", description=DOC.split("\n\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)

    def cmd(name: str, **kw):
        p = sub.add_parser(name, **kw)
        p.add_argument("--channel", help="the channel slug (else CHANNEL)")
        return p

    s = cmd("search", help="candidates with their licence verdicts")
    s.add_argument("query")
    s.add_argument("--kind", choices=("video", "photo"), default="video")
    s.add_argument("--source", action="append", choices=SEARCHABLE,
                   help="repeatable; default: every keyless source, plus Pexels/Pixabay when their keys are set")
    s.add_argument("--category", help="Commons category tree (e.g. 'Videos of industry', Factories; 'A|B' searches each; '=Name' "
                                      "without subcategories), archive.org collection (default prelinger), loc.gov "
                                      "collection slug, or NASA centre")
    s.add_argument("--limit", type=int, default=8)
    s.add_argument("--orientation", choices=("landscape", "portrait", "square"))
    f = cmd("fetch", help="download one asset into the cache and log its licence")
    f.add_argument("ref", help="<source>:<kind>:<id>, as search prints it")
    f.add_argument("--max-mb", type=int, default=library.MAX_MB)
    e = cmd("edgar", help="list a company's filings, or fetch one and render a page to PNG")
    e.add_argument("--cik", required=True, help="CIK, ticker or company name")
    e.add_argument("--form", default="10-K")
    e.add_argument("--year", type=int)
    e.add_argument("--accession", help="which filing (default: the first listed)")
    e.add_argument("--find", help="render the page containing this text")
    e.add_argument("--match", type=int, default=1, help="with --find: the Nth matching page (the contents page is skipped)")
    e.add_argument("--page", type=int, help="render this page (1-based)")
    e.add_argument("--list", action="store_true", help="only list the filings")
    r = cmd("report", help="fetch an official investigation report and render a page to PNG (generator/media/reports.py)")
    r.add_argument("url", help="the report PDF's URL on the agency's site")
    r.add_argument("--find", help="render the page containing this text")
    r.add_argument("--match", type=int, default=1, help="with --find: the Nth matching page")
    r.add_argument("--page", type=int, help="render this page (1-based)")
    r.add_argument("--title", help="the report's title for the credit (default: the file name)")
    c = cmd("credits", help="description credit lines for a video's assets")
    c.add_argument("target", help="video id or script.json")
    k = cmd("check", help="fail if a script uses an unlogged or disallowed asset")
    k.add_argument("target", help="script.json or video id")
    g = cmd("stage", help="copy a script's assets into remotion/public/media/<slug>/")
    g.add_argument("target", help="video id or script.json")
    u = cmd("cutout", help="cut a logged photo's subject out of its background (<id>-cut.png, for a depth layer)")
    u.add_argument("asset", help="the photo's asset id, as fetch printed it")
    u.add_argument("--model", default=library.CUT_MODEL, help="rembg model (isnet-general-use for hard cases)")
    cmd("list", help="the licence log")
    a = ap.parse_args(argv)
    try:
        slug = channel(a.channel)
        if a.cmd == "search":
            from .providers import PROVIDERS
            import os
            sources = a.source or [n for n in SEARCHABLE
                                   if not PROVIDERS[n].key_env or os.environ.get(PROVIDERS[n].key_env)]
            for src in sources:
                try:
                    _print_cands(library.search(slug, src, a.query, a.kind, a.limit, a.orientation, a.category))
                except MediaError as err:
                    print(err, file=sys.stderr)
                except urllib.error.URLError as err:
                    print(f"{src}: {getattr(err, 'code', '') or err.reason}", file=sys.stderr)
            if not a.source and not {"pexels", "pixabay"} <= set(sources):
                print("(Pexels/Pixabay skipped: set PEXELS_API_KEY / PIXABAY_API_KEY)", file=sys.stderr)
        elif a.cmd == "fetch":
            r = library.fetch(slug, a.ref, a.max_mb)
            print(json.dumps(r, indent=2, ensure_ascii=False))
            print(f"cached: {cache_root(slug) / r['path']}\nlogged: {log_path(slug)}", file=sys.stderr)
        elif a.cmd == "edgar":
            fl = library.edgar_find(slug, a.cik, a.form, a.year)
            if not fl:
                raise MediaError(f"no {a.form} filings for {a.cik}" + (f" in {a.year}" if a.year else ""))
            if a.list:
                for x in fl:
                    print(f"{x['ref']}  {x['title']}  {x['url']}")
                return 0
            pick = next((x for x in fl if x["accession"] == a.accession), None) if a.accession else fl[0]
            if not pick:
                raise MediaError(f"{a.accession}: not among the listed filings (try --list)")
            r = library.fetch_filing(slug, pick["id"], a.find, a.page, nth=a.match)
            print(json.dumps(r, indent=2, ensure_ascii=False))
            print(f"cached: {cache_root(slug) / r['path']}\nlogged: {log_path(slug)}", file=sys.stderr)
        elif a.cmd == "report":
            from .reports import fetch_report
            r = fetch_report(slug, a.url, a.find, a.page, a.match, a.title)
            print(json.dumps(r, indent=2, ensure_ascii=False))
            print(f"cached: {cache_root(slug) / r['path']}\nlogged: {log_path(slug)}", file=sys.stderr)
        elif a.cmd == "credits":
            script, vid = library.read_script(slug, a.target)
            print("\n".join(library.credit_lines(slug, script, vid)) or "(no media)")
        elif a.cmd == "check":
            script, vid = library.read_script(slug, a.target)
            probs = library.check(slug, script, vid)
            for p in probs:
                print(p)
            print(f"{len(library.script_assets(script, vid))} assets, {len(probs)} problems", file=sys.stderr)
            return 1 if probs else 0
        elif a.cmd == "cutout":
            r = library.cutout(slug, a.asset, a.model)
            print(f"media/{slug}/{r['id']}.png  ({r['width']}x{r['height']})  from {r['of']}")
            # what a thumbnail's ProductHero / PersonCutout needs (remotion/src/doc/thumb): the aspect and the subject's box
            from PIL import Image
            bb = Image.open(cache_root(slug) / r["path"]).getchannel("A").getbbox() or (0, 0, r["width"], r["height"])
            box = [round(bb[0] / r["width"], 3), round(bb[1] / r["height"], 3), round(bb[2] / r["width"], 3), round(bb[3] / r["height"], 3)]
            print(f"thumb: aspect={{{r['width']} / {r['height']}}} box={{{box}}}")
            print(f"cached: {cache_root(slug) / r['path']}\nlogged: {log_path(slug)}", file=sys.stderr)
        elif a.cmd == "stage":
            script, vid = library.read_script(slug, a.target)
            for p in library.stage(slug, script, vid):
                print(p)
        else:
            for aid, r in load_log(slug).items():
                lic = r.get("licence") or {}
                print(f"{aid}  {r['kind']}  {lic.get('name')} [{lic.get('verdict')}]  {r.get('author', '')[:40]}  {r.get('path')}")
    except MediaError as err:
        print(err, file=sys.stderr)
        return 1
    except urllib.error.HTTPError as err:
        print(f"{err.url}: HTTP {err.code} {err.reason}", file=sys.stderr)
        return 1
    except urllib.error.URLError as err:
        print(f"network error: {err.reason}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
