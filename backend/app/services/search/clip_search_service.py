from __future__ import annotations

from pathlib import Path
from typing import Any

from app.services.shared.clip_service import analyze_image_by_axes


def analyze_search_clip(image_path: str | Path) -> dict[str, Any]:
    result = analyze_image_by_axes(image_path)
    return {
        "summary": result.get("summary"),
        "gate": result.get("gate"),
        "scene_hints": result.get("scene_hints", []),
    }
