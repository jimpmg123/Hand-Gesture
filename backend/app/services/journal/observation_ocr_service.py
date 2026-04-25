from __future__ import annotations

from pathlib import Path

from app.services.journal.contracts import JournalObservation
from app.services.shared.ocr_service import extract_text_with_cloud_vision


def enrich_observation_ocr(
    observation: JournalObservation,
    *,
    language_hints: list[str] | None = None,
) -> JournalObservation:
    if observation.scene_label != "document_like":
        return observation

    if not observation.representative_image_path:
        raise ValueError(
            f"Observation {observation.observation_id} is document_like but has no representative_image_path."
        )

    image_path = Path(observation.representative_image_path)
    ocr_result = extract_text_with_cloud_vision(
        image_path,
        language_hints=language_hints,
    )
    observation.ocr_text = ocr_result["extracted_text"]
    observation.ocr_locale = ocr_result["locale"]
    return observation
