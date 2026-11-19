"""The media sources, by name."""
from __future__ import annotations

from .base import Provider
from .commons import Commons
from .edgar import Edgar
from .pexels import Pexels
from .pixabay import Pixabay

PROVIDERS: dict[str, type[Provider]] = {"pexels": Pexels, "pixabay": Pixabay, "commons": Commons, "edgar": Edgar}


def get(name: str) -> Provider:
    from ..store import MediaError
    if name not in PROVIDERS:
        raise MediaError(f"unknown source {name!r}: one of {', '.join(PROVIDERS)}")
    return PROVIDERS[name]()
