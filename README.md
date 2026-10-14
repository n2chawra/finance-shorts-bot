# Finance Shorts Bot

See `CLAUDE.md` for the design and `PLAN.md` for milestones and status.

**New here? Read the [project guide](docs/guide/README.md)**: what it does, every flow, each component,
operations and an FAQ, written to explain and present the project.

## Local setup (Windows)

Requirements: Python 3.12+, ffmpeg on PATH (`winget install --id Gyan.FFmpeg -e`).

The venv lives outside OneDrive so it is not synced:

```powershell
py -m venv C:\venvs\finance-shorts-bot
C:\venvs\finance-shorts-bot\Scripts\python.exe -m pip install -r renderer\requirements.txt
```

Run Python through `C:\venvs\finance-shorts-bot\Scripts\python.exe`, or activate the venv with
`C:\venvs\finance-shorts-bot\Scripts\Activate.ps1`.

## Render a video

Four templates, each with an example script in `examples/`: `two_friends_race`, `myth_vs_fact`,
`money_leak_meter`, `quiz_countdown`. Each template folder has a README listing its inputs and
text placeholders.

```powershell
$py = 'C:\venvs\finance-shorts-bot\Scripts\python.exe'
& $py renderer\cli.py examples\quiz_countdown.json             # video.mp4, thumbnail.png, preview.png, render.json
& $py renderer\cli.py examples\quiz_countdown.json --preview   # no video: contact sheet in a few seconds
& $py renderer\cli.py examples\quiz_countdown.json --seed 7    # same script, different palette, music and layout seed
& $py -m pytest renderer -q
```

Output goes to `out/` (gitignored) unless `--out` is given. `render.json` records the resolved
style (palette, genre, key, BPM), any layout-rule problems at the key frames, and audio levels.

A script may pin `style.palette`, `style.genre`, `style.key` and `style.bpm`; whatever it leaves
out is picked from the seed.
