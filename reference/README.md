# Prototype renderer

`rahul_vs_amit_v2.py` is the working prototype: one hard-coded 60 s Short (two friends, SIP at 25 vs 35)
with synthesized music and SFX. `rahul_vs_amit_sip_short_v2.mp4` is its output.

Run: `python rahul_vs_amit_v2.py out.mp4` (needs ffmpeg, Pillow, numpy, scipy, Poppins fonts).
Preview frames instead of a video: `python rahul_vs_amit_v2.py x 3 12.8 46.4` → PNGs at those seconds.

Fonts load from `assets/fonts/` (resolved relative to the script). Output files (`audio.wav`, PNGs,
mp4) are written to the current directory, so run it from a scratch folder outside the repo.
