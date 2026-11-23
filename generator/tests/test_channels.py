"""The channel path layer: legacy paths until a channel has its own folder, then that folder."""
import pytest

from generator import channels
from generator.channels import cpath
from generator.run import _pop_channel


def test_legacy_paths_until_the_channel_folder_exists(tmp_path, monkeypatch):
    monkeypatch.setenv("CHANNEL", "paisa-panchayat")   # recorded, so the test restores it
    assert cpath(tmp_path, "videos") / "v-1" == tmp_path / "videos" / "v-1"
    assert cpath(tmp_path, "improvement/research/topics.json") == tmp_path / "improvement/research/topics.json"
    (tmp_path / "channels" / "paisa-panchayat").mkdir(parents=True)
    ch = tmp_path / "channels" / "paisa-panchayat"
    assert cpath(tmp_path, "videos") == ch / "videos"
    assert cpath(tmp_path, "videos/v-1/plan.json") == ch / "videos/v-1/plan.json"
    assert cpath(tmp_path, "improvement/research/topics.json") == ch / "research/topics.json"
    assert cpath(tmp_path, "improvement/research") == ch / "research"
    assert cpath(tmp_path, "channel/profile.md") == ch / "profile.md"
    assert cpath(tmp_path, "config/experiments.json") == ch / "experiments.json"
    assert cpath(tmp_path, "improvement/experiments.json") == ch / "experiment-log.json"
    assert channels.rel(tmp_path, "history/history.json") == "channels/paisa-panchayat/history/history.json"


def test_shared_paths_never_move(tmp_path, monkeypatch):
    monkeypatch.setenv("CHANNEL", "paisa-panchayat")
    (tmp_path / "channels" / "paisa-panchayat").mkdir(parents=True)
    for shared in ("config/settings.json", "improvement/activity/x.json", "renderer/templates", "improvement/merge-log.json"):
        assert cpath(tmp_path, shared) == tmp_path / shared


def test_the_channel_comes_from_the_flag_or_the_environment(tmp_path, monkeypatch):
    monkeypatch.setenv("CHANNEL", "paisa-panchayat")   # recorded, so the test restores it
    assert channels.current() == "paisa-panchayat"
    channels.use("second-one")
    assert channels.current() == "second-one"
    (tmp_path / "channels" / "second-one").mkdir(parents=True)
    assert cpath(tmp_path, "videos") == tmp_path / "channels/second-one/videos"
    with pytest.raises(ValueError):
        channels.use("../escape")


def test_channel_flag_anywhere_on_the_command_line():
    assert _pop_channel(["state", "--channel", "abc-1", "--format", "long"]) == (["state", "--format", "long"], "abc-1")
    assert _pop_channel(["--channel=abc-1", "render", "v-1"]) == (["render", "v-1"], "abc-1")
    assert _pop_channel(["render", "v-1"]) == (["render", "v-1"], None)


def _repo(tmp_path, channels: dict):
    import json
    (tmp_path / "config").mkdir()
    (tmp_path / "config" / "settings.json").write_text(json.dumps({"dailyVideoTarget": 3, "backlog": 9, "generationPaused": False}), encoding="utf-8")
    (tmp_path / "config" / "channels.json").write_text(json.dumps({"channels": channels}), encoding="utf-8")
    return tmp_path


def test_a_channel_overrides_its_own_settings_and_backlog(tmp_path, monkeypatch):
    from generator.settings import load
    monkeypatch.setenv("CHANNEL", "paisa-panchayat")
    root = _repo(tmp_path, {"paisa-panchayat": {"status": "active", "settings": {"dailyVideoTarget": 1, "agents": {"paused": True}}, "backlog": 2}})
    s = load(root)
    assert s["dailyVideoTarget"] == 1 and s["backlog"] == 2 and s["generationPaused"] is False
    assert "agents" not in s or s.get("agents", {}).get("paused") is not True


def test_a_paused_or_unlaunched_channel_makes_nothing(tmp_path, monkeypatch):
    from generator.settings import load
    root = _repo(tmp_path, {"paisa-panchayat": {"status": "active"}, "second-one": {"status": "paused"}, "third": {"status": "setup"}})
    monkeypatch.setenv("CHANNEL", "second-one")
    assert load(root)["generationPaused"] is True
    monkeypatch.setenv("CHANNEL", "third")
    assert load(root)["generationPaused"] is True
    monkeypatch.setenv("CHANNEL", "paisa-panchayat")
    assert load(root)["generationPaused"] is False


def test_a_channel_in_setup_makes_only_its_samples(tmp_path, monkeypatch):
    import json
    from generator import run
    monkeypatch.setenv("CHANNEL", "space-facts")
    ch = tmp_path / "channels" / "space-facts"
    (ch / "history").mkdir(parents=True)
    (ch / "history" / "history.json").write_text("[]", encoding="utf-8")
    (tmp_path / "config").mkdir()
    (tmp_path / "config" / "settings.json").write_text("{}", encoding="utf-8")
    def stage(s):
        (tmp_path / "config" / "channels.json").write_text(json.dumps({"channels": {"space-facts": {"status": "setup", "setup": {"stage": s}}}}), encoding="utf-8")
    stage("build")
    assert run.state(tmp_path)["mode"] == "paused"
    stage("samples")
    st = run.state(tmp_path)
    assert st["mode"] == "video" and st.get("sample") is True and "sample 1 of 2" in st["reason"]
    assert run.state(tmp_path, fmt="long")["mode"] == "idle"     # no long sample without the research advising long videos
    (ch / "research").mkdir()
    (ch / "research" / "counts.json").write_text(json.dumps({"longPerWeek": 1}), encoding="utf-8")
    assert run.state(tmp_path, fmt="long")["mode"] == "video"
    real = json.loads((run.ROOT / "channels" / "geography-maps-geopolitical-mysteries" / "history" / "history.json").read_text(encoding="utf-8"))
    entries = [e for e in real if e.get("format", "short") == "short"][-2:]   # two real Shorts' entries as the samples (owner: two are enough)
    (ch / "history" / "history.json").write_text(json.dumps(entries), encoding="utf-8")
    assert "samples are made" in run.state(tmp_path)["reason"]


def test_video_ids_are_unique_across_channels(tmp_path, monkeypatch):
    import json
    from datetime import datetime, timezone
    from generator import history
    monkeypatch.setenv("CHANNEL", "space-facts")
    (tmp_path / "channels" / "paisa-panchayat" / "videos" / "v-20261117-01").mkdir(parents=True)
    (tmp_path / "channels" / "paisa-panchayat" / "history").mkdir(parents=True)
    (tmp_path / "channels" / "paisa-panchayat" / "history" / "history.json").write_text(json.dumps([{"id": "v-20261117-02"}]), encoding="utf-8")
    (tmp_path / "channels" / "space-facts").mkdir(parents=True)
    at = datetime(2026, 11, 17, 6, 0, tzinfo=timezone.utc)
    assert history.next_id([], at, tmp_path) == "v-20261117-03"


def test_a_new_channels_own_rules(monkeypatch):
    """Found making the geography channel's first sample (2026-11-17): its formats are its stories, a
    country's area never goes stale, and its Shorts take its own length and category, not channel #1's."""
    from generator import topics, variety
    from improvement import arms
    old = {"facts": [{"label": "area", "value": 11300, "unit": "km2", "as_of": "2022-01-01"}]}
    assert topics.stale_facts(old, "2026-11-17")
    old["facts"][0]["fixed"] = True
    assert topics.stale_facts(old, "2026-11-17") == []
    monkeypatch.setenv("CHANNEL", "paisa-panchayat")
    assert arms.own_channel() is None
    assert "why_shaped" not in variety.known_stories()
    monkeypatch.setenv("CHANNEL", "geography-maps-geopolitical-mysteries")
    assert "why_shaped" in variety.known_stories() and variety.story_problems("why_shaped", []) == []
    own = arms.own_channel()
    assert own and own["category"] == "27" and own["length"].count("-") == 1
    assert arms.plan_problems({"arms": own}) == [] and arms.plan_problems({"arms": {**own, "length": "28-35"}})


def test_every_listed_word_is_shown_on_its_word(monkeypatch):
    """Owner, 2026-11-18: "small words spoken can be animation or shown, like the oil, cloth…"."""
    from generator import story
    assert story.listed_items("Trade sailed through it: phones, clothes, cars and oil.") == [["phones", "clothes", "cars", "oil"]]
    assert story.listed_items("Gambia is a real country, with its own flag and its own money, and Senegal wraps it.") == []
    beat = {"id": "trade", "scene": "directed", "say": "It carried phones, clothes, cars and oil.",
            "events": {w: {"word": w} for w in ("phones", "cars", "oil")},
            "params": {"moments": [{"at": w, "what": "x"} for w in ("phones", "cars", "oil")]}}
    problems = story.list_problems([beat])
    assert problems and "clothes" in problems[0]
    beat["events"]["clothes"] = {"word": "clothes"}
    beat["params"]["moments"].append({"at": "clothes", "what": "a bale of clothes drops on"})
    assert story.list_problems([beat]) == []


def test_a_channel_can_keep_the_picture_moving_more_often(monkeypatch):
    from renderer import craft
    monkeypatch.setenv("CHANNEL", "paisa-panchayat")
    assert craft.visual_gap() == craft.VISUAL_GAP
    monkeypatch.setenv("CHANNEL", "geography-maps-geopolitical-mysteries")
    assert craft.visual_gap() == 1.8


def test_each_channel_numbers_its_ids_from_its_own_block(tmp_path, monkeypatch):
    """2026-11-21: two channels' runs started together and both took v-20261121-01 (the id was free in
    each checkout); the second mp4 landed in the first one's release. Each channel now has its own block."""
    import json
    from datetime import datetime, timezone
    from generator import history
    (tmp_path / "config").mkdir()
    (tmp_path / "config" / "id-blocks.json").write_text(json.dumps({"blocks": {"paisa-panchayat": 0}}), encoding="utf-8")
    at = datetime(2026, 11, 21, 6, 0, tzinfo=timezone.utc)
    monkeypatch.setenv("CHANNEL", "paisa-panchayat")
    assert history.next_id([], at, tmp_path) == "v-20261121-01"
    monkeypatch.setenv("CHANNEL", "space-facts")          # a new channel gets the next block, kept for good
    assert history.next_id([], at, tmp_path) == "v-20261121-11"
    assert json.loads((tmp_path / "config" / "id-blocks.json").read_text(encoding="utf-8"))["blocks"]["space-facts"] == 1
    (tmp_path / "channels" / "space-facts" / "videos" / "v-20261121-11").mkdir(parents=True)
    assert history.next_id([], at, tmp_path) == "v-20261121-12"
    assert history.next_id([], at, tmp_path, fmt="long") == "L-20261121-11"


def test_reid_moves_a_video_and_only_its_own_code(tmp_path, monkeypatch):
    import json
    from generator import history, run
    monkeypatch.setenv("CHANNEL", "space-facts")
    monkeypatch.setattr(history, "fetch_main", lambda root=None: False)
    (tmp_path / "config").mkdir()
    (tmp_path / "config" / "id-blocks.json").write_text(json.dumps({"blocks": {"paisa-panchayat": 0, "space-facts": 1}}), encoding="utf-8")
    v = tmp_path / "channels" / "space-facts" / "videos" / "v-20261121-01"
    v.mkdir(parents=True)
    (v / "script.json").write_text(json.dumps({"beats": [{"params": {"component": "Hook"}}]}), encoding="utf-8")
    (v / "manifest.json").write_text(json.dumps({"id": "v-20261121-01", "release": {"tag": "video-v-20261121-01"}}), encoding="utf-8")
    h = tmp_path / "channels" / "space-facts" / "history"
    h.mkdir()
    (h / "history.json").write_text(json.dumps([{"id": "v-20261121-01"}]), encoding="utf-8")
    code = tmp_path / "remotion" / "src" / "videos" / "v-20261121-01"
    code.mkdir(parents=True)
    (code / "Hook.tsx").write_text('import { P } from "./Parts";\n', encoding="utf-8")
    (code / "Parts.tsx").write_text("export const P = 1;\n", encoding="utf-8")
    (code / "City.tsx").write_text("// the other channel's video of the same id\n", encoding="utf-8")
    (tmp_path / "channels" / "paisa-panchayat" / "videos" / "v-20261121-01").mkdir(parents=True)
    assert run.reid("v-20261121-01", root=tmp_path) == "v-20261121-11"
    nv = tmp_path / "channels" / "space-facts" / "videos" / "v-20261121-11"
    assert json.loads((nv / "manifest.json").read_text(encoding="utf-8"))["release"]["tag"] == "video-v-20261121-11"
    assert json.loads((h / "history.json").read_text(encoding="utf-8")) == [{"id": "v-20261121-11"}]
    assert sorted(p.name for p in (tmp_path / "remotion" / "src" / "videos" / "v-20261121-11").iterdir()) == ["Hook.tsx", "Parts.tsx"]
    assert [p.name for p in code.iterdir()] == ["City.tsx"]
