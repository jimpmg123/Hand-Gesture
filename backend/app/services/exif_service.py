from __future__ import annotations

import io
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from typing import Any

import exifread
from PIL import Image


def _fraction_to_float(value: Any) -> float:
    if hasattr(value, "num") and hasattr(value, "den"):
        return float(value.num) / float(value.den)

    if isinstance(value, (int, float)):
        return float(value)

    return float(str(value))


def _dms_to_decimal(values: list[Any], reference: str) -> float | None:
    if len(values) != 3:
        return None

    degrees = _fraction_to_float(values[0])
    minutes = _fraction_to_float(values[1])
    seconds = _fraction_to_float(values[2])

    decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)

    if reference in {"S", "W"}:
        decimal *= -1

    return decimal


def _extract_gps(tags: dict[str, Any]) -> dict[str, float] | None:
    latitude_values = tags.get("GPS GPSLatitude")
    latitude_ref = tags.get("GPS GPSLatitudeRef")
    longitude_values = tags.get("GPS GPSLongitude")
    longitude_ref = tags.get("GPS GPSLongitudeRef")

    if not all([latitude_values, latitude_ref, longitude_values, longitude_ref]):
        return None

    latitude = _dms_to_decimal(list(latitude_values.values), str(latitude_ref.values))
    longitude = _dms_to_decimal(list(longitude_values.values), str(longitude_ref.values))

    if latitude is None or longitude is None:
        return None

    return {
        "latitude": round(latitude, 6),
        "longitude": round(longitude, 6),
    }


def _pick_datetime(tags: dict[str, Any]) -> str | None:
    for key in (
        "EXIF DateTimeOriginal",
        "EXIF DateTimeDigitized",
        "Image DateTime",
    ):
        value = tags.get(key)
        if value:
            return str(value)

    return None


def _pick_camera(tags: dict[str, Any]) -> dict[str, str | None]:
    return {
        "make": str(tags.get("Image Make")) if tags.get("Image Make") else None,
        "model": str(tags.get("Image Model")) if tags.get("Image Model") else None,
        "lens_model": str(tags.get("EXIF LensModel")) if tags.get("EXIF LensModel") else None,
    }


def _build_exif_summary(tags: dict[str, Any]) -> dict[str, str]:
    summary_keys = (
        "Image Make",
        "Image Model",
        "EXIF DateTimeOriginal",
        "EXIF LensModel",
        "EXIF ISOSpeedRatings",
        "EXIF FNumber",
        "EXIF ExposureTime",
        "GPS GPSLatitudeRef",
        "GPS GPSLatitude",
        "GPS GPSLongitudeRef",
        "GPS GPSLongitude",
    )

    summary: dict[str, str] = {}
    for key in summary_keys:
        value = tags.get(key)
        if value:
            summary[key] = str(value)

    return summary


def extract_image_metadata(image_path: str | Path) -> dict[str, Any]:
    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(f"Image file was not found: {path}")

    if not path.is_file():
        raise ValueError(f"Expected a file path, got: {path}")

    with path.open("rb") as image_stream:
        with (
            io.StringIO() as suppressed_stdout,
            io.StringIO() as suppressed_stderr,
            redirect_stdout(suppressed_stdout),
            redirect_stderr(suppressed_stderr),
        ):
            tags = exifread.process_file(image_stream, details=False)

    with Image.open(path) as image:
        width, height = image.size
        image_format = image.format
        color_mode = image.mode

    metadata = {
        "file_name": path.name,
        "absolute_path": str(path.resolve()),
        "file_size_bytes": path.stat().st_size,
        "image": {
            "format": image_format,
            "mode": color_mode,
            "width": width,
            "height": height,
        },
        "captured_at": _pick_datetime(tags),
        "camera": _pick_camera(tags),
        "gps": _extract_gps(tags),
        "exif_summary": _build_exif_summary(tags),
    }

    return metadata
