from typing import Any

from sqlalchemy.orm import Session

from app.models.image_metadata import ImageMetadata


def _metadata_case_from_payload(metadata: dict[str, Any]) -> str:
    if metadata.get("metadata_case"):
        return str(metadata["metadata_case"])

    return "gps_present" if metadata.get("gps") else "gps_missing"


def create_image_metadata(db: Session, metadata: dict[str, Any]) -> ImageMetadata:
    image_info = metadata.get("image") or {}
    camera_info = metadata.get("camera") or {}
    gps_info = metadata.get("gps") or {}

    row = ImageMetadata(
        file_name=metadata["file_name"],
        absolute_path=metadata.get("absolute_path"),
        file_size_bytes=metadata["file_size_bytes"],
        image_format=image_info.get("format"),
        image_mode=image_info.get("mode"),
        width=image_info.get("width"),
        height=image_info.get("height"),
        captured_at=metadata.get("captured_at"),
        camera_make=camera_info.get("make"),
        camera_model=camera_info.get("model"),
        lens_model=camera_info.get("lens_model"),
        latitude=gps_info.get("latitude"),
        longitude=gps_info.get("longitude"),
        has_gps=bool(metadata.get("gps")),
        metadata_case=_metadata_case_from_payload(metadata),
        raw_metadata=metadata,
    )

    db.add(row)
    db.commit()
    db.refresh(row)
    return row
