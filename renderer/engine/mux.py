"""ffmpeg, which muxes the voice and music onto Remotion's silent video (renderer/remotion.py)."""
import shutil


def find_ffmpeg() -> str:
    exe = shutil.which("ffmpeg")
    if not exe:
        raise RuntimeError("ffmpeg not found on PATH")
    return exe
