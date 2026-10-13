# Generator

What a routine run does, split between code and Claude:

| Step | Who | How |
|---|---|---|
| Decide the mode | code | `python -m generator.run state` |
| Plan | Claude | `prompts/planner.md`, then `check-plan <id>` |
| Write | Claude | `prompts/writer.md`, then `number-check <id>` |
| Fact review | a fresh subagent | `prompts/fact_reviewer.md`, then `record <id> fact_review …` |
| Render | code | `render <id>` |
| QA review | a fresh subagent | `prompts/qa_reviewer.md`, then `record <id> qa_review …` |
| Ship | code | `ship <id> --release --commit --push` |
| Template work | Claude | `prompts/template_builder.md`, then `template-work …` |

`prompts/routine.md` ties these together. `python -m generator.run --help` lists every command.

- `history.py`: `history/history.json` (one entry per shipped video) and `template_work.json`.
- `variety.py`: the variety rules, checked against history.
- `numbers.py`: finance formulas, the per-template cross-check and the claims check.
- `settings.py`: defaults overlaid with `config/settings.json`.

## Setting up the routine (once, in your Claude account)

At [claude.ai/code/routines](https://claude.ai/code/routines), **New routine**:

- **Name:** Finance Shorts generation
- **Prompt:** `Read generator/prompts/routine.md in this repository and follow it exactly.`
- **Repository:** `n2chawra/finance-shorts-bot`
- **Connectors:** remove all of them. The run needs none.
- **Environment:** create one named `finance-shorts` with:
  - **Setup script:**
    ```
    #!/bin/bash
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y --no-install-recommends ffmpeg || echo "ffmpeg install failed"
    pip install pillow numpy scipy jsonschema || pip install --break-system-packages pillow numpy scipy jsonschema || echo "pip install failed"
    exit 0
    ```
    The script must exit zero or the session never starts, so it reports failures instead of
    stopping; the routine prompt re-checks ffmpeg and the Python packages itself. It does not
    read files from the repository, because the script's working directory is not guaranteed.
  - **Network access:** Custom, with "Also include default list of common package managers"
    ticked, and `uploads.github.com` added to Allowed domains (release assets upload there).
  - No environment variables. Do not set `GH_TOKEN`: the GitHub proxy signs requests itself.
- **Trigger:** Schedule. The form only offers presets, so pick Daily, save, then in a local
  Claude Code terminal run `/schedule update` and set the cron expression to `7 */6 * * *`
  (every 6 hours at :07). One hour is the shortest interval allowed.

The routine pushes to `main`. That works because the prompt file tells it to; without that it
would push to a `claude/` branch.

Use **Run now** for the first runs and read each session's final report: a green status only
means the session ended, not that a video was made.
