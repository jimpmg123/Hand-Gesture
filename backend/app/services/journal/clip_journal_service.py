from __future__ import annotations

from pathlib import Path
from typing import Any

from app.services.journal.contracts import JournalObservation
from app.services.shared.clip_service import analyze_image_with_clip

DEFAULT_JOURNAL_CLIP_LABELS = [
    "destination scene",
    "transport-related scene",
    "food photo",
    "document-like image",
    "generic scene",
]

LABEL_MAPPING = {
    "destination scene": "destination_scene",
    "transport-related scene": "transport_related_scene",
    "food photo": "food_photo",
    "document-like image": "document_like",
    "generic scene": "generic_scene",
}


# Wrap raw CLIP output in the label set used by Journal classification.
def classify_image_for_journal(
    image_path: str | Path,
    *,
    candidate_labels: list[str] | None = None,
    top_k: int = 5,
) -> dict[str, Any]:
    result = analyze_image_with_clip(
        image_path=image_path,
        candidate_labels=candidate_labels or DEFAULT_JOURNAL_CLIP_LABELS,
        top_k=top_k,
    )

    top_match = result["top_match"]
    raw_label = top_match["label"]
    normalized_label = LABEL_MAPPING.get(raw_label, raw_label.replace(" ", "_").replace("-", "_"))

    return {
        "file_name": result["file_name"],
        "absolute_path": result["absolute_path"],
        "model_id": result["model_id"],
        "device": result["device"],
        "scene_label": normalized_label,
        "scene_confidence": top_match["score"],
        "matches": [
            {
                "scene_label": LABEL_MAPPING.get(match["label"], match["label"]),
                "score": match["score"],
            }
            for match in result["matches"]
        ],
    }


# Fill the scene label using the observation's representative image.
def enrich_observation_scene(observation: JournalObservation) -> JournalObservation:
    if not observation.representative_image_path:
        return observation

    result = classify_image_for_journal(observation.representative_image_path)
    observation.scene_label = result["scene_label"]
    observation.scene_confidence = result["scene_confidence"]
    return observation
