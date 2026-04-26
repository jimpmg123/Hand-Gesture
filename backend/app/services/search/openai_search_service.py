from __future__ import annotations

from pathlib import Path

from app.services.search.contracts import SearchHintContext, SearchLocationResolution
from app.services.search.hint_validation_service import (
    build_country_mismatch_reason,
    country_matches_hint,
)
from app.services.shared.geocoding_service import geocode_address
from app.services.shared.openai_location_service import analyze_image_location_with_openai
from app.services.shared.ocr_service import extract_text_with_cloud_vision

# Search OpenAI fallback flow:
# image -> optional OCR extraction -> OpenAI location inference
# -> geocode returned place/address text -> validate against hints
# -> normalize into SearchLocationResolution for the search pipeline


def _build_geocode_query(
    *,
    place_name: str | None,
    formatted_address: str | None,
) -> str | None:
    parts: list[str] = []
    for value in (
        place_name,
        formatted_address,
    ):
        cleaned = (value or "").strip()
        if cleaned and cleaned not in parts:
            parts.append(cleaned)

    if not parts:
        return None

    return ", ".join(parts)


def resolve_location_with_openai(
    image_path: str | Path,
    *,
    hints: SearchHintContext,
    user_hint: str | None = None,
) -> tuple[SearchLocationResolution | None, dict | None]:
    ocr_text: str | None = None
    try:
        ocr_result = extract_text_with_cloud_vision(image_path, include_raw_response=False)
        ocr_text = ocr_result.get("extracted_text") or None
    except Exception:
        ocr_text = None

    result = analyze_image_location_with_openai(
        image_path,
        country_hint=hints.normalized_country(),
        city_hint=hints.normalized_city(),
        user_hint=user_hint or hints.normalized_user_hint(),
        ocr_text=ocr_text,
    )
    geocode_query = _build_geocode_query(
        place_name=result.get("place_name"),
        formatted_address=result.get("formatted_address"),
    )

    if not geocode_query:
        return None, result

    geocoded = geocode_address(geocode_query, language_code="en")

    if not country_matches_hint(geocoded.get("country"), hints):
        return (
            SearchLocationResolution(
                status="failed",
                source="openai_location",
                latitude=None,
                longitude=None,
                formatted_address=None,
                country=geocoded.get("country"),
                city=geocoded.get("city"),
                region=geocoded.get("region"),
                place_name=result.get("place_name"),
                failure_reason=build_country_mismatch_reason(geocoded.get("country"), hints),
                metadata={
                    "openai_result": result,
                    "geocode_query": geocode_query,
                    "user_hint_used": user_hint or hints.normalized_user_hint(),
                    "ocr_text_used": bool(ocr_text and ocr_text.strip()),
                    "exact_place_name_returned": bool(result.get("place_name")),
                },
            ),
            result,
        )

    return (
        SearchLocationResolution(
            status="resolved",
            source="openai_location",
            latitude=geocoded.get("latitude"),
            longitude=geocoded.get("longitude"),
            formatted_address=geocoded.get("formatted_address"),
            country=geocoded.get("country"),
            city=geocoded.get("city"),
            region=geocoded.get("region"),
            place_name=result.get("place_name"),
            metadata={
                "openai_result": result,
                "geocode_query": geocode_query,
                "user_hint_used": user_hint or hints.normalized_user_hint(),
                "ocr_text_used": bool(ocr_text and ocr_text.strip()),
                "exact_place_name_returned": bool(result.get("place_name")),
            },
        ),
        result,
    )
