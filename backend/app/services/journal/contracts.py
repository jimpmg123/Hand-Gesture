from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Any


# Bundle the minimum input data needed for one image before it enters the Journal pipeline.
@dataclass(slots=True)
class JournalImageInput:
    image_id: int
    captured_at: datetime | None
    latitude: float | None
    longitude: float | None
    has_exif_datetime: bool
    has_exif_gps: bool
    file_name: str | None = None
    absolute_path: str | None = None
    country: str | None = None
    city: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


# Record why an image was excluded from Journal processing.
@dataclass(slots=True)
class JournalImageRejection:
    image_id: int
    reason_code: str
    reason: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


# An observation is an intermediate unit that groups burst images into a single moment.
@dataclass(slots=True)
class JournalObservation:
    observation_id: str
    observation_order: int
    image_ids: list[int]
    representative_image_id: int
    representative_image_path: str | None
    observation_kind: str
    start_time: datetime
    end_time: datetime
    center_latitude: float
    center_longitude: float
    image_count: int
    country_snapshot: str | None = None
    city_snapshot: str | None = None
    formatted_address: str | None = None
    english_location_hint: str | None = None
    poi_place_id: str | None = None
    poi_name: str | None = None
    poi_primary_type: str | None = None
    poi_distance_meters: float | None = None
    nearest_poi_name: str | None = None
    nearest_poi_primary_type: str | None = None
    nearest_poi_formatted_address: str | None = None
    scene_label: str | None = None
    scene_confidence: float | None = None
    ocr_text: str | None = None
    ocr_locale: str | None = None
    document_type: str = "none"
    document_confidence: float | None = None
    suggested_segment_type: str | None = None
    stay_score: float = 0.0
    transit_score: float = 0.0
    classification_reason: str | None = None

    # Compute observation duration in seconds.
    def duration_seconds(self) -> float:
        return max((self.end_time - self.start_time).total_seconds(), 0.0)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


# A segment is the stay/transit unit shown in the final journal timeline.
@dataclass(slots=True)
class JournalSegment:
    segment_id: str
    segment_order: int
    segment_type: str
    is_inferred: bool
    observation_ids: list[str]
    image_ids: list[int]
    poi_place_id: str | None
    location_name: str | None
    country: str | None
    city: str | None
    start_time: datetime
    end_time: datetime
    duration_minutes: int | None
    formatted_address: str | None = None
    english_location_hint: str | None = None
    travel_mode: str | None = None
    travel_distance_km: float | None = None
    generated_text: str | None = None
    edited_text: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


# Bundle the full result of a single Journal generation request.
@dataclass(slots=True)
class JournalTimeline:
    eligible_images: list[JournalImageInput]
    rejected_images: list[JournalImageRejection]
    observations: list[JournalObservation]
    segments: list[JournalSegment]

    def to_dict(self) -> dict[str, Any]:
        return {
            "eligible_images": [image.to_dict() for image in self.eligible_images],
            "rejected_images": [rejection.to_dict() for rejection in self.rejected_images],
            "observations": [observation.to_dict() for observation in self.observations],
            "segments": [segment.to_dict() for segment in self.segments],
        }
