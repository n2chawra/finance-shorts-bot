import json
from pathlib import Path

from generator import experiments



def write(root: Path, exps: list[dict]) -> None:
    (root / "config" / "experiments.json").write_text(json.dumps({"experiments": exps}), encoding="utf-8")


def test_variant_is_deterministic_and_about_half() -> None:
    ids = [f"v-202610{d:02d}-{i:02d}" for d in range(1, 31) for i in range(1, 4)] + [f"v-x-{i}" for i in range(200)]
    first = [experiments.variant("e1", v) for v in ids]
    assert first == [experiments.variant("e1", v) for v in ids]
    assert 0.4 < first.count("on")/len(first) < 0.6
    # a different experiment splits the same videos differently
    assert first != [experiments.variant("e2", v) for v in ids]


def test_every_day_has_both_groups() -> None:
    for e in ("voiceover", "e1", "e2"):
        for d in range(1, 31):
            day = [experiments.variant(e, f"v-202610{d:02d}-{i:02d}") for i in range(1, 4)]
            assert set(day) == {"on", "off"}, (e, d, day)


def test_share_controls_the_on_fraction() -> None:
    ids = [f"v-x-{i}" for i in range(300)]
    assert all(experiments.variant("e", v, 1.0) == "on" for v in ids)
    assert all(experiments.variant("e", v, 0.0) == "off" for v in ids)


def test_only_running_experiments_for_matching_templates(root: Path) -> None:
    write(root, [{"id": "a", "templates": ["quiz_countdown"]}, {"id": "b", "templates": ["all"]},
                 {"id": "c", "status": "reverted"}])
    assert set(experiments.for_video("v-1", "quiz_countdown", root)) == {"a", "b"}
    assert set(experiments.for_video("v-1", "myth_vs_fact", root)) == {"b"}


def test_no_file_means_no_experiments(root: Path) -> None:
    assert experiments.for_video("v-1", "quiz_countdown", root) == {}
