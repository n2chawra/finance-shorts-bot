"""Spike: does kokoro-onnx 0.6 + model-files-v1.1 give usable timings for our six voices?

Usage: python spike/kokoro_timings.py <model dir> <out.json>
Records, per voice: whether it exists, audio length, how many timing entries came back, and the
first entries exactly as the library returns them (so we can see whether they are words or
phonemes, and which fields they carry).
"""
import json
import sys
import time
from pathlib import Path

from kokoro_onnx import Kokoro

VOICES = ("hf_alpha", "af_heart", "af_bella", "am_michael", "am_fenrir", "am_puck")
TEXT = ("Five thousand rupees a month, for twenty five years. "
        "That is how a small habit quietly becomes a crore.")


def describe(entry: object) -> object:
    if hasattr(entry, "_asdict"):
        return {k: (round(v, 4) if isinstance(v, float) else v) for k, v in entry._asdict().items()}
    if hasattr(entry, "__dict__"):
        return {k: (round(v, 4) if isinstance(v, float) else v) for k, v in vars(entry).items()}
    return repr(entry)


def main() -> None:
    model_dir, out = Path(sys.argv[1]), Path(sys.argv[2])
    k = Kokoro(str(model_dir / "kokoro-v1.0.onnx"), str(model_dir / "voices-v1.0.bin"))
    result = {"has_timings": getattr(k, "has_timings", None), "available_voices": sorted(k.get_voices()), "voices": {}}
    for v in VOICES:
        if v not in result["available_voices"]:
            result["voices"][v] = {"present": False}
            continue
        started = time.time()
        samples, sr, timings = k.create_timed(TEXT, voice=v, speed=1.1, lang="en-us")
        result["voices"][v] = {
            "present": True, "seconds_audio": round(len(samples)/sr, 2), "synth_seconds": round(time.time() - started, 2),
            "timing_entries": len(timings), "timing_type": type(timings[0]).__name__ if timings else None,
            "first_entries": [describe(t) for t in timings[:25]],
        }
    out.write_text(json.dumps(result, indent=1, default=str), encoding="utf-8")


if __name__ == "__main__":
    main()
