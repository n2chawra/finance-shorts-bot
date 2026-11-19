"""Licensed media for the business-documentary channel: stock footage, real photos and filings.

For `business-documentaries-rise-and-fall-of` only, the owner lifted the "Commons only, no downloads"
rule (2026-11-19): it may use licensed stock (Pexels, Pixabay), Wikimedia Commons photos and video,
and SEC EDGAR filings as document props. Every other channel keeps Commons only
(`generator/images.py`); `STOCK_CHANNELS` below is the switch.

Files live in a cache outside git (MEDIA_CACHE, default E:\\media-cache\\<slug>\\) and are copied into
remotion/public/media/<slug>/ (git-ignored) for a render. Every asset has one record in
channels/<slug>/media/licences.json: the licence as it was on the day it was fetched, who to credit,
what it may not be used for, and the file's sha256. A script names an asset as `media:<id>`
(`clip:<id>` and `doc:<id>` read the same), and `check` fails a script that uses an asset with no
record or a licence the channel can't use.

    python -m generator.media search --channel <slug> --kind video "trading floor"
    python -m generator.media fetch  --channel <slug> pexels:video:856172
    python -m generator.media edgar  --channel <slug> --cik LEH --form 10-K --year 2008 --find "going concern"
    python -m generator.media credits --channel <slug> <video id>
    python -m generator.media check   --channel <slug> <script.json>
    python -m generator.media stage   --channel <slug> <video id | script.json>
    python -m generator.media list    --channel <slug>
"""

# Channels allowed to fetch beyond Wikimedia Commons (owner, 2026-11-19). Commons works for every channel.
STOCK_CHANNELS = frozenset({"business-documentaries-rise-and-fall-of"})
