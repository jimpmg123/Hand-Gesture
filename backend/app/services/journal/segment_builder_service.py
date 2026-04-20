from __future__ import annotations

from collections.abc import Iterable

from app.services.journal.contracts import JournalObservation, JournalSegment
from app.services.journal.geo_utils import haversine_distance_meters

STAY_MERGE_DISTANCE_METERS = 150.0
STAY_MERGE_GAP_SECONDS = 7_200
TRANSIT_MERGE_GAP_SECONDS = 5_400


# segment 병합 조건에서 observation 간 거리를 계산한다.
def _distance_between(a: JournalObservation, b: JournalObservation) -> float:
    return haversine_distance_meters(
        a.center_latitude,
        a.center_longitude,
        b.center_latitude,
        b.center_longitude,
    )


# 연속된 두 stay observation이 같은 segment가 될 수 있는지 판단한다.
def _can_merge_stay(current: JournalObservation, candidate: JournalObservation) -> bool:
    if candidate.suggested_segment_type != "stay":
        return False

    distance = _distance_between(current, candidate)
    gap_seconds = (candidate.start_time - current.end_time).total_seconds()
    same_city = (
        current.city_snapshot is None
        or candidate.city_snapshot is None
        or current.city_snapshot == candidate.city_snapshot
    )

    return (
        distance <= STAY_MERGE_DISTANCE_METERS
        and gap_seconds <= STAY_MERGE_GAP_SECONDS
        and same_city
    )


# 연속된 transit observation을 하나의 이동 구간으로 묶을지 판단한다.
def _can_merge_transit(current: JournalObservation, candidate: JournalObservation) -> bool:
    if candidate.suggested_segment_type != "transit":
        return False

    gap_seconds = (candidate.start_time - current.end_time).total_seconds()
    return gap_seconds <= TRANSIT_MERGE_GAP_SECONDS


# segment 표시용 이름은 poi가 있으면 poi 이름을 우선 사용한다.
def _segment_location_name(observations: list[JournalObservation]) -> str | None:
    for observation in observations:
        if observation.poi_name:
            return observation.poi_name

    for observation in observations:
        if observation.city_snapshot:
            return observation.city_snapshot

    return None


# observation 묶음을 최종 segment 객체 하나로 변환한다.
def _build_segment(
    observations: list[JournalObservation],
    *,
    segment_order: int,
) -> JournalSegment:
    segment_type = observations[0].suggested_segment_type or "uncertain"
    start_time = observations[0].start_time
    end_time = observations[-1].end_time
    duration_minutes = round(max((end_time - start_time).total_seconds(), 0.0) / 60.0)
    image_ids: list[int] = []

    for observation in observations:
        image_ids.extend(observation.image_ids)

    location_name = _segment_location_name(observations)
    country = next((item.country_snapshot for item in observations if item.country_snapshot), None)
    city = next((item.city_snapshot for item in observations if item.city_snapshot), None)

    return JournalSegment(
        segment_id=f"seg-{segment_order}",
        segment_order=segment_order,
        segment_type=segment_type,
        observation_ids=[observation.observation_id for observation in observations],
        image_ids=image_ids,
        location_name=location_name,
        country=country,
        city=city,
        start_time=start_time,
        end_time=end_time,
        duration_minutes=duration_minutes,
    )


# 분류된 observation들을 실제 journal segment로 병합한다.
def build_segments(observations: Iterable[JournalObservation]) -> list[JournalSegment]:
    ordered_observations = sorted(observations, key=lambda item: item.observation_order)
    if not ordered_observations:
        return []

    grouped_observations: list[list[JournalObservation]] = [[ordered_observations[0]]]

    for observation in ordered_observations[1:]:
        current_group = grouped_observations[-1]
        previous_observation = current_group[-1]
        previous_type = previous_observation.suggested_segment_type or "uncertain"
        current_type = observation.suggested_segment_type or "uncertain"

        should_merge = False
        if previous_type == current_type == "stay":
            should_merge = _can_merge_stay(previous_observation, observation)
        elif previous_type == current_type == "transit":
            should_merge = _can_merge_transit(previous_observation, observation)

        if should_merge:
            current_group.append(observation)
        else:
            grouped_observations.append([observation])

    return [
        _build_segment(group, segment_order=index)
        for index, group in enumerate(grouped_observations, start=1)
    ]
