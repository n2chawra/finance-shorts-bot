"""Merge the audit screenshots into one file per evidence box (the form takes one file per box).

    python docs/channel/merge_evidence.py

Reads docs/channel/evidence/raw/*.png|jpg, writes docs/channel/evidence/upload/<box>.pdf, one page
per screenshot in name order. Screenshots below 1280×720 are reported, not upscaled.
"""
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
RAW, OUT = HERE / "evidence" / "raw", HERE / "evidence" / "upload"

BOXES = {
    "privacy-policy-page.pdf": "privacy",
    "homepage-with-privacy-link.pdf": "homepage",
    "terms-of-service-page.pdf": "terms",
    "oauth-consent-scopes-revocation.pdf": "oauth",
    "upload-interface.pdf": "upload",
    "dashboard-analytics.pdf": "dashboard",
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    files = sorted(p for p in RAW.glob("*") if p.suffix.lower() in {".png", ".jpg", ".jpeg"})
    for pdf, prefix in BOXES.items():
        shots = [p for p in files if p.name.lower().startswith(prefix)]
        if not shots:
            print(f"MISSING  {pdf:40s} (no {prefix}*.png in evidence/raw)")
            continue
        pages = [Image.open(p).convert("RGB") for p in shots]
        small = [p.name for p, im in zip(shots, pages) if im.width < 1280 or im.height < 720]
        pages[0].save(OUT / pdf, save_all=True, append_images=pages[1:], resolution=144)
        size = (OUT / pdf).stat().st_size / 1e6
        print(f"ok       {pdf:40s} {len(pages)} page(s), {size:.1f} MB" + (f"  BELOW 1280x720: {', '.join(small)}" if small else ""))


if __name__ == "__main__":
    main()
