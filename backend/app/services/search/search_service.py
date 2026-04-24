from __future__ import annotations

from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.services.search.clip_search_service import analyze_search_clip
from app.services.search.contracts import SearchHintContext, SearchImageAnalysis, SearchLocationResolution
from app.services.search.hint_validation_service import country_matches_hint
from app.services.search.image_ingestion_service import extract_image_metadata_payload
from app.services.search.landmark_search_service import resolve_location_from_landmark
from app.services.search.openai_search_service import resolve_location_with_openai
from app.services.shared.geocoding_service import reverse_geocode_coordinates


def _build_failed_resolution(reason: str, *, source: str | None = None) -> SearchLocationResolution:
    return SearchLocationResolution(
        status="failed",
        source=source,
        latitude=None,
        longitude=None,
        formatted_address=None,
        country=None,
        city=None,
        region=None,
        failure_reason=reason,
    )


def _build_analysis_from_metadata(
    metadata: dict,
    *,
    hints: SearchHintContext,
) -> SearchImageAnalysis:
    return SearchImageAnalysis(
        file_name=metadata["file_name"],
        absolute_path=metadata.get("absolute_path"),
        file_size_bytes=metadata["file_size_bytes"],
        image=metadata.get("image") or {},
        captured_at=metadata.get("captured_at"),
        camera=metadata.get("camera") or {},
        gps=metadata.get("gps"),
        has_gps=bool(metadata.get("gps")),
        metadata_case=str(metadata.get("metadata_case") or ("gps_present" if metadata.get("gps") else "gps_missing")),
        exif_summary=metadata.get("exif_summary") or {},
        hint_context={
            "country_hint": hints.normalized_country(),
            "city_hint": hints.normalized_city(),
        },
    )


def _resolve_from_exif_gps(
    gps: dict,
    *,
    hints: SearchHintContext,
) -> SearchLocationResolution:
    latitude = gps.get("latitude")
    longitude = gps.get("longitude")
    if latitude is None or longitude is None:
        return _build_failed_resolution("EXIF GPS payload is incomplete.", source="exif_gps")

    try:
        geocoded = reverse_geocode_coordinates(latitude, longitude, language_code="en")
    except Exception as exc:
        return SearchLocationResolution(
            status="resolved",
            source="exif_gps",
            latitude=latitude,
            longitude=longitude,
            formatted_address=None,
            country=None,
            city=None,
            region=None,
            failure_reason=f"Reverse geocoding skipped: {exc}",
        )

    metadata = {"hint_country_match": country_matches_hint(geocoded.get("country"), hints)}
    return SearchLocationResolution(
        status="resolved",
        source="exif_gps",
        latitude=latitude,
        longitude=longitude,
        formatted_address=geocoded.get("formatted_address"),
        country=geocoded.get("country"),
        city=geocoded.get("city"),
        region=geocoded.get("region"),
        metadata=metadata,
    )


async def analyze_uploaded_search_image(
    file: UploadFile,
    *,
    country_hint: str | None = None,
    city_hint: str | None = None,
    db: Session | None = None,
) -> SearchImageAnalysis:
    suffix = Path(file.filename or "upload.bin").suffix
    hints = SearchHintContext(country_hint=country_hint, city_hint=city_hint)
    temp_path: Path | None = None

    try:
        with NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = Path(temp_file.name)

        metadata = extract_image_metadata_payload(temp_path, include_path=False, db=db)
        metadata["file_name"] = file.filename or metadata["file_name"]
        analysis = _build_analysis_from_metadata(metadata, hints=hints)

        try:
            clip_result = analyze_search_clip(temp_path)
            analysis.summary = clip_result.get("summary")
            analysis.clip_gate = clip_result.get("gate")
            analysis.clip_scene_hints = clip_result.get("scene_hints") or []
        except Exception as exc:
            analysis.summary = f"CLIP analysis failed: {exc}"

        if analysis.has_gps and analysis.gps:
            resolution = _resolve_from_exif_gps(analysis.gps, hints=hints)
            analysis.apply_resolution(resolution)
            return analysis

        if analysis.clip_gate and not analysis.clip_gate.get("is_location_candidate"):
            analysis.apply_resolution(
                _build_failed_resolution(
                    analysis.clip_gate.get("reason")
                    or "CLIP gate rejected the image for location inference.",
                    source="clip_gate",
                )
            )
            analysis.city = "Unknown Location"
            return analysis

        try:
            landmark_resolution, top_landmark = resolve_location_from_landmark(temp_path, hints=hints)
            analysis.landmark_candidate = top_landmark
            if landmark_resolution and landmark_resolution.status == "resolved":
                analysis.apply_resolution(landmark_resolution)
                return analysis
            if landmark_resolution and landmark_resolution.failure_reason:
                analysis.failure_reason = landmark_resolution.failure_reason
        except Exception as exc:
            analysis.failure_reason = f"Landmark detection failed: {exc}"

        try:
            openai_resolution, openai_candidate = resolve_location_with_openai(temp_path, hints=hints)
            analysis.openai_candidate = openai_candidate
            if openai_resolution and openai_resolution.status == "resolved":
                analysis.apply_resolution(openai_resolution)
                return analysis
            if openai_resolution and openai_resolution.failure_reason:
                analysis.failure_reason = openai_resolution.failure_reason
        except Exception as exc:
            analysis.failure_reason = f"OpenAI location inference failed: {exc}"

        analysis.apply_resolution(
            _build_failed_resolution(
                analysis.failure_reason
                or "No location candidate could be resolved from EXIF, landmark detection, or OpenAI.",
                source="search_pipeline",
            )
        )
        analysis.city = "Unknown Location"
        return analysis
    finally:
        if temp_path and temp_path.exists():
            temp_path.unlink(missing_ok=True)
