from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path

PROJECT_BACKEND = Path(__file__).resolve().parents[1]
if str(PROJECT_BACKEND) not in sys.path:
    sys.path.insert(0, str(PROJECT_BACKEND))

from app.services.journal import JournalImageInput, build_journal_timeline


def _dt(value: str) -> datetime:
    return datetime.fromisoformat(value)


def _sample_images() -> list[JournalImageInput]:
    return [
        JournalImageInput(
            image_id=1,
            file_name="kyoto_a1.jpg",
            captured_at=_dt("2024-07-09T09:00:00"),
            latitude=35.0110,
            longitude=135.7680,
            has_exif_datetime=True,
            has_exif_gps=True,
            city="Kyoto",
            country="Japan",
        ),
        JournalImageInput(
            image_id=2,
            file_name="kyoto_a2.jpg",
            captured_at=_dt("2024-07-09T09:00:06"),
            latitude=35.01101,
            longitude=135.76801,
            has_exif_datetime=True,
            has_exif_gps=True,
            city="Kyoto",
            country="Japan",
        ),
        JournalImageInput(
            image_id=3,
            file_name="kyoto_a3.jpg",
            captured_at=_dt("2024-07-09T09:18:00"),
            latitude=35.01105,
            longitude=135.76802,
            has_exif_datetime=True,
            has_exif_gps=True,
            city="Kyoto",
            country="Japan",
        ),
        JournalImageInput(
            image_id=4,
            file_name="train_b1.jpg",
            captured_at=_dt("2024-07-09T09:38:00"),
            latitude=35.0050,
            longitude=135.7800,
            has_exif_datetime=True,
            has_exif_gps=True,
            city="Kyoto",
            country="Japan",
        ),
        JournalImageInput(
            image_id=5,
            file_name="station_b2.jpg",
            captured_at=_dt("2024-07-09T09:44:00"),
            latitude=35.0010,
            longitude=135.7900,
            has_exif_datetime=True,
            has_exif_gps=True,
            city="Kyoto",
            country="Japan",
        ),
        JournalImageInput(
            image_id=6,
            file_name="museum_c1.jpg",
            captured_at=_dt("2024-07-09T10:05:00"),
            latitude=35.0000,
            longitude=135.8000,
            has_exif_datetime=True,
            has_exif_gps=True,
            city="Kyoto",
            country="Japan",
        ),
        JournalImageInput(
            image_id=7,
            file_name="museum_c2.jpg",
            captured_at=_dt("2024-07-09T10:25:00"),
            latitude=35.00002,
            longitude=135.80003,
            has_exif_datetime=True,
            has_exif_gps=True,
            city="Kyoto",
            country="Japan",
        ),
        JournalImageInput(
            image_id=8,
            file_name="bad_missing_gps.jpg",
            captured_at=_dt("2024-07-09T11:00:00"),
            latitude=None,
            longitude=None,
            has_exif_datetime=True,
            has_exif_gps=False,
            city="Kyoto",
            country="Japan",
        ),
    ]


def _enrich_observation(observation):
    first_image_id = observation.image_ids[0]

    if first_image_id in {1, 3}:
        observation.poi_name = "Kiyomizu-dera"
        observation.poi_primary_type = "tourist_attraction"
        observation.scene_label = "destination_scene"
        observation.scene_confidence = 0.91
    elif first_image_id in {4, 5}:
        observation.poi_name = "Kyoto Station"
        observation.poi_primary_type = "train_station"
        observation.scene_label = "transport_related_scene"
        observation.scene_confidence = 0.88
    elif first_image_id in {6, 7}:
        observation.poi_name = "Kyoto National Museum"
        observation.poi_primary_type = "museum"
        observation.scene_label = "destination_scene"
        observation.scene_confidence = 0.94

    return observation


def main() -> None:
    timeline = build_journal_timeline(
        _sample_images(),
        observation_enrichers=[_enrich_observation],
    )

    payload = timeline.to_dict()
    print(json.dumps(payload, indent=2, default=str))

    assert len(payload["rejected_images"]) == 1, "Expected one rejected image."
    assert len(payload["observations"]) == 6, "Expected six observations after burst collapse."
    assert len(payload["segments"]) == 3, "Expected stay -> transit -> stay segments."
    assert payload["segments"][0]["segment_type"] == "stay"
    assert payload["segments"][1]["segment_type"] == "transit"
    assert payload["segments"][2]["segment_type"] == "stay"


if __name__ == "__main__":
    main()
