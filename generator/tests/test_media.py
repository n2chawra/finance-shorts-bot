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

    def fake_download(url, dest, headers, bucket, interval, max_bytes=None):
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
        library.fetch("paisa-panchayat", "pexels:video:42", root=repo)


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

    def fake_open(url, headers, bucket, interval, timeout=60):
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
