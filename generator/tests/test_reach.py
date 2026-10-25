from generator import reach

TODAY = "2026-10-24"


def entry(i: int, r: str | None, day: str = "2026-10-20") -> dict:
    topic = {"title": f"t{i}"} | ({"reach": r} if r else {})
    return {"id": f"v-{i}", "created_at": f"{day}T00:00:00+00:00", "topic": topic}


def plan(r: str, currency: str = "USD", why: dict | None = None, views: int = 500_000) -> dict:
    topic = {"reach": r} | ({"reach_reason": why} if why else {})
    return {"topic": topic, "currency": currency, "demand": {"views": views}}


def test_global_passes_and_needs_usd():
    assert reach.check_plan(plan("global"), [], TODAY, "short") == []
    assert reach.check_plan(plan("global", "INR"), [], TODAY, "short")


def test_reach_is_required():
    assert reach.check_plan({"topic": {}, "currency": "USD"}, [], TODAY, "short")


def test_local_needs_a_reason():
    assert reach.check_plan(plan("local", "INR"), [], TODAY, "short")
    diwali = {"kind": "occasion", "name": "Diwali", "date": "2026-11-06"}
    assert reach.check_plan(plan("local", "INR", diwali), [], TODAY, "short") == []
    far = {"kind": "occasion", "name": "Holi", "date": "2027-03-04"}
    assert reach.check_plan(plan("local", "INR", far), [], TODAY, "short")
    assert reach.check_plan(plan("local", "INR", {"kind": "demand"}, views=2_000_000), [], TODAY, "short") == []
    assert reach.check_plan(plan("local", "INR", {"kind": "demand"}), [], TODAY, "short")


def test_locals_stay_a_minority():
    big = {"kind": "demand"}
    history = [entry(i, "local" if i < 4 else "global") for i in range(10)]
    assert any("local" in p for p in reach.check_plan(plan("local", "INR", big, 2_000_000), history, TODAY, "short"))
    history = [entry(i, "local" if i < 3 else "global") for i in range(10)]
    assert reach.check_plan(plan("local", "INR", big, 2_000_000), history, TODAY, "short") == []
    assert reach.for_state(history, TODAY, "short")["local_allowed"]


def test_one_local_short_a_day():
    big = {"kind": "demand"}
    history = [entry(0, "local", "2026-10-24")]
    assert reach.check_plan(plan("local", "INR", big, 2_000_000), history, TODAY, "short")
    assert not reach.for_state(history, TODAY, "short")["local_allowed"]


def test_old_history_without_reach_is_not_counted():
    history = [entry(i, None) for i in range(10)]
    assert reach.for_state(history, TODAY, "short")["recent"] == []


def test_malformed_reason_or_demand_is_a_problem_not_a_crash():
    # the planner is an LLM: "1.2M" views or a bare string reason must come back as problems
    p = plan("local", "INR", {"kind": "demand"})
    p["demand"] = {"views": "1.2M"}
    assert reach.check_plan(p, [], TODAY, "short")
    p["demand"] = "a 1M video"
    assert reach.check_plan(p, [], TODAY, "short")
    p = plan("local", "INR")
    p["topic"]["reach_reason"] = "Diwali"
    assert reach.check_plan(p, [], TODAY, "short")
