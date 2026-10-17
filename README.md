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

Videos are drawn by Remotion (`remotion/`) from a storyboard script; Python computes the numbers,
speaks the lines (Kokoro, `scripts/setup-voice.sh`) and mixes the sound. Examples in `examples/`:
`short_story` (a Short), `news_story` (a news Short), `long_story` (a long video). The writer's
contract is `renderer/templates/<template>/README.md`.

```powershell
$py = 'C:\venvs\fsb-py312\Scripts\python.exe'          # Python 3.12 with kokoro-onnx 0.6.1
cd remotion; npm ci; cd ..
& $py -m renderer.timeline.build examples\short_story.json --out out\short    # timeline.json + audio.wav
& $py -m renderer.remotion out\short\timeline.json --out out\short --stills-only   # stills + preview.png
& $py -m renderer.remotion out\short\timeline.json --out out\short                 # video.mp4, render.json
& $py -m pytest renderer generator -q
```

`--voice estimate` on the build skips Kokoro (timing from word counts, no voice) for quick checks.
`render.json` records the length, style, voice, audio levels and the liveliness score.
