from __future__ import annotations

from pathlib import Path

from app.services.search.contracts import SearchHintContext, SearchLocationResolution
from app.services.search.hint_validation_service import (
    build_country_mismatch_reason,
    country_matches_hint,
)
from app.services.shared.geocoding_service import geocode_address
from app.services.shared.openai_location_service import analyze_image_location_with_openai


def _build_geocode_query(
    *,
    place_name: str | None,
    formatted_address: str | None,
    hints: SearchHintContext,
) -> str | None:
    parts: list[str] = []
    for value in (
        place_name,
        formatted_address,
        hints.normalized_city(),
        hints.normalized_country(),
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
) -> tuple[SearchLocationResolution | None, dict | None]:
    result = analyze_image_location_with_openai(image_path)
    geocode_query = _build_geocode_query(
        place_name=result.get("place_name"),
        formatted_address=result.get("formatted_address"),
        hints=hints,
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
                metadata={"openai_result": result, "geocode_query": geocode_query},
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
            metadata={"openai_result": result, "geocode_query": geocode_query},
        ),
        result,
    )
