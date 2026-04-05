from typing import Literal

from pydantic import BaseModel, ConfigDict


class ImageInfoResponse(BaseModel):
    format: str | None = None
    mode: str | None = None
    width: int | None = None
    height: int | None = None


class CameraInfoResponse(BaseModel):
    make: str | None = None
    model: str | None = None
    lens_model: str | None = None


class GPSInfoResponse(BaseModel):
    latitude: float
    longitude: float


class ImageMetadataResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    file_name: str
    absolute_path: str | None = None
    file_size_bytes: int
    image: ImageInfoResponse
    captured_at: str | None = None
    camera: CameraInfoResponse
    gps: GPSInfoResponse | None = None
    has_gps: bool
    metadata_case: Literal["gps_present", "gps_missing"]
    exif_summary: dict[str, str]
    database_id: int | None = None
