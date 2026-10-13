# Finance Shorts Bot

See `CLAUDE.md` for the design and `PLAN.md` for milestones and status.

## Local setup (Windows)

Requirements: Python 3.12+, ffmpeg on PATH (`winget install --id Gyan.FFmpeg -e`).

The venv lives outside OneDrive so it is not synced:

```powershell
py -m venv C:\venvs\finance-shorts-bot
C:\venvs\finance-shorts-bot\Scripts\python.exe -m pip install -r renderer\requirements.txt
```

Run Python through `C:\venvs\finance-shorts-bot\Scripts\python.exe`, or activate the venv with
`C:\venvs\finance-shorts-bot\Scripts\Activate.ps1`.
