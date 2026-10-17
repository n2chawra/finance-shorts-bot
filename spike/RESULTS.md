# Remotion feasibility spike — results

Run 2026-10-17 in the Claude Code cloud routine container (branch `spike/remotion`).

## Environment
- 4 CPUs, 16 GB RAM (15.6 GB free), no swap, 30 GB free disk, x86_64 Linux 6.18, root.
- Node v22.22.0, npm 10.9.4. Python 3.11.17 (default `python3`), 3.12.3, 3.13.16. ffmpeg 6.1.1.
- Remotion 4.0.536. No Chrome installed system-wide; Playwright's Chromium is preinstalled in `/opt/pw-browsers`.

## Stages
Wall seconds and peak RSS come from `/usr/bin/time` (peak RSS covers the `npx` process tree's largest process, so it understates total Chrome memory across workers).

| Stage | Wall s | Peak MB | Exit |
|---|---|---|---|
| setup: apt Chrome libs + time/bc | 4.0 | 81 | 0 |
| setup: `npm ci` | 10.0 | 318 | 0 |
| setup: `remotion browser ensure` | 1.7 | 142 | **1 (blocked download)** |
| short, concurrency 2 (750 frames, 1080x1920) | 114.3 | 1453 | 0 |
| short, concurrency 4 | 78.5 | 586 | 0 |
| long, concurrency 4 (9000 frames, 1920x1080) | 765.9 | 591 | 0 |
| chunks part A (frames 0-899) | 85.7 | 587 | 0 |
| chunks part B (frames 900-1799) | 88.6 | 586 | 0 |
| chunks concat (`-c copy`) | 0.16 | 58 | 0 |
| kokoro pip install (plain) | 0.8 | 42 | 1 (PEP 668) |
| kokoro pip install (`--break-system-packages`) | 55.4 | 109 | 0 |
| kokoro model download (v1.0 onnx + voices) | 14.8 | 12 | 0 |
| kokoro timings (6 voices) | 19.3 | 655 | 0 |

The first three setup rows at the top of `results.jsonl` (exit 127, ~0 s) are from an aborted first attempt: `/usr/bin/time` and `bc` were missing. They were installed with apt and `setup` was re-run (the later rows are the real ones).

## Chrome
- `npx remotion browser ensure` tries `https://remotion.media/chromium-headless-shell-linux-x64-157.0.8080.0.zip`. **Blocked**: first `ENOTFOUND remotion.media` (Node ignores the proxy); with `NODE_USE_ENV_PROXY=1` the egress proxy answers `403` on CONNECT (host not allowed for this session). `--chrome-mode=chrome-for-testing` fails the same way (403, proxy log: `remotion.media:443 connect_rejected`). I did not retry further (policy denial).
- Workaround that worked: `spike/remotion-test/remotion.config.ts` calls `Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell')`, the Playwright headless shell already in the image. All renders used it. Remotion's own Chrome download is not available here; a Playwright-bundled one is, so the pipeline would depend on that preinstalled browser (or on allow-listing `remotion.media`).

## Render speed
Per-frame cost includes bundling and browser start-up (a few seconds) amortised over the frames.

| Render | ms/frame |
|---|---|
| Short, concurrency 2 | 152 |
| Short, concurrency 4 | 105 |
| Long, concurrency 4 | 85 |
| Chunks (900 frames each, c4) | 95-98 |

Output sanity: Short duration 25.0 s (750 frames at 30 fps), 11.1 MB at c2; long duration 300.0 s, 64.6 MB; frames at 30/150/270 s saved as `long-at-*.png`.

Extrapolation at concurrency 4 (the test scenes only; real scenes with the rig/filters may cost more):
- 40 s Short (1200 frames): ~105 ms x 1200 ≈ **126 s** (about 2 min; ~180 s at concurrency 2).
- 5-min long (9000 frames): measured **766 s (12.8 min)**.
- 10-min long (18000 frames): ≈ 85 ms x 18000 ≈ **1530 s (25.5 min)**.

Chunked rendering: two 900-frame ranges rendered separately and joined with `ffmpeg -f concat -c copy` gave a **correct 60.000 s file**, in 0.16 s with no re-encode. So a long video can be rendered as resumable chunks (e.g. 1-minute pieces), each well under the 10-minute foreground cap.

## Kokoro (kokoro-onnx 0.6.1, model files v1.0)
- Python used: **python3.12** (script picks the first below 3.14; plain `pip install` failed with the PEP 668 externally-managed error, fixed with `--break-system-packages`).
- Model download from GitHub releases worked (sha256 in `kokoro-v11-sha256.txt`).
- `has_timings`: **True**. All six voices exist: `hf_alpha, af_heart, af_bella, am_michael, am_fenrir, am_puck` (the install lists 50+ voices).
- Timing entries are **phonemes, not words** (`Timing` objects with `phoneme`, `start`, `end`; 114 entries for the 2-sentence test line, identical count across voices). First 5 for `af_heart`, exactly:
  1. `{"phoneme": "f", "start": 0.1117, "end": 0.1617}`
  2. `{"phoneme": "ˈ", "start": 0.1617, "end": 0.2617}`
  3. `{"phoneme": "a", "start": 0.2617, "end": 0.3367}`
  4. `{"phoneme": "ɪ", "start": 0.3367, "end": 0.3867}`
  5. `{"phoneme": "v", "start": 0.3867, "end": 0.4367}`
  Word-level timing would have to be rebuilt from the phoneme stream (word boundaries show up as `" "` phonemes).
- Synthesis time per voice for ~6.1-7.0 s of audio: 2.4-2.9 s on CPU (about 0.4x real time); the whole 6-voice stage took 19.3 s including model load.

## Problems and handling
1. `/usr/bin/time` and `bc` missing -> `apt-get install time bc`; setup re-run.
2. Remotion Chrome download blocked by egress policy (see above) -> used preinstalled Playwright headless shell via `remotion.config.ts`.
3. `spike/remotion-test` had no `tsconfig.json`, so renders failed instantly -> added a minimal one.
4. `pip install kokoro-onnx` refused by PEP 668 -> retried with `--break-system-packages` (the script's built-in fallback).
5. Chrome libs were already satisfied; apt step only added time/bc and ran in 4 s.

## Verdict
Viable in this environment: a 40 s Short renders in ~2 min and a 5-min video in ~13 min (about 25 min for 10 min), well inside a routine session, as long as long videos use background/chunked renders, the preinstalled Playwright Chromium is used (remotion.media is blocked), and word timing is derived from Kokoro's phoneme stream.
