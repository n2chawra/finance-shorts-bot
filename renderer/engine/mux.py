"""Encode frames + a WAV into an mp4 by piping raw RGB to ffmpeg."""
import shutil
import subprocess
import tempfile
from collections.abc import Iterable
from pathlib import Path

from PIL import Image

from .canvas import FPS, H, W


def find_ffmpeg() -> str:
    exe = shutil.which("ffmpeg")
    if not exe:
        raise RuntimeError("ffmpeg not found on PATH")
    return exe


def encode(frames: Iterable[Image.Image], wav_path: str | Path, out_path: str | Path,
           fps: int = FPS, crf: int = 20, preset: str = "medium") -> None:
    """H.264 (yuv420p) + AAC 192k, faststart. Raises RuntimeError with ffmpeg's output on failure."""
    cmd = [find_ffmpeg(), "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(fps), "-i", "-", "-i", str(wav_path),
           "-c:v", "libx264", "-preset", preset, "-crf", str(crf), "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(out_path)]
    with tempfile.TemporaryFile() as err:
        ff = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=err)
        try:
            for im in frames:
                ff.stdin.write(im.tobytes())
            ff.stdin.close()
        except OSError:
            pass  # ffmpeg died early; its exit code and stderr are reported below
        if ff.wait() != 0:
            err.seek(0)
            raise RuntimeError("ffmpeg failed: " + err.read().decode(errors="replace").strip())
