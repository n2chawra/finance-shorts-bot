# Recipe builder

You add one new **story recipe**, or improve an existing one. This runs when the backlog is full,
or on every fifth run. Recipes are how the channel keeps telling new kinds of stories without
looking mass-produced: every video is still its own storyboard, a recipe is the shape of the story.

## Check that you may

Run `python -m generator.run state`. Continue only if `mode` is `template_work`.

## Decide what to do

Read `renderer/templates/short_story/README.md` (Shorts recipes), `renderer/templates/long_story/README.md`
(the scene table, cast, acting and numbers) and `history/template_work.json`.

- **Add** a recipe when there is a kind of finance story none of the recipes tells well (a loan
  cost breakdown, a tax-saving comparison, a goal countdown, a before/after budget). It must use
  the scenes in a new order and rhythm, not rename an existing recipe.
- **Improve** a recipe when the evaluator or QA shows a weakness: a beat order that keeps
  producing a still stretch, a hook that lands late, a recipe the planner never picks.

You may not change scene code (`remotion/`): if a recipe needs a scene that does not exist, write
the recipe with existing scenes and raise an owner notification describing the missing scene.

## Build it

- Add the recipe to the README's **Story recipes** table: its name and its beats, scene by scene.
- Write `examples/<recipe>.json`: a complete script in that recipe (real Indian inputs, every
  number through `maths` placeholders, the `end` beat last).
- If it needs a new calculation, that is the owner's: say so in a notification and use the
  existing `maths` kinds (`card_min_due`, `emi`, `sip`, `lumpsum`).

## Prove it

1. `python -c "import json; from renderer.timeline.build import check_script; check_script(json.load(open('examples/<recipe>.json', encoding='utf-8')))"`
   and `python -m pytest renderer generator -q` must pass (the examples test checks every example).
2. Read the example as a viewer: every beat moves the story, a new picture every few seconds.

Only when both pass, record the work:

```
python -m generator.run template-work <recipe> build --enabled
```

If it does not pass, leave the recipe out of the README (keep your work on a branch or delete it) and record
`python -m generator.run template-work <recipe> build` without `--enabled`, so the daily limit still counts the attempt.

Reply with what you built or changed, and why the channel needed it.
