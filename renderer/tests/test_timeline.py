"""Story maths and the timeline builder (renderer/models, renderer/timeline): the hand-off to
Remotion. Built in estimate mode, so no voice model is needed."""
import json
import math
from pathlib import Path

import numpy as np
import pytest

from renderer.engine import voice
from renderer.models import maths
from renderer.timeline import build as tb
from generator.channels import cpath

EXAMPLES = Path(__file__).resolve().parents[2] / "examples"
CARD = {"name": "card", "kind": "card_min_due", "amount": 60000, "rate_pct_month": 3.5, "min_due_pct": 5, "min_due_floor": 200}


def script(beats: list[dict], **extra) -> dict:
    return {"format": "long", "seed": 7, "maths": [CARD], "beats": beats, **extra}


def test_card_min_due_pays_off_slowly() -> None:
    r = maths.compute([CARD])["card"]
    v, f = r["values"], r["figures"]
    assert v["months"] == 194 and f["years"] == "16"
    assert f["amount"] == "₹60,000" and f["min_due"] == "₹3,000"
    assert f["rate_year"] == "42%" and f["ratio"] == "2.9×"
    assert v["total_paid"] == pytest.approx(v["amount"] + v["interest"], rel=1e-9)
    assert v["paid_year1"] + v["owed_year1"] > v["amount"]          # a year of paying and still owing most of it
    assert len(r["series"]["balance"]["y"]) == 195 and r["series"]["balance"]["y"][0] == 60000


def test_card_min_due_that_never_ends_is_rejected() -> None:
    with pytest.raises(ValueError, match="never pays"):
        maths.compute([{**CARD, "min_due_pct": 1, "min_due_floor": 0}])


def test_maths_needs_its_inputs_and_unique_names() -> None:
    with pytest.raises(ValueError, match="needs min_due_floor"):
        maths.compute([{k: v for k, v in CARD.items() if k != "min_due_floor"}])
    with pytest.raises(ValueError, match="used twice"):
        maths.compute([CARD, CARD])


def test_placeholder_names_may_hold_digits_but_text_may_not(tmp_path: Path) -> None:
    beat = {"id": "a", "scene": "bignumber", "say": "He paid {card_paid_year1}.", "params": {"t": "{card_owed_year1}"}}
    t = tb.build(script([beat]), tmp_path, voice="estimate")
    assert t["beats"][0]["params"]["t"].startswith("₹")
    for bad in ({**beat, "say": "He paid 5 lakh."}, {**beat, "params": {"t": "₹500"}}):
        with pytest.raises(ValueError, match="typed number"):
            tb.build(script([bad]), tmp_path, voice="estimate")
    assert voice.fill_lines({"x": "{card_paid_year1}"}, ["x"], {"card_paid_year1": "₹32,862"})["x"] == "thirty two thousand eight hundred sixty two rupees"


def test_experiment_variants_travel_in_the_timeline(tmp_path: Path) -> None:
    beat = {"id": "a", "scene": "bignumber", "say": "It costs {card_amount}."}
    assert tb.build(script([beat], experiments={"bold-hook": "on"}), tmp_path, voice="estimate")["experiments"] == {"bold-hook": "on"}
    assert tb.build(script([beat]), tmp_path, voice="estimate")["experiments"] == {}


def test_beats_follow_their_words(tmp_path: Path) -> None:
    beats = [
        {"id": "a", "scene": "bignumber", "say": "It costs {card_amount} today.", "events": {"cost": {"word": "costs"}},
         "sfx": [{"kind": "pop", "at": "cost"}], "params": {"series": "@card.balance", "v": "@card.total_paid"}},
        {"id": "b", "scene": "chapter", "params": {"title": "Part one"}},
    ]
    t = tb.build(script(beats, tempo=1), tmp_path, voice="estimate")
    a, b = t["beats"]
    assert a["from"] == 0 and b["from"] == a["frames"]
    assert a["events"]["speech"] == round(tb.LEAD * tb.FPS) < a["events"]["cost"] < a["frames"]
    assert b["frames"] == round(tb.GAP_NO_VOICE * tb.FPS) and b["voice"] is None
    assert a["params"]["series"]["y"][0] == 60000 and a["params"]["v"] > 60000
    assert a["say"] == "It costs ₹60,000 today."
    assert t["durationInFrames"] >= a["frames"] + b["frames"]
    assert (tmp_path / "audio.wav").stat().st_size > 0
    assert json.loads((tmp_path / "timeline.json").read_text(encoding="utf-8"))["disclaimer"] == tb.DISCLAIMER


@pytest.mark.parametrize("change, error", [
    ({"events": {"x": {"word": "nowhere"}}}, "no word 'nowhere'"),
    ({"sfx": [{"kind": "kazoo", "at": "start"}]}, "sfx kind"),
    ({"params": {"s": "@loan.balance"}}, "no maths named 'loan'"),
    ({"params": {"s": "@card.nothing"}}, "no value or series"),
    ({"say": "Costs {card_price}."}, "bad placeholder"),
])
def test_bad_beats_are_rejected(tmp_path: Path, change: dict, error: str) -> None:
    beat = {"id": "a", "scene": "bignumber", "say": "It costs {card_amount}.", **change}
    with pytest.raises(ValueError, match=error):
        tb.build(script([beat]), tmp_path, voice="estimate")


def test_beat_ids_are_unique(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="unique"):
        tb.build(script([{"id": "a", "scene": "x"}, {"id": "a", "scene": "y"}]), tmp_path, voice="estimate")


def test_smooth_is_a_centred_moving_average() -> None:
    x = np.zeros(200)
    x[80:120] = 1.0
    k = 5
    padded = np.pad(x, k, mode="edge")
    expected = np.array([padded[i:i + 2*k + 1].mean() for i in range(len(x))])
    assert np.allclose(tb._smooth(x, k), expected)


def test_long_videos_play_at_their_tempo(tmp_path: Path) -> None:
    beats = [{"id": "a", "scene": "bignumber", "say": "It costs {card_amount} today, every single month.",
              "events": {"later": {"sec": 3}}, "min_sec": 0},
             {"id": "b", "scene": "chapter"}]
    slow = tb.build(script(beats, tempo=1), tmp_path / "slow", voice="estimate")
    fast = tb.build(script(beats), tmp_path / "fast", voice="estimate")
    assert fast["tempo"] == tb.TEMPOS["long"] == 1.25 and fast["speed"] == 1.25 and slow["speed"] == 1.0   # owner, 2026-11-04: 1.5 too fast
    for s, f in zip(slow["beats"], fast["beats"]):
        assert f["frames"] == pytest.approx(s["frames"] / 1.25, abs=1)       # voice, pauses, chapter cards
    assert fast["beats"][0]["events"]["later"] == round(3 / 1.25 * tb.FPS)   # story seconds -> real
    assert fast["beats"][0]["voice"]["words"][-1]["e"] == pytest.approx(slow["beats"][0]["voice"]["words"][-1]["e"] / 1.25, rel=0.02)


def test_long_story_example_builds(tmp_path: Path) -> None:
    s = json.loads((EXAMPLES / "long_story.json").read_text(encoding="utf-8"))
    t = tb.build(s, tmp_path, voice="estimate")
    # the first sample was written for the old pace: 4 min at tempo 1, about 2:45 at 1.5
    assert 150 <= t["durationInFrames"]/tb.FPS <= 900
    assert {b["scene"] for b in t["beats"]} >= {"stage", "chapter", "chart", "end"}
    assert t["beats"][-1]["scene"] == "end"


def test_captions_show_figures_as_written(tmp_path: Path) -> None:
    beat = {"id": "a", "scene": "bignumber", "say": "Total due, {card_amount}. Minimum due, just {card_min_due}."}
    t = tb.build(script([beat], format="short"), tmp_path, voice="estimate")
    caps = t["beats"][0]["voice"]["captions"]
    assert [c["t"] for c in caps] == ["Total", "due,", "₹60,000.", "Minimum", "due,", "just", "₹3,000."]
    words = t["beats"][0]["voice"]["words"]
    assert caps[2]["s"] == words[2]["s"] and caps[2]["e"] == words[4]["e"]      # "sixty thousand rupees"
    assert t["width"] == 1080 and t["tempo"] == tb.TEMPOS["short"]


def test_short_story_example_passes_the_checks() -> None:
    from generator import numbers
    s = json.loads((EXAMPLES / "short_story.json").read_text(encoding="utf-8"))
    passed, notes = numbers.number_check(s)
    assert passed, notes


@pytest.mark.parametrize("side, error", [
    ({"label": "Paid", "text": "{card_amount}", "value": "@card.total_paid"}, "counts to .* but lands on '₹60,000'"),
    ({"label": "Paid", "text": "A lot", "value": "@card.total_paid"}, "lands on 'A lot'"),
    ({"label": "Paid", "text": "{card_total_paid}", "value": 163700}, "typed number"),
])
def test_a_counter_lands_on_its_own_figure(side: dict, error: str) -> None:
    """One quantity, one string: a count-up that counts to one number and lands on another shows
    two figures for one amount (research proposal same-figure-same-text, 2026-10-18)."""
    ok = {"label": "Owed", "text": "{card_owed_year1}", "value": "@card.owed_year1"}
    beats = [{"id": "a", "scene": "split", "params": {"left": side, "right": ok}}, {"id": "z", "scene": "end"}]
    with pytest.raises(ValueError, match=error):
        tb.check_script(script(beats))


def test_counters_on_their_own_figure_pass() -> None:
    items = [{"label": "Minimum due", "text": "{card_interest}", "value": "@card.interest"},
             {"label": "Pay in full", "text": "Nothing", "value": 0},
             {"label": "Months", "text": "{card_months} months", "value": "@card.months"},
             {"label": "First due", "text": "just {card_min_due}", "value": "@card.first_min_due"}]
    tb.check_script(script([{"id": "a", "scene": "towers", "params": {"items": items}}, {"id": "z", "scene": "end"}]))


def test_three_thumbnails_each_its_own_component() -> None:
    """Owner, 2026-11-11: "give 3 thumbnails so that I can pick the best one" (replaces 2026-10-29's one)."""
    import json
    from pathlib import Path

    from renderer.timeline.build import check_script
    s = json.loads((Path(__file__).resolve().parents[2] / "examples" / "long_story.json").read_text(encoding="utf-8"))
    s["thumbnails"] = [{**s["thumbnail"], "component": "ThumbB"}, {**s["thumbnail"], "component": "ThumbC"}]
    check_script(s)
    s["thumbnails"] = [{**s["thumbnail"], "component": "ThumbB"}, {**s["thumbnail"], "component": "ThumbB"}]
    with pytest.raises(ValueError, match="its own component"):
        check_script(s)
    s["thumbnails"] = [{**s["thumbnail"], "component": f"Thumb{c}"} for c in "BCD"]
    with pytest.raises(ValueError, match="at most 2"):
        check_script(s)


def test_a_custom_thumbnail_keeps_its_references_as_notes() -> None:
    """YouTube ids and view counts are notes on what it copies, never shown: digits are fine there."""
    import json
    from pathlib import Path

    from renderer.timeline.build import _thumbnail
    th = {"layout": "custom", "component": "Thumb", "who": "rohan", "words": "Never sell",
          "pattern": "one huge face, 2 words, a red arrow to the 1 thing",
          "references": [{"id": "D7Y-nJ8uiEA", "views": 10119497, "what": "face + 3 words"}]}
    t = _thumbnail(th, {}, {})
    assert t["references"][0]["id"] == "D7Y-nJ8uiEA" and t["figure"] == ""
    with pytest.raises(ValueError, match="component"):
        _thumbnail({**th, "component": "../evil"}, {}, {})


def test_event_gaps_flags_a_long_beat_with_a_still_stretch() -> None:
    fps = tb.FPS
    still = {"id": "still", "frames": 7*fps, "events": {"start": 0, "speech": 10, "end": 7*fps}}
    busy = {"id": "busy", "frames": 7*fps, "events": {"a": 2*fps, "b": int(4.5*fps)}}
    short = {"id": "short", "frames": 5*fps, "events": {}}             # 5 s or less is one picture
    warnings = tb.event_gaps([still, busy, short])
    assert len(warnings) == 1 and "'still'" in warnings[0] and "7.0 s" in warnings[0]


def test_first_frame_warns_for_a_stage_opening_without_a_chip() -> None:
    bare = [{"id": "open", "scene": "stage", "params": {"actors": [{"who": "rohan", "x": 0.5}]}}]
    warned = tb.first_frame(bare)
    assert len(warned) == 1 and "'open'" in warned[0] and "frame 0" in warned[0]
    assert tb.first_frame([{"id": "open", "scene": "stage", "params": {"chip": {"text": "Raise", "at": "start"}}}]) == []
    assert tb.first_frame([{"id": "open", "scene": "bignumber", "params": {}}]) == []
    # only the opening beat counts
    assert tb.first_frame([{"id": "a", "scene": "hook", "params": {}}, *bare]) == []


def test_check_script_warns_only_for_shorts() -> None:
    line = ("This balance is paid down slowly, month after month, year after year, while the bank keeps "
            "adding interest on everything that is still left over at the end of each month.")
    beats = [{"id": "slow", "scene": "bignumber", "say": line, "params": {"lines": [{"text": "{card_years}", "at": "start"}]}},
             {"id": "outro", "scene": "end", "say": "Follow.", "params": {"cta": "Pay more than the minimum."}}]
    assert tb.check_script(script(beats))["warnings"] == []
    warned = tb.check_script(script(beats, format="short"))["warnings"]
    assert len(warned) == 1 and "'slow'" in warned[0]
    beats[0]["events"] = {"a": {"word": "month"}, "b": {"word": "bank"}, "c": {"word": "everything"}, "d": {"word": "end"}}
    assert tb.check_script(script(beats, format="short"))["warnings"] == []


def test_the_shorts_reference_keeps_an_event_every_few_seconds(monkeypatch) -> None:
    """A shipped Short (the geography channel's, 23 Nov) keeps an event every 3 s at its channel's pace."""
    monkeypatch.setenv("CHANNEL", "geography-maps-geopolitical-mysteries")
    s = json.loads((cpath(EXAMPLES.parent, "videos") / "v-20261123-11" / "script.json").read_text(encoding="utf-8"))
    assert tb.check_script(s)["warnings"] == []
    assert tb.TEMPOS["short"] == 1.2


def test_a_long_scene_thumbnail_needs_no_figure() -> None:
    # thumbs.py fails any long thumbnail with a figure, so a scene cover must be allowed without one
    # (L-20261028-01 dropped to one thumbnail because a long scene cover could not be written)
    import json
    from pathlib import Path

    from renderer.timeline.build import check_script
    s = json.loads((Path(__file__).resolve().parents[2] / "examples" / "long_story.json").read_text(encoding="utf-8"))
    s["thumbnail"] = {"layout": "scene", "words": "Where it goes", "angle": "question"}
    s.pop("thumbnails", None)
    check_script(s)


def test_a_doc_thumbnail_jump_takes_two_placeholders() -> None:
    # doc/thumb PriceJump (P4, 2026-11-20): both figures are the script's own, filled by Python
    figs = {"then": "$847.4M", "now": "$4.04B"}
    t = tb._thumbnail({"layout": "custom", "component": "ThumbPrice", "words": "*How?*",
                       "jump": {"from": "{then}", "to": "{now}", "labels": ["Then", "Now"]}}, figs, {})
    assert t["jump"]["from"] == "$847.4M" and t["jump"]["to"] == "$4.04B"
    with pytest.raises(ValueError):
        tb._thumbnail({"layout": "custom", "words": "How", "jump": {"from": "{then}", "to": "nothing"}}, figs, {})


def test_a_doc_thumbnail_keeps_its_pattern_id_as_a_note() -> None:
    # channel.json thumbs (2026-11-20): each spec names a playbook pattern ("P1"…"P8"); renderer/thumbs.py
    # channel_problems requires it, so the typed-number check must pass it through as a note, like `pattern`
    t = tb._thumbnail({"layout": "custom", "component": "Thumb", "pattern_id": "P1", "words": "Almost *dead*"}, {}, {})
    assert t["pattern_id"] == "P1"


def test_audio_reports_loudness(tmp_path: Path) -> None:
    """Integrated loudness goes into the timeline (research loudness-in-render-json, 2026-11-03); the
    music-under-voice gap only when a real voice spoke (estimate mode places none)."""
    beat = {"id": "a", "scene": "bignumber", "say": "It costs {card_amount} today."}
    a = tb.build(script([beat]), tmp_path, voice="estimate")["audio"]
    assert -30 < a["lufs"] < -5
    assert "music_under_voice_db" not in a


def test_integrated_lufs_matches_bs1770() -> None:
    """A full-scale-relative 1 kHz sine at -20 dBFS on both channels reads -20.0 LUFS (ffmpeg ebur128
    agrees); silence is gated out."""
    from renderer.engine.audio import SR, integrated_lufs
    t = np.arange(int(5*SR))/SR
    x = 0.1*np.sin(2*np.pi*1000*t)
    assert integrated_lufs(np.stack([x, x], 1)) == pytest.approx(-20.0, abs=0.15)
    assert integrated_lufs(np.zeros((SR, 2))) == -70.0


def test_every_short_speaks_at_the_october_pace():
    """Adopted 2026-11-12: no longer an experiment arm."""
    from renderer.timeline.build import OCTOBER_PACE, voice_speed
    assert voice_speed({"experiments": {OCTOBER_PACE: "on"}}, "short", 1.2) == 1.4
    assert voice_speed({"experiments": {OCTOBER_PACE: "off"}}, "short", 1.2) == 1.4
    assert voice_speed({}, "short", 1.2) == 1.4
    assert abs(voice_speed({"experiments": {OCTOBER_PACE: "on"}}, "long", 1.25) - 1.25) < 1e-9   # Shorts only
    assert abs(voice_speed({"speed": 1.0, "experiments": {OCTOBER_PACE: "on"}}, "short", 1.2) - 1.2) < 1e-9


TECH_SOUND = {"genres": ["circuit", "datahall"], "bedLevel": 0.22, "duck": 0.8,
              "sfx": ["whoosh", "swell", "tick", "glass", "thud", "pop"], "transitionSfx": "whoosh",
              "sfxPerMinute": {"short": 12, "long": 6}, "preRevealDrop": {"db": -20, "sec": 2.0, "shortSec": 0.4}}


def _with_sound(monkeypatch, sound: dict | None) -> None:
    from generator import pack
    base = pack.load()
    monkeypatch.setattr(tb.channel_pack, "load", lambda *a, **k: {**base, **({"sound": sound} if sound else {})})


def test_a_channels_pre_reveal_drop_and_level(monkeypatch) -> None:
    """The tech channel (2026-11-18): the bed falls 20 dB for 2 s before a long video's turn and payoff,
    0.4 s before a Short's payoff; channel #1 and a channel without preRevealDrop keep their mix."""
    assert tb.own_drop(TECH_SOUND, "long") == (2.0, pytest.approx(0.1))
    assert tb.own_drop(TECH_SOUND, "short") == (0.4, pytest.approx(0.1))
    assert tb.own_drop({"genres": ["explorer"]}, "long") is None and tb.own_drop({}, "short") is None
    env = tb._drop_envelope(tb.SR*6, [4.0], 2.0, 0.1)
    assert env[int(1.5*tb.SR)] == 1.0 and env[int(3.0*tb.SR)] == pytest.approx(0.1) and env[int(5*tb.SR)] == 1.0
    assert (tb._drop_envelope(tb.SR*3, [2.0]) == tb._drop_envelope(tb.SR*3, [2.0], tb.DROP_BEFORE, tb.DROP_LEVEL)).all()


def test_the_drop_lands_before_the_payoff(tmp_path: Path, monkeypatch) -> None:
    beats = [{"id": "a", "scene": "directed", "say": "It costs {card_amount} today, every single month.", "role": "hook"},
             {"id": "b", "scene": "directed", "say": "And then the bill comes due.", "role": "payoff"}]
    _with_sound(monkeypatch, {k: v for k, v in TECH_SOUND.items() if k != "preRevealDrop"})
    plain = tb.build(script(beats, style={"genre": "circuit", "bpm": 72}), tmp_path / "plain", voice="estimate")
    _with_sound(monkeypatch, TECH_SOUND)
    drop = tb.build(script(beats, style={"genre": "circuit", "bpm": 72}), tmp_path / "drop", voice="estimate")
    assert drop["audio"]["stems"]["music"] < plain["audio"]["stems"]["music"]
    assert (tmp_path / "plain" / "audio.wav").read_bytes() != (tmp_path / "drop" / "audio.wav").read_bytes()


def test_a_channels_effects_a_minute(tmp_path: Path, monkeypatch) -> None:
    """sound.sfxPerMinute: the script's own sounds may not pass the budget; transitions are dropped first."""
    _with_sound(monkeypatch, TECH_SOUND)
    say = "It costs {card_amount} today, and it keeps on costing more every single month of the year."
    many = [{"id": f"b{i}", "scene": "directed", "say": say, "transition": "whip",
             "sfx": [{"kind": "tick", "at": "speech"}] if i < 2 else []} for i in range(4)]
    t = tb.build(script(many), tmp_path / "ok", voice="estimate")   # a long video: 6 a minute
    assert 2 < math.ceil(6*(t["durationInFrames"]/tb.FPS)/60) < 6   # two ticks and four whooshes would pass it
    crowded = [{**b, "sfx": [{"kind": "tick", "at": "speech"}, {"kind": "pop", "at": "start"}]} for b in many]
    with pytest.raises(ValueError, match="sfxPerMinute"):
        tb.build(script(crowded), tmp_path / "bad", voice="estimate")
    beats = [{"id": "a", "scene": "x"}]
    for at, kind in ((0.5, "tick"), (1.0, "whoosh"), (2.0, "whoosh"), (3.0, "pop")):
        beats[0].setdefault("_sfx", []).append((at, {"kind": kind}))
    autos = {id(s) for at, s in beats[0]["_sfx"] if s["kind"] == "whoosh"}
    tb.cap_sfx(beats, autos, 3*60/4.0, 4.0)   # a budget of 3 in 4 s: the later whoosh goes
    assert [at for at, _ in beats[0]["_sfx"]] == [0.5, 1.0, 3.0]


def test_channel_one_ignores_the_new_sound_settings(tmp_path: Path, monkeypatch) -> None:
    """No sound block: transitions whoosh, nothing is capped, no drop before a payoff role."""
    _with_sound(monkeypatch, None)
    beats = [{"id": f"b{i}", "scene": "directed", "say": "It costs {card_amount}.", "transition": "whip", "role": "payoff",
              "sfx": [{"kind": "kaching", "at": "speech"}, {"kind": "pop", "at": "start"}, {"kind": "ding", "at": "end"}]} for i in range(3)]
    tb.build(script(beats), tmp_path, voice="estimate")


DOC_SOUND = {"genres": ["ledger", "dossier"], "bedLevel": {"short": 0.26, "long": 0.18}, "duck": {"short": 0.6, "long": 0.9},
             "sfx": ["thud", "boom", "paper", "scribble", "tick", "pop", "swell"], "transitionSfx": None}


def test_a_channels_bed_level_and_duck_per_format(tmp_path: Path, monkeypatch) -> None:
    """The business-documentary channel (2026-11-19): {"short": x, "long": y} levels, Shorts ~18 dB under the
    voice and long ~32; a plain number still sets both formats, a missing format keeps the default."""
    assert tb.own_level(DOC_SOUND, "bedLevel", "short", 0.5) == 0.26 and tb.own_level(DOC_SOUND, "duck", "long", 0.7) == 0.9
    assert tb.own_level(TECH_SOUND, "bedLevel", "short", 0.5) == tb.own_level(TECH_SOUND, "bedLevel", "long", 0.5) == 0.22
    assert tb.own_level({"duck": {"short": 0.6}}, "duck", "long", 0.72) == 0.72 and tb.own_level({}, "duck", "long", 0.72) == 0.72
    beats = [{"id": "a", "scene": "directed", "say": "It costs {card_amount} today, every single month."}]
    music = {}
    for name, snd in (("split", DOC_SOUND), ("long-everywhere", {**DOC_SOUND, "bedLevel": 0.18, "duck": 0.9})):
        _with_sound(monkeypatch, snd)
        t = tb.build(script(beats, format="short", style={"genre": "dossier", "bpm": 80}), tmp_path / name, voice="estimate")
        music[name] = t["audio"]["stems"]["music"]
    assert music["split"] > music["long-everywhere"] + 3   # the Short's own, louder level is the one used



def test_owner_pace_note_speeds_up_a_channels_own_short_voice(monkeypatch):
    """The tech channel's pace note (owner, 2026-11-19), applied at once: its Shorts speak at 1.0, not 0.92."""
    from generator import pack
    monkeypatch.setattr(pack, "load", lambda slug=None, root=None: {"voiceSpeed": {"short": 0.92, "long": 0.97}})
    tech = "how-tech-and-ai-actually-work-chips-ai-p"
    assert pack.voice_speed("short", tech) == 1.0
    assert pack.voice_speed("long", tech) == pack.MIN_SPEED["long"]   # 0.97 is under the floor for every channel (2026-11-23)
    assert pack.voice_speed("short", "geography-maps-geopolitical-mysteries") == pack.MIN_SPEED["short"]   # no note, but the floor
    monkeypatch.setattr(pack, "load", lambda slug=None, root=None: {"voiceSpeed": {"short": 1.1}})
    assert pack.voice_speed("short", tech) == 1.1          # the owner's own faster setting wins


def test_dive_colours_and_line_badges_are_not_typed_figures():
    """A dive layer's paint ("#00933c") and its line badges ("4", "S") are names, not figures (2026-11-21)."""
    from renderer.timeline.build import _resolve
    layer = {"kind": "tunnel", "stripe": "#00933c", "wall": "#efe3c8", "trains": ["#d23b3b", "royalblue"],
             "bullets": [["4", "#00933c"], ["S", "gray"]], "label": "Lexington"}
    assert _resolve(layer, {}, {}, "x") == layer
    with pytest.raises(ValueError):
        _resolve({"label": "Line 4"}, {}, {}, "x")
    with pytest.raises(ValueError):
        _resolve({"bullets": [["105 ft", "gray"]]}, {}, {}, "x")
