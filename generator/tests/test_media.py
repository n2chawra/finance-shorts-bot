"""Licensed media (generator/media): licences classified, every asset logged, scripts checked. No network."""
import json

import pytest

from generator.media import library, licence, store
from generator.media.providers import base, edgar, pixabay

DOC = "business-documentaries-rise-and-fall-of"


@pytest.fixture
def repo(tmp_path, monkeypatch):
    monkeypatch.setenv("MEDIA_CACHE", str(tmp_path / "cache"))
    (tmp_path / "channels" / DOC).mkdir(parents=True)
    return tmp_path


def test_licence_classifier():
    assert licence.classify("pexels", "Pexels License")[0] == licence.OK
    assert licence.classify("pixabay", "Pixabay Content License")[0] == licence.OK
    assert licence.classify("edgar", "SEC filing (public record)")[0] == licence.OK
    for ok in ("CC BY-SA 4.0", "CC BY 2.0", "CC0", "Public domain"):
        assert licence.classify("commons", ok)[0] == licence.OK, ok
    for bad in ("CC BY-NC 2.0", "CC BY-ND 3.0", "Fair use", "All rights reserved", ""):
        assert licence.classify("commons", bad)[0] == licence.NO, bad
    assert licence.classify("videvo", "Editorial use only")[0] == licence.NO
    assert licence.classify("mixkit", "Mixkit Restricted License")[0] == licence.NO
    assert licence.classify("coverr", "Coverr License")[0] == licence.REVIEW          # no rule yet: the owner decides
    assert licence.classify("pexels", "Something else")[0] == licence.REVIEW
    assert licence.normalise("commons", "CC BY-SA 3.0") == "cc-by-sa-3.0"
    assert licence.normalise("commons", "Public domain") == "pd"
    assert licence.attribution("commons", "CC BY 2.0", "Alex", "t", "u", "photo")[0] is True
    assert licence.attribution("commons", "Public domain", "Alex", "t", "u", "photo")[0] is False
    assert licence.attribution("pexels", "Pexels License", "Ann", "t", "u", "video") == (False, "Video by Ann on Pexels (u)")
    assert any("trademark" in r for r in licence.restrictions("commons", "trademarked"))
    assert any("trademark" in r for r in licence.restrictions("pixabay"))


def _cand(**over):
    return {"ref": "pexels:video:42", "source": "pexels", "kind": "video", "id": "42", "title": "trading floor",
            "author": "Ann", "authorUrl": "", "page": "https://www.pexels.com/video/42/", "url": "https://cdn/42.mp4",
            "ext": "mp4", "licence": "Pexels License", "licenceUrl": "https://www.pexels.com/license/", "flags": [], **over}


class FakePexels(base.Provider):
    name = "pexels"
    interval = 0

    def headers(self):
        return {"User-Agent": "test"}

    def resolve(self, kind, ident):
        return _cand(id=ident, ref=f"pexels:{kind}:{ident}")


def _offline(monkeypatch, provider=FakePexels):
    monkeypatch.setattr(library, "provider", lambda name: provider())
    monkeypatch.setattr(library, "licence_snapshot", lambda url, headers: "f" * 64)

    def fake_download(url, dest, headers, bucket, interval, max_bytes=None, attempts=6):
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(b"clip bytes " + url.encode())
        return dest
    monkeypatch.setattr(library, "download", fake_download)


def test_fetch_logs_the_licence_and_the_log_round_trips(repo, monkeypatch):
    _offline(monkeypatch)
    rec = library.fetch(DOC, "pexels:video:42", root=repo)
    assert rec["id"] == "pexels-video-42"
    log = json.loads(store.log_path(DOC, repo).read_text(encoding="utf-8"))
    assert log == store.load_log(DOC, repo) and log["pexels-video-42"] == rec
    for k in ("source", "sourceUrl", "author", "sha256", "path", "kind", "bytes", "restrictions", "fetchedAt"):
        assert rec[k], k
    assert rec["licence"]["name"] == "Pexels License" and rec["licence"]["asOf"] and rec["licence"]["verdict"] == "ok"
    assert rec["attribution"] == {"required": False, "text": "Video by Ann on Pexels (https://www.pexels.com/video/42/)"}
    assert (store.cache_root(DOC) / rec["path"]).is_file()
    assert not str(store.cache_root(DOC)).startswith(str(repo / "channels"))     # media never sits in the repo
    store.save_log(DOC, store.load_log(DOC, repo), repo)
    assert store.load_log(DOC, repo) == log


def test_check_refuses_unlogged_or_disallowed_assets_and_credits_the_rest(repo, monkeypatch):
    _offline(monkeypatch)
    library.fetch(DOC, "pexels:video:42", root=repo)
    script = {"beats": [{"id": "a", "params": {"bg": "clip:pexels-video-42"}},
                        {"id": "b", "params": {"bg": "media:pixabay-video-9"}}]}
    probs = library.check(DOC, script, root=repo)
    assert len(probs) == 1 and "media:pixabay-video-9 is not in" in probs[0]
    log = store.load_log(DOC, repo)
    log["pexels-video-42"]["licence"]["name"] = "Editorial use only"
    store.save_log(DOC, log, repo)
    assert any("pexels-video-42" in p and "editorial" in p for p in library.check(DOC, {"beats": [{"x": "clip:pexels-video-42"}]}, root=repo))
    log["pexels-video-42"]["licence"]["name"] = "Pexels License"
    store.save_log(DOC, log, repo)
    ok = {"beats": [{"x": "clip:pexels-video-42"}]}
    assert library.check(DOC, ok, root=repo) == []
    assert library.credit_lines(DOC, ok, root=repo)[-1].startswith("Stock footage and photos provided by Pexels")
    desc = library.with_credits(DOC, "Story.", ok, root=repo)
    assert library.with_credits(DOC, desc, ok, root=repo) == desc                 # credited once
    staged = library.stage(DOC, ok, root=repo)
    assert staged[0] == repo / "remotion" / "public" / "media" / DOC / "pexels-video-42.mp4" and staged[0].is_file()
    (store.cache_root(DOC) / store.load_log(DOC, repo)["pexels-video-42"]["path"]).unlink()
    assert "missing" in library.check(DOC, ok, root=repo)[0]


def test_stock_sources_only_on_the_documentary_channel(repo, monkeypatch):
    _offline(monkeypatch)
    with pytest.raises(store.MediaError, match="Commons only"):
        library.fetch("first-channel", "pexels:video:42", root=repo)


def test_refused_licence_is_never_downloaded(repo, monkeypatch):
    class NC(FakePexels):
        name = "commons"

        def resolve(self, kind, ident):
            return _cand(source="commons", ref="commons:photo:File:X.jpg", id="File:X.jpg", licence="CC BY-NC 2.0", ext="jpg")
    _offline(monkeypatch, NC)
    with pytest.raises(store.MediaError, match="refused"):
        library.fetch(DOC, "commons:photo:File:X.jpg", root=repo)
    assert store.load_log(DOC, repo) == {}


def test_missing_keys_give_a_clear_message(monkeypatch):
    monkeypatch.delenv("PEXELS_API_KEY", raising=False)
    monkeypatch.delenv("SEC_USER_AGENT", raising=False)
    from generator.media.providers.pexels import Pexels
    with pytest.raises(store.MediaError, match="PEXELS_API_KEY"):
        Pexels().search("office")
    with pytest.raises(store.MediaError, match="SEC_USER_AGENT"):
        edgar.Edgar().headers()


def test_pixabay_responses_are_cached_a_day_without_the_key(tmp_path, monkeypatch):
    monkeypatch.setenv("MEDIA_CACHE", str(tmp_path))
    monkeypatch.setenv("PIXABAY_API_KEY", "secret-key")
    calls = []

    class Resp:
        def __init__(self, body): self.body = body
        def read(self, *a): return self.body
        def __enter__(self): return self
        def __exit__(self, *a): return False

    def fake_open(url, headers, bucket, interval, timeout=60, attempts=6):
        calls.append(url)
        return Resp(json.dumps({"hits": [{"id": 7, "pageURL": "https://pixabay.com/videos/x-7/", "tags": "office", "user": "bob",
                                          "user_id": 1, "duration": 12, "videos": {"large": {"url": "https://cdn/7.mp4", "width": 1920, "height": 1080}}}]}).encode())
    monkeypatch.setattr(store, "open_url", fake_open)
    p = pixabay.Pixabay()
    p.slug = DOC
    a = p.search("office", "video", 3)
    b = p.search("office", "video", 3)
    assert a == b and len(calls) == 1 and a[0]["ref"] == "pixabay:video:7" and a[0]["url"] == "https://cdn/7.mp4"
    for f in (tmp_path / DOC / "_http").rglob("*.json"):
        assert "secret-key" not in f.name and "secret-key" not in f.read_text()


def test_filing_pages_split_and_found():
    doc = ("<p>TABLE OF CONTENTS Item 6 Selected Financial Data</p><hr style='page-break-after:always'>"
           "<p>Business</p><div style=\"page-break-before: always\"></div><p>ITEM 6. SELECTED&nbsp;FINANCIAL DATA</p>")
    pages = edgar.split_pages(doc)
    assert len(pages) == 3
    assert edgar.page_with(pages, "selected financial data") == 2      # the contents page is passed over
    assert edgar.page_with(pages, "nowhere") == -1
    assert library.parse_ref("commons:photo:File:A b.jpg") == ("commons", "photo", "File:A b.jpg")
    assert library.parse_ref("pexels:42") == ("pexels", "video", "42")
    assert library.asset_id("edgar", "document", "806085/0001104659-08-005476") == "edgar-806085-0001104659-08-005476"


# ---- keyless sources: Internet Archive, Library of Congress, NASA; Commons categories ---------------------

class _Resp:
    def __init__(self, body): self.body = json.dumps(body).encode()
    def read(self, *a): return self.body
    def __enter__(self): return self
    def __exit__(self, *a): return False


def _serve(monkeypatch, routes: dict, calls: list | None = None):
    """Answer store.open_url from {url substring: json body}; record each URL asked for."""
    def fake_open(url, headers, bucket, interval, timeout=60, attempts=6):
        if calls is not None:
            calls.append(url)
        for k, v in routes.items():
            if k in url:
                return _Resp(v)
        raise AssertionError(f"unexpected URL {url}")
    monkeypatch.setattr(store, "open_url", fake_open)


def _fake_download(log: list | None = None):
    def fake(url, dest, headers, bucket, interval, max_bytes=None, attempts=6):
        if log is not None:
            log.append((url, max_bytes))
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(b"bytes")
        return dest
    return fake


ARCHIVE_META = {
    "metadata": {"identifier": "SuperMkt1955", "title": "Supermarket Story", "creator": "Jam Handy", "year": "1955",
                 "mediatype": "movies", "collection": ["prelinger", "movies"], "sound": "sound",
                 "licenseurl": "http://creativecommons.org/publicdomain/mark/1.0/"},
    "files": [{"name": "SuperMkt1955.mpeg", "format": "MPEG2", "size": "900000000", "width": "640", "height": "480"},
              {"name": "SuperMkt1955.mp4", "format": "MPEG4", "size": "700000000", "width": "640", "height": "480", "length": "612.4"},
              {"name": "SuperMkt1955_512kb.mp4", "format": "512Kb MPEG4", "size": "60000000", "width": "320", "height": "240", "length": "612.4"},
              {"name": "SuperMkt1955.h264.mp4", "format": "h.264", "size": "150000000", "width": "640", "height": "480", "length": "612.4"}]}


def test_archive_licences_and_mp4_choice():
    from generator.media.providers import archive
    assert archive.licence_name("http://creativecommons.org/publicdomain/mark/1.0/", None) == "Public Domain Mark 1.0"
    assert archive.licence_name("https://creativecommons.org/licenses/by/4.0/", None) == "CC BY 4.0"
    assert archive.licence_name("http://creativecommons.org/licenses/by-nc/3.0/", None) == "CC BY-NC 3.0"
    assert archive.licence_name("http://creativecommons.org/licenses/publicdomain/", None).startswith("Public domain")
    assert archive.licence_name(None, None) == ""
    for name, want in (("Public Domain Mark 1.0", licence.OK), ("CC0 1.0", licence.OK), ("CC BY 4.0", licence.OK),
                       ("CC BY-SA 4.0", licence.REVIEW), ("", licence.REVIEW), ("CC BY-NC 3.0", licence.NO),
                       ("CC BY-ND 4.0", licence.NO), ("All rights reserved", licence.NO)):
        assert licence.classify("archive", name)[0] == want, name
    assert any(r.startswith("mute") for r in licence.restrictions("archive"))
    # the largest frame under the cap, h.264 before the MPEG4 original at the same size; else the smallest MP4
    assert archive.best_mp4(ARCHIVE_META["files"], 400 << 20)["name"] == "SuperMkt1955.h264.mp4"
    assert archive.best_mp4(ARCHIVE_META["files"], 100 << 20)["name"] == "SuperMkt1955_512kb.mp4"
    assert archive.best_mp4(ARCHIVE_META["files"], 10 << 20)["name"] == "SuperMkt1955_512kb.mp4"
    assert archive.best_mp4([{"name": "x.mpeg", "format": "MPEG2"}], 1 << 30) is None


def test_archive_search_and_fetch_log_a_muted_public_domain_clip(repo, monkeypatch):
    calls: list[str] = []
    _serve(monkeypatch, {"advancedsearch.php": {"response": {"docs": [
        {"identifier": "SuperMkt1955", "title": "Supermarket Story", "year": 1955, "creator": "Jam Handy",
         "licenseurl": "http://creativecommons.org/publicdomain/mark/1.0/", "collection": ["prelinger"]},
        {"identifier": "Unmarked1950", "title": "Office Film", "collection": "prelinger"}]}},
        "/metadata/SuperMkt1955": ARCHIVE_META}, calls)
    monkeypatch.setattr(library, "licence_snapshot", lambda url, headers: "a" * 64)
    downloads: list = []
    monkeypatch.setattr(library, "download", _fake_download(downloads))
    found = library.search(DOC, "archive", "supermarket", "video", 5)
    assert [c["verdict"] for c in found] == ["ok", "review"] and found[0]["ref"] == "archive:video:SuperMkt1955"
    assert "collection%3A%28prelinger%29" in calls[0] and "mediatype%3Amovies" in calls[0]
    assert library.search(DOC, "archive", "supermarket", "photo") == []
    library.search(DOC, "archive", "bank", "video", 5, category="prelinger|fedflix")
    assert "prelinger+OR+fedflix" in calls[-1]
    rec = library.fetch(DOC, "archive:video:SuperMkt1955", max_mb=400, root=repo)
    assert rec["id"] == "archive-video-supermkt1955" and rec["licence"]["verdict"] == "ok"
    assert rec["licence"]["name"] == "Public Domain Mark 1.0" and rec["licence"]["id"] == "pd"
    assert rec["restrictions"][0].startswith("mute: soundtrack may be copyrighted")
    assert downloads == [("https://archive.org/download/SuperMkt1955/SuperMkt1955.h264.mp4", 400 << 20)]
    assert rec["sourceUrl"] == "https://archive.org/details/SuperMkt1955" and rec["durationSec"] == 612.4
    assert rec["attribution"]["required"] is False and "Internet Archive" in rec["attribution"]["text"]
    assert library.check(DOC, {"beats": [{"bg": "clip:archive-video-supermkt1955"}]}, root=repo) == []
    with pytest.raises(store.MediaError, match="Commons only"):
        library.fetch("first-channel", "archive:video:SuperMkt1955", root=repo)


LOC_ITEM = {"item": {"title": "Interior of general store", "date": "1939", "contributor_names": ["Lee, Russell"],
                     "rights_advisory": ["No known restrictions on publication."],
                     "partof": ["farm security administration/office of war information black-and-white negatives"]},
            "resources": [{"files": [[{"mimetype": "image/jpeg", "url": "https://tile.loc.gov/x/a_150px.jpg", "width": 150, "height": 100},
                                      {"mimetype": "image/jpeg", "url": "https://tile.loc.gov/x/a_v.jpg", "width": 1024, "height": 800},
                                      {"mimetype": "image/tiff", "url": "https://tile.loc.gov/x/a_u.tif", "width": 5000, "height": 4000}]]}]}


def test_loc_rights_and_fetch(repo, monkeypatch):
    from generator.media.providers import loc
    assert licence.classify("loc", "No known restrictions on publication.")[0] == licence.OK
    assert licence.classify("loc", "No known restrictions on publication. Publicity and privacy rights may apply.")[0] == licence.REVIEW
    assert licence.classify("loc", "Rights status not evaluated.")[0] == licence.REVIEW
    assert licence.classify("loc", "")[0] == licence.REVIEW
    assert licence.normalise("loc", "No known restrictions on publication.") == "no-known-restrictions"
    assert loc._item_id("http://www.loc.gov/item/2017762891/") == "2017762891"
    assert loc.best_file(LOC_ITEM["resources"], "photo")["url"].endswith("a_v.jpg")
    calls: list[str] = []
    _serve(monkeypatch, {"/photos/?": {"results": [{"id": "http://www.loc.gov/item/2017762891/", "title": "Interior of general store",
                                                    "rights_advisory": "No known restrictions on publication.", "image_url": ["https://t/1.jpg"]},
                                                   {"id": "http://www.loc.gov/item/99/", "title": "Locked", "access_restricted": True}]},
                         "/item/2017762891/?fo=json": LOC_ITEM}, calls)
    monkeypatch.setattr(library, "licence_snapshot", lambda url, headers: None)
    monkeypatch.setattr(library, "download", _fake_download())
    found = library.search(DOC, "loc", "general store", "photo", 5)
    assert [c["ref"] for c in found] == ["loc:photo:2017762891"] and found[0]["verdict"] == "ok"
    assert "fo=json" in calls[0] and loc.Loc.interval >= 3.0                     # 20 requests a minute
    rec = library.fetch(DOC, "loc:photo:2017762891", root=repo)
    assert rec["id"] == "loc-photo-2017762891" and rec["downloadUrl"] == "https://tile.loc.gov/x/a_v.jpg"
    assert rec["author"] == "Lee, Russell" and rec["licence"]["verdict"] == "ok"
    assert "Library of Congress" in rec["attribution"]["text"] and rec["attribution"]["required"] is False


def test_loc_bot_challenge_and_rate_limit_are_clear_errors(tmp_path, monkeypatch):
    import urllib.error
    from email.message import Message
    from generator.media.providers import loc
    monkeypatch.setenv("MEDIA_CACHE", str(tmp_path))

    def blocked(code):
        def fake_open(url, headers, bucket, interval, timeout=60, attempts=6):
            h = Message()
            h["cf-mitigated"] = "challenge"
            raise urllib.error.HTTPError(url, code, "x", h, None)
        return fake_open
    monkeypatch.setattr(store, "open_url", blocked(403))
    with pytest.raises(store.MediaError, match="never solve the challenge"):
        loc.Loc().search("store")
    monkeypatch.setattr(store, "open_url", blocked(429))
    with pytest.raises(store.MediaError, match="429"):
        loc.Loc().search("store")


def test_nasa_public_domain_unless_someone_else_made_it(tmp_path, monkeypatch):
    from generator.media.providers import nasa
    monkeypatch.setenv("MEDIA_CACHE", str(tmp_path))
    item = {"nasa_id": "MAF_1967", "title": "Saturn V boosters", "date_created": "1967-10-05T00:00:00Z", "center": "MAF",
            "photographer": "NASA", "media_type": "image", "description": "Boosters in production."}
    _serve(monkeypatch, {"/search?": {"collection": {"items": [{"data": [item]}]}},
                         "/asset/MAF_1967": {"collection": {"items": [{"href": "http://images-assets.nasa.gov/image/MAF_1967/MAF_1967~orig.jpg"},
                                                                      {"href": "http://images-assets.nasa.gov/image/MAF_1967/MAF_1967~large.jpg"}]}}})
    c = nasa.Nasa().resolve("photo", "MAF_1967")
    assert c["url"] == "https://images-assets.nasa.gov/image/MAF_1967/MAF_1967~large.jpg" and c["flags"] == []
    assert licence.classify("nasa", c["licence"], c["flags"])[0] == licence.OK
    assert nasa.third_party({"photographer": "Bill Ingalls / AP Photo"})
    assert licence.classify("nasa", c["licence"], nasa.third_party({"description": "(c) Getty Images, copyright"}))[0] == licence.REVIEW
    assert nasa.third_party({"photographer": "NASA/JPL-Caltech"}) == []


def test_commons_category_filter(monkeypatch):
    from generator.media.providers import commons
    assert commons.category_filter(None) == ""
    assert commons.category_filter("Factories") == ' deepcat:"Factories"'
    assert commons.category_filter("Category:=Supermarkets") == ' incategory:"Supermarkets"'
    asked = []

    def page(title, i):
        return {"title": title, "index": i, "imageinfo": [{}]}
    pages = {"Factories": [page("File:A.webm", 1), page("File:B.webm", 2)], "Videos of industry": [page("File:B.webm", 1), page("File:C.webm", 2)]}

    def fake_get(params):
        asked.append(params["gsrsearch"])
        cat = params["gsrsearch"].split('deepcat:"')[1].rstrip('"')
        return {"query": {"pages": {str(i): p for i, p in enumerate(pages[cat])}}}
    monkeypatch.setattr(commons.images, "_get", fake_get)
    monkeypatch.setattr(commons.Commons, "_cand", lambda self, p: {"ref": "commons:video:" + p["title"]})
    got = commons.Commons().search("assembly line", "video", 5, category="Factories|Videos of industry")
    assert asked == ['assembly line filetype:video deepcat:"Factories"', 'assembly line filetype:video deepcat:"Videos of industry"']
    assert [g["ref"][14:] for g in got] == ["File:A.webm", "File:B.webm", "File:C.webm"]       # interleaved, no repeats


def test_a_staged_src_path_counts_as_the_asset_and_must_be_this_channels(repo, monkeypatch):
    _offline(monkeypatch)
    library.fetch(DOC, "pexels:video:42", root=repo)
    ok = {"beats": [{"params": {"layers": [{"kind": "footage", "src": f"media/{DOC}/pexels-video-42.mp4"}]}}]}
    assert library.script_assets(ok) == {"pexels-video-42"}
    assert library.check(DOC, ok, root=repo) == []
    assert library.credit_lines(DOC, ok, root=repo)
    other = {"beats": [{"params": {"layers": [{"kind": "footage", "src": "media/first-channel/pexels-video-42.mp4"}]}}]}
    assert any("staged for the channel first-channel" in p for p in library.check(DOC, other, root=repo))
    assert library.script_assets({"beats": [{"params": {"src": "real/enron.png"}}]}) == set()   # Commons photos: images.py


ORIGINAL = "https://upload.wikimedia.org/wikipedia/commons/a/ab/Store_front.tif"


class FakeCommons(FakePexels):
    name = "commons"

    def resolve(self, kind, ident):
        return _cand(ref=f"commons:photo:{ident}", source="commons", kind="photo", id=ident, url=ORIGINAL, ext="tif",
                     licence="CC BY 2.0", page="https://commons.wikimedia.org/wiki/File:Store_front.tif", width=1100)


def test_commons_thumbs_ask_the_thumbnail_host_for_the_smallest_standard_width_first():
    urls = library._commons_thumbs({"url": ORIGINAL, "width": 1100})
    base_ = "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Store_front.tif/"
    assert urls == [base_ + f"{w}px-Store_front.tif.png" for w in (1280, 1920, 960)]
    assert library._commons_thumbs({"url": "https://example.org/x.jpg"}) == []


def test_a_throttled_commons_thumbnail_falls_through_to_the_next_width(repo, monkeypatch):
    import urllib.error
    monkeypatch.setattr(library, "provider", lambda name: FakeCommons())
    monkeypatch.setattr(library, "licence_snapshot", lambda url, headers: "f" * 64)
    tried = []

    def fake(url, dest, headers, bucket, interval, max_bytes=None, attempts=6):
        tried.append((url.rsplit("/", 1)[-1], attempts))
        if len(tried) == 1:
            raise urllib.error.HTTPError(url, 429, "Too Many Requests", {}, None)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(b"bytes")
        return dest
    monkeypatch.setattr(library, "download", fake)
    library.fetch(DOC, "commons:photo:File:Store_front.tif", root=repo)
    assert tried == [("1280px-Store_front.tif.png", 2), ("1920px-Store_front.tif.png", 2)]   # the original is never asked for


def test_a_tif_s_png_thumbnail_is_cached_as_png_and_the_original_as_tif(repo, monkeypatch):
    # gen-007: the PNG thumbnail of a .tif was cached under .tif, and the static server sent it as image/tiff
    import urllib.error
    monkeypatch.setattr(library, "provider", lambda name: FakeCommons())
    monkeypatch.setattr(library, "licence_snapshot", lambda url, headers: "f" * 64)
    thumbs_fail = [False]

    def fake(url, dest, headers, bucket, interval, max_bytes=None, attempts=6):
        if thumbs_fail[0] and url.endswith(".png"):
            raise urllib.error.HTTPError(url, 404, "Not Found", {}, None)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(b"bytes")
        return dest
    monkeypatch.setattr(library, "download", fake)
    rec = library.fetch(DOC, "commons:photo:File:Store_front.tif", root=repo)
    assert rec["path"].endswith(".png"), rec["path"]
    thumbs_fail[0] = True                                      # no thumbnail at all: the original, under its own name
    rec = library.fetch(DOC, "commons:photo:File:Other.tif", root=repo)
    assert rec["path"].endswith(".tif"), rec["path"]
