"""A deleted channel: `state` tells its routine to stop, and no other command runs for it."""
import json

from generator import channels
from generator.run import main


def _repo(tmp_path, entries: dict, folders: list[str]):
    (tmp_path / "config").mkdir()
    (tmp_path / "config" / "channels.json").write_text(json.dumps({"channels": entries}))
    for f in folders:
        (tmp_path / "channels" / f).mkdir(parents=True)
    return tmp_path


def test_deleted_when_unlisted_deleting_or_folder_gone(tmp_path):
    root = _repo(tmp_path, {"live": {"status": "active"}, "resting": {"status": "paused"}, "going": {"status": "deleting"},
                            "nofolder": {"status": "active"}}, ["live", "resting", "going", "unlisted"])
    assert not channels.deleted("live", root)
    assert not channels.deleted("resting", root)
    assert channels.deleted("going", root)          # the owner pressed Delete; the workflow hasn't run yet
    assert channels.deleted("unlisted", root)       # ingest leaves a deleting channel out of channels.json
    assert channels.deleted("nofolder", root)       # delete-channel.yml removed its folder
    assert channels.all_channels(root) == ["live", "resting", "unlisted"]


def test_temporary_repos_have_no_deleted_channel(tmp_path):
    assert not channels.deleted("anything", tmp_path)


def test_state_stops_for_a_deleted_channel(monkeypatch, capsys):
    monkeypatch.setenv("CHANNEL", channels.default())   # recorded, so the test restores it
    assert main(["state", "--channel", "no-such-channel-xyz"]) == 0
    assert json.loads(capsys.readouterr().out)["stop"] == "channel deleted"
    assert main(["state", "--format", "long", "--channel", "no-such-channel-xyz"]) == 0
    assert json.loads(capsys.readouterr().out)["stop"] == "channel deleted"
    assert main(["fail", "v-20990101-01", "--reason", "x", "--channel", "no-such-channel-xyz"]) == 2


def test_state_runs_for_the_default_channel(monkeypatch, capsys):
    monkeypatch.setenv("CHANNEL", channels.default())
    assert main(["state"]) == 0
    assert "stop" not in json.loads(capsys.readouterr().out)
