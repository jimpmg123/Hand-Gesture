from __future__ import annotations

from pathlib import Path

from app.services.search.contracts import SearchHintContext, SearchLocationResolution
from app.services.search.hint_validation_service import (
    build_country_mismatch_reason,
    country_matches_hint,
)
from app.services.shared.geocoding_service import reverse_geocode_coordinates
from app.services.shared.landmark_detection_service import analyze_landmark_detection


def resolve_location_from_landmark(
    image_path: str | Path,
    *,
    hints: SearchHintContext,
) -> tuple[SearchLocationResolution | None, dict | None]:
    result = analyze_landmark_detection(image_path)
    top_landmark = result.get("top_landmark")

    if not top_landmark:
        return None, None

    locations = top_landmark.get("locations") or []
    first_location = next(
        (
            location
            for location in locations
            if location.get("latitude") is not None and location.get("longitude") is not None
        ),
        None,
    )
    if not first_location:
        return None, top_landmark

    latitude = first_location["latitude"]
    longitude = first_location["longitude"]
    geocoded = reverse_geocode_coordinates(latitude, longitude, language_code="en")

    if not country_matches_hint(geocoded.get("country"), hints):
        return (
            SearchLocationResolution(
                status="failed",
                source="landmark_detection",
                latitude=None,
                longitude=None,
                formatted_address=None,
                country=geocoded.get("country"),
                city=geocoded.get("city"),
                region=geocoded.get("region"),
                place_name=top_landmark.get("description"),
                failure_reason=build_country_mismatch_reason(geocoded.get("country"), hints),
                metadata={"top_landmark": top_landmark},
            ),
            top_landmark,
        )

    return (
        SearchLocationResolution(
            status="resolved",
            source="landmark_detection",
            latitude=latitude,
            longitude=longitude,
            formatted_address=geocoded.get("formatted_address"),
            country=geocoded.get("country"),
            city=geocoded.get("city"),
            region=geocoded.get("region"),
            place_name=top_landmark.get("description"),
            metadata={"top_landmark": top_landmark},
        ),
        top_landmark,
    )
