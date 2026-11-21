import json
from pathlib import Path

from generator import planrules
from generator.channels import cpath


def test_map_answer_is_checked_only_where_the_channel_asks(tmp_path: Path) -> None:
    plan = {"topic": {"title": "Why is Gambia so thin?"}}
    assert planrules.check_plan(plan, tmp_path) == []          # no plan-rules.json: nothing asked
    f = cpath(tmp_path, planrules.FILE)
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps({"mapAnswer": {"since": "2026-11-21"}}), encoding="utf-8")
    assert "missing" in planrules.check_plan(plan, tmp_path)[0]
    plan["topic"]["map_answer"] = "how the turbine inside the mountain pumps water"
    assert "can't show" in planrules.check_plan(plan, tmp_path)[0]
    plan["topic"]["map_answer"] = "something very interesting happens"
    assert "nothing a map draws" in planrules.check_plan(plan, tmp_path)[0]
    plan["topic"]["map_answer"] = "Senegal wraps round a thin strip along the Gambia river"
    assert planrules.check_plan(plan, tmp_path) == []
    plan["topic"]["map_answer"] = "two rings of borders: the camera pulls out from each country to the nearest coast"
    assert planrules.check_plan(plan, tmp_path) == []
