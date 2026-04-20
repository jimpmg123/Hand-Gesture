from __future__ import annotations

from collections.abc import Iterable

from app.services.journal.contracts import JournalObservation
from app.services.journal.geo_utils import haversine_distance_meters

SAME_PLACE_RADIUS_METERS = 120.0
MIN_STAY_REVISIT_GAP_SECONDS = 120.0
TRANSIT_PATH_FACTOR = 1.25
CLASSIFICATION_MARGIN = 0.20

DESTINATION_POI_TYPES = {
    "cafe",
    "food",
    "historic_site",
    "lodging",
    "market",
    "museum",
    "park",
    "restaurant",
    "shrine",
    "temple",
    "tourist_attraction",
}

TRANSIT_POI_TYPES = {
    "airport",
    "bus_station",
    "subway_station",
    "train_station",
    "transit_station",
}

STAY_DOCUMENT_TYPES = {
    "lodging_confirmation",
    "museum_ticket",
    "receipt",
}

TRANSIT_DOCUMENT_TYPES = {
    "transport_ticket",
}


# observation 두 개 사이의 거리 계산용 내부 헬퍼다.
def _distance_between(a: JournalObservation, b: JournalObservation) -> float:
    return haversine_distance_meters(
        a.center_latitude,
        a.center_longitude,
        b.center_latitude,
        b.center_longitude,
    )


# 두 observation이 사실상 같은 장소인지 빠르게 판단한다.
def _same_place_signal(a: JournalObservation, b: JournalObservation) -> tuple[bool, float]:
    distance = _distance_between(a, b)
    is_same_place = distance <= SAME_PLACE_RADIUS_METERS
    return is_same_place, distance


# POI type, scene label 같은 문자열을 규칙 계산 전에 정규화한다.
def _normalize_type(value: str | None) -> str | None:
    if value is None:
        return None
    return value.strip().lower().replace(" ", "_")


# POI, scene, document 신호를 stay / transit 점수로 바꿔준다.
def _score_labels(
    observation: JournalObservation,
    *,
    stay_score: float,
    transit_score: float,
    reasons: list[str],
) -> tuple[float, float]:
    poi_type = _normalize_type(observation.poi_primary_type)
    scene_label = _normalize_type(observation.scene_label)
    document_type = _normalize_type(observation.document_type)

    if poi_type in DESTINATION_POI_TYPES:
        stay_score += 0.45
        reasons.append("Nearby POI looks destination-like.")
    elif poi_type in TRANSIT_POI_TYPES:
        transit_score += 0.55
        reasons.append("Nearby POI looks transit-related.")

    if scene_label == "destination_scene":
        stay_score += 0.35
        reasons.append("Image context looks like a destination scene.")
    elif scene_label == "transport_related_scene":
        transit_score += 0.45
        reasons.append("Image context looks transport-related.")
    elif scene_label == "food_photo":
        stay_score += 0.40
        reasons.append("Food photos usually belong to a stay segment.")
    elif scene_label == "document_like":
        transit_score += 0.05
        reasons.append("Document-like observation needs extra caution.")

    if document_type in STAY_DOCUMENT_TYPES:
        stay_score += 0.45
        reasons.append("Document type supports a stay segment.")
    elif document_type in TRANSIT_DOCUMENT_TYPES:
        transit_score += 0.55
        reasons.append("Document type supports a transit segment.")

    return stay_score, transit_score


# observation 하나를 stay / transit / uncertain으로 분류한다.
def classify_observation(
    observation: JournalObservation,
    *,
    previous_observation: JournalObservation | None = None,
    next_observation: JournalObservation | None = None,
) -> JournalObservation:
    stay_score = 0.0
    transit_score = 0.0
    reasons: list[str] = []

    if observation.image_count > 1:
        stay_score += 0.10
        reasons.append("Burst observation adds a small stay bias.")

    if observation.duration_seconds() >= 600:
        stay_score += 0.35
        reasons.append("Long observation duration suggests a stay.")

    previous_same_place = False
    next_same_place = False

    if previous_observation is not None:
        previous_same_place, previous_distance = _same_place_signal(previous_observation, observation)
        time_gap = (observation.start_time - previous_observation.end_time).total_seconds()
        if previous_same_place and time_gap >= MIN_STAY_REVISIT_GAP_SECONDS:
            stay_score += 0.35
            reasons.append("Previous nearby observation after a time gap suggests a stay.")
        elif not previous_same_place and time_gap <= 900:
            transit_score += 0.10
            reasons.append("Recent movement from a different place adds transit bias.")

    if next_observation is not None:
        next_same_place, next_distance = _same_place_signal(observation, next_observation)
        time_gap = (next_observation.start_time - observation.end_time).total_seconds()
        if next_same_place and time_gap >= MIN_STAY_REVISIT_GAP_SECONDS:
            stay_score += 0.35
            reasons.append("Next nearby observation after a time gap suggests a stay.")
        elif not next_same_place and time_gap <= 900:
            transit_score += 0.10
            reasons.append("Upcoming movement to a different place adds transit bias.")

    if previous_same_place and next_same_place:
        stay_score += 0.20
        reasons.append("Nearby observations on both sides strongly suggest a stay.")

    if previous_observation is not None and next_observation is not None:
        prev_to_current = _distance_between(previous_observation, observation)
        current_to_next = _distance_between(observation, next_observation)
        prev_to_next = _distance_between(previous_observation, next_observation)
        if (
            not previous_same_place
            and not next_same_place
            and prev_to_next > SAME_PLACE_RADIUS_METERS
            and prev_to_current + current_to_next <= prev_to_next * TRANSIT_PATH_FACTOR
        ):
            transit_score += 0.35
            reasons.append("Observation lies on the path between two different places.")

    stay_score, transit_score = _score_labels(
        observation,
        stay_score=stay_score,
        transit_score=transit_score,
        reasons=reasons,
    )

    if stay_score - transit_score >= CLASSIFICATION_MARGIN:
        segment_type = "stay"
    elif transit_score - stay_score >= CLASSIFICATION_MARGIN:
        segment_type = "transit"
    else:
        segment_type = "uncertain"
        reasons.append("Stay and transit signals are too close.")

    observation.stay_score = round(stay_score, 3)
    observation.transit_score = round(transit_score, 3)
    observation.suggested_segment_type = segment_type
    observation.classification_reason = " ".join(reasons) if reasons else "No strong signal was found."
    return observation


# observation 전체 시퀀스를 순서대로 돌면서 앞뒤 맥락까지 반영해 분류한다.
def classify_observations(observations: Iterable[JournalObservation]) -> list[JournalObservation]:
    ordered_observations = sorted(observations, key=lambda item: item.observation_order)
    classified: list[JournalObservation] = []

    for index, observation in enumerate(ordered_observations):
        previous_observation = ordered_observations[index - 1] if index > 0 else None
        next_observation = ordered_observations[index + 1] if index + 1 < len(ordered_observations) else None
        classified.append(
            classify_observation(
                observation,
                previous_observation=previous_observation,
                next_observation=next_observation,
            )
        )

    return classified
