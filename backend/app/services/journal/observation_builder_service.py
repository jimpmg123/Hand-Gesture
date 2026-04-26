from __future__ import annotations

from datetime import timedelta

from app.services.journal.contracts import JournalImageInput, JournalObservation
from app.services.journal.geo_utils import haversine_distance_meters

DEFAULT_BURST_WINDOW_SECONDS = 10
DEFAULT_BURST_DISTANCE_METERS = 30.0


# Internal helper for simple average calculations.
def _mean(values: list[float]) -> float:
    return sum(values) / len(values)


# Compute the center coordinates of the current observation group.
def _observation_center(images: list[JournalImageInput]) -> tuple[float, float]:
    latitudes = [image.latitude for image in images if image.latitude is not None]
    longitudes = [image.longitude for image in images if image.longitude is not None]
    return _mean(latitudes), _mean(longitudes)


# Treat one image as a single observation and multiple images as a burst observation.
def _observation_kind(image_count: int) -> str:
    return "burst" if image_count > 1 else "single"


# Decide whether a new image can be merged into the current observation.
# Use a 10-second rule anchored on the first image, not a pairwise chain.
def _can_join_observation(
    observation_images: list[JournalImageInput],
    candidate: JournalImageInput,
    *,
    burst_window_seconds: int,
    burst_distance_meters: float,
) -> bool:
    first_image = observation_images[0]
    if candidate.captured_at is None or first_image.captured_at is None:
        return False

    if candidate.captured_at - first_image.captured_at > timedelta(seconds=burst_window_seconds):
        return False

    center_latitude, center_longitude = _observation_center(observation_images)
    return (
        haversine_distance_meters(
            center_latitude,
            center_longitude,
            candidate.latitude,
            candidate.longitude,
        )
        <= burst_distance_meters
    )


# Group eligible images into observations in chronological order.
def build_observations(
    images: list[JournalImageInput],
    *,
    burst_window_seconds: int = DEFAULT_BURST_WINDOW_SECONDS,
    burst_distance_meters: float = DEFAULT_BURST_DISTANCE_METERS,
) -> list[JournalObservation]:
    if not images:
        return []

    ordered_images = sorted(images, key=lambda item: item.captured_at)
    observation_groups: list[list[JournalImageInput]] = []

    for image in ordered_images:
        if not observation_groups:
            observation_groups.append([image])
            continue

        current_group = observation_groups[-1]
        if _can_join_observation(
            current_group,
            image,
            burst_window_seconds=burst_window_seconds,
            burst_distance_meters=burst_distance_meters,
        ):
            current_group.append(image)
        else:
            observation_groups.append([image])

    observations: list[JournalObservation] = []
    for order, group in enumerate(observation_groups, start=1):
        center_latitude, center_longitude = _observation_center(group)
        representative = group[0]

        observations.append(
            JournalObservation(
                observation_id=f"obs-{order}",
                observation_order=order,
                image_ids=[image.image_id for image in group],
                representative_image_id=representative.image_id,
                representative_image_path=representative.absolute_path,
                observation_kind=_observation_kind(len(group)),
                start_time=group[0].captured_at,
                end_time=group[-1].captured_at,
                center_latitude=round(center_latitude, 6),
                center_longitude=round(center_longitude, 6),
                image_count=len(group),
                country_snapshot=representative.country,
                city_snapshot=representative.city,
            )
        )

    return observations
