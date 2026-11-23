"""A deleted channel, or none named: `state` tells its routine to stop, and no other command runs for it."""
import json

from generator import channels
from generator.run import main


def _repo(tmp_path, entries: dict, folders: list[str]):
    (tmp_path / "config").mkdir()
    (tmp_path / "config" / "channels.json").write_text(json.dumps({"channels": entries}))
    for f in folders:
        (tmp_path / "channels" / f).mkdir(parents=True)
    return tmp_path


def test_deleted_when_deleting_or_folder_gone(tmp_path):
    root = _repo(tmp_path, {"live": {"status": "active"}, "resting": {"status": "paused"}, "going": {"status": "deleting"},
                            "gone": {"status": "deleted"}, "nofolder": {"status": "active"}},
                 ["live", "resting", "going", "gone", "unlisted"])
    assert not channels.deleted("live", root)
    assert not channels.deleted("resting", root)
    assert channels.deleted("going", root)          # the owner pressed Delete; the workflow hasn't run yet
    assert channels.deleted("gone", root)
    assert not channels.deleted("unlisted", root)   # a partial channels.json never stops a live channel
    assert channels.deleted("nofolder", root)       # delete-channel.yml removed its folder
    assert channels.all_channels(root) == ["live", "resting", "unlisted"]


def test_a_partial_channels_json_stops_nothing(tmp_path):
    root = _repo(tmp_path, {"live": {"status": "active"}}, ["live", "other"])
    assert not channels.deleted("other", root)
    assert channels.all_channels(root) == ["live", "other"]


def test_status_alone_marks_deleted_without_folders(tmp_path):
    root = _repo(tmp_path, {"going": {"status": "deleting"}}, [])
    assert channels.deleted("going", root)
    assert not channels.deleted("anything", root)


def test_temporary_repos_have_no_deleted_channel(tmp_path):
    assert not channels.deleted("anything", tmp_path)


def test_state_stops_for_a_deleted_channel(monkeypatch, capsys):
    monkeypatch.setenv("CHANNEL", channels.default())   # recorded, so the test restores it
    assert main(["state", "--channel", "no-such-channel-xyz"]) == 0
    assert json.loads(capsys.readouterr().out)["stop"] == "channel deleted"
    assert main(["state", "--format", "long", "--channel", "no-such-channel-xyz"]) == 0
    assert json.loads(capsys.readouterr().out)["stop"] == "channel deleted"
    assert main(["fail", "v-20990101-01", "--reason", "x", "--channel", "no-such-channel-xyz"]) == 2


def test_no_channel_named_stops_state_and_refuses_the_rest(monkeypatch, capsys):
    monkeypatch.setenv("CHANNEL", channels.default())   # recorded, so the test restores it
    monkeypatch.delenv("CHANNEL")
    assert main(["state"]) == 0
    assert json.loads(capsys.readouterr().out)["stop"] == "no channel"
    assert main(["state", "--format", "long"]) == 0
    assert json.loads(capsys.readouterr().out)["stop"] == "no channel"
    for cmd in (["fail", "v-20990101-01", "--reason", "x"], ["ship", "v-20990101-01"], ["render", "v-20990101-01"],
                ["record", "v-20990101-01", "writer", "--passed"], ["prune-feed"], ["template-work", "t", "build"],
                ["rank"], ["failures"], ["prompt", "director"]):
        assert main(cmd) == 2, cmd
        assert "no channel" in capsys.readouterr().err


def test_state_runs_for_a_named_channel(monkeypatch, capsys):
    monkeypatch.setenv("CHANNEL", channels.default())   # recorded, so the test restores it
    monkeypatch.delenv("CHANNEL")
    assert main(["state", "--channel", channels.default()]) == 0
    assert "stop" not in json.loads(capsys.readouterr().out)
    monkeypatch.setenv("CHANNEL", channels.default())
    assert main(["state"]) == 0
    assert "stop" not in json.loads(capsys.readouterr().out)
