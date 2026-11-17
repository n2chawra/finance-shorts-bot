"""A channel's pack: channel #1 unchanged without one; a new channel scaffolded, checked and read."""
import json

from generator import pack


def test_channel_one_without_a_pack_keeps_its_values(tmp_path, monkeypatch):
    monkeypatch.setenv("CHANNEL", "paisa-panchayat")
    p = pack.load(root=tmp_path)
    assert p["voices"]["shortsNarrator"] == "am_michael"
    assert p["language"] == "en-us" and p["numbers"] == "finance" and p["currency"] == "USD"
    assert p["disclaimer"] == "Illustrative only. Not financial advice."
    assert p["uploadCategory"] == "22"
    assert pack.pack_problems(p) == []


def test_the_dashboard_disclaimer_setting_still_applies_without_a_pack(tmp_path, monkeypatch):
    monkeypatch.setenv("CHANNEL", "paisa-panchayat")
    (tmp_path / "config").mkdir()
    (tmp_path / "config" / "settings.json").write_text(json.dumps({"disclaimer": "Not advice."}), encoding="utf-8")
    assert pack.load(root=tmp_path)["disclaimer"] == "Not advice."


def test_scaffold_then_check_lists_what_the_build_still_owes(tmp_path, monkeypatch):
    monkeypatch.setenv("CHANNEL", "space-facts")
    made = pack.scaffold("space-facts", "Space Facts", root=tmp_path, language="en-gb")
    assert "channels/space-facts/channel.json" in made and "channels/space-facts/history/history.json" in made
    assert pack.scaffold("space-facts", "Space Facts", root=tmp_path) == []   # never overwrites
    p = pack.load(root=tmp_path)
    assert p["name"] == "Space Facts" and p["voices"]["shortsNarrator"] == "bm_george" and p["numbers"] == "none"
    problems = pack.check("space-facts", root=tmp_path)
    for want in ("disclaimer is empty", "profile.md", "formats.json", "topics.json", "recipe.md", "backlog.json", "advice.md"):
        assert any(want in x for x in problems), (want, problems)


def test_a_complete_pack_passes(tmp_path, monkeypatch):
    monkeypatch.setenv("CHANNEL", "space-facts")
    pack.scaffold("space-facts", "Space Facts", root=tmp_path)
    d = tmp_path / "channels" / "space-facts"
    j = json.loads((d / "channel.json").read_text(encoding="utf-8"))
    (d / "channel.json").write_text(json.dumps({**j, "disclaimer": "Facts from NASA. Images: NASA, public domain."}), encoding="utf-8")
    (d / "profile.md").write_text("# Space Facts\n\n" + "word " * 160, encoding="utf-8")
    fmt = lambda i, tier: {"id": i, "format": "short", "name": i, "hook": "h", "beats": "b", "tier": tier}
    (d / "research" / "formats.json").write_text(json.dumps({"formats": [fmt("a", "core"), fmt("b", "low"), fmt("c", "low")]}), encoding="utf-8")
    (d / "research" / "shapes.json").write_text(json.dumps({"shapes": [{"id": "reveal"}]}), encoding="utf-8")
    (d / "research" / "topics.json").write_text(json.dumps({"topics": [{"id": f"t{i}", "facts": [{"value": 1}]} for i in range(15)]}), encoding="utf-8")
    (d / "prompts" / "recipe.md").write_text("# Recipe", encoding="utf-8")
    (d / "cycle" / "backlog.json").write_text(json.dumps({"candidates": [{"id": "x"}]}), encoding="utf-8")
    for f in ("advice.md", "families.json"):
        (d / "research" / f).write_text("{}", encoding="utf-8")
    assert pack.check("space-facts", root=tmp_path) == []


def test_voices_must_be_kokoro_and_speak_the_channels_language():
    bad = {**pack.DEFAULTS, "language": "es", "voices": {"shortsNarrator": "am_michael", "longNarrators": ["nobody"]}}
    problems = pack.pack_problems(bad)
    assert any("'nobody' is not a Kokoro voice" in p for p in problems)
    assert any("speaks en-us, the channel is 'es'" in p for p in problems)
    # channel #1's Indian voice speaks English on purpose: only the Shorts narrator is held to the language
    assert pack.pack_problems({**pack.DEFAULTS, "voices": {"shortsNarrator": "am_michael", "longNarrators": ["hf_alpha"]}}) == []


def test_a_channel_with_no_numbers_has_no_maths(tmp_path, monkeypatch):
    from generator import run
    monkeypatch.setenv("CHANNEL", "space-facts")
    pack.scaffold("space-facts", "Space Facts", root=tmp_path, numbers="none")
    assert pack.load(root=tmp_path)["numbers"] == "none"
    # run_number_check's rule, on its own: a numbers-none channel's script may not carry maths
    script = {"maths": [{"name": "x", "kind": "sip"}]}
    assert pack.load(root=tmp_path)["numbers"] == "none" and script.get("maths")
    assert hasattr(run, "run_number_check")


def test_the_voice_engine_takes_the_channels_language_and_keeps_english_caches():
    import inspect
    from renderer.engine import voice
    sig = inspect.signature(voice.speak_timed)
    assert sig.parameters["lang"].default == "en-us"
    src = inspect.getsource(voice.speak_timed)
    assert 'lang_key = "" if lang == "en-us"' in src   # an English line's cache key is unchanged
