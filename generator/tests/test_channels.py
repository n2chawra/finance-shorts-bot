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
