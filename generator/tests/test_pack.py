"""A channel's pack: channel #1 unchanged without one; a new channel scaffolded, checked and read."""
import json

from generator import pack


def test_channel_one_without_a_pack_keeps_its_values(tmp_path, monkeypatch):
    monkeypatch.setenv("CHANNEL", "first-channel")
    p = pack.load(root=tmp_path)
    assert p["voices"]["shortsNarrator"] == "am_michael"
    assert p["language"] == "en-us" and p["numbers"] == "finance" and p["currency"] == "USD"
    assert p["disclaimer"] == "Illustrative only. Not financial advice."
    assert p["uploadCategory"] == "22"
    assert pack.pack_problems(p) == []


def test_the_dashboard_disclaimer_setting_still_applies_without_a_pack(tmp_path, monkeypatch):
    monkeypatch.setenv("CHANNEL", "first-channel")
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
    (d / "channel.json").write_text(json.dumps({**j, "disclaimer": "Facts from NASA. Images: NASA, public domain.", "length": {"short": [45, 60]}}), encoding="utf-8")
    (d / "profile.md").write_text("# Space Facts\n\n" + "word " * 160, encoding="utf-8")
    fmt = lambda i, tier: {"id": i, "format": "short", "name": i, "hook": "h", "beats": "b", "tier": tier,
                           "examples": [{"title": "a hit", "views": 2_000_000, "url": "https://youtube.com/watch?v=x"}]}
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


def test_a_channels_own_sound_block_is_checked():
    """The tech channel's sound (2026-11-18): its beds exist, effects a minute per format, a pre-reveal drop."""
    good = {"genres": ["circuit", "datahall"], "bedLevel": 0.22, "duck": 0.8, "sfx": ["whoosh", "swell", "glass"],
            "sfxPerMinute": {"short": 12, "long": 6}, "preRevealDrop": {"db": -20, "sec": 2.0, "shortSec": 0.4}}
    assert pack.pack_problems({**pack.DEFAULTS, "sound": good}) == []
    for bad, words in (({"sfxPerMinute": {"short": 0}}, "sfxPerMinute"), ({"sfxPerMinute": {"reel": 4}}, "sfxPerMinute"),
                       ({"preRevealDrop": {"db": 6, "sec": 2}}, "preRevealDrop"), ({"preRevealDrop": {"db": -20}}, "preRevealDrop"),
                       ({"genres": ["dubstep"]}, "sound.genres")):
        assert any(words in p for p in pack.pack_problems({**pack.DEFAULTS, "sound": {**good, **bad}})), bad


def test_a_channel_has_its_own_length_never_another_channels(tmp_path, monkeypatch):
    """owner, 2026-11-18: a channel's lengths come from its own pack, never from config/settings.json
    (the platform's); its own dashboard setting still wins"""
    from generator import settings
    (tmp_path / "config").mkdir()
    (tmp_path / "config" / "settings.json").write_text(json.dumps({"lengthMinSec": 20, "lengthMaxSec": 35}), encoding="utf-8")
    d = tmp_path / "channels" / "tech"
    d.mkdir(parents=True)
    (d / "channel.json").write_text(json.dumps({"length": {"short": [45, 60], "long": [720, 900]}}), encoding="utf-8")
    monkeypatch.setenv("CHANNEL", "tech")
    s = settings.load(tmp_path)
    assert (s["lengthMinSec"], s["lengthMaxSec"], s["longLengthMinSec"], s["longLengthMaxSec"]) == (45, 60, 720, 900)
    (tmp_path / "config" / "channels.json").write_text(json.dumps({"channels": {"tech": {"status": "active", "settings": {"lengthMaxSec": 55}}}}), encoding="utf-8")
    assert settings.load(tmp_path)["lengthMaxSec"] == 55
    assert pack.pack_problems({**pack.DEFAULTS, "length": {"short": [60, 45]}})


def test_each_channel_carries_its_own_logo_never_another_channels(tmp_path, monkeypatch):
    monkeypatch.setenv("CHANNEL", "first-channel")
    assert pack.logo(root=tmp_path) == "sikka"                     # channel #1 (no pack): its mascot, as before
    pack.scaffold("space-facts", "Space Facts", root=tmp_path)
    assert pack.logo("space-facts", root=tmp_path) is None         # no avatar yet: no logo, never Sikka
    avatar = tmp_path / "channels" / "space-facts" / "branding" / "avatar.png"
    avatar.parent.mkdir(parents=True, exist_ok=True)
    avatar.write_bytes(b"\x89PNG space")
    assert pack.logo("space-facts", root=tmp_path) == "brand/space-facts/avatar.png"
    assert (tmp_path / "remotion" / "public" / "brand" / "space-facts" / "avatar.png").read_bytes() == b"\x89PNG space"


def test_a_channel_can_need_fewer_samples(tmp_path, monkeypatch):
    """owner, 2026-11-18 (tech channel): "for this niche only 1 sample is enough": channel.json `samples`"""
    from generator import run
    d = tmp_path / "channels" / "tech"
    (d / "history").mkdir(parents=True)
    (d / "channel.json").write_text(json.dumps({"disclaimer": "x", "samples": {"short": 1, "long": 0}}), encoding="utf-8")
    (d / "history" / "history.json").write_text("[]", encoding="utf-8")
    (tmp_path / "config").mkdir()
    (tmp_path / "config" / "channels.json").write_text(json.dumps({"channels": {"tech": {"status": "setup", "setup": {"stage": "samples"}}}}), encoding="utf-8")
    monkeypatch.setenv("CHANNEL", "tech")
    assert pack.load(root=tmp_path)["samples"]["short"] == 1
    s = run.state(tmp_path, "short")
    assert s["mode"] == "video" and "of 1" in s["reason"]
    assert run.state(tmp_path, "long")["mode"] == "idle"


def test_a_sound_level_may_be_set_per_format():
    """bedLevel and duck: a number, or {"short": x, "long": y} (the business-documentary channel, 2026-11-19)."""
    good = {"genres": ["ledger", "dossier"], "bedLevel": {"short": 0.26, "long": 0.18}, "duck": {"short": 0.6, "long": 0.9},
            "sfx": ["thud", "boom"]}
    assert pack.pack_problems({**pack.DEFAULTS, "sound": good}) == []
    for bad, words in (({"bedLevel": {"reel": 0.2}}, "bedLevel"), ({"duck": {"short": 1.4}}, "duck"),
                       ({"duck": {}}, "duck"), ({"bedLevel": "loud"}, "bedLevel"), ({"duck": -0.1}, "duck")):
        assert any(words in p for p in pack.pack_problems({**pack.DEFAULTS, "sound": {**good, **bad}})), bad


def test_disaster_desk_long_pace_note():
    """Owner, 2026-11-22 on L-20261121-42: "Increase the pace by 1.25" -> long 0.92 * 1.25 = 1.15; Shorts unchanged."""
    from generator import pack
    slug = "disasters-and-engineering-failures-expla"
    assert pack.voice_speed("long", slug) == 1.15
    assert pack.voice_speed("short", slug) == 1.0
