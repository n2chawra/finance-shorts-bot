

def test_a_realistic_channel_refuses_a_flat_drawn_thumbnail():
    # Disaster Desk, 2026-11-28: the flat-drawn Colgan cover (./planedraw, no kit) next to the 3D Hyatt one (../../three)
    from renderer import thumbs as th
    rules = {"kits": ["three", "disaster", "doc"], "requireMark": True}
    custom = {"layout": "custom", "component": "Thumb", "mark": "Continental Connection livery on the tail"}
    assert th.kits_used("L-20261121-42", custom) >= {"three"}
    assert th.realism_problems("L-20261121-42", [("a", custom)], rules) == []
    flat = th.realism_problems("L-20261126-41", [("a", custom)], rules)
    assert any("realistic kits" in p for p in flat), flat
    assert any("`mark`" in p for p in th.realism_problems("L-20261121-42", [("a", {**custom, "mark": ""})], rules))
    assert th.realism_problems("L-20261126-41", [("a", custom)], None) == []   # a channel without the rule
