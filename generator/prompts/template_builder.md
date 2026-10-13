# Template builder

You build one new video template, or improve an existing one. This runs when the backlog is
full, or on every fifth run. More templates mean more variety, which is what keeps the channel
from looking mass-produced.

## Check that you may

Run `python -m generator.run state`. Continue only if `mode` is `template_work`.
While `template_work.may_add_template` is true, **add a new template**: the channel needs more of
them so that no template repeats within six videos. Only when it is false, improve an existing one.

## Decide what to do

Read `renderer/templates/*/README.md` and `history/template_work.json`.

- **Add** a template when there is a kind of finance story none of the current ones can tell
  (a loan cost breakdown, a tax-saving comparison, a goal countdown, a before/after budget).
  It must look and move differently from the existing templates, not be one of them re-skinned.
- **Improve** a template when it has a visible weakness: a scene that is static for more than
  five seconds, a layout that wastes the frame, an input range it handles badly.

## Build it

Follow `renderer/templates/quiz_countdown/` as the model.

- `template.py`: a subclass of `renderer.engine.video.Video`. Set `duration` (45–60 s),
  `thumbnail_time` and eight `key_times`. Fill `self.scenes`, `self.impacts`, `self.punches` and
  `self.flashes`. Implement `audio()` with `self.mixer(...)` and `self.scene_whooshes(...)`.
- Compute every displayed figure in `__init__` from the script inputs, and pass them all to
  `self.fill(...)` so scripts can use them as placeholders. Reject scripts whose inputs make the
  story false.
- Use `self.pal` and `self.style.looks` for all colours and characters. Never hard-code a colour.
- Use `self.end_scene(...)` or `self.outro(...)` so the disclaimer is always shown.
- A hook in the first second. Something new on screen every 3–5 seconds.
- `schema.json`: inputs only, `additionalProperties: false`, the shared `style` block copied
  from another template, every text key listed with `maxLength` 40.
- `README.md`: inputs, placeholders with examples, the maths.
- `examples/<name>.json`: a working script.
- Add the template's closed-form figures to `EXPECTED` in `generator/numbers.py`.

## Prove it

1. `python -m pytest renderer generator -q` must pass. The shared tests pick up the new template
   automatically and check layout rules through every second, in every palette.
2. Render two test videos with different seeds and inputs:
   `python renderer/cli.py examples/<name>.json --out out/<name>-a` and again with `--seed`.
3. Look at both `preview.png` files against the QA reviewer's checklist
   (`generator/prompts/qa_reviewer.md`). Fix what you find and render again.

Only when both test videos pass, record the work:

```
python -m generator.run template-work <name> build --enabled
```

If it does not pass, leave the template out of `renderer/templates/` (keep your work on a branch
or delete it) and record `python -m generator.run template-work <name> build` without
`--enabled`, so the daily limit still counts the attempt.

Reply with what you built or changed, and what the two test renders showed.
