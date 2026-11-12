"""Who speaks with which Kokoro voice. No dependencies, so code outside the renderer (the weekly
loop's evaluator in the Ingest workflow) can read it without numpy, scipy or the voice engine."""

NARRATOR_VOICES = ("am_michael", "af_heart", "af_bella", "am_fenrir")
# each recurring character always speaks with the same voice, so viewers know them by ear
CAST_VOICES = {"rohan": "am_puck", "priya": "hf_alpha", "sharma": "am_fenrir", "sikka": "af_bella"}
