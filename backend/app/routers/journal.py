from __future__ import annotations

from datetime import datetime
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any
import re

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.journal import JournalImageInput, JournalObservation, build_journal_timeline
from app.services.shared.exif_service import extract_image_metadata
from app.services.shared.places_service import enrich_coordinates_with_place_context, search_nearby_pois

router = APIRouter()

DESTINATION_POI_KEYWORDS = (
    "tourist_attraction",
    "market",
    "historical",
    "landmark",
    "museum",
    "park",
    "shrine",
    "temple",
    "place_of_worship",
    "church",
    "monument",
    "visitor_center",
)

FOOD_POI_KEYWORDS = (
    "restaurant",
    "cafe",
    "bakery",
    "meal_takeaway",
    "meal_delivery",
    "food",
    "food_store",
)

ANCHOR_POI_RADIUS_METERS = 1500.0
ANCHOR_POI_MAX_RESULTS = 20
ANCHOR_SUBFEATURE_KEYWORDS = (
    "gate",
    "office",
    "security",
    "stable",
    "statue",
    "store",
    "shop",
    "cafe",
    "restaurant",
    "snack",
    "dessert",
    "bakery",
    "coffee",
    "burger",
    "ramen",
    "gallery",
)


def _address_first_token(formatted_address: str | None) -> str | None:
    if not formatted_address:
        return None

    first_part = formatted_address.split(",")[0].strip()
    return first_part or None


def _normalize_place_types(place: dict[str, Any]) -> list[str]:
    values = [place.get("primary_type"), *(place.get("types") or [])]
    normalized: list[str] = []
    for value in values:
        if not value:
            continue
        normalized.append(str(value).strip().lower().replace(" ", "_"))
    return normalized


def _extract_anchor_name(place_name: str | None) -> str | None:
    if not place_name:
        return None

    patterns = (
        r"([^\s()]+市場)",
        r"([A-Za-z][A-Za-z0-9' -]*?\bMarket\b)",
        r"([A-Za-z0-9']+-dera)",
        r"([^\s()]+寺)",
        r"([^\s()]+神社)",
        r"([A-Za-z][A-Za-z0-9' -]*?\bTemple\b)",
        r"([A-Za-z][A-Za-z0-9' -]*?\bShrine\b)",
    )

    for pattern in patterns:
        match = re.search(pattern, place_name, flags=re.IGNORECASE)
        if match:
            return match.group(1).strip()

    return None


def _anchor_candidate_score(place: dict[str, Any]) -> int:
    name = str(place.get("name") or "")
    lower_name = name.lower()
    score = 0

    if _place_matches_keywords(place, DESTINATION_POI_KEYWORDS):
        score += 4

    extracted_anchor = _extract_anchor_name(name)
    if extracted_anchor:
        score += 10

    if any(keyword in lower_name for keyword in ANCHOR_SUBFEATURE_KEYWORDS):
        score -= 4

    if _place_matches_keywords(place, FOOD_POI_KEYWORDS):
        score -= 3

    if place.get("primary_type") in {"service", "store", "general_store", "association_or_organization"}:
        score -= 3

    return score


def _select_anchor_poi(
    place_context: dict[str, Any],
    *,
    latitude: float,
    longitude: float,
) -> dict[str, Any]:
    broader_nearby = search_nearby_pois(
        latitude,
        longitude,
        radius_meters=ANCHOR_POI_RADIUS_METERS,
        max_result_count=ANCHOR_POI_MAX_RESULTS,
        language_code="en",
    )

    merged_candidates: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    for place in [*(place_context.get("pois") or []), *(broader_nearby.get("places") or [])]:
        place_id = place.get("id")
        if place_id and place_id in seen_ids:
            continue
        if place_id:
            seen_ids.add(place_id)
        merged_candidates.append(place)

    best_candidate: dict[str, Any] | None = None
    best_score = -999
    for candidate in merged_candidates:
        score = _anchor_candidate_score(candidate)
        if score > best_score:
            best_score = score
            best_candidate = candidate

    if best_candidate is None:
        return place_context.get("top_poi") or {}

    anchor_name = _extract_anchor_name(best_candidate.get("name")) or best_candidate.get("name")
    return {
        **best_candidate,
        "name": anchor_name,
    }


def _place_matches_keywords(place: dict[str, Any], keywords: tuple[str, ...]) -> bool:
    normalized_types = _normalize_place_types(place)
    return any(keyword in place_type for place_type in normalized_types for keyword in keywords)


def _select_display_poi(observation: JournalObservation, place_context: dict[str, Any]) -> dict[str, Any]:
    pois = place_context.get("pois") or []
    top_poi = place_context.get("top_poi") or {}

    destination_candidate = next(
        (poi for poi in pois if _place_matches_keywords(poi, DESTINATION_POI_KEYWORDS)),
        None,
    )

    if observation.scene_label == "food_photo":
        if top_poi and _place_matches_keywords(top_poi, FOOD_POI_KEYWORDS):
            return top_poi
        if destination_candidate is not None:
            return destination_candidate
        return top_poi

    if destination_candidate is not None:
        return destination_candidate

    return top_poi


# EXIF 시간이 문자열로 들어오므로 Journal contracts에 맞는 datetime으로 변환한다.
def _parse_captured_at(value: str | None) -> datetime | None:
    if not value:
        return None

    normalized = value.strip()
    for fmt in ("%Y:%m:%d %H:%M:%S", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(normalized, fmt)
        except ValueError:
            continue

    try:
        return datetime.fromisoformat(normalized)
    except ValueError:
        return None


# 업로드 파일 여러 장을 JournalImageInput 목록으로 바꾼다.
async def _build_journal_inputs(files: list[UploadFile]) -> tuple[list[JournalImageInput], list[Path]]:
    journal_inputs: list[JournalImageInput] = []
    temp_paths: list[Path] = []

    for index, file in enumerate(files, start=1):
        suffix = Path(file.filename or "upload.bin").suffix
        with NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = Path(temp_file.name)

        temp_paths.append(temp_path)
        metadata = extract_image_metadata(temp_path)
        gps = metadata.get("gps")

        journal_inputs.append(
            JournalImageInput(
                image_id=index,
                file_name=file.filename or metadata.get("file_name"),
                absolute_path=str(temp_path.resolve()),
                captured_at=_parse_captured_at(metadata.get("captured_at")),
                latitude=gps.get("latitude") if gps else None,
                longitude=gps.get("longitude") if gps else None,
                has_exif_datetime=bool(metadata.get("captured_at")),
                has_exif_gps=bool(gps),
                metadata=metadata,
            )
        )

    return journal_inputs, temp_paths


# observation 중심 좌표 기준으로 city/country/POI를 붙인다.
def _enrich_observation_with_place_context(observation: JournalObservation) -> JournalObservation:
    try:
        place_context = enrich_coordinates_with_place_context(
            observation.center_latitude,
            observation.center_longitude,
            language_code="en",
        )
    except Exception as exc:
        reasons = [part for part in [observation.classification_reason, f"Place enrichment skipped: {exc}"] if part]
        observation.classification_reason = " ".join(reasons)
        return observation

    nearest_poi = place_context.get("top_poi") or {}
    selected_poi = _select_display_poi(observation, place_context)
    anchor_poi = _select_anchor_poi(
        place_context,
        latitude=observation.center_latitude,
        longitude=observation.center_longitude,
    )
    observation.country_snapshot = place_context.get("country")
    observation.city_snapshot = place_context.get("city")
    observation.formatted_address = place_context.get("formatted_address")
    observation.english_location_hint = _address_first_token(observation.formatted_address)
    observation.poi_place_id = anchor_poi.get("id")
    observation.poi_name = anchor_poi.get("name") or selected_poi.get("name")
    observation.poi_primary_type = anchor_poi.get("primary_type") or selected_poi.get("primary_type")
    observation.poi_distance_meters = None
    observation.nearest_poi_name = nearest_poi.get("name")
    observation.nearest_poi_primary_type = nearest_poi.get("primary_type")
    observation.nearest_poi_formatted_address = nearest_poi.get("formatted_address")
    return observation


# 프론트에는 임시 파일 경로 대신, timeline 구조와 식별 정보만 돌려준다.
def _serialize_datetime(value: Any) -> Any:
    return value.isoformat() if isinstance(value, datetime) else value


def _build_preview_response(timeline) -> dict[str, Any]:
    payload = timeline.to_dict()

    eligible_images = [
        {
            **{key: _serialize_datetime(value) for key, value in image.items()},
            "absolute_path": None,
        }
        for image in payload["eligible_images"]
    ]

    observations = []
    for observation in payload["observations"]:
        normalized = {key: _serialize_datetime(value) for key, value in observation.items()}
        normalized["representative_image_path"] = None
        observations.append(normalized)

    segments = [
        {key: _serialize_datetime(value) for key, value in segment.items()}
        for segment in payload["segments"]
    ]

    return {
        "eligible_images": eligible_images,
        "rejected_images": payload["rejected_images"],
        "observations": observations,
        "segments": segments,
        "counts": {
            "eligible_images": len(eligible_images),
            "rejected_images": len(payload["rejected_images"]),
            "observations": len(observations),
            "segments": len(segments),
        },
    }


@router.post("/journal/preview")
async def preview_journal(files: list[UploadFile] = File(...)):
    if len(files) < 2 or len(files) > 20:
        raise HTTPException(status_code=400, detail="Journal preview requires between 2 and 20 images.")

    journal_inputs, temp_paths = await _build_journal_inputs(files)

    try:
        timeline = build_journal_timeline(
            journal_inputs,
            observation_enrichers=[_enrich_observation_with_place_context],
            run_clip_classification=True,
            run_ocr_enrichment=False,
        )
        return _build_preview_response(timeline)
    finally:
        for temp_path in temp_paths:
            temp_path.unlink(missing_ok=True)
