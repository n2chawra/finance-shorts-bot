"""Real photos: free licences only, credited, and every photo a script uses is in the library."""
import json

from generator import images


def test_only_free_licences_pass():
    for ok in ("CC BY-SA 3.0", "CC BY 4.0", "CC0", "Public domain", "PD-USGov", "Attribution", "cc-by-sa-4.0"):
        assert images.licence_ok(ok), ok
    for bad in ("CC BY-NC 2.0", "CC BY-NC-SA 4.0", "CC BY-ND 3.0", "Fair use", "All rights reserved", "", "Copyrighted"):
        assert not images.licence_ok(bad), bad


def _lib(tmp_path, credits):
    real = tmp_path / "remotion" / "public" / "real"
    real.mkdir(parents=True)
    (real / "credits.json").write_text(json.dumps(credits))
    for c in credits.values():
        (real / c["file"]).write_bytes(b"x")
    return tmp_path


def test_photos_in_a_script_must_be_in_the_library_and_are_credited(tmp_path):
    root = _lib(tmp_path, {"ronaldo": {"file": "ronaldo.jpg", "license": "CC BY-SA 3.0", "author": "A. Person",
                                       "source": "https://commons.wikimedia.org/wiki/File:X.jpg"}})
    script = {"beats": [{"id": "b", "params": {"items": [{"id": "cr7", "prop": "photo:ronaldo"}],
                                               "actions": [{"do": "swap", "target": "cr7", "into": "photo:messi"}]}}]}
    probs = images.script_problems(script, root=root)
    assert len(probs) == 1 and "photo:messi" in probs[0] and "fetch messi" in probs[0]
    desc = images.with_credits("A story.\n\nIllustrative only. Not financial advice.", script, root=root)
    assert desc.endswith("Photo: A. Person, CC BY-SA 3.0, via Wikimedia Commons (https://commons.wikimedia.org/wiki/File:X.jpg)")
    assert images.with_credits(desc, script, root=root) == desc     # credited once


def test_own_code_photos_count(tmp_path):
    root = _lib(tmp_path, {})
    d = root / "remotion" / "src" / "videos" / "v-1"
    d.mkdir(parents=True)
    (d / "Hook.tsx").write_text('<Photo name="bezos" s={400} />')
    assert any("photo:bezos" in p for p in images.script_problems({"beats": []}, "v-1", root))


def test_the_library_is_licensed():
    for name, c in images.load().items():
        assert images.licence_ok(c["license"]), name
        assert (images.REAL / c["file"]).is_file(), name
        assert c["author"] and c["source"].startswith("https://commons.wikimedia.org/"), name
